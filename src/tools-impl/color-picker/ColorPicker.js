"use client";

import React from "react";

const COLOR_NAMES = [
  ["#F44336", "Red"],
  ["#E91E63", "Pink"],
  ["#9C27B0", "Purple"],
  ["#673AB7", "Deep Purple"],
  ["#3F51B5", "Indigo"],
  ["#2196F3", "Blue"],
  ["#03A9F4", "Light Blue"],
  ["#00BCD4", "Cyan"],
  ["#009688", "Teal"],
  ["#4CAF50", "Green"],
  ["#8BC34A", "Light Green"],
  ["#CDDC39", "Lime"],
  ["#FFC107", "Amber"],
  ["#FF9800", "Orange"],
  ["#FF5722", "Deep Orange"],
  ["#795548", "Brown"],
  ["#607D8B", "Blue Grey"],
  ["#111111", "Near Black"],
  ["#FFFFFF", "White"],
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function componentToHex(value) {
  return Math.round(value).toString(16).padStart(2, "0");
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    componentToHex(r) +
    componentToHex(g) +
    componentToHex(b)
  ).toUpperCase();
}

function hexToRgb(hex) {
  if (!hex) return null;
  var value = String(hex).trim().replace("#", "");
  if (value.length === 3) {
    value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return null;
  }
  return {
    r: parseInt(value.substring(0, 2), 16),
    g: parseInt(value.substring(2, 4), 16),
    b: parseInt(value.substring(4, 6), 16),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s;
  var l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;

  var c = (1 - Math.abs(2 * l - 1)) * s;
  var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  var m = l - c / 2;
  var r1 = 0, g1 = 0, b1 = 0;

  if (h < 60) { r1 = c; g1 = x; }
  else if (h < 120) { r1 = x; g1 = c; }
  else if (h < 180) { g1 = c; b1 = x; }
  else if (h < 240) { g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; b1 = c; }
  else { r1 = c; b1 = x; }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToCmyk(r, g, b) {
  var rr = r / 255, gg = g / 255, bb = b / 255;
  var k = 1 - Math.max(rr, gg, bb);
  if (k >= 0.999999) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function relativeLuminance(rgb) {
  var values = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(function (value) {
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

function contrastRatio(rgb1, rgb2) {
  var l1 = relativeLuminance(rgb1);
  var l2 = relativeLuminance(rgb2);
  var lighter = Math.max(l1, l2);
  var darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixColors(color1, color2, amount) {
  return rgbToHex(
    color1.r + (color2.r - color1.r) * amount,
    color1.g + (color2.g - color1.g) * amount,
    color1.b + (color2.b - color1.b) * amount
  );
}

function shiftHue(hex, degrees) {
  var rgb = hexToRgb(hex);
  if (!rgb) return hex;
  var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  var nextH = (hsl.h + degrees + 360) % 360;
  var nextRgb = hslToRgb(nextH, hsl.s, hsl.l);
  return rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
}

function getTextColor(hex) {
  var rgb = hexToRgb(hex);
  if (!rgb) return "#111111";
  return relativeLuminance(rgb) > 0.179 ? "#111111" : "#FFFFFF";
}

function colorDistance(a, b) {
  return Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2));
}

function simulateColorBlindness(rgb, type) {
  var r = rgb.r, g = rgb.g, b = rgb.b;
  var nr = r, ng = g, nb = b;
  if (type === "protanopia") {
    nr = 0.567 * r + 0.433 * g;
    ng = 0.558 * r + 0.442 * g;
    nb = 0.242 * g + 0.758 * b;
  }
  if (type === "deuteranopia") {
    nr = 0.625 * r + 0.375 * g;
    ng = 0.7 * r + 0.3 * g;
    nb = 0.3 * g + 0.7 * b;
  }
  if (type === "tritanopia") {
    nr = 0.95 * r + 0.05 * g;
    ng = 0.433 * g + 0.567 * b;
    nb = 0.475 * g + 0.525 * b;
  }
  return { r: clamp(nr, 0, 255), g: clamp(ng, 0, 255), b: clamp(nb, 0, 255) };
}

function randomHex() {
  var value = Math.floor(Math.random() * 16777215);
  return ("#" + value.toString(16).padStart(6, "0")).toUpperCase();
}

function getColorName(hex) {
  var rgb = hexToRgb(hex);
  if (!rgb) return "Custom Color";
  var closest = COLOR_NAMES[0];
  var smallest = Infinity;
  COLOR_NAMES.forEach(function (item) {
    var candidate = hexToRgb(item[0]);
    if (!candidate) return;
    var distance = colorDistance(rgb, candidate);
    if (distance < smallest) {
      smallest = distance;
      closest = item;
    }
  });
  return closest[1];
}

export default class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      color: "#635BFF",
      inputValue: "#635BFF",
      copied: "",
      history: ["#635BFF"],
      contrastBackground: "#FFFFFF",
      contrastText: "#111111",
      activeBlindness: "normal",
    };

    this.setColor = this.setColor.bind(this);
    this.handleHexInput = this.handleHexInput.bind(this);
    this.copyText = this.copyText.bind(this);
    this.randomize = this.randomize.bind(this);
    this.reset = this.reset.bind(this);
  }

  setColor(value, addHistory) {
    var rgb = hexToRgb(value);
    if (!rgb) return;
    var hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    this.setState(function (current) {
      var nextHistory = current.history.slice();
      if (addHistory !== false) {
        nextHistory = [hex, ...nextHistory.filter(function (item) { return item !== hex; })].slice(0, 8);
      }
      return {
        color: hex,
        inputValue: hex,
        history: nextHistory,
      };
    });
  }

  handleHexInput(event) {
    var value = event.target.value.toUpperCase();
    this.setState({ inputValue: value });
    if (/^#?[0-9A-F]{6}$/i.test(value)) {
      this.setColor(value.charAt(0) === "#" ? value : "#" + value);
    }
    if (/^#?[0-9A-F]{3}$/i.test(value)) {
      var clean = value.replace("#", "");
      this.setColor("#" + clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]);
    }
  }

  copyText(text, label) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function () {
      this.setState({ copied: label });
      setTimeout(function () { this.setState({ copied: "" }); }.bind(this), 1300);
    }.bind(this)).catch(function () {});
  }

  randomize() {
    this.setColor(randomHex(), true);
  }

  reset() {
    this.setState({
      color: "#635BFF",
      inputValue: "#635BFF",
      copied: "",
      history: ["#635BFF"],
      contrastBackground: "#FFFFFF",
      contrastText: "#111111",
      activeBlindness: "normal",
    });
  }

  render() {
    var state = this.state;
    var color = state.color;
    var rgb = hexToRgb(color) || { r: 99, g: 91, b: 255 };
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    var cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    var white = { r: 255, g: 255, b: 255 };
    var black = { r: 17, g: 17, b: 17 };
    var whiteContrast = contrastRatio(rgb, white);
    var blackContrast = contrastRatio(rgb, black);
    var bestText = whiteContrast > blackContrast ? "#FFFFFF" : "#111111";
    var bestContrast = Math.max(whiteContrast, blackContrast);

    var contrastBg = hexToRgb(state.contrastBackground) || white;
    var contrastFg = hexToRgb(state.contrastText) || black;
    var customContrast = contrastRatio(contrastBg, contrastFg);
    var wcagAA = customContrast >= 4.5;
    var wcagAALarge = customContrast >= 3;
    var wcagAAA = customContrast >= 7;

    var tints = [
      mixColors(rgb, white, 0.15),
      mixColors(rgb, white, 0.3),
      mixColors(rgb, white, 0.5),
      mixColors(rgb, white, 0.7),
      mixColors(rgb, white, 0.85),
    ];
    var shades = [
      mixColors(rgb, black, 0.15),
      mixColors(rgb, black, 0.3),
      mixColors(rgb, black, 0.5),
      mixColors(rgb, black, 0.7),
      mixColors(rgb, black, 0.85),
    ];

    var complementary = shiftHue(color, 180);
    var analogousLeft = shiftHue(color, -30);
    var analogousRight = shiftHue(color, 30);
    var triadicLeft = shiftHue(color, 120);
    var triadicRight = shiftHue(color, 240);
    var splitLeft = shiftHue(color, 150);
    var splitRight = shiftHue(color, 210);

    var cssVariable = "--primary-color: " + color + ";";
    var cssBackground = "background-color: " + color + ";";
    var rgbString = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
    var rgbaString = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1)";
    var hslString = "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
    var cmykString = "cmyk(" + cmyk.c + "%, " + cmyk.m + "%, " + cmyk.y + "%, " + cmyk.k + "%)";

    var blindRgb = state.activeBlindness === "normal" ? rgb : simulateColorBlindness(rgb, state.activeBlindness);
    var blindHex = rgbToHex(blindRgb.r, blindRgb.g, blindRgb.b);
    var backgroundText = getTextColor(color);
    var name = getColorName(color);

    var copyButton = function (value, label) {
      return (
        <button
          type="button"
          className="absolute top-2 right-2 border-0 bg-transparent text-muted hover:text-brand cursor-pointer text-[9px] font-bold"
          onClick={() => this.copyText(value, label)}
        >
          Copy
        </button>
      );
    }.bind(this);

    var valueCard = function (label, value, key) {
      return (
        <div className="relative min-w-0 p-3 border border-line rounded-xl bg-surface" key={key}>
          <span className="block text-muted text-[9px] font-bold uppercase tracking-wider">{label}</span>
          <span className="block mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs font-black text-ink">{value}</span>
          {copyButton(value, label)}
        </div>
      );
    }.bind(this);

    var paletteColors = [color, analogousLeft, complementary, analogousRight, triadicLeft];
    var harmonyColors = [
      ["Base", color],
      ["Analogous −30", analogousLeft],
      ["Analogous +30", analogousRight],
      ["Complement", complementary],
      ["Triadic +120", triadicLeft],
      ["Split −", splitLeft],
      ["Split +", splitRight],
    ];
    var blindnessCards = [
      ["Normal", rgb, "normal"],
      ["Protanopia", simulateColorBlindness(rgb, "protanopia"), "protanopia"],
      ["Deuteranopia", simulateColorBlindness(rgb, "deuteranopia"), "deuteranopia"],
      ["Tritanopia", simulateColorBlindness(rgb, "tritanopia"), "tritanopia"],
    ];

    return (
      <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border">
        
        {/* COMPACT SLEEK HEADER BAR */}
        <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border">
          <div>
            <div className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">DESIGN & COLOR TOOL</div>
            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">Color Picker</h1>
            <p className="text-xs font-bold text-muted mt-0.5">Pick, inspect, convert, and test colors with professional toolsets.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button type="button" onClick={this.reset} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface border border-line text-ink text-xs font-black uppercase tracking-wider hover:border-brand/50 transition-colors">
              Reset
            </button>
            <button type="button" onClick={this.randomize} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-brand text-surface text-xs font-black uppercase tracking-wider shadow-sm transition-opacity hover:opacity-90">
              Random Color
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.1fr] gap-6 items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* PICKER CARD */}
            <div className="bg-paper border border-line rounded-2xl shadow-sm overflow-hidden">
              <div
                className="min-h-[220px] p-6 flex items-end justify-between transition-colors"
                style={{ backgroundColor: color, color: backgroundText }}
              >
                <div>
                  <div className="text-xs font-black opacity-80 uppercase tracking-wider">{name}</div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tighter mt-1 font-mono">{color}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] opacity-70 uppercase font-bold">Best text</div>
                  <div className="text-xs font-black">{bestText}</div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider block">Select Color</label>
                <div className="grid grid-cols-[52px,1fr,auto] gap-2.5">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => this.setColor(e.target.value)}
                    className="w-[52px] h-11 p-1 border border-line rounded-xl bg-surface cursor-pointer"
                  />
                  <input
                    type="text"
                    value={state.inputValue}
                    onChange={this.handleHexInput}
                    maxLength={7}
                    className="w-full h-11 px-3 border border-line rounded-xl bg-surface text-ink text-xs font-black outline-none focus:border-brand font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={this.randomize}
                    className="px-4 h-11 border border-line rounded-xl bg-surface text-ink text-[10px] font-black uppercase tracking-wider hover:border-brand transition-colors"
                  >
                    ✦ Random
                  </button>
                </div>
              </div>
            </div>

            {/* COLOR VALUES */}
            <div className="bg-paper border border-line p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-ink">Color Values</h2>
                <span className="text-[9px] font-bold text-muted uppercase">Click copy on any value</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {valueCard("HEX", color, "hex")}
                {valueCard("RGB", rgbString, "rgb")}
                {valueCard("RGBA", rgbaString, "rgba")}
                {valueCard("HSL", hslString, "hsl")}
                {valueCard("CMYK", cmykString, "cmyk")}
                {valueCard("Color Name", name, "name")}
              </div>
            </div>

            {/* QUICK PALETTE */}
            <div className="bg-paper border border-line p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-ink">Quick Palette</h2>
                <span className="text-[9px] font-bold text-muted uppercase">Click swatch to use</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {paletteColors.map((item, index) => (
                  <button
                    key={item + index}
                    type="button"
                    className="h-16 rounded-xl border border-line relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: item, color: getTextColor(item) }}
                    onClick={() => this.setColor(item)}
                  >
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[8px] font-black font-mono truncate px-1 rounded bg-black/20 text-white">
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* ACCESSIBILITY / CONTRAST */}
            <div className="bg-paper border border-line p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-ink">Accessibility</h2>
                <span className="text-[9px] font-bold text-muted uppercase">WCAG Contrast Analysis</span>
              </div>

              <div className="p-4 rounded-xl border border-line" style={{ backgroundColor: color, color: bestText }}>
                <strong className="text-base font-black block">Aa — Readability Test</strong>
                <small className="text-[10px] opacity-80 block mt-1">Best automatic text color: {bestText}</small>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-line space-y-3">
                <div className="text-2xl font-black font-mono text-ink">{bestContrast.toFixed(2)}:1</div>
                <div className="text-[10px] font-bold text-muted uppercase">Best contrast ratio against black / white</div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${bestContrast >= 4.5 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                    AA Normal {bestContrast >= 4.5 ? "Pass" : "Fail"}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${bestContrast >= 3 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                    AA Large {bestContrast >= 3 ? "Pass" : "Fail"}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${bestContrast >= 7 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                    AAA {bestContrast >= 7 ? "Pass" : "Fail"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-muted">Background</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={state.contrastBackground}
                      onChange={(e) => this.setState({ contrastBackground: e.target.value.toUpperCase() })}
                      className="w-10 h-10 p-1 border border-line rounded-xl bg-surface cursor-pointer"
                    />
                    <input
                      type="text"
                      value={state.contrastBackground}
                      onChange={(e) => this.setState({ contrastBackground: e.target.value.toUpperCase() })}
                      className="w-full h-10 px-2.5 border border-line rounded-xl bg-surface text-xs font-mono font-bold uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-muted">Text</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={state.contrastText}
                      onChange={(e) => this.setState({ contrastText: e.target.value.toUpperCase() })}
                      className="w-10 h-10 p-1 border border-line rounded-xl bg-surface cursor-pointer"
                    />
                    <input
                      type="text"
                      value={state.contrastText}
                      onChange={(e) => this.setState({ contrastText: e.target.value.toUpperCase() })}
                      className="w-full h-10 px-2.5 border border-line rounded-xl bg-surface text-xs font-mono font-bold uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTIONS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* TINTS & SHADES */}
          <div className="bg-paper border border-line p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-ink">Tints & Shades</h2>
              <span className="text-[9px] font-bold text-muted uppercase">White → Base → Black</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-11 gap-1.5">
              {tints.map((item, index) => (
                <button
                  type="button"
                  key={"tint-" + index}
                  className="h-12 rounded-lg border border-line cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: item }}
                  onClick={() => this.setColor(item)}
                  title={item}
                />
              ))}
              <button
                type="button"
                className="h-12 rounded-lg border-2 border-brand cursor-pointer transition-transform hover:scale-105"
                style={{ backgroundColor: color }}
                onClick={() => this.setColor(color)}
                title={color}
              />
              {shades.map((item, index) => (
                <button
                  type="button"
                  key={"shade-" + index}
                  className="h-12 rounded-lg border border-line cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: item }}
                  onClick={() => this.setColor(item)}
                  title={item}
                />
              ))}
            </div>
          </div>

          {/* COLOR HARMONIES */}
          <div className="bg-paper border border-line p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-ink">Color Harmonies</h2>
              <span className="text-[9px] font-bold text-muted uppercase">Designer Relationships</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {harmonyColors.map((item) => (
                <button
                  type="button"
                  key={item[0]}
                  className="p-1 rounded-xl bg-surface border border-line cursor-pointer text-center group hover:border-brand transition-all"
                  onClick={() => this.setColor(item[1])}
                >
                  <div className="h-12 rounded-lg mb-1.5 border border-line" style={{ backgroundColor: item[1] }} />
                  <span className="block text-[8px] font-bold text-muted truncate">{item[0]}</span>
                  <span className="block text-[8px] font-mono font-black text-ink">{item[1]}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* COLOR BLINDNESS & DEVELOPER OUTPUT ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* COLOR BLINDNESS PREVIEW */}
          <div className="bg-paper border border-line p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-ink">Color Blindness Simulation</h2>
              <span className="text-[9px] font-bold text-muted uppercase">Accessibility</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {blindnessCards.map((item) => {
                var blindHex = rgbToHex(item[1].r, item[1].g, item[1].b);
                var isSelected = state.activeBlindness === item[2];
                return (
                  <button
                    type="button"
                    key={item[0]}
                    className={`rounded-xl border overflow-hidden cursor-pointer text-left transition-all ${isSelected ? 'border-brand ring-2 ring-brand/20 bg-brand/5' : 'border-line bg-surface'}`}
                    onClick={() => this.setState({ activeBlindness: item[2] })}
                  >
                    <div className="h-16 border-b border-line" style={{ backgroundColor: blindHex }} />
                    <div className="p-2.5">
                      <strong className="text-[10px] font-black uppercase tracking-wider block text-ink">{item[0]}</strong>
                      <span className="text-[9px] font-mono font-bold text-muted block mt-0.5">{blindHex}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DEVELOPER OUTPUT */}
          <div className="bg-paper border border-line p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-ink">Developer Output</h2>
              <span className="text-[9px] font-bold text-muted uppercase">Ready for CSS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-surface border border-line rounded-xl space-y-2">
                <span className="block text-[9px] font-black uppercase tracking-wider text-muted">CSS Variable</span>
                <code className="block p-2 rounded-lg bg-paper border border-line font-mono text-[10px] text-ink overflow-x-auto">{cssVariable}</code>
                <button
                  type="button"
                  className="w-full py-1.5 rounded-lg bg-surface border border-line text-ink text-[10px] font-black uppercase tracking-wider hover:border-brand transition-colors"
                  onClick={() => this.copyText(cssVariable, "CSS variable")}
                >
                  Copy Variable
                </button>
              </div>
              <div className="p-3.5 bg-surface border border-line rounded-xl space-y-2">
                <span className="block text-[9px] font-black uppercase tracking-wider text-muted">Background CSS</span>
                <code className="block p-2 rounded-lg bg-paper border border-line font-mono text-[10px] text-ink overflow-x-auto">{cssBackground}</code>
                <button
                  type="button"
                  className="w-full py-1.5 rounded-lg bg-surface border border-line text-ink text-[10px] font-black uppercase tracking-wider hover:border-brand transition-colors"
                  onClick={() => this.copyText(cssBackground, "CSS background")}
                >
                  Copy Background
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RECENT COLORS & FOOTER */}
        <div className="bg-paper border border-line p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-ink">Recent Colors</h2>
            <span className="text-[9px] font-bold text-muted uppercase">Latest selections</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.history.map((item) => (
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 border border-line rounded-xl bg-surface cursor-pointer hover:border-brand transition-colors"
                key={item}
                onClick={() => this.setColor(item, false)}
              >
                <span className="w-4 h-4 rounded-md border border-line shrink-0" style={{ backgroundColor: item }} />
                <span className="font-mono text-xs font-black text-ink">{item}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px] font-bold text-muted text-center py-2">
          <strong className="text-ink">Privacy:</strong> All color calculations happen locally in your browser. No color data is uploaded to a server.
        </div>

        {state.copied ? (
          <div className="fixed right-6 bottom-6 z-50 px-4 py-3 rounded-xl bg-ink text-surface text-xs font-black shadow-card animate-bounce">
            ✓ {state.copied} copied
          </div>
        ) : null}

      </div>
    );
  }
}