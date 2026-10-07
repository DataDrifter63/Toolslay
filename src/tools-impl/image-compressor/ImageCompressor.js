"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload, Download, Trash2, Sliders, ShieldCheck, 
  FileImage, CheckCircle2, AlertCircle, Plus
} from "lucide-react";

const h = React.createElement;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];

  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, i);

  if (value >= 100) {
    return value.toFixed(0) + " " + units[i];
  }

  if (value >= 10) {
    return value.toFixed(1) + " " + units[i];
  }

  return value.toFixed(2) + " " + units[i];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getOutputMime(format) {
  if (format === "jpeg") {
    return "image/jpeg";
  }

  if (format === "png") {
    return "image/png";
  }

  return "image/webp";
}

function extensionFor(format) {
  if (format === "jpeg") {
    return "jpg";
  }

  return format;
}

function safeFileName(name, format) {
  const base = name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    (base || "image") +
    "-compressed." +
    extensionFor(format)
  );
}

function loadImage(file) {
  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(file);

    const img = new Image();

    img.onload = function () {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };

    img.src = url;
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);

  a.click();

  a.remove();

  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1200);
}

function encodeCanvas(canvas, mime, quality) {
  const q = mime === "image/png" ? undefined : quality;

  return new Promise(function (resolve, reject) {
    canvas.toBlob(
      function (blob) {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new Error(
              "Your browser could not encode this image format."
            )
          );
        }
      },
      mime,
      q
    );
  });
}

async function compressFile(file, settings) {
  const img = await loadImage(file);

  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  let width = originalWidth;
  let height = originalHeight;

  const maxWidth =
    settings.maxWidth > 0
      ? settings.maxWidth
      : Infinity;

  const maxHeight =
    settings.maxHeight > 0
      ? settings.maxHeight
      : Infinity;

  const scale = Math.min(
    1,
    maxWidth / width,
    maxHeight / height
  );

  width = Math.max(
    1,
    Math.round(width * scale)
  );

  height = Math.max(
    1,
    Math.round(height * scale)
  );

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", {
    alpha: settings.format !== "jpeg",
  });

  if (!ctx) {
    throw new Error(
      "Canvas is not available in this browser."
    );
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (settings.format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  ctx.drawImage(
    img,
    0,
    0,
    width,
    height
  );

  const mime = getOutputMime(settings.format);

  let blob = await encodeCanvas(
    canvas,
    mime,
    settings.quality / 100
  );

  if (
    settings.targetKB > 0 &&
    mime !== "image/png" &&
    blob.size > settings.targetKB * 1024
  ) {
    const target =
      settings.targetKB * 1024;

    let currentQuality =
      settings.quality / 100;

    for (
      let i = 0;
      i < 9 && blob.size > target;
      i += 1
    ) {
      currentQuality = Math.max(
        0.18,
        currentQuality - 0.07
      );

      blob = await encodeCanvas(
        canvas,
        mime,
        currentQuality
      );
    }

    if (blob.size > target) {
      let factor = 0.90;

      for (
        let i = 0;
        i < 8 && blob.size > target;
        i += 1
      ) {
        width = Math.max(
          160,
          Math.round(width * factor)
        );

        height = Math.max(
          160,
          Math.round(height * factor)
        );

        canvas.width = width;
        canvas.height = height;

        const resizeCtx =
          canvas.getContext("2d");

        if (!resizeCtx) {
          break;
        }

        resizeCtx.imageSmoothingEnabled =
          true;

        resizeCtx.imageSmoothingQuality =
          "high";

        if (settings.format === "jpeg") {
          resizeCtx.fillStyle = "#ffffff";

          resizeCtx.fillRect(
            0,
            0,
            width,
            height
          );
        }

        resizeCtx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        blob = await encodeCanvas(
          canvas,
          mime,
          Math.max(
            0.18,
            currentQuality
          )
        );
      }
    }
  }

  if (
    blob.size >= file.size &&
    settings.targetKB <= 0
  ) {
    return {
      blob: file,
      width: originalWidth,
      height: originalHeight,
      originalWidth,
      originalHeight,
      unchanged: true,
    };
  }

  return {
    blob,
    width,
    height,
    originalWidth,
    originalHeight,
    unchanged: false,
  };
}

export default function ImageCompressor() {
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);

  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("webp");
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [targetKB, setTargetKB] = useState(0);
  const [autoDownload, setAutoDownload] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  useEffect(function () {
    setIsMounted(true);
    return function () {
      results.forEach(function (item) {
        if (item.preview) {
          URL.revokeObjectURL(
            item.preview
          );
        }
      });
    };
  }, [results]);

  const addFiles = useCallback(
    function (incoming) {
      const selected = Array.from(
        incoming || []
      ).filter(function (file) {
        return (
          file.type &&
          file.type.startsWith("image/")
        );
      });

      if (!selected.length) {
        setError(
          "Please select JPG, PNG, WebP, GIF or another supported image file."
        );

        return;
      }

      setError("");

      setFiles(function (previous) {
        return previous
          .concat(selected)
          .slice(0, 50);
      });

      setResults([]);
    },
    []
  );

  function onInputChange(event) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function removeFile(index) {
    setFiles(function (previous) {
      return previous.filter(
        function (_, i) {
          return i !== index;
        }
      );
    });

    setResults(function (previous) {
      return previous.filter(
        function (_, i) {
          return i !== index;
        }
      );
    });
  }

  function clearAll() {
    setFiles([]);
    setResults([]);
    setError("");
  }

  async function runCompression() {
    if (!files.length) {
      setError(
        "Select at least one image first."
      );

      return;
    }

    setWorking(true);
    setError("");
    setResults([]);

    const settings = {
      quality: clamp(
        Number(quality) || 80,
        10,
        100
      ),

      format,

      maxWidth: Math.max(
        0,
        Number(maxWidth) || 0
      ),

      maxHeight: Math.max(
        0,
        Number(maxHeight) || 0
      ),

      targetKB: Math.max(
        0,
        Number(targetKB) || 0
      ),
    };

    const output = [];

    try {
      for (const file of files) {
        try {
          const data =
            await compressFile(
              file,
              settings
            );

          const preview =
            URL.createObjectURL(
              data.blob
            );

          const item = {
            name: file.name,
            originalSize: file.size,
            blob: data.blob,
            preview,
            width: data.width,
            height: data.height,
            unchanged:
              data.unchanged || false,
          };

          output.push(item);

          setResults(
            output.slice()
          );

          if (autoDownload) {
            downloadBlob(
              data.blob,
              safeFileName(
                file.name,
                format
              )
            );
          }
        } catch (itemError) {
          output.push({
            name: file.name,
            originalSize: file.size,
            error:
              itemError.message ||
              "Compression failed.",
          });

          setResults(
            output.slice()
          );
        }
      }
    } finally {
      setWorking(false);
    }
  }

  function downloadAll() {
    results.forEach(
      function (item, index) {
        if (item.blob) {
          const name =
            safeFileName(
              item.name,
              format
            );

          setTimeout(
            function () {
              downloadBlob(
                item.blob,
                name
              );
            },
            index * 150
          );
        }
      }
    );
  }

  const originalTotal =
    results.reduce(
      function (sum, item) {
        return (
          sum +
          (item.originalSize || 0)
        );
      },
      0
    );

  const compressedTotal =
    results.reduce(
      function (sum, item) {
        return (
          sum +
          (item.blob
            ? item.blob.size
            : 0)
        );
      },
      0
    );

  const saved =
    originalTotal > 0 &&
    compressedTotal > 0
      ? Math.max(
          0,
          (1 -
            compressedTotal /
              originalTotal) *
            100
        )
      : 0;

  const successful =
    results.filter(
      function (item) {
        return Boolean(item.blob);
      }
    ).length;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Sliders className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Image Compressor
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 whitespace-normal leading-relaxed">
              Compress images locally with smart quality, target-size and dimension controls.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface border border-line text-brand text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Local Browser Processing
        </div>
      </div>

      <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={true}
          onChange={onInputChange}
          className="hidden"
        />

        {/* Dropzone */}
        <div
          onClick={function () {
            if (inputRef.current) {
              inputRef.current.click();
            }
          }}
          onDragOver={function (event) {
            event.preventDefault();
            setDragging(true);
          }}
          onDragEnter={function (event) {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={function () {
            setDragging(false);
          }}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragging ? "border-brand bg-surface" : "border-line bg-surface hover:border-brand"
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-paper border border-line flex items-center justify-center text-brand text-2xl shadow-sm">
            <Upload className="w-6 h-6 shrink-0" />
          </div>

          <div className="text-sm sm:text-base font-black text-ink tracking-tight">
            {dragging ? "Drop images now" : "Drop your images here"}
          </div>

          <div className="text-xs text-muted mt-1">
            or click to browse • JPG, PNG, WebP, GIF and more
          </div>

          {files.length > 0 && (
            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-surface border border-line text-brand text-xs font-black uppercase tracking-wider shadow-sm">
              {files.length} image{files.length === 1 ? "" : "s"} selected
            </div>
          )}
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="p-4 bg-surface border border-line rounded-xl space-y-2 shadow-inner">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted flex justify-between">
              <span>Compression Quality</span>
              <span className="font-mono text-brand font-black">{quality}%</span>
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={function (event) {
                setQuality(Number(event.target.value));
              }}
              className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line mt-2"
            />
            <div className="text-[10px] text-muted truncate">Higher = better quality • Lower = smaller file</div>
          </div>

          <div className="p-4 bg-surface border border-line rounded-xl space-y-2 shadow-inner">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted block">Output Format</label>
            <select
              value={format}
              onChange={function (event) {
                setFormat(event.target.value);
              }}
              className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
            >
              <option value="webp">WebP — Recommended</option>
              <option value="jpeg">JPG — Maximum compatibility</option>
              <option value="png">PNG — Lossless</option>
            </select>
            <div className="text-[10px] text-muted truncate">
              {format === "png" ? "PNG is lossless and can sometimes be larger." : "WebP/JPG usually produce the biggest savings."}
            </div>
          </div>

          <div className="p-4 bg-surface border border-line rounded-xl space-y-2 shadow-inner">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted block">Smart Target Size (KB)</label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 300"
              value={targetKB || ""}
              onChange={function (event) {
                setTargetKB(event.target.value === "" ? 0 : Number(event.target.value));
              }}
              className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none"
            />
            <div className="text-[10px] text-muted truncate">Optional. Best with WebP or JPG.</div>
          </div>

          <div className="p-4 bg-surface border border-line rounded-xl space-y-2 shadow-inner">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted block">Max Width (px)</label>
            <input
              type="number"
              min={0}
              placeholder="Original"
              value={maxWidth || ""}
              onChange={function (event) {
                setMaxWidth(event.target.value === "" ? 0 : Number(event.target.value));
              }}
              className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none"
            />
          </div>

          <div className="p-4 bg-surface border border-line rounded-xl space-y-2 shadow-inner">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted block">Max Height (px)</label>
            <input
              type="number"
              min={0}
              placeholder="Original"
              value={maxHeight || ""}
              onChange={function (event) {
                setMaxHeight(event.target.value === "" ? 0 : Number(event.target.value));
              }}
              className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none"
            />
          </div>

          <div className="p-4 bg-surface border border-line rounded-xl flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">Auto Download</label>
              <input
                type="checkbox"
                checked={autoDownload}
                onChange={function (event) {
                  setAutoDownload(event.target.checked);
                }}
                className="w-4 h-4 accent-brand rounded border-line cursor-pointer shrink-0"
              />
            </div>
            <div className="text-[10px] text-muted mt-2">
              {autoDownload ? "Each successful result downloads automatically." : "Results stay here until you download them."}
            </div>
          </div>

        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed shadow-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            disabled={working || !files.length}
            onClick={runCompression}
            className={`flex-1 min-w-[140px] h-11 px-6 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
              working || !files.length
                ? "bg-surface text-muted border border-line cursor-not-allowed opacity-50"
                : "bg-brand text-surface hover:opacity-90 cursor-pointer"
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            {working ? "Compressing…" : "Compress Images"}
          </button>

          <button
            type="button"
            onClick={function () {
              if (inputRef.current) {
                inputRef.current.click();
              }
            }}
            className="h-11 px-4 rounded-xl border border-line bg-surface text-ink font-black text-xs uppercase tracking-wider hover:border-brand flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 shrink-0" /> Add Images
          </button>

          <button
            type="button"
            disabled={!successful}
            onClick={downloadAll}
            className={`h-11 px-4 rounded-xl border border-line bg-surface font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
              !successful ? "opacity-50 cursor-not-allowed text-muted" : "text-ink hover:border-brand cursor-pointer"
            }`}
          >
            <Download className="w-4 h-4 shrink-0" /> Download All
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="h-11 px-6 rounded-xl border border-line bg-surface text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:bg-rose-500/10 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 shrink-0" /> Clear
          </button>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-surface border border-line rounded-xl shadow-inner flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted">Images</span>
            <span className="text-base font-black text-ink font-mono mt-1">{results.length ? String(results.length) : String(files.length)}</span>
          </div>
          <div className="p-3.5 bg-surface border border-line rounded-xl shadow-inner flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted">Original Size</span>
            <span className="text-base font-black text-ink font-mono mt-1">{formatBytes(originalTotal)}</span>
          </div>
          <div className="p-3.5 bg-surface border border-line rounded-xl shadow-inner flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted">Compressed Size</span>
            <span className="text-base font-black text-brand font-mono mt-1">{formatBytes(compressedTotal)}</span>
          </div>
          <div className="p-3.5 bg-surface border border-line rounded-xl shadow-inner flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted">Space Saved</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{compressedTotal > 0 ? saved.toFixed(1) + "%" : "—"}</span>
          </div>
        </div>

        {/* Results List */}
        {results.length > 0 ? (
          <div className="border border-line rounded-2xl overflow-hidden bg-surface shadow-sm divide-y divide-line">
            {results.map(function (item, index) {
              const percentSaved =
                item.originalSize > 0 && item.blob
                  ? Math.max(0, (1 - item.blob.size / item.originalSize) * 100)
                  : 0;

              return h(
                "div",
                {
                  key: item.name + "-" + index,
                  className: "p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface hover:bg-paper/50 transition-colors",
                },
                [
                  h(
                    "div",
                    { className: "flex items-center gap-3.5 min-w-0 w-full sm:w-auto" },
                    [
                      item.preview
                        ? h("img", {
                            src: item.preview,
                            alt: item.name,
                            className: "w-14 h-14 object-cover rounded-xl border border-line bg-paper shrink-0",
                          })
                        : h(
                            "div",
                            {
                              className: "w-14 h-14 rounded-xl border border-line bg-rose-500/10 text-rose-600 text-[10px] font-bold flex items-center justify-center shrink-0 uppercase",
                            },
                            "Error"
                          ),
                      h(
                        "div",
                        { className: "min-w-0 flex-1" },
                        [
                          h(
                            "div",
                            { className: "text-xs font-black text-ink truncate", title: item.name },
                            item.name
                          ),
                          item.blob
                            ? h(
                                "div",
                                { className: "text-[11px] text-muted mt-1 flex flex-wrap items-center gap-1.5 font-mono" },
                                [
                                  formatBytes(item.originalSize),
                                  "→",
                                  formatBytes(item.blob.size),
                                  item.unchanged
                                    ? h(
                                        "span",
                                        { className: "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20" },
                                        "Already optimized"
                                      )
                                    : h(
                                        "span",
                                        { className: "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" },
                                        percentSaved.toFixed(0) + "% smaller"
                                      ),
                                  "•",
                                  item.width + " × " + item.height
                                ]
                              )
                            : h(
                                "div",
                                { className: "text-[11px] text-rose-600 mt-1 font-bold" },
                                item.error || "Compression failed."
                              )
                        ]
                      )
                    ]
                  ),
                  h(
                    "div",
                    { className: "flex items-center gap-2 w-full sm:w-auto justify-end shrink-0" },
                    [
                      item.blob &&
                        h(
                          "button",
                          {
                            type: "button",
                            onClick: function () {
                              downloadBlob(
                                item.blob,
                                safeFileName(item.name, format)
                              );
                            },
                            className: "h-9 px-3.5 rounded-xl border border-line bg-surface text-ink text-[11px] font-black uppercase tracking-wider hover:border-brand flex items-center gap-1.5 cursor-pointer shadow-sm",
                          },
                          [h(Download, { className: "w-3.5 h-3.5 shrink-0" }), "Download"]
                        ),
                      h(
                        "button",
                        {
                          type: "button",
                          onClick: function () {
                            removeFile(index);
                          },
                          className: "h-9 px-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-black uppercase tracking-wider hover:bg-rose-500/20 flex items-center gap-1.5 cursor-pointer shadow-sm",
                        },
                        [h(Trash2, { className: "w-3.5 h-3.5 shrink-0" }), "Remove"]
                      )
                    ]
                  )
                ]
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-muted text-xs font-bold bg-surface rounded-xl border border-line">
            Select one or more images to see their details here before compression.
          </div>
        )}

        {/* Privacy Footer */}
        <div className="p-4 rounded-xl bg-surface border border-line text-xs text-muted leading-relaxed flex items-start gap-2.5 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Privacy friendly: all processing happens directly inside your browser. No image is uploaded to any external server.
          </span>
        </div>

      </div>
    </div>
  );
}