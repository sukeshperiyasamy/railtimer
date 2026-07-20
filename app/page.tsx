import { AdSlot } from "@/components/ads/AdSlot";
import { LinkCardGrid } from "@/components/shared/LinkCardGrid";
import { ChartTimeCalculator } from "@/components/tools/ChartTimeCalculator";
import { prisma } from "@/lib/prisma";
import { TOOLS } from "@/lib/tools-directory";
import { excerpt } from "@/lib/blog";
import { formatClockTime } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const HOME_FAQS = [
  {
    question: "What is RailTimer?",
    answer:
      "RailTimer is a free tool for Indian Railways passengers that calculates exactly when a train's chart is prepared and when current booking opens, based on the current Railway Board rule — no login or signup required.",
  },
  {
    question: "Is RailTimer an official Indian Railways or IRCTC website?",
    answer:
      "No. RailTimer is an independent, unofficial information resource. It's not affiliated with, endorsed by, or operated by Indian Railways, IRCTC, or the Government of India — always confirm critical details before travel.",
  },
  {
    question: "How accurate is the Current Booking Calculator?",
    answer:
      "It applies the current, verified Railway Board chart-preparation rule (10 hours before departure, or 8:00 PM the previous night for trains departing 5 AM–2 PM, with the final chart always 30 minutes before departure). The rule is versioned internally and rechecked as Railway Board updates it.",
  },
  {
    question: "Do I need to create an account to use the calculator?",
    answer: "No — every tool on RailTimer works instantly with no login, signup, or payment.",
  },
];

/** Well-known, genuinely higher-demand train categories — used to surface
 *  recognizable trains on the homepage instead of an arbitrary alphabetical
 *  slice of 5,000+ trains. */
const PREMIUM_TRAIN_KEYWORDS = [
  "rajdhani",
  "shatabdi",
  "duronto",
  "vande bharat",
  "garib rath",
  "tejas",
];

export default async function Home() {
  const [trains, stations, posts] = await Promise.all([
    prisma.train.findMany({
      where: {
        OR: PREMIUM_TRAIN_KEYWORDS.map((keyword) => ({
          trainName: { contains: keyword, mode: "insensitive" as const },
        })),
      },
      orderBy: { trainName: "asc" },
      take: 8,
    }),
    prisma.station.findMany({ orderBy: { name: "asc" }, take: 8 }),
    prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Free tool for Indian Railways passengers that calculates exactly when current booking opens for a train.",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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

      <LinkCardGrid
        heading="Popular trains"
        items={trains.map((train) => ({
          href: `/train/${train.slug}`,
          title: `${train.trainNumber} · ${train.trainName}`,
          subtitle: `${train.sourceStation} → ${train.destStation}${
            formatClockTime(train.departureTime) ? ` · departs ${formatClockTime(train.departureTime)}` : ""
          }`,
        }))}
      />

      <LinkCardGrid
        heading="Popular stations"
        items={stations.map((station) => ({
          href: `/station/${station.code}`,
          title: `${station.name} (${station.code})`,
          subtitle: station.state ?? undefined,
        }))}
      />

      <LinkCardGrid
        heading="Railway tools"
        items={TOOLS.map((tool) => ({
          href: tool.href,
          title: tool.title,
          subtitle: tool.subtitle,
          badge: tool.status === "coming-soon" ? "Coming soon" : undefined,
        }))}
      />

      <LinkCardGrid
        heading="Latest articles"
        items={posts.map((post) => ({
          href: `/blog/${post.slug}`,
          title: post.title,
          subtitle: excerpt(post.content, 100),
        }))}
      />

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-foreground">Why RailTimer</h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          Waitlisted passengers, Tatkal users, and last-minute travellers all
          face the same problem: nobody publishes the exact moment current
          booking opens, so people refresh IRCTC and still miss confirmed
          seats. RailTimer calculates it directly from the current Railway
          Board chart-preparation rule, with a live countdown so you know
          precisely when to check back.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-foreground">Frequently asked questions</h2>
        <div className="mt-3 divide-y divide-border rounded-md border border-border">
          {HOME_FAQS.map((faq) => (
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
