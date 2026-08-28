import Container from "@/components/layout/Container";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE.name} — how we handle your data and use cookies/advertising.`,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <Container className="py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink">Privacy Policy</h1>
        <p className="mt-2 text-xs text-muted">Last updated: [DATE]</p>

        <div className="prose prose-sm mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">1. Overview</h2>
            <p className="mt-2">
              {SITE.name} (&quot;we&quot;, &quot;us&quot;) provides free online tools at {SITE.url}. This policy
              explains what data is collected when you use the site and how it is used. Replace
              the bracketed placeholders below with your actual company/contact details before
              publishing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">2. Tool data stays on your device</h2>
            <p className="mt-2">
              Every tool on {SITE.name} runs client-side, in your browser. Files and text you
              enter into a tool (images, PDFs, JSON, passwords generated, etc.) are processed
              locally and are never uploaded to our servers unless a tool explicitly says
              otherwise.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">3. Cookies and advertising</h2>
            <p className="mt-2">
              We use Google AdSense to display ads. Google and its partners may use cookies to
              serve ads based on your prior visits to this and other websites. You may opt out of
              personalized advertising by visiting{" "}
              <a href="https://adssettings.google.com" className="text-brand underline">
                Google Ads Settings
              </a>
              . Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s
              prior visits.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">4. Analytics</h2>
            <p className="mt-2">
              We use Google Analytics to understand aggregate traffic patterns (pages visited,
              approximate location, device type). This data is anonymized and is not linked to
              individually identifiable information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">5. Blog comments and contact form</h2>
            <p className="mt-2">
              If you contact us via the contact form, we use the information you provide (name,
              email, message) only to respond to your inquiry.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">6. Children&apos;s privacy</h2>
            <p className="mt-2">
              {SITE.name} is not directed at children under 13, and we do not knowingly collect
              personal information from children.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">7. Changes to this policy</h2>
            <p className="mt-2">
              We may update this policy from time to time. Changes will be posted on this page
              with an updated &quot;last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">8. Contact</h2>
            <p className="mt-2">
              Questions about this policy? Reach out via our{" "}
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
