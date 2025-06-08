import { AssetType } from "./types";

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

const memoizedFetchHYPEPriceUSD = (() => {
  let cache: number | null = null;
  return async () => {
    if (cache === null) {
      cache = await fetchPriceUSD("hyperliquid");
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
  const hypePriceUSD = (await memoizedFetchHYPEPriceUSD()) as number;

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
      : fromAsset === "HYPE"
      ? value * hypePriceUSD
      : value * pondPriceUSD;

  // Then convert USD to target
  return toAsset === "USD"
    ? valueInUSD
    : toAsset === "ETH"
    ? valueInUSD / ethPriceUSD
    : toAsset === "HYPE"
    ? valueInUSD / hypePriceUSD
    : toAsset === "BTC"
    ? valueInUSD / btcPriceUSD
    : toAsset === "ENA"
    ? valueInUSD / enaPriceUSD
    : valueInUSD / pondPriceUSD;
}

export async function fetchPriceUSD(
  asset: "ethereum" | "bitcoin" | "ethena" | "marlin" | "hyperliquid"
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
