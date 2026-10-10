import { ShieldCheck, Gauge, Ban, RefreshCw } from "lucide-react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Your files stay yours",
    text: "Every tool runs as JavaScript in your own browser tab. A PDF, photo or line of code you work with is never uploaded, logged or stored on a server, so there's nothing for anyone else to see.",
  },
  {
    icon: Gauge,
    title: "No waiting on uploads",
    text: "Since there's no round-trip to a server, results show up as you type or drop a file in. No progress bar, no upload queue, no spinner before the real work even starts.",
  },
  {
    icon: Ban,
    title: "No sign-up, no paywall",
    text: "Every one of the 200+ tools is free with no usage cap and no watermark on your result. Open a tool and use it straight away. No account, no credit card, no catch.",
  },
  {
    icon: RefreshCw,
    title: "New tools added regularly",
    text: "The library grows based on what people actually search for and ask about. If a specific calculator or converter isn't here yet, it's worth checking back in a few weeks.",
  },
];

export default function WhyToolSlay() {
  return (
    <section className="border-t border-line bg-surface py-16">
      <Container>
        <SectionHeading
          eyebrow="Why Toolslay"
          title="Built to be fast, private and free"
          description="What actually makes a browser-based tool different from the average online converter that makes you upload a file and wait."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map(({ icon: PointIcon, title, text }) => (
            <div key={title} className="rounded-card border border-line bg-paper p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                <PointIcon size={20} aria-hidden="true" />
              </div>
              <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
