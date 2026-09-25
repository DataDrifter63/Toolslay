"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Crop, Upload, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, 
  Grid, Download, Trash2, CheckCircle2, Sliders, Zap
} from "lucide-react";

const h = React.createElement;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function getFileExtension(format) {
  if (format === "image/jpeg") return "jpg";
  if (format === "image/webp") return "webp";
  return "png";
}

export default function ImageCropTool() {
  const [isMounted, setIsMounted] = useState(false);
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "fill",
    pointerEvents: "none",
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
      position: "absolute",
      width: "12px",
      height: "12px",
      borderRadius: "4px",
      background: "#ffffff",
      border: "2px solid var(--color-brand, #4f46e5)",
      boxSizing: "border-box",
      zIndex: 5,
    };

    if (position.indexOf("top") !== -1) base.top = "-7px";
    if (position.indexOf("bottom") !== -1) base.bottom = "-7px";
    if (position.indexOf("left") !== -1) base.left = "-7px";
    if (position.indexOf("right") !== -1) base.right = "-7px";
    if (position === "top" || position === "bottom") base.left = "calc(50% - 6px)";
    if (position === "left" || position === "right") base.top = "calc(50% - 6px)";

    return base;
  };

  const handleCursor = function (position) {
    if (position === "top-left" || position === "bottom-right") return "nwse-resize";
    if (position === "top-right" || position === "bottom-left") return "nesw-resize";
    if (position === "top" || position === "bottom") return "ns-resize";
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

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Crop className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Image Crop Tool
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 truncate">
              Crop, rotate, flip and export images with precision — directly in your browser.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface border border-line text-brand text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm">
          100% Browser Based
        </div>
      </div>

      <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onInputChange}
        />

        {!src && (
          <div
            onClick={openPicker}
            onDragOver={function (e) {
              e.preventDefault();
            }}
            onDrop={function (e) {
              e.preventDefault();
              const dropped = e.dataTransfer.files && e.dataTransfer.files[0];
              if (dropped) {
                loadFile(dropped);
              }
            }}
            className="border-2 border-dashed border-line hover:border-brand rounded-2xl p-8 sm:p-14 text-center cursor-pointer transition-all bg-surface group"
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-paper border border-line flex items-center justify-center text-brand text-2xl group-hover:scale-105 transition-transform shadow-sm">
              <Upload className="w-6 h-6 shrink-0" />
            </div>
            <div className="text-sm sm:text-base font-black text-ink tracking-tight">
              Drop your image here
            </div>
            <div className="text-xs text-muted mt-1">
              or click to browse • JPG, PNG, WebP, GIF and more
            </div>
          </div>
        )}

        {src && (
          <div className="space-y-6">
            
            {/* Stage */}
            <div 
              ref={stageRef}
              className="w-full h-[400px] sm:h-[520px] relative overflow-hidden rounded-2xl bg-surface border border-line flex items-center justify-center select-none shadow-inner"
              style={{
                backgroundImage: "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0,0 12px,12px -12px,-12px 0"
              }}
            >
              <div
                style={{
                  position: "relative",
                  overflow: "visible",
                  touchAction: "none",
                  width: "min(92%, 900px)",
                  aspectRatio: imageSize.width && imageSize.height ? imageSize.width + " / " + imageSize.height : "16 / 9",
                }}
              >
                <img
                  ref={imageRef}
                  src={src}
                  alt="Crop preview"
                  style={stageImageStyle}
                  onLoad={onImageLoad}
                  draggable={false}
                />

                {/* Shading Overlays */}
                <div style={{ position: "absolute", background: "rgba(0,0,0,.52)", pointerEvents: "none", left: 0, top: 0, width: "100%", height: crop.y + "%" }} />
                <div style={{ position: "absolute", background: "rgba(0,0,0,.52)", pointerEvents: "none", left: 0, top: crop.y + "%", width: crop.x + "%", height: crop.h + "%" }} />
                <div style={{ position: "absolute", background: "rgba(0,0,0,.52)", pointerEvents: "none", left: crop.x + crop.w + "%", top: crop.y + "%", width: 100 - crop.x - crop.w + "%", height: crop.h + "%" }} />
                <div style={{ position: "absolute", background: "rgba(0,0,0,.52)", pointerEvents: "none", left: 0, top: crop.y + crop.h + "%", width: "100%", height: 100 - crop.y - crop.h + "%" }} />

                {/* Active Crop Box */}
                <div
                  style={{
                    position: "absolute",
                    border: "2px solid #ffffff",
                    boxShadow: "0 0 0 1px rgba(79,70,229,.7), 0 8px 30px rgba(0,0,0,.25)",
                    cursor: "move",
                    touchAction: "none",
                    ...cropStyle,
                  }}
                  onPointerDown={function (e) {
                    startMove(e, "move");
                  }}
                >
                  {showGrid && <div style={{ position: "absolute", top: 0, bottom: 0, left: "33.333%", width: "1px", background: "rgba(255,255,255,.5)", pointerEvents: "none" }} />}
                  {showGrid && <div style={{ position: "absolute", top: 0, bottom: 0, left: "66.666%", width: "1px", background: "rgba(255,255,255,.5)", pointerEvents: "none" }} />}
                  {showGrid && <div style={{ position: "absolute", left: 0, right: 0, top: "33.333%", height: "1px", background: "rgba(255,255,255,.5)", pointerEvents: "none" }} />}
                  {showGrid && <div style={{ position: "absolute", left: 0, right: 0, top: "66.666%", height: "1px", background: "rgba(255,255,255,.5)", pointerEvents: "none" }} />}

                  {[
                    "top-left", "top", "top-right", "left",
                    "right", "bottom-left", "bottom", "bottom-right"
                  ].map(makeHandle)}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-surface border border-line rounded-xl text-xs font-bold text-muted">
                Original: <span className="text-ink font-black font-mono">{imageSize.width} × {imageSize.height}</span>
              </div>
              <div className="p-3 bg-surface border border-line rounded-xl text-xs font-bold text-muted">
                Crop: <span className="text-ink font-black font-mono">{Math.round((crop.w / 100) * imageSize.width)} × {Math.round((crop.h / 100) * imageSize.height)}</span>
              </div>
              <div className="p-3 bg-surface border border-line rounded-xl text-xs font-bold text-muted">
                Zoom: <span className="text-ink font-black font-mono">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="p-3 bg-surface border border-line rounded-xl text-xs font-bold text-muted">
                Rotation: <span className="text-ink font-black font-mono">{rotation}°</span>
              </div>
            </div>

            {/* Controls Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block">Aspect Ratio</label>
                <select
                  value={aspect}
                  onChange={function (e) {
                    changeAspect(e.target.value);
                  }}
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="free">Free Crop</option>
                  <option value="1">1 : 1 Square</option>
                  <option value="0.8">4 : 5 Portrait</option>
                  <option value="1.7777777778">16 : 9 Landscape</option>
                  <option value="0.5625">9 : 16 Story</option>
                </select>
              </div>

              <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block">Quick Preset</label>
                <select
                  defaultValue=""
                  onChange={function (e) {
                    selectPreset(e.target.value);
                    e.target.value = "";
                  }}
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="">Choose preset...</option>
                  <option value="square">Square</option>
                  <option value="portrait">Portrait 4:5</option>
                  <option value="landscape">Landscape 16:9</option>
                  <option value="story">Story 9:16</option>
                  <option value="youtube">YouTube 16:9</option>
                </select>
              </div>

              <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted flex justify-between">
                  <span>Zoom</span>
                  <span className="font-mono text-brand font-black">{Math.round(zoom * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.01"
                  value={zoom}
                  onChange={function (e) {
                    setZoom(Number(e.target.value));
                  }}
                  className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line mt-2"
                />
              </div>

              <div className="p-4 bg-surface border border-line rounded-xl space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block">Output Format</label>
                <select
                  value={format}
                  onChange={function (e) {
                    setFormat(e.target.value);
                  }}
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              <div className="p-4 bg-surface border border-line rounded-xl space-y-2 sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted flex justify-between">
                  <span>Quality</span>
                  <span className="font-mono text-brand font-black">{quality}%</span>
                </label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="1"
                  value={quality}
                  disabled={format === "image/png"}
                  onChange={function (e) {
                    setQuality(Number(e.target.value));
                  }}
                  className="w-full h-1.5 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line mt-2"
                />
              </div>

            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={rotateLeft}
                className="h-10 px-4 rounded-xl border border-line bg-surface text-ink text-xs font-black uppercase tracking-wider hover:border-brand flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" /> Rotate Left
              </button>

              <button
                type="button"
                onClick={rotateRight}
                className="h-10 px-4 rounded-xl border border-line bg-surface text-ink text-xs font-black uppercase tracking-wider hover:border-brand flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5 shrink-0" /> Rotate Right
              </button>

              <button
                type="button"
                onClick={function () {
                  setFlipX(function (v) { return !v; });
                }}
                className="h-10 px-4 rounded-xl border border-line bg-surface text-ink text-xs font-black uppercase tracking-wider hover:border-brand flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <FlipHorizontal className="w-3.5 h-3.5 shrink-0" /> Flip H
              </button>

              <button
                type="button"
                onClick={function () {
                  setFlipY(function (v) { return !v; });
                }}
                className="h-10 px-4 rounded-xl border border-line bg-surface text-ink text-xs font-black uppercase tracking-wider hover:border-brand flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <FlipVertical className="w-3.5 h-3.5 shrink-0" /> Flip V
              </button>

              <button
                type="button"
                onClick={function () {
                  setShowGrid(function (v) { return !v; });
                }}
                className="h-10 px-4 rounded-xl border border-line bg-surface text-ink text-xs font-black uppercase tracking-wider hover:border-brand flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Grid className="w-3.5 h-3.5 shrink-0" /> {showGrid ? "Hide Grid" : "Show Grid"}
              </button>

              <button
                type="button"
                onClick={resetCrop}
                className="h-10 px-4 rounded-xl border border-line bg-surface text-muted text-xs font-black uppercase tracking-wider hover:text-ink hover:border-brand cursor-pointer shadow-sm"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={removeImage}
                className="h-10 px-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" /> Remove Image
              </button>
            </div>

            {/* Export Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-line shadow-inner">
              <label className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDownload}
                  onChange={function (e) {
                    setAutoDownload(e.target.checked);
                  }}
                  className="w-4 h-4 accent-brand rounded border-line cursor-pointer shrink-0"
                />
                Auto Download on Crop
              </label>

              <button
                type="button"
                disabled={busy}
                onClick={cropImage}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-brand text-surface text-xs font-black uppercase tracking-wider shadow-sm hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 shrink-0" />
                {busy ? "Processing..." : "Crop & Download Image"}
              </button>
            </div>

            {resultInfo && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Done! </strong>
                  {resultInfo.width} × {resultInfo.height} px • {resultInfo.size.toFixed(1)} KB
                </span>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}