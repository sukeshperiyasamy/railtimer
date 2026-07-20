import { NextResponse } from "next/server";
import { getRailDataProvider } from "@/lib/rail-data-provider";

interface RouteParams {
  params: Promise<{ trainNumber: string }>;
}

function todayIST(): string {
  // IST is UTC+5:30, no DST — offsetting a UTC timestamp is sufficient.
  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

/**
 * Wraps RailDataProvider.getTrainRunningStatus — the only sanctioned way
 * for client components to reach live train-status data. Never called
 * directly by pages/components.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { trainNumber } = await params;

  if (!/^\d{3,5}$/.test(trainNumber)) {
    return NextResponse.json(
      { success: false, error: "Train number must be 3-5 digits." },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || todayIST();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { success: false, error: "date must be in YYYY-MM-DD format." },
      { status: 400 },
    );
  }

  try {
    const provider = getRailDataProvider();
    const status = await provider.getTrainRunningStatus(trainNumber, date);
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Couldn't fetch running status: ${message}` },
      { status: 502 },
    );
  }
}
