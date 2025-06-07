import { NextResponse } from "next/server";
import { getAllPointsData } from "../utils";
import { ETH_CONFIG } from "@/app/config/ethStrategies";
import { HYPE_EVM_CONFIG } from "@/app/config/hypeEvmStrategies";

export const maxDuration = 180;

export async function GET(
  request: Request,
  { params }: { params: { network: string } }
) {
  try {
    const { network } = await params;
    let config;

    switch (network) {
      case "ethereum":
        config = ETH_CONFIG;
        break;
      case "hypeEVM":
        config = HYPE_EVM_CONFIG;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid network parameter" },
          { status: 400 }
        );
    }

    const results = await getAllPointsData(config);
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
