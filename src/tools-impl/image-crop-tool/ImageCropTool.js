"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const h = React.createElement;

const S = {
  wrap: {
    width: "100%",
    maxWidth: "1080px",
    margin: "0 auto",
    padding: "24px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    color: "#111827",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    boxShadow: "0 12px 40px rgba(15,23,42,.07)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "22px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "-0.7px",
  },
  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  badge: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#f5f3ff",
    color: "#5b45e6",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  upload: {
    border: "2px dashed #cbd5e1",
    borderRadius: "18px",
    minHeight: "190px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    cursor: "pointer",
    background: "#f8fafc",
    transition: "all .2s ease",
    padding: "30px",
  },
  uploadInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  uploadIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ede9fe",
    color: "#5b45e6",
    fontSize: "27px",
  },
  uploadTitle: {
    fontSize: "17px",
    fontWeight: 750,
  },
  muted: {
    color: "#64748b",
    fontSize: "13px",
  },
  hidden: {
    display: "none",
  },
  editor: {
    marginTop: "20px",
  },
  stage: {
    width: "100%",
    height: "520px",
    position: "relative",
    overflow: "hidden",
    borderRadius: "18px",
    background:
      "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
    backgroundSize: "24px 24px",
    backgroundPosition: "0 0,0 12px,12px -12px,-12px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
  },
  imageBox: {
    position: "relative",
    overflow: "visible",
    touchAction: "none",
  },
  image: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "fill",
    pointerEvents: "none",
  },
  shade: {
    position: "absolute",
    background: "rgba(0,0,0,.52)",
    pointerEvents: "none",
  },
  cropBox: {
    position: "absolute",
    border: "2px solid #ffffff",
    boxShadow: "0 0 0 1px rgba(91,69,230,.7), 0 8px 30px rgba(0,0,0,.25)",
    cursor: "move",
    touchAction: "none",
  },
  gridV1: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "33.333%",
    width: "1px",
    background: "rgba(255,255,255,.5)",
    pointerEvents: "none",
  },
  gridV2: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "66.666%",
    width: "1px",
    background: "rgba(255,255,255,.5)",
    pointerEvents: "none",
  },
  gridH1: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "33.333%",
    height: "1px",
    background: "rgba(255,255,255,.5)",
    pointerEvents: "none",
  },
  gridH2: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "66.666%",
    height: "1px",
    background: "rgba(255,255,255,.5)",
    pointerEvents: "none",
  },
  handle: {
    position: "absolute",
    width: "12px",
    height: "12px",
    borderRadius: "4px",
    background: "#ffffff",
    border: "2px solid #5b45e6",
    boxSizing: "border-box",
    zIndex: 5,
  },
  toolbar: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "12px",
  },
  control: {
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "13px",
    background: "#ffffff",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: ".5px",
    marginBottom: "8px",
  },
  select: {
    width: "100%",
    height: "40px",
    border: "1px solid #dbe2ea",
    borderRadius: "10px",
    padding: "0 10px",
    background: "#fff",
    color: "#111827",
    outline: "none",
  },
  range: {
    width: "100%",
    accentColor: "#5b45e6",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
    marginTop: "14px",
  },
  button: {
    height: "42px",
    padding: "0 15px",
    borderRadius: "11px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#172033",
    fontWeight: 700,
    cursor: "pointer",
  },
  primary: {
    height: "44px",
    padding: "0 19px",
    borderRadius: "11px",
    border: "0",
    background: "#5b45e6",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 7px 18px rgba(91,69,230,.22)",
  },
  danger: {
    height: "42px",
    padding: "0 15px",
    borderRadius: "11px",
    border: "1px solid #fecaca",
    background: "#fff7f7",
    color: "#dc2626",
    fontWeight: 700,
    cursor: "pointer",
  },
  info: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
    marginTop: "15px",
  },
  stat: {
    padding: "10px 13px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#475569",
  },
  statStrong: {
    color: "#111827",
    fontWeight: 800,
  },
  empty: {
    marginTop: "18px",
    padding: "15px",
    borderRadius: "12px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "13px",
  },
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function getFileExtension(format) {
  if (format === "image/jpeg") return "jpg";
  if (format === "image/webp") return "webp";
  return "png";
}

function ImageCropTool() {
  const inputRef = useRef(null);
  const imageRef = useRef(null);
  const stageRef = useRef(null);

  const [file, setFile] = useState(null);
  const [src, setSrc] = useState("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const [crop, setCrop] = useState({
    x: 10,
    y: 10,
    w: 80,
    h: 80,
  });

  const [aspect, setAspect] = useState("free");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [autoDownload, setAutoDownload] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [dragging, setDragging] = useState(null);

  const [resultInfo, setResultInfo] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadFile = useCallback(function (selectedFile) {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      return;
    }

    if (src) {
      URL.revokeObjectURL(src);
    }

    const url = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setSrc(url);
    setResultInfo(null);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setZoom(1);
  }, [src]);

  useEffect(function () {
    return function () {
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [src]);

  const onImageLoad = function (e) {
    const img = e.currentTarget;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });

    setCrop({
      x: 8,
      y: 8,
      w: 84,
      h: 84,
    });
  };

  const openPicker = function () {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const onInputChange = function (e) {
    const selected = e.target.files && e.target.files[0];
    if (selected) {
      loadFile(selected);
    }
    e.target.value = "";
  };

  const getPointerPercent = function (e) {
    const box = imageRef.current;
    if (!box) return { x: 0, y: 0 };

    const rect = box.getBoundingClientRect();

    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const startMove = function (e, type) {
    e.preventDefault();
    e.stopPropagation();

    const p = getPointerPercent(e);

    setDragging({
      type: type,
      startX: p.x,
      startY: p.y,
      crop: { ...crop },
    });
  };

  useEffect(function () {
    if (!dragging) return;

    const move = function (e) {
      const box = imageRef.current;
      if (!box) return;

      const rect = box.getBoundingClientRect();

      const dx = ((e.clientX - rect.left) / rect.width) * 100 - dragging.startX;
      const dy = ((e.clientY - rect.top) / rect.height) * 100 - dragging.startY;

      const original = dragging.crop;

      if (dragging.type === "move") {
        const nx = clamp(original.x + dx, 0, 100 - original.w);
        const ny = clamp(original.y + dy, 0, 100 - original.h);

        setCrop({
          x: nx,
          y: ny,
          w: original.w,
          h: original.h,
        });
        return;
      }

      let nx = original.x;
      let ny = original.y;
      let nw = original.w;
      let nh = original.h;

      if (dragging.type.indexOf("left") !== -1) {
        nx = clamp(original.x + dx, 0, original.x + original.w - 5);
        nw = original.x + original.w - nx;
      }

      if (dragging.type.indexOf("right") !== -1) {
        nw = clamp(original.w + dx, 5, 100 - original.x);
      }

      if (dragging.type.indexOf("top") !== -1) {
        ny = clamp(original.y + dy, 0, original.y + original.h - 5);
        nh = original.y + original.h - ny;
      }

      if (dragging.type.indexOf("bottom") !== -1) {
        nh = clamp(original.h + dy, 5, 100 - original.y);
      }

      if (aspect !== "free") {
        const ratio = Number(aspect);

        if (
          dragging.type === "left" ||
          dragging.type === "right"
        ) {
          nh = nw / ratio;
        } else if (
          dragging.type === "top" ||
          dragging.type === "bottom"
        ) {
          nw = nh * ratio;
        } else {
          nw = nw;
          nh = nw / ratio;
        }

        if (dragging.type.indexOf("left") !== -1) {
          nx = original.x + original.w - nw;
        }

        if (dragging.type.indexOf("top") !== -1) {
          ny = original.y + original.h - nh;
        }

        if (nx < 0) {
          nx = 0;
          nw = original.x + original.w;
          nh = nw / ratio;
        }

        if (ny < 0) {
          ny = 0;
          nh = original.y + original.h;
          nw = nh * ratio;
        }

        if (nx + nw > 100) {
          nw = 100 - nx;
          nh = nw / ratio;
        }

        if (ny + nh > 100) {
          nh = 100 - ny;
          nw = nh * ratio;
        }
      }

      setCrop({
        x: clamp(nx, 0, 95),
        y: clamp(ny, 0, 95),
        w: clamp(nw, 5, 100),
        h: clamp(nh, 5, 100),
      });
    };

    const up = function () {
      setDragging(null);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return function () {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, aspect]);

  const changeAspect = function (value) {
    setAspect(value);

    if (value === "free") return;

    const ratio = Number(value);
    const newH = crop.w / ratio;

    if (newH <= 100) {
      setCrop({
        ...crop,
        h: newH,
      });
    } else {
      const newW = crop.h * ratio;
      setCrop({
        ...crop,
        w: newW <= 100 ? newW : 100,
      });
    }
  };

  const resetCrop = function () {
    setCrop({
      x: 8,
      y: 8,
      w: 84,
      h: 84,
    });
    setZoom(1);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setResultInfo(null);
  };

  const selectPreset = function (value) {
    if (!imageSize.width || !imageSize.height) return;

    let ratio = null;

    if (value === "square") ratio = 1;
    if (value === "portrait") ratio = 4 / 5;
    if (value === "landscape") ratio = 16 / 9;
    if (value === "story") ratio = 9 / 16;
    if (value === "youtube") ratio = 16 / 9;

    if (!ratio) return;

    setAspect(String(ratio));

    let w = 84;
    let hh = w / ratio;

    if (hh > 84) {
      hh = 84;
      w = hh * ratio;
    }

    setCrop({
      x: (100 - w) / 2,
      y: (100 - hh) / 2,
      w: w,
      h: hh,
    });
  };

  const downloadBlob = function (blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  };

  const cropImage = async function () {
    if (!file || !imageRef.current) return;

    setBusy(true);

    try {
      const img = imageRef.current;

      const sourceX = Math.round(
        (crop.x / 100) * img.naturalWidth
      );

      const sourceY = Math.round(
        (crop.y / 100) * img.naturalHeight
      );

      const sourceW = Math.round(
        (crop.w / 100) * img.naturalWidth
      );

      const sourceH = Math.round(
        (crop.h / 100) * img.naturalHeight
      );

      const maxOutput = 4096;

      let outW = sourceW;
      let outH = sourceH;

      if (outW > maxOutput || outH > maxOutput) {
        const scale = Math.min(
          maxOutput / outW,
          maxOutput / outH
        );

        outW = Math.round(outW * scale);
        outH = Math.round(outH * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas is not supported.");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.save();

      ctx.translate(outW / 2, outH / 2);

      const radians = (rotation * Math.PI) / 180;

      ctx.rotate(radians);

      ctx.scale(
        flipX ? -1 : 1,
        flipY ? -1 : 1
      );

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        -outW / 2,
        -outH / 2,
        outW,
        outH
      );

      ctx.restore();

      const qualityValue =
        format === "image/png"
          ? undefined
          : quality / 100;

      const blob = await new Promise(function (resolve) {
        canvas.toBlob(
          resolve,
          format,
          qualityValue
        );
      });

      if (!blob) {
        throw new Error("Could not create image.");
      }

      const originalKB = file.size / 1024;
      const outputKB = blob.size / 1024;

      setResultInfo({
        width: outW,
        height: outH,
        size: outputKB,
        original: originalKB,
        saved: Math.max(
          0,
          ((originalKB - outputKB) / originalKB) * 100
        ),
      });

      if (autoDownload) {
        const baseName =
          file.name.replace(/\.[^/.]+$/, "") || "cropped-image";

        downloadBlob(
          blob,
          baseName +
            "-cropped." +
            getFileExtension(format)
        );
      }
    } catch (error) {
      console.error(error);
      alert(
        "Sorry, image crop failed. Please try another image."
      );
    } finally {
      setBusy(false);
    }
  };

  const rotateLeft = function () {
    setRotation(function (v) {
      return (v - 90 + 360) % 360;
    });
  };

  const rotateRight = function () {
    setRotation(function (v) {
      return (v + 90) % 360;
    });
  };

  const removeImage = function () {
    if (src) {
      URL.revokeObjectURL(src);
    }

    setSrc("");
    setFile(null);
    setResultInfo(null);
    setImageSize({
      width: 0,
      height: 0,
    });
  };

  const cropStyle = {
    left: crop.x + "%",
    top: crop.y + "%",
    width: crop.w + "%",
    height: crop.h + "%",
  };

  const stageImageStyle = {
    ...S.image,
    transform:
      "scale(" +
      zoom +
      ") rotate(" +
      rotation +
      "deg) scaleX(" +
      (flipX ? -1 : 1) +
      ") scaleY(" +
      (flipY ? -1 : 1) +
      ")",
    transition: dragging ? "none" : "transform .15s ease",
  };

  const handleStyle = function (position) {
    const base = {
      ...S.handle,
    };

    if (position.indexOf("top") !== -1) {
      base.top = "-7px";
    }

    if (position.indexOf("bottom") !== -1) {
      base.bottom = "-7px";
    }

    if (position.indexOf("left") !== -1) {
      base.left = "-7px";
    }

    if (position.indexOf("right") !== -1) {
      base.right = "-7px";
    }

    if (position === "top" || position === "bottom") {
      base.left = "calc(50% - 6px)";
    }

    if (position === "left" || position === "right") {
      base.top = "calc(50% - 6px)";
    }

    return base;
  };

  const handleCursor = function (position) {
    if (position === "top-left" || position === "bottom-right") {
      return "nwse-resize";
    }

    if (position === "top-right" || position === "bottom-left") {
      return "nesw-resize";
    }

    if (position === "top" || position === "bottom") {
      return "ns-resize";
    }

    return "ew-resize";
  };

  const makeHandle = function (position) {
    return h("div", {
      key: position,
      style: {
        ...handleStyle(position),
        cursor: handleCursor(position),
      },
      onPointerDown: function (e) {
        startMove(e, position);
      },
    });
  };

  return h(
    "div",
    { style: S.wrap },

    h(
      "div",
      { style: S.header },

      h(
        "div",
        null,

        h(
          "h2",
          { style: S.title },
          "Image Crop Tool"
        ),

        h(
          "p",
          { style: S.subtitle },
          "Crop, rotate, flip and export images with precision — directly in your browser."
        )
      ),

      h(
        "div",
        { style: S.badge },
        "100% Browser Based"
      )
    ),

    h(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: "image/*",
        style: S.hidden,
        onChange: onInputChange,
      }
    ),

    !src &&
      h(
        "div",
        {
          style: S.upload,
          onClick: openPicker,
          onDragOver: function (e) {
            e.preventDefault();
          },
          onDrop: function (e) {
            e.preventDefault();

            const dropped =
              e.dataTransfer.files &&
              e.dataTransfer.files[0];

            if (dropped) {
              loadFile(dropped);
            }
          },
        },

        h(
          "div",
          { style: S.uploadInner },

          h(
            "div",
            { style: S.uploadIcon },
            "✦"
          ),

          h(
            "div",
            { style: S.uploadTitle },
            "Drop your image here"
          ),

          h(
            "div",
            { style: S.muted },
            "or click to browse • JPG, PNG, WebP, GIF and more"
          )
        )
      ),

    src &&
      h(
        "div",
        { style: S.editor },

        h(
          "div",
          { style: S.stage, ref: stageRef },

          h(
            "div",
            {
              style: {
                ...S.imageBox,
                width: "min(92%, 900px)",
                aspectRatio:
                  imageSize.width && imageSize.height
                    ? imageSize.width +
                      " / " +
                      imageSize.height
                    : "16 / 9",
              },
            },

            h("img", {
              ref: imageRef,
              src: src,
              alt: "Crop preview",
              style: stageImageStyle,
              onLoad: onImageLoad,
              draggable: false,
            }),

            h("div", {
              style: {
                ...S.shade,
                left: 0,
                top: 0,
                width: "100%",
                height: crop.y + "%",
              },
            }),

            h("div", {
              style: {
                ...S.shade,
                left: 0,
                top: crop.y + "%",
                width: crop.x + "%",
                height: crop.h + "%",
              },
            }),

            h("div", {
              style: {
                ...S.shade,
                left: crop.x + crop.w + "%",
                top: crop.y + "%",
                width:
                  100 - crop.x - crop.w + "%",
                height: crop.h + "%",
              },
            }),

            h("div", {
              style: {
                ...S.shade,
                left: 0,
                top: crop.y + crop.h + "%",
                width: "100%",
                height:
                  100 - crop.y - crop.h + "%",
              },
            }),

            h(
              "div",
              {
                style: {
                  ...S.cropBox,
                  ...cropStyle,
                },
                onPointerDown: function (e) {
                  startMove(e, "move");
                },
              },

              showGrid &&
                h("div", {
                  style: S.gridV1,
                }),

              showGrid &&
                h("div", {
                  style: S.gridV2,
                }),

              showGrid &&
                h("div", {
                  style: S.gridH1,
                }),

              showGrid &&
                h("div", {
                  style: S.gridH2,
                }),

              [
                "top-left",
                "top",
                "top-right",
                "left",
                "right",
                "bottom-left",
                "bottom",
                "bottom-right",
              ].map(makeHandle)
            )
          )
        ),

        h(
          "div",
          { style: S.info },

          h(
            "div",
            { style: S.stat },
            "Original: ",
            h(
              "span",
              { style: S.statStrong },
              imageSize.width +
                " × " +
                imageSize.height
            )
          ),

          h(
            "div",
            { style: S.stat },
            "Crop: ",
            h(
              "span",
              { style: S.statStrong },
              Math.round(
                (crop.w / 100) * imageSize.width
              ) +
                " × " +
                Math.round(
                  (crop.h / 100) * imageSize.height
                )
            )
          ),

          h(
            "div",
            { style: S.stat },
            "Zoom: ",
            h(
              "span",
              { style: S.statStrong },
              Math.round(zoom * 100) + "%"
            )
          ),

          h(
            "div",
            { style: S.stat },
            "Rotation: ",
            h(
              "span",
              { style: S.statStrong },
              rotation + "°"
            )
          )
        ),

        h(
          "div",
          { style: S.toolbar },

          h(
            "div",
            { style: S.control },

            h(
              "label",
              { style: S.label },
              "Aspect Ratio"
            ),

            h(
              "select",
              {
                value: aspect,
                style: S.select,
                onChange: function (e) {
                  changeAspect(e.target.value);
                },
              },

              h(
                "option",
                { value: "free" },
                "Free Crop"
              ),

              h(
                "option",
                { value: "1" },
                "1 : 1 Square"
              ),

              h(
                "option",
                { value: "0.8" },
                "4 : 5 Portrait"
              ),

              h(
                "option",
                { value: "1.7777777778" },
                "16 : 9 Landscape"
              ),

              h(
                "option",
                { value: "0.5625" },
                "9 : 16 Story"
              )
            )
          ),

          h(
            "div",
            { style: S.control },

            h(
              "label",
              { style: S.label },
              "Quick Preset"
            ),

            h(
              "select",
              {
                defaultValue: "",
                style: S.select,
                onChange: function (e) {
                  selectPreset(e.target.value);
                  e.target.value = "";
                },
              },

              h(
                "option",
                { value: "" },
                "Choose preset..."
              ),

              h(
                "option",
                { value: "square" },
                "Square"
              ),

              h(
                "option",
                { value: "portrait" },
                "Portrait 4:5"
              ),

              h(
                "option",
                { value: "landscape" },
                "Landscape 16:9"
              ),

              h(
                "option",
                { value: "story" },
                "Story 9:16"
              ),

              h(
                "option",
                { value: "youtube" },
                "YouTube 16:9"
              )
            )
          ),

          h(
            "div",
            { style: S.control },

            h(
              "label",
              { style: S.label },
              "Zoom • " +
                Math.round(zoom * 100) +
                "%"
            ),

            h("input", {
              type: "range",
              min: "1",
              max: "2",
              step: "0.01",
              value: zoom,
              style: S.range,
              onChange: function (e) {
                setZoom(Number(e.target.value));
              },
            })
          ),

          h(
            "div",
            { style: S.control },

            h(
              "label",
              { style: S.label },
              "Output Format"
            ),

            h(
              "select",
              {
                value: format,
                style: S.select,
                onChange: function (e) {
                  setFormat(e.target.value);
                },
              },

              h(
                "option",
                { value: "image/jpeg" },
                "JPG"
              ),

              h(
                "option",
                { value: "image/png" },
                "PNG"
              ),

              h(
                "option",
                { value: "image/webp" },
                "WebP"
              )
            )
          ),

          h(
            "div",
            { style: S.control },

            h(
              "label",
              { style: S.label },
              "Quality • " +
                quality +
                "%"
            ),

            h("input", {
              type: "range",
              min: "40",
              max: "100",
              step: "1",
              value: quality,
              disabled: format === "image/png",
              style: S.range,
              onChange: function (e) {
                setQuality(Number(e.target.value));
              },
            })
          )
        ),

        h(
          "div",
          { style: S.buttonRow },

          h(
            "button",
            {
              type: "button",
              style: S.button,
              onClick: rotateLeft,
            },
            "↶ Rotate Left"
          ),

          h(
            "button",
            {
              type: "button",
              style: S.button,
              onClick: rotateRight,
            },
            "↷ Rotate Right"
          ),

          h(
            "button",
            {
              type: "button",
              style: S.button,
              onClick: function () {
                setFlipX(function (v) {
                  return !v;
                });
              },
            },
            "↔ Flip H"
          ),

          h(
            "button",
            {
              type: "button",
              style: S.button,
              onClick: function () {
                setFlipY(function (v) {
                  return !v;
                });
              },
            },
            "↕ Flip V"
          ),

          h(
            "button",
            {
              type: "button",
              style: S.button,
              onClick: function () {
                setShowGrid(function (v) {
                  return !v;
                });
              },
            },
            showGrid
              ? "Hide Grid"
              : "Show Grid"
          ),

          h(
            "button",
            {
              type: "button",
              style: S.button,
              onClick: resetCrop,
            },
            "Reset"
          ),

          h(
            "button",
            {
              type: "button",
              style: S.danger,
              onClick: removeImage,
            },
            "Remove Image"
          )
        ),

        h(
          "div",
          { style: S.buttonRow },

          h(
            "label",
            {
              style: {
                ...S.button,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              },
            },

            h("input", {
              type: "checkbox",
              checked: autoDownload,
              onChange: function (e) {
                setAutoDownload(e.target.checked);
              },
            }),

            "Auto Download"
          ),

          h(
            "button",
            {
              type: "button",
              style: S.primary,
              disabled: busy,
              onClick: cropImage,
            },
            busy
              ? "Processing..."
              : "Crop & Download Image"
          )
        ),

        resultInfo &&
          h(
            "div",
            {
              style: {
                ...S.empty,
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
              },
            },

            h(
              "strong",
              null,
              "Done! "
            ),

            resultInfo.width +
              " × " +
              resultInfo.height +
              " px • " +
              resultInfo.size.toFixed(1) +
              " KB"
          )
      )
  );
}

/*
 * IMPORTANT:
 * This MUST stay a default export.
 * Do not change it to:
 * export { ImageCropTool }
 * Do not export an object.
 */
export default ImageCropTool;