"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Briefcase, Copy, CheckCircle2, Heart, 
  Trash2, Sliders, Zap, Sparkles, RefreshCw 
} from "lucide-react";

const INDUSTRIES = {
  General: {
    roots: ["nova", "forge", "peak", "origin", "bright", "vertex", "craft", "north", "prime", "pulse"],
    suffixes: ["Co", "Works", "Group", "Studio", "Labs", "House", "Collective", "Hub"],
  },
  Technology: {
    roots: ["byte", "cloud", "logic", "pixel", "quant", "cyber", "data", "stack", "sync", "code"],
    suffixes: ["Labs", "Systems", "Tech", "Works", "Logic", "Cloud", "Digital", "AI"],
  },
  Marketing: {
    roots: ["brand", "spark", "reach", "social", "growth", "viral", "signal", "media", "impact", "story"],
    suffixes: ["Media", "Studio", "Agency", "Works", "Creative", "Digital", "House", "Collective"],
  },
  Fashion: {
    roots: ["mode", "velvet", "luxe", "silk", "atelier", "vogue", "urban", "chic", "aura", "couture"],
    suffixes: ["Studio", "House", "Atelier", "Label", "Wear", "Collective", "Co", "London"],
  },
  Food: {
    roots: ["taste", "harvest", "spice", "bloom", "crumb", "feast", "fresh", "basil", "roast", "savory"],
    suffixes: ["Kitchen", "House", "Cafe", "Foods", "Table", "Co", "Market", "Bites"],
  },
  Finance: {
    roots: ["capital", "wealth", "ledger", "trust", "prime", "vault", "fund", "asset", "crest", "yield"],
    suffixes: ["Capital", "Partners", "Advisors", "Group", "Financial", "Wealth", "Holdings", "Fund"],
  },
  Health: {
    roots: ["vital", "well", "care", "pulse", "pure", "heal", "life", "med", "balance", "renew"],
    suffixes: ["Health", "Care", "Wellness", "Clinic", "Labs", "Medical", "Life", "Center"],
  },
  RealEstate: {
    roots: ["estate", "urban", "stone", "oak", "crest", "prime", "haven", "brick", "metro", "harbor"],
    suffixes: ["Properties", "Realty", "Estates", "Homes", "Group", "Living", "Developments", "Partners"],
  },
  Education: {
    roots: ["learn", "bright", "mind", "skill", "academy", "scholar", "wisdom", "mentor", "future", "study"],
    suffixes: ["Academy", "Learning", "Institute", "Labs", "School", "Education", "Hub", "Works"],
  },
  Beauty: {
    roots: ["glow", "pure", "luxe", "bloom", "skin", "silk", "rose", "aura", "velvet", "bliss"],
    suffixes: ["Beauty", "Studio", "Skin", "Wellness", "Salon", "House", "Care", "Co"],
  },
  Construction: {
    roots: ["build", "stone", "iron", "solid", "brick", "forge", "craft", "summit", "urban", "terra"],
    suffixes: ["Build", "Construction", "Works", "Developments", "Group", "Builders", "Projects", "Co"],
  },
};

const STYLE_WORDS = {
  Modern: ["nova", "vanta", "nexa", "vero", "luma", "zento", "aero", "vexa", "nivo", "orbi"],
  Premium: ["prime", "royal", "velvet", "sterling", "grand", "elite", "crest", "monarch", "luxe", "regal"],
  Professional: ["summit", "apex", "north", "vertex", "anchor", "clear", "core", "united", "global", "capital"],
  Creative: ["spark", "mosaic", "canvas", "bloom", "orbit", "echo", "ember", "pixel", "story", "wild"],
  Playful: ["poppy", "buzzy", "zippy", "mango", "peppy", "jolly", "happy", "bingo", "doodle", "berry"],
  Minimalist: ["one", "mono", "pure", "line", "form", "base", "arc", "mark", "core", "plain"],
};

const STRATEGIES = ["Compound", "Portmanteau", "Invented", "Premium", "Alliteration", "Founder", "Minimal"];

function cleanWord(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function titleCase(value) {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function hashString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededIndex(seed, length) {
  if (!length) return 0;
  return hashString(seed) % length;
}

function randomFrom(list, seed) {
  if (!list || !list.length) return "";
  return list[seededIndex(seed, list.length)];
}

function pronounceability(name) {
  const word = name.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  let score = 100;
  if (word.length < 4) score -= 8;
  if (word.length > 14) score -= 18;
  const consonantRuns = word.match(/[^aeiouy]{4,}/g);
  const vowelRuns = word.match(/[aeiouy]{4,}/g);
  if (consonantRuns) score -= consonantRuns.length * 12;
  if (vowelRuns) score -= vowelRuns.length * 7;
  if (/(.)\1\1/.test(word)) score -= 15;
  return Math.max(45, Math.min(99, score));
}

function brandScore(name, strategy, keywords) {
  const clean = name.replace(/[^a-zA-Z]/g, "");
  let score = 62;
  if (clean.length >= 5 && clean.length <= 11) score += 15;
  else if (clean.length >= 4 && clean.length <= 14) score += 8;
  else score -= 5;
  score += Math.round(pronounceability(clean) * 0.18);
  if (strategy === "Invented") score += 5;
  if (strategy === "Minimal") score += 6;
  if (strategy === "Premium") score += 4;
  const keywordList = keywords.split(",").map(cleanWord).filter(Boolean);
  keywordList.forEach((keyword) => {
    if (clean.toLowerCase().indexOf(keyword) !== -1) score += 5;
  });
  return Math.max(50, Math.min(99, score));
}

function makeDomain(name, extension) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 50);
  return slug + extension;
}

function makeName(options, index) {
  const industry = INDUSTRIES[options.industry] || INDUSTRIES.General;
  const stylePool = STYLE_WORDS[options.style] || STYLE_WORDS.Modern;
  const keywordList = options.keywords.split(",").map(cleanWord).filter(Boolean);
  const founder = cleanWord(options.founder);
  const seed = [options.keywords, options.industry, options.style, options.tone, index, Date.now()].join("|");

  const root = randomFrom(industry.roots.concat(stylePool), seed + "root");
  const root2 = randomFrom(industry.roots.concat(stylePool), seed + "root2");
  const suffix = randomFrom(industry.suffixes, seed + "suffix");
  const keyword = keywordList.length > 0 ? randomFrom(keywordList, seed + "keyword") : root;
  const strategy = STRATEGIES[index % STRATEGIES.length];

  let name = "";

  if (strategy === "Compound") {
    name = titleCase(keyword) + titleCase(randomFrom(stylePool.concat(industry.roots), seed + "compound"));
  } else if (strategy === "Portmanteau") {
    const first = keyword.slice(0, Math.max(3, Math.ceil(keyword.length * 0.55)));
    const second = root2.slice(Math.max(1, Math.floor(root2.length * 0.35)));
    name = titleCase(first + second);
  } else if (strategy === "Invented") {
    const a = randomFrom(stylePool, seed + "a");
    const b = randomFrom(stylePool.concat(industry.roots), seed + "b");
    name = titleCase(a.slice(0, Math.ceil(a.length / 2)) + b.slice(Math.floor(b.length / 3)));
  } else if (strategy === "Premium") {
    const premiumWord = randomFrom(["Prime", "Sterling", "Crest", "Monarch", "Velvet", "Aurex", "Grand", "Luxe"], seed + "premium");
    name = premiumWord + " " + titleCase(keyword || randomFrom(industry.roots, seed + "premiumroot"));
  } else if (strategy === "Alliteration") {
    const allRoot = randomFrom(industry.roots.concat(stylePool), seed + "all");
    const firstLetter = allRoot.charAt(0);
    const matching = industry.roots.concat(stylePool).filter((word) => word.charAt(0) === firstLetter);
    const secondWord = randomFrom(matching.length ? matching : industry.roots, seed + "all2");
    name = titleCase(allRoot) + " " + titleCase(secondWord);
  } else if (strategy === "Founder") {
    if (founder) {
      name = titleCase(founder) + " " + titleCase(randomFrom(industry.suffixes, seed + "founder"));
    } else {
      name = titleCase(keyword) + " " + titleCase(suffix);
    }
  } else if (strategy === "Minimal") {
    const minimal = keyword || randomFrom(stylePool, seed + "minimal");
    name = titleCase(minimal.slice(0, 3) + randomFrom(["a", "o", "i", "x", "y", "e"], seed + "vowel") + randomFrom(["ra", "vo", "na", "ly", "zen", "xo", "va"], seed + "ending"));
  }

  if (options.structure === "One Word") {
    name = name.replace(/\s+/g, "");
  } else if (options.structure === "Two Words") {
    const parts = name.split(" ");
    if (parts.length === 1) {
      name = titleCase(parts[0]) + " " + titleCase(randomFrom(industry.suffixes, seed + "twoword"));
    } else {
      name = parts.slice(0, 2).join(" ");
    }
  }

  if (options.location) {
    name += " " + titleCase(options.location.trim());
  }

  return { name, strategy };
}

function generateNames(options) {
  const results = [];
  let attempts = 0;
  const avoidList = options.avoid.split(",").map(cleanWord).filter(Boolean);

  while (results.length < options.count && attempts < options.count * 15) {
    const generated = makeName(options, attempts);
    const value = generated.name.replace(/\s+/g, " ").trim();
    const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

    const blocked = avoidList.some((word) => normalized.indexOf(word) !== -1);

    if (normalized.length >= 3 && !blocked && !results.some((item) => item.normalized === normalized)) {
      const score = brandScore(value, generated.strategy, options.keywords);
      results.push({
        id: normalized + "-" + attempts,
        name: value,
        normalized,
        strategy: generated.strategy,
        score,
        pronounceability: pronounceability(normalized),
      });
    }
    attempts += 1;
  }

  return results.sort((a, b) => b.score - a.score);
}

export default function BusinessNameGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [style, setStyle] = useState("Modern");
  const [tone, setTone] = useState("Balanced");
  const [structure, setStructure] = useState("Any");
  const [founder, setFounder] = useState("");
  const [location, setLocation] = useState("");
  const [avoid, setAvoid] = useState("");
  const [count, setCount] = useState(24);
  const [extension, setExtension] = useState(".com");

  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const generate = useCallback(() => {
    const options = { keywords, industry, style, tone, structure, founder, location, avoid, count: Number(count) };
    const res = generateNames(options);
    setResults(res);
    setGenerated(true);
    setCopied(false);
  }, [keywords, industry, style, tone, structure, founder, location, avoid, count]);

  function reset() {
    setKeywords("");
    setIndustry("Technology");
    setStyle("Modern");
    setTone("Balanced");
    setStructure("Any");
    setFounder("");
    setLocation("");
    setAvoid("");
    setCount(24);
    setExtension(".com");
    setResults([]);
    setFavorites([]);
    setGenerated(false);
    setCopied(false);
    setFilter("All");
  }

  function toggleFavorite(id) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function copyAll() {
    const source = favorites.length > 0 ? results.filter((item) => favorites.includes(item.id)) : results;
    const text = source.map((item) => `${item.name} — ${item.score}/100 — ${makeDomain(item.name, extension)}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const filteredResults = useMemo(() => {
    if (filter === "All") return results;
    return results.filter((item) => item.strategy === filter);
  }, [results, filter]);

  const favoriteResults = useMemo(() => {
    return results.filter((item) => favorites.includes(item.id));
  }, [results, favorites]);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Business Name Generator
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Create brandable business names using multiple naming strategies with scoring.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONTROLS & BRIEF */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            
            <div className="border-b border-line pb-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand" /> Naming Brief
              </h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">Keywords / Ideas</label>
              <textarea
                className="w-full bg-surface border border-line rounded-xl p-3 text-xs font-bold text-ink outline-none focus:border-brand resize-y min-h-[70px]"
                placeholder="e.g. cloud, speed, security"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Industry</label>
                <select
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  {Object.keys(INDUSTRIES).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Style</label>
                <select
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  {Object.keys(STYLE_WORDS).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Tone</label>
                <select
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {["Balanced", "Bold", "Friendly", "Trustworthy", "Luxury"].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Structure</label>
                <select
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer"
                  value={structure}
                  onChange={(e) => setStructure(e.target.value)}
                >
                  {["Any", "One Word", "Two Words"].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">Founder Name (Optional)</label>
              <input
                className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                placeholder="e.g. Alex"
                value={founder}
                onChange={(e) => setFounder(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Location Cue</label>
                <input
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                  placeholder="e.g. London"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Avoid Words</label>
                <input
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                  placeholder="e.g. shop"
                  value={avoid}
                  onChange={(e) => setAvoid(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Batch Size</label>
                <span className="text-xs font-bold text-brand tabular-nums">{count}</span>
              </div>
              <input
                type="range"
                min="8"
                max="60"
                step="4"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">Domain Hint Extension</label>
              <select
                className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer"
                value={extension}
                onChange={(e) => setExtension(e.target.value)}
              >
                {[".com", ".co", ".ai", ".io", ".app"].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={generate}
              className="w-full py-3 px-4 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90 shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Generate Business Names
            </button>

            <button
              type="button"
              onClick={reset}
              className="w-full py-2.5 px-4 bg-surface border border-line text-muted hover:text-ink rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
            >
              Reset Brief
            </button>

          </div>
        </div>

        {/* RIGHT: RESULTS DISPLAY & SHORTLIST */}
        <div className="space-y-4 sm:space-y-6 w-full">
          
          {!generated ? (
            <div className="bg-paper border border-line p-8 rounded-2xl shadow-sm text-center py-20 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-2xl">
                ✦
              </div>
              <h3 className="text-base font-bold text-ink">Your brand names will appear here</h3>
              <p className="text-xs text-muted max-w-[360px] mx-auto leading-relaxed">
                Add keywords and select your criteria on the left to generate a scored batch of memorable brand names.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* TOOLBAR */}
              <div className="bg-paper border border-line p-3 sm:p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-muted">
                  {filteredResults.length} names · {favorites.length} shortlisted
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyAll}
                    className="py-2 px-3 bg-surface border border-line text-ink hover:border-brand rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {favorites.length ? "Copy Shortlist" : "Copy All"}
                  </button>
                  <button
                    type="button"
                    onClick={generate}
                    className="py-2 px-3 bg-brand text-surface rounded-xl text-[10px] font-black uppercase tracking-wider transition-opacity hover:opacity-90 flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Generate More
                  </button>
                </div>
              </div>

              {/* STRATEGY FILTERS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {["All", ...STRATEGIES].map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shrink-0 transition-colors ${
                      filter === filterKey 
                        ? "bg-brand text-surface border-brand" 
                        : "bg-surface text-muted border-line hover:text-ink hover:border-brand/50"
                    }`}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>

              {/* CARDS GRID */}
              {filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredResults.map((item) => {
                    const isFav = favorites.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className="bg-paper border border-line p-4 rounded-2xl shadow-sm hover:border-brand/50 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-lg font-black text-ink tracking-tight break-all font-sans">
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => toggleFavorite(item.id)}
                              className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                                isFav ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-surface border-line text-muted hover:text-ink"
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[9px] font-black uppercase tracking-wider bg-surface border border-line px-2 py-0.5 rounded-lg text-muted">
                              {item.strategy}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-brand/10 border border-brand/30 px-2 py-0.5 rounded-lg text-brand tabular-nums">
                              {item.score} / 100
                            </span>
                          </div>

                          <div className="mt-3 p-2.5 bg-surface border border-line rounded-xl">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted block">Domain Hint</span>
                            <code className="text-xs font-mono font-bold text-ink truncate block mt-0.5 tabular-nums">
                              {makeDomain(item.name, extension)}
                            </code>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-line text-[9px] font-bold text-muted">
                          <span>Pronounceability: {item.pronounceability}/100</span>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(item.name);
                              } catch {}
                            }}
                            className="text-brand hover:underline uppercase tracking-wider"
                          >
                            Copy name
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-paper border border-line p-10 rounded-2xl text-center">
                  <h4 className="text-sm font-bold text-ink">No names matched this strategy filter</h4>
                  <p className="text-xs text-muted mt-1">Try selecting "All" or generating a new batch.</p>
                </div>
              )}

              {/* SHORTLIST DRAWER */}
              {favoriteResults.length > 0 && (
                <div className="bg-paper border border-line p-4 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500 fill-current" /> Shortlisted Favorites
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted tabular-nums">
                      {favoriteResults.length} saved
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {favoriteResults.map((item) => (
                      <span
                        key={item.id}
                        className="px-3 py-1.5 bg-surface border border-line rounded-xl text-xs font-bold text-ink flex items-center gap-2"
                      >
                        {item.name}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.id)}
                          className="text-muted hover:text-rose-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}