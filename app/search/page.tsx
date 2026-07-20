import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { LinkCardGrid } from "@/components/shared/LinkCardGrid";
import { searchTrains } from "@/lib/actions/train-search";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Search results for "${q}"` : "Search trains";
  const description = q
    ? `Trains matching "${q}" on RailTimer — schedules, running days, and current booking times.`
    : "Search Indian Railways trains by number or name on RailTimer.";

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/search` },
    robots: { index: false, follow: true },
    openGraph: { title: `${title} | ${SITE_NAME}`, description },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const results = q.trim().length >= 2 ? await searchTrains(q, 30) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Search trains
      </h1>

      <form action="/search" method="GET" className="mt-6">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Train number or name…"
            className="h-11 w-full rounded-md border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
      </form>

      {q.trim().length >= 2 ? (
        results.length > 0 ? (
          <LinkCardGrid
            className="mt-8"
            items={results.map((train) => ({
              href: `/train/${train.slug}`,
              title: `${train.trainNumber} · ${train.trainName}`,
              subtitle: `${train.sourceStation} → ${train.destStation}${
                train.departureTime ? ` · departs ${train.departureTime}` : ""
              }`,
            }))}
          />
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            No trains matched &ldquo;{q}&rdquo;. Try a train number or part of its name.
          </p>
        )
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          Enter a train number or name above to search.
        </p>
      )}
    </div>
  );
}
