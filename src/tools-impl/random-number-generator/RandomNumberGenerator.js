"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { 
  Hash, Copy, CheckCircle2, Trash2, 
  Sliders, ArrowUpDown, Zap, RefreshCw 
} from "lucide-react";

function randomInt(min, max) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function formatNumber(value) {
  return Number(value).toLocaleString();
}

export default function RandomNumberGenerator() {
  const [isMounted, setIsMounted] = useState(false);

  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [unique, setUnique] = useState(true);
  const [sortResults, setSortResults] = useState(false);
  const [allowDuplicates, setAllowDuplicates] = useState(false);

  const [numbers, setNumbers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const numericInfo = useMemo(() => {
    return {
      min: Number(min),
      max: Number(max),
      count: Number(count),
    };
  }, [min, max, count]);

  const generateNumbers = useCallback(() => {
    setCopied(false);
    setError("");

    const low = numericInfo.min;
    const high = numericInfo.max;
    const amount = numericInfo.count;

    if (!Number.isFinite(low) || !Number.isFinite(high)) {
      setError("Please enter valid minimum and maximum numbers.");
      return;
    }

    if (low > high) {
      setError("Minimum value cannot be greater than maximum value.");
      return;
    }

    if (!Number.isInteger(low) || !Number.isInteger(high)) {
      setError("Minimum and maximum values must be whole numbers.");
      return;
    }

    if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
      setError("Number of results must be between 1 and 1000.");
      return;
    }

    const available = high - low + 1;

    if (unique && !allowDuplicates && amount > available) {
      setError("There are not enough unique numbers in this range.");
      return;
    }

    let generated = [];

    if (unique && !allowDuplicates) {
      const pool = [];
      for (let i = low; i <= high; i += 1) {
        pool.push(i);
      }

      for (let j = pool.length - 1; j > 0; j -= 1) {
        const randomIndex = Math.floor(Math.random() * (j + 1));
        const temp = pool[j];
        pool[j] = pool[randomIndex];
        pool[randomIndex] = temp;
      }

      generated = pool.slice(0, amount);
    } else {
      for (let k = 0; k < amount; k += 1) {
        generated.push(randomInt(low, high));
      }
    }

    if (sortResults) {
      generated.sort((a, b) => a - b);
    }

    setNumbers(generated);
  }, [numericInfo, unique, allowDuplicates, sortResults]);

  useEffect(() => {
    if (isMounted) {
      generateNumbers();
    }
  }, [isMounted, generateNumbers]);

  async function copyNumbers() {
    if (!numbers.length) return;
    const text = numbers.join("\n");

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      setCopied(false);
    }
  }

  function clearResults() {
    setNumbers([]);
    setError("");
    setCopied(false);
  }

  function setPreset(presetMin, presetMax) {
    setMin(String(presetMin));
    setMax(String(presetMax));
    setError("");
  }

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Hash className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Random Number Generator
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Generate random numbers instantly with unique mode, bulk options, and sorting.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: SETTINGS PANEL */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-5 w-full box-border font-sans">
            
            <div className="border-b border-line pb-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand" /> 1. Range Settings
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted" htmlFor="rng-min">
                  Minimum
                </label>
                <input
                  id="rng-min"
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand tabular-nums"
                  type="number"
                  value={min}
                  onChange={(event) => setMin(event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted" htmlFor="rng-max">
                  Maximum
                </label>
                <input
                  id="rng-max"
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand tabular-nums"
                  type="number"
                  value={max}
                  onChange={(event) => setMax(event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button type="button" onClick={() => setPreset(1, 10)} className="p-2 text-[10px] font-black uppercase tracking-wider rounded-xl border border-line bg-surface text-muted hover:text-ink transition-all">
                1–10
              </button>
              <button type="button" onClick={() => setPreset(1, 100)} className="p-2 text-[10px] font-black uppercase tracking-wider rounded-xl border border-line bg-surface text-muted hover:text-ink transition-all">
                1–100
              </button>
              <button type="button" onClick={() => setPreset(1, 1000)} className="p-2 text-[10px] font-black uppercase tracking-wider rounded-xl border border-line bg-surface text-muted hover:text-ink transition-all">
                1–1K
              </button>
              <button type="button" onClick={() => setPreset(1, 1000000)} className="p-2 text-[10px] font-black uppercase tracking-wider rounded-xl border border-line bg-surface text-muted hover:text-ink transition-all">
                1–1M
              </button>
            </div>

            <hr className="border-line" />

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted" htmlFor="rng-count">
                Number of Results (1 – 1000)
              </label>
              <input
                id="rng-count"
                className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand tabular-nums"
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(event) => setCount(event.target.value)}
              />
            </div>

            <hr className="border-line" />

            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={unique}
                  onChange={(event) => setUnique(event.target.checked)}
                  className="w-4 h-4 accent-brand rounded cursor-pointer"
                />
                <span className="text-xs font-black text-ink uppercase tracking-wider">Unique Numbers Only</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={sortResults}
                  onChange={(event) => setSortResults(event.target.checked)}
                  className="w-4 h-4 accent-brand rounded cursor-pointer"
                />
                <span className="text-xs font-black text-ink uppercase tracking-wider">Sort Low to High</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={(event) => setAllowDuplicates(event.target.checked)}
                  className="w-4 h-4 accent-brand rounded cursor-pointer"
                />
                <span className="text-xs font-black text-ink uppercase tracking-wider">Allow Duplicates</span>
              </label>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-500 leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="button"
              className="w-full py-3 px-4 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90 shadow-sm"
              onClick={generateNumbers}
            >
              Generate Numbers
            </button>

          </div>
        </div>

        {/* RIGHT: RESULTS & METRICS OUTPUT */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col min-h-[500px] w-full box-border font-sans">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-brand" /> Generated Results
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted mt-0.5 block tabular-nums">
                  {numbers.length ? `${numbers.length} number${numbers.length === 1 ? "" : "s"} generated` : "Ready to generate"}
                </span>
              </div>

              {numbers.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyNumbers}
                    className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                      copied ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-surface border border-line text-ink hover:border-brand"
                    }`}
                  >
                    {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy All</>}
                  </button>
                  <button
                    type="button"
                    onClick={clearResults}
                    className="py-2 px-3 bg-surface border border-line text-muted hover:text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5"/> Clear
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 py-4">
              {numbers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[410px] overflow-y-auto pr-1">
                  {numbers.map((number, index) => (
                    <div
                      key={String(number) + "-" + index}
                      className="p-3 bg-surface border border-line rounded-xl flex items-center justify-center text-center font-mono text-base font-black text-ink tabular-nums shadow-sm min-h-[52px]"
                    >
                      {formatNumber(number)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 my-auto">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xl mb-3">
                    #
                  </div>
                  <strong className="text-sm font-bold text-ink block">Your numbers will appear here</strong>
                  <span className="text-[11px] text-muted block max-w-[260px] mt-1">
                    Set your custom range and criteria on the left, then generate.
                  </span>
                </div>
              )}
            </div>

            {/* METRICS FOOTER */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-line mt-auto">
              <div className="p-3 bg-surface border border-line rounded-xl text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Minimum</span>
                <strong className="text-xs font-black text-ink mt-1 block tabular-nums">
                  {formatNumber(Number.isFinite(numericInfo.min) ? numericInfo.min : 0)}
                </strong>
              </div>
              <div className="p-3 bg-surface border border-line rounded-xl text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Maximum</span>
                <strong className="text-xs font-black text-ink mt-1 block tabular-nums">
                  {formatNumber(Number.isFinite(numericInfo.max) ? numericInfo.max : 0)}
                </strong>
              </div>
              <div className="p-3 bg-surface border border-line rounded-xl text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Mode</span>
                <strong className="text-xs font-black text-ink mt-1 block">
                  {unique && !allowDuplicates ? "Unique" : "Standard"}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 text-[10px] text-muted font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Generated locally in your browser.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}