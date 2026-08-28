"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const FONT_OPTIONS = [
  { name: "Caveat", label: "Caveat — Natural", lang: "latin" },
  { name: "Patrick Hand", label: "Patrick Hand — Casual", lang: "latin" },
  { name: "Indie Flower", label: "Indie Flower — Friendly", lang: "latin" },
  { name: "Kalam", label: "Kalam — Handwritten", lang: "devanagari" },
  { name: "Noto Nastaliq Urdu", label: "Noto Nastaliq — Urdu", lang: "urdu" },
  { name: "Noto Naskh Arabic", label: "Noto Naskh — Arabic", lang: "arabic" },
  { name: "Amiri", label: "Amiri — Arabic Classic", lang: "arabic" },
  { name: "Noto Sans Devanagari", label: "Noto Sans — Hindi", lang: "devanagari" },
];

const PAGE_OPTIONS = {
  A4: { width: 794, height: 1123, label: "A4" },
  A5: { width: 559, height: 794, label: "A5" },
  Letter: { width: 816, height: 1056, label: "US Letter" },
  Legal: { width: 816, height: 1344, label: "Legal" },
  Square: { width: 900, height: 900, label: "Square" },
};

const SAMPLE_TEXT = `This is a sample of handwritten text.

You can write multiple paragraphs here and customize the page exactly the way you want.

Change the handwriting style, ink color, page design, spacing and direction.`;

const DEFAULT_SETTINGS = {
  font: "Caveat",
  fontSize: 28,
  lineHeight: 1.65,
  margin: 55,
  color: "#172033",
  opacity: 100,
  wobble: 1.2,
  baseline: 1,
  paper: "ruled",
  pageSize: "A4",
  direction: "auto",
  alignment: "left",
  header: "",
  footer: "",
  showPageNumber: true,
  rotate: false,
};

function detectDirection(text) {
  if (!text) return "ltr";

  const rtlChars = text.match(
    /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g
  );

  const ltrChars = text.match(/[A-Za-z\u0900-\u097F]/g);

  return rtlChars && (!ltrChars || rtlChars.length >= ltrChars.length)
    ? "rtl"
    : "ltr";
}

function loadFonts() {
  if (typeof document === "undefined") return;

  const id = "text-handwriting-google-fonts";

  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Caveat:wght@400;500;600;700&family=Indie+Flower&family=Kalam:wght@300;400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Patrick+Hand&display=swap";

  document.head.appendChild(link);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function canvasToBlob(canvas, type = "image/png", quality = 1) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

function getPageDimensions(settings) {
  const base = PAGE_OPTIONS[settings.pageSize] || PAGE_OPTIONS.A4;

  if (settings.rotate) {
    return {
      width: base.height,
      height: base.width,
    };
  }

  return {
    width: base.width,
    height: base.height,
  };
}

function splitTextIntoPages(text, settings) {
  const dimensions = getPageDimensions(settings);
  const width = dimensions.width;
  const height = dimensions.height;

  const margin = settings.margin;
  const contentWidth = width - margin * 2;

  const fontSize = Number(settings.fontSize);
  const lineHeight = fontSize * Number(settings.lineHeight);

  const headerSpace = settings.header ? 45 : 0;
  const footerSpace = settings.footer || settings.showPageNumber ? 45 : 0;

  const availableHeight =
    height - margin * 2 - headerSpace - footerSpace;

  const maxLines = Math.max(
    1,
    Math.floor(availableHeight / lineHeight)
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  ctx.font = `${fontSize}px "${settings.font}"`;

  const paragraphs = String(text || "").split(/\r?\n/);

  const lines = [];

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      lines.push("");
      return;
    }

    const words = paragraph.split(/\s+/);
    let current = "";

    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      const measured = ctx.measureText(test).width;

      if (measured <= contentWidth || !current) {
        current = test;
      } else {
        lines.push(current);
        current = word;
      }
    });

    if (current) lines.push(current);
  });

  const pages = [];

  for (let i = 0; i < lines.length; i += maxLines) {
    pages.push(lines.slice(i, i + maxLines));
  }

  if (!pages.length) pages.push([""]);

  return pages;
}

function drawPaper(ctx, width, height, settings) {
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, width, height);

  if (settings.paper === "blank") {
    return;
  }

  if (settings.paper === "ruled") {
    const spacing = Math.max(24, Number(settings.fontSize) * 1.55);

    ctx.save();
    ctx.strokeStyle = "rgba(90,120,170,0.22)";
    ctx.lineWidth = 1;

    for (let y = 45; y < height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  if (settings.paper === "grid") {
    const spacing = 28;

    ctx.save();
    ctx.strokeStyle = "rgba(100,120,150,0.16)";
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  if (settings.paper === "dots") {
    const spacing = 28;

    ctx.save();
    ctx.fillStyle = "rgba(80,100,130,0.28)";

    for (let y = spacing; y < height; y += spacing) {
      for (let x = spacing; x < width; x += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  if (settings.paper === "old") {
    ctx.fillStyle = "rgba(210,185,130,0.09)";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 250; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;

      ctx.fillStyle = "rgba(100,80,50,0.035)";
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

function drawPage(ctx, lines, settings, pageNumber, totalPages) {
  const { width, height } = getPageDimensions(settings);

  ctx.clearRect(0, 0, width, height);
  drawPaper(ctx, width, height, settings);

  const margin = Number(settings.margin);
  const fontSize = Number(settings.fontSize);
  const lineHeight = fontSize * Number(settings.lineHeight);

  const direction =
    settings.direction === "auto"
      ? detectDirection(lines.join(" "))
      : settings.direction;

  const isRTL = direction === "rtl";

  let textAlign = settings.alignment;

  if (textAlign === "auto") {
    textAlign = isRTL ? "right" : "left";
  }

  ctx.save();

  ctx.font = `${fontSize}px "${settings.font}"`;
  ctx.textBaseline = "middle";
  ctx.globalAlpha = Number(settings.opacity) / 100;
  ctx.fillStyle = settings.color;

  if (settings.header) {
    ctx.save();
    ctx.font = `600 ${Math.max(15, fontSize * 0.55)}px Arial`;
    ctx.fillStyle = "rgba(30,40,55,0.6)";
    ctx.textAlign = "center";
    ctx.fillText(settings.header, width / 2, margin * 0.48);
    ctx.restore();
  }

  let startY = margin + fontSize;

  if (settings.header) {
    startY += 25;
  }

  lines.forEach((line, index) => {
    if (!line) {
      startY += lineHeight;
      return;
    }

    let x;

    if (textAlign === "center") {
      x = width / 2;
    } else if (textAlign === "right") {
      x = width - margin;
    } else {
      x = margin;
    }

    if (textAlign === "left" && isRTL) {
      x = width - margin;
      ctx.textAlign = "right";
    } else if (textAlign === "right" && !isRTL) {
      x = margin;
      ctx.textAlign = "left";
    } else {
      ctx.textAlign = textAlign;
    }

    const wobble =
      (Math.random() - 0.5) * Number(settings.wobble) * 1.8;

    const baseline =
      (Math.random() - 0.5) * Number(settings.baseline) * 2;

    ctx.save();

    ctx.translate(x, startY + baseline);
    ctx.rotate((wobble * Math.PI) / 180);

    ctx.fillText(line, 0, 0);

    ctx.restore();

    startY += lineHeight;
  });

  if (settings.footer) {
    ctx.save();
    ctx.font = `500 ${Math.max(13, fontSize * 0.5)}px Arial`;
    ctx.fillStyle = "rgba(30,40,55,0.55)";
    ctx.textAlign = "center";
    ctx.fillText(settings.footer, width / 2, height - margin * 0.5);
    ctx.restore();
  }

  if (settings.showPageNumber) {
    ctx.save();
    ctx.font = `500 ${Math.max(12, fontSize * 0.45)}px Arial`;
    ctx.fillStyle = "rgba(30,40,55,0.5)";
    ctx.textAlign = "right";

    ctx.fillText(
      `${pageNumber} / ${totalPages}`,
      width - margin,
      height - Math.max(18, margin * 0.38)
    );

    ctx.restore();
  }

  ctx.restore();
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#64748b",
          marginBottom: 7,
        }}
      >
        {label}
      </div>

      {children}
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}) {
  return (
    <Field label={`${label}: ${value}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: "#2563eb",
        }}
      />
    </Field>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          border: "1px solid #dbe1ea",
          borderRadius: 9,
          padding: "9px 10px",
          background: "#fff",
          color: "#172033",
          fontSize: 13,
          outline: "none",
        }}
      >
        {children}
      </select>
    </Field>
  );
}

export default function TextToHandwriting() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [currentPage, setCurrentPage] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [notice, setNotice] = useState("");

  const canvasRef = useRef(null);

  useEffect(() => {
    loadFonts();

    const timer = setTimeout(() => {
      if (document.fonts) {
        document.fonts.ready.then(() => {
          window.dispatchEvent(new Event("resize"));
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const pages = useMemo(
    () => splitTextIntoPages(text, settings),
    [text, settings]
  );

  useEffect(() => {
    if (currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1));
    }
  }, [pages.length, currentPage]);

  const renderCurrentPage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = getPageDimensions(settings);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    drawPage(
      ctx,
      pages[currentPage] || [""],
      settings,
      currentPage + 1,
      pages.length
    );
  };

  useEffect(() => {
    const timer = setTimeout(renderCurrentPage, 80);
    return () => clearTimeout(timer);
  }, [pages, currentPage, settings]);

  const update = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const downloadCurrentPNG = async () => {
    renderCurrentPage();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const blob = await canvasToBlob(canvas);

    if (blob) {
      downloadBlob(
        blob,
        `handwriting-page-${currentPage + 1}.png`
      );
    }

    setNotice("PNG downloaded");
    setTimeout(() => setNotice(""), 1800);
  };

  const downloadAllPNG = async () => {
    const canvas = document.createElement("canvas");

    for (let i = 0; i < pages.length; i++) {
      const { width, height } = getPageDimensions(settings);

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      drawPage(
        ctx,
        pages[i],
        settings,
        i + 1,
        pages.length
      );

      const blob = await canvasToBlob(canvas);

      if (blob) {
        downloadBlob(blob, `handwriting-page-${i + 1}.png`);
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    setNotice("All PNG pages downloaded");
    setTimeout(() => setNotice(""), 2000);
  };

  const downloadPDF = async () => {
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

      const pdf = new jsPDF({
        orientation:
          settings.rotate || settings.pageSize === "Square"
            ? "landscape"
            : "portrait",
        unit: "pt",
        format:
          settings.pageSize === "Square"
            ? [900, 900]
            : settings.pageSize.toLowerCase(),
      });

      const canvas = document.createElement("canvas");

      for (let i = 0; i < pages.length; i++) {
        const { width, height } = getPageDimensions(settings);

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        drawPage(
          ctx,
          pages[i],
          settings,
          i + 1,
          pages.length
        );

        const image = canvas.toDataURL("image/png", 1);

        if (i > 0) {
          pdf.addPage();
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(
          image,
          "PNG",
          0,
          0,
          pageWidth,
          pageHeight,
          undefined,
          "FAST"
        );
      }

      pdf.save("text-to-handwriting.pdf");

      setNotice("PDF downloaded");
      setTimeout(() => setNotice(""), 2000);
    } catch (error) {
      console.error(error);

      setNotice(
        "PDF export requires the existing jsPDF package."
      );

      setTimeout(() => setNotice(""), 3000);
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(
        "toolslay-text-handwriting",
        JSON.stringify({
          text,
          settings,
        })
      );

      setNotice("Draft saved");
      setTimeout(() => setNotice(""), 1800);
    } catch {
      setNotice("Could not save draft");
    }
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(
        "toolslay-text-handwriting"
      );

      if (!saved) {
        setNotice("No saved draft found");
        setTimeout(() => setNotice(""), 1800);
        return;
      }

      const data = JSON.parse(saved);

      if (data.text !== undefined) setText(data.text);
      if (data.settings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data.settings,
        });
      }

      setNotice("Draft loaded");
      setTimeout(() => setNotice(""), 1800);
    } catch {
      setNotice("Could not load draft");
    }
  };

  const randomStyle = () => {
    const fonts = FONT_OPTIONS.map((f) => f.name);

    const papers = [
      "ruled",
      "grid",
      "dots",
      "blank",
      "old",
    ];

    const colors = [
      "#172033",
      "#111827",
      "#1d4ed8",
      "#374151",
      "#334155",
      "#581c87",
      "#7c2d12",
    ];

    setSettings((prev) => ({
      ...prev,
      font: fonts[Math.floor(Math.random() * fonts.length)],
      paper: papers[Math.floor(Math.random() * papers.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      fontSize: 23 + Math.floor(Math.random() * 12),
      wobble: Number((0.5 + Math.random() * 2).toFixed(1)),
      baseline: Number((0.5 + Math.random() * 1.8).toFixed(1)),
      lineHeight: Number(
        (1.35 + Math.random() * 0.55).toFixed(2)
      ),
    }));

    setNotice("Random handwriting style applied");
    setTimeout(() => setNotice(""), 1800);
  };

  const reset = () => {
    setText(SAMPLE_TEXT);
    setSettings(DEFAULT_SETTINGS);
    setCurrentPage(0);

    setNotice("Reset complete");
    setTimeout(() => setNotice(""), 1800);
  };

  const containerBg = darkMode ? "#0f172a" : "#f5f7fb";
  const panelBg = darkMode ? "#111827" : "#ffffff";
  const textColor = darkMode ? "#f8fafc" : "#172033";
  const mutedColor = darkMode ? "#94a3b8" : "#64748b";
  const borderColor = darkMode ? "#263449" : "#e2e8f0";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: containerBg,
        color: textColor,
        padding: "24px 16px 40px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1450,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 27,
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              Text to Handwriting
            </div>

            <div
              style={{
                color: mutedColor,
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Turn typed text into realistic handwritten pages
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={randomStyle}
              style={buttonStyle("#eef2ff", "#3730a3")}
            >
              ✨ Random Style
            </button>

            <button
              onClick={() => setDarkMode((v) => !v)}
              style={buttonStyle(
                darkMode ? "#1e293b" : "#ffffff",
                textColor,
                borderColor
              )}
            >
              {darkMode ? "☀ Light" : "☾ Dark"}
            </button>

            <button
              onClick={reset}
              style={buttonStyle("#fff1f2", "#be123c")}
            >
              Reset
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "330px minmax(0, 1fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          {/* CONTROLS */}
          <div
            style={{
              background: panelBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 16,
              padding: 18,
              boxShadow: darkMode
                ? "0 10px 30px rgba(0,0,0,.2)"
                : "0 10px 30px rgba(15,23,42,.05)",
            }}
          >
            <Field label="Your Text">
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setCurrentPage(0);
                }}
                placeholder="Type or paste your text..."
                style={{
                  width: "100%",
                  minHeight: 170,
                  resize: "vertical",
                  border: `1px solid ${borderColor}`,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  lineHeight: 1.55,
                  background: darkMode ? "#0f172a" : "#fff",
                  color: textColor,
                  outline: "none",
                }}
              />
            </Field>

            <SelectField
              label="Handwriting Font"
              value={settings.font}
              onChange={(v) => update("font", v)}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.label}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Writing Direction"
              value={settings.direction}
              onChange={(v) => update("direction", v)}
            >
              <option value="auto">
                Auto Detect
              </option>
              <option value="ltr">
                Left → Right
              </option>
              <option value="rtl">
                Right → Left
              </option>
            </SelectField>

            <SelectField
              label="Alignment"
              value={settings.alignment}
              onChange={(v) => update("alignment", v)}
            >
              <option value="auto">Auto</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </SelectField>

            <RangeField
              label="Font Size"
              value={settings.fontSize}
              min={12}
              max={60}
              onChange={(v) => update("fontSize", v)}
            />

            <RangeField
              label="Line Spacing"
              value={settings.lineHeight}
              min={1}
              max={2.5}
              step={0.05}
              onChange={(v) => update("lineHeight", v)}
            />

            <RangeField
              label="Page Margin"
              value={settings.margin}
              min={20}
              max={110}
              onChange={(v) => update("margin", v)}
            />

            <RangeField
              label="Natural Wobble"
              value={settings.wobble}
              min={0}
              max={5}
              step={0.1}
              onChange={(v) => update("wobble", v)}
            />

            <RangeField
              label="Baseline Variation"
              value={settings.baseline}
              min={0}
              max={5}
              step={0.1}
              onChange={(v) => update("baseline", v)}
            />

            <RangeField
              label="Ink Opacity"
              value={settings.opacity}
              min={30}
              max={100}
              onChange={(v) => update("opacity", v)}
            />

            <Field label="Ink Color">
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "center",
                }}
              >
                <input
                  type="color"
                  value={settings.color}
                  onChange={(e) =>
                    update("color", e.target.value)
                  }
                  style={{
                    width: 44,
                    height: 38,
                    border: 0,
                    padding: 0,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                />

                <input
                  type="text"
                  value={settings.color}
                  onChange={(e) =>
                    update("color", e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "9px 10px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: darkMode
                      ? "#0f172a"
                      : "#fff",
                    color: textColor,
                  }}
                />
              </div>
            </Field>

            <SelectField
              label="Page Size"
              value={settings.pageSize}
              onChange={(v) => update("pageSize", v)}
            >
              {Object.entries(PAGE_OPTIONS).map(
                ([key, page]) => (
                  <option key={key} value={key}>
                    {page.label}
                  </option>
                )
              )}
            </SelectField>

            <SelectField
              label="Paper Style"
              value={settings.paper}
              onChange={(v) => update("paper", v)}
            >
              <option value="ruled">
                📖 Ruled Notebook
              </option>
              <option value="grid">
                ▦ Grid Paper
              </option>
              <option value="dots">
                ⠿ Dot Grid
              </option>
              <option value="blank">
                □ Blank Paper
              </option>
              <option value="old">
                📜 Vintage Paper
              </option>
            </SelectField>

            <SelectField
              label="Orientation"
              value={settings.rotate ? "landscape" : "portrait"}
              onChange={(v) =>
                update("rotate", v === "landscape")
              }
            >
              <option value="portrait">
                Portrait
              </option>
              <option value="landscape">
                Landscape
              </option>
            </SelectField>

            <Field label="Header">
              <input
                value={settings.header}
                onChange={(e) =>
                  update("header", e.target.value)
                }
                placeholder="Optional header"
                style={inputStyle(darkMode, borderColor, textColor)}
              />
            </Field>

            <Field label="Footer">
              <input
                value={settings.footer}
                onChange={(e) =>
                  update("footer", e.target.value)
                }
                placeholder="Optional footer"
                style={inputStyle(darkMode, borderColor, textColor)}
              />
            </Field>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                marginBottom: 18,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={settings.showPageNumber}
                onChange={(e) =>
                  update(
                    "showPageNumber",
                    e.target.checked
                  )
                }
              />
              Show page numbers
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <button
                onClick={saveDraft}
                style={buttonStyle(
                  darkMode ? "#1e293b" : "#f8fafc",
                  textColor,
                  borderColor
                )}
              >
                💾 Save
              </button>

              <button
                onClick={loadDraft}
                style={buttonStyle(
                  darkMode ? "#1e293b" : "#f8fafc",
                  textColor,
                  borderColor
                )}
              >
                ↻ Load
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          <div>
            <div
              style={{
                background: panelBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    Live Preview
                  </div>

                  <div
                    style={{
                      color: mutedColor,
                      fontSize: 12,
                      marginTop: 3,
                    }}
                  >
                    Page {currentPage + 1} of {pages.length}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 7,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    disabled={currentPage === 0}
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.max(0, p - 1)
                      )
                    }
                    style={buttonStyle(
                      currentPage === 0
                        ? "#f1f5f9"
                        : "#eff6ff",
                      currentPage === 0
                        ? "#94a3b8"
                        : "#1d4ed8"
                    )}
                  >
                    ← Previous
                  </button>

                  <button
                    disabled={
                      currentPage === pages.length - 1
                    }
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          pages.length - 1,
                          p + 1
                        )
                      )
                    }
                    style={buttonStyle(
                      currentPage === pages.length - 1
                        ? "#f1f5f9"
                        : "#eff6ff",
                      currentPage === pages.length - 1
                        ? "#94a3b8"
                        : "#1d4ed8"
                    )}
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: darkMode
                    ? "#020617"
                    : "#e9edf3",
                  borderRadius: 12,
                  padding: 18,
                  minHeight: 650,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  overflow: "auto",
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    height: "auto",
                    boxShadow:
                      "0 12px 35px rgba(15,23,42,.22)",
                    background: "#fff",
                  }}
                />
              </div>

              {/* PAGE THUMBNAILS */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  padding: "14px 2px 2px",
                }}
              >
                {pages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    style={{
                      flex: "0 0 auto",
                      width: 55,
                      height: 70,
                      border:
                        index === currentPage
                          ? "2px solid #2563eb"
                          : `1px solid ${borderColor}`,
                      borderRadius: 7,
                      background:
                        index === currentPage
                          ? "#eff6ff"
                          : panelBg,
                      color: textColor,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* EXPORT BUTTONS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: 9,
                  marginTop: 14,
                }}
              >
                <button
                  onClick={downloadCurrentPNG}
                  style={primaryButton("#2563eb")}
                >
                  🖼 PNG Page
                </button>

                <button
                  onClick={downloadAllPNG}
                  style={primaryButton("#0f766e")}
                >
                  🖼 All PNG
                </button>

                <button
                  onClick={downloadPDF}
                  style={primaryButton("#7c3aed")}
                >
                  📄 Download PDF
                </button>
              </div>

              {notice && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    borderRadius: 9,
                    background: darkMode
                      ? "#172554"
                      : "#eff6ff",
                    color: darkMode
                      ? "#bfdbfe"
                      : "#1d4ed8",
                    fontSize: 13,
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {notice}
                </div>
              )}
            </div>

            {/* FEATURE INFO */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
                gap: 10,
                marginTop: 12,
              }}
            >
              {[
                ["✍️", "Natural Ink", "Wobble + baseline variation"],
                ["🌐", "Multi-Language", "English, Hindi, Urdu & Arabic"],
                ["📄", "Multi-Page", "Automatic page breaking"],
                ["⬇️", "Export", "PNG + multi-page PDF"],
              ].map(([icon, title, desc]) => (
                <div
                  key={title}
                  style={{
                    background: panelBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 12,
                    padding: 13,
                  }}
                >
                  <div style={{ fontSize: 19 }}>
                    {icon}
                  </div>

                  <div
                    style={{
                      fontWeight: 750,
                      fontSize: 13,
                      marginTop: 6,
                    }}
                  >
                    {title}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: mutedColor,
                      marginTop: 3,
                      lineHeight: 1.4,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1000px) {
          div[style*="grid-template-columns: 330px"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 700px) {
          div[style*="repeat(4, minmax(0, 1fr))"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          div[style*="repeat(3, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function buttonStyle(
  background,
  color,
  borderColor = "transparent"
) {
  return {
    border: `1px solid ${borderColor}`,
    background,
    color,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}

function primaryButton(background) {
  return {
    border: "none",
    background,
    color: "#fff",
    borderRadius: 9,
    padding: "12px 10px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  };
}

function inputStyle(darkMode, borderColor, color) {
  return {
    width: "100%",
    padding: "9px 10px",
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    background: darkMode ? "#0f172a" : "#fff",
    color,
    outline: "none",
    fontSize: 13,
  };
}