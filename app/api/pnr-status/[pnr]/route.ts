import { NextResponse } from "next/server";
import { getRailDataProvider } from "@/lib/rail-data-provider";

interface RouteParams {
  params: Promise<{ pnr: string }>;
}

/**
 * Wraps RailDataProvider.getPnrStatus — the only sanctioned way for client
 * components to reach live PNR data. Never called directly by pages.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { pnr } = await params;

  if (!/^\d{10}$/.test(pnr)) {
    return NextResponse.json(
      { success: false, error: "PNR must be exactly 10 digits." },
      { status: 400 },
    );
  }

  try {
    const provider = getRailDataProvider();
    const status = await provider.getPnrStatus(pnr);
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Couldn't fetch PNR status: ${message}` },
      { status: 502 },
    );
  }
}
