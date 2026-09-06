"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings2, ShieldCheck, Key, AlertTriangle, Copy, Check, Clock, Code, Lock, ShieldAlert, CheckCircle2 } from "lucide-react";

// ✅ 100% Native Base64Url Decoder (No third-party libraries needed!)
const decodeBase64Url = (base64Url) => {
  try {
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    // decodeURIComponent/escape ensures UTF-8 characters are handled correctly
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    throw new Error("Invalid Base64Url encoding");
  }
};

const DEMO_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRvb2xzTGF5IFBybyBVc2VyIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTQxMjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoder() {
  const [isMounted, setIsMounted] = useState(false);
  const [jwtInput, setJwtInput] = useState(DEMO_JWT);
  
  // Decoded States
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");
  
  // Analysis States
  const [error, setError] = useState(null);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [timeStatus, setTimeStatus] = useState(null);
  
  const [showSettings, setShowSettings] = useState(true);
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
      // Decode Header
      const decodedHeader = decodeBase64Url(parts[0]);
      const parsedHeader = JSON.parse(decodedHeader);
      setHeader(JSON.stringify(parsedHeader, null, 2));

      // Security Check: alg=none
      if (parsedHeader.alg && parsedHeader.alg.toLowerCase() === "none") {
         setSecurityAlert("CRITICAL: Token uses 'none' algorithm. This is a severe security vulnerability!");
      } else {
         setSecurityAlert(null);
      }

      // Decode Payload
      const decodedPayload = decodeBase64Url(parts[1]);
      const parsedPayload = JSON.parse(decodedPayload);
      setPayload(JSON.stringify(parsedPayload, null, 2));

      // Analyze Timestamps
      const tStatus = analyzeTime(parsedPayload);
      setTimeStatus(tStatus);

      // Signature (Cannot decode easily without secret, so we display the hex/base64url)
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
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-fuchsia-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">JWT Decoder & Analyzer</h2>
          <span className="bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 text-xs font-bold px-3 py-1 rounded-full uppercase hidden sm:block">Pro Utility</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-fuchsia-500 hover:text-fuchsia-600 transition-all">
            <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Analysis" : "Show Analysis"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        
        <div className="flex flex-col gap-6 flex-grow">
          
          {/* Input Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                 <Code className="w-4 h-4 text-slate-500"/> Encoded JWT
              </label>
              {error ? (
                <span className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-200"><AlertTriangle className="w-3.5 h-3.5" /> Invalid</span>
              ) : payload ? (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Valid Token</span>
              ) : null}
            </div>
            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              placeholder="Paste your JWT here (eyJ...)"
              className="w-full h-40 p-4 bg-transparent text-sm font-mono text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500 break-all"
              spellCheck="false"
            />
          </div>
          
          {/* Decoded Sections */}
          {!error && payload && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              
              {/* Header (Red/Pink) */}
              <div className="bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-900/50 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-pink-50 dark:bg-pink-900/20 px-4 py-2 flex items-center justify-between border-b border-pink-200 dark:border-pink-900/50">
                  <span className="text-xs font-bold text-pink-700 dark:text-pink-400 uppercase tracking-widest">Header (Algorithm & Type)</span>
                  <button onClick={() => handleCopy(header, 'header')} className="text-pink-500 hover:text-pink-700 p-1">
                    {copiedSection === 'header' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="p-4 text-sm font-mono text-pink-700 dark:text-pink-300 overflow-x-auto">
                  {header}
                </pre>
              </div>

              {/* Payload (Purple) */}
              <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 flex items-center justify-between border-b border-purple-200 dark:border-purple-900/50">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest">Payload (Data)</span>
                  <button onClick={() => handleCopy(payload, 'payload')} className="text-purple-500 hover:text-purple-700 p-1">
                    {copiedSection === 'payload' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="p-4 text-sm font-mono text-purple-700 dark:text-purple-300 overflow-x-auto">
                  {payload}
                </pre>
              </div>

              {/* Signature (Teal) */}
              <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/50 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-teal-50 dark:bg-teal-900/20 px-4 py-2 flex items-center justify-between border-b border-teal-200 dark:border-teal-900/50">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">Verify Signature</span>
                </div>
                <div className="p-4 text-sm font-mono text-teal-700 dark:text-teal-300 break-all">
                  {signature}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Right Side Panel */}
        {showSettings && (
          <div className="space-y-6 lg:w-80 lg:max-w-80 flex flex-col h-full">
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-xl shadow-sm text-red-600 dark:text-red-400 text-sm font-medium">
                <AlertTriangle className="w-5 h-5 mb-2" />
                {error}
              </div>
            )}

            {!error && securityAlert && (
              <div className="bg-red-50 border border-red-300 p-5 rounded-xl shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-red-600 font-bold">
                  <ShieldAlert className="w-5 h-5" />
                  Security Warning
                </div>
                <p className="text-xs text-red-700 font-medium leading-relaxed">{securityAlert}</p>
              </div>
            )}

            {!error && timeStatus && (timeStatus.expReadable || timeStatus.iatReadable) && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Clock className="w-5 h-5 text-sky-500" />
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Token Timeline</h3>
                </div>
                
                <div className="space-y-4">
                  {timeStatus.expReadable && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expiration (exp)</span>
                      <span className="block text-sm font-mono text-slate-800 dark:text-slate-200 mb-1">{timeStatus.expReadable}</span>
                      <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${timeStatus.isExpired ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {timeStatus.message}
                      </span>
                    </div>
                  )}

                  {timeStatus.iatReadable && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Issued At (iat)</span>
                      <span className="block text-sm font-mono text-slate-800 dark:text-slate-200">{timeStatus.iatReadable}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Local Security</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tokens are decoded entirely in your browser using native JavaScript. We do not send your JWT to any server, ensuring 100% data privacy.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}