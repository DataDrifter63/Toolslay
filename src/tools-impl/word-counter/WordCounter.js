"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Check,
  Download,
  Trash2,
  Save,
  RotateCcw,
  ScanSearch,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import Icon from "@/components/ui/Icon";
import {
  countStats,
  formatReadTime,
  CASE_TRANSFORMS,
  analyzeText,
  ISSUE_TYPE_META,
} from "./wordCounterUtils";

const SAVE_KEY = "toolslay:word-counter:saved";
const CHECK_STEPS = [
  "Scanning your text",
  "Checking spelling",
  "Checking grammar & punctuation",
  "Wrapping up",
];
const CHECK_STEP_DELAY = 450;

export default function WordCounter({ compact = false }) {
  const [text, setText] = useState("");
  const [previousText, setPreviousText] = useState(null);

  const [issues, setIssues] = useState(null); // null = not checked, [] = checked clean
  const [checking, setChecking] = useState(false);
  const [checkStepIndex, setCheckStepIndex] = useState(0);
  const checkSnapshot = useRef("");

  const [copied, setCopied] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  const stats = useMemo(() => countStats(text), [text]);

  // Load an existing saved draft's timestamp (not the text) on mount, so the
  // "Load saved" affordance only shows up when there's actually something.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) setSavedAt(JSON.parse(raw).savedAt);
    } catch (e) {
      // ignore — storage unavailable
    }
  }, []);

  // Advances the fake-but-honest scanning animation, then runs the real
  // (synchronous, client-side) analysis once the steps finish.
  useEffect(() => {
    if (!checking) return;
    if (checkStepIndex >= CHECK_STEPS.length) {
      setIssues(analyzeText(checkSnapshot.current));
      setChecking(false);
      return;
    }
    const t = setTimeout(() => setCheckStepIndex((i) => i + 1), CHECK_STEP_DELAY);
    return () => clearTimeout(t);
  }, [checking, checkStepIndex]);

  function handleChangeText(value) {
    setText(value);
    if (issues !== null) setIssues(null);
  }

  function applyTransform(fn) {
    if (!text) return;
    setPreviousText(text);
    setText(fn(text));
    if (issues !== null) setIssues(null);
  }

  function handleUndo() {
    if (previousText === null) return;
    setText(previousText);
    setPreviousText(null);
    if (issues !== null) setIssues(null);
  }

  function startCheck() {
    if (!text.trim() || checking) return;
    checkSnapshot.current = text;
    setIssues(null);
    setCheckStepIndex(0);
    setChecking(true);
  }

  function fixIssue(issue) {
    setPreviousText(text);
    const updated = issue.fix(text);
    setText(updated);
    setIssues((prev) => (prev ? prev.filter((i) => i.id !== issue.id) : prev));
  }

  function fixAll() {
    if (!issues || issues.length === 0) return;
    setPreviousText(text);
    const updated = issues.reduce((acc, issue) => issue.fix(acc), text);
    setText(updated);
    setIssues([]);
  }

  async function handleCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      // clipboard API unavailable — fail silently
    }
  }

  function handleDownload() {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    setPreviousText(text);
    setText("");
    setIssues(null);
  }

  function handleSave() {
    try {
      const now = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify({ text, savedAt: now }));
      setSavedAt(now);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1600);
    } catch (e) {
      // ignore — storage unavailable
    }
  }

  function handleLoadSaved() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      setPreviousText(text);
      setText(JSON.parse(raw).text || "");
      setIssues(null);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => handleChangeText(e.target.value)}
        placeholder="Type or paste anything here..."
        aria-label="Text to count"
        rows={compact ? 3 : 10}
        className="w-full resize-y rounded-lg border border-line bg-paper p-3 font-mono text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
      />

      <div className={`mt-4 grid grid-cols-3 gap-3 ${compact ? "" : "sm:grid-cols-4"}`}>
        <Stat label="Words" value={stats.words} />
        <Stat label="Characters" value={stats.characters} />
        {!compact && <Stat label="No spaces" value={stats.charactersNoSpaces} />}
        {!compact && <Stat label="Sentences" value={stats.sentences} />}
        {!compact && <Stat label="Paragraphs" value={stats.paragraphs} />}
        {!compact && <Stat label="Unique words" value={stats.uniqueWords} />}
        <Stat label="Read time" value={formatReadTime(stats.readMinutes)} />
        {!compact && <Stat label="Longest word" value={stats.longestWord || "—"} small />}
      </div>

      {!compact && (
        <>
          {/* Case tools + quick actions */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {CASE_TRANSFORMS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTransform(t.fn)}
                disabled={!text}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.label}
              </button>
            ))}
            {previousText !== null && (
              <button
                type="button"
                onClick={handleUndo}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-muted transition hover:border-brand hover:text-brand"
              >
                <RotateCcw size={13} aria-hidden="true" />
                Undo
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ActionButton onClick={handleCopy} icon={copied ? Check : Copy} label={copied ? "Copied!" : "Copy"} />
            <ActionButton onClick={handleDownload} icon={Download} label="Download .txt" disabled={!text} />
            <ActionButton
              onClick={handleSave}
              icon={justSaved ? Check : Save}
              label={justSaved ? "Saved!" : "Save"}
              disabled={!text}
            />
            {savedAt && (
              <button
                type="button"
                onClick={handleLoadSaved}
                className="text-xs font-medium text-brand hover:text-brand-dark"
              >
                Load last saved ({timeAgo(savedAt)})
              </button>
            )}
            <ActionButton onClick={handleClear} icon={Trash2} label="Clear" disabled={!text} muted />
          </div>

          {/* Issue checker */}
          <div className="mt-6 border-t border-line pt-6">
            {!checking && issues === null && (
              <button
                type="button"
                onClick={startCheck}
                disabled={!text.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ScanSearch size={16} aria-hidden="true" />
                Check for issues
              </button>
            )}

            {checking && <CheckingPanel stepIndex={checkStepIndex} />}

            {!checking && issues !== null && (
              <IssuesPanel
                issues={issues}
                onFix={fixIssue}
                onFixAll={fixAll}
                onDismiss={() => setIssues(null)}
                onRecheck={startCheck}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, small }) {
  return (
    <div className="rounded-lg bg-paper px-3 py-2 text-center">
      <div
        className={`font-display font-bold text-ink ${small ? "truncate text-sm" : "text-lg"}`}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function ActionButton({ onClick, icon: IconCmp, label, disabled, muted }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        muted
          ? "border-line bg-surface text-muted hover:border-red-300 hover:text-red-500"
          : "border-line bg-surface text-ink hover:border-brand hover:text-brand"
      }`}
    >
      <IconCmp size={13} aria-hidden="true" />
      {label}
    </button>
  );
}

function CheckingPanel({ stepIndex }) {
  const progress = Math.min(100, Math.round(((stepIndex + 1) / CHECK_STEPS.length) * 100));
  return (
    <div className="animate-fade-in-up rounded-xl border border-line bg-paper p-5">
      <div className="flex items-center gap-2.5">
        <Loader2 size={16} className="animate-spin text-brand" aria-hidden="true" />
        <p className="text-sm font-semibold text-ink">
          {CHECK_STEPS[Math.min(stepIndex, CHECK_STEPS.length - 1)]}…
        </p>
      </div>

      <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-white/40 animate-scan-sweep" />
      </div>

      <ol className="mt-4 space-y-1.5">
        {CHECK_STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-2 text-xs">
            {i < stepIndex ? (
              <Check size={13} className="text-teal" aria-hidden="true" />
            ) : i === stepIndex ? (
              <Loader2 size={13} className="animate-spin text-brand" aria-hidden="true" />
            ) : (
              <span className="h-[13px] w-[13px] shrink-0 rounded-full border border-line" />
            )}
            <span className={i <= stepIndex ? "text-ink" : "text-muted"}>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function IssuesPanel({ issues, onFix, onFixAll, onDismiss, onRecheck }) {
  if (issues.length === 0) {
    return (
      <div className="animate-pop-in flex items-center justify-between gap-4 rounded-xl border border-teal/30 bg-teal-light p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-white">
            <Sparkles size={16} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Looks clean — no issues found!</p>
            <p className="text-xs text-muted">Spacing, punctuation, spelling and capitalization all check out.</p>
          </div>
        </div>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="shrink-0 text-muted hover:text-ink">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">
          Found {issues.length} issue{issues.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onRecheck} className="text-xs font-medium text-muted hover:text-ink">
            Re-check
          </button>
          <button
            type="button"
            onClick={onFixAll}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-dark"
          >
            <Wand2 size={13} aria-hidden="true" />
            Fix all
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {issues.map((issue) => {
          const meta = ISSUE_TYPE_META[issue.type] || { label: issue.type, icon: "AlertTriangle" };
          return (
            <li
              key={issue.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-line bg-surface p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-light text-amber">
                  <Icon name={meta.icon} size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{issue.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{issue.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onFix(issue)}
                className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-brand transition hover:border-brand hover:bg-brand-light"
              >
                Fix
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
