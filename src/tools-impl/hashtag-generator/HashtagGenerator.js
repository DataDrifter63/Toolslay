"use client";

import React, { useEffect, useMemo, useState } from "react";
import { 
  Hash, Sparkles, RotateCcw, Copy, Check, Download, 
  Sliders, Globe, Filter, BarChart3, Layers, CheckCircle2 
} from "lucide-react";

const PLATFORMS = {
  Instagram: { rec: 15, max: 30 },
  TikTok: { rec: 8, max: 10 },
  LinkedIn: { rec: 5, max: 5 },
  YouTube: { rec: 8, max: 15 },
  X: { rec: 3, max: 10 },
  Facebook: { rec: 5, max: 10 },
  Pinterest: { rec: 8, max: 15 },
};

const STOP_WORDS = new Set(
  (
    "the and for with from this that your you are was have has how why what when where into about our their they them will just more than then also very can not but all new get use using best top make made like learn tips guide post video today here a an of to in on at by is it as be or we i me my"
  ).split(" ")
);

const GENERIC_TAGS = [
  "trending", "viral", "explore", "explorepage", "contentcreator", 
  "digitalcreator", "socialmedia", "marketing", "business", "entrepreneur", 
  "smallbusiness", "growth", "tips", "ideas", "strategy", "branding", "creator",
];

const NICHES = {
  marketing: ["digitalmarketing", "marketingstrategy", "marketingtips", "contentmarketing", "performancemarketing", "growthmarketing"],
  seo: ["seo", "seotips", "seostrategy", "searchengineoptimization", "googlerankings", "organictraffic"],
  ads: ["googleads", "ppc", "paidads", "adstrategy", "performanceads", "digitaladvertising"],
  wordpress: ["wordpress", "wordpresstips", "webdesign", "wordpressdeveloper", "elementor", "websitebuilding"],
  design: ["graphicdesign", "uidesign", "uxdesign", "webdesign", "designinspiration", "creativedesign"],
  fitness: ["fitness", "fitnesstips", "workout", "fitnessmotivation", "healthylifestyle", "gymmotivation"],
  fashion: ["fashion", "fashionstyle", "styleinspo", "streetstyle", "fashioninspiration", "outfitideas"],
  food: ["food", "foodie", "foodlover", "foodinspiration", "recipeideas", "homecooking"],
  realestate: ["realestate", "realestateinvesting", "property", "realestateagent", "propertyinvestment", "realestatemarketing"],
  ecommerce: ["ecommerce", "ecommercetips", "onlinestore", "ecommercebusiness", "shopifystore", "onlineshopping"],
  education: ["education", "edtech", "learning", "studytips", "onlinelearning", "studentlife"],
  photography: ["photography", "photographytips", "photooftheday", "portraitphotography", "mobilephotography", "creativephotography"],
  ai: ["ai", "artificialintelligence", "aitools", "generativeai", "futureofai", "aiautomation"],
};

const PLATFORM_TAGS = {
  Instagram: ["instagram", "reels", "instareels"],
  TikTok: ["tiktok", "fyp", "foryou", "viral"],
  LinkedIn: ["linkedin", "professional", "careergrowth"],
  YouTube: ["youtube", "shorts", "youtubeshorts", "creator"],
  X: ["twitter", "x"],
  Facebook: ["facebook", "facebookmarketing"],
  Pinterest: ["pinterest", "inspiration", "pinterestideas"],
};

function cleanTag(value) {
  return String(value || "").toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "");
}

function extractWords(value) {
  return String(value || "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) {
    if (/[\u0679\u0686\u06D2\u06BE\u06D1]/.test(text)) return "Urdu";
    return "Arabic";
  }
  if (/[\u0900-\u097F]/.test(text)) return "Hindi";
  return "English";
}

function generateHashtags(text, platform, strategy, language) {
  const rawWords = extractWords(text);
  const words = [...new Set(rawWords.filter((word) => word.length >= 3 && !STOP_WORDS.has(word)))];
  const joinedText = words.join(" ");

  let nicheTags = [];
  Object.entries(NICHES).forEach(([key, tags]) => {
    if (joinedText.includes(key) || tags.some((tag) => joinedText.includes(tag.replace("tips", "")))) {
      nicheTags.push(...tags);
    }
  });

  const keywordTags = words.map(cleanTag).filter(Boolean);
  const longTailTags = [];

  for (let i = 0; i < words.length - 1; i++) {
    const first = cleanTag(words[i]);
    const second = cleanTag(words[i + 1]);
    if (first.length > 2 && second.length > 2) {
      longTailTags.push(first + second);
    }
  }

  const platformTags = PLATFORM_TAGS[platform] || [];
  const languageTags = language === "Urdu" ? ["urdu", "urducontent", "pakistan"] : language === "Hindi" ? ["hindi", "hindicontent", "india"] : language === "Arabic" ? ["arabic", "arabiccontent"] : [];

  let pool = [];
  if (strategy === "Niche") {
    pool = [...nicheTags, ...keywordTags, ...longTailTags];
  } else if (strategy === "Reach") {
    pool = [...platformTags, ...GENERIC_TAGS, ...nicheTags, ...keywordTags];
  } else if (strategy === "Long-tail") {
    pool = [...longTailTags, ...keywordTags, ...nicheTags, ...platformTags];
  } else {
    pool = [...nicheTags, ...keywordTags, ...longTailTags, ...platformTags, ...GENERIC_TAGS];
  }

  pool.push(...languageTags);
  const seen = new Set();

  return pool
    .map((tag) => cleanTag(tag))
    .filter((tag) => {
      if (!tag || seen.has(tag)) return false;
      seen.add(tag);
      return true;
    })
    .map((tag, index) => {
      let score = 50;
      if (keywordTags.includes(tag)) score += 25;
      if (nicheTags.includes(tag)) score += 18;
      if (longTailTags.includes(tag)) score += 12;
      if (platformTags.includes(tag)) score += 8;
      if (GENERIC_TAGS.includes(tag)) score -= 10;
      if (tag.length <= 12) score += 4;
      if (tag.length > 22) score -= 12;
      score -= index * 0.15;

      return { tag, score: Math.max(20, Math.min(99, Math.round(score))) };
    })
    .sort((a, b) => b.score - a.score);
}

export default function HashtagGenerator() {
  const [text, setText] = useState("digital marketing SEO Google Ads content strategy social media marketing");
  const [platform, setPlatform] = useState("Instagram");
  const [language, setLanguage] = useState("Auto");
  const [strategy, setStrategy] = useState("Balanced");
  const [count, setCount] = useState(15);
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");
  const [activeTab, setActiveTab] = useState("results");
  const [copied, setCopied] = useState(false);

  const detectedLanguage = useMemo(() => detectLanguage(text), [text]);
  const selectedLanguage = language === "Auto" ? detectedLanguage : language;

  const candidates = useMemo(
    () => generateHashtags(text, platform, strategy, selectedLanguage),
    [text, platform, strategy, selectedLanguage]
  );

  const excludedTags = useMemo(() => new Set(extractWords(exclude).map(cleanTag).filter(Boolean)), [exclude]);
  const forcedTags = useMemo(() => extractWords(include).map(cleanTag).filter(Boolean), [include]);

  const hashtags = useMemo(() => {
    const result = [];
    const seen = new Set();

    [...forcedTags.map((tag) => ({ tag, score: 90 })), ...candidates].forEach((item) => {
      if (!item.tag || excludedTags.has(item.tag) || seen.has(item.tag)) return;
      seen.add(item.tag);
      result.push(item);
    });

    return result.slice(0, count);
  }, [forcedTags, candidates, excludedTags, count]);

  const hashtagText = hashtags.map((item) => "#" + item.tag).join(" ");
  const relevanceScore = hashtags.length ? Math.round(hashtags.reduce((total, item) => total + item.score, 0) / hashtags.length) : 0;

  async function copyText(value = hashtagText) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function downloadFile(csv = false) {
    const content = csv ? "Hashtag,Score\n" + hashtags.map((item) => `"${item.tag}",${item.score}`).join("\n") : hashtagText;
    const blob = new Blob([content], { type: csv ? "text/csv" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = csv ? "hashtags.csv" : "hashtags.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function randomize() {
    const platformNames = Object.keys(PLATFORMS);
    const strategies = ["Balanced", "Niche", "Reach", "Long-tail"];
    const randomPlatform = platformNames[Math.floor(Math.random() * platformNames.length)];
    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    setPlatform(randomPlatform);
    setStrategy(randomStrategy);
    setCount(PLATFORMS[randomPlatform].rec);
  }

  function resetTool() {
    setText("digital marketing SEO Google Ads content strategy social media marketing");
    setPlatform("Instagram");
    setLanguage("Auto");
    setStrategy("Balanced");
    setCount(15);
    setInclude("");
    setExclude("");
    setActiveTab("results");
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Premium Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Smart Hashtag Generator
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate">
              Platform-Aware Topic & Niche Discovery Engine
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button type="button" onClick={randomize} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer">
            <Sparkles className="w-3.5 h-3.5" /> Randomize
          </button>
          <button type="button" onClick={resetTool} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-6 items-start">
        
        {/* ================= LEFT: INPUT & CONTROLS ================= */}
        <div className="space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* 1. Content Description */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand" /> 1. Describe Your Content
              </label>
              <div className="relative flex flex-col bg-surface border border-line rounded-xl focus-within:border-brand overflow-hidden shadow-inner">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste a caption, topic, product description or keywords..."
                  rows="4"
                  className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm font-sans text-ink outline-none resize-none custom-scrollbar"
                />
              </div>
              <div className="flex justify-between items-center px-1 text-[10px] font-bold text-muted">
                <span>Detected Language:</span>
                <span className="text-brand font-black uppercase">{detectedLanguage}</span>
              </div>
            </div>

            {/* 2. Target Platform */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand" /> 2. Target Platform
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {Object.keys(PLATFORMS).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setPlatform(name);
                      setCount(Math.min(count, PLATFORMS[name].max));
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer truncate ${
                      platform === name 
                        ? "bg-brand text-surface border-brand shadow-sm" 
                        : "bg-surface text-muted border-line hover:border-brand hover:text-ink"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy & Language selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand" /> Strategy
                </label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full bg-surface border border-line text-ink rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand cursor-pointer"
                >
                  <option>Balanced</option>
                  <option>Niche</option>
                  <option>Reach</option>
                  <option>Long-tail</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand" /> Output Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-surface border border-line text-ink rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand cursor-pointer"
                >
                  <option>Auto</option>
                  <option>English</option>
                  <option>Urdu</option>
                  <option>Hindi</option>
                  <option>Arabic</option>
                </select>
              </div>
            </div>

            {/* Range Slider */}
            <div className="space-y-2 p-3.5 bg-surface rounded-xl border border-line">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black uppercase tracking-wider text-muted">Hashtag Count</span>
                <span className="font-mono font-black text-brand bg-paper px-2 py-0.5 rounded border border-line">{count}</span>
              </div>
              <input
                type="range"
                min="3"
                max={PLATFORMS[platform].max}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
              />
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted pt-1">
                <span>Recommended: <strong className="text-ink">{PLATFORMS[platform].rec}</strong></span>
                <span>Max: <strong className="text-ink">{PLATFORMS[platform].max}</strong></span>
              </div>
            </div>

            {/* 3. Fine-tune Filters */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Filter className="w-3.5 h-3.5 text-brand" /> 3. Fine-Tune Filters
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted">Must Include</span>
                  <input
                    type="text"
                    value={include}
                    onChange={(e) => setInclude(e.target.value)}
                    placeholder="brandname keyword"
                    className="w-full bg-surface border border-line text-ink rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted">Exclude / Avoid</span>
                  <input
                    type="text"
                    value={exclude}
                    onChange={(e) => setExclude(e.target.value)}
                    placeholder="spammy tags"
                    className="w-full bg-surface border border-line text-ink rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: RESULTS & ANALYSIS ================= */}
        <div className="space-y-6 lg:sticky lg:top-6 min-w-0">
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-sm relative flex flex-col min-h-[520px]">
            
            {/* Result Header */}
            <div className="flex items-center justify-between mb-4 border-b border-line pb-3 shrink-0">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-ink">
                  Generated Hashtag Set
                </h3>
                <p className="text-[10px] font-bold text-muted mt-0.5">
                  {hashtags.length} tags · {platform} · {strategy}
                </p>
              </div>
              
              <div className="text-right">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Relevance</span>
                <span className="text-lg font-black text-emerald-500 font-mono">{relevanceScore}%</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-line mb-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("results")}
                className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  activeTab === "results" ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                Hashtags
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("analysis")}
                className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  activeTab === "analysis" ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                Smart Analysis
              </button>
            </div>

            {activeTab === "results" ? (
              <div className="flex-1 flex flex-col space-y-4">
                
                {/* Hashtag Badges */}
                <div className="flex-1 bg-paper p-3.5 rounded-xl border border-line shadow-inner max-h-[220px] overflow-y-auto custom-scrollbar flex flex-wrap gap-1.5 content-start">
                  {hashtags.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted py-8">
                      No hashtags generated yet.
                    </div>
                  ) : (
                    hashtags.map((item, index) => (
                      <button
                        key={item.tag + index}
                        type="button"
                        onClick={() => copyText("#" + item.tag)}
                        title={`Heuristic relevance: ${item.score}/100`}
                        className="inline-flex items-center gap-1.5 bg-surface border border-line text-brand hover:border-brand px-3 py-1.5 rounded-lg text-xs font-black font-mono transition-all cursor-pointer shadow-sm"
                      >
                        #{item.tag}
                        <span className="text-[9px] text-muted font-normal">{item.score}</span>
                      </button>
                    ))
                  )}
                </div>

                {/* Copy Box */}
                <div className="p-3 bg-paper border border-line rounded-xl text-xs font-mono text-ink select-all break-words max-h-24 overflow-y-auto custom-scrollbar shadow-inner">
                  {hashtagText || "No hashtags generated yet."}
                </div>

                {/* Export Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => copyText()}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy All"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-paper border border-line hover:border-brand text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> TXT
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile(true)}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-paper border border-line hover:border-brand text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar max-h-[360px]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-paper border border-line rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Words</span>
                    <span className="text-lg font-black text-ink font-mono">{new Set(extractWords(text)).size}</span>
                  </div>
                  <div className="p-3 bg-paper border border-line rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Candidates</span>
                    <span className="text-lg font-black text-ink font-mono">{candidates.length}</span>
                  </div>
                  <div className="p-3 bg-paper border border-line rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Selected</span>
                    <span className="text-lg font-black text-ink font-mono">{hashtags.length}</span>
                  </div>
                  <div className="p-3 bg-paper border border-line rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Language</span>
                    <span className="text-sm font-black text-brand truncate block">{detectedLanguage}</span>
                  </div>
                </div>

                <div className="space-y-2 bg-paper border border-line p-4 rounded-xl">
                  <div className="flex justify-between text-xs py-1 border-b border-line">
                    <span className="text-muted font-bold">Platform</span>
                    <span className="font-black text-ink">{platform}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-line">
                    <span className="text-muted font-bold">Strategy</span>
                    <span className="font-black text-ink">{strategy}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-line">
                    <span className="text-muted font-bold">Rec. Density</span>
                    <span className="font-black text-ink">{PLATFORMS[platform].rec} tags</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-muted font-bold">Excluded Tags</span>
                    <span className="font-black text-ink">{excludedTags.size}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                  Scores are heuristic relevance scores based on your content. They reflect keyword density and niche alignment rather than live social trends.
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}