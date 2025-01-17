import { neon } from "@neondatabase/serverless";

import { getAllPointsData } from "../points-audit/route";
import { NextResponse } from "next/server";
import { fetchPriceUSD } from "@/app/lib";

export const maxDuration = 180;

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const currentEthPriceUSD = await fetchPriceUSD("ethereum");

    const lastRun = await sql`
      SELECT created_at FROM points_audit_logs 
      ORDER BY created_at DESC LIMIT 1
    `;

    const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000 + 5000; // a little wiggle room
    if (
      lastRun.length > 0 &&
      new Date(lastRun[0].created_at).getTime() > fourHoursAgo
    ) {
      console.log(
        "Skipping points-audit-store, last run was less than 4 hours ago"
      );
      return NextResponse.json({ status: "skipped" }, { status: 200 });
    }

    const data = await getAllPointsData();

    await sql.transaction((tx) => {
      // Create all queries first without executing them
      const queries = data.flatMap((item) => {
        const logQuery = tx`
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

        // Prepare source queries (will be executed after logQuery)
        const sourceQueries = item.dataSourceURLs.map(
          (url) =>
            tx`
            INSERT INTO points_audit_sources (
              audit_log_id, source_url, points
            ) VALUES (
              (SELECT id FROM points_audit_logs 
               WHERE points_id = ${item.pointsId} 
               ORDER BY created_at DESC LIMIT 1),
              ${url}, 
              ${item.pointsBySource[url]}
            )
          `
        );

        return [logQuery, ...sourceQueries];
      });

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
