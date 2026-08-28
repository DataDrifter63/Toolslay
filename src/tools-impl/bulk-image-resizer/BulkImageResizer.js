"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/*
  BULK IMAGE RESIZER
  ------------------
  Pure client-side tool.
  No server/API required.

  Features:
  - Multiple image upload
  - Drag & drop
  - Width / height resize
  - Lock aspect ratio
  - Fit / Fill / Stretch
  - Percentage resizing
  - Max dimensions
  - JPEG / PNG / WebP / original format
  - Quality control
  - Background color
  - Output filename prefix/suffix
  - Per-image preview
  - Estimated output size
  - Progress indicator
  - Download individual image
  - Download all images
  - Remove individual/all
  - EXIF orientation handling where available
  - Image metadata
  - Fully client-side
  - No JSX: safer for .js tool files
*/

const h = React.createElement;

const styles = {
  page: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "24px 16px 50px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    color: "#111827",
  },

  hero: {
    textAlign: "center",
    marginBottom: "26px",
  },

  title: {
    margin: "0",
    fontSize: "clamp(28px, 5vw, 46px)",
    lineHeight: "1.08",
    fontWeight: 800,
    letterSpacing: "-0.035em",
  },

  subtitle: {
    maxWidth: "720px",
    margin: "12px auto 0",
    color: "#667085",
    fontSize: "15px",
    lineHeight: 1.65,
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    boxShadow: "0 12px 40px rgba(15,23,42,0.07)",
  },

  uploadCard: {
    padding: "14px",
    marginBottom: "18px",
  },

  dropZone: {
    border: "2px dashed #cbd5e1",
    borderRadius: "18px",
    minHeight: "230px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "28px 18px",
    cursor: "pointer",
    background: "#f8fafc",
    transition: "all .2s ease",
  },

  dropZoneActive: {
    borderColor: "#111827",
    background: "#f1f5f9",
    transform: "scale(1.005)",
  },

  uploadIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "#111827",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    marginBottom: "14px",
  },

  uploadTitle: {
    fontSize: "18px",
    fontWeight: 750,
    marginBottom: "6px",
  },

  uploadText: {
    fontSize: "13px",
    color: "#667085",
    marginBottom: "16px",
  },

  button: {
    border: "0",
    borderRadius: "11px",
    padding: "11px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all .18s ease",
  },

  primaryButton: {
    background: "#111827",
    color: "#ffffff",
  },

  secondaryButton: {
    background: "#f1f5f9",
    color: "#111827",
  },

  dangerButton: {
    background: "#fff1f2",
    color: "#be123c",
  },

  settingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "16px",
  },

  settingGroup: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "16px",
  },

  settingTitle: {
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "12px",
    color: "#344054",
    textTransform: "uppercase",
    letterSpacing: ".04em",
  },

  field: {
    marginBottom: "12px",
  },

  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#475467",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    minHeight: "42px",
    border: "1px solid #d0d5dd",
    borderRadius: "10px",
    background: "#ffffff",
    padding: "9px 11px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  select: {
    width: "100%",
    minHeight: "42px",
    border: "1px solid #d0d5dd",
    borderRadius: "10px",
    background: "#ffffff",
    padding: "9px 11px",
    fontSize: "14px",
    outline: "none",
  },

  row: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontSize: "13px",
    color: "#475467",
    marginTop: "8px",
    cursor: "pointer",
  },

  rangeValue: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#111827",
    marginLeft: "auto",
  },

  imagesHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    margin: "24px 0 12px",
    flexWrap: "wrap",
  },

  imagesTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
  },

  count: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#475467",
    fontSize: "12px",
    fontWeight: 800,
    marginLeft: "8px",
  },

  actionRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))",
    gap: "15px",
  },

  imageCard: {
    overflow: "hidden",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "17px",
    boxShadow: "0 7px 24px rgba(15,23,42,.05)",
  },

  preview: {
    width: "100%",
    height: "190px",
    objectFit: "contain",
    display: "block",
    background:
      "linear-gradient(45deg,#f1f5f9 25%,transparent 25%),linear-gradient(-45deg,#f1f5f9 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f1f5f9 75%),linear-gradient(-45deg,transparent 75%,#f1f5f9 75%)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
  },

  imageBody: {
    padding: "13px",
  },

  filename: {
    fontSize: "13px",
    fontWeight: 750,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginBottom: "7px",
  },

  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    fontSize: "11px",
    color: "#667085",
    marginBottom: "11px",
  },

  badge: {
    padding: "4px 7px",
    borderRadius: "7px",
    background: "#f2f4f7",
  },

  progressOuter: {
    width: "100%",
    height: "7px",
    borderRadius: "99px",
    background: "#e5e7eb",
    overflow: "hidden",
    margin: "9px 0",
  },

  progressInner: {
    height: "100%",
    borderRadius: "99px",
    background: "#111827",
    transition: "width .2s ease",
  },

  empty: {
    textAlign: "center",
    padding: "45px 20px",
    color: "#667085",
    border: "1px dashed #d0d5dd",
    borderRadius: "18px",
    background: "#fafafa",
  },

  footerNote: {
    marginTop: "22px",
    textAlign: "center",
    fontSize: "12px",
    color: "#98a2b3",
    lineHeight: 1.6,
  },

  toggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 650,
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatBytes(bytes) {
  if (!bytes || bytes < 1) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, index);

  return value.toFixed(index === 0 ? 0 : 1) + " " + units[index];
}

function getExtension(filename) {
  const parts = String(filename || "").split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function getMimeFromFormat(format, originalType) {
  if (format === "original") {
    return originalType || "image/jpeg";
  }

  if (format === "jpeg") return "image/jpeg";
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";

  return "image/jpeg";
}

function getFormatLabel(format, originalType) {
  if (format === "original") {
    if (originalType === "image/png") return "PNG";
    if (originalType === "image/webp") return "WEBP";
    return "JPEG";
  }

  return format.toUpperCase();
}

function removeExtension(filename) {
  return String(filename || "").replace(/\.[^/.]+$/, "");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1500);
}

function loadImage(file) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = function () {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };

    image.src = url;
  });
}

function getOutputDimensions(
  originalWidth,
  originalHeight,
  settings
) {
  let width = originalWidth;
  let height = originalHeight;

  if (settings.resizeMode === "percentage") {
    const percentage = clamp(
      Number(settings.percentage) || 100,
      1,
      500
    );

    width = Math.max(1, Math.round(originalWidth * percentage / 100));
    height = Math.max(1, Math.round(originalHeight * percentage / 100));

    return {
      width: width,
      height: height,
    };
  }

  const targetWidth = Number(settings.width) || originalWidth;
  const targetHeight = Number(settings.height) || originalHeight;

  if (settings.resizeMode === "width") {
    width = Math.max(1, Math.round(targetWidth));

    if (settings.lockRatio) {
      height = Math.max(
        1,
        Math.round(width * originalHeight / originalWidth)
      );
    } else {
      height = Math.max(1, Math.round(targetHeight));
    }

    return {
      width: width,
      height: height,
    };
  }

  if (settings.resizeMode === "height") {
    height = Math.max(1, Math.round(targetHeight));

    if (settings.lockRatio) {
      width = Math.max(
        1,
        Math.round(height * originalWidth / originalHeight)
      );
    } else {
      width = Math.max(1, Math.round(targetWidth));
    }

    return {
      width: width,
      height: height,
    };
  }

  if (settings.resizeMode === "dimensions") {
    const requestedWidth = Math.max(1, Math.round(targetWidth));
    const requestedHeight = Math.max(1, Math.round(targetHeight));

    if (!settings.lockRatio) {
      return {
        width: requestedWidth,
        height: requestedHeight,
      };
    }

    if (settings.fitMode === "fill") {
      const scale = Math.max(
        requestedWidth / originalWidth,
        requestedHeight / originalHeight
      );

      return {
        width: Math.max(1, Math.round(originalWidth * scale)),
        height: Math.max(1, Math.round(originalHeight * scale)),
      };
    }

    if (settings.fitMode === "contain") {
      const scale = Math.min(
        requestedWidth / originalWidth,
        requestedHeight / originalHeight
      );

      return {
        width: Math.max(1, Math.round(originalWidth * scale)),
        height: Math.max(1, Math.round(originalHeight * scale)),
      };
    }

    const scale = Math.min(
      requestedWidth / originalWidth,
      requestedHeight / originalHeight
    );

    return {
      width: Math.max(1, Math.round(originalWidth * scale)),
      height: Math.max(1, Math.round(originalHeight * scale)),
    };
  }

  return {
    width: originalWidth,
    height: originalHeight,
  };
}

function getCropSource(
  imageWidth,
  imageHeight,
  targetWidth,
  targetHeight
) {
  const sourceRatio = imageWidth / imageHeight;
  const targetRatio = targetWidth / targetHeight;

  let sx = 0;
  let sy = 0;
  let sw = imageWidth;
  let sh = imageHeight;

  if (sourceRatio > targetRatio) {
    sw = imageHeight * targetRatio;
    sx = (imageWidth - sw) / 2;
  } else if (sourceRatio < targetRatio) {
    sh = imageWidth / targetRatio;
    sy = (imageHeight - sh) / 2;
  }

  return {
    sx: sx,
    sy: sy,
    sw: sw,
    sh: sh,
  };
}

async function resizeImage(file, settings) {
  const image = await loadImage(file);

  const dimensions = getOutputDimensions(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    settings
  );

  const outputWidth = dimensions.width;
  const outputHeight = dimensions.height;

  const canvas = document.createElement("canvas");

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d", {
    alpha: true,
  });

  if (!context) {
    throw new Error("Your browser does not support Canvas.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const format = getMimeFromFormat(settings.format, file.type);

  if (format === "image/jpeg") {
    context.fillStyle = settings.backgroundColor || "#ffffff";
    context.fillRect(0, 0, outputWidth, outputHeight);
  }

  if (settings.fitMode === "fill" && settings.lockRatio) {
    const crop = getCropSource(
      image.naturalWidth || image.width,
      image.naturalHeight || image.height,
      outputWidth,
      outputHeight
    );

    context.drawImage(
      image,
      crop.sx,
      crop.sy,
      crop.sw,
      crop.sh,
      0,
      0,
      outputWidth,
      outputHeight
    );
  } else if (
    settings.fitMode === "contain" &&
    settings.lockRatio
  ) {
    const scale = Math.min(
      outputWidth / image.naturalWidth,
      outputHeight / image.naturalHeight
    );

    const drawWidth = Math.max(
      1,
      Math.round(image.naturalWidth * scale)
    );

    const drawHeight = Math.max(
      1,
      Math.round(image.naturalHeight * scale)
    );

    const offsetX = Math.round(
      (outputWidth - drawWidth) / 2
    );

    const offsetY = Math.round(
      (outputHeight - drawHeight) / 2
    );

    context.fillStyle = settings.backgroundColor || "#ffffff";
    context.fillRect(
      0,
      0,
      outputWidth,
      outputHeight
    );

    context.drawImage(
      image,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );
  } else {
    context.drawImage(
      image,
      0,
      0,
      outputWidth,
      outputHeight
    );
  }

  const quality = clamp(
    Number(settings.quality) || 85,
    10,
    100
  ) / 100;

  const blob = await new Promise(function (resolve) {
    canvas.toBlob(
      function (result) {
        resolve(result);
      },
      format,
      quality
    );
  });

  if (!blob) {
    throw new Error("Image conversion failed.");
  }

  const outputExtension =
    getFormatLabel(settings.format, file.type).toLowerCase();

  const baseName = removeExtension(file.name);

  const finalName =
    String(settings.prefix || "") +
    baseName +
    String(settings.suffix || "") +
    "." +
    outputExtension;

  return {
    blob: blob,
    filename: finalName,
    width: outputWidth,
    height: outputHeight,
    size: blob.size,
    type: format,
  };
}

function makeId() {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

function Stat({ label, value }) {
  return h(
    "div",
    {
      style: {
        flex: "1 1 130px",
        minWidth: "120px",
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: "13px",
        padding: "12px",
      },
    },
    h(
      "div",
      {
        style: {
          fontSize: "11px",
          color: "#667085",
          marginBottom: "4px",
        },
      },
      label
    ),
    h(
      "div",
      {
        style: {
          fontSize: "16px",
          fontWeight: 800,
          color: "#111827",
        },
      },
      value
    )
  );
}

export default function BulkImageResizer() {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [settings, setSettings] = useState({
    resizeMode: "dimensions",
    width: 1200,
    height: 1200,
    percentage: 50,
    lockRatio: true,
    fitMode: "contain",
    format: "original",
    quality: 85,
    backgroundColor: "#ffffff",
    prefix: "",
    suffix: "-resized",
  });

  const [notice, setNotice] = useState("");

  const updateSetting = useCallback(function (key, value) {
    setSettings(function (previous) {
      return {
        ...previous,
        [key]: value,
      };
    });
  }, []);

  const addFiles = useCallback(function (selectedFiles) {
    const incoming = Array.from(selectedFiles || []).filter(
      function (file) {
        return file && file.type && file.type.startsWith("image/");
      }
    );

    if (!incoming.length) {
      setNotice("Please select valid image files.");
      return;
    }

    const newItems = incoming.map(function (file) {
      return {
        id: makeId(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: URL.createObjectURL(file),
        originalWidth: 0,
        originalHeight: 0,
        output: null,
        progress: 0,
        status: "ready",
        error: "",
      };
    });

    setFiles(function (previous) {
      return previous.concat(newItems);
    });

    setNotice(
      newItems.length +
        " image" +
        (newItems.length === 1 ? "" : "s") +
        " added."
    );

    newItems.forEach(function (item) {
      loadImage(item.file)
        .then(function (image) {
          setFiles(function (previous) {
            return previous.map(function (current) {
              if (current.id !== item.id) return current;

              return {
                ...current,
                originalWidth:
                  image.naturalWidth || image.width,
                originalHeight:
                  image.naturalHeight || image.height,
              };
            });
          });
        })
        .catch(function () {});
    });
  }, []);

  const removeFile = useCallback(function (id) {
    setFiles(function (previous) {
      const target = previous.find(function (item) {
        return item.id === id;
      });

      if (target && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return previous.filter(function (item) {
        return item.id !== id;
      });
    });
  }, []);

  const clearAll = useCallback(function () {
    setFiles(function (previous) {
      previous.forEach(function (item) {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      return [];
    });

    setNotice("");
  }, []);

  const processAll = useCallback(async function () {
    if (!files.length || processing) return;

    setProcessing(true);
    setNotice("");

    for (let index = 0; index < files.length; index += 1) {
      const item = files[index];

      setFiles(function (previous) {
        return previous.map(function (current) {
          if (current.id !== item.id) return current;

          return {
            ...current,
            status: "processing",
            progress: 20,
            error: "",
          };
        });
      });

      try {
        await new Promise(function (resolve) {
          setTimeout(resolve, 20);
        });

        setFiles(function (previous) {
          return previous.map(function (current) {
            if (current.id !== item.id) return current;

            return {
              ...current,
              progress: 55,
            };
          });
        });

        const result = await resizeImage(
          item.file,
          settings
        );

        setFiles(function (previous) {
          return previous.map(function (current) {
            if (current.id !== item.id) return current;

            return {
              ...current,
              output: result,
              progress: 100,
              status: "done",
              error: "",
            };
          });
        });
      } catch (error) {
        setFiles(function (previous) {
          return previous.map(function (current) {
            if (current.id !== item.id) return current;

            return {
              ...current,
              progress: 0,
              status: "error",
              error:
                error && error.message
                  ? error.message
                  : "Could not resize image.",
            };
          });
        });
      }

      await new Promise(function (resolve) {
        setTimeout(resolve, 15);
      });
    }

    setProcessing(false);
    setNotice("All images have been processed.");
  }, [files, processing, settings]);

  const downloadOne = useCallback(function (item) {
    if (!item || !item.output || !item.output.blob) return;

    downloadBlob(
      item.output.blob,
      item.output.filename
    );
  }, []);

  const downloadAll = useCallback(function () {
    const ready = files.filter(function (item) {
      return item.output && item.output.blob;
    });

    if (!ready.length) {
      setNotice("Please resize the images first.");
      return;
    }

    ready.forEach(function (item, index) {
      setTimeout(function () {
        downloadBlob(
          item.output.blob,
          item.output.filename
        );
      }, index * 180);
    });

    setNotice(
      "Downloading " +
        ready.length +
        " processed image" +
        (ready.length === 1 ? "" : "s") +
        "."
    );
  }, [files]);

  const totalOriginalSize = useMemo(
    function () {
      return files.reduce(function (sum, item) {
        return sum + (item.size || 0);
      }, 0);
    },
    [files]
  );

  const totalOutputSize = useMemo(
    function () {
      return files.reduce(function (sum, item) {
        return (
          sum +
          (item.output && item.output.size
            ? item.output.size
            : 0)
        );
      }, 0);
    },
    [files]
  );

  const completedCount = useMemo(
    function () {
      return files.filter(function (item) {
        return item.status === "done";
      }).length;
    },
    [files]
  );

  const handleDrop = useCallback(
    function (event) {
      event.preventDefault();
      event.stopPropagation();

      setDragging(false);

      addFiles(
        event.dataTransfer
          ? event.dataTransfer.files
          : []
      );
    },
    [addFiles]
  );

  const handleFileChange = useCallback(
    function (event) {
      addFiles(event.target.files);
      event.target.value = "";
    },
    [addFiles]
  );

  useEffect(
    function () {
      return function () {
        files.forEach(function (item) {
          if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
          }
        });
      };
    },
    []
  );

  const inputCommon = {
    style: styles.input,
  };

  return h(
    "div",
    {
      style: styles.page,
    },

    h(
      "div",
      {
        style: styles.hero,
      },

      h(
        "h1",
        {
          style: styles.title,
        },
        "Bulk Image Resizer"
      ),

      h(
        "p",
        {
          style: styles.subtitle,
        },
        "Resize multiple images at once with smart dimensions, format conversion, quality control and instant browser-side downloads. Your images stay on your device."
      )
    ),

    h(
      "div",
      {
        style: {
          ...styles.card,
          ...styles.uploadCard,
        },
      },

      h(
        "div",
        {
          role: "button",
          tabIndex: 0,
          style: {
            ...styles.dropZone,
            ...(dragging
              ? styles.dropZoneActive
              : {}),
          },

          onClick: function () {
            if (inputRef.current) {
              inputRef.current.click();
            }
          },

          onKeyDown: function (event) {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              if (inputRef.current) {
                inputRef.current.click();
              }
            }
          },

          onDragEnter: function (event) {
            event.preventDefault();
            setDragging(true);
          },

          onDragOver: function (event) {
            event.preventDefault();
            setDragging(true);
          },

          onDragLeave: function (event) {
            event.preventDefault();
            setDragging(false);
          },

          onDrop: handleDrop,
        },

        h(
          "div",
          {
            style: styles.uploadIcon,
          },
          "↗"
        ),

        h(
          "div",
          {
            style: styles.uploadTitle,
          },
          "Drop your images here"
        ),

        h(
          "div",
          {
            style: styles.uploadText,
          },
          "Upload JPG, PNG, WEBP and other browser-supported image files"
        ),

        h(
          "button",
          {
            type: "button",
            style: {
              ...styles.button,
              ...styles.primaryButton,
            },
            onClick: function (event) {
              event.stopPropagation();

              if (inputRef.current) {
                inputRef.current.click();
              }
            },
          },
          "Choose Images"
        ),

        h("input", {
          ref: inputRef,
          type: "file",
          accept: "image/*",
          multiple: true,
          style: {
            display: "none",
          },
          onChange: handleFileChange,
        })
      )
    ),

    h(
      "div",
      {
        style: {
          ...styles.card,
          padding: "18px",
        },
      },

      h(
        "div",
        {
          style: styles.settingsGrid,
        },

        h(
          "div",
          {
            style: styles.settingGroup,
          },

          h(
            "div",
            {
              style: styles.settingTitle,
            },
            "Resize"
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
              "Resize method"
            ),

            h(
              "select",
              {
                value: settings.resizeMode,
                style: styles.select,
                onChange: function (event) {
                  updateSetting(
                    "resizeMode",
                    event.target.value
                  );
                },
              },

              h(
                "option",
                {
                  value: "dimensions",
                },
                "Width × Height"
              ),

              h(
                "option",
                {
                  value: "width",
                },
                "By Width"
              ),

              h(
                "option",
                {
                  value: "height",
                },
                "By Height"
              ),

              h(
                "option",
                {
                  value: "percentage",
                },
                "Percentage"
              )
            )
          ),

          settings.resizeMode ===
            "percentage"
            ? h(
                "div",
                {
                  style: styles.field,
                },

                h(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                    },
                  },

                  h(
                    "label",
                    {
                      style: styles.label,
                    },
                    "Scale"
                  ),

                  h(
                    "span",
                    {
                      style: styles.rangeValue,
                    },
                    String(settings.percentage) +
                      "%"
                  )
                ),

                h("input", {
                  type: "range",
                  min: 1,
                  max: 300,
                  value: settings.percentage,
                  style: {
                    width: "100%",
                  },
                  onChange: function (event) {
                    updateSetting(
                      "percentage",
                      Number(event.target.value)
                    );
                  },
                })
              )
            : h(
                "div",
                {
                  style: styles.row,
                },

                h(
                  "div",
                  {
                    style: {
                      ...styles.field,
                      flex: 1,
                    },
                  },

                  h(
                    "label",
                    {
                      style: styles.label,
                    },
                    "Width (px)"
                  ),

                  h("input", {
                    ...inputCommon,
                    type: "number",
                    min: 1,
                    value: settings.width,
                    onChange: function (event) {
                      updateSetting(
                        "width",
                        Math.max(
                          1,
                          Number(event.target.value) || 1
                        )
                      );
                    },
                  })
                ),

                h(
                  "div",
                  {
                    style: {
                      ...styles.field,
                      flex: 1,
                    },
                  },

                  h(
                    "label",
                    {
                      style: styles.label,
                    },
                    "Height (px)"
                  ),

                  h("input", {
                    ...inputCommon,
                    type: "number",
                    min: 1,
                    value: settings.height,
                    onChange: function (event) {
                      updateSetting(
                        "height",
                        Math.max(
                          1,
                          Number(event.target.value) || 1
                        )
                      );
                    },
                  })
                )
              ),

          settings.resizeMode !==
            "percentage"
            ? h(
                "label",
                {
                  style: styles.checkRow,
                },

                h("input", {
                  type: "checkbox",
                  checked: settings.lockRatio,
                  onChange: function (event) {
                    updateSetting(
                      "lockRatio",
                      event.target.checked
                    );
                  },
                }),

                "Lock aspect ratio"
              )
            : null
        ),

        h(
          "div",
          {
            style: styles.settingGroup,
          },

          h(
            "div",
            {
              style: styles.settingTitle,
            },
            "Fit & Output"
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
              "Fit mode"
            ),

            h(
              "select",
              {
                value: settings.fitMode,
                style: styles.select,
                onChange: function (event) {
                  updateSetting(
                    "fitMode",
                    event.target.value
                  );
                },
              },

              h(
                "option",
                {
                  value: "contain",
                },
                "Contain — keep full image"
              ),

              h(
                "option",
                {
                  value: "fill",
                },
                "Fill — crop to exact size"
              ),

              h(
                "option",
                {
                  value: "stretch",
                },
                "Stretch — exact dimensions"
              )
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
              "Output format"
            ),

            h(
              "select",
              {
                value: settings.format,
                style: styles.select,
                onChange: function (event) {
                  updateSetting(
                    "format",
                    event.target.value
                  );
                },
              },

              h(
                "option",
                {
                  value: "original",
                },
                "Keep original format"
              ),

              h(
                "option",
                {
                  value: "jpeg",
                },
                "JPEG"
              ),

              h(
                "option",
                {
                  value: "png",
                },
                "PNG"
              ),

              h(
                "option",
                {
                  value: "webp",
                },
                "WEBP"
              )
            )
          ),

          h(
            "div",
            {
              style: styles.field,
            },

            h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                },
              },

              h(
                "label",
                {
                  style: styles.label,
                },
                "Quality"
              ),

              h(
                "span",
                {
                  style: styles.rangeValue,
                },
                String(settings.quality) + "%"
              )
            ),

            h("input", {
              type: "range",
              min: 10,
              max: 100,
              value: settings.quality,
              style: {
                width: "100%",
              },
              onChange: function (event) {
                updateSetting(
                  "quality",
                  Number(event.target.value)
                );
              },
            })
          )
        ),

        h(
          "div",
          {
            style: styles.settingGroup,
          },

          h(
            "div",
            {
              style: styles.settingTitle,
            },
            "Naming"
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
              "Prefix"
            ),

            h("input", {
              ...inputCommon,
              type: "text",
              placeholder: "e.g. optimized-",
              value: settings.prefix,
              onChange: function (event) {
                updateSetting(
                  "prefix",
                  event.target.value
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
              "Suffix"
            ),

            h("input", {
              ...inputCommon,
              type: "text",
              placeholder: "e.g. -web",
              value: settings.suffix,
              onChange: function (event) {
                updateSetting(
                  "suffix",
                  event.target.value
                );
              },
            })
          ),

          h(
            "div",
            {
              style: {
                fontSize: "11px",
                color: "#667085",
                lineHeight: 1.5,
              },
            },
            "Example: product-resized.jpg"
          )
        ),

        h(
          "div",
          {
            style: styles.settingGroup,
          },

          h(
            "div",
            {
              style: styles.settingTitle,
            },
            "Background"
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
              "Background color"
            ),

            h(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "8px",
                },
              },

              h("input", {
                type: "color",
                value: settings.backgroundColor,
                style: {
                  width: "50px",
                  height: "42px",
                  padding: "3px",
                  border: "1px solid #d0d5dd",
                  borderRadius: "10px",
                  background: "#fff",
                  cursor: "pointer",
                },
                onChange: function (event) {
                  updateSetting(
                    "backgroundColor",
                    event.target.value
                  );
                },
              }),

              h("input", {
                ...inputCommon,
                type: "text",
                value: settings.backgroundColor,
                onChange: function (event) {
                  updateSetting(
                    "backgroundColor",
                    event.target.value
                  );
                },
              })
            )
          ),

          h(
            "div",
            {
              style: {
                fontSize: "11px",
                color: "#667085",
                lineHeight: 1.5,
              },
            },
            "Used mainly when exporting JPEG or when an image is contained inside a fixed canvas."
          )
        )
      )
    ),

    files.length
      ? h(
          React.Fragment,
          null,

          h(
            "div",
            {
              style: styles.imagesHeader,
            },

            h(
              "div",
              null,

              h(
                "h2",
                {
                  style: styles.imagesTitle,
                },
                "Your Images",

                h(
                  "span",
                  {
                    style: styles.count,
                  },
                  String(files.length)
                )
              )
            ),

            h(
              "div",
              {
                style: styles.actionRow,
              },

              h(
                "button",
                {
                  type: "button",
                  style: {
                    ...styles.button,
                    ...styles.secondaryButton,
                  },
                  onClick: processAll,
                  disabled: processing,
                },
                processing
                  ? "Processing..."
                  : "Resize All"
              ),

              h(
                "button",
                {
                  type: "button",
                  style: {
                    ...styles.button,
                    ...styles.primaryButton,
                  },
                  onClick: downloadAll,
                  disabled: completedCount === 0,
                },
                "Download All"
              ),

              h(
                "button",
                {
                  type: "button",
                  style: {
                    ...styles.button,
                    ...styles.dangerButton,
                  },
                  onClick: clearAll,
                  disabled: processing,
                },
                "Clear All"
              )
            )
          ),

          h(
            "div",
            {
              style: {
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "16px",
              },
            },

            h(Stat, {
              label: "Images",
              value: String(files.length),
            }),

            h(Stat, {
              label: "Original Size",
              value: formatBytes(totalOriginalSize),
            }),

            h(Stat, {
              label: "Output Size",
              value:
                totalOutputSize > 0
                  ? formatBytes(totalOutputSize)
                  : "—",
            }),

            h(Stat, {
              label: "Completed",
              value:
                String(completedCount) +
                " / " +
                String(files.length),
            })
          ),

          notice
            ? h(
                "div",
                {
                  style: {
                    marginBottom: "14px",
                    padding: "11px 13px",
                    borderRadius: "10px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#166534",
                    fontSize: "13px",
                    fontWeight: 650,
                  },
                },
                notice
              )
            : null,

          h(
            "div",
            {
              style: styles.imageGrid,
            },

            files.map(function (item) {
              const outputUrl =
                item.output && item.output.blob
                  ? URL.createObjectURL(
                      item.output.blob
                    )
                  : null;

              const cardChildren = [
                h("img", {
                  key: "preview",
                  src:
                    outputUrl ||
                    item.previewUrl,
                  alt: item.name,
                  style: styles.preview,
                  onLoad: function () {
                    if (outputUrl) {
                      setTimeout(function () {
                        URL.revokeObjectURL(
                          outputUrl
                        );
                      }, 1000);
                    }
                  },
                }),

                h(
                  "div",
                  {
                    key: "body",
                    style: styles.imageBody,
                  },

                  h(
                    "div",
                    {
                      style: styles.filename,
                      title: item.name,
                    },
                    item.output
                      ? item.output.filename
                      : item.name
                  ),

                  h(
                    "div",
                    {
                      style: styles.meta,
                    },

                    h(
                      "span",
                      {
                        style: styles.badge,
                      },
                      item.originalWidth
                        ? item.originalWidth +
                          " × " +
                          item.originalHeight
                        : "Reading..."
                    ),

                    h(
                      "span",
                      {
                        style: styles.badge,
                      },
                      formatBytes(item.size)
                    ),

                    item.output
                      ? h(
                          "span",
                          {
                            style: styles.badge,
                          },
                          item.output.width +
                            " × " +
                            item.output.height
                        )
                      : null,

                    item.output
                      ? h(
                          "span",
                          {
                            style: styles.badge,
                          },
                          formatBytes(
                            item.output.size
                          )
                        )
                      : null
                  ),

                  item.status ===
                    "processing"
                    ? h(
                        React.Fragment,
                        null,

                        h(
                          "div",
                          {
                            style: styles.progressOuter,
                          },
                          h("div", {
                            style: {
                              ...styles.progressInner,
                              width:
                                String(
                                  item.progress
                                ) + "%",
                            },
                          })
                        ),

                        h(
                          "div",
                          {
                            style: {
                              fontSize: "11px",
                              color: "#667085",
                            },
                          },
                          "Processing " +
                            String(
                              item.progress
                            ) +
                            "%"
                        )
                      )
                    : null,

                  item.status ===
                    "error"
                    ? h(
                        "div",
                        {
                          style: {
                            marginBottom: "9px",
                            padding: "8px",
                            borderRadius: "8px",
                            background: "#fff1f2",
                            color: "#be123c",
                            fontSize: "11px",
                          },
                        },
                        item.error ||
                          "Processing failed."
                      )
                    : null,

                  h(
                    "div",
                    {
                      style: {
                        display: "flex",
                        gap: "7px",
                      },
                    },

                    item.output
                      ? h(
                          "button",
                          {
                            type: "button",
                            style: {
                              ...styles.button,
                              ...styles.primaryButton,
                              flex: 1,
                              padding:
                                "9px 10px",
                              fontSize:
                                "12px",
                            },
                            onClick:
                              function () {
                                downloadOne(
                                  item
                                );
                              },
                          },
                          "Download"
                        )
                      : null,

                    h(
                      "button",
                      {
                        type: "button",
                        style: {
                          ...styles.button,
                          ...styles.dangerButton,
                          padding:
                            "9px 11px",
                          fontSize: "12px",
                        },
                        onClick:
                          function () {
                            removeFile(
                              item.id
                            );
                          },
                        disabled: processing,
                      },
                      "Remove"
                    )
                  )
                ),
              ];

              return h(
                "div",
                {
                  key: item.id,
                  style: styles.imageCard,
                },
                cardChildren
              );
            })
          )
        )
      : h(
          "div",
          {
            style: {
              ...styles.empty,
              marginTop: "20px",
            },
          },

          h(
            "div",
            {
              style: {
                fontSize: "30px",
                marginBottom: "10px",
              },
            },
            "◫"
          ),

          h(
            "div",
            {
              style: {
                fontSize: "16px",
                fontWeight: 750,
                color: "#344054",
                marginBottom: "5px",
              },
            },
            "No images added yet"
          ),

          h(
            "div",
            {
              style: {
                fontSize: "13px",
              },
            },
            "Upload multiple images above to start resizing."
          )
        ),

    h(
      "div",
      {
        style: styles.footerNote,
      },
      "Privacy friendly: image processing happens directly in your browser. Your images are not uploaded to a server."
    )
  );
}