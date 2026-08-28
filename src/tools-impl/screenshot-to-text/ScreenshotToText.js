"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

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

function ScreenshotToText() {
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

  var styles = {
    wrapper: {
      width: "100%",
      maxWidth: "1050px",
      margin: "0 auto",
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      color: "#111827",
    },

    card: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "24px",
      padding: "28px",
      boxShadow: "0 18px 55px rgba(15, 23, 42, 0.08)",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "20px",
      marginBottom: "24px",
      flexWrap: "wrap",
    },

    title: {
      margin: 0,
      fontSize: "28px",
      lineHeight: 1.2,
      fontWeight: 800,
      letterSpacing: "-0.6px",
    },

    subtitle: {
      margin: "8px 0 0",
      color: "#64748b",
      fontSize: "14px",
      lineHeight: 1.6,
    },

    badge: {
      padding: "8px 12px",
      borderRadius: "999px",
      background: "#eef2ff",
      color: "#4f46e5",
      fontSize: "12px",
      fontWeight: 700,
      whiteSpace: "nowrap",
    },

    dropzone: {
      border: dragActive
        ? "2px solid #4f46e5"
        : "2px dashed #cbd5e1",
      borderRadius: "20px",
      padding: "42px 24px",
      textAlign: "center",
      background: dragActive ? "#eef2ff" : "#f8fafc",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },

    uploadIcon: {
      width: "54px",
      height: "54px",
      margin: "0 auto 14px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#eef2ff",
      color: "#4f46e5",
      fontSize: "25px",
      fontWeight: 800,
    },

    dropTitle: {
      margin: 0,
      fontSize: "17px",
      fontWeight: 750,
    },

    dropText: {
      margin: "7px 0 0",
      fontSize: "13px",
      color: "#64748b",
    },

    controls: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr auto",
      gap: "12px",
      marginTop: "18px",
    },

    label: {
      display: "block",
      marginBottom: "7px",
      fontSize: "12px",
      fontWeight: 700,
      color: "#475569",
    },

    select: {
      width: "100%",
      height: "44px",
      padding: "0 12px",
      borderRadius: "12px",
      border: "1px solid #dbe1ea",
      background: "#fff",
      color: "#111827",
      outline: "none",
    },

    button: {
      height: "44px",
      padding: "0 18px",
      border: "0",
      borderRadius: "12px",
      background: "#4f46e5",
      color: "#fff",
      fontWeight: 750,
      cursor: "pointer",
      whiteSpace: "nowrap",
    },

    secondaryButton: {
      height: "44px",
      padding: "0 16px",
      border: "1px solid #dbe1ea",
      borderRadius: "12px",
      background: "#fff",
      color: "#1e293b",
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
    },

    disabledButton: {
      opacity: 0.5,
      cursor: "not-allowed",
    },

    previewGrid: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      gap: "18px",
      marginTop: "20px",
    },

    panel: {
      border: "1px solid #e5e7eb",
      borderRadius: "18px",
      overflow: "hidden",
      background: "#fff",
    },

    panelHeader: {
      padding: "12px 15px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
      alignItems: "center",
    },

    panelTitle: {
      fontSize: "12px",
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      color: "#64748b",
    },

    imageBox: {
      minHeight: "330px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "15px",
      background: "#f8fafc",
    },

    image: {
      maxWidth: "100%",
      maxHeight: "430px",
      objectFit: "contain",
      borderRadius: "10px",
    },

    textArea: {
      width: "100%",
      minHeight: "330px",
      resize: "vertical",
      border: "0",
      outline: "none",
      padding: "16px",
      fontSize: "14px",
      lineHeight: 1.7,
      color: "#1e293b",
      background: "#fff",
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },

    stats: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },

    stat: {
      padding: "5px 9px",
      borderRadius: "8px",
      background: "#f1f5f9",
      color: "#475569",
      fontSize: "11px",
      fontWeight: 700,
    },

    progressWrap: {
      marginTop: "18px",
      padding: "14px",
      borderRadius: "14px",
      background: "#f8fafc",
      border: "1px solid #e5e7eb",
    },

    progressTop: {
      display: "flex",
      justifyContent: "space-between",
      gap: "12px",
      fontSize: "12px",
      fontWeight: 700,
      marginBottom: "9px",
    },

    progressTrack: {
      height: "8px",
      borderRadius: "999px",
      background: "#e2e8f0",
      overflow: "hidden",
    },

    progressBar: {
      height: "100%",
      width: progress + "%",
      background: "#4f46e5",
      borderRadius: "999px",
      transition: "width 0.25s ease",
    },

    actions: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "16px",
    },

    error: {
      marginTop: "14px",
      padding: "12px 14px",
      borderRadius: "12px",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#b91c1c",
      fontSize: "13px",
      lineHeight: 1.5,
    },

    info: {
      marginTop: "18px",
      padding: "14px 16px",
      borderRadius: "14px",
      background: "#f8fafc",
      border: "1px solid #e5e7eb",
      color: "#64748b",
      fontSize: "12px",
      lineHeight: 1.6,
    },

    checkRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      height: "44px",
      padding: "0 12px",
      border: "1px solid #dbe1ea",
      borderRadius: "12px",
      background: "#fff",
      fontSize: "13px",
      fontWeight: 650,
    },
  };

  return React.createElement(
    "div",
    { style: styles.wrapper },
    React.createElement(
      "div",
      { style: styles.card },

      React.createElement(
        "div",
        { style: styles.header },

        React.createElement(
          "div",
          null,
          React.createElement(
            "h2",
            { style: styles.title },
            "Screenshot to Text"
          ),
          React.createElement(
            "p",
            { style: styles.subtitle },
            "Extract editable text from screenshots and images directly in your browser."
          )
        ),

        React.createElement(
          "div",
          { style: styles.badge },
          "Private • Browser OCR"
        )
      ),

      React.createElement(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: "image/*",
          onChange: onFileChange,
          style: { display: "none" },
        }
      ),

      React.createElement(
        "div",
        {
          style: styles.dropzone,
          onClick: function () {
            if (!isProcessing && fileInputRef.current) {
              fileInputRef.current.click();
            }
          },
          onDragOver: function (event) {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(true);
          },
          onDragLeave: function (event) {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(false);
          },
          onDrop: onDrop,
          role: "button",
          tabIndex: 0,
        },

        React.createElement(
          "div",
          { style: styles.uploadIcon },
          file ? "✓" : "↑"
        ),

        React.createElement(
          "p",
          { style: styles.dropTitle },
          file ? "Screenshot selected" : "Drop screenshot here"
        ),

        React.createElement(
          "p",
          { style: styles.dropText },
          file
            ? file.name + " • " + formatBytes(file.size)
            : "or click to browse • You can also paste an image with Ctrl + V"
        )
      ),

      React.createElement(
        "div",
        { style: styles.controls },

        React.createElement(
          "div",
          null,
          React.createElement("label", { style: styles.label }, "OCR Language"),
          React.createElement(
            "select",
            {
              value: language,
              onChange: function (event) {
                setLanguage(event.target.value);
                setText("");
                setProgress(0);
                setStatus("Language changed");
              },
              disabled: isProcessing,
              style: styles.select,
            },
            LANGUAGES.map(function (item) {
              return React.createElement(
                "option",
                { key: item.value, value: item.value },
                item.label
              );
            })
          )
        ),

        React.createElement(
          "div",
          null,
          React.createElement("label", { style: styles.label }, "Text Cleanup"),
          React.createElement(
            "label",
            { style: styles.checkRow },
            React.createElement("input", {
              type: "checkbox",
              checked: autoClean,
              onChange: function (event) {
                setAutoClean(event.target.checked);
              },
            }),
            "Clean spacing & empty lines"
          )
        ),

        React.createElement(
          "div",
          null,
          React.createElement("label", { style: styles.label }, "Action"),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: extractText,
              disabled: !file || isProcessing,
              style: Object.assign(
                {},
                styles.button,
                !file || isProcessing ? styles.disabledButton : {}
              ),
            },
            isProcessing ? "Extracting..." : "Extract Text"
          )
        )
      ),

      isProcessing &&
        React.createElement(
          "div",
          { style: styles.progressWrap },

          React.createElement(
            "div",
            { style: styles.progressTop },

            React.createElement("span", null, status),

            React.createElement("span", null, progress + "%")
          ),

          React.createElement(
            "div",
            { style: styles.progressTrack },

            React.createElement("div", {
              style: styles.progressBar,
            })
          )
        ),

      error &&
        React.createElement(
          "div",
          { style: styles.error },
          error
        ),

      file &&
        React.createElement(
          "div",
          { style: styles.previewGrid },

          React.createElement(
            "div",
            { style: styles.panel },

            React.createElement(
              "div",
              { style: styles.panelHeader },

              React.createElement(
                "span",
                { style: styles.panelTitle },
                "Screenshot"
              ),

              React.createElement(
                "span",
                { style: styles.stat },
                formatBytes(file.size)
              )
            ),

            React.createElement(
              "div",
              { style: styles.imageBox },

              React.createElement("img", {
                src: preview,
                alt: "Selected screenshot preview",
                style: styles.image,
              })
            )
          ),

          React.createElement(
            "div",
            { style: styles.panel },

            React.createElement(
              "div",
              { style: styles.panelHeader },

              React.createElement(
                "span",
                { style: styles.panelTitle },
                "Extracted Text"
              ),

              React.createElement(
                "div",
                { style: styles.stats },

                React.createElement(
                  "span",
                  { style: styles.stat },
                  wordCount + " words"
                ),

                React.createElement(
                  "span",
                  { style: styles.stat },
                  characterCount + " chars"
                )
              )
            ),

            React.createElement("textarea", {
              value: text,
              onChange: function (event) {
                setText(event.target.value);
              },
              placeholder:
                "Extracted text will appear here after you click Extract Text...",
              style: styles.textArea,
            })
          )
        ),

      React.createElement(
        "div",
        { style: styles.actions },

        React.createElement(
          "button",
          {
            type: "button",
            onClick: copyText,
            disabled: !text,
            style: Object.assign(
              {},
              styles.secondaryButton,
              !text ? styles.disabledButton : {}
            ),
          },
          copied ? "✓ Copied" : "Copy Text"
        ),

        React.createElement(
          "button",
          {
            type: "button",
            onClick: downloadText,
            disabled: !text,
            style: Object.assign(
              {},
              styles.secondaryButton,
              !text ? styles.disabledButton : {}
            ),
          },
          "Download TXT"
        ),

        React.createElement(
          "button",
          {
            type: "button",
            onClick: clearAll,
            disabled: isProcessing && !file,
            style: styles.secondaryButton,
          },
          "Clear"
        )
      ),

      React.createElement(
        "div",
        { style: styles.info },
        "Privacy-first OCR: the screenshot is processed in your browser. The tool does not upload your image to your own server. Tesseract.js runs the OCR engine through a browser worker."
      )
    )
  );
}

/*
 * IMPORTANT:
 * This MUST remain a default export.
 * Do not change it to:
 * export { ScreenshotToText }
 * and do not export an object.
 */
export default ScreenshotToText;