import fs from "node:fs";
import path from "node:path";
import { ROOT, loadTools, loadKeywords, loadRegistryFolders, toolFacts, norm } from "./lib/seo-shared.mjs";

// Import existing check-seo logic to test our candidate entries
const tools = await loadTools();
const kw = loadKeywords();
const registry = loadRegistryFolders();
const toolBySlug = Object.fromEntries(tools.map((t) => [t.slug, t]));

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

export function validateCandidate(slug, e) {
  const errs = [], warns = [];
  const tool = toolBySlug[slug];
  const k = kw[slug] || {};
  const tier = (k.tier || "").trim();
  const topTier = tier === "A" || tier === "A+";

  for (const f of ["seoTitle", "seoDescription", "h1", "shortDescription"]) {
    if (typeof e[f] !== "string" || !e[f].trim()) errs.push(`${f} is missing`);
  }
  if (!Array.isArray(e.about) || e.about.length !== 5) errs.push(`about must have 5 strings`);
  if (!Array.isArray(e.faq) || e.faq.length === 0) errs.push(`faq is missing`);
  const about = Array.isArray(e.about) ? e.about.map(String) : [];
  const faq = Array.isArray(e.faq) ? e.faq : [];

  if (e.seoTitle && e.seoTitle.length > 50) errs.push(`seoTitle is ${e.seoTitle.length} chars (max 50)`);
  if (e.seoTitle && /toolslay/i.test(e.seoTitle)) errs.push(`seoTitle contains brand`);
  if (e.seoDescription && (e.seoDescription.length < 130 || e.seoDescription.length > 155)) errs.push(`seoDescription is ${e.seoDescription.length} chars (needs 130-155)`);
  if (e.h1 && e.h1.length > 60) errs.push(`h1 is ${e.h1.length} chars (max 60)`);
  if (e.shortDescription) {
    const n = words(e.shortDescription);
    if (n < 20 || n > 30) errs.push(`shortDescription is ${n} words (needs 20-30)`);
    if (sentences(e.shortDescription).length > 1) warns.push(`shortDescription should be 1 sentence`);
  }
  if (about.length === 5) {
    const wc = about.map(words);
    if (wc[0] < 45 || wc[0] > 70) errs.push(`about[0] is ${wc[0]} words (needs 45-70)`);
    for (let i = 1; i < 5; i++) if (wc[i] < 55 || wc[i] > 85) errs.push(`about[${i}] is ${wc[i]} words (needs 55-85)`);
    const left = wc[1] + wc[2], right = wc[3] + wc[4];
    if (Math.abs(left - right) > 15) warns.push(`columns uneven: left ${left} vs right ${right}`);
  }
  faq.forEach((f, i) => {
    const n = words(f?.a);
    if (n < 35 || n > 75) errs.push(`faq[${i}] answer is ${n} words (needs 35-75)`);
    if (!f.q.trim().endsWith("?")) warns.push(`faq[${i}] question missing ?`);
  });
  const allowed = topTier ? [6, 8] : [6];
  if (faq.length && !allowed.includes(faq.length)) errs.push(`faq count ${faq.length} not allowed for tier ${tier}`);
  if (!faq.some((f) => /(data|store|saved?|upload|privacy|private|sent|send|server|browser|limit|file size|accurate|estimate)/i.test(f?.q || ""))) {
    warns.push("no FAQ about data handling or limits");
  }

  // highlights
  if (e.highlights) {
    e.highlights.forEach((h, i) => {
      if (!ICONS.has(h.icon)) errs.push(`highlight icon ${h.icon} not in Icon.js`);
      if (h.label.length > 42) warns.push(`highlight label too long: ${h.label.length}`);
    });
  }

  // keywords
  const primary = k.primary, secondary = k.secondary;
  const fullText = [e.seoTitle, e.seoDescription, e.h1, e.shortDescription, ...about, ...faq.flatMap((f) => [f?.q, f?.a]), ...(e.highlights || []).map((h) => h.label)].filter(Boolean).join(" ");
  if (primary) {
    const leadFirst = about[0] ? sentences(about[0])[0] : "";
    if (!countPhrase(e.seoTitle, primary)) errs.push(`primary "${primary}" not in seoTitle`);
    if (!countPhrase(e.seoDescription, primary)) errs.push(`primary "${primary}" not in seoDescription`);
    if (!countPhrase(e.shortDescription, primary)) errs.push(`primary "${primary}" not in shortDescription`);
    if (!countPhrase(leadFirst, primary)) errs.push(`primary "${primary}" not in lead first sentence`);
    const body = [...about, ...faq.flatMap((f) => [f?.q, f?.a])].join(" ");
    const n = countPhrase(body, primary);
    if (n > 3) errs.push(`primary appears ${n} times in body (max 3)`);
    if (secondary) {
      if (!countPhrase(about.slice(1).join(" "), secondary) && !countPhrase(about[0] || "", secondary)) warns.push(`secondary "${secondary}" not in about`);
      if (!countPhrase(faq.map((f) => (f?.q || "") + " " + (f?.a || "")).join(" "), secondary)) warns.push(`secondary "${secondary}" not in faq`);
    }
  }

  // AI & style
  if (/[\u2013\u2014]/.test(fullText)) errs.push("contains em or en dash");
  if (/\s-\s/.test(fullText)) warns.push('contains spaced hyphen');
  for (const b of BANNED) if (fullText.toLowerCase().includes(b)) errs.push(`banned: "${b}"`);
  if (/\bnot just\b.*\bbut also\b/i.test(fullText)) errs.push('banned: "not just ... but also"');
  if (/!/.test(fullText)) warns.push("contains exclamation mark");
  const weak = fullText.match(WEAK_CLAIM);
  if (weak) warns.push(`weak claim: "${weak[0]}"`);

  // Code facts
  const facts = toolFacts(slug, registry);
  if (facts) {
    const codeNotes = [...facts.network, ...facts.storage, ...facts.hosts.map((h) => `calls ${h}`)];
    if (codeNotes.length) {
      const claimSources = [...about, ...faq.flatMap((f) => [f?.q, f?.a]), ...(e.highlights || []).map((h) => h.label)];
      for (const t of claimSources) {
        const m = t && t.match(PRIVACY_CLAIM);
        if (m) { errs.push(`privacy claim "${m[0]}" conflicts with code (${codeNotes.join(", ")})`); break; }
      }
    }
  }

  // Consecutive sentences starting with same word
  const prose = [...about, ...faq.map((f) => f?.a || "")];
  for (let pi = 0; pi < prose.length; pi++) {
    const ss = sentences(prose[pi]);
    for (let si = 1; si < ss.length; si++) {
      const w1 = norm(ss[si - 1]).split(" ")[0];
      const w2 = norm(ss[si]).split(" ")[0];
      if (w1 && w2 && w1 === w2 && w1.length > 2) warns.push(`two sentences in a row start with "${w1}": "${ss[si].slice(0, 40)}"`);
    }
  }

  return { errs, warns };
}
