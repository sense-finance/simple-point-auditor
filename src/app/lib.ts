export const POINTS_ID_ETHENA_SATS_S3 = "POINTS_ID_ETHENA_SATS_S3";
export const POINTS_ID_KARAK_S2 = "POINTS_ID_KARAK_S2";
export const POINTS_ID_SYMBIOTIC_S1 = "POINTS_ID_SYMBIOTIC_S1";
export const POINTS_ID_EIGENLAYER_S3 = "POINTS_ID_EIGENLAYER_S3";
export const POINTS_ID_EIGENPIE_S1 = "POINTS_ID_EIGENPIE_S1";
export const POINTS_ID_MELLOW_S1 = "POINTS_ID_MELLOW_S1";
export const POINTS_ID_ZIRCUIT_S3 = "POINTS_ID_ZIRCUIT_S3";
export const POINTS_ID_ETHERFI_S4 = "POINTS_ID_ETHERFI_S4";
export const POINTS_ID_VEDA_S1 = "POINTS_ID_VEDA_S1";
export const POINTS_ID_LOMBARD_LUX_S1 = "POINTS_ID_LOMBARD_LUX_S1";
export const POINTS_ID_RESOLV_S1 = "POINTS_ID_RESOLV_S1";
const MAINNET_AGETH = "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e";

const RESOLVE_BEARER_TOKEN = process.env.RESOLVE_BEARER_TOKEN;

export const APIS: Array<{
  pointsId: string;
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
              curr: { user_mellow_points: number; boost: number }
            ) => curr.user_mellow_points * curr.boost + acc,
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
          `https://app.symbiotic.al/api/v1/points/${wallet}`,
        select: (data: any) => data.totalPoints || 0,
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

export type AssetType = "USD" | "ETH" | "BTC";

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
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-1.9%",
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
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-1.9%",
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
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-0.7%",
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
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-6.9%",
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
          lastSnapshot: "2025/01/21",
          diff: "-48.5%",
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
          value: "verified",
          lastSnapshot: "2025/01/21",
          diff: "-3.1%",
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
  // The reward rate is set to 1 and boosts are used to set the appropriate multiplier by date
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
          value: "verified",
          lastSnapshot: "2025/02/07",
          diff: "-100%%",
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
      {
        name: "Initial Reward Rate",
        startDate: "Jan-01-2025 12:00:00 AM UTC",
        endDate: "Jan-31-2025 11:59:59 PM UTC",
        multiplier: 20,
      },
      {
        name: "To Maturity Reward Rate",
        startDate: "Feb-01-2025 12:00:00 AM UTC",
        endDate: "Mar-27-2025 12:00:00 AM UTC",
        multiplier: 15,
      },
    ],
    externalAppURL: "https://app.resolv.xyz/points",
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

export async function convertValue(
  fromAsset: AssetType,
  toAsset: AssetType,
  value: number
): Promise<number> {
  const ethPriceUSD = (await memoizedFetchETHPriceUSD()) as number;
  const btcPriceUSD = (await memoizedFetchBTCPriceUSD()) as number;

  if (fromAsset === toAsset) return value;

  // Convert source to USD first
  const valueInUSD =
    fromAsset === "USD"
      ? value
      : fromAsset === "ETH"
      ? value * ethPriceUSD
      : value * btcPriceUSD;

  // Then convert USD to target
  return toAsset === "USD"
    ? valueInUSD
    : toAsset === "ETH"
    ? valueInUSD / ethPriceUSD
    : valueInUSD / btcPriceUSD;
}

export async function fetchPriceUSD(asset: "ethereum" | "bitcoin") {
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
