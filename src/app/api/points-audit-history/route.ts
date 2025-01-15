import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const history = await sql`
      SELECT 
        strategy,
        points_id,
        actual_points,
        created_at
      FROM points_audit_logs
      ORDER BY strategy, points_id, created_at DESC
    `;

    // Group by strategy-pointsId combination
    const grouped = history.reduce((acc: Record<string, any[]>, row) => {
      const key = `${row.strategy}-${row.points_id}`;
      if (!acc[key]) acc[key] = [];
      console.log("created_at", row.created_at);
      acc[key].push({
        actualPoints: row.actual_points,
        created_at: row.created_at,
      });
      return acc;
    }, {});

    return NextResponse.json(grouped, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
