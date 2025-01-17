import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const lastRun = await sql`
    WITH latest_date AS (
      SELECT created_at 
      FROM points_audit_logs 
      ORDER BY created_at DESC 
      LIMIT 1
    )
    SELECT l.*, s.source_url, s.points as source_points
    FROM points_audit_logs l
    LEFT JOIN points_audit_sources s ON l.id = s.audit_log_id
    WHERE l.created_at = (SELECT created_at FROM latest_date)
    ORDER BY l.points_id
  `;

    const camelCased = lastRun.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      strategy: row.strategy,
      pointsId: row.points_id,
      actualPoints: row.actual_points,
      expectedPoints: row.expected_points,
      owner: row.owner,
      ethPriceUsd: row.eth_price_usd,
      sourceUrl: row.source_url,
      sourcePoints: row.source_points,
    }));

    return NextResponse.json(camelCased, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
