import Link from "next/link";
import { Search } from "lucide-react";
import WordCounter from "@/tools-impl/word-counter/WordCounter";

export default function Hero() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto grid max-w-container grid-cols-1 items-center gap-10 px-5 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20 lg:px-8">
        <div>
          <span className="inline-block rounded-md bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
            40+ browser tools · no sign-up
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            Every tool your day needs. Nothing to install.
          </h1>
          <p className="mt-4 max-w-md text-base text-muted">
            PDF, image, text, calculators and developer tools — all free, all running right in
            your browser. Nothing uploads to a server.
          </p>

          <Link
            href="/tools"
            className="mt-6 flex max-w-md items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted transition hover:border-brand hover:text-ink"
          >
            <Search size={18} aria-hidden="true" />
            Try &quot;word counter&quot;, &quot;bmi&quot;, &quot;json formatter&quot;...
          </Link>
        </div>

        <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal">
            Live demo — word counter
          </p>
          <WordCounter compact />
          <Link
            href="/tools/word-counter"
            className="mt-4 inline-block text-sm font-medium text-brand hover:text-brand-dark"
          >
            Open the full tool →
          </Link>
        </div>
      </div>
    </section>
  );
}
