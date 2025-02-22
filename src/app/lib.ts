import Big from "big.js";

export const POINTS_ID_ETHENA_SATS_S3 = "POINTS_ID_ETHENA_SATS_S3";
export const POINTS_ID_KARAK_S2 = "POINTS_ID_KARAK_S2";
export const POINTS_ID_SYMBIOTIC_S1 = "POINTS_ID_SYMBIOTIC_S1";
export const POINTS_ID_EIGENLAYER_S3 = "POINTS_ID_EIGENLAYER_S3";
export const POINTS_ID_EIGENPIE_S1 = "POINTS_ID_EIGENPIE_S1";
export const POINTS_ID_MELLOW_S1 = "POINTS_ID_MELLOW_S1";
export const POINTS_ID_ZIRCUIT_S3 = "POINTS_ID_ZIRCUIT_S3";
export const POINTS_ID_ETHERFI_S4 = "POINTS_ID_ETHERFI_S4";
export const POINTS_ID_ETHERFI_S5 = "POINTS_ID_ETHERFI_S5";
export const POINTS_ID_VEDA_S1 = "POINTS_ID_VEDA_S1";
export const POINTS_ID_LOMBARD_LUX_S1 = "POINTS_ID_LOMBARD_LUX_S1";
export const POINTS_ID_RESOLV_S1 = "POINTS_ID_RESOLV_S1";
const MAINNET_AGETH = "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e";

const RESOLVE_BEARER_TOKEN = process.env.RESOLVE_BEARER_TOKEN;

export const APIS: Array<{
  pointsId: string;
  seasonEnd?: string;
  seasonStart?: string;
  dataSources: {
    getURL: (wallet: string) => string;
    select: (data: any) => number;
    catchError?: boolean;
    headers?: any;
  }[];
}> = [
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
              let mellowBoost = 1;
              if (
                curr.boost.toString().includes("pendle") ||
                curr.boost.toString().includes("zircuit")
              ) {
                mellowBoost = 2;
              }
              return curr.user_mellow_points * mellowBoost + acc;
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
        getURL: (wallet: string) =>
          `https://api.fuul.xyz/api/v1/payouts/leaderboard?user_address=${wallet}`,
        select: (data: any) => data?.results?.[0]?.total_amount,
        headers: {
          Authorization: RESOLVE_BEARER_TOKEN,
        },
      },
    ],
  },
];

export type AssetType = "USD" | "ETH" | "BTC" | "ENA";

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
    expectedPointsPerDay?: {
      value: number | ((start: string) => number);
      baseAsset: AssetType;
    };
    state?: {
      value: "verified" | "delayed" | "partial";
      lastSnapshot: string;
      diff: string;
    };
  }>;
  boosts?: {
    name: string;
    startDate: string;
    endDate: string;
    multiplier: number;
  }[];
  externalAppURL?: string;
}> = [
  {
    strategy: "Ethena: Lock USDe",
    start: "Jan-06-2025 10:42:59 PM UTC",
    owner: "0xb2E3A7D691F8e3FD891A64cA794378e25F1d666D",
    fixedValue: { value: 5.0, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 20, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-1.2%",
        },
      },
    ],
    externalAppURL: "https://app.ethena.fi/liquidity",
  },
  {
    strategy: "Ethena: sUSDe collateral on Morpho",
    start: "Jan-07-2025 05:32:23 AM UTC",
    owner: "0x05ED94D291FB50e0162Fd325a71918E5fC8f790B",
    fixedValue: { value: 5.13, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-17.6%",
        },
      },
    ],
    externalAppURL:
      "https://app.morpho.org/market?id=0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48&network=mainnet&morphoPrice=2.0",
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
        state: {
          value: "partial",
          lastSnapshot: "2025/01/21",
          diff: "-43.2%",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S4,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "2.9%",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/13",
          diff: "2.0%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-7.6%",
        },
      },
      {
        type: POINTS_ID_VEDA_S1,
        expectedPointsPerDay: { value: 0.03, baseAsset: "USD" },
        state: {
          value: "delayed",
          lastSnapshot: "2025/01/21",
          diff: "-100.0%",
        },
      },
    ],
    externalAppURL: "https://app.zircuit.com/",
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
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "8.8%",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S4,
        expectedPointsPerDay: { value: 20000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-1.7%",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 20000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/13",
          diff: "-2.1%",
        },
      },
    ],
    externalAppURL: "https://app.zircuit.com/",
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
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-6.0%",
        },
      },
      {
        type: POINTS_ID_ZIRCUIT_S3,
        expectedPointsPerDay: { value: 24, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "16.2%",
        },
      },
    ],
    externalAppURL: "https://app.zircuit.com/",
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
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "16.2%",
        },
      },
    ],
    externalAppURL: "https://app.zircuit.com/",
  },
  {
    strategy: "Zircuit: Stake amphrETH",
    start: "Jan-08-2025 08:21:35 PM UTC",
    owner: "0x5256cdF356ad80b9Af2A852A0ED2cC45B9971D2e",
    fixedValue: { value: 0.0015, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_ZIRCUIT_S3,
        expectedPointsPerDay: { value: 24, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "13.2%",
        },
      },
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.012, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-1.8%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "partial",
          lastSnapshot: "2025/02/17",
          diff: "-40.5%",
        },
      },
    ],
    externalAppURL: "https://app.zircuit.com/",
  },
  {
    strategy: "Mellow: Re7 Labs LRT",
    start: "Jan-08-2025 08:29:35 PM UTC",
    owner: "0x83c4fbDddD1F60021c3aE2940d21d93E96017F00",
    fixedValue: { value: 0.001, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "partial",
          lastSnapshot: "2025/02/17",
          diff: "-40.6%",
        },
      },
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-1.9%",
        },
      },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-re7lrt",
  },
  {
    strategy: "Mellow: Ethena LRT Vault stETH",
    start: "Jan-08-2025 08:51:59 PM UTC",
    owner: "0x803cD032bCFAfB23Bf7DEB02fd2da2cd02919c4D",
    fixedValue: { value: 4.94, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 10, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-14.8%",
        },
      },
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-0.8%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "partial",
          lastSnapshot: "2025/02/17",
          diff: "-50.7%",
        },
      },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-rsteth",
  },
  {
    strategy: "Mellow: Re7 Labs Restaked wBTC",
    start: "Jan-08-2025 08:38:23 PM UTC",
    owner: "0x246633B59288BA6A4160D3244382EC87Bedbd4d6",
    fixedValue: { value: 0.00005228, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "partial",
          lastSnapshot: "2025/02/17",
          diff: "-55.1%",
        },
      },
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-6.9%",
        },
      },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-re7rwbtc",
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
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-13.1%",
        },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/18",
  },
  {
    strategy: "Symbiotic: Restake LBTC",
    start: "Jan-08-2025 03:25:47 PM UTC",
    owner: "0x9c94730890120709ae4bfe9DA72DdA0BbC81B15b",
    fixedValue: { value: 0.00005277, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-7.0%",
        },
      },
    ],
    externalAppURL: "https://app.symbiotic.fi/restake/lbtc",
  },
  {
    strategy: "Fluid: weETH/wstETH Looping",
    start: "Jan-08-2025 08:51:23 PM UTC",
    owner: "0x7fba27a482006e7a93815b607a6577998aa94730",
    fixedValue: { value: 0.000382163037, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_ZIRCUIT_S3,
        expectedPointsPerDay: { value: 36, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-0.0%",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S4,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "3.8%",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/13",
          diff: "4.0%",
        },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/16",
  },
  {
    strategy: "Fluid: weETHs/wstETH Looping",
    start: "Jan-09-2025 03:33:47 AM UTC",
    owner: "0xde96647e506e87b9c709a9b3d794b90182f8f7c0",
    fixedValue: { value: 0.001572, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_ZIRCUIT_S3,
        expectedPointsPerDay: { value: 24, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "0.1%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-7.4%",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S4,
        expectedPointsPerDay: { value: 35000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "3.0%",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 35000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/13",
          diff: "4.2%",
        },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/27",
  },
  {
    strategy: "Fluid: sUSDe/GHO Looping",
    start: "Jan-10-2025 06:19:59 AM UTC",
    owner: "0x7695b7f25ce04ddacae7da99db945ffb71b87554",
    fixedValue: { value: 1.654, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "delayed",
          lastSnapshot: "2025/01/21",
          diff: "-100.0%",
        },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/56",
  },
  {
    strategy: "Fluid: sUSDe/USDC Looping",
    start: "Jan-09-2025 03:47:59 AM UTC",
    owner: "0xd0600e901f894c64d407c8a28df21bb697c3eba3",
    fixedValue: { value: 8.54, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "delayed",
          lastSnapshot: "2025/01/21",
          diff: "-100.0%",
        },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/17",
  },
  {
    strategy: "Karak: Restake weETH",
    start: "Jan-08-2025 03:53:47 AM UTC",
    owner: "0xB012BF2E813Ac618441246bF9225f770fB5e8410",
    fixedValue: { value: 0.0015, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_KARAK_S2,
        expectedPointsPerDay: { value: 1.2, baseAsset: "USD" },
        state: {
          value: "delayed",
          lastSnapshot: "2025/01/21",
          diff: "-100.0%",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S4,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "partial",
          lastSnapshot: "2025/02/17",
          diff: "-27.9%",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/13",
          diff: "-1.4%",
        },
      },
    ],
    externalAppURL: "https://app.karak.network/pool/ethereum/WeETH",
  },
  {
    strategy: "Karak: Restake USDe",
    start: "Jan-08-2025 03:59:11 AM UTC",
    owner: "0x8C4B26947Eb4c6eD12d3555872106b3e1dfc7349",
    fixedValue: { value: 5.01, asset: "USD" },
    points: [
      {
        type: POINTS_ID_KARAK_S2,
        expectedPointsPerDay: { value: 1.2, baseAsset: "USD" },
        state: {
          value: "delayed",
          lastSnapshot: "2025/01/21",
          diff: "-100.0%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 20, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-6.7%",
        },
      },
    ],
    externalAppURL: "https://app.karak.network/pool/ethereum/USDe",
  },
  {
    strategy: "Symbiotic: Restake wstETH",
    start: "Jan-08-2025 12:58:47 PM UTC",
    owner: "0xbB1A8420af98358a1BEEA44cC050f6b8610d411a",
    fixedValue: { value: 0.001521806, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-1.8%",
        },
      },
    ],
    externalAppURL: "https://app.symbiotic.fi/restake/wsteth",
  },
  {
    strategy: "Symbiotic: Restake sUSDe",
    start: "Jan-08-2025 01:51:47 PM UTC",
    owner: "0x201D2EFf0F2f2ea460f44a73F4231567A2892644",
    fixedValue: { value: 5.016, asset: "USD" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "0.3%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 10, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-15.8%",
        },
      },
    ],
    externalAppURL: "https://app.symbiotic.fi/restake/susde",
  },
  {
    strategy: "Mellow: Ethena LRT Vault sUSDe",
    start: "Jan-08-2025 08:51:59 PM UTC",
    owner: "0x803cD032bCFAfB23Bf7DEB02fd2da2cd02919c4D",
    fixedValue: { value: 4.89288, asset: "USD" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "partial",
          lastSnapshot: "2025/02/17",
          diff: "-50.2%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 10, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-14.0%",
        },
      },
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "0.2%",
        },
      },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-rsusde",
  },
  {
    strategy: "Kelp: agETH",
    start: "Jan-07-2025 06:30:59 PM UTC",
    owner: "0x84C8Da9521b5f3B70Df324d5A4FE61b6EF189aAE",
    fixedValue: { value: 0.001, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_KARAK_S2,
        expectedPointsPerDay: { value: 460, baseAsset: "ETH" },
        state: {
          value: "delayed",
          lastSnapshot: "2025/01/21",
          diff: "1150.5%",
        },
      },
    ],
    externalAppURL: "https://kelpdao.xyz/gain/airdrop-gain/",
  },
  {
    strategy: "Pendle: Hold YT-sUSDE-29MAY2025",
    start: "Jan-14-2025 02:40:35 PM UTC",
    owner: "0x80CC5d5060aCcB22580B8375e9296A9da6D48186",
    fixedValue: { value: 75, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-15.8%",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xB162B764044697cf03617C2EFbcB1f42e31E4766/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold YT-sUSDE-27MAR2025",
    start: "Jan-14-2025 02:38:23 PM UTC",
    owner: "0xC35726baBcEd982cd3360AE2745360F9E55f0eEE",
    fixedValue: { value: 225, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-9.8%",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xcDd26Eb5EB2Ce0f203a84553853667aE69Ca29Ce/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold sUSDe (Karak) YTs (29 Jan 2025)",
    start: "Jan-08-2025 09:06:47 PM UTC",
    owner: "0x89d8c1d1a0ec5c77663c0083514c06b11480f211",
    fixedValue: { value: 304.71, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "delayed",
          lastSnapshot: "2025/01/21",
          diff: "-100.0%",
        },
      },
      {
        type: POINTS_ID_KARAK_S2,
        expectedPointsPerDay: { value: 1.6, baseAsset: "USD" },
        state: {
          value: "delayed",
          lastSnapshot: "2025/01/21",
          diff: "-100.0%",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xdbe4d359d4e48087586ec04b93809ba647343548/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold rsUSDe YTs (26 Mar 2025)",
    start: "Jan-08-2025 09:04:47 PM UTC",
    owner: "0xe03eca1200f3e3d0a385f02547591265ed5b06a4",
    fixedValue: { value: 82.28, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 10, baseAsset: "USD" },
        state: {
          value: "delayed",
          lastSnapshot: "2025/01/21",
          diff: "-100.0%",
        },
      },
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.012, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-3.1%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "partial",
          lastSnapshot: "2025/02/17",
          diff: "-51.9%",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x890b6afc834c2a2cc6cb9b6627272ab4ecfd8271/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Euler: LBTC/cbBTC Looping",
    start: "Jan-23-2025 05:50:35 PM UTC",
    owner: "0x7ED9DbFfc22c5d36c2Cc612e17049D8B992bE584",
    fixedValue: { value: 0.00065, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_LOMBARD_LUX_S1,
        expectedPointsPerDay: { value: 3, baseAsset: "BTC" },
        state: {
          value: "partial",
          lastSnapshot: "2025/01/21",
          diff: "-53.1%",
        },
      },
    ],
    externalAppURL:
      "https://app.euler.finance/vault/0xbC35161043EE2D74816d421EfD6a45fDa73B050A?network=ethereum",
  },
  {
    strategy: "Euler: wstUSR/USDC",
    start: "Jan-23-2025 06:53:59 PM UTC",
    owner: "0x4Baf2A657E28fEcf178F86558F4e471356CB5DAC",
    fixedValue: { value: 62.62, asset: "USD" },
    points: [
      {
        type: POINTS_ID_RESOLV_S1,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/28",
          diff: "4.2%",
        },
      },
    ],
    boosts: [
      {
        name: "Grand Epoch",
        startDate: "Jan-05-2025 06:53:59 PM UTC",
        endDate: "Jan-23-2026 06:53:59 PM UTC",
        multiplier: 0.25,
      },
    ],
    externalAppURL: "https://app.resolv.xyz/points",
  },
  {
    strategy: "Resolv: Hold USR",
    start: "Jan-28-2025 03:34:35 PM UTC",
    owner: "0x9B8Cb8604f7Bf22D6de09a72d9D9198c2cC6D9EE",
    fixedValue: { value: 16.15, asset: "USD" },
    points: [
      {
        type: POINTS_ID_RESOLV_S1,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/29",
          diff: "-2.8%%",
        },
      },
    ],
    boosts: [
      {
        name: "Grand Epoch",
        startDate: "Jan-05-2025 06:53:59 PM UTC",
        endDate: "Jan-23-2026 06:53:59 PM UTC",
        multiplier: 0.25,
      },
    ],
    externalAppURL: "https://app.resolv.xyz/points",
  },
  {
    strategy: "Resolv: Hold RLP",
    start: "Jan-28-2025 03:45:59 PM UTC",
    owner: "0x49a5ac8367602bfb4410619c52511595F8fD98ef",
    fixedValue: { value: 2.73, asset: "USD" }, // asset is RLP (itself)
    points: [
      {
        type: POINTS_ID_RESOLV_S1,
        expectedPointsPerDay: { value: 10, baseAsset: "USD" }, // asset is RLP (itself)
        state: {
          value: "verified",
          lastSnapshot: "2025/01/29",
          diff: "-0.1%",
        },
      },
    ],
    boosts: [
      {
        name: "Grand Epoch",
        startDate: "Jan-05-2025 06:53:59 PM UTC",
        endDate: "Jan-23-2026 06:53:59 PM UTC",
        multiplier: 0.25,
      },
    ],
    externalAppURL: "https://app.resolv.xyz/points",
  },
  {
    strategy: "Resolv: Hold stUSR",
    start: "Jan-28-2025 03:53:35 PM UTC",
    owner: "0x7b9bB657d06e39A5e3Af24F50775a888d9B36897",
    fixedValue: { value: 5.001, asset: "USD" },
    points: [
      {
        type: POINTS_ID_RESOLV_S1,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/01/29",
          diff: "-0.0%",
        },
      },
    ],
    boosts: [
      {
        name: "Grand Epoch",
        startDate: "Jan-05-2025 06:53:59 PM UTC",
        endDate: "Jan-23-2026 06:53:59 PM UTC",
        multiplier: 0.25,
      },
    ],
    externalAppURL: "https://app.resolv.xyz/points",
  },
  {
    strategy: "Pendle: Hold USDe 27 Mar 2025",
    start: "Jan-22-2025 01:15:23 PM UTC",
    owner: "0xDc97A03e188585453018e237931df951268Fb5eF",
    fixedValue: { value: 157.2946, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 50, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/03",
          diff: "-10.5%",
        },
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x4A8036EFA1307F1cA82d932C0895faa18dB0c9eE/swap?view=yt&chain=ethereum",
  },
  // Points are earned per YT
  // The rate is variable depending on how close to maturity the YT is
  {
    strategy: "Pendle: USR YTs (25 Mar 2025)",
    start: "Jan-28-2025 04:01:35 PM UTC",
    owner: "0xE283020c833186D31292358836b66b2aCb01aC33",
    fixedValue: { value: 310.2, asset: "USD" }, // asset is YT (itself)
    points: [
      {
        type: POINTS_ID_RESOLV_S1,
        expectedPointsPerDay: {
          value: (startDate) => {
            const initialRate = 20;
            const secondRate = 15;

            const now = new Date().getTime();
            const start = new Date(startDate).getTime();
            const initialRateEnd = new Date(
              "Jan-31-2025 11:59:59 PM UTC"
            ).getTime();
            const maturityTime = new Date(
              "Mar-27-2025 12:00:00 AM UTC"
            ).getTime();

            if (now <= initialRateEnd) {
              return initialRate;
            }
            if (start > initialRateEnd) {
              return secondRate;
            }

            const initialRateDuration = initialRateEnd - start;
            const secondRateDuration =
              now > maturityTime
                ? maturityTime - initialRateEnd
                : now - initialRateEnd;

            const blendedRate =
              (initialRateDuration * initialRate +
                secondRateDuration * secondRate) /
              (initialRateDuration + secondRateDuration);

            return blendedRate;
          },
          baseAsset: "USD",
        }, // asset is YT (itself)
        state: {
          value: "delayed",
          lastSnapshot: "2025/02/07",
          diff: "-100%",
        },
      },
    ],
    boosts: [
      {
        name: "Grand Epoch",
        startDate: "Jan-05-2025 06:53:59 PM UTC",
        endDate: "Jan-23-2026 06:53:59 PM UTC",
        multiplier: 0.25,
      },
    ],
    externalAppURL: "https://app.resolv.xyz/points",
  },
  {
    strategy: "Symbiotic: mETH",
    start: "Feb-11-2025 05:07:59 PM UTC",
    owner: "0x7D499bf53cD16934a734ED3d377B86eD4d93aBD2",
    fixedValue: { value: 0.0009469, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "3.2",
        },
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x475D3Eb031d250070B63Fa145F0fCFC5D97c304a",
  },
  {
    strategy: "Symbiotic: WBTC",
    start: "Feb-11-2025 05:19:35 PM UTC",
    owner: "0x006E5B26f63b3b9bAEaAC48CeF8487CC878652A3",
    fixedValue: { value: 0.00004112, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "0.9",
        },
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x971e5b5D4baa5607863f3748FeBf287C7bf82618",
  },
  {
    strategy: "Symbiotic: rETH",
    start: "Feb-11-2025 05:25:35 PM UTC",
    owner: "0x2EF46BFb02d871018e8C39E4250eEDdea35532a5",
    fixedValue: { value: 0.0008904, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "14.0",
        },
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x03Bf48b8A1B37FBeAd1EcAbcF15B98B924ffA5AC",
  },
  {
    strategy: "Symbiotic: cbETH",
    start: "Feb-11-2025 05:28:35 PM UTC",
    owner: "0x67F96d82b386EdD2A5599bf71DfdBd580dCaC15C",
    fixedValue: { value: 0.001834, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "3.0%",
        },
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0xB26ff591F44b04E78de18f43B46f8b70C6676984",
  },
  {
    strategy: "Symbiotic: ENA",
    start: "Feb-11-2025 05:36:23 PM UTC",
    owner: "0xE36C6cDE7AA8100d8A792Dee4375Bc8e7E57157C",
    fixedValue: { value: 0.966, asset: "USD" }, // TODO: ENA
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-0.7%",
        },
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0xe39B5f5638a209c1A6b6cDFfE5d37F7Ac99fCC84",
  },
  {
    strategy: "Symbiotic: wBETH",
    start: "Feb-12-2025 12:52:47 AM UTC",
    owner: "0x1A8348e8b60afDf65dcec0d28850341c2ed0E6CD",
    fixedValue: { value: 0.001739, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "7.7%",
        },
      },
    ],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x422F5acCC812C396600010f224b320a743695f85",
  },
  {
    strategy: "Symbiotic: Swell swBTC",
    start: "Feb-12-2025 12:59:35 AM UTC",
    owner: "0x81B26B60706E5202eCfCa26F53343d8D26d440A2",
    fixedValue: { value: 0.00002713, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
      },
    ],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x9e405601B645d3484baeEcf17bBF7aD87680f6e8",
  },
  {
    strategy: "Symbiotic: swETH",
    start: "Feb-12-2025 01:07:23 AM UTC",
    owner: "0x20EF479B638a78d2Ea65CE0f78e0Ce014908fBDc",
    fixedValue: { value: 0.001848, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "9.8%",
        },
      },
    ],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x38B86004842D3FA4596f0b7A0b53DE90745Ab654",
  },
  {
    strategy: "Symbiotic: LsETH",
    start: "Feb-12-2025 01:12:11 AM UTC",
    owner: "0xE761874fC96108F38730B21881705Afd59d9f4E2",
    fixedValue: { value: 0.0009393, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "9.7%",
        },
      },
    ],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0xB09A50AcFFF7D12B7d18adeF3D1027bC149Bad1c",
  },
  {
    strategy: "Symbiotic: osETH",
    start: "Feb-12-2025 01:15:47 AM UTC",
    owner: "0x53d715B35fBb24C6A5A11A05D8Ea877f0feb0781",
    fixedValue: { value: 0.001924, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "5.3%",
        },
      },
    ],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x52cB8A621610Cc3cCf498A1981A8ae7AD6B8AB2a",
  },
  {
    strategy: "Symbiotic: MEV Capital wstETHVault",
    start: "Feb-12-2025 01:24:47 AM UTC",
    owner: "0xfb73Ce657D33A89c353109C9BA09B3eC5Babd7b5",
    fixedValue: { value: 0.0008384, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
      },
    ],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x4e0554959A631B3D3938ffC158e0a7b2124aF9c5",
  },
  {
    strategy: "Symbiotic: sfrxETH",
    start: "Feb-12-2025 01:37:35 AM UTC",
    owner: "0x1a9062C07A73526BdC2e5eA6E8DED56427FF9D9a",
    fixedValue: { value: 0.000898, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "12.9%",
        },
      },
    ],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x5198CB44D7B2E993ebDDa9cAd3b9a0eAa32769D2",
  },
  {
    strategy: "Symbiotic: Guantlet Restaked swETH",
    start: "Feb-12-2025 03:08:35 AM UTC",
    owner: "0xcc885EbCdB494502B51cdB3B340D7786CBf251a3",
    fixedValue: { value: 0.001848, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
      },
    ],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x65B560d887c010c4993C8F8B36E595C171d69D63",
  },
  {
    strategy: "Symbiotic: ETHFI",
    start: "Feb-12-2025 03:12:11 AM UTC",
    owner: "0x79E6BaB78b17af4B318eCAD070beEc6cda2e71AC",
    fixedValue: { value: 5.651, asset: "USD" }, // todo: ethfi
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "4.2%",
        },
      },
    ],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x21DbBA985eEA6ba7F27534a72CCB292eBA1D2c7c",
  },
  {
    strategy: "Symbiotic: Guantlet Restaked cbETH",
    start: "Feb-12-2025 04:08:11 AM UTC",
    owner: "0xaE3be96b6C6097c4B6B41dF14da93fFeEa4c5A6B",
    fixedValue: { value: 0.001835, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0xB8Fd82169a574eB97251bF43e443310D33FF056C",
  },
  {
    strategy: "Symbiotic: FXS",
    start: "Feb-12-2025 04:11:35 AM UTC",
    owner: "0x699Df916f192E88126b3BA47BCFA293c597Ab0D2",
    fixedValue: { value: 6.925, asset: "USD" }, // todo: fxs
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "1.1%",
        },
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x940750A267c64f3BBcE31B948b67CD168f0843fA",
  },
  {
    strategy: "Symbiotic: TBTC",
    start: "Feb-12-2025 04:14:11 AM UTC",
    owner: "0xe74506bcF546a952874344205c952Cc8f82C6d89",
    fixedValue: { value: 0.00004342, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "0.3%",
        },
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x0C969ceC0729487d264716e55F232B404299032c",
  },
  {
    strategy: "Symbiotic: Manta",
    start: "Feb-12-2025 04:16:59 AM UTC",
    owner: "0xaaB6A798Aa1ffB4E24A8e8fa070427cD8ed15088",
    fixedValue: { value: 4.896, asset: "USD" }, // todo: manta
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "4.0%",
        },
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0x594380c06552A4136E2601F89E50b3b9Ad17bd4d",
  },
  {
    strategy: "Symbiotic: Guantlet Restaked wstETH",
    start: "Feb-12-2025 04:20:47 AM UTC",
    owner: "0xBDfcdEb7d9af720E9D94b05DFffaF592020b328A",
    fixedValue: { value: 0.002515, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
      },
    ],
    boosts: [],
    externalAppURL:
      "https://app.symbiotic.fi/vault/0xc10A7f0AC6E3944F4860eE97a937C51572e3a1Da",
  },
];

const memoizedFetchETHPriceUSD = (() => {
  let cache: number | null = null;
  return async () => {
    if (cache === null) {
      cache = await fetchPriceUSD("ethereum");
    }
    return cache;
  };
})();

const memoizedFetchBTCPriceUSD = (() => {
  let cache: number | null = null;
  return async () => {
    if (cache === null) {
      cache = await fetchPriceUSD("bitcoin");
    }
    return cache;
  };
})();

const memoizedFetchENAPriceUSD = (() => {
  let cache: number | null = null;
  return async () => {
    if (cache === null) {
      cache = await fetchPriceUSD("ethena");
    }
    return cache;
  };
})();

export async function convertValue(
  fromAsset: AssetType,
  toAsset: AssetType,
  value: number
): Promise<number> {
  const ethPriceUSD = (await memoizedFetchETHPriceUSD()) as number;
  const btcPriceUSD = (await memoizedFetchBTCPriceUSD()) as number;
  const enaPriceUSD = (await memoizedFetchENAPriceUSD()) as number;

  if (fromAsset === toAsset) return value;

  // Convert source to USD first
  const valueInUSD =
    fromAsset === "USD"
      ? value
      : fromAsset === "ETH"
      ? value * ethPriceUSD
      : fromAsset === "BTC"
      ? value * btcPriceUSD
      : value * enaPriceUSD;

  // Then convert USD to target
  return toAsset === "USD"
    ? valueInUSD
    : toAsset === "ETH"
    ? valueInUSD / ethPriceUSD
    : valueInUSD / btcPriceUSD;
}

export async function fetchPriceUSD(asset: "ethereum" | "bitcoin" | "ethena") {
  const coinGeckoApiKey = process.env.COIN_GECKO_API_KEY;
  if (!coinGeckoApiKey) {
    throw new Error("no coin gecko api key");
  }

  const res = await fetch(
    `https://pro-api.coingecko.com/api/v3/simple/price?ids=${asset}&vs_currencies=usd`,
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

  return data[asset].usd;
}
