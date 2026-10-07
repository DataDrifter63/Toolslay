"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { 
  KeyRound, Copy, CheckCircle2, ShieldCheck, 
  Settings2, Sliders, History, Trash2, Eye, EyeOff, Zap 
} from "lucide-react";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";
const AMBIGUOUS = "Il1O0o";
const SIMILAR_SYMBOLS = "{}[]()/\\'\"`~,;:.<>";

function randomInt(max) {
  if (max <= 0) return 0;
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function secureRandomChar(chars) {
  return chars[randomInt(chars.length)];
}

function shuffleSecurely(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

function getEntropyBits(length, poolSize) {
  if (!length || !poolSize) return 0;
  return Math.round(length * Math.log2(poolSize));
}

function getStrength(entropy) {
  if (entropy < 45) {
    return { label: "Very Weak", level: 1, message: "Too easy to guess. Increase length." };
  }
  if (entropy < 60) {
    return { label: "Weak", level: 2, message: "Suitable only for low-risk temporary use." };
  }
  if (entropy < 80) {
    return { label: "Good", level: 3, message: "Reasonable protection for many everyday accounts." };
  }
  if (entropy < 100) {
    return { label: "Strong", level: 4, message: "Strong password with a large search space." };
  }
  return { label: "Excellent", level: 5, message: "Very large search space and excellent resistance." };
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

export default function PasswordGenerator() {
  const [isMounted, setIsMounted] = useState(false);

  const [length, setLength] = useState(20);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [excludeSimilarSymbols, setExcludeSimilarSymbols] = useState(false);
  const [noRepeating, setNoRepeating] = useState(false);
  const [noSequential, setNoSequential] = useState(false);

  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyEnabled, setHistoryEnabled] = useState(false);

  const [customPrefix, setCustomPrefix] = useState("");
  const [customSuffix, setCustomSuffix] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedPools = useMemo(() => {
    let pools = [];
    if (useLower) pools.push(LOWERCASE);
    if (useUpper) pools.push(UPPERCASE);
    if (useNumbers) pools.push(NUMBERS);
    if (useSymbols) pools.push(SYMBOLS);

    if (excludeAmbiguous) {
      pools = pools.map((pool) =>
        pool.split("").filter((char) => !AMBIGUOUS.includes(char)).join("")
      );
    }

    if (excludeSimilarSymbols) {
      pools = pools.map((pool) =>
        pool.split("").filter((char) => !SIMILAR_SYMBOLS.includes(char)).join("")
      );
    }

    return pools.filter(Boolean);
  }, [useLower, useUpper, useNumbers, useSymbols, excludeAmbiguous, excludeSimilarSymbols]);

  const combinedPool = useMemo(() => {
    return Array.from(new Set(selectedPools.join("").split("")));
  }, [selectedPools]);

  const entropy = useMemo(() => {
    return getEntropyBits(length, combinedPool.length);
  }, [length, combinedPool.length]);

  const strength = useMemo(() => {
    return getStrength(entropy);
  }, [entropy]);

  const generatePassword = useCallback(() => {
    if (!selectedPools.length) {
      setPassword("");
      return;
    }

    let targetLength = Number(length) || 20;
    if (targetLength < 4) targetLength = 4;
    if (targetLength > 128) targetLength = 128;

    const prefix = customPrefix || "";
    const suffix = customSuffix || "";

    const reservedLength = Math.min(prefix.length + suffix.length, targetLength - 1);
    const bodyLength = Math.max(1, targetLength - reservedLength);

    let result = [];

    selectedPools.forEach((pool) => {
      if (result.length < bodyLength && pool.length) {
        result.push(secureRandomChar(pool));
      }
    });

    let attempts = 0;
    while (result.length < bodyLength && attempts < 5000) {
      attempts += 1;
      const char = secureRandomChar(combinedPool);

      if (noRepeating && result.length > 0 && result[result.length - 1] === char) {
        continue;
      }

      if (noSequential && result.length >= 2) {
        const a = result[result.length - 2];
        const b = result[result.length - 1];
        const codeA = a.charCodeAt(0);
        const codeB = b.charCodeAt(0);
        const codeC = char.charCodeAt(0);

        if (codeB === codeA + 1 && codeC === codeB + 1) continue;
        if (codeB === codeA - 1 && codeC === codeB - 1) continue;
      }

      result.push(char);
    }

    if (result.length < bodyLength) {
      while (result.length < bodyLength) {
        result.push(secureRandomChar(combinedPool));
      }
    }

    result = shuffleSecurely(result);

    let finalPassword = prefix + result.join("") + suffix;
    if (finalPassword.length > targetLength) {
      finalPassword = finalPassword.slice(0, targetLength);
    }

    setPassword(finalPassword);
    setCopied(false);

    if (historyEnabled) {
      setHistory((current) => {
        const next = [finalPassword, ...current.filter((item) => item !== finalPassword)];
        return next.slice(0, 8);
      });
    }
  }, [selectedPools, combinedPool, length, noRepeating, noSequential, customPrefix, customSuffix, historyEnabled]);

  useEffect(() => {
    if (isMounted) {
      generatePassword();
    }
  }, [isMounted, generatePassword]);

  async function copyPassword(value) {
    if (!value) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      setCopied(false);
    }
  }

  function handleLengthChange(event) {
    let value = Number(event.target.value);
    if (Number.isNaN(value)) value = 20;
    if (value < 4) value = 4;
    if (value > 128) value = 128;
    setLength(value);
  }

  function clearHistory() {
    setHistory([]);
  }

  function resetSettings() {
    setLength(20);
    setUseLower(true);
    setUseUpper(true);
    setUseNumbers(true);
    setUseSymbols(true);
    setExcludeAmbiguous(false);
    setExcludeSimilarSymbols(false);
    setNoRepeating(false);
    setNoSequential(false);
    setCustomPrefix("");
    setCustomSuffix("");
    setHistory([]);
    setHistoryEnabled(false);
    setCopied(false);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Secure Password Generator
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Cryptographically secure passwords with entropy insights.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: SETTINGS ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border font-sans">
            
            {/* 1. Length Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand" /> 1. Password Length
                </h3>
                <span className="text-xs font-black tabular-nums text-ink bg-surface px-2.5 py-0.5 rounded-lg border border-line">{length} chars</span>
              </div>

              <div className="grid grid-cols-[1fr_75px] gap-3 items-center">
                <input
                  className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-brand"
                  type="range"
                  min="4"
                  max="128"
                  value={length}
                  onChange={handleLengthChange}
                />
                <input
                  className="w-full bg-surface border border-line rounded-xl px-2.5 py-2 text-sm font-bold text-ink outline-none text-center tabular-nums focus:border-brand"
                  type="number"
                  min="4"
                  max="128"
                  value={length}
                  onChange={handleLengthChange}
                />
              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Character Types */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Settings2 className="w-3.5 h-3.5 text-brand" /> 2. Character Types
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: "Lowercase (a-z)", state: useLower, set: setUseLower },
                  { label: "Uppercase (A-Z)", state: useUpper, set: setUseUpper },
                  { label: "Numbers (0-9)", state: useNumbers, set: setUseNumbers },
                  { label: "Symbols (!@#)", state: useSymbols, set: setUseSymbols },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.set(e.target.checked)}
                      className="w-4 h-4 accent-brand rounded cursor-pointer"
                    />
                    <span className="text-xs font-black text-ink uppercase tracking-wider">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-line" />

            {/* 3. Advanced Rules */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" /> 3. Advanced Rules & Customization
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: "Remove ambiguous (Il1O0o)", state: excludeAmbiguous, set: setExcludeAmbiguous },
                  { label: "Remove similar symbols", state: excludeSimilarSymbols, set: setExcludeSimilarSymbols },
                  { label: "Avoid repeated chars", state: noRepeating, set: setNoRepeating },
                  { label: "Avoid sequential chars", state: noSequential, set: setNoSequential },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.set(e.target.checked)}
                      className="w-4 h-4 accent-brand rounded cursor-pointer"
                    />
                    <span className="text-[10px] font-black text-ink uppercase tracking-wider">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <input
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink outline-none focus:border-brand"
                  type="text"
                  value={customPrefix}
                  onChange={(e) => setCustomPrefix(e.target.value)}
                  placeholder="Optional prefix"
                  maxLength={30}
                />
                <input
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink outline-none focus:border-brand"
                  type="text"
                  value={customSuffix}
                  onChange={(e) => setCustomSuffix(e.target.value)}
                  placeholder="Optional suffix"
                  maxLength={30}
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={historyEnabled}
                  onChange={(e) => setHistoryEnabled(e.target.checked)}
                  className="w-4 h-4 accent-brand rounded cursor-pointer"
                />
                <span className="text-xs font-black text-ink uppercase tracking-wider">Keep temporary generation history</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={generatePassword}
                className="flex-1 py-3 px-4 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90 shadow-sm"
              >
                Generate New
              </button>
              <button
                type="button"
                onClick={resetSettings}
                className="py-3 px-5 bg-surface border border-line text-muted hover:text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
              >
                Reset
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT: OUTPUT & ANALYTICS */}
        <div className="space-y-4 sm:space-y-6 w-full">
          
          {/* PASSWORD OUTPUT DASHBOARD */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Zap className="w-4 h-4 text-brand" /> Generated Password
              </span>
              
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="text-[10px] font-black uppercase tracking-wider text-muted hover:text-ink flex items-center gap-1 bg-surface border border-line px-2.5 py-1 rounded-lg"
              >
                {visible ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                {visible ? "Hide" : "Show"}
              </button>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-line flex items-center min-h-[72px] overflow-hidden">
              {password ? (
                <code className="w-full text-sm sm:text-base font-mono font-bold text-ink break-all tabular-nums">
                  {visible ? password : "•".repeat(password.length)}
                </code>
              ) : (
                <div className="text-xs font-bold text-muted italic">
                  Click generate to create a secure password.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={generatePassword}
                className="py-2.5 px-3 bg-surface border border-line text-ink hover:border-brand rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
              >
                Regenerate
              </button>
              <button
                type="button"
                onClick={() => copyPassword(password)}
                disabled={!password}
                className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                  copied ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-brand text-surface shadow-sm hover:opacity-90 disabled:opacity-50"
                }`}
              >
                {copied ? <><CheckCircle2 className="w-4 h-4"/> Copied</> : <><Copy className="w-4 h-4"/> Copy Password</>}
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

            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className={`h-1.5 rounded-full transition-colors ${
                    bar <= strength.level ? "bg-brand" : "bg-line"
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] font-medium text-muted leading-relaxed">
              {strength.message}
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="flex flex-col items-center justify-center bg-surface border border-line p-3 rounded-xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Length</span>
                <span className="text-sm font-black text-ink mt-1 tabular-nums">{length}</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-surface border border-line p-3 rounded-xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Pool Size</span>
                <span className="text-sm font-black text-ink mt-1 tabular-nums">{formatNumber(combinedPool.length)}</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-surface border border-line p-3 rounded-xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Entropy</span>
                <span className="text-sm font-black text-ink mt-1 tabular-nums">{formatNumber(entropy)} bits</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-brand/10 border border-brand/30 rounded-xl text-[10px] font-medium text-ink leading-relaxed">
              <span className="text-brand font-bold text-xs">✓</span>
              <span>Generated locally using Web Crypto API. Nothing is sent to any server.</span>
            </div>

          </div>

          {/* TEMPORARY HISTORY PANEL */}
          {historyEnabled && (
            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
              
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                  <History className="w-4 h-4 text-brand" /> Temporary History
                </span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-[10px] font-black uppercase tracking-wider text-muted hover:text-[#fb7185] transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5"/> Clear
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="text-xs font-bold text-muted italic text-center py-4">
                    Generated passwords will appear here temporarily.
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div
                      className="flex items-center justify-between gap-3 p-2.5 bg-surface border border-line rounded-xl"
                      key={item + index}
                    >
                      <code className="text-xs font-mono font-bold text-ink truncate tabular-nums">
                        {item}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyPassword(item)}
                        className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-lg border border-brand/30 hover:opacity-80 transition-opacity shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}