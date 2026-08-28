"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";
const AMBIGUOUS = "Il1O0o";
const SIMILAR_SYMBOLS = "{}[]()/\\'\"`~,;:.<>";

function randomInt(max) {
  if (max <= 0) return 0;

  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.getRandomValues
  ) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function secureRandomChar(chars) {
  return chars[randomInt(chars.length)];
}

function shuffleSecurely(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result;
}

function getEntropyBits(length, poolSize) {
  if (!length || !poolSize) return 0;
  return Math.round(length * Math.log2(poolSize));
}

function getStrength(entropy) {
  if (entropy < 45) {
    return {
      label: "Very Weak",
      level: 1,
      message: "Too easy to guess. Increase length.",
    };
  }

  if (entropy < 60) {
    return {
      label: "Weak",
      level: 2,
      message: "Suitable only for low-risk temporary use.",
    };
  }

  if (entropy < 80) {
    return {
      label: "Good",
      level: 3,
      message: "Reasonable protection for many everyday accounts.",
    };
  }

  if (entropy < 100) {
    return {
      label: "Strong",
      level: 4,
      message: "Strong password with a large search space.",
    };
  }

  return {
    label: "Excellent",
    level: 5,
    message: "Very large search space and excellent resistance.",
  };
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function PasswordGenerator() {
  const [length, setLength] = useState(20);

  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [excludeSimilarSymbols, setExcludeSimilarSymbols] = useState(false);
  const [noRepeating, setNoRepeating] = useState(false);
  const [noSequential, setNoSequential] = useState(false);

  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyEnabled, setHistoryEnabled] = useState(false);

  const [customPrefix, setCustomPrefix] = useState("");
  const [customSuffix, setCustomSuffix] = useState("");

  const selectedPools = useMemo(() => {
    let pools = [];

    if (useLower) pools.push(LOWERCASE);
    if (useUpper) pools.push(UPPERCASE);
    if (useNumbers) pools.push(NUMBERS);
    if (useSymbols) pools.push(SYMBOLS);

    if (excludeAmbiguous) {
      pools = pools.map((pool) =>
        pool
          .split("")
          .filter((char) => !AMBIGUOUS.includes(char))
          .join("")
      );
    }

    if (excludeSimilarSymbols) {
      pools = pools.map((pool) =>
        pool
          .split("")
          .filter((char) => !SIMILAR_SYMBOLS.includes(char))
          .join("")
      );
    }

    return pools.filter(Boolean);
  }, [
    useLower,
    useUpper,
    useNumbers,
    useSymbols,
    excludeAmbiguous,
    excludeSimilarSymbols,
  ]);

  const combinedPool = useMemo(() => {
    return Array.from(new Set(selectedPools.join("").split("")));
  }, [selectedPools]);

  const entropy = useMemo(() => {
    return getEntropyBits(length, combinedPool.length);
  }, [length, combinedPool.length]);

  const strength = useMemo(() => {
    return getStrength(entropy);
  }, [entropy]);

  const generatePassword = useCallback(() => {
    if (!selectedPools.length) {
      setPassword("");
      return;
    }

    let targetLength = Number(length) || 20;

    if (targetLength < 4) targetLength = 4;
    if (targetLength > 128) targetLength = 128;

    const prefix = customPrefix || "";
    const suffix = customSuffix || "";

    const reservedLength = Math.min(
      prefix.length + suffix.length,
      targetLength - 1
    );

    const bodyLength = Math.max(1, targetLength - reservedLength);

    let result = [];

    /*
     * Guarantee at least one character from every
     * selected character category whenever possible.
     */
    selectedPools.forEach((pool) => {
      if (result.length < bodyLength && pool.length) {
        result.push(secureRandomChar(pool));
      }
    });

    let attempts = 0;

    while (result.length < bodyLength && attempts < 5000) {
      attempts += 1;

      const char = secureRandomChar(combinedPool);

      if (
        noRepeating &&
        result.length > 0 &&
        result[result.length - 1] === char
      ) {
        continue;
      }

      if (
        noSequential &&
        result.length >= 2
      ) {
        const a = result[result.length - 2];
        const b = result[result.length - 1];

        const codeA = a.charCodeAt(0);
        const codeB = b.charCodeAt(0);
        const codeC = char.charCodeAt(0);

        if (
          codeB === codeA + 1 &&
          codeC === codeB + 1
        ) {
          continue;
        }

        if (
          codeB === codeA - 1 &&
          codeC === codeB - 1
        ) {
          continue;
        }
      }

      result.push(char);
    }

    if (result.length < bodyLength) {
      while (result.length < bodyLength) {
        result.push(secureRandomChar(combinedPool));
      }
    }

    result = shuffleSecurely(result);

    let finalPassword =
      prefix +
      result.join("") +
      suffix;

    if (finalPassword.length > targetLength) {
      finalPassword = finalPassword.slice(
        0,
        targetLength
      );
    }

    setPassword(finalPassword);
    setCopied(false);

    if (historyEnabled) {
      setHistory((current) => {
        const next = [
          finalPassword,
          ...current.filter(
            (item) => item !== finalPassword
          ),
        ];

        return next.slice(0, 8);
      });
    }
  }, [
    selectedPools,
    combinedPool,
    length,
    noRepeating,
    noSequential,
    customPrefix,
    customSuffix,
    historyEnabled,
  ]);

  useEffect(() => {
    generatePassword();
  }, []);

  async function copyPassword(value) {
    if (!value) return;

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(value);
        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 1500);
      }
    } catch (error) {
      setCopied(false);
    }
  }

  function handleLengthChange(event) {
    let value = Number(event.target.value);

    if (Number.isNaN(value)) value = 20;
    if (value < 4) value = 4;
    if (value > 128) value = 128;

    setLength(value);
  }

  function clearHistory() {
    setHistory([]);
  }

  function resetSettings() {
    setLength(20);

    setUseLower(true);
    setUseUpper(true);
    setUseNumbers(true);
    setUseSymbols(true);

    setExcludeAmbiguous(false);
    setExcludeSimilarSymbols(false);
    setNoRepeating(false);
    setNoSequential(false);

    setCustomPrefix("");
    setCustomSuffix("");

    setHistory([]);
    setHistoryEnabled(false);
    setCopied(false);
  }

  const styles = `
    .spg-tool {
      --spg-text: #172033;
      --spg-muted: #667085;
      --spg-border: #e4e7ec;
      --spg-card: #ffffff;
      --spg-soft: #f7f8fa;
      --spg-primary: #635bff;
      --spg-primary-soft: rgba(99,91,255,.09);
      --spg-success: #12b76a;
      --spg-danger: #f04438;

      width: 100%;
      color: var(--spg-text);
      font-family: inherit;
      box-sizing: border-box;
    }

    .spg-tool *,
    .spg-tool *::before,
    .spg-tool *::after {
      box-sizing: border-box;
    }

    .spg-wrap {
      width: 100%;
      max-width: 1180px;
      margin: 0 auto;
    }

    .spg-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 20px;
    }

    .spg-eyebrow {
      color: var(--spg-primary);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .14em;
    }

    .spg-header h1 {
      margin: 6px 0 0;
      font-size: clamp(27px, 4vw, 40px);
      line-height: 1.05;
      letter-spacing: -.045em;
    }

    .spg-header p {
      max-width: 680px;
      margin: 9px 0 0;
      color: var(--spg-muted);
      font-size: 12px;
      line-height: 1.65;
    }

    .spg-main {
      display: grid;
      grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr);
      gap: 18px;
    }

    .spg-card {
      border: 1px solid var(--spg-border);
      border-radius: 16px;
      background: var(--spg-card);
      box-shadow: 0 8px 30px rgba(16,24,40,.035);
    }

    .spg-settings {
      padding: 21px;
    }

    .spg-title {
      font-size: 17px;
      font-weight: 750;
      letter-spacing: -.025em;
    }

    .spg-description {
      margin-top: 5px;
      color: var(--spg-muted);
      font-size: 11px;
      line-height: 1.6;
    }

    .spg-field-label {
      display: block;
      margin: 18px 0 8px;
      font-size: 11px;
      font-weight: 750;
    }

    .spg-range-row {
      display: grid;
      grid-template-columns: 1fr 65px;
      gap: 10px;
      align-items: center;
    }

    .spg-range {
      width: 100%;
      accent-color: var(--spg-primary);
      cursor: pointer;
    }

    .spg-number {
      width: 100%;
      height: 38px;
      border: 1px solid var(--spg-border);
      border-radius: 8px;
      background: var(--spg-soft);
      color: var(--spg-text);
      text-align: center;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      outline: none;
    }

    .spg-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }

    .spg-option {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 40px;
      padding: 8px 10px;
      border: 1px solid var(--spg-border);
      border-radius: 9px;
      background: var(--spg-soft);
      cursor: pointer;
      user-select: none;
    }

    .spg-option input {
      width: 15px;
      height: 15px;
      margin: 0;
      accent-color: var(--spg-primary);
      cursor: pointer;
      flex: 0 0 auto;
    }

    .spg-option span {
      font-size: 10px;
      font-weight: 650;
      line-height: 1.3;
    }

    .spg-advanced {
      margin-top: 18px;
      padding-top: 17px;
      border-top: 1px solid var(--spg-border);
    }

    .spg-advanced-title {
      font-size: 11px;
      font-weight: 800;
    }

    .spg-advanced-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 10px;
    }

    .spg-text-input {
      width: 100%;
      height: 40px;
      padding: 0 10px;
      border: 1px solid var(--spg-border);
      border-radius: 8px;
      background: var(--spg-card);
      color: var(--spg-text);
      font: inherit;
      font-size: 11px;
      outline: none;
    }

    .spg-text-input:focus,
    .spg-number:focus {
      border-color: var(--spg-primary);
      box-shadow: 0 0 0 3px var(--spg-primary-soft);
    }

    .spg-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 18px;
    }

    .spg-button {
      min-height: 42px;
      border: 1px solid var(--spg-border);
      border-radius: 9px;
      background: var(--spg-card);
      color: var(--spg-text);
      cursor: pointer;
      font: inherit;
      font-size: 11px;
      font-weight: 750;
      transition: transform .15s ease, border-color .15s ease;
    }

    .spg-button:hover {
      transform: translateY(-1px);
      border-color: var(--spg-primary);
    }

    .spg-button.primary {
      border-color: var(--spg-primary);
      background: var(--spg-primary);
      color: #fff;
    }

    .spg-button.full {
      grid-column: 1 / -1;
    }

    .spg-output {
      min-width: 0;
      padding: 24px;
      display: flex;
      flex-direction: column;
    }

    .spg-output-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .spg-output-label {
      color: var(--spg-primary);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .13em;
    }

    .spg-visibility {
      border: 1px solid var(--spg-border);
      background: var(--spg-card);
      color: var(--spg-muted);
      border-radius: 8px;
      padding: 7px 9px;
      cursor: pointer;
      font-size: 10px;
      font-weight: 700;
    }

    .spg-password-box {
      position: relative;
      margin-top: 12px;
      padding: 18px;
      min-height: 100px;
      border: 1px solid var(--spg-border);
      border-radius: 12px;
      background: var(--spg-soft);
      display: flex;
      align-items: center;
    }

    .spg-password {
      width: 100%;
      margin: 0;
      padding-right: 4px;
      color: var(--spg-text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: clamp(15px, 2vw, 21px);
      line-height: 1.55;
      font-weight: 650;
      word-break: break-all;
    }

    .spg-empty {
      color: var(--spg-muted);
      font-size: 12px;
    }

    .spg-action-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }

    .spg-strength {
      margin-top: 18px;
      padding: 15px;
      border: 1px solid var(--spg-border);
      border-radius: 11px;
      background: var(--spg-card);
    }

    .spg-strength-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .spg-strength-title {
      font-size: 11px;
      font-weight: 750;
    }

    .spg-strength-value {
      font-size: 10px;
      font-weight: 800;
    }

    .spg-bars {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      margin-top: 9px;
    }

    .spg-bar {
      height: 5px;
      border-radius: 999px;
      background: var(--spg-border);
    }

    .spg-bar.active {
      background: var(--spg-primary);
    }

    .spg-strength-message {
      margin: 8px 0 0;
      color: var(--spg-muted);
      font-size: 9px;
      line-height: 1.5;
    }

    .spg-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 10px;
    }

    .spg-metric {
      padding: 12px;
      border: 1px solid var(--spg-border);
      border-radius: 10px;
      background: var(--spg-soft);
    }

    .spg-metric span {
      display: block;
      color: var(--spg-muted);
      font-size: 8px;
    }

    .spg-metric strong {
      display: block;
      margin-top: 5px;
      font-size: 15px;
    }

    .spg-security-note {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin-top: 12px;
      padding: 11px;
      border-radius: 9px;
      background: var(--spg-primary-soft);
    }

    .spg-security-note b {
      color: var(--spg-primary);
      font-size: 12px;
    }

    .spg-security-note p {
      margin: 0;
      color: var(--spg-muted);
      font-size: 9px;
      line-height: 1.55;
    }

    .spg-history {
      margin-top: 18px;
      padding-top: 17px;
      border-top: 1px solid var(--spg-border);
    }

    .spg-history-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .spg-history-title {
      font-size: 11px;
      font-weight: 800;
    }

    .spg-clear {
      border: 0;
      background: transparent;
      color: var(--spg-muted);
      cursor: pointer;
      font: inherit;
      font-size: 9px;
      font-weight: 700;
    }

    .spg-history-list {
      display: grid;
      gap: 6px;
      margin-top: 9px;
    }

    .spg-history-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 9px 10px;
      border: 1px solid var(--spg-border);
      border-radius: 8px;
      background: var(--spg-soft);
    }

    .spg-history-item code {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 9px;
    }

    .spg-history-copy {
      flex: 0 0 auto;
      border: 1px solid var(--spg-border);
      border-radius: 6px;
      background: var(--spg-card);
      color: var(--spg-text);
      padding: 5px 7px;
      cursor: pointer;
      font-size: 8px;
      font-weight: 700;
    }

    @media (max-width: 900px) {
      .spg-main {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .spg-header {
        flex-direction: column;
        align-items: stretch;
      }

      .spg-settings,
      .spg-output {
        padding: 16px;
      }

      .spg-options {
        grid-template-columns: 1fr;
      }

      .spg-metrics {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    @media (max-width: 420px) {
      .spg-buttons,
      .spg-action-row {
        grid-template-columns: 1fr;
      }

      .spg-metrics {
        grid-template-columns: 1fr;
      }
    }

    .dark .spg-tool,
    body.dark .spg-tool,
    html.dark .spg-tool {
      --spg-text: #f2f4f7;
      --spg-muted: #98a2b3;
      --spg-border: #2d3442;
      --spg-card: #151922;
      --spg-soft: #10141c;
      --spg-primary: #8078ff;
      --spg-primary-soft: rgba(128,120,255,.12);
    }
  `;

  return (
    <>
      <div className="spg-tool">
        <div className="spg-wrap">

          <div className="spg-header">
            <div>
              <div className="spg-eyebrow">
                SECURITY TOOL
              </div>

              <h1>Secure Password Generator</h1>

              <p>
                Generate strong, cryptographically random passwords
                with advanced rules, entropy insights and privacy-first
                local processing.
              </p>
            </div>
          </div>

          <div className="spg-main">

            {/* SETTINGS */}
            <div className="spg-card spg-settings">

              <div className="spg-title">
                Password settings
              </div>

              <div className="spg-description">
                Customize the character set and rules used for
                generating your password.
              </div>

              <label className="spg-field-label">
                Password length
              </label>

              <div className="spg-range-row">
                <input
                  className="spg-range"
                  type="range"
                  min="4"
                  max="128"
                  value={length}
                  onChange={handleLengthChange}
                />

                <input
                  className="spg-number"
                  type="number"
                  min="4"
                  max="128"
                  value={length}
                  onChange={handleLengthChange}
                />
              </div>

              <label className="spg-field-label">
                Character types
              </label>

              <div className="spg-options">

                <label className="spg-option">
                  <input
                    type="checkbox"
                    checked={useLower}
                    onChange={(e) =>
                      setUseLower(e.target.checked)
                    }
                  />
                  <span>Lowercase</span>
                </label>

                <label className="spg-option">
                  <input
                    type="checkbox"
                    checked={useUpper}
                    onChange={(e) =>
                      setUseUpper(e.target.checked)
                    }
                  />
                  <span>Uppercase</span>
                </label>

                <label className="spg-option">
                  <input
                    type="checkbox"
                    checked={useNumbers}
                    onChange={(e) =>
                      setUseNumbers(e.target.checked)
                    }
                  />
                  <span>Numbers</span>
                </label>

                <label className="spg-option">
                  <input
                    type="checkbox"
                    checked={useSymbols}
                    onChange={(e) =>
                      setUseSymbols(e.target.checked)
                    }
                  />
                  <span>Symbols</span>
                </label>

              </div>

              <div className="spg-advanced">

                <div className="spg-advanced-title">
                  Advanced rules
                </div>

                <div className="spg-options">

                  <label className="spg-option">
                    <input
                      type="checkbox"
                      checked={excludeAmbiguous}
                      onChange={(e) =>
                        setExcludeAmbiguous(
                          e.target.checked
                        )
                      }
                    />
                    <span>
                      Remove ambiguous characters
                    </span>
                  </label>

                  <label className="spg-option">
                    <input
                      type="checkbox"
                      checked={excludeSimilarSymbols}
                      onChange={(e) =>
                        setExcludeSimilarSymbols(
                          e.target.checked
                        )
                      }
                    />
                    <span>
                      Remove similar symbols
                    </span>
                  </label>

                  <label className="spg-option">
                    <input
                      type="checkbox"
                      checked={noRepeating}
                      onChange={(e) =>
                        setNoRepeating(
                          e.target.checked
                        )
                      }
                    />
                    <span>
                      Avoid repeated characters
                    </span>
                  </label>

                  <label className="spg-option">
                    <input
                      type="checkbox"
                      checked={noSequential}
                      onChange={(e) =>
                        setNoSequential(
                          e.target.checked
                        )
                      }
                    />
                    <span>
                      Avoid sequential characters
                    </span>
                  </label>

                </div>

                <div className="spg-advanced-grid">

                  <input
                    className="spg-text-input"
                    type="text"
                    value={customPrefix}
                    onChange={(e) =>
                      setCustomPrefix(e.target.value)
                    }
                    placeholder="Optional prefix"
                    maxLength={30}
                  />

                  <input
                    className="spg-text-input"
                    type="text"
                    value={customSuffix}
                    onChange={(e) =>
                      setCustomSuffix(e.target.value)
                    }
                    placeholder="Optional suffix"
                    maxLength={30}
                  />

                  <label className="spg-option">
                    <input
                      type="checkbox"
                      checked={historyEnabled}
                      onChange={(e) =>
                        setHistoryEnabled(
                          e.target.checked
                        )
                      }
                    />
                    <span>
                      Keep temporary generation history
                    </span>
                  </label>

                </div>

              </div>

              <div className="spg-buttons">

                <button
                  type="button"
                  className="spg-button primary full"
                  onClick={generatePassword}
                >
                  Generate Secure Password
                </button>

                <button
                  type="button"
                  className="spg-button"
                  onClick={resetSettings}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="spg-button"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? "Hide Preview" : "Show Preview"}
                </button>

              </div>

            </div>

            {/* OUTPUT */}
            <div className="spg-card spg-output">

              <div className="spg-output-top">

                <div className="spg-output-label">
                  GENERATED PASSWORD
                </div>

                <button
                  type="button"
                  className="spg-visibility"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? "Hide" : "Show"}
                </button>

              </div>

              <div className="spg-password-box">

                {password ? (
                  <code className="spg-password">
                    {visible
                      ? password
                      : "•".repeat(password.length)}
                  </code>
                ) : (
                  <div className="spg-empty">
                    Click generate to create a secure password.
                  </div>
                )}

              </div>

              <div className="spg-action-row">

                <button
                  type="button"
                  className="spg-button primary"
                  onClick={generatePassword}
                >
                  Generate New
                </button>

                <button
                  type="button"
                  className="spg-button"
                  onClick={() => copyPassword(password)}
                  disabled={!password}
                >
                  {copied ? "✓ Copied" : "Copy Password"}
                </button>

              </div>

              <div className="spg-strength">

                <div className="spg-strength-head">

                  <div className="spg-strength-title">
                    Security strength
                  </div>

                  <div className="spg-strength-value">
                    {strength.label}
                  </div>

                </div>

                <div className="spg-bars">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={
                        bar <= strength.level
                          ? "spg-bar active"
                          : "spg-bar"
                      }
                    />
                  ))}
                </div>

                <p className="spg-strength-message">
                  {strength.message}
                </p>

              </div>

              <div className="spg-metrics">

                <div className="spg-metric">
                  <span>Length</span>
                  <strong>
                    {length}
                  </strong>
                </div>

                <div className="spg-metric">
                  <span>Character pool</span>
                  <strong>
                    {formatNumber(combinedPool.length)}
                  </strong>
                </div>

                <div className="spg-metric">
                  <span>Entropy</span>
                  <strong>
                    {formatNumber(entropy)} bits
                  </strong>
                </div>

              </div>

              <div className="spg-security-note">

                <b>✓</b>

                <p>
                  Password generation happens locally in your browser.
                  Nothing is sent to a server or stored remotely.
                  The generator uses the browser's Web Crypto API
                  whenever available.
                </p>

              </div>

              {historyEnabled && (
                <div className="spg-history">

                  <div className="spg-history-head">

                    <div className="spg-history-title">
                      Temporary history
                    </div>

                    {history.length > 0 && (
                      <button
                        type="button"
                        className="spg-clear"
                        onClick={clearHistory}
                      >
                        Clear
                      </button>
                    )}

                  </div>

                  <div className="spg-history-list">

                    {history.length === 0 ? (
                      <div className="spg-empty">
                        Generated passwords will appear here
                        temporarily.
                      </div>
                    ) : (
                      history.map((item, index) => (
                        <div
                          className="spg-history-item"
                          key={item + index}
                        >
                          <code>
                            {item}
                          </code>

                          <button
                            type="button"
                            className="spg-history-copy"
                            onClick={() =>
                              copyPassword(item)
                            }
                          >
                            Copy
                          </button>
                        </div>
                      ))
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      </div>

      <style>{styles}</style>
    </>
  );
}

/*
 * IMPORTANT:
 * Default export is the component itself.
 * Do NOT export an object here.
 */
export default PasswordGenerator;