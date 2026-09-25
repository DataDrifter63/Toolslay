"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Key, Copy, CheckCircle2, ShieldCheck, 
  Settings2, Sliders, History, Trash2, Zap 
} from "lucide-react";

const WORD_BANK = [
  "amber","apple","arrow","atlas","autumn","beacon","berry","blade",
  "blossom","blue","bridge","bright","canyon","cedar","cloud","cobalt",
  "comet","coral","cosmic","crystal","dawn","delta","desert","drift",
  "eagle","ember","falcon","forest","frost","garden","glacier","golden",
  "harbor","hazel","horizon","ivory","jade","jungle","lantern","lunar",
  "maple","marble","meadow","meteor","mist","moon","mountain","navy",
  "ocean","olive","orchard","orbit","pearl","pine","planet","plasma",
  "quartz","rain","raven","river","rocket","rose","royal","saffron",
  "shadow","silver","sky","solar","spark","spring","stone","storm",
  "summit","sunset","thunder","tiger","timber","topaz","trail","violet",
  "wave","willow","winter","wolf","woodland","zenith","anchor","aurora",
  "bamboo","breeze","candle","cascade","citrus","crown","eclipse","flame",
  "honey","island","lemon","lotus","midnight","nebula","pepper","phoenix",
  "rainbow","sapphire","seashell","snow","thunder","velvet","whisper","zephyr"
];

function secureRandom(max) {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function randomWord() {
  return WORD_BANK[secureRandom(WORD_BANK.length)];
}

function randomNumber(max) {
  return String(secureRandom(max));
}

function randomSeparator() {
  const separators = ["-", "_", ".", " ", "~"];
  return separators[secureRandom(separators.length)];
}

function capitalizeWord(word) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generatePassphrase(options) {
  const words = [];
  for (let i = 0; i < options.wordCount; i += 1) {
    let word = randomWord();
    if (options.capitalize) {
      word = capitalizeWord(word);
    }
    words.push(word);
  }

  let result = words.join(
    options.separator === "random" ? randomSeparator() : options.separator
  );

  if (options.addNumber) {
    const number = randomNumber(1000);
    if (options.numberPosition === "start") {
      result = number + (options.separator === " " ? " " : "") + result;
    } else {
      result = result + (options.separator === " " ? " " : "") + number;
    }
  }

  if (options.addSymbol) {
    const symbols = ["!", "@", "#", "$", "%", "&", "*", "?"];
    const symbol = symbols[secureRandom(symbols.length)];
    if (options.symbolPosition === "start") {
      result = symbol + result;
    } else {
      result = result + symbol;
    }
  }

  return result;
}

function calculateEntropy(options) {
  const pool = WORD_BANK.length;
  let entropy = options.wordCount * Math.log2(pool);
  if (options.addNumber) entropy += Math.log2(1000);
  if (options.addSymbol) entropy += Math.log2(8);
  return Math.round(entropy);
}

function getStrength(entropy) {
  if (entropy >= 100) return { label: "Excellent", width: "100%" };
  if (entropy >= 80) return { label: "Very strong", width: "82%" };
  if (entropy >= 60) return { label: "Strong", width: "65%" };
  return { label: "Moderate", width: "45%" };
}

function estimateCrackTime(entropy) {
  const guessesPerSecond = 1e12;
  const guesses = Math.pow(2, entropy - 1);
  const seconds = guesses / guessesPerSecond;

  if (seconds < 1) return "Less than a second";
  if (seconds < 60) return Math.round(seconds) + " seconds";
  if (seconds < 3600) return Math.round(seconds / 60) + " minutes";
  if (seconds < 86400) return Math.round(seconds / 3600) + " hours";
  if (seconds < 31557600) return Math.round(seconds / 86400) + " days";
  if (seconds < 3155760000) return Math.round(seconds / 31557600) + " years";
  if (seconds < 3155760000000) return Math.round(seconds / 31557600000) + " thousand years";
  return "Extremely long";
}

export default function PassphraseGenerator() {
  const [isMounted, setIsMounted] = useState(false);

  const [wordCount, setWordCount] = useState(5);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(false);
  const [addNumber, setAddNumber] = useState(true);
  const [numberPosition, setNumberPosition] = useState("end");
  const [addSymbol, setAddSymbol] = useState(true);
  const [symbolPosition, setSymbolPosition] = useState("end");

  const [passphrase, setPassphrase] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const buildOptions = useCallback(() => {
    return {
      wordCount: Number(wordCount),
      separator,
      capitalize,
      addNumber,
      numberPosition,
      addSymbol,
      symbolPosition
    };
  }, [wordCount, separator, capitalize, addNumber, numberPosition, addSymbol, symbolPosition]);

  const generate = useCallback(() => {
    const options = buildOptions();
    const value = generatePassphrase(options);
    setPassphrase(value);
    setCopied(false);
    setHistory((current) => [value, ...current].slice(0, 5));
  }, [buildOptions]);

  useEffect(() => {
    if (isMounted) {
      generate();
    }
  }, [isMounted, generate]);

  async function copyPassphrase() {
    if (!passphrase) return;
    try {
      await navigator.clipboard.writeText(passphrase);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function clearHistory() {
    setHistory([]);
  }

  function applyHistoryItem(value) {
    setPassphrase(value);
    setCopied(false);
  }

  function applyPreset(type) {
    if (type === "easy") {
      setWordCount(4);
      setSeparator("-");
      setCapitalize(false);
      setAddNumber(true);
      setNumberPosition("end");
      setAddSymbol(false);
      setSymbolPosition("end");
    } else if (type === "strong") {
      setWordCount(5);
      setSeparator("-");
      setCapitalize(true);
      setAddNumber(true);
      setNumberPosition("end");
      setAddSymbol(true);
      setSymbolPosition("end");
    } else if (type === "maximum") {
      setWordCount(7);
      setSeparator("random");
      setCapitalize(true);
      setAddNumber(true);
      setNumberPosition("end");
      setAddSymbol(true);
      setSymbolPosition("end");
    }
  }

  const options = useMemo(() => buildOptions(), [buildOptions]);
  const entropy = useMemo(() => calculateEntropy(options), [options]);
  const strength = useMemo(() => getStrength(entropy), [entropy]);
  const crackTime = useMemo(() => estimateCrackTime(entropy), [entropy]);

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Passphrase Generator
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Memorable, high-entropy passphrases with custom word structures.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: SETTINGS ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border font-sans">
            
            {/* 1. Word Count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand" /> 1. Number of Words
                </h3>
                <span className="text-xs font-black tabular-nums text-ink bg-surface px-2.5 py-0.5 rounded-lg border border-line">{wordCount} words</span>
              </div>

              <div className="grid grid-cols-[1fr_75px] gap-3 items-center">
                <input
                  className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand"
                  type="range"
                  min="3"
                  max="12"
                  value={wordCount}
                  onChange={(event) => setWordCount(Number(event.target.value))}
                />
                <input
                  className="w-full bg-surface border border-line rounded-xl px-2.5 py-2 text-sm font-bold text-ink outline-none text-center tabular-nums focus:border-brand"
                  type="number"
                  min="3"
                  max="12"
                  value={wordCount}
                  onChange={(event) => setWordCount(Number(event.target.value))}
                />
              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Formatting & Separators */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Settings2 className="w-3.5 h-3.5 text-brand" /> 2. Formatting & Separator
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Word Separator</label>
                <select
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none appearance-none cursor-pointer"
                  value={separator}
                  onChange={(event) => setSeparator(event.target.value)}
                >
                  <option value="-">Hyphen (—)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=".">Dot (.)</option>
                  <option value=" ">Space</option>
                  <option value="~">Tilde (~)</option>
                  <option value="random">Random</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={capitalize}
                    onChange={(event) => setCapitalize(event.target.checked)}
                    className="w-4 h-4 accent-brand rounded cursor-pointer"
                  />
                  <span className="text-xs font-black text-ink uppercase tracking-wider">Capitalize Words</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={addNumber}
                    onChange={(event) => setAddNumber(event.target.checked)}
                    className="w-4 h-4 accent-brand rounded cursor-pointer"
                  />
                  <span className="text-xs font-black text-ink uppercase tracking-wider">Add Number</span>
                </label>
              </div>

              {addNumber && (
                <select
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none appearance-none cursor-pointer"
                  value={numberPosition}
                  onChange={(event) => setNumberPosition(event.target.value)}
                >
                  <option value="end">Number at the end</option>
                  <option value="start">Number at the beginning</option>
                </select>
              )}

              <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={addSymbol}
                  onChange={(event) => setAddSymbol(event.target.checked)}
                  className="w-4 h-4 accent-brand rounded cursor-pointer"
                />
                <span className="text-xs font-black text-ink uppercase tracking-wider">Add Random Symbol (!@#$)</span>
              </label>

              {addSymbol && (
                <select
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none appearance-none cursor-pointer"
                  value={symbolPosition}
                  onChange={(event) => setSymbolPosition(event.target.value)}
                >
                  <option value="end">Symbol at the end</option>
                  <option value="start">Symbol at the beginning</option>
                </select>
              )}
            </div>

            <hr className="border-line" />

            {/* 3. Quick Presets */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" /> 3. Quick Presets
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("easy")}
                  className="p-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl border border-line text-muted hover:text-ink bg-surface transition-all"
                >
                  Easy
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("strong")}
                  className="p-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl border border-brand/30 bg-brand/10 text-brand transition-all"
                >
                  Strong
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("maximum")}
                  className="p-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl border border-line text-muted hover:text-ink bg-surface transition-all"
                >
                  Maximum
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={generate}
              className="w-full py-3 px-4 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90 shadow-sm mt-2"
            >
              Generate New Passphrase
            </button>

          </div>
        </div>

        {/* RIGHT: OUTPUT & ANALYTICS */}
        <div className="space-y-4 sm:space-y-6 w-full">
          
          {/* PASSPHRASE OUTPUT DASHBOARD */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Zap className="w-4 h-4 text-brand" /> Generated Passphrase
              </span>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-line flex items-center min-h-[72px] overflow-hidden">
              <code className="w-full text-sm sm:text-base font-mono font-bold text-ink break-all tabular-nums">
                {passphrase || "Click Generate New Passphrase"}
              </code>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={generate}
                className="py-2.5 px-3 bg-surface border border-line text-ink hover:border-brand rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
              >
                Regenerate
              </button>
              <button
                type="button"
                onClick={copyPassphrase}
                disabled={!passphrase}
                className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                  copied ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-brand text-surface shadow-sm hover:opacity-90 disabled:opacity-50"
                }`}
              >
                {copied ? <><CheckCircle2 className="w-4 h-4"/> Copied</> : <><Copy className="w-4 h-4"/> Copy Passphrase</>}
              </button>
            </div>

          </div>

          {/* STRENGTH & METRICS DASHBOARD */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <ShieldCheck className="w-4 h-4 text-brand" /> Security Strength
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30">
                {strength.label}
              </span>
            </div>

            <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
              <div className="h-full bg-brand transition-all duration-300" style={{ width: strength.width }} />
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="flex flex-col items-center justify-center bg-surface border border-line p-3 rounded-xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Entropy</span>
                <span className="text-sm font-black text-ink mt-1 tabular-nums">{entropy} bits</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-surface border border-line p-3 rounded-xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Words</span>
                <span className="text-sm font-black text-ink mt-1 tabular-nums">{wordCount}</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-surface border border-line p-3 rounded-xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Crack Time</span>
                <span className="text-xs font-black text-ink mt-1 tabular-nums text-center">{crackTime}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-brand/10 border border-brand/30 rounded-xl text-[10px] font-medium text-ink leading-relaxed">
              <span className="text-brand font-bold text-xs">✓</span>
              <span>Generated locally using Web Crypto API. Nothing is sent to any server.</span>
            </div>

          </div>

          {/* RECENT HISTORY PANEL */}
          {history.length > 0 && (
            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
              
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                  <History className="w-4 h-4 text-brand" /> Recent Generations
                </span>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[10px] font-black uppercase tracking-wider text-muted hover:text-[#fb7185] transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5"/> Clear
                </button>
              </div>

              <div className="space-y-2">
                {history.map((item, index) => (
                  <div
                    className="flex items-center justify-between gap-3 p-2.5 bg-surface border border-line rounded-xl"
                    key={item + "-" + index}
                  >
                    <code className="text-xs font-mono font-bold text-ink truncate tabular-nums">
                      {item}
                    </code>
                    <button
                      type="button"
                      onClick={() => applyHistoryItem(item)}
                      className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-lg border border-brand/30 hover:opacity-80 transition-opacity shrink-0"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}