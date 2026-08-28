import Link from "next/link";
import Container from "./Container";
import { CATEGORIES } from "@/data/categories";
import { getPopularTools } from "@/data/tools";
import { SITE } from "@/lib/constants";

export default function Footer() {
  const popular = getPopularTools(6);

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid grid-cols-2 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="font-display text-lg font-bold text-ink">
            Tool<span className="text-brand">Slay</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">{SITE.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Categories</h3>
          <ul className="mt-4 space-y-3">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/category/${cat.slug}`} className="text-sm text-muted hover:text-brand">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Popular tools</h3>
          <ul className="mt-4 space-y-3">
            {popular.map((tool) => (
              <li key={tool.slug}>
                <Link href={`/tools/${tool.slug}`} className="text-sm text-muted hover:text-brand">
                  {tool.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/tools" className="text-sm font-medium text-brand hover:text-brand-dark">
                View all tools →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Company</h3>
          <ul className="mt-4 space-y-3">
            <li><Link href="/about" className="text-sm text-muted hover:text-brand">About</Link></li>
            <li><Link href="/blog" className="text-sm text-muted hover:text-brand">Blog</Link></li>
            <li><Link href="/contact" className="text-sm text-muted hover:text-brand">Contact</Link></li>
            <li><Link href="/privacy-policy" className="text-sm text-muted hover:text-brand">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-sm text-muted hover:text-brand">Terms of Service</Link></li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-line py-6">
        <Container className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted">Every tool runs 100% in your browser.</p>
        </Container>
      </div>
    </footer>
  );
}
