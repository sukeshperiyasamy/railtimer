import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdSlot } from "@/components/ads/AdSlot";
import { ChartTimeCalculator } from "@/components/tools/ChartTimeCalculator";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

interface TrainPageParams {
  slug: string;
}

async function getTrain(slug: string) {
  return prisma.train.findUnique({
    where: { slug },
    include: { stops: { orderBy: { sequence: "asc" } } },
  });
}

type TrainWithStops = NonNullable<Awaited<ReturnType<typeof getTrain>>>;

export async function generateStaticParams() {
  const trains = await prisma.train.findMany({ select: { slug: true } });
  return trains.map((train) => ({ slug: train.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<TrainPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const train = await getTrain(slug);
  if (!train) return {};

  const title = `${train.trainNumber} ${train.trainName} — Route, Schedule & Current Booking Time`;
  const description = `${train.trainName} (${train.trainNumber}): ${train.sourceStation} to ${train.destStation}${
    train.departureTime ? `, departs ${train.departureTime}` : ""
  }. Full schedule, chart preparation time, and current booking countdown.`;
  const url = `${SITE_URL}/train/${train.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

function dayLabel(dayNumber: number, firstDay: number): string {
  return `Day ${dayNumber - firstDay + 1}`;
}

function describeTrain(train: TrainWithStops): string {
  const isPremium = /rajdhani|duronto|shatabdi|vande bharat/i.test(train.trainName);
  const frequency = train.runsOn.length >= 7 ? "daily" : `on ${train.runsOn.join(", ")}`;
  const intermediateStops = train.stops.slice(1, -1);
  const midStop = intermediateStops[Math.floor(intermediateStops.length / 2)];

  const overview = `${train.trainName} (${train.trainNumber}) runs ${frequency} between ${train.sourceStation} and ${train.destStation}${
    train.departureTime && train.arrivalTime
      ? `, departing at ${train.departureTime} and arriving at ${train.arrivalTime}`
      : ""
  }${train.duration ? `, covering the route in about ${train.duration}` : ""}. ${
    isPremium
      ? "As a premium, fully air-conditioned service, it typically sees strong demand, especially in the weeks before festivals and long weekends, which pushes more passengers onto the waitlist."
      : "Demand on this mail/express service varies by season, with predictable spikes around festivals, exam results, and long weekends."
  }${
    midStop
      ? ` Along the way it halts at ${midStop.stationName} (${midStop.stationCode}), among other stations, making it a practical option for travellers boarding or alighting partway through the route.`
      : ""
  }`;

  const tips = `If you're waitlisted on this train, the number that actually matters is the first chart time, not the departure time itself — that's the moment Indian Railways decides whether your ticket is confirmed or auto-cancelled. Use the calculator above, already filled in with this train's scheduled departure, to see exactly when that chart is prepared and when any released berths go back on sale through current booking, so you're checking IRCTC at the right moment instead of guessing.`;

  return `${overview} ${tips}`;
}

export default async function TrainPage({
  params,
}: {
  params: Promise<TrainPageParams>;
}) {
  const { slug } = await params;
  const train = await getTrain(slug);
  if (!train) notFound();

  const relatedTrains = await prisma.train.findMany({
    where: {
      id: { not: train.id },
      OR: [
        { sourceStation: train.sourceStation },
        { destStation: train.destStation },
        { sourceStation: train.destStation },
        { destStation: train.sourceStation },
      ],
    },
    take: 5,
  });

  const firstDay = train.stops[0]?.dayNumber ?? 1;

  const trainTripJsonLd = {
    "@context": "https://schema.org",
    "@type": "TrainTrip",
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    provider: { "@type": "Organization", name: "Indian Railways" },
    departureStation: { "@type": "TrainStation", name: train.sourceStation },
    arrivalStation: { "@type": "TrainStation", name: train.destStation },
    ...(train.departureTime ? { departureTime: train.departureTime } : {}),
    ...(train.arrivalTime ? { arrivalTime: train.arrivalTime } : {}),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trainTripJsonLd) }}
      />

      <p className="text-sm font-medium text-primary">
        {train.sourceStation} → {train.destStation}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {train.trainNumber} {train.trainName}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {train.departureTime
          ? `Departs ${train.sourceStation} at ${train.departureTime}`
          : `Departs from ${train.sourceStation}`}
        {train.arrivalTime ? ` · Arrives ${train.destStation} at ${train.arrivalTime}` : ""}
        {train.duration ? ` · ${train.duration}` : ""}
      </p>

      <div className="mt-8">
        <ChartTimeCalculator
          initialTrain={{
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            departureTime: train.departureTime,
          }}
          autoCalculate
        />
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-foreground">Route & schedule</h2>
        <div className="mt-3 rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Departure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {train.stops.map((stop) => (
                <TableRow key={stop.id}>
                  <TableCell>{dayLabel(stop.dayNumber, firstDay)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{stop.stationName}</span>{" "}
                    <span className="text-muted-foreground">({stop.stationCode})</span>
                  </TableCell>
                  <TableCell>{stop.arrivalTime ?? "—"}</TableCell>
                  <TableCell>{stop.departureTime ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">About this train</h2>
        <p className="leading-relaxed text-muted-foreground">{describeTrain(train)}</p>
      </section>

      <div className="mt-10">
        <AdSlot slot={`train-${train.trainNumber}-in-content`} format="in-content" />
      </div>

      {relatedTrains.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-foreground">Related trains</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {relatedTrains.map((related) => (
              <Link
                key={related.id}
                href={`/train/${related.slug}`}
                className="rounded-md border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <p className="font-medium text-foreground">
                  {related.trainNumber} · {related.trainName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {related.sourceStation} → {related.destStation}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
