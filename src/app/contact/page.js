import Link from "next/link";
import {
  ChevronRight,
  ArrowRight,
  Mail,
  UserRound,
  Clock,
  Bug,
  Lightbulb,
  SearchCheck,
  Scale,
  Check,
  Inbox,
  Reply,
  Wrench,
} from "lucide-react";
import Container from "@/components/layout/Container";
import ContactForm from "@/components/contact/ContactForm";
import FaqAccordion from "@/components/ui/FaqAccordion";
import SectionHeading from "@/components/ui/SectionHeading";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, contactPageJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { CONTACT } from "@/data/contactSeo";

export const metadata = buildMetadata({
  title: CONTACT.seoTitle,
  description: CONTACT.description,
  path: "/contact",
});

const ICONS = {
  mail: Mail,
  person: UserRound,
  clock: Clock,
  bug: Bug,
  idea: Lightbulb,
  check: SearchCheck,
  legal: Scale,
  read: Inbox,
  reply: Reply,
  fix: Wrench,
};

function IconBadge({ name, size = 18 }) {
  const Glyph = ICONS[name] || Mail;
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
      <Glyph size={size} aria-hidden="true" />
    </div>
  );
}

export default function ContactPage() {
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
    contactPageJsonLd(),
    faqJsonLd(CONTACT.faq),
  ].filter(Boolean);

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="border-b border-line bg-paper py-14">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted">
            <Link href="/" className="hover:text-brand">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-ink">Contact</span>
          </nav>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{CONTACT.h1}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{CONTACT.intro}</p>
        </Container>
      </div>

      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="rounded-card border border-line bg-surface p-6 sm:p-8 lg:col-span-3">
            <h2 className="font-display text-lg font-bold text-ink">Send us a message</h2>
            <p className="mt-1 text-sm text-muted">
              Fill in the form and we will reply by email. Prefer your own mail app? Write to{" "}
              <a href={`mailto:${SITE.email}`} className="font-medium text-brand hover:text-brand-dark">
                {SITE.email}
              </a>
              .
            </p>
            <ContactForm />
          </div>

          <aside className="space-y-4 lg:col-span-2" aria-label="Contact details">
            {CONTACT.details.map((d) => (
              <div key={d.title} className="rounded-card border border-line bg-surface p-5">
                <div className="flex items-start gap-4">
                  <IconBadge name={d.icon} />
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-semibold text-ink">{d.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{d.text}</p>
                    {d.icon === "mail" && (
                      <a
                        href={`mailto:${SITE.email}`}
                        className="mt-2 inline-block break-all text-sm font-semibold text-brand hover:text-brand-dark"
                      >
                        {SITE.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </aside>
        </div>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Topics"
            title="What you can write to us about"
            description="Pick the closest topic in the form. If nothing fits, choose Something else and tell us in your own words."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT.reasons.map((r) => (
              <div key={r.title} className="rounded-card border border-line bg-surface p-5">
                <div className="mb-3">
                  <IconBadge name={r.icon} />
                </div>
                <h3 className="font-display text-sm font-semibold text-ink">{r.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Tips"
              title="How to get a faster answer"
              description="A clear message saves a round of questions. Here is what helps most."
            />
            <ul className="space-y-3">
              {CONTACT.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-light text-teal">
                    <Check size={13} aria-hidden="true" />
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading
              eyebrow="Process"
              title="What happens after you hit send"
              description="No black hole. Here is the path your message takes."
            />
            <ol className="space-y-4">
              {CONTACT.steps.map((step, i) => (
                <li key={step.title} className="flex items-start gap-4 rounded-card border border-line bg-surface p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Before you write"
            title="Your answer may already be here"
            description="These pages cover the questions we hear most."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT.quickLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group flex flex-col rounded-card border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
              >
                <h3 className="font-display text-sm font-semibold text-ink group-hover:text-brand">{l.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{l.text}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand">
                  Read more
                  <ArrowRight size={13} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading eyebrow="FAQ" title="Contact and support questions" />
          <FaqAccordion items={CONTACT.faq} columns />
        </section>
      </Container>
    </>
  );
}
