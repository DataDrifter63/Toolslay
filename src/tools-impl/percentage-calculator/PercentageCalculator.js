"use client";

import { useMemo, useState } from "react";
import {
  Percent,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Plus,
  Undo2,
  Copy,
  Check,
  History,
  Trash2,
  Info,
} from "lucide-react";

const PlusMinusIcon = Plus;

const MODES = [
  { id: "percent-of", label: "X% of Y", icon: Percent },
  { id: "is-what-percent", label: "X is what % of Y", icon: ArrowRightLeft },
  { id: "percent-change", label: "% change", icon: TrendingUp },
  { id: "add-subtract", label: "Increase/decrease by %", icon: PlusMinusIcon },
  { id: "reverse", label: "Find original value", icon: Undo2 },
];

const PRESET_PERCENTS = [5, 10, 15, 20, 25, 50, 75];

function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const rounded = Math.round(n * 10000) / 10000;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function NumberField({ label, value, onChange, suffix }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2.5 focus-within:border-brand">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-sm text-ink focus:outline-none"
        />
        {suffix && <span className="shrink-0 text-xs text-muted">{suffix}</span>}
      </div>
    </label>
  );
}

function PresetChips({ onPick }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {PRESET_PERCENTS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPick(p)}
          className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:border-brand hover:text-brand"
        >
          {p}%
        </button>
      ))}
    </div>
  );
}

export default function PercentageCalculator({ compact = false }) {
  const [mode, setMode] = useState("percent-of");

  const [percentOf, setPercentOf] = useState({ percent: "20", base: "150" });
  const [isWhatPercent, setIsWhatPercent] = useState({ part: "30", whole: "150" });
  const [percentChange, setPercentChange] = useState({ from: "80", to: "100" });
  const [addSubtract, setAddSubtract] = useState({ base: "150", percent: "20", op: "add" });
  const [reverse, setReverse] = useState({ final: "120", percent: "20", direction: "decrease" });

  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const result = useMemo(() => {
    switch (mode) {
      case "percent-of": {
        const percent = parseFloat(percentOf.percent);
        const base = parseFloat(percentOf.base);
        if (Number.isNaN(percent) || Number.isNaN(base)) return null;
        const value = (percent / 100) * base;
        return {
          headline: `${fmt(value)}`,
          sub: `${fmt(percent)}% of ${fmt(base)}`,
          formula: `${fmt(percent)}% of ${fmt(base)} = (${fmt(percent)} ÷ 100) × ${fmt(base)} = ${fmt(value)}`,
        };
      }
      case "is-what-percent": {
        const part = parseFloat(isWhatPercent.part);
        const whole = parseFloat(isWhatPercent.whole);
        if (Number.isNaN(part) || Number.isNaN(whole) || whole === 0) return null;
        const value = (part / whole) * 100;
        return {
          headline: `${fmt(value)}%`,
          sub: `${fmt(part)} of ${fmt(whole)}`,
          formula: `(${fmt(part)} ÷ ${fmt(whole)}) × 100 = ${fmt(value)}%`,
        };
      }
      case "percent-change": {
        const from = parseFloat(percentChange.from);
        const to = parseFloat(percentChange.to);
        if (Number.isNaN(from) || Number.isNaN(to) || from === 0) return null;
        const diff = to - from;
        const value = (diff / Math.abs(from)) * 100;
        const isIncrease = value >= 0;
        return {
          headline: `${isIncrease ? "+" : ""}${fmt(value)}%`,
          sub: `${isIncrease ? "Increase" : "Decrease"} from ${fmt(from)} to ${fmt(to)}`,
          formula: `(${fmt(to)} − ${fmt(from)}) ÷ ${fmt(Math.abs(from))} × 100 = ${fmt(value)}%`,
          isIncrease,
          diff,
        };
      }
      case "add-subtract": {
        const base = parseFloat(addSubtract.base);
        const percent = parseFloat(addSubtract.percent);
        if (Number.isNaN(base) || Number.isNaN(percent)) return null;
        const amount = (base * percent) / 100;
        const value = addSubtract.op === "add" ? base + amount : base - amount;
        return {
          headline: `${fmt(value)}`,
          sub: `${fmt(base)} ${addSubtract.op === "add" ? "+" : "−"} ${fmt(percent)}%`,
          formula:
            addSubtract.op === "add"
              ? `${fmt(base)} + (${fmt(percent)}% × ${fmt(base)}) = ${fmt(base)} + ${fmt(amount)} = ${fmt(value)}`
              : `${fmt(base)} − (${fmt(percent)}% × ${fmt(base)}) = ${fmt(base)} − ${fmt(amount)} = ${fmt(value)}`,
        };
      }
      case "reverse": {
        const final = parseFloat(reverse.final);
        const percent = parseFloat(reverse.percent);
        if (Number.isNaN(final) || Number.isNaN(percent)) return null;
        const divisor = reverse.direction === "decrease" ? 1 - percent / 100 : 1 + percent / 100;
        if (divisor === 0) return null;
        const value = final / divisor;
        return {
          headline: `${fmt(value)}`,
          sub: `${fmt(final)} is ${fmt(percent)}% ${reverse.direction === "decrease" ? "less than" : "more than"} this`,
          formula:
            reverse.direction === "decrease"
              ? `${fmt(final)} ÷ (1 − ${fmt(percent)}/100) = ${fmt(final)} ÷ ${fmt(divisor)} = ${fmt(value)}`
              : `${fmt(final)} ÷ (1 + ${fmt(percent)}/100) = ${fmt(final)} ÷ ${fmt(divisor)} = ${fmt(value)}`,
        };
      }
      default:
        return null;
    }
  }, [mode, percentOf, isWhatPercent, percentChange, addSubtract, reverse]);

  function saveToHistory() {
    if (!result) return;
    const entry = {
      id: `${Date.now()}`,
      mode,
      headline: result.headline,
      sub: result.sub,
      snapshot: { percentOf, isWhatPercent, percentChange, addSubtract, reverse },
    };
    setHistory((prev) => [entry, ...prev].slice(0, 8));
  }

  function reuseHistoryEntry(entry) {
    setMode(entry.mode);
    setPercentOf(entry.snapshot.percentOf);
    setIsWhatPercent(entry.snapshot.isWhatPercent);
    setPercentChange(entry.snapshot.percentChange);
    setAddSubtract(entry.snapshot.addSubtract);
    setReverse(entry.snapshot.reverse);
    setShowHistory(false);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`${result.sub} = ${result.headline}\n${result.formula}`);
      setCopied(true);
      saveToHistory();
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      // clipboard unavailable — ignore
    }
  }

  const visibleModes = compact ? MODES.slice(0, 3) : MODES;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {visibleModes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              mode === m.id
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-muted hover:border-brand hover:text-brand"
            }`}
          >
            <m.icon size={13} aria-hidden="true" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {mode === "percent-of" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <NumberField label="Percent" suffix="%" value={percentOf.percent} onChange={(v) => setPercentOf((s) => ({ ...s, percent: v }))} />
              <PresetChips onPick={(p) => setPercentOf((s) => ({ ...s, percent: String(p) }))} />
            </div>
            <NumberField label="Of value" value={percentOf.base} onChange={(v) => setPercentOf((s) => ({ ...s, base: v }))} />
          </div>
        )}

        {mode === "is-what-percent" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField label="This value" value={isWhatPercent.part} onChange={(v) => setIsWhatPercent((s) => ({ ...s, part: v }))} />
            <NumberField label="Is what % of this value" value={isWhatPercent.whole} onChange={(v) => setIsWhatPercent((s) => ({ ...s, whole: v }))} />
          </div>
        )}

        {mode === "percent-change" && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField label="From" value={percentChange.from} onChange={(v) => setPercentChange((s) => ({ ...s, from: v }))} />
              <NumberField label="To" value={percentChange.to} onChange={(v) => setPercentChange((s) => ({ ...s, to: v }))} />
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
              <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              Note: going from 20% to 30% is a 10 <em>percentage-point</em> increase, but a 50% <em>relative</em> increase — this calculates the relative change.
            </p>
          </>
        )}

        {mode === "add-subtract" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberField label="Starting value" value={addSubtract.base} onChange={(v) => setAddSubtract((s) => ({ ...s, base: v }))} />
            <div>
              <NumberField label="Percent" suffix="%" value={addSubtract.percent} onChange={(v) => setAddSubtract((s) => ({ ...s, percent: v }))} />
              <PresetChips onPick={(p) => setAddSubtract((s) => ({ ...s, percent: String(p) }))} />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted">Operation</span>
              <div className="inline-flex rounded-lg border border-line bg-paper p-1">
                {[
                  { id: "add", label: "Increase", icon: TrendingUp },
                  { id: "subtract", label: "Decrease", icon: TrendingDown },
                ].map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setAddSubtract((s) => ({ ...s, op: op.id }))}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      addSubtract.op === op.id ? "bg-surface text-ink shadow-card" : "text-muted"
                    }`}
                  >
                    <op.icon size={13} aria-hidden="true" />
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "reverse" && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField label="Final value (after change)" value={reverse.final} onChange={(v) => setReverse((s) => ({ ...s, final: v }))} />
              <div>
                <NumberField label="Percent it changed by" suffix="%" value={reverse.percent} onChange={(v) => setReverse((s) => ({ ...s, percent: v }))} />
                <PresetChips onPick={(p) => setReverse((s) => ({ ...s, percent: String(p) }))} />
              </div>
            </div>
            <div className="mt-3 inline-flex rounded-lg border border-line bg-paper p-1">
              {[
                { id: "decrease", label: "It was a decrease (e.g. discount)" },
                { id: "increase", label: "It was an increase (e.g. tax added)" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setReverse((s) => ({ ...s, direction: d.id }))}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    reverse.direction === d.id ? "bg-surface text-ink shadow-card" : "text-muted"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Result */}
      <div className="mt-6 rounded-xl border border-line bg-paper p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted">{result?.sub || "Enter values above"}</p>
            <p
              className={`mt-1 font-display text-3xl font-bold ${
                result?.isIncrease === false ? "text-red-500" : result?.isIncrease === true ? "text-teal" : "text-ink"
              }`}
            >
              {result ? result.headline : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!result}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <Check size={13} className="text-teal" aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {result && (
          <p className="mt-3 rounded-lg bg-surface px-3 py-2 font-mono text-xs text-muted">{result.formula}</p>
        )}
      </div>

      {!compact && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
          >
            <History size={13} aria-hidden="true" />
            {showHistory ? "Hide" : "Show"} history ({history.length})
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {history.length === 0 && (
                <p className="text-xs text-muted">
                  Nothing copied yet — hit &quot;Copy&quot; on a result to save it here for quick reuse.
                </p>
              )}
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => reuseHistoryEntry(entry)}
                    className="flex-1 text-left text-xs text-ink hover:text-brand"
                  >
                    <span className="font-semibold">{entry.headline}</span>{" "}
                    <span className="text-muted">— {entry.sub}</span>
                  </button>
                </div>
              ))}
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-red-500"
                >
                  <Trash2 size={12} aria-hidden="true" />
                  Clear history
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}