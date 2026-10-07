// Per-tool SEO copy. ONE entry per tool, keyed by slug (must match src/data/tools.js).
//
// What an entry controls on /tools/<slug>:
//   seoTitle          <title> tag (the site adds " | Toolslay" itself, so max 50 chars, no brand)
//   seoDescription    meta description (130 to 155 chars)
//   h1                the page's H1 (max 60 chars)
//   shortDescription  the one-line intro under the H1 (20 to 30 words); also used in JSON-LD
//   about             exactly 5 strings: [lead, left 1, left 2, right 1, right 2]
//   faq               [{ q, a }], 6 items (8 allowed for tier A+/A tools)
//   highlights        OPTIONAL, up to 3 badges [{ icon, label }] shown in the About card.
//                     Icon must be a name registered in src/components/ui/Icon.js.
//                     Only claim what the tool's code really does.
//
// Tools WITHOUT an entry keep their old auto-generated page, but are set to noindex and
// left out of sitemap.xml. When every tool has copy (or on launch day), set
// NEXT_PUBLIC_INDEX_ALL_TOOLS=true in the host's env vars, or flip the constant below.
//
// Run `npm run check:seo` after adding entries. Run `npm run seo:next` to get the next
// tools to write, already formatted as input blocks for the AI prompt (docs/SEO_CONTENT_PROMPT.md).
//
// Keep this file data-only (no imports): scripts/check-seo.mjs loads it directly.

export const INDEX_ALL_TOOLS = process.env.NEXT_PUBLIC_INDEX_ALL_TOOLS === "true";

export const TOOL_SEO = {
  "utm-link-builder": {
    seoTitle: "UTM Builder: Create Campaign Tracking Links",
    seoDescription:
      "Use this UTM builder to tag any URL with source, medium and campaign values, then copy the link and track every click in Google Analytics.",
    h1: "UTM Builder",
    shortDescription:
      "Add source, medium and campaign tags to any link with this UTM builder, then copy a tracked URL for your next ad, email or post.",
    about: [
      "A UTM builder adds tracking tags to a normal link, so Google Analytics can tell which email, ad or post sent each visitor. Marketers, founders and agency teams use it to stop guessing which campaign worked. Enter your URL, fill in a few fields, and copy a link that reports where its clicks came from.",
      "UTM stands for Urchin Tracking Module. Each tag is a small query parameter added after a question mark. Use utm_source for where the click came from, such as newsletter or google. Then utm_medium names the channel, like email or cpc, and utm_campaign names the push, for example spring_sale. Two optional tags, utm_term and utm_content, separate paid keywords and ad variations in your reports.",
      "Naming consistency matters more than clever names. Analytics treats Email and email as two different values, so one typo splits your report in half. Pick lowercase, agree on one separator, and keep a shared list of approved values so every teammate tags links the same way. A clean example is utm_source=newsletter, utm_medium=email and utm_campaign=spring_sale. Skip UTM tags on links inside your own site, because they can misattribute the visit.",
      "This UTM generator starts with your destination URL. It adds https:// when you leave it off and keeps any query parameters already on the link. Then fill in source, medium and campaign, or click a preset (Google Ads, Meta Ads, TikTok Ads or Newsletter) to fill the first two. An empty campaign becomes promo_2026. Term and content are optional. Copy puts the finished link on your clipboard.",
      "Force Lowercase is on by default, and spaces become underscores unless you switch to a dash or %20. Match your team's style. Save to Vault keeps your last 10 links in this browser's local storage, and Clear removes them. The QR code preview comes from an outside service, api.qrserver.com, which receives the full link. Skip it for private URLs.",
    ],
    faq: [
      {
        q: "What does a UTM link actually do?",
        a: "It tells your analytics tool where a visit came from. The tags sit in the URL after a question mark, and Google Analytics reads them when someone clicks. Without tags, that visit often lands in a vague bucket like direct or referral, and you can't compare one campaign against another.",
      },
      {
        q: "Which UTM parameters do I need?",
        a: "Use utm_source, utm_medium and utm_campaign every time. Add utm_term for paid search keywords and utm_content when you test two versions of one ad. This tool marks term and content as optional and only adds the fields you fill in, so a short link stays short.",
      },
      {
        q: "Do UTM parameters hurt SEO?",
        a: "No, they do not change the page itself. Search engines usually treat a tagged URL as a copy of the original, and a canonical tag helps them settle on one version. Keep tagged links for ads, emails and social posts, and avoid using them in your own navigation or internal links.",
      },
      {
        q: "Should I use underscores or dashes in UTM values?",
        a: "Either works. Consistency matters more than the symbol. This tool defaults to underscores, and you can switch to dashes or %20 with the space option. Pick one style, keep values lowercase, and use the same names across your team so your reports group each campaign correctly.",
      },
      {
        q: "Does this UTM generator store or send my links?",
        a: "The link is built in your browser as you type. Two features touch your data: Save to Vault keeps your last 10 links in this browser's local storage, and the QR preview sends the full link to api.qrserver.com. Skip both for unreleased pages, or clear the vault when you finish.",
      },
      {
        q: "Can I use these links outside Google Analytics?",
        a: "Often, yes. Many analytics and marketing platforms read the same utm_ parameters, but each one decides how to report them. Build the link once, test a click, and check how your platform shows source, medium and campaign before you send the link to a large email list or ad account.",
      },
    ],
    highlights: [
      { icon: "Check", label: "Free, no sign-up" },
      { icon: "Clock", label: "Keeps your last 10 links on this device" },
    ],
  },
};

export function getToolSeo(slug) {
  return TOOL_SEO[slug] || null;
}

// A tool page is indexable (and listed in sitemap.xml) once it has an entry above,
// or when INDEX_ALL_TOOLS is on.
export function isToolIndexable(slug) {
  return INDEX_ALL_TOOLS || Boolean(TOOL_SEO[slug]);
}
