"use client";

import React from "react";

class HexRgbConverter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hex: "#635BFF",
      alpha: 100,
      copied: "",
    };
  }

  componentDidMount() {
    this.updatePageTitle();
  }

  updatePageTitle = () => {
    if (typeof document !== "undefined") {
      document.title = "HEX to RGB Converter";
    }
  };

  normalizeHex = (value) => {
    if (!value) return null;

    let hex = String(value).trim().replace(/^#/, "");

    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      hex =
        hex[0] +
        hex[0] +
        hex[1] +
        hex[1] +
        hex[2] +
        hex[2];
    }

    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
      return null;
    }

    return "#" + hex.toUpperCase();
  };

  hexToRgb = (value) => {
    const hex = this.normalizeHex(value);

    if (!hex) return null;

    const clean = hex.substring(1);

    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  };

  rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;

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

        case b:
          h =
            (r - g) / d + 4;
          break;

        default:
          break;
      }

      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  rgbToCmyk = (r, g, b) => {
    const rr = r / 255;
    const gg = g / 255;
    const bb = b / 255;

    const k = 1 - Math.max(rr, gg, bb);

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
  };

  getLuminance = (r, g, b) => {
    const values = [r, g, b].map((value) => {
      const v = value / 255;

      return v <= 0.03928
        ? v / 12.92
        : Math.pow(
            (v + 0.055) / 1.055,
            2.4
          );
    });

    return (
      0.2126 * values[0] +
      0.7152 * values[1] +
      0.0722 * values[2]
    );
  };

  getContrastRatio = (colorA, colorB) => {
    const luminanceA =
      this.getLuminance(
        colorA.r,
        colorA.g,
        colorA.b
      );

    const luminanceB =
      this.getLuminance(
        colorB.r,
        colorB.g,
        colorB.b
      );

    const light = Math.max(
      luminanceA,
      luminanceB
    );

    const dark = Math.min(
      luminanceA,
      luminanceB
    );

    return (light + 0.05) / (dark + 0.05);
  };

  getContrastLevel = (ratio, largeText) => {
    if (largeText) {
      if (ratio >= 4.5) return "AAA";
      if (ratio >= 3) return "AA";
      return "Fail";
    }

    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";

    return "Fail";
  };

  shadeColor = (hex, percent) => {
    const rgb = this.hexToRgb(hex);

    if (!rgb) return "#000000";

    const factor =
      percent >= 0
        ? 1 + percent / 100
        : 1 + percent / 100;

    const adjust = (value) => {
      if (percent >= 0) {
        return Math.round(
          value +
            (255 - value) *
              (percent / 100)
        );
      }

      return Math.round(
        value * factor
      );
    };

    const r = Math.max(
      0,
      Math.min(255, adjust(rgb.r))
    );

    const g = Math.max(
      0,
      Math.min(255, adjust(rgb.g))
    );

    const b = Math.max(
      0,
      Math.min(255, adjust(rgb.b))
    );

    return (
      "#" +
      [r, g, b]
        .map((value) =>
          value
            .toString(16)
            .padStart(2, "0")
        )
        .join("")
        .toUpperCase()
    );
  };

  componentData = () => {
    const hex =
      this.normalizeHex(this.state.hex);

    if (!hex) return null;

    const rgb = this.hexToRgb(hex);

    if (!rgb) return null;

    const hsl = this.rgbToHsl(
      rgb.r,
      rgb.g,
      rgb.b
    );

    const cmyk = this.rgbToCmyk(
      rgb.r,
      rgb.g,
      rgb.b
    );

    const alpha =
      Number(this.state.alpha) / 100;

    const white = {
      r: 255,
      g: 255,
      b: 255,
    };

    const black = {
      r: 0,
      g: 0,
      b: 0,
    };

    const whiteContrast =
      this.getContrastRatio(
        rgb,
        white
      );

    const blackContrast =
      this.getContrastRatio(
        rgb,
        black
      );

    return {
      hex,
      rgb,
      hsl,
      cmyk,
      alpha,
      whiteContrast,
      blackContrast,
    };
  };

  handleHexChange = (event) => {
    this.setState({
      hex: event.target.value,
      copied: "",
    });
  };

  handleColorChange = (event) => {
    this.setState({
      hex: event.target.value.toUpperCase(),
      copied: "",
    });
  };

  handleAlphaChange = (event) => {
    this.setState({
      alpha: Number(event.target.value),
    });
  };

  handlePreset = (hex) => {
    this.setState({
      hex,
      copied: "",
    });
  };

  copyText = async (text, label) => {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        text
      );

      this.setState({
        copied: label,
      });

      window.setTimeout(() => {
        this.setState({
          copied: "",
        });
      }, 1500);
    } catch (error) {
      this.setState({
        copied: "",
      });
    }
  };

  copyAll = () => {
    const data = this.componentData();

    if (!data) return;

    const { hex, rgb, hsl, cmyk, alpha } =
      data;

    const text = [
      "HEX: " + hex,
      `RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      `RGBA: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`,
      `HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      `CMYK: cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      `CSS Variable: --color: ${hex};`,
    ].join("\n");

    this.copyText(text, "all");
  };

  reset = () => {
    this.setState({
      hex: "#635BFF",
      alpha: 100,
      copied: "",
    });
  };

  renderCopyButton = (value, label) => {
    const copied =
      this.state.copied === label;

    return (
      <button
        type="button"
        className="hex-copy-mini"
        onClick={() =>
          this.copyText(value, label)
        }
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
    );
  };

  render() {
    const data = this.componentData();

    const styleText = `
      .hexrgb-tool {
        --hr-text: #172033;
        --hr-muted: #667085;
        --hr-border: #e4e7ec;
        --hr-card: #ffffff;
        --hr-soft: #f7f8fb;
        --hr-primary: #635bff;
        --hr-input: #ffffff;

        width: 100%;
        color: var(--hr-text);
        font-family: inherit;
        box-sizing: border-box;
      }

      .hexrgb-tool *,
      .hexrgb-tool *::before,
      .hexrgb-tool *::after {
        box-sizing: border-box;
      }

      .hexrgb-wrapper {
        width: 100%;
        max-width: 1180px;
        margin: 0 auto;
      }

      .hexrgb-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        margin-bottom: 22px;
      }

      .hexrgb-eyebrow {
        color: var(--hr-primary);
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .15em;
      }

      .hexrgb-header h1 {
        margin: 6px 0 0;
        font-size: clamp(28px, 4vw, 42px);
        line-height: 1.05;
        letter-spacing: -.05em;
      }

      .hexrgb-header p {
        max-width: 680px;
        margin: 9px 0 0;
        color: var(--hr-muted);
        font-size: 13px;
        line-height: 1.65;
      }

      .hexrgb-actions {
        display: flex;
        gap: 8px;
      }

      .hexrgb-button {
        height: 40px;
        padding: 0 14px;
        border: 1px solid var(--hr-border);
        border-radius: 9px;
        background: var(--hr-card);
        color: var(--hr-text);
        cursor: pointer;
        font: inherit;
        font-size: 11px;
        font-weight: 750;
      }

      .hexrgb-button.primary {
        border-color: var(--hr-primary);
        background: var(--hr-primary);
        color: #ffffff;
      }

      .hexrgb-main {
        display: grid;
        grid-template-columns: minmax(0,.78fr) minmax(0,1.22fr);
        gap: 18px;
      }

      .hexrgb-card {
        border: 1px solid var(--hr-border);
        border-radius: 17px;
        background: var(--hr-card);
        box-shadow: 0 8px 30px rgba(16,24,40,.035);
      }

      .hexrgb-input-card {
        padding: 22px;
      }

      .hexrgb-card-title {
        font-size: 17px;
        font-weight: 800;
        letter-spacing: -.025em;
      }

      .hexrgb-card-subtitle {
        margin-top: 5px;
        color: var(--hr-muted);
        font-size: 11px;
        line-height: 1.6;
      }

      .hexrgb-picker-wrap {
        position: relative;
        overflow: hidden;
        height: 145px;
        margin-top: 18px;
        border-radius: 13px;
        border: 1px solid var(--hr-border);
      }

      .hexrgb-color-picker {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        border: 0;
        cursor: pointer;
        background: transparent;
      }

      .hexrgb-picker-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(
            135deg,
            rgba(255,255,255,.14),
            transparent 45%
          );
      }

      .hexrgb-label {
        display: block;
        margin: 17px 0 7px;
        font-size: 11px;
        font-weight: 800;
      }

      .hexrgb-input-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
      }

      .hexrgb-input {
        width: 100%;
        height: 45px;
        padding: 0 12px;
        border: 1px solid var(--hr-border);
        border-radius: 9px;
        outline: none;
        background: var(--hr-input);
        color: var(--hr-text);
        font: inherit;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: .04em;
      }

      .hexrgb-input:focus {
        border-color: var(--hr-primary);
        box-shadow: 0 0 0 3px rgba(99,91,255,.10);
      }

      .hexrgb-color-preview {
        width: 45px;
        height: 45px;
        border-radius: 9px;
        border: 1px solid rgba(0,0,0,.1);
      }

      .hexrgb-alpha-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 18px;
      }

      .hexrgb-alpha-head label {
        font-size: 11px;
        font-weight: 800;
      }

      .hexrgb-alpha-value {
        color: var(--hr-primary);
        font-size: 11px;
        font-weight: 800;
      }

      .hexrgb-range {
        width: 100%;
        margin-top: 10px;
        accent-color: var(--hr-primary);
        cursor: pointer;
      }

      .hexrgb-presets-title {
        margin-top: 20px;
        font-size: 10px;
        font-weight: 800;
        color: var(--hr-muted);
        text-transform: uppercase;
        letter-spacing: .1em;
      }

      .hexrgb-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 9px;
      }

      .hexrgb-preset {
        width: 28px;
        height: 28px;
        border: 2px solid var(--hr-card);
        outline: 1px solid var(--hr-border);
        border-radius: 7px;
        cursor: pointer;
      }

      .hexrgb-result-card {
        overflow: hidden;
      }

      .hexrgb-big-preview {
        position: relative;
        min-height: 190px;
        padding: 25px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 20px;
      }

      .hexrgb-preview-content {
        position: relative;
        z-index: 1;
      }

      .hexrgb-preview-label {
        display: block;
        margin-bottom: 6px;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .13em;
        opacity: .75;
      }

      .hexrgb-preview-hex {
        font-size: clamp(30px, 5vw, 48px);
        font-weight: 900;
        letter-spacing: -.06em;
      }

      .hexrgb-preview-meta {
        margin-top: 7px;
        font-size: 11px;
        opacity: .78;
      }

      .hexrgb-preview-chip {
        position: relative;
        z-index: 1;
        width: 60px;
        height: 60px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,.4);
        box-shadow: 0 12px 30px rgba(0,0,0,.12);
      }

      .hexrgb-values {
        padding: 18px;
      }

      .hexrgb-value-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 9px;
      }

      .hexrgb-value {
        position: relative;
        padding: 13px;
        border: 1px solid var(--hr-border);
        border-radius: 11px;
        background: var(--hr-soft);
      }

      .hexrgb-value-label {
        display: block;
        color: var(--hr-muted);
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .hexrgb-value-code {
        display: block;
        margin-top: 6px;
        padding-right: 42px;
        overflow-wrap: anywhere;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.5;
      }

      .hex-copy-mini {
        position: absolute;
        top: 10px;
        right: 10px;
        height: 25px;
        padding: 0 7px;
        border: 1px solid var(--hr-border);
        border-radius: 6px;
        background: var(--hr-card);
        color: var(--hr-muted);
        cursor: pointer;
        font: inherit;
        font-size: 8px;
        font-weight: 800;
      }

      .hexrgb-section {
        margin-top: 18px;
        padding: 22px;
        border: 1px solid var(--hr-border);
        border-radius: 17px;
        background: var(--hr-card);
        box-shadow: 0 8px 30px rgba(16,24,40,.035);
      }

      .hexrgb-section-heading {
        margin-bottom: 16px;
      }

      .hexrgb-section-heading h2 {
        margin: 0;
        font-size: 17px;
        letter-spacing: -.025em;
      }

      .hexrgb-section-heading p {
        margin: 5px 0 0;
        color: var(--hr-muted);
        font-size: 11px;
      }

      .hexrgb-contrast {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .hexrgb-contrast-card {
        overflow: hidden;
        border: 1px solid var(--hr-border);
        border-radius: 12px;
      }

      .hexrgb-contrast-preview {
        min-height: 92px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 15px;
        text-align: center;
        font-size: 16px;
        font-weight: 800;
      }

      .hexrgb-contrast-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 11px;
        background: var(--hr-soft);
      }

      .hexrgb-contrast-info span {
        color: var(--hr-muted);
        font-size: 9px;
      }

      .hexrgb-contrast-info strong {
        font-size: 11px;
      }

      .hexrgb-status {
        display: inline-flex;
        align-items: center;
        padding: 4px 7px;
        border-radius: 5px;
        background: rgba(18,183,106,.1);
        color: #12b76a;
        font-size: 8px;
        font-weight: 800;
      }

      .hexrgb-shades {
        display: grid;
        grid-template-columns: repeat(9,1fr);
        overflow: hidden;
        border-radius: 10px;
        border: 1px solid var(--hr-border);
      }

      .hexrgb-shade {
        min-width: 0;
        height: 62px;
        border: 0;
        cursor: pointer;
      }

      .hexrgb-shade-label {
        display: block;
        margin-top: 7px;
        color: var(--hr-muted);
        text-align: center;
        font-size: 8px;
        font-weight: 700;
      }

      .hexrgb-shade-item {
        min-width: 0;
        text-align: center;
      }

      .hexrgb-css-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 13px;
        border: 1px solid var(--hr-border);
        border-radius: 10px;
        background: var(--hr-soft);
      }

      .hexrgb-css-box code {
        overflow-wrap: anywhere;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 10px;
      }

      .hexrgb-reset {
        width: 100%;
        height: 40px;
        margin-top: 16px;
        border: 1px solid var(--hr-border);
        border-radius: 9px;
        background: transparent;
        color: var(--hr-muted);
        cursor: pointer;
        font: inherit;
        font-size: 10px;
        font-weight: 750;
      }

      .hexrgb-privacy {
        margin-top: 13px;
        color: var(--hr-muted);
        font-size: 9px;
        line-height: 1.6;
        text-align: center;
      }

      @media (max-width: 850px) {
        .hexrgb-main {
          grid-template-columns: 1fr;
        }

        .hexrgb-shades {
          grid-template-columns: repeat(5,1fr);
        }
      }

      @media (max-width: 600px) {
        .hexrgb-header {
          flex-direction: column;
          align-items: stretch;
        }

        .hexrgb-actions {
          width: 100%;
        }

        .hexrgb-button {
          flex: 1;
        }

        .hexrgb-input-card,
        .hexrgb-values,
        .hexrgb-section {
          padding: 16px;
        }

        .hexrgb-value-grid,
        .hexrgb-contrast {
          grid-template-columns: 1fr;
        }

        .hexrgb-big-preview {
          min-height: 170px;
          padding: 20px;
        }
      }

      @media (max-width: 420px) {
        .hexrgb-shades {
          grid-template-columns: repeat(3,1fr);
        }

        .hexrgb-input-row {
          grid-template-columns: 1fr;
        }

        .hexrgb-color-preview {
          width: 100%;
        }
      }

      .dark .hexrgb-tool,
      body.dark .hexrgb-tool,
      html.dark .hexrgb-tool {
        --hr-text: #f2f4f7;
        --hr-muted: #98a2b3;
        --hr-border: #2d3442;
        --hr-card: #151922;
        --hr-soft: #10141c;
        --hr-input: #10141c;
        --hr-primary: #8078ff;
      }
    `;

    if (!data) {
      return (
        <>
          <style>{styleText}</style>

          <div className="hexrgb-tool">
            <div className="hexrgb-wrapper">
              <div className="hexrgb-header">
                <div>
                  <div className="hexrgb-eyebrow">
                    COLOR CONVERTER
                  </div>
                  <h1>HEX to RGB Converter</h1>
                  <p>
                    Convert HEX colors into RGB,
                    HSL, CMYK and ready-to-use CSS
                    values with instant visual
                    feedback.
                  </p>
                </div>
              </div>

              <div className="hexrgb-card hexrgb-input-card">
                <div className="hexrgb-card-title">
                  Enter a HEX color
                </div>

                <div className="hexrgb-card-subtitle">
                  Use 3-digit or 6-digit HEX
                  notation.
                </div>

                <label
                  className="hexrgb-label"
                  htmlFor="hexrgb-input"
                >
                  HEX COLOR
                </label>

                <input
                  id="hexrgb-input"
                  className="hexrgb-input"
                  value={this.state.hex}
                  onChange={this.handleHexChange}
                  placeholder="#635BFF"
                  autoComplete="off"
                />

                <button
                  type="button"
                  className="hexrgb-reset"
                  onClick={this.reset}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    const {
      hex,
      rgb,
      hsl,
      cmyk,
      alpha,
      whiteContrast,
      blackContrast,
    } = data;

    const textColor =
      this.getLuminance(
        rgb.r,
        rgb.g,
        rgb.b
      ) > 0.48
        ? "#111111"
        : "#FFFFFF";

    const rgbaValue =
      `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;

    const rgbValue =
      `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    const hslValue =
      `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    const cmykValue =
      `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

    const cssValue =
      `--color-primary: ${hex};`;

    const whiteLevel =
      this.getContrastLevel(
        whiteContrast,
        false
      );

    const blackLevel =
      this.getContrastLevel(
        blackContrast,
        false
      );

    const shadeValues = [
      {
        label: "100",
        color: this.shadeColor(hex, 85),
      },
      {
        label: "200",
        color: this.shadeColor(hex, 70),
      },
      {
        label: "300",
        color: this.shadeColor(hex, 50),
      },
      {
        label: "400",
        color: this.shadeColor(hex, 25),
      },
      {
        label: "500",
        color: hex,
      },
      {
        label: "600",
        color: this.shadeColor(hex, -15),
      },
      {
        label: "700",
        color: this.shadeColor(hex, -30),
      },
      {
        label: "800",
        color: this.shadeColor(hex, -45),
      },
      {
        label: "900",
        color: this.shadeColor(hex, -60),
      },
    ];

    return (
      <>
        <style>{styleText}</style>

        <div className="hexrgb-tool">
          <div className="hexrgb-wrapper">

            <div className="hexrgb-header">
              <div>
                <div className="hexrgb-eyebrow">
                  COLOR CONVERTER
                </div>

                <h1>
                  HEX to RGB Converter
                </h1>

                <p>
                  Convert HEX colors into RGB,
                  HSL, CMYK and production-ready
                  CSS values. Check contrast,
                  transparency and generate a
                  complete shade scale instantly.
                </p>
              </div>

              <div className="hexrgb-actions">
                <button
                  type="button"
                  className="hexrgb-button"
                  onClick={this.reset}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="hexrgb-button primary"
                  onClick={this.copyAll}
                >
                  {this.state.copied === "all"
                    ? "✓ Copied"
                    : "Copy All"}
                </button>
              </div>
            </div>

            <div className="hexrgb-main">

              <div className="hexrgb-card hexrgb-input-card">

                <div className="hexrgb-card-title">
                  Pick your color
                </div>

                <div className="hexrgb-card-subtitle">
                  Enter a HEX value or use the
                  native color picker.
                </div>

                <div className="hexrgb-picker-wrap">
                  <input
                    type="color"
                    className="hexrgb-color-picker"
                    value={hex}
                    onChange={this.handleColorChange}
                    aria-label="Choose color"
                  />

                  <div className="hexrgb-picker-overlay" />
                </div>

                <label
                  className="hexrgb-label"
                  htmlFor="hexrgb-main-input"
                >
                  HEX COLOR
                </label>

                <div className="hexrgb-input-row">
                  <input
                    id="hexrgb-main-input"
                    className="hexrgb-input"
                    value={this.state.hex}
                    onChange={this.handleHexChange}
                    placeholder="#635BFF"
                    autoComplete="off"
                    spellCheck="false"
                  />

                  <div
                    className="hexrgb-color-preview"
                    style={{
                      background: hex,
                    }}
                    aria-label="Selected color"
                  />
                </div>

                <div className="hexrgb-alpha-head">
                  <label htmlFor="hexrgb-alpha">
                    ALPHA / OPACITY
                  </label>

                  <span className="hexrgb-alpha-value">
                    {this.state.alpha}%
                  </span>
                </div>

                <input
                  id="hexrgb-alpha"
                  className="hexrgb-range"
                  type="range"
                  min="0"
                  max="100"
                  value={this.state.alpha}
                  onChange={this.handleAlphaChange}
                />

                <div className="hexrgb-presets-title">
                  Quick colors
                </div>

                <div className="hexrgb-presets">
                  {[
                    "#EF4444",
                    "#F97316",
                    "#EAB308",
                    "#22C55E",
                    "#06B6D4",
                    "#3B82F6",
                    "#6366F1",
                    "#A855F7",
                    "#EC4899",
                    "#111827",
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      className="hexrgb-preset"
                      title={preset}
                      aria-label={
                        "Use " + preset
                      }
                      style={{
                        background: preset,
                      }}
                      onClick={() =>
                        this.handlePreset(
                          preset
                        )
                      }
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="hexrgb-reset"
                  onClick={this.reset}
                >
                  Reset Color
                </button>
              </div>

              <div className="hexrgb-card hexrgb-result-card">

                <div
                  className="hexrgb-big-preview"
                  style={{
                    background: hex,
                    color: textColor,
                  }}
                >
                  <div className="hexrgb-preview-content">
                    <span className="hexrgb-preview-label">
                      SELECTED COLOR
                    </span>

                    <div className="hexrgb-preview-hex">
                      {hex}
                    </div>

                    <div className="hexrgb-preview-meta">
                      {rgb.r}, {rgb.g}, {rgb.b}
                    </div>
                  </div>

                  <div
                    className="hexrgb-preview-chip"
                    style={{
                      background:
                        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
                    }}
                  />
                </div>

                <div className="hexrgb-values">

                  <div className="hexrgb-value-grid">

                    <div className="hexrgb-value">
                      <span className="hexrgb-value-label">
                        HEX
                      </span>

                      <code className="hexrgb-value-code">
                        {hex}
                      </code>

                      {this.renderCopyButton(
                        hex,
                        "hex"
                      )}
                    </div>

                    <div className="hexrgb-value">
                      <span className="hexrgb-value-label">
                        RGB
                      </span>

                      <code className="hexrgb-value-code">
                        {rgbValue}
                      </code>

                      {this.renderCopyButton(
                        rgbValue,
                        "rgb"
                      )}
                    </div>

                    <div className="hexrgb-value">
                      <span className="hexrgb-value-label">
                        RGBA
                      </span>

                      <code className="hexrgb-value-code">
                        {rgbaValue}
                      </code>

                      {this.renderCopyButton(
                        rgbaValue,
                        "rgba"
                      )}
                    </div>

                    <div className="hexrgb-value">
                      <span className="hexrgb-value-label">
                        HSL
                      </span>

                      <code className="hexrgb-value-code">
                        {hslValue}
                      </code>

                      {this.renderCopyButton(
                        hslValue,
                        "hsl"
                      )}
                    </div>

                    <div className="hexrgb-value">
                      <span className="hexrgb-value-label">
                        CMYK
                      </span>

                      <code className="hexrgb-value-code">
                        {cmykValue}
                      </code>

                      {this.renderCopyButton(
                        cmykValue,
                        "cmyk"
                      )}
                    </div>

                    <div className="hexrgb-value">
                      <span className="hexrgb-value-label">
                        CSS VARIABLE
                      </span>

                      <code className="hexrgb-value-code">
                        {cssValue}
                      </code>

                      {this.renderCopyButton(
                        cssValue,
                        "css"
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div className="hexrgb-section">

              <div className="hexrgb-section-heading">
                <h2>
                  Accessibility contrast
                </h2>

                <p>
                  Check how readable your color
                  is against common backgrounds.
                </p>
              </div>

              <div className="hexrgb-contrast">

                <div className="hexrgb-contrast-card">

                  <div
                    className="hexrgb-contrast-preview"
                    style={{
                      background: "#FFFFFF",
                      color: hex,
                    }}
                  >
                    Sample Text
                  </div>

                  <div className="hexrgb-contrast-info">
                    <span>
                      On White
                    </span>

                    <strong>
                      {whiteContrast.toFixed(
                        2
                      )}
                      :1
                    </strong>

                    <span className="hexrgb-status">
                      {whiteLevel}
                    </span>
                  </div>
                </div>

                <div className="hexrgb-contrast-card">

                  <div
                    className="hexrgb-contrast-preview"
                    style={{
                      background: "#111111",
                      color: hex,
                    }}
                  >
                    Sample Text
                  </div>

                  <div className="hexrgb-contrast-info">
                    <span>
                      On Black
                    </span>

                    <strong>
                      {blackContrast.toFixed(
                        2
                      )}
                      :1
                    </strong>

                    <span className="hexrgb-status">
                      {blackLevel}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <div className="hexrgb-section">

              <div className="hexrgb-section-heading">
                <h2>
                  Automatic color scale
                </h2>

                <p>
                  A quick 100–900 shade scale
                  generated from your selected
                  color.
                </p>
              </div>

              <div className="hexrgb-shades">
                {shadeValues.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="hexrgb-shade"
                    title={
                      item.color +
                      " — click to use"
                    }
                    style={{
                      background:
                        item.color,
                    }}
                    onClick={() =>
                      this.handlePreset(
                        item.color
                      )
                    }
                    aria-label={
                      "Use shade " +
                      item.label
                    }
                  />
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(9,1fr)",
                  gap: "0",
                  marginTop: "4px",
                }}
              >
                {shadeValues.map((item) => (
                  <span
                    key={item.label}
                    className="hexrgb-shade-label"
                  >
                    {item.label}
                  </span>
                ))}
              </div>

            </div>

            <div className="hexrgb-section">

              <div className="hexrgb-section-heading">
                <h2>
                  Developer-ready CSS
                </h2>

                <p>
                  Copy the color directly into
                  your stylesheet.
                </p>
              </div>

              <div className="hexrgb-css-box">
                <code>
                  {cssValue}
                </code>

                {this.renderCopyButton(
                  cssValue,
                  "css-variable"
                )}
              </div>

              <div className="hexrgb-privacy">
                ✓ Everything is calculated locally
                in your browser. No color data is
                uploaded or stored.
              </div>

            </div>

          </div>
        </div>
      </>
    );
  }
}

export default HexRgbConverter;