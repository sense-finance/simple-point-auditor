import { neon } from "@neondatabase/serverless";
import { getAllPointsData } from "../points-audit/utils";
import { NextResponse } from "next/server";
import { fetchPriceUSD } from "@/app/lib";
import { ETH_CONFIG } from "@/app/config/ethStrategies";
import { HYPE_EVM_CONFIG } from "@/app/config/hypeEvmStrategies";

export const maxDuration = 180;

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const currentEthPriceUSD = await fetchPriceUSD("ethereum");

    const lastRun = await sql`
      SELECT created_at FROM points_audit_logs 
      ORDER BY created_at DESC LIMIT 1
    `;

    const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000 + maxDuration * 1000; // maxDuration seconds wiggle room
    if (
      lastRun.length > 0 &&
      new Date(lastRun[0].created_at).getTime() > fourHoursAgo
    ) {
      console.log(
        "Skipping points-audit-store, last run was less than ~4 hours ago"
      );
      return NextResponse.json({ status: "skipped" }, { status: 200 });
    }

    const CONFIG = [...ETH_CONFIG, ...HYPE_EVM_CONFIG];
    const data = await getAllPointsData(CONFIG);

    await sql.transaction((tx) => {
      const queries = [];

      for (const item of data) {
        // Insert log and capture id
        const insertLog = tx`
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
        queries.push(insertLog);

        for (const url of item.dataSourceURLs) {
          const insertSource = tx`
            INSERT INTO points_audit_sources (
              audit_log_id, source_url, points
            ) VALUES (
              (SELECT id FROM points_audit_logs WHERE strategy = ${item.strategy} AND points_id = ${item.pointsId} ORDER BY created_at DESC LIMIT 1),
              ${url}, 
              ${item.pointsBySource[url]}
            )
          `;
          queries.push(insertSource);
        }
      }

      return queries;
    });

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
