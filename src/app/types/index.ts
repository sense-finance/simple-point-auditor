export type Api = {
  pointsId: string;
  seasonEnd?: string;
  seasonStart?: string;
  dataSources: {
    getURL: (wallet: string) => string;
    method?: "GET" | "POST";
    headers?: any;
    body?: any;
    getBody?: (
      wallet: string,
      startTimestamp?: number,
      endTimestamp?: number
    ) => any;
    select: (data: any, wallet: string) => number;
    catchError?: boolean;
    singleFetch?: boolean;
  }[];
};

export type AssetType = "USD" | "ETH" | "BTC" | "ENA" | "POND" | "HYPE";

export type Strategy = {
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
};
