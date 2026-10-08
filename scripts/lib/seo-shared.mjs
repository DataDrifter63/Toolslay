// Shared helpers for scripts/check-seo.mjs and scripts/seo-next.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// Import a data-only ESM file that lives in a CommonJS package by copying it to a temp .mjs file.
export async function importDataFile(relPath) {
  const src = fs.readFileSync(path.join(ROOT, relPath), "utf8");
  const tmp = path.join(os.tmpdir(), `toolslay-${path.basename(relPath, ".js")}-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
  fs.writeFileSync(tmp, src);
  try {
    return await import(pathToFileURL(tmp).href);
  } finally {
    fs.unlinkSync(tmp);
  }
}

export async function loadTools() {
  const mod = await importDataFile("src/data/tools.js");
  return mod.TOOLS;
}

export async function loadToolSeo() {
  const mod = await importDataFile("src/data/toolSeo.js");
  return mod.TOOL_SEO;
}

// Minimal CSV parser (handles quotes and commas inside quotes).
export function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}

export function loadKeywords() {
  const file = path.join(ROOT, "docs", "keywords.csv");
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const r of parseCsv(fs.readFileSync(file, "utf8"))) out[r.slug] = r;
  return out;
}

// slug -> folder inside src/tools-impl, read from registry.js
export function loadRegistryFolders() {
  const text = fs.readFileSync(path.join(ROOT, "src/tools-impl/registry.js"), "utf8");
  const map = {};
  const re = /"([^"]+)":\s*dynamic\(\(\)\s*=>\s*import\("\.\/([^/]+)\/([^"]+)"\)/g;
  let m;
  while ((m = re.exec(text))) map[m[1]] = { folder: m[2], file: m[3] };
  return map;
}

export function toolFacts(slug, registry) {
  const entry = registry[slug];
  if (!entry) return null;
  const dir = path.join(ROOT, "src/tools-impl", entry.folder);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => /\.(js|jsx|mjs)$/.test(f));
  const facts = { dir: `src/tools-impl/${entry.folder}`, network: [], storage: [], hosts: [] };
  for (const f of files) {
    const code = fs.readFileSync(path.join(dir, f), "utf8");
    if (/\bfetch\s*\(/.test(code)) facts.network.push("fetch()");
    if (/XMLHttpRequest|sendBeacon/.test(code)) facts.network.push("XHR/beacon");
    if (/localStorage/.test(code)) facts.storage.push("localStorage");
    if (/sessionStorage/.test(code)) facts.storage.push("sessionStorage");
    if (/indexedDB/.test(code)) facts.storage.push("indexedDB");
    const hosts = code.match(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}/gi) || [];
    for (const h of hosts) {
      const host = h.replace(/^https?:\/\//i, "").toLowerCase();
      if (/^(www\.)?(w3\.org|schema\.org|example\.com|yourwebsite\.com|yoursite\.com|yourdomain\.com)$/.test(host)) continue;
      if (/^(www\.)?(example|yourwebsite|yoursite|yourdomain|domain|website|mysite|site)\./.test(host)) continue;
      facts.hosts.push(host);
    }
    // import("https://...") or CDN-loaded model files
    if (/import\(\s*["']https?:/.test(code)) facts.network.push("remote import()");
  }
  facts.network = [...new Set(facts.network)];
  facts.storage = [...new Set(facts.storage)];
  facts.hosts = [...new Set(facts.hosts)];
  return facts;
}

export function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
