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
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { LinkCardGrid } from "@/components/shared/LinkCardGrid";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { buildRouteFaqs } from "@/lib/route-faq";
import { TOOLS } from "@/lib/tools-directory";
import { formatClockTime } from "@/lib/format";

export const revalidate = 3600;

interface RoutePageParams {
  slug: string;
}

function parseSlug(slug: string): { fromCode: string; toCode: string } | null {
  const match = slug.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/i);
  if (!match) return null;
  return { fromCode: match[1].toUpperCase(), toCode: match[2].toUpperCase() };
}

async function getRoute(slug: string) {
  const parsed = parseSlug(slug);
  if (!parsed) return null;
  if (parsed.fromCode === parsed.toCode) return null;

  const trains = await prisma.train.findMany({
    where: { sourceStation: parsed.fromCode, destStation: parsed.toCode },
    orderBy: { departureTime: "asc" },
  });
  if (trains.length === 0) return null;

  const [fromStation, toStation] = await Promise.all([
    prisma.station.findUnique({ where: { code: parsed.fromCode } }),
    prisma.station.findUnique({ where: { code: parsed.toCode } }),
  ]);

  return {
    slug,
    fromCode: parsed.fromCode,
    toCode: parsed.toCode,
    fromName: fromStation?.name ?? parsed.fromCode,
    toName: toStation?.name ?? parsed.toCode,
    trains,
  };
}

type RouteData = NonNullable<Awaited<ReturnType<typeof getRoute>>>;

/** Parses "Xh Ym" into total minutes for comparison; returns null if unparseable. */
function durationMinutes(duration: string | null): number | null {
  if (!duration) return null;
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

type RouteTrain = RouteData["trains"][number];

/** The train with the shortest parseable duration on this route, if any. */
function findFastestTrain(trains: RouteTrain[]): { train: RouteTrain; minutes: number } | null {
  const withDuration = trains
    .map((train) => ({ train, minutes: durationMinutes(train.duration) }))
    .filter((t): t is { train: RouteTrain; minutes: number } => t.minutes !== null);
  withDuration.sort((a, b) => a.minutes - b.minutes);
  return withDuration[0] ?? null;
}

export async function generateStaticParams() {
  const grouped = await prisma.train.groupBy({
    by: ["sourceStation", "destStation"],
    _count: { sourceStation: true },
    orderBy: { _count: { sourceStation: "desc" } },
    take: 150,
  });
  return grouped
    .filter((g) => g.sourceStation !== g.destStation)
    .map((g) => ({
      slug: `${g.sourceStation.toLowerCase()}-to-${g.destStation.toLowerCase()}`,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RoutePageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRoute(slug);
  if (!route) return {};

  const title = `${route.fromName} to ${route.toName} Trains — Schedule & Current Booking`;
  const description = `${route.trains.length} train${route.trains.length === 1 ? "" : "s"} from ${route.fromName} (${route.fromCode}) to ${route.toName} (${route.toCode}). Compare timings and check current booking time for each.`;
  const url = `${SITE_URL}/route/${route.slug}`;

  return {
    title,
    description,
    keywords: [
      `trains from ${route.fromName} to ${route.toName}`,
      `${route.fromCode} to ${route.toCode} trains`,
      `${route.fromName} ${route.toName} train time table`,
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

function describeRoute(route: RouteData): string {
  const premiumCount = route.trains.filter((t) =>
    /rajdhani|duronto|shatabdi|vande bharat|tejas/i.test(t.trainName),
  ).length;

  const fastest = findFastestTrain(route.trains);

  const overview = `${route.trains.length} train${route.trains.length === 1 ? " runs" : "s run"} directly from ${route.fromName} to ${route.toName} in our database${
    fastest
      ? `, with ${fastest.train.trainNumber} ${fastest.train.trainName} the fastest at about ${fastest.train.duration}`
      : ""
  }. ${
    premiumCount > 0
      ? `${premiumCount} of these ${premiumCount === 1 ? "is a" : "are"} premium service${premiumCount === 1 ? "" : "s"} (Rajdhani, Duronto, Shatabdi, Vande Bharat, or Tejas class), which typically run fully air-conditioned with fewer stops and higher demand.`
      : "None of these are premium (Rajdhani/Shatabdi/Vande Bharat class) services, so they're generally easier to get a confirmed seat on outside of festival season."
  }`;

  const tips = `Departure times below are sorted earliest first — open any train to see its full schedule, running days, and a Current Booking Calculator pre-filled with that train's own departure time. If your first choice is waitlisted, the other trains on this route are worth checking as alternatives for the same journey.`;

  return `${overview} ${tips}`;
}

export default async function RoutePage({
  params,
}: {
  params: Promise<RoutePageParams>;
}) {
  const { slug } = await params;
  const route = await getRoute(slug);
  if (!route) notFound();

  const [relatedFromRoutes, relatedToRoutes] = await Promise.all([
    prisma.train.findMany({
      where: { sourceStation: route.fromCode, destStation: { not: route.toCode } },
      distinct: ["destStation"],
      take: 4,
    }),
    prisma.train.findMany({
      where: { destStation: route.toCode, sourceStation: { not: route.fromCode } },
      distinct: ["sourceStation"],
      take: 4,
    }),
  ]);

  const fastest = findFastestTrain(route.trains);

  const faqs = buildRouteFaqs({
    fromCode: route.fromCode,
    fromName: route.fromName,
    toCode: route.toCode,
    toName: route.toName,
    trainCount: route.trains.length,
    fastestDuration: fastest?.train.duration ?? null,
    fastestTrainLabel: fastest ? `${fastest.train.trainNumber} ${fastest.train.trainName}` : null,
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: route.trains.map((train, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/train/${train.slug}`,
      name: `${train.trainNumber} ${train.trainName}`,
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Routes", href: "/" },
          { label: `${route.fromName} to ${route.toName}` },
        ]}
      />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {route.fromName} to {route.toName} Trains
      </h1>
      <p className="mt-2 text-muted-foreground">
        {route.trains.length} train{route.trains.length === 1 ? "" : "s"} · {route.fromCode} →{" "}
        {route.toCode}
      </p>

      <section className="mt-8">
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Train</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {route.trains.map((train) => (
                <TableRow key={train.id}>
                  <TableCell>
                    <Link
                      href={`/train/${train.slug}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {train.trainNumber} · {train.trainName}
                    </Link>
                  </TableCell>
                  <TableCell>{formatClockTime(train.departureTime) ?? "—"}</TableCell>
                  <TableCell>{formatClockTime(train.arrivalTime) ?? "—"}</TableCell>
                  <TableCell>{train.duration ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">
          About the {route.fromName} to {route.toName} route
        </h2>
        <p className="leading-relaxed text-muted-foreground">{describeRoute(route)}</p>
      </section>

      <div className="mt-10">
        <AdSlot slot={`route-${route.fromCode}-${route.toCode}-in-content`} format="in-content" />
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
        heading={`More trains from ${route.fromName}`}
        items={relatedFromRoutes.map((t) => ({
          href: `/route/${t.sourceStation.toLowerCase()}-to-${t.destStation.toLowerCase()}`,
          title: `${route.fromName} → ${t.destStation}`,
          subtitle: `via ${t.trainNumber} ${t.trainName}`,
        }))}
      />

      <LinkCardGrid
        heading={`More trains to ${route.toName}`}
        items={relatedToRoutes.map((t) => ({
          href: `/route/${t.sourceStation.toLowerCase()}-to-${t.destStation.toLowerCase()}`,
          title: `${t.sourceStation} → ${route.toName}`,
          subtitle: `via ${t.trainNumber} ${t.trainName}`,
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
