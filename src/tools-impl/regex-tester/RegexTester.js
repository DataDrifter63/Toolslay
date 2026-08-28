"use client";

import React, { useMemo, useState } from "react";

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");

  const result = useMemo(() => {
    if (!pattern) {
      return {
        error: "",
        matches: [],
        count: 0,
      };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [];

      if (flags.includes("g")) {
        let match;
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1),
          });

          if (match[0] === "") regex.lastIndex++;
        }
      } else {
        const match = regex.exec(text);

        if (match) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      return {
        error: "",
        matches,
        count: matches.length,
      };
    } catch (error) {
      return {
        error: error.message,
        matches: [],
        count: 0,
      };
    }
  }, [pattern, flags, text]);

  const clearAll = () => {
    setPattern("");
    setFlags("g");
    setText("");
  };

  const copyMatches = async () => {
    if (!result.matches.length) return;

    const output = result.matches
      .map((item, index) => `${index + 1}. ${item.value}`)
      .join("\n");

    await navigator.clipboard.writeText(output);
  };

  return (
    <div className="regex-tool">
      <div className="regex-card">
        <div className="regex-top">
          <div>
            <h2>Regex Tester</h2>
            <p>Test, debug and analyze regular expressions instantly.</p>
          </div>

          <button onClick={clearAll} className="regex-clear">
            Reset
          </button>
        </div>

        <div className="regex-grid">
          <div className="regex-panel">
            <label>Regular Expression</label>

            <div className="regex-input-row">
              <span>/</span>

              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. ^[A-Za-z0-9._%+-]+$"
              />

              <span>/</span>

              <input
                className="flags-input"
                value={flags}
                onChange={(e) =>
                  setFlags(e.target.value.replace(/[^dgimsuvy]/g, ""))
                }
                placeholder="g"
              />
            </div>

            <div className="regex-flags">
              {[
                ["g", "Global"],
                ["i", "Ignore Case"],
                ["m", "Multiline"],
                ["s", "Dot All"],
                ["u", "Unicode"],
                ["y", "Sticky"],
              ].map(([flag, label]) => (
                <button
                  key={flag}
                  onClick={() => {
                    setFlags((current) =>
                      current.includes(flag)
                        ? current.replace(flag, "")
                        : current + flag
                    );
                  }}
                  className={flags.includes(flag) ? "active" : ""}
                >
                  {flag} <small>{label}</small>
                </button>
              ))}
            </div>

            <label>Test String</label>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the text you want to test here..."
              rows={12}
            />

            {result.error && (
              <div className="regex-error">
                <strong>Invalid Regex</strong>
                <span>{result.error}</span>
              </div>
            )}
          </div>

          <div className="regex-panel">
            <div className="result-header">
              <div>
                <label>Live Results</label>
                <div className="match-count">
                  {result.count} match{result.count !== 1 ? "es" : ""}
                </div>
              </div>

              <button
                onClick={copyMatches}
                disabled={!result.matches.length}
                className="copy-btn"
              >
                Copy Matches
              </button>
            </div>

            <div className="matches-box">
              {!result.matches.length ? (
                <div className="empty-result">
                  <div className="empty-icon">⌁</div>
                  <strong>No matches yet</strong>
                  <span>
                    Enter a regular expression and test text to see results.
                  </span>
                </div>
              ) : (
                result.matches.map((match, index) => (
                  <div className="match-item" key={`${match.index}-${index}`}>
                    <div className="match-number">{index + 1}</div>

                    <div className="match-content">
                      <strong>{match.value}</strong>

                      <span>
                        Position: {match.index}
                        {match.groups?.length
                          ? ` • Groups: ${match.groups.join(", ")}`
                          : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .regex-tool {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px;
        }

        .regex-card {
          border: 1px solid rgba(127, 127, 127, 0.2);
          border-radius: 22px;
          padding: 28px;
          background: var(--background, #fff);
          color: var(--foreground, #111);
        }

        .regex-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .regex-top h2 {
          margin: 0 0 6px;
          font-size: 24px;
        }

        .regex-top p {
          margin: 0;
          opacity: 0.65;
          font-size: 14px;
        }

        .regex-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .regex-panel {
          border: 1px solid rgba(127, 127, 127, 0.2);
          border-radius: 16px;
          padding: 20px;
        }

        label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 9px;
        }

        .regex-input-row {
          display: flex;
          align-items: center;
          border: 1px solid rgba(127, 127, 127, 0.3);
          border-radius: 10px;
          overflow: hidden;
        }

        .regex-input-row span {
          padding: 0 10px;
          opacity: 0.5;
        }

        input,
        textarea {
          width: 100%;
          border: 0;
          outline: none;
          background: transparent;
          color: inherit;
          font: inherit;
        }

        input {
          height: 44px;
        }

        textarea {
          resize: vertical;
          min-height: 250px;
          border: 1px solid rgba(127, 127, 127, 0.3);
          border-radius: 10px;
          padding: 14px;
        }

        .flags-input {
          max-width: 55px;
        }

        .regex-flags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin: 12px 0 22px;
        }

        .regex-flags button,
        .regex-clear,
        .copy-btn {
          border: 1px solid rgba(127, 127, 127, 0.25);
          background: transparent;
          color: inherit;
          border-radius: 8px;
          padding: 8px 11px;
          cursor: pointer;
        }

        .regex-flags button.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        .regex-flags small {
          opacity: 0.65;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .match-count {
          font-size: 13px;
          opacity: 0.6;
        }

        .copy-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .matches-box {
          min-height: 330px;
          max-height: 500px;
          overflow-y: auto;
          border-radius: 12px;
          background: rgba(127, 127, 127, 0.06);
          padding: 10px;
        }

        .match-item {
          display: flex;
          gap: 12px;
          padding: 13px;
          border-bottom: 1px solid rgba(127, 127, 127, 0.15);
        }

        .match-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(99, 102, 241, 0.12);
          color: #6366f1;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .match-content {
          min-width: 0;
        }

        .match-content strong {
          display: block;
          word-break: break-word;
        }

        .match-content span {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          opacity: 0.55;
        }

        .empty-result {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          opacity: 0.6;
          gap: 7px;
        }

        .empty-icon {
          font-size: 38px;
          margin-bottom: 5px;
        }

        .regex-error {
          margin-top: 12px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(220, 38, 38, 0.08);
          color: #dc2626;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .regex-error span {
          font-size: 13px;
        }

        @media (max-width: 800px) {
          .regex-tool {
            padding: 12px;
          }

          .regex-card {
            padding: 16px;
          }

          .regex-grid {
            grid-template-columns: 1fr;
          }

          .regex-top {
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .regex-top {
            flex-direction: column;
          }

          .regex-clear {
            width: 100%;
          }

          .regex-panel {
            padding: 14px;
          }
        }
      `}</style>
    </div>
  );
}