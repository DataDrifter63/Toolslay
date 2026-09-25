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
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* CARD CONTAINER */}
      <div className="bg-surface border border-line p-5 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0">
        
        {/* TOPBAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
              Regex Tester
            </h2>
            <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
              Test, debug and analyze regular expressions instantly.
            </p>
          </div>

          <button
            type="button"
            onClick={clearAll}
            className="px-4 py-2.5 rounded-xl border border-line bg-paper text-ink text-xs font-black uppercase tracking-wider hover:bg-surface transition-all shrink-0"
          >
            Reset
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-w-0">
          
          {/* LEFT PANEL: INPUTS */}
          <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest block truncate">Regular Expression</label>

            <div className="flex items-center bg-surface border border-line rounded-xl overflow-hidden focus-within:border-brand min-w-0">
              <span className="px-3.5 text-muted font-mono font-bold shrink-0">/</span>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. ^[A-Za-z0-9._%+-]+$"
                className="w-full min-w-0 bg-transparent py-3 font-mono text-xs text-ink outline-none"
              />
              <span className="px-3.5 text-muted font-mono font-bold shrink-0">/</span>
              <input
                className="max-w-[55px] bg-paper border-l border-line px-2 font-mono text-xs text-ink text-center outline-none shrink-0"
                value={flags}
                onChange={(e) =>
                  setFlags(e.target.value.replace(/[^dgimsuvy]/g, ""))
                }
                placeholder="g"
              />
            </div>

            {/* FLAGS */}
            <div className="flex flex-wrap gap-2 min-w-0">
              {[
                ["g", "Global"],
                ["i", "Ignore Case"],
                ["m", "Multiline"],
                ["s", "Dot All"],
                ["u", "Unicode"],
                ["y", "Sticky"],
              ].map(([flag, label]) => (
                <button
                  type="button"
                  key={flag}
                  onClick={() => {
                    setFlags((current) =>
                      current.includes(flag)
                        ? current.replace(flag, "")
                        : current + flag
                    );
                  }}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all shrink-0 ${flags.includes(flag) ? "border-brand bg-brand text-surface shadow-sm" : "border-line bg-surface text-muted hover:text-ink"}`}
                >
                  {flag} <small className="opacity-75 font-bold">({label})</small>
                </button>
              ))}
            </div>

            <label className="text-[10px] font-black text-muted uppercase tracking-widest block pt-2 truncate">Test String</label>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the text you want to test here..."
              rows={10}
              className="w-full min-w-0 bg-surface border border-line rounded-xl p-4 font-mono text-xs text-ink outline-none focus:border-brand resize-y leading-relaxed"
            />

            {result.error && (
              <div className="p-3.5 rounded-xl bg-[#fb7185]/10 border border-[#fb7185]/30 text-[#fb7185] space-y-1 min-w-0">
                <strong className="text-xs font-black block truncate">Invalid Regex</strong>
                <span className="text-[11px] font-medium block truncate">{result.error}</span>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: RESULTS */}
          <div className="bg-paper border border-line p-5 rounded-2xl space-y-4 min-w-0 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-3 min-w-0">
              <div className="min-w-0 truncate">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest block truncate">Live Results</label>
                <div className="text-xs font-black text-ink mt-0.5 truncate">
                  {result.count} match{result.count !== 1 ? "es" : ""}
                </div>
              </div>

              <button
                type="button"
                onClick={copyMatches}
                disabled={!result.matches.length}
                className="px-3.5 py-2 rounded-xl border border-line bg-surface text-ink text-[10px] font-black uppercase tracking-wider hover:bg-paper transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                Copy Matches
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[450px] space-y-2.5 min-w-0">
              {!result.matches.length ? (
                <div className="h-full min-h-[300px] flex flex-col justify-center items-center text-center p-6 text-muted min-w-0">
                  <div className="text-3xl mb-2 font-black text-brand/40">⌁</div>
                  <strong className="text-xs font-black text-ink mb-1 truncate">No matches yet</strong>
                  <span className="text-[11px] font-medium max-w-[240px] leading-relaxed">
                    Enter a regular expression and test text to see results.
                  </span>
                </div>
              ) : (
                result.matches.map((match, index) => (
                  <div className="flex gap-3 p-3.5 rounded-xl bg-surface border border-line min-w-0" key={`${match.index}-${index}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-brand/15 text-brand text-xs font-black shrink-0">
                      {index + 1}
                    </div>

                    <div className="min-w-0 truncate">
                      <strong className="text-xs font-mono font-bold text-ink block truncate">{match.value}</strong>
                      <span className="text-[10px] font-medium text-muted block mt-0.5 truncate">
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
    </div>
  );
}