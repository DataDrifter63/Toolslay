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

    if (/^[a-zA-Z0-9._~:/?#\[\]@!$&'()*+,;=%-]+$/.test(value)) {
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
    <div className="ued-wrapper">
      <div className="ued-card">

        {/* Header */}
        <div className="ued-header">
          <div>
            <div className="ued-title-row">
              <div className="ued-icon">↗</div>

              <div>
                <h2>URL Encoder / Decoder</h2>
                <p>
                  Encode, decode and inspect URLs safely with advanced
                  controls.
                </p>
              </div>
            </div>
          </div>

          <div className="ued-header-actions">
            <button
              className={
                mode === "encode"
                  ? "ued-mode active"
                  : "ued-mode"
              }
              onClick={() => setMode("encode")}
            >
              Encode
            </button>

            <button
              className={
                mode === "decode"
                  ? "ued-mode active"
                  : "ued-mode"
              }
              onClick={() => setMode("decode")}
            >
              Decode
            </button>
          </div>
        </div>

        {/* Main controls */}
        <div className="ued-controls">

          <div className="ued-control">
            <label>Encoding type</label>

            <select
              value={componentMode}
              onChange={(e) => setComponentMode(e.target.value)}
            >
              <option value="full">
                Full URL — encodeURI
              </option>

              <option value="component">
                Component — encodeURIComponent
              </option>
            </select>
          </div>

          <div className="ued-control">
            <label>Space handling</label>

            <select
              value={spaceMode}
              onChange={(e) => setSpaceMode(e.target.value)}
              disabled={mode === "decode"}
            >
              <option value="percent">
                %20
              </option>

              <option value="plus">
                + (query string)
              </option>
            </select>
          </div>

          <label className="ued-toggle">
            <input
              type="checkbox"
              checked={autoProcess}
              onChange={(e) =>
                setAutoProcess(e.target.checked)
              }
            />

            <span className="ued-switch"></span>

            <span>Live processing</span>
          </label>

          <label className="ued-toggle">
            <input
              type="checkbox"
              checked={decodePlus}
              onChange={(e) =>
                setDecodePlus(e.target.checked)
              }
            />

            <span className="ued-switch"></span>

            <span>Decode + as space</span>
          </label>

        </div>

        {/* Editor */}
        <div className="ued-grid">

          {/* Input */}
          <div className="ued-panel">

            <div className="ued-panel-head">
              <div>
                <span className="ued-label">
                  INPUT
                </span>

                <span className="ued-count">
                  {stats.input} chars
                </span>
              </div>

              <button
                className="ued-small-btn"
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
            />

            <div className="ued-panel-footer">
              <span>
                Detected: <strong>{stats.type}</strong>
              </span>

              <button
                className="ued-example"
                onClick={() =>
                  setInput(
                    mode === "encode"
                      ? exampleEncode
                      : exampleDecode
                  )
                }
              >
                Load example
              </button>
            </div>

          </div>

          {/* Arrow */}
          <div className="ued-center">

            <button
              className="ued-swap"
              onClick={handleSwap}
              title="Swap input/output"
            >
              ⇄
            </button>

          </div>

          {/* Output */}
          <div className="ued-panel">

            <div className="ued-panel-head">
              <div>
                <span className="ued-label">
                  OUTPUT
                </span>

                <span className="ued-count">
                  {output.length} chars
                </span>
              </div>

              <button
                className="ued-copy"
                onClick={handleCopy}
                disabled={!output}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>

            <textarea
              value={output}
              readOnly
              placeholder={
                mode === "encode"
                  ? "Encoded result will appear here..."
                  : "Decoded result will appear here..."
              }
              spellCheck="false"
            />

            <div className="ued-panel-footer">
              <span>
                {stats.difference > 0
                  ? `+${stats.difference} characters`
                  : stats.difference < 0
                  ? `${stats.difference} characters`
                  : "Same length"}
              </span>

              <span>
                {mode === "encode"
                  ? "URL encoded"
                  : "URL decoded"}
              </span>
            </div>

          </div>
        </div>

        {/* Action bar */}
        <div className="ued-actions">

          <button
            className="ued-primary"
            onClick={handleProcess}
          >
            {mode === "encode"
              ? "Encode URL"
              : "Decode URL"}
          </button>

          <button
            className="ued-secondary"
            onClick={handleSwap}
          >
            ⇄ Swap & Reverse
          </button>

          <button
            className="ued-secondary"
            onClick={() => {
              setInput("");
              setHistory([]);
            }}
          >
            Reset
          </button>

        </div>

        {/* Quick info */}
        <div className="ued-info-grid">

          <div className="ued-info">
            <span className="ued-info-icon">%</span>

            <div>
              <strong>Safe URL encoding</strong>
              <p>
                Converts reserved and unsafe characters into
                URL-safe representations.
              </p>
            </div>
          </div>

          <div className="ued-info">
            <span className="ued-info-icon">↔</span>

            <div>
              <strong>Full URL + Component mode</strong>
              <p>
                Switch between full URL handling and individual
                query/component values.
              </p>
            </div>
          </div>

          <div className="ued-info">
            <span className="ued-info-icon">⚡</span>

            <div>
              <strong>Live processing</strong>
              <p>
                See encoded or decoded output instantly while
                editing your input.
              </p>
            </div>
          </div>

        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="ued-history">

            <div className="ued-history-head">
              <div>
                <strong>Recent conversions</strong>
                <span>
                  Your latest local conversions
                </span>
              </div>

              <button
                onClick={() => setHistory([])}
                className="ued-clear-history"
              >
                Clear history
              </button>
            </div>

            <div className="ued-history-list">
              {history.map((item, index) => (
                <button
                  key={`${item.time}-${index}`}
                  className="ued-history-item"
                  onClick={() => loadHistory(item)}
                >
                  <div>
                    <span className="ued-history-mode">
                      {item.mode}
                    </span>

                    <span className="ued-history-input">
                      {item.input.slice(0, 90)}
                      {item.input.length > 90 ? "..." : ""}
                    </span>
                  </div>

                  <span className="ued-history-time">
                    {item.time}
                  </span>
                </button>
              ))}
            </div>

          </div>
        )}

      </div>

      <style jsx>{`
        .ued-wrapper {
          width: 100%;
          padding: 24px 0;
          box-sizing: border-box;
        }

        .ued-card {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px;
          border: 1px solid rgba(125, 125, 150, 0.18);
          border-radius: 22px;
          background: var(--tool-bg, #ffffff);
          color: var(--tool-text, #111827);
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.07);
          box-sizing: border-box;
        }

        .ued-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .ued-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ued-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef2ff;
          color: #5b5cf0;
          font-size: 25px;
          font-weight: 700;
        }

        .ued-header h2 {
          margin: 0 0 5px;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.4px;
        }

        .ued-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .ued-header-actions {
          display: flex;
          padding: 4px;
          border-radius: 12px;
          background: rgba(125, 125, 150, 0.08);
          gap: 4px;
        }

        .ued-mode {
          border: 0;
          background: transparent;
          padding: 10px 16px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          color: #6b7280;
        }

        .ued-mode.active {
          background: #5b5cf0;
          color: white;
          box-shadow: 0 4px 12px rgba(91, 92, 240, 0.22);
        }

        .ued-controls {
          display: grid;
          grid-template-columns: 1fr 1fr auto auto;
          gap: 14px;
          padding: 17px;
          margin-bottom: 18px;
          border: 1px solid rgba(125, 125, 150, 0.14);
          background: rgba(125, 125, 150, 0.045);
          border-radius: 15px;
          align-items: end;
        }

        .ued-control {
          min-width: 0;
        }

        .ued-control label {
          display: block;
          margin-bottom: 7px;
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
        }

        .ued-control select {
          width: 100%;
          height: 42px;
          border-radius: 9px;
          border: 1px solid rgba(125, 125, 150, 0.2);
          background: var(--tool-bg, #ffffff);
          color: inherit;
          padding: 0 12px;
          outline: none;
          cursor: pointer;
        }

        .ued-control select:focus {
          border-color: #5b5cf0;
          box-shadow: 0 0 0 3px rgba(91, 92, 240, 0.1);
        }

        .ued-toggle {
          height: 42px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 650;
          white-space: nowrap;
          cursor: pointer;
          color: #6b7280;
        }

        .ued-toggle input {
          display: none;
        }

        .ued-switch {
          width: 34px;
          height: 20px;
          position: relative;
          border-radius: 50px;
          background: #d1d5db;
          transition: 0.2s ease;
        }

        .ued-switch:after {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          left: 2px;
          top: 2px;
          background: white;
          border-radius: 50%;
          transition: 0.2s ease;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        .ued-toggle input:checked + .ued-switch {
          background: #5b5cf0;
        }

        .ued-toggle input:checked + .ued-switch:after {
          transform: translateX(14px);
        }

        .ued-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 50px minmax(0, 1fr);
          gap: 10px;
          align-items: stretch;
        }

        .ued-panel {
          min-width: 0;
          border: 1px solid rgba(125, 125, 150, 0.18);
          border-radius: 15px;
          overflow: hidden;
          background: var(--tool-bg, #ffffff);
        }

        .ued-panel-head {
          height: 48px;
          padding: 0 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(125, 125, 150, 0.14);
        }

        .ued-panel-head > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ued-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
        }

        .ued-count {
          color: #9ca3af;
          font-size: 11px;
        }

        .ued-panel textarea {
          width: 100%;
          min-height: 285px;
          display: block;
          resize: vertical;
          border: 0;
          outline: none;
          padding: 16px;
          box-sizing: border-box;
          background: transparent;
          color: inherit;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          line-height: 1.65;
        }

        .ued-panel textarea::placeholder {
          color: #9ca3af;
        }

        .ued-panel-footer {
          min-height: 38px;
          padding: 0 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-top: 1px solid rgba(125, 125, 150, 0.12);
          color: #8b93a3;
          font-size: 11px;
        }

        .ued-panel-footer strong {
          color: #5b5cf0;
        }

        .ued-small-btn,
        .ued-copy,
        .ued-example,
        .ued-clear-history {
          border: 0;
          background: transparent;
          color: #5b5cf0;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .ued-copy {
          padding: 6px 9px;
          border-radius: 7px;
          background: #eef2ff;
        }

        .ued-copy:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .ued-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ued-swap {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(125, 125, 150, 0.18);
          background: var(--tool-bg, #ffffff);
          color: #5b5cf0;
          font-size: 19px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .ued-swap:hover {
          transform: rotate(180deg);
          border-color: #5b5cf0;
        }

        .ued-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }

        .ued-primary,
        .ued-secondary {
          min-height: 43px;
          padding: 0 17px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .ued-primary {
          border: 1px solid #5b5cf0;
          background: #5b5cf0;
          color: white;
          box-shadow: 0 5px 15px rgba(91, 92, 240, 0.2);
        }

        .ued-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(91, 92, 240, 0.28);
        }

        .ued-secondary {
          border: 1px solid rgba(125, 125, 150, 0.2);
          background: transparent;
          color: inherit;
        }

        .ued-secondary:hover {
          border-color: #5b5cf0;
          color: #5b5cf0;
        }

        .ued-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 20px;
        }

        .ued-info {
          display: flex;
          gap: 11px;
          padding: 15px;
          border-radius: 13px;
          background: rgba(125, 125, 150, 0.045);
          border: 1px solid rgba(125, 125, 150, 0.12);
        }

        .ued-info-icon {
          flex: 0 0 auto;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #eef2ff;
          color: #5b5cf0;
          font-weight: 800;
        }

        .ued-info strong {
          display: block;
          margin-bottom: 3px;
          font-size: 12px;
        }

        .ued-info p {
          margin: 0;
          color: #7b8494;
          font-size: 11px;
          line-height: 1.45;
        }

        .ued-history {
          margin-top: 20px;
          border: 1px solid rgba(125, 125, 150, 0.14);
          border-radius: 14px;
          overflow: hidden;
        }

        .ued-history-head {
          padding: 14px 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(125, 125, 150, 0.12);
        }

        .ued-history-head strong {
          display: block;
          font-size: 13px;
        }

        .ued-history-head span {
          display: block;
          margin-top: 3px;
          color: #8b93a3;
          font-size: 11px;
        }

        .ued-history-list {
          display: flex;
          flex-direction: column;
        }

        .ued-history-item {
          width: 100%;
          padding: 12px 15px;
          border: 0;
          border-bottom: 1px solid rgba(125, 125, 150, 0.09);
          background: transparent;
          color: inherit;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .ued-history-item:last-child {
          border-bottom: 0;
        }

        .ued-history-item:hover {
          background: rgba(91, 92, 240, 0.04);
        }

        .ued-history-item > div {
          min-width: 0;
        }

        .ued-history-mode {
          display: inline-block !important;
          width: auto !important;
          margin-right: 8px;
          padding: 3px 6px;
          border-radius: 5px;
          background: #eef2ff;
          color: #5b5cf0 !important;
          font-size: 9px !important;
          text-transform: uppercase;
          font-weight: 800;
        }

        .ued-history-input {
          display: inline !important;
          color: #6b7280 !important;
          font-size: 11px !important;
        }

        .ued-history-time {
          flex: 0 0 auto;
          color: #9ca3af !important;
          font-size: 10px !important;
        }

        @media (max-width: 900px) {
          .ued-controls {
            grid-template-columns: 1fr 1fr;
          }

          .ued-info-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .ued-card {
            padding: 18px;
            border-radius: 16px;
          }

          .ued-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .ued-header-actions {
            width: 100%;
          }

          .ued-mode {
            flex: 1;
          }

          .ued-controls {
            grid-template-columns: 1fr;
          }

          .ued-grid {
            grid-template-columns: 1fr;
          }

          .ued-center {
            padding: 4px 0;
          }

          .ued-swap {
            transform: rotate(90deg);
          }

          .ued-swap:hover {
            transform: rotate(270deg);
          }

          .ued-actions {
            flex-wrap: wrap;
          }

          .ued-primary,
          .ued-secondary {
            flex: 1 1 auto;
          }
        }

        @media (max-width: 480px) {
          .ued-wrapper {
            padding: 10px 0;
          }

          .ued-header h2 {
            font-size: 20px;
          }

          .ued-header p {
            font-size: 12px;
          }

          .ued-title-row {
            align-items: flex-start;
          }

          .ued-icon {
            width: 42px;
            height: 42px;
          }

          .ued-panel textarea {
            min-height: 230px;
          }

          .ued-actions {
            flex-direction: column;
          }

          .ued-primary,
          .ued-secondary {
            width: 100%;
          }

          .ued-panel-footer {
            flex-wrap: wrap;
            padding-top: 8px;
            padding-bottom: 8px;
          }
        }
      `}</style>
    </div>
  );
}