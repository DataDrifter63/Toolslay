# Toolslay

**200+ free, browser-based online tools** — PDF, image, video/audio, text, calculators, developer, generators, SEO and everyday-life tools. No sign-up, no uploads: everything runs client-side.

Live: [toolslay.com](https://toolslay.com)

**Stack:** Next.js 15 (App Router) · React 18 · Tailwind CSS 3 · Supabase (blog + admin auth) · Cloudinary (blog images) · Cloudflare Pages (hosting)

---

## 1. Getting started

```bash
npm install          # postinstall copies background-remover model assets to /public/imgly
npm run dev          # http://localhost:3000
```

Requires Node >= 18.18.

### Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
NEXT_PUBLIC_WEB3FORMS_KEY=
```

All are optional for local dev. `NEXT_PUBLIC_WEB3FORMS_KEY` is a free access key from web3forms.com for the contact inbox; without it the contact form falls back to opening the visitor's email app. Without Supabase the blog renders empty and `/admin` redirects to login. Without Cloudinary, blog image upload is unavailable.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (see Known issues) |
| `npm run pages:build` | Build for Cloudflare Pages (`npx @cloudflare/next-on-pages`) |
| `npm run pages:deploy` | Build + deploy via wrangler |

---

## 2. Project structure

```
src/
  app/
    page.js                     Homepage
    tools/page.js               /tools — search + filter grid
    tools/[slug]/page.js        /tools/<slug> — every tool (data-driven)
    category/[slug]/page.js     /category/<slug>
    blog/, blog/[slug]/         Blog (reads from Supabase)
    admin/                      Dashboard: login, posts list, new, edit (Supabase auth)
    about, contact, privacy-policy, terms
    sitemap.js, robots.js, opengraph-image.js, icon.svg

  components/
    layout/    Header, Footer, Container, NavSearch, CookieConsent
    home/      Hero, TrustStrip, CategoryGrid, PopularTools, WhyToolSlay, BlogTeaser, HomeFAQ
    tools/     ToolPageShell, ToolRenderer, ToolCard, ToolSearch, RelatedTools,
               ToolComingSoon, ToolLoading
    tools/ui/  Shared tool UI kit: Button, ToolInput, ToolTextarea, ToolSelect, ToolCheckbox,
               Toggle, Stepper, FormField, SettingsPanel, OutputPanel, CopyButton,
               DownloadButton, ToolLayout
    ui/        Badge, AdSlot, SectionHeading, Icon, AboutSection, FaqAccordion, ThemeToggle
    admin/     AdminGuard, AdminNav, LoginForm, PostForm
    contact/   ContactForm

  data/
    tools.js         Single source of truth for all tools
    categories.js    Category definitions
    related.js       Related-tools mapping

  tools-impl/
    registry.js      slug -> component map (next/dynamic, code-split per tool)
    <slug>/          One folder per tool (200 total)

  lib/
    constants.js     Site name, URL, description, social links
    seo.js           Metadata + JSON-LD builders
    toolContent.js   "About" copy + FAQ per tool
    supabase.js      Supabase client
    posts.js         Blog queries
    markdown.js      Markdown rendering
    cloudinary.js    Image upload helper

scripts/
  copy-imgly-assets.js   postinstall: copies @imgly/background-removal assets to /public/imgly
```

---

## 3. Categories

| Slug | Name |
|---|---|
| `calculators` | Calculators & Converters |
| `life-everyday-tools` | Life & Everyday Tools |
| `developer-tools` | Developer Tools |
| `generators-security` | Generators & Random Tools |
| `text-writing-tools` | Text & Writing Tools |
| `image-pdf-tools` | Image & PDF Tools |
| `seo-marketing-tools` | SEO & Marketing Tools |
| `design-color-tools` | Design & Color Tools |
| `video-audio-tools` | Video & Audio Tools |

---

## 4. Adding a new tool

1. **Register metadata** — add one object to `src/data/tools.js`:
   ```js
   { slug: "my-tool", name: "My Tool", category: "developer-tools", icon: "Code",
     description: "One-line description.", implemented: true }
   ```
   `icon` is any [lucide-react](https://lucide.dev/icons) name. Add `popular: true` to feature it on the homepage.
2. **Build the component** — `src/tools-impl/my-tool/MyTool.js` (client component, `"use client"`). Use the shared UI kit in `components/tools/ui/` for consistent look.
3. **Wire it up** — add one line to `src/tools-impl/registry.js`:
   ```js
   "my-tool": dynamic(() => import("./my-tool/MyTool"), { loading: ToolLoading }),
   ```
4. **(Optional)** add About/FAQ copy in `lib/toolContent.js` and related tools in `data/related.js`.

Route, SEO metadata, JSON-LD, sitemap entry and cards on home/category/tools pages are generated automatically. A tool without a registry entry shows `ToolComingSoon`.

**Heavy libraries** (`tesseract.js`, `jspdf`, `pdf-lib`, `@imgly/background-removal`) must be loaded with dynamic `import()` inside the component so they don't bloat other pages.

### Libraries by tool type

| Tool type | Library |
|---|---|
| Image compress | `browser-image-compression`, Canvas API |
| PDF create/edit | `pdf-lib`, `jspdf` |
| OCR | `tesseract.js` |
| Background removal | `@imgly/background-removal` (assets served from `/public/imgly`) |
| CSV | `papaparse` |
| QR codes | `qrcode` |
| Code formatting | `js-beautify` |
| Cron | `cron-parser`, `cronstrue` |

---

## 5. Supabase setup (blog + admin)

Run in the Supabase SQL editor:

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  meta_description text,
  cover_image text,
  category text,
  published_at timestamptz default now()
);
alter table posts enable row level security;
create policy "Public can read posts" on posts for select using (true);
```

Then add write policies for authenticated users (admin), create an admin user under Supabase Auth, and log in at `/admin/login`. `AdminGuard` protects all `/admin/*` routes client-side.

> Note: if your live `posts` table has extra columns beyond the above, keep this schema in sync.

---

## 6. Deployment (Cloudflare Pages)

```bash
npm run pages:build
npm run pages:deploy
```

Or connect the GitHub repo in the Cloudflare Pages dashboard:
- Build command: `npx @cloudflare/next-on-pages`
- Output directory: `.vercel/output/static`
- Environment variables: same as `.env.local`

`@cloudflare/next-on-pages` is intentionally not a dependency — `npx` fetches it at deploy time to avoid peer-dependency conflicts.

---

## 7. SEO

- Per-page metadata + canonical via `buildMetadata()` (`lib/seo.js`)
- JSON-LD: `SoftwareApplication` (tools), `BreadcrumbList` (tools/categories), `BlogPosting` (posts), `Organization` with `sameAs` social links
- Auto `sitemap.xml`, `robots.txt`, OG image
- Related-tools internal linking on every tool page
- Reserved `AdSlot` placeholders (prevent CLS). Ads are off until `ADS_LIVE` is set to `true` in `components/ui/AdSlot.js` after AdSense approval
- `CookieConsent` banner included for AdSense/EU compliance

---

## 8. Status

- **200 tools** registered in `tools.js` and `registry.js` (in sync)
- `implemented: true` on 197; 4 are flagged `implemented: false` (e.g. `speech-to-text`) — verify these flags against the registry
- Blog + admin dashboard built (auth, create/edit posts)

## 9. Known issues / TODO

- `next.config.mjs` sets `eslint.ignoreDuringBuilds: true` because of ~100 `react/no-unescaped-entities` errors. Fix and remove when convenient.
- `background-remover.patch` in the repo root is a leftover diff — delete if already applied.
- No `.env.example` committed — add one with the four variables above.
- Submit sitemap to Google Search Console after each major deploy.
