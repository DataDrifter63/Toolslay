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

    const adjust = (value) => {
      if (percent >= 0) {
        return Math.round(
          value +
            (255 - value) *
              (percent / 100)
        );
      }

      return Math.round(
        value * (1 + percent / 100)
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
        className="absolute top-2.5 right-2.5 px-2 py-1 border border-line rounded-md bg-surface text-muted hover:text-brand cursor-pointer text-[9px] font-bold uppercase transition-colors"
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

    if (!data) {
      return (
        <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border">
          <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border">
            <div>
              <div className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">COLOR CONVERTER</div>
              <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">HEX to RGB Converter</h1>
              <p className="text-xs font-bold text-muted mt-0.5">Convert HEX colors into RGB, HSL, CMYK and ready-to-use CSS values.</p>
            </div>
          </div>

          <div className="bg-paper border border-line p-6 rounded-2xl shadow-sm space-y-4 max-w-md">
            <div className="text-sm font-black uppercase tracking-wider text-ink">Enter a valid HEX color</div>
            <div className="text-xs font-bold text-muted">Use 3-digit or 6-digit HEX notation.</div>
            <label className="text-[10px] font-black text-muted uppercase tracking-wider block" htmlFor="hexrgb-input">HEX COLOR</label>
            <input
              id="hexrgb-input"
              className="w-full h-11 px-3 border border-line rounded-xl bg-surface text-ink text-xs font-black outline-none focus:border-brand font-mono uppercase"
              value={this.state.hex}
              onChange={this.handleHexChange}
              placeholder="#635BFF"
              autoComplete="off"
            />
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-surface border border-line text-ink text-xs font-black uppercase tracking-wider hover:border-brand transition-colors"
              onClick={this.reset}
            >
              Reset
            </button>
          </div>
        </div>
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
      { label: "100", color: this.shadeColor(hex, 85) },
      { label: "200", color: this.shadeColor(hex, 70) },
      { label: "300", color: this.shadeColor(hex, 50) },
      { label: "400", color: this.shadeColor(hex, 25) },
      { label: "500", color: hex },
      { label: "600", color: this.shadeColor(hex, -15) },
      { label: "700", color: this.shadeColor(hex, -30) },
      { label: "800", color: this.shadeColor(hex, -45) },
      { label: "900", color: this.shadeColor(hex, -60) },
    ];

    return (
      <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border">
        
        {/* COMPACT SLEEK HEADER BAR */}
        <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border">
          <div>
            <div className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">COLOR CONVERTER</div>
            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">HEX to RGB Converter</h1>
            <p className="text-xs font-bold text-muted mt-0.5">Convert HEX colors into RGB, HSL, CMYK and production-ready CSS values.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={this.reset}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface border border-line text-ink text-xs font-black uppercase tracking-wider hover:border-brand/50 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={this.copyAll}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-brand text-surface text-xs font-black uppercase tracking-wider shadow-sm transition-opacity hover:opacity-90"
            >
              {this.state.copied === "all" ? "✓ Copied" : "Copy All"}
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-6 items-start">
          
          {/* LEFT COLUMN: INPUT CARD */}
          <div className="bg-paper border border-line p-5 sm:p-6 rounded-2xl shadow-sm space-y-5">
            <div>
              <div className="text-sm font-black uppercase tracking-wider text-ink">Pick your color</div>
              <div className="text-xs font-bold text-muted mt-0.5">Enter a HEX value or use the native color picker.</div>
            </div>

            <div className="relative overflow-hidden h-36 rounded-xl border border-line">
              <input
                type="color"
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                value={hex}
                onChange={this.handleColorChange}
                aria-label="Choose color"
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-40" />
            </div>

            <label className="text-[10px] font-black text-muted uppercase tracking-wider block" htmlFor="hexrgb-main-input">
              HEX COLOR
            </label>

            <div className="grid grid-cols-[1fr,45px] gap-2.5 items-center">
              <input
                id="hexrgb-main-input"
                className="w-full h-11 px-3 border border-line rounded-xl bg-surface text-ink text-xs font-black outline-none focus:border-brand font-mono uppercase"
                value={this.state.hex}
                onChange={this.handleHexChange}
                placeholder="#635BFF"
                autoComplete="off"
                spellCheck="false"
              />
              <div
                className="w-11 h-11 rounded-xl border border-line shrink-0 shadow-sm"
                style={{ background: hex }}
                aria-label="Selected color"
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider" htmlFor="hexrgb-alpha">
                  ALPHA / OPACITY
                </label>
                <span className="text-xs font-black text-brand font-mono">{this.state.alpha}%</span>
              </div>
              <input
                id="hexrgb-alpha"
                className="w-full accent-brand cursor-pointer"
                type="range"
                min="0"
                max="100"
                value={this.state.alpha}
                onChange={this.handleAlphaChange}
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-black text-muted uppercase tracking-wider">Quick colors</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#06B6D4",
                  "#3B82F6", "#6366F1", "#A855F7", "#EC4899", "#111827",
                ].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    className="w-7 h-7 rounded-lg border border-line cursor-pointer transition-transform hover:scale-110 shadow-sm"
                    title={preset}
                    aria-label={"Use " + preset}
                    style={{ background: preset }}
                    onClick={() => this.handlePreset(preset)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PREVIEW & VALUES */}
          <div className="bg-paper border border-line rounded-2xl shadow-sm overflow-hidden flex flex-col">
            
            <div
              className="relative min-h-[190px] p-6 flex items-end justify-between gap-4 transition-colors"
              style={{ background: hex, color: textColor }}
            >
              <div className="relative z-10">
                <span className="block text-[9px] font-black uppercase tracking-widest opacity-75 mb-1">SELECTED COLOR</span>
                <div className="text-3xl sm:text-4xl font-black tracking-tighter font-mono">{hex}</div>
                <div className="text-xs font-bold opacity-80 mt-1 font-mono">{rgb.r}, {rgb.g}, {rgb.b}</div>
              </div>

              <div
                className="relative z-10 w-14 h-14 rounded-2xl border border-white/40 shadow-card shrink-0"
                style={{ background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` }}
              />
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                <div className="relative p-3.5 border border-line rounded-xl bg-surface">
                  <span className="block text-muted text-[9px] font-black uppercase tracking-wider">HEX</span>
                  <code className="block mt-1 font-mono text-xs font-black text-ink">{hex}</code>
                  {this.renderCopyButton(hex, "hex")}
                </div>

                <div className="relative p-3.5 border border-line rounded-xl bg-surface">
                  <span className="block text-muted text-[9px] font-black uppercase tracking-wider">RGB</span>
                  <code className="block mt-1 font-mono text-xs font-black text-ink">{rgbValue}</code>
                  {this.renderCopyButton(rgbValue, "rgb")}
                </div>

                <div className="relative p-3.5 border border-line rounded-xl bg-surface">
                  <span className="block text-muted text-[9px] font-black uppercase tracking-wider">RGBA</span>
                  <code className="block mt-1 font-mono text-xs font-black text-ink">{rgbaValue}</code>
                  {this.renderCopyButton(rgbaValue, "rgba")}
                </div>

                <div className="relative p-3.5 border border-line rounded-xl bg-surface">
                  <span className="block text-muted text-[9px] font-black uppercase tracking-wider">HSL</span>
                  <code className="block mt-1 font-mono text-xs font-black text-ink">{hslValue}</code>
                  {this.renderCopyButton(hslValue, "hsl")}
                </div>

                <div className="relative p-3.5 border border-line rounded-xl bg-surface">
                  <span className="block text-muted text-[9px] font-black uppercase tracking-wider">CMYK</span>
                  <code className="block mt-1 font-mono text-xs font-black text-ink">{cmykValue}</code>
                  {this.renderCopyButton(cmykValue, "cmyk")}
                </div>

                <div className="relative p-3.5 border border-line rounded-xl bg-surface">
                  <span className="block text-muted text-[9px] font-black uppercase tracking-wider">CSS VARIABLE</span>
                  <code className="block mt-1 font-mono text-xs font-black text-ink truncate pr-12">{cssValue}</code>
                  {this.renderCopyButton(cssValue, "css")}
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* ACCESSIBILITY CONTRAST & COLOR SCALE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* ACCESSIBILITY CONTRAST */}
          <div className="bg-paper border border-line p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-ink">Accessibility contrast</h2>
              <p className="text-xs font-bold text-muted mt-0.5">Check how readable your color is against common backgrounds.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-line rounded-xl overflow-hidden bg-surface">
                <div className="min-h-[85px] flex items-center justify-center p-3 text-center text-sm font-black" style={{ background: "#FFFFFF", color: hex }}>
                  Sample Text
                </div>
                <div className="flex items-center justify-between p-3 bg-paper border-t border-line text-xs">
                  <span className="text-[9px] font-bold text-muted uppercase">On White</span>
                  <strong className="font-mono">{whiteContrast.toFixed(2)}:1</strong>
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{whiteLevel}</span>
                </div>
              </div>

              <div className="border border-line rounded-xl overflow-hidden bg-surface">
                <div className="min-h-[85px] flex items-center justify-center p-3 text-center text-sm font-black" style={{ background: "#111111", color: hex }}>
                  Sample Text
                </div>
                <div className="flex items-center justify-between p-3 bg-paper border-t border-line text-xs">
                  <span className="text-[9px] font-bold text-muted uppercase">On Black</span>
                  <strong className="font-mono">{blackContrast.toFixed(2)}:1</strong>
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{blackLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AUTOMATIC COLOR SCALE */}
          <div className="bg-paper border border-line p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-ink">Automatic color scale</h2>
              <p className="text-xs font-bold text-muted mt-0.5">A quick 100–900 shade scale generated from your selected color.</p>
            </div>

            <div className="grid grid-cols-9 rounded-xl overflow-hidden border border-line">
              {shadeValues.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="h-14 border-0 cursor-pointer transition-transform hover:scale-105"
                  title={item.color + " — click to use"}
                  style={{ background: item.color }}
                  onClick={() => this.handlePreset(item.color)}
                  aria-label={"Use shade " + item.label}
                />
              ))}
            </div>
            <div className="grid grid-cols-9 text-center">
              {shadeValues.map((item) => (
                <span key={item.label} className="text-[8px] font-black text-muted font-mono">{item.label}</span>
              ))}
            </div>
          </div>

        </div>

        {/* DEVELOPER-READY CSS & PRIVACY */}
        <div className="bg-paper border border-line p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-ink">Developer-ready CSS</h2>
            <p className="text-xs font-bold text-muted mt-0.5">Copy the color directly into your stylesheet.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border border-line rounded-xl bg-surface">
            <code className="font-mono text-xs font-bold text-ink overflow-x-auto w-full sm:w-auto">{cssValue}</code>
            {this.renderCopyButton(cssValue, "css-variable")}
          </div>

          <div className="text-[10px] font-bold text-muted text-center pt-1">
            ✓ Everything is calculated locally in your browser. No color data is uploaded or stored.
          </div>
        </div>

      </div>
    );
  }
}

export default HexRgbConverter;