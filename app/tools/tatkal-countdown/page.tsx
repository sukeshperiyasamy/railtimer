import type { Metadata } from "next";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { ComingSoonNotice } from "@/components/tools/ComingSoonNotice";
import { LinkCardGrid } from "@/components/shared/LinkCardGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TOOLS } from "@/lib/tools-directory";

const PAGE_URL = `${SITE_URL}/tools/tatkal-countdown`;
const TITLE = "Tatkal Countdown — When Does Tatkal Booking Open?";
const DESCRIPTION =
  "Tatkal booking opens one day before travel — 10:00 AM for AC classes, 11:00 AM for non-AC. See the exact rule and a worked example while our live countdown tool is being built.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "tatkal countdown",
    "tatkal booking time",
    "tatkal opening time",
    "AC tatkal timing",
    "sleeper tatkal timing",
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
    question: "When does Tatkal booking open for AC classes?",
    answer:
      "Tatkal booking for AC classes (2A, 3A, CC, EC, 3E) opens at 10:00 AM, exactly one day before your date of journey — the journey date itself doesn't count toward that one day.",
  },
  {
    question: "When does Tatkal booking open for Sleeper class?",
    answer:
      "Tatkal booking for non-AC classes (Sleeper, Second Sitting) opens at 11:00 AM, one day before the date of journey — an hour after the AC Tatkal window opens.",
  },
  {
    question: "Can I get a refund if I cancel a confirmed Tatkal ticket?",
    answer:
      "No — once a Tatkal ticket is confirmed, it isn't eligible for a refund on cancellation. A waitlisted Tatkal ticket that never confirms is auto-cancelled and refunded like any other waitlisted ticket.",
  },
  {
    question: "Do I need Aadhaar to book a Tatkal ticket?",
    answer:
      "Yes — since 15 July 2025, Aadhaar-based OTP authentication is compulsory for Tatkal bookings made online through IRCTC.",
  },
  {
    question: "Is Tatkal the same as Current Booking?",
    answer:
      "No. Tatkal is a fixed quota that opens once, at 10 AM or 11 AM, exactly one day before travel. Current booking is separate — it opens only after the final chart is prepared, 30 minutes before departure, releasing whatever berths are still unbooked at that point.",
  },
];

export default function TatkalCountdownPage() {
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
          { label: "Tatkal Countdown" },
        ]}
      />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Tatkal Countdown
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        Tatkal booking opens once, at a fixed time, exactly one day before your journey —
        10:00 AM for AC classes and 11:00 AM for non-AC classes.
      </p>

      <ComingSoonNotice toolName="A live, second-by-second Tatkal countdown" />

      <section className="mt-10 space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">How Tatkal timing works</h2>
        <p className="leading-relaxed text-muted-foreground">
          Tatkal is a separate booking scheme from regular reservation and current booking —
          a small quota of seats is held back and released exactly one day before the date of
          journey (the journey date itself doesn&apos;t count). The window opens at a fixed
          clock time depending on class: <strong className="text-foreground">10:00 AM</strong>{" "}
          for AC classes (2A, 3A, CC, EC, 3E) and{" "}
          <strong className="text-foreground">11:00 AM</strong> for non-AC classes (Sleeper,
          Second Sitting). For example, if you&apos;re travelling on 15 June, AC Tatkal opens
          on 14 June at 10:00 AM and Sleeper Tatkal opens on 14 June at 11:00 AM. Since 15 July
          2025, Aadhaar-based OTP authentication is compulsory for Tatkal bookings made online,
          and unlike regular tickets, a confirmed Tatkal ticket is not eligible for a refund if
          you cancel it — only a waitlisted Tatkal ticket that never confirms gets refunded
          automatically.
        </p>
      </section>

      <div className="mt-10">
        <AdSlot slot="tatkal-countdown-in-content" format="in-content" />
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
        items={TOOLS.filter((tool) => tool.href !== "/tools/tatkal-countdown").map((tool) => ({
          href: tool.href,
          title: tool.title,
          subtitle: tool.subtitle,
          badge: tool.status === "coming-soon" ? "Coming soon" : undefined,
        }))}
      />
    </div>
  );
}
