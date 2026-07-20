"use server";

import { prisma } from "@/lib/prisma";
import { formatClockTime } from "@/lib/format";

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
 * Lightweight autocomplete over the Train table (5,000+ rows). Plain Prisma
 * read of static schedule data — not part of the RailDataProvider
 * abstraction, which is reserved for live/unofficial third-party data.
 *
 * Uses Train.departureTime directly (always populated, including for
 * RailRadar-imported trains that don't yet have a Stop breakdown) rather
 * than joining Stop, which keeps this query cheap at scale.
 */
export async function searchTrains(
  query: string,
  limit: number = 8,
): Promise<TrainSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const trains = await prisma.train.findMany({
    where: {
      OR: [
        { trainNumber: { contains: q, mode: "insensitive" } },
        { trainName: { contains: q, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { trainName: "asc" },
  });

  return trains.map((train) => ({
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    slug: train.slug,
    sourceStation: train.sourceStation,
    destStation: train.destStation,
    departureTime: formatClockTime(train.departureTime),
  }));
}
