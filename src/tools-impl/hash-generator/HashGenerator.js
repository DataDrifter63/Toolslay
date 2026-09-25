"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings2, ShieldCheck, FileText, Key, CheckCircle, AlertTriangle, Copy, Check, UploadCloud, Search, Hash } from "lucide-react";

const HASH_ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

export default function HashGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  const [inputMode, setInputMode] = useState("text"); // 'text' or 'file'
  const [inputText, setInputText] = useState("ToolsLay Pro Hash Generator");
  const [fileName, setFileName] = useState("");
  const [fileBuffer, setFileBuffer] = useState(null);
  
  // Settings & Pro Features
  const [useHmac, setUseHmac] = useState(false);
  const [hmacSecret, setHmacSecret] = useState("");
  const [compareHash, setCompareHash] = useState("");
  
  const [hashes, setHashes] = useState({});
  const [copiedHash, setCopiedHash] = useState(null);
  const [showSettings, setShowSettings] = useState(false); // Default hidden on mobile for clean start
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateHashes = useCallback(async () => {
    if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) return;
    
    setIsProcessing(true);
    let dataBuffer;

    if (inputMode === "text") {
      if (!inputText) {
        setHashes({});
        setIsProcessing(false);
        return;
      }
      dataBuffer = new TextEncoder().encode(inputText);
    } else {
      if (!fileBuffer) {
        setHashes({});
        setIsProcessing(false);
        return;
      }
      dataBuffer = fileBuffer;
    }

    try {
      const results = {};
      const enc = new TextEncoder();

      for (const algo of HASH_ALGOS) {
        let hashBuffer;
        if (useHmac && hmacSecret) {
          const key = await crypto.subtle.importKey(
            "raw",
            enc.encode(hmacSecret),
            { name: "HMAC", hash: algo },
            false,
            ["sign"]
          );
          hashBuffer = await crypto.subtle.sign("HMAC", key, dataBuffer);
        } else {
          hashBuffer = await crypto.subtle.digest(algo, dataBuffer);
        }
        
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        results[algo] = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      }
      setHashes(results);
    } catch (err) {
      console.error("Hashing failed:", err);
    }
    setIsProcessing(false);
  }, [inputMode, inputText, fileBuffer, useHmac, hmacSecret]);

  useEffect(() => {
    calculateHashes();
  }, [calculateHashes]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileBuffer(event.target.result);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCopy = async (hashString, algo) => {
    if (!hashString) return;
    try {
      await navigator.clipboard.writeText(hashString);
      setCopiedHash(algo);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {}
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4 sm:pb-5 w-full">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
                WEB SECURITY UTILITY
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
                Ultimate Hash Generator
              </h2>
              <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
                Generate SHA & HMAC cryptographic hashes locally with 0 dependencies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-line bg-paper text-ink hover:border-brand text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all shrink-0"
            >
              <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" /> {showSettings ? "Hide Tools" : "Tools"}
            </button>
          </div>
        </div>

        {/* WORK AREA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-6 items-start w-full">
          
          <div className="flex flex-col gap-4 sm:gap-6 flex-grow min-w-0">
            
            {/* Input Panel */}
            <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col shadow-sm w-full">
              <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between w-full">
                
                <div className="flex gap-1 bg-surface p-1 rounded-xl border border-line">
                  <button 
                    type="button"
                    onClick={() => setInputMode("text")}
                    className={`flex items-center gap-1.5 py-1.5 px-3 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all ${inputMode === 'text' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                  >
                    <FileText className="w-3.5 h-3.5"/> Text Input
                  </button>
                  <button 
                    type="button"
                    onClick={() => setInputMode("file")}
                    className={`flex items-center gap-1.5 py-1.5 px-3 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all ${inputMode === 'file' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                  >
                    <UploadCloud className="w-3.5 h-3.5"/> File Input
                  </button>
                </div>

                {isProcessing && <span className="text-[10px] font-black uppercase tracking-wider text-brand animate-pulse">Processing...</span>}
              </div>
              
              <div className="p-0 flex-grow">
                {inputMode === "text" ? (
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type or paste your text here..."
                    className="w-full h-full min-h-[140px] sm:min-h-[180px] p-4 sm:p-5 bg-surface border-0 text-xs sm:text-sm font-mono text-ink outline-none resize-none tabular-nums"
                    spellCheck="false"
                  />
                ) : (
                  <div className="h-full min-h-[140px] sm:min-h-[180px] flex flex-col items-center justify-center p-6 bg-surface border-2 border-dashed border-line m-4 rounded-xl text-center">
                    <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 text-muted mb-2" />
                    <p className="text-xs sm:text-sm font-bold text-ink mb-3 truncate max-w-xs">
                      {fileName ? fileName : "Select a file to securely hash locally."}<br/>
                      <span className="text-[10px] font-medium text-muted">File never leaves your browser.</span>
                    </p>
                    <label className="cursor-pointer bg-brand hover:opacity-95 text-surface text-xs font-black uppercase tracking-wider py-2.5 px-5 rounded-xl transition-opacity shadow-sm">
                      Browse File
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            {/* Hashes Output Panel */}
            <div className="bg-paper border border-line rounded-2xl overflow-hidden flex flex-col shadow-sm w-full">
              <div className="bg-surface px-4 py-3 border-b border-line flex items-center gap-2">
                <Hash className="w-4 h-4 text-brand" />
                <label className="text-xs font-black text-ink uppercase tracking-wider">
                  Generated Hashes
                </label>
              </div>
              <div className="p-4 space-y-3">
                {HASH_ALGOS.map((algo) => {
                  const hashValue = hashes[algo] || "";
                  const isMatch = compareHash && hashValue && hashValue.toLowerCase() === compareHash.toLowerCase();

                  return (
                    <div key={algo} className={`relative flex items-center justify-between p-3 rounded-xl border transition-colors ${isMatch ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-surface border-line'}`}>
                      <div className="flex flex-col overflow-hidden mr-3 min-w-0">
                        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-1 truncate ${isMatch ? 'text-emerald-500' : 'text-muted'}`}>
                          {useHmac ? `HMAC-${algo}` : algo}
                          {isMatch && " • MATCHED!"}
                        </span>
                        <span className="font-mono text-[11px] sm:text-xs text-ink truncate select-all tabular-nums">
                          {hashValue || "..."}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCopy(hashValue, algo)}
                        disabled={!hashValue}
                        className="flex-shrink-0 p-2 text-muted hover:text-brand hover:bg-surface rounded-xl transition-colors disabled:opacity-30"
                      >
                        {copiedHash === algo ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* SIDEBAR TOOLS (Collapsible or stacked) */}
          <div className={`space-y-4 sm:space-y-6 w-full ${showSettings ? "block" : "hidden lg:block"}`}>
            
            {/* Hash Comparator */}
            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4 w-full box-border">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                <h3 className="text-xs font-black text-ink uppercase tracking-wider">Hash Comparator</h3>
              </div>
              
              <div className="pt-1">
                <label className="block text-[10px] font-black text-muted uppercase tracking-wider mb-2">Paste expected hash to verify</label>
                <input 
                    type="text" 
                    value={compareHash}
                    onChange={(e) => setCompareHash(e.target.value.trim())}
                    placeholder="e.g. d41d8cd98f..."
                    className="w-full text-xs font-mono bg-surface border border-line rounded-xl py-2.5 px-3 outline-none focus:border-brand text-ink tabular-nums"
                    spellCheck="false"
                />
                {compareHash && !Object.values(hashes).some(h => h.toLowerCase() === compareHash.toLowerCase()) && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#fb7185] mt-2">
                    <AlertTriangle className="w-3.5 h-3.5"/> No match found
                  </span>
                )}
                {compareHash && Object.values(hashes).some(h => h.toLowerCase() === compareHash.toLowerCase()) && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-500 mt-2">
                    <CheckCircle className="w-3.5 h-3.5"/> Hash matches perfectly!
                  </span>
                )}
              </div>
            </div>

            {/* HMAC Security */}
            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4 w-full box-border">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <Key className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                <h3 className="text-xs font-black text-ink uppercase tracking-wider">HMAC Security</h3>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-line bg-surface hover:border-brand/50 transition-all select-none">
                  <input type="checkbox" checked={useHmac} onChange={(e) => setUseHmac(e.target.checked)} className="w-4 h-4 accent-brand rounded border-line" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-ink uppercase tracking-wider truncate">Enable HMAC Mode</span>
                    <span className="text-[10px] font-medium text-muted mt-0.5 truncate">Generate Webhook signatures</span>
                  </div>
                </label>

                {useHmac && (
                  <div className="animate-in fade-in slide-in-from-top-2 pt-1">
                    <label className="block text-[10px] font-black text-muted uppercase tracking-wider mb-2">Secret Key</label>
                    <input 
                        type="text" 
                        value={hmacSecret}
                        onChange={(e) => setHmacSecret(e.target.value)}
                        placeholder="Enter your secret key..."
                        className="w-full text-xs font-mono bg-surface border border-line rounded-xl py-2.5 px-3 outline-none focus:border-brand text-ink"
                        spellCheck="false"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}