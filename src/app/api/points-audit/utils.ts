// Adjust imports to your actual paths/types
import { convertValue } from "@/app/lib";
import { APIS } from "@/app/config/apis";
import { Big } from "big.js";
import { Strategy, AssetType } from "@/app/types";

export const maxDuration = 180;

interface PointsDataResult {
  strategy: string;
  pointsId: string;
  actualPoints: string;
  expectedPoints: string;
  owner: string;
  pointsBySource: Record<string, string>;
  dataSourceURLs: string[];
  externalAppURL?: string;
}

// To always get the value, use a helper function
const getExpectedPointsPerDay = (
  start: string,
  expectedPointsPerDay: number | ((start: string) => number)
) => {
  return typeof expectedPointsPerDay === "function"
    ? expectedPointsPerDay(start)
    : expectedPointsPerDay;
};

const getActiveDays = (
  matchingApi: (typeof APIS)[number] | undefined,
  positionStart: string,
  now: number
) => {
  const end = new Date(matchingApi?.seasonEnd || now);
  const start = new Date(
    matchingApi?.seasonStart &&
    new Date(matchingApi?.seasonStart).getTime() >
      new Date(positionStart).getTime()
      ? matchingApi?.seasonStart
      : positionStart
  );
  return new Big(end.getTime() - start.getTime()).div(1000 * 60 * 60 * 24);
};

/**
 * The core function that fetches and computes all point data.
 * Returns a list of results for each (configItem, pointDef) pair.
 */
export async function getAllPointsData(
  config: Strategy[]
): Promise<PointsDataResult[]> {
  const now = Date.now();
  const tasks: Array<Promise<PointsDataResult>> = [];

  for (const configItem of config) {
    for (const pointDef of configItem.points) {
      const matchingApi = APIS.find(
        (api: any) => api.pointsId === pointDef.type
      );

      const daysActive = getActiveDays(matchingApi, configItem.start, now);

      // Push an immediately-executed async function => returns a Promise<PointsDataResult>
      tasks.push(
        (async (): Promise<PointsDataResult> => {
          let actualPoints = new Big(0);
          // We'll keep a local pointsBySource for each (configItem, pointDef)
          const pointsBySource: Record<string, string> = {};
          let dataSourceURLs: string[] = [];

          // Sum actual points from all data sources
          if (matchingApi) {
            // Collect URLs & prefill pointsBySource
            dataSourceURLs = matchingApi.dataSources.map((dataSource) => {
              const url = dataSource.getURL
                ? dataSource.getURL(configItem.owner)
                : `getData-${dataSource.select.toString().slice(0, 20)}`;
              pointsBySource[url] = "0";
              return url;
            });

            // Parallel fetch from all data sources
            const parallelResults = await Promise.all(
              matchingApi.dataSources.map(async (dataSource) => {
                try {
                  const sourceKey = dataSource.getURL
                    ? dataSource.getURL(configItem.owner)
                    : `getData-${dataSource.select.toString().slice(0, 20)}`;
                  let attempts = 0;
                  const maxAttempts = 3;
                  let lastError: unknown;

                  console.log("Fetching:", sourceKey);
                  while (attempts < maxAttempts) {
                    try {
                      let raw;

                      if (dataSource.getData) {
                        // Use getData method for custom data fetching (like Felix)
                        raw = await dataSource.getData(configItem.owner);
                      } else if (dataSource.getURL) {
                        // Use traditional URL-based fetching
                        const url = dataSource.getURL(configItem.owner);
                        const headers = dataSource.headers
                          ? dataSource.headers
                          : {};
                        const method = dataSource.method
                          ? dataSource.method
                          : "GET";
                        const body = dataSource.getBody
                          ? dataSource.getBody(
                              configItem.owner,
                              new Date(configItem.start).getTime(),
                              new Date().getTime()
                            )
                          : undefined;

                        const response = await fetch(url, {
                          method,
                          headers,
                          body,
                          cache: "no-store",
                        });

                        // Check if response is JSON or an error message
                        const text = await response.text();
                        if (!response.ok) {
                          throw new Error(`HTTP ${response.status}: ${text}`);
                        }
                        try {
                          raw = JSON.parse(text);
                        } catch (parseError) {
                          // If it's not valid JSON, log the response and throw
                          console.log("Non-JSON response:", text, parseError);
                          throw new Error(
                            `Invalid JSON response: ${text.substring(
                              0,
                              100
                            )}...`
                          );
                        }
                      } else {
                        throw new Error(
                          "DataSource must have either getURL or getData method"
                        );
                      }

                      const points = dataSource.select(raw, configItem.owner);
                      // Convert to Big just in case
                      const pointsAsBig = new Big(points || 0);
                      // Update local pointsBySource for debugging
                      pointsBySource[sourceKey] = pointsAsBig.toString();
                      return pointsAsBig;
                    } catch (e) {
                      console.log("Error fetching:", sourceKey, e);
                      lastError = e;
                      attempts++;
                      if (attempts < maxAttempts && !dataSource.catchError) {
                        console.log(
                          `Retrying fetch from ${sourceKey} in ${
                            attempts * 500
                          }ms`
                        );
                        await new Promise((r) => setTimeout(r, attempts * 500));
                        continue;
                      } else if (dataSource.catchError) {
                        console.log("Catching error for", sourceKey);
                        return new Big(0);
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
                  if (dataSource.catchError) {
                    console.log("Catching error:", e);
                    return new Big(0);
                  }
                  console.error(e);
                  return new Big(0);
                }
              })
            );

            // Sum all results
            actualPoints = parallelResults.reduce(
              (sum: Big, value: Big) => sum.plus(value),
              new Big(0)
            );
          }

          // Compute expected points = daysActive * dailyRate * positionValue
          let expectedPoints = new Big(0);
          if (configItem.fixedValue && pointDef.expectedPointsPerDay) {
            const dailyRate = new Big(
              getExpectedPointsPerDay(
                configItem.start,
                pointDef.expectedPointsPerDay.value
              )
            );
            const positionValue = new Big(configItem.fixedValue.value);
            if (
              configItem.fixedValue.asset ===
              pointDef.expectedPointsPerDay.baseAsset
            ) {
              expectedPoints = daysActive.times(dailyRate).times(positionValue);
            } else {
              // If the fixedValue asset differs, convert it
              const positionValueInBaseAsset = await convertValue(
                configItem.fixedValue.asset as AssetType,
                pointDef.expectedPointsPerDay.baseAsset as AssetType,
                positionValue.toNumber()
              );
              expectedPoints = daysActive
                .times(dailyRate)
                .times(positionValueInBaseAsset);
            }

            const baseExpectedPoints = expectedPoints;
            if (configItem.boosts) {
              for (const boost of configItem.boosts) {
                const boostStart = new Date(boost.startDate).getTime();
                const boostEnd = new Date(boost.endDate).getTime();
                const depositStart = new Date(configItem.start).getTime();

                const effectiveStart =
                  depositStart > boostStart ? depositStart : boostStart;
                const effectiveEnd = now > boostEnd ? boostEnd : now;

                const effectiveBoostDuration = new Big(
                  (effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)
                );

                expectedPoints = expectedPoints.plus(
                  baseExpectedPoints
                    .times(effectiveBoostDuration.div(daysActive))
                    .times(new Big(boost.multiplier))
                );
              }
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
            externalAppURL: configItem.externalAppURL,
          };
        })()
      );
    }
  }

  // Wait for all parallel tasks
  const resultsArray = await Promise.all(tasks);
  return resultsArray;
}
