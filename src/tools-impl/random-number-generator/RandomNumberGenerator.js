"use client";

import React, { useMemo, useState } from "react";

function randomInt(min, max) {
  var low = Math.ceil(min);
  var high = Math.floor(max);

  return Math.floor(
    Math.random() * (high - low + 1)
  ) + low;
}

function formatNumber(value) {
  return Number(value).toLocaleString();
}

export default function RandomNumberGenerator() {
  var [min, setMin] = useState("1");
  var [max, setMax] = useState("100");
  var [count, setCount] = useState("1");
  var [unique, setUnique] = useState(true);
  var [sortResults, setSortResults] =
    useState(false);
  var [allowDuplicates, setAllowDuplicates] =
    useState(false);

  var [numbers, setNumbers] =
    useState([]);

  var [copied, setCopied] =
    useState(false);

  var [error, setError] =
    useState("");

  var numericInfo = useMemo(
    function () {
      var minValue = Number(min);
      var maxValue = Number(max);
      var countValue = Number(count);

      return {
        min: minValue,
        max: maxValue,
        count: countValue,
      };
    },
    [min, max, count]
  );

  function generateNumbers() {
    setCopied(false);
    setError("");

    var low = numericInfo.min;
    var high = numericInfo.max;
    var amount = numericInfo.count;

    if (
      !Number.isFinite(low) ||
      !Number.isFinite(high)
    ) {
      setError(
        "Please enter valid minimum and maximum numbers."
      );
      return;
    }

    if (low > high) {
      setError(
        "Minimum value cannot be greater than maximum value."
      );
      return;
    }

    if (
      !Number.isInteger(low) ||
      !Number.isInteger(high)
    ) {
      setError(
        "Minimum and maximum values must be whole numbers."
      );
      return;
    }

    if (
      !Number.isInteger(amount) ||
      amount < 1 ||
      amount > 1000
    ) {
      setError(
        "Number of results must be between 1 and 1000."
      );
      return;
    }

    var available =
      high - low + 1;

    if (
      unique &&
      !allowDuplicates &&
      amount > available
    ) {
      setError(
        "There are not enough unique numbers in this range."
      );
      return;
    }

    var generated = [];

    if (
      unique &&
      !allowDuplicates
    ) {
      var pool = [];

      for (
        var i = low;
        i <= high;
        i += 1
      ) {
        pool.push(i);
      }

      for (
        var j = pool.length - 1;
        j > 0;
        j -= 1
      ) {
        var randomIndex =
          Math.floor(
            Math.random() * (j + 1)
          );

        var temp =
          pool[j];

        pool[j] =
          pool[randomIndex];

        pool[randomIndex] =
          temp;
      }

      generated =
        pool.slice(0, amount);
    } else {
      for (
        var k = 0;
        k < amount;
        k += 1
      ) {
        generated.push(
          randomInt(low, high)
        );
      }
    }

    if (sortResults) {
      generated.sort(
        function (a, b) {
          return a - b;
        }
      );
    }

    setNumbers(generated);
  }

  async function copyNumbers() {
    if (!numbers.length) {
      return;
    }

    var text =
      numbers.join("\n");

    try {
      if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(
          text
        );

        setCopied(true);

        setTimeout(
          function () {
            setCopied(false);
          },
          1500
        );
      }
    } catch (e) {
      setCopied(false);
    }
  }

  function clearResults() {
    setNumbers([]);
    setError("");
    setCopied(false);
  }

  function setPreset(
    presetMin,
    presetMax
  ) {
    setMin(String(presetMin));
    setMax(String(presetMax));
    setError("");
  }

  return (
    <>
      <style>{`
        .rng-tool {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          color: #172033;
          font-family: inherit;
        }

        .rng-tool *,
        .rng-tool *::before,
        .rng-tool *::after {
          box-sizing: border-box;
        }

        .rng-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 22px;
        }

        .rng-eyebrow {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .14em;
          color: #635bff;
        }

        .rng-title {
          margin: 6px 0 0;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1;
          letter-spacing: -.05em;
        }

        .rng-description {
          max-width: 650px;
          margin: 10px 0 0;
          color: #667085;
          font-size: 13px;
          line-height: 1.7;
        }

        .rng-grid {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 18px;
        }

        .rng-card {
          border: 1px solid #e4e7ec;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 8px 30px rgba(16,24,40,.035);
        }

        .rng-controls {
          padding: 22px;
        }

        .rng-card-title {
          font-size: 17px;
          font-weight: 750;
          letter-spacing: -.025em;
        }

        .rng-card-text {
          margin-top: 5px;
          color: #667085;
          font-size: 11px;
          line-height: 1.6;
        }

        .rng-label {
          display: block;
          margin: 17px 0 7px;
          font-size: 11px;
          font-weight: 750;
        }

        .rng-input {
          width: 100%;
          height: 44px;
          padding: 0 12px;
          border: 1px solid #e4e7ec;
          border-radius: 9px;
          background: #fff;
          color: #172033;
          outline: none;
          font: inherit;
          font-size: 12px;
        }

        .rng-input:focus {
          border-color: #635bff;
          box-shadow: 0 0 0 3px rgba(99,91,255,.10);
        }

        .rng-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .rng-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }

        .rng-preset {
          padding: 7px 9px;
          border: 1px solid #e4e7ec;
          border-radius: 7px;
          background: #f7f8fb;
          color: #344054;
          cursor: pointer;
          font: inherit;
          font-size: 9px;
          font-weight: 700;
        }

        .rng-options {
          display: grid;
          gap: 9px;
          margin-top: 19px;
        }

        .rng-check {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #344054;
          font-size: 11px;
          cursor: pointer;
        }

        .rng-check input {
          width: 15px;
          height: 15px;
          accent-color: #635bff;
        }

        .rng-generate {
          width: 100%;
          height: 45px;
          margin-top: 20px;
          border: 0;
          border-radius: 9px;
          background: #172033;
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
        }

        .rng-generate:hover {
          opacity: .92;
        }

        .rng-error {
          margin-top: 10px;
          padding: 10px;
          border-radius: 8px;
          background: #fff1f3;
          color: #c01048;
          font-size: 10px;
          line-height: 1.5;
        }

        .rng-output {
          min-height: 500px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(99,91,255,.09),
              transparent 40%
            ),
            #fff;
        }

        .rng-output-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e4e7ec;
        }

        .rng-output-title {
          font-size: 15px;
          font-weight: 750;
        }

        .rng-count {
          color: #667085;
          font-size: 9px;
        }

        .rng-actions {
          display: flex;
          gap: 7px;
        }

        .rng-action {
          min-height: 34px;
          padding: 0 11px;
          border: 1px solid #e4e7ec;
          border-radius: 8px;
          background: #fff;
          color: #344054;
          cursor: pointer;
          font: inherit;
          font-size: 9px;
          font-weight: 750;
        }

        .rng-results {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(105px, 1fr)
          );
          gap: 8px;
          margin-top: 18px;
          max-height: 410px;
          overflow-y: auto;
          padding-right: 3px;
        }

        .rng-number {
          min-height: 58px;
          padding: 10px;
          border: 1px solid #e4e7ec;
          border-radius: 9px;
          background: #f7f8fb;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 18px;
          font-weight: 750;
          letter-spacing: -.04em;
        }

        .rng-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 50px 20px;
        }

        .rng-empty-icon {
          display: grid;
          place-items: center;
          width: 55px;
          height: 55px;
          border-radius: 15px;
          background: rgba(99,91,255,.10);
          color: #635bff;
          font-size: 23px;
          margin-bottom: 15px;
        }

        .rng-empty h2 {
          margin: 0;
          font-size: 20px;
        }

        .rng-empty p {
          max-width: 330px;
          margin: 8px auto 0;
          color: #667085;
          font-size: 11px;
          line-height: 1.7;
        }

        .rng-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: auto;
          padding-top: 18px;
        }

        .rng-info-item {
          padding: 11px;
          border: 1px solid #e4e7ec;
          border-radius: 9px;
          background: #f7f8fb;
        }

        .rng-info-item span {
          display: block;
          color: #667085;
          font-size: 8px;
        }

        .rng-info-item strong {
          display: block;
          margin-top: 4px;
          font-size: 12px;
        }

        .rng-footer {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 13px;
          color: #667085;
          font-size: 9px;
        }

        .rng-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #12b76a;
        }

        @media (max-width: 850px) {
          .rng-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 550px) {
          .rng-header {
            align-items: stretch;
          }

          .rng-two {
            grid-template-columns: 1fr;
          }

          .rng-controls,
          .rng-output {
            padding: 16px;
          }

          .rng-output-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .rng-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="rng-tool">
        <div className="rng-header">
          <div>
            <div className="rng-eyebrow">
              UTILITY & RANDOMNESS
            </div>

            <h1 className="rng-title">
              Random Number Generator
            </h1>

            <p className="rng-description">
              Generate random numbers instantly with
              unique-number mode, bulk generation,
              sorting and one-click copying.
            </p>
          </div>
        </div>

        <div className="rng-grid">
          <div className="rng-card rng-controls">
            <div className="rng-card-title">
              Generation settings
            </div>

            <div className="rng-card-text">
              Define your range and choose how many
              random numbers you need.
            </div>

            <div className="rng-two">
              <div>
                <label
                  className="rng-label"
                  htmlFor="rng-min"
                >
                  Minimum
                </label>

                <input
                  id="rng-min"
                  className="rng-input"
                  type="number"
                  value={min}
                  onChange={function (event) {
                    setMin(event.target.value);
                  }}
                />
              </div>

              <div>
                <label
                  className="rng-label"
                  htmlFor="rng-max"
                >
                  Maximum
                </label>

                <input
                  id="rng-max"
                  className="rng-input"
                  type="number"
                  value={max}
                  onChange={function (event) {
                    setMax(event.target.value);
                  }}
                />
              </div>
            </div>

            <div className="rng-presets">
              <button
                type="button"
                className="rng-preset"
                onClick={function () {
                  setPreset(1, 10);
                }}
              >
                1–10
              </button>

              <button
                type="button"
                className="rng-preset"
                onClick={function () {
                  setPreset(1, 100);
                }}
              >
                1–100
              </button>

              <button
                type="button"
                className="rng-preset"
                onClick={function () {
                  setPreset(1, 1000);
                }}
              >
                1–1,000
              </button>

              <button
                type="button"
                className="rng-preset"
                onClick={function () {
                  setPreset(1, 1000000);
                }}
              >
                1–1M
              </button>
            </div>

            <label
              className="rng-label"
              htmlFor="rng-count"
            >
              Number of results
            </label>

            <input
              id="rng-count"
              className="rng-input"
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={function (event) {
                setCount(event.target.value);
              }}
            />

            <div className="rng-options">
              <label className="rng-check">
                <input
                  type="checkbox"
                  checked={unique}
                  onChange={function (event) {
                    setUnique(
                      event.target.checked
                    );
                  }}
                />
                Unique numbers only
              </label>

              <label className="rng-check">
                <input
                  type="checkbox"
                  checked={sortResults}
                  onChange={function (event) {
                    setSortResults(
                      event.target.checked
                    );
                  }}
                />
                Sort results from low to high
              </label>

              <label className="rng-check">
                <input
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={function (event) {
                    setAllowDuplicates(
                      event.target.checked
                    );
                  }}
                />
                Allow duplicates
              </label>
            </div>

            <button
              type="button"
              className="rng-generate"
              onClick={generateNumbers}
            >
              Generate Numbers
            </button>

            {error ? (
              <div className="rng-error">
                {error}
              </div>
            ) : null}
          </div>

          <div className="rng-card rng-output">
            <div className="rng-output-head">
              <div>
                <div className="rng-output-title">
                  Generated results
                </div>

                <div className="rng-count">
                  {numbers.length
                    ? numbers.length +
                      " number" +
                      (numbers.length === 1
                        ? ""
                        : "s") +
                      " generated"
                    : "Ready to generate"}
                </div>
              </div>

              {numbers.length ? (
                <div className="rng-actions">
                  <button
                    type="button"
                    className="rng-action"
                    onClick={copyNumbers}
                  >
                    {copied
                      ? "✓ Copied"
                      : "Copy all"}
                  </button>

                  <button
                    type="button"
                    className="rng-action"
                    onClick={clearResults}
                  >
                    Clear
                  </button>
                </div>
              ) : null}
            </div>

            {numbers.length ? (
              <div className="rng-results">
                {numbers.map(
                  function (number, index) {
                    return (
                      <div
                        className="rng-number"
                        key={
                          String(number) +
                          "-" +
                          String(index)
                        }
                      >
                        {formatNumber(number)}
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="rng-empty">
                <div className="rng-empty-icon">
                  ⤨
                </div>

                <h2>
                  Your numbers will appear here
                </h2>

                <p>
                  Set your range, choose the number
                  of results and click Generate
                  Numbers.
                </p>
              </div>
            )}

            <div className="rng-info">
              <div className="rng-info-item">
                <span>MINIMUM</span>
                <strong>
                  {formatNumber(
                    Number.isFinite(
                      numericInfo.min
                    )
                      ? numericInfo.min
                      : 0
                  )}
                </strong>
              </div>

              <div className="rng-info-item">
                <span>MAXIMUM</span>
                <strong>
                  {formatNumber(
                    Number.isFinite(
                      numericInfo.max
                    )
                      ? numericInfo.max
                      : 0
                  )}
                </strong>
              </div>

              <div className="rng-info-item">
                <span>MODE</span>
                <strong>
                  {unique &&
                  !allowDuplicates
                    ? "Unique"
                    : "Standard"}
                </strong>
              </div>
            </div>

            <div className="rng-footer">
              <span className="rng-dot" />
              Generation happens locally in your browser.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}