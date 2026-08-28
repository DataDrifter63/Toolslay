import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/ui/Icon";
import { CATEGORIES } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools";

export default function CategoryGrid() {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          eyebrow="Browse"
          title="Find tools by category"
          description="40+ tools organized into six categories so you can get to the right one fast."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const count = getToolsByCategory(cat.slug).length;
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex flex-col rounded-card border border-line bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
                style={{ borderLeftWidth: 3, borderLeftColor: cat.accent }}
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: cat.accentLight, color: cat.accent }}
                >
                  <Icon name={cat.icon} size={22} />
                </div>
                <h3 className="font-display text-base font-semibold text-ink">{cat.name}</h3>
                <p className="mt-1.5 text-sm text-muted">{cat.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">{count} tools</span>
                  <ArrowRight
                    size={16}
                    className="text-brand transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
