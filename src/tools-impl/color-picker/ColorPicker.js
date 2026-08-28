"use client";

import React from "react";

/*
  Color Picker
  - No React hooks
  - No external packages
  - Class component for maximum compatibility
  - All calculations happen locally
*/

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
    value =
      value[0] +
      value[0] +
      value[1] +
      value[1] +
      value[2] +
      value[2];
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
  var h;
  var s;
  var l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
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
          (b - r) / d +
          2;
        break;

      default:
        h =
          (r - g) / d +
          4;
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

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;

  var c =
    (1 - Math.abs(2 * l - 1)) * s;
  var x =
    c *
    (1 -
      Math.abs(((h / 60) % 2) - 1));
  var m = l - c / 2;

  var r1 = 0;
  var g1 = 0;
  var b1 = 0;

  if (h < 60) {
    r1 = c;
    g1 = x;
  } else if (h < 120) {
    r1 = x;
    g1 = c;
  } else if (h < 180) {
    g1 = c;
    b1 = x;
  } else if (h < 240) {
    g1 = x;
    b1 = c;
  } else if (h < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToCmyk(r, g, b) {
  var rr = r / 255;
  var gg = g / 255;
  var bb = b / 255;

  var k = 1 - Math.max(rr, gg, bb);

  if (k >= 0.999999) {
    return {
      c: 0,
      m: 0,
      y: 0,
      k: 100,
    };
  }

  return {
    c: Math.round(
      ((1 - rr - k) / (1 - k)) * 100
    ),
    m: Math.round(
      ((1 - gg - k) / (1 - k)) * 100
    ),
    y: Math.round(
      ((1 - bb - k) / (1 - k)) * 100
    ),
    k: Math.round(k * 100),
  };
}

function relativeLuminance(rgb) {
  var values = [
    rgb.r / 255,
    rgb.g / 255,
    rgb.b / 255,
  ].map(function (value) {
    return value <= 0.03928
      ? value / 12.92
      : Math.pow(
          (value + 0.055) / 1.055,
          2.4
        );
  });

  return (
    0.2126 * values[0] +
    0.7152 * values[1] +
    0.0722 * values[2]
  );
}

function contrastRatio(rgb1, rgb2) {
  var l1 = relativeLuminance(rgb1);
  var l2 = relativeLuminance(rgb2);

  var lighter = Math.max(l1, l2);
  var darker = Math.min(l1, l2);

  return (lighter + 0.05) /
    (darker + 0.05);
}

function mixColors(color1, color2, amount) {
  return rgbToHex(
    color1.r +
      (color2.r - color1.r) * amount,
    color1.g +
      (color2.g - color1.g) * amount,
    color1.b +
      (color2.b - color1.b) * amount
  );
}

function shiftHue(hex, degrees) {
  var rgb = hexToRgb(hex);

  if (!rgb) return hex;

  var hsl = rgbToHsl(
    rgb.r,
    rgb.g,
    rgb.b
  );

  var nextH =
    (hsl.h + degrees + 360) % 360;

  var nextRgb = hslToRgb(
    nextH,
    hsl.s,
    hsl.l
  );

  return rgbToHex(
    nextRgb.r,
    nextRgb.g,
    nextRgb.b
  );
}

function getTextColor(hex) {
  var rgb = hexToRgb(hex);

  if (!rgb) return "#111111";

  return relativeLuminance(rgb) > 0.179
    ? "#111111"
    : "#FFFFFF";
}

function colorDistance(a, b) {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) +
      Math.pow(a.g - b.g, 2) +
      Math.pow(a.b - b.b, 2)
  );
}

function simulateColorBlindness(rgb, type) {
  var r = rgb.r;
  var g = rgb.g;
  var b = rgb.b;

  var nr = r;
  var ng = g;
  var nb = b;

  if (type === "protanopia") {
    nr =
      0.567 * r +
      0.433 * g;
    ng =
      0.558 * r +
      0.442 * g;
    nb =
      0.242 * g +
      0.758 * b;
  }

  if (type === "deuteranopia") {
    nr =
      0.625 * r +
      0.375 * g;
    ng =
      0.7 * r +
      0.3 * g;
    nb =
      0.3 * g +
      0.7 * b;
  }

  if (type === "tritanopia") {
    nr =
      0.95 * r +
      0.05 * g;
    ng =
      0.433 * g +
      0.567 * b;
    nb =
      0.475 * g +
      0.525 * b;
  }

  return {
    r: clamp(nr, 0, 255),
    g: clamp(ng, 0, 255),
    b: clamp(nb, 0, 255),
  };
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
  ).toUpperCase();
}

function getColorName(hex) {
  var rgb = hexToRgb(hex);

  if (!rgb) return "Custom Color";

  var closest = COLOR_NAMES[0];
  var smallest = Infinity;

  COLOR_NAMES.forEach(function (item) {
    var candidate = hexToRgb(item[0]);

    if (!candidate) return;

    var distance = colorDistance(
      rgb,
      candidate
    );

    if (distance < smallest) {
      smallest = distance;
      closest = item;
    }
  });

  return closest[1];
}

function formatNumber(value) {
  return Number(value).toLocaleString();
}

export default class ColorPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      color: "#635BFF",
      inputValue: "#635BFF",
      copied: "",
      history: [
        "#635BFF",
      ],
      contrastBackground: "#FFFFFF",
      contrastText: "#111111",
      activeBlindness: "normal",
    };

    this.setColor = this.setColor.bind(this);
    this.handleHexInput =
      this.handleHexInput.bind(this);
    this.copyText =
      this.copyText.bind(this);
    this.randomize =
      this.randomize.bind(this);
    this.reset =
      this.reset.bind(this);
  }

  setColor(value, addHistory) {
    var rgb = hexToRgb(value);

    if (!rgb) return;

    var hex = rgbToHex(
      rgb.r,
      rgb.g,
      rgb.b
    );

    this.setState(function (current) {
      var nextHistory =
        current.history.slice();

      if (addHistory !== false) {
        nextHistory = [
          hex,
          ...nextHistory.filter(
            function (item) {
              return item !== hex;
            }
          ),
        ].slice(0, 8);
      }

      return {
        color: hex,
        inputValue: hex,
        history: nextHistory,
      };
    });
  }

  handleHexInput(event) {
    var value =
      event.target.value.toUpperCase();

    this.setState({
      inputValue: value,
    });

    if (
      /^#?[0-9A-F]{6}$/i.test(value)
    ) {
      this.setColor(
        value.charAt(0) === "#"
          ? value
          : "#" + value
      );
    }

    if (
      /^#?[0-9A-F]{3}$/i.test(value)
    ) {
      var clean =
        value.replace("#", "");

      this.setColor(
        "#" +
          clean[0] +
          clean[0] +
          clean[1] +
          clean[1] +
          clean[2] +
          clean[2]
      );
    }
  }

  copyText(text, label) {
    if (
      typeof navigator ===
        "undefined" ||
      !navigator.clipboard
    ) {
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(
        function () {
          this.setState({
            copied: label,
          });

          setTimeout(
            function () {
              this.setState({
                copied: "",
              });
            }.bind(this),
            1300
          );
        }.bind(this)
      )
      .catch(function () {});
  }

  randomize() {
    this.setColor(
      randomHex(),
      true
    );
  }

  reset() {
    this.setState({
      color: "#635BFF",
      inputValue: "#635BFF",
      copied: "",
      history: [
        "#635BFF",
      ],
      contrastBackground: "#FFFFFF",
      contrastText: "#111111",
      activeBlindness: "normal",
    });
  }

  render() {
    var state = this.state;
    var color = state.color;

    var rgb = hexToRgb(color);

    if (!rgb) {
      rgb = {
        r: 99,
        g: 91,
        b: 255,
      };
    }

    var hsl = rgbToHsl(
      rgb.r,
      rgb.g,
      rgb.b
    );

    var cmyk = rgbToCmyk(
      rgb.r,
      rgb.g,
      rgb.b
    );

    var white = {
      r: 255,
      g: 255,
      b: 255,
    };

    var black = {
      r: 17,
      g: 17,
      b: 17,
    };

    var whiteContrast =
      contrastRatio(rgb, white);

    var blackContrast =
      contrastRatio(rgb, black);

    var bestText =
      whiteContrast > blackContrast
        ? "#FFFFFF"
        : "#111111";

    var bestContrast =
      Math.max(
        whiteContrast,
        blackContrast
      );

    var contrastBg =
      hexToRgb(
        state.contrastBackground
      ) || white;

    var contrastFg =
      hexToRgb(
        state.contrastText
      ) || black;

    var customContrast =
      contrastRatio(
        contrastBg,
        contrastFg
      );

    var wcagAA =
      customContrast >= 4.5;

    var wcagAALarge =
      customContrast >= 3;

    var wcagAAA =
      customContrast >= 7;

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

    var complementary =
      shiftHue(color, 180);

    var analogousLeft =
      shiftHue(color, -30);

    var analogousRight =
      shiftHue(color, 30);

    var triadicLeft =
      shiftHue(color, 120);

    var triadicRight =
      shiftHue(color, 240);

    var splitLeft =
      shiftHue(color, 150);

    var splitRight =
      shiftHue(color, 210);

    var cssVariable =
      "--primary-color: " +
      color +
      ";";

    var cssBackground =
      "background-color: " +
      color +
      ";";

    var rgbString =
      "rgb(" +
      rgb.r +
      ", " +
      rgb.g +
      ", " +
      rgb.b +
      ")";

    var rgbaString =
      "rgba(" +
      rgb.r +
      ", " +
      rgb.g +
      ", " +
      rgb.b +
      ", 1)";

    var hslString =
      "hsl(" +
      hsl.h +
      ", " +
      hsl.s +
      "%, " +
      hsl.l +
      "%)";

    var cmykString =
      "cmyk(" +
      cmyk.c +
      "%, " +
      cmyk.m +
      "%, " +
      cmyk.y +
      "%, " +
      cmyk.k +
      "%)";

    var blindRgb =
      state.activeBlindness ===
      "normal"
        ? rgb
        : simulateColorBlindness(
            rgb,
            state.activeBlindness
          );

    var blindHex = rgbToHex(
      blindRgb.r,
      blindRgb.g,
      blindRgb.b
    );

    var backgroundText =
      getTextColor(color);

    var name =
      getColorName(color);

    var styleText = `
      .cp-tool {
        --cp-text: #172033;
        --cp-muted: #667085;
        --cp-border: #e4e7ec;
        --cp-card: #ffffff;
        --cp-soft: #f7f8fb;
        --cp-primary: #635bff;
        width: 100%;
        color: var(--cp-text);
        font-family: Inter, Arial, sans-serif;
      }

      .cp-tool *,
      .cp-tool *::before,
      .cp-tool *::after {
        box-sizing: border-box;
      }

      .cp-wrap {
        width: 100%;
        max-width: 1180px;
        margin: 0 auto;
      }

      .cp-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        margin-bottom: 22px;
      }

      .cp-eyebrow {
        color: var(--cp-primary);
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .15em;
      }

      .cp-header h1 {
        margin: 7px 0 0;
        font-size: clamp(28px, 4vw, 42px);
        line-height: 1;
        letter-spacing: -.055em;
      }

      .cp-header p {
        max-width: 670px;
        margin: 10px 0 0;
        color: var(--cp-muted);
        font-size: 13px;
        line-height: 1.65;
      }

      .cp-header-actions {
        display: flex;
        gap: 8px;
      }

      .cp-btn {
        min-height: 40px;
        padding: 0 14px;
        border: 1px solid var(--cp-border);
        border-radius: 9px;
        background: var(--cp-card);
        color: var(--cp-text);
        cursor: pointer;
        font: inherit;
        font-size: 10px;
        font-weight: 750;
        transition: .18s ease;
      }

      .cp-btn:hover {
        transform: translateY(-1px);
        border-color: #c7cad1;
      }

      .cp-btn-primary {
        border-color: var(--cp-primary);
        background: var(--cp-primary);
        color: #fff;
      }

      .cp-main {
        display: grid;
        grid-template-columns: minmax(0,.9fr) minmax(0,1.1fr);
        gap: 18px;
      }

      .cp-card {
        border: 1px solid var(--cp-border);
        border-radius: 16px;
        background: var(--cp-card);
        box-shadow: 0 8px 30px rgba(16,24,40,.035);
      }

      .cp-picker-card {
        overflow: hidden;
      }

      .cp-preview {
        min-height: 245px;
        padding: 25px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        background: ${color};
        color: ${backgroundText};
        transition: background .15s ease;
      }

      .cp-preview-name {
        font-size: 12px;
        font-weight: 800;
        opacity: .8;
      }

      .cp-preview-hex {
        margin-top: 5px;
        font-size: 35px;
        line-height: 1;
        font-weight: 850;
        letter-spacing: -.05em;
      }

      .cp-picker-body {
        padding: 20px;
      }

      .cp-label {
        display: block;
        margin-bottom: 7px;
        color: var(--cp-muted);
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .cp-input-row {
        display: grid;
        grid-template-columns: 58px 1fr auto;
        gap: 8px;
      }

      .cp-color-input {
        width: 58px;
        height: 44px;
        padding: 3px;
        border: 1px solid var(--cp-border);
        border-radius: 9px;
        background: #fff;
        cursor: pointer;
      }

      .cp-hex-input {
        width: 100%;
        height: 44px;
        padding: 0 12px;
        border: 1px solid var(--cp-border);
        border-radius: 9px;
        outline: none;
        background: var(--cp-card);
        color: var(--cp-text);
        font: inherit;
        font-size: 12px;
        font-weight: 700;
      }

      .cp-hex-input:focus {
        border-color: var(--cp-primary);
        box-shadow: 0 0 0 3px rgba(99,91,255,.1);
      }

      .cp-random {
        min-width: 92px;
      }

      .cp-section {
        margin-top: 18px;
        padding: 20px;
      }

      .cp-section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
      }

      .cp-section-title h2 {
        margin: 0;
        font-size: 16px;
        letter-spacing: -.025em;
      }

      .cp-section-title span {
        color: var(--cp-muted);
        font-size: 9px;
      }

      .cp-value-grid {
        display: grid;
        grid-template-columns: repeat(2,1fr);
        gap: 8px;
      }

      .cp-value {
        position: relative;
        min-width: 0;
        padding: 12px;
        border: 1px solid var(--cp-border);
        border-radius: 10px;
        background: var(--cp-soft);
      }

      .cp-value-label {
        display: block;
        color: var(--cp-muted);
        font-size: 9px;
        font-weight: 700;
      }

      .cp-value-code {
        display: block;
        margin-top: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 750;
      }

      .cp-mini-copy {
        position: absolute;
        top: 8px;
        right: 8px;
        border: 0;
        background: transparent;
        color: var(--cp-muted);
        cursor: pointer;
        font-size: 9px;
      }

      .cp-mini-copy:hover {
        color: var(--cp-primary);
      }

      .cp-palette {
        display: grid;
        grid-template-columns: repeat(5,1fr);
        gap: 8px;
      }

      .cp-swatch {
        min-width: 0;
        height: 74px;
        border: 0;
        border-radius: 10px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .cp-swatch span {
        position: absolute;
        left: 7px;
        right: 7px;
        bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: ui-monospace, monospace;
        font-size: 8px;
        font-weight: 800;
      }

      .cp-contrast-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      .cp-contrast-preview {
        min-height: 130px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        transition: .15s ease;
      }

      .cp-contrast-preview strong {
        display: block;
        font-size: 22px;
      }

      .cp-contrast-preview small {
        display: block;
        margin-top: 5px;
        opacity: .8;
        font-size: 9px;
      }

      .cp-contrast-score {
        margin-top: 12px;
        padding: 12px;
        border: 1px solid var(--cp-border);
        border-radius: 10px;
        background: var(--cp-soft);
      }

      .cp-score-number {
        font-size: 27px;
        font-weight: 850;
        letter-spacing: -.05em;
      }

      .cp-score-label {
        color: var(--cp-muted);
        font-size: 9px;
      }

      .cp-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }

      .cp-badge {
        padding: 5px 7px;
        border-radius: 6px;
        background: #eafaf2;
        color: #087443;
        font-size: 8px;
        font-weight: 800;
      }

      .cp-badge.fail {
        background: #fff1f3;
        color: #c01048;
      }

      .cp-contrast-controls {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
      }

      .cp-contrast-input {
        display: grid;
        grid-template-columns: 45px 1fr;
        gap: 6px;
      }

      .cp-contrast-input input[type="color"] {
        width: 45px;
        height: 40px;
        padding: 2px;
        border: 1px solid var(--cp-border);
        border-radius: 8px;
        background: #fff;
      }

      .cp-contrast-input input[type="text"] {
        width: 100%;
        min-width: 0;
        height: 40px;
        padding: 0 9px;
        border: 1px solid var(--cp-border);
        border-radius: 8px;
        outline: none;
        background: var(--cp-card);
        color: var(--cp-text);
        font: inherit;
        font-size: 10px;
      }

      .cp-shades {
        display: grid;
        grid-template-columns: repeat(10,1fr);
        gap: 5px;
      }

      .cp-small-swatch {
        height: 52px;
        border-radius: 7px;
        cursor: pointer;
        border: 0;
      }

      .cp-small-swatch span {
        display: block;
        margin-top: 58px;
        font-size: 7px;
        font-family: ui-monospace, monospace;
        white-space: nowrap;
      }

      .cp-harmony {
        display: grid;
        grid-template-columns: repeat(7,1fr);
        gap: 7px;
      }

      .cp-harmony-item {
        min-width: 0;
        cursor: pointer;
      }

      .cp-harmony-color {
        height: 62px;
        border-radius: 9px;
      }

      .cp-harmony-item span {
        display: block;
        margin-top: 6px;
        overflow: hidden;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: ui-monospace, monospace;
        font-size: 7px;
        color: var(--cp-muted);
      }

      .cp-blindness {
        display: grid;
        grid-template-columns: repeat(4,1fr);
        gap: 8px;
      }

      .cp-blind-card {
        overflow: hidden;
        border: 1px solid var(--cp-border);
        border-radius: 10px;
        background: var(--cp-soft);
        cursor: pointer;
      }

      .cp-blind-color {
        height: 70px;
      }

      .cp-blind-card div:last-child {
        padding: 8px;
      }

      .cp-blind-card strong {
        display: block;
        font-size: 9px;
      }

      .cp-blind-card span {
        display: block;
        margin-top: 3px;
        color: var(--cp-muted);
        font-family: ui-monospace, monospace;
        font-size: 7px;
      }

      .cp-code {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .cp-code-box {
        padding: 12px;
        border: 1px solid var(--cp-border);
        border-radius: 10px;
        background: #111827;
        color: #f8fafc;
      }

      .cp-code-box span {
        display: block;
        margin-bottom: 7px;
        color: #98a2b3;
        font-size: 8px;
        font-weight: 800;
        text-transform: uppercase;
      }

      .cp-code-box code {
        display: block;
        overflow: auto;
        font-family: ui-monospace, monospace;
        font-size: 9px;
        line-height: 1.5;
      }

      .cp-history {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .cp-history-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px 6px 6px;
        border: 1px solid var(--cp-border);
        border-radius: 8px;
        background: var(--cp-card);
        cursor: pointer;
      }

      .cp-history-dot {
        width: 20px;
        height: 20px;
        border-radius: 5px;
      }

      .cp-history-item span {
        font-family: ui-monospace, monospace;
        font-size: 8px;
        font-weight: 750;
      }

      .cp-copy-toast {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 100;
        padding: 10px 13px;
        border-radius: 9px;
        background: #111827;
        color: #fff;
        font-size: 10px;
        font-weight: 750;
        box-shadow: 0 10px 30px rgba(0,0,0,.18);
      }

      @media (max-width: 950px) {
        .cp-main {
          grid-template-columns: 1fr;
        }

        .cp-harmony {
          grid-template-columns: repeat(4,1fr);
        }

        .cp-blindness {
          grid-template-columns: repeat(2,1fr);
        }
      }

      @media (max-width: 620px) {
        .cp-header {
          flex-direction: column;
          align-items: stretch;
        }

        .cp-header-actions {
          width: 100%;
        }

        .cp-header-actions .cp-btn {
          flex: 1;
        }

        .cp-input-row {
          grid-template-columns: 55px 1fr;
        }

        .cp-random {
          grid-column: 1 / -1;
          width: 100%;
        }

        .cp-value-grid,
        .cp-contrast-layout,
        .cp-code {
          grid-template-columns: 1fr;
        }

        .cp-palette {
          grid-template-columns: repeat(5,1fr);
        }

        .cp-harmony {
          grid-template-columns: repeat(2,1fr);
        }

        .cp-shades {
          grid-template-columns: repeat(5,1fr);
          row-gap: 36px;
        }

        .cp-preview {
          min-height: 205px;
        }
      }

      .dark .cp-tool,
      body.dark .cp-tool,
      html.dark .cp-tool {
        --cp-text: #f2f4f7;
        --cp-muted: #98a2b3;
        --cp-border: #2d3442;
        --cp-card: #151922;
        --cp-soft: #10141c;
        --cp-primary: #8078ff;
      }
    `;

    var copyButton = function (
      value,
      label
    ) {
      return (
        <button
          type="button"
          className="cp-mini-copy"
          onClick={() =>
            this.copyText(value, label)
          }
        >
          Copy
        </button>
      );
    }.bind(this);

    var valueCard = function (
      label,
      value,
      key
    ) {
      return (
        <div
          className="cp-value"
          key={key}
        >
          <span className="cp-value-label">
            {label}
          </span>

          <span className="cp-value-code">
            {value}
          </span>

          {copyButton(value, label)}
        </div>
      );
    }.bind(this);

    var paletteColors = [
      color,
      analogousLeft,
      complementary,
      analogousRight,
      triadicLeft,
    ];

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
      [
        "Protanopia",
        simulateColorBlindness(
          rgb,
          "protanopia"
        ),
        "protanopia",
      ],
      [
        "Deuteranopia",
        simulateColorBlindness(
          rgb,
          "deuteranopia"
        ),
        "deuteranopia",
      ],
      [
        "Tritanopia",
        simulateColorBlindness(
          rgb,
          "tritanopia"
        ),
        "tritanopia",
      ],
    ];

    return (
      <>
        <div className="cp-tool">
          <div className="cp-wrap">

            <div className="cp-header">
              <div>
                <div className="cp-eyebrow">
                  DESIGN & COLOR TOOL
                </div>

                <h1>
                  Color Picker
                </h1>

                <p>
                  Pick, inspect, convert and
                  test colors with professional
                  color values, harmonies,
                  accessibility checks and
                  developer-ready CSS.
                </p>
              </div>

              <div className="cp-header-actions">
                <button
                  type="button"
                  className="cp-btn"
                  onClick={this.reset}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="cp-btn cp-btn-primary"
                  onClick={this.randomize}
                >
                  Random Color
                </button>
              </div>
            </div>

            <div className="cp-main">

              <div>
                <div className="cp-card cp-picker-card">

                  <div
                    className="cp-preview"
                    style={{
                      backgroundColor:
                        color,
                      color:
                        backgroundText,
                    }}
                  >
                    <div>
                      <div className="cp-preview-name">
                        {name}
                      </div>

                      <div className="cp-preview-hex">
                        {color}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "9px",
                          opacity: 0.7,
                          textAlign: "right",
                        }}
                      >
                        Best text
                      </div>

                      <strong
                        style={{
                          fontSize: "11px",
                        }}
                      >
                        {bestText}
                      </strong>
                    </div>
                  </div>

                  <div className="cp-picker-body">

                    <label className="cp-label">
                      Select color
                    </label>

                    <div className="cp-input-row">

                      <input
                        className="cp-color-input"
                        type="color"
                        value={color}
                        onChange={(event) =>
                          this.setColor(
                            event.target.value
                          )
                        }
                        aria-label="Color picker"
                      />

                      <input
                        className="cp-hex-input"
                        type="text"
                        value={
                          state.inputValue
                        }
                        onChange={
                          this.handleHexInput
                        }
                        placeholder="#635BFF"
                        maxLength={7}
                        spellCheck="false"
                        aria-label="HEX color"
                      />

                      <button
                        type="button"
                        className="cp-btn cp-random"
                        onClick={
                          this.randomize
                        }
                      >
                        ✦ Random
                      </button>

                    </div>
                  </div>
                </div>

                <div className="cp-card cp-section">
                  <div className="cp-section-title">
                    <h2>
                      Color values
                    </h2>

                    <span>
                      Click Copy on any value
                    </span>
                  </div>

                  <div className="cp-value-grid">
                    {valueCard(
                      "HEX",
                      color,
                      "hex"
                    )}

                    {valueCard(
                      "RGB",
                      rgbString,
                      "rgb"
                    )}

                    {valueCard(
                      "RGBA",
                      rgbaString,
                      "rgba"
                    )}

                    {valueCard(
                      "HSL",
                      hslString,
                      "hsl"
                    )}

                    {valueCard(
                      "CMYK",
                      cmykString,
                      "cmyk"
                    )}

                    {valueCard(
                      "Color name",
                      name,
                      "name"
                    )}
                  </div>
                </div>

                <div className="cp-card cp-section">
                  <div className="cp-section-title">
                    <h2>
                      Quick palette
                    </h2>

                    <span>
                      Click a swatch to use it
                    </span>
                  </div>

                  <div className="cp-palette">
                    {paletteColors.map(
                      function (item, index) {
                        return (
                          <button
                            key={
                              item + index
                            }
                            type="button"
                            className="cp-swatch"
                            style={{
                              backgroundColor:
                                item,
                              color:
                                getTextColor(
                                  item
                                ),
                            }}
                            onClick={() =>
                              this.setColor(
                                item
                              )
                            }
                          >
                            <span>
                              {item}
                            </span>
                          </button>
                        );
                      }.bind(this)
                    )}
                  </div>
                </div>
              </div>

              <div>

                <div className="cp-card cp-section" style={{ marginTop: 0 }}>
                  <div className="cp-section-title">
                    <h2>
                      Accessibility
                    </h2>

                    <span>
                      WCAG contrast analysis
                    </span>
                  </div>

                  <div className="cp-contrast-preview">
                    <div
                      style={{
                        width: "100%",
                        padding: "20px",
                        borderRadius: "10px",
                        background:
                          color,
                        color:
                          bestText,
                      }}
                    >
                      <strong>
                        Aa — Readability Test
                      </strong>

                      <small>
                        Best automatic text color:
                        {" "}
                        {bestText}
                      </small>
                    </div>
                  </div>

                  <div className="cp-contrast-score">
                    <div className="cp-score-number">
                      {bestContrast.toFixed(2)}
                      :1
                    </div>

                    <div className="cp-score-label">
                      Best contrast ratio against
                      black / white
                    </div>

                    <div className="cp-badges">
                      <span
                        className={
                          bestContrast >= 4.5
                            ? "cp-badge"
                            : "cp-badge fail"
                        }
                      >
                        AA Normal
                        {" "}
                        {bestContrast >= 4.5
                          ? "Pass"
                          : "Fail"}
                      </span>

                      <span
                        className={
                          bestContrast >= 3
                            ? "cp-badge"
                            : "cp-badge fail"
                        }
                      >
                        AA Large
                        {" "}
                        {bestContrast >= 3
                          ? "Pass"
                          : "Fail"}
                      </span>

                      <span
                        className={
                          bestContrast >= 7
                            ? "cp-badge"
                            : "cp-badge fail"
                        }
                      >
                        AAA
                        {" "}
                        {bestContrast >= 7
                          ? "Pass"
                          : "Fail"}
                      </span>
                    </div>
                  </div>

                  <div className="cp-contrast-controls">

                    <div>
                      <label className="cp-label">
                        Background
                      </label>

                      <div className="cp-contrast-input">
                        <input
                          type="color"
                          value={
                            state.contrastBackground
                          }
                          onChange={(event) =>
                            this.setState({
                              contrastBackground:
                                event.target.value.toUpperCase(),
                            })
                          }
                        />

                        <input
                          type="text"
                          value={
                            state.contrastBackground
                          }
                          onChange={(event) => {
                            var value =
                              event.target.value.toUpperCase();

                            if (
                              /^#?[0-9A-F]{6}$/i.test(
                                value
                              )
                            ) {
                              if (
                                value.charAt(
                                  0
                                ) !== "#"
                              ) {
                                value =
                                  "#" + value;
                              }

                              this.setState({
                                contrastBackground:
                                  value,
                              });
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="cp-label">
                        Text
                      </label>

                      <div className="cp-contrast-input">
                        <input
                          type="color"
                          value={
                            state.contrastText
                          }
                          onChange={(event) =>
                            this.setState({
                              contrastText:
                                event.target.value.toUpperCase(),
                            })
                          }
                        />

                        <input
                          type="text"
                          value={
                            state.contrastText
                          }
                          onChange={(event) => {
                            var value =
                              event.target.value.toUpperCase();

                            if (
                              /^#?[0-9A-F]{6}$/i.test(
                                value
                              )
                            ) {
                              if (
                                value.charAt(
                                  0
                                ) !== "#"
                              ) {
                                value =
                                  "#" + value;
                              }

                              this.setState({
                                contrastText:
                                  value,
                              });
                            }
                          }}
                        />
                      </div>
                    </div>

                  </div>

                  <div
                    className="cp-contrast-preview"
                    style={{
                      marginTop: 12,
                      background:
                        state.contrastBackground,
                      color:
                        state.contrastText,
                    }}
                  >
                    <div>
                      <strong>
                        Aa
                      </strong>

                      <small>
                        {state.contrastText}
                        {" "}
                        on
                        {" "}
                        {state.contrastBackground}
                      </small>
                    </div>
                  </div>

                  <div className="cp-contrast-score">
                    <div className="cp-score-number">
                      {customContrast.toFixed(2)}
                      :1
                    </div>

                    <div className="cp-score-label">
                      Custom foreground /
                      background contrast
                    </div>

                    <div className="cp-badges">
                      <span
                        className={
                          wcagAA
                            ? "cp-badge"
                            : "cp-badge fail"
                        }
                      >
                        AA Normal
                        {" "}
                        {wcagAA
                          ? "Pass"
                          : "Fail"}
                      </span>

                      <span
                        className={
                          wcagAALarge
                            ? "cp-badge"
                            : "cp-badge fail"
                        }
                      >
                        AA Large
                        {" "}
                        {wcagAALarge
                          ? "Pass"
                          : "Fail"}
                      </span>

                      <span
                        className={
                          wcagAAA
                            ? "cp-badge"
                            : "cp-badge fail"
                        }
                      >
                        AAA
                        {" "}
                        {wcagAAA
                          ? "Pass"
                          : "Fail"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="cp-card cp-section">
              <div className="cp-section-title">
                <h2>
                  Tints & shades
                </h2>

                <span>
                  White → base → black
                </span>
              </div>

              <div className="cp-shades">
                {tints.map(
                  function (item, index) {
                    return (
                      <button
                        type="button"
                        key={
                          "tint-" + index
                        }
                        className="cp-small-swatch"
                        style={{
                          backgroundColor:
                            item,
                        }}
                        onClick={() =>
                          this.setColor(
                            item
                          )
                        }
                        title={item}
                      >
                        <span>
                          {item}
                        </span>
                      </button>
                    );
                  }.bind(this)
                )}

                <button
                  type="button"
                  className="cp-small-swatch"
                  style={{
                    backgroundColor:
                      color,
                  }}
                  onClick={() =>
                    this.setColor(color)
                  }
                  title={color}
                >
                  <span>
                    {color}
                  </span>
                </button>

                {shades.map(
                  function (item, index) {
                    return (
                      <button
                        type="button"
                        key={
                          "shade-" + index
                        }
                        className="cp-small-swatch"
                        style={{
                          backgroundColor:
                            item,
                        }}
                        onClick={() =>
                          this.setColor(
                            item
                          )
                        }
                        title={item}
                      >
                        <span>
                          {item}
                        </span>
                      </button>
                    );
                  }.bind(this)
                )}
              </div>
            </div>

            <div className="cp-card cp-section">
              <div className="cp-section-title">
                <h2>
                  Color harmonies
                </h2>

                <span>
                  Designer-ready relationships
                </span>
              </div>

              <div className="cp-harmony">
                {harmonyColors.map(
                  function (item) {
                    return (
                      <button
                        type="button"
                        className="cp-harmony-item"
                        key={item[0]}
                        onClick={() =>
                          this.setColor(
                            item[1]
                          )
                        }
                        style={{
                          border: 0,
                          background:
                            "transparent",
                          padding: 0,
                        }}
                      >
                        <div
                          className="cp-harmony-color"
                          style={{
                            backgroundColor:
                              item[1],
                          }}
                        />

                        <span>
                          {item[0]}
                          <br />
                          {item[1]}
                        </span>
                      </button>
                    );
                  }.bind(this)
                )}
              </div>
            </div>

            <div className="cp-card cp-section">
              <div className="cp-section-title">
                <h2>
                  Color blindness preview
                </h2>

                <span>
                  Accessibility simulation
                </span>
              </div>

              <div className="cp-blindness">
                {blindnessCards.map(
                  function (item) {
                    var blindHex =
                      rgbToHex(
                        item[1].r,
                        item[1].g,
                        item[1].b
                      );

                    return (
                      <button
                        type="button"
                        key={item[0]}
                        className="cp-blind-card"
                        onClick={() =>
                          this.setState({
                            activeBlindness:
                              item[2],
                          })
                        }
                        style={{
                          outline:
                            state.activeBlindness ===
                            item[2]
                              ? "2px solid var(--cp-primary)"
                              : "none",
                        }}
                      >
                        <div
                          className="cp-blind-color"
                          style={{
                            backgroundColor:
                              blindHex,
                          }}
                        />

                        <div>
                          <strong>
                            {item[0]}
                          </strong>

                          <span>
                            {blindHex}
                          </span>
                        </div>
                      </button>
                    );
                  }.bind(this)
                )}
              </div>

              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 9,
                  background:
                    "var(--cp-soft)",
                  color:
                    "var(--cp-muted)",
                  fontSize: 9,
                  lineHeight: 1.6,
                }}
              >
                Current simulation:
                {" "}
                <strong
                  style={{
                    color:
                      "var(--cp-text)",
                  }}
                >
                  {state.activeBlindness}
                </strong>
                {" "}
                →
                {" "}
                <strong
                  style={{
                    color:
                      "var(--cp-text)",
                  }}
                >
                  {blindHex}
                </strong>
              </div>
            </div>

            <div className="cp-card cp-section">
              <div className="cp-section-title">
                <h2>
                  Developer output
                </h2>

                <span>
                  Ready to paste into CSS
                </span>
              </div>

              <div className="cp-code">
                <div className="cp-code-box">
                  <span>
                    CSS Variable
                  </span>

                  <code>
                    {cssVariable}
                  </code>

                  <button
                    type="button"
                    className="cp-btn"
                    style={{
                      marginTop: 10,
                      minHeight: 30,
                      color: "#fff",
                      background:
                        "transparent",
                      borderColor:
                        "#374151",
                    }}
                    onClick={() =>
                      this.copyText(
                        cssVariable,
                        "CSS variable"
                      )
                    }
                  >
                    Copy
                  </button>
                </div>

                <div className="cp-code-box">
                  <span>
                    Background CSS
                  </span>

                  <code>
                    {cssBackground}
                  </code>

                  <button
                    type="button"
                    className="cp-btn"
                    style={{
                      marginTop: 10,
                      minHeight: 30,
                      color: "#fff",
                      background:
                        "transparent",
                      borderColor:
                        "#374151",
                    }}
                    onClick={() =>
                      this.copyText(
                        cssBackground,
                        "CSS background"
                      )
                    }
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="cp-card cp-section">
              <div className="cp-section-title">
                <h2>
                  Recent colors
                </h2>

                <span>
                  Your latest selections
                </span>
              </div>

              <div className="cp-history">
                {state.history.map(
                  function (item) {
                    return (
                      <button
                        type="button"
                        className="cp-history-item"
                        key={item}
                        onClick={() =>
                          this.setColor(
                            item,
                            false
                          )
                        }
                      >
                        <span
                          className="cp-history-dot"
                          style={{
                            backgroundColor:
                              item,
                          }}
                        />

                        <span>
                          {item}
                        </span>
                      </button>
                    );
                  }.bind(this)
                )}
              </div>
            </div>

            <div
              style={{
                margin: "14px 4px 0",
                color: "var(--cp-muted)",
                fontSize: 9,
                lineHeight: 1.6,
              }}
            >
              <strong>
                Privacy:
              </strong>{" "}
              All color calculations happen
              locally in your browser. No color
              data is uploaded to a server.
            </div>

          </div>
        </div>

        <style>
          {styleText}
        </style>

        {state.copied ? (
          <div className="cp-copy-toast">
            ✓ {state.copied} copied
          </div>
        ) : null}
      </>
    );
  }
}