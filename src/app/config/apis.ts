import Big from "big.js";
import { Api } from "../types";
import { neon } from "@neondatabase/serverless";
import { getAddress } from "viem";
import {
  POINTS_ID_ETHENA_SATS_S3,
  POINTS_ID_ETHENA_SATS_S4,
  POINTS_ID_KARAK_S2,
  POINTS_ID_SYMBIOTIC_S1,
  POINTS_ID_MELLOW_S1,
  POINTS_ID_MERITS_S1,
  POINTS_ID_ZIRCUIT_S3,
  POINTS_ID_ETHERFI_S4,
  POINTS_ID_ETHERFI_S5,
  POINTS_ID_VEDA_S1,
  POINTS_ID_LOMBARD_LUX_S1,
  POINTS_ID_RESOLV_S1,
  POINTS_ID_HYPERBEAT_S1,
  POINTS_ID_SENTIMENT_S1,
  MAINNET_AGETH,
  POINTS_ID_FELIX_S1,
  POINTS_ID_UPSHIFT_S2,
  POINTS_ID_KINETIQ_S1,
} from "./constants";

// Felix direct API helpers
let cachedFelixActionId: string | null = null;

async function discoverFelixActionId(): Promise<string> {
  if (process.env.FELIX_ACTION_ID) {
    return process.env.FELIX_ACTION_ID;
  }
  if (cachedFelixActionId) {
    return cachedFelixActionId;
  }

  try {
    const pointsPage = await fetch("https://www.usefelix.xyz/points", {
      cache: "no-store",
    });
    const html = await pointsPage.text();

    const scriptMatch = html.match(
      /\/_next\/static\/chunks\/app\/\(dashboard\)\/points\/page-[^"']+\.js/
    );
    if (!scriptMatch) {
      throw new Error("Unable to locate Felix points page chunk");
    }
    const chunkPath = scriptMatch[0];
    const chunkUrl = `https://www.usefelix.xyz${chunkPath}`;

    const chunkRes = await fetch(chunkUrl, { cache: "no-store" });
    const chunkJs = await chunkRes.text();

    const idMatch = chunkJs.match(
      /createServerReference\("([a-f0-9]+)"[\s\S]*?getPointsDataActionAdvanced\"\)/
    );
    if (!idMatch) {
      throw new Error("Unable to discover Felix Next-Action id");
    }
    cachedFelixActionId = idMatch[1];
    return cachedFelixActionId;
  } catch {
    cachedFelixActionId = "c0cd7cc71bafc069453ce74ea980982868fbb2375f";
    return cachedFelixActionId;
  }
}

async function fetchFelixPoints(wallet: string) {
  const actionId = await discoverFelixActionId();
  const url = "https://www.usefelix.xyz/points";
  const payload = JSON.stringify([wallet]);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      Accept: "text/x-component",
      "Next-Action": actionId,
    },
    body: payload,
    cache: "no-store",
  });

  const text = await response.text();
  return {
    text,
    status: response.status,
    contentType: response.headers.get("content-type"),
    actionId,
  };
}

function extractFelixTotalPointsFromObject(data: any): Big {
  if (!data) return Big(0);
  if (Array.isArray(data)) {
    const stats = data.find(
      (item: any) =>
        item &&
        typeof item === "object" &&
        Object.prototype.hasOwnProperty.call(item, "totalPoints")
    );
    const total = stats?.totalPoints ?? 0;
    return Big(total || 0);
  }
  if (typeof data === "object" && data !== null) {
    if (Object.prototype.hasOwnProperty.call(data, "totalPoints")) {
      return Big(data.totalPoints || 0);
    }
  }
  return Big(0);
}

function parseFelixTotalPoints(rawText: string): Big {
  if (!rawText) return Big(0);
  try {
    const obj = JSON.parse(rawText);
    return extractFelixTotalPointsFromObject(obj);
  } catch {}

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const objects = [];
  for (const line of lines) {
    const cleaned = line.replace(/^\d+:\s*/, "");
    try {
      const obj = JSON.parse(cleaned);
      objects.push(obj);
    } catch {}
  }

  return extractFelixTotalPointsFromObject(objects);
}

// -------------------------
// Hyperfolio shared helpers
// -------------------------
type HyperfolioItem = { protocolName: string; points: number };
type HyperfolioResponse = { data: HyperfolioItem[] };
export type HyperfolioMode = "db" | "live";

function fabricateHyperfolioLikeResult(
  protocolName: string,
  points: number
): HyperfolioResponse {
  return { data: [{ protocolName, points }] };
}

async function fetchHyperfolioLive(wallet: string): Promise<HyperfolioResponse> {
  const apiKey = process.env.HYPERFOLIO_API_KEY;
  if (!apiKey) {
    throw new Error("Missing HYPERFOLIO_API_KEY");
  }
  const address = wallet.toLowerCase();
  const url = `https://api.hyperfolio.xyz/points?address=${address}`;
  const res = await fetch(url, {
    headers: { "x-api-key": apiKey },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Hyperfolio HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Hyperfolio returned non-JSON response");
  }
  return {
    data: Array.isArray(json?.data) ? json.data : [],
  };
}

async function fetchDbSnapshotForWallet(
  wallet: string
): Promise<HyperfolioResponse | null> {
  const sqlUrl = process.env.DATABASE_URL;
  if (!sqlUrl) return null;
  try {
    const sql = neon(sqlUrl);
    // Fetch the latest actual_points per points_id for this owner
    const rows = (await sql`
      WITH latest AS (
        SELECT DISTINCT ON (points_id) points_id, actual_points, created_at
        FROM points_audit_logs
        WHERE owner = ${wallet}
        ORDER BY points_id, created_at DESC
      )
      SELECT points_id, actual_points FROM latest
    `) as Array<{ points_id: string; actual_points: string }>;

    const items: HyperfolioItem[] = [];
    for (const r of rows) {
      const pts = Number(r.actual_points || 0);
      switch (r.points_id) {
        case POINTS_ID_HYPERBEAT_S1:
          items.push({ protocolName: "Hyperbeat", points: pts });
          break;
        case POINTS_ID_FELIX_S1:
          items.push({ protocolName: "Felix", points: pts });
          break;
        case POINTS_ID_UPSHIFT_S2:
          items.push({ protocolName: "Upshift", points: pts });
          break;
        default:
          break;
      }
    }
    return { data: items };
  } catch (e) {
    console.error("DB snapshot fetch failed", e);
    return null;
  }
}

type HyperfolioClient = {
  mode: HyperfolioMode;
  url: (wallet: string) => string;
  fetch: (wallet: string) => Promise<HyperfolioResponse>;
};

function createHyperfolioClient(mode: HyperfolioMode): HyperfolioClient {
  const cache = new Map<string, Promise<HyperfolioResponse>>();

  const lower = (wallet: string) => wallet.toLowerCase();
  const url = (wallet: string) => {
    const base = `https://api.hyperfolio.xyz/points?address=${wallet}`;
    return mode === "db" ? `${base}&via=db` : base;
  };

  const fetch = async (wallet: string) => {
    const key = lower(wallet);
    let job = cache.get(key);
    if (!job) {
      job = (async () => {
        if (mode === "db") {
          return (await fetchDbSnapshotForWallet(wallet)) ?? { data: [] };
        }

        try {
          return await fetchHyperfolioLive(wallet);
        } catch (error) {
          const snapshot = await fetchDbSnapshotForWallet(wallet);
          if (snapshot) return snapshot;
          throw error;
        }
      })();
      cache.set(key, job);
    }
    return job.catch((err) => {
      cache.delete(key);
      throw err;
    });
  };

  return { mode, url, fetch };
}

function resolveHyperfolioMode(mode?: HyperfolioMode): HyperfolioMode {
  if (mode) {
    return mode;
  }
  return process.env.HYPERFOLIO_USE_DB === "true" ? "db" : "live";
}

type BuildApisOptions = {
  hyperfolioMode?: HyperfolioMode;
};

const BASE_APIS: Api[] = [
  {
    pointsId: POINTS_ID_ETHENA_SATS_S3,
    seasonEnd: "Mar-24-2025 00:00:00 AM UTC",
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://app.ethena.fi/api/users/get-user?address=${getAddress(
            wallet
          )}`,
        select: (data: any) => data?.totalS3Points || 0,
      },
    ],
  },
  {
    pointsId: POINTS_ID_ETHENA_SATS_S4,
    seasonStart: "Mar-24-2025 00:00:00 AM UTC",
    dataSources: [
      {
        getURL: (wallet) =>
          `https://app.ethena.fi/api/referral/get-referree?address=${getAddress(
            wallet
          )}`,
        select: (data) =>
          Big(
            data?.queryWallet?.[0]?.accumulatedTotalShardsEarned || 0
          ).toNumber(),
      },
    ],
  },
  {
    pointsId: POINTS_ID_ZIRCUIT_S3,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://stake.zircuit.com/api/points/${wallet}`,
        select: (data: any) => data["1"].totalPoints || 0,
      },
    ],
  },
  {
    pointsId: POINTS_ID_KARAK_S2,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://restaking-backend.karak.network/getPortfolio?batch=1&input=${encodeURIComponent(
            JSON.stringify({ "0": { wallet } })
          )}`,
        select: (data: any) => data?.[0]?.result?.data?.xpByPhase?.phase2 || 0,
        catchError: true,
      },
      {
        getURL: (wallet: string) =>
          `https://app.ether.fi/api/portfolio/v3/${wallet}`,
        select: (data: any) =>
          data.totalPointsSummaries?.KARAK?.CurrentPoints || 0,
      },
      {
        getURL: (wallet: string) =>
          `https://common.kelpdao.xyz/gain/user/${wallet}`,
        select: (data: any) => data[MAINNET_AGETH]?.karakPoints || 0,
      },
    ],
  },
  {
    pointsId: POINTS_ID_ETHERFI_S4,
    seasonEnd: "Feb-01-2025 00:00:00 AM UTC",
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://app.ether.fi/api/portfolio/v3/${wallet}`,
        select: (data: any) =>
          data?.totalPointsSummaries?.LOYALTY?.PreviousSeasonPoints ?? 0,
      },
    ],
  },
  {
    pointsId: POINTS_ID_ETHERFI_S5,
    seasonStart: "Feb-01-2025 00:00:00 AM UTC",
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://app.ether.fi/api/portfolio/v3/${wallet}`,
        select: (data: any) =>
          data?.totalPointsSummaries?.LOYALTY?.CurrentSeasonPoints ?? 0,
      },
    ],
  },
  {
    pointsId: POINTS_ID_VEDA_S1,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://app.veda.tech/api/user-veda-points?userAddress=${wallet}`,
        select: (data: any) =>
          data.Response.ethereum.userChainVedaPointsSum || 0,
      },
    ],
  },
  {
    pointsId: POINTS_ID_MELLOW_S1,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://points.mellow.finance/v1/chain/1/users/${wallet}`,
        select: (data: any) =>
          data.reduce(
            (acc: number, curr: { user_mellow_points: number }) =>
              curr.user_mellow_points + acc,
            0
          ),
      },
      {
        getURL: (wallet: string) =>
          `https://points.mellow.finance/v1/chain/1/defi/users/${wallet}`,
        select: (data: any) =>
          data.reduce(
            (
              acc: number,
              curr: { user_mellow_points: number; boost: string }
            ) => {
              return curr.user_mellow_points * Number(curr.boost) + acc;
            },
            0
          ),
      },
    ],
  },
  {
    pointsId: POINTS_ID_SYMBIOTIC_S1,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://app.symbiotic.fi/api/v2/dashboard/${wallet}`,
        select: (data: any) => {
          let totalPoints = new Big(0);
          if (data.points) {
            for (let i = 0; i < data.points.length; i++) {
              const points = new Big(data.points[i].points);
              const decimals = new Big(10).pow(data.points[i].meta.decimals);
              totalPoints = totalPoints.plus(points.div(decimals));
            }
          }
          return totalPoints;
        },
      },
      {
        getURL: (wallet: string) =>
          `https://points.mellow.finance/v1/chain/1/users/${wallet}`,
        select: (data: any) =>
          data.reduce(
            (acc: number, curr: any) => curr.user_symbiotic_points + acc,
            0
          ),
      },
      {
        getURL: (wallet: string) =>
          `https://points.mellow.finance/v1/chain/1/defi/users/${wallet}`,
        select: (data: any) =>
          data.reduce(
            (acc: number, curr: any) => curr.user_symbiotic_points + acc,
            0
          ),
      },
      {
        getURL: (wallet: string) =>
          `https://app.ether.fi/api/portfolio/v3/${wallet}`,
        select: (data: any) =>
          data.totalPointsSummaries?.SYMBIOTIC?.CurrentPoints || 0,
      },
    ],
  },
  {
    pointsId: POINTS_ID_LOMBARD_LUX_S1,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://mainnet.prod.lombard.finance/api/v1/referral-system/season-1/points/${wallet}`,
        select: (data: any) => data?.total || 0,
      },
    ],
  },
  {
    pointsId: POINTS_ID_RESOLV_S1,
    dataSources: [
      {
        getURL: (wallet) =>
          `https://api.resolv.xyz/points/leaderboard/slice?address=${wallet}`,
        select: (data, wallet) => {
          const rows = data?.rows || [];
          for (const row of rows) {
            if (row.address.toLowerCase() === wallet.toLowerCase()) {
              return Number(row.points);
            }
          }
          return 0;
        },
      },
    ],
  },
  {
    pointsId: POINTS_ID_MERITS_S1,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://points.mellow.finance/v1/chain/1/users/${wallet}`,
        select: (data: any) =>
          data.reduce(
            (acc: number, curr: { user_merits_points: number }) =>
              curr.user_merits_points + acc,
            0
          ),
      },
    ],
  },
  // Hyperbeat via Hyperfolio (populated dynamically)
  {
    pointsId: POINTS_ID_HYPERBEAT_S1,
    dataSources: [],
  },
  {
    pointsId: POINTS_ID_SENTIMENT_S1,
    dataSources: [
      {
        getURL: () => `https://app.sentiment.xyz/api/points`,
        select: (data: any, user: string) => {
          const userObj = data?.users?.find(
            (u: any) => u.user.toLowerCase() === user.toLowerCase()
          );
          return userObj?.totalPoints || 0;
        },
      },
    ],
  },
  {
    pointsId: POINTS_ID_UPSHIFT_S2,
    dataSources: [],
  },
  {
    pointsId: POINTS_ID_FELIX_S1,
    dataSources: [],
  },
  {
    pointsId: POINTS_ID_KINETIQ_S1,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://kinetiq.xyz/api/points/${wallet}?chainId=999`,
        select: (data: any) => {
          return data?.points || 0;
        },
      },
    ],
  },
];

const HYPERFOLIO_PROTOCOLS: Record<string, { name: string; catchError?: boolean; needsFelixFallback?: boolean }> = {
  [POINTS_ID_HYPERBEAT_S1]: { name: "Hyperbeat" },
  [POINTS_ID_UPSHIFT_S2]: { name: "Upshift" },
  [POINTS_ID_FELIX_S1]: { name: "Felix", catchError: true, needsFelixFallback: true },
};

function findProtocolPoints(data: any, protocolName: string): number {
  const entry = data?.data?.find((item: any) => item.protocolName === protocolName);
  return Number(entry?.points || 0);
}

export function buildApis(options?: BuildApisOptions): Api[] {
  const mode = resolveHyperfolioMode(options?.hyperfolioMode);
  const client = createHyperfolioClient(mode);

  return BASE_APIS.map((api) => {
    const protocol = HYPERFOLIO_PROTOCOLS[api.pointsId];
    if (!protocol) return api;

    return {
      ...api,
      dataSources: [
        {
          getURL: (wallet: string) => client.url(wallet),
          getData: async (wallet: string) => {
            const result = await client.fetch(wallet);
            if (!protocol.needsFelixFallback || client.mode === "db") {
              return result;
            }

            const hasFelix = result?.data?.some(
              (item: any) => item.protocolName === protocol.name
            );
            if (hasFelix) return result;

            try {
              const felixResponse = await fetchFelixPoints(wallet);
              const parsed = parseFelixTotalPoints(felixResponse.text);
              return fabricateHyperfolioLikeResult(
                protocol.name,
                parsed.toNumber()
              );
            } catch {
              return result;
            }
          },
          select: (data: any) => findProtocolPoints(data, protocol.name),
          ...(protocol.catchError ? { catchError: true } : {}),
        },
      ],
    };
  });
}
