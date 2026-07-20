import type { Metadata } from "next";
import Link from "next/link";
import { TrainFront } from "lucide-react";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page doesn't exist — search for a train or head back to RailTimer's homepage.",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const popularTrains = await prisma.train.findMany({
    where: {
      OR: ["rajdhani", "shatabdi", "duronto", "vande bharat"].map((keyword) => ({
        trainName: { contains: keyword, mode: "insensitive" as const },
      })),
    },
    orderBy: { trainName: "asc" },
    take: 4,
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <TrainFront className="h-8 w-8" aria-hidden="true" />
      </span>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        This train has departed.
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        We couldn&apos;t find the page you were looking for — it may have moved, or the URL
        might be off. Try searching for a train, or head back to a page that exists.
      </p>

      <div className="mt-8 w-full max-w-sm">
        <GlobalSearch />
      </div>

      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Return home
      </Link>

      {popularTrains.length > 0 ? (
        <div className="mt-12 w-full text-left">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Or try a popular train
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {popularTrains.map((train) => (
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
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
        <Link
          href="/tools/current-booking-calculator"
          className="text-primary underline-offset-4 hover:underline"
        >
          Current Booking Calculator
        </Link>
        <Link href="/blog" className="text-primary underline-offset-4 hover:underline">
          Blog
        </Link>
        <Link href="/about" className="text-primary underline-offset-4 hover:underline">
          About
        </Link>
        <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
          Contact
        </Link>
      </div>
    </div>
  );
}
