#!/usr/bin/env node
// Checks every entry in src/data/toolSeo.js against the rules in docs/SEO_CONTENT_PROMPT.md.
//
//   npm run check:seo                      check all entries
//   npm run check:seo -- --slug a,b        check only these slugs
//   npm run check:seo -- --strict          warnings also fail the run
//   npm run check:seo -- --quiet           hide entries with no problems
//
// ERR  = must fix (exit code 1).   WARN = read it and decide.
// It cannot judge whether the copy "sounds human", and the passive-voice check is a rough estimate.
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadTools, loadToolSeo, loadKeywords, loadRegistryFolders, toolFacts, norm } from "./lib/seo-shared.mjs";

const args = process.argv.slice(2);
const STRICT = args.includes("--strict");
const QUIET = args.includes("--quiet");
const slugArg = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;

const tools = await loadTools();
const seo = await loadToolSeo();
const kw = loadKeywords();
const registry = loadRegistryFolders();
const toolBySlug = Object.fromEntries(tools.map((t) => [t.slug, t]));

// icon names registered in Icon.js
const iconSrc = fs.readFileSync(path.join(ROOT, "src/components/ui/Icon.js"), "utf8");
const iconBlock = (iconSrc.match(/const ICONS = \{([\s\S]*?)\n\};/) || [])[1] || "";
const ICONS = new Set([...iconBlock.matchAll(/^\s*([A-Za-z0-9]+)/gm)].map((m) => m[1]));

const BANNED = [
  "in today's digital world", "seamless", "powerful", "robust", "leverage", "unlock", "elevate",
  "game-changer", "game changer", "dive into", "navigate", "delve", "harness", "streamline",
  "cutting-edge", "cutting edge", "comprehensive", "ultimate guide", "look no further",
  "it's important to note", "it is important to note", "moreover", "furthermore", "additionally",
  "in conclusion", "whether you're a", "whether you are a",
];
const PRIVACY_CLAIM =
  /(runs? (entirely|completely|fully)? ?in your browser|entirely in your browser|nothing (is )?(stored|saved|uploaded|sent|logged)|never leaves? your (device|browser|computer)|(isn't|aren't|is not|are not) (stored|logged|uploaded|saved|sent|tracked)|100% private|no (data|files?) (is |are )?(uploaded|stored|sent)|processed locally|stays? (on|in) your (device|browser)|nothing leaves|no server|without uploading|no upload|doesn't (store|upload|send|log)|does not (store|upload|send|log))/i;
const WEAK_CLAIM = /(free forever|no limits?\b|unlimited|most accurate|100% accurate|guaranteed|\binstant(ly)?\b)/i;
const SENSITIVE_SLUG = /(bmi|calorie|pregnan|loan|emi|mortgage|salary|tax|retire|invest|insurance|dose|growth|feeding|sleep|heart|diaper|savings|budget|scholarship|security|child)/;

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const stem = (s) => norm(s).split(" ").map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w)).join(" ");
const countPhrase = (text, phrase) => {
  const p = stem(phrase);
  if (!p) return 0;
  const t = " " + stem(text) + " ";
  let n = 0, i = 0;
  const needle = " " + p + " ";
  while ((i = t.indexOf(needle, i)) !== -1) { n++; i += needle.length - 1; }
  return n;
};
const sentences = (text) => String(text).split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).map((s) => s.trim()).filter(Boolean);
const PASSIVE = /\b(is|are|was|were|be|been|being)\s+(\w+ly\s+)?(\w+(ed|en))\b/i;
const NOT_PASSIVE = new Set(["even", "often", "open", "seven", "green", "hidden", "then", "listen", "children", "when", "screen", "token", "when", "taken"]);
const isPassive = (s) => {
  const m = s.match(PASSIVE);
  return Boolean(m) && !NOT_PASSIVE.has(m[3].toLowerCase());
};

let totalErr = 0, totalWarn = 0, checked = 0;
const only = slugArg ? new Set(slugArg.split(",").map((s) => s.trim())) : null;
const slugs = Object.keys(seo).filter((s) => !only || only.has(s));

if (Object.keys(seo).length === 0) {
  console.log("toolSeo.js has no entries yet. Nothing to check.");
  process.exit(0);
}

// Pre-compute shingles for duplicate detection across entries.
const shingles = new Map(); // shingle -> Set(slug)
const bodyOf = (e) => [e.shortDescription, ...(e.about || []), ...(e.faq || []).flatMap((f) => [f.q, f.a])].join(" ");
for (const [slug, e] of Object.entries(seo)) {
  const w = norm(bodyOf(e)).split(" ");
  for (let i = 0; i + 8 <= w.length; i++) {
    const sh = w.slice(i, i + 8).join(" ");
    if (!shingles.has(sh)) shingles.set(sh, new Set());
    shingles.get(sh).add(slug);
  }
}
const seenField = { seoTitle: new Map(), h1: new Map(), seoDescription: new Map() };
for (const [slug, e] of Object.entries(seo)) {
  for (const f of Object.keys(seenField)) {
    const v = norm(e[f]);
    if (!v) continue;
    if (!seenField[f].has(v)) seenField[f].set(v, []);
    seenField[f].get(v).push(slug);
  }
}

for (const slug of slugs) {
  const e = seo[slug];
  const errs = [], warns = [], info = [];
  const err = (m) => errs.push(m);
  const warn = (m) => warns.push(m);
  const tool = toolBySlug[slug];
  const k = kw[slug] || {};
  const tier = (k.tier || "").trim();
  const topTier = tier === "A" || tier === "A+";
  checked++;

  // ---- structure
  if (!tool) err(`slug "${slug}" is not in src/data/tools.js`);
  else if (!tool.implemented) warn("tool is not marked implemented: true, so the page stays noindex and out of the sitemap");
  for (const f of ["seoTitle", "seoDescription", "h1", "shortDescription"]) {
    if (typeof e[f] !== "string" || !e[f].trim()) err(`${f} is missing`);
  }
  if (!Array.isArray(e.about) || e.about.length !== 5) err(`about must have exactly 5 strings (has ${Array.isArray(e.about) ? e.about.length : 0})`);
  if (!Array.isArray(e.faq) || e.faq.length === 0) err("faq is missing");
  const about = Array.isArray(e.about) ? e.about.map(String) : [];
  const faq = Array.isArray(e.faq) ? e.faq : [];

  // ---- lengths
  if (e.seoTitle && e.seoTitle.length > 50) err(`seoTitle is ${e.seoTitle.length} chars (max 50; the site adds " | Toolslay")`);
  if (e.seoTitle && /toolslay/i.test(e.seoTitle)) err("seoTitle contains the brand name (the site adds it)");
  if (e.seoDescription && (e.seoDescription.length < 130 || e.seoDescription.length > 155)) err(`seoDescription is ${e.seoDescription.length} chars (needs 130 to 155)`);
  if (e.h1 && e.h1.length > 60) err(`h1 is ${e.h1.length} chars (max 60)`);
  if (e.shortDescription) {
    const n = words(e.shortDescription);
    if (n < 20 || n > 30) err(`shortDescription is ${n} words (needs 20 to 30)`);
    if (sentences(e.shortDescription).length > 1) warn("shortDescription should be one sentence");
  }
  if (about.length === 5) {
    const wc = about.map(words);
    if (wc[0] < 45 || wc[0] > 70) err(`about[0] (lead) is ${wc[0]} words (needs 45 to 70)`);
    for (let i = 1; i < 5; i++) if (wc[i] < 55 || wc[i] > 85) err(`about[${i}] is ${wc[i]} words (needs 55 to 85)`);
    const left = wc[1] + wc[2], right = wc[3] + wc[4];
    if (Math.abs(left - right) > 15) warn(`columns are uneven: left ${left} words vs right ${right} words (keep within 15)`);
  }
  faq.forEach((f, i) => {
    if (!f || typeof f.q !== "string" || typeof f.a !== "string") return err(`faq[${i}] needs q and a strings`);
    const n = words(f.a);
    if (n < 35 || n > 75) err(`faq[${i}] answer is ${n} words (needs 35 to 75)`);
    if (!f.q.trim().endsWith("?")) warn(`faq[${i}] question does not end with "?"`);
  });
  const allowed = topTier ? [6, 8] : [6];
  if (faq.length && !allowed.includes(faq.length)) err(`faq has ${faq.length} items (allowed: ${allowed.join(" or ")} for tier ${tier || "unknown"})`);
  if (!faq.some((f) => /(data|store|saved?|upload|privacy|private|sent|send|server|browser|limit|file size|accurate|estimate)/i.test(f?.q || ""))) {
    warn("no FAQ question about data handling or limits");
  }
  const totalWords = words(e.shortDescription) + about.reduce((a, b) => a + words(b), 0) + faq.reduce((a, f) => a + words(f?.a) + words(f?.q), 0);
  if (totalWords < 600 || totalWords > 900) warn(`page copy is ${totalWords} words (target 600 to 900)`);

  // ---- highlights
  if (e.highlights !== undefined) {
    if (!Array.isArray(e.highlights) || e.highlights.length > 3) err("highlights must be an array of at most 3 items");
    else e.highlights.forEach((h, i) => {
      if (!h || !h.icon || !h.label) return err(`highlights[${i}] needs icon and label`);
      if (!ICONS.has(h.icon)) err(`highlights[${i}] icon "${h.icon}" is not registered in src/components/ui/Icon.js`);
      if (h.label.length > 42) warn(`highlights[${i}] label is ${h.label.length} chars (keep under 42)`);
    });
  }

  // ---- keywords
  const primary = k.primary, secondary = k.secondary;
  if (!k.slug) warn("slug not found in docs/keywords.csv, keyword checks skipped");
  const fullText = [e.seoTitle, e.seoDescription, e.h1, e.shortDescription, ...about, ...faq.flatMap((f) => [f?.q, f?.a]), ...(e.highlights || []).map((h) => h.label)].filter(Boolean).join(" ");
  if (primary) {
    const leadFirst = about[0] ? sentences(about[0])[0] : "";
    if (!countPhrase(e.seoTitle, primary)) err(`primary keyword "${primary}" is not in seoTitle`);
    else if (stem(e.seoTitle).indexOf(stem(primary)) > 25) warn("primary keyword is not near the start of seoTitle");
    if (!countPhrase(e.seoDescription, primary)) err(`primary keyword "${primary}" is not in seoDescription`);
    if (!countPhrase(e.h1, primary)) warn(`primary keyword "${primary}" is not in h1 (a close variant is OK if it reads naturally)`);
    if (!countPhrase(e.shortDescription, primary)) err(`primary keyword "${primary}" is not in shortDescription`);
    if (!countPhrase(leadFirst, primary)) err(`primary keyword "${primary}" is not in the first sentence of the lead`);
    const body = [...about, ...faq.flatMap((f) => [f?.q, f?.a])].join(" ");
    const n = countPhrase(body, primary);
    if (n > 3) err(`primary keyword appears ${n} times in About + FAQ (max 3: lead sentence plus 2 more). Use variants.`);
    if (secondary) {
      if (!countPhrase(about.slice(1).join(" "), secondary) && !countPhrase(about[0] || "", secondary)) warn(`secondary keyword "${secondary}" is not in the About text`);
      if (!countPhrase(faq.map((f) => (f?.q || "") + " " + (f?.a || "")).join(" "), secondary)) warn(`secondary keyword "${secondary}" is not in the FAQ`);
      const sn = countPhrase(body, secondary);
      if (sn > 3) warn(`secondary keyword appears ${sn} times in About + FAQ (aim for 2)`);
    }
  }

  // ---- AI-sounding patterns
  if (/[\u2013\u2014]/.test(fullText)) err("contains an en dash or em dash (use commas or periods)");
  if (/\s-\s/.test(fullText)) warn('contains a spaced hyphen " - " (looks like a dash)');
  for (const b of BANNED) if (fullText.toLowerCase().includes(b)) err(`banned phrase: "${b}"`);
  if (/\bnot just\b.*\bbut also\b/i.test(fullText)) err('banned pattern: "not just ... but also"');
  if (/!/.test(fullText)) warn("contains an exclamation mark");
  const brand = (fullText.match(/toolslay/gi) || []).length;
  if (brand > 1) err(`brand name "Toolslay" appears ${brand} times (max 1, ideally 0)`);
  if (/(\*\*|__|``|^#{1,6}\s|^\s*[-*\u2022]\s|\]\(|<[a-z/][^>]*>)/m.test(fullText) || /\p{Extended_Pictographic}/u.test(fullText)) err("contains markdown, HTML or emoji (plain text only)");
  const weak = fullText.match(WEAK_CLAIM);
  if (weak) warn(`unsupported-sounding claim: "${weak[0]}"`);

  // style stats (about + faq answers)
  const prose = [...about, ...faq.map((f) => f?.a || "")];
  const allSent = prose.flatMap((p) => sentences(p));
  if (allSent.length) {
    const avg = allSent.reduce((a, s) => a + words(s), 0) / allSent.length;
    if (avg < 12 || avg > 20) warn(`average sentence length is ${avg.toFixed(1)} words (aim for 14 to 18)`);
    const passive = allSent.filter(isPassive);
    if (passive.length / allSent.length > 0.1) warn(`about ${Math.round((passive.length / allSent.length) * 100)}% of sentences look passive (aim under 10%). Example: "${passive[0].slice(0, 80)}"`);
  }
  for (let pi = 0; pi < prose.length; pi++) {
    const ss = sentences(prose[pi]);
    for (let i = 1; i < ss.length; i++) {
      const a = ss[i - 1].split(/\s+/)[0].toLowerCase(), b = ss[i].split(/\s+/)[0].toLowerCase();
      if (a === b && a.length > 1) { warn(`two sentences in a row start with "${a}": "${ss[i].slice(0, 60)}"`); break; }
    }
  }

  // ---- honesty vs. the tool's code
  const facts = tool ? toolFacts(slug, registry) : null;
  if (facts) {
    const codeNotes = [...facts.network, ...facts.storage, ...facts.hosts.map((h) => `calls ${h}`)];
    if (codeNotes.length) {
      info.push(`code (${facts.dir}) uses: ${codeNotes.join(", ")}. The copy must say so plainly where it talks about your data.`);
      const claimSources = [...about, ...faq.flatMap((f) => [f?.q, f?.a]), ...(e.highlights || []).map((h) => h.label)];
      for (const t of claimSources) {
        const m = t && t.match(PRIVACY_CLAIM);
        if (m) { err(`privacy claim "${m[0]}" conflicts with the code (${codeNotes.join(", ")}). Reword it or make it specific.`); break; }
      }
    }
  } else if (tool) {
    warn("could not locate the tool's code folder via registry.js, so the honesty check was skipped");
  }
  const sensitive = tool && (tool.category === "calculators" || SENSITIVE_SLUG.test(slug));
  if (sensitive && !/(estimate|not (a substitute|medical|financial|legal|professional)|general information|rough)/i.test(fullText)) {
    warn("calculator or health/money topic: add one sentence saying results are estimates, not professional advice");
  }

  // ---- duplicates across entries
  for (const f of Object.keys(seenField)) {
    const v = norm(e[f]);
    const others = (seenField[f].get(v) || []).filter((s) => s !== slug);
    if (v && others.length) err(`${f} is identical to ${others[0]}'s`);
  }
  const dupWith = new Set();
  const w = norm(bodyOf(e)).split(" ");
  for (let i = 0; i + 8 <= w.length; i++) {
    const owners = shingles.get(w.slice(i, i + 8).join(" "));
    if (owners) for (const o of owners) if (o !== slug) dupWith.add(o);
  }
  if (dupWith.size) warn(`shares 8-word phrases with: ${[...dupWith].slice(0, 4).join(", ")}. Rewrite the repeated sentences.`);

  totalErr += errs.length;
  totalWarn += warns.length;
  const ok = errs.length === 0 && warns.length === 0;
  if (ok && QUIET) continue;
  console.log(`${errs.length ? "FAIL" : warns.length ? "WARN" : "PASS"}  ${slug}${tier ? `  [tier ${tier}]` : ""}  (${totalWords} words)`);
  for (const m of errs) console.log(`   ERR   ${m}`);
  for (const m of warns) console.log(`   WARN  ${m}`);
  for (const m of info) console.log(`   INFO  ${m}`);
}

const missing = tools.filter((t) => t.implemented && !seo[t.slug]).length;
console.log(`\nChecked ${checked} entr${checked === 1 ? "y" : "ies"}: ${totalErr} error(s), ${totalWarn} warning(s). ${Object.keys(seo).length} of ${tools.filter((t) => t.implemented).length} implemented tools have copy (${missing} still noindex).`);
process.exit(totalErr > 0 || (STRICT && totalWarn > 0) ? 1 : 0);
