import type { Metadata } from "next";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const CONTACT_EMAIL = "hello@anteclick.app";
const LAST_UPDATED = "20 July 2026";

const TITLE = "Privacy Policy";
const DESCRIPTION =
  "How RailTimer handles cookies, analytics, advertising, and any data you share with us — including our Google AdSense and analytics disclosures.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/privacy-policy`,
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

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <p className="mt-6 leading-relaxed text-muted-foreground">
        RailTimer (&ldquo;we&rdquo;, &ldquo;us&rdquo;) publishes this policy so you know
        exactly what data is collected when you use {SITE_URL.replace(/^https?:\/\//, "")},
        who collects it, and what choices you have. None of RailTimer&apos;s tools require an
        account, and we do not require you to submit personal data to use the Current Booking
        Calculator or browse train/station pages.
      </p>

      <Section title="Information we collect directly">
        <p>
          We do not operate user accounts, logins, or profiles. The only place you can
          voluntarily submit personal data is our{" "}
          <a href="/contact" className="text-primary underline-offset-4 hover:underline">
            Contact page
          </a>
          , where the form opens a pre-filled email in your own email client — the message
          goes directly to {CONTACT_EMAIL} and is never stored on our servers or database.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          Google AdSense and our analytics providers (below) may set cookies or use browser
          local storage to serve ads, measure traffic, and distinguish repeat visits. We don&apos;t
          set any first-party cookies of our own for tracking. You can block or delete cookies
          at any time in your browser settings; doing so may affect ad relevance but won&apos;t
          break any RailTimer tool.
        </p>
      </Section>

      <Section title="Google AdSense">
        <p>
          RailTimer shows ads served by Google AdSense. Google and its partners use cookies
          and similar technologies to serve ads based on your prior visits to this and other
          websites (interest-based advertising). You can opt out of personalized advertising
          by visiting{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-primary underline-offset-4 hover:underline"
          >
            Google Ads Settings
          </a>{" "}
          or{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-primary underline-offset-4 hover:underline"
          >
            www.aboutads.info/choices
          </a>
          . Third-party vendors, including Google, may use cookies to serve ads based on your
          past visits to this site or others. See Google&apos;s own policy for full detail:{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-primary underline-offset-4 hover:underline"
          >
            How Google uses information from sites that use our services
          </a>
          .
        </p>
      </Section>

      <Section title="Analytics">
        <p>
          We use <strong className="text-foreground">PostHog</strong> for product analytics
          (page views, feature usage, and session data) and{" "}
          <strong className="text-foreground">Vercel Analytics</strong> for aggregated,
          privacy-preserving traffic statistics. PostHog may set cookies or use local storage
          and, depending on configuration, can record IP-derived approximate location and
          device/browser information; it does not receive your name or email unless you submit
          them yourself elsewhere. Vercel Analytics does not use cookies and reports only
          aggregated, non-identifying traffic counts. Neither service is used to build an
          advertising profile of you outside of RailTimer.
        </p>
      </Section>

      <Section title="How train and station data is handled">
        <p>
          Searching for a train or station on RailTimer is not logged against you personally.
          Search queries are processed to return results and are not linked to an identity or
          retained as a personal search history.
        </p>
      </Section>

      <Section title="Third-party services we use">
        <ul className="list-disc space-y-1 pl-5">
          <li>Google AdSense — advertising</li>
          <li>PostHog — product analytics</li>
          <li>Vercel Analytics — aggregated traffic analytics</li>
          <li>Vercel — hosting</li>
          <li>Supabase (PostgreSQL) — our application database</li>
          <li>Upstash — short-lived caching for live train-status lookups</li>
          <li>A third-party railway data aggregator — train and station schedule data</li>
        </ul>
        <p>
          None of our infrastructure providers (Vercel, Supabase, Upstash) receive personal
          data from you beyond standard request metadata (like IP address) needed to serve the
          page, which they process on our behalf under their own privacy and security
          commitments.
        </p>
      </Section>

      <Section title="Your rights (GDPR — EU/UK visitors)">
        <p>
          If you are located in the EU/UK, you have the right to request access to,
          correction of, or deletion of any personal data we hold about you (in practice,
          limited to what you send us via the contact form), to object to or restrict certain
          processing, and to lodge a complaint with your local data protection authority.
          Because RailTimer doesn&apos;t maintain user accounts or profiles, most of these
          requests can be resolved simply by us not retaining your message after replying.
          Contact us at {CONTACT_EMAIL} to exercise any of these rights.
        </p>
      </Section>

      <Section title="Your rights (CCPA — California visitors)">
        <p>
          California residents have the right to know what personal information is collected,
          to request deletion of that information, and to opt out of the &ldquo;sale&rdquo; or
          &ldquo;sharing&rdquo; of personal information. RailTimer does not sell personal
          information. Interest-based advertising through Google AdSense may be considered
          &ldquo;sharing&rdquo; under CCPA — you can opt out via the Google Ads Settings link
          above. Contact us at {CONTACT_EMAIL} for any CCPA request.
        </p>
      </Section>

      <Section title="Children's privacy">
        <p>
          RailTimer is not directed at children and we do not knowingly collect personal
          information from anyone under 13 (or the relevant minimum age in your jurisdiction).
          If you believe a child has provided us personal data via the contact form, email us
          at {CONTACT_EMAIL} and we will delete it.
        </p>
      </Section>

      <Section title="Data retention">
        <p>
          We do not operate a database of personal information. Contact-form messages exist
          only as an email in your own outbox and our inbox at {CONTACT_EMAIL}, retained only
          as long as needed to respond. Live train-status lookups are cached briefly (a few
          minutes) purely to reduce load on upstream data providers and are not tied to any
          visitor identity.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this policy as RailTimer&apos;s features or third-party services
          change. Material changes will update the &ldquo;Last updated&rdquo; date above.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy or a privacy request:{" "}
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
