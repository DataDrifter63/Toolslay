"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  FileImage, Download, Trash2, Sliders, ShieldCheck, 
  CheckCircle2, AlertCircle, Plus, Eye, FileText
} from "lucide-react";

const PDFJS_VERSION = "3.11.174";
const PDFJS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/" +
  PDFJS_VERSION +
  "/pdf.min.js";

const PDF_WORKER_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/" +
  PDFJS_VERSION +
  "/pdf.worker.min.js";

const JSZIP_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

function loadScript(src, id) {
  return new Promise(function (resolve, reject) {
    if (typeof window === "undefined") {
      reject(new Error("Browser environment required."));
      return;
    }

    if (id && document.getElementById(id)) {
      resolve();
      return;
    }

    var script = document.createElement("script");

    if (id) {
      script.id = id;
    }

    script.src = src;
    script.async = true;

    script.onload = function () {
      resolve();
    };

    script.onerror = function () {
      reject(new Error("Could not load required browser library."));
    };

    document.head.appendChild(script);
  });
}

async function loadLibraries() {
  if (typeof window === "undefined") {
    throw new Error("Browser environment required.");
  }

  if (!window.pdfjsLib) {
    await loadScript(PDFJS_URL, "pdfjs-library-script");
  }

  if (!window.pdfjsLib) {
    throw new Error("PDF engine could not be loaded.");
  }

  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

  if (!window.JSZip) {
    await loadScript(JSZIP_URL, "jszip-library-script");
  }

  if (!window.JSZip) {
    throw new Error("ZIP engine could not be loaded.");
  }

  return {
    pdfjs: window.pdfjsLib,
    JSZip: window.JSZip,
  };
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) {
    return "0 B";
  }

  var units = ["B", "KB", "MB", "GB"];
  var index = 0;
  var value = bytes;

  while (value >= 1024 && index < units.length - 1) {
    value = value / 1024;
    index += 1;
  }

  return value.toFixed(value >= 10 || index === 0 ? 0 : 1) + " " + units[index];
}

function getFileBaseName(name) {
  if (!name) {
    return "converted";
  }

  return name.replace(/\.pdf$/i, "").replace(/[^\w\- ]+/g, "").trim() || "converted";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parsePageRange(value, totalPages) {
  if (!value || !value.trim()) {
    return [];
  }

  var result = [];
  var pieces = value.split(",");

  pieces.forEach(function (piece) {
    var clean = piece.trim();

    if (!clean) {
      return;
    }

    if (clean.indexOf("-") !== -1) {
      var range = clean.split("-");
      var start = parseInt(range[0], 10);
      var end = parseInt(range[1], 10);

      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return;
      }

      start = clamp(start, 1, totalPages);
      end = clamp(end, 1, totalPages);

      if (start > end) {
        var temp = start;
        start = end;
        end = temp;
      }

      for (var i = start; i <= end; i += 1) {
        if (result.indexOf(i) === -1) {
          result.push(i);
        }
      }
    } else {
      var page = parseInt(clean, 10);

      if (
        Number.isFinite(page) &&
        page >= 1 &&
        page <= totalPages &&
        result.indexOf(page) === -1
      ) {
        result.push(page);
      }
    }
  });

  return result.sort(function (a, b) {
    return a - b;
  });
}

function downloadBlob(blob, filename) {
  if (typeof window === "undefined") {
    return;
  }

  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1500);
}

function makeCanvasBlob(canvas, format, quality) {
  return new Promise(function (resolve, reject) {
    var mime =
      format === "jpg"
        ? "image/jpeg"
        : format === "webp"
        ? "image/webp"
        : "image/png";

    canvas.toBlob(
      function (blob) {
        if (!blob) {
          reject(new Error("Could not create image."));
          return;
        }

        resolve(blob);
      },
      mime,
      format === "png" ? undefined : quality
    );
  });
}

function applyCanvasEffect(canvas, mode) {
  if (mode === "normal") {
    return;
  }

  var context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    return;
  }

  var image = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  var data = image.data;

  for (var i = 0; i < data.length; i += 4) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];

    if (mode === "grayscale") {
      var gray =
        0.299 * r +
        0.587 * g +
        0.114 * b;

      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    if (mode === "invert") {
      data[i] = 255 - r;
      data[i + 1] = 255 - g;
      data[i + 2] = 255 - b;
    }
  }

  context.putImageData(image, 0, 0);
}

export default function PdfToImage() {
  var fileInputRef = useRef(null);
  var dropRef = useRef(null);

  var [file, setFile] = useState(null);
  var [pdfInfo, setPdfInfo] = useState(null);

  var [format, setFormat] = useState("jpg");
  var [scale, setScale] = useState("2");
  var [quality, setQuality] = useState("0.92");
  var [background, setBackground] = useState("#ffffff");

  var [effect, setEffect] = useState("normal");

  var [pageMode, setPageMode] = useState("all");
  var [pageRange, setPageRange] = useState("");

  var [previews, setPreviews] = useState([]);

  var [isLoading, setIsLoading] = useState(false);
  var [isConverting, setIsConverting] = useState(false);

  var [progress, setProgress] = useState(0);
  var [currentPage, setCurrentPage] = useState(0);

  var [error, setError] = useState("");
  var [message, setMessage] = useState("");

  var [dragging, setDragging] = useState(false);

  useEffect(function () {
    var mounted = true;

    loadLibraries().catch(function () {
      if (mounted) {
        setError(
          "PDF engine will load automatically when you convert a file."
        );
      }
    });

    return function () {
      mounted = false;
    };
  }, []);

  function clearMessages() {
    setError("");
    setMessage("");
  }

  function validateFile(selectedFile) {
    if (!selectedFile) {
      return false;
    }

    var isPdf =
      selectedFile.type === "application/pdf" ||
      /\.pdf$/i.test(selectedFile.name);

    if (!isPdf) {
      setError("Please select a valid PDF file.");
      return false;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("Maximum supported file size is 100 MB.");
      return false;
    }

    return true;
  }

  async function loadPdf(selectedFile) {
    if (!validateFile(selectedFile)) {
      return;
    }

    clearMessages();

    setFile(selectedFile);
    setPdfInfo(null);
    setPreviews([]);
    setProgress(0);
    setCurrentPage(0);
    setIsLoading(true);

    try {
      var libraries = await loadLibraries();

      var arrayBuffer = await selectedFile.arrayBuffer();

      var loadingTask = libraries.pdfjs.getDocument({
        data: arrayBuffer,
      });

      var pdf = await loadingTask.promise;

      var metadata = null;

      try {
        var metadataResult = await pdf.getMetadata();

        metadata = metadataResult && metadataResult.info
          ? metadataResult.info
          : null;
      } catch (metadataError) {
        metadata = null;
      }

      setPdfInfo({
        pdf: pdf,
        pages: pdf.numPages,
        metadata: metadata,
        size: selectedFile.size,
        name: selectedFile.name,
      });

      setMessage(
        pdf.numPages +
          (pdf.numPages === 1 ? " page" : " pages") +
          " detected. Ready to convert."
      );
    } catch (conversionError) {
      setFile(null);
      setPdfInfo(null);

      setError(
        conversionError && conversionError.message
          ? conversionError.message
          : "Could not read this PDF."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(event) {
    var selected =
      event.target.files &&
      event.target.files[0];

    if (selected) {
      loadPdf(selected);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);

    var droppedFile =
      event.dataTransfer &&
      event.dataTransfer.files &&
      event.dataTransfer.files[0];

    if (droppedFile) {
      loadPdf(droppedFile);
    }
  }

  function getSelectedPages() {
    if (!pdfInfo) {
      return [];
    }

    if (pageMode === "all") {
      var all = [];

      for (var i = 1; i <= pdfInfo.pages; i += 1) {
        all.push(i);
      }

      return all;
    }

    var selected = parsePageRange(
      pageRange,
      pdfInfo.pages
    );

    return selected;
  }

  async function renderPage(pdf, pageNumber, previewOnly) {
    var page = await pdf.getPage(pageNumber);

    var renderScale = previewOnly
      ? 0.42
      : Number(scale);

    var viewport = page.getViewport({
      scale: renderScale,
    });

    var canvas = document.createElement("canvas");

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    var context = canvas.getContext("2d", {
      alpha: false,
    });

    if (!context) {
      throw new Error("Canvas is not supported by this browser.");
    }

    context.fillStyle = background;
    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    if (!previewOnly) {
      applyCanvasEffect(
        canvas,
        effect
      );
    }

    return {
      canvas: canvas,
      width: canvas.width,
      height: canvas.height,
    };
  }

  async function generatePreviews() {
    if (!pdfInfo) {
      return;
    }

    var pages = getSelectedPages();

    if (!pages.length) {
      setError(
        "Select at least one valid page."
      );
      return;
    }

    clearMessages();
    setIsLoading(true);
    setPreviews([]);

    try {
      var previewPages = pages.slice(0, 8);
      var generated = [];

      for (
        var i = 0;
        i < previewPages.length;
        i += 1
      ) {
        var pageNumber = previewPages[i];

        setCurrentPage(pageNumber);

        var rendered =
          await renderPage(
            pdfInfo.pdf,
            pageNumber,
            true
          );

        var blob =
          await makeCanvasBlob(
            rendered.canvas,
            "jpg",
            0.72
          );

        var url =
          URL.createObjectURL(blob);

        generated.push({
          page: pageNumber,
          url: url,
          width: rendered.width,
          height: rendered.height,
        });

        setProgress(
          Math.round(
            ((i + 1) /
              previewPages.length) *
              100
          )
        );
      }

      setPreviews(generated);

      if (pages.length > 8) {
        setMessage(
          "Showing the first 8 selected pages as previews."
        );
      }
    } catch (previewError) {
      setError(
        previewError && previewError.message
          ? previewError.message
          : "Could not create page previews."
      );
    } finally {
      setIsLoading(false);
      setCurrentPage(0);
    }
  }

  async function convertAll() {
    if (!pdfInfo || !file) {
      setError("Upload a PDF first.");
      return;
    }

    var pages = getSelectedPages();

    if (!pages.length) {
      setError(
        "Please select at least one page."
      );
      return;
    }

    clearMessages();
    setIsConverting(true);
    setProgress(0);
    setCurrentPage(0);

    try {
      var libraries = await loadLibraries();

      var zip = new libraries.JSZip();

      var baseName =
        getFileBaseName(file.name);

      for (
        var i = 0;
        i < pages.length;
        i += 1
      ) {
        var pageNumber = pages[i];

        setCurrentPage(pageNumber);

        var rendered =
          await renderPage(
            pdfInfo.pdf,
            pageNumber,
            false
          );

        var blob =
          await makeCanvasBlob(
            rendered.canvas,
            format,
            Number(quality)
          );

        var extension =
          format === "jpg"
            ? "jpg"
            : format === "webp"
            ? "webp"
            : "png";

        var filename =
          baseName +
          "-page-" +
          String(pageNumber).padStart(3, "0") +
          "." +
          extension;

        zip.file(
          filename,
          blob
        );

        setProgress(
          Math.round(
            ((i + 1) /
              pages.length) *
              100
          )
        );
      }

      setMessage(
        "Conversion complete. Preparing ZIP..."
      );

      var zipBlob =
        await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: {
            level: 6,
          },
        });

      downloadBlob(
        zipBlob,
        baseName +
          "-images.zip"
      );

      setMessage(
        pages.length +
          (pages.length === 1
            ? " page was"
            : " pages were") +
          " converted successfully."
      );
    } catch (conversionError) {
      setError(
        conversionError &&
          conversionError.message
          ? conversionError.message
          : "Conversion failed. Please try another PDF."
      );
    } finally {
      setIsConverting(false);
      setCurrentPage(0);
    }
  }

  async function downloadSingle(pageNumber) {
    if (!pdfInfo || !file) {
      return;
    }

    clearMessages();

    try {
      setIsLoading(true);

      var rendered =
        await renderPage(
          pdfInfo.pdf,
          pageNumber,
          false
        );

      var blob =
        await makeCanvasBlob(
          rendered.canvas,
          format,
          Number(quality)
        );

      var extension =
        format === "jpg"
          ? "jpg"
          : format === "webp"
          ? "webp"
          : "png";

      downloadBlob(
        blob,
        getFileBaseName(
          file.name
        ) +
          "-page-" +
          String(pageNumber).padStart(3, "0") +
          "." +
          extension
      );

      setMessage(
        "Page " +
          pageNumber +
          " downloaded."
      );
    } catch (downloadError) {
      setError(
        downloadError &&
          downloadError.message
          ? downloadError.message
          : "Could not download this page."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function resetTool() {
    previews.forEach(function (item) {
      if (item.url) {
        URL.revokeObjectURL(
          item.url
        );
      }
    });

    setFile(null);
    setPdfInfo(null);
    setPreviews([]);
    setProgress(0);
    setCurrentPage(0);
    setError("");
    setMessage("");
    setPageMode("all");
    setPageRange("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  var selectedCount =
    getSelectedPages().length;

  var pageSelectionLabel =
    pageMode === "all"
      ? pdfInfo
        ? pdfInfo.pages +
          (pdfInfo.pages === 1
            ? " page"
            : " pages")
        : "All pages"
      : selectedCount +
        (selectedCount === 1
          ? " page"
          : " pages");

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <FileImage className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              PDF to Image Converter
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 whitespace-normal leading-relaxed">
              Convert PDF pages into high-quality JPG, PNG or WebP images locally.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface border border-line text-brand text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Local Browser Processing
        </div>
      </div>

      <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          
          {/* CONTROLS PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-5">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                Upload your PDF
              </h3>
              <p className="text-[10px] text-muted mt-0.5">
                Your PDF is processed locally in your browser.
              </p>
            </div>

            <div
              ref={dropRef}
              onClick={function () {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              onDragEnter={function (event) {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={function (event) {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={function () {
                setDragging(false);
              }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                dragging ? "border-brand bg-paper" : "border-line bg-paper hover:border-brand"
              }`}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-surface border border-line flex items-center justify-center text-brand shadow-sm">
                <Plus className="w-6 h-6 shrink-0" />
              </div>
              <strong className="text-xs sm:text-sm font-black text-ink tracking-tight">
                Drop PDF here or click to browse
              </strong>
              <span className="text-[10px] text-muted mt-1 block">
                PDF files up to 100 MB
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {file && (
              <div className="flex items-center gap-3 p-3 border border-line rounded-xl bg-paper shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-black flex items-center justify-center shrink-0 uppercase">
                  PDF
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="text-xs font-black text-ink truncate block" title={file.name}>
                    {file.name}
                  </strong>
                  <span className="text-[10px] text-muted mt-0.5 block font-mono">
                    {formatBytes(file.size)}
                    {pdfInfo ? " · " + pdfInfo.pages + (pdfInfo.pages === 1 ? " page" : " pages") : ""}
                  </span>
                </div>
              </div>
            )}

            {/* Output Format */}
            <div className="space-y-4 pt-2 border-t border-line">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["jpg", "png", "webp"].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`h-10 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                        format === fmt
                          ? "border-brand bg-brand text-surface"
                          : "border-line bg-surface text-ink hover:border-brand"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution Scale */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-muted">
                  <span>Resolution</span>
                  <span className="font-mono text-brand">{scale}×</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="3"
                  step="0.25"
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                />
              </div>

              {/* Image Quality */}
              {format !== "png" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-muted">
                    <span>Image Quality</span>
                    <span className="font-mono text-brand">{Math.round(Number(quality) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.01"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                  />
                </div>
              )}

              {/* Background Color */}
              {format !== "png" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block">
                    Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      className="w-11 h-10 p-1 border border-line rounded-xl bg-paper cursor-pointer"
                    />
                    <div className="flex-1 h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-mono font-bold flex items-center shadow-inner">
                      {background.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}

              {/* Image Effect */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block">
                  Image Effect
                </label>
                <select
                  value={effect}
                  onChange={(e) => setEffect(e.target.value)}
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="normal">Original</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="invert">Inverted</option>
                </select>
              </div>

              {/* Pages Selection */}
              <div className="space-y-2 pt-2 border-t border-line">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block">
                  Pages to convert
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageMode("all")}
                    className={`h-10 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      pageMode === "all"
                        ? "border-brand bg-brand text-surface"
                        : "border-line bg-surface text-ink hover:border-brand"
                    }`}
                  >
                    All pages
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageMode("range")}
                    className={`h-10 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      pageMode === "range"
                        ? "border-brand bg-brand text-surface"
                        : "border-line bg-surface text-ink hover:border-brand"
                    }`}
                  >
                    Custom range
                  </button>
                </div>

                {pageMode === "range" && (
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-muted mb-1">
                      <span>Page numbers</span>
                      <span>Example: 1,3,5-8</span>
                    </div>
                    <input
                      type="text"
                      value={pageRange}
                      placeholder="1, 3, 5-8"
                      onChange={(e) => setPageRange(e.target.value)}
                      className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-line">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!pdfInfo || isLoading || isConverting}
                  onClick={convertAll}
                  className={`flex-1 h-11 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                    !pdfInfo || isLoading || isConverting
                      ? "bg-paper text-muted border border-line cursor-not-allowed opacity-50"
                      : "bg-brand text-surface hover:opacity-90 cursor-pointer"
                  }`}
                >
                  <Download className="w-4 h-4 shrink-0" />
                  {isConverting ? "Converting..." : "Convert & ZIP"}
                </button>

                <button
                  type="button"
                  disabled={!pdfInfo || isLoading}
                  onClick={generatePreviews}
                  className={`h-11 px-4 rounded-xl border border-line bg-paper text-ink font-black text-xs uppercase tracking-wider hover:border-brand flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    !pdfInfo || isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Eye className="w-4 h-4 shrink-0" /> Preview
                </button>
              </div>

              <button
                type="button"
                disabled={!file || isConverting}
                onClick={resetTool}
                className="w-full h-10 rounded-xl border border-line bg-paper text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider hover:bg-rose-500/10 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4 shrink-0" /> Clear PDF
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {message && !error && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
              </div>
            )}

            {(isLoading || isConverting) && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-muted">
                  <span>{isConverting ? "Converting page " + currentPage : "Processing"}</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-paper rounded-full overflow-hidden border border-line">
                  <div
                    className="h-full bg-brand transition-all duration-200"
                    style={{ width: progress + "%" }}
                  />
                </div>
              </div>
            )}

            {pdfInfo && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-line">
                <div className="p-2.5 bg-paper border border-line rounded-xl text-center shadow-inner">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Pages</span>
                  <strong className="text-xs font-black text-ink font-mono mt-0.5 block">{pdfInfo.pages}</strong>
                </div>
                <div className="p-2.5 bg-paper border border-line rounded-xl text-center shadow-inner">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Selected</span>
                  <strong className="text-xs font-black text-brand font-mono mt-0.5 block truncate">{pageSelectionLabel}</strong>
                </div>
                <div className="p-2.5 bg-paper border border-line rounded-xl text-center shadow-inner">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Output</span>
                  <strong className="text-xs font-black text-ink font-mono mt-0.5 block uppercase">{format}</strong>
                </div>
              </div>
            )}
          </div>

          {/* PREVIEW PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                  Page Preview
                </h3>
                <span className="px-2.5 py-1 rounded-lg bg-paper border border-line text-[10px] font-black uppercase tracking-wider text-muted shadow-sm">
                  {previews.length ? previews.length + " preview" + (previews.length === 1 ? "" : "s") : "Ready"}
                </span>
              </div>

              {previews.length === 0 ? (
                <div className="min-h-[420px] sm:min-h-[500px] border border-dashed border-line rounded-2xl bg-paper flex flex-col items-center justify-center text-center p-8 shadow-inner">
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-line flex items-center justify-center text-brand mb-3 shadow-sm">
                    <FileText className="w-6 h-6 shrink-0" />
                  </div>
                  <h4 className="text-sm font-black text-ink tracking-tight">Your pages will appear here</h4>
                  <p className="text-xs text-muted mt-1 max-w-[280px] leading-relaxed">
                    Upload a PDF, choose your output settings and click Preview to inspect the pages before downloading.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
                  {previews.map(function (item) {
                    return (
                      <div
                        key={item.page}
                        className="border border-line rounded-xl overflow-hidden bg-paper shadow-sm flex flex-col"
                      >
                        <img
                          src={item.url}
                          alt={"PDF page " + item.page}
                          className="w-full aspect-[1/1.25] object-contain bg-surface border-b border-line"
                        />
                        <div className="p-3 flex items-center justify-between bg-paper">
                          <div>
                            <strong className="text-xs font-black text-ink block">Page {item.page}</strong>
                            <span className="text-[10px] text-muted font-mono block mt-0.5">{item.width} × {item.height}px</span>
                          </div>
                          <button
                            type="button"
                            title={"Download page " + item.page}
                            onClick={() => downloadSingle(item.page)}
                            className="h-8 px-3 rounded-lg border border-line bg-surface text-ink text-xs font-black uppercase tracking-wider hover:border-brand flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5 shrink-0" /> Save
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {pdfInfo && (
              <div className="mt-4 p-3.5 rounded-xl bg-paper border border-line text-xs text-muted leading-relaxed flex items-center gap-2.5 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  PDF processing happens in your browser. Your document is not uploaded to any server.
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}