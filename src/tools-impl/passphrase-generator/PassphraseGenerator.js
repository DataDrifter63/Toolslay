"use client";

import React, { useState } from "react";

const WORD_BANK = [
  "amber","apple","arrow","atlas","autumn","beacon","berry","blade",
  "blossom","blue","bridge","bright","canyon","cedar","cloud","cobalt",
  "comet","coral","cosmic","crystal","dawn","delta","desert","drift",
  "eagle","ember","falcon","forest","frost","garden","glacier","golden",
  "harbor","hazel","horizon","ivory","jade","jungle","lantern","lunar",
  "maple","marble","meadow","meteor","mist","moon","mountain","navy",
  "ocean","olive","orchard","orbit","pearl","pine","planet","plasma",
  "quartz","rain","raven","river","rocket","rose","royal","saffron",
  "shadow","silver","sky","solar","spark","spring","stone","storm",
  "summit","sunset","thunder","tiger","timber","topaz","trail","violet",
  "wave","willow","winter","wolf","woodland","zenith","anchor","aurora",
  "bamboo","breeze","candle","cascade","citrus","crown","eclipse","flame",
  "honey","island","lemon","lotus","midnight","nebula","pepper","phoenix",
  "rainbow","sapphire","seashell","snow","thunder","velvet","whisper","zephyr"
];

function secureRandom(max) {
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

function randomWord() {
  return WORD_BANK[secureRandom(WORD_BANK.length)];
}

function randomNumber(max) {
  return String(secureRandom(max));
}

function randomSeparator() {
  const separators = ["-", "_", ".", " ", "~"];
  return separators[secureRandom(separators.length)];
}

function capitalizeWord(word) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generatePassphrase(options) {
  const words = [];

  for (let i = 0; i < options.wordCount; i += 1) {
    let word = randomWord();

    if (options.capitalize) {
      word = capitalizeWord(word);
    }

    words.push(word);
  }

  let result = words.join(
    options.separator === "random"
      ? randomSeparator()
      : options.separator
  );

  if (options.addNumber) {
    const number = randomNumber(1000);

    if (options.numberPosition === "start") {
      result = number + (options.separator === " " ? " " : "") + result;
    } else {
      result =
        result +
        (options.separator === " " ? " " : "") +
        number;
    }
  }

  if (options.addSymbol) {
    const symbols = ["!", "@", "#", "$", "%", "&", "*", "?"];
    const symbol = symbols[secureRandom(symbols.length)];

    if (options.symbolPosition === "start") {
      result = symbol + result;
    } else {
      result = result + symbol;
    }
  }

  return result;
}

function calculateEntropy(options) {
  const pool = WORD_BANK.length;

  let entropy =
    options.wordCount * Math.log2(pool);

  if (options.addNumber) {
    entropy += Math.log2(1000);
  }

  if (options.addSymbol) {
    entropy += Math.log2(8);
  }

  return Math.round(entropy);
}

function getStrength(entropy) {
  if (entropy >= 100) {
    return {
      label: "Excellent",
      width: "100%",
      className: "pg-strength-excellent"
    };
  }

  if (entropy >= 80) {
    return {
      label: "Very strong",
      width: "82%",
      className: "pg-strength-very-strong"
    };
  }

  if (entropy >= 60) {
    return {
      label: "Strong",
      width: "65%",
      className: "pg-strength-strong"
    };
  }

  return {
    label: "Moderate",
    width: "45%",
    className: "pg-strength-moderate"
  };
}

function estimateCrackTime(entropy) {
  /*
   * Illustrative estimate assuming an extremely fast
   * offline guessing environment.
   * It is intentionally presented as an estimate.
   */
  const guessesPerSecond = 1e12;
  const guesses = Math.pow(2, entropy - 1);
  const seconds = guesses / guessesPerSecond;

  if (seconds < 1) return "Less than a second";
  if (seconds < 60) return Math.round(seconds) + " seconds";
  if (seconds < 3600) return Math.round(seconds / 60) + " minutes";
  if (seconds < 86400) return Math.round(seconds / 3600) + " hours";
  if (seconds < 31557600) {
    return Math.round(seconds / 86400) + " days";
  }
  if (seconds < 3155760000) {
    return Math.round(seconds / 31557600) + " years";
  }

  if (seconds < 3155760000000) {
    return Math.round(seconds / 31557600000) + " thousand years";
  }

  return "Extremely long";
}

export default function PassphraseGenerator() {
  const [wordCount, setWordCount] = useState(5);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(false);
  const [addNumber, setAddNumber] = useState(true);
  const [numberPosition, setNumberPosition] = useState("end");
  const [addSymbol, setAddSymbol] = useState(true);
  const [symbolPosition, setSymbolPosition] = useState("end");

  const [passphrase, setPassphrase] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  function buildOptions() {
    return {
      wordCount: Number(wordCount),
      separator,
      capitalize,
      addNumber,
      numberPosition,
      addSymbol,
      symbolPosition
    };
  }

  function generate() {
    const options = buildOptions();
    const value = generatePassphrase(options);

    setPassphrase(value);
    setCopied(false);

    setHistory(function (current) {
      const next = [value].concat(current);

      return next.slice(0, 5);
    });
  }

  function regenerate() {
    generate();
  }

  async function copyPassphrase() {
    if (!passphrase) return;

    try {
      await navigator.clipboard.writeText(passphrase);
      setCopied(true);

      window.setTimeout(function () {
        setCopied(false);
      }, 1500);
    } catch (error) {
      setCopied(false);
    }
  }

  function clearHistory() {
    setHistory([]);
  }

  function useHistory(value) {
    setPassphrase(value);
    setCopied(false);
  }

  function applyPreset(type) {
    if (type === "easy") {
      setWordCount(4);
      setSeparator("-");
      setCapitalize(false);
      setAddNumber(true);
      setNumberPosition("end");
      setAddSymbol(false);
      setSymbolPosition("end");
      return;
    }

    if (type === "strong") {
      setWordCount(5);
      setSeparator("-");
      setCapitalize(true);
      setAddNumber(true);
      setNumberPosition("end");
      setAddSymbol(true);
      setSymbolPosition("end");
      return;
    }

    if (type === "maximum") {
      setWordCount(7);
      setSeparator("random");
      setCapitalize(true);
      setAddNumber(true);
      setNumberPosition("end");
      setAddSymbol(true);
      setSymbolPosition("end");
    }
  }

  const options = buildOptions();
  const entropy = calculateEntropy(options);
  const strength = getStrength(entropy);
  const crackTime = estimateCrackTime(entropy);

  const style = `
    .passphrase-tool {
      --pg-text: #172033;
      --pg-muted: #667085;
      --pg-border: #e4e7ec;
      --pg-card: #ffffff;
      --pg-soft: #f7f8fb;
      --pg-primary: #635bff;
      --pg-primary-soft: rgba(99,91,255,.10);

      width: 100%;
      color: var(--pg-text);
      font-family: inherit;
    }

    .passphrase-tool,
    .passphrase-tool * {
      box-sizing: border-box;
    }

    .pg-wrapper {
      width: 100%;
      max-width: 1180px;
      margin: 0 auto;
    }

    .pg-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      margin-bottom: 20px;
    }

    .pg-eyebrow {
      color: var(--pg-primary);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .15em;
      text-transform: uppercase;
    }

    .pg-title {
      margin: 6px 0 0;
      font-size: clamp(28px, 4vw, 42px);
      line-height: 1.04;
      letter-spacing: -.045em;
    }

    .pg-description {
      margin: 9px 0 0;
      max-width: 680px;
      color: var(--pg-muted);
      font-size: 12px;
      line-height: 1.65;
    }

    .pg-main {
      display: grid;
      grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
      gap: 18px;
    }

    .pg-panel {
      border: 1px solid var(--pg-border);
      border-radius: 16px;
      background: var(--pg-card);
      box-shadow: 0 8px 30px rgba(16,24,40,.035);
    }

    .pg-settings {
      padding: 22px;
    }

    .pg-section-title {
      margin: 0;
      font-size: 17px;
      letter-spacing: -.025em;
    }

    .pg-section-subtitle {
      margin: 5px 0 18px;
      color: var(--pg-muted);
      font-size: 11px;
      line-height: 1.6;
    }

    .pg-label {
      display: block;
      margin: 15px 0 7px;
      font-size: 10px;
      font-weight: 800;
    }

    .pg-range-row {
      display: grid;
      grid-template-columns: 1fr 50px;
      gap: 10px;
      align-items: center;
    }

    .pg-range {
      width: 100%;
      accent-color: var(--pg-primary);
      cursor: pointer;
    }

    .pg-number-box {
      display: grid;
      place-items: center;
      height: 38px;
      border: 1px solid var(--pg-border);
      border-radius: 8px;
      background: var(--pg-soft);
      font-size: 12px;
      font-weight: 800;
    }

    .pg-select {
      width: 100%;
      height: 42px;
      padding: 0 10px;
      border: 1px solid var(--pg-border);
      border-radius: 9px;
      outline: none;
      background: var(--pg-card);
      color: var(--pg-text);
      font: inherit;
      font-size: 11px;
      cursor: pointer;
    }

    .pg-select:focus {
      border-color: var(--pg-primary);
      box-shadow: 0 0 0 3px var(--pg-primary-soft);
    }

    .pg-option-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 11px 0;
      border-bottom: 1px solid var(--pg-border);
    }

    .pg-option-info strong {
      display: block;
      font-size: 11px;
    }

    .pg-option-info span {
      display: block;
      margin-top: 3px;
      color: var(--pg-muted);
      font-size: 9px;
    }

    .pg-switch {
      position: relative;
      flex: 0 0 auto;
      width: 40px;
      height: 22px;
    }

    .pg-switch input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .pg-slider {
      position: absolute;
      inset: 0;
      border-radius: 20px;
      background: #d0d5dd;
      cursor: pointer;
      transition: .18s ease;
    }

    .pg-slider::before {
      content: "";
      position: absolute;
      width: 16px;
      height: 16px;
      left: 3px;
      top: 3px;
      border-radius: 50%;
      background: white;
      transition: .18s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,.18);
    }

    .pg-switch input:checked + .pg-slider {
      background: var(--pg-primary);
    }

    .pg-switch input:checked + .pg-slider::before {
      transform: translateX(18px);
    }

    .pg-presets {
      display: grid;
      grid-template-columns: repeat(3,1fr);
      gap: 7px;
      margin-top: 17px;
    }

    .pg-preset {
      min-height: 37px;
      border: 1px solid var(--pg-border);
      border-radius: 8px;
      background: var(--pg-soft);
      color: var(--pg-text);
      cursor: pointer;
      font: inherit;
      font-size: 9px;
      font-weight: 800;
    }

    .pg-preset:hover {
      border-color: var(--pg-primary);
    }

    .pg-generate {
      width: 100%;
      height: 46px;
      margin-top: 15px;
      border: 0;
      border-radius: 9px;
      background: var(--pg-primary);
      color: white;
      cursor: pointer;
      font: inherit;
      font-size: 11px;
      font-weight: 800;
      transition: transform .15s ease, opacity .15s ease;
    }

    .pg-generate:hover {
      opacity: .92;
      transform: translateY(-1px);
    }

    .pg-result {
      min-height: 100%;
      padding: 28px;
    }

    .pg-result-label {
      color: var(--pg-primary);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .13em;
    }

    .pg-output {
      display: flex;
      align-items: center;
      min-height: 126px;
      margin-top: 12px;
      padding: 22px;
      border: 1px solid var(--pg-border);
      border-radius: 13px;
      background: var(--pg-soft);
      overflow-x: auto;
    }

    .pg-output code {
      width: 100%;
      color: var(--pg-text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: clamp(18px, 2.6vw, 29px);
      line-height: 1.45;
      font-weight: 700;
      word-break: break-all;
    }

    .pg-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin-top: 10px;
    }

    .pg-action {
      height: 42px;
      border: 1px solid var(--pg-border);
      border-radius: 9px;
      background: var(--pg-card);
      color: var(--pg-text);
      cursor: pointer;
      font: inherit;
      font-size: 10px;
      font-weight: 800;
    }

    .pg-action.primary {
      border-color: var(--pg-primary);
      background: var(--pg-primary);
      color: white;
    }

    .pg-strength {
      margin-top: 22px;
    }

    .pg-strength-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .pg-strength-top span {
      color: var(--pg-muted);
      font-size: 10px;
    }

    .pg-strength-top strong {
      font-size: 11px;
    }

    .pg-strength-bar {
      height: 7px;
      margin-top: 8px;
      overflow: hidden;
      border-radius: 20px;
      background: var(--pg-border);
    }

    .pg-strength-fill {
      height: 100%;
      border-radius: inherit;
      background: var(--pg-primary);
      transition: width .25s ease;
    }

    .pg-metrics {
      display: grid;
      grid-template-columns: repeat(3,1fr);
      gap: 8px;
      margin-top: 14px;
    }

    .pg-metric {
      padding: 12px;
      border: 1px solid var(--pg-border);
      border-radius: 10px;
      background: var(--pg-soft);
    }

    .pg-metric span {
      display: block;
      color: var(--pg-muted);
      font-size: 8px;
    }

    .pg-metric strong {
      display: block;
      margin-top: 5px;
      font-size: 13px;
      word-break: break-word;
    }

    .pg-history {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid var(--pg-border);
    }

    .pg-history-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 9px;
    }

    .pg-history-head strong {
      font-size: 11px;
    }

    .pg-clear {
      border: 0;
      background: transparent;
      color: var(--pg-primary);
      cursor: pointer;
      font: inherit;
      font-size: 9px;
      font-weight: 800;
    }

    .pg-history-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid var(--pg-border);
    }

    .pg-history-item code {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: ui-monospace, monospace;
      font-size: 9px;
    }

    .pg-use {
      flex: 0 0 auto;
      padding: 5px 8px;
      border: 1px solid var(--pg-border);
      border-radius: 6px;
      background: var(--pg-card);
      color: var(--pg-text);
      cursor: pointer;
      font: inherit;
      font-size: 8px;
      font-weight: 700;
    }

    .pg-note {
      margin-top: 16px;
      color: var(--pg-muted);
      font-size: 9px;
      line-height: 1.6;
    }

    @media (max-width: 900px) {
      .pg-main {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .pg-top {
        flex-direction: column;
        align-items: stretch;
      }

      .pg-settings,
      .pg-result {
        padding: 16px;
      }

      .pg-presets {
        grid-template-columns: 1fr;
      }

      .pg-metrics {
        grid-template-columns: 1fr;
      }

      .pg-output {
        min-height: 105px;
        padding: 16px;
      }
    }

    @media (max-width: 400px) {
      .pg-actions {
        grid-template-columns: 1fr;
      }
    }

    .dark .passphrase-tool,
    body.dark .passphrase-tool,
    html.dark .passphrase-tool {
      --pg-text: #f2f4f7;
      --pg-muted: #98a2b3;
      --pg-border: #2d3442;
      --pg-card: #151922;
      --pg-soft: #10141c;
      --pg-primary: #8078ff;
      --pg-primary-soft: rgba(128,120,255,.13);
    }
  `;

  return (
    <>
      <div className="passphrase-tool">
        <div className="pg-wrapper">

          <div className="pg-top">
            <div>
              <div className="pg-eyebrow">
                PASSWORD SECURITY TOOL
              </div>

              <h1 className="pg-title">
                Passphrase Generator
              </h1>

              <p className="pg-description">
                Create memorable, high-entropy passphrases with
                custom word count, separators, numbers, symbols
                and smart security insights.
              </p>
            </div>
          </div>

          <div className="pg-main">

            <section className="pg-panel pg-settings">
              <h2 className="pg-section-title">
                Build your passphrase
              </h2>

              <p className="pg-section-subtitle">
                Customize the structure while keeping generation
                entirely inside your browser.
              </p>

              <label className="pg-label">
                Number of words
              </label>

              <div className="pg-range-row">
                <input
                  className="pg-range"
                  type="range"
                  min="3"
                  max="12"
                  value={wordCount}
                  onChange={(event) =>
                    setWordCount(Number(event.target.value))
                  }
                />

                <div className="pg-number-box">
                  {wordCount}
                </div>
              </div>

              <label className="pg-label">
                Word separator
              </label>

              <select
                className="pg-select"
                value={separator}
                onChange={(event) =>
                  setSeparator(event.target.value)
                }
              >
                <option value="-">Hyphen —</option>
                <option value="_">Underscore _</option>
                <option value=".">Dot .</option>
                <option value=" ">Space</option>
                <option value="~">Tilde ~</option>
                <option value="random">Random</option>
              </select>

              <div className="pg-option-row">
                <div className="pg-option-info">
                  <strong>Capitalize words</strong>
                  <span>Make the first letter uppercase</span>
                </div>

                <label className="pg-switch">
                  <input
                    type="checkbox"
                    checked={capitalize}
                    onChange={(event) =>
                      setCapitalize(event.target.checked)
                    }
                  />
                  <span className="pg-slider" />
                </label>
              </div>

              <div className="pg-option-row">
                <div className="pg-option-info">
                  <strong>Add random number</strong>
                  <span>Add a numeric component</span>
                </div>

                <label className="pg-switch">
                  <input
                    type="checkbox"
                    checked={addNumber}
                    onChange={(event) =>
                      setAddNumber(event.target.checked)
                    }
                  />
                  <span className="pg-slider" />
                </label>
              </div>

              {addNumber && (
                <select
                  className="pg-select"
                  value={numberPosition}
                  onChange={(event) =>
                    setNumberPosition(event.target.value)
                  }
                >
                  <option value="end">
                    Number at the end
                  </option>
                  <option value="start">
                    Number at the beginning
                  </option>
                </select>
              )}

              <div className="pg-option-row">
                <div className="pg-option-info">
                  <strong>Add random symbol</strong>
                  <span>Add ! @ # $ % & * or ?</span>
                </div>

                <label className="pg-switch">
                  <input
                    type="checkbox"
                    checked={addSymbol}
                    onChange={(event) =>
                      setAddSymbol(event.target.checked)
                    }
                  />
                  <span className="pg-slider" />
                </label>
              </div>

              {addSymbol && (
                <select
                  className="pg-select"
                  value={symbolPosition}
                  onChange={(event) =>
                    setSymbolPosition(event.target.value)
                  }
                >
                  <option value="end">
                    Symbol at the end
                  </option>
                  <option value="start">
                    Symbol at the beginning
                  </option>
                </select>
              )}

              <div className="pg-presets">
                <button
                  type="button"
                  className="pg-preset"
                  onClick={() => applyPreset("easy")}
                >
                  Easy to Remember
                </button>

                <button
                  type="button"
                  className="pg-preset"
                  onClick={() => applyPreset("strong")}
                >
                  Strong
                </button>

                <button
                  type="button"
                  className="pg-preset"
                  onClick={() => applyPreset("maximum")}
                >
                  Maximum
                </button>
              </div>

              <button
                type="button"
                className="pg-generate"
                onClick={generate}
              >
                Generate New Passphrase
              </button>
            </section>

            <section className="pg-panel pg-result">

              <div className="pg-result-label">
                GENERATED PASSPHRASE
              </div>

              <div className="pg-output">
                <code>
                  {passphrase || "Click Generate New Passphrase"}
                </code>
              </div>

              <div className="pg-actions">
                <button
                  type="button"
                  className="pg-action primary"
                  onClick={copyPassphrase}
                  disabled={!passphrase}
                >
                  {copied ? "✓ Copied" : "Copy Passphrase"}
                </button>

                <button
                  type="button"
                  className="pg-action"
                  onClick={regenerate}
                >
                  ↻ Regenerate
                </button>
              </div>

              <div className="pg-strength">
                <div className="pg-strength-top">
                  <span>Estimated strength</span>
                  <strong>{strength.label}</strong>
                </div>

                <div className="pg-strength-bar">
                  <div
                    className={
                      "pg-strength-fill " +
                      strength.className
                    }
                    style={{
                      width: strength.width
                    }}
                  />
                </div>
              </div>

              <div className="pg-metrics">

                <div className="pg-metric">
                  <span>ENTROPY</span>
                  <strong>
                    {entropy} bits
                  </strong>
                </div>

                <div className="pg-metric">
                  <span>WORDS</span>
                  <strong>
                    {wordCount}
                  </strong>
                </div>

                <div className="pg-metric">
                  <span>EST. CRACK TIME</span>
                  <strong>
                    {crackTime}
                  </strong>
                </div>

              </div>

              {history.length > 0 && (
                <div className="pg-history">

                  <div className="pg-history-head">
                    <strong>
                      Recent generations
                    </strong>

                    <button
                      type="button"
                      className="pg-clear"
                      onClick={clearHistory}
                    >
                      Clear
                    </button>
                  </div>

                  {history.map(function (item, index) {
                    return (
                      <div
                        className="pg-history-item"
                        key={item + "-" + index}
                      >
                        <code>{item}</code>

                        <button
                          type="button"
                          className="pg-use"
                          onClick={() =>
                            useHistory(item)
                          }
                        >
                          Use
                        </button>
                      </div>
                    );
                  })}

                </div>
              )}

              <div className="pg-note">
                Generated locally in your browser using the
                Web Crypto API when available. Passphrases are
                not sent to a server or stored remotely.
              </div>

            </section>

          </div>
        </div>
      </div>

      <style>{style}</style>
    </>
  );
}