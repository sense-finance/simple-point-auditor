import { NextResponse } from "next/server";
import { Big } from "big.js";

import { CONFIG, APIS, convertValue } from "@/app/lib";

export const maxDuration = 120;

export async function GET() {
  const now = Date.now();
  const results = [];

  for (const configItem of CONFIG) {
    // days since "start"
    const daysSinceStart = new Big(
      (now - new Date(configItem.start).getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const pointDef of configItem.points) {
      const matchingApi = APIS.find((api) => api.pointsId === pointDef.type);
      let actualPoints = new Big(0);

      // Sum actual points from all data sources
      if (matchingApi) {
        // Process in batches of 5
        const batchSize = 7;
        for (let i = 0; i < matchingApi.dataSources.length; i += batchSize) {
          const batch = matchingApi.dataSources.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(async (dataSource) => {
              try {
                const url = dataSource.getURL(configItem.owner);
                const raw = await fetch(url).then((r) => r.json());
                return dataSource.select(raw);
              } catch (e) {
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
