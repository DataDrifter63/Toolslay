"use client";

import React, { useRef, useState } from "react";
import { 
  FileImage, Download, Trash2, Sliders, ShieldCheck, 
  CheckCircle2, AlertCircle, Plus, ArrowUp, ArrowDown, X, Layers
} from "lucide-react";

function formatBytes(bytes) {
  if (!bytes) return "0 KB";

  var units = ["B", "KB", "MB", "GB"];
  var index = 0;
  var size = bytes;

  while (size >= 1024 && index < units.length - 1) {
    size = size / 1024;
    index += 1;
  }

  return size.toFixed(index === 0 ? 0 : 1) + " " + units[index];
}

function makeId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );
}

function loadImageAsDataUrl(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();

    reader.onload = function () {
      var source = reader.result;

      if (typeof source !== "string") {
        reject(new Error("Could not read image."));
        return;
      }

      var image = new Image();

      image.onload = function () {
        resolve({
          src: source,
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
          type: file.type || "image/jpeg",
        });
      };

      image.onerror = function () {
        reject(new Error("Could not decode image."));
      };

      image.src = source;
    };

    reader.onerror = function () {
      reject(new Error("Could not read the selected file."));
    };

    reader.readAsDataURL(file);
  });
}

function getImageFormat(type, dataUrl) {
  var value = String(type || "").toLowerCase();

  if (value.indexOf("png") !== -1) {
    return "PNG";
  }

  if (value.indexOf("webp") !== -1) {
    return "WEBP";
  }

  if (value.indexOf("gif") !== -1) {
    return "GIF";
  }

  if (value.indexOf("jpeg") !== -1 || value.indexOf("jpg") !== -1) {
    return "JPEG";
  }

  var source = String(dataUrl || "").toLowerCase();

  if (source.indexOf("image/png") !== -1) {
    return "PNG";
  }

  if (source.indexOf("image/webp") !== -1) {
    return "WEBP";
  }

  return "JPEG";
}

function getPageSize(format) {
  if (format === "letter") {
    return {
      width: 215.9,
      height: 279.4,
    };
  }

  return {
    width: 210,
    height: 297,
  };
}

function calculateImageBox(
  imageWidth,
  imageHeight,
  pageWidth,
  pageHeight,
  margin,
  fitMode
) {
  var availableWidth = pageWidth - margin * 2;
  var availableHeight = pageHeight - margin * 2;

  if (availableWidth <= 0 || availableHeight <= 0) {
    return {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    };
  }

  if (fitMode === "fill") {
    return {
      x: margin,
      y: margin,
      width: availableWidth,
      height: availableHeight,
    };
  }

  var imageRatio =
    imageWidth > 0 && imageHeight > 0
      ? imageWidth / imageHeight
      : 1;

  var areaRatio =
    availableWidth / availableHeight;

  var width;
  var height;

  if (imageRatio > areaRatio) {
    width = availableWidth;
    height = width / imageRatio;
  } else {
    height = availableHeight;
    width = height * imageRatio;
  }

  return {
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
    width: width,
    height: height,
  };
}

export default function ImageToPDFConverter() {
  var inputRef = useRef(null);

  var [images, setImages] = useState([]);
  var [dragging, setDragging] = useState(false);
  var [generating, setGenerating] = useState(false);
  var [message, setMessage] = useState("");
  var [error, setError] = useState("");

  var [pageFormat, setPageFormat] = useState("a4");
  var [orientation, setOrientation] = useState("auto");
  var [fitMode, setFitMode] = useState("contain");
  var [margin, setMargin] = useState("8");
  var [quality, setQuality] = useState("0.92");
  var [filename, setFilename] = useState("converted-images");

  function openFilePicker() {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  async function processFiles(fileList) {
    var files = Array.from(fileList || []);

    if (!files.length) {
      return;
    }

    setError("");
    setMessage("");

    var validFiles = files.filter(function (file) {
      return (
        file &&
        typeof file.type === "string" &&
        file.type.indexOf("image/") === 0
      );
    });

    if (!validFiles.length) {
      setError(
        "Please select valid image files such as JPG, PNG or WebP."
      );
      return;
    }

    var newImages = [];

    for (var i = 0; i < validFiles.length; i += 1) {
      var file = validFiles[i];

      try {
        var loaded = await loadImageAsDataUrl(file);

        newImages.push({
          id: makeId() + "-" + i,
          name: file.name,
          size: file.size,
          type: file.type,
          src: loaded.src,
          width: loaded.width,
          height: loaded.height,
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (!newImages.length) {
      setError(
        "The selected images could not be processed."
      );
      return;
    }

    setImages(function (current) {
      return current.concat(newImages);
    });

    setMessage(
      newImages.length === 1
        ? "Image added successfully."
        : newImages.length + " images added successfully."
    );

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleInputChange(event) {
    processFiles(event.target.files);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragging(false);

    if (event.dataTransfer && event.dataTransfer.files) {
      processFiles(event.dataTransfer.files);
    }
  }

  function removeImage(id) {
    setImages(function (current) {
      return current.filter(function (item) {
        return item.id !== id;
      });
    });

    setMessage("");
    setError("");
  }

  function clearAll() {
    setImages([]);
    setMessage("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function moveImage(index, direction) {
    setImages(function (current) {
      var next = current.slice();
      var newIndex = index + direction;

      if (
        newIndex < 0 ||
        newIndex >= next.length
      ) {
        return next;
      }

      var temp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = temp;

      return next;
    });
  }

  async function createPDF() {
    if (!images.length) {
      setError(
        "Please add at least one image before creating the PDF."
      );
      return;
    }

    setGenerating(true);
    setError("");
    setMessage("");

    try {
      var jsPdfModule = await import("jspdf");

      var JsPDF =
        jsPdfModule.jsPDF ||
        jsPdfModule.default ||
        jsPdfModule;

      if (!JsPDF) {
        throw new Error(
          "jsPDF could not be loaded."
        );
      }

      var firstImage = images[0];
      var firstOrientation;

      if (orientation === "auto") {
        firstOrientation =
          firstImage.width > firstImage.height
            ? "landscape"
            : "portrait";
      } else {
        firstOrientation = orientation;
      }

      var firstPageSize = getPageSize(pageFormat);

      var firstPageWidth =
        firstOrientation === "landscape"
          ? firstPageSize.height
          : firstPageSize.width;

      var firstPageHeight =
        firstOrientation === "landscape"
          ? firstPageSize.width
          : firstPageSize.height;

      var pdf = new JsPDF({
        orientation: firstOrientation,
        unit: "mm",
        format: pageFormat,
        compress: true,
      });

      for (var i = 0; i < images.length; i += 1) {
        var item = images[i];

        if (i > 0) {
          var currentOrientation;

          if (orientation === "auto") {
            currentOrientation =
              item.width > item.height
                ? "landscape"
                : "portrait";
          } else {
            currentOrientation = orientation;
          }

          pdf.addPage(
            pageFormat,
            currentOrientation
          );
        }

        var currentOrientationForPage;

        if (orientation === "auto") {
          currentOrientationForPage =
            item.width > item.height
              ? "landscape"
              : "portrait";
        } else {
          currentOrientationForPage = orientation;
        }

        var basePageSize = getPageSize(pageFormat);

        var pageWidth =
          currentOrientationForPage === "landscape"
            ? basePageSize.height
            : basePageSize.width;

        var pageHeight =
          currentOrientationForPage === "landscape"
            ? basePageSize.width
            : basePageSize.height;

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        var imageBox = calculateImageBox(
          item.width,
          item.height,
          pageWidth,
          pageHeight,
          Number(margin) || 0,
          fitMode
        );

        var format = getImageFormat(item.type, item.src);

        var imageSource = item.src;
        var imageFormat = format;

        if (format === "WEBP" || format === "GIF") {
          imageSource = await convertImageToJpeg(
            item.src,
            Number(quality)
          );
          imageFormat = "JPEG";
        }

        pdf.addImage(
          imageSource,
          imageFormat,
          imageBox.x,
          imageBox.y,
          imageBox.width,
          imageBox.height,
          undefined,
          "FAST"
        );
      }

      var safeName =
        String(filename || "converted-images")
          .trim()
          .replace(/[^a-zA-Z0-9-_]+/g, "-")
          .replace(/^-+|-+$/g, "") || "converted-images";

      pdf.save(safeName + ".pdf");

      setMessage(
        images.length === 1
          ? "PDF created successfully."
          : images.length + " images converted into one PDF successfully."
      );
    } catch (err) {
      console.error("PDF generation error:", err);
      setError(
        "PDF could not be generated. Please make sure jsPDF is installed and try again."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function convertImageToJpeg(source, imageQuality) {
    return new Promise(function (resolve, reject) {
      var image = new Image();

      image.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;

        var context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Canvas is not supported."));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        try {
          resolve(
            canvas.toDataURL("image/jpeg", imageQuality || 0.92)
          );
        } catch (err) {
          reject(err);
        }
      };

      image.onerror = function () {
        reject(new Error("Could not load image."));
      };

      image.src = source;
    });
  }

  var totalSize = images.reduce(function (total, item) {
    return total + item.size;
  }, 0);

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
              Image to PDF Converter
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 whitespace-normal leading-relaxed">
              Convert JPG, PNG, and WebP images into a professional PDF locally.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface border border-line text-brand text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 100% Browser Based
        </div>
      </div>

      <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6">
          
          {/* UPLOAD & LIST PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                Your Images
              </h3>
              <p className="text-[10px] text-muted mt-0.5">
                Upload one or multiple images to convert them into individual PDF pages.
              </p>
            </div>

            <input
              ref={inputRef}
              className="hidden"
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
            />

            <div
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                dragging ? "border-brand bg-paper" : "border-line bg-paper hover:border-brand"
              }`}
              onClick={openFilePicker}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-surface border border-line flex items-center justify-center text-brand shadow-sm">
                <Plus className="w-6 h-6 shrink-0" />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-ink tracking-tight">
                Drop your images here
              </h4>
              <p className="text-[10px] text-muted mt-1">
                Upload one or multiple images. They will become individual PDF pages.
              </p>
              <span className="inline-flex items-center justify-center h-9 px-4 mt-3 rounded-xl bg-brand text-surface text-xs font-black uppercase tracking-wider shadow-sm">
                Choose Images
              </span>
            </div>

            {images.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {images.map(function (item, index) {
                  return (
                    <div
                      className="grid grid-cols-[56px_minmax(0,1fr)_auto] sm:grid-cols-[64px_minmax(0,1fr)_auto] gap-3 items-center p-2.5 border border-line rounded-xl bg-paper shadow-sm"
                      key={item.id}
                    >
                      <div className="w-14 h-12 sm:w-16 sm:h-13 overflow-hidden rounded-lg bg-surface border border-line shrink-0">
                        <img
                          src={item.src}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-black text-ink truncate">
                          {index + 1}. {item.name}
                        </div>
                        <div className="text-[10px] text-muted font-mono mt-0.5">
                          {item.width} × {item.height} · {formatBytes(item.size)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg border border-line bg-surface text-ink text-xs font-black hover:border-brand flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-40"
                          title="Move up"
                          onClick={() => moveImage(index, -1)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg border border-line bg-surface text-ink text-xs font-black hover:border-brand flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-40"
                          title="Move down"
                          onClick={() => moveImage(index, 1)}
                          disabled={index === images.length - 1}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg border border-line bg-surface text-rose-600 dark:text-rose-400 text-xs font-black hover:bg-rose-500/10 flex items-center justify-center cursor-pointer shadow-sm"
                          title="Remove"
                          onClick={() => removeImage(item.id)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted border border-line rounded-xl bg-paper">
                No images added yet.
              </div>
            )}
          </div>

          {/* SETTINGS PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                PDF Settings
              </h3>
              <p className="text-[10px] text-muted mt-0.5">
                Customize the output before creating your PDF.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Page size
                </label>
                <select
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                  value={pageFormat}
                  onChange={(e) => setPageFormat(e.target.value)}
                >
                  <option value="a4">A4 — 210 × 297 mm</option>
                  <option value="letter">Letter — 8.5 × 11 in</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["auto", "portrait", "landscape"].map((orient) => (
                    <button
                      key={orient}
                      type="button"
                      onClick={() => setOrientation(orient)}
                      className={`h-9 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                        orientation === orient
                          ? "border-brand bg-brand text-surface"
                          : "border-line bg-paper text-ink hover:border-brand"
                      }`}
                    >
                      {orient}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Image fitting
                </label>
                <select
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                  value={fitMode}
                  onChange={(e) => setFitMode(e.target.value)}
                >
                  <option value="contain">Fit image — no cropping</option>
                  <option value="fill">Fill page — may stretch image</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Page margin
                </label>
                <select
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                >
                  <option value="0">None — 0 mm</option>
                  <option value="5">Small — 5 mm</option>
                  <option value="8">Standard — 8 mm</option>
                  <option value="12">Large — 12 mm</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-muted">
                  <span>JPEG quality</span>
                  <span className="font-mono text-brand">{Math.round(Number(quality) * 100)}%</span>
                </div>
                <input
                  className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.01"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  PDF filename
                </label>                
                <input
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none"
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="converted-images"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-line">
              <button
                type="button"
                className="w-full h-11 rounded-xl bg-brand text-surface font-black text-xs uppercase tracking-wider shadow-sm hover:opacity-90 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!images.length || generating}
                onClick={createPDF}
              >
                <Download className="w-4 h-4 shrink-0" />
                {generating ? "Creating PDF..." : "Create & Download PDF"}
              </button>

              <button
                type="button"
                className="w-full h-10 rounded-xl border border-line bg-paper text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider hover:bg-rose-500/10 cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!images.length}
                onClick={clearAll}
              >
                <Trash2 className="w-4 h-4 shrink-0" /> Clear All Images
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

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-line">
              <div className="p-3 bg-paper border border-line rounded-xl shadow-inner text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Images</span>
                <strong className="text-base font-black text-ink font-mono mt-0.5 block">{images.length}</strong>
              </div>
              <div className="p-3 bg-paper border border-line rounded-xl shadow-inner text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted block">Total Size</span>
                <strong className="text-base font-black text-brand font-mono mt-0.5 block">{formatBytes(totalSize)}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-paper border border-line text-xs text-muted leading-relaxed flex items-center gap-2.5 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Your images are processed locally in your browser. Nothing is uploaded to a server.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
