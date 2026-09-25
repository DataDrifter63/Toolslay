"use client";

import React, { useMemo, useState } from "react";

const SAMPLE_JSON = `{
  "project": {
    "name": "ToolSlay",
    "version": "1.3",
    "active": true,
    "features": [
      "formatter",
      "validator",
      "inspector"
    ],
    "owner": {
      "name": "Shah Mir",
      "role": "Developer"
    }
  },
  "settings": {
    "theme": "dark",
    "notifications": true,
    "limits": {
      "users": 100,
      "storage": null
    }
  }
}`;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function countNodes(value) {
  if (value === null || typeof value !== "object") {
    return 1;
  }
  if (Array.isArray(value)) {
    return 1 + value.reduce((sum, item) => sum + countNodes(item), 0);
  }
  return 1 + Object.values(value).reduce((sum, item) => sum + countNodes(item), 0);
}

function getDepth(value) {
  if (value === null || typeof value !== "object") {
    return 0;
  }
  const values = Array.isArray(value) ? value : Object.values(value);
  if (!values.length) return 1;
  return 1 + Math.max(...values.map(getDepth));
}

function countKeys(value) {
  if (value === null || typeof value !== "object") {
    return 0;
  }
  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + countKeys(item), 0);
  }
  return Object.keys(value).length + Object.values(value).reduce((sum, item) => sum + countKeys(item), 0);
}

function findEmptyValues(value) {
  let count = 0;
  function walk(item) {
    if (item === null) {
      count++;
      return;
    }
    if (typeof item !== "object") {
      if (item === "") count++;
      return;
    }
    const values = Array.isArray(item) ? item : Object.values(item);
    values.forEach(walk);
  }
  walk(value);
  return count;
}

function sortDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }
  if (value !== null && typeof value === "object") {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((obj, key) => {
        obj[key] = sortDeep(value[key]);
        return obj;
      }, {});
  }
  return value;
}

function removeEmptyValues(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== "").map(removeEmptyValues);
  }
  if (value !== null && typeof value === "object") {
    const result = {};
    Object.entries(value).forEach(([key, item]) => {
      if (item === null || item === "") {
        return;
      }
      result[key] = removeEmptyValues(item);
    });
    return result;
  }
  return value;
}

function findDuplicateKeys(text) {
  const duplicates = new Set();
  const stack = [];
  const regex = /"((?:\\.|[^"\\])*)"\s*:/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(0, match.index);
    const opens = (before.match(/{/g) || []).length;
    const closes = (before.match(/}/g) || []).length;
    const depth = opens - closes;
    const key = match[1];
    stack[depth] = stack[depth] || new Set();
    if (stack[depth].has(key)) {
      duplicates.add(key);
    }
    stack[depth].add(key);
  }
  return [...duplicates];
}

function getErrorInfo(text, error) {
  const message = error?.message || "Invalid JSON";
  const match = message.match(/position\s+(\d+)/);
  if (!match) {
    return { message, position: null, line: null, column: null, snippet: "" };
  }
  const position = Number(match[1]);
  const before = text.slice(0, position);
  const line = before.split("\n").length;
  const lastNewLine = before.lastIndexOf("\n");
  const column = position - lastNewLine;
  const start = Math.max(0, position - 45);
  const end = Math.min(text.length, position + 45);
  return { message, position, line, column, snippet: text.slice(start, end) };
}

function downloadText(content, filename) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function TreeNode({ name, value, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const type = getType(value);
  const isObject = value !== null && typeof value === "object";
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : isObject
    ? Object.entries(value)
    : [];

  if (!isObject) {
    let display;
    if (typeof value === "string") {
      display = `"${value}"`;
    } else if (value === null) {
      display = "null";
    } else {
      display = String(value);
    }

    return (
      <div
        className="flex items-center gap-2 min-h-[27px] font-mono text-[11px] w-full box-border text-ink"
        style={{ paddingLeft: depth * 18 + 8 }}
      >
        <span className="text-brand truncate">{name}</span>
        <span className={`word-break-all ${type === 'string' ? 'text-emerald-500' : type === 'number' ? 'text-brand' : type === 'boolean' ? 'text-brand' : 'text-[#fb7185]'}`}>
          {display}
        </span>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="w-full box-border flex items-center gap-2 min-h-[27px] font-mono text-[11px] border-0 bg-transparent text-ink cursor-pointer text-left hover:bg-paper/50"
        style={{ paddingLeft: depth * 18 + 8 }}
        onClick={() => setOpen(!open)}
      >
        <span className="w-3 text-brand font-bold">{open ? "⌄" : "›"}</span>
        <span className="text-brand truncate">{name}</span>
        <span className="text-muted text-[9px]">
          {Array.isArray(value) ? `Array · ${value.length}` : `Object · ${entries.length}`}
        </span>
      </button>

      {open &&
        entries.map(([key, child]) => (
          <TreeNode key={key} name={key} value={child} depth={depth + 1} />
        ))}
    </div>
  );
}

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [tab, setTab] = useState("format");
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [history, setHistory] = useState([]);

  const parsed = useMemo(() => {
    try {
      let value = JSON.parse(input);
      if (removeEmpty) {
        value = removeEmptyValues(value);
      }
      if (sortKeys) {
        value = sortDeep(value);
      }
      return { valid: true, value, error: null };
    } catch (error) {
      return { valid: false, value: null, error: getErrorInfo(input, error) };
    }
  }, [input, sortKeys, removeEmpty]);

  const formatted = useMemo(() => {
    if (!parsed.valid) return input;
    return JSON.stringify(parsed.value, null, indent);
  }, [parsed, indent, input]);

  const minified = useMemo(() => {
    if (!parsed.valid) return input;
    return JSON.stringify(parsed.value);
  }, [parsed, input]);

  const stats = useMemo(() => {
    if (!parsed.valid) return null;
    return {
      nodes: countNodes(parsed.value),
      keys: countKeys(parsed.value),
      depth: getDepth(parsed.value),
      empty: findEmptyValues(parsed.value),
      type: getType(parsed.value),
      size: new Blob([JSON.stringify(parsed.value)]).size,
    };
  }, [parsed]);

  const duplicates = useMemo(() => findDuplicateKeys(input), [input]);

  function handleFormat() {
    if (!parsed.valid) {
      setTab("validate");
      return;
    }
    setInput(formatted);
    setHistory((old) => [input, ...old.filter((item) => item !== input)].slice(0, 5));
  }

  async function copy(value) {
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
    setTimeout(() => setCopied(false), 1500);
  }

  function runQuery() {
    if (!parsed.valid) {
      setQueryResult({ found: false, error: "Fix the JSON before using Path Finder." });
      return;
    }
    const path = query.trim().replace(/^\$\.?/, "");
    if (!path) {
      setQueryResult({ found: true, value: parsed.value });
      return;
    }
    const parts = path.split(".").filter(Boolean);
    let current = parsed.value;
    for (const part of parts) {
      if (current === null || current === undefined) {
        current = undefined;
        break;
      }
      if (Object.prototype.hasOwnProperty.call(current, part)) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }
    setQueryResult({ found: current !== undefined, value: current });
  }

  function loadSample() {
    setInput(SAMPLE_JSON);
    setQuery("");
    setQueryResult(null);
  }

  function clearAll() {
    setInput("");
    setQuery("");
    setQueryResult(null);
    setHistory([]);
  }

  const currentOutput = tab === "minify" ? minified : formatted;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* MAIN CONTAINER */}
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        {/* TOP BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-xl font-black shrink-0">
              {}
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-widest text-brand uppercase mb-1">
                DEVELOPER TOOL
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                JSON Formatter & Validator
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Format, validate, inspect, clean and explore JSON safely locally.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            <button
              type="button"
              onClick={loadSample}
              className="px-4 py-2.5 rounded-xl border border-line bg-paper text-brand text-xs font-black uppercase tracking-wider hover:bg-surface transition-all truncate"
            >
              Load Sample
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-2.5 rounded-xl border border-[#fb7185]/30 bg-[#fb7185]/10 text-[#fb7185] text-xs font-black uppercase tracking-wider hover:bg-[#fb7185]/20 transition-all truncate"
            >
              Clear
            </button>
          </div>
        </div>

        {/* STATUS */}
        <div className={`flex flex-wrap items-center justify-between gap-4 px-4 py-3.5 rounded-xl border transition-all min-w-0 ${parsed.valid ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-[#fb7185]/10 border-[#fb7185]/30 text-[#fb7185]"}`}>
          <div className="min-w-0 truncate">
            <span className="font-black mr-2.5 truncate">{parsed.valid ? "✓ Valid JSON" : "× Invalid JSON"}</span>
            <span className="text-muted text-xs truncate">
              {parsed.valid ? "Your JSON can be safely parsed." : parsed.error?.message || "JSON parsing failed."}
            </span>
          </div>
          {parsed.valid && stats && (
            <div className="font-bold text-xs text-muted whitespace-nowrap shrink-0">
              {stats.nodes} nodes · depth {stats.depth} · {formatBytes(stats.size)}
            </div>
          )}
        </div>

        {/* EDITOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-w-0">
          
          {/* INPUT */}
          <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface min-w-0">
              <div className="min-w-0 truncate">
                <span className="text-xs font-black text-ink uppercase tracking-wider block truncate">JSON Input</span>
              </div>
              <button
                type="button"
                onClick={() => copy(input)}
                className="px-3 py-1.5 rounded-xl border border-line bg-paper text-ink text-[10px] font-black uppercase tracking-wider hover:bg-surface transition-all shrink-0"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <textarea
              className="w-full h-80 sm:h-[365px] bg-surface text-ink p-4 font-mono text-xs outline-none resize-y border-0 box-border leading-relaxed tabular-nums"
              value={input}
              spellCheck={false}
              onChange={(event) => setInput(event.target.value)}
              placeholder='{"name":"John","active":true}'
            />

            <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-t border-line text-[10px] font-bold text-muted min-w-0">
              <span className="truncate">{input.length} chars</span>
              <span className="truncate">{input ? input.split(/\s+/).filter(Boolean).length : 0} tokens</span>
              <span className="truncate">UTF-8</span>
            </div>
          </div>

          {/* OUTPUT */}
          <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface min-w-0">
              <div className="min-w-0 truncate">
                <span className="text-xs font-black text-ink uppercase tracking-wider block truncate">Output Result</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 min-w-0">
                <button
                  type="button"
                  onClick={() => copy(currentOutput)}
                  className="px-3 py-1.5 rounded-xl border border-line bg-paper text-ink text-[10px] font-black uppercase tracking-wider hover:bg-surface transition-all truncate"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => downloadText(currentOutput, "formatted.json")}
                  className="px-3 py-1.5 rounded-xl border border-line bg-paper text-ink text-[10px] font-black uppercase tracking-wider hover:bg-surface transition-all truncate"
                >
                  Download
                </button>
              </div>
            </div>

            <pre className="w-full h-80 sm:h-[365px] bg-surface text-ink p-4 font-mono text-xs overflow-auto m-0 box-border leading-relaxed whitespace-pre-wrap word-break-all tabular-nums">
              {currentOutput}
            </pre>
          </div>

        </div>

        {/* CONTROLS */}
        <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 min-w-0">
          <div className="flex flex-wrap items-center gap-4 min-w-0">
            <label className="text-xs font-black text-muted uppercase tracking-wider flex items-center gap-2 min-w-0 truncate">
              Indent
              <select
                value={indent}
                onChange={(event) => setIndent(Number(event.target.value))}
                className="bg-surface border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none cursor-pointer"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
                <option value={0}>Compact</option>
              </select>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-bold text-ink cursor-pointer truncate">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(event) => setSortKeys(event.target.checked)}
                className="w-4 h-4 accent-brand rounded border-line"
              />
              <span>Sort keys</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-bold text-ink cursor-pointer truncate">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(event) => setRemoveEmpty(event.target.checked)}
                className="w-4 h-4 accent-brand rounded border-line"
              />
              <span>Remove null / empty</span>
            </label>
          </div>

          <button
            type="button"
            className="px-5 py-3 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-widest transition-opacity shrink-0 ml-auto"
            onClick={handleFormat}
          >
            ✨ Format JSON
          </button>
        </div>

        {/* TABS CONTAINER */}
        <div className="bg-paper border border-line rounded-2xl overflow-hidden min-w-0">
          <div className="flex items-center gap-6 px-4 border-b border-line overflow-x-auto min-w-0">
            {["format", "validate", "tree", "path", "stats"].map((t) => (
              <button
                type="button"
                key={t}
                className={`py-3.5 border-b-2 text-xs font-black uppercase tracking-wider cursor-pointer whitespace-nowrap shrink-0 transition-colors ${tab === t ? "text-brand border-brand" : "text-muted border-transparent hover:text-ink"}`}
                onClick={() => setTab(t)}
              >
                {t === "format" ? "Formatter" : t === "validate" ? "Validator" : t === "tree" ? "JSON Tree" : t === "path" ? "Path Finder" : "Inspector"}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6 min-w-0">
            {/* FORMATTER TAB */}
            {tab === "format" && (
              <div className="space-y-4 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                  <div className="p-3.5 rounded-xl border border-line bg-surface min-w-0 truncate">
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Output mode</span>
                    <strong className="text-xs font-black text-ink mt-0.5 block truncate">{indent === 0 ? "Compact" : `${indent} spaces`}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl border border-line bg-surface min-w-0 truncate">
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Key sorting</span>
                    <strong className="text-xs font-black text-ink mt-0.5 block truncate">{sortKeys ? "Enabled" : "Original order"}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl border border-line bg-surface min-w-0 truncate">
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Cleanup</span>
                    <strong className="text-xs font-black text-ink mt-0.5 block truncate">{removeEmpty ? "Enabled" : "Disabled"}</strong>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-brand/10 border border-brand/30 text-brand text-xs font-bold min-w-0 truncate">
                  Tip: Use <b>Format JSON</b> after pasting minified or messy JSON.
                </div>
              </div>
            )}

            {/* VALIDATOR TAB */}
            {tab === "validate" && (
              <div className="min-w-0">
                {parsed.valid ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 space-y-2 min-w-0">
                    <strong className="text-xs font-black block truncate">✓ JSON is valid</strong>
                    <p className="text-xs font-medium text-muted truncate">The complete input successfully parsed as JSON.</p>
                    {duplicates.length > 0 && (
                      <div className="p-3 rounded-xl bg-brand/10 border border-brand/30 text-brand text-xs font-bold truncate">
                        ⚠ Possible duplicate keys detected: {duplicates.map((key) => `"${key}"`).join(", ")}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#fb7185]/10 border border-[#fb7185]/30 text-[#fb7185] space-y-3 min-w-0">
                    <strong className="text-xs font-black block truncate">× JSON validation failed</strong>
                    <p className="text-xs font-bold truncate">{parsed.error?.message}</p>
                    {parsed.error?.line && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                        <div className="p-3 rounded-xl border border-line bg-surface text-ink min-w-0 truncate">
                          <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Line</span>
                          <strong className="text-xs font-black truncate">{parsed.error.line}</strong>
                        </div>
                        <div className="p-3 rounded-xl border border-line bg-surface text-ink min-w-0 truncate">
                          <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Column</span>
                          <strong className="text-xs font-black truncate">{parsed.error.column}</strong>
                        </div>
                        <div className="p-3 rounded-xl border border-line bg-surface text-ink min-w-0 truncate">
                          <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Position</span>
                          <strong className="text-xs font-black truncate">{parsed.error.position}</strong>
                        </div>
                      </div>
                    )}
                    {parsed.error?.snippet && (
                      <pre className="p-3 rounded-xl bg-surface text-[#fb7185] text-xs font-mono overflow-auto m-0 whitespace-pre-wrap word-break-all tabular-nums">
                        {parsed.error.snippet}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TREE TAB */}
            {tab === "tree" && (
              <div className="bg-surface text-ink rounded-xl p-4 max-h-[450px] overflow-auto min-w-0 border border-line">
                {parsed.valid ? (
                  <TreeNode name={Array.isArray(parsed.value) ? "root[]" : "root"} value={parsed.value} />
                ) : (
                  <div className="text-center py-8 text-muted text-xs font-bold">Fix the JSON first to inspect its tree.</div>
                )}
              </div>
            )}

            {/* PATH FINDER TAB */}
            {tab === "path" && (
              <div className="space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row gap-2.5 min-w-0">
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") runQuery(); }}
                    placeholder="Example: project.owner.name"
                    className="flex-1 min-w-0 bg-surface border border-line rounded-xl px-4 py-3 text-xs font-mono text-ink outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={runQuery}
                    className="px-5 py-3 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-widest shrink-0"
                  >
                    Find Value
                  </button>
                </div>
                <small className="text-[10px] font-bold text-muted block truncate">
                  Use dot notation, e.g. <b>project.owner.name</b> or <b>$.settings.theme</b>
                </small>

                {queryResult && (
                  <div className={`p-4 rounded-xl border transition-all min-w-0 ${queryResult.found ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-[#fb7185]/10 border-[#fb7185]/30 text-[#fb7185]"}`}>
                    {queryResult.found ? (
                      <div className="space-y-2 min-w-0">
                        <strong className="text-xs font-black block truncate">✓ Value found</strong>
                        <pre className="p-3 rounded-xl bg-surface text-ink font-mono text-xs overflow-auto m-0 whitespace-pre-wrap word-break-all tabular-nums border border-line">
                          {JSON.stringify(queryResult.value, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <strong className="text-xs font-black block truncate">× Path not found</strong>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* INSPECTOR TAB */}
            {tab === "stats" && (
              <div className="space-y-4 min-w-0">
                {stats ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-w-0">
                      <div className="p-3.5 rounded-xl border border-line bg-surface min-w-0 truncate">
                        <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Root type</span>
                        <strong className="text-xs font-black text-ink mt-0.5 block truncate">{stats.type}</strong>
                      </div>
                      <div className="p-3.5 rounded-xl border border-line bg-surface min-w-0 truncate">
                        <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Total nodes</span>
                        <strong className="text-xs font-black text-ink mt-0.5 block truncate">{stats.nodes}</strong>
                      </div>
                      <div className="p-3.5 rounded-xl border border-line bg-surface min-w-0 truncate">
                        <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Total keys</span>
                        <strong className="text-xs font-black text-ink mt-0.5 block truncate">{stats.keys}</strong>
                      </div>
                      <div className="p-3.5 rounded-xl border border-line bg-surface min-w-0 truncate">
                        <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Max depth</span>
                        <strong className="text-xs font-black text-ink mt-0.5 block truncate">{stats.depth}</strong>
                      </div>
                      <div className="p-3.5 rounded-xl border border-line bg-surface min-w-0 truncate">
                        <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">Empty / null</span>
                        <strong className="text-xs font-black text-ink mt-0.5 block truncate">{stats.empty}</strong>
                      </div>
                      <div className="p-3.5 rounded-xl border border-line bg-surface min-w-0 truncate">
                        <span className="text-[9px] font-black text-muted uppercase tracking-wider block truncate">JSON size</span>
                        <strong className="text-xs font-black text-ink mt-0.5 block truncate">{formatBytes(stats.size)}</strong>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-line min-w-0 truncate">
                      <strong className="text-xs font-black text-ink block truncate">Smart inspection</strong>
                      <p className="text-xs text-muted mt-1 truncate">This inspector analyzes your JSON locally and shows structural information without uploading data.</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted text-xs font-bold">Valid JSON is required for inspection.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* HISTORY */}
        {history.length > 0 && (
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 min-w-0">
            <div className="min-w-0 truncate">
              <span className="text-xs font-black text-ink uppercase tracking-wider block truncate">Recent versions</span>
              <small className="text-[10px] font-bold text-muted block truncate">Restore one of your last formatted inputs.</small>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0 min-w-0">
              {history.map((item, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setInput(item)}
                  className="px-3 py-2 rounded-xl border border-line bg-surface text-ink text-[10px] font-black uppercase tracking-wider hover:bg-paper transition-all truncate"
                >
                  Version {history.length - index}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}