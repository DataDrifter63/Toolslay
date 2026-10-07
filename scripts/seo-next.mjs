#!/usr/bin/env node
// Prints the next tools that still need SEO copy, already formatted as input blocks for the
// AI prompt in docs/SEO_CONTENT_PROMPT.md.
//
//   npm run seo:next                 -> next 5 tools (A first, then B, then C; biggest volume first)
//   npm run seo:next -- --count 4    -> next 4
//   npm run seo:next -- --tier A     -> only tier A (A+ counts as A)
//   npm run seo:next -- --category developer-tools
//   npm run seo:next -- --slug word-counter,case-converter   -> specific tools
//   npm run seo:next -- --list       -> compact progress list instead of blocks
import { loadTools, loadToolSeo, loadKeywords, loadRegistryFolders, toolFacts } from "./lib/seo-shared.mjs";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
};

const tools = await loadTools();
const seo = await loadToolSeo();
const kw = loadKeywords();
const registry = loadRegistryFolders();

const tierRank = (t) => ({ "A+": 0, A: 0, B: 1, C: 2 }[t] ?? 3);
const count = Number(opt("count", 5));
const tierFilter = opt("tier", null);
const catFilter = opt("category", null);
const slugFilter = opt("slug", null);

let pool = tools.filter((t) => t.implemented);
if (slugFilter) {
  const wanted = String(slugFilter).split(",").map((s) => s.trim());
  pool = pool.filter((t) => wanted.includes(t.slug));
} else {
  pool = pool.filter((t) => !seo[t.slug]);
}
if (tierFilter) pool = pool.filter((t) => (kw[t.slug]?.tier || "").startsWith(String(tierFilter).replace("+", "")));
if (catFilter) pool = pool.filter((t) => t.category === catFilter);

pool.sort((a, b) => {
  const ka = kw[a.slug] || {}, kb = kw[b.slug] || {};
  return tierRank(ka.tier) - tierRank(kb.tier) || Number(kb.primary_volume || 0) - Number(ka.primary_volume || 0);
});

const done = tools.filter((t) => t.implemented && seo[t.slug]).length;
const total = tools.filter((t) => t.implemented).length;

if (opt("list", false)) {
  console.log(`Progress: ${done}/${total} tools have an entry in toolSeo.js\n`);
  for (const t of pool) {
    const k = kw[t.slug] || {};
    console.log(`${(k.tier || "?").padEnd(2)}  ${String(k.primary_volume || "").padStart(7)}  ${t.slug}  [${k.primary || "no keyword"}]`);
  }
  process.exit(0);
}

const pick = slugFilter ? pool : pool.slice(0, count);
console.log(`# Progress: ${done}/${total} done. Showing ${pick.length} tool(s). Paste the blocks below after the prompt.\n`);
for (const t of pick) {
  const k = kw[t.slug] || {};
  const f = toolFacts(t.slug, registry);
  const vol = (v, d) => (v ? ` (${Number(v).toLocaleString("en-US")}/mo, KD ${d})` : "");
  console.log(`TOOL: ${t.slug}`);
  console.log(`NAME: ${t.name}  |  CATEGORY: ${t.category}`);
  if (f) console.log(`CODE: ${f.dir}/`);
  console.log(`PRIMARY: ${k.primary || "(none in sheet, pick the best fit from the tool's purpose)"}${vol(k.primary_volume, k.primary_kd)}`);
  console.log(`SECONDARY: ${k.secondary || "(none)"}${vol(k.secondary_volume, k.secondary_kd)}`);
  console.log(`EXTRA IDEAS: ${k.extra_ideas || "(none)"}`);
  console.log(`TIER: ${k.tier || "?"}`);
  console.log(`NOTES: ${k.notes || "(none)"}`);
  if (f && (f.network.length || f.storage.length || f.hosts.length)) {
    console.log(`CODE FLAGS (auto-detected, mention honestly in the copy): ${[...f.network, ...f.storage, ...f.hosts.map((h) => "calls " + h)].join(", ")}`);
  }
  console.log("");
}
