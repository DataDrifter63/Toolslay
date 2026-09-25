"use client";

import React, { useMemo, useState } from "react";

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState(
    "https://example.com/search?q=hello world&category=tools"
  );

  const [mode, setMode] = useState("encode");
  const [componentMode, setComponentMode] = useState("full");
  const [spaceMode, setSpaceMode] = useState("percent");
  const [decodePlus, setDecodePlus] = useState(true);
  const [autoProcess, setAutoProcess] = useState(true);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const processValue = (value, selectedMode = mode) => {
    if (!value) return "";

    try {
      if (selectedMode === "encode") {
        if (componentMode === "component") {
          return encodeURIComponent(value);
        }

        let result = encodeURI(value);

        if (spaceMode === "plus") {
          result = result.replace(/%20/g, "+");
        }

        return result;
      }

      let valueToDecode = value;

      if (decodePlus) {
        valueToDecode = valueToDecode.replace(/\+/g, " ");
      }

      if (componentMode === "component") {
        return decodeURIComponent(valueToDecode);
      }

      return decodeURI(valueToDecode);
    } catch (error) {
      return `Invalid URL encoding: ${error.message}`;
    }
  };

  const output = useMemo(() => {
    if (!autoProcess) return "";
    return processValue(input);
  }, [
    input,
    mode,
    componentMode,
    spaceMode,
    decodePlus,
    autoProcess,
  ]);

  const handleProcess = () => {
    const result = processValue(input);

    if (result) {
      setHistory((previous) => [
        {
          input,
          output: result,
          mode,
          time: new Date().toLocaleTimeString(),
        },
        ...previous.filter(
          (item) => item.input !== input || item.mode !== mode
        ),
      ].slice(0, 8));
    }
  };

  const handleSwap = () => {
    const currentOutput = processValue(input);

    if (
      currentOutput &&
      !currentOutput.startsWith("Invalid URL encoding:")
    ) {
      setInput(currentOutput);
      // FIXED: Functional update use kiya hai taake mobile par state correctly toggle ho
      setMode((previous) =>
        previous === "encode" ? "decode" : "encode"
      );
    }
  };

  const handleCopy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const loadHistory = (item) => {
    setInput(item.input);
    setMode(item.mode);
  };

  const detectType = (value) => {
    if (!value) return "Empty";

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return "URL";
    }

    if (/%[0-9A-Fa-f]{2}/.test(value)) {
      return "Encoded";
    }

    if (/^[a-zA-Z0-9._~:/?#\[\]@!$&'()*+,;=\%-]+$/.test(value)) {
      return "Text / URL";
    }

    return "Text";
  };

  const stats = {
    input: input.length,
    output: output.length,
    difference: output.length - input.length,
    type: detectType(input),
  };

  const exampleEncode =
    "https://example.com/search?q=hello world&lang=en";

  const exampleDecode =
    "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* CARD CONTAINER */}
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-2xl font-black shrink-0">
              ↗
            </div>

            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                URL Encoder / Decoder
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Encode, decode and inspect URLs safely with advanced controls.
              </p>
            </div>
          </div>

          <div className="flex items-center bg-paper border border-line p-1 rounded-xl gap-1 shrink-0">
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mode === "encode" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
              onClick={() => setMode("encode")}
            >
              Encode
            </button>

            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mode === "decode" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
              onClick={() => setMode("decode")}
            >
              Decode
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl bg-paper border border-line items-end min-w-0">
          <div className="space-y-2 min-w-0">
            <label className="text-xs font-black text-muted uppercase tracking-wider block truncate">Encoding type</label>
            <select
              value={componentMode}
              onChange={(e) => setComponentMode(e.target.value)}
              className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer"
            >
              <option value="full">Full URL — encodeURI</option>
              <option value="component">Component — encodeURIComponent</option>
            </select>
          </div>

          <div className="space-y-2 min-w-0">
            <label className="text-xs font-black text-muted uppercase tracking-wider block truncate">Space handling</label>
            <select
              value={spaceMode}
              onChange={(e) => setSpaceMode(e.target.value)}
              disabled={mode === "decode"}
              className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="percent">%20</option>
              <option value="plus">+ (query string)</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none py-2 min-w-0">
            <input
              type="checkbox"
              checked={autoProcess}
              onChange={(e) => setAutoProcess(e.target.checked)}
              className="w-4 h-4 accent-brand rounded border-line shrink-0"
            />
            <span className="text-xs font-black text-ink truncate">Live processing</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none py-2 min-w-0">
            <input
              type="checkbox"
              checked={decodePlus}
              onChange={(e) => setDecodePlus(e.target.checked)}
              className="w-4 h-4 accent-brand rounded border-line shrink-0"
            />
            <span className="text-xs font-black text-ink truncate">Decode + as space</span>
          </label>
        </div>

        {/* EDITOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch min-w-0">
          
          {/* INPUT PANEL */}
          <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface min-w-0">
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <span className="text-[10px] font-black text-ink uppercase tracking-wider">Input</span>
                <span className="text-[10px] font-bold text-muted">{stats.input} chars</span>
              </div>
              <button
                type="button"
                className="text-xs font-black text-brand uppercase tracking-wider hover:underline"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your URL or encoded text here..."
              spellCheck="false"
              className="w-full h-72 sm:h-80 bg-surface border-0 p-4 font-mono text-xs text-ink outline-none resize-y leading-relaxed tabular-nums"
            />

            <div className="flex items-center justify-between px-4 py-3 border-t border-line bg-surface text-[11px] font-bold text-muted min-w-0">
              <span className="truncate">Detected: <strong className="text-brand">{stats.type}</strong></span>
              <button
                type="button"
                className="text-xs font-black text-brand uppercase tracking-wider hover:underline shrink-0"
                onClick={() => setInput(mode === "encode" ? exampleEncode : exampleDecode)}
              >
                Load example
              </button>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="flex items-center justify-center my-auto">
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-line bg-surface text-brand text-lg font-black flex items-center justify-center shadow-sm hover:border-brand hover:rotate-180 transition-all shrink-0"
              onClick={handleSwap}
              title="Swap input/output"
            >
              ⇄
            </button>
          </div>

          {/* OUTPUT PANEL */}
          <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface min-w-0">
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <span className="text-[10px] font-black text-ink uppercase tracking-wider">Output</span>
                <span className="text-[10px] font-bold text-muted">{output.length} chars</span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/30 text-brand text-[10px] font-black uppercase tracking-wider hover:bg-brand/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                onClick={handleCopy}
                disabled={!output}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>

            <textarea
              value={output}
              readOnly
              placeholder={mode === "encode" ? "Encoded result will appear here..." : "Decoded result will appear here..."}
              spellCheck="false"
              className="w-full h-72 sm:h-80 bg-surface border-0 p-4 font-mono text-xs text-ink outline-none resize-y leading-relaxed tabular-nums"
            />

            <div className="flex items-center justify-between px-4 py-3 border-t border-line bg-surface text-[11px] font-bold text-muted min-w-0">
              <span className="truncate">
                {stats.difference > 0 ? `+${stats.difference} characters` : stats.difference < 0 ? `${stats.difference} characters` : "Same length"}
              </span>
              <span className="truncate">{mode === "encode" ? "URL encoded" : "URL decoded"}</span>
            </div>
          </div>

        </div>

        {/* ACTION BAR */}
        <div className="flex flex-wrap items-center gap-3 pt-2 min-w-0">
          <button
            type="button"
            className="px-6 py-3 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-widest transition-opacity shrink-0"
            onClick={handleProcess}
          >
            {mode === "encode" ? "Encode URL" : "Decode URL"}
          </button>

          <button
            type="button"
            className="px-5 py-3 rounded-xl border border-line bg-paper text-ink hover:bg-surface text-xs font-black uppercase tracking-wider transition-all shrink-0"
            onClick={handleSwap}
          >
            ⇄ Swap & Reverse
          </button>

          <button
            type="button"
            className="px-5 py-3 rounded-xl border border-line bg-paper text-ink hover:bg-surface text-xs font-black uppercase tracking-wider transition-all shrink-0"
            onClick={() => { setInput(""); setHistory([]); }}
          >
            Reset
          </button>
        </div>

        {/* QUICK INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-line min-w-0">
          <div className="flex gap-3.5 p-4 rounded-2xl bg-paper border border-line min-w-0">
            <span className="w-8 h-8 rounded-xl bg-brand/10 text-brand font-black flex items-center justify-center shrink-0">%</span>
            <div className="min-w-0 truncate">
              <strong className="text-xs font-black text-ink block truncate">Safe URL encoding</strong>
              <p className="text-[11px] font-medium text-muted mt-0.5 truncate">Converts reserved and unsafe characters into URL-safe representations.</p>
            </div>
          </div>

          <div className="flex gap-3.5 p-4 rounded-2xl bg-paper border border-line min-w-0">
            <span className="w-8 h-8 rounded-xl bg-brand/10 text-brand font-black flex items-center justify-center shrink-0">↔</span>
            <div className="min-w-0 truncate">
              <strong className="text-xs font-black text-ink block truncate">Full URL + Component mode</strong>
              <p className="text-[11px] font-medium text-muted mt-0.5 truncate">Switch between full URL handling and individual query/component values.</p>
            </div>
          </div>

          <div className="flex gap-3.5 p-4 rounded-2xl bg-paper border border-line min-w-0">
            <span className="w-8 h-8 rounded-xl bg-brand/10 text-brand font-black flex items-center justify-center shrink-0">⚡</span>
            <div className="min-w-0 truncate">
              <strong className="text-xs font-black text-ink block truncate">Live processing</strong>
              <p className="text-[11px] font-medium text-muted mt-0.5 truncate">See encoded or decoded output instantly while editing your input.</p>
            </div>
          </div>
        </div>

        {/* HISTORY */}
        {history.length > 0 && (
          <div className="rounded-2xl border border-line overflow-hidden bg-paper min-w-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-surface min-w-0">
              <div className="min-w-0 truncate">
                <strong className="text-xs font-black text-ink uppercase tracking-wider block truncate">Recent conversions</strong>
                <span className="text-[10px] font-bold text-muted block truncate">Your latest local conversions</span>
              </div>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-xs font-black text-[#fb7185] uppercase tracking-wider hover:underline shrink-0"
              >
                Clear history
              </button>
            </div>

            <div className="divide-y divide-line">
              {history.map((item, index) => (
                <button
                  type="button"
                  key={`${item.time}-${index}`}
                  className="w-full px-5 py-3.5 bg-transparent border-0 text-left cursor-pointer flex items-center justify-between gap-4 hover:bg-surface transition-colors min-w-0"
                  onClick={() => loadHistory(item)}
                >
                  <div className="flex items-center gap-3 min-w-0 truncate">
                    <span className="px-2 py-1 rounded bg-brand/10 text-brand text-[9px] font-black uppercase tracking-wider shrink-0">
                      {item.mode}
                    </span>
                    <span className="text-xs font-medium text-muted truncate">
                      {item.input.slice(0, 90)}
                      {item.input.length > 90 ? "..." : ""}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-muted shrink-0">{item.time}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}