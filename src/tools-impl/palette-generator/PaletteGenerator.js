"use client";

import React, { useMemo, useState } from "react";

const INITIAL_COLORS = [
  "#635BFF",
  "#8B5CF6",
  "#EC4899",
  "#F97316",
  "#10B981",
];

const PRESETS = [
  {
    name: "Aurora",
    colors: ["#5B5FEF", "#7C5CFC", "#B14AED", "#E84BA5", "#FF6B6B"],
  },
  {
    name: "Ocean",
    colors: ["#0F172A", "#164E63", "#0891B2", "#06B6D4", "#67E8F9"],
  },
  {
    name: "Forest",
    colors: ["#172554", "#14532D", "#15803D", "#65A30D", "#A3E635"],
  },
  {
    name: "Sunset",
    colors: ["#4C1D95", "#7E22CE", "#DB2777", "#EA580C", "#F59E0B"],
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex) {
  var clean = hex.replace("#", "").trim();

  if (clean.length === 3) {
    clean =
      clean[0] +
      clean[0] +
      clean[1] +
      clean[1] +
      clean[2] +
      clean[2];
  }

  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return null;
  }

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  function toHex(value) {
    return Math.round(value)
      .toString(16)
      .padStart(2, "0");
  }

  return (
    "#" +
    toHex(clamp(r, 0, 255)) +
    toHex(clamp(g, 0, 255)) +
    toHex(clamp(b, 0, 255))
  ).toUpperCase();
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);

  var h = 0;
  var s = 0;
  var l = (max + min) / 2;

  if (max !== min) {
    var d = max - min;

    s =
      l > 0.5
        ? d / (2 - max - min)
        : d / (max + min);

    switch (max) {
      case r:
        h =
          (g - b) / d +
          (g < b ? 6 : 0);
        break;
      case g:
        h =
          (b - r) / d + 2;
        break;
      default:
        h =
          (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function getLuminance(hex) {
  var rgb = hexToRgb(hex);

  if (!rgb) {
    return 0;
  }

  var values = [rgb.r, rgb.g, rgb.b].map(function (value) {
    var channel = value / 255;

    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow(
          (channel + 0.055) / 1.055,
          2.4
        );
  });

  return (
    0.2126 * values[0] +
    0.7152 * values[1] +
    0.0722 * values[2]
  );
}

function contrastRatio(first, second) {
  var a = getLuminance(first);
  var b = getLuminance(second);

  var light = Math.max(a, b);
  var dark = Math.min(a, b);

  return (light + 0.05) / (dark + 0.05);
}

function readableTextColor(hex) {
  return getLuminance(hex) > 0.48
    ? "#111827"
    : "#FFFFFF";
}

function randomHex() {
  var value = Math.floor(
    Math.random() * 16777215
  );

  return (
    "#" +
    value
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  );
}

function generatePalette(baseColor, mode) {
  var rgb = hexToRgb(baseColor);

  if (!rgb) {
    return INITIAL_COLORS.slice();
  }

  var hsl = rgbToHsl(
    rgb.r,
    rgb.g,
    rgb.b
  );

  var result = [];

  if (mode === "monochromatic") {
    var lightnessValues = [
      18,
      32,
      48,
      66,
      84,
    ];

    lightnessValues.forEach(function (lightness) {
      result.push(
        hslToHex(
          hsl.h,
          hsl.s,
          lightness
        )
      );
    });
  } else if (mode === "analogous") {
    var offsets = [-30, -15, 0, 15, 30];

    offsets.forEach(function (offset) {
      result.push(
        hslToHex(
          (hsl.h + offset + 360) % 360,
          hsl.s,
          clamp(hsl.l, 25, 70)
        )
      );
    });
  } else if (mode === "complementary") {
    result = [
      hslToHex(hsl.h, hsl.s, hsl.l),
      hslToHex(
        (hsl.h + 180) % 360,
        hsl.s,
        hsl.l
      ),
      hslToHex(
        (hsl.h + 180) % 360,
        Math.max(20, hsl.s - 20),
        Math.min(85, hsl.l + 18)
      ),
      hslToHex(
        hsl.h,
        Math.max(20, hsl.s - 15),
        Math.min(85, hsl.l + 25)
      ),
      hslToHex(
        (hsl.h + 180) % 360,
        Math.max(20, hsl.s - 15),
        Math.max(15, hsl.l - 20)
      ),
    ];
  } else {
    var golden = [
      0,
      72,
      144,
      216,
      288,
    ];

    golden.forEach(function (offset) {
      result.push(
        hslToHex(
          (hsl.h + offset) % 360,
          clamp(hsl.s, 45, 90),
          clamp(hsl.l, 35, 68)
        )
      );
    });
  }

  return result;
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  var c =
    (1 - Math.abs(2 * l - 1)) * s;
  var x =
    c *
    (1 -
      Math.abs(
        ((h / 60) % 2) - 1
      ));
  var m = l - c / 2;

  var r = 0;
  var g = 0;
  var b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return rgbToHex(
    (r + m) * 255,
    (g + m) * 255,
    (b + m) * 255
  );
}

function ColorCard({
  color,
  index,
  locked,
  onChange,
  onCopy,
  onToggleLock,
}) {
  var textColor =
    readableTextColor(color);

  return (
    <div className="pg-color-card">
      <div
        className="pg-color-preview"
        style={{
          backgroundColor: color,
          color: textColor,
        }}
      >
        <button
          type="button"
          className="pg-lock"
          onClick={function () {
            onToggleLock(index);
          }}
          aria-label={
            locked
              ? "Unlock color"
              : "Lock color"
          }
        >
          {locked ? "🔒" : "⌕"}
        </button>

        <button
          type="button"
          className="pg-copy-light"
          onClick={function () {
            onCopy(color);
          }}
        >
          Copy
        </button>
      </div>

      <div className="pg-color-bottom">
        <input
          type="color"
          value={color}
          onChange={function (event) {
            onChange(
              index,
              event.target.value.toUpperCase()
            );
          }}
          aria-label={
            "Color " + (index + 1)
          }
        />

        <input
          className="pg-hex-input"
          value={color}
          onChange={function (event) {
            var value =
              event.target.value.toUpperCase();

            if (
              /^#[0-9A-F]{0,6}$/.test(value)
            ) {
              onChange(index, value);
            }
          }}
          onBlur={function () {
            if (
              !/^#[0-9A-F]{6}$/.test(color)
            ) {
              onChange(
                index,
                INITIAL_COLORS[index] ||
                  "#635BFF"
              );
            }
          }}
          maxLength={7}
          spellCheck="false"
        />

        <span className="pg-index">
          {index + 1}
        </span>
      </div>
    </div>
  );
}

export default function PaletteGenerator() {
  var [colors, setColors] =
    useState(INITIAL_COLORS);

  var [locked, setLocked] =
    useState([
      false,
      false,
      false,
      false,
      false,
    ]);

  var [baseColor, setBaseColor] =
    useState("#635BFF");

  var [mode, setMode] =
    useState("random");

  var [copied, setCopied] =
    useState("");

  var [saved, setSaved] =
    useState([]);

  var paletteText = useMemo(
    function () {
      return colors.join("\n");
    },
    [colors]
  );

  function generate() {
    var next = generatePalette(
      baseColor,
      mode
    );

    setColors(function (current) {
      return current.map(
        function (oldColor, index) {
          return locked[index]
            ? oldColor
            : next[index];
        }
      );
    });
  }

  function randomize() {
    setColors(function (current) {
      return current.map(
        function (color, index) {
          return locked[index]
            ? color
            : randomHex();
        }
      );
    });
  }

  function changeColor(index, value) {
    if (!/^#[0-9A-F]{6}$/.test(value)) {
      setColors(function (current) {
        var next = current.slice();
        next[index] = value;
        return next;
      });
      return;
    }

    setColors(function (current) {
      var next = current.slice();
      next[index] = value;
      return next;
    });
  }

  function toggleLock(index) {
    setLocked(function (current) {
      var next = current.slice();
      next[index] = !next[index];
      return next;
    });
  }

  function copyColor(color) {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard
    ) {
      return;
    }

    navigator.clipboard
      .writeText(color)
      .then(function () {
        setCopied(color);

        window.setTimeout(
          function () {
            setCopied("");
          },
          1200
        );
      })
      .catch(function () {});
  }

  function copyPalette() {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard
    ) {
      return;
    }

    navigator.clipboard
      .writeText(paletteText)
      .then(function () {
        setCopied("palette");

        window.setTimeout(
          function () {
            setCopied("");
          },
          1200
        );
      })
      .catch(function () {});
  }

  function savePalette() {
    var snapshot = colors.slice();

    setSaved(function (current) {
      return [snapshot].concat(
        current
      ).slice(0, 6);
    });
  }

  function loadPalette(palette) {
    setColors(palette.slice());

    setLocked([
      false,
      false,
      false,
      false,
      false,
    ]);
  }

  function applyPreset(preset) {
    setColors(preset.colors.slice());

    setLocked([
      false,
      false,
      false,
      false,
      false,
    ]);
  }

  function reset() {
    setColors(
      INITIAL_COLORS.slice()
    );

    setLocked([
      false,
      false,
      false,
      false,
      false,
    ]);

    setBaseColor("#635BFF");
    setMode("random");
    setCopied("");
  }

  return (
    <>
      <div className="palette-generator">
        <div className="pg-wrapper">
          <div className="pg-header">
            <div>
              <div className="pg-eyebrow">
                DESIGN COLOR TOOL
              </div>

              <h1>
                Palette Generator
              </h1>

              <p>
                Create balanced color palettes,
                lock the colors you love, edit
                individual shades, check contrast
                and save your favorite combinations.
              </p>
            </div>

            <div className="pg-header-actions">
              <button
                type="button"
                className="pg-secondary-button"
                onClick={copyPalette}
              >
                {copied === "palette"
                  ? "✓ Copied"
                  : "Copy Palette"}
              </button>

              <button
                type="button"
                className="pg-primary-button"
                onClick={randomize}
              >
                ↻ Randomize
              </button>
            </div>
          </div>

          <div className="pg-main-card">
            <div className="pg-toolbar">
              <div className="pg-control">
                <label htmlFor="pg-base">
                  Base color
                </label>

                <div className="pg-base-control">
                  <input
                    id="pg-base"
                    type="color"
                    value={baseColor}
                    onChange={function (
                      event
                    ) {
                      setBaseColor(
                        event.target.value.toUpperCase()
                      );
                    }}
                  />

                  <input
                    value={baseColor}
                    onChange={function (
                      event
                    ) {
                      var value =
                        event.target.value.toUpperCase();

                      if (
                        /^#[0-9A-F]{0,6}$/.test(
                          value
                        )
                      ) {
                        setBaseColor(value);
                      }
                    }}
                    onBlur={function () {
                      if (
                        !/^#[0-9A-F]{6}$/.test(
                          baseColor
                        )
                      ) {
                        setBaseColor(
                          "#635BFF"
                        );
                      }
                    }}
                    maxLength={7}
                    spellCheck="false"
                  />
                </div>
              </div>

              <div className="pg-control">
                <label htmlFor="pg-mode">
                  Palette harmony
                </label>

                <select
                  id="pg-mode"
                  value={mode}
                  onChange={function (
                    event
                  ) {
                    setMode(event.target.value);
                  }}
                >
                  <option value="random">
                    Color Harmony
                  </option>
                  <option value="monochromatic">
                    Monochromatic
                  </option>
                  <option value="analogous">
                    Analogous
                  </option>
                  <option value="complementary">
                    Complementary
                  </option>
                </select>
              </div>

              <button
                type="button"
                className="pg-generate-button"
                onClick={generate}
              >
                Generate Palette
              </button>
            </div>

            <div className="pg-palette-grid">
              {colors.map(function (
                color,
                index
              ) {
                return (
                  <ColorCard
                    key={index}
                    color={color}
                    index={index}
                    locked={locked[index]}
                    onChange={changeColor}
                    onCopy={copyColor}
                    onToggleLock={
                      toggleLock
                    }
                  />
                );
              })}
            </div>

            <div className="pg-tip">
              <span>⌘</span>
              <p>
                Lock any color to keep it while
                generating a new palette.
              </p>

              <button
                type="button"
                onClick={savePalette}
              >
                + Save palette
              </button>
            </div>
          </div>

          {copied && copied !== "palette" ? (
            <div className="pg-toast">
              ✓ {copied} copied
            </div>
          ) : null}

          <div className="pg-section">
            <div className="pg-section-heading">
              <div>
                <h2>
                  Accessibility check
                </h2>

                <p>
                  Quickly see how each palette
                  color performs with black and
                  white text.
                </p>
              </div>
            </div>

            <div className="pg-accessibility">
              {colors.map(function (
                color,
                index
              ) {
                var blackRatio =
                  contrastRatio(
                    color,
                    "#000000"
                  );

                var whiteRatio =
                  contrastRatio(
                    color,
                    "#FFFFFF"
                  );

                return (
                  <div
                    className="pg-access-card"
                    key={index}
                  >
                    <div
                      className="pg-access-color"
                      style={{
                        backgroundColor:
                          color,
                      }}
                    >
                      {color}
                    </div>

                    <div className="pg-ratios">
                      <div>
                        <span>
                          Black
                        </span>

                        <strong>
                          {blackRatio.toFixed(
                            2
                          )}
                          :1
                        </strong>
                      </div>

                      <div>
                        <span>
                          White
                        </span>

                        <strong>
                          {whiteRatio.toFixed(
                            2
                          )}
                          :1
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pg-section">
            <div className="pg-section-heading">
              <div>
                <h2>
                  Quick palettes
                </h2>

                <p>
                  Start from a professionally
                  balanced preset.
                </p>
              </div>

              <button
                type="button"
                className="pg-reset"
                onClick={reset}
              >
                Reset
              </button>
            </div>

            <div className="pg-presets">
              {PRESETS.map(function (
                preset
              ) {
                return (
                  <button
                    type="button"
                    className="pg-preset"
                    key={preset.name}
                    onClick={function () {
                      applyPreset(
                        preset
                      );
                    }}
                  >
                    <div className="pg-preset-colors">
                      {preset.colors.map(
                        function (
                          color
                        ) {
                          return (
                            <span
                              key={color}
                              style={{
                                backgroundColor:
                                  color,
                              }}
                            />
                          );
                        }
                      )}
                    </div>

                    <strong>
                      {preset.name}
                    </strong>

                    <span>
                      Use preset
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {saved.length > 0 ? (
            <div className="pg-section">
              <div className="pg-section-heading">
                <div>
                  <h2>
                    Saved palettes
                  </h2>

                  <p>
                    Your recent palettes are kept
                    locally while this page is open.
                  </p>
                </div>
              </div>

              <div className="pg-saved-grid">
                {saved.map(function (
                  palette,
                  paletteIndex
                ) {
                  return (
                    <button
                      type="button"
                      className="pg-saved"
                      key={paletteIndex}
                      onClick={function () {
                        loadPalette(
                          palette
                        );
                      }}
                    >
                      <div>
                        {palette.map(
                          function (
                            color
                          ) {
                            return (
                              <span
                                key={color}
                                style={{
                                  backgroundColor:
                                    color,
                                }}
                              />
                            );
                          }
                        )}
                      </div>

                      <small>
                        Palette{" "}
                        {paletteIndex +
                          1}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="pg-privacy">
            <span>✓</span>
            <p>
              All palette generation and color
              calculations happen locally in your
              browser. Nothing is uploaded.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .palette-generator {
          --pg-text: #172033;
          --pg-muted: #667085;
          --pg-border: #e4e7ec;
          --pg-card: #ffffff;
          --pg-soft: #f7f8fb;
          --pg-primary: #635bff;

          width: 100%;
          color: var(--pg-text);
          font-family: inherit;
        }

        .palette-generator *,
        .palette-generator *::before,
        .palette-generator *::after {
          box-sizing: border-box;
        }

        .pg-wrapper {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .pg-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .pg-eyebrow {
          color: var(--pg-primary);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .14em;
        }

        .pg-header h1 {
          margin: 6px 0 0;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1;
          letter-spacing: -.05em;
        }

        .pg-header p {
          max-width: 680px;
          margin: 10px 0 0;
          color: var(--pg-muted);
          font-size: 13px;
          line-height: 1.65;
        }

        .pg-header-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .pg-primary-button,
        .pg-secondary-button,
        .pg-generate-button,
        .pg-reset {
          height: 42px;
          padding: 0 15px;
          border-radius: 9px;
          font: inherit;
          font-size: 11px;
          font-weight: 750;
          cursor: pointer;
        }

        .pg-primary-button,
        .pg-generate-button {
          border: 1px solid var(--pg-primary);
          background: var(--pg-primary);
          color: #fff;
        }

        .pg-secondary-button,
        .pg-reset {
          border: 1px solid var(--pg-border);
          background: var(--pg-card);
          color: var(--pg-text);
        }

        .pg-main-card,
        .pg-section {
          border: 1px solid var(--pg-border);
          border-radius: 16px;
          background: var(--pg-card);
          box-shadow: 0 8px 30px rgba(16, 24, 40, .035);
        }

        .pg-main-card {
          overflow: hidden;
        }

        .pg-toolbar {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          padding: 18px;
          border-bottom: 1px solid var(--pg-border);
          background: var(--pg-soft);
        }

        .pg-control {
          min-width: 190px;
        }

        .pg-control label {
          display: block;
          margin-bottom: 6px;
          color: var(--pg-muted);
          font-size: 10px;
          font-weight: 750;
        }

        .pg-base-control {
          display: flex;
          height: 42px;
          overflow: hidden;
          border: 1px solid var(--pg-border);
          border-radius: 9px;
          background: #fff;
        }

        .pg-base-control input[type="color"] {
          width: 45px;
          height: 42px;
          padding: 4px;
          border: 0;
          cursor: pointer;
        }

        .pg-base-control input[type="text"],
        .pg-base-control input:not([type]) {
          min-width: 0;
          border: 0;
          outline: 0;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
        }

        .pg-base-control input:last-child {
          width: 105px;
          padding: 0 9px;
          border: 0;
          outline: none;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
          color: var(--pg-text);
        }

        .pg-control select {
          width: 100%;
          height: 42px;
          padding: 0 10px;
          border: 1px solid var(--pg-border);
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: var(--pg-text);
          font: inherit;
          font-size: 11px;
          cursor: pointer;
        }

        .pg-generate-button {
          min-width: 150px;
        }

        .pg-palette-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          min-height: 310px;
        }

        .pg-color-card {
          min-width: 0;
          border-right: 1px solid var(--pg-border);
        }

        .pg-color-card:last-child {
          border-right: 0;
        }

        .pg-color-preview {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 245px;
          padding: 13px;
        }

        .pg-lock,
        .pg-copy-light {
          border: 0;
          border-radius: 7px;
          background: rgba(255, 255, 255, .2);
          color: inherit;
          cursor: pointer;
          backdrop-filter: blur(8px);
        }

        .pg-lock {
          width: 30px;
          height: 30px;
          font-size: 13px;
        }

        .pg-copy-light {
          height: 30px;
          padding: 0 9px;
          font: inherit;
          font-size: 9px;
          font-weight: 800;
        }

        .pg-color-bottom {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px;
        }

        .pg-color-bottom input[type="color"] {
          width: 26px;
          height: 26px;
          padding: 0;
          border: 0;
          border-radius: 5px;
          cursor: pointer;
        }

        .pg-hex-input {
          min-width: 0;
          width: 76px;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--pg-text);
          font: inherit;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .pg-index {
          margin-left: auto;
          color: var(--pg-muted);
          font-size: 9px;
          font-weight: 700;
        }

        .pg-tip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 13px 18px;
          border-top: 1px solid var(--pg-border);
        }

        .pg-tip > span {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: var(--pg-soft);
          color: var(--pg-primary);
          font-size: 11px;
          font-weight: 900;
        }

        .pg-tip p {
          margin: 0;
          color: var(--pg-muted);
          font-size: 9px;
        }

        .pg-tip button {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: var(--pg-primary);
          font: inherit;
          font-size: 9px;
          font-weight: 800;
          cursor: pointer;
        }

        .pg-section {
          margin-top: 18px;
          padding: 20px;
        }

        .pg-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 17px;
        }

        .pg-section-heading h2 {
          margin: 0;
          font-size: 17px;
          letter-spacing: -.025em;
        }

        .pg-section-heading p {
          margin: 5px 0 0;
          color: var(--pg-muted);
          font-size: 10px;
          line-height: 1.6;
        }

        .pg-accessibility {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .pg-access-card {
          overflow: hidden;
          border: 1px solid var(--pg-border);
          border-radius: 10px;
        }

        .pg-access-color {
          display: flex;
          align-items: flex-end;
          height: 75px;
          padding: 9px;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
        }

        .pg-ratios {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 10px;
        }

        .pg-ratios span {
          display: block;
          color: var(--pg-muted);
          font-size: 8px;
        }

        .pg-ratios strong {
          display: block;
          margin-top: 3px;
          font-size: 11px;
        }

        .pg-presets {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .pg-preset {
          padding: 0 0 12px;
          overflow: hidden;
          border: 1px solid var(--pg-border);
          border-radius: 10px;
          background: var(--pg-card);
          text-align: left;
          cursor: pointer;
        }

        .pg-preset-colors {
          display: flex;
          height: 62px;
        }

        .pg-preset-colors span {
          flex: 1;
        }

        .pg-preset strong,
        .pg-preset > span {
          display: block;
          padding: 0 11px;
        }

        .pg-preset strong {
          margin-top: 10px;
          font-size: 11px;
        }

        .pg-preset > span {
          margin-top: 3px;
          color: var(--pg-muted);
          font-size: 8px;
        }

        .pg-saved-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .pg-saved {
          overflow: hidden;
          padding: 0 0 9px;
          border: 1px solid var(--pg-border);
          border-radius: 9px;
          background: var(--pg-card);
          text-align: left;
          cursor: pointer;
        }

        .pg-saved > div {
          display: flex;
          height: 45px;
        }

        .pg-saved > div span {
          flex: 1;
        }

        .pg-saved small {
          display: block;
          margin: 8px 9px 0;
          color: var(--pg-muted);
          font-size: 8px;
          font-weight: 700;
        }

        .pg-privacy {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          padding: 0 4px;
        }

        .pg-privacy span {
          color: #12b76a;
          font-weight: 900;
        }

        .pg-privacy p {
          margin: 0;
          color: var(--pg-muted);
          font-size: 9px;
        }

        .pg-toast {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 100;
          padding: 10px 14px;
          border-radius: 9px;
          background: #111827;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          box-shadow: 0 10px 30px rgba(0, 0, 0, .15);
        }

        @media (max-width: 900px) {
          .pg-header {
            flex-direction: column;
            align-items: stretch;
          }

          .pg-toolbar {
            flex-wrap: wrap;
          }

          .pg-control {
            flex: 1 1 180px;
          }

          .pg-palette-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .pg-color-card:nth-child(2) {
            border-right: 0;
          }

          .pg-color-card:nth-child(n + 3) {
            border-top: 1px solid var(--pg-border);
          }

          .pg-accessibility {
            grid-template-columns: repeat(2, 1fr);
          }

          .pg-presets {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .pg-header-actions {
            width: 100%;
          }

          .pg-header-actions button {
            flex: 1;
          }

          .pg-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .pg-generate-button {
            width: 100%;
          }

          .pg-palette-grid {
            grid-template-columns: 1fr;
          }

          .pg-color-card {
            border-right: 0;
            border-top: 1px solid var(--pg-border);
          }

          .pg-color-card:first-child {
            border-top: 0;
          }

          .pg-color-preview {
            height: 180px;
          }

          .pg-accessibility,
          .pg-presets,
          .pg-saved-grid {
            grid-template-columns: 1fr;
          }

          .pg-tip {
            align-items: flex-start;
          }
        }

        .dark .palette-generator,
        body.dark .palette-generator,
        html.dark .palette-generator {
          --pg-text: #f2f4f7;
          --pg-muted: #98a2b3;
          --pg-border: #2d3442;
          --pg-card: #151922;
          --pg-soft: #10141c;
          --pg-primary: #8078ff;
        }

        .dark .pg-base-control,
        .dark .pg-control select,
        body.dark .pg-base-control,
        body.dark .pg-control select,
        html.dark .pg-base-control,
        html.dark .pg-control select {
          background: #10141c;
          color: #f2f4f7;
        }
      `}</style>
    </>
  );
}