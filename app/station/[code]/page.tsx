import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { LinkCardGrid } from "@/components/shared/LinkCardGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { buildStationFaqs } from "@/lib/station-faq";
import { TOOLS } from "@/lib/tools-directory";
import { formatClockTime } from "@/lib/format";

export const revalidate = 3600;

interface StationPageParams {
  code: string;
}

async function getStation(code: string) {
  return prisma.station.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      stops: {
        include: { train: true },
        orderBy: { sequence: "asc" },
      },
    },
  });
}

export async function generateStaticParams() {
  const stations = await prisma.station.findMany({
    select: { code: true },
    orderBy: { name: "asc" },
    take: 50,
  });
  return stations.map((station) => ({ code: station.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<StationPageParams>;
}): Promise<Metadata> {
  const { code } = await params;
  const station = await getStation(code);
  if (!station) return {};

  const title = `${station.name} (${station.code}) Railway Station — Trains & Routes`;
  const description = `${station.name} (${station.code}) station: see every train that passes through, popular routes, and current booking times — updated schedules for Indian Railways passengers.`;
  const url = `${SITE_URL}/station/${station.code}`;

  return {
    title,
    description,
    keywords: [
      `${station.code} station`,
      `${station.name} trains`,
      `${station.code} train schedule`,
      `trains from ${station.name}`,
    ],
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

export default async function StationPage({
  params,
}: {
  params: Promise<StationPageParams>;
}) {
  const { code } = await params;
  const station = await getStation(code);
  if (!station) notFound();

  const trainsById = new Map(station.stops.map((stop) => [stop.train.id, stop.train]));
  const trains = Array.from(trainsById.values());

  const routesByPair = new Map<string, (typeof trains)[number]>();
  for (const train of trains) {
    const key = `${train.sourceStation}→${train.destStation}`;
    if (!routesByPair.has(key)) routesByPair.set(key, train);
  }
  const popularRoutes = Array.from(routesByPair.values()).slice(0, 5);

  const relatedStations = await prisma.station.findMany({
    where: { code: { not: station.code } },
    orderBy: { name: "asc" },
    take: 6,
  });

  const faqs = buildStationFaqs({
    code: station.code,
    name: station.name,
    trainCount: trains.length,
  });

  const stationJsonLd = {
    "@context": "https://schema.org",
    "@type": "TrainStation",
    name: station.name,
    identifier: station.code,
    ...(station.state
      ? { address: { "@type": "PostalAddress", addressRegion: station.state, addressCountry: "IN" } }
      : {}),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Stations", href: "/" },
          { label: `${station.name} (${station.code})` },
        ]}
      />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {station.name} <span className="text-muted-foreground">({station.code})</span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        {station.state ? `${station.state}, India` : "India"} · {trains.length} train
        {trains.length === 1 ? "" : "s"} in our database
      </p>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-foreground">Trains passing through</h2>
        {trains.length > 0 ? (
          <LinkCardGrid
            className="mt-3"
            items={trains.map((train) => ({
              href: `/train/${train.slug}`,
              title: `${train.trainNumber} · ${train.trainName}`,
              subtitle: `${train.sourceStation} → ${train.destStation}${
                formatClockTime(train.departureTime) ? ` · departs ${formatClockTime(train.departureTime)}` : ""
              }`,
            }))}
          />
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No trains through this station in our database yet.
          </p>
        )}
      </section>

      {popularRoutes.length > 0 ? (
        <LinkCardGrid
          heading="Popular routes via this station"
          items={popularRoutes.map((train) => ({
            href: `/train/${train.slug}`,
            title: `${train.sourceStation} → ${train.destStation}`,
            subtitle: `via ${train.trainNumber} ${train.trainName}`,
          }))}
        />
      ) : null}

      <div className="mt-10">
        <AdSlot slot={`station-${station.code}-in-content`} format="in-content" />
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
        heading="Related stations"
        items={relatedStations.map((related) => ({
          href: `/station/${related.code}`,
          title: `${related.name} (${related.code})`,
          subtitle: related.state ?? undefined,
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
    </div>
  );
}
