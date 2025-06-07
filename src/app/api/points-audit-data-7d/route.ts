import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { convertValue } from "@/app/lib";
import { AssetType } from "@/app/types";
import { ETH_CONFIG } from "@/app/config/ethStrategies";
import { HYPE_EVM_CONFIG } from "@/app/config/hypeEvmStrategies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const strategyParam = searchParams.get("strategy");
  if (!strategyParam) {
    return NextResponse.json(
      { error: "Strategy parameter is required" },
      { status: 400 }
    );
  }

  // Allow comma-separated list of strategies.
  const requestedStrategies = strategyParam.split(",").map((s) => s.trim());

  const CONFIG = [...ETH_CONFIG, ...HYPE_EVM_CONFIG];
  const selectedConfigs = CONFIG.filter((s) =>
    requestedStrategies
      .map((s) => s.toLowerCase())
      .includes(s.strategy.toLowerCase())
  );
  if (selectedConfigs.length === 0) {
    return NextResponse.json(
      { error: "No valid strategies found" },
      { status: 404 }
    );
  }

  const sql = neon(process.env.DATABASE_URL!);
  const overallResults: {
    strategy: string;
    pointsMetrics: {
      [key: string]: {
        realizedTotalGrowth: number;
        realizedPointsPerDay: number;
        totalExpectedPoints: number | null;
        expectedPointsPerDay: number | null;
        percentageDiff: number | null;
        daysOfData: number;
      };
    };
  }[] = [];

  for (const strategyConfig of selectedConfigs) {
    const pointsMetrics: {
      [key: string]: {
        realizedTotalGrowth: number;
        realizedPointsPerDay: number;
        realizedPointsPerDollarPerDay: number;
        totalExpectedPoints: number | null;
        expectedPointsPerDay: number | null;
        percentageDiff: number | null;
        daysOfData: number;
      };
    } = {};

    for (const pointsConfig of strategyConfig.points) {
      const pointsId = pointsConfig.type;

      if (!strategyConfig.fixedValue) {
        console.error(
          `No fixed value found for strategy ${strategyConfig.strategy}`
        );
        pointsMetrics[pointsId] = {
          realizedTotalGrowth: 0,
          realizedPointsPerDay: 0,
          realizedPointsPerDollarPerDay: 0,
          totalExpectedPoints: 0,
          expectedPointsPerDay: 0,
          percentageDiff: 0,
          daysOfData: 0,
        };
        continue;
      }

      // First, get the most recent log to determine an approximate "current" time.
      const latestLogRows = await sql`
         SELECT points_id, actual_points, created_at
         FROM points_audit_logs
         WHERE strategy = ${strategyConfig.strategy} AND points_id = ${pointsId}
         ORDER BY created_at DESC
         LIMIT 1;
      `;
      const latestLog = latestLogRows[0];

      if (!latestLog) {
        pointsMetrics[pointsId] = {
          realizedTotalGrowth: 0,
          realizedPointsPerDay: 0,
          realizedPointsPerDollarPerDay: 0,
          totalExpectedPoints: 0,
          expectedPointsPerDay: 0,
          percentageDiff: 0,
          daysOfData: 0,
        };
        continue;
      }
      const latestLogTime = new Date(latestLog.created_at).getTime();

      // Fetch logs from an extended window (e.g. 8 days back) to capture potential update events.
      const extendedWindowStart = new Date(
        latestLogTime - 8 * 24 * 60 * 60 * 1000
      ).toISOString();
      const logsRows = await sql`
         SELECT points_id, actual_points, created_at
         FROM points_audit_logs
         WHERE strategy = ${strategyConfig.strategy} AND points_id = ${pointsId}
           AND created_at >= ${extendedWindowStart}
         ORDER BY created_at ASC
      `;

      // Deduplicate consecutive logs (ignoring repeated identical actual_points).
      const dedupedLogs = [];
      for (const row of logsRows) {
        if (
          dedupedLogs.length === 0 ||
          dedupedLogs[dedupedLogs.length - 1].actual_points !==
            row.actual_points
        ) {
          if (Number(row.actual_points) !== 0) {
            dedupedLogs.push(row);
          }
        }
      }

      if (dedupedLogs.length === 0) {
        pointsMetrics[pointsId] = {
          realizedTotalGrowth: 0,
          realizedPointsPerDay: 0,
          realizedPointsPerDollarPerDay: 0,
          totalExpectedPoints: 0,
          expectedPointsPerDay: 0,
          percentageDiff: 0,
          daysOfData: 0,
        };
        continue;
      }

      // Use the last (i.e. most recent) deduped log as the effective end update.
      const effectiveEndLog = dedupedLogs[dedupedLogs.length - 1];
      const effectiveEndTime = new Date(effectiveEndLog.created_at).getTime();

      // Define the desired start time as 7 days prior to the effective end.
      const desiredStartMillis = effectiveEndTime - 7 * 24 * 60 * 60 * 1000;
      let chosenStartLog = dedupedLogs.reduce((closest: any, current: any) => {
        const currentTime = new Date(current.created_at).getTime();
        const closestTime = closest
          ? new Date(closest.created_at).getTime()
          : null;

        // If we don't have a closest yet, or if this entry is closer to the desired start time
        if (
          !closest ||
          (closestTime !== null &&
            Math.abs(currentTime - desiredStartMillis) <
              Math.abs(closestTime - desiredStartMillis))
        ) {
          return current;
        }
        return closest;
      }, null);

      const startTime = new Date(chosenStartLog.created_at).getTime();
      const daysDifference =
        (effectiveEndTime - startTime) / (1000 * 60 * 60 * 24);
      const realizedTotalGrowth =
        Number(effectiveEndLog.actual_points) -
        Number(chosenStartLog.actual_points);

      const realizedPointsPerDay =
        daysDifference > 0 ? realizedTotalGrowth / daysDifference : 0;

      // Get expected points per day from config
      let expectedPointsPerDay = null;
      let totalExpectedPoints = null;
      let percentageDiff = null;
      if (pointsConfig.expectedPointsPerDay) {
        expectedPointsPerDay =
          typeof pointsConfig.expectedPointsPerDay.value === "function"
            ? pointsConfig.expectedPointsPerDay.value(strategyConfig.start)
            : pointsConfig.expectedPointsPerDay.value;

        // Convert if necessary so types match and then normalize by the fixed value.
        if (
          pointsConfig.expectedPointsPerDay.baseAsset !==
          strategyConfig.fixedValue.asset
        ) {
          expectedPointsPerDay = await convertValue(
            strategyConfig.fixedValue.asset as AssetType,
            pointsConfig.expectedPointsPerDay.baseAsset as AssetType,
            expectedPointsPerDay
          );
        }

        expectedPointsPerDay =
          expectedPointsPerDay * strategyConfig.fixedValue.value;

        // Compute total expected points over this period.
        totalExpectedPoints = expectedPointsPerDay * daysDifference;
        // Calculate the percentage difference based on daily values.
        percentageDiff =
          expectedPointsPerDay > 0
            ? ((realizedPointsPerDay - expectedPointsPerDay) /
                expectedPointsPerDay) *
              100
            : 0;
      }

      const positionValueUSD = await convertValue(
        strategyConfig.fixedValue.asset as AssetType,
        "USD",
        strategyConfig.fixedValue.value
      );

      pointsMetrics[pointsId] = {
        realizedTotalGrowth: Number(realizedTotalGrowth.toFixed(6)),
        realizedPointsPerDay: Number(realizedPointsPerDay.toFixed(6)),
        realizedPointsPerDollarPerDay: Number(
          (realizedPointsPerDay / positionValueUSD).toFixed(6)
        ),
        totalExpectedPoints: totalExpectedPoints
          ? Number(totalExpectedPoints.toFixed(6))
          : null,
        expectedPointsPerDay: expectedPointsPerDay
          ? Number(expectedPointsPerDay.toFixed(6))
          : null,
        percentageDiff: percentageDiff
          ? Number(percentageDiff.toFixed(2))
          : null,
        daysOfData: Number(daysDifference.toFixed(2)),
      };
    }

    overallResults.push({
      strategy: strategyConfig.strategy,
      pointsMetrics,
    });
  }

  return NextResponse.json({ strategies: overallResults });
}
