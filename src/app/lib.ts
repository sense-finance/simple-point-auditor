import Big from "big.js";
import { getAddress } from "viem";

export const POINTS_ID_ETHENA_SATS_S3 = "POINTS_ID_ETHENA_SATS_S3";
export const POINTS_ID_ETHENA_SATS_S4 = "POINTS_ID_ETHENA_SATS_S4";
export const POINTS_ID_KARAK_S2 = "POINTS_ID_KARAK_S2";
export const POINTS_ID_SYMBIOTIC_S1 = "POINTS_ID_SYMBIOTIC_S1";
export const POINTS_ID_EIGENLAYER_S3 = "POINTS_ID_EIGENLAYER_S3";
export const POINTS_ID_EIGENPIE_S1 = "POINTS_ID_EIGENPIE_S1";
export const POINTS_ID_MELLOW_S1 = "POINTS_ID_MELLOW_S1";
export const POINTS_ID_MERITS_S1 = "POINTS_ID_MERITS_S1";
export const POINTS_ID_ZIRCUIT_S3 = "POINTS_ID_ZIRCUIT_S3";
export const POINTS_ID_ETHERFI_S4 = "POINTS_ID_ETHERFI_S4";
export const POINTS_ID_ETHERFI_S5 = "POINTS_ID_ETHERFI_S5";
export const POINTS_ID_VEDA_S1 = "POINTS_ID_VEDA_S1";
export const POINTS_ID_LOMBARD_LUX_S1 = "POINTS_ID_LOMBARD_LUX_S1";
export const POINTS_ID_RESOLV_S1 = "POINTS_ID_RESOLV_S1";
const MAINNET_AGETH = "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e";

export const APIS: Array<{
  pointsId: string;
  seasonEnd?: string;
  seasonStart?: string;
  dataSources: {
    getURL: (wallet: string) => string;
    select: (data: any, wallet: string) => number;
    catchError?: boolean;
    headers?: any;
  }[];
}> = [
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
          `https://app.ethena.fi/api/referral/get-referree?address=${wallet}`,
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
          `https://api.resolv.im/points/leaderboard/slice?address=${wallet}`,
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
];

export type AssetType = "USD" | "ETH" | "BTC" | "ENA" | "POND";

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
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 20, baseAsset: "USD" },
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
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
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
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 15, baseAsset: "USD" },
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
          lastSnapshot: "2025/03/10",
          diff: "156.0%",
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
          lastSnapshot: "2025/03/10",
          diff: "247.7%",
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
      {
        type: POINTS_ID_MERITS_S1,
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
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 10, baseAsset: "USD" },
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
          lastSnapshot: "2025/03/10",
          diff: "-1.5%",
        },
      },
      {
        type: POINTS_ID_MERITS_S1,
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
          lastSnapshot: "2025/03/10",
          diff: "20.6%",
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
      {
        type: POINTS_ID_MERITS_S1,
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
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
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
          value: "verified",
          lastSnapshot: "2025/03/17",
          diff: "-9.2%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
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
          value: "verified",
          lastSnapshot: "2025/03/17",
          diff: "-13.7%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
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
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 20, baseAsset: "USD" },
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
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 10, baseAsset: "USD" },
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
          lastSnapshot: "2025/03/10",
          diff: "-0.6%",
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
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 10, baseAsset: "USD" },
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
      {
        type: POINTS_ID_MERITS_S1,
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
      },
      {
        type: POINTS_ID_ZIRCUIT_S3,
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
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
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
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
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
          value: "partial",
          lastSnapshot: "2025/03/17",
          diff: "-31.5%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
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
          value: "verified",
          lastSnapshot: "2025/03/17",
          diff: "-2.9%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 10, baseAsset: "USD" },
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
          lastSnapshot: "2025/03/10",
          diff: "-4.0%",
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
        expectedPointsPerDay: { value: 3000, baseAsset: "BTC" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/17",
          diff: "-0.4%",
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
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 50, baseAsset: "USD" },
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
          value: "verified",
          lastSnapshot: "2025/03/04",
          diff: "0.3%",
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
    strategy: "Fluid: Smart Vault sUSDe-USDT/USDT Looping",
    start: "Jan-30-2025 05:27:59 AM UTC",
    owner: "0xCA6ed3BE5CDC34D11f42C319755b289EED3DDaef",
    fixedValue: { value: 6, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/17",
          diff: "-16.9%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/92",
  },
  {
    strategy: "Fluid: Smart Vault sUSDe/USDC-USDT Looping",
    start: "Jan-30-2025 05:39:23 AM UTC",
    owner: "0x60e8f1609866Ad7240Ec27935C503159bF1d488c",
    fixedValue: { value: 6, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/17",
          diff: "-14.3%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/50",
  },
  {
    strategy: "Fluid: Smart Vault eBTC-cbBTC/wBTC Looping",
    start: "Feb-27-2025 10:14:59 PM UTC",
    owner: "0xC176945679Af78f5db1E4173c84531860BBD37ee",
    fixedValue: { value: 0.0000067542, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
      },
      {
        type: POINTS_ID_ETHERFI_S4,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
      },
      {
        type: POINTS_ID_LOMBARD_LUX_S1,
        expectedPointsPerDay: { value: 2, baseAsset: "BTC" },
      },
      {
        type: POINTS_ID_VEDA_S1,
        expectedPointsPerDay: { value: 0.03, baseAsset: "USD" },
      },
      {
        type: POINTS_ID_KARAK_S2,
        expectedPointsPerDay: { value: 1.2, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/96",
  },
  {
    strategy: "Fluid: Smart Vault USDe-USDT/USDT Looping",
    start: "Jan-30-2025 05:36:59 AM UTC",
    owner: "0xFDC8184953Fda238a2367A5313D541850Ae58D8C",
    fixedValue: { value: 6, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/17",
          diff: "-5.1%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/93",
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
    strategy: "Symbiotic: Swell Restaked wBTC",
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
    strategy: "Symbiotic: MEV Capital wstETH",
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
    strategy: "Symbiotic: Gauntlet Restaked swETH",
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
    strategy: "Symbiotic: Gauntlet Restaked cbETH",
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
    strategy: "Symbiotic: Gauntlet Restaked wstETH",
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
  {
    strategy: "Mellow: Hold DVstETH",
    start: "Feb-04-2025 10:00:35 AM UTC",
    owner: "0x1a66531fc0FE9A6155dd85596B642E0B52D1210A",
    fixedValue: { value: 0.000185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "0.6%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-dvsteth",
  },
  {
    strategy: "Mellow: Hold pzETH",
    start: "Feb-04-2025 10:17:35 AM UTC",
    owner: "0xa9e537f53ACbf9fbaa8601eb542eB16345D86a72",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-16%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "partial",
          lastSnapshot: "2025/03/10",
          diff: "537.0%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-pzeth",
  },
  {
    strategy: "Mellow: Hold rsENA",
    start: "Feb-04-2025 10:17:35 AM UTC",
    owner: "0x6ac16eeAac13B57d9Ee2e507A769C952f303bedf",
    fixedValue: { value: 7.922888, asset: "ENA" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "4.8%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "4.8%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
      { type: POINTS_ID_ETHENA_SATS_S3 },
      { type: POINTS_ID_ETHENA_SATS_S4 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-rsena",
  },
  {
    strategy: "Mellow: Hold amphrBTC",
    start: "Feb-04-2025 11:30:11 AM UTC",
    owner: "0x818c0376468CDf4Fe733CbC1BA685FfCaAf68Aba",
    fixedValue: { value: 0.00005116, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-0.6%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "16.2%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-amphrbtc",
  },
  {
    strategy: "Mellow: Hold steakLRT",
    start: "Feb-04-2025 11:36:23 AM UTC",
    owner: "0x27B33F1c2962993724D0e397a443b20FA8dcd9eB",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-15.9%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/24",
          diff: "6.5%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-steaklrt",
  },
  {
    strategy: "Mellow: Hold HYVEX",
    start: "Feb-04-2025 11:48:11 AM UTC",
    owner: "0xDF1d2C86EC651A0a286eA771aD5458FFd8E59034",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-16.1%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "partial",
          lastSnapshot: "2025/03/10",
          diff: "133.6%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-hyvex",
  },
  {
    strategy: "Mellow: Hold Re7rtBTC",
    start: "Feb-13-2025 10:04:11 AM UTC",
    owner: "0xAAB87986A0ad62d35DAcFB271DB695a600591475",
    fixedValue: { value: 0.0000517588, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-0.9%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "14.0%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-re7rtbtc",
  },
  {
    strategy: "Mellow: Hold ifsETH",
    start: "Feb-04-2025 12:56:35 PM UTC",
    owner: "0x1dEdfFeb88E8c4BA56AD3Af1e1D517Db8f432592",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-16.2%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "11.2%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-ifseth",
  },
  {
    strategy: "Mellow: Hold cp0xlrt",
    start: "Feb-04-2025 01:01:47 PM UTC",
    owner: "0x8CaB78b549D95944F8422632746ba2be302E9C7A",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-16.2%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "16.2%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-cp0xlrt",
  },
  {
    strategy: "Mellow: Hold urLRT",
    start: "Feb-04-2025 01:11:47 PM UTC",
    owner: "0x56963c8E28bfb85224c90277966Fb64b55D10eFC",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-16.2%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "11.2%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-urlrt",
  },
  {
    strategy: "Mellow: Hold coETH",
    start: "Feb-04-2025 01:15:35 PM UTC",
    owner: "0x9958CC882029860DDf2059b5558d7958AE8cF20f",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-16.2%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "partial",
          lastSnapshot: "2025/03/10",
          diff: "-77.6%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-coeth",
  },
  {
    strategy: "Mellow: Hold hcETH",
    start: "Feb-04-2025 01:23:23 PM UTC",
    owner: "0xDCf75816a2aaCd4aAd5102fC27EBBA71516B6a94",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-16.1%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "11.1%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-hceth",
  },
  {
    strategy: "Mellow: Hold isETH",
    start: "Feb-05-2025 10:57:47 AM UTC",
    owner: "0xa19a209D27a229a64C85B341e9c87eD1AbbfdDB7",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-16.3%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "10.8%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-iseth",
  },
  {
    strategy: "Mellow: Hold siBTC",
    start: "Feb-05-2025 11:10:11 AM UTC",
    owner: "0x22288C456E535e0c305Eb7089Fa61630bDBf3aD3",
    fixedValue: { value: 0.00005217, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-1.3%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "partial",
          lastSnapshot: "2025/03/10",
          diff: "105.5%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-sibtc",
  },
  {
    strategy: "Mellow: Hold LugaETH",
    start: "Feb-05-2025 11:17:23 AM UTC",
    owner: "0xAF9e9FB37ccB46DEE01bd715Ec0927B861Ec13E0",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-16.2%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "10.9%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-lugaeth",
  },
  {
    strategy: "Mellow: Hold roETH",
    start: "Feb-05-2025 11:21:47 AM UTC",
    owner: "0x01f4f7E48b6362Bc8f799629c383655BFC63614c",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-16.4%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "10.8%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-roeth",
  },
  {
    strategy: "Mellow: Hold rsuniBTC",
    start: "Feb-05-2025 11:27:47 AM UTC",
    owner: "0xf897a7ce9494D4AE9F54A9a3c4433f6590835c1f",
    fixedValue: { value: 0.00005417, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/21",
          diff: "-2.3%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "delayed",
          lastSnapshot: "2025/02/21",
          diff: "-100%",
        },
      },
      { type: POINTS_ID_MERITS_S1 },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-rsunibtc",
  },
  {
    strategy: "Mellow: MEV Capital Lidov3 stVault x Kiln",
    start: "Feb-26-2025 08:51:35 PM UTC",
    owner: "0xfce536545fa0203964e9aF00d4053291e99Be62d",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/28",
          diff: "3.1%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "15.7%",
        },
      },
    ],
    externalAppURL:
      "https://app.mellow.finance/vaults/ethereum-mevcapital-lidov3-stvault-kiln",
  },
  {
    strategy: "Mellow: MEV Capital Lidov3 stVault x Nodeinfra",
    start: "Feb-26-2025 09:06:23 PM UTC",
    owner: "0x61eD7c521b340d7538196aa8EEce7Ad8eDD18AD6",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/28",
          diff: "3.7%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "15.7%",
        },
      },
    ],
    externalAppURL:
      "https://app.mellow.finance/vaults/ethereum-mevcapital-lidov3-stvault-nodeinfra",
  },
  {
    strategy: "Mellow: MEV Capital Lidov3 stVault x Blockscape",
    start: "Feb-26-2025 09:11:35 PM UTC",
    owner: "0x891a0F51922A630E6097996FB51cfdf5409cdE08",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/28",
          diff: "1.4%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "15.7%",
        },
      },
    ],
    externalAppURL:
      "https://app.mellow.finance/vaults/ethereum-mevcapital-lidov3-stvault-blockscape",
  },
  {
    strategy: "Mellow: MEV Capital Lidov3 stVault x Alchemy",
    start: "Feb-26-2025 09:15:35 PM UTC",
    owner: "0x7f6B9ef55acf7C6B590203a1607A1953c3D83b82",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/28",
          diff: "1.6%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "15.7%",
        },
      },
    ],
    externalAppURL:
      "https://app.mellow.finance/vaults/ethereum-mevcapital-lidov3-stvault-alchemy",
  },
  {
    strategy: "Mellow: A41 Vault",
    start: "Feb-26-2025 09:20:59 PM UTC",
    owner: "0x4343CdE10b142b41cF8B3a3ED6908054aE338891",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/28",
          diff: "1.8%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "16.0%",
        },
      },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-a41-vault",
  },
  {
    strategy: "Mellow: Stakefish Lido v3 Restaked ETH",
    start: "Feb-26-2025 09:28:23 PM UTC",
    owner: "0x49aF5D12D86def1ee9199478777C9Da3Aa5f0eD3",
    fixedValue: { value: 0.00185, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/28",
          diff: "2.1%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "15.9%",
        },
      },
    ],
    externalAppURL:
      "https://app.mellow.finance/vaults/ethereum-stakefish-lidov3-restaked-eth",
  },
  {
    strategy: "Mellow: Marlin POND LRT",
    start: "Feb-26-2025 09:44:23 PM UTC",
    owner: "0x09e8F3eb788f7Db92a19D066d7a7E9B363210C80",
    fixedValue: { value: 360.813, asset: "POND" },
    points: [
      {
        type: POINTS_ID_MELLOW_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/02/28",
          diff: "1.0%",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/10",
          diff: "-3.1%",
        },
      },
    ],
    externalAppURL: "https://app.mellow.finance/vaults/ethereum-rspond",
  },
  {
    strategy: "Contango: AaveV3 sUSDe/USDC",
    start: "Mar-14-2025 02:32:35 PM UTC",
    owner: "0xcdb19f51b440BBD4fe91129190A7bD416699E6F2",
    fixedValue: { value: 16.57, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "-3.5%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://app.contango.xyz/", // connect as wallet - no position page
  },
  {
    strategy: "Contango: AaveV3 sUSDe/USDT",
    start: "Mar-14-2025 02:54:23 PM UTC",
    owner: "0x5b59Df8d64aE744177CbFA85D36F771537Fce1B1",
    fixedValue: { value: 147, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "-2.9%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://app.contango.xyz/", // connect as wallet - no position page
  },
  {
    strategy: "Contango: AaveV3 sUSDe/DAI",
    start: "Mar-14-2025 03:00:35 PM UTC",
    owner: "0xB6391102fd6A23e2E78EeFAEA7be3Cf7e89d1ebf",
    fixedValue: { value: 29.34, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "-3.2%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://app.contango.xyz/", // connect as wallet - no position page
  },
  {
    strategy: "Contango: AaveV3 sUSDe/USDS",
    start: "Mar-14-2025 03:18:11 PM UTC",
    owner: "0xF7d93e424445dd965647B524589fE51810F8e78C",
    fixedValue: { value: 90.89, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "-3.1%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://app.contango.xyz/", // connect as wallet - no position page
  },
  {
    strategy: "Contango: AaveV3 weETH/ETH",
    start: "Mar-14-2025 03:25:59 PM UTC",
    owner: "0xFD8b6a712Bc3C639b88c0119ACD009F711E63815",
    fixedValue: { value: 0.084, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "0.5%",
        },
      },
    ],
    externalAppURL: "https://app.contango.xyz/", // connect as wallet - no position page
  },
  {
    strategy: "Contango: AaveV3 weETH/wstETH",
    start: "Mar-14-2025 03:28:59 PM UTC",
    owner: "0xc06994006D62fA9A02BfF2465900128f7a4A72f6",
    fixedValue: { value: 0.092, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "-1.4%",
        },
      },
    ],
    externalAppURL: "https://app.contango.xyz/", // connect as wallet - no position page
  },
  {
    strategy: "Contango: Morpho sUSDe/USDC",
    start: "Mar-14-2025 04:36:59 PM UTC",
    owner: "0xF3f04c73d1B321e59747219307ff08c28a67945E",
    fixedValue: { value: 103.37, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "-2.4%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://app.contango.xyz/", // connect as wallet - no position page
  },
  {
    strategy: "Contango: Morpho sUSDe/USDT",
    start: "Mar-14-2025 04:45:11 PM UTC",
    owner: "0xD13D8C614181bDebD03691A41353677Bc8a5d497",
    fixedValue: { value: 86, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "-2.3%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://app.contango.xyz/", // connect as wallet - no position page
  },
  {
    strategy: "Contango: Morpho sUSDe/DAI",
    start: "Mar-14-2025 04:49:11 PM UTC",
    owner: "0xA724084eC73553B1B312FB75DA43184D2065A0Fa",
    fixedValue: { value: 53.05, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S3,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "-2.2%",
        },
      },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://app.contango.xyz/", // connect as wallet - no position page
  },
  {
    strategy: "Contango: Morpho weETH/ETH",
    start: "Mar-17-2025 03:38:23 PM UTC",
    owner: "0xd5a66efea1500507970f1A8A992523ee75582209",
    fixedValue: { value: 0.078, asset: "ETH" },
    points: [
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "-5.4%",
        },
      },
    ],
    externalAppURL: "https://app.contango.xyz/", // connect as wallet - no position page
  },

  {
    strategy: "Fluid: Smart Vault sUSDe-USDT/USDC-USDT Looping",
    start: "Apr-02-2025 07:42:59 PM UTC",
    owner: "0xC2A5E04E8bEd03F5E357D850b7bD6DFe84517082",
    fixedValue: { value: 13.656, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/98",
  },
  {
    strategy: "Fluid: Smart Vault USDe-USDT/USDC-USDT Looping",
    start: "Apr-02-2025 07:49:23 PM UTC",
    owner: "0x096c5A008238735ee53a5DE8860c24bcf077C6EA",
    fixedValue: { value: 0.5, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://fluid.instadapp.io/vaults/1/99",
  },

  {
    strategy: "Pendle: Hold YT-lvlUSD-29MAY2025",
    start: "Apr-02-2025 07:51:23 PM UTC",
    owner: "0xce25894164473EA22C6CE1ff70dAF3bb50ea064a",
    fixedValue: { value: 3.73, asset: "USD" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xe45d2ce15abba3c67b9ff1e7a69225c855d3da82/swap?view=yt&py=output&chain=ethereum",
  },

  {
    strategy: "Pendle: Hold YT-EBTC-26JUN2025",
    start: "Apr-02-2025 07:53:35 PM UTC",
    owner: "0x8B2F0f3A646166dbC1f464827127e6fc4b7A67dc",
    fixedValue: { value: 0.00003885, asset: "BTC" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
      },
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
      },
      {
        type: POINTS_ID_KARAK_S2,
      },
      {
        type: POINTS_ID_LOMBARD_LUX_S1,
      },
      {
        type: POINTS_ID_VEDA_S1,
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x523f9441853467477b4dde653c554942f8e17162/swap?view=yt&py=output&chain=ethereum",
  },
  {
    strategy: "Mellow: Re7 Resolv Restaked wstUSR",
    start: "Apr-02-2025 07:57:47 PM UTC",
    owner: "0x5D1eF1a6047d80eb2FDe76e02b69FC5a91EdC2aA",
    fixedValue: { value: 3.55, asset: "USD" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
      },
      {
        type: POINTS_ID_MELLOW_S1,
      },
      {
        type: POINTS_ID_RESOLV_S1,
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xe45d2ce15abba3c67b9ff1e7a69225c855d3da82/swap?view=yt&py=output&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold sUSDe YTs (28 May 2025)",
    start: "Apr-24-2025 01:36:59 AM UTC",
    owner: "0xF3B59b655A0a3a603E4f45eB7ABca4144DAFc93e",
    fixedValue: { value: 909.66, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "1000",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xb162b764044697cf03617c2efbcb1f42e31e4766/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold sUSDe YTs (30 Jul 2025)",
    start: "Apr-24-2025 01:41:35 AM UTC",
    owner: "0x50473F085a48EBe5731fD9Cf18e66dfaD79aCbF6",
    fixedValue: { value: 397.16, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 30, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "1000",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x4339ffe2b7592dc783ed13cce310531ab366deac/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold eUSDe YTs (28 May 2025)",
    start: "Apr-24-2025 01:43:35 AM UTC",
    owner: "0x9e458e4aA6BFfdc408b5b65Ec095A4633566DB12",
    fixedValue: { value: 878.53, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 50, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "",
          diff: "",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x85667e484a32d884010cf16427d90049ccf46e97/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold USDe YTs (30 Jul 2025)",
    start: "Apr-24-2025 01:46:47 AM UTC",
    owner: "0x9D02986a34E9a8DDF2b4495727976263858F65a9",
    fixedValue: { value: 511.1, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 60, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "1000",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x9df192d13d61609d1852461c4850595e1f56e714/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold sENA (24 Sep 2025)",
    start: "Apr-24-2025 01:49:23 AM UTC",
    owner: "0x4F359c54fBE8F3Bfa26b7444Ad8bbaC2E3dDb900",
    fixedValue: { value: 281.94, asset: "USD" },
    points: [
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 40, baseAsset: "USD" },
        state: {
          value: "verified",
          lastSnapshot: "2025/03/21",
          diff: "1000",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xda57abf95a7c21eb9df08fbaada182f749f6c62f/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold lvlUSD YTs (24 Sep 2025)",
    start: "Apr-24-2025 01:51:59 AM UTC",
    owner: "0x512eC399d92cB79cfb9E34FaAFFCA58a0DDF5C9d",
    fixedValue: { value: 313.48, asset: "USD" },
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "USD" },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x461bc2ac3f80801bc11b0f20d63b73fef60c8076/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold USR YTs (28 May 2025)",
    start: "Apr-24-2025 01:54:35 AM UTC",
    owner: "0xb13Ea0cC1b203D012835E76FD44EA268B31d7ae5",
    fixedValue: { value: 1157.46, asset: "USD" },
    points: [
      {
        type: POINTS_ID_RESOLV_S1,
        expectedPointsPerDay: { value: 45, baseAsset: "USD" },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x35a18cd59a214c9e797e14b1191b700eea251f6a/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold wstUSR YTs (24 Sep 2025)",
    start: "Apr-24-2025 01:57:47 AM UTC",
    owner: "0x3Cf259Ead56656283867293F1faA6146F0991957",
    fixedValue: { value: 212.65, asset: "USD" },
    points: [
      {
        type: POINTS_ID_RESOLV_S1,
        expectedPointsPerDay: {
          value: (startDate) => {
            const initialRate = 25;
            const secondRate = 15;

            const now = new Date().getTime();
            const start = new Date(startDate).getTime();
            const initialRateEnd = new Date(
              "Apr-17-2025 11:59:59 PM UTC"
            ).getTime();
            const maturityTime = new Date(
              "Sep-24-2025 12:00:00 AM UTC"
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
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x09fa04aac9c6d1c6131352ee950cd67ecc6d4fb9/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold weETHs YTs (25 Jun 2025)",
    start: "Apr-24-2025 01:59:47 AM UTC",
    owner: "0xC8c44f6afDddd84fbB8249f696BAA64CB5fee24B",
    fixedValue: { value: 0.466, asset: "ETH" }, // .005 ETH
    points: [
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "",
          diff: "",
        },
      },
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "",
          diff: "",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xcba3b226ca62e666042cb4a1e6e4681053885f75/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold eETH YTs (25 June 2025)",
    start: "Apr-24-2025 02:01:35 AM UTC",
    owner: "0xBbf034f2f8a0ef8A0f3507a02F9a4566b186188f",
    fixedValue: { value: 0.7787, asset: "ETH" }, // .005 ETH
    points: [
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "",
          diff: "",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xf4cf59259d007a96c641b41621ab52c93b9691b1/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold weETHk YTs (25 Jun 2025)",
    start: "Apr-24-2025 02:03:47 AM UTC",
    owner: "0x5c72B23F190a59C85c4e73C132a2d7785CF8Bedd",
    fixedValue: { value: 0.5413, asset: "USD" }, // .005 ETH
    points: [
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "",
          diff: "",
        },
      },
      {
        type: POINTS_ID_KARAK_S2,
        expectedPointsPerDay: { value: 3, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "",
          diff: "",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x9e612ff1902c5feea4fd69eb236375d5299e0ffc/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold eBTC YTs (25 June 2025)",
    start: "Apr-24-2025 02:06:47 AM UTC",
    owner: "0x79090e428aab0EF89d77e57095223cD30adB907d",
    fixedValue: { value: 0.02809, asset: "BTC" }, // .005 ETH
    points: [
      {
        type: POINTS_ID_ETHERFI_S5,
        expectedPointsPerDay: { value: 30000, baseAsset: "BTC" },
        state: {
          value: "verified",
          lastSnapshot: "",
          diff: "",
        },
      },
      {
        type: POINTS_ID_SYMBIOTIC_S1,
        expectedPointsPerDay: { value: 0.006, baseAsset: "BTC" },
        state: {
          value: "verified",
          lastSnapshot: "",
          diff: "",
        },
      },
      {
        type: POINTS_ID_KARAK_S2,
        expectedPointsPerDay: { value: 3, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "",
          diff: "",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x523f9441853467477b4dde653c554942f8e17162/swap?view=yt&chain=ethereum",
  },
  {
    strategy: "Pendle: Hold agETH YTs (25 June 2025)",
    start: "Apr-24-2025 02:12:35 AM UTC",
    owner: "0xA15a58BCcdDf80A7e9474Cd1abF0c3ad5E823561",
    fixedValue: { value: 0.683, asset: "ETH" }, // .006 ETH
    points: [
      {
        type: POINTS_ID_ZIRCUIT_S3,
        expectedPointsPerDay: { value: 2, baseAsset: "ETH" },
        state: {
          value: "verified",
          lastSnapshot: "",
          diff: "",
        },
      },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xbe8549a20257917a0a9ef8911daf18190a8842a4/swap?view=yt&chain=ethereum",
  },
  // No points for the following strat yet supported
  // {
  //   strategy: "Contango: Morpho srUSD/USDC",
  //   start: "Apr-02-2025 07:52:23 PM UTC",
  //   owner: "0x4c4229964445DbBF0e626c765973A07b25DCA0Ed",
  //   fixedValue: { value: 0.5, asset: "USD" },
  //   points: [
  //   ],
  //   externalAppURL: "https://app.contango.xyz/",
  // },
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

const memoizedFetchPONDPriceUSD = (() => {
  let cache: number | null = null;
  return async () => {
    if (cache === null) {
      cache = await fetchPriceUSD("marlin");
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
  const pondPriceUSD = (await memoizedFetchPONDPriceUSD()) as number;

  if (fromAsset === toAsset) return value;

  // Convert source to USD first
  const valueInUSD =
    fromAsset === "USD"
      ? value
      : fromAsset === "ETH"
      ? value * ethPriceUSD
      : fromAsset === "BTC"
      ? value * btcPriceUSD
      : fromAsset === "ENA"
      ? value * enaPriceUSD
      : value * pondPriceUSD;

  // Then convert USD to target
  return toAsset === "USD"
    ? valueInUSD
    : toAsset === "ETH"
    ? valueInUSD / ethPriceUSD
    : valueInUSD / btcPriceUSD;
}

export async function fetchPriceUSD(
  asset: "ethereum" | "bitcoin" | "ethena" | "marlin"
) {
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
