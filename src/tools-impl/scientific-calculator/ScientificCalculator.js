"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Check, History, Binary, Sigma, Trash2, Delete } from "lucide-react";
import {
  evaluateExpression,
  toFractionApprox,
  formatScientific,
  formatDecimal,
  decToBase,
  baseToDecimal,
  BASES,
  ANGLE_MODES,
  VARIABLE_NAMES,
} from "./scientificCalculatorUtils";

const HISTORY_KEY = "toolslay:scientific-calculator:history";
const VARS_KEY = "toolslay:scientific-calculator:variables";
const EMPTY_VARS = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, Ans: 0 };

function loadJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}

export default function ScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [angleMode, setAngleMode] = useState("DEG");
  const [shift, setShift] = useState(false);
  const [variables, setVariables] = useState(EMPTY_VARS);
  const [history, setHistory] = useState([]);
  const [displayFormat, setDisplayFormat] = useState("DEC"); // DEC | SCI | FRAC
  const [committedResult, setCommittedResult] = useState(null); // last "=" result, or null
  const [tab, setTab] = useState("history"); // history | variables | base
  const [copied, setCopied] = useState(false);
  const [baseInputs, setBaseInputs] = useState({ BIN: "0", OCT: "0", DEC: "0", HEX: "0" });
  const inputRef = useRef(null);

  useEffect(() => {
    setHistory(loadJSON(HISTORY_KEY, []));
    setVariables((v) => ({ ...v, ...loadJSON(VARS_KEY, {}) }));
  }, []);

  // ---- live preview (evaluated as you type, before pressing =) ----
  const live = useMemo(
    () => evaluateExpression(expression, { angleMode, variables }),
    [expression, angleMode, variables]
  );

  const activeValue = committedResult !== null ? committedResult : live.value;

  const displayText = useMemo(() => {
    if (activeValue === null || activeValue === undefined) return null;
    if (displayFormat === "SCI") return formatScientific(activeValue);
    if (displayFormat === "FRAC") {
      const frac = toFractionApprox(activeValue);
      return frac ?? formatDecimal(activeValue);
    }
    return formatDecimal(activeValue);
  }, [activeValue, displayFormat]);

  // ---- text-editing helpers ----
  function append(text) {
    setCommittedResult(null);
    setExpression((prev) => prev + text);
  }
  function wrapCall(fnName) {
    setCommittedResult(null);
    setExpression((prev) => (prev.trim() ? `${fnName}(${prev})` : `${fnName}(`));
  }
  function wrapPow(n) {
    setCommittedResult(null);
    setExpression((prev) => (prev.trim() ? `(${prev})^${n}` : prev));
  }
  function wrapCustom(build) {
    setCommittedResult(null);
    setExpression((prev) => (prev.trim() ? build(prev) : build("")));
  }
  function backspace() {
    setCommittedResult(null);
    setExpression((prev) => prev.slice(0, -1));
  }
  function clearAll() {
    setExpression("");
    setCommittedResult(null);
  }
  function cycleAngleMode() {
    setAngleMode((m) => ANGLE_MODES[(ANGLE_MODES.indexOf(m) + 1) % ANGLE_MODES.length]);
  }

  function equals() {
    const result = evaluateExpression(expression, { angleMode, variables });
    if (result.error || result.value === null) return;
    setCommittedResult(result.value);
    setVariables((v) => {
      const next = { ...v, Ans: result.value };
      saveJSON(VARS_KEY, next);
      return next;
    });
    setHistory((h) => {
      const entry = { expr: expression, result: result.value, ts: Date.now() };
      const next = [entry, ...h].slice(0, 40);
      saveJSON(HISTORY_KEY, next);
      return next;
    });
  }

  function storeToVariable(name) {
    if (activeValue === null || activeValue === undefined) return;
    setVariables((v) => {
      const next = { ...v, [name]: activeValue };
      saveJSON(VARS_KEY, next);
      return next;
    });
  }
  function insertVariable(name) {
    append(name);
  }
  function clearVariables() {
    setVariables(EMPTY_VARS);
    saveJSON(VARS_KEY, EMPTY_VARS);
  }
  function reuseHistory(entry) {
    setExpression(entry.expr);
    setCommittedResult(entry.result);
  }
  function clearHistory() {
    setHistory([]);
    saveJSON(HISTORY_KEY, []);
  }

  async function copyResult() {
    if (displayText === null) return;
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  // ---- base converter tab ----
  useEffect(() => {
    if (tab !== "base") return;
    const base = displayFormat && activeValue !== null ? Math.trunc(activeValue) : 0;
    setBaseInputs({
      BIN: decToBase(base, 2),
      OCT: decToBase(base, 8),
      DEC: decToBase(base, 10),
      HEX: decToBase(base, 16),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function handleBaseChange(key, value) {
    const digitsOk =
      (key === "BIN" && /^-?[01]*$/.test(value)) ||
      (key === "OCT" && /^-?[0-7]*$/.test(value)) ||
      (key === "DEC" && /^-?[0-9]*$/.test(value)) ||
      (key === "HEX" && /^-?[0-9a-fA-F]*$/.test(value));
    if (!digitsOk) return;
    setBaseInputs((prev) => ({ ...prev, [key]: value }));
    const decimal = baseToDecimal(value || "0", BASES[key]);
    if (decimal === null) return;
    setBaseInputs({
      BIN: decToBase(decimal, 2),
      OCT: decToBase(decimal, 8),
      DEC: decToBase(decimal, 10),
      HEX: decToBase(decimal, 16),
      [key]: value,
    });
  }

  // ---- keyboard support ----
  useEffect(() => {
    function onKeyDown(e) {
      const active = document.activeElement;
      // Typing directly in the expression box: let the native input handle it,
      // otherwise every keystroke would get inserted twice.
      if (active === inputRef.current) return;
      // Typing in some other input (e.g. a base-converter field): don't hijack it.
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;

      const key = e.key;
      if (/^[0-9.]$/.test(key)) { append(key); return; }
      if (["+", "-", "*", "/", "%", "^", "(", ")", "!"].includes(key)) { append(key); return; }
      if (key === "Enter" || key === "=") { e.preventDefault(); equals(); return; }
      if (key === "Backspace") { backspace(); return; }
      if (key === "Escape") { clearAll(); return; }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, angleMode, variables]);

  const sciRows = [
    [
      { label: "2nd", active: shift, onClick: () => setShift((s) => !s), variant: "func" },
      { label: angleMode, onClick: cycleAngleMode, variant: "func" },
      { label: "(", onClick: () => append("("), variant: "func" },
      { label: ")", onClick: () => append(")"), variant: "func" },
      { label: "!", onClick: () => append("!"), variant: "func" },
    ],
    [
      shift
        ? { label: "x³", onClick: () => wrapPow(3), variant: "func" }
        : { label: "x²", onClick: () => wrapPow(2), variant: "func" },
      shift
        ? { label: "∛", onClick: () => wrapCall("cbrt"), variant: "func" }
        : { label: "√", onClick: () => wrapCall("sqrt"), variant: "func" },
      { label: "x^y", onClick: () => append("^"), variant: "func" },
      { label: "π", onClick: () => append("π"), variant: "func" },
      { label: "e", onClick: () => append("e"), variant: "func" },
    ],
    [
      shift
        ? { label: "sin⁻¹", onClick: () => wrapCall("asin"), variant: "func" }
        : { label: "sin", onClick: () => wrapCall("sin"), variant: "func" },
      shift
        ? { label: "cos⁻¹", onClick: () => wrapCall("acos"), variant: "func" }
        : { label: "cos", onClick: () => wrapCall("cos"), variant: "func" },
      shift
        ? { label: "tan⁻¹", onClick: () => wrapCall("atan"), variant: "func" }
        : { label: "tan", onClick: () => wrapCall("tan"), variant: "func" },
      shift
        ? { label: "10^x", onClick: () => wrapCustom((p) => (p ? `10^(${p})` : "10^(")), variant: "func" }
        : { label: "log", onClick: () => wrapCall("log"), variant: "func" },
      shift
        ? { label: "e^x", onClick: () => wrapCustom((p) => (p ? `e^(${p})` : "e^(")), variant: "func" }
        : { label: "ln", onClick: () => wrapCall("ln"), variant: "func" },
    ],
    [
      shift
        ? { label: "asinh", onClick: () => wrapCall("asinh"), variant: "func" }
        : { label: "sinh", onClick: () => wrapCall("sinh"), variant: "func" },
      shift
        ? { label: "acosh", onClick: () => wrapCall("acosh"), variant: "func" }
        : { label: "cosh", onClick: () => wrapCall("cosh"), variant: "func" },
      shift
        ? { label: "atanh", onClick: () => wrapCall("atanh"), variant: "func" }
        : { label: "tanh", onClick: () => wrapCall("tanh"), variant: "func" },
      { label: "1/x", onClick: () => wrapCustom((p) => (p ? `1/(${p})` : "1/(")), variant: "func" },
      { label: "%", onClick: () => append("%"), variant: "func" },
    ],
  ];

  const numRows = [
    [
      { label: "7", onClick: () => append("7"), variant: "num" },
      { label: "8", onClick: () => append("8"), variant: "num" },
      { label: "9", onClick: () => append("9"), variant: "num" },
      { label: <Delete size={16} aria-hidden="true" />, onClick: backspace, variant: "op", aria: "Backspace" },
      { label: "AC", onClick: clearAll, variant: "op-danger" },
    ],
    [
      { label: "4", onClick: () => append("4"), variant: "num" },
      { label: "5", onClick: () => append("5"), variant: "num" },
      { label: "6", onClick: () => append("6"), variant: "num" },
      { label: "×", onClick: () => append("*"), variant: "op" },
      { label: "÷", onClick: () => append("/"), variant: "op" },
    ],
    [
      { label: "1", onClick: () => append("1"), variant: "num" },
      { label: "2", onClick: () => append("2"), variant: "num" },
      { label: "3", onClick: () => append("3"), variant: "num" },
      { label: "+", onClick: () => append("+"), variant: "op" },
      { label: "−", onClick: () => append("-"), variant: "op" },
    ],
    [
      { label: "0", onClick: () => append("0"), variant: "num" },
      { label: ".", onClick: () => append("."), variant: "num" },
      { label: "Ans", onClick: () => append("Ans"), variant: "num" },
      { label: "EXP", onClick: () => append("×10^"), variant: "op" },
      { label: "=", onClick: equals, variant: "equals" },
    ],
  ];

  function buttonClass(variant, active) {
    const base = "flex h-11 items-center justify-center rounded-lg text-sm font-medium transition active:scale-95 sm:h-12";
    if (variant === "equals") return `${base} bg-brand text-white hover:bg-brand-dark`;
    if (variant === "op") return `${base} bg-surface border border-line text-ink hover:border-brand/40`;
    if (variant === "op-danger") return `${base} bg-red-50 text-red-600 border border-red-100 hover:bg-red-100`;
    if (variant === "num") return `${base} bg-paper border border-line text-ink hover:border-brand/40 font-mono`;
    // func
    return `${base} border text-xs sm:text-sm ${
      active ? "border-brand bg-brand-light text-brand" : "border-line bg-surface text-muted hover:border-brand/40 hover:text-ink"
    }`;
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      {/* Calculator */}
      <div>
        {/* Display */}
        <div className="rounded-xl border border-line bg-paper p-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-light px-2 py-0.5 font-mono font-semibold text-brand">
                {angleMode}
              </span>
              {shift && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono font-semibold text-amber-700">
                  2ND
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {["DEC", "SCI", "FRAC"].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setDisplayFormat(fmt)}
                  className={`rounded px-2 py-0.5 font-mono text-[11px] font-semibold transition ${
                    displayFormat === fmt ? "bg-ink text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <input
            ref={inputRef}
            value={expression}
            onChange={(e) => {
              setCommittedResult(null);
              setExpression(e.target.value);
            }}
            placeholder="0"
            spellCheck={false}
            className="mt-3 w-full bg-transparent text-right font-mono text-xl text-ink outline-none placeholder:text-muted sm:text-2xl"
          />

          <div className="mt-2 flex items-center justify-end gap-2 border-t border-line pt-2">
            {live.error && expression.trim() && committedResult === null ? (
              <span className="truncate text-xs text-red-500">{live.error}</span>
            ) : (
              <>
                <span className="truncate font-mono text-2xl font-bold text-ink sm:text-3xl">
                  {displayText ?? "\u00A0"}
                </span>
                {displayText !== null && (
                  <button
                    type="button"
                    onClick={copyResult}
                    className="shrink-0 rounded-md p-1.5 text-muted transition hover:bg-surface hover:text-ink"
                    aria-label="Copy result"
                  >
                    {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Button grid */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="grid grid-cols-5 gap-1.5">
            {sciRows.flat().map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={btn.onClick}
                className={buttonClass(btn.variant, btn.active)}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {numRows.flat().map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={btn.onClick}
                aria-label={btn.aria}
                className={buttonClass(btn.variant)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">
          Keyboard works too — type numbers/operators, <kbd className="rounded border border-line px-1">Enter</kbd> for =,{" "}
          <kbd className="rounded border border-line px-1">Esc</kbd> to clear.
        </p>
      </div>

      {/* Side panel: History / Variables / Base converter */}
      <div className="rounded-xl border border-line bg-paper">
        <div className="flex border-b border-line text-xs font-medium">
          {[
            { id: "history", label: "History", icon: History },
            { id: "variables", label: "Vars", icon: Sigma },
            { id: "base", label: "Base", icon: Binary },
          ].map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 transition ${
                tab === id ? "border-b-2 border-brand text-brand" : "text-muted hover:text-ink"
              }`}
            >
              <TabIcon size={14} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-[420px] overflow-y-auto p-3">
          {tab === "history" && (
            <>
              {history.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">No calculations yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {history.map((entry, i) => (
                    <button
                      key={entry.ts + i}
                      type="button"
                      onClick={() => reuseHistory(entry)}
                      className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-left transition hover:border-brand/40"
                    >
                      <div className="truncate font-mono text-xs text-muted">{entry.expr}</div>
                      <div className="truncate font-mono text-sm font-semibold text-ink">
                        {formatDecimal(entry.result)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-xs text-muted transition hover:border-red-200 hover:text-red-600"
                >
                  <Trash2 size={13} aria-hidden="true" />
                  Clear history
                </button>
              )}
            </>
          )}

          {tab === "variables" && (
            <div className="space-y-1.5">
              {VARIABLE_NAMES.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2"
                >
                  <span className="w-4 shrink-0 font-mono text-sm font-bold text-brand">{name}</span>
                  <span className="flex-1 truncate font-mono text-sm text-ink">
                    {formatDecimal(variables[name] ?? 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => insertVariable(name)}
                    className="rounded border border-line px-1.5 py-0.5 text-[11px] text-muted hover:border-brand/40 hover:text-ink"
                    title={`Insert ${name}`}
                  >
                    Ins
                  </button>
                  <button
                    type="button"
                    onClick={() => storeToVariable(name)}
                    className="rounded border border-line px-1.5 py-0.5 text-[11px] text-muted hover:border-brand/40 hover:text-ink"
                    title={`Store current result in ${name}`}
                  >
                    STO
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={clearVariables}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-xs text-muted transition hover:border-red-200 hover:text-red-600"
              >
                <Trash2 size={13} aria-hidden="true" />
                Reset variables
              </button>
            </div>
          )}

          {tab === "base" && (
            <div className="space-y-2.5">
              {Object.keys(BASES).map((key) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-muted">{key}</span>
                  <input
                    value={baseInputs[key]}
                    onChange={(e) => handleBaseChange(key, e.target.value)}
                    spellCheck={false}
                    className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-sm text-ink outline-none focus:border-brand/40"
                  />
                </label>
              ))}
              <p className="pt-1 text-[11px] leading-relaxed text-muted">
                Edit any field — the others update automatically. Uses the whole-number part of
                the current result.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
