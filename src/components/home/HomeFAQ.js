import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FaqAccordion from "@/components/ui/FaqAccordion";

const FAQ = [
  {
    q: "Are Toolslay's tools really free?",
    a: "Yes, completely. Every one of the 200+ tools is free with no usage limits, no watermark on your results and no account required to get started.",
  },
  {
    q: "Do I need to install anything to use Toolslay?",
    a: "No. Every tool runs directly in your web browser as JavaScript, so there's nothing to download, nothing to install, and nothing to keep updated later.",
  },
  {
    q: "Is it safe to use these tools with private files or sensitive data?",
    a: "Yes. Files, text and images are processed locally in your browser and never uploaded to a server, so nothing you work with, including anything sensitive, ever leaves your device.",
  },
  {
    q: "Why doesn't Toolslay ask me to sign up or create an account?",
    a: "Because none of the tools need one. Processing happens entirely client-side, so there's nothing to save to an account and no reason to collect your email just to let you convert a file.",
  },
  {
    q: "Can I use Toolslay on my phone?",
    a: "Yes, every tool works on mobile browsers as well as desktop. There's no separate app to download, and a tool behaves the same way on a phone as it does on a laptop.",
  },
  {
    q: "What kinds of tools does Toolslay offer?",
    a: "Nine categories: PDF and image editing, video and audio, text and writing, developer utilities, calculators and converters, password and QR code generators, color and design tools, SEO checks, and everyday planners for pets, travel and home.",
  },
  {
    q: "How is Toolslay different from other online converter sites?",
    a: "Most converter sites upload your file to a server, process it there, and send the result back. Toolslay runs the conversion in your browser instead, so there's no upload step, no waiting on a queue, and nothing of yours sitting on someone else's server afterward.",
  },
  {
    q: "How often are new tools added?",
    a: "Regularly, based on what people actually search for and ask about. Check the All Tools page any time for the current full list.",
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
          description="Straight answers about how Toolslay's free online tools actually work."
        />
        <FaqAccordion items={FAQ} />
      </Container>
    </section>
  );
}
