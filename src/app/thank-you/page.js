import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, Wrench } from "lucide-react";
import Container from "@/components/layout/Container";
import ToolCard from "@/components/tools/ToolCard";
import SectionHeading from "@/components/ui/SectionHeading";
import ThankYouNote from "@/components/contact/ThankYouNote";
import { getPopularTools } from "@/data/tools";
import { THANK_YOU } from "@/data/contactSeo";
import { SITE } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

// Confirmation page after the contact form. It stays out of search results and the sitemap.
export const metadata = buildMetadata({
  title: THANK_YOU.seoTitle,
  description: THANK_YOU.description,
  path: "/thank-you",
  noIndex: true,
});

export default function ThankYouPage() {
  const popular = getPopularTools(3);

  return (
    <>
      <div className="relative overflow-hidden border-b border-line bg-paper">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-light opacity-80 blur-3xl"
        />
        <Container className="relative py-16 text-center sm:py-24">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-light text-teal ring-8 ring-teal-light/60">
            <CheckCircle2 size={40} aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-teal">Message received</p>
          <h1 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold text-ink sm:text-4xl">
            {THANK_YOU.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">{THANK_YOU.intro}</p>

          <Suspense fallback={null}>
            <ThankYouNote />
          </Suspense>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              <Home size={16} aria-hidden="true" />
              Back to home
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
            >
              <Wrench size={16} aria-hidden="true" />
              Browse all tools
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-14">
        <section>
          <SectionHeading eyebrow="Next" title="What happens now" />
          <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {THANK_YOU.steps.map((step, i) => (
              <li key={step.title} className="rounded-card border border-line bg-surface p-6">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {i + 1}
                </div>
                <h2 className="font-display text-base font-semibold text-ink">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {popular.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow="While you wait"
              title="Try a popular tool"
              description="Free, no sign-up, and ready on the same page."
              action={
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
                >
                  View all tools
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        )}

        <p className="mt-14 text-center text-sm text-muted">
          Need to add something to your message? Email us at{" "}
          <a href={`mailto:${SITE.email}`} className="font-medium text-brand hover:text-brand-dark">
            {SITE.email}
          </a>
          .
        </p>
      </Container>
    </>
  );
}
