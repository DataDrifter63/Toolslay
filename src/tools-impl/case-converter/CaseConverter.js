"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Trash2, Undo2 } from "lucide-react";

// ---------- Word-splitting core ----------
// Normalizes ANY input style (Sentence text, camelCase, snake_case, kebab-case,
// CONSTANT_CASE, etc.) into a flat array of lowercase words. This means the tool
// works both ways: paste plain text and convert it to camelCase, OR paste
// existing camelCase/snake_case and convert it to something else.
function toWords(input) {
  if (!input) return [];
  return input
    .trim()
    .split(/[^A-Za-z0-9]+/) // split on spaces, punctuation, underscores, hyphens, slashes...
    .flatMap((chunk) =>
      chunk
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // "XMLHttp" -> "XML Http"
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // "camelCase" -> "camel Case"
        .split(" ")
    )
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// ---------- Basic case styles ----------
const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "if", "in",
  "nor", "of", "on", "or", "per", "the", "to", "vs", "via",
]);

function toUpperCase(str) {
  return str.toUpperCase();
}

function toLowerCase(str) {
  return str.toLowerCase();
}

function toSentenceCase(str) {
  const lower = str.toLowerCase();
  return lower.replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, (m) => m.toUpperCase());
}

function toTitleCase(str) {
  const parts = str.toLowerCase().split(/(\s+)/); // keep whitespace so spacing is preserved
  let wordIndex = -1;
  const words = parts.filter((p) => p.trim() !== "");
  return parts
    .map((part) => {
      if (part.trim() === "") return part;
      wordIndex++;
      const isEdge = wordIndex === 0 || wordIndex === words.length - 1;
      if (!isEdge && SMALL_WORDS.has(part)) return part;
      return capitalize(part);
    })
    .join("");
}

function toCapitalizedWords(str) {
  return str.replace(/\S+/g, (word) => capitalize(word.toLowerCase()));
}

function toAlternatingCase(str) {
  let i = 0;
  return str
    .split("")
    .map((ch) => {
      if (!/[a-zA-Z]/.test(ch)) return ch;
      const out = i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
      i++;
      return out;
    })
    .join("");
}

function toInverseCase(str) {
  return str
    .split("")
    .map((ch) => {
      const upper = ch.toUpperCase();
      const lower = ch.toLowerCase();
      if (ch === upper && ch !== lower) return lower;
      if (ch === lower && ch !== upper) return upper;
      return ch;
    })
    .join("");
}

// ---------- Programming / developer case styles ----------
function toCamelCase(str) {
  const words = toWords(str);
  return words.map((w, i) => (i === 0 ? w : capitalize(w))).join("");
}

function toPascalCase(str) {
  return toWords(str).map(capitalize).join("");
}

function toSnakeCase(str) {
  return toWords(str).join("_");
}

function toConstantCase(str) {
  return toWords(str).map((w) => w.toUpperCase()).join("_");
}

function toKebabCase(str) {
  return toWords(str).join("-");
}

function toTrainCase(str) {
  return toWords(str).map(capitalize).join("-");
}

function toDotCase(str) {
  return toWords(str).join(".");
}

function toPathCase(str) {
  return toWords(str).join("/");
}

// ---------- Button config ----------
const BASIC_CASES = [
  { key: "upper", label: "UPPERCASE", hint: "HELLO WORLD", fn: toUpperCase },
  { key: "lower", label: "lowercase", hint: "hello world", fn: toLowerCase },
  { key: "sentence", label: "Sentence case", hint: "Hello world.", fn: toSentenceCase },
  { key: "title", label: "Title Case", hint: "Hello World", fn: toTitleCase },
  { key: "capitalize", label: "Capitalize Each Word", hint: "Hello World", fn: toCapitalizedWords },
  { key: "alternating", label: "aLtErNaTiNg CaSe", hint: "hElLo WoRlD", fn: toAlternatingCase },
  { key: "inverse", label: "InVERSE cASE", hint: "Swaps every letter", fn: toInverseCase },
];

const DEV_CASES = [
  { key: "camel", label: "camelCase", hint: "helloWorld", fn: toCamelCase },
  { key: "pascal", label: "PascalCase", hint: "HelloWorld", fn: toPascalCase },
  { key: "snake", label: "snake_case", hint: "hello_world", fn: toSnakeCase },
  { key: "constant", label: "CONSTANT_CASE", hint: "HELLO_WORLD", fn: toConstantCase },
  { key: "kebab", label: "kebab-case", hint: "hello-world", fn: toKebabCase },
  { key: "train", label: "Train-Case", hint: "Hello-World", fn: toTrainCase },
  { key: "dot", label: "dot.case", hint: "hello.world", fn: toDotCase },
  { key: "path", label: "path/case", hint: "hello/world", fn: toPathCase },
];

function getStats(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  return { words, characters, charactersNoSpaces };
}

export default function CaseConverter() {
  const [text, setText] = useState("");
  const [previousText, setPreviousText] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeKey, setActiveKey] = useState(null);

  const stats = useMemo(() => getStats(text), [text]);

  function applyCase(caseItem) {
    if (!text) return;
    setPreviousText(text);
    setText(caseItem.fn(text));
    setActiveKey(caseItem.key);
  }

  function handleUndo() {
    if (previousText === null) return;
    setText(previousText);
    setPreviousText(null);
    setActiveKey(null);
  }

  function handleClear() {
    setPreviousText(text || null);
    setText("");
    setActiveKey(null);
  }

  async function handleCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API blocked (e.g. insecure context) — fail silently, the
      // text is still selectable and copyable manually.
    }
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setActiveKey(null);
        }}
        placeholder="Type or paste your text here..."
        aria-label="Text to convert"
        rows={7}
        className="w-full resize-none rounded-lg border border-line bg-paper p-3 font-mono text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span>
          <span className="font-semibold text-ink">{stats.words}</span> words
        </span>
        <span>
          <span className="font-semibold text-ink">{stats.characters}</span> characters
        </span>
        <span>
          <span className="font-semibold text-ink">{stats.charactersNoSpaces}</span> no spaces
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={previousText === null}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-medium text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 size={13} aria-hidden="true" />
            Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!text}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-medium text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={13} aria-hidden="true" />
            Clear
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Common cases
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {BASIC_CASES.map((item) => (
            <CaseButton key={item.key} item={item} active={activeKey === item.key} onClick={applyCase} />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Developer / programming cases
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {DEV_CASES.map((item) => (
            <CaseButton key={item.key} item={item} active={activeKey === item.key} onClick={applyCase} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CaseButton({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={`flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition ${
        active
          ? "border-brand bg-brand-light"
          : "border-line bg-surface hover:border-brand hover:bg-brand-light/40"
      }`}
    >
      <span className="text-sm font-medium text-ink">{item.label}</span>
      <span className="mt-0.5 font-mono text-[11px] text-muted">{item.hint}</span>
    </button>
  );
}
