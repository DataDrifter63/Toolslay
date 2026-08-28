import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import CategoryGrid from "@/components/home/CategoryGrid";
import PopularTools from "@/components/home/PopularTools";
import WhyToolSlay from "@/components/home/WhyToolSlay";
import HomeFAQ, { HOME_FAQ } from "@/components/home/HomeFAQ";
import BlogTeaser from "@/components/home/BlogTeaser";
import AdSlot from "@/components/ui/AdSlot";
import Container from "@/components/layout/Container";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Free Online Tools — PDF, Image, Text & Calculators",
  description: SITE.description,
  path: "/",
});

export default function HomePage() {
  const jsonLd = faqJsonLd(HOME_FAQ);
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <Hero />
      <TrustStrip />
      <CategoryGrid />
      <PopularTools />
      <Container>
        <AdSlot className="mb-4" />
      </Container>
      <WhyToolSlay />
      <HomeFAQ />
      <BlogTeaser />
    </>
  );
}
