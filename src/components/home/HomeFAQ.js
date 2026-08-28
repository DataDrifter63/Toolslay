import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FaqAccordion from "@/components/ui/FaqAccordion";

const FAQ = [
  {
    q: "Are ToolSlay's tools really free?",
    a: "Yes — every tool is free to use, with no usage limits, no watermark on your results, and no account required.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Every tool runs directly in your web browser. There's nothing to download and nothing to install.",
  },
  {
    q: "Is it safe to use these tools with private files or data?",
    a: "Yes. Files, text and images are processed locally in your browser and are never uploaded to a server, so nothing you work with ever leaves your device.",
  },
  {
    q: "Can I use ToolSlay on my phone?",
    a: "Yes, every tool works on mobile browsers as well as desktop — there's no separate app needed.",
  },
  {
    q: "How often are new tools added?",
    a: "New tools are added regularly based on what people search for. Check the All Tools page for the current full list.",
  },
];

export { FAQ as HOME_FAQ };

export default function HomeFAQ() {
  return (
    <section className="py-16">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions"
          description="Quick answers about how ToolSlay works."
        />
        <FaqAccordion items={FAQ} />
      </Container>
    </section>
  );
}
