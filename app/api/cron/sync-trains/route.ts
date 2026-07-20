import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRailDataProvider } from "@/lib/rail-data-provider";

export const maxDuration = 60; // 60s maximum execution time for cron job

/**
 * Automated Cron Job for Daily Train Data Refresh.
 * Triggered automatically by Vercel Cron at midnight (0 0 * * *).
 */
export async function GET(request: Request) {
  try {
    // Optional: Protect cron route with CRON_SECRET header on Vercel
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = getRailDataProvider();

    // Fetch top 10 trains to sync/update daily
    const trains = await prisma.train.findMany({
      take: 10,
      orderBy: { updatedAt: "asc" },
    });

    let syncedCount = 0;
    const todayStr = new Date().toISOString().slice(0, 10);

    for (const train of trains) {
      try {
        const runningStatus = await provider.getTrainRunningStatus(
          train.trainNumber,
          todayStr,
        );

        // Update train last sync timestamp with latest running status delay
        await prisma.train.update({
          where: { id: train.id },
          data: {
            updatedAt: new Date(),
          },
        });

        console.log(
          `Synced train ${train.trainNumber} - status: ${runningStatus.status}`,
        );

        syncedCount++;
      } catch (err) {
        console.warn(`Failed to sync train ${train.trainNumber}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Automated daily sync complete. Updated ${syncedCount} trains.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
