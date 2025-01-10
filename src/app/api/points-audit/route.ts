import { NextResponse } from "next/server";
import { Big } from "big.js";

import { CONFIG, APIS, convertValue } from "@/app/lib";

export const maxDuration = 120;

export async function GET(request: Request) {
  const now = Date.now();
  const results = [];
  const pointsBySource: Record<string, string> = {};

  for (const configItem of CONFIG) {
    // days since "start"
    const daysSinceStart = new Big(
      (now - new Date(configItem.start).getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const pointDef of configItem.points) {
      const matchingApi = APIS.find((api) => api.pointsId === pointDef.type);
      let actualPoints = new Big(0);
      let dataSourceURLs: string[] = [];

      // Sum actual points from all data sources
      if (matchingApi) {
        // Build up the data source URLs and initialize pointsBySource tracking
        dataSourceURLs = matchingApi.dataSources.map((dataSource) => {
          const url = dataSource.getURL(configItem.owner);
          pointsBySource[url] = "0";
          return url;
        });

        // Process in batches
        const batchSize = 20;
        for (let i = 0; i < matchingApi.dataSources.length; i += batchSize) {
          const batch = matchingApi.dataSources.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(async (dataSource) => {
              try {
                const url = dataSource.getURL(configItem.owner);
                const raw = await fetch(url).then((r) => r.json());
                const points = dataSource.select(raw);
                pointsBySource[url] = new Big(points).toString();
                return points;
              } catch (e) {
                if (
                  e instanceof Error &&
                  e.message.includes("Unexpected token '<'")
                ) {
                  throw new Error("US region detected");
                }
                console.error(e);
                return 0;
              }
            })
          );

          // Sum the batch results
          results.forEach((value) => {
            actualPoints = actualPoints.plus(new Big(value));
          });
        }
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
          expectedPoints = daysSinceStart.times(dailyRate).times(positionValue);
        } else {
          const positionValueInBaseAsset = await convertValue(
            configItem.fixedValue.asset,
            pointDef.expectedPointsPerDay.baseAsset,
            positionValue.toNumber()
          );
          expectedPoints = daysSinceStart
            .times(dailyRate)
            .times(positionValueInBaseAsset);
        }
      }

      results.push({
        strategy: configItem.strategy,
        pointsId: pointDef.type,
        actualPoints: actualPoints.toString(),
        expectedPoints: expectedPoints.toString(),
        owner: configItem.owner,
        pointsBySource,
        dataSourceURLs,
      });
    }
  }

  return NextResponse.json(results, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3600",
    },
  });
}
