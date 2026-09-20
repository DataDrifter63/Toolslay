"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Eraser,
  Download,
  UploadCloud,
  Trash2,
  CheckCircle2,
  PaintBucket,
  Loader2,
  Layers,
  Sun,
  AlertTriangle,
  X,
} from "lucide-react";

const MAX_FILE_SIZE_MB = 20;

export default function BackgroundRemover() {
  const [isMounted, setIsMounted] = useState(false);

  const [originalImage, setOriginalImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [cutoutImage, setCutoutImage] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState(null);

  const [bgMode, setBgMode] = useState("transparent"); 
  const [bgColor, setBgColor] = useState("#ffffff");
  const [customBg, setCustomBg] = useState(null);
  const [addShadow, setAddShadow] = useState(false);

  const fileInputRef = useRef(null);
  const customBgRef = useRef(null);
  const canvasRef = useRef(null);

  const requestIdRef = useRef(0);
  const latestUrlsRef = useRef({});

  useEffect(() => {
    latestUrlsRef.current = { originalImage, cutoutImage, customBg };
  }, [originalImage, cutoutImage, customBg]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      const { originalImage: o, cutoutImage: c, customBg: b } = latestUrlsRef.current;
      if (o) URL.revokeObjectURL(o);
      if (c) URL.revokeObjectURL(c);
      if (b) URL.revokeObjectURL(b);
    };
  }, []);

  function validateImageFile(file) {
    if (!file.type.startsWith("image/")) {
      return "That file doesn't look like an image. Please choose a JPG, PNG or WebP file.";
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `That image is larger than ${MAX_FILE_SIZE_MB}MB. Try a smaller file.`;
    }
    return null;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    setError(null);
    if (originalImage) URL.revokeObjectURL(originalImage);
    if (cutoutImage) URL.revokeObjectURL(cutoutImage);

    const url = URL.createObjectURL(file);
    setOriginalFile(file);
    setOriginalImage(url);
    setCutoutImage(null);
  };

  const handleCustomBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    setError(null);
    if (customBg) URL.revokeObjectURL(customBg);
    setCustomBg(URL.createObjectURL(file));
    setBgMode("image");
  };

  const removeBackground = useCallback(async () => {
    if (!originalFile) return;

    const myRequestId = ++requestIdRef.current;
    setIsProcessing(true);
    setError(null);
    setProgressMsg("Connecting to AI Engine…");
    setProgressPercent(0);

    try {
      // Dynamic import fixes Next.js SSR crashes
      const imglyModule = await import("@imgly/background-removal");
      // Safely extract the function regardless of CJS/ESM module resolution
      const removeBg = imglyModule.default || imglyModule.removeBackground || imglyModule;

      // FIX: Don't override publicPath. The AI model/WASM files (tens of MB) are not
      // shipped inside the npm package — they're always fetched from imgly's CDN at
      // runtime — and the library's own default publicPath already points at the
      // correct URL for whichever version is installed (reads it straight from
      // package.json). The previous hardcoded value pointed at a domain that doesn't
      // exist ("static.imgly.com" instead of the real "staticimgly.com") and at v1.4.3
      // while package.json installs ^1.7.0, so every model-file request failed and the
      // tool always errored out. Letting the library set its own default fixes both
      // problems, and keeps working automatically if the package version is bumped later.
      const blob = await removeBg(originalFile, {
        progress: (key, current, total) => {
          const percent = total > 0 ? Math.round((current / total) * 100) : 0;
          setProgressPercent(percent);
          setProgressMsg(
            key.includes("fetch") ? `Downloading AI Models… ${percent}%` : `Erasing Background… ${percent}%`
          );
        },
      });

      if (myRequestId !== requestIdRef.current) return;

      const url = URL.createObjectURL(blob);
      setCutoutImage(url);
    } catch (err) {
      if (myRequestId !== requestIdRef.current) return;
      console.error("AI Processing Error:", err);
      setError("AI failed to process this image. Please check your internet connection or try a different image.");
    } finally {
      if (myRequestId === requestIdRef.current) {
        setIsProcessing(false);
        setProgressPercent(0);
      }
    }
  }, [originalFile]);

  const handleClear = () => {
    if (originalImage) URL.revokeObjectURL(originalImage);
    if (cutoutImage) URL.revokeObjectURL(cutoutImage);
    if (customBg) URL.revokeObjectURL(customBg);

    requestIdRef.current++; 
    setOriginalImage(null);
    setOriginalFile(null);
    setCutoutImage(null);
    setCustomBg(null);
    setBgMode("transparent");
    setAddShadow(false);
    setError(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (customBgRef.current) customBgRef.current.value = "";
  };

  const exportResult = () => {
    if (!cutoutImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const fgImg = new Image();
    fgImg.crossOrigin = "anonymous";

    fgImg.onload = () => {
      canvas.width = fgImg.width;
      canvas.height = fgImg.height;

      const effectiveBgMode = bgMode === "image" && !customBg ? "transparent" : bgMode;

      if (effectiveBgMode === "color") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawForegroundAndExport(ctx, canvas, fgImg, effectiveBgMode);
      } else if (effectiveBgMode === "image" && customBg) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
          const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
          const x = canvas.width / 2 - (bgImg.width / 2) * scale;
          const y = canvas.height / 2 - (bgImg.height / 2) * scale;
          ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
          drawForegroundAndExport(ctx, canvas, fgImg, effectiveBgMode);
        };
        bgImg.onerror = () => setError("Couldn't load the background image for export.");
        bgImg.src = customBg;
      } else {
        drawForegroundAndExport(ctx, canvas, fgImg, effectiveBgMode);
      }
    };
    fgImg.onerror = () => setError("Couldn't prepare the result. Try processing again.");
    fgImg.src = cutoutImage;
  };

  const drawForegroundAndExport = (ctx, canvas, fgImg, effectiveBgMode) => {
    if (addShadow) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = Math.max(canvas.width * 0.02, 20);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = canvas.height * 0.01;
    }

    ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    try {
      const isTransparent = effectiveBgMode === "transparent";
      const dataUrl = canvas.toDataURL(isTransparent ? "image/png" : "image/jpeg", 1.0);
      const link = document.createElement("a");
      link.download = `cutout_pro_${Date.now()}.${isTransparent ? "png" : "jpg"}`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Export error:", e);
      setError("Browser security blocked the export. Please re-upload the image and try again.");
    }
  };

  if (!isMounted) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <style>{`
        .checkered-bg {
          background-color: #e5e5f7;
          background-size: 20px 20px;
          background-image: repeating-linear-gradient(45deg, #d4d4eb 25%, transparent 25%, transparent 75%, #d4d4eb 75%, #d4d4eb), repeating-linear-gradient(45deg, #d4d4eb 25%, #e5e5f7 25%, #e5e5f7 75%, #d4d4eb 75%, #d4d4eb);
          background-position: 0 0, 10px 10px;
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/50">
            <Eraser className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold leading-tight text-slate-800 dark:text-slate-200">
              Pro AI Background Eraser
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Runs Entirely In Your Browser
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1 border-r border-slate-200 pr-4 text-xs font-bold text-slate-400 transition-colors hover:text-rose-500 dark:border-slate-800"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear All
          </button>
          <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> HD Export
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1 font-medium">{error}</p>
          <button onClick={() => setError(null)} aria-label="Dismiss error" className="shrink-0 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[400px,1fr]">
        <div className="custom-scrollbar max-h-[85vh] space-y-4 overflow-y-auto pb-10 pr-2">
          
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <Layers className="h-4 w-4 text-violet-500" /> AI Processing
              </h3>
            </div>

            <div className="space-y-4">
              {!originalImage ? (
                <p className="rounded-lg bg-slate-50 p-3 text-center text-xs font-medium text-slate-400 dark:bg-slate-800">
                  Upload an image in the preview area first.
                </p>
              ) : !cutoutImage ? (
                <button
                  onClick={removeBackground}
                  disabled={isProcessing}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-black transition-all ${
                    isProcessing
                      ? "cursor-wait bg-slate-100 text-violet-600 dark:bg-slate-800 dark:text-violet-400"
                      : "bg-violet-600 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700 active:scale-[0.98]"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing AI…
                    </>
                  ) : (
                    <>
                      <Eraser className="h-4 w-4" /> Remove Background
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Background erased successfully!
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                    <span>{progressMsg}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full bg-violet-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 flex items-center justify-center gap-1 text-center text-[9px] uppercase tracking-widest text-slate-400">
                    <Sun className="h-3 w-3" /> Initializing securely in your browser
                  </p>
                </div>
              )}
            </div>
          </div>

          {cutoutImage && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <PaintBucket className="h-4 w-4 text-rose-500" /> Pro Backdrop & FX
                </h3>
              </div>

              <div className="space-y-4">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-violet-300 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <Sun className={`h-4 w-4 ${addShadow ? "text-amber-500" : "text-slate-400"}`} />
                    <div>
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">Studio Drop Shadow</span>
                      <span className="block text-[9px] uppercase tracking-widest text-slate-500">
                        Great for YouTube Thumbnails
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={addShadow}
                    onChange={(e) => setAddShadow(e.target.checked)}
                    className="h-4 w-4 accent-violet-600"
                  />
                </label>

                <div>
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Background Replacement
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "transparent", label: "Transparent" },
                      { id: "color", label: "Solid Color" },
                      { id: "image", label: "Image" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (opt.id === "image") customBgRef.current?.click();
                          else setBgMode(opt.id);
                        }}
                        className={`rounded-lg border py-2 text-[10px] font-bold transition-all ${
                          bgMode === opt.id
                            ? "border-transparent bg-violet-600 text-white shadow-md"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {bgMode === "color" && (
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-none bg-transparent p-0"
                    />
                    <span className="font-mono text-[10px] font-bold uppercase text-slate-500">Selected: {bgColor}</span>
                  </div>
                )}

                {bgMode === "image" && customBg && (
                  <div className="relative h-24 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                    <img src={customBg} alt="Custom background" className="h-full w-full object-cover" />
                    <button
                      onClick={() => customBgRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white opacity-0 transition-opacity hover:opacity-100"
                    >
                      Change image
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomBgUpload}
                  ref={customBgRef}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE PREVIEW */}
        <div className="sticky top-6 flex min-w-0 flex-col space-y-6">
          <div className="flex min-h-[400px] flex-col items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-4">
            {!originalImage ? (
              <label className="group flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition-all hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-violet-900/10 md:aspect-[4/3]">
                <div className="mb-4 rounded-full bg-white p-4 shadow-sm transition-transform group-hover:scale-110 dark:bg-slate-900">
                  <UploadCloud className="h-8 w-8 text-violet-500" />
                </div>
                <h3 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                  Click to upload Subject Image
                </h3>
                <p className="mb-4 text-[10px] uppercase tracking-widest text-slate-500">
                  Persons, Products, Cars, or Animals
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex w-full flex-col items-center gap-3">
                <div className="flex w-full items-center justify-between px-1">
                  <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:bg-slate-800">
                    {cutoutImage ? "Final Preview" : "Original Image"}
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:text-violet-500 disabled:opacity-50 dark:bg-slate-800"
                  >
                    Change Image
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </div>

                <div className="relative flex min-h-[350px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-[#0d1117]">
                  {cutoutImage && (
                    <div
                      className={`absolute inset-0 h-full w-full ${bgMode === "transparent" ? "checkered-bg" : ""}`}
                      style={{
                        backgroundColor: bgMode === "color" ? bgColor : "transparent",
                        backgroundImage: bgMode === "image" && customBg ? `url(${customBg})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )}

                  <img
                    src={cutoutImage || originalImage}
                    alt="Preview"
                    className="relative z-10 h-auto max-h-[600px] w-full object-contain transition-all duration-300"
                    style={{
                      filter: addShadow && cutoutImage ? "drop-shadow(0 15px 15px rgba(0,0,0,0.4))" : "none",
                    }}
                  />

                  {isProcessing && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 text-white backdrop-blur-sm">
                      <Loader2 className="mb-3 h-10 w-10 animate-spin text-violet-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">{progressPercent}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={exportResult}
            disabled={!cutoutImage}
            className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-lg font-black shadow-xl transition-all ${
              !cutoutImage
                ? "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none dark:bg-slate-800"
                : "border border-violet-500/50 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/25 hover:scale-[1.01] active:scale-[0.98]"
            }`}
          >
            <Download className="h-5 w-5" /> Download HD Result
          </button>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}