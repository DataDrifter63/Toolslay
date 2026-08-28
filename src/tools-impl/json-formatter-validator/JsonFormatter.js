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
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return 1;
  }

  if (Array.isArray(value)) {
    return (
      1 +
      value.reduce(
        (sum, item) =>
          sum + countNodes(item),
        0
      )
    );
  }

  return (
    1 +
    Object.values(value).reduce(
      (sum, item) =>
        sum + countNodes(item),
      0
    )
  );
}

function getDepth(value) {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return 0;
  }

  const values = Array.isArray(value)
    ? value
    : Object.values(value);

  if (!values.length) return 1;

  return (
    1 +
    Math.max(
      ...values.map(getDepth)
    )
  );
}

function countKeys(value) {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return 0;
  }

  if (Array.isArray(value)) {
    return value.reduce(
      (sum, item) =>
        sum + countKeys(item),
      0
    );
  }

  return (
    Object.keys(value).length +
    Object.values(value).reduce(
      (sum, item) =>
        sum + countKeys(item),
      0
    )
  );
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

    const values = Array.isArray(item)
      ? item
      : Object.values(item);

    values.forEach(walk);
  }

  walk(value);
  return count;
}

function sortDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.keys(value)
      .sort((a, b) =>
        a.localeCompare(b)
      )
      .reduce((obj, key) => {
        obj[key] = sortDeep(
          value[key]
        );
        return obj;
      }, {});
  }

  return value;
}

function removeEmptyValues(value) {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item) =>
          item !== null &&
          item !== ""
      )
      .map(removeEmptyValues);
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const result = {};

    Object.entries(value).forEach(
      ([key, item]) => {
        if (
          item === null ||
          item === ""
        ) {
          return;
        }

        result[key] =
          removeEmptyValues(item);
      }
    );

    return result;
  }

  return value;
}

function findDuplicateKeys(text) {
  const duplicates = new Set();
  const stack = [];

  const regex =
    /"((?:\\.|[^"\\])*)"\s*:/g;

  let match;

  while (
    (match = regex.exec(text)) !== null
  ) {
    const before =
      text.slice(0, match.index);

    const opens =
      (before.match(/{/g) || []).length;

    const closes =
      (before.match(/}/g) || []).length;

    const depth = opens - closes;

    const key = match[1];

    stack[depth] =
      stack[depth] || new Set();

    if (
      stack[depth].has(key)
    ) {
      duplicates.add(key);
    }

    stack[depth].add(key);
  }

  return [...duplicates];
}

function getErrorInfo(text, error) {
  const message =
    error?.message || "Invalid JSON";

  const match =
    message.match(
      /position\s+(\d+)/
    );

  if (!match) {
    return {
      message,
      position: null,
      line: null,
      column: null,
      snippet: "",
    };
  }

  const position =
    Number(match[1]);

  const before =
    text.slice(0, position);

  const line =
    before.split("\n").length;

  const lastNewLine =
    before.lastIndexOf("\n");

  const column =
    position -
    lastNewLine;

  const start =
    Math.max(0, position - 45);

  const end =
    Math.min(
      text.length,
      position + 45
    );

  return {
    message,
    position,
    line,
    column,
    snippet: text.slice(start, end),
  };
}

function downloadText(
  content,
  filename
) {
  const blob = new Blob(
    [content],
    {
      type: "application/json;charset=utf-8",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function TreeNode({
  name,
  value,
  depth = 0,
}) {
  const [open, setOpen] =
    useState(depth < 2);

  const type = getType(value);

  const isObject =
    value !== null &&
    typeof value === "object";

  const entries =
    Array.isArray(value)
      ? value.map(
          (item, index) => [
            String(index),
            item,
          ]
        )
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
        className="jf-tree-row"
        style={{
          paddingLeft:
            depth * 18 + 8,
        }}
      >
        <span className="jf-tree-key">
          {name}
        </span>

        <span
          className={`jf-type jf-${type}`}
        >
          {display}
        </span>
      </div>
    );
  }

  return (
    <div>
      <button
        className="jf-tree-row jf-tree-button"
        style={{
          paddingLeft:
            depth * 18 + 8,
        }}
        onClick={() =>
          setOpen(!open)
        }
      >
        <span className="jf-arrow">
          {open ? "⌄" : "›"}
        </span>

        <span className="jf-tree-key">
          {name}
        </span>

        <span className="jf-container-type">
          {Array.isArray(value)
            ? `Array · ${value.length}`
            : `Object · ${entries.length}`}
        </span>
      </button>

      {open &&
        entries.map(
          ([key, child]) => (
            <TreeNode
              key={key}
              name={key}
              value={child}
              depth={depth + 1}
            />
          )
        )}
    </div>
  );
}

export default function JsonFormatter() {
  const [input, setInput] =
    useState(SAMPLE_JSON);

  const [indent, setIndent] =
    useState(2);

  const [sortKeys, setSortKeys] =
    useState(false);

  const [
    removeEmpty,
    setRemoveEmpty,
  ] = useState(false);

  const [tab, setTab] =
    useState("format");

  const [copied, setCopied] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [queryResult, setQueryResult] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const parsed = useMemo(() => {
    try {
      let value =
        JSON.parse(input);

      if (removeEmpty) {
        value =
          removeEmptyValues(value);
      }

      if (sortKeys) {
        value = sortDeep(value);
      }

      return {
        valid: true,
        value,
        error: null,
      };
    } catch (error) {
      return {
        valid: false,
        value: null,
        error: getErrorInfo(
          input,
          error
        ),
      };
    }
  }, [
    input,
    sortKeys,
    removeEmpty,
  ]);

  const formatted = useMemo(() => {
    if (!parsed.valid) {
      return input;
    }

    return JSON.stringify(
      parsed.value,
      null,
      indent
    );
  }, [
    parsed,
    indent,
    input,
  ]);

  const minified = useMemo(() => {
    if (!parsed.valid) {
      return input;
    }

    return JSON.stringify(
      parsed.value
    );
  }, [
    parsed,
    input,
  ]);

  const stats = useMemo(() => {
    if (!parsed.valid) {
      return null;
    }

    return {
      nodes: countNodes(
        parsed.value
      ),
      keys: countKeys(
        parsed.value
      ),
      depth: getDepth(
        parsed.value
      ),
      empty: findEmptyValues(
        parsed.value
      ),
      type: getType(
        parsed.value
      ),
      size: new Blob([
        JSON.stringify(
          parsed.value
        ),
      ]).size,
    };
  }, [parsed]);

  const duplicates = useMemo(
    () =>
      findDuplicateKeys(input),
    [input]
  );

  function handleFormat() {
    if (!parsed.valid) {
      setTab("validate");
      return;
    }

    setInput(formatted);

    setHistory((old) => [
      input,
      ...old.filter(
        (item) => item !== input
      ),
    ].slice(0, 5));
  }

  async function copy(value) {
    try {
      await navigator.clipboard.writeText(
        value
      );
    } catch {
      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value = value;

      document.body.appendChild(
        textarea
      );

      textarea.select();

      document.execCommand(
        "copy"
      );

      textarea.remove();
    }

    setCopied(true);

    setTimeout(
      () => setCopied(false),
      1500
    );
  }

  function runQuery() {
    if (!parsed.valid) {
      setQueryResult({
        found: false,
        error:
          "Fix the JSON before using Path Finder.",
      });

      return;
    }

    const path = query
      .trim()
      .replace(
        /^\$\.?/,
        ""
      );

    if (!path) {
      setQueryResult({
        found: true,
        value: parsed.value,
      });

      return;
    }

    const parts =
      path
        .split(".")
        .filter(Boolean);

    let current =
      parsed.value;

    for (const part of parts) {
      if (
        current === null ||
        current === undefined
      ) {
        current = undefined;
        break;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          current,
          part
        )
      ) {
        current =
          current[part];
      } else {
        current = undefined;
        break;
      }
    }

    setQueryResult({
      found:
        current !== undefined,
      value: current,
    });
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

  const currentOutput =
    tab === "minify"
      ? minified
      : formatted;

  return (
    <div className="json-tool">
      <div className="jf-shell">

        {/* TOP BAR */}

        <div className="jf-top">

          <div>
            <div className="jf-eyebrow">
              DEVELOPER TOOL
            </div>

            <h1>
              JSON Formatter
              <span>
                {" "} & Validator
              </span>
            </h1>

            <p>
              Format, validate, inspect,
              clean and explore JSON
              without sending your data
              anywhere.
            </p>
          </div>

          <div className="jf-actions">

            <button
              onClick={loadSample}
              className="jf-soft"
            >
              Load Sample
            </button>

            <button
              onClick={clearAll}
              className="jf-danger"
            >
              Clear
            </button>

          </div>

        </div>

        {/* STATUS */}

        <div
          className={
            parsed.valid
              ? "jf-status valid"
              : "jf-status invalid"
          }
        >
          <div>
            <b>
              {parsed.valid
                ? "✓ Valid JSON"
                : "× Invalid JSON"}
            </b>

            <span>
              {parsed.valid
                ? "Your JSON can be safely parsed."
                : parsed.error?.message ||
                  "JSON parsing failed."}
            </span>
          </div>

          {parsed.valid && (
            <div className="jf-status-meta">
              {stats.nodes} nodes
              {" · "}
              depth {stats.depth}
              {" · "}
              {formatBytes(
                stats.size
              )}
            </div>
          )}

        </div>

        {/* EDITOR */}

        <div className="jf-editor-grid">

          <section className="jf-card">

            <div className="jf-card-head">

              <div>
                <b>
                  JSON Input
                </b>

                <small>
                  Paste JSON here
                </small>
              </div>

              <div className="jf-mini-actions">

                <button
                  onClick={() =>
                    copy(input)
                  }
                >
                  {copied
                    ? "Copied"
                    : "Copy"}
                </button>

              </div>

            </div>

            <textarea
              className="jf-editor"
              value={input}
              spellCheck={false}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              placeholder='{"name":"John","active":true}'
            />

            <div className="jf-editor-footer">

              <span>
                {input.length} chars
              </span>

              <span>
                {input
                  ? input.split(/\s+/)
                      .filter(Boolean)
                      .length
                  : 0}{" "}
                tokens*
              </span>

              <span>
                UTF-8
              </span>

            </div>

          </section>

          {/* OUTPUT */}

          <section className="jf-card">

            <div className="jf-card-head">

              <div>
                <b>
                  Output
                </b>

                <small>
                  Clean JSON result
                </small>
              </div>

              <div className="jf-mini-actions">

                <button
                  onClick={() =>
                    copy(currentOutput)
                  }
                >
                  Copy
                </button>

                <button
                  onClick={() =>
                    downloadText(
                      currentOutput,
                      "formatted.json"
                    )
                  }
                >
                  Download
                </button>

              </div>

            </div>

            <pre className="jf-output">
              {currentOutput}
            </pre>

          </section>

        </div>

        {/* CONTROLS */}

        <div className="jf-controls">

          <div className="jf-control-group">

            <label>
              Indent

              <select
                value={indent}
                onChange={(event) =>
                  setIndent(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                <option value={2}>
                  2 spaces
                </option>

                <option value={4}>
                  4 spaces
                </option>

                <option value={8}>
                  8 spaces
                </option>

                <option value={0}>
                  Compact
                </option>
              </select>
            </label>

          </div>

          <label className="jf-check">

            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(event) =>
                setSortKeys(
                  event.target.checked
                )
              }
            />

            <span>
              Sort keys
            </span>

          </label>

          <label className="jf-check">

            <input
              type="checkbox"
              checked={removeEmpty}
              onChange={(event) =>
                setRemoveEmpty(
                  event.target.checked
                )
              }
            />

            <span>
              Remove null / empty
            </span>

          </label>

          <button
            className="jf-format"
            onClick={handleFormat}
          >
            ✨ Format JSON
          </button>

        </div>

        {/* TABS */}

        <div className="jf-card jf-bottom">

          <div className="jf-tabs">

            <button
              className={
                tab === "format"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("format")
              }
            >
              Formatter
            </button>

            <button
              className={
                tab === "validate"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("validate")
              }
            >
              Validator
            </button>

            <button
              className={
                tab === "tree"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("tree")
              }
            >
              JSON Tree
            </button>

            <button
              className={
                tab === "path"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("path")
              }
            >
              Path Finder
            </button>

            <button
              className={
                tab === "stats"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("stats")
              }
            >
              Inspector
            </button>

          </div>

          {/* FORMATTER */}

          {tab === "format" && (
            <div className="jf-info">

              <div className="jf-info-grid">

                <div>
                  <span>
                    Output mode
                  </span>

                  <b>
                    {indent === 0
                      ? "Compact"
                      : `${indent} spaces`}
                  </b>
                </div>

                <div>
                  <span>
                    Key sorting
                  </span>

                  <b>
                    {sortKeys
                      ? "Enabled"
                      : "Original order"}
                  </b>
                </div>

                <div>
                  <span>
                    Cleanup
                  </span>

                  <b>
                    {removeEmpty
                      ? "Enabled"
                      : "Disabled"}
                  </b>
                </div>

              </div>

              <div className="jf-shortcut">
                Tip: Use
                {" "}
                <b>Format JSON</b>
                {" "}
                after pasting minified
                or messy JSON.
              </div>

            </div>
          )}

          {/* VALIDATOR */}

          {tab === "validate" && (
            <div className="jf-validation">

              {parsed.valid ? (
                <div className="jf-success-box">

                  <strong>
                    ✓ JSON is valid
                  </strong>

                  <p>
                    The complete input
                    successfully parsed
                    as JSON.
                  </p>

                  {duplicates.length >
                    0 && (
                    <div className="jf-warning">
                      ⚠ Possible duplicate
                      keys detected:
                      {" "}
                      {duplicates
                        .map(
                          (key) =>
                            `"${key}"`
                        )
                        .join(", ")}
                    </div>
                  )}

                </div>
              ) : (
                <div className="jf-error-box">

                  <strong>
                    × JSON validation failed
                  </strong>

                  <p>
                    {parsed.error?.message}
                  </p>

                  {parsed.error?.line && (
                    <div className="jf-error-grid">

                      <div>
                        <span>
                          Line
                        </span>

                        <b>
                          {
                            parsed
                              .error
                              .line
                          }
                        </b>
                      </div>

                      <div>
                        <span>
                          Column
                        </span>

                        <b>
                          {
                            parsed
                              .error
                              .column
                          }
                        </b>
                      </div>

                      <div>
                        <span>
                          Position
                        </span>

                        <b>
                          {
                            parsed
                              .error
                              .position
                          }
                        </b>
                      </div>

                    </div>
                  )}

                  {parsed.error
                    ?.snippet && (
                    <pre className="jf-error-snippet">
                      {
                        parsed
                          .error
                          .snippet
                      }
                    </pre>
                  )}

                </div>
              )}

            </div>
          )}

          {/* TREE */}

          {tab === "tree" && (
            <div className="jf-tree">

              {parsed.valid ? (
                <TreeNode
                  name={
                    Array.isArray(
                      parsed.value
                    )
                      ? "root[]"
                      : "root"
                  }
                  value={
                    parsed.value
                  }
                />
              ) : (
                <div className="jf-empty">
                  Fix the JSON first
                  to inspect its tree.
                </div>
              )}

            </div>
          )}

          {/* PATH FINDER */}

          {tab === "path" && (
            <div className="jf-path">

              <div className="jf-path-search">

                <input
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      runQuery();
                    }
                  }}
                  placeholder="Example: project.owner.name"
                />

                <button
                  onClick={runQuery}
                >
                  Find Value
                </button>

              </div>

              <small>
                Use dot notation, e.g.
                {" "}
                <b>
                  project.owner.name
                </b>
                {" "}
                or
                {" "}
                <b>
                  $.settings.theme
                </b>
              </small>

              {queryResult && (
                <div
                  className={
                    queryResult.found
                      ? "jf-path-result found"
                      : "jf-path-result missing"
                  }
                >

                  {queryResult.found ? (
                    <>
                      <strong>
                        ✓ Value found
                      </strong>

                      <pre>
                        {JSON.stringify(
                          queryResult.value,
                          null,
                          2
                        )}
                      </pre>
                    </>
                  ) : (
                    <strong>
                      × Path not found
                    </strong>
                  )}

                </div>
              )}

            </div>
          )}

          {/* INSPECTOR */}

          {tab === "stats" && (
            <div className="jf-inspector">

              {stats ? (
                <>
                  <div className="jf-stat-grid">

                    <div>
                      <span>
                        Root type
                      </span>

                      <b>
                        {stats.type}
                      </b>
                    </div>

                    <div>
                      <span>
                        Total nodes
                      </span>

                      <b>
                        {stats.nodes}
                      </b>
                    </div>

                    <div>
                      <span>
                        Total keys
                      </span>

                      <b>
                        {stats.keys}
                      </b>
                    </div>

                    <div>
                      <span>
                        Max depth
                      </span>

                      <b>
                        {stats.depth}
                      </b>
                    </div>

                    <div>
                      <span>
                        Empty / null
                      </span>

                      <b>
                        {stats.empty}
                      </b>
                    </div>

                    <div>
                      <span>
                        JSON size
                      </span>

                      <b>
                        {formatBytes(
                          stats.size
                        )}
                      </b>
                    </div>

                  </div>

                  <div className="jf-insight">

                    <strong>
                      Smart inspection
                    </strong>

                    <p>
                      This inspector analyzes
                      your JSON locally and
                      shows structural
                      information without
                      uploading the data.
                    </p>

                  </div>

                </>
              ) : (
                <div className="jf-empty">
                  Valid JSON is required
                  for inspection.
                </div>
              )}

            </div>
          )}

        </div>

        {/* HISTORY */}

        {history.length > 0 && (
          <div className="jf-history">

            <div>
              <b>
                Recent versions
              </b>

              <small>
                Restore one of your last
                formatted inputs.
              </small>
            </div>

            <div className="jf-history-list">

              {history.map(
                (item, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setInput(item)
                    }
                  >
                    Version{" "}
                    {history.length -
                      index}
                  </button>
                )
              )}

            </div>

          </div>
        )}

      </div>

      <style jsx>{`

        .json-tool {
          width: 100%;
          min-height: 100%;
          box-sizing: border-box;
          padding: 22px;
          background: var(--json-bg, #f6f8fc);
          color: var(--json-text, #111827);
        }

        .jf-shell {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
        }

        .jf-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 17px;
        }

        .jf-eyebrow {
          color: #6366f1;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .13em;
          margin-bottom: 5px;
        }

        .jf-top h1 {
          margin: 0;
          font-size: 28px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -.03em;
        }

        .jf-top h1 span {
          color: #6366f1;
        }

        .jf-top p {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .jf-actions {
          display: flex;
          gap: 8px;
        }

        button {
          font-family: inherit;
        }

        .jf-actions button {
          border: 0;
          border-radius: 9px;
          padding: 10px 13px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        .jf-soft {
          background: #eef2ff;
          color: #4338ca;
        }

        .jf-danger {
          background: #fff1f2;
          color: #be123c;
        }

        .jf-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 11px 14px;
          border: 1px solid;
          border-radius: 11px;
          margin-bottom: 15px;
          font-size: 11px;
        }

        .jf-status.valid {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #047857;
        }

        .jf-status.invalid {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #be123c;
        }

        .jf-status b {
          margin-right: 10px;
        }

        .jf-status span {
          opacity: .8;
        }

        .jf-status-meta {
          font-weight: 750;
          white-space: nowrap;
        }

        .jf-editor-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);
          gap: 14px;
        }

        .jf-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
        }

        .jf-card-head {
          min-height: 54px;
          padding: 10px 13px;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }

        .jf-card-head b {
          display: block;
          font-size: 12px;
          font-weight: 850;
        }

        .jf-card-head small {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 9px;
        }

        .jf-mini-actions {
          display: flex;
          gap: 5px;
        }

        .jf-mini-actions button {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          border-radius: 7px;
          padding: 7px 9px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 750;
        }

        .jf-editor,
        .jf-output {
          width: 100%;
          height: 365px;
          min-height: 250px;
          margin: 0;
          box-sizing: border-box;
          border: 0;
          outline: 0;
          padding: 15px;
          resize: vertical;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;
          font-size: 12px;
          line-height: 1.65;
          background: #0b1120;
          color: #dbeafe;
        }

        .jf-editor {
          resize: vertical;
        }

        .jf-output {
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .jf-editor-footer {
          display: flex;
          gap: 14px;
          padding: 8px 13px;
          color: #94a3b8;
          font-size: 9px;
          border-top: 1px solid #1e293b;
          background: #0b1120;
        }

        .jf-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 12px 0;
        }

        .jf-control-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
        }

        .jf-control-group select {
          border: 1px solid #dbe1ea;
          background: #fff;
          color: #334155;
          border-radius: 7px;
          padding: 8px;
          font-size: 10px;
        }

        .jf-check {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 750;
          color: #475569;
          cursor: pointer;
        }

        .jf-check input {
          accent-color: #4f46e5;
        }

        .jf-format {
          margin-left: auto;
          border: 0;
          border-radius: 8px;
          background: #4f46e5;
          color: white;
          padding: 9px 15px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 850;
        }

        .jf-bottom {
          padding: 0;
        }

        .jf-tabs {
          display: flex;
          gap: 20px;
          padding: 0 14px;
          border-bottom: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .jf-tabs button {
          flex-shrink: 0;
          border: 0;
          background: transparent;
          padding: 12px 2px;
          color: #64748b;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
          border-bottom: 2px solid transparent;
        }

        .jf-tabs button.active {
          color: #4f46e5;
          border-bottom-color: #4f46e5;
        }

        .jf-info,
        .jf-validation,
        .jf-tree,
        .jf-path,
        .jf-inspector {
          padding: 17px;
        }

        .jf-info-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 9px;
        }

        .jf-info-grid div,
        .jf-stat-grid div,
        .jf-error-grid div {
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          padding: 11px;
        }

        .jf-info-grid span,
        .jf-stat-grid span,
        .jf-error-grid span {
          display: block;
          color: #94a3b8;
          font-size: 9px;
          margin-bottom: 4px;
        }

        .jf-info-grid b,
        .jf-stat-grid b,
        .jf-error-grid b {
          font-size: 12px;
        }

        .jf-shortcut,
        .jf-note {
          margin-top: 11px;
          padding: 10px;
          border-radius: 8px;
          background: #6366f110;
          color: #4f46e5;
          font-size: 10px;
          line-height: 1.5;
        }

        .jf-success-box {
          padding: 14px;
          border-radius: 10px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .jf-success-box strong,
        .jf-error-box strong {
          font-size: 13px;
        }

        .jf-success-box p,
        .jf-error-box p {
          font-size: 11px;
          margin: 5px 0;
        }

        .jf-warning {
          margin-top: 10px;
          padding: 9px;
          border-radius: 7px;
          background: #fef3c7;
          color: #92400e;
          font-size: 10px;
        }

        .jf-error-box {
          padding: 14px;
          border-radius: 10px;
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
        }

        .jf-error-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
        }

        .jf-error-snippet {
          margin: 10px 0 0;
          padding: 11px;
          border-radius: 8px;
          background: #111827;
          color: #fca5a5;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 10px;
          line-height: 1.5;
        }

        .jf-tree {
          max-height: 450px;
          overflow: auto;
          background: #0b1120;
          color: #e2e8f0;
          margin: 14px;
          border-radius: 9px;
          padding: 8px 0;
        }

        .jf-tree-row {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 7px;
          min-height: 27px;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            monospace;
          font-size: 10px;
        }

        .jf-tree-button {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          text-align: left;
        }

        .jf-arrow {
          width: 12px;
          color: #818cf8;
        }

        .jf-tree-key {
          color: #c4b5fd;
        }

        .jf-container-type {
          color: #64748b;
          font-size: 9px;
        }

        .jf-type {
          word-break: break-word;
        }

        .jf-string {
          color: #86efac;
        }

        .jf-number {
          color: #93c5fd;
        }

        .jf-boolean {
          color: #fcd34d;
        }

        .jf-null {
          color: #fda4af;
        }

        .jf-path-search {
          display: flex;
          gap: 7px;
        }

        .jf-path-search input {
          flex: 1;
          min-width: 0;
          border: 1px solid #dbe1ea;
          border-radius: 8px;
          padding: 10px;
          outline: 0;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            monospace;
          font-size: 11px;
        }

        .jf-path-search button {
          border: 0;
          border-radius: 8px;
          background: #4f46e5;
          color: #fff;
          padding: 0 13px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
        }

        .jf-path > small {
          display: block;
          color: #94a3b8;
          margin-top: 7px;
          font-size: 9px;
        }

        .jf-path-result {
          margin-top: 12px;
          padding: 12px;
          border-radius: 9px;
        }

        .jf-path-result.found {
          background: #ecfdf5;
          color: #047857;
        }

        .jf-path-result.missing {
          background: #fff1f2;
          color: #be123c;
        }

        .jf-path-result pre {
          margin: 8px 0 0;
          padding: 10px;
          border-radius: 7px;
          background: #0b1120;
          color: #dbeafe;
          overflow: auto;
          font-size: 10px;
        }

        .jf-stat-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 9px;
        }

        .jf-insight {
          margin-top: 12px;
          padding: 12px;
          border-radius: 9px;
          background: #f8fafc;
        }

        .jf-insight strong {
          font-size: 11px;
        }

        .jf-insight p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 10px;
          line-height: 1.5;
        }

        .jf-empty {
          padding: 35px;
          text-align: center;
          color: #94a3b8;
          font-size: 11px;
        }

        .jf-history {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 13px;
          padding: 12px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #fff;
        }

        .jf-history b {
          display: block;
          font-size: 11px;
        }

        .jf-history small {
          display: block;
          color: #94a3b8;
          margin-top: 3px;
          font-size: 9px;
        }

        .jf-history-list {
          display: flex;
          gap: 6px;
        }

        .jf-history-list button {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          border-radius: 7px;
          padding: 7px 9px;
          cursor: pointer;
          font-size: 9px;
          font-weight: 750;
        }

        @media (max-width: 900px) {
          .jf-editor-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .json-tool {
            padding: 10px;
          }

          .jf-top {
            align-items: stretch;
            flex-direction: column;
          }

          .jf-actions {
            width: 100%;
          }

          .jf-actions button {
            flex: 1;
          }

          .jf-top h1 {
            font-size: 23px;
          }

          .jf-status {
            align-items: flex-start;
            flex-direction: column;
          }

          .jf-status-meta {
            white-space: normal;
          }

          .jf-info-grid,
          .jf-stat-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .jf-error-grid {
            grid-template-columns: 1fr;
          }

          .jf-controls {
            align-items: stretch;
            flex-direction: column;
          }

          .jf-format {
            width: 100%;
            margin-left: 0;
          }

          .jf-history {
            align-items: stretch;
            flex-direction: column;
          }

          .jf-history-list {
            flex-wrap: wrap;
          }

          .jf-path-search {
            flex-direction: column;
          }

          .jf-path-search button {
            height: 38px;
          }
        }

      `}</style>
    </div>
  );
}