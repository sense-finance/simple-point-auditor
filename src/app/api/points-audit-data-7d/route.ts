import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { convertValue } from "@/app/lib";
import { AssetType } from "@/app/types";
import { ETH_CONFIG } from "@/app/config/ethStrategies";
import { HYPE_EVM_CONFIG } from "@/app/config/hypeEvmStrategies";

// Constants for window calculation
const STALE_DAYS_THRESHOLD = 14; // Mark windows as stale if older than this many days

type WindowType = "weekly_step" | "seven_day_window" | "fallback" | "insufficient" | "stale";

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
        windowType: WindowType;
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
        windowType: string;
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
          windowType: "insufficient",
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
          windowType: "insufficient",
        };
        continue;
      }
      const latestLogTime = new Date(latestLog.created_at).getTime();

      // Fetch logs from a longer window (e.g. 21 days back) to capture weekly updates,
      // plus grab the latest log PRIOR to the window to provide a baseline if needed.
      const extendedWindowStart = new Date(
        latestLogTime - 21 * 24 * 60 * 60 * 1000
      ).toISOString();
      const logsAfterStart = await sql`
         SELECT points_id, actual_points, created_at
         FROM points_audit_logs
         WHERE strategy = ${strategyConfig.strategy} AND points_id = ${pointsId}
           AND created_at >= ${extendedWindowStart}
         ORDER BY created_at ASC
      `;
      const priorBaseline = await sql`
         SELECT points_id, actual_points, created_at
         FROM points_audit_logs
         WHERE strategy = ${strategyConfig.strategy} AND points_id = ${pointsId}
           AND created_at < ${extendedWindowStart}
         ORDER BY created_at DESC
         LIMIT 1
      `;
      const logsRows =
        priorBaseline.length > 0
          ? [...priorBaseline.reverse(), ...logsAfterStart]
          : logsAfterStart;

      // Deduplicate consecutive logs (ignoring repeated identical actual_points).
      const dedupedLogs = [] as typeof logsRows;
      for (const row of logsRows) {
        // Keep first row as baseline even if zero; thereafter, drop consecutive duplicates.
        if (
          dedupedLogs.length === 0 ||
          dedupedLogs[dedupedLogs.length - 1].actual_points !==
            row.actual_points
        ) {
          dedupedLogs.push(row);
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
          windowType: "insufficient",
        };
        continue;
      }

      // Use the last (i.e., most recent) deduped log as the effective end update.
      // Remove single-zero glitches between near-equal neighbors.
      const cleanedLogs = (() => {
        if (dedupedLogs.length < 3) return dedupedLogs;
        const out: typeof dedupedLogs = [];
        for (let i = 0; i < dedupedLogs.length; i++) {
          const curr = dedupedLogs[i];
          const currVal = Number(curr.actual_points);
          if (i > 0 && i < dedupedLogs.length - 1 && currVal === 0) {
            const prev = dedupedLogs[i - 1];
            const next = dedupedLogs[i + 1];
            const prevVal = Number(prev.actual_points);
            const nextVal = Number(next.actual_points);
            const bothPositive = prevVal > 0 && nextVal > 0;
            const relDiff =
              Math.abs(prevVal - nextVal) / Math.max(prevVal, nextVal);
            if (bothPositive && relDiff <= 0.1) {
              // skip this glitchy zero
              continue;
            }
          }
          out.push(curr);
        }
        return out.length > 0 ? out : dedupedLogs;
      })();

      if (strategyConfig.strategy.includes("Hyperbeat")) {
        console.log(
          "[points-audit-7d:logs]",
          strategyConfig.strategy,
          pointsId,
          cleanedLogs.map((log) => ({
            created_at: log.created_at,
            actual_points: Number(log.actual_points),
          }))
        );
      }

      const effectiveEndLog = cleanedLogs[cleanedLogs.length - 1];
      const effectiveEndTime = new Date(effectiveEndLog.created_at).getTime();

      // Helper to compute days between two timestamps
      const daysBetween = (endMs: number, startMs: number) =>
        (endMs - startMs) / (1000 * 60 * 60 * 24);

      // Week-aware window selection:
      // 1) Prefer the most recent adjacent pair whose spacing is ~1 week (5-9 days)
      // 2) Otherwise, pick the adjacent pair whose spacing is closest to 7 days
      // 3) Fallback: approximate 7-day window using the log closest to (end - 7 days)
      let chosenStartLog: any = null;
      let chosenEndLog: any = effectiveEndLog;
      let windowType: WindowType = "fallback";

      if (cleanedLogs.length >= 2) {
        // Search from the end for a ~weekly pair.
        let weeklyPairIdx: number | null = null;
        for (let i = cleanedLogs.length - 1; i >= 1; i--) {
          const a = cleanedLogs[i - 1];
          const b = cleanedLogs[i];
          const d = daysBetween(
            new Date(b.created_at).getTime(),
            new Date(a.created_at).getTime()
          );
          // Treat 5–14 days as a weekly-style step to account for anomalies (e.g., 11-day gap)
          if (d >= 5 && d <= 14) {
            weeklyPairIdx = i;
            break;
          }
        }

        if (weeklyPairIdx !== null) {
          chosenStartLog = cleanedLogs[weeklyPairIdx - 1];
          chosenEndLog = cleanedLogs[weeklyPairIdx];
          windowType = "weekly_step";
        } else {
          // No ~weekly pair; approximate a 7-day window using the log closest to (end - 7 days).
          const desiredStartMillis = effectiveEndTime - 7 * 24 * 60 * 60 * 1000;
          chosenStartLog = cleanedLogs.reduce((closest: any, current: any) => {
            const currentTime = new Date(current.created_at).getTime();
            const closestTime = closest
              ? new Date(closest.created_at).getTime()
              : null;
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
          chosenEndLog = effectiveEndLog;
          windowType = "seven_day_window";
        }
      }

      if (!chosenStartLog) {
        // Fallback: pick the log closest to (end - 7 days)
        const desiredStartMillis = effectiveEndTime - 7 * 24 * 60 * 60 * 1000;
        chosenStartLog = cleanedLogs.reduce((closest: any, current: any) => {
          const currentTime = new Date(current.created_at).getTime();
          const closestTime = closest
            ? new Date(closest.created_at).getTime()
            : null;
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
        windowType = "fallback";
      }

      const startTime = new Date(chosenStartLog.created_at).getTime();
      const endTime = new Date(chosenEndLog.created_at).getTime();
      const daysDifference = daysBetween(endTime, startTime);

      // Check if the chosen window is stale (14+ days old relative to now)
      const nowMillis = Date.now();
      const staleDays = (nowMillis - endTime) / (1000 * 60 * 60 * 24);
      if (staleDays >= STALE_DAYS_THRESHOLD) {
        pointsMetrics[pointsId] = {
          realizedTotalGrowth: 0,
          realizedPointsPerDay: 0,
          realizedPointsPerDollarPerDay: 0,
          totalExpectedPoints: null,
          expectedPointsPerDay: null,
          percentageDiff: null,
          daysOfData: 0,
          windowType: "stale",
        };
        console.log(
          "[points-audit-7d]",
          strategyConfig.strategy,
          pointsId,
          {
            message: "Window is stale, returning zero rate",
            staleDays: Number(staleDays.toFixed(2)),
            windowEndTime: new Date(endTime).toISOString(),
            now: new Date(nowMillis).toISOString(),
          }
        );
        continue;
      }

      const realizedTotalGrowth =
        Number(chosenEndLog.actual_points) -
        Number(chosenStartLog.actual_points);

      const realizedPointsPerDay =
        daysDifference > 0 ? realizedTotalGrowth / daysDifference : 0;

      // Get expected points per day from config
      let expectedPointsPerDay: number | null = null;
      let totalExpectedPoints: number | null = null;
      let percentageDiff: number | null = null;
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
        totalExpectedPoints:
          totalExpectedPoints !== null
            ? Number(totalExpectedPoints.toFixed(6))
            : null,
        expectedPointsPerDay:
          expectedPointsPerDay !== null
            ? Number(expectedPointsPerDay.toFixed(6))
            : null,
        percentageDiff:
          percentageDiff !== null ? Number(percentageDiff.toFixed(2)) : null,
        daysOfData: Number(daysDifference.toFixed(2)),
        windowType,
      };

      console.log(
        "[points-audit-7d]",
        strategyConfig.strategy,
        pointsId,
        {
          fixedValue: strategyConfig.fixedValue,
          daysDifference: Number(daysDifference.toFixed(4)),
          realizedTotalGrowth: Number(realizedTotalGrowth.toFixed(6)),
          realizedPointsPerDay: Number(realizedPointsPerDay.toFixed(6)),
          positionValueUSD: Number(positionValueUSD.toFixed(6)),
          realizedPointsPerDollarPerDay: Number(
            (realizedPointsPerDay / positionValueUSD).toFixed(6)
          ),
          windowType,
          logsCount: cleanedLogs.length,
        }
      );
    }

    overallResults.push({
      strategy: strategyConfig.strategy,
      pointsMetrics,
    });
  }

  return NextResponse.json({ strategies: overallResults });
}
