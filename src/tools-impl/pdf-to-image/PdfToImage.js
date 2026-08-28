"use client";

import React, { useEffect, useRef, useState } from "react";

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

  var styleText = `
    .pdf-image-tool {
      --pit-text: #151a24;
      --pit-muted: #697386;
      --pit-border: #e4e7ec;
      --pit-card: #ffffff;
      --pit-soft: #f7f8fa;
      --pit-primary: #5b5cf0;
      --pit-primary-soft: #f0f0ff;
      --pit-success: #079455;
      width: 100%;
      color: var(--pit-text);
      font-family: inherit;
      box-sizing: border-box;
    }

    .pdf-image-tool *,
    .pdf-image-tool *::before,
    .pdf-image-tool *::after {
      box-sizing: border-box;
    }

    .pit-wrap {
      width: 100%;
      max-width: 1180px;
      margin: 0 auto;
    }

    .pit-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 22px;
    }

    .pit-eyebrow {
      color: var(--pit-primary);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .14em;
      text-transform: uppercase;
    }

    .pit-title {
      margin: 6px 0 0;
      font-size: clamp(28px, 4vw, 42px);
      line-height: 1.02;
      letter-spacing: -.055em;
    }

    .pit-description {
      max-width: 700px;
      margin: 10px 0 0;
      color: var(--pit-muted);
      font-size: 13px;
      line-height: 1.7;
    }

    .pit-main {
      display: grid;
      grid-template-columns: minmax(0,.82fr) minmax(0,1.18fr);
      gap: 18px;
    }

    .pit-panel {
      min-width: 0;
      border: 1px solid var(--pit-border);
      border-radius: 18px;
      background: var(--pit-card);
      box-shadow: 0 10px 35px rgba(16,24,40,.045);
    }

    .pit-controls {
      padding: 21px;
    }

    .pit-panel-title {
      font-size: 17px;
      font-weight: 800;
      letter-spacing: -.025em;
    }

    .pit-panel-subtitle {
      margin-top: 5px;
      color: var(--pit-muted);
      font-size: 11px;
      line-height: 1.6;
    }

    .pit-upload {
      position: relative;
      display: grid;
      place-items: center;
      min-height: 205px;
      margin-top: 18px;
      padding: 25px;
      border: 1.5px dashed #cfd3dc;
      border-radius: 14px;
      background: var(--pit-soft);
      text-align: center;
      cursor: pointer;
      transition: .18s ease;
    }

    .pit-upload:hover,
    .pit-upload.dragging {
      border-color: var(--pit-primary);
      background: var(--pit-primary-soft);
    }

    .pit-upload-icon {
      display: grid;
      place-items: center;
      width: 54px;
      height: 54px;
      margin-bottom: 12px;
      border-radius: 15px;
      background: var(--pit-card);
      box-shadow: 0 5px 20px rgba(16,24,40,.07);
      font-size: 23px;
    }

    .pit-upload strong {
      display: block;
      font-size: 13px;
    }

    .pit-upload span {
      display: block;
      margin-top: 6px;
      color: var(--pit-muted);
      font-size: 10px;
    }

    .pit-upload input {
      display: none;
    }

    .pit-file {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      padding: 11px;
      border: 1px solid var(--pit-border);
      border-radius: 10px;
      background: var(--pit-soft);
    }

    .pit-file-icon {
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #fff0f0;
      color: #d92d20;
      font-size: 10px;
      font-weight: 900;
    }

    .pit-file-info {
      min-width: 0;
      flex: 1;
    }

    .pit-file-info strong {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 10px;
    }

    .pit-file-info span {
      display: block;
      margin-top: 3px;
      color: var(--pit-muted);
      font-size: 9px;
    }

    .pit-section {
      margin-top: 20px;
      padding-top: 18px;
      border-top: 1px solid var(--pit-border);
    }

    .pit-section-heading {
      margin-bottom: 11px;
      font-size: 11px;
      font-weight: 800;
    }

    .pit-field {
      margin-top: 12px;
    }

    .pit-field:first-child {
      margin-top: 0;
    }

    .pit-label {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 7px;
      color: var(--pit-muted);
      font-size: 10px;
      font-weight: 700;
    }

    .pit-label b {
      color: var(--pit-text);
    }

    .pit-select,
    .pit-input {
      width: 100%;
      height: 41px;
      padding: 0 10px;
      border: 1px solid var(--pit-border);
      border-radius: 9px;
      outline: none;
      background: var(--pit-card);
      color: var(--pit-text);
      font: inherit;
      font-size: 11px;
    }

    .pit-select:focus,
    .pit-input:focus {
      border-color: var(--pit-primary);
      box-shadow: 0 0 0 3px rgba(91,92,240,.10);
    }

    .pit-radio-grid {
      display: grid;
      grid-template-columns: repeat(3,1fr);
      gap: 7px;
    }

    .pit-radio {
      position: relative;
    }

    .pit-radio input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .pit-radio label {
      display: block;
      padding: 10px 6px;
      border: 1px solid var(--pit-border);
      border-radius: 9px;
      background: var(--pit-card);
      text-align: center;
      cursor: pointer;
      font-size: 10px;
      font-weight: 750;
    }

    .pit-radio input:checked + label {
      border-color: var(--pit-primary);
      background: var(--pit-primary-soft);
      color: var(--pit-primary);
    }

    .pit-range {
      width: 100%;
      accent-color: var(--pit-primary);
    }

    .pit-color-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pit-color {
      width: 44px;
      height: 41px;
      padding: 3px;
      border: 1px solid var(--pit-border);
      border-radius: 9px;
      background: var(--pit-card);
      cursor: pointer;
    }

    .pit-color-code {
      flex: 1;
      height: 41px;
      padding: 0 10px;
      border: 1px solid var(--pit-border);
      border-radius: 9px;
      background: var(--pit-soft);
      font-size: 10px;
      font-weight: 700;
    }

    .pit-page-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
    }

    .pit-page-button {
      min-height: 41px;
      padding: 0 10px;
      border: 1px solid var(--pit-border);
      border-radius: 9px;
      background: var(--pit-card);
      color: var(--pit-text);
      cursor: pointer;
      font: inherit;
      font-size: 10px;
      font-weight: 750;
    }

    .pit-page-button.active {
      border-color: var(--pit-primary);
      background: var(--pit-primary-soft);
      color: var(--pit-primary);
    }

    .pit-action-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      margin-top: 19px;
    }

    .pit-primary-button,
    .pit-secondary-button {
      min-height: 43px;
      padding: 0 14px;
      border-radius: 9px;
      cursor: pointer;
      font: inherit;
      font-size: 10px;
      font-weight: 800;
    }

    .pit-primary-button {
      border: 1px solid var(--pit-primary);
      background: var(--pit-primary);
      color: #fff;
    }

    .pit-primary-button:disabled,
    .pit-secondary-button:disabled {
      cursor: not-allowed;
      opacity: .5;
    }

    .pit-secondary-button {
      border: 1px solid var(--pit-border);
      background: var(--pit-card);
      color: var(--pit-text);
    }

    .pit-status {
      margin-top: 12px;
      padding: 9px 10px;
      border-radius: 8px;
      background: #ecfdf3;
      color: var(--pit-success);
      font-size: 10px;
      line-height: 1.5;
    }

    .pit-error {
      margin-top: 12px;
      padding: 10px;
      border-radius: 8px;
      background: #fff1f3;
      color: #c01048;
      font-size: 10px;
      line-height: 1.5;
    }

    .pit-preview-panel {
      min-height: 600px;
      padding: 21px;
      background:
        radial-gradient(
          circle at 100% 0%,
          rgba(91,92,240,.10),
          transparent 35%
        ),
        var(--pit-card);
    }

    .pit-preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 15px;
    }

    .pit-preview-title {
      font-size: 15px;
      font-weight: 800;
    }

    .pit-preview-count {
      padding: 5px 8px;
      border-radius: 6px;
      background: var(--pit-soft);
      color: var(--pit-muted);
      font-size: 9px;
      font-weight: 800;
    }

    .pit-empty {
      display: grid;
      place-items: center;
      min-height: 510px;
      padding: 30px;
      border: 1px dashed var(--pit-border);
      border-radius: 14px;
      text-align: center;
      background: rgba(247,248,250,.65);
    }

    .pit-empty-icon {
      display: grid;
      place-items: center;
      width: 58px;
      height: 58px;
      margin-bottom: 14px;
      border-radius: 16px;
      background: var(--pit-primary-soft);
      color: var(--pit-primary);
      font-size: 23px;
    }

    .pit-empty h3 {
      margin: 0;
      font-size: 18px;
    }

    .pit-empty p {
      max-width: 350px;
      margin: 7px auto 0;
      color: var(--pit-muted);
      font-size: 10px;
      line-height: 1.7;
    }

    .pit-preview-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 12px;
    }

    .pit-preview-card {
      overflow: hidden;
      border: 1px solid var(--pit-border);
      border-radius: 11px;
      background: var(--pit-soft);
    }

    .pit-preview-image {
      display: block;
      width: 100%;
      aspect-ratio: 1 / 1.25;
      object-fit: contain;
      background:
        repeating-conic-gradient(
          #f0f1f3 0% 25%,
          #fff 0% 50%
        ) 50% / 14px 14px;
    }

    .pit-preview-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 9px;
      background: var(--pit-card);
    }

    .pit-preview-meta strong {
      font-size: 9px;
    }

    .pit-preview-meta span {
      display: block;
      margin-top: 2px;
      color: var(--pit-muted);
      font-size: 8px;
    }

    .pit-mini-download {
      flex: 0 0 auto;
      width: 29px;
      height: 29px;
      border: 1px solid var(--pit-border);
      border-radius: 7px;
      background: var(--pit-card);
      cursor: pointer;
      font-size: 12px;
    }

    .pit-progress {
      margin-top: 15px;
    }

    .pit-progress-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      color: var(--pit-muted);
      font-size: 9px;
      font-weight: 700;
    }

    .pit-progress-track {
      height: 6px;
      overflow: hidden;
      border-radius: 20px;
      background: #eceef2;
    }

    .pit-progress-bar {
      height: 100%;
      border-radius: inherit;
      background: var(--pit-primary);
      transition: width .2s ease;
    }

    .pit-info-grid {
      display: grid;
      grid-template-columns: repeat(3,1fr);
      gap: 8px;
      margin-top: 14px;
    }

    .pit-info-card {
      padding: 10px;
      border: 1px solid var(--pit-border);
      border-radius: 9px;
      background: var(--pit-soft);
    }

    .pit-info-card span {
      display: block;
      color: var(--pit-muted);
      font-size: 8px;
    }

    .pit-info-card strong {
      display: block;
      margin-top: 4px;
      font-size: 11px;
    }

    .pit-privacy {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-top: 14px;
      color: var(--pit-muted);
      font-size: 9px;
    }

    .pit-privacy b {
      color: var(--pit-success);
      font-size: 12px;
    }

    .pit-features {
      display: grid;
      grid-template-columns: repeat(4,1fr);
      gap: 10px;
      margin-top: 18px;
    }

    .pit-feature {
      padding: 13px;
      border: 1px solid var(--pit-border);
      border-radius: 11px;
      background: var(--pit-card);
    }

    .pit-feature strong {
      display: block;
      font-size: 10px;
    }

    .pit-feature span {
      display: block;
      margin-top: 4px;
      color: var(--pit-muted);
      font-size: 8px;
      line-height: 1.5;
    }

    @media (max-width: 900px) {
      .pit-main {
        grid-template-columns: 1fr;
      }

      .pit-preview-panel {
        min-height: auto;
      }

      .pit-empty {
        min-height: 360px;
      }

      .pit-features {
        grid-template-columns: repeat(2,1fr);
      }
    }

    @media (max-width: 600px) {
      .pit-header {
        flex-direction: column;
        align-items: stretch;
      }

      .pit-controls,
      .pit-preview-panel {
        padding: 15px;
      }

      .pit-preview-grid {
        grid-template-columns: 1fr;
      }

      .pit-radio-grid {
        grid-template-columns: 1fr 1fr 1fr;
      }

      .pit-action-row {
        grid-template-columns: 1fr;
      }

      .pit-info-grid {
        grid-template-columns: 1fr 1fr;
      }

      .pit-features {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 390px) {
      .pit-features,
      .pit-info-grid {
        grid-template-columns: 1fr;
      }

      .pit-page-buttons {
        grid-template-columns: 1fr;
      }
    }

    .dark .pdf-image-tool,
    body.dark .pdf-image-tool,
    html.dark .pdf-image-tool {
      --pit-text: #f2f4f7;
      --pit-muted: #98a2b3;
      --pit-border: #2d3442;
      --pit-card: #151922;
      --pit-soft: #10141c;
      --pit-primary: #817cff;
      --pit-primary-soft: #1b1b38;
    }
  `;

  return (
    <>
      <div className="pdf-image-tool">
        <div className="pit-wrap">

          <div className="pit-header">
            <div>
              <div className="pit-eyebrow">
                PDF UTILITY
              </div>

              <h1 className="pit-title">
                PDF to Image Converter
              </h1>

              <p className="pit-description">
                Convert PDF pages into high-quality JPG, PNG or WebP images.
                Choose specific pages, control resolution and quality, preview
                results, and download everything as one ZIP.
              </p>
            </div>
          </div>

          <div className="pit-main">

            <div className="pit-panel pit-controls">

              <div className="pit-panel-title">
                Upload your PDF
              </div>

              <div className="pit-panel-subtitle">
                Your PDF is processed locally in your browser.
              </div>

              <div
                ref={dropRef}
                className={
                  "pit-upload" +
                  (dragging ? " dragging" : "")
                }
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
              >
                <div>
                  <div className="pit-upload-icon">
                    ⇧
                  </div>

                  <strong>
                    Drop PDF here or click to browse
                  </strong>

                  <span>
                    PDF files up to 100 MB
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <div className="pit-file">
                  <div className="pit-file-icon">
                    PDF
                  </div>

                  <div className="pit-file-info">
                    <strong>
                      {file.name}
                    </strong>

                    <span>
                      {formatBytes(file.size)}
                      {pdfInfo
                        ? " · " +
                          pdfInfo.pages +
                          (pdfInfo.pages === 1
                            ? " page"
                            : " pages")
                        : ""}
                    </span>
                  </div>
                </div>
              )}

              <div className="pit-section">

                <div className="pit-section-heading">
                  Output format
                </div>

                <div className="pit-radio-grid">

                  <div className="pit-radio">
                    <input
                      id="pit-format-jpg"
                      type="radio"
                      name="pit-format"
                      checked={format === "jpg"}
                      onChange={function () {
                        setFormat("jpg");
                      }}
                    />
                    <label htmlFor="pit-format-jpg">
                      JPG
                    </label>
                  </div>

                  <div className="pit-radio">
                    <input
                      id="pit-format-png"
                      type="radio"
                      name="pit-format"
                      checked={format === "png"}
                      onChange={function () {
                        setFormat("png");
                      }}
                    />
                    <label htmlFor="pit-format-png">
                      PNG
                    </label>
                  </div>

                  <div className="pit-radio">
                    <input
                      id="pit-format-webp"
                      type="radio"
                      name="pit-format"
                      checked={format === "webp"}
                      onChange={function () {
                        setFormat("webp");
                      }}
                    />
                    <label htmlFor="pit-format-webp">
                      WebP
                    </label>
                  </div>

                </div>

                <div className="pit-field">

                  <div className="pit-label">
                    <span>
                      Resolution
                    </span>

                    <b>
                      {scale}×
                    </b>
                  </div>

                  <input
                    className="pit-range"
                    type="range"
                    min="0.75"
                    max="3"
                    step="0.25"
                    value={scale}
                    onChange={function (event) {
                      setScale(event.target.value);
                    }}
                  />

                </div>

                {format !== "png" && (
                  <div className="pit-field">

                    <div className="pit-label">
                      <span>
                        Image quality
                      </span>

                      <b>
                        {Math.round(
                          Number(quality) * 100
                        )}%
                      </b>
                    </div>

                    <input
                      className="pit-range"
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.01"
                      value={quality}
                      onChange={function (event) {
                        setQuality(
                          event.target.value
                        );
                      }}
                    />

                  </div>
                )}

                {format !== "png" && (
                  <div className="pit-field">

                    <div className="pit-label">
                      <span>
                        Background
                      </span>
                    </div>

                    <div className="pit-color-row">

                      <input
                        className="pit-color"
                        type="color"
                        value={background}
                        onChange={function (event) {
                          setBackground(
                            event.target.value
                          );
                        }}
                      />

                      <div className="pit-color-code">
                        {background.toUpperCase()}
                      </div>

                    </div>

                  </div>
                )}

                <div className="pit-field">

                  <div className="pit-label">
                    <span>
                      Image effect
                    </span>
                  </div>

                  <select
                    className="pit-select"
                    value={effect}
                    onChange={function (event) {
                      setEffect(
                        event.target.value
                      );
                    }}
                  >
                    <option value="normal">
                      Original
                    </option>

                    <option value="grayscale">
                      Grayscale
                    </option>

                    <option value="invert">
                      Inverted
                    </option>
                  </select>

                </div>

              </div>

              <div className="pit-section">

                <div className="pit-section-heading">
                  Pages to convert
                </div>

                <div className="pit-page-buttons">

                  <button
                    type="button"
                    className={
                      "pit-page-button" +
                      (pageMode === "all"
                        ? " active"
                        : "")
                    }
                    onClick={function () {
                      setPageMode("all");
                    }}
                  >
                    All pages
                  </button>

                  <button
                    type="button"
                    className={
                      "pit-page-button" +
                      (pageMode === "range"
                        ? " active"
                        : "")
                    }
                    onClick={function () {
                      setPageMode("range");
                    }}
                  >
                    Custom range
                  </button>

                </div>

                {pageMode === "range" && (
                  <div className="pit-field">

                    <div className="pit-label">
                      <span>
                        Page numbers
                      </span>

                      <b>
                        Example: 1,3,5-8
                      </b>
                    </div>

                    <input
                      className="pit-input"
                      type="text"
                      value={pageRange}
                      placeholder="1, 3, 5-8"
                      onChange={function (event) {
                        setPageRange(
                          event.target.value
                        );
                      }}
                    />

                  </div>
                )}

              </div>

              <div className="pit-action-row">

                <button
                  type="button"
                  className="pit-primary-button"
                  disabled={
                    !pdfInfo ||
                    isLoading ||
                    isConverting
                  }
                  onClick={convertAll}
                >
                  {isConverting
                    ? "Converting..."
                    : "Convert & Download ZIP"}
                </button>

                <button
                  type="button"
                  className="pit-secondary-button"
                  disabled={!pdfInfo || isLoading}
                  onClick={generatePreviews}
                >
                  Preview
                </button>

              </div>

              <button
                type="button"
                className="pit-secondary-button"
                style={{
                  width: "100%",
                  marginTop: "8px",
                }}
                disabled={!file || isConverting}
                onClick={resetTool}
              >
                Clear PDF
              </button>

              {error && (
                <div className="pit-error">
                  {error}
                </div>
              )}

              {message && !error && (
                <div className="pit-status">
                  {message}
                </div>
              )}

              {(isLoading || isConverting) && (
                <div className="pit-progress">

                  <div className="pit-progress-top">
                    <span>
                      {isConverting
                        ? "Converting page " +
                          currentPage
                        : "Processing"}
                    </span>

                    <span>
                      {progress}%
                    </span>
                  </div>

                  <div className="pit-progress-track">
                    <div
                      className="pit-progress-bar"
                      style={{
                        width:
                          progress + "%",
                      }}
                    />
                  </div>

                </div>
              )}

              {pdfInfo && (
                <div className="pit-info-grid">

                  <div className="pit-info-card">
                    <span>
                      PDF pages
                    </span>

                    <strong>
                      {pdfInfo.pages}
                    </strong>
                  </div>

                  <div className="pit-info-card">
                    <span>
                      Selected
                    </span>

                    <strong>
                      {pageSelectionLabel}
                    </strong>
                  </div>

                  <div className="pit-info-card">
                    <span>
                      Output
                    </span>

                    <strong>
                      {format.toUpperCase()}
                    </strong>
                  </div>

                </div>
              )}

            </div>

            <div className="pit-panel pit-preview-panel">

              <div className="pit-preview-header">

                <div className="pit-preview-title">
                  Page preview
                </div>

                <div className="pit-preview-count">
                  {previews.length
                    ? previews.length +
                      " preview" +
                      (previews.length === 1
                        ? ""
                        : "s")
                    : "Ready"}
                </div>

              </div>

              {previews.length === 0 ? (

                <div className="pit-empty">

                  <div>
                    <div className="pit-empty-icon">
                      ▧
                    </div>

                    <h3>
                      Your pages will appear here
                    </h3>

                    <p>
                      Upload a PDF, choose your output
                      settings and click Preview to inspect
                      the pages before downloading.
                    </p>
                  </div>

                </div>

              ) : (

                <div className="pit-preview-grid">

                  {previews.map(function (item) {
                    return (
                      <div
                        className="pit-preview-card"
                        key={item.page}
                      >

                        <img
                          className="pit-preview-image"
                          src={item.url}
                          alt={
                            "PDF page " +
                            item.page
                          }
                        />

                        <div className="pit-preview-meta">

                          <div>
                            <strong>
                              Page {item.page}
                            </strong>

                            <span>
                              {item.width} ×{" "}
                              {item.height}px
                            </span>
                          </div>

                          <button
                            type="button"
                            className="pit-mini-download"
                            title={
                              "Download page " +
                              item.page
                            }
                            onClick={function () {
                              downloadSingle(
                                item.page
                              );
                            }}
                          >
                            ↓
                          </button>

                        </div>

                      </div>
                    );
                  })}

                </div>

              )}

              {pdfInfo && (
                <div className="pit-privacy">
                  <b>✓</b>

                  <span>
                    PDF processing happens in your browser.
                    Your document is not uploaded to a server.
                  </span>
                </div>
              )}

            </div>

          </div>

          <div className="pit-features">

            <div className="pit-feature">
              <strong>
                Custom page ranges
              </strong>

              <span>
                Convert only the pages you need.
              </span>
            </div>

            <div className="pit-feature">
              <strong>
                JPG / PNG / WebP
              </strong>

              <span>
                Pick the format that fits your workflow.
              </span>
            </div>

            <div className="pit-feature">
              <strong>
                High-resolution output
              </strong>

              <span>
                Scale up to 3× for sharper images.
              </span>
            </div>

            <div className="pit-feature">
              <strong>
                ZIP download
              </strong>

              <span>
                Multiple converted pages in one download.
              </span>
            </div>

          </div>

        </div>
      </div>

      <style>
        {styleText}
      </style>
    </>
  );
}