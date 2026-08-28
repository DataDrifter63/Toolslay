"use client";

import React, { useRef, useState } from "react";

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

  var [pageFormat, setPageFormat] =
    useState("a4");

  var [orientation, setOrientation] =
    useState("auto");

  var [fitMode, setFitMode] =
    useState("contain");

  var [margin, setMargin] =
    useState("8");

  var [quality, setQuality] =
    useState("0.92");

  var [filename, setFilename] =
    useState("converted-images");

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
      /*
       * IMPORTANT:
       * jsPDF is loaded only in the browser.
       * This prevents Next.js server-side module issues.
       */
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

      var firstPageSize =
        getPageSize(pageFormat);

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
          currentOrientationForPage =
            orientation;
        }

        var basePageSize =
          getPageSize(pageFormat);

        var pageWidth =
          currentOrientationForPage ===
          "landscape"
            ? basePageSize.height
            : basePageSize.width;

        var pageHeight =
          currentOrientationForPage ===
          "landscape"
            ? basePageSize.width
            : basePageSize.height;

        /*
         * White page background.
         */
        pdf.setFillColor(
          255,
          255,
          255
        );

        pdf.rect(
          0,
          0,
          pageWidth,
          pageHeight,
          "F"
        );

        var imageBox =
          calculateImageBox(
            item.width,
            item.height,
            pageWidth,
            pageHeight,
            Number(margin) || 0,
            fitMode
          );

        var format =
          getImageFormat(
            item.type,
            item.src
          );

        /*
         * WEBP can be problematic in some jsPDF
         * versions. Convert it to JPEG through
         * a canvas before adding it.
         */
        var imageSource = item.src;
        var imageFormat = format;

        if (
          format === "WEBP" ||
          format === "GIF"
        ) {
          imageSource =
            await convertImageToJpeg(
              item.src,
              Number(quality)
            );

          imageFormat = "JPEG";
        }

        /*
         * THE IMPORTANT PART:
         * imageSource is already a loaded Data URL.
         * jsPDF receives the actual image data.
         */
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
          .replace(
            /[^a-zA-Z0-9-_]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          ) || "converted-images";

      pdf.save(
        safeName + ".pdf"
      );

      setMessage(
        images.length === 1
          ? "PDF created successfully."
          : images.length +
              " images converted into one PDF successfully."
      );
    } catch (err) {
      console.error(
        "PDF generation error:",
        err
      );

      setError(
        "PDF could not be generated. Please make sure jsPDF is installed and try again."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function convertImageToJpeg(
    source,
    imageQuality
  ) {
    return new Promise(function (
      resolve,
      reject
    ) {
      var image = new Image();

      image.onload = function () {
        var canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          image.naturalWidth ||
          image.width;

        canvas.height =
          image.naturalHeight ||
          image.height;

        var context =
          canvas.getContext("2d");

        if (!context) {
          reject(
            new Error(
              "Canvas is not supported."
            )
          );
          return;
        }

        context.fillStyle = "#ffffff";

        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        try {
          resolve(
            canvas.toDataURL(
              "image/jpeg",
              imageQuality || 0.92
            )
          );
        } catch (err) {
          reject(err);
        }
      };

      image.onerror = function () {
        reject(
          new Error(
            "Could not load image."
          )
        );
      };

      image.src = source;
    });
  }

  var totalSize = images.reduce(
    function (total, item) {
      return total + item.size;
    },
    0
  );

  var styles = `
    .itp-tool {
      --itp-text: #172033;
      --itp-muted: #667085;
      --itp-border: #e4e7ec;
      --itp-card: #ffffff;
      --itp-soft: #f7f8fb;
      --itp-primary: #635bff;
      --itp-primary-soft: #f0efff;
      --itp-danger: #d92d20;

      width: 100%;
      color: var(--itp-text);
      font-family: inherit;
      box-sizing: border-box;
    }

    .itp-tool *,
    .itp-tool *::before,
    .itp-tool *::after {
      box-sizing: border-box;
    }

    .itp-wrapper {
      width: 100%;
      max-width: 1180px;
      margin: 0 auto;
    }

    .itp-header {
      margin-bottom: 22px;
    }

    .itp-eyebrow {
      color: var(--itp-primary);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .14em;
      text-transform: uppercase;
    }

    .itp-header h1 {
      margin: 6px 0 0;
      font-size: clamp(28px, 4vw, 42px);
      line-height: 1.05;
      letter-spacing: -.045em;
    }

    .itp-header p {
      max-width: 680px;
      margin: 10px 0 0;
      color: var(--itp-muted);
      font-size: 13px;
      line-height: 1.65;
    }

    .itp-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(300px, .75fr);
      gap: 18px;
      align-items: start;
    }

    .itp-panel {
      border: 1px solid var(--itp-border);
      border-radius: 17px;
      background: var(--itp-card);
      box-shadow: 0 8px 30px rgba(16,24,40,.035);
    }

    .itp-upload-panel {
      padding: 18px;
    }

    .itp-dropzone {
      min-height: 235px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 25px;
      border: 1.5px dashed #c9ced8;
      border-radius: 14px;
      background: #fbfcfe;
      text-align: center;
      cursor: pointer;
      transition: border-color .2s ease, background .2s ease, transform .2s ease;
    }

    .itp-dropzone:hover,
    .itp-dropzone.dragging {
      border-color: var(--itp-primary);
      background: var(--itp-primary-soft);
    }

    .itp-dropzone.dragging {
      transform: scale(1.005);
    }

    .itp-upload-icon {
      width: 54px;
      height: 54px;
      margin: 0 auto 13px;
      display: grid;
      place-items: center;
      border-radius: 15px;
      background: var(--itp-primary-soft);
      color: var(--itp-primary);
      font-size: 24px;
    }

    .itp-dropzone h2 {
      margin: 0;
      font-size: 17px;
      letter-spacing: -.025em;
    }

    .itp-dropzone p {
      margin: 7px 0 14px;
      color: var(--itp-muted);
      font-size: 11px;
      line-height: 1.6;
    }

    .itp-browse {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      padding: 0 15px;
      border-radius: 9px;
      background: var(--itp-primary);
      color: #fff;
      font-size: 11px;
      font-weight: 750;
    }

    .itp-hidden {
      display: none;
    }

    .itp-list {
      display: grid;
      gap: 9px;
      margin-top: 14px;
    }

    .itp-image-item {
      display: grid;
      grid-template-columns: 64px minmax(0,1fr) auto;
      gap: 11px;
      align-items: center;
      padding: 9px;
      border: 1px solid var(--itp-border);
      border-radius: 11px;
      background: var(--itp-soft);
    }

    .itp-thumb {
      width: 64px;
      height: 54px;
      overflow: hidden;
      border-radius: 7px;
      background: #fff;
      border: 1px solid var(--itp-border);
    }

    .itp-thumb img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }

    .itp-file-name {
      min-width: 0;
      font-size: 11px;
      font-weight: 750;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .itp-file-meta {
      margin-top: 4px;
      color: var(--itp-muted);
      font-size: 9px;
    }

    .itp-actions {
      display: flex;
      gap: 5px;
    }

    .itp-small-button {
      width: 29px;
      height: 29px;
      display: grid;
      place-items: center;
      border: 1px solid var(--itp-border);
      border-radius: 7px;
      background: #fff;
      color: var(--itp-text);
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }

    .itp-small-button:hover {
      border-color: var(--itp-primary);
      color: var(--itp-primary);
    }

    .itp-small-button.danger:hover {
      border-color: #f04438;
      color: var(--itp-danger);
    }

    .itp-empty-list {
      margin-top: 13px;
      color: var(--itp-muted);
      text-align: center;
      font-size: 10px;
    }

    .itp-settings {
      padding: 19px;
    }

    .itp-settings-title {
      font-size: 17px;
      font-weight: 800;
      letter-spacing: -.025em;
    }

    .itp-settings-description {
      margin-top: 5px;
      color: var(--itp-muted);
      font-size: 10px;
      line-height: 1.6;
    }

    .itp-field {
      margin-top: 16px;
    }

    .itp-field label {
      display: block;
      margin-bottom: 7px;
      font-size: 10px;
      font-weight: 750;
    }

    .itp-select,
    .itp-text-input {
      width: 100%;
      height: 41px;
      padding: 0 10px;
      border: 1px solid var(--itp-border);
      border-radius: 8px;
      outline: none;
      background: #fff;
      color: var(--itp-text);
      font: inherit;
      font-size: 11px;
    }

    .itp-select:focus,
    .itp-text-input:focus {
      border-color: var(--itp-primary);
      box-shadow: 0 0 0 3px rgba(99,91,255,.09);
    }

    .itp-segmented {
      display: grid;
      grid-template-columns: repeat(3,1fr);
      gap: 5px;
      padding: 4px;
      border: 1px solid var(--itp-border);
      border-radius: 9px;
      background: var(--itp-soft);
    }

    .itp-segmented button {
      height: 32px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--itp-muted);
      cursor: pointer;
      font: inherit;
      font-size: 9px;
      font-weight: 750;
    }

    .itp-segmented button.active {
      background: #fff;
      color: var(--itp-text);
      box-shadow: 0 1px 4px rgba(16,24,40,.08);
    }

    .itp-range-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .itp-range {
      flex: 1;
      accent-color: var(--itp-primary);
    }

    .itp-range-value {
      width: 45px;
      text-align: right;
      color: var(--itp-muted);
      font-size: 10px;
      font-weight: 700;
    }

    .itp-generate {
      width: 100%;
      min-height: 46px;
      margin-top: 20px;
      border: 0;
      border-radius: 10px;
      background: var(--itp-primary);
      color: #fff;
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 7px 18px rgba(99,91,255,.18);
    }

    .itp-generate:hover {
      filter: brightness(.97);
    }

    .itp-generate:disabled {
      opacity: .5;
      cursor: not-allowed;
      box-shadow: none;
    }

    .itp-clear {
      width: 100%;
      min-height: 38px;
      margin-top: 8px;
      border: 1px solid var(--itp-border);
      border-radius: 9px;
      background: transparent;
      color: var(--itp-muted);
      cursor: pointer;
      font: inherit;
      font-size: 10px;
      font-weight: 700;
    }

    .itp-clear:hover {
      color: var(--itp-danger);
      border-color: #f04438;
    }

    .itp-status {
      margin-top: 11px;
      padding: 9px 10px;
      border-radius: 8px;
      background: #ecfdf3;
      color: #067647;
      font-size: 9px;
      line-height: 1.5;
    }

    .itp-error {
      margin-top: 11px;
      padding: 9px 10px;
      border-radius: 8px;
      background: #fff1f3;
      color: var(--itp-danger);
      font-size: 9px;
      line-height: 1.5;
    }

    .itp-summary {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid var(--itp-border);
    }

    .itp-summary div {
      min-width: 0;
    }

    .itp-summary span {
      display: block;
      color: var(--itp-muted);
      font-size: 8px;
    }

    .itp-summary strong {
      display: block;
      margin-top: 3px;
      font-size: 14px;
    }

    .itp-privacy {
      margin-top: 13px;
      color: var(--itp-muted);
      font-size: 8px;
      line-height: 1.5;
      text-align: center;
    }

    @media (max-width: 850px) {
      .itp-layout {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 550px) {
      .itp-upload-panel,
      .itp-settings {
        padding: 14px;
      }

      .itp-dropzone {
        min-height: 210px;
        padding: 18px;
      }

      .itp-image-item {
        grid-template-columns: 54px minmax(0,1fr);
      }

      .itp-thumb {
        width: 54px;
        height: 48px;
      }

      .itp-actions {
        grid-column: 2;
      }

      .itp-actions .itp-small-button {
        flex: 1;
      }
    }
  `;

  return (
    <>
      <div className="itp-tool">
        <div className="itp-wrapper">

          <div className="itp-header">
            <div className="itp-eyebrow">
              DOCUMENT & FILE TOOL
            </div>

            <h1>
              Image to PDF Converter
            </h1>

            <p>
              Convert JPG, PNG and WebP images into a
              professional PDF. Combine multiple images,
              reorder pages, choose paper size, orientation,
              margins and image quality.
            </p>
          </div>

          <div className="itp-layout">

            <div className="itp-panel itp-upload-panel">

              <input
                ref={inputRef}
                className="itp-hidden"
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
              />

              <div
                className={
                  dragging
                    ? "itp-dropzone dragging"
                    : "itp-dropzone"
                }
                onClick={openFilePicker}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
              >
                <div>
                  <div className="itp-upload-icon">
                    ↑
                  </div>

                  <h2>
                    Drop your images here
                  </h2>

                  <p>
                    Upload one or multiple images.
                    They will become individual PDF pages.
                  </p>

                  <span className="itp-browse">
                    Choose Images
                  </span>
                </div>
              </div>

              {images.length > 0 ? (
                <div className="itp-list">
                  {images.map(function (
                    item,
                    index
                  ) {
                    return (
                      <div
                        className="itp-image-item"
                        key={item.id}
                      >
                        <div className="itp-thumb">
                          <img
                            src={item.src}
                            alt={item.name}
                          />
                        </div>

                        <div>
                          <div className="itp-file-name">
                            {index + 1}. {item.name}
                          </div>

                          <div className="itp-file-meta">
                            {item.width} × {item.height}
                            {" • "}
                            {formatBytes(item.size)}
                          </div>
                        </div>

                        <div className="itp-actions">

                          <button
                            type="button"
                            className="itp-small-button"
                            title="Move up"
                            onClick={function () {
                              moveImage(
                                index,
                                -1
                              );
                            }}
                            disabled={index === 0}
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            className="itp-small-button"
                            title="Move down"
                            onClick={function () {
                              moveImage(
                                index,
                                1
                              );
                            }}
                            disabled={
                              index ===
                              images.length - 1
                            }
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            className="itp-small-button danger"
                            title="Remove"
                            onClick={function () {
                              removeImage(
                                item.id
                              );
                            }}
                          >
                            ×
                          </button>

                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="itp-empty-list">
                  No images added yet.
                </div>
              )}

            </div>

            <div className="itp-panel itp-settings">

              <div className="itp-settings-title">
                PDF Settings
              </div>

              <div className="itp-settings-description">
                Customize the output before creating
                your PDF.
              </div>

              <div className="itp-field">
                <label>
                  Page size
                </label>

                <select
                  className="itp-select"
                  value={pageFormat}
                  onChange={function (event) {
                    setPageFormat(
                      event.target.value
                    );
                  }}
                >
                  <option value="a4">
                    A4 — 210 × 297 mm
                  </option>

                  <option value="letter">
                    Letter — 8.5 × 11 in
                  </option>
                </select>
              </div>

              <div className="itp-field">
                <label>
                  Orientation
                </label>

                <div className="itp-segmented">
                  <button
                    type="button"
                    className={
                      orientation === "auto"
                        ? "active"
                        : ""
                    }
                    onClick={function () {
                      setOrientation("auto");
                    }}
                  >
                    Auto
                  </button>

                  <button
                    type="button"
                    className={
                      orientation === "portrait"
                        ? "active"
                        : ""
                    }
                    onClick={function () {
                      setOrientation(
                        "portrait"
                      );
                    }}
                  >
                    Portrait
                  </button>

                  <button
                    type="button"
                    className={
                      orientation === "landscape"
                        ? "active"
                        : ""
                    }
                    onClick={function () {
                      setOrientation(
                        "landscape"
                      );
                    }}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div className="itp-field">
                <label>
                  Image fitting
                </label>

                <select
                  className="itp-select"
                  value={fitMode}
                  onChange={function (event) {
                    setFitMode(
                      event.target.value
                    );
                  }}
                >
                  <option value="contain">
                    Fit image — no cropping
                  </option>

                  <option value="fill">
                    Fill page — may stretch image
                  </option>
                </select>
              </div>

              <div className="itp-field">
                <label>
                  Page margin
                </label>

                <select
                  className="itp-select"
                  value={margin}
                  onChange={function (event) {
                    setMargin(
                      event.target.value
                    );
                  }}
                >
                  <option value="0">
                    None — 0 mm
                  </option>

                  <option value="5">
                    Small — 5 mm
                  </option>

                  <option value="8">
                    Standard — 8 mm
                  </option>

                  <option value="12">
                    Large — 12 mm
                  </option>
                </select>
              </div>

              <div className="itp-field">
                <label>
                  JPEG quality
                </label>

                <div className="itp-range-wrap">
                  <input
                    className="itp-range"
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

                  <div className="itp-range-value">
                    {Math.round(
                      Number(quality) * 100
                    )}
                    %
                  </div>
                </div>
              </div>

              <div className="itp-field">
                <label>
                  PDF filename
                </label>

                <input
                  className="itp-text-input"
                  type="text"
                  value={filename}
                  onChange={function (event) {
                    setFilename(
                      event.target.value
                    );
                  }}
                  placeholder="converted-images"
                />
              </div>

              <button
                type="button"
                className="itp-generate"
                disabled={
                  !images.length ||
                  generating
                }
                onClick={createPDF}
              >
                {generating
                  ? "Creating PDF..."
                  : "Create & Download PDF"}
              </button>

              <button
                type="button"
                className="itp-clear"
                disabled={!images.length}
                onClick={clearAll}
              >
                Clear All Images
              </button>

              {message ? (
                <div className="itp-status">
                  ✓ {message}
                </div>
              ) : null}

              {error ? (
                <div className="itp-error">
                  {error}
                </div>
              ) : null}

              <div className="itp-summary">
                <div>
                  <span>
                    IMAGES
                  </span>

                  <strong>
                    {images.length}
                  </strong>
                </div>

                <div>
                  <span>
                    TOTAL SIZE
                  </span>

                  <strong>
                    {formatBytes(totalSize)}
                  </strong>
                </div>
              </div>

              <div className="itp-privacy">
                🔒 Your images are processed locally
                in your browser. Nothing is uploaded
                to a server.
              </div>

            </div>

          </div>

        </div>
      </div>

      <style>
        {styles}
      </style>
    </>
  );
}