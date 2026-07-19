import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { ChartTimeCalculator } from "@/components/tools/ChartTimeCalculator";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function Home() {
  const trains = await prisma.train.findMany({
    orderBy: { trainName: "asc" },
    take: 8,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Know exactly when Current Booking opens for your train.
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Stop refreshing IRCTC. Enter your train number and journey date to see
          the exact chart preparation time and current booking opening time —
          free, instant, no login required.
        </p>
      </section>

      <div className="mt-8">
        <ChartTimeCalculator />
      </div>

      <div className="mt-10">
        <AdSlot slot="home-banner" format="banner" />
      </div>

      {trains.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-foreground">Popular trains</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump straight to a train&apos;s schedule and chart timing.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {trains.map((train) => (
              <Link
                key={train.id}
                href={`/train/${train.slug}`}
                className="rounded-md border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <p className="font-medium text-foreground">
                  {train.trainNumber} · {train.trainName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {train.sourceStation} → {train.destStation}
                  {train.departureTime ? ` · departs ${train.departureTime}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Why RailTimer</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Waitlisted passengers, Tatkal users, and last-minute travellers all
            face the same problem: nobody publishes the exact moment current
            booking opens, so people refresh IRCTC and still miss confirmed
            seats. RailTimer calculates it directly from the current Railway
            Board chart-preparation rule, with a live countdown so you know
            precisely when to check back.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">More tools</h2>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link
                href="/tools/chart-time-calculator"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Chart Preparation Time Calculator
              </Link>
              <span className="text-muted-foreground">
                {" "}
                — full explainer, FAQ, and the rule&apos;s recent history.
              </span>
            </li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            More railway tools (Tatkal countdown, reservation-opening dates,
            station info) are on the way.
          </p>
        </div>
      </section>
    </div>
  );
}
