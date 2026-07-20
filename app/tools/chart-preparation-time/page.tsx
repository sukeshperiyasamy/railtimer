import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { ComingSoonNotice } from "@/components/tools/ComingSoonNotice";
import { LinkCardGrid } from "@/components/shared/LinkCardGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TOOLS } from "@/lib/tools-directory";

const PAGE_URL = `${SITE_URL}/tools/chart-preparation-time`;
const TITLE = "Chart Preparation Calculator — First vs. Final Chart, Explained";
const DESCRIPTION =
  "A deeper look at chart preparation timing — first chart vs. final chart, and how they differ by train. For an instant result today, use the Current Booking Calculator.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "chart preparation calculator",
    "chart preparation time",
    "first chart vs final chart",
    "train chart time",
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
    question: "What's the difference between this and the Current Booking Calculator?",
    answer:
      "They cover the same underlying rule. The Current Booking Calculator already gives you both the first-chart and final-chart times for any train and date — this page will add a PNR-aware view showing where your specific booking stood at each chart.",
  },
  {
    question: "What is the first chart?",
    answer:
      "The first chart is prepared either the previous night at 8:00 PM (for trains departing 5:00 AM–2:00 PM) or 10 hours before departure otherwise. It's when unconfirmed waitlisted tickets are cancelled and refunded.",
  },
  {
    question: "What is the final chart?",
    answer:
      "The final chart is prepared 30 minutes before every train's departure, accounting for any cancellations since the first chart, and is the moment current booking opens for whatever berths are still unclaimed.",
  },
];

export default function ChartPreparationTimePage() {
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
          { label: "Chart Preparation Calculator" },
        ]}
      />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Chart Preparation Calculator
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        A closer look at how first-chart and final-chart timing work — and where they differ
        from train to train.
      </p>

      <ComingSoonNotice toolName="A PNR-aware chart preparation breakdown" />

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">First chart vs. final chart</h2>
        <p className="leading-relaxed text-muted-foreground">
          Indian Railways prepares two charts for every train. The{" "}
          <strong className="text-foreground">first chart</strong> — prepared the previous
          night at 8:00 PM for trains departing between 5:00 AM and 2:00 PM, or 10 hours before
          departure otherwise — is what cancels any e-ticket still on the waitlist. The{" "}
          <strong className="text-foreground">final chart</strong>, always exactly 30 minutes
          before departure, accounts for any cancellations since the first chart and is the
          moment current booking actually opens. This page will eventually let you paste a PNR
          to see exactly where your booking stood at each chart; until then, the{" "}
          <Link
            href="/tools/current-booking-calculator"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Current Booking Calculator
          </Link>{" "}
          already computes both times instantly for any train and journey date.
        </p>
      </section>

      <div className="mt-10">
        <AdSlot slot="chart-preparation-time-in-content" format="in-content" />
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
        items={TOOLS.filter((tool) => tool.href !== "/tools/chart-preparation-time").map(
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
