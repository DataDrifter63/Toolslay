"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { 
  QrCode, Copy, CheckCircle2, Download, 
  History, Trash2, Globe, FileText, Mail, Phone, MessageSquare, Wifi, Zap 
} from "lucide-react";

const QR_LIBRARY_URL = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

function loadQRCodeLibrary() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("QR library can only load in browser."));
      return;
    }

    if (window.QRCode) {
      resolve(window.QRCode);
      return;
    }

    const existing = document.querySelector('script[data-qr-generator-library="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.QRCode));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = QR_LIBRARY_URL;
    script.async = true;
    script.dataset.qrGeneratorLibrary = "true";

    script.onload = () => {
      if (window.QRCode) {
        resolve(window.QRCode);
      } else {
        reject(new Error("QR library failed to initialize."));
      }
    };

    script.onerror = () => reject(new Error("Unable to load QR library."));
    document.head.appendChild(script);
  });
}

const PRESETS = {
  website: { label: "Website", placeholder: "https://example.com", value: "https://example.com", icon: Globe },
  text: { label: "Text", placeholder: "Enter any text...", value: "Hello from QR Generator", icon: FileText },
  email: { label: "Email", placeholder: "name@example.com", value: "", icon: Mail },
  phone: { label: "Phone", placeholder: "+1 555 123 4567", value: "", icon: Phone },
  wifi: { label: "Wi-Fi", placeholder: "Network name", value: "", icon: Wifi },
  sms: { label: "SMS", placeholder: "+1 555 123 4567", value: "", icon: MessageSquare },
};

function makeQRText(type, value, extra) {
  const clean = String(value || "").trim();
  if (!clean) return "";

  if (type === "website") {
    if (!/^https?:\/\//i.test(clean) && !/^mailto:/i.test(clean)) {
      return "https://" + clean;
    }
    return clean;
  }

  if (type === "email") {
    const subject = encodeURIComponent(extra.subject || "");
    const body = encodeURIComponent(extra.body || "");
    return "mailto:" + clean + "?subject=" + subject + "&body=" + body;
  }

  if (type === "phone") {
    return "tel:" + clean;
  }

  if (type === "sms") {
    const message = encodeURIComponent(extra.message || "");
    return "SMSTO:" + clean + ":" + message;
  }

  if (type === "wifi") {
    const ssid = String(extra.ssid || "").replace(/([\\;,:"])/g, "\\$1");
    const password = String(extra.password || "").replace(/([\\;,:"])/g, "\\$1");
    const security = extra.security || "WPA";
    return "WIFI:T:" + security + ";S:" + ssid + ";P:" + password + ";;";
  }

  return clean;
}

function downloadCanvas(canvas, filename) {
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function QRCodeGenerator() {
  const qrContainerRef = useRef(null);
  const qrInstanceRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);
  const [type, setType] = useState("website");
  const [value, setValue] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [phone, setPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [wifiName, setWifiName] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");

  const [size, setSize] = useState(260);
  const [darkColor, setDarkColor] = useState("#111827");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [level, setLevel] = useState("H");

  const [status, setStatus] = useState("idle");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const [includeFrame, setIncludeFrame] = useState(false);
  const [frameText, setFrameText] = useState("SCAN ME");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("qr-generator-history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 5));
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const qrText = useMemo(() => {
    if (type === "email") {
      return makeQRText("email", value, { subject: emailSubject, body: emailBody });
    }
    if (type === "phone") {
      return makeQRText("phone", phone, {});
    }
    if (type === "sms") {
      return makeQRText("sms", phone, { message: smsMessage });
    }
    if (type === "wifi") {
      return makeQRText("wifi", wifiName, { ssid: wifiName, password: wifiPassword, security: wifiSecurity });
    }
    return makeQRText(type, value, {});
  }, [type, value, emailSubject, emailBody, phone, smsMessage, wifiName, wifiPassword, wifiSecurity]);

  const generateQR = useCallback(async (saveHistory = true) => {
    setError("");
    setCopied(false);

    if (!qrText.trim()) {
      setError("Please enter something to generate a QR code.");
      setStatus("error");
      return;
    }

    if (!qrContainerRef.current) return;

    setStatus("loading");

    try {
      const QRCode = await loadQRCodeLibrary();
      qrContainerRef.current.innerHTML = "";

      qrInstanceRef.current = new QRCode(qrContainerRef.current, {
        text: qrText,
        width: Number(size),
        height: Number(size),
        colorDark: darkColor,
        colorLight: lightColor,
        correctLevel: QRCode.CorrectLevel[level] || QRCode.CorrectLevel.H,
      });

      setStatus("ready");

      if (saveHistory) {
        const item = {
          id: Date.now(),
          type,
          value: qrText,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setHistory((current) => {
          const next = [item, ...current.filter((x) => x.value !== item.value)].slice(0, 5);
          try {
            localStorage.setItem("qr-generator-history", JSON.stringify(next));
          } catch {
            // Ignore
          }
          return next;
        });
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("QR engine could not load. Please check your internet connection.");
    }
  }, [qrText, size, darkColor, lightColor, level, type]);

  useEffect(() => {
    if (!isMounted) return;
    if (qrText) {
      const timer = setTimeout(() => {
        generateQR(false);
      }, 250);
      return () => clearTimeout(timer);
    }

    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = "";
    }
    setStatus("idle");
  }, [isMounted, qrText, size, darkColor, lightColor, level, generateQR]);

  function handlePreset(preset) {
    setType(preset);
    if (PRESETS[preset]) {
      setValue(PRESETS[preset].value);
    }
    if (preset === "website" || preset === "text") setValue("");
    if (preset === "email") { setValue(""); setEmailSubject(""); setEmailBody(""); }
    if (preset === "phone") setPhone("");
    if (preset === "sms") { setPhone(""); setSmsMessage(""); }
    if (preset === "wifi") { setWifiName(""); setWifiPassword(""); }
    setStatus("idle");
  }

  async function copyQRText() {
    if (!qrText) return;
    try {
      await navigator.clipboard.writeText(qrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy text.");
    }
  }

  function downloadQR() {
    if (!qrContainerRef.current) return;
    const canvas = qrContainerRef.current.querySelector("canvas");
    if (!canvas) {
      setError("Generate the QR code first.");
      return;
    }

    if (!includeFrame) {
      downloadCanvas(canvas, "qr-code.png");
      return;
    }

    const padding = 34;
    const labelHeight = 52;
    const output = document.createElement("canvas");

    output.width = canvas.width + padding * 2;
    output.height = canvas.height + padding * 2 + labelHeight;

    const ctx = output.getContext("2d");
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, output.width, output.height);
    ctx.drawImage(canvas, padding, padding);

    ctx.fillStyle = darkColor;
    ctx.font = "700 18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(frameText || "SCAN ME", output.width / 2, canvas.height + padding + labelHeight / 2);

    downloadCanvas(output, "qr-code.png");
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem("qr-generator-history");
    } catch {
      // Ignore
    }
  }

  function loadHistoryItem(item) {
    if (!item) return;
    setType(item.type || "text");
    if (item.type === "website" || item.type === "text") {
      setValue(item.value || "");
    } else if (item.type === "phone") {
      setPhone(String(item.value || "").replace(/^tel:/, ""));
    } else {
      setValue(item.value || "");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              QR Code Generator
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Customizable QR codes with live preview, styles, and PNG export.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: INPUTS & SETTINGS */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border font-sans">
            
            {/* Presets Tabs */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-line pb-2">
                1. Select QR Type
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(PRESETS).map((key) => {
                  const Icon = PRESETS[key].icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePreset(key)}
                      className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                        type === key 
                          ? "bg-brand text-surface border-brand shadow-sm" 
                          : "bg-surface text-muted border-line hover:text-ink hover:border-brand/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {PRESETS[key].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Input Fields */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-line pb-2">
                2. Enter Content
              </h3>

              {type === "website" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Website URL</label>
                  <input
                    className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="https://example.com"
                    type="text"
                    autoComplete="off"
                  />
                </div>
              )}

              {type === "text" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Plain Text</label>
                  <textarea
                    className="w-full bg-surface border border-line rounded-xl p-3 text-xs font-bold text-ink outline-none focus:border-brand resize-y min-h-[80px]"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter any text..."
                  />
                </div>
              )}

              {type === "email" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">Email Address</label>
                    <input
                      className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="name@example.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">Subject</label>
                    <input
                      className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject"
                      type="text"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">Message</label>
                    <textarea
                      className="w-full bg-surface border border-line rounded-xl p-3 text-xs font-bold text-ink outline-none focus:border-brand resize-y"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Email body message"
                    />
                  </div>
                </div>
              )}

              {type === "phone" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Phone Number</label>
                  <input
                    className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    type="tel"
                  />
                </div>
              )}

              {type === "sms" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">Phone Number</label>
                    <input
                      className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 123 4567"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">SMS Message</label>
                    <textarea
                      className="w-full bg-surface border border-line rounded-xl p-3 text-xs font-bold text-ink outline-none focus:border-brand resize-y"
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder="Your SMS text..."
                    />
                  </div>
                </div>
              )}

              {type === "wifi" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted">Network Name / SSID</label>
                    <input
                      className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                      value={wifiName}
                      onChange={(e) => setWifiName(e.target.value)}
                      placeholder="My Wi-Fi Network"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted">Password</label>
                      <input
                        className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="Network password"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted">Security</label>
                      <select
                        className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer"
                        value={wifiSecurity}
                        onChange={(e) => setWifiSecurity(e.target.value)}
                      >
                        <option value="WPA">WPA / WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="">Open</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Customization Options */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-line pb-2">
                3. Customization & Styling
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Size</label>
                  <select
                    className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                  >
                    <option value="180">180 × 180</option>
                    <option value="220">220 × 220</option>
                    <option value="260">260 × 260</option>
                    <option value="320">320 × 320</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Error Correction</label>
                  <select
                    className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-xs font-bold text-ink outline-none cursor-pointer"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="flex items-center gap-2.5 bg-surface border border-line px-3 py-2 rounded-xl">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded"
                  />
                  <span className="text-[10px] font-bold uppercase text-muted">Foreground</span>
                </div>
                <div className="flex items-center gap-2.5 bg-surface border border-line px-3 py-2 rounded-xl">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded"
                  />
                  <span className="text-[10px] font-bold uppercase text-muted">Background</span>
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors select-none mt-2">
                <input
                  type="checkbox"
                  checked={includeFrame}
                  onChange={(e) => setIncludeFrame(e.target.checked)}
                  className="w-4 h-4 accent-brand rounded cursor-pointer"
                />
                <span className="text-xs font-black text-ink uppercase tracking-wider">Add Label/Frame to Downloaded PNG</span>
              </label>

              {includeFrame && (
                <input
                  className="w-full bg-surface border border-line rounded-xl px-3.5 py-2.5 text-xs font-bold text-ink outline-none focus:border-brand mt-1"
                  value={frameText}
                  onChange={(e) => setFrameText(e.target.value)}
                  placeholder="SCAN ME"
                />
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-500">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => generateQR(true)}
              className="w-full py-3 px-4 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90 shadow-sm"
            >
              {status === "loading" ? "Generating..." : "Generate QR Code"}
            </button>

          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW & HISTORY */}
        <div className="space-y-4 sm:space-y-6 w-full">
          
          {/* PREVIEW CARD */}
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Zap className="w-4 h-4 text-brand" /> Live Preview
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
                status === "ready" 
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                  : "bg-surface text-muted border-line"
              }`}>
                {status === "ready" ? "Ready" : status === "loading" ? "Generating..." : "Waiting"}
              </span>
            </div>

            <div className="flex items-center justify-center p-6 bg-surface rounded-xl border border-dashed border-line min-h-[300px]">
              {qrText ? (
                <div ref={qrContainerRef} className="p-3 bg-white rounded-xl shadow-sm inline-flex items-center justify-center" />
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xl">
                    ▦
                  </div>
                  <strong className="text-xs font-bold text-ink block">Your QR code will appear here</strong>
                  <span className="text-[11px] text-muted block max-w-[220px]">
                    Enter content on the left to instantly generate your code.
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={downloadQR}
                className="py-2.5 px-3 bg-brand text-surface rounded-xl text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
              <button
                type="button"
                onClick={copyQRText}
                disabled={!qrText}
                className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                  copied ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-surface border border-line text-ink hover:border-brand disabled:opacity-50"
                }`}
              >
                {copied ? <><CheckCircle2 className="w-4 h-4"/> Copied</> : <><Copy className="w-4 h-4"/> Copy Content</>}
              </button>
            </div>

            {qrText && (
              <div className="p-3 bg-surface border border-line rounded-xl text-[11px] font-mono font-bold text-muted break-all">
                <span className="text-ink font-bold block mb-0.5">Encoded Payload:</span>
                {qrText}
              </div>
            )}

          </div>

          {/* RECENT HISTORY */}
          {history.length > 0 && (
            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
              
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                  <History className="w-4 h-4 text-brand" /> Recent QR Codes
                </span>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[10px] font-black uppercase tracking-wider text-muted hover:text-[#fb7185] transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5"/> Clear
                </button>
              </div>

              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 bg-surface border border-line rounded-xl"
                  >
                    <button
                      type="button"
                      onClick={() => loadHistoryItem(item)}
                      className="text-left min-w-0 flex-1 bg-transparent border-0 cursor-pointer font-sans"
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider text-brand block">{item.type}</span>
                      <span className="text-xs font-mono font-bold text-ink truncate block mt-0.5">{item.value}</span>
                    </button>
                    <span className="text-[9px] font-bold text-muted shrink-0">{item.createdAt}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}