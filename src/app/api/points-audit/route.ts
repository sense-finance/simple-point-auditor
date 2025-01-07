import { NextResponse } from "next/server";
import { Big } from "big.js";

import { CONFIG, APIS, convertValue } from "@/app/lib";

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
        for (const dataSource of matchingApi.dataSources) {
          const url = dataSource.getURL(configItem.owner);
          const raw = await fetch(url).then((r) => r.json());
          const value = dataSource.select(raw); // could be a number or string
          actualPoints = actualPoints.plus(new Big(value));
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
