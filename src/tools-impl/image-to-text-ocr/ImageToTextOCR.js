"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ImageToText() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState("eng");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const inputRef = useRef(null);
  const workerRef = useRef(null);
  const scriptPromiseRef = useRef(null);

  // ------------------------------------------------------------
  // LOAD TESSERACT FROM CDN
  // No npm import required.
  // ------------------------------------------------------------
  const loadTesseract = () => {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("Browser environment required."));
    }

    if (window.Tesseract) {
      return Promise.resolve(window.Tesseract);
    }

    if (scriptPromiseRef.current) {
      return scriptPromiseRef.current;
    }

    scriptPromiseRef.current = new Promise((resolve, reject) => {
      const existing = document.querySelector(
        'script[data-ocr-tesseract="true"]'
      );

      if (existing) {
        existing.addEventListener("load", () => {
          if (window.Tesseract) {
            resolve(window.Tesseract);
          } else {
            reject(new Error("Tesseract failed to initialize."));
          }
        });

        existing.addEventListener("error", () => {
          reject(new Error("Could not load OCR engine."));
        });

        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";

      script.async = true;
      script.dataset.ocrTesseract = "true";

      script.onload = () => {
        if (window.Tesseract) {
          resolve(window.Tesseract);
        } else {
          reject(new Error("OCR engine loaded but is unavailable."));
        }
      };

      script.onerror = () => {
        reject(
          new Error(
            "Unable to load OCR engine. Please check your internet connection."
          )
        );
      };

      document.body.appendChild(script);
    });

    return scriptPromiseRef.current;
  };

  // ------------------------------------------------------------
  // CLEANUP
  // ------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current
          .terminate()
          .catch(() => {});
        workerRef.current = null;
      }

      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  // ------------------------------------------------------------
  // FILE VALIDATION
  // ------------------------------------------------------------
  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return false;
    }

    const maxSize = 15 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("Image is too large. Maximum allowed size is 15 MB.");
      return false;
    }

    return true;
  };

  // ------------------------------------------------------------
  // SELECT IMAGE
  // ------------------------------------------------------------
  const handleFile = (selectedFile) => {
    if (!validateFile(selectedFile)) return;

    setError("");
    setText("");
    setProgress(0);
    setStatus("Image ready");
    setCopied(false);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imageUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreview(imageUrl);
  };

  const handleInputChange = (event) => {
    const selected = event.target.files && event.target.files[0];

    if (selected) {
      handleFile(selected);
    }

    event.target.value = "";
  };

  // ------------------------------------------------------------
  // DRAG & DROP
  // ------------------------------------------------------------
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const droppedFile =
      event.dataTransfer.files && event.dataTransfer.files[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  // ------------------------------------------------------------
  // IMAGE PRE-PROCESSING
  // Improves OCR results for many screenshots/documents.
  // ------------------------------------------------------------
  const prepareImage = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        try {
          const maxDimension = 2600;

          let width = image.naturalWidth;
          let height = image.naturalHeight;

          if (width > maxDimension || height > maxDimension) {
            const scale = Math.min(
              maxDimension / width,
              maxDimension / height
            );

            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          const canvas = document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d", {
            willReadFrequently: true,
          });

          if (!ctx) {
            resolve(imageUrl);
            return;
          }

          ctx.drawImage(image, 0, 0, width, height);

          // Mild contrast enhancement
          const imageData = ctx.getImageData(
            0,
            0,
            width,
            height
          );

          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const gray =
              0.299 * r +
              0.587 * g +
              0.114 * b;

            const enhanced =
              ((gray - 128) * 1.12) + 128;

            const value = Math.max(
              0,
              Math.min(255, enhanced)
            );

            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
          }

          ctx.putImageData(imageData, 0, 0);

          resolve(canvas.toDataURL("image/png", 1));
        } catch (err) {
          resolve(imageUrl);
        }
      };

      image.onerror = () => {
        reject(new Error("Unable to process the selected image."));
      };

      image.src = imageUrl;
    });
  };

  // ------------------------------------------------------------
  // OCR
  // ------------------------------------------------------------
  const extractText = async () => {
    if (!file || !preview || isProcessing) return;

    setIsProcessing(true);
    setError("");
    setText("");
    setCopied(false);
    setProgress(1);
    setStatus("Starting OCR engine...");

    try {
      const Tesseract = await loadTesseract();

      setProgress(5);
      setStatus("Loading language data...");

      // Terminate previous worker safely
      if (workerRef.current) {
        try {
          await workerRef.current.terminate();
        } catch (e) {
          // Ignore cleanup errors
        }

        workerRef.current = null;
      }

      const worker = await Tesseract.createWorker(
        language,
        1,
        {
          logger: (message) => {
            if (!message) return;

            if (typeof message.progress === "number") {
              const raw = message.progress;

              // Never allow UI to go backwards
              const calculated = Math.max(
                5,
                Math.min(99, Math.round(raw * 100))
              );

              setProgress((previous) =>
                calculated > previous
                  ? calculated
                  : previous
              );
            }

            if (message.status) {
              const cleanStatus = message.status
                .replace(/_/g, " ")
                .replace(/\b\w/g, (letter) =>
                  letter.toUpperCase()
                );

              setStatus(cleanStatus);
            }
          },
        }
      );

      workerRef.current = worker;

      setProgress((previous) =>
        Math.max(previous, 12)
      );

      setStatus("Preparing image...");

      const processedImage = await prepareImage(preview);

      setProgress((previous) =>
        Math.max(previous, 20)
      );

      setStatus("Recognizing text...");

      const result = await worker.recognize(processedImage);

      const extracted =
        result &&
        result.data &&
        typeof result.data.text === "string"
          ? result.data.text.trim()
          : "";

      if (!extracted) {
        setProgress(100);
        setStatus("No readable text found");
        setText("");
        setError(
          "No readable text was detected. Try a clearer image with larger, sharper text."
        );
      } else {
        setProgress(100);
        setStatus("Text extracted successfully");
        setText(extracted);
      }

      try {
        await worker.terminate();
      } catch (e) {
        // Ignore worker cleanup errors
      }

      workerRef.current = null;
    } catch (err) {
      console.error("OCR Error:", err);

      setProgress(0);
      setStatus("OCR failed");

      let message =
        "Something went wrong while extracting the text.";

      if (err && err.message) {
        message = err.message;
      }

      setError(message);

      if (workerRef.current) {
        try {
          await workerRef.current.terminate();
        } catch (e) {
          // Ignore
        }

        workerRef.current = null;
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------------------------------------------------
  // COPY
  // ------------------------------------------------------------
  const copyText = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      const textarea = document.createElement("textarea");

      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1800);
      } catch (e) {
        setError("Unable to copy text.");
      }

      document.body.removeChild(textarea);
    }
  };

  // ------------------------------------------------------------
  // DOWNLOAD TXT
  // ------------------------------------------------------------
  const downloadText = () => {
    if (!text) return;

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;

    const originalName = file
      ? file.name.replace(/\.[^/.]+$/, "")
      : "extracted-text";

    anchor.download = `${originalName}-ocr.txt`;

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  };

  // ------------------------------------------------------------
  // CLEAR
  // ------------------------------------------------------------
  const clearAll = () => {
    if (isProcessing) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview("");
    setText("");
    setProgress(0);
    setStatus("Ready");
    setError("");
    setCopied(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // ------------------------------------------------------------
  // WORD / CHARACTER COUNT
  // ------------------------------------------------------------
  const wordCount = text
    ? text.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const characterCount = text ? text.length : 0;

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="ocr-tool">
      <style>{`
        .ocr-tool {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          font-family: Inter, Arial, Helvetica, sans-serif;
          color: #111827;
        }

        .ocr-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
        }

        .ocr-header {
          padding: 30px 32px 24px;
          border-bottom: 1px solid #eef0f4;
        }

        .ocr-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .ocr-title {
          margin: 0;
          font-size: 28px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.7px;
          color: #111827;
        }

        .ocr-subtitle {
          margin: 9px 0 0;
          color: #667085;
          font-size: 14px;
          line-height: 1.6;
        }

        .ocr-badge {
          flex-shrink: 0;
          padding: 8px 12px;
          border-radius: 999px;
          background: #f5f3ff;
          color: #5146e5;
          border: 1px solid #e5e1ff;
          font-size: 12px;
          font-weight: 700;
        }

        .ocr-body {
          padding: 28px 32px 32px;
        }

        .ocr-upload {
          position: relative;
          min-height: 245px;
          border: 2px dashed #ccd5e3;
          border-radius: 20px;
          background: #fafbff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: 0.2s ease;
          overflow: hidden;
        }

        .ocr-upload:hover {
          border-color: #756cf6;
          background: #f8f7ff;
        }

        .ocr-upload.dragging {
          border-color: #5146e5;
          background: #f1efff;
          transform: scale(1.005);
        }

        .ocr-upload.has-image {
          min-height: 250px;
          cursor: default;
          background: #f8fafc;
        }

        .ocr-file-input {
          display: none;
        }

        .ocr-upload-content {
          padding: 30px;
        }

        .ocr-upload-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 16px;
          border-radius: 18px;
          background: #eeecff;
          color: #5548e8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
        }

        .ocr-upload-title {
          font-size: 17px;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .ocr-upload-text {
          color: #667085;
          font-size: 13px;
        }

        .ocr-preview-wrap {
          width: 100%;
          height: 250px;
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ocr-preview {
          max-width: 100%;
          max-height: 220px;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 5px 25px rgba(15, 23, 42, 0.12);
        }

        .ocr-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 20px;
        }

        .ocr-field {
          min-width: 0;
        }

        .ocr-label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 800;
          color: #344054;
        }

        .ocr-select {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid #d8dee9;
          background: #ffffff;
          color: #172033;
          outline: none;
          font-size: 14px;
        }

        .ocr-select:focus {
          border-color: #6558ee;
          box-shadow: 0 0 0 3px rgba(101, 88, 238, 0.1);
        }

        .ocr-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }

        .ocr-btn {
          height: 46px;
          padding: 0 18px;
          border: 0;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .ocr-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ocr-btn-primary {
          background: #5548e8;
          color: white;
          box-shadow: 0 7px 18px rgba(85, 72, 232, 0.2);
        }

        .ocr-btn-primary:hover:not(:disabled) {
          background: #4639d5;
          transform: translateY(-1px);
        }

        .ocr-btn-secondary {
          background: #f3f4f7;
          color: #1f2937;
        }

        .ocr-btn-secondary:hover:not(:disabled) {
          background: #e8eaf0;
        }

        .ocr-status {
          margin-top: 20px;
          padding: 15px 16px;
          border: 1px solid #e7e9ef;
          border-radius: 14px;
          background: #fbfcfe;
        }

        .ocr-status-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 9px;
        }

        .ocr-status-text {
          font-size: 13px;
          font-weight: 700;
          color: #344054;
        }

        .ocr-percent {
          font-size: 13px;
          font-weight: 800;
          color: #5548e8;
        }

        .ocr-progress {
          width: 100%;
          height: 8px;
          background: #eceef3;
          border-radius: 999px;
          overflow: hidden;
        }

        .ocr-progress-bar {
          height: 100%;
          width: 0%;
          background: #5548e8;
          border-radius: 999px;
          transition: width 0.25s ease;
        }

        .ocr-error {
          margin-top: 14px;
          padding: 13px 15px;
          border-radius: 12px;
          background: #fff5f5;
          border: 1px solid #ffd5d5;
          color: #b42318;
          font-size: 13px;
          line-height: 1.5;
        }

        .ocr-result {
          margin-top: 24px;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          overflow: hidden;
          background: #ffffff;
        }

        .ocr-result-header {
          padding: 16px 18px;
          border-bottom: 1px solid #eef0f4;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .ocr-result-title {
          font-size: 14px;
          font-weight: 800;
          color: #111827;
        }

        .ocr-result-actions {
          display: flex;
          gap: 8px;
        }

        .ocr-mini-btn {
          height: 34px;
          padding: 0 11px;
          border-radius: 9px;
          border: 1px solid #dfe3ea;
          background: #ffffff;
          color: #344054;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .ocr-mini-btn:hover {
          background: #f7f8fa;
        }

        .ocr-textarea {
          width: 100%;
          min-height: 260px;
          border: 0;
          resize: vertical;
          outline: none;
          padding: 18px;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.7;
          color: #1f2937;
          background: #ffffff;
        }

        .ocr-result-footer {
          padding: 11px 18px;
          border-top: 1px solid #eef0f4;
          display: flex;
          gap: 18px;
          color: #667085;
          font-size: 11px;
          font-weight: 700;
        }

        .ocr-empty-result {
          margin-top: 24px;
          padding: 22px;
          border: 1px solid #eef0f4;
          border-radius: 16px;
          text-align: center;
          color: #98a2b3;
          font-size: 13px;
        }

        .ocr-privacy {
          margin-top: 18px;
          text-align: center;
          color: #98a2b3;
          font-size: 11px;
          line-height: 1.6;
        }

        @media (max-width: 700px) {
          .ocr-header,
          .ocr-body {
            padding: 22px 18px;
          }

          .ocr-title-row {
            flex-direction: column;
          }

          .ocr-title {
            font-size: 24px;
          }

          .ocr-controls {
            grid-template-columns: 1fr;
          }

          .ocr-buttons {
            flex-direction: column;
          }

          .ocr-btn {
            width: 100%;
          }

          .ocr-result-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="ocr-card">
        <div className="ocr-header">
          <div className="ocr-title-row">
            <div>
              <h2 className="ocr-title">
                Image to Text (OCR)
              </h2>

              <p className="ocr-subtitle">
                Extract editable text from images directly in your browser.
              </p>
            </div>

            <div className="ocr-badge">
              100% Browser Based
            </div>
          </div>
        </div>

        <div className="ocr-body">
          {/* UPLOAD AREA */}
          <div
            className={
              "ocr-upload" +
              (isDragging ? " dragging" : "") +
              (preview ? " has-image" : "")
            }
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!preview && !isProcessing) {
                inputRef.current?.click();
              }
            }}
          >
            <input
              ref={inputRef}
              className="ocr-file-input"
              type="file"
              accept="image/*"
              onChange={handleInputChange}
            />

            {preview ? (
              <div className="ocr-preview-wrap">
                <img
                  src={preview}
                  alt="Selected image"
                  className="ocr-preview"
                />
              </div>
            ) : (
              <div className="ocr-upload-content">
                <div className="ocr-upload-icon">
                  ↑
                </div>

                <div className="ocr-upload-title">
                  Drop your image here
                </div>

                <div className="ocr-upload-text">
                  or click to browse • JPG, PNG, WebP, GIF and more
                </div>
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <div className="ocr-controls">
            <div className="ocr-field">
              <label className="ocr-label">
                OCR Language
              </label>

              <select
                className="ocr-select"
                value={language}
                disabled={isProcessing}
                onChange={(event) => {
                  setLanguage(event.target.value);
                  setText("");
                  setProgress(0);
                  setStatus(
                    preview
                      ? "Language changed — ready to extract"
                      : "Ready"
                  );
                }}
              >
                <option value="eng">
                  English
                </option>

                <option value="urd">
                  Urdu
                </option>

                <option value="spa">
                  Spanish
                </option>

                <option value="fra">
                  French
                </option>

                <option value="deu">
                  German
                </option>

                <option value="ita">
                  Italian
                </option>

                <option value="por">
                  Portuguese
                </option>

                <option value="ara">
                  Arabic
                </option>
              </select>
            </div>

            <div className="ocr-field">
              <label className="ocr-label">
                Image
              </label>

              <button
                type="button"
                className="ocr-btn ocr-btn-secondary"
                style={{ width: "100%" }}
                disabled={isProcessing}
                onClick={() => inputRef.current?.click()}
              >
                {preview ? "Change Image" : "Choose Image"}
              </button>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="ocr-buttons">
            <button
              type="button"
              className="ocr-btn ocr-btn-primary"
              disabled={!file || isProcessing}
              onClick={extractText}
            >
              {isProcessing
                ? "Extracting..."
                : "Extract Text"}
            </button>

            <button
              type="button"
              className="ocr-btn ocr-btn-secondary"
              disabled={!file || isProcessing}
              onClick={clearAll}
            >
              Clear
            </button>
          </div>

          {/* PROGRESS */}
          {(isProcessing || progress > 0) && (
            <div className="ocr-status">
              <div className="ocr-status-top">
                <span className="ocr-status-text">
                  {status}
                </span>

                <span className="ocr-percent">
                  {progress}%
                </span>
              </div>

              <div className="ocr-progress">
                <div
                  className="ocr-progress-bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="ocr-error">
              {error}
            </div>
          )}

          {/* RESULT */}
          {text ? (
            <div className="ocr-result">
              <div className="ocr-result-header">
                <div className="ocr-result-title">
                  Extracted Text
                </div>

                <div className="ocr-result-actions">
                  <button
                    type="button"
                    className="ocr-mini-btn"
                    onClick={copyText}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>

                  <button
                    type="button"
                    className="ocr-mini-btn"
                    onClick={downloadText}
                  >
                    Download .TXT
                  </button>
                </div>
              </div>

              <textarea
                className="ocr-textarea"
                value={text}
                onChange={(event) =>
                  setText(event.target.value)
                }
                spellCheck={false}
              />

              <div className="ocr-result-footer">
                <span>
                  {wordCount} words
                </span>

                <span>
                  {characterCount} characters
                </span>

                <span>
                  Editable
                </span>
              </div>
            </div>
          ) : (
            <div className="ocr-empty-result">
              Extracted text will appear here.
            </div>
          )}

          <div className="ocr-privacy">
            Your image is processed directly in your browser.
            It is not uploaded to your server by this tool.
          </div>
        </div>
      </div>
    </div>
  );
}