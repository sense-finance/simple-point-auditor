export const POINTS_ID_ETHENA_SATS_S3 = "POINTS_ID_ETHENA_SATS_S3";
export const POINTS_ID_KARAK_S2 = "POINTS_ID_KARAK_S2";
export const POINTS_ID_SYMBIOTIC_S1 = "POINTS_ID_SYMBIOTIC_S1";
export const POINTS_ID_EIGENLAYER_S3 = "POINTS_ID_EIGENLAYER_S3";
export const POINTS_ID_EIGENPIE_S1 = "POINTS_ID_EIGENPIE_S1";
export const POINTS_ID_MELLOW_S1 = "POINTS_ID_MELLOW_S1";
export const POINTS_ID_ZIRCUIT_S3 = "POINTS_ID_ZIRCUIT_S3";
export const POINTS_ID_ETHERFI_S4 = "POINTS_ID_ETHERFI_S4";
export const POINTS_ID_VEDA_S1 = "POINTS_ID_VEDA_S1";

export const APIS = [
  {
    pointsId: POINTS_ID_ETHENA_SATS_S3,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://app.ethena.fi/api/referral/get-referree?address=${wallet}`,
        select: (data: any) =>
          data?.queryWallet?.[0]?.accumulatedTotalShardsEarned || 0,
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
    pointsId: POINTS_ID_ETHERFI_S4,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://app.ether.fi/api/portfolio/v3/${wallet}`,
        select: (data: any) =>
          data.totalPointsSummaries.LOYALTY.CurrentPoints || 0,
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
    pointsId: POINTS_ID_SYMBIOTIC_S1,
    dataSources: [
      {
        getURL: (wallet: string) =>
          `https://app.symbiotic.al/api/v1/points/${wallet}`,
        select: (data: any) => data.totalPoints || 0,
      },
      {
        getURL: (wallet: string) =>
          `https://points.mellow.finance/v1/chain/1/users/${wallet}`,
        select: (data: any) =>
          data.reduce(
            (acc: any, curr: any) => curr.user_symbiotic_points + acc,
            0
          ),
      },
      {
        getURL: (wallet: string) =>
          `https://points.mellow.finance/v1/chain/1/defi/users/${wallet}`,
        select: (data: any) =>
          data.reduce(
            (acc: any, curr: any) => curr.user_symbiotic_points + acc,
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
];

export type AssetType = "USD" | "ETH";

export const CONFIG: Array<{
  strategy: string;
  start: string;
  owner: string;
  fixedValue?: {
    value: number;
    asset: AssetType;
  };
  points: Array<{
    type: string;
    expectedPointsPerDay: {
      value: number;
      baseAsset: AssetType;
    };
  }>;
}> = [
  {
    strategy: "Ethena: Lock USDe",
    start: "Jan-06-2025 10:42:59 PM UTC",
    owner: "0xb2E3A7D691F8e3FD891A64cA794378e25F1d666D",
    // optional: if the value of the position doesn't fluctuate with respect to usd or eth
    // (ie is static and doesn't need to be recalculated)
    fixedValue: { value: 5.0, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        // expected points per day per the value of the possition in 'asset' terms
        expectedPointsPerDay: { value: 20, baseAsset: "USD" },
      },
    ],
  },
  {
    strategy: "Ethena: sUSDe collateral on Morpho",
    start: "Jan-07-2025 05:32:23 AM UTC",
    owner: "0x05ED94D291FB50e0162Fd325a71918E5fC8f790B",
    fixedValue: { value: 5.13, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        // expected points per day per the value of the possition in 'asset' terms
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      },
    ],
  },
  {
    strategy: "Zircuit: Stake weETHs",
    start: "Jan-07-2025 05:41:23 AM UTC",
    owner: "0x9369106f4184D8D1180113d3D5C537Cf5F2d51b7",
    fixedValue: { value: 0.0015, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_ZIRCUIT_S3,
        expectedPointsPerDay: { value: 48, baseAsset: "ETH" },
      },
      {
        type: POINTS_ID_ETHERFI_S4,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
      },
      {
        type: POINTS_ID_VEDA_S1,
        expectedPointsPerDay: { value: 0.03, baseAsset: "USD" },
      },
    ],
  },
  {
    strategy: "Zircuit: Stake weETH",
    start: "Jan-07-2025 06:22:35 AM UTC",
    owner: "0xE0b3Ad1382912Be4628a42c20Ab8A373b87a7856",
    fixedValue: { value: 0.0015, asset: "ETH" },

    points: [
      {
        type: POINTS_ID_ZIRCUIT_S3,
        expectedPointsPerDay: { value: 24, baseAsset: "ETH" },
      },
      {
        type: POINTS_ID_ETHERFI_S4,
        expectedPointsPerDay: { value: 20000, baseAsset: "ETH" },
      },
      //   {
      //     type: POINTS_ID_EIGENLAYER_S3,
      //     expectedPointsPerDay: { value: 24, baseAsset: "ETH" },
      //   },
    ],
  },
  {
    strategy: "Zircuit: Stake USDe",
    start: "Jan-07-2025 06:33:23 AM UTC",
    owner: "0x0Eddb413B00B8C4871f3189D063b34f7067C948B",
    fixedValue: { value: 5.01, asset: "USD" },

    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 15, baseAsset: "USD" },
      },
      {
        type: POINTS_ID_ZIRCUIT_S3,
        expectedPointsPerDay: { value: 24, baseAsset: "ETH" },
      },
    ],
  },
  {
    strategy: "Zircuit: Stake mstETH",
    start: "Jan-07-2025 06:40:35 AM UTC",
    owner: "0x0Eddb413B00B8C4871f3189D063b34f7067C948B",
    fixedValue: { value: 0.0015, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_ZIRCUIT_S3,
        expectedPointsPerDay: { value: 24, baseAsset: "ETH" },
      },
      //   {
      //     type: POINTS_ID_EIGENPIE_S1,
      //     expectedPointsPerDay: { value: 2, baseAsset: "ETH" },
      //   },
      //   {
      //     type: POINTS_ID_EIGENLAYER_S3,
      //     expectedPointsPerDay: { value: 24, baseAsset: "ETH" },
      //   },
    ],
  },
  {
    strategy: "Fluid: sUSDe/USDT Looping",
    start: "Dec-06-2024 05:13:11 PM UTC",
    owner: "0x0a161D622a7Dd4D39cfd2f0B4D984a3341b10cab",
    fixedValue: { value: 1.141, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      },
    ],
  },
];

const memoizedFetchETHPriceUSD = (() => {
  let cache: number | null = null;
  return async () => {
    if (cache === null) {
      cache = await fetchETHPriceUSD();
    }
    return cache;
  };
})();

export async function convertValue(
  fromAsset: "USD" | "ETH",
  toAsset: "USD" | "ETH",
  value: number
): Promise<number> {
  const ethPriceUSD = (await memoizedFetchETHPriceUSD()) as number;

  if (fromAsset === toAsset) return value;
  if (fromAsset === "ETH") return value * ethPriceUSD;
  if (toAsset === "ETH") return value / ethPriceUSD;

  throw new Error("Invalid asset");
}

export async function fetchETHPriceUSD() {
  let coinGeckoApiKey = process.env.COIN_GECKO_API_KEY;
  if (!coinGeckoApiKey) {
    throw new Error("no coin gecko api key");
  }

  const res = await fetch(
    `https://pro-api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-cg-pro-api-key": coinGeckoApiKey || "",
      },
    }
  );
  if (!res.ok)
    throw new Error(`Failed to fetch prices: ${res.status}: ${res.statusText}`);

  const data = await res.json();

  return data.ethereum.usd;
}
