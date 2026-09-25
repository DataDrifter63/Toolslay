"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings2, ShieldCheck, Key, AlertTriangle, Copy, Check, Clock, Code, ShieldAlert, CheckCircle2 } from "lucide-react";

// ✅ 100% Native Base64Url Decoder (No third-party libraries needed!)
const decodeBase64Url = (base64Url) => {
  try {
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    throw new Error("Invalid Base64Url encoding");
  }
};

const DEMO_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRvb2xzTGF5IFBybyBVc2VyIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTQxMjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoder() {
  const [isMounted, setIsMounted] = useState(false);
  const [jwtInput, setJwtInput] = useState(DEMO_JWT);
  
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");
  
  const [error, setError] = useState(null);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [timeStatus, setTimeStatus] = useState(null);
  
  const [showSettings, setShowSettings] = useState(false); // Default hidden on mobile for clean start
  const [copiedSection, setCopiedSection] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const analyzeTime = (payloadObj) => {
    const now = Math.floor(Date.now() / 1000);
    let status = { isExpired: false, expReadable: null, iatReadable: null, message: "" };

    if (payloadObj.exp) {
      const expDate = new Date(payloadObj.exp * 1000).toLocaleString();
      status.expReadable = expDate;
      if (payloadObj.exp < now) {
        status.isExpired = true;
        status.message = "Token has EXPIRED";
      } else {
        const hoursLeft = ((payloadObj.exp - now) / 3600).toFixed(1);
        status.message = `Expires in ${hoursLeft} hours`;
      }
    }
    
    if (payloadObj.iat) {
      status.iatReadable = new Date(payloadObj.iat * 1000).toLocaleString();
    }

    return status;
  };

  const decodeJWT = useCallback(() => {
    if (!jwtInput || !jwtInput.trim()) {
      setHeader(""); setPayload(""); setSignature("");
      setError(null); setSecurityAlert(null); setTimeStatus(null);
      return;
    }

    const parts = jwtInput.trim().split(".");
    if (parts.length !== 3) {
      setError("Invalid JWT structure. A JWT must have 3 parts separated by dots.");
      setHeader(""); setPayload(""); setSignature("");
      return;
    }

    try {
      const decodedHeader = decodeBase64Url(parts[0]);
      const parsedHeader = JSON.parse(decodedHeader);
      setHeader(JSON.stringify(parsedHeader, null, 2));

      if (parsedHeader.alg && parsedHeader.alg.toLowerCase() === "none") {
         setSecurityAlert("CRITICAL: Token uses 'none' algorithm. This is a severe security vulnerability!");
      } else {
         setSecurityAlert(null);
      }

      const decodedPayload = decodeBase64Url(parts[1]);
      const parsedPayload = JSON.parse(decodedPayload);
      setPayload(JSON.stringify(parsedPayload, null, 2));

      const tStatus = analyzeTime(parsedPayload);
      setTimeStatus(tStatus);

      setSignature(parts[2]);
      setError(null);

    } catch (err) {
      setError("Failed to decode token. Ensure it is a valid Base64Url encoded JWT.");
      setHeader(""); setPayload(""); setSignature("");
    }
  }, [jwtInput]);

  useEffect(() => {
    decodeJWT();
  }, [decodeJWT]);

  const handleCopy = async (text, section) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {}
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4 sm:pb-5 w-full">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
              <Key className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
                WEB SECURITY UTILITY
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
                JWT Decoder & Analyzer
              </h2>
              <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
                Decode, analyze, and inspect JSON Web Tokens locally in your browser.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-line bg-paper text-ink hover:border-brand text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all shrink-0"
            >
              <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" /> {showSettings ? "Hide Analysis" : "Analysis"}
            </button>
          </div>
        </div>

        {/* WORK AREA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-6 items-start w-full">
          
          <div className="flex flex-col gap-4 sm:gap-6 flex-grow min-w-0">
            
            {/* Input Section */}
            <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col shadow-sm w-full">
              <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between w-full">
                <label className="text-[11px] sm:text-xs font-black text-ink uppercase tracking-wider flex items-center gap-2">
                   <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand"/> Encoded JWT
                </label>
                <div>
                  {error ? (
                    <span className="text-[10px] text-[#fb7185] font-black uppercase tracking-wider flex items-center gap-1 bg-[#fb7185]/10 px-2.5 py-1 rounded-xl border border-[#fb7185]/30"><AlertTriangle className="w-3.5 h-3.5" /> Invalid</span>
                  ) : payload ? (
                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30"><CheckCircle2 className="w-3.5 h-3.5" /> Valid Token</span>
                  ) : null}
                </div>
              </div>
              <textarea
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                placeholder="Paste your JWT here (eyJ...)"
                className="w-full h-36 sm:h-40 p-4 sm:p-5 bg-surface border-0 text-xs sm:text-sm font-mono text-ink outline-none resize-none break-all tabular-nums"
                spellCheck="false"
              />
            </div>
            
            {/* Decoded Sections */}
            {!error && payload && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 w-full">
                
                {/* Header Section */}
                <div className="bg-paper border border-line rounded-2xl overflow-hidden shadow-sm w-full">
                  <div className="bg-surface px-4 py-3 flex items-center justify-between border-b border-line">
                    <span className="text-[10px] sm:text-xs font-black text-brand uppercase tracking-wider">Header (Algorithm & Type)</span>
                    <button type="button" onClick={() => handleCopy(header, 'header')} className="text-muted hover:text-ink p-1 rounded-lg transition-colors">
                      {copiedSection === 'header' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <pre className="p-4 sm:p-5 text-xs sm:text-sm font-mono text-ink overflow-x-auto bg-surface">
                    {header}
                  </pre>
                </div>

                {/* Payload Section */}
                <div className="bg-paper border border-line rounded-2xl overflow-hidden shadow-sm w-full">
                  <div className="bg-surface px-4 py-3 flex items-center justify-between border-b border-line">
                    <span className="text-[10px] sm:text-xs font-black text-brand uppercase tracking-wider">Payload (Data)</span>
                    <button type="button" onClick={() => handleCopy(payload, 'payload')} className="text-muted hover:text-ink p-1 rounded-lg transition-colors">
                      {copiedSection === 'payload' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <pre className="p-4 sm:p-5 text-xs sm:text-sm font-mono text-ink overflow-x-auto bg-surface">
                    {payload}
                  </pre>
                </div>

                {/* Signature Section */}
                <div className="bg-paper border border-line rounded-2xl overflow-hidden shadow-sm w-full">
                  <div className="bg-surface px-4 py-3 flex items-center justify-between border-b border-line">
                    <span className="text-[10px] sm:text-xs font-black text-brand uppercase tracking-wider">Verify Signature</span>
                  </div>
                  <div className="p-4 sm:p-5 text-xs sm:text-sm font-mono text-muted break-all bg-surface">
                    {signature}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT SIDE PANEL */}
          <div className={`space-y-4 sm:space-y-6 w-full ${showSettings ? "block" : "hidden lg:block"}`}>
            
            {error && (
              <div className="bg-[#fb7185]/10 border border-[#fb7185]/30 p-4 rounded-2xl shadow-sm text-[#fb7185] text-xs font-bold leading-relaxed">
                <AlertTriangle className="w-5 h-5 mb-2" />
                {error}
              </div>
            )}

            {!error && securityAlert && (
              <div className="bg-[#fb7185]/10 border border-[#fb7185]/30 p-4 sm:p-5 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#fb7185] font-black text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  Security Warning
                </div>
                <p className="text-[11px] text-[#fb7185] font-medium leading-relaxed">{securityAlert}</p>
              </div>
            )}

            {!error && timeStatus && (timeStatus.expReadable || timeStatus.iatReadable) && (
              <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl space-y-4 w-full box-border">
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                  <h3 className="text-xs font-black text-ink uppercase tracking-wider">Token Timeline</h3>
                </div>
                
                <div className="space-y-3">
                  {timeStatus.expReadable && (
                    <div className="p-3 bg-surface rounded-xl border border-line">
                      <span className="block text-[9px] font-black text-muted uppercase tracking-wider mb-1">Expiration (exp)</span>
                      <span className="block text-xs font-mono text-ink mb-1.5 tabular-nums">{timeStatus.expReadable}</span>
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${timeStatus.isExpired ? 'bg-[#fb7185]/10 text-[#fb7185] border border-[#fb7185]/30' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'}`}>
                        {timeStatus.message}
                      </span>
                    </div>
                  )}

                  {timeStatus.iatReadable && (
                    <div className="p-3 bg-surface rounded-xl border border-line">
                      <span className="block text-[9px] font-black text-muted uppercase tracking-wider mb-1">Issued At (iat)</span>
                      <span className="block text-xs font-mono text-ink tabular-nums">{timeStatus.iatReadable}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl space-y-3 w-full box-border">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                <h3 className="text-xs font-black text-ink uppercase tracking-wider">Local Security</h3>
              </div>
              <p className="text-[11px] text-muted font-medium leading-relaxed">
                Tokens are decoded entirely in your browser using native JavaScript. We do not send your JWT to any server, ensuring 100% data privacy.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}