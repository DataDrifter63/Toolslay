"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const h = React.createElement;

const styles = {
  wrap: {
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
    padding: 24,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    color: "#111827",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 18px 55px rgba(15,23,42,.08)",
  },

  head: {
    padding: "28px 28px 18px",
  },

  title: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.15,
    fontWeight: 800,
    letterSpacing: "-.04em",
  },

  sub: {
    margin: "9px 0 0",
    color: "#64748b",
    fontSize: 14,
  },

  drop: {
    margin: "8px 28px 22px",
    minHeight: 190,
    border: "2px dashed #cbd5e1",
    borderRadius: 20,
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    cursor: "pointer",
    padding: 24,
  },

  dropActive: {
    borderColor: "#4f46e5",
    background: "#eef2ff",
  },

  uploadIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: 25,
    fontWeight: 800,
  },

  controls: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: 14,
    padding: "0 28px 22px",
  },

  field: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
    background: "#fff",
  },

  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    border: "1px solid #dbe2ea",
    borderRadius: 11,
    padding: "10px 11px",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    color: "#0f172a",
  },

  select: {
    width: "100%",
    border: "1px solid #dbe2ea",
    borderRadius: 11,
    padding: "10px 11px",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    color: "#0f172a",
  },

  range: {
    width: "100%",
    accentColor: "#4f46e5",
  },

  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    padding: "0 28px 24px",
  },

  btn: {
    border: 0,
    borderRadius: 12,
    padding: "12px 17px",
    fontWeight: 750,
    fontSize: 14,
    cursor: "pointer",
    background: "#eef2f7",
    color: "#0f172a",
  },

  primary: {
    background: "#4f46e5",
    color: "white",
    boxShadow: "0 8px 18px rgba(79,70,229,.2)",
  },

  danger: {
    background: "#fff1f2",
    color: "#be123c",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    gap: 12,
    padding: "0 28px 24px",
  },

  stat: {
    border: "1px solid #e5e7eb",
    borderRadius: 15,
    padding: 14,
    background: "#fafafa",
  },

  statLabel: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: ".06em",
    fontWeight: 700,
  },

  statValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: 800,
  },

  list: {
    borderTop: "1px solid #e5e7eb",
  },

  item: {
    display: "grid",
    gridTemplateColumns: "58px 1fr auto",
    gap: 14,
    alignItems: "center",
    padding: "15px 28px",
    borderBottom: "1px solid #eef2f7",
  },

  thumb: {
    width: 58,
    height: 58,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f1f5f9",
  },

  itemName: {
    fontSize: 14,
    fontWeight: 750,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  itemMeta: {
    marginTop: 5,
    fontSize: 12,
    color: "#64748b",
  },

  badge: {
    display: "inline-block",
    marginLeft: 6,
    padding: "3px 7px",
    borderRadius: 999,
    background: "#ecfdf5",
    color: "#047857",
    fontWeight: 700,
  },

  footer: {
    padding: "15px 28px",
    background: "#fafafa",
    color: "#64748b",
    fontSize: 12,
  },

  empty: {
    padding: "34px 28px",
    textAlign: "center",
    color: "#64748b",
  },

  error: {
    margin: "0 28px 20px",
    padding: "12px 14px",
    borderRadius: 12,
    background: "#fff1f2",
    color: "#be123c",
    fontSize: 13,
    fontWeight: 650,
  },

  hint: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 6,
  },
};

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

  /*
   * Smart target-size compression.
   * First reduce quality.
   * If still above target, reduce dimensions.
   */
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

  /*
   * Important:
   * If compression output somehow becomes larger
   * than the original file, keep the original file
   * instead of creating a heavier "compressed" file.
   */
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
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);

  const [quality, setQuality] =
    useState(80);

  const [format, setFormat] =
    useState("webp");

  const [maxWidth, setMaxWidth] =
    useState(0);

  const [maxHeight, setMaxHeight] =
    useState(0);

  const [targetKB, setTargetKB] =
    useState(0);

  const [autoDownload, setAutoDownload] =
    useState(true);

  const [dragging, setDragging] =
    useState(false);

  const [working, setWorking] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Clean generated preview URLs when
   * component is removed.
   */
  useEffect(function () {
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

      /*
       * Clear old compression results
       * when new images are selected.
       */
      setResults([]);
    },
    []
  );

  function onInputChange(event) {
    addFiles(event.target.files);

    /*
     * Allows selecting the same file again.
     */
    event.target.value = "";
  }

  function onDrop(event) {
    event.preventDefault();

    setDragging(false);

    addFiles(
      event.dataTransfer.files
    );
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

          /*
           * Update UI immediately after
           * every image is processed.
           */
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

  function stat(label, value) {
    return h(
      "div",
      {
        style: styles.stat,
      },
      h(
        "div",
        {
          style: styles.statLabel,
        },
        label
      ),
      h(
        "div",
        {
          style: styles.statValue,
        },
        value
      )
    );
  }

  return h(
    "div",
    {
      style: styles.wrap,
    },

    h(
      "div",
      {
        style: styles.card,
      },

      h(
        "div",
        {
          style: styles.head,
        },

        h(
          "h2",
          {
            style: styles.title,
          },
          "Image Compressor"
        ),

        h(
          "p",
          {
            style: styles.sub,
          },
          "Compress images locally with smart quality, target-size and dimension controls. Your images never leave this browser."
        )
      ),

      h("input", {
        ref: inputRef,
        type: "file",
        accept: "image/*",
        multiple: true,
        onChange: onInputChange,
        style: {
          display: "none",
        },
      }),

      h(
        "div",
        {
          style: Object.assign(
            {},
            styles.drop,
            dragging
              ? styles.dropActive
              : {}
          ),

          onClick: function () {
            if (
              inputRef.current
            ) {
              inputRef.current.click();
            }
          },

          onDragOver:
            function (event) {
              event.preventDefault();
              setDragging(true);
            },

          onDragEnter:
            function (event) {
              event.preventDefault();
              setDragging(true);
            },

          onDragLeave:
            function () {
              setDragging(false);
            },

          onDrop: onDrop,
        },

        h(
          "div",
          null,

          h(
            "div",
            {
              style:
                styles.uploadIcon,
            },
            "↑"
          ),

          h(
            "div",
            {
              style: {
                fontWeight: 800,
                fontSize: 17,
              },
            },
            dragging
              ? "Drop images now"
              : "Drop your images here"
          ),

          h(
            "div",
            {
              style: {
                marginTop: 6,
                color: "#64748b",
                fontSize: 13,
              },
            },
            "or click to browse • JPG, PNG, WebP, GIF and more"
          ),

          files.length
            ? h(
                "div",
                {
                  style: {
                    marginTop: 10,
                    color: "#4f46e5",
                    fontSize: 12,
                    fontWeight: 750,
                  },
                },
                files.length +
                  " image" +
                  (files.length === 1
                    ? ""
                    : "s") +
                  " selected"
              )
            : null
        )
      ),

      h(
        "div",
        {
          style: styles.controls,
        },

        h(
          "div",
          {
            style: styles.field,
          },

          h(
            "label",
            {
              style: styles.label,
            },
            "Compression Quality — " +
              quality +
              "%"
          ),

          h("input", {
            style: styles.range,
            type: "range",
            min: 10,
            max: 100,
            value: quality,

            onChange:
              function (event) {
                setQuality(
                  Number(
                    event.target.value
                  )
                );
              },
          }),

          h(
            "div",
            {
              style: styles.hint,
            },
            "Higher = better quality • Lower = smaller file"
          )
        ),

        h(
          "div",
          {
            style: styles.field,
          },

          h(
            "label",
            {
              style: styles.label,
            },
            "Output Format"
          ),

          h(
            "select",
            {
              style: styles.select,
              value: format,

              onChange:
                function (event) {
                  setFormat(
                    event.target.value
                  );
                },
            },

            h(
              "option",
              {
                value: "webp",
              },
              "WebP — Recommended"
            ),

            h(
              "option",
              {
                value: "jpeg",
              },
              "JPG — Maximum compatibility"
            ),

            h(
              "option",
              {
                value: "png",
              },
              "PNG — Lossless"
            )
          ),

          h(
            "div",
            {
              style: styles.hint,
            },
            format === "png"
              ? "PNG is lossless and can sometimes be larger."
              : "WebP/JPG usually produce the biggest savings."
          )
        ),

        h(
          "div",
          {
            style: styles.field,
          },

          h(
            "label",
            {
              style: styles.label,
            },
            "Smart Target Size (KB)"
          ),

          h("input", {
            style: styles.input,
            type: "number",
            min: 0,
            placeholder: "e.g. 300",
            value:
              targetKB || "",

            onChange:
              function (event) {
                setTargetKB(
                  event.target.value ===
                    ""
                    ? 0
                    : Number(
                        event.target
                          .value
                      )
                );
              },
          }),

          h(
            "div",
            {
              style: styles.hint,
            },
            "Optional. Best with WebP or JPG."
          )
        ),

        h(
          "div",
          {
            style: styles.field,
          },

          h(
            "label",
            {
              style: styles.label,
            },
            "Max Width (px)"
          ),

          h("input", {
            style: styles.input,
            type: "number",
            min: 0,
            placeholder: "Original",
            value:
              maxWidth || "",

            onChange:
              function (event) {
                setMaxWidth(
                  event.target.value ===
                    ""
                    ? 0
                    : Number(
                        event.target
                          .value
                      )
                );
              },
          })
        ),

        h(
          "div",
          {
            style: styles.field,
          },

          h(
            "label",
            {
              style: styles.label,
            },
            "Max Height (px)"
          ),

          h("input", {
            style: styles.input,
            type: "number",
            min: 0,
            placeholder: "Original",
            value:
              maxHeight || "",

            onChange:
              function (event) {
                setMaxHeight(
                  event.target.value ===
                    ""
                    ? 0
                    : Number(
                        event.target
                          .value
                      )
                );
              },
          })
        ),

        h(
          "div",
          {
            style: styles.field,
          },

          h(
            "div",
            {
              style: styles.row,
            },

            h(
              "label",
              {
                style: Object.assign(
                  {},
                  styles.label,
                  {
                    marginBottom: 0,
                  }
                ),
              },
              "Auto Download"
            ),

            h("input", {
              type: "checkbox",
              checked: autoDownload,

              onChange:
                function (event) {
                  setAutoDownload(
                    event.target
                      .checked
                  );
                },

              style: {
                width: 20,
                height: 20,
                accentColor:
                  "#4f46e5",
              },
            })
          ),

          h(
            "div",
            {
              style: styles.hint,
            },
            autoDownload
              ? "Each successful result downloads automatically."
              : "Results stay here until you download them."
          )
        )
      ),

      error
        ? h(
            "div",
            {
              style: styles.error,
            },
            error
          )
        : null,

      h(
        "div",
        {
          style: styles.actions,
        },

        h(
          "button",
          {
            type: "button",

            style: Object.assign(
              {},
              styles.btn,
              styles.primary,

              working ||
              !files.length
                ? {
                    opacity: 0.55,
                    cursor:
                      "not-allowed",
                  }
                : {}
            ),

            disabled:
              working ||
              !files.length,

            onClick:
              runCompression,
          },

          working
            ? "Compressing…"
            : "Compress Images"
        ),

        h(
          "button",
          {
            type: "button",
            style: styles.btn,

            onClick:
              function () {
                if (
                  inputRef.current
                ) {
                  inputRef.current.click();
                }
              },
          },
          "+ Add Images"
        ),

        h(
          "button",
          {
            type: "button",

            style: Object.assign(
              {},
              styles.btn,

              !successful
                ? {
                    opacity: 0.5,
                    cursor:
                      "not-allowed",
                  }
                : {}
            ),

            disabled:
              !successful,

            onClick:
              downloadAll,
          },

          "Download All"
        ),

        h(
          "button",
          {
            type: "button",

            style: Object.assign(
              {},
              styles.btn,
              styles.danger
            ),

            onClick:
              clearAll,
          },

          "Clear"
        )
      ),

      h(
        "div",
        {
          style: styles.stats,
        },

        stat(
          "Images",
          results.length
            ? String(
                results.length
              )
            : String(files.length)
        ),

        stat(
          "Original",
          formatBytes(
            originalTotal
          )
        ),

        stat(
          "Compressed",
          formatBytes(
            compressedTotal
          )
        ),

        stat(
          "Space Saved",
          compressedTotal > 0
            ? saved.toFixed(1) +
                "%"
            : "—"
        )
      ),

      results.length
        ? h(
            "div",
            {
              style: styles.list,
            },

            results.map(
              function (
                item,
                index
              ) {
                const percentSaved =
                  item.originalSize >
                    0 &&
                  item.blob
                    ? Math.max(
                        0,
                        (1 -
                          item.blob
                            .size /
                            item.originalSize) *
                          100
                      )
                    : 0;

                return h(
                  "div",
                  {
                    style:
                      styles.item,

                    key:
                      item.name +
                      "-" +
                      index,
                  },

                  item.preview
                    ? h("img", {
                        src:
                          item.preview,
                        alt:
                          item.name,
                        style:
                          styles.thumb,
                      })
                    : h(
                        "div",
                        {
                          style:
                            Object.assign(
                              {},
                              styles.thumb,
                              {
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                fontSize: 11,
                              }
                            ),
                        },
                        "Error"
                      ),

                  h(
                    "div",
                    {
                      style: {
                        minWidth: 0,
                      },
                    },

                    h(
                      "div",
                      {
                        style:
                          styles.itemName,
                        title:
                          item.name,
                      },
                      item.name
                    ),

                    item.blob
                      ? h(
                          "div",
                          {
                            style:
                              styles.itemMeta,
                          },

                          formatBytes(
                            item.originalSize
                          ),

                          " → ",

                          formatBytes(
                            item.blob
                              .size
                          ),

                          item.unchanged
                            ? h(
                                "span",
                                {
                                  style:
                                    Object.assign(
                                      {},
                                      styles.badge,
                                      {
                                        background:
                                          "#fff7ed",
                                        color:
                                          "#c2410c",
                                      }
                                    ),
                                },
                                "Already optimized"
                              )
                            : h(
                                "span",
                                {
                                  style:
                                    styles.badge,
                                },
                                percentSaved.toFixed(
                                  0
                                ) +
                                  "% smaller"
                              ),

                          " • ",

                          item.width +
                            " × " +
                            item.height
                        )
                      : h(
                          "div",
                          {
                            style:
                              Object.assign(
                                {},
                                styles.itemMeta,
                                {
                                  color:
                                    "#be123c",
                                }
                              ),
                          },
                          item.error ||
                            "Compression failed."
                        )
                  ),

                  h(
                    "div",
                    {
                      style: {
                        display:
                          "flex",
                        gap: 7,
                      },
                    },

                    item.blob
                      ? h(
                          "button",
                          {
                            type:
                              "button",

                            style:
                              Object.assign(
                                {},
                                styles.btn,
                                {
                                  padding:
                                    "9px 12px",
                                }
                              ),

                            onClick:
                              function () {
                                downloadBlob(
                                  item.blob,
                                  safeFileName(
                                    item.name,
                                    format
                                  )
                                );
                              },
                          },
                          "Download"
                        )
                      : null,

                    h(
                      "button",
                      {
                        type:
                          "button",

                        style:
                          Object.assign(
                            {},
                            styles.btn,
                            styles.danger,
                            {
                              padding:
                                "9px 12px",
                            }
                          ),

                        onClick:
                          function () {
                            removeFile(
                              index
                            );
                          },
                      },
                      "Remove"
                    )
                  )
                );
              }
            )
          )
        : h(
            "div",
            {
              style:
                styles.empty,
            },
            "Select one or more images to see their details here before compression."
          ),

      h(
        "div",
        {
          style: styles.footer,
        },
        "Privacy friendly: all processing happens directly inside your browser. No image is uploaded to a server."
      )
    )
  );
}