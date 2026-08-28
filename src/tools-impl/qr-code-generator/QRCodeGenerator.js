"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/*
  QR Code Generator
  - No external QR package required
  - Uses browser Canvas + QRCode library loaded from CDN
  - Default export is a React component
*/

const QR_LIBRARY_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

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

    const existing = document.querySelector(
      'script[data-qr-generator-library="true"]'
    );

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

    script.onerror = () =>
      reject(new Error("Unable to load QR library."));

    document.head.appendChild(script);
  });
}

const PRESETS = {
  website: {
    label: "Website",
    placeholder: "https://example.com",
    value: "https://example.com",
  },
  text: {
    label: "Text",
    placeholder: "Enter any text...",
    value: "Hello from QR Generator",
  },
  email: {
    label: "Email",
    placeholder: "name@example.com",
    value: "",
  },
  phone: {
    label: "Phone",
    placeholder: "+1 555 123 4567",
    value: "",
  },
  wifi: {
    label: "Wi-Fi",
    placeholder: "Network name",
    value: "",
  },
  sms: {
    label: "SMS",
    placeholder: "+1 555 123 4567",
    value: "",
  },
};

function makeQRText(type, value, extra) {
  const clean = String(value || "").trim();

  if (!clean) return "";

  if (type === "website") {
    if (
      !/^https?:\/\//i.test(clean) &&
      !/^mailto:/i.test(clean)
    ) {
      return "https://" + clean;
    }

    return clean;
  }

  if (type === "email") {
    const subject = encodeURIComponent(extra.subject || "");
    const body = encodeURIComponent(extra.body || "");

    return (
      "mailto:" +
      clean +
      "?subject=" +
      subject +
      "&body=" +
      body
    );
  }

  if (type === "phone") {
    return "tel:" + clean;
  }

  if (type === "sms") {
    const message = encodeURIComponent(extra.message || "");
    return "SMSTO:" + clean + ":" + message;
  }

  if (type === "wifi") {
    const ssid = String(extra.ssid || "").replace(
      /([\\;,:"])/g,
      "\\$1"
    );

    const password = String(extra.password || "").replace(
      /([\\;,:"])/g,
      "\\$1"
    );

    const security = extra.security || "WPA";

    return (
      "WIFI:T:" +
      security +
      ";S:" +
      ssid +
      ";P:" +
      password +
      ";;"
    );
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

function QRCodeGenerator() {
  const qrContainerRef = useRef(null);
  const qrInstanceRef = useRef(null);

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

  const [margin, setMargin] = useState(4);
  const [level, setLevel] = useState("H");

  const [status, setStatus] = useState("idle");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const [includeFrame, setIncludeFrame] = useState(false);
  const [frameText, setFrameText] = useState("SCAN ME");

  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        "qr-generator-history"
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 5));
        }
      }
    } catch (_) {
      // Ignore localStorage errors.
    }
  }, []);

  const qrText = useMemo(() => {
    if (type === "email") {
      return makeQRText("email", value, {
        subject: emailSubject,
        body: emailBody,
      });
    }

    if (type === "phone") {
      return makeQRText("phone", phone, {});
    }

    if (type === "sms") {
      return makeQRText("sms", smsMessage, {
        message: smsMessage,
      });
    }

    if (type === "wifi") {
      return makeQRText("wifi", wifiName, {
        ssid: wifiName,
        password: wifiPassword,
        security: wifiSecurity,
      });
    }

    return makeQRText(type, value, {});
  }, [
    type,
    value,
    emailSubject,
    emailBody,
    phone,
    smsMessage,
    wifiName,
    wifiPassword,
    wifiSecurity,
  ]);

  const generateQR = async (saveHistory = true) => {
    setError("");
    setCopied(false);

    if (!qrText.trim()) {
      setError("Please enter something to generate a QR code.");
      setStatus("error");
      return;
    }

    if (!qrContainerRef.current) {
      return;
    }

    setStatus("loading");

    try {
      const QRCode = await loadQRCodeLibrary();

      qrContainerRef.current.innerHTML = "";

      qrInstanceRef.current = new QRCode(
        qrContainerRef.current,
        {
          text: qrText,
          width: Number(size),
          height: Number(size),
          colorDark: darkColor,
          colorLight: lightColor,
          correctLevel:
            QRCode.CorrectLevel[level] ||
            QRCode.CorrectLevel.H,
        }
      );

      setStatus("ready");

      if (saveHistory) {
        const item = {
          id: Date.now(),
          type,
          value: qrText,
          createdAt: new Date().toLocaleString(),
        };

        setHistory((current) => {
          const next = [
            item,
            ...current.filter(
              (x) => x.value !== item.value
            ),
          ].slice(0, 5);

          try {
            localStorage.setItem(
              "qr-generator-history",
              JSON.stringify(next)
            );
          } catch (_) {
            // Ignore storage errors.
          }

          return next;
        });
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError(
        "QR engine could not load. Please check your internet connection and try again."
      );
    }
  };

  useEffect(() => {
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
  }, [
    qrText,
    size,
    darkColor,
    lightColor,
    level,
  ]);

  const handlePreset = (preset) => {
    setType(preset);

    if (PRESETS[preset]) {
      setValue(PRESETS[preset].value);
    }

    if (preset === "website") {
      setValue("");
    }

    if (preset === "text") {
      setValue("");
    }

    if (preset === "email") {
      setValue("");
      setEmailSubject("");
      setEmailBody("");
    }

    if (preset === "phone") {
      setPhone("");
    }

    if (preset === "sms") {
      setPhone("");
      setSmsMessage("");
    }

    if (preset === "wifi") {
      setWifiName("");
      setWifiPassword("");
    }

    setStatus("idle");
  };

  const copyQRText = async () => {
    if (!qrText) return;

    try {
      await navigator.clipboard.writeText(qrText);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (_) {
      setError("Could not copy text.");
    }
  };

  const downloadQR = () => {
    if (!qrContainerRef.current) return;

    const canvas =
      qrContainerRef.current.querySelector("canvas");

    if (!canvas) {
      setError("Generate the QR code first.");
      return;
    }

    if (!includeFrame) {
      downloadCanvas(
        canvas,
        "qr-code.png"
      );
      return;
    }

    const padding = 34;
    const labelHeight = 52;

    const output = document.createElement("canvas");

    output.width =
      canvas.width +
      padding * 2;

    output.height =
      canvas.height +
      padding * 2 +
      labelHeight;

    const ctx = output.getContext("2d");

    ctx.fillStyle = lightColor;
    ctx.fillRect(
      0,
      0,
      output.width,
      output.height
    );

    ctx.drawImage(
      canvas,
      padding,
      padding
    );

    ctx.fillStyle = darkColor;
    ctx.font =
      "700 18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      frameText || "SCAN ME",
      output.width / 2,
      canvas.height +
        padding +
        labelHeight / 2
    );

    downloadCanvas(
      output,
      "qr-code.png"
    );
  };

  const clearHistory = () => {
    setHistory([]);

    try {
      localStorage.removeItem(
        "qr-generator-history"
      );
    } catch (_) {
      // Ignore storage errors.
    }
  };

  const loadHistoryItem = (item) => {
    if (!item) return;

    setType(item.type || "text");

    if (item.type === "website" || item.type === "text") {
      setValue(item.value || "");
    } else if (item.type === "phone") {
      setPhone(
        String(item.value || "").replace(
          /^tel:/,
          ""
        )
      );
    } else {
      setValue(item.value || "");
    }
  };

  return (
    <div className="qr-tool">
      <style>{`
        .qr-tool {
          --qr-text: #111827;
          --qr-muted: #667085;
          --qr-border: #e4e7ec;
          --qr-card: #ffffff;
          --qr-soft: #f8fafc;
          --qr-primary: #635bff;
          --qr-success: #12b76a;
          width: 100%;
          color: var(--qr-text);
          font-family: inherit;
        }

        .qr-tool *,
        .qr-tool *::before,
        .qr-tool *::after {
          box-sizing: border-box;
        }

        .qr-shell {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .qr-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 22px;
        }

        .qr-eyebrow {
          color: var(--qr-primary);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .14em;
        }

        .qr-title {
          margin: 6px 0 0;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.05;
          letter-spacing: -.045em;
        }

        .qr-description {
          max-width: 680px;
          margin: 9px 0 0;
          color: var(--qr-muted);
          font-size: 13px;
          line-height: 1.65;
        }

        .qr-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(330px, .8fr);
          gap: 18px;
        }

        .qr-card {
          border: 1px solid var(--qr-border);
          border-radius: 16px;
          background: var(--qr-card);
          box-shadow: 0 8px 30px rgba(16,24,40,.035);
        }

        .qr-form {
          padding: 22px;
        }

        .qr-preview {
          padding: 22px;
          min-height: 540px;
          display: flex;
          flex-direction: column;
        }

        .qr-card-title {
          font-size: 17px;
          font-weight: 750;
          letter-spacing: -.025em;
        }

        .qr-card-subtitle {
          margin-top: 5px;
          color: var(--qr-muted);
          font-size: 11px;
          line-height: 1.6;
        }

        .qr-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 18px;
        }

        .qr-tab {
          min-height: 34px;
          padding: 0 12px;
          border: 1px solid var(--qr-border);
          border-radius: 8px;
          background: var(--qr-soft);
          color: var(--qr-muted);
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 700;
        }

        .qr-tab.active {
          border-color: var(--qr-primary);
          background: var(--qr-primary);
          color: white;
        }

        .qr-label {
          display: block;
          margin: 16px 0 7px;
          font-size: 10px;
          font-weight: 750;
        }

        .qr-input,
        .qr-select {
          width: 100%;
          height: 43px;
          padding: 0 11px;
          border: 1px solid var(--qr-border);
          border-radius: 9px;
          outline: none;
          background: var(--qr-card);
          color: var(--qr-text);
          font: inherit;
          font-size: 12px;
        }

        .qr-textarea {
          width: 100%;
          min-height: 92px;
          padding: 11px;
          resize: vertical;
          border: 1px solid var(--qr-border);
          border-radius: 9px;
          outline: none;
          background: var(--qr-card);
          color: var(--qr-text);
          font: inherit;
          font-size: 12px;
        }

        .qr-input:focus,
        .qr-select:focus,
        .qr-textarea:focus {
          border-color: var(--qr-primary);
          box-shadow: 0 0 0 3px rgba(99,91,255,.1);
        }

        .qr-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .qr-three {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }

        .qr-color-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .qr-color-box {
          display: flex;
          align-items: center;
          gap: 9px;
          height: 43px;
          padding: 5px 9px;
          border: 1px solid var(--qr-border);
          border-radius: 9px;
        }

        .qr-color-box input[type="color"] {
          width: 30px;
          height: 30px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .qr-color-box span {
          color: var(--qr-muted);
          font-size: 10px;
        }

        .qr-check {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          color: var(--qr-muted);
          font-size: 10px;
          cursor: pointer;
        }

        .qr-check input {
          accent-color: var(--qr-primary);
        }

        .qr-generate {
          width: 100%;
          height: 45px;
          margin-top: 19px;
          border: 0;
          border-radius: 9px;
          background: var(--qr-primary);
          color: white;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
        }

        .qr-generate:hover {
          opacity: .92;
        }

        .qr-error {
          margin-top: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          background: #fff1f3;
          color: #c01048;
          font-size: 10px;
          line-height: 1.5;
        }

        .qr-preview-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .qr-status {
          padding: 5px 8px;
          border-radius: 99px;
          background: var(--qr-soft);
          color: var(--qr-muted);
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .qr-status.ready {
          background: rgba(18,183,106,.1);
          color: var(--qr-success);
        }

        .qr-canvas-area {
          flex: 1;
          display: grid;
          place-items: center;
          min-height: 350px;
          margin-top: 15px;
          padding: 20px;
          border: 1px dashed var(--qr-border);
          border-radius: 13px;
          background: var(--qr-soft);
          overflow: hidden;
        }

        .qr-code-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 10px 35px rgba(16,24,40,.08);
        }

        .qr-code-container img,
        .qr-code-container canvas {
          display: block;
          max-width: 100%;
          height: auto;
        }

        .qr-empty-preview {
          text-align: center;
          color: var(--qr-muted);
        }

        .qr-empty-icon {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          margin: 0 auto 12px;
          border-radius: 15px;
          background: rgba(99,91,255,.1);
          color: var(--qr-primary);
          font-size: 24px;
        }

        .qr-empty-preview strong {
          display: block;
          color: var(--qr-text);
          font-size: 15px;
        }

        .qr-empty-preview span {
          display: block;
          max-width: 250px;
          margin: 6px auto 0;
          font-size: 10px;
          line-height: 1.6;
        }

        .qr-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }

        .qr-action {
          height: 40px;
          border: 1px solid var(--qr-border);
          border-radius: 9px;
          background: var(--qr-card);
          color: var(--qr-text);
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 750;
        }

        .qr-action.primary {
          border-color: var(--qr-primary);
          background: var(--qr-primary);
          color: white;
        }

        .qr-info {
          margin-top: 12px;
          padding: 11px;
          border-radius: 10px;
          background: var(--qr-soft);
          color: var(--qr-muted);
          font-size: 9px;
          line-height: 1.6;
          word-break: break-word;
        }

        .qr-history {
          margin-top: 18px;
          padding: 18px;
        }

        .qr-history-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .qr-clear {
          border: 0;
          background: transparent;
          color: var(--qr-muted);
          cursor: pointer;
          font: inherit;
          font-size: 9px;
          font-weight: 700;
        }

        .qr-history-list {
          display: grid;
          gap: 7px;
          margin-top: 12px;
        }

        .qr-history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px;
          border: 1px solid var(--qr-border);
          border-radius: 9px;
          background: var(--qr-soft);
        }

        .qr-history-item button {
          flex: 1;
          min-width: 0;
          border: 0;
          background: transparent;
          color: var(--qr-text);
          cursor: pointer;
          text-align: left;
          font: inherit;
          font-size: 9px;
        }

        .qr-history-type {
          display: block;
          color: var(--qr-primary);
          font-weight: 800;
          text-transform: uppercase;
        }

        .qr-history-value {
          display: block;
          margin-top: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .qr-history-date {
          color: var(--qr-muted);
          font-size: 8px;
        }

        .qr-privacy {
          margin-top: 12px;
          color: var(--qr-muted);
          font-size: 9px;
          line-height: 1.5;
        }

        @media (max-width: 900px) {
          .qr-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .qr-form,
          .qr-preview,
          .qr-history {
            padding: 16px;
          }

          .qr-two,
          .qr-three,
          .qr-color-row {
            grid-template-columns: 1fr;
          }

          .qr-canvas-area {
            min-height: 300px;
            padding: 12px;
          }

          .qr-top {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        /*
          Automatic site dark-mode support.
          This does NOT create a separate tool theme switch.
        */
        .dark .qr-tool,
        body.dark .qr-tool,
        html.dark .qr-tool {
          --qr-text: #f2f4f7;
          --qr-muted: #98a2b3;
          --qr-border: #2d3442;
          --qr-card: #151922;
          --qr-soft: #10141c;
          --qr-primary: #8078ff;
        }
      `}</style>

      <div className="qr-shell">
        <div className="qr-top">
          <div>
            <div className="qr-eyebrow">
              QR UTILITY
            </div>

            <h1 className="qr-title">
              QR Code Generator
            </h1>

            <p className="qr-description">
              Create customizable QR codes for websites,
              text, email, phone numbers, Wi-Fi, SMS and
              more — with instant preview, custom colors,
              error correction and PNG export.
            </p>
          </div>
        </div>

        <div className="qr-grid">
          <div className="qr-card qr-form">
            <div className="qr-card-title">
              Create your QR code
            </div>

            <div className="qr-card-subtitle">
              Choose a QR type and customize exactly how
              you want it to look.
            </div>

            <div className="qr-tabs">
              {Object.keys(PRESETS).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={
                    type === key
                      ? "qr-tab active"
                      : "qr-tab"
                  }
                  onClick={() =>
                    handlePreset(key)
                  }
                >
                  {PRESETS[key].label}
                </button>
              ))}
            </div>

            {type === "website" && (
              <>
                <label className="qr-label">
                  Website URL
                </label>

                <input
                  className="qr-input"
                  value={value}
                  onChange={(e) =>
                    setValue(e.target.value)
                  }
                  placeholder="https://example.com"
                  type="text"
                  autoComplete="off"
                />
              </>
            )}

            {type === "text" && (
              <>
                <label className="qr-label">
                  Text
                </label>

                <textarea
                  className="qr-textarea"
                  value={value}
                  onChange={(e) =>
                    setValue(e.target.value)
                  }
                  placeholder="Enter your text..."
                />
              </>
            )}

            {type === "email" && (
              <>
                <label className="qr-label">
                  Email address
                </label>

                <input
                  className="qr-input"
                  value={value}
                  onChange={(e) =>
                    setValue(e.target.value)
                  }
                  placeholder="name@example.com"
                  type="email"
                  autoComplete="off"
                />

                <label className="qr-label">
                  Subject
                </label>

                <input
                  className="qr-input"
                  value={emailSubject}
                  onChange={(e) =>
                    setEmailSubject(
                      e.target.value
                    )
                  }
                  placeholder="Email subject"
                  type="text"
                />

                <label className="qr-label">
                  Message
                </label>

                <textarea
                  className="qr-textarea"
                  value={emailBody}
                  onChange={(e) =>
                    setEmailBody(
                      e.target.value
                    )
                  }
                  placeholder="Email message"
                />
              </>
            )}

            {type === "phone" && (
              <>
                <label className="qr-label">
                  Phone number
                </label>

                <input
                  className="qr-input"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="+1 555 123 4567"
                  type="tel"
                  autoComplete="off"
                />
              </>
            )}

            {type === "sms" && (
              <>
                <label className="qr-label">
                  Phone number
                </label>

                <input
                  className="qr-input"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="+1 555 123 4567"
                  type="tel"
                  autoComplete="off"
                />

                <label className="qr-label">
                  Message
                </label>

                <textarea
                  className="qr-textarea"
                  value={smsMessage}
                  onChange={(e) =>
                    setSmsMessage(
                      e.target.value
                    )
                  }
                  placeholder="Your SMS message..."
                />
              </>
            )}

            {type === "wifi" && (
              <>
                <label className="qr-label">
                  Network name / SSID
                </label>

                <input
                  className="qr-input"
                  value={wifiName}
                  onChange={(e) =>
                    setWifiName(
                      e.target.value
                    )
                  }
                  placeholder="My Wi-Fi"
                  type="text"
                  autoComplete="off"
                />

                <div className="qr-two">
                  <div>
                    <label className="qr-label">
                      Password
                    </label>

                    <input
                      className="qr-input"
                      value={wifiPassword}
                      onChange={(e) =>
                        setWifiPassword(
                          e.target.value
                        )
                      }
                      placeholder="Wi-Fi password"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="qr-label">
                      Security
                    </label>

                    <select
                      className="qr-select"
                      value={wifiSecurity}
                      onChange={(e) =>
                        setWifiSecurity(
                          e.target.value
                        )
                      }
                    >
                      <option value="WPA">
                        WPA / WPA2
                      </option>
                      <option value="WEP">
                        WEP
                      </option>
                      <option value="">
                        Open
                      </option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="qr-two">
              <div>
                <label className="qr-label">
                  Size
                </label>

                <select
                  className="qr-select"
                  value={size}
                  onChange={(e) =>
                    setSize(
                      Number(e.target.value)
                    )
                  }
                >
                  <option value="180">
                    180 × 180
                  </option>
                  <option value="220">
                    220 × 220
                  </option>
                  <option value="260">
                    260 × 260
                  </option>
                  <option value="320">
                    320 × 320
                  </option>
                  <option value="400">
                    400 × 400
                  </option>
                </select>
              </div>

              <div>
                <label className="qr-label">
                  Error correction
                </label>

                <select
                  className="qr-select"
                  value={level}
                  onChange={(e) =>
                    setLevel(
                      e.target.value
                    )
                  }
                >
                  <option value="L">
                    Low · 7%
                  </option>
                  <option value="M">
                    Medium · 15%
                  </option>
                  <option value="Q">
                    Quartile · 25%
                  </option>
                  <option value="H">
                    High · 30%
                  </option>
                </select>
              </div>
            </div>

            <label className="qr-label">
              QR colors
            </label>

            <div className="qr-color-row">
              <div className="qr-color-box">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) =>
                    setDarkColor(
                      e.target.value
                    )
                  }
                />

                <span>
                  Foreground {darkColor}
                </span>
              </div>

              <div className="qr-color-box">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) =>
                    setLightColor(
                      e.target.value
                    )
                  }
                />

                <span>
                  Background {lightColor}
                </span>
              </div>
            </div>

            <label className="qr-check">
              <input
                type="checkbox"
                checked={includeFrame}
                onChange={(e) =>
                  setIncludeFrame(
                    e.target.checked
                  )
                }
              />

              Add a label/frame to downloaded PNG
            </label>

            {includeFrame && (
              <input
                className="qr-input"
                style={{
                  marginTop: "9px",
                }}
                value={frameText}
                onChange={(e) =>
                  setFrameText(
                    e.target.value
                  )
                }
                placeholder="SCAN ME"
                type="text"
              />
            )}

            {error && (
              <div className="qr-error">
                {error}
              </div>
            )}

            <button
              type="button"
              className="qr-generate"
              onClick={() => generateQR(true)}
            >
              {status === "loading"
                ? "Generating..."
                : "Generate QR Code"}
            </button>

            <div className="qr-privacy">
              🔒 QR generation happens in your
              browser. Your content is not sent to
              a server by this tool.
            </div>
          </div>

          <div className="qr-card qr-preview">
            <div className="qr-preview-head">
              <div className="qr-card-title">
                Live preview
              </div>

              <div
                className={
                  status === "ready"
                    ? "qr-status ready"
                    : "qr-status"
                }
              >
                {status === "ready"
                  ? "Ready"
                  : status === "loading"
                  ? "Generating"
                  : "Waiting"}
              </div>
            </div>

            <div className="qr-canvas-area">
              {qrText ? (
                <div
                  ref={qrContainerRef}
                  className="qr-code-container"
                />
              ) : (
                <div className="qr-empty-preview">
                  <div className="qr-empty-icon">
                    ▦
                  </div>

                  <strong>
                    Your QR code will appear here
                  </strong>

                  <span>
                    Enter content on the left and
                    the QR code will be generated
                    automatically.
                  </span>
                </div>
              )}
            </div>

            <div className="qr-actions">
              <button
                type="button"
                className="qr-action primary"
                onClick={downloadQR}
              >
                Download PNG
              </button>

              <button
                type="button"
                className="qr-action"
                onClick={copyQRText}
              >
                {copied
                  ? "✓ Copied"
                  : "Copy QR Content"}
              </button>
            </div>

            {qrText && (
              <div className="qr-info">
                <strong>Encoded content:</strong>
                <br />
                {qrText}
              </div>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="qr-card qr-history">
            <div className="qr-history-head">
              <div>
                <div className="qr-card-title">
                  Recent QR codes
                </div>

                <div className="qr-card-subtitle">
                  Stored only in this browser.
                </div>
              </div>

              <button
                type="button"
                className="qr-clear"
                onClick={clearHistory}
              >
                Clear history
              </button>
            </div>

            <div className="qr-history-list">
              {history.map((item) => (
                <div
                  className="qr-history-item"
                  key={item.id}
                >
                  <button
                    type="button"
                    onClick={() =>
                      loadHistoryItem(item)
                    }
                  >
                    <span className="qr-history-type">
                      {item.type}
                    </span>

                    <span className="qr-history-value">
                      {item.value}
                    </span>
                  </button>

                  <span className="qr-history-date">
                    {item.createdAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/*
  IMPORTANT:
  Default export only.
  Registry should receive this component itself,
  NOT an object containing the component.
*/

export default QRCodeGenerator;