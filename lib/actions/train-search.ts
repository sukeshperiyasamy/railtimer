"use server";

import { prisma } from "@/lib/prisma";

export interface TrainSearchResult {
  trainNumber: string;
  trainName: string;
  slug: string;
  sourceStation: string;
  destStation: string;
  /** Departure time (HH:MM) at the train's source station, if known. */
  departureTime: string | null;
}

/**
 * Lightweight autocomplete over the (currently small) Train table. Plain
 * Prisma read of static schedule data — not part of the RailDataProvider
 * abstraction, which is reserved for live/unofficial third-party data.
 */
export async function searchTrains(query: string): Promise<TrainSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const trains = await prisma.train.findMany({
    where: {
      OR: [
        { trainNumber: { contains: q, mode: "insensitive" } },
        { trainName: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 8,
    orderBy: { trainName: "asc" },
    include: {
      stops: {
        orderBy: { sequence: "asc" },
        take: 1,
      },
    },
  });

  return trains.map((train) => ({
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    slug: train.slug,
    sourceStation: train.sourceStation,
    destStation: train.destStation,
    departureTime: train.stops[0]?.departureTime ?? null,
  }));
}
