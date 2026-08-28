# ToolSlay

Free, browser-based online tools (PDF, image, text, calculators, developer tools, generators).
Next.js 15 (App Router) + Tailwind CSS + Supabase (blog & admin) + Cloudflare Pages hosting.

This project was scaffolded to match the project spec doc: SEO-first structure, flat URLs,
internal linking, and a config-driven tools list so adding a new tool never means restructuring
the site.

---

## 1. Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase keys (see section 4) — optional to start
npm run dev
```

Open http://localhost:3000. The homepage, all 40 tool routes, all 6 category pages, and the
static pages (About/Contact/Privacy/Terms) work immediately — no Supabase setup required. Blog
sections simply render empty until Supabase is connected.

---

## 2. Project structure

```
src/
  app/                    → routes (Next.js App Router — one folder = one URL)
    page.js               → homepage
    tools/page.js         → /tools (search + filter grid)
    tools/[slug]/page.js  → /tools/word-counter etc. (all 40 tools, data-driven)
    category/[slug]/page.js → /category/calculators etc. (all 6 categories)
    blog/page.js          → /blog
    blog/[slug]/page.js   → /blog/some-post (reads from Supabase)
    about, contact, privacy-policy, terms → static pages
    admin/page.js         → placeholder for the Supabase-auth dashboard
    sitemap.js            → auto-generated sitemap.xml
    robots.js             → auto-generated robots.txt

  components/
    layout/               → Header, Footer, Container
    home/                 → Hero, TrustStrip, CategoryGrid, PopularTools, BlogTeaser
    tools/                → ToolCard, ToolSearch, ToolPageShell, RelatedTools, ToolComingSoon
    ui/                   → Badge, AdSlot, SectionHeading, Icon
    contact/              → ContactForm (client component)

  data/
    tools.js              → ⭐ single source of truth: all 40 tools (name, slug, category, description, icon)
    categories.js         → the 6 categories (name, slug, color, description)

  tools-impl/
    registry.js           → maps a tool's slug → its real React component
    word-counter/          → fully working example tool
    bmi-calculator/         → fully working example tool

  lib/
    constants.js           → site name/url/description
    seo.js                 → metadata + JSON-LD builders
    supabase.js             → Supabase client
    posts.js                → blog post queries
```

---

## 3. Adding a new tool (the whole workflow)

1. **Add one object to `src/data/tools.js`** — name, slug, category, icon (any [lucide-react](https://lucide.dev/icons) name), description.
   → The route `/tools/your-slug`, its SEO metadata, its sitemap entry, and its card on the
   homepage/category/all-tools pages all exist immediately — it will show a "coming soon" state.
2. **Build the tool's UI** as a client component in `src/tools-impl/your-tool/YourTool.js`
   (see `word-counter/WordCounter.js` or `bmi-calculator/BmiCalculator.js` as a pattern).
3. **Register it**: add one line to `src/tools-impl/registry.js`.
4. Done — no routing, SEO, or layout code to touch.

### Libraries already installed for specific tool types
| Tool type | Library |
|---|---|
| Image resize/compress | `browser-image-compression`, Canvas API |
| PDF create/convert | `pdf-lib`, `jspdf` |
| OCR (Image to Text, Screenshot to Text) | `tesseract.js` — **dynamic `import()`** it inside the component so it doesn't bloat every other page's JS bundle |
| CSV/Excel | `papaparse` |
| QR codes | `qrcode` |

---

## 4. Setting up Supabase (blog + admin dashboard)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run:
   ```sql
   create table posts (
     id uuid primary key default gen_random_uuid(),
     title text not null,
     slug text unique not null,
     content text not null,           -- sanitized HTML from the admin editor
     meta_description text,
     cover_image text,
     category text,
     published_at timestamptz default now()
   );
   alter table posts enable row level security;
   create policy "Public can read posts" on posts for select using (true);
   ```
3. Copy your Project URL and `anon` public key into `.env.local` (see `.env.example`).
4. Blog pages will now populate automatically — no code changes needed.
5. The `/admin` route is a placeholder. Wire up `supabase.auth.signInWithPassword()` and a
   protected layout, then build simple insert/update/delete forms against the `posts` table.

---

## 5. Deployment (Cloudflare Pages)

Per the project spec, hosting is Cloudflare Pages — unlimited bandwidth on static assets, and
commercial use (AdSense) is explicitly allowed (unlike Vercel's free Hobby tier).

```bash
npm run pages:build     # downloads @cloudflare/next-on-pages on demand and builds
npm run pages:deploy    # deploys to Cloudflare Pages via wrangler
```

Note: `@cloudflare/next-on-pages` is intentionally **not** a project dependency — it's only
needed at deploy time, and `npx` fetches it fresh when you run the command above. This avoids a
known version conflict between its `wrangler`/`workers-types` peer dependencies and keeps local
`npm install` clean for everyday development.

Or connect the GitHub repo directly in the Cloudflare Pages dashboard and set:
- Build command: `npx @cloudflare/next-on-pages`
- Build output directory: `.vercel/output/static`
- Environment variables: same as `.env.local`

Point your domain's DNS to Cloudflare Pages once deployed.

---

## 6. SEO checklist already wired in

- [x] Per-page metadata (title, description, canonical) via `buildMetadata()`
- [x] JSON-LD: `SoftwareApplication` on every tool page, `BreadcrumbList` on tool + category pages, `BlogPosting` on posts
- [x] Auto-generated `sitemap.xml` and `robots.txt` (`src/app/sitemap.js`, `robots.js`)
- [x] Breadcrumbs on tool and category pages
- [x] Internal linking: related tools on every tool page, category cross-links in the footer
- [x] Reserved `<AdSlot />` placeholders so ads won't shift layout (protects Core Web Vitals / CLS) once AdSense is approved
- [ ] Still to do per tool: 300–500 words of unique "About this tool" copy + FAQ (see the `about`/`faq` props on `ToolPageShell`)
- [ ] Submit sitemap to Google Search Console after first deploy

---

## 7. What's implemented vs. placeholder right now

- **Fully working**: Word Counter, BMI Calculator — use these as the pattern for the rest.
- **Routes live, "coming soon" UI**: the other 38 tools (they're fully indexable and linked
  already — just swap in real components as you build them, per section 3 above).
- **Blog & Admin**: data layer and routes are ready; UI for the admin dashboard (auth + post
  forms) still needs to be built.
