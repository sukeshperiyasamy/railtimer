import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";
import { ChartTimeCalculator } from "@/components/tools/ChartTimeCalculator";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const PAGE_PATH = "/tools/chart-time-calculator";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const LAST_VERIFIED = "20 July 2026";

const TITLE = "Chart Preparation Time Calculator — When Does Current Booking Open?";
const DESCRIPTION =
  "Calculate exactly when your train's chart will be prepared and current booking opens. Free tool for Indian Railways passengers — no login required.";

export function generateMetadata(): Metadata {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: PAGE_URL,
    },
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
}

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What is chart preparation time in Indian Railways?",
    answer:
      "Chart preparation is when Indian Railways finalizes the list of confirmed passengers for a specific train and date, allocates real berths and seats, and cancels any e-ticket that's still on the waitlist. It's the point where the reservation stops being provisional and becomes a fixed seating plan.",
  },
  {
    question: "How do I know if current booking has opened for my train?",
    answer:
      "Current booking opens automatically once the final chart is prepared — always 30 minutes before scheduled departure. Enter your train and journey date in the calculator above to get the exact time, then check availability on IRCTC or at the station counter once that time passes.",
  },
  {
    question: "Can I check current availability without a PNR?",
    answer:
      "Yes. Current availability — how many seats are open for immediate booking — is separate from PNR status and doesn't need a PNR number. You only need the train number, journey date, and travel class; a PNR is generated only after you actually book.",
  },
  {
    question: "What happens to waitlisted tickets after chart preparation?",
    answer:
      "If a waitlisted e-ticket is still unconfirmed when the first chart is prepared, it's automatically cancelled and refunded — which is why the first-chart time matters most for waitlisted passengers, not the final chart. RAC and counter-booked waitlisted tickets can still move up between the first and final chart if berths free up from cancellations.",
  },
  {
    question: "Does chart preparation time differ for Rajdhani/Duronto trains?",
    answer:
      "No. Since the December 2025 revision, the same rule applies to every train regardless of category — the first chart follows the 5 AM–2 PM departure-window rule (or the 10-hour rule outside it), and the final chart is always 30 minutes before departure. Premium trains just tend to have fewer last-minute cancellations, so current-booking seats can be scarcer.",
  },
  {
    question: "What's the difference between the first chart and the final chart?",
    answer:
      "The first chart is prepared several hours (or the previous night) before departure and is what cancels unconfirmed waitlisted tickets. The final chart, prepared 30 minutes before departure, accounts for any late cancellations since the first chart and is the actual moment current booking opens.",
  },
  {
    question: "Can I board without a confirmed seat if I book through current booking?",
    answer:
      "No — current booking issues a proper confirmed or RAC ticket for a specific seat or berth, so you board like any other reserved passenger rather than on a general ticket. You can typically book it at the station's current booking counter or, where enabled, through IRCTC shortly after the final chart.",
  },
  {
    question: "Why do chart preparation timings keep changing?",
    answer:
      "Railway Board has revised this rule multiple times in about two years — from 4 hours before departure, to 8 hours, to the current 10-hour / 8 PM-previous-night structure introduced in December 2025 — mostly in response to passengers wanting earlier certainty on waitlisted tickets. This calculator is updated whenever a new circular changes the rule, and the rule version is shown with every result.",
  },
];

function jsonLd(data: Record<string, unknown>) {
  return { __html: JSON.stringify(data) };
}

export default function ChartTimeCalculatorPage() {
  const webApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Train Chart Preparation Time Calculator",
    description: DESCRIPTION,
    url: PAGE_URL,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(webApplicationJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqJsonLd)} />

      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Train Chart Preparation Time Calculator — When Does Current Booking Open?
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Chart preparation is when Indian Railways finalizes your seat and cancels
        any ticket still on the waitlist — it&apos;s also the trigger for{" "}
        <strong className="text-foreground">current booking</strong>, the short
        window where freshly-released berths go back on sale. Enter your train
        and journey date below to see the exact first-chart and current-booking
        times, no login required.
      </p>

      <p className="mt-3 text-xs text-muted-foreground">
        Last verified against Railway Board rules on {LAST_VERIFIED}.
      </p>

      <div className="mt-8">
        <ChartTimeCalculator />
      </div>

      <article className="mt-12 space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            What &ldquo;chart preparation&rdquo; actually means
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            When you book a train ticket in India — especially one that lands on
            the waitlist — your seat isn&apos;t guaranteed until Indian Railways
            prepares the <em>reservation chart</em>: the master list that assigns
            real berths and seats to confirmed passengers for that specific train
            and date. Chart preparation is the administrative cutoff where
            Railways finalizes exactly who&apos;s confirmed and, critically for
            waitlisted travelers, cancels any e-ticket that&apos;s still on the
            waitlist once the chart is drawn. It exists because a train can only
            carry as many people as it has berths, and someone has to fix, at a
            specific point in time, exactly who those people are.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            How the current timing rule works
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            As of the December 2025 revision, Indian Railways prepares two
            charts, not one. The <strong>first chart</strong> is prepared either
            the previous night at 8:00 PM (for trains departing between 5:00 AM
            and 2:00 PM) or exactly 10 hours before departure (for every other
            departure time). This chart decides your waitlisted ticket&apos;s
            fate — if you&apos;re still waitlisted when it&apos;s drawn, your
            e-ticket is auto-cancelled and refunded. The{" "}
            <strong>final chart</strong>, always exactly 30 minutes before
            departure, accounts for any cancellations between the first chart
            and departure and releases whatever berths are still unclaimed. That
            release is exactly what <strong>current booking</strong> is: the
            window where anyone — not only people who already held a
            reservation — can book one of those freshly-vacated seats, either at
            the station counter or via IRCTC where enabled. The 10-hour and
            previous-night windows exist specifically to give waitlisted
            passengers enough advance notice to arrange alternate travel instead
            of finding out at the last minute.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            A rule that keeps changing — and why we track it
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            This isn&apos;t the first version of this rule, and it probably
            won&apos;t be the last. Chart preparation timing has moved three
            times in about eighteen months: it was 4 hours before departure,
            then extended to 8 hours, then to the current 10-hour / 8 PM
            structure in December 2025 — each change driven by passenger
            complaints that the previous timing left too little notice to
            rebook. Because the rule keeps shifting, we track the active Railway
            Board circular and version it internally (the calculator above shows
            which rule version produced your result), so this page stays
            accurate instead of quietly going stale like most static explainers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            Booking a confirmed seat through current booking
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Once the final chart is prepared and current booking opens, any
            released berths become bookable like a fresh reservation — you
            don&apos;t need to have held a prior ticket for that train. The most
            reliable way to check and book is through the{" "}
            <a
              href="https://www.irctc.co.in"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              official IRCTC website
            </a>
            , searching your train for the same journey date — availability
            shown there updates in real time once the chart is out. Many
            stations also run a dedicated current booking counter at the
            reservation office for passengers without internet access. Because
            current-booking seats go quickly on popular routes, knowing the
            exact opening time in advance is what the calculator above is for.
          </p>
        </section>
      </article>

      <div className="mt-10">
        <AdSlot slot="chart-calculator-in-content" format="in-content" />
      </div>

      <section aria-labelledby="faq-heading" className="mt-10 space-y-4">
        <h2 id="faq-heading" className="text-2xl font-semibold text-foreground">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-border rounded-md border border-border">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-foreground [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
        Last verified against Railway Board rules on {LAST_VERIFIED}. Have you
        seen a different chart time in practice? Rules change —{" "}
        <Link href="/contact" className="underline underline-offset-4 hover:text-foreground">
          let us know
        </Link>
        .
      </p>
    </div>
  );
}
