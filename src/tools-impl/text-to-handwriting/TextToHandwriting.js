"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  FileText, Sparkles, RefreshCw, Bookmark, 
  ChevronLeft, ChevronRight, Download 
} from "lucide-react";

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
  const rtlChars = text.match(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g);
  const ltrChars = text.match(/[A-Za-z\u0900-\u097F]/g);
  return rtlChars && (!ltrChars || rtlChars.length >= ltrChars.length) ? "rtl" : "ltr";
}

function loadFonts() {
  if (typeof document === "undefined") return;
  const id = "text-handwriting-google-fonts";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Caveat:wght@400;500;600;700&family=Indie+Flower&family=Kalam:wght@300;400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Patrick+Hand&display=swap";
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
    return { width: base.height, height: base.width };
  }
  return { width: base.width, height: base.height };
}

function splitTextIntoPages(text, settings) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return [String(text || "").split(/\r?\n/)];
  }

  const dimensions = getPageDimensions(settings);
  const width = dimensions.width;
  const height = dimensions.height;
  const margin = settings.margin;
  const contentWidth = width - margin * 2;
  const fontSize = Number(settings.fontSize);
  const lineHeight = fontSize * Number(settings.lineHeight);
  const headerSpace = settings.header ? 45 : 0;
  const footerSpace = settings.footer || settings.showPageNumber ? 45 : 0;
  const availableHeight = height - margin * 2 - headerSpace - footerSpace;
  const maxLines = Math.max(1, Math.floor(availableHeight / lineHeight));

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

  if (settings.paper === "blank") return;

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
  const direction = settings.direction === "auto" ? detectDirection(lines.join(" ")) : settings.direction;
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
  if (settings.header) startY += 25;

  lines.forEach((line) => {
    if (!line) {
      startY += lineHeight;
      return;
    }

    let x;
    if (textAlign === "center") x = width / 2;
    else if (textAlign === "right") x = width - margin;
    else x = margin;

    if (textAlign === "left" && isRTL) {
      x = width - margin;
      ctx.textAlign = "right";
    } else if (textAlign === "right" && !isRTL) {
      x = margin;
      ctx.textAlign = "left";
    } else {
      ctx.textAlign = textAlign;
    }

    const wobble = (Math.random() - 0.5) * Number(settings.wobble) * 1.8;
    const baseline = (Math.random() - 0.5) * Number(settings.baseline) * 2;

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
    ctx.fillText(`${pageNumber} / ${totalPages}`, width - margin, height - Math.max(18, margin * 0.38));
    ctx.restore();
  }

  ctx.restore();
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5 w-full min-w-0">
      <label className="text-[10px] font-black uppercase tracking-wider text-muted block truncate">
        {label}
      </label>
      {children}
    </div>
  );
}

function RangeField({ label, value, min, max, step = 1, onChange }) {
  return (
    <div className="space-y-1.5 w-full min-w-0">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-muted">
        <span className="truncate">{label}</span>
        <span className="font-mono text-brand font-black shrink-0">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-line text-ink rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand cursor-pointer truncate"
      >
        {children}
      </select>
    </Field>
  );
}

export default function TextToHandwriting() {
  const [isMounted, setIsMounted] = useState(false);
  const [text, setText] = useState(SAMPLE_TEXT);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [currentPage, setCurrentPage] = useState(0);
  const [notice, setNotice] = useState("");

  const canvasRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
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

  const pages = useMemo(() => {
    if (!isMounted) return [[""]];
    return splitTextIntoPages(text, settings);
  }, [text, settings, isMounted]);

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
    drawPage(ctx, pages[currentPage] || [""], settings, currentPage + 1, pages.length);
  };

  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(renderCurrentPage, 80);
    return () => clearTimeout(timer);
  }, [pages, currentPage, settings, isMounted]);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const downloadCurrentPNG = async () => {
    renderCurrentPage();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await canvasToBlob(canvas);
    if (blob) downloadBlob(blob, `handwriting-page-${currentPage + 1}.png`);
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
      drawPage(ctx, pages[i], settings, i + 1, pages.length);
      const blob = await canvasToBlob(canvas);
      if (blob) downloadBlob(blob, `handwriting-page-${i + 1}.png`);
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
        orientation: settings.rotate || settings.pageSize === "Square" ? "landscape" : "portrait",
        unit: "pt",
        format: settings.pageSize === "Square" ? [900, 900] : settings.pageSize.toLowerCase(),
      });
      const canvas = document.createElement("canvas");
      for (let i = 0; i < pages.length; i++) {
        const { width, height } = getPageDimensions(settings);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        drawPage(ctx, pages[i], settings, i + 1, pages.length);
        const image = canvas.toDataURL("image/png", 1);
        if (i > 0) pdf.addPage();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(image, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
      }
      pdf.save("text-to-handwriting.pdf");
      setNotice("PDF downloaded");
      setTimeout(() => setNotice(""), 2000);
    } catch (error) {
      console.error(error);
      setNotice("PDF export requires the jsPDF package.");
      setTimeout(() => setNotice(""), 3000);
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem("toolslay-text-handwriting", JSON.stringify({ text, settings }));
      setNotice("Draft saved");
      setTimeout(() => setNotice(""), 1800);
    } catch {
      setNotice("Could not save draft");
    }
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem("toolslay-text-handwriting");
      if (!saved) {
        setNotice("No saved draft found");
        setTimeout(() => setNotice(""), 1800);
        return;
      }
      const data = JSON.parse(saved);
      if (data.text !== undefined) setText(data.text);
      if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      setNotice("Draft loaded");
      setTimeout(() => setNotice(""), 1800);
    } catch {
      setNotice("Could not load draft");
    }
  };

  const randomStyle = () => {
    const fonts = FONT_OPTIONS.map((f) => f.name);
    const papers = ["ruled", "grid", "dots", "blank", "old"];
    const colors = ["#172033", "#111827", "#1d4ed8", "#374151", "#334155", "#581c87", "#7c2d12"];
    setSettings((prev) => ({
      ...prev,
      font: fonts[Math.floor(Math.random() * fonts.length)],
      paper: papers[Math.floor(Math.random() * papers.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      fontSize: 23 + Math.floor(Math.random() * 12),
      wobble: Number((0.5 + Math.random() * 2).toFixed(1)),
      baseline: Number((0.5 + Math.random() * 1.8).toFixed(1)),
      lineHeight: Number((1.35 + Math.random() * 0.55).toFixed(2)),
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

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full box-border">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full md:w-auto">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Text to Handwriting
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate">
              Convert Typed Text into Realistic Handwritten Pages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button type="button" onClick={randomStyle} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 shrink-0" /> Randomize
          </button>
          <button type="button" onClick={reset} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5 shrink-0" /> Reset
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6 items-start w-full min-w-0">
        
        {/* CONTROLS SIDEBAR */}
        <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-5 w-full min-w-0 box-border">
          <Field label="Your Text">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Type or paste your text..."
              className="w-full h-36 p-3 bg-surface border border-line rounded-xl text-xs sm:text-sm text-ink outline-none resize-none focus:border-brand shadow-inner custom-scrollbar box-border"
            />
          </Field>

          <SelectField label="Handwriting Font" value={settings.font} onChange={(v) => update("font", v)}>
            {FONT_OPTIONS.map((font) => (
              <option key={font.name} value={font.name}>
                {font.label}
              </option>
            ))}
          </SelectField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
            <SelectField label="Direction" value={settings.direction} onChange={(v) => update("direction", v)}>
              <option value="auto">Auto</option>
              <option value="ltr">LTR</option>
              <option value="rtl">RTL</option>
            </SelectField>

            <SelectField label="Alignment" value={settings.alignment} onChange={(v) => update("alignment", v)}>
              <option value="auto">Auto</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </SelectField>
          </div>

          <RangeField label="Font Size" value={settings.fontSize} min={12} max={60} onChange={(v) => update("fontSize", v)} />
          <RangeField label="Line Spacing" value={settings.lineHeight} min={1} max={2.5} step={0.05} onChange={(v) => update("lineHeight", v)} />
          <RangeField label="Page Margin" value={settings.margin} min={20} max={110} onChange={(v) => update("margin", v)} />
          <RangeField label="Natural Wobble" value={settings.wobble} min={0} max={5} step={0.1} onChange={(v) => update("wobble", v)} />
          <RangeField label="Baseline Variation" value={settings.baseline} min={0} max={5} step={0.1} onChange={(v) => update("baseline", v)} />
          <RangeField label="Ink Opacity" value={settings.opacity} min={30} max={100} onChange={(v) => update("opacity", v)} />

          <Field label="Ink Color">
            <div className="flex gap-2 items-center w-full min-w-0">
              <input
                type="color"
                value={settings.color}
                onChange={(e) => update("color", e.target.value)}
                className="w-10 h-9 border border-line rounded-lg p-0 bg-transparent cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={settings.color}
                onChange={(e) => update("color", e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 border border-line rounded-xl bg-surface text-ink text-xs font-mono outline-none focus:border-brand box-border"
              />
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
            <SelectField label="Page Size" value={settings.pageSize} onChange={(v) => update("pageSize", v)}>
              {Object.entries(PAGE_OPTIONS).map(([key, page]) => (
                <option key={key} value={key}>{page.label}</option>
              ))}
            </SelectField>

            <SelectField label="Paper Style" value={settings.paper} onChange={(v) => update("paper", v)}>
              <option value="ruled">Ruled</option>
              <option value="grid">Grid</option>
              <option value="dots">Dots</option>
              <option value="blank">Blank</option>
              <option value="old">Vintage</option>
            </SelectField>
          </div>

          <SelectField label="Orientation" value={settings.rotate ? "landscape" : "portrait"} onChange={(v) => update("rotate", v === "landscape")}>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </SelectField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
            <Field label="Header">
              <input
                type="text"
                value={settings.header}
                onChange={(e) => update("header", e.target.value)}
                placeholder="Header text"
                className="w-full px-3 py-2 border border-line rounded-xl bg-surface text-ink text-xs outline-none focus:border-brand box-border"
              />
            </Field>
            <Field label="Footer">
              <input
                type="text"
                value={settings.footer}
                onChange={(e) => update("footer", e.target.value)}
                placeholder="Footer text"
                className="w-full px-3 py-2 border border-line rounded-xl bg-surface text-ink text-xs outline-none focus:border-brand box-border"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-muted cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={settings.showPageNumber}
              onChange={(e) => update("showPageNumber", e.target.checked)}
              className="rounded border-line text-brand focus:ring-brand w-4 h-4 cursor-pointer shrink-0"
            />
            <span className="truncate">Show page numbers</span>
          </label>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line">
            <button type="button" onClick={saveDraft} className="py-2.5 bg-surface border border-line hover:border-brand rounded-xl text-xs font-black uppercase tracking-wider text-ink transition-colors cursor-pointer flex items-center justify-center gap-1.5 truncate">
              <Bookmark className="w-3.5 h-3.5 shrink-0" /> Save
            </button>
            <button type="button" onClick={loadDraft} className="py-2.5 bg-surface border border-line hover:border-brand rounded-xl text-xs font-black uppercase tracking-wider text-ink transition-colors cursor-pointer flex items-center justify-center gap-1.5 truncate">
              <RefreshCw className="w-3.5 h-3.5 shrink-0" /> Load
            </button>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="space-y-4 lg:sticky lg:top-6 w-full min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-4 w-full min-w-0 box-border">
            
            {/* Preview Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
              <div className="min-w-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-ink truncate">Live Preview</h3>
                <p className="text-[10px] font-bold text-muted mt-0.5 truncate">Page {currentPage + 1} of {pages.length}</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-surface border border-line rounded-xl text-xs font-black uppercase tracking-wider text-ink disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  type="button"
                  disabled={currentPage === pages.length - 1}
                  onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-surface border border-line rounded-xl text-xs font-black uppercase tracking-wider text-ink disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="bg-surface border border-line rounded-xl p-4 min-h-[450px] sm:min-h-[500px] flex items-center justify-center overflow-auto shadow-inner custom-scrollbar w-full box-border">
              <canvas ref={canvasRef} className="block max-w-full h-auto shadow-md bg-white rounded" />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar w-full min-w-0">
              {pages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentPage(index)}
                  className={`shrink-0 w-12 h-16 rounded-lg border text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                    index === currentPage ? "bg-brand text-surface border-brand shadow-sm" : "bg-surface text-muted border-line hover:border-brand"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Export Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-line w-full min-w-0">
              <button type="button" onClick={downloadCurrentPNG} className="flex items-center justify-center gap-1.5 py-3 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90 cursor-pointer shadow-sm">
                <Download className="w-3.5 h-3.5 shrink-0" /> PNG Page
              </button>
              <button type="button" onClick={downloadAllPNG} className="flex items-center justify-center gap-1.5 py-3 bg-surface border border-line hover:border-brand text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer">
                <Download className="w-3.5 h-3.5 shrink-0" /> All PNG
              </button>
              <button type="button" onClick={downloadPDF} className="flex items-center justify-center gap-1.5 py-3 bg-surface border border-line hover:border-brand text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer">
                <Download className="w-3.5 h-3.5 shrink-0" /> Download PDF
              </button>
            </div>

            {notice && (
              <div className="p-3 bg-brand/10 border border-brand/20 rounded-xl text-xs text-brand font-bold text-center break-words">
                {notice}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}