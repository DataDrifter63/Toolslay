"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Barcode, Download, Copy, Trash2, Sliders, ShieldCheck, 
  CheckCircle2, AlertCircle, Sparkles, RefreshCw, Layers
} from "lucide-react";

export default function BarcodeGenerator() {
  const [inputText, setInputText] = useState("SKU-12345678");
  const [format, setFormat] = useState("CODE128");
  const [width, setWidth] = useState("2");
  const [height, setHeight] = useState("100");
  const [displayValue, setDisplayValue] = useState(true);
  const [lineColor, setLineColor] = useState("#111827");
  const [background, setBackground] = useState("#ffffff");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.JsBarcode) {
      generateBarcode();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
    script.async = true;
    script.onload = () => {
      generateBarcode();
    };
    script.onerror = () => {
      setError("Failed to load barcode rendering engine.");
    };
    document.head.appendChild(script);
  }, [inputText, format, width, height, displayValue, lineColor, background]);

  const generateBarcode = () => {
    setError("");
    if (!inputText.trim()) {
      setError("Please enter text or numbers to generate a barcode.");
      return;
    }

    if (!canvasRef.current || !window.JsBarcode) return;

    try {
      window.JsBarcode(canvasRef.current, inputText, {
        format: format,
        width: Number(width),
        height: Number(height),
        displayValue: displayValue,
        lineColor: lineColor,
        background: background,
        margin: 10,
      });
    } catch (err) {
      console.error(err);
      setError(`Invalid text or format for ${format}. Please check your input characters.`);
    }
  };

  const downloadImage = (fileType) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    let mime = "image/png";
    let ext = "png";
    if (fileType === "jpg") {
      mime = "image/jpeg";
      ext = "jpg";
    }

    const url = canvas.toDataURL(mime, 1.0);
    const link = document.createElement("a");
    link.href = url;
    link.download = `barcode-${format.toLowerCase()}-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(`Barcode downloaded successfully as .${ext}`);
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Barcode className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Barcode Generator
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 whitespace-normal leading-relaxed">
              Generate scannable barcodes in common formats like Code128 and EAN instantly.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface border border-line text-brand text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 100% Free & Local
        </div>
      </div>

      <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          
          {/* PREVIEW & EXPORT PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                  Live Barcode Preview
                </h3>
                <span className="px-2.5 py-1 rounded-lg bg-paper border border-line text-[10px] font-black uppercase tracking-wider text-muted shadow-sm">
                  {format}
                </span>
              </div>

              {/* Barcode Display Box */}
              <div className="min-h-[280px] sm:min-h-[340px] border border-line rounded-2xl bg-paper flex flex-col items-center justify-center p-6 shadow-inner overflow-x-auto">
                <canvas ref={canvasRef} className="max-w-full h-auto shadow-sm rounded-lg bg-surface p-4" />
              </div>
            </div>

            {/* Download & Action Buttons */}
            <div className="space-y-3 pt-3 border-t border-line">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => downloadImage("png")}
                  className="h-11 px-4 rounded-xl bg-brand text-surface font-black text-xs uppercase tracking-wider shadow-sm hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 shrink-0" /> Save PNG
                </button>
                <button
                  type="button"
                  onClick={() => downloadImage("jpg")}
                  className="h-11 px-4 rounded-xl border border-line bg-paper text-ink font-black text-xs uppercase tracking-wider hover:border-brand cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 shrink-0" /> Save JPG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inputText);
                    setMessage("Barcode text copied to clipboard!");
                    setTimeout(() => setMessage(""), 2000);
                  }}
                  className="col-span-2 sm:col-span-1 h-11 px-4 rounded-xl border border-line bg-paper text-ink font-black text-xs uppercase tracking-wider hover:border-brand cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4 shrink-0 text-brand" /> Copy Text
                </button>
              </div>

              {message && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
                </div>
              )}
            </div>

          </div>

          {/* CONFIGURATION PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                Barcode Settings
              </h3>
              <p className="text-[10px] text-muted mt-0.5">
                Customize format, dimensions, and visual styling.
              </p>
            </div>

            <div className="space-y-3">
              {/* Input Value */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Data / SKU Value
                </label>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter barcode data..."
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none shadow-inner focus:border-brand"
                />
              </div>

              {/* Barcode Format */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Barcode Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="CODE128">CODE128 (Standard / Auto)</option>
                  <option value="EAN13">EAN-13 (Retail Products)</option>
                  <option value="EAN8">EAN-8 (Compact Retail)</option>
                  <option value="UPC">UPC-A (US Retail)</option>
                  <option value="CODE39">CODE39 (Industrial / Logistics)</option>
                  <option value="ITF">ITF / ITF-14 (Shipping)</option>
                  <option value="pharmacode">Pharmacode (Pharmaceutical)</option>
                </select>
              </div>

              {/* Dimensions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                    Bar Width ({width})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                    Height ({height}px)
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="150"
                    step="10"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                  />
                </div>
              </div>

              {/* Colors - Fixed Layout for Mobile and Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-paper p-3 border border-line rounded-xl shadow-sm flex flex-col justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-2">
                    Bar Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={lineColor}
                      onChange={(e) => setLineColor(e.target.value)}
                      className="w-9 h-9 p-1 border border-line rounded-lg bg-surface cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-mono font-bold text-ink truncate">{lineColor}</span>
                  </div>
                </div>
                <div className="bg-paper p-3 border border-line rounded-xl shadow-sm flex flex-col justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      className="w-9 h-9 p-1 border border-line rounded-lg bg-surface cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-mono font-bold text-ink truncate">{background}</span>
                  </div>
                </div>
              </div>

              {/* Display Text Toggle */}
              <label className="flex items-center justify-between p-3 border border-line rounded-xl bg-paper cursor-pointer shadow-sm">
                <span className="text-xs font-black uppercase tracking-wider text-ink pr-2">
                  Show human-readable text
                </span>
                <input
                  type="checkbox"
                  checked={displayValue}
                  onChange={(e) => setDisplayValue(e.target.checked)}
                  className="w-4 h-4 accent-brand rounded border-line cursor-pointer shrink-0"
                />
              </label>
            </div>

            <div className="p-3.5 rounded-xl bg-paper border border-line text-xs text-muted leading-relaxed flex items-center gap-2.5 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Barcodes generated adhere to strict industry specifications and can be scanned with any standard scanner or mobile app.
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}