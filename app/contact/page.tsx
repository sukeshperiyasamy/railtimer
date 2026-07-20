import type { Metadata } from "next";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const CONTACT_EMAIL = "hello@anteclick.app";

const TITLE = "Contact";
const DESCRIPTION =
  "Get in touch with RailTimer — feedback, bug reports, business enquiries, or general questions about the Current Booking Calculator.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/contact`,
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
    question: "How quickly will I get a reply?",
    answer:
      "We read every message, but this is a small independent project, not a staffed support desk — please allow a few days, especially for non-urgent requests.",
  },
  {
    question: "I found wrong train or schedule data — how do I report it?",
    answer:
      "Select \"Bug report\" in the form below and include the train number and what's incorrect. Schedule data comes from a third-party aggregator, so corrections may take a data refresh cycle to appear.",
  },
  {
    question: "Can I advertise or partner with RailTimer?",
    answer: "Yes — select \"Business enquiry\" and tell us what you have in mind.",
  },
];

export default function ContactPage() {
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

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Contact us
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        Feedback, bug reports, and business enquiries all welcome.
      </p>

      <div className="mt-8 rounded-md border border-border p-6">
        <ContactForm />
      </div>

      <section className="mt-10 grid gap-6 sm:grid-cols-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Email</h2>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-1 block text-sm text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Feedback</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us what&apos;s confusing, missing, or wrong — every message shapes what we
            build next.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Business enquiries</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Partnerships, data corrections at scale, or advertising — reach out with details.
          </p>
        </div>
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
