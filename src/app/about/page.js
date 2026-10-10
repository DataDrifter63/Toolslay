import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Icon from "@/components/ui/Icon";
import FaqAccordion from "@/components/ui/FaqAccordion";
import SectionHeading from "@/components/ui/SectionHeading";
import { TOOLS, getToolsByCategory } from "@/data/tools";
import { CATEGORIES } from "@/data/categories";
import { ABOUT } from "@/data/aboutSeo";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = buildMetadata({
  title: ABOUT.seoTitle,
  description: ABOUT.description,
  path: "/about",
});

export default function AboutPage() {
  const toolCount = TOOLS.length;
  const story = ABOUT.story.map((p) =>
    p.replace("{tools}", String(toolCount)).replace("{categories}", String(CATEGORIES.length))
  );

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
    faqJsonLd(ABOUT.faq),
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
            <span className="text-ink">About</span>
          </nav>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">About {SITE.name}</h1>
          <p className="mt-3 max-w-2xl text-base text-muted">
            {toolCount}+ free online tools for PDFs, images, text, calculators, and developers. We build them so
            you can finish a small job in your browser without an account or an install.
          </p>
        </Container>
      </div>

      <Container className="py-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-ink">Why we built {SITE.name}</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted">
              {story.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
            >
              Suggest a tool or report a mistake
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="h-fit rounded-card border border-line bg-surface p-6">
            <h2 className="font-display text-sm font-semibold text-ink">At a glance</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs text-muted">Tools available</dt>
                <dd className="font-display text-2xl font-bold text-ink">{toolCount}+</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Categories</dt>
                <dd className="font-display text-2xl font-bold text-ink">{CATEGORIES.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Account required</dt>
                <dd className="font-display text-2xl font-bold text-ink">Never</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Cost</dt>
                <dd className="font-display text-2xl font-bold text-ink">Free</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ABOUT.values.map((v) => (
            <div key={v.title} className="rounded-card border border-line bg-surface p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                <Icon name={v.icon} size={20} />
              </div>
              <h3 className="font-display text-sm font-semibold text-ink">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{v.text}</p>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Quality"
            title="How we build and check our tools"
            description="A tool is only useful when you can trust the answer. This is how we keep the pages accurate."
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {ABOUT.how.map((h) => (
              <div key={h.title} className="rounded-card border border-line bg-surface p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <Icon name={h.icon} size={20} />
                </div>
                <h3 className="font-display text-base font-semibold text-ink">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{h.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {[
            { t: "Who runs Toolslay", p: ABOUT.owner },
            { t: "How Toolslay pays for itself", p: ABOUT.money },
            { t: "Accuracy and limits", p: ABOUT.limits },
          ].map((b) => (
            <div key={b.t} className="rounded-card border border-line bg-surface p-6">
              <h2 className="font-display text-base font-semibold text-ink">{b.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.p}</p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Explore"
            title="What you can do on Toolslay"
            description="Pick a category to see every tool inside it."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex items-start gap-4 rounded-card border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: cat.accentLight, color: cat.accent }}
                >
                  <Icon name={cat.icon} size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-semibold text-ink group-hover:text-brand">{cat.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{cat.description}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand">
                    {getToolsByCategory(cat.slug).length} tools
                    <ArrowRight size={13} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <FaqAccordion items={ABOUT.faq} columns />
        </section>

        <div className="mt-16 rounded-card border border-line bg-brand-light p-8 text-center">
          <h2 className="font-display text-xl font-bold text-ink">Missing a tool, or found a mistake?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            Tell us what you need. We read every message and use it to decide what to build and fix next.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Contact us
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </>
  );
}
