import { Strategy } from "../types";

import {
  POINTS_ID_HYPERBEAT_S1,
  // POINTS_ID_HYPERLEND_S1,
  // POINTS_ID_HYPURRFI_S1,
  // POINTS_ID_HYPERSWAP_S1,
  // POINTS_ID_TIMESWAP_S1,
  // POINTS_ID_SILHOUETTE_S1,
  POINTS_ID_SENTIMENT_S1,
  POINTS_ID_UPSHIFT_S2,
  POINTS_ID_FELIX_S1,
  POINTS_ID_KINETIQ_S1,
} from "./constants";

export const HYPE_EVM_CONFIG: Strategy[] = [
  {
    strategy: "Hyperbeat: hbHype",
    start: "Jun-06-2025 3:02:03 PM UTC",
    // owner: "0xd048870caa5a3037f507583b4762a7598251a2fc", // Example whale with points
    owner: "0x49532bc64C515D6bfe061d44EE0834a996b7c684", // Actual test address
    fixedValue: { value: 0.2, asset: "HYPE" },
    points: [
      {
        type: POINTS_ID_HYPERBEAT_S1,
      },
      {
        type: POINTS_ID_KINETIQ_S1,
      },
      // {
      //   type: POINTS_ID_HYPERLEND_S1,
      //   expectedPointsPerDay: { value: 1, baseAsset: "USD" },
      // },
      // {
      //   type: POINTS_ID_HYPURRFI_S1,
      //   expectedPointsPerDay: { value: 1, baseAsset: "USD" },
      // },
      // {
      //   type: POINTS_ID_HYPERSWAP_S1,
      //   expectedPointsPerDay: { value: 1, baseAsset: "USD" },
      // },
      // {
      //   type: POINTS_ID_TIMESWAP_S1,
      //   expectedPointsPerDay: { value: 1, baseAsset: "USD" },
      // },
      // {
      //   type: POINTS_ID_SILHOUETTE_S1,
      //   expectedPointsPerDay: { value: 1, baseAsset: "USD" },
      // },
      { type: POINTS_ID_UPSHIFT_S2 },
    ],
    externalAppURL: "https://app.hyperbeat.org/vaults/hype",
  },
  {
    strategy: "Sentiment: Hype",
    start: "Jun-06-2025 3:03:34 PM UTC",
    // owner: "0x11a8a48795b01f828116062e72a663ca69b71c31", // Example whale with points
    owner: "0xbCA19Ac1C4f81106c127eba56cf174AA3bFd5F6A", // Actual test address
    fixedValue: { value: 10.14, asset: "USD" }, // .3 hype
    points: [
      {
        type: POINTS_ID_SENTIMENT_S1,
      },
    ],
    externalAppURL:
      "https://app.sentiment.xyz/pools/0x2831775cb5e64b1d892853893858a261e898fbeb",
  },
  {
    strategy: "Sentiment: wstHype/wHype",
    start: "Jun-06-2025 3:24:03 PM UTC",
    // owner: "0x7527557858b4b40f9199a49ab3746179f36bd9d8", // Example whale with points
    owner: "0x689f2e7b0c957Ff5198E2C7E0f063fa3C95E195e", // Actual test address
    fixedValue: { value: 151.13, asset: "USD" }, //4.4773 wstHype
    points: [
      {
        type: POINTS_ID_SENTIMENT_S1,
      },
    ],
    externalAppURL: "https://app.sentiment.xyz/create-position",
  },
  // {
  //   strategy: "Hyperbeat: USDT",
  //   start: "Jun-24-2025 01:48:03 PM UTC",
  //   owner: "0x6a99970fbec57b3349FC2d06a6DD410BA6e5A78a",
  //   fixedValue: { value: 11.08, asset: "USD" },
  //   points: [
  //     { type: POINTS_ID_HYPERBEAT_S1 },
  //     {
  //       type: POINTS_ID_RESOLV_S1,
  //       expectedPointsPerDay: { value: 30, baseAsset: "USD" },
  //     },
  //   ],
  //   externalAppURL: "https://app.hyperbeat.org/vaults/usdt",
  // },
  {
    strategy: "Hyperbeat: Ultra UBTC",
    start: "Jun-24-2025 01:57:45 PM UTC",
    owner: "0x20cAA3c6d9eb86cdd83685a04eBBa9d68c291cb9",
    fixedValue: { value: 14.79, asset: "USD" },
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }, { type: POINTS_ID_UPSHIFT_S2 }],
    externalAppURL: "https://app.hyperbeat.org/vaults/ubtc",
  },
  {
    strategy: "Hyperbeat: XAUt",
    start: "Jun-24-2025 02:04:17 PM UTC",
    owner: "0xdF48b4cd78baCaAefc6a8e18606e035529B93c87",
    fixedValue: { value: 18.5, asset: "USD" },
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }],
    externalAppURL: "https://app.hyperbeat.org/vaults/xaut",
  },
  {
    strategy: "Hyperbeat: Gauntlet USDT0 Vault",
    start: "Jun-24-2025 2:19:58 PM UTC",
    owner: "0xf1424A4714621ed6e858f926Ab9Ea7719826f2f0",
    fixedValue: { value: 13.01, asset: "USD" },
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }],
    externalAppURL:
      "https://app.hyperbeat.org/earn/0x53a333e51e96fe288bc9add7cdc4b1ead2cd2ffa",
  },
  // {
  //   strategy: "Hyperbeat: Gauntlet USDe Core",
  //   start: "Jun-24-2025 2:27:12 PM UTC",
  //   owner: "0xE51F8F2F64F75864463472f7346867371996Fe61 ",
  //   fixedValue: { value: 15.02, asset: "USD" },
  //   points: [
  //     { type: POINTS_ID_HYPERBEAT_S1 },
  //     {
  //       type: POINTS_ID_ETHENA_SATS_S4,
  //       expectedPointsPerDay: { value: 20, baseAsset: "USD" },
  //     },
  //   ],
  //   externalAppURL:
  //     "https://app.hyperbeat.org/earn/0x5eec795d919fa97688fb9844eeb0072e6b846f9d",
  // },
  {
    strategy: "Hyperbeat: MEV Capital HYPE",
    start: "Jun-24-2025 02:40:02 PM UTC",
    owner: "0xA37e42aB27d9a9d33801B17f8371B12740A20c21",
    fixedValue: { value: 11.42, asset: "USD" },
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }],
    externalAppURL:
      "https://app.hyperbeat.org/earn/0xd19e3d00f8547f7d108abfd4bbb015486437b487",
  },
  {
    strategy: "Hyperbeat: Gauntlet uETH Vault",
    start: "Jun-24-2025 02:55:45 PM UTC",
    owner: "0xBA9acC7E43Fe1Eca640bA7ff97E120df1E8172C7",
    fixedValue: { value: 9.6, asset: "USD" },
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }],
    externalAppURL:
      "https://app.hyperbeat.org/earn/0x0571362ba5ea9784a97605f57483f865a37dbeaa",
  },

  {
    strategy: "Felix: HYPE Stability Pool",
    start: "Jul-07-2025 7:35:07 AM UTC",
    owner: "0x1FD49583571bc81B5A8a4cb74934Ad564b4D2b39",
    fixedValue: { value: 1.184, asset: "USD" },
    points: [
      {
        type: POINTS_ID_FELIX_S1,
      },
    ],
    externalAppURL: "https://www.usefelix.xyz/earn",
  },
  {
    strategy: "Felix: UBTC Stability Pool",
    start: "Jul-07-2025 7:40:26 AM UTC",
    owner: "0x50e10C68114dCA01b64510B0777Ec401074206a6",
    fixedValue: { value: 1.184, asset: "USD" },
    points: [
      {
        type: POINTS_ID_FELIX_S1,
      },
    ],
    externalAppURL: "https://www.usefelix.xyz/earn",
  },
  {
    strategy: "Felix: USDe lending",
    start: "Jul-07-2025 7:43:49 AM UTC",
    owner: "0xAf09cbf02D0c40251d2720449CBe0777ca79F0C6",
    fixedValue: { value: 1.19, asset: "USD" },
    points: [
      {
        type: POINTS_ID_FELIX_S1,
      },
    ],
    externalAppURL: "https://www.usefelix.xyz/vanilla-earn",
  },
  {
    strategy: "Felix: USDT0 lending",
    start: "Jul-07-2025 7:45:59 AM UTC",
    owner: "0x0435952a9cEe1130EE6D4658eb1f712614Da3E40",
    fixedValue: { value: 1.19, asset: "USD" },
    points: [
      {
        type: POINTS_ID_FELIX_S1,
      },
    ],
    externalAppURL: "https://www.usefelix.xyz/vanilla-earn",
  },
  {
    strategy: "Felix: USDhl lending",
    start: "Jul-07-2025 7:48:41 AM UTC",
    owner: "0x18eF394afFe7ACcf3553891E8EB0b8cc303D090D",
    fixedValue: { value: 1.19, asset: "USD" },
    points: [
      {
        type: POINTS_ID_FELIX_S1,
      },
    ],
    externalAppURL: "https://www.usefelix.xyz/vanilla-earn",
  },
  {
    strategy: "Kinetiq: Hold kHYPE",
    start: "Jul-16-2025 04:52:21 PM UTC",
    owner: "0xc2ac06f12abb6e093d38cc7d09d74c03d5d15d19",
    fixedValue: { value: 0.05, asset: "HYPE" },
    points: [
      {
        type: POINTS_ID_KINETIQ_S1,
      },
    ],
    externalAppURL: "https://kinetiq.xyz/stake",
  },
  {
    strategy: "Hyperbeat: Hold lstHYPE",
    start: "Jul-16-2025 04:59:34 PM UTC",
    owner: "0xe37b6889bffe562d855cf7bede75e5f6f2239bff",
    fixedValue: { value: 0.0398, asset: "HYPE" },
    points: [
      {
        type: POINTS_ID_KINETIQ_S1,
      },
      {
        type: POINTS_ID_HYPERBEAT_S1,
      },
      {
        type: POINTS_ID_FELIX_S1,
      },
    ],
    externalAppURL: "https://app.hyperbeat.org/vaults/lsthype",
  },
];
