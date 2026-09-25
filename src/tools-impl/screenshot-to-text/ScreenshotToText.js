"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload, Copy, CheckCircle2, Download, Trash2, 
  RefreshCw, Globe, Sparkles, ShieldCheck, FileText, Image as ImageIcon
} from "lucide-react";

const TESSERACT_CDN =
  "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

const LANGUAGES = [
  { value: "eng", label: "English" },
  { value: "urd", label: "Urdu" },
  { value: "hin", label: "Hindi" },
  { value: "ara", label: "Arabic" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
];

function loadTesseract() {
  return new Promise(function (resolve, reject) {
    if (typeof window === "undefined") {
      reject(new Error("OCR can only run in the browser."));
      return;
    }

    if (window.Tesseract) {
      resolve(window.Tesseract);
      return;
    }

    var existing = document.querySelector(
      'script[data-screenshot-ocr="tesseract"]'
    );

    if (existing) {
      existing.addEventListener("load", function () {
        if (window.Tesseract) {
          resolve(window.Tesseract);
        } else {
          reject(new Error("Tesseract failed to initialize."));
        }
      });

      existing.addEventListener("error", function () {
        reject(new Error("Unable to load the OCR engine."));
      });

      return;
    }

    var script = document.createElement("script");
    script.src = TESSERACT_CDN;
    script.async = true;
    script.setAttribute("data-screenshot-ocr", "tesseract");

    script.onload = function () {
      if (window.Tesseract) {
        resolve(window.Tesseract);
      } else {
        reject(new Error("Tesseract loaded but was not initialized."));
      }
    };

    script.onerror = function () {
      reject(
        new Error(
          "Could not load the OCR engine. Please check your internet connection."
        )
      );
    };

    document.head.appendChild(script);
  });
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";

  var units = ["B", "KB", "MB", "GB"];
  var index = Math.floor(Math.log(bytes) / Math.log(1024));

  index = Math.max(0, Math.min(index, units.length - 1));

  return (
    (bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2) +
    " " +
    units[index]
  );
}

function cleanOCRText(text) {
  if (!text) return "";

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function ScreenshotToText() {
  const [isMounted, setIsMounted] = useState(false);
  var fileInputRef = useRef(null);
  var workerRef = useRef(null);
  var objectUrlRef = useRef(null);

  var [file, setFile] = useState(null);
  var [preview, setPreview] = useState("");
  var [text, setText] = useState("");
  var [language, setLanguage] = useState("eng");
  var [progress, setProgress] = useState(0);
  var [status, setStatus] = useState("Ready");
  var [isProcessing, setIsProcessing] = useState(false);
  var [dragActive, setDragActive] = useState(false);
  var [autoClean, setAutoClean] = useState(true);
  var [copied, setCopied] = useState(false);
  var [error, setError] = useState("");

  useEffect(function () {
    setIsMounted(true);
    return function () {
      if (workerRef.current) {
        workerRef.current.terminate().catch(function () {});
        workerRef.current = null;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  var handleFile = useCallback(function (selectedFile) {
    if (!selectedFile) return;

    setError("");
    setText("");
    setProgress(0);
    setCopied(false);

    if (!selectedFile.type || !selectedFile.type.startsWith("image/")) {
      setFile(null);
      setPreview("");
      setError("Please select a valid image file.");
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setFile(null);
      setPreview("");
      setError("Image is too large. Maximum supported size is 20 MB.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    var url = URL.createObjectURL(selectedFile);

    objectUrlRef.current = url;
    setFile(selectedFile);
    setPreview(url);
    setStatus("Image ready");
  }, []);

  var onFileChange = function (event) {
    var selected = event.target.files && event.target.files[0];

    if (selected) {
      handleFile(selected);
    }

    event.target.value = "";
  };

  var onDrop = function (event) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    var droppedFile =
      event.dataTransfer &&
      event.dataTransfer.files &&
      event.dataTransfer.files[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  var onPaste = useCallback(
    function (event) {
      if (!event.clipboardData || !event.clipboardData.items) return;

      var items = Array.prototype.slice.call(event.clipboardData.items);

      for (var i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.startsWith("image/")) {
          var pastedFile = items[i].getAsFile();

          if (pastedFile) {
            handleFile(pastedFile);
            break;
          }
        }
      }
    },
    [handleFile]
  );

  useEffect(
    function () {
      document.addEventListener("paste", onPaste);

      return function () {
        document.removeEventListener("paste", onPaste);
      };
    },
    [onPaste]
  );

  var extractText = async function () {
    if (!file || isProcessing) return;

    setError("");
    setText("");
    setCopied(false);
    setProgress(0);
    setIsProcessing(true);
    setStatus("Loading OCR engine...");

    try {
      var Tesseract = await loadTesseract();

      if (!Tesseract || !Tesseract.createWorker) {
        throw new Error("OCR engine is unavailable.");
      }

      if (workerRef.current) {
        try {
          await workerRef.current.terminate();
        } catch (e) {}

        workerRef.current = null;
      }

      setStatus("Preparing OCR...");
      setProgress(5);

      var worker = await Tesseract.createWorker(language, 1, {
        logger: function (message) {
          if (!message) return;

          if (typeof message.progress === "number") {
            var percent = Math.round(message.progress * 100);

            setProgress(Math.max(5, Math.min(100, percent)));
          }

          if (message.status) {
            setStatus(message.status);
          }
        },
      });

      workerRef.current = worker;

      setStatus("Reading screenshot...");
      setProgress(10);

      var result = await worker.recognize(file);

      var extracted =
        result &&
        result.data &&
        typeof result.data.text === "string"
          ? result.data.text
          : "";

      extracted = autoClean
        ? cleanOCRText(extracted)
        : extracted.trim();

      setText(extracted);
      setProgress(100);

      if (extracted) {
        setStatus("Text extracted successfully");
      } else {
        setStatus("No readable text found");
      }

      await worker.terminate();
      workerRef.current = null;
    } catch (err) {
      console.error("Screenshot OCR error:", err);

      setError(
        err && err.message
          ? err.message
          : "OCR failed. Please try another image."
      );

      setStatus("OCR failed");
    } finally {
      setIsProcessing(false);
    }
  };

  var copyText = async function () {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(function () {
        setCopied(false);
      }, 1800);
    } catch (err) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
        setCopied(true);

        setTimeout(function () {
          setCopied(false);
        }, 1800);
      } catch (e) {}

      document.body.removeChild(textarea);
    }
  };

  var downloadText = function () {
    if (!text) return;

    var blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download = "screenshot-text.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  var clearAll = function () {
    setFile(null);
    setPreview("");
    setText("");
    setProgress(0);
    setStatus("Ready");
    setError("");
    setCopied(false);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  var wordCount = text
    ? text.split(/\s+/).filter(function (word) {
        return word.length > 0;
      }).length
    : 0;

  var characterCount = text ? text.length : 0;

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Screenshot to Text
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate">
              Extract editable text from screenshots and images directly in your browser.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface border border-line text-brand text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Private • Browser OCR
        </div>
      </div>

      <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        {/* Dropzone */}
        <div
          onClick={function () {
            if (!isProcessing && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          onDragOver={function (event) {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={function (event) {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(false);
          }}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
            dragActive ? "border-brand bg-surface" : "border-line bg-surface hover:border-brand"
          }`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-xl bg-paper border border-line flex items-center justify-center text-brand text-xl font-black shadow-sm">
            {file ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> : <Upload className="w-6 h-6 shrink-0" />}
          </div>

          <p className="text-sm sm:text-base font-black text-ink tracking-tight">
            {file ? "Screenshot selected" : "Drop screenshot here"}
          </p>

          <p className="text-xs text-muted mt-1 truncate px-2">
            {file
              ? file.name + " • " + formatBytes(file.size)
              : "or click to browse • You can also paste an image with Ctrl + V"}
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-4 items-end">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand shrink-0" /> OCR Language
            </label>
            <select
              value={language}
              onChange={function (event) {
                setLanguage(event.target.value);
                setText("");
                setProgress(0);
                setStatus("Language changed");
              }}
              disabled={isProcessing}
              className="w-full h-11 px-3 rounded-xl border border-line bg-surface text-ink text-xs font-bold outline-none focus:border-brand cursor-pointer shadow-inner"
            >
              {LANGUAGES.map(function (item) {
                return (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted block">Text Cleanup</label>
            <label className="flex items-center gap-2.5 h-11 px-3 border border-line rounded-xl bg-surface text-xs font-bold text-ink cursor-pointer shadow-inner">
              <input 
                type="checkbox"
                checked={autoClean}
                onChange={function (event) {
                  setAutoClean(event.target.checked);
                }}
                className="w-4 h-4 accent-brand rounded border-line cursor-pointer shrink-0"
              />
              <span className="truncate">Clean spacing & empty lines</span>
            </label>
          </div>

          <div>
            <button
              type="button"
              onClick={extractText}
              disabled={!file || isProcessing}
              className={`w-full sm:w-auto h-11 px-6 border-0 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                !file || isProcessing
                  ? "bg-surface text-muted border border-line cursor-not-allowed opacity-50"
                  : "bg-brand text-surface hover:opacity-90 cursor-pointer"
              }`}
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0" />}
              {isProcessing ? "Extracting..." : "Extract Text"}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="p-4 rounded-xl bg-surface border border-line space-y-2 shadow-inner">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-muted">
              <span className="truncate">{status}</span>
              <span className="font-mono text-brand font-black">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-paper border border-line overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-250"
                style={{ width: progress + "%" }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed shadow-sm">
            {error}
          </div>
        )}

        {/* Preview & Results Grid */}
        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Screenshot Panel */}
            <div className="border border-line rounded-2xl overflow-hidden bg-surface shadow-sm flex flex-col">
              <div className="p-3.5 border-b border-line flex justify-between items-center gap-2 bg-paper">
                <span className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5 truncate">
                  <ImageIcon className="w-4 h-4 text-brand shrink-0" /> Screenshot
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-surface px-2 py-0.5 rounded border border-line text-muted font-mono shrink-0">
                  {formatBytes(file.size)}
                </span>
              </div>
              <div className="min-h-[330px] flex items-center justify-center p-4 bg-paper/50">
                <img
                  src={preview}
                  alt="Selected screenshot preview"
                  className="max-w-full max-h-[430px] object-contain rounded-xl shadow-sm border border-line"
                />
              </div>
            </div>

            {/* Extracted Text Panel */}
            <div className="border border-line rounded-2xl overflow-hidden bg-surface shadow-sm flex flex-col">
              <div className="p-3.5 border-b border-line flex justify-between items-center gap-2 bg-paper">
                <span className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5 truncate">
                  <FileText className="w-4 h-4 text-brand shrink-0" /> Extracted Text
                </span>
                <div className="flex gap-2 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-surface px-2 py-0.5 rounded border border-line text-muted font-mono">
                    {wordCount} words
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-surface px-2 py-0.5 rounded border border-line text-muted font-mono">
                    {characterCount} chars
                  </span>
                </div>
              </div>
              <textarea
                value={text}
                onChange={function (event) {
                  setText(event.target.value);
                }}
                placeholder="Extracted text will appear here after you click Extract Text..."
                className="w-full min-h-[330px] resize-vertical border-0 outline-none p-4 text-xs sm:text-sm leading-relaxed text-ink bg-surface font-mono shadow-inner"
              ></textarea>
            </div>

          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={copyText}
            disabled={!text}
            className={`flex-1 min-w-[120px] h-11 px-4 border border-line rounded-xl bg-surface font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
              !text ? "opacity-50 cursor-not-allowed text-muted" : "text-ink hover:border-brand cursor-pointer"
            }`}
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
            {copied ? "Copied" : "Copy Text"}
          </button>

          <button
            type="button"
            onClick={downloadText}
            disabled={!text}
            className={`flex-1 min-w-[120px] h-11 px-4 border border-line rounded-xl bg-surface font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
              !text ? "opacity-50 cursor-not-allowed text-muted" : "text-ink hover:border-brand cursor-pointer"
            }`}
          >
            <Download className="w-4 h-4 shrink-0" /> Download TXT
          </button>

          <button
            type="button"
            onClick={clearAll}
            disabled={isProcessing && !file}
            className="h-11 px-6 border border-line rounded-xl bg-surface text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm hover:bg-rose-500/10 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 shrink-0" /> Clear
          </button>
        </div>

        {/* Privacy Note */}
        <div className="p-4 rounded-xl bg-surface border border-line text-xs text-muted leading-relaxed flex items-start gap-2.5 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Privacy-first OCR: the screenshot is processed in your browser. The tool does not upload your image to any external server. Tesseract.js runs the OCR engine through a browser worker.
          </span>
        </div>

      </div>
    </div>
  );
}