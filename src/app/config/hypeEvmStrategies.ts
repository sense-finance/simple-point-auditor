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
  POINTS_ID_ETHENA_SATS_S4,
  POINTS_ID_ETHERFI_S5,
  POINTS_ID_RESOLV_S1,
} from "./constants";

export const HYPE_EVM_CONFIG: Strategy[] = [
  {
    strategy: "Hyperbeat: hbHype",
    start: "Jun-06-2025 3:02:03 PM UTC",
    // owner: "0xd048870caa5a3037f507583b4762a7598251a2fc", // Example whale with points
    owner: "0x49532bc64C515D6bfe061d44EE0834a996b7c684", // Actual test address
    fixedValue: { value: 0.2, asset: "HYPE" },
    points: [
      { type: POINTS_ID_HYPERBEAT_S1 },
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
  {
    strategy: "Hyperbeat: USDT",
    start: "Jun-24-2025 01:48:03 PM UTC",
    owner: "0x6a99970fbec57b3349FC2d06a6DD410BA6e5A78a",
    fixedValue: { value: 11.08, asset: "USD" },
    points: [
      { type: POINTS_ID_HYPERBEAT_S1 },
      {
        type: POINTS_ID_ETHENA_SATS_S4,
        expectedPointsPerDay: { value: 1, baseAsset: "USD" },
      },
    ],
    externalAppURL: "https://app.hyperbeat.org/vaults/usdt",
  },
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
  {
    strategy: "Hyperbeat: Hyperithm USDT0 Vault",
    start: "Jul-30-2025 04:43:34 PM UTC",
    owner: "0x3E6BE90C7f87774D97cf1c50e3c2E49c5a045652",
    fixedValue: { value: 8.62, asset: "USD" },
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }],
    externalAppURL:
      "https://app.hyperbeat.org/earn/0xe5add96840f0b908ddeb3bd144c0283ac5ca7ca0",
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
      { type: POINTS_ID_KINETIQ_S1 },
      { type: POINTS_ID_HYPERBEAT_S1 },
      { type: POINTS_ID_FELIX_S1 },
    ],
    externalAppURL: "https://app.hyperbeat.org/vaults/lsthype",
  },
  {
    strategy: "Hyperbeat: Hold beHYPE",
    start: "Jul-21-2025 04:31:42 PM UTC",
    owner: "0xdd2c151A221F3bfA2416CDb06E3Dee2aC49F70df",
    fixedValue: { value: 0.2, asset: "HYPE" },
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }],
    externalAppURL: "https://app.hyperbeat.org/staking/behype",
  },
  {
    strategy: "Hyperbeat Borrow: hbHYPE/WHYPE",
    start: "Aug-07-2025 02:26:58 AM UTC",
    owner: "0xC90780cB9aab4dc0781E2E7b5197846C2907F82B",
    fixedValue: { value: 0.5549, asset: "HYPE" }, // total collateral
    points: [
      { type: POINTS_ID_HYPERBEAT_S1 },
      { type: POINTS_ID_KINETIQ_S1 },
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
    externalAppURL:
      "https://app.hyperbeat.org/borrow/0x19e47d37453628ebf0fd18766ce6fee1b08ea46752a5da83ca0bfecb270d07e8",
  },
  {
    strategy: "Kinetiq Earn: vkHYPE",
    start: "Aug-07-2025 02:37:40 AM UTC",
    owner: "0xD857a632b829611Dc7397F87A7c6BA6821eF5A03",
    fixedValue: { value: 0.2996, asset: "HYPE" },
    points: [{ type: POINTS_ID_KINETIQ_S1 }],
    externalAppURL: "https://kinetiq.xyz/earn/kinetiq-earn",
  },
  {
    strategy: "Pendle: Hold beHYPE YTs (29 Oct 2025)",
    start: "Aug-07-2025 02:42:22 AM UTC",
    owner: "0x7f30f6a44a0096AC65b4FfC1ADA94B1051875909",
    fixedValue: { value: 8.61, asset: "HYPE" },
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }, { type: POINTS_ID_ETHERFI_S5 }],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x976fb34e06c933bdd97cb1e8b868e04442edaa8d/swap?view=yt&chain=hyperevm",
  },
  {
    strategy: "Pendle: Hold hbHYPE YTs (17 Dec 2025)",
    start: "Aug-07-2025 02:45:26 AM UTC",
    owner: "0xf43744f1153e97B47B5815F8e739b68db6F29B74",
    fixedValue: { value: 5.39, asset: "HYPE" },
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x97d985a71131afc02c320b636a268df34c6f42a4/swap?view=yt&chain=hyperevm",
  },
  {
    strategy: "Pendle: Hold hbUSDT YTs (17 Dec 2025)",
    start: "Aug-07-2025 02:48:45 AM UTC",
    owner: "0xFD069e1Cc1fdab00d903223fA982E39FC4b12C1E",
    fixedValue: { value: 186.86, asset: "USD" },
    points: [
      { type: POINTS_ID_HYPERBEAT_S1 },
      { type: POINTS_ID_ETHENA_SATS_S4 },
    ],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0xab9b8a04d21c9fb1fee7b7d219cab9e725a86b0a/swap?view=yt&chain=hyperevm",
  },
  {
    strategy: "Pendle: Hold kHYPE YTs (12 Nov 2025)",
    start: "Aug-07-2025 02:51:21 AM UTC",
    owner: "0x533dB26C8C9cBf0e01E42583Ba20585b15d80B97",
    fixedValue: { value: 11.33, asset: "HYPE" },
    points: [{ type: POINTS_ID_KINETIQ_S1 }],
    externalAppURL:
      "https://app.pendle.finance/trade/markets/0x8867d2b7adb8609c51810237ecc9a25a2f601b97/swap?view=yt&chain=hyperevm",
  },
  {
    strategy: "Hyperbeat: Hyperithm HYPE Vault",
    start: "Aug-18-2025 10:32:43 PM UTC",
    owner: "0x530356f59F19a8CFFad25f9f5BD39b2B4149AAd9",
    fixedValue: { value: 0.09, asset: "HYPE" },
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }],
    externalAppURL:
      "https://app.hyperbeat.org/morphobeat/vault/0x92B518e1cD76dD70D3E20624AEdd7D107F332Cff",
  },
  {
    strategy: "Spectra: Hold liquid HYPE YTs (29 Oct 2025)",
    start: "Sep-24-2025 12:12:39 AM UTC",
    owner: "0x2cB522c7b529CD721c5F7102Fbd21DF47869952d",
    fixedValue: { value: 2.7688, asset: "HYPE" }, // notional
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }],
    externalAppURL:
      "https://app.spectra.finance/trade-yield/hyperevm:0xb84402d5b48656e8deb39ad57d0cc3d4073e2e8e",
  },
  {
    strategy: "Spectra: Hold USDT0 YTs (17 Dec 2025)",
    start: "Sep-24-2025 08:53:52 PM UTC",
    owner: "0x5a429bd802286baebe75d2c834ad9b46346d5dde",
    fixedValue: { value: 32.20439, asset: "USD" }, // notional
    points: [
      { type: POINTS_ID_HYPERBEAT_S1 },
      { type: POINTS_ID_ETHENA_SATS_S4 },
      { type: POINTS_ID_FELIX_S1 },
      { type: POINTS_ID_RESOLV_S1 },
    ],
    externalAppURL:
      "https://app.spectra.finance/trade-yield/hyperevm:0x94b2150c358ac42d2ccc651d554fb3217cfce925",
  },
  {
    strategy: "Spectra: Hold beHYPE YTs (07 Dec 2025)",
    start: "Sep-24-2025 09:01:11 PM UTC",
    owner: "0x09f4442249d49885cdc6b2c43ae0bb8fc6946431",
    fixedValue: { value: 2.73598, asset: "HYPE" }, // notional
    points: [{ type: POINTS_ID_HYPERBEAT_S1 }],
    externalAppURL:
      "https://app.spectra.finance/trade-yield/hyperevm:0xcdc2e2a6e7756fe6ba444a4e4ffc3ccfa972dc9b",
  },
];
