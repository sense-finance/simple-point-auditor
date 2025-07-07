import Big from "big.js";
import { Api } from "../types";
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
  // POINTS_ID_UPSHIFT_S2,
  POINTS_ID_FELIX_S1,
} from "./constants";

// Utility to safely format GraphQL queries as a single line
function formatGraphQLQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

export const APIS: Api[] = [
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
          data.totalPointsSummaries.LOYALTY.PreviousSeasonPoints || 0,
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
          data.totalPointsSummaries.LOYALTY.CurrentSeasonPoints || 0,
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
  {
    pointsId: POINTS_ID_HYPERBEAT_S1,
    dataSources: [
      {
        getURL: () => `https://app.hyperbeat.org/api/points`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9",
          dnt: "1",
          origin: "https://app.hyperbeat.org",
          referer: "https://app.hyperbeat.org/hyperfolio",
          "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
        },
        getBody: (
          wallet: string,
          _startTimestamp?: number,
          endTimestamp?: number
        ) => {
          const query = {
            query:
              formatGraphQLQuery(`query GetWeeklyPoints($user_filter: String!, $start_timestamp: bigint!, $end_timestamp: bigint!) {
              cron_get_ranked_points_by_timestamp(args: {
                provider_filter: "hyperbeat",
                user_filter: $user_filter,
                start_timestamp: $start_timestamp,
                end_timestamp: $end_timestamp
              }) {
                total_value
              }
            }`),
            variables: {
              user_filter: wallet,
              start_timestamp: 1743408000, // UI start timestamp, presumably start of all point accruals
              end_timestamp: endTimestamp,
            },
          };
          return JSON.stringify(query);
        },
        select: (data: any) => {
          const arr = data.data?.cron_get_ranked_points_by_timestamp;
          return Array.isArray(arr) && arr.length > 0
            ? new Big(arr[0].total_value).div(1_000_000).toNumber()
            : 0;
        },
      },
    ],
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
  // {
  //   pointsId: POINTS_ID_UPSHIFT_S2,
  //   dataSources: [
  //     {
  //       getURL: (wallet: string) =>
  //         `https://api.hyperfolio.xyz/points?address=${wallet}`,
  //       headers: {
  //         "x-api-key": process.env.HYPERFOLIO_API_KEY,
  //       },
  //       select: (data: any) => {
  //         if (Array.isArray(data)) {
  //           const upshiftProtocol = data.find(
  //             (protocol: any) => protocol.protocolName === "Upshift"
  //           );
  //           return upshiftProtocol?.points || 0;
  //         }
  //         return 0;
  //       },
  //     },
  //   ],
  // },
  {
    pointsId: POINTS_ID_FELIX_S1,
    dataSources: [
      {
        getURL: () => `https://www.usefelix.xyz/portfolio`,
        method: "POST",
        headers: {
          accept: "text/x-component",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "text/plain;charset=UTF-8",
          dnt: "1",
          "next-action": "c0b38f249b4e82d81339646958e523b6da7a6c7ff2",
          "next-router-state-tree":
            "%5B%22%22%2C%7B%22children%22%3A%5B%22(dashboard)%22%2C%7B%22children%22%3A%5B%22portfolio%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2Fportfolio%22%2C%22refresh%22%5D%7D%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
          origin: "https://www.usefelix.xyz",
          referer: "https://www.usefelix.xyz/portfolio",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
        },
        getBody: (wallet: string) => {
          return JSON.stringify([wallet]);
        },
        select: (data: any) => {
          if (Array.isArray(data) && data.length > 1) {
            const pointsData = data[1];
            return pointsData?.totalPoints || 0;
          }
          return 0;
        },
      },
    ],
  },
];
