import { NextResponse } from "next/server";

// Adjust imports to your actual paths/types
import { getAllPointsData } from "./utils";
export const maxDuration = 180;

export async function GET() {
  try {
    const results = await getAllPointsData();
    return NextResponse.json(results, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
