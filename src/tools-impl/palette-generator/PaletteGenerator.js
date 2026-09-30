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
  var textColor = readableTextColor(color);

  return (
    <div className="flex flex-col min-w-0 border-r border-line last:border-r-0">
      <div
        className="relative flex items-end justify-between h-[245px] sm:h-[280px] p-3.5 transition-colors"
        style={{
          backgroundColor: color,
          color: textColor,
        }}
      >
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-white/20 border-0 text-inherit cursor-pointer backdrop-blur-md flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 shadow-sm"
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
          className="h-8 px-2.5 rounded-lg bg-white/20 border-0 text-inherit cursor-pointer backdrop-blur-md font-sans text-[9px] font-extrabold uppercase transition-transform hover:scale-105 shadow-sm"
          onClick={function () {
            onCopy(color);
          }}
        >
          Copy
        </button>
      </div>

      <div className="flex items-center gap-2 p-2.5 bg-paper border-t border-line">
        <input
          type="color"
          className="w-7 h-7 p-0 border-0 rounded cursor-pointer bg-transparent shrink-0"
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
          className="min-w-0 w-16 border-0 outline-0 bg-transparent text-ink font-mono text-[10px] font-extrabold uppercase"
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

        <span className="ml-auto text-muted font-mono text-[9px] font-bold">
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
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border">
      
      {/* HEADER SECTION */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border">
        <div>
          <div className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">DESIGN COLOR TOOL</div>
          <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">Palette Generator</h2>
          <p className="text-xs font-bold text-muted mt-0.5">Create balanced color palettes, lock colors, edit shades, and save combinations.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface border border-line text-ink text-xs font-black uppercase tracking-wider hover:border-brand/50 transition-colors"
            onClick={copyPalette}
          >
            {copied === "palette" ? "✓ Copied" : "Copy Palette"}
          </button>

          <button
            type="button"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-brand text-surface text-xs font-black uppercase tracking-wider shadow-sm transition-opacity hover:opacity-90"
            onClick={randomize}
          >
            ↻ Randomize
          </button>
        </div>
      </div>

      {/* MAIN PALETTE TOOLBAR & GRID */}
      <div className="bg-paper border border-line rounded-2xl shadow-sm overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-4 sm:p-5 border-b border-line bg-surface">
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-1.5 text-muted text-[10px] font-extrabold uppercase tracking-wider" htmlFor="pg-base">
              Base color
            </label>
            <div className="flex h-11 overflow-hidden border border-line rounded-xl bg-paper">
              <input
                id="pg-base"
                type="color"
                className="w-11 h-11 p-1 border-0 cursor-pointer bg-transparent shrink-0"
                value={baseColor}
                onChange={function (event) {
                  setBaseColor(event.target.value.toUpperCase());
                }}
              />
              <input
                className="w-full px-3 border-0 outline-none bg-transparent text-ink font-mono text-xs font-bold uppercase"
                value={baseColor}
                onChange={function (event) {
                  var value = event.target.value.toUpperCase();
                  if (/^#[0-9A-F]{0,6}$/.test(value)) {
                    setBaseColor(value);
                  }
                }}
                onBlur={function () {
                  if (!/^#[0-9A-F]{6}$/.test(baseColor)) {
                    setBaseColor("#635BFF");
                  }
                }}
                maxLength={7}
                spellCheck="false"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block mb-1.5 text-muted text-[10px] font-extrabold uppercase tracking-wider" htmlFor="pg-mode">
              Palette harmony
            </label>
            <select
              id="pg-mode"
              className="w-full h-11 px-3 border border-line rounded-xl outline-none bg-paper text-ink font-sans text-xs font-bold cursor-pointer"
              value={mode}
              onChange={function (event) {
                setMode(event.target.value);
              }}
            >
              <option value="random">Color Harmony</option>
              <option value="monochromatic">Monochromatic</option>
              <option value="analogous">Analogous</option>
              <option value="complementary">Complementary</option>
            </select>
          </div>

          <button
            type="button"
            className="h-11 px-6 rounded-xl bg-brand text-surface text-xs font-black uppercase tracking-wider shadow-sm transition-opacity hover:opacity-90 shrink-0"
            onClick={generate}
          >
            Generate Palette
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 min-h-[310px]">
          {colors.map(function (color, index) {
            return (
              <ColorCard
                key={index}
                color={color}
                index={index}
                locked={locked[index]}
                onChange={changeColor}
                onCopy={copyColor}
                onToggleLock={toggleLock}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-3 p-4 border-t border-line bg-surface">
          <span className="grid place-items-center w-6 h-6 rounded-lg bg-surface border border-line text-brand text-xs font-black">⌘</span>
          <p className="m-0 text-muted text-[10px] font-bold">Lock any color to keep it while generating a new palette.</p>
          <button
            type="button"
            className="ml-auto border-0 bg-transparent text-brand text-[10px] font-extrabold uppercase cursor-pointer hover:underline"
            onClick={savePalette}
          >
            + Save palette
          </button>
        </div>

      </div>

      {copied && copied !== "palette" ? (
        <div className="fixed right-6 bottom-6 z-50 px-3.5 py-2.5 rounded-xl bg-ink text-surface text-xs font-extrabold shadow-xl">
          ✓ {copied} copied
        </div>
      ) : null}

      {/* ACCESSIBILITY CHECK SECTION */}
      <div className="bg-paper border border-line p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight">Accessibility check</h2>
            <p className="text-xs font-bold text-muted mt-0.5">Quickly see how each palette color performs with black and white text.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {colors.map(function (color, index) {
            var blackRatio = contrastRatio(color, "#000000");
            var whiteRatio = contrastRatio(color, "#FFFFFF");

            return (
              <div className="overflow-hidden border border-line rounded-xl bg-surface" key={index}>
                <div
                  className="flex items-end h-[75px] p-3 text-white text-[10px] font-black font-mono shadow-inner"
                  style={{ backgroundColor: color }}
                >
                  {color}
                </div>
                <div className="grid grid-cols-2 gap-2 p-3 bg-paper border-t border-line text-xs">
                  <div>
                    <span className="block text-[8px] font-extrabold text-muted uppercase">Black</span>
                    <strong className="block mt-0.5 font-mono text-[11px] text-ink">{blackRatio.toFixed(2)}:1</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] font-extrabold text-muted uppercase">White</span>
                    <strong className="block mt-0.5 font-mono text-[11px] text-ink">{whiteRatio.toFixed(2)}:1</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK PALETTES PRESETS */}
      <div className="bg-paper border border-line p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink tracking-tight">Quick palettes</h2>
            <p className="text-xs font-bold text-muted mt-0.5">Start from a professionally balanced preset.</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-surface border border-line text-ink text-xs font-black uppercase tracking-wider hover:border-brand/50 transition-colors"
            onClick={reset}
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {PRESETS.map(function (preset) {
            return (
              <button
                type="button"
                className="overflow-hidden p-0 pb-3 border border-line rounded-xl bg-surface text-left cursor-pointer transition-transform hover:scale-[1.02]"
                key={preset.name}
                onClick={function () {
                  applyPreset(preset);
                }}
              >
                <div className="flex h-14 w-full">
                  {preset.colors.map(function (color) {
                    return (
                      <span
                        key={color}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    );
                  })}
                </div>
                <strong className="block mt-2.5 px-3 text-xs font-black text-ink">{preset.name}</strong>
                <span className="block mt-0.5 px-3 text-[9px] font-extrabold text-muted uppercase">Use preset</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SAVED PALETTES */}
      {saved.length > 0 ? (
        <div className="bg-paper border border-line p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-ink tracking-tight">Saved palettes</h2>
              <p className="text-xs font-bold text-muted mt-0.5">Your recent palettes are kept locally while this page is open.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {saved.map(function (palette, paletteIndex) {
              return (
                <button
                  type="button"
                  className="overflow-hidden p-0 pb-2.5 border border-line rounded-xl bg-surface text-left cursor-pointer transition-transform hover:scale-[1.02]"
                  key={paletteIndex}
                  onClick={function () {
                    loadPalette(palette);
                  }}
                >
                  <div className="flex h-11 w-full">
                    {palette.map(function (color) {
                      return (
                        <span
                          key={color}
                          className="flex-1"
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                  </div>
                  <small className="block mt-2 px-3 text-[9px] font-extrabold text-muted uppercase">
                    Palette {paletteIndex + 1}
                  </small>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2 px-1 pt-1">
        <span className="text-emerald-500 font-black">✓</span>
        <p className="m-0 text-muted text-[10px] font-bold">All palette generation and color calculations happen locally in your browser. Nothing is uploaded.</p>
      </div>

    </div>
  );
}