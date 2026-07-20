import type { Metadata } from "next";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { ComingSoonNotice } from "@/components/tools/ComingSoonNotice";
import { LinkCardGrid } from "@/components/shared/LinkCardGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TOOLS } from "@/lib/tools-directory";

const PAGE_URL = `${SITE_URL}/tools/reservation-opening-date`;
const TITLE = "Reservation Opening Date Calculator — 60-Day Advance Booking";
const DESCRIPTION =
  "Indian Railways opens advance reservation 60 days before your journey date, at 8:00 AM. See how to work out your exact booking-opening date while our calculator is being built.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "reservation opening date",
    "advance reservation period",
    "ARP indian railways",
    "60 days advance booking",
    "IRCTC booking date calculator",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: PAGE_URL,
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
    question: "How many days in advance can I book an Indian Railways ticket?",
    answer:
      "The Advance Reservation Period (ARP) is 60 days before the date of journey, not counting the journey date itself. This was reduced from 120 days, effective 1 November 2024.",
  },
  {
    question: "What time does the 60-day booking window open?",
    answer:
      "Advance reservation opens at 8:00 AM IST on the first eligible day — exactly 60 days before your journey date.",
  },
  {
    question: "How do I calculate my exact booking-opening date?",
    answer:
      "Count back 60 days from your journey date, excluding the journey date itself. For example, for a journey on 1 August, booking opens on 2 June at 8:00 AM.",
  },
  {
    question: "Does the 60-day rule apply to every train?",
    answer:
      "Most mail, express, and superfast trains follow the 60-day ARP, but some day-time intercity services, special trains, and a few exempted categories can have different rules — always double-check on IRCTC for less common trains.",
  },
];

export default function ReservationOpeningDatePage() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tools", href: "/tools/current-booking-calculator" },
          { label: "Reservation Opening Date" },
        ]}
      />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Reservation Opening Date Calculator
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        Advance reservation opens 60 days before your journey date, at 8:00 AM IST — here&apos;s
        how to work out the exact date while our calculator is being built.
      </p>

      <ComingSoonNotice toolName="An instant reservation-opening-date calculator" />

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">
          How the 60-day Advance Reservation Period works
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Indian Railways lets passengers book tickets up to a fixed number of days ahead of
          travel — the Advance Reservation Period, or ARP. Since 1 November 2024, that window is{" "}
          <strong className="text-foreground">60 days</strong>, down from the previous 120
          days, and it opens at{" "}
          <strong className="text-foreground">8:00 AM IST</strong> on the first eligible day.
          To find your booking-opening date, count back 60 days from your journey date, not
          including the journey date itself — for a journey on 1 August, for instance, booking
          opens on 2 June at 8:00 AM. Most mail, express, and superfast trains follow this rule,
          though a handful of day-time intercity and special services are exempted, so it&apos;s
          worth double-checking on IRCTC for less common routes.
        </p>
      </section>

      <div className="mt-10">
        <AdSlot slot="reservation-opening-date-in-content" format="in-content" />
      </div>

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

      <LinkCardGrid
        heading="Related tools"
        items={TOOLS.filter((tool) => tool.href !== "/tools/reservation-opening-date").map(
          (tool) => ({
            href: tool.href,
            title: tool.title,
            subtitle: tool.subtitle,
            badge: tool.status === "coming-soon" ? "Coming soon" : undefined,
          }),
        )}
      />
    </div>
  );
}
