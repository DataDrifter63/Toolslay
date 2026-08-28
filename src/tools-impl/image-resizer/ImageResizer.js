"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ImageResizer() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);

  const [lockRatio, setLockRatio] = useState(true);
  const [quality, setQuality] = useState(90);
  const [format, setFormat] = useState("original");
  const [resizeMode, setResizeMode] = useState("exact");

  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultSize, setResultSize] = useState(null);

  const imageRef = useRef(null);

  const resetTool = () => {
    setFile(null);
    setPreview("");
    setWidth("");
    setHeight("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setResultSize(null);
    setProcessing(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const loadImage = (selectedFile) => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      alert("Maximum file size is 25 MB.");
      return;
    }

    const url = URL.createObjectURL(selectedFile);

    const img = new Image();

    img.onload = () => {
      setFile(selectedFile);
      setPreview(url);

      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);

      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));

      setResultSize(null);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert("Unable to read this image.");
    };

    img.src = url;
  };

  const handleFile = (e) => {
    const selected = e.target.files?.[0];

    if (selected) {
      loadImage(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];

    if (droppedFile) {
      loadImage(droppedFile);
    }
  };

  const changeWidth = (value) => {
    setWidth(value);

    if (
      lockRatio &&
      originalWidth > 0 &&
      originalHeight > 0 &&
      value !== ""
    ) {
      const newWidth = Number(value);

      if (!Number.isNaN(newWidth) && newWidth > 0) {
        const newHeight = Math.round(
          (newWidth / originalWidth) * originalHeight
        );

        setHeight(String(newHeight));
      }
    }
  };

  const changeHeight = (value) => {
    setHeight(value);

    if (
      lockRatio &&
      originalWidth > 0 &&
      originalHeight > 0 &&
      value !== ""
    ) {
      const newHeight = Number(value);

      if (!Number.isNaN(newHeight) && newHeight > 0) {
        const newWidth = Math.round(
          (newHeight / originalHeight) * originalWidth
        );

        setWidth(String(newWidth));
      }
    }
  };

  const getOutputDimensions = () => {
    let targetWidth = Number(width);
    let targetHeight = Number(height);

    if (!targetWidth || targetWidth < 1) {
      targetWidth = originalWidth;
    }

    if (!targetHeight || targetHeight < 1) {
      targetHeight = originalHeight;
    }

    if (resizeMode === "percentage") {
      const percentage = Number(width) || 100;

      targetWidth = Math.max(
        1,
        Math.round((originalWidth * percentage) / 100)
      );

      targetHeight = Math.max(
        1,
        Math.round((originalHeight * percentage) / 100)
      );
    }

    if (resizeMode === "fit") {
      const maxWidth = Number(width) || originalWidth;
      const maxHeight = Number(height) || originalHeight;

      const ratio = Math.min(
        maxWidth / originalWidth,
        maxHeight / originalHeight
      );

      targetWidth = Math.max(1, Math.round(originalWidth * ratio));
      targetHeight = Math.max(1, Math.round(originalHeight * ratio));
    }

    return {
      width: targetWidth,
      height: targetHeight,
    };
  };

  const getOutputType = () => {
    if (format === "png") return "image/png";
    if (format === "jpg") return "image/jpeg";
    if (format === "webp") return "image/webp";

    if (file?.type === "image/png") return "image/png";
    if (file?.type === "image/webp") return "image/webp";

    return "image/jpeg";
  };

  const getExtension = (mime) => {
    if (mime === "image/png") return "png";
    if (mime === "image/webp") return "webp";
    return "jpg";
  };

  const resizeAndDownload = () => {
    if (!file || !preview) {
      alert("Please select an image first.");
      return;
    }

    const dimensions = getOutputDimensions();

    if (
      dimensions.width < 1 ||
      dimensions.height < 1 ||
      dimensions.width > 10000 ||
      dimensions.height > 10000
    ) {
      alert("Please enter valid dimensions between 1 and 10,000 pixels.");
      return;
    }

    setProcessing(true);

    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");

        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Canvas is not supported.");
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const outputType = getOutputType();

        // White background for JPEG because JPEG doesn't support transparency.
        if (outputType === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(
          img,
          0,
          0,
          dimensions.width,
          dimensions.height
        );

        const finalQuality = Math.min(
          1,
          Math.max(0.1, Number(quality) / 100)
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setProcessing(false);
              alert("Could not create the resized image.");
              return;
            }

            setResultSize(blob.size);

            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;

            const originalName =
              file.name.replace(/\.[^/.]+$/, "") || "image";

            link.download = `${originalName}-${dimensions.width}x${dimensions.height}.${getExtension(
              outputType
            )}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
              URL.revokeObjectURL(blobUrl);
            }, 1000);

            setProcessing(false);
          },
          outputType,
          finalQuality
        );
      } catch (error) {
        console.error(error);
        setProcessing(false);
        alert("Something went wrong while resizing the image.");
      }
    };

    img.onerror = () => {
      setProcessing(false);
      alert("Unable to process this image.");
    };

    img.src = preview;
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const formatBytes = (bytes) => {
    if (!bytes) return "0 KB";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, index)).toFixed(
      index === 0 ? 0 : 1
    )} ${units[index]}`;
  };

  return (
    <div className="ir-wrapper">
      <style jsx>{`
        .ir-wrapper {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
          padding: 24px;
          color: #111827;
          font-family: Inter, Arial, sans-serif;
        }

        .ir-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }

        .ir-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .ir-title {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .ir-subtitle {
          margin: 8px 0 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        .reset-btn {
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #374151;
          padding: 10px 15px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
        }

        .reset-btn:hover {
          background: #f9fafb;
        }

        .drop-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 18px;
          padding: 42px 20px;
          text-align: center;
          cursor: pointer;
          transition: 0.2s ease;
          background: #f8fafc;
        }

        .drop-zone:hover,
        .drop-zone.active {
          border-color: #111827;
          background: #f3f4f6;
        }

        .upload-icon {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: #111827;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          font-size: 24px;
          font-weight: 800;
        }

        .drop-title {
          font-size: 17px;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .drop-text {
          color: #6b7280;
          font-size: 13px;
        }

        .file-input {
          display: none;
        }

        .workspace {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 350px;
          gap: 22px;
          margin-top: 22px;
        }

        .preview-card,
        .settings-card {
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #fff;
        }

        .preview-card {
          padding: 18px;
          min-height: 430px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
            linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
            linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
          background-size: 24px 24px;
          background-position:
            0 0,
            0 12px,
            12px -12px,
            -12px 0;
        }

        .preview-image {
          max-width: 100%;
          max-height: 500px;
          display: block;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .empty-preview {
          text-align: center;
          color: #9ca3af;
          padding: 40px;
        }

        .settings-card {
          padding: 20px;
        }

        .section-label {
          font-size: 12px;
          font-weight: 800;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 10px;
        }

        .field {
          margin-bottom: 18px;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        input[type="number"],
        select {
          width: 100%;
          height: 44px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          background: white;
        }

        input[type="number"]:focus,
        select:focus {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
        }

        .ratio-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 10px;
          margin-bottom: 18px;
        }

        .ratio-label {
          font-size: 13px;
          font-weight: 700;
        }

        .switch {
          width: 44px;
          height: 24px;
          border-radius: 999px;
          border: none;
          background: #d1d5db;
          cursor: pointer;
          position: relative;
          transition: 0.2s;
        }

        .switch.on {
          background: #111827;
        }

        .switch-dot {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: 0.2s;
        }

        .switch.on .switch-dot {
          transform: translateX(20px);
        }

        .quality-value {
          float: right;
          font-weight: 800;
        }

        input[type="range"] {
          width: 100%;
          margin-top: 7px;
        }

        .info-box {
          padding: 12px;
          border-radius: 10px;
          background: #f9fafb;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .download-btn {
          width: 100%;
          border: none;
          height: 48px;
          border-radius: 11px;
          background: #111827;
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .download-btn:hover {
          transform: translateY(-1px);
          background: #000;
        }

        .download-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .file-info {
          margin-top: 15px;
          padding: 13px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 12px;
          color: #6b7280;
        }

        .file-info strong {
          color: #111827;
        }

        .result {
          margin-top: 10px;
          color: #166534;
          font-weight: 700;
        }

        @media (max-width: 800px) {
          .ir-wrapper {
            padding: 12px;
          }

          .ir-card {
            padding: 18px;
          }

          .workspace {
            grid-template-columns: 1fr;
          }

          .ir-header {
            flex-direction: column;
          }

          .preview-card {
            min-height: 280px;
          }
        }
      `}</style>

      <div className="ir-card">
        <div className="ir-header">
          <div>
            <h2 className="ir-title">Image Resizer</h2>
            <p className="ir-subtitle">
              Resize, optimize and convert images directly in your browser.
              Your images never leave your device.
            </p>
          </div>

          <button className="reset-btn" onClick={resetTool}>
            Reset
          </button>
        </div>

        {!file && (
          <div
            className={`drop-zone ${dragActive ? "active" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <div className="upload-icon">↑</div>

            <div className="drop-title">
              Drop your image here or click to upload
            </div>

            <div className="drop-text">
              JPG, PNG, WEBP • Maximum 25 MB
            </div>

            <input
              ref={inputRef}
              className="file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFile}
            />
          </div>
        )}

        {file && (
          <div className="workspace">
            <div className="preview-card">
              {preview ? (
                <img
                  ref={imageRef}
                  src={preview}
                  alt="Selected image preview"
                  className="preview-image"
                />
              ) : (
                <div className="empty-preview">
                  Preview unavailable
                </div>
              )}
            </div>

            <div className="settings-card">
              <div className="section-label">Resize settings</div>

              <div className="field">
                <label>Resize mode</label>

                <select
                  value={resizeMode}
                  onChange={(e) => setResizeMode(e.target.value)}
                >
                  <option value="exact">Exact dimensions</option>
                  <option value="percentage">Percentage</option>
                  <option value="fit">Fit inside dimensions</option>
                </select>
              </div>

              {resizeMode === "percentage" ? (
                <div className="field">
                  <label>
                    Scale percentage
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="100"
                  />
                </div>
              ) : (
                <>
                  <div className="row">
                    <div className="field">
                      <label>Width (px)</label>

                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={width}
                        onChange={(e) => changeWidth(e.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label>Height (px)</label>

                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={height}
                        onChange={(e) => changeHeight(e.target.value)}
                      />
                    </div>
                  </div>

                  {resizeMode === "exact" && (
                    <div className="ratio-row">
                      <span className="ratio-label">
                        Lock aspect ratio
                      </span>

                      <button
                        type="button"
                        className={`switch ${lockRatio ? "on" : ""}`}
                        onClick={() => setLockRatio(!lockRatio)}
                        aria-label="Toggle aspect ratio lock"
                      >
                        <span className="switch-dot" />
                      </button>
                    </div>
                  )}
                </>
              )}

              <div className="field">
                <label>Output format</label>

                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="original">
                    Keep original format
                  </option>
                  <option value="jpg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WEBP</option>
                </select>
              </div>

              {format !== "png" && (
                <div className="field">
                  <label>
                    Quality
                    <span className="quality-value">
                      {quality}%
                    </span>
                  </label>

                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                  />
                </div>
              )}

              <div className="info-box">
                <strong>Original:</strong>{" "}
                {originalWidth} × {originalHeight}px
                <br />
                <strong>Output:</strong>{" "}
                {getOutputDimensions().width} ×{" "}
                {getOutputDimensions().height}px
                <br />
                <strong>File:</strong> {file.name}
              </div>

              <button
                className="download-btn"
                onClick={resizeAndDownload}
                disabled={processing}
              >
                {processing
                  ? "Processing..."
                  : "Resize & Download"}
              </button>

              {resultSize && (
                <div className="result">
                  Downloaded • {formatBytes(resultSize)}
                </div>
              )}

              <div className="file-info">
                Everything is processed locally in your browser.
                No image upload is required.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}