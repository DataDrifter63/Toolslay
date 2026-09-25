"use client";

import React, { useMemo, useState } from "react";
import { 
  Heart, Sparkles, Copy, Check, RotateCcw, 
  Lightbulb, ShieldAlert, SlidersHorizontal 
} from "lucide-react";

function normalizeName(value) {
  if (typeof value !== "string") return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function cleanName(value) {
  return normalizeName(value).replace(/[^a-z]/g, "");
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1000000007;
  }
  return Math.abs(hash);
}

function calculateLoveScore(first, second) {
  const a = cleanName(first);
  const b = cleanName(second);

  if (!a || !b) return null;

  const combined = a + "|" + b;
  const forwardHash = hashString(combined);
  const reverseHash = hashString(b + "|" + a);

  const lettersA = {};
  const lettersB = {};

  for (let i = 0; i < a.length; i++) {
    lettersA[a[i]] = (lettersA[a[i]] || 0) + 1;
  }

  for (let j = 0; j < b.length; j++) {
    lettersB[b[j]] = (lettersB[b[j]] || 0) + 1;
  }

  let shared = 0;
  let uniqueA = 0;
  let uniqueB = 0;

  Object.keys(lettersA).forEach((letter) => {
    if (lettersB[letter]) {
      shared += Math.min(lettersA[letter], lettersB[letter]);
    }
  });

  Object.keys(lettersA).forEach((letter) => {
    uniqueA += lettersA[letter];
  });

  Object.keys(lettersB).forEach((letter) => {
    uniqueB += lettersB[letter];
  });

  const lengthFactor = Math.max(1, Math.min(20, a.length + b.length));
  const sharedRatio = shared / Math.max(1, Math.min(uniqueA, uniqueB));

  const base =
    (forwardHash % 61) +
    (reverseHash % 31) +
    Math.round(sharedRatio * 25) +
    lengthFactor;

  const score = 35 + (base % 66);
  return Math.max(1, Math.min(100, score));
}

function getLevel(score) {
  if (score >= 90) {
    return {
      title: "Exceptional Match",
      description: "Your names create an unusually strong compatibility pattern.",
      emoji: "💖",
      color: "text-teal",
    };
  }
  if (score >= 80) {
    return {
      title: "Very Strong Connection",
      description: "There is a strong harmony between both names with excellent potential.",
      emoji: "💕",
      color: "text-teal",
    };
  }
  if (score >= 70) {
    return {
      title: "Strong Potential",
      description: "Your compatibility looks promising with plenty of positive energy.",
      emoji: "💗",
      color: "text-brand",
    };
  }
  if (score >= 60) {
    return {
      title: "Good Connection",
      description: "There is a nice balance between both personalities and energies.",
      emoji: "💞",
      color: "text-brand",
    };
  }
  if (score >= 45) {
    return {
      title: "Interesting Match",
      description: "Your connection has potential and could become stronger with understanding.",
      emoji: "✨",
      color: "text-amber",
    };
  }
  return {
    title: "Opposites Attract",
    description: "Your names show a more contrasting pattern. Differences can create interesting chemistry.",
    emoji: "💫",
    color: "text-amber",
  };
}

function getCompatibility(score) {
  return {
    communication: Math.min(98, Math.max(30, 48 + ((score * 7) % 45))),
    trust: Math.min(97, Math.max(32, 42 + ((score * 11) % 48))),
    chemistry: Math.min(99, Math.max(35, 50 + ((score * 13) % 47))),
    fun: Math.min(98, Math.max(38, 45 + ((score * 17) % 50))),
  };
}

function getAdvice(score) {
  if (score >= 85) {
    return "Keep communication honest and protect the little moments that make the relationship special.";
  }
  if (score >= 70) {
    return "Make time for each other, communicate openly and celebrate your differences.";
  }
  if (score >= 55) {
    return "Patience and clear communication can turn your natural differences into strengths.";
  }
  return "Focus on understanding each other instead of trying to be identical. Differences can be valuable.";
}

function getLuckyNumber(first, second) {
  const hash = hashString(cleanName(first) + cleanName(second));
  return (hash % 9) + 1;
}

function getInitials(first, second) {
  const a = normalizeName(first);
  const b = normalizeName(second);
  return (
    (a ? a.charAt(0).toUpperCase() : "?") +
    (b ? b.charAt(0).toUpperCase() : "?")
  );
}

export default function LoveCalculator() {
  const [nameOne, setNameOne] = useState("");
  const [nameTwo, setNameTwo] = useState("");
  const [relationship, setRelationship] = useState("Romantic");
  const [showDetails, setShowDetails] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!cleanName(nameOne) || !cleanName(nameTwo)) {
      return null;
    }
    const score = calculateLoveScore(nameOne, nameTwo);
    const level = getLevel(score);
    const compatibility = getCompatibility(score);

    return {
      score,
      level,
      compatibility,
      advice: getAdvice(score),
      luckyNumber: getLuckyNumber(nameOne, nameTwo),
      initials: getInitials(nameOne, nameTwo),
    };
  }, [nameOne, nameTwo]);

  function calculateRandomExample() {
    const examples = [
      ["Alex", "Taylor"],
      ["Emma", "Noah"],
      ["Sophia", "Liam"],
      ["Olivia", "James"],
      ["Mia", "Ethan"],
    ];
    const item = examples[Math.floor(Math.random() * examples.length)];
    setNameOne(item[0]);
    setNameTwo(item[1]);
  }

  function resetTool() {
    setNameOne("");
    setNameTwo("");
    setRelationship("Romantic");
    setCopied(false);
  }

  function copyResult() {
    if (!result) return;
    const text =
      "Love Compatibility Result\n\n" +
      nameOne +
      " + " +
      nameTwo +
      "\n" +
      "Compatibility: " +
      result.score +
      "%\n" +
      "Match: " +
      result.level.title +
      "\n" +
      "Communication: " +
      result.compatibility.communication +
      "%\n" +
      "Trust: " +
      result.compatibility.trust +
      "%\n" +
      "Chemistry: " +
      result.compatibility.chemistry +
      "%\n" +
      "Fun & Energy: " +
      result.compatibility.fun +
      "%\n\n" +
      "Advice: " +
      result.advice;

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }
  }

  const baseInputStyle = "w-full min-w-0 h-10 px-3 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
  const baseSelectStyle = "w-full min-w-0 h-10 pl-3 pr-8 bg-surface border border-line rounded-lg text-ink text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink">
      
      {/* MAIN WRAPPER SHELL */}
      <div className="rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6 space-y-6 min-w-0">
        
        {/* HEADER BAR WITH ACTION BUTTONS ALIGNED RIGHT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Heart className="w-5 h-5 text-brand shrink-0 fill-current" />
            <h2 className="text-base sm:text-lg font-display font-bold text-ink truncate">
              Advanced Love Analyzer
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={calculateRandomExample}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-line bg-surface hover:bg-paper text-ink text-xs font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand" /> Try Example
            </button>

            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-line bg-surface hover:bg-paper text-ink text-xs font-semibold transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
              {showDetails ? "Hide Insights" : "Show Insights"}
            </button>
          </div>
        </div>

        {/* INPUTS + RESULT MAIN GRID */}
        <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[1fr,1.15fr] min-w-0">
          
          {/* INPUT FORM PANEL */}
          <div className="space-y-4 min-w-0">
            <div className="min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="love-name-one">
                Your Name
              </label>
              <input
                id="love-name-one"
                className={baseInputStyle}
                type="text"
                value={nameOne}
                placeholder="e.g. Alex"
                autoComplete="off"
                onChange={(e) => setNameOne(e.target.value)}
              />
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="love-name-two">
                Their Name
              </label>
              <input
                id="love-name-two"
                className={baseInputStyle}
                type="text"
                value={nameTwo}
                placeholder="e.g. Taylor"
                autoComplete="off"
                onChange={(e) => setNameTwo(e.target.value)}
              />
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="love-relationship">
                Connection Type
              </label>
              <select
                id="love-relationship"
                className={baseSelectStyle}
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              >
                <option value="Romantic">Romantic</option>
                <option value="Dating">Dating</option>
                <option value="Marriage">Marriage</option>
                <option value="Friendship">Friendship</option>
                <option value="Crush">Crush</option>
                <option value="Just Curious">Just Curious</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 min-w-0">
              <button
                type="button"
                onClick={() => {
                  if (nameOne && nameTwo) setShowDetails(true);
                }}
                className="h-10 rounded-lg bg-brand hover:bg-brand/90 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                <Heart className="w-3.5 h-3.5 fill-current" /> Calculate Match
              </button>

              <button
                type="button"
                onClick={resetTool}
                className="h-10 rounded-lg border border-line bg-surface hover:bg-paper text-ink text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-muted" /> Reset
              </button>
            </div>
          </div>

          {/* HERO RESULT CARD (Grey Background Style) */}
          <div className="rounded-xl border border-line bg-paper p-1.5 min-w-0 h-full">
            <div className="bg-surface rounded-lg w-full h-full p-5 sm:p-8 flex flex-col justify-center relative overflow-hidden min-h-[320px] sm:min-h-[350px]">
              {!result ? (
                <div className="text-center max-w-sm mx-auto space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-2xl font-black shadow-inner">
                    <Heart className="w-6 h-6 fill-current animate-pulse" />
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-ink">
                    Your match is waiting
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Enter both names to reveal your compatibility score and detailed relationship insights.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4 min-w-0">
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-brand/15 text-brand flex items-center justify-center text-xs font-black font-mono shadow-sm">
                      {result.initials.charAt(0)}
                    </div>
                    <Heart className="w-4 h-4 text-brand fill-current animate-bounce" />
                    <div className="w-10 h-10 rounded-full bg-brand/15 text-brand flex items-center justify-center text-xs font-black font-mono shadow-sm">
                      {result.initials.charAt(1)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand block mb-1">
                      {relationship.toUpperCase()} COMPATIBILITY SCORE
                    </span>
                    <div className="text-6xl sm:text-7xl md:text-8xl font-display font-black tracking-tighter text-ink font-mono">
                      {result.score}<span className="text-brand text-3xl sm:text-4xl align-top ml-0.5">%</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm sm:text-base font-bold text-ink flex items-center justify-center gap-1.5">
                      <span>{result.level.emoji}</span>
                      <span>{result.level.title}</span>
                    </div>
                    <p className="text-xs text-muted max-w-md mx-auto mt-1 leading-relaxed">
                      {result.level.description}
                    </p>
                  </div>

                  <div className="max-w-md mx-auto w-full h-2 rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all duration-500 rounded-full"
                      style={{ width: `${result.score}%` }}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={copyResult}
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-line bg-paper hover:bg-line text-ink text-xs font-bold transition-colors min-h-[36px]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-teal" /> Copied Result
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Summary
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DETAILED BREAKDOWN & INSIGHTS PANEL */}
        {result && showDetails && (
          <div className="space-y-4 pt-4 border-t border-line min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
              {[
                { label: "Communication", val: result.compatibility.communication },
                { label: "Trust", val: result.compatibility.trust },
                { label: "Chemistry", val: result.compatibility.chemistry },
                { label: "Fun & Energy", val: result.compatibility.fun },
              ].map((item) => (
                <div key={item.label} className="p-3.5 rounded-xl border border-line bg-paper space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-xs text-muted font-medium truncate">{item.label}</span>
                    <strong className="text-xs font-bold font-mono text-ink shrink-0">{item.val}%</strong>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-300"
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4 items-center p-4 rounded-xl border border-line bg-paper min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted block">
                    PERSONALIZED INSIGHT
                  </span>
                  <strong className="text-xs sm:text-sm font-semibold text-ink block mt-0.5 leading-relaxed">
                    {result.advice}
                  </strong>
                </div>
              </div>

              {/* PERFECTLY CENTERED LUCKY NUMBER BOX */}
              <div className="flex items-center justify-center gap-3 px-6 py-3 rounded-lg border border-line bg-surface shrink-0 w-full lg:w-auto mt-2 lg:mt-0">
                <div className="text-center">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted block mb-1">
                    LUCKY NUMBER
                  </span>
                  <strong className="text-2xl font-black font-mono text-brand block leading-none">
                    {result.luckyNumber}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-muted">
              <ShieldAlert className="w-3.5 h-3.5 text-amber shrink-0" />
              <span>This calculator is designed for entertainment. Compatibility cannot scientifically be determined from names.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}