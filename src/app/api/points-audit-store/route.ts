import { neon } from "@neondatabase/serverless";
import { getAllPointsData } from "../points-audit/utils";
import { NextRequest, NextResponse } from "next/server";
import { fetchPriceUSD } from "@/app/lib";
import { ETH_CONFIG } from "@/app/config/ethStrategies";
import { HYPE_EVM_CONFIG } from "@/app/config/hypeEvmStrategies";

export const maxDuration = 180;

export async function GET(req: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const currentEthPriceUSD = await fetchPriceUSD("ethereum");

    const lastRun = await sql`
      SELECT created_at FROM points_audit_logs 
      ORDER BY created_at DESC LIMIT 1
    `;

    const force = req.nextUrl.searchParams.get("force") === "true";
    const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000 + maxDuration * 1000; // maxDuration seconds wiggle room
    if (!force && lastRun.length > 0 && new Date(lastRun[0].created_at).getTime() > fourHoursAgo) {
      console.log(
        "Skipping points-audit-store, last run was less than ~4 hours ago"
      );
      return NextResponse.json({ status: "skipped" }, { status: 200 });
    }

    const CONFIG = [...ETH_CONFIG, ...HYPE_EVM_CONFIG];
    const data = await getAllPointsData(CONFIG, {
      hyperfolioMode: "live",
    });

    for (const item of data) {
      const prevRows = await sql`
        SELECT actual_points
        FROM points_audit_logs
        WHERE strategy = ${item.strategy} AND points_id = ${item.pointsId}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const previousPoints = prevRows.length
        ? Number(prevRows[0].actual_points)
        : null;
      const nextPoints = Number(item.actualPoints);

      if (
        nextPoints === 0 &&
        previousPoints !== null &&
        previousPoints > 0
      ) {
        console.warn(
          "Skipping points log due to zero fallback",
          item.strategy,
          item.pointsId,
          { previousPoints, nextPoints }
        );
        continue;
      }

      const insertLogResult = await sql`
        INSERT INTO points_audit_logs (
          created_at, strategy, points_id,
          actual_points, expected_points, owner,
          eth_price_usd
        ) VALUES (
          ${new Date().toISOString()},
          ${item.strategy},
          ${item.pointsId},
          ${item.actualPoints},
          ${item.expectedPoints},
          ${item.owner},
          ${currentEthPriceUSD}
        )
        RETURNING id
      `;

      const logId = insertLogResult[0]?.id;

      if (!logId) {
        console.error(
          "Failed to obtain inserted log id",
          item.strategy,
          item.pointsId
        );
        continue;
      }

      for (const url of item.dataSourceURLs) {
        await sql`
          INSERT INTO points_audit_sources (
            audit_log_id, source_url, points
          ) VALUES (
            ${logId},
            ${url},
            ${item.pointsBySource[url]}
          )
        `;
      }
    }

    console.log("Stored points-audit data in postgres");
    return NextResponse.json(
      { status: "success", itemCount: data.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
