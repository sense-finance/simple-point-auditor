import { NextResponse } from "next/server";
import { Big } from "big.js";

// Adjust imports to your actual paths/types
import { CONFIG, APIS, convertValue, AssetType } from "@/app/lib";

export const maxDuration = 180;

/**
 * Example types. Adjust to your real data shapes.
 */
interface ConfigItem {
  strategy: string;
  owner: string;
  start: string | Date;
  fixedValue?: {
    asset: string;
    value: number;
  };
  points: Array<{
    type: string; // e.g. "pointsId"
    expectedPointsPerDay: {
      value: number;
      baseAsset: string;
    };
  }>;
}

interface ApiDataSource {
  getURL: (owner: string) => string;
  select: (rawResponse: any) => number | string;
}

interface ApiDefinition {
  pointsId: string;
  dataSources: ApiDataSource[];
}

interface PointsDataResult {
  strategy: string;
  pointsId: string;
  actualPoints: string;
  expectedPoints: string;
  owner: string;
  pointsBySource: Record<string, string>;
  dataSourceURLs: string[];
}

/**
 * The core function that fetches and computes all point data.
 * Returns a list of results for each (configItem, pointDef) pair.
 */
export async function getAllPointsData(): Promise<PointsDataResult[]> {
  const now = Date.now();
  const tasks: Array<Promise<PointsDataResult>> = [];

  // Cast your CONFIG and APIS to the interfaces if needed
  const typedConfig = CONFIG as ConfigItem[];
  const typedApis = APIS as ApiDefinition[];

  for (const configItem of typedConfig) {
    // days since "start"
    const daysSinceStart = new Big(
      (now - new Date(configItem.start).getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const pointDef of configItem.points) {
      // Push an immediately-executed async function => returns a Promise<PointsDataResult>
      tasks.push(
        (async (): Promise<PointsDataResult> => {
          const matchingApi = typedApis.find(
            (api) => api.pointsId === pointDef.type
          );

          let actualPoints = new Big(0);
          // We'll keep a local pointsBySource for each (configItem, pointDef)
          const pointsBySource: Record<string, string> = {};
          let dataSourceURLs: string[] = [];

          // Sum actual points from all data sources
          if (matchingApi) {
            // Collect URLs & prefill pointsBySource
            dataSourceURLs = matchingApi.dataSources.map((dataSource) => {
              const url = dataSource.getURL(configItem.owner);
              pointsBySource[url] = "0";
              return url;
            });

            // Parallel fetch from all data sources
            const parallelResults = await Promise.all(
              matchingApi.dataSources.map(async (dataSource) => {
                try {
                  const url = dataSource.getURL(configItem.owner);
                  let attempts = 0;
                  const maxAttempts = 3;
                  let lastError: unknown;

                  console.log("Fetching:", url);

                  while (attempts < maxAttempts) {
                    try {
                      const raw = await fetch(url).then((r) => r.json());
                      const points = dataSource.select(raw);
                      // Convert to Big just in case
                      const pointsAsBig = new Big(points);
                      // Update local pointsBySource for debugging
                      pointsBySource[url] = pointsAsBig.toString();
                      return pointsAsBig;
                    } catch (e) {
                      lastError = e;
                      attempts++;
                      if (attempts < maxAttempts) {
                        console.log(
                          `Retrying fetch from ${url} in ${attempts * 500}ms`
                        );
                        await new Promise((r) => setTimeout(r, attempts * 500));
                        continue;
                      }
                    }
                  }

                  // If we get here, all retries failed
                  if (
                    lastError instanceof Error &&
                    lastError.message.includes("Unexpected token '<'")
                  ) {
                    // Example: a specific error you want to detect
                    throw new Error("US region detected");
                  }
                  console.error("All fetch attempts failed:", lastError);
                  return new Big(0);
                } catch (e) {
                  if (
                    e instanceof Error &&
                    e.message.includes("Unexpected token '<'")
                  ) {
                    throw new Error("US region detected");
                  }
                  console.error(e);
                  return new Big(0);
                }
              })
            );

            // Sum all results
            actualPoints = parallelResults.reduce(
              (sum, value) => sum.plus(value),
              new Big(0)
            );
          }

          // Compute expected points = daysSinceStart * dailyRate * positionValue
          let expectedPoints = new Big(0);
          if (configItem.fixedValue) {
            const dailyRate = new Big(pointDef.expectedPointsPerDay.value);
            const positionValue = new Big(configItem.fixedValue.value);
            if (
              configItem.fixedValue.asset ===
              pointDef.expectedPointsPerDay.baseAsset
            ) {
              expectedPoints = daysSinceStart
                .times(dailyRate)
                .times(positionValue);
            } else {
              // If the fixedValue asset differs, convert it
              const positionValueInBaseAsset = await convertValue(
                configItem.fixedValue.asset as AssetType,
                pointDef.expectedPointsPerDay.baseAsset as AssetType,
                positionValue.toNumber()
              );
              expectedPoints = daysSinceStart
                .times(dailyRate)
                .times(positionValueInBaseAsset);
            }
          }

          return {
            strategy: configItem.strategy,
            pointsId: pointDef.type,
            actualPoints: actualPoints.toString(),
            expectedPoints: expectedPoints.toString(),
            owner: configItem.owner,
            pointsBySource,
            dataSourceURLs,
          };
        })()
      );
    }
  }

  // Wait for all parallel tasks
  const resultsArray = await Promise.all(tasks);
  return resultsArray;
}

export async function GET() {
  try {
    const results = await getAllPointsData();
    return NextResponse.json(results, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
