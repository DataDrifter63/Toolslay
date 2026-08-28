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

  return (
    <div className="json-csv-tool">
      <div className="tool-topbar">
        <div>
          <h2>JSON to CSV Converter</h2>
          <p>
            Convert JSON data into clean, spreadsheet-ready CSV
            instantly.
          </p>
        </div>

        <div className="top-actions">
          <button
            type="button"
            onClick={loadSample}
            className="secondary-btn"
          >
            Load Sample
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="secondary-btn"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="workspace">
        <section className="panel">
          <div className="panel-header">
            <div>
              <strong>JSON Input</strong>
              <span>
                {jsonStats.characters.toLocaleString()} characters
              </span>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setStatus("idle");
              setError("");
            }}
            placeholder={`Paste your JSON here...

Example:
[
  {
    "name": "John",
    "age": 25
  }
]`}
            spellCheck={false}
          />

          {error && (
            <div className="error-box">
              <span>!</span>
              <div>
                <strong>Invalid JSON</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="options">
            <label className="option">
              <input
                type="checkbox"
                checked={flattenObjects}
                onChange={(e) =>
                  setFlattenObjects(e.target.checked)
                }
              />
              <span>
                <strong>Flatten nested objects</strong>
                <small>
                  Convert nested fields into columns like
                  address.city
                </small>
              </span>
            </label>

            <label className="option">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) =>
                  setIncludeHeaders(e.target.checked)
                }
              />
              <span>
                <strong>Include headers</strong>
                <small>
                  Add column names to the first row
                </small>
              </span>
            </label>

            <label className="option">
              <input
                type="checkbox"
                checked={prettyHeaders}
                onChange={(e) =>
                  setPrettyHeaders(e.target.checked)
                }
              />
              <span>
                <strong>Human-friendly headers</strong>
                <small>
                  Turn technical keys into readable labels
                </small>
              </span>
            </label>

            <label className="option">
              <input
                type="checkbox"
                checked={bom}
                onChange={(e) =>
                  setBom(e.target.checked)
                }
              />
              <span>
                <strong>Excel compatibility</strong>
                <small>
                  Add UTF-8 BOM for better spreadsheet support
                </small>
              </span>
            </label>
          </div>

          <div className="delimiter-row">
            <label>CSV delimiter</label>

            <select
              value={delimiter}
              onChange={(e) =>
                setDelimiter(e.target.value)
              }
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value={"\t"}>Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          <button
            type="button"
            className="convert-btn"
            onClick={convertJson}
          >
            Convert to CSV
          </button>
        </section>

        <section className="panel preview-panel">
          <div className="panel-header">
            <div>
              <strong>CSV Preview</strong>

              {status === "success" && (
                <span className="success-label">
                  ✓ Converted successfully
                </span>
              )}
            </div>

            <div className="result-actions">
              <button
                type="button"
                onClick={copyCsv}
                disabled={!csv}
                className="small-btn"
              >
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                type="button"
                onClick={downloadCsv}
                disabled={!csv}
                className="small-btn primary"
              >
                Download CSV
              </button>
            </div>
          </div>

          {!csv ? (
            <div className="empty-state">
              <div className="empty-icon">⇄</div>
              <h3>Your CSV will appear here</h3>
              <p>
                Paste JSON on the left and click
                <strong> Convert to CSV</strong>.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {columns.map((column, index) => (
                      <th key={`${column}-${index}`}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.slice(0, 100).map(
                    (row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((value, columnIndex) => (
                          <td
                            key={`${rowIndex}-${columnIndex}`}
                          >
                            {value === null ||
                            value === undefined
                              ? ""
                              : typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {rows.length > 100 && (
                <div className="table-note">
                  Showing first 100 rows in preview.
                  Your downloaded CSV contains all{" "}
                  {rows.length} rows.
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .json-csv-tool {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px;
          border: 1px solid var(--tool-border, #e2e8f0);
          border-radius: 20px;
          background: var(--tool-bg, #ffffff);
          color: var(--tool-text, #0f172a);
          box-sizing: border-box;
        }

        .tool-topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .tool-topbar h2 {
          margin: 0 0 6px;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 750;
        }

        .tool-topbar p {
          margin: 0;
          color: var(--tool-muted, #64748b);
          font-size: 14px;
        }

        .top-actions,
        .result-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        button,
        select,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .secondary-btn,
        .small-btn {
          border: 1px solid var(--tool-border, #dbe3ed);
          background: var(--tool-control, #f8fafc);
          color: var(--tool-text, #0f172a);
          border-radius: 9px;
          padding: 9px 13px;
          font-size: 13px;
          font-weight: 650;
        }

        .small-btn.primary,
        .convert-btn {
          border: 0;
          background: #4f46e5;
          color: white;
        }

        .workspace {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 18px;
        }

        .panel {
          min-width: 0;
          border: 1px solid var(--tool-border, #e2e8f0);
          border-radius: 15px;
          background: var(--tool-panel, #ffffff);
          overflow: hidden;
        }

        .panel-header {
          min-height: 56px;
          padding: 12px 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid var(--tool-border, #e2e8f0);
        }

        .panel-header > div:first-child {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .panel-header strong {
          font-size: 14px;
        }

        .panel-header span {
          color: var(--tool-muted, #64748b);
          font-size: 11px;
        }

        .success-label {
          color: #16a34a !important;
          font-weight: 650;
        }

        textarea {
          display: block;
          width: 100%;
          min-height: 330px;
          resize: vertical;
          padding: 16px;
          border: 0;
          outline: none;
          background: var(--tool-editor, #f8fafc);
          color: var(--tool-text, #0f172a);
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco,
            Consolas, "Liberation Mono", monospace;
          font-size: 13px;
          line-height: 1.65;
          box-sizing: border-box;
        }

        textarea::placeholder {
          color: #94a3b8;
        }

        .options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          border-top: 1px solid var(--tool-border, #e2e8f0);
          background: var(--tool-border, #e2e8f0);
        }

        .option {
          display: flex;
          gap: 9px;
          padding: 12px;
          background: var(--tool-panel, #ffffff);
          cursor: pointer;
        }

        .option input {
          margin-top: 3px;
          accent-color: #4f46e5;
        }

        .option span {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .option strong {
          font-size: 12px;
        }

        .option small {
          color: var(--tool-muted, #64748b);
          font-size: 10px;
          line-height: 1.35;
        }

        .delimiter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 15px;
          border-top: 1px solid var(--tool-border, #e2e8f0);
        }

        .delimiter-row label {
          font-size: 12px;
          font-weight: 650;
        }

        select {
          border: 1px solid var(--tool-border, #dbe3ed);
          border-radius: 8px;
          padding: 7px 10px;
          background: var(--tool-control, #f8fafc);
          color: var(--tool-text, #0f172a);
          outline: none;
        }

        .convert-btn {
          width: calc(100% - 30px);
          margin: 0 15px 15px;
          padding: 12px 16px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
        }

        .error-box {
          display: flex;
          gap: 10px;
          margin: 12px;
          padding: 11px 12px;
          border: 1px solid #fecaca;
          border-radius: 9px;
          background: #fef2f2;
          color: #991b1b;
        }

        .error-box > span {
          display: flex;
          width: 20px;
          height: 20px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #dc2626;
          color: white;
          font-size: 12px;
          font-weight: 800;
          flex: 0 0 auto;
        }

        .error-box strong {
          font-size: 12px;
        }

        .error-box p {
          margin: 3px 0 0;
          font-size: 11px;
          line-height: 1.45;
        }

        .empty-state {
          min-height: 430px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          padding: 30px;
          color: var(--tool-muted, #64748b);
          box-sizing: border-box;
        }

        .empty-icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          border-radius: 14px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 24px;
          font-weight: 800;
        }

        .empty-state h3 {
          margin: 0 0 7px;
          color: var(--tool-text, #0f172a);
          font-size: 15px;
        }

        .empty-state p {
          max-width: 330px;
          margin: 0;
          font-size: 12px;
          line-height: 1.6;
        }

        .table-wrap {
          overflow: auto;
          max-height: 500px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        th,
        td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--tool-border, #e2e8f0);
          border-right: 1px solid var(--tool-border, #e2e8f0);
          text-align: left;
          white-space: nowrap;
          max-width: 240px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        th {
          position: sticky;
          top: 0;
          z-index: 1;
          background: var(--tool-header, #f8fafc);
          color: var(--tool-text, #0f172a);
          font-weight: 750;
        }

        td {
          color: var(--tool-muted, #475569);
        }

        .table-note {
          padding: 10px 12px;
          font-size: 11px;
          color: var(--tool-muted, #64748b);
          background: var(--tool-header, #f8fafc);
        }

        @media (max-width: 900px) {
          .workspace {
            grid-template-columns: 1fr;
          }

          .preview-panel {
            min-height: 400px;
          }
        }

        @media (max-width: 640px) {
          .json-csv-tool {
            padding: 16px;
            border-radius: 14px;
          }

          .tool-topbar {
            flex-direction: column;
          }

          .top-actions {
            width: 100%;
          }

          .top-actions button {
            flex: 1;
          }

          .panel-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .result-actions {
            width: 100%;
          }

          .result-actions button {
            flex: 1;
          }

          .options {
            grid-template-columns: 1fr;
          }

          textarea {
            min-height: 280px;
          }

          .empty-state {
            min-height: 300px;
          }
        }

        @media (prefers-color-scheme: dark) {
          .json-csv-tool {
            --tool-bg: #0f172a;
            --tool-panel: #111827;
            --tool-control: #172033;
            --tool-editor: #0b1220;
            --tool-header: #172033;
            --tool-border: #263449;
            --tool-text: #f1f5f9;
            --tool-muted: #94a3b8;
          }

          .empty-icon {
            background: #1e1b4b;
          }

          .error-box {
            background: #2a1115;
            border-color: #5f1d25;
            color: #fecaca;
          }
        }
      `}</style>
    </div>
  );
}