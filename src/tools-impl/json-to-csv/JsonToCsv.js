"use client";

import React, { useMemo, useState } from "react";

export default function JsonToCsv() {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [flattenObjects, setFlattenObjects] = useState(true);
  const [prettyHeaders, setPrettyHeaders] = useState(false);
  const [bom, setBom] = useState(true);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const flattenObject = (obj, prefix = "", result = {}) => {
    if (!obj || typeof obj !== "object") {
      result[prefix] = obj;
      return result;
    }

    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        flattenObject(value, newKey, result);
      } else if (Array.isArray(value)) {
        result[newKey] = value
          .map((item) =>
            typeof item === "object"
              ? JSON.stringify(item)
              : String(item)
          )
          .join(", ");
      } else {
        result[newKey] = value;
      }
    });

    return result;
  };

  const prettyLabel = (value) => {
    return value
      .replace(/\./g, " / ")
      .replace(/[_-]/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const escapeCsv = (value) => {
    if (value === null || value === undefined) return "";

    let text;

    if (typeof value === "object") {
      text = JSON.stringify(value);
    } else {
      text = String(value);
    }

    if (
      text.includes('"') ||
      text.includes("\n") ||
      text.includes("\r") ||
      text.includes(delimiter)
    ) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  };

  const convertJson = () => {
    setError("");
    setCopied(false);

    if (!input.trim()) {
      setError("Please paste JSON first.");
      setStatus("error");
      return;
    }

    try {
      const parsed = JSON.parse(input);

      let data;

      if (Array.isArray(parsed)) {
        data = parsed;
      } else if (
        parsed &&
        typeof parsed === "object"
      ) {
        data = [parsed];
      } else {
        throw new Error(
          "JSON must contain an object or an array of objects."
        );
      }

      if (!data.length) {
        throw new Error("The JSON array is empty.");
      }

      const normalized = data.map((item) => {
        if (
          flattenObjects &&
          item &&
          typeof item === "object" &&
          !Array.isArray(item)
        ) {
          return flattenObject(item);
        }

        if (
          item &&
          typeof item === "object" &&
          !Array.isArray(item)
        ) {
          return item;
        }

        return { value: item };
      });

      const allColumns = [];

      normalized.forEach((row) => {
        Object.keys(row).forEach((key) => {
          if (!allColumns.includes(key)) {
            allColumns.push(key);
          }
        });
      });

      const outputRows = normalized.map((row) =>
        allColumns.map((column) =>
          row[column] === undefined ||
          row[column] === null
            ? ""
            : row[column]
        )
      );

      const headerRow = allColumns.map((column) =>
        prettyHeaders ? prettyLabel(column) : column
      );

      const csvRows = [];

      if (includeHeaders) {
        csvRows.push(
          headerRow.map(escapeCsv).join(delimiter)
        );
      }

      outputRows.forEach((row) => {
        csvRows.push(
          row.map(escapeCsv).join(delimiter)
        );
      });

      const result = csvRows.join("\n");

      setCsv(result);
      setRows(outputRows);
      setColumns(headerRow);
      setStatus("success");
    } catch (err) {
      setCsv("");
      setRows([]);
      setColumns([]);
      setError(
        err instanceof Error
          ? err.message
          : "Invalid JSON."
      );
      setStatus("error");
    }
  };

  const sampleJson = `[
  {
    "id": 101,
    "name": "John Smith",
    "email": "john@example.com",
    "address": {
      "city": "New York",
      "country": "USA"
    },
    "tags": ["developer", "designer"]
  },
  {
    "id": 102,
    "name": "Sarah Wilson",
    "email": "sarah@example.com",
    "address": {
      "city": "London",
      "country": "UK"
    },
    "tags": ["marketing", "seo"]
  }
]`;

  const loadSample = () => {
    setInput(sampleJson);
    setError("");
    setStatus("idle");
    setCsv("");
    setRows([]);
    setColumns([]);
  };

  const clearAll = () => {
    setInput("");
    setCsv("");
    setRows([]);
    setColumns([]);
    setError("");
    setStatus("idle");
    setCopied(false);
  };

  const copyCsv = async () => {
    if (!csv) return;

    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError("Unable to copy CSV.");
    }
  };

  const downloadCsv = () => {
    if (!csv) return;

    const content = bom
      ? "\uFEFF" + csv
      : csv;

    const blob = new Blob([content], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "converted-data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const jsonStats = useMemo(() => {
    if (!input.trim()) {
      return {
        characters: 0,
        lines: 0,
      };
    }

    return {
      characters: input.length,
      lines: input.split("\n").length,
    };
  }, [input]);

  const baseInputStyle = "w-full min-w-0 bg-surface border border-line rounded-xl px-3.5 py-3 text-base font-bold text-ink outline-none focus:border-brand tabular-nums";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      {/* TOPBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-line px-5 sm:px-6 py-5 rounded-2xl shadow-card relative overflow-hidden min-w-0">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
            JSON to CSV Converter
          </h2>
          <p className="text-[11px] font-bold text-muted mt-0.5 truncate">
            Convert JSON data into clean, spreadsheet-ready CSV instantly.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <button
            type="button"
            onClick={loadSample}
            className="px-3.5 py-2.5 rounded-xl border border-line bg-paper text-brand text-xs font-black uppercase tracking-wider hover:bg-surface transition-all truncate"
          >
            Load Sample
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-3.5 py-2.5 rounded-xl border border-[#fb7185]/30 bg-[#fb7185]/10 text-[#fb7185] text-xs font-black uppercase tracking-wider hover:bg-[#fb7185]/20 transition-all truncate"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start min-w-0">
        
        {/* INPUT PANEL */}
        <section className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden flex flex-col min-w-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-paper min-w-0">
            <div className="min-w-0 truncate">
              <strong className="text-xs font-black text-ink uppercase tracking-wider truncate block">JSON Input</strong>
              <span className="text-[10px] font-bold text-muted truncate block">{jsonStats.characters.toLocaleString()} characters</span>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setStatus("idle");
              setError("");
            }}
            placeholder={`Paste your JSON here...\n\nExample:\n[\n  {\n    "name": "John",\n    "age": 25\n  }\n]`}
            spellCheck={false}
            className="w-full h-72 sm:h-80 bg-[#0d1117] text-[#dbeafe] p-4 font-mono text-xs outline-none resize-y border-0 box-border leading-relaxed tabular-nums"
          />

          {error && (
            <div className="m-4 p-3 rounded-xl bg-[#fb7185]/10 border border-[#fb7185]/30 text-[#fb7185] flex items-start gap-3 min-w-0">
              <span className="flex w-5 h-5 items-center justify-center rounded-full bg-[#fb7185] text-white text-xs font-extrabold shrink-0">!</span>
              <div className="min-w-0 truncate">
                <strong className="text-xs font-black block truncate">Invalid JSON</strong>
                <p className="text-[11px] font-medium mt-0.5 truncate">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-line bg-line gap-px">
            <label className="flex gap-2.5 p-3.5 bg-surface cursor-pointer min-w-0">
              <input
                type="checkbox"
                checked={flattenObjects}
                onChange={(e) => setFlattenObjects(e.target.checked)}
                className="w-4 h-4 accent-brand rounded border-line mt-0.5 shrink-0"
              />
              <span className="flex flex-col gap-0.5 min-w-0 truncate">
                <strong className="text-xs font-black text-ink truncate">Flatten nested objects</strong>
                <small className="text-[10px] font-bold text-muted truncate">Convert fields into columns like address.city</small>
              </span>
            </label>

            <label className="flex gap-2.5 p-3.5 bg-surface cursor-pointer min-w-0">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="w-4 h-4 accent-brand rounded border-line mt-0.5 shrink-0"
              />
              <span className="flex flex-col gap-0.5 min-w-0 truncate">
                <strong className="text-xs font-black text-ink truncate">Include headers</strong>
                <small className="text-[10px] font-bold text-muted truncate">Add column names to the first row</small>
              </span>
            </label>

            <label className="flex gap-2.5 p-3.5 bg-surface cursor-pointer min-w-0">
              <input
                type="checkbox"
                checked={prettyHeaders}
                onChange={(e) => setPrettyHeaders(e.target.checked)}
                className="w-4 h-4 accent-brand rounded border-line mt-0.5 shrink-0"
              />
              <span className="flex flex-col gap-0.5 min-w-0 truncate">
                <strong className="text-xs font-black text-ink truncate">Human-friendly headers</strong>
                <small className="text-[10px] font-bold text-muted truncate">Turn technical keys into readable labels</small>
              </span>
            </label>

            <label className="flex gap-2.5 p-3.5 bg-surface cursor-pointer min-w-0">
              <input
                type="checkbox"
                checked={bom}
                onChange={(e) => setBom(e.target.checked)}
                className="w-4 h-4 accent-brand rounded border-line mt-0.5 shrink-0"
              />
              <span className="flex flex-col gap-0.5 min-w-0 truncate">
                <strong className="text-xs font-black text-ink truncate">Excel compatibility</strong>
                <small className="text-[10px] font-bold text-muted truncate">Add UTF-8 BOM for spreadsheet support</small>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 border-t border-line bg-paper min-w-0">
            <label className="text-xs font-black text-muted uppercase tracking-wider truncate">CSV delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="bg-surface border border-line rounded-xl px-3 py-2 text-xs font-bold text-ink outline-none cursor-pointer"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value={"\t"}>Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          <div className="p-4 border-t border-line bg-surface">
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-brand text-surface hover:opacity-95 text-xs font-black uppercase tracking-widest transition-opacity"
              onClick={convertJson}
            >
              Convert to CSV
            </button>
          </div>
        </section>

        {/* PREVIEW PANEL */}
        <section className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden flex flex-col min-w-0 min-h-[480px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-paper min-w-0">
            <div className="flex items-center gap-2.5 min-w-0 truncate">
              <strong className="text-xs font-black text-ink uppercase tracking-wider truncate">CSV Preview</strong>
              {status === "success" && (
                <span className="text-[10px] font-black text-teal truncate">✓ Converted successfully</span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 min-w-0">
              <button
                type="button"
                onClick={copyCsv}
                disabled={!csv}
                className="px-3 py-1.5 rounded-lg border border-line bg-surface text-ink text-[10px] font-black uppercase tracking-wider hover:bg-paper transition-all truncate"
              >
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                type="button"
                onClick={downloadCsv}
                disabled={!csv}
                className="px-3 py-1.5 rounded-lg bg-brand text-surface text-[10px] font-black uppercase tracking-wider hover:opacity-95 transition-opacity truncate"
              >
                Download CSV
              </button>
            </div>
          </div>

          {!csv ? (
            <div className="flex-1 flex items-center justify-center flex-col text-center p-8 text-muted min-w-0">
              <div className="w-12 h-12 flex items-center justify-center mb-3 rounded-2xl bg-brand/10 text-brand text-xl font-black">⇄</div>
              <h3 className="text-sm font-black text-ink mb-1 truncate">Your CSV will appear here</h3>
              <p className="max-w-[260px] text-xs font-medium text-muted leading-relaxed">
                Paste JSON on the left and click <strong>Convert to CSV</strong>.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
              <div className="overflow-auto max-h-[450px] min-w-0">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      {columns.map((column, index) => (
                        <th key={`${column}-${index}`} className="sticky top-0 z-10 bg-paper text-ink px-3 py-2.5 border-b border-r border-line font-black text-left whitespace-nowrap truncate max-w-[200px]">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 100).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((value, columnIndex) => (
                          <td key={`${rowIndex}-${columnIndex}`} className="px-3 py-2.5 border-b border-r border-line text-muted whitespace-nowrap truncate max-w-[200px]">
                            {value === null || value === undefined
                              ? ""
                              : typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length > 100 && (
                <div className="p-3 text-[10px] font-bold text-muted bg-paper border-t border-line truncate">
                  Showing first 100 rows in preview. Your downloaded CSV contains all {rows.length} rows.
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}