import type { Metadata } from "next";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { RunningStatusChecker } from "@/components/tools/RunningStatusChecker";
import { LinkCardGrid } from "@/components/shared/LinkCardGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TOOLS } from "@/lib/tools-directory";

const PAGE_URL = `${SITE_URL}/tools/running-status`;
const TITLE = "Live Train Running Status — Where Is My Train Right Now?";
const DESCRIPTION =
  "Check live running status for any Indian Railways train — current location, delay in minutes, and station-by-station actual vs. scheduled times. Free, no login required.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "train running status",
    "where is my train",
    "live train status",
    "train location tracker",
    "train delay status",
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
    question: "How accurate is live train running status?",
    answer:
      "Running status is sourced from a live third-party data provider and reflects the most recent update from the train's actual movement — typically refreshed every few minutes. It can occasionally lag the official NTES system by a short window, so treat it as a strong estimate rather than a guaranteed real-time feed.",
  },
  {
    question: "What does \"not started\" mean?",
    answer:
      "The train hasn't yet departed from its originating station for the date you selected — check back closer to the scheduled departure time.",
  },
  {
    question: "Why does running status show a different delay than what I see at the station?",
    answer:
      "Delay figures update as the train passes each station, so there can be a short lag between an announcement at the platform and the figure shown here. If the two disagree by more than a few minutes, trust the platform announcement — you're closer to the source.",
  },
  {
    question: "Can I check running status without knowing the exact train number?",
    answer:
      "Yes — search by train name in the box above (for example \"Shatabdi\" or \"Rajdhani\") and pick the right train from the suggestions.",
  },
  {
    question: "Does running status tell me if my seat is confirmed?",
    answer:
      "No — running status only tracks the train's physical location and delay. For your booking status, use PNR status instead; for whether new seats have opened up, use the Current Booking Calculator.",
  },
];

export default function RunningStatusPage() {
  const webApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Live Train Running Status",
    description: DESCRIPTION,
    url: PAGE_URL,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tools", href: "/tools/current-booking-calculator" },
          { label: "Running Status" },
        ]}
      />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Live Train Running Status
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        See exactly where a train is right now, how delayed it is, and its actual arrival and
        departure time at every station — search by train number or name below.
      </p>

      <div className="mt-8">
        <RunningStatusChecker />
      </div>

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">
          How live running status works
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Every train reports its progress as it passes each station along its route — that feed
          is what powers the status above. A train can be{" "}
          <strong className="text-foreground">not started</strong> (hasn&apos;t left its origin
          station yet for the selected date), <strong className="text-foreground">running</strong>{" "}
          (moving, on or close to schedule), <strong className="text-foreground">delayed</strong>{" "}
          (running more than roughly 15 minutes behind), <strong className="text-foreground">
            completed
          </strong>{" "}
          (has reached its destination), or, rarely,{" "}
          <strong className="text-foreground">cancelled</strong>. The delay figure and current
          station are recalculated at each reporting point along the route, and the
          station-by-station table shows scheduled versus actual times so you can see exactly
          where time was gained or lost.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          This data comes from a third-party live-tracking provider, not directly from Indian
          Railways, so treat it as a strong estimate — always confirm anything boarding-critical
          with the station announcement system or the official NTES app before you rely on it.
        </p>
      </section>

      <div className="mt-10">
        <AdSlot slot="running-status-in-content" format="in-content" />
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
