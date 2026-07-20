import type { Metadata } from "next";
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
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { RouteTimeline } from "@/components/train/RouteTimeline";
import { LinkCardGrid } from "@/components/shared/LinkCardGrid";
import { ChartTimeCalculator } from "@/components/tools/ChartTimeCalculator";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { buildTrainFaqs } from "@/lib/train-faq";
import { TOOLS } from "@/lib/tools-directory";

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
  const trains = await prisma.train.findMany({
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
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

  const title = `${train.trainNumber} ${train.trainName} Current Booking Time`;
  const description = `Know when Current Booking opens for ${train.trainNumber} ${train.trainName}. See chart preparation time, countdown, train details and booking rules.`;
  const url = `${SITE_URL}/train/${train.slug}`;
  const keywords = [
    `${train.trainNumber} current booking time`,
    `${train.trainNumber} chart preparation`,
    `${train.trainName} current booking`,
    `${train.trainNumber} running status`,
    "current booking calculator",
    "chart preparation time",
  ];

  return {
    title,
    description,
    keywords,
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

function formatRunningDays(runsOn: string[]): string {
  return runsOn.length >= 7 ? "Daily" : runsOn.join(", ");
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

  const [relatedTrains, recentPosts] = await Promise.all([
    prisma.train.findMany({
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
    }),
    prisma.blogPost.findMany({
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  const firstDay = train.stops[0]?.dayNumber ?? 1;
  const faqs = buildTrainFaqs(train);

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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trainTripJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Trains", href: "/" },
          { label: `${train.trainNumber} ${train.trainName}` },
        ]}
      />

      <p className="mt-3 text-sm font-medium text-primary">
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
        {train.duration ? ` · ${train.duration}` : ""} · Runs {formatRunningDays(train.runsOn)}
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
        <h2 className="text-2xl font-semibold text-foreground">Train route</h2>
        <div className="mt-4 rounded-md border border-border p-4">
          <RouteTimeline
            stops={train.stops.map((stop) => ({
              stationCode: stop.stationCode,
              stationName: stop.stationName,
              time: stop.departureTime ?? stop.arrivalTime,
            }))}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-foreground">Train information</h2>
        <div className="mt-3 overflow-hidden rounded-md border border-border">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-foreground">Train number</TableCell>
                <TableCell>{train.trainNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Name</TableCell>
                <TableCell>{train.trainName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">From</TableCell>
                <TableCell>{train.sourceStation}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">To</TableCell>
                <TableCell>{train.destStation}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Departure</TableCell>
                <TableCell>{train.departureTime ?? "—"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Arrival</TableCell>
                <TableCell>{train.arrivalTime ?? "—"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Duration</TableCell>
                <TableCell>{train.duration ?? "—"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Running days</TableCell>
                <TableCell>{formatRunningDays(train.runsOn)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-foreground">Full schedule</h2>
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

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-foreground">Frequently asked questions</h2>
        <div className="mt-3 divide-y divide-border rounded-md border border-border">
          {faqs.map((faq) => (
            <details key={faq.question} className="group p-4">
              <summary className="cursor-pointer list-none font-medium text-foreground [&::-webkit-details-marker]:hidden">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <LinkCardGrid
        heading="Related trains"
        items={relatedTrains.map((related) => ({
          href: `/train/${related.slug}`,
          title: `${related.trainNumber} · ${related.trainName}`,
          subtitle: `${related.sourceStation} → ${related.destStation}`,
        }))}
      />

      <LinkCardGrid
        heading="Related tools"
        items={TOOLS.map((tool) => ({
          href: tool.href,
          title: tool.title,
          subtitle: tool.subtitle,
          badge: tool.status === "coming-soon" ? "Coming soon" : undefined,
        }))}
      />

      <LinkCardGrid
        heading="Related articles"
        items={recentPosts.map((post) => ({
          href: `/blog/${post.slug}`,
          title: post.title,
        }))}
      />
    </div>
  );
}
