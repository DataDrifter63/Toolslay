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

function downloadText(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    <div className="b64-tool">
      <style jsx>{`
        .b64-tool {
          width: 100%;
          color: inherit;
        }

        .b64-shell {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 20px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 18px 55px rgba(15, 23, 42, 0.08);
        }

        .b64-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(248, 250, 252, 0.9);
          flex-wrap: wrap;
        }

        .b64-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .b64-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 20px;
          font-weight: 800;
        }

        .b64-title {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .b64-subtitle {
          margin-top: 3px;
          font-size: 12px;
          color: #64748b;
        }

        .b64-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .b64-btn {
          border: 1px solid #dbe2ea;
          background: #fff;
          color: #0f172a;
          min-height: 38px;
          padding: 0 13px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition: 0.18s ease;
        }

        .b64-btn:hover {
          border-color: #a5b4fc;
          transform: translateY(-1px);
        }

        .b64-btn.primary {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #fff;
        }

        .b64-btn.danger {
          color: #dc2626;
        }

        .b64-body {
          padding: 20px;
        }

        .b64-modebar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .b64-tabs {
          display: flex;
          padding: 4px;
          border-radius: 11px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
        }

        .b64-tab {
          border: 0;
          background: transparent;
          padding: 9px 17px;
          border-radius: 8px;
          font-weight: 800;
          color: #64748b;
          cursor: pointer;
        }

        .b64-tab.active {
          background: #fff;
          color: #4f46e5;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        }

        .b64-options {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .b64-check {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
          user-select: none;
        }

        .b64-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 50px minmax(0, 1fr);
          gap: 12px;
          align-items: stretch;
        }

        .b64-panel {
          min-width: 0;
          border: 1px solid #dbe2ea;
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
        }

        .b64-panel-head {
          min-height: 48px;
          padding: 0 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .b64-panel-label {
          font-size: 13px;
          font-weight: 800;
          color: #334155;
        }

        .b64-counter {
          font-size: 11px;
          color: #94a3b8;
        }

        .b64-textarea {
          width: 100%;
          min-height: 360px;
          display: block;
          resize: vertical;
          border: 0;
          outline: none;
          padding: 17px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          line-height: 1.65;
          color: #0f172a;
          background: #fff;
        }

        .b64-textarea:focus {
          box-shadow: inset 0 0 0 2px rgba(79, 70, 229, 0.12);
        }

        .b64-output {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .b64-middle {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 9px;
        }

        .b64-round {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #dbe2ea;
          background: #fff;
          cursor: pointer;
          color: #475569;
          font-size: 17px;
          transition: 0.18s;
        }

        .b64-round:hover {
          color: #4f46e5;
          border-color: #a5b4fc;
          transform: rotate(180deg);
        }

        .b64-error {
          margin-top: 13px;
          padding: 11px 13px;
          border-radius: 10px;
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          font-size: 13px;
          font-weight: 600;
        }

        .b64-file {
          margin-top: 18px;
          border: 1.5px dashed #cbd5e1;
          border-radius: 14px;
          padding: 22px;
          text-align: center;
          background: #f8fafc;
          transition: 0.2s;
          cursor: pointer;
        }

        .b64-file.active {
          border-color: #6366f1;
          background: #eef2ff;
        }

        .b64-file-icon {
          font-size: 25px;
          margin-bottom: 7px;
        }

        .b64-file-title {
          font-size: 14px;
          font-weight: 800;
          color: #334155;
        }

        .b64-file-desc {
          margin-top: 5px;
          font-size: 12px;
          color: #64748b;
        }

        .b64-file-name {
          margin-top: 9px;
          color: #4f46e5;
          font-size: 12px;
          font-weight: 800;
        }

        .b64-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 18px;
        }

        .b64-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          background: #fff;
        }

        .b64-card-title {
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 9px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .b64-stats {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .b64-stat strong {
          display: block;
          color: #0f172a;
          font-size: 17px;
        }

        .b64-stat span {
          color: #94a3b8;
          font-size: 11px;
        }

        .b64-history {
          margin-top: 18px;
        }

        .b64-history-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 9px;
        }

        .b64-history-title {
          font-size: 13px;
          font-weight: 800;
        }

        .b64-history-list {
          display: grid;
          gap: 7px;
        }

        .b64-history-item {
          width: 100%;
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 9px;
          padding: 9px 11px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          text-align: left;
          cursor: pointer;
        }

        .b64-history-item:hover {
          border-color: #a5b4fc;
        }

        .b64-history-main {
          min-width: 0;
        }

        .b64-history-mode {
          font-size: 11px;
          font-weight: 800;
          color: #4f46e5;
          text-transform: uppercase;
        }

        .b64-history-preview {
          margin-top: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: monospace;
          font-size: 11px;
          color: #64748b;
        }

        .b64-history-time {
          font-size: 10px;
          color: #94a3b8;
          white-space: nowrap;
        }

        @media (max-width: 850px) {
          .b64-grid {
            grid-template-columns: 1fr;
          }

          .b64-middle {
            flex-direction: row;
          }

          .b64-bottom {
            grid-template-columns: 1fr;
          }

          .b64-textarea {
            min-height: 280px;
          }
        }

        @media (max-width: 560px) {
          .b64-body {
            padding: 13px;
          }

          .b64-toolbar {
            padding: 14px;
          }

          .b64-actions {
            width: 100%;
          }

          .b64-actions .b64-btn {
            flex: 1;
          }

          .b64-modebar {
            align-items: stretch;
          }

          .b64-tabs {
            width: 100%;
          }

          .b64-tab {
            flex: 1;
          }

          .b64-options {
            width: 100%;
          }

          .b64-textarea {
            min-height: 240px;
            font-size: 12px;
          }
        }

        :global(.dark) .b64-shell,
        :global([data-theme="dark"]) .b64-shell {
          background: #111827;
          border-color: #273449;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
        }

        :global(.dark) .b64-toolbar,
        :global([data-theme="dark"]) .b64-toolbar {
          background: #0f172a;
          border-color: #273449;
        }

        :global(.dark) .b64-icon,
        :global([data-theme="dark"]) .b64-icon {
          background: #312e81;
          color: #c7d2fe;
        }

        :global(.dark) .b64-subtitle,
        :global([data-theme="dark"]) .b64-subtitle {
          color: #94a3b8;
        }

        :global(.dark) .b64-btn,
        :global([data-theme="dark"]) .b64-btn {
          background: #111827;
          color: #e2e8f0;
          border-color: #334155;
        }

        :global(.dark) .b64-btn.primary,
        :global([data-theme="dark"]) .b64-btn.primary {
          background: #6366f1;
          border-color: #6366f1;
          color: #fff;
        }

        :global(.dark) .b64-tabs,
        :global([data-theme="dark"]) .b64-tabs {
          background: #0f172a;
          border-color: #334155;
        }

        :global(.dark) .b64-tab,
        :global([data-theme="dark"]) .b64-tab {
          color: #94a3b8;
        }

        :global(.dark) .b64-tab.active,
        :global([data-theme="dark"]) .b64-tab.active {
          background: #1e293b;
          color: #a5b4fc;
        }

        :global(.dark) .b64-check,
        :global([data-theme="dark"]) .b64-check {
          color: #cbd5e1;
        }

        :global(.dark) .b64-panel,
        :global([data-theme="dark"]) .b64-panel,
        :global(.dark) .b64-card,
        :global([data-theme="dark"]) .b64-card,
        :global(.dark) .b64-history-item,
        :global([data-theme="dark"]) .b64-history-item {
          background: #111827;
          border-color: #334155;
        }

        :global(.dark) .b64-panel-head,
        :global([data-theme="dark"]) .b64-panel-head {
          background: #0f172a;
          border-color: #334155;
        }

        :global(.dark) .b64-panel-label,
        :global([data-theme="dark"]) .b64-panel-label,
        :global([data-theme="dark"]) .b64-panel-label {
          color: #e2e8f0;
        }

        :global(.dark) .b64-textarea,
        :global([data-theme="dark"]) .b64-textarea {
          background: #111827;
          color: #e2e8f0;
        }

        :global(.dark) .b64-round,
        :global([data-theme="dark"]) .b64-round {
          background: #111827;
          border-color: #334155;
          color: #cbd5e1;
        }

        :global(.dark) .b64-file,
        :global([data-theme="dark"]) .b64-file {
          background: #0f172a;
          border-color: #475569;
        }

        :global(.dark) .b64-file.active,
        :global([data-theme="dark"]) .b64-file.active {
          background: #1e1b4b;
          border-color: #6366f1;
        }

        :global(.dark) .b64-file-title,
        :global([data-theme="dark"]) .b64-file-title {
          color: #e2e8f0;
        }

        :global(.dark) .b64-stat strong,
        :global([data-theme="dark"]) .b64-stat strong {
          color: #f8fafc;
        }

        :global(.dark) .b64-history-title,
        :global([data-theme="dark"]) .b64-history-title {
          color: #e2e8f0;
        }
      `}</style>

      <div className="b64-shell">
        <div className="b64-toolbar">
          <div className="b64-brand">
            <div className="b64-icon">64</div>

            <div>
              <div className="b64-title">
                Base64 Encoder & Decoder
              </div>

              <div className="b64-subtitle">
                Fast, private, browser-based Base64 conversion
              </div>
            </div>
          </div>

          <div className="b64-actions">
            <button className="b64-btn" onClick={loadSample}>
              ✨ Sample
            </button>

            <button className="b64-btn" onClick={swapValues}>
              ⇄ Swap
            </button>

            <button className="b64-btn danger" onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>

        <div className="b64-body">
          <div className="b64-modebar">
            <div className="b64-tabs">
              <button
                className={`b64-tab ${
                  mode === "encode" ? "active" : ""
                }`}
                onClick={() => {
                  setMode("encode");
                  setError("");
                }}
              >
                Encode
              </button>

              <button
                className={`b64-tab ${
                  mode === "decode" ? "active" : ""
                }`}
                onClick={() => {
                  setMode("decode");
                  setError("");
                }}
              >
                Decode
              </button>
            </div>

            <div className="b64-options">
              <label className="b64-check">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                />
                URL-safe Base64
              </label>

              <label className="b64-check">
                <input
                  type="checkbox"
                  checked={autoProcess}
                  onChange={(e) => setAutoProcess(e.target.checked)}
                />
                Live conversion
              </label>
            </div>
          </div>

          <div className="b64-grid">
            <div className="b64-panel">
              <div className="b64-panel-head">
                <span className="b64-panel-label">
                  {mode === "encode"
                    ? "Plain Text / Data"
                    : "Base64 Input"}
                </span>

                <span className="b64-counter">
                  {inputStats.characters.toLocaleString()} chars
                </span>
              </div>

              <textarea
                className="b64-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "encode"
                    ? "Type or paste text here..."
                    : "Paste Base64 data here..."
                }
                spellCheck={false}
              />
            </div>

            <div className="b64-middle">
              <button
                className="b64-round"
                title="Convert"
                onClick={addToHistoryAndProcess}
              >
                →
              </button>

              <button
                className="b64-round"
                title="Swap input and output"
                onClick={swapValues}
              >
                ⇄
              </button>
            </div>

            <div className="b64-panel">
              <div className="b64-panel-head">
                <span className="b64-panel-label">
                  {mode === "encode"
                    ? "Base64 Output"
                    : "Decoded Text"}
                </span>

                <span className="b64-counter">
                  {characterCount.toLocaleString()} chars
                </span>
              </div>

              <textarea
                className="b64-textarea b64-output"
                value={output}
                readOnly
                placeholder={
                  mode === "encode"
                    ? "Base64 result will appear here..."
                    : "Decoded result will appear here..."
                }
                spellCheck={false}
              />
            </div>
          </div>

          {error && (
            <div className="b64-error">
              ⚠ {error}
            </div>
          )}

          <div
            className={`b64-file ${
              dragActive ? "active" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="b64-file-icon">📁</div>

            <div className="b64-file-title">
              Encode a file directly
            </div>

            <div className="b64-file-desc">
              Drag & drop a file here or click to browse · Up to 25 MB
            </div>

            {fileName && (
              <div className="b64-file-name">
                {fileName} · {formatBytes(fileSize)}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(e) =>
                handleFile(e.target.files?.[0])
              }
            />
          </div>

          <div className="b64-bottom">
            <div className="b64-card">
              <div className="b64-card-title">
                Input information
              </div>

              <div className="b64-stats">
                <div className="b64-stat">
                  <strong>
                    {inputStats.characters.toLocaleString()}
                  </strong>
                  <span>Characters</span>
                </div>

                <div className="b64-stat">
                  <strong>
                    {formatBytes(inputStats.bytes)}
                  </strong>
                  <span>UTF-8 size</span>
                </div>

                <div className="b64-stat">
                  <strong>{inputStats.lines}</strong>
                  <span>Lines</span>
                </div>
              </div>
            </div>

            <div className="b64-card">
              <div className="b64-card-title">
                Output information
              </div>

              <div className="b64-stats">
                <div className="b64-stat">
                  <strong>
                    {outputStats.characters.toLocaleString()}
                  </strong>
                  <span>Characters</span>
                </div>

                <div className="b64-stat">
                  <strong>
                    {formatBytes(outputStats.bytes)}
                  </strong>
                  <span>Output size</span>
                </div>

                <button
                  className="b64-btn primary"
                  onClick={copyOutput}
                  disabled={!output}
                >
                  {copied ? "✓ Copied" : "Copy Output"}
                </button>

                {mode === "decode" && output && (
                  <button
                    className="b64-btn"
                    onClick={decodeFileOutput}
                  >
                    ↓ Save File
                  </button>
                )}
              </div>
            </div>
          </div>

          {history.length > 0 && (
            <div className="b64-history">
              <div className="b64-history-head">
                <div className="b64-history-title">
                  Recent conversions
                </div>

                <button
                  className="b64-btn"
                  onClick={() => setHistory([])}
                >
                  Clear History
                </button>
              </div>

              <div className="b64-history-list">
                {history.map((item) => (
                  <button
                    key={item.id}
                    className="b64-history-item"
                    onClick={() => {
                      setMode(item.mode);
                      setInput(item.input);
                      setOutput(item.output);
                    }}
                  >
                    <div className="b64-history-main">
                      <div className="b64-history-mode">
                        {item.mode}
                      </div>

                      <div className="b64-history-preview">
                        {item.input || "Empty input"}
                      </div>
                    </div>

                    <div className="b64-history-time">
                      {item.time}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}