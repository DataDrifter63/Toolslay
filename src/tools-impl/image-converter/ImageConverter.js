"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const FORMAT_OPTIONS = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

function formatBytes(bytes) {
  if (!bytes || bytes < 1) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
}

function getFileNameWithoutExtension(name) {
  return name.replace(/\.[^/.]+$/, "");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function ImageConverter() {
  const inputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [outputFormat, setOutputFormat] = useState("image/webp");
  const [quality, setQuality] = useState(88);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [keepAspect, setKeepAspect] = useState(true);

  const [imageInfo, setImageInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [result, setResult] = useState(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const resetResult = () => {
    setResult(null);
    setStatus("");
    setError("");
  };

  const processSelectedFile = useCallback((selectedFile) => {
    resetResult();

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const maxFileSize = 50 * 1024 * 1024;

    if (selectedFile.size > maxFileSize) {
      setError("Image is too large. Maximum supported size is 50 MB.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    objectUrlRef.current = objectUrl;

    setFile(selectedFile);
    setPreviewUrl(objectUrl);
    setStatus("Image selected successfully.");

    const img = new Image();

    img.onload = () => {
      setImageInfo({
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: selectedFile.type || "Unknown",
        size: selectedFile.size,
      });

      if (resizeEnabled) {
        setMaxWidth((current) =>
          current > img.naturalWidth ? img.naturalWidth : current
        );

        setMaxHeight((current) =>
          current > img.naturalHeight ? img.naturalHeight : current
        );
      }
    };

    img.onerror = () => {
      setError("This image could not be read by your browser.");
    };

    img.src = objectUrl;
  }, [resizeEnabled]);

  const handleFileInput = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      processSelectedFile(selectedFile);
    }

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  const calculateDimensions = (originalWidth, originalHeight) => {
    if (!resizeEnabled) {
      return {
        width: originalWidth,
        height: originalHeight,
      };
    }

    const targetWidth = Math.max(1, Number(maxWidth) || originalWidth);
    const targetHeight = Math.max(1, Number(maxHeight) || originalHeight);

    if (!keepAspect) {
      return {
        width: Math.round(targetWidth),
        height: Math.round(targetHeight),
      };
    }

    const scale = Math.min(
      targetWidth / originalWidth,
      targetHeight / originalHeight,
      1
    );

    return {
      width: Math.max(1, Math.round(originalWidth * scale)),
      height: Math.max(1, Math.round(originalHeight * scale)),
    };
  };

  const convertImage = async () => {
    if (!file || !previewUrl) {
      setError("Please select an image first.");
      return;
    }

    setError("");
    setStatus("");
    setResult(null);
    setIsConverting(true);

    try {
      const image = new Image();

      image.decoding = "async";

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Unable to load image."));
        image.src = previewUrl;
      });

      const dimensions = calculateDimensions(
        image.naturalWidth,
        image.naturalHeight
      );

      const canvas = document.createElement("canvas");

      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      const ctx = canvas.getContext("2d", {
        alpha: outputFormat !== "image/jpeg",
      });

      if (!ctx) {
        throw new Error("Your browser does not support canvas conversion.");
      }

      /*
       * JPEG doesn't support transparency.
       * Fill with white before drawing so transparent images
       * don't turn black unexpectedly.
       */
      if (outputFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        0,
        0,
        dimensions.width,
        dimensions.height
      );

      const qualityValue =
        outputFormat === "image/png"
          ? undefined
          : Math.min(1, Math.max(0.1, quality / 100));

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (convertedBlob) => {
            if (!convertedBlob) {
              reject(new Error("Browser failed to create the converted image."));
              return;
            }

            resolve(convertedBlob);
          },
          outputFormat,
          qualityValue
        );
      });

      const selectedFormat = FORMAT_OPTIONS.find(
        (item) => item.value === outputFormat
      );

      const extension = selectedFormat?.ext || "webp";

      const originalName = getFileNameWithoutExtension(file.name);

      const filename = `${originalName}-converted.${extension}`;

      const savedResult = {
        blob,
        filename,
        size: blob.size,
        width: dimensions.width,
        height: dimensions.height,
        format: selectedFormat?.label || "Image",
        originalSize: file.size,
      };

      setResult(savedResult);

      /*
       * Automatic download immediately after successful conversion.
       */
      downloadBlob(blob, filename);

      const reduction =
        file.size > 0
          ? Math.round((1 - blob.size / file.size) * 100)
          : 0;

      if (reduction > 0) {
        setStatus(
          `Converted successfully • ${reduction}% smaller • Download started`
        );
      } else if (reduction < 0) {
        setStatus(
          `Converted successfully • ${Math.abs(
            reduction
          )}% larger • Download started`
        );
      } else {
        setStatus("Converted successfully • Download started");
      }
    } catch (conversionError) {
      console.error("Image conversion error:", conversionError);
      setError(
        conversionError?.message ||
          "Something went wrong while converting the image."
      );
    } finally {
      setIsConverting(false);
    }
  };

  const manualDownload = () => {
    if (!result?.blob) return;
    downloadBlob(result.blob, result.filename);
  };

  const removeImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setFile(null);
    setPreviewUrl("");
    setImageInfo(null);
    setResult(null);
    setStatus("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFormatChange = (event) => {
    setOutputFormat(event.target.value);
    resetResult();
  };

  const handleQualityChange = (event) => {
    setQuality(Number(event.target.value));
    resetResult();
  };

  const handleResizeToggle = () => {
    setResizeEnabled((current) => !current);
    resetResult();
  };

  return (
    <>
      <style jsx>{`
        .ic-wrap {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          padding: 24px;
          color: #111827;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .ic-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.08),
            0 4px 16px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }

        .ic-header {
          padding: 28px 30px 22px;
          border-bottom: 1px solid #eef0f3;
        }

        .ic-title {
          margin: 0;
          font-size: 28px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .ic-subtitle {
          margin: 8px 0 0;
          color: #667085;
          font-size: 14px;
          line-height: 1.6;
        }

        .ic-body {
          padding: 28px 30px 30px;
        }

        .ic-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 24px;
        }

        .ic-upload {
          min-height: 390px;
          border: 2px dashed #d8dde5;
          border-radius: 20px;
          background: #fafbfc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
          cursor: pointer;
        }

        .ic-upload:hover,
        .ic-upload.dragging {
          border-color: #111827;
          background: #f5f7fa;
        }

        .ic-upload.has-file {
          cursor: default;
          border-style: solid;
          padding: 14px;
          background: #f8fafc;
        }

        .ic-upload-content {
          width: 100%;
          text-align: center;
        }

        .ic-upload-icon {
          width: 68px;
          height: 68px;
          margin: 0 auto 18px;
          border-radius: 18px;
          background: #111827;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: 700;
        }

        .ic-upload-title {
          font-size: 18px;
          font-weight: 750;
          margin-bottom: 7px;
        }

        .ic-upload-text {
          color: #667085;
          font-size: 13px;
          margin-bottom: 18px;
        }

        .ic-browse {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 11px;
          background: #111827;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          border: 0;
          cursor: pointer;
        }

        .ic-hidden {
          display: none;
        }

        .ic-preview-wrap {
          width: 100%;
        }

        .ic-preview {
          width: 100%;
          height: 290px;
          object-fit: contain;
          display: block;
          background:
            linear-gradient(45deg, #f0f2f5 25%, transparent 25%),
            linear-gradient(-45deg, #f0f2f5 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0f2f5 75%),
            linear-gradient(-45deg, transparent 75%, #f0f2f5 75%);
          background-size: 24px 24px;
          background-position:
            0 0,
            0 12px,
            12px -12px,
            -12px 0;
          border-radius: 15px;
        }

        .ic-file-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 12px;
          text-align: left;
        }

        .ic-file-name {
          min-width: 0;
          font-size: 13px;
          font-weight: 700;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .ic-file-size {
          color: #667085;
          font-size: 12px;
          white-space: nowrap;
        }

        .ic-remove {
          border: 0;
          background: #f1f3f5;
          color: #344054;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 17px;
          flex: 0 0 auto;
        }

        .ic-settings {
          border: 1px solid #e6e8ec;
          border-radius: 20px;
          padding: 22px;
          background: #ffffff;
        }

        .ic-section-title {
          margin: 0 0 18px;
          font-size: 15px;
          font-weight: 800;
        }

        .ic-field {
          margin-bottom: 18px;
        }

        .ic-label-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .ic-label {
          font-size: 13px;
          font-weight: 700;
          color: #344054;
        }

        .ic-value {
          font-size: 12px;
          color: #667085;
          font-weight: 700;
        }

        .ic-select,
        .ic-number {
          width: 100%;
          height: 44px;
          border: 1px solid #d9dde4;
          border-radius: 10px;
          padding: 0 12px;
          background: #ffffff;
          color: #111827;
          font-size: 14px;
          outline: none;
        }

        .ic-select:focus,
        .ic-number:focus {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
        }

        .ic-range {
          width: 100%;
          accent-color: #111827;
        }

        .ic-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .ic-switch-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 13px 0;
          border-top: 1px solid #eef0f3;
        }

        .ic-switch-copy strong {
          display: block;
          font-size: 13px;
          margin-bottom: 3px;
        }

        .ic-switch-copy span {
          display: block;
          color: #667085;
          font-size: 11px;
          line-height: 1.4;
        }

        .ic-switch {
          width: 44px;
          height: 24px;
          border-radius: 100px;
          border: 0;
          background: #d8dde5;
          padding: 3px;
          cursor: pointer;
          transition: background 0.2s ease;
          flex: 0 0 auto;
        }

        .ic-switch.active {
          background: #111827;
        }

        .ic-switch-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          display: block;
          transition: transform 0.2s ease;
        }

        .ic-switch.active .ic-switch-dot {
          transform: translateX(20px);
        }

        .ic-convert {
          width: 100%;
          height: 50px;
          border: 0;
          border-radius: 12px;
          background: #111827;
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 5px;
          transition:
            transform 0.15s ease,
            opacity 0.15s ease;
        }

        .ic-convert:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .ic-convert:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .ic-status {
          margin-top: 14px;
          padding: 11px 13px;
          border-radius: 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          font-size: 12px;
          line-height: 1.5;
        }

        .ic-error {
          margin-top: 14px;
          padding: 11px 13px;
          border-radius: 10px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          color: #b42318;
          font-size: 12px;
          line-height: 1.5;
        }

        .ic-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
        }

        .ic-info-box {
          padding: 10px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #eef0f3;
        }

        .ic-info-label {
          display: block;
          color: #667085;
          font-size: 10px;
          margin-bottom: 4px;
        }

        .ic-info-value {
          display: block;
          color: #111827;
          font-size: 12px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ic-result {
          margin-top: 22px;
          border: 1px solid #e6e8ec;
          border-radius: 16px;
          padding: 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          background: #fbfcfd;
        }

        .ic-result-title {
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .ic-result-meta {
          font-size: 11px;
          color: #667085;
        }

        .ic-download {
          flex: 0 0 auto;
          min-height: 42px;
          border: 0;
          border-radius: 10px;
          padding: 0 15px;
          background: #111827;
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .ic-note {
          margin-top: 18px;
          text-align: center;
          color: #98a2b3;
          font-size: 11px;
        }

        @media (max-width: 850px) {
          .ic-grid {
            grid-template-columns: 1fr;
          }

          .ic-upload {
            min-height: 340px;
          }
        }

        @media (max-width: 520px) {
          .ic-wrap {
            padding: 12px;
          }

          .ic-header,
          .ic-body {
            padding: 20px;
          }

          .ic-title {
            font-size: 23px;
          }

          .ic-two {
            grid-template-columns: 1fr;
          }

          .ic-result {
            align-items: flex-start;
            flex-direction: column;
          }

          .ic-download {
            width: 100%;
          }
        }
      `}</style>

      <div className="ic-wrap">
        <div className="ic-card">
          <div className="ic-header">
            <h1 className="ic-title">Image Converter</h1>
            <p className="ic-subtitle">
              Convert, resize and optimize images directly in your browser.
              Your files stay on your device.
            </p>
          </div>

          <div className="ic-body">
            <div className="ic-grid">
              {/* LEFT: UPLOAD / PREVIEW */}
              <div
                className={`ic-upload ${
                  isDragging ? "dragging" : ""
                } ${file ? "has-file" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => {
                  if (!file) inputRef.current?.click();
                }}
              >
                {!file ? (
                  <div className="ic-upload-content">
                    <div className="ic-upload-icon">↗</div>

                    <div className="ic-upload-title">
                      Drop your image here
                    </div>

                    <div className="ic-upload-text">
                      PNG, JPG, JPEG, WebP, GIF and other browser-supported
                      images up to 50 MB
                    </div>

                    <button
                      type="button"
                      className="ic-browse"
                      onClick={(event) => {
                        event.stopPropagation();
                        inputRef.current?.click();
                      }}
                    >
                      Choose Image
                    </button>
                  </div>
                ) : (
                  <div className="ic-preview-wrap">
                    <img
                      src={previewUrl}
                      alt="Selected image preview"
                      className="ic-preview"
                    />

                    <div className="ic-file-row">
                      <div style={{ minWidth: 0 }}>
                        <div className="ic-file-name" title={file.name}>
                          {file.name}
                        </div>

                        <div className="ic-file-size">
                          {formatBytes(file.size)}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="ic-remove"
                        title="Remove image"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeImage();
                        }}
                      >
                        ×
                      </button>
                    </div>

                    {imageInfo && (
                      <div className="ic-info">
                        <div className="ic-info-box">
                          <span className="ic-info-label">Dimensions</span>
                          <span className="ic-info-value">
                            {imageInfo.width} × {imageInfo.height}
                          </span>
                        </div>

                        <div className="ic-info-box">
                          <span className="ic-info-label">Format</span>
                          <span className="ic-info-value">
                            {imageInfo.type.replace("image/", "").toUpperCase()}
                          </span>
                        </div>

                        <div className="ic-info-box">
                          <span className="ic-info-label">Size</span>
                          <span className="ic-info-value">
                            {formatBytes(imageInfo.size)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT: SETTINGS */}
              <div className="ic-settings">
                <h2 className="ic-section-title">Conversion Settings</h2>

                <div className="ic-field">
                  <div className="ic-label-row">
                    <label className="ic-label">Output format</label>
                  </div>

                  <select
                    className="ic-select"
                    value={outputFormat}
                    onChange={handleFormatChange}
                  >
                    {FORMAT_OPTIONS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                {outputFormat !== "image/png" && (
                  <div className="ic-field">
                    <div className="ic-label-row">
                      <label className="ic-label">Image quality</label>

                      <span className="ic-value">{quality}%</span>
                    </div>

                    <input
                      className="ic-range"
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={handleQualityChange}
                    />
                  </div>
                )}

                <div className="ic-switch-row">
                  <div className="ic-switch-copy">
                    <strong>Resize image</strong>
                    <span>
                      Reduce dimensions while keeping the file optimized.
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label="Toggle resize"
                    className={`ic-switch ${
                      resizeEnabled ? "active" : ""
                    }`}
                    onClick={handleResizeToggle}
                  >
                    <span className="ic-switch-dot" />
                  </button>
                </div>

                {resizeEnabled && (
                  <>
                    <div className="ic-field" style={{ marginTop: 16 }}>
                      <div className="ic-label-row">
                        <label className="ic-label">
                          Maximum dimensions
                        </label>

                        <span className="ic-value">
                          {keepAspect ? "Aspect ratio locked" : "Custom"}
                        </span>
                      </div>

                      <div className="ic-two">
                        <input
                          className="ic-number"
                          type="number"
                          min="1"
                          max="10000"
                          value={maxWidth}
                          onChange={(event) => {
                            setMaxWidth(event.target.value);
                            resetResult();
                          }}
                          placeholder="Width"
                        />

                        <input
                          className="ic-number"
                          type="number"
                          min="1"
                          max="10000"
                          value={maxHeight}
                          onChange={(event) => {
                            setMaxHeight(event.target.value);
                            resetResult();
                          }}
                          placeholder="Height"
                        />
                      </div>
                    </div>

                    <div className="ic-switch-row">
                      <div className="ic-switch-copy">
                        <strong>Keep aspect ratio</strong>
                        <span>
                          Prevent stretched or distorted images.
                        </span>
                      </div>

                      <button
                        type="button"
                        aria-label="Toggle aspect ratio"
                        className={`ic-switch ${
                          keepAspect ? "active" : ""
                        }`}
                        onClick={() => {
                          setKeepAspect((current) => !current);
                          resetResult();
                        }}
                      >
                        <span className="ic-switch-dot" />
                      </button>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  className="ic-convert"
                  disabled={!file || isConverting}
                  onClick={convertImage}
                >
                  {isConverting
                    ? "Converting..."
                    : file
                    ? "Convert & Download"
                    : "Select an Image First"}
                </button>

                {status && <div className="ic-status">{status}</div>}

                {error && <div className="ic-error">{error}</div>}
              </div>
            </div>

            {result && (
              <div className="ic-result">
                <div>
                  <div className="ic-result-title">
                    ✓ Conversion complete
                  </div>

                  <div className="ic-result-meta">
                    {result.filename} • {result.width} × {result.height} •{" "}
                    {formatBytes(result.size)}
                  </div>
                </div>

                <button
                  type="button"
                  className="ic-download"
                  onClick={manualDownload}
                >
                  Download Again
                </button>
              </div>
            )}

            <div className="ic-note">
              Processing happens locally in your browser — images are not
              uploaded to a server.
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="ic-hidden"
          onChange={handleFileInput}
        />
      </div>
    </>
  );
}