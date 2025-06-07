import { AssetType, Strategy } from "../types";

import {
  POINTS_ID_HYPERBEAT_S1,
  // POINTS_ID_HYPERLEND_S1,
  // POINTS_ID_HYPURRFI_S1,
  // POINTS_ID_HYPERSWAP_S1,
  // POINTS_ID_TIMESWAP_S1,
  // POINTS_ID_SILHOUETTE_S1,
  // POINTS_ID_UPSHIFT_S1,
  POINTS_ID_SENTIMENT_S1,
} from "./constants";

export const HYPE_EVM_CONFIG: Strategy[] = [
  {
    strategy: "Hyperbeat: hbHype",
    start: "Jun-06-2025 3:02:03 PM UTC",
    // owner: "0xd048870caa5a3037f507583b4762a7598251a2fc", // Example whale with points
    owner: "0x49532bc64C515D6bfe061d44EE0834a996b7c684", // Actual test address
    fixedValue: { value: 6.71, asset: "USD" }, // .2 hype
    points: [
      {
        type: POINTS_ID_HYPERBEAT_S1,
        expectedPointsPerDay: { value: 1, baseAsset: "USD" },
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
      // {
      //   type: POINTS_ID_UPSHIFT_S1,
      //   expectedPointsPerDay: { value: 5, baseAsset: "USD" },
      // },
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
        expectedPointsPerDay: { value: 1, baseAsset: "USD" },
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
        expectedPointsPerDay: { value: 1, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://app.sentiment.xyz/create-position",
  },
];
