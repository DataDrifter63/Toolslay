import { ShieldCheck, Gauge, Ban, RefreshCw } from "lucide-react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Your files stay yours",
    text: "Every tool runs in your browser. Files, text and images you work with are never uploaded to a server — they never leave your device.",
  },
  {
    icon: Gauge,
    title: "No waiting on uploads",
    text: "Because there's no round-trip to a server, tools respond instantly — no progress bar, no queue, no waiting for a large file to upload before it even starts processing.",
  },
  {
    icon: Ban,
    title: "No sign-up, no paywall",
    text: "Every tool on ToolSlay is free with no usage cap, no watermark, and no account required. Open a tool and start using it immediately.",
  },
  {
    icon: RefreshCw,
    title: "New tools added regularly",
    text: "The tool library grows based on what people search for and ask about. If a tool you need isn't here yet, it's worth checking back.",
  },
];

export default function WhyToolSlay() {
  return (
    <section className="border-t border-line bg-surface py-16">
      <Container>
        <SectionHeading
          eyebrow="Why ToolSlay"
          title="Built to be fast, private and free"
          description="A quick look at what makes browser-based tools different from the average online converter."
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
