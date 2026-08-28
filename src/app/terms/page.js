import Container from "@/components/layout/Container";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: `Terms of Service for using ${SITE.name}'s free online tools.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <Container className="py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink">Terms of Service</h1>
        <p className="mt-2 text-xs text-muted">Last updated: [DATE]</p>

        <div className="prose prose-sm mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">1. Acceptance of terms</h2>
            <p className="mt-2">
              By using {SITE.name} ({SITE.url}), you agree to these Terms of Service. If you do
              not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">2. Use of tools</h2>
            <p className="mt-2">
              Our tools are provided free of charge, &quot;as is&quot;, for personal and commercial use. We
              do not guarantee that any tool will be error-free, uninterrupted, or fit for a
              specific purpose. You are responsible for verifying results before relying on them
              (e.g. calculator outputs, converted files).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">3. No warranty</h2>
            <p className="mt-2">
              {SITE.name} is provided without warranties of any kind, express or implied. We are
              not liable for any loss or damage arising from your use of the site or its tools.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">4. Acceptable use</h2>
            <p className="mt-2">
              You agree not to misuse the site — including attempting to disrupt service,
              scraping content at scale, or using generated content (e.g. QR codes, passwords,
              fake data) for unlawful purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">5. Advertising</h2>
            <p className="mt-2">
              This site displays advertisements, including through Google AdSense, to keep tools
              free. See our{" "}
              <a href="/privacy-policy" className="text-brand underline">
                Privacy Policy
              </a>{" "}
              for details on how ads and cookies work.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">6. Changes</h2>
            <p className="mt-2">
              We may update these terms at any time. Continued use of the site after changes are
              posted means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">7. Contact</h2>
            <p className="mt-2">
              Questions? Reach out via our{" "}
              <a href="/contact" className="text-brand underline">
                contact page
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
