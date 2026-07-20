import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = "About";
const DESCRIPTION =
  "RailTimer is a free, independent tool that calculates exactly when Indian Railways current booking opens for your train, based on the current Railway Board chart-preparation rule.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/about`,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

const FAQS = [
  {
    question: "Is RailTimer affiliated with Indian Railways or IRCTC?",
    answer:
      "No. RailTimer is an independent, unofficial project built to fill a specific gap — nobody publishes the exact moment current booking opens. We are not affiliated with, endorsed by, or operated by Indian Railways, IRCTC, or the Government of India.",
  },
  {
    question: "Where does RailTimer's train and station data come from?",
    answer:
      "Static schedule data (train numbers, names, routes, timings) is sourced from a third-party railway data aggregator. Live running status and PNR lookups, where available, come from a separate live-data provider — see the disclaimer below for how that's handled when live data isn't available.",
  },
  {
    question: "Is the Current Booking Calculator's result guaranteed to be correct?",
    answer:
      "The calculator applies the current, publicly documented Railway Board chart-preparation rule as accurately as we can verify it. Railway Board has changed this rule multiple times in the past two years, and individual trains can have exceptions — always treat the result as a strong estimate, not an official confirmation, and verify anything booking-critical on IRCTC or at the station.",
  },
  {
    question: "Do you sell or share my personal data?",
    answer:
      "RailTimer's tools don't require an account, and we don't collect personal data to use the calculator. See our Privacy Policy for details on analytics and advertising cookies.",
  },
];

export default function AboutPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: DESCRIPTION,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        About RailTimer
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        Know exactly when Current Booking opens for your train — free, instant, no login.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">What RailTimer is</h2>
        <p className="leading-relaxed text-muted-foreground">
          RailTimer is a focused tool for Indian Railways passengers who are waitlisted,
          booking Tatkal, or travelling last-minute. It calculates the exact chart preparation
          time and current booking opening time for any train and journey date, and shows you
          a live countdown so you&apos;re not stuck refreshing IRCTC and guessing. Every train page
          also carries the full schedule, running days, and route so you have one place to
          check before you travel.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Our mission</h2>
        <p className="leading-relaxed text-muted-foreground">
          Indian Railways passengers repeatedly refresh IRCTC because nobody publishes the
          exact moment current booking opens — and by the time they check, seats are gone. Our
          mission is to close that gap with a single, honest, ad-supported tool: no login, no
          subscription, no premium tier, and no invented data. If we don&apos;t have a real answer
          for something, we say so rather than guessing.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Features</h2>
        <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
          <li>
            <Link
              href="/tools/current-booking-calculator"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Current Booking Calculator
            </Link>{" "}
            — chart preparation time, current booking opening time, and a live countdown for
            any train and journey date.
          </li>
          <li>Thousands of individual train pages with full schedules and running days.</li>
          <li>Station pages showing every train we have passing through a given station.</li>
          <li>
            A{" "}
            <Link href="/blog" className="font-medium text-primary underline-offset-4 hover:underline">
              blog
            </Link>{" "}
            of plain-language guides to current booking, chart preparation, Tatkal, and
            waiting lists.
          </li>
          <li>Sitewide search by train number or name, with full keyboard navigation.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Data sources</h2>
        <p className="leading-relaxed text-muted-foreground">
          Train and station schedule data is sourced from a third-party railway data
          aggregator and stored in our own database, refreshed periodically rather than on
          every request. A small number of trains have a full, verified station-by-station
          schedule; the rest currently show origin and destination only, derived from the
          same real source data — we never invent intermediate stops or timings. Live running
          status and PNR lookups, where we support them, come from a separate live-data
          provider and are cached briefly to control cost and stay within rate limits.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Live status disclaimer</h2>
        <p className="leading-relaxed text-muted-foreground">
          RailTimer is an independent, unofficial information resource. Chart preparation
          times are calculated from the current publicly documented Railway Board rule, which
          has changed more than once in the past two years and can carry train-specific
          exceptions. Running status, PNR status, and seat availability — where shown — are
          sourced from third-party providers and may lag behind the official IRCTC systems.
          Always confirm anything booking-critical directly with IRCTC or at the station
          before you travel. RailTimer is not affiliated with, endorsed by, or operated by
          Indian Railways, IRCTC, or the Government of India.
        </p>
      </section>

      <section className="mt-10 rounded-md border border-border bg-muted/40 p-5">
        <h2 className="text-xl font-semibold text-foreground">Questions or feedback?</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          If something looks wrong, or you just want to say hello, we&apos;d like to hear from you.
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Contact us
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-foreground">Frequently asked questions</h2>
        <div className="mt-3 divide-y divide-border rounded-md border border-border">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group p-4">
              <summary className="cursor-pointer list-none font-medium text-foreground [&::-webkit-details-marker]:hidden">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
