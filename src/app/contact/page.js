import Link from "next/link";
import { ChevronRight, Mail, Bug, Sparkles } from "lucide-react";
import Container from "@/components/layout/Container";
import ContactForm from "@/components/contact/ContactForm";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Contact Us",
  description: "Get in touch with the ToolSlay team — report a bug or suggest a new tool.",
  path: "/contact",
});

const REASONS = [
  {
    icon: Bug,
    title: "Found a bug",
    text: "Tell us which tool, what you did, and what went wrong — we'll take a look.",
  },
  {
    icon: Sparkles,
    title: "Missing a tool",
    text: "If there's a tool you searched for and couldn't find, let us know and we'll consider adding it.",
  },
  {
    icon: Mail,
    title: "Anything else",
    text: "General feedback, questions, or just want to say hi — we read every message.",
  },
];

export default function ContactPage() {
  return (
    <>
      <div className="border-b border-line bg-paper py-14">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted">
            <Link href="/" className="hover:text-brand">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-ink">Contact</span>
          </nav>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Contact us</h1>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Found a bug, or want to suggest a new tool? Send us a message below.
          </p>
        </Container>
      </div>

      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="rounded-card border border-line bg-surface p-6 sm:p-8 lg:col-span-3">
            <h2 className="font-display text-lg font-bold text-ink">Send a message</h2>
            <p className="mt-1 text-sm text-muted">
              This opens your email app with the message pre-filled to {SITE.name.toLowerCase()}
              &apos;s inbox — review it and hit send.
            </p>
            <ContactForm />
          </div>

          <div className="space-y-4 lg:col-span-2">
            {REASONS.map(({ icon: ReasonIcon, title, text }) => (
              <div key={title} className="rounded-card border border-line bg-surface p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <ReasonIcon size={18} aria-hidden="true" />
                </div>
                <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
