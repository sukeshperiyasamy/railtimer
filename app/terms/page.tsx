import type { Metadata } from "next";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const CONTACT_EMAIL = "hello@anteclick.app";
const LAST_UPDATED = "20 July 2026";

const TITLE = "Terms & Conditions";
const DESCRIPTION =
  "The terms governing use of RailTimer's tools, including our accuracy and Indian Railways disclaimers, copyright, and liability limitations.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/terms`,
    siteName: SITE_NAME,
    type: "website",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Terms" }]} />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Terms &amp; Conditions
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <p className="mt-6 leading-relaxed text-muted-foreground">
        By using RailTimer, you agree to these terms. If you don&apos;t agree, please don&apos;t
        use the site.
      </p>

      <Section title="Website usage">
        <p>
          RailTimer is provided free of charge for personal, non-commercial use in checking
          Indian Railways train schedules, chart preparation timing, and current booking
          opening times. You may not scrape, republish, or resell RailTimer&apos;s content or
          data at scale without our written permission; reasonable personal use, linking, and
          screenshotting are fine.
        </p>
      </Section>

      <Section title="Indian Railways &amp; official-affiliation disclaimer">
        <p>
          RailTimer is an independent, unofficial project. We are not affiliated with,
          endorsed by, sponsored by, or in any way officially connected with Indian Railways,
          IRCTC, the Ministry of Railways, or the Government of India, or any of their
          subsidiaries or affiliates. Any train numbers, names, or station codes referenced
          are used solely to identify the relevant services and remain the property of their
          respective owners.
        </p>
      </Section>

      <Section title="Data and accuracy disclaimer">
        <p>
          Train schedules, running days, and route data are sourced from a third-party
          railway data aggregator and may not reflect the latest timetable revisions,
          special/holiday schedules, or last-minute operational changes. Chart preparation and
          current booking timing are calculated from the current publicly documented Railway
          Board rule, which has changed multiple times in recent years and can carry
          train-specific exceptions we may not be aware of. Running status, PNR status, and
          seat availability, where shown, come from third-party providers and may lag behind
          official IRCTC systems.
        </p>
        <p>
          <strong className="text-foreground">
            RailTimer is provided for informational purposes only and must not be treated as a
            substitute for official confirmation.
          </strong>{" "}
          Always verify booking-critical information directly on IRCTC, the NTES app, or at
          the station before you travel.
        </p>
      </Section>

      <Section title="API and third-party dependency disclaimer">
        <p>
          RailTimer relies on third-party data providers and APIs for schedule data and, where
          available, live status. These providers are unofficial, can change their data
          format or availability without notice, and may be temporarily or permanently
          unreachable. When live data can&apos;t be retrieved, RailTimer may show cached or
          estimated data rather than failing outright — always cross-check anything
          time-sensitive.
        </p>
      </Section>

      <Section title="Copyright">
        <p>
          The RailTimer name, logo, design, and original written content (including blog
          articles and on-page explanations) are &copy; {new Date().getFullYear()} RailTimer,
          unless otherwise noted. Train and station data is sourced from third parties as
          described in our{" "}
          <a
            href="/privacy-policy"
            className="text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </a>{" "}
          and remains subject to those parties&apos; own rights.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          RailTimer is provided &ldquo;as is&rdquo; without warranties of any kind, express or
          implied, including accuracy, completeness, or fitness for a particular purpose. To
          the fullest extent permitted by law, RailTimer and its operators are not liable for
          any missed trains, financial loss, or other damages arising from reliance on
          information shown on this site. Your use of RailTimer, and any travel decisions you
          make based on it, are at your own risk.
        </p>
      </Section>

      <Section title="Advertising">
        <p>
          RailTimer is supported by advertising, including Google AdSense. Ads are placed to
          be clearly distinguishable from site content and are never disguised as navigation
          or editorial content. See our{" "}
          <a
            href="/privacy-policy"
            className="text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </a>{" "}
          for how advertising cookies work.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms as the site evolves. Continued use of RailTimer after a
          change constitutes acceptance of the updated terms. Material changes will update the
          &ldquo;Last updated&rdquo; date above.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
