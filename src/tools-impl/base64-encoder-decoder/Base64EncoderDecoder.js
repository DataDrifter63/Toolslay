"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const SAMPLE_TEXT =
  "Hello World! This is a Base64 Encoder & Decoder.\n\nUnicode: Pakistan — اردو — हिन्दी — العربية — 日本語 — 🚀";

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

function base64ToBytes(base64) {
  const clean = base64.replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function encodeUtf8(text) {
  return bytesToBase64(new TextEncoder().encode(text));
}

function decodeUtf8(base64) {
  return new TextDecoder("utf-8", { fatal: true }).decode(
    base64ToBytes(base64)
  );
}

function toUrlSafe(base64) {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromUrlSafe(base64) {
  let value = base64.replace(/-/g, "+").replace(/_/g, "/");
  while (value.length % 4) value += "=";
  return value;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Base64EncoderDecoder() {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [autoProcess, setAutoProcess] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const inputStats = useMemo(() => {
    const bytes = new TextEncoder().encode(input).length;

    return {
      characters: input.length,
      bytes,
      lines: input ? input.split(/\r?\n/).length : 0,
    };
  }, [input]);

  const outputStats = useMemo(() => {
    const bytes = new TextEncoder().encode(output).length;

    return {
      characters: output.length,
      bytes,
    };
  }, [output]);

  const processValue = (value = input, selectedMode = mode) => {
    setError("");

    if (!value) {
      setOutput("");
      return;
    }

    try {
      if (selectedMode === "encode") {
        let encoded = encodeUtf8(value);

        if (urlSafe) {
          encoded = toUrlSafe(encoded);
        }

        setOutput(encoded);
      } else {
        const normalized = urlSafe ? fromUrlSafe(value) : value;
        const decoded = decodeUtf8(normalized);

        setOutput(decoded);
      }
    } catch (err) {
      setOutput("");
      setError(
        selectedMode === "decode"
          ? "Invalid Base64 input. Check the characters, padding, or URL-safe option."
          : "Unable to encode this input."
      );
    }
  };

  useEffect(() => {
    if (autoProcess) {
      processValue(input, mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, mode, urlSafe, autoProcess]);

  const saveHistory = () => {
    if (!input && !output) return;

    const item = {
      id: Date.now(),
      mode,
      input: input.slice(0, 5000),
      output: output.slice(0, 5000),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setHistory((prev) => [item, ...prev].slice(0, 8));
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);

      setTimeout(() => setCopied(false), 1400);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const swapValues = () => {
    setInput(output);
    setOutput(input);

    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    setError("");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setFileName("");
    setFileSize(0);
  };

  const loadSample = () => {
    setMode("encode");
    setUrlSafe(false);
    setInput(SAMPLE_TEXT);
    setError("");
  };

  const handleFile = async (file) => {
    if (!file) return;

    try {
      setError("");
      setFileName(file.name);
      setFileSize(file.size);

      if (file.size > 25 * 1024 * 1024) {
        setError("For browser performance, files are limited to 25 MB.");
        return;
      }

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      let encoded = bytesToBase64(bytes);

      if (urlSafe) {
        encoded = toUrlSafe(encoded);
      }

      setMode("encode");
      setInput(`[Binary file: ${file.name}]`);
      setOutput(encoded);
    } catch {
      setError("Could not read this file.");
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      await handleFile(file);
    }
  };

  const decodeFileOutput = () => {
    if (!output) return;

    try {
      const normalized = urlSafe ? fromUrlSafe(output) : output;
      const bytes = base64ToBytes(normalized);

      const blob = new Blob([bytes], {
        type: "application/octet-stream",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = fileName
        ? `decoded-${fileName}`
        : "decoded-file.bin";

      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("The Base64 data could not be converted back into a file.");
    }
  };

  const addToHistoryAndProcess = () => {
    processValue();
    saveHistory();
  };

  const characterCount = output.length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* CARD CONTAINER */}
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        {/* HEADER / TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-xl font-black shrink-0">
              64
            </div>

            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
                Base64 Encoder & Decoder
              </h2>
              <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
                Fast, private, browser-based Base64 conversion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl border border-line bg-paper text-ink hover:bg-surface text-xs font-black uppercase tracking-wider transition-all"
              onClick={loadSample}
            >
              ✨ Sample
            </button>

            <button
              type="button"
              className="px-4 py-2.5 rounded-xl border border-line bg-paper text-ink hover:bg-surface text-xs font-black uppercase tracking-wider transition-all"
              onClick={swapValues}
            >
              ⇄ Swap
            </button>

            <button
              type="button"
              className="px-4 py-2.5 rounded-xl border border-line bg-paper text-[#fb7185] hover:bg-surface text-xs font-black uppercase tracking-wider transition-all"
              onClick={clearAll}
            >
              Clear
            </button>
          </div>
        </div>

        {/* MODE BAR & OPTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-paper border border-line min-w-0">
          <div className="flex items-center bg-surface border border-line p-1 rounded-xl gap-1 shrink-0">
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mode === "encode" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
              onClick={() => {
                setMode("encode");
                setError("");
              }}
            >
              Encode
            </button>

            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mode === "decode" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
              onClick={() => {
                setMode("decode");
                setError("");
              }}
            >
              Decode
            </button>
          </div>

          <div className="flex items-center gap-6 flex-wrap min-w-0">
            <label className="flex items-center gap-3 cursor-pointer select-none min-w-0">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => setUrlSafe(e.target.checked)}
                className="w-4 h-4 accent-brand rounded border-line shrink-0"
              />
              <span className="text-xs font-black text-ink truncate">URL-safe Base64</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none min-w-0">
              <input
                type="checkbox"
                checked={autoProcess}
                onChange={(e) => setAutoProcess(e.target.checked)}
                className="w-4 h-4 accent-brand rounded border-line shrink-0"
              />
              <span className="text-xs font-black text-ink truncate">Live conversion</span>
            </label>
          </div>
        </div>

        {/* EDITOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch min-w-0">
          
          {/* INPUT PANEL */}
          <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface min-w-0">
              <span className="text-[11px] font-black text-ink uppercase tracking-wider truncate">
                {mode === "encode" ? "Plain Text / Data" : "Base64 Input"}
              </span>
              <span className="text-[10px] font-bold text-muted shrink-0">
                {inputStats.characters.toLocaleString()} chars
              </span>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? "Type or paste text here..." : "Paste Base64 data here..."}
              spellCheck={false}
              className="w-full h-72 sm:h-80 bg-surface border-0 p-4 font-mono text-xs text-ink outline-none resize-y leading-relaxed tabular-nums"
            />
          </div>

          {/* MIDDLE CONTROLS */}
          <div className="flex lg:flex-col items-center justify-center gap-3 my-auto py-2">
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-line bg-surface text-brand text-lg font-black flex items-center justify-center shadow-sm hover:border-brand transition-all shrink-0"
              title="Convert"
              onClick={addToHistoryAndProcess}
            >
              →
            </button>

            <button
              type="button"
              className="w-10 h-10 rounded-full border border-line bg-surface text-brand text-lg font-black flex items-center justify-center shadow-sm hover:border-brand hover:rotate-180 transition-all shrink-0"
              title="Swap input and output"
              onClick={swapValues}
            >
              ⇄
            </button>
          </div>

          {/* OUTPUT PANEL */}
          <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface min-w-0">
              <span className="text-[11px] font-black text-ink uppercase tracking-wider truncate">
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
              </span>
              <span className="text-[10px] font-bold text-muted shrink-0">
                {characterCount.toLocaleString()} chars
              </span>
            </div>

            <textarea
              value={output}
              readOnly
              placeholder={mode === "encode" ? "Base64 result will appear here..." : "Decoded result will appear here..."}
              spellCheck={false}
              className="w-full h-72 sm:h-80 bg-surface border-0 p-4 font-mono text-xs text-ink outline-none resize-y leading-relaxed tabular-nums whitespace-pre-wrap break-words"
            />
          </div>

        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="p-4 rounded-xl bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] text-xs font-bold flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        {/* FILE DROP ZONE */}
        <div
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer select-none min-w-0 ${dragActive ? "border-brand bg-brand/5" : "border-line bg-paper hover:border-brand/50"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-2xl mb-2">📁</div>
          <div className="text-xs font-black text-ink">Encode a file directly</div>
          <div className="text-[11px] font-medium text-muted mt-1">
            Drag & drop a file here or click to browse · Up to 25 MB
          </div>

          {fileName && (
            <div className="mt-2 text-xs font-black text-brand truncate">
              {fileName} · {formatBytes(fileSize)}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* STATS BOTTOM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          <div className="border border-line rounded-2xl p-4 bg-paper min-w-0">
            <div className="text-[11px] font-black text-muted uppercase tracking-wider mb-3">
              Input information
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <strong className="block text-base font-black text-ink">{inputStats.characters.toLocaleString()}</strong>
                <span className="text-[10px] font-bold text-muted">Characters</span>
              </div>
              <div>
                <strong className="block text-base font-black text-ink">{formatBytes(inputStats.bytes)}</strong>
                <span className="text-[10px] font-bold text-muted">UTF-8 size</span>
              </div>
              <div>
                <strong className="block text-base font-black text-ink">{inputStats.lines}</strong>
                <span className="text-[10px] font-bold text-muted">Lines</span>
              </div>
            </div>
          </div>

          <div className="border border-line rounded-2xl p-4 bg-paper min-w-0">
            <div className="text-[11px] font-black text-muted uppercase tracking-wider mb-3">
              Output information
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <strong className="block text-base font-black text-ink">{outputStats.characters.toLocaleString()}</strong>
                  <span className="text-[10px] font-bold text-muted">Characters</span>
                </div>
                <div>
                  <strong className="block text-base font-black text-ink">{formatBytes(outputStats.bytes)}</strong>
                  <span className="text-[10px] font-bold text-muted">Output size</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-wider transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={copyOutput}
                  disabled={!output}
                >
                  {copied ? "✓ Copied" : "Copy Output"}
                </button>

                {mode === "decode" && output && (
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl border border-line bg-surface text-ink hover:bg-paper text-xs font-black uppercase tracking-wider transition-all"
                    onClick={decodeFileOutput}
                  >
                    ↓ Save File
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* HISTORY */}
        {history.length > 0 && (
          <div className="rounded-2xl border border-line overflow-hidden bg-paper min-w-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-surface min-w-0">
              <strong className="text-xs font-black text-ink uppercase tracking-wider">Recent conversions</strong>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-xs font-black text-[#fb7185] uppercase tracking-wider hover:underline shrink-0"
              >
                Clear History
              </button>
            </div>

            <div className="divide-y divide-line">
              {history.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="w-full px-5 py-3.5 bg-transparent border-0 text-left cursor-pointer flex items-center justify-between gap-4 hover:bg-surface transition-colors min-w-0"
                  onClick={() => {
                    setMode(item.mode);
                    setInput(item.input);
                    setOutput(item.output);
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 truncate">
                    <span className="px-2 py-1 rounded bg-brand/10 text-brand text-[9px] font-black uppercase tracking-wider shrink-0">
                      {item.mode}
                    </span>
                    <span className="text-xs font-medium text-muted font-mono truncate">
                      {item.input || "Empty input"}
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