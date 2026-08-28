import Link from "next/link";
import { ChevronRight, ShieldCheck, Zap, Wrench, Heart, ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import { TOOLS } from "@/data/tools";
import { CATEGORIES } from "@/data/categories";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "About Us",
  description: `About ${SITE.name} — free, browser-based online tools with no sign-up required.`,
  path: "/about",
});

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Privacy by default",
    text: "Every tool runs in your browser. Files and text you work with are never uploaded to a server.",
  },
  {
    icon: Zap,
    title: "Fast, on purpose",
    text: "No upload queue, no server round-trip — tools respond as fast as your own device can process them.",
  },
  {
    icon: Wrench,
    title: "Actually free",
    text: "No account, no watermark, no daily limit and no premium tier hiding behind a paywall.",
  },
  {
    icon: Heart,
    title: "Built from real requests",
    text: "New tools get added based on what people search for and ask about — not a fixed roadmap.",
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="border-b border-line bg-paper py-14">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted">
            <Link href="/" className="hover:text-brand">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-ink">About</span>
          </nav>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            About {SITE.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted">
            {TOOLS.length}+ free online tools built for one job: let you get something done in
            your browser, right now, without creating an account or installing anything.
          </p>
        </Container>
      </div>

      <Container className="py-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4 text-sm leading-relaxed text-muted">
              <p>
                {SITE.name} started from a simple frustration: most free online tools make you
                upload a file, wait for it to process on someone else&apos;s server, then hope the
                result doesn&apos;t come back with a watermark or a sign-up wall. We wanted
                something faster and more private than that.
              </p>
              <p>
                Every tool here runs client-side. When you resize an image, format some JSON, or
                calculate a BMI, that work happens on your own device — nothing is uploaded to a
                server. That means your files and data stay private, and the tools stay fast
                regardless of your connection speed.
              </p>
              <p>
                We add new tools regularly based on what people search for and ask about. If
                there&apos;s a tool you&apos;d like to see, reach out through the contact page —
                we read every message.
              </p>
            </div>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
            >
              Suggest a tool or report a bug
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-card border border-line bg-surface p-6">
            <h2 className="font-display text-sm font-semibold text-ink">At a glance</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs text-muted">Tools available</dt>
                <dd className="font-display text-2xl font-bold text-ink">{TOOLS.length}+</dd>
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

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: ValueIcon, title, text }) => (
            <div key={title} className="rounded-card border border-line bg-surface p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                <ValueIcon size={20} aria-hidden="true" />
              </div>
              <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
