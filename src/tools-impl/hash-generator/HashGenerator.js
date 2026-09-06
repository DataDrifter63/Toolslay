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
  const [showSettings, setShowSettings] = useState(true);
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
          // Generate HMAC
          const key = await crypto.subtle.importKey(
            "raw",
            enc.encode(hmacSecret),
            { name: "HMAC", hash: algo },
            false,
            ["sign"]
          );
          hashBuffer = await crypto.subtle.sign("HMAC", key, dataBuffer);
        } else {
          // Normal Hash
          hashBuffer = await crypto.subtle.digest(algo, dataBuffer);
        }
        
        // Convert buffer to Hex String
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
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-teal-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Ultimate Hash Generator</h2>
          <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-bold px-3 py-1 rounded-full uppercase hidden sm:block">0 Dependencies</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:text-teal-600 transition-all">
            <Settings2 className="w-4 h-4" /> {showSettings ? "Hide Tools" : "Show Tools"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 items-start">
        
        <div className="flex flex-col gap-6 flex-grow min-h-[600px]">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              
              <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-900 p-1 rounded-lg">
                <button 
                  onClick={() => setInputMode("text")}
                  className={`flex items-center gap-2 py-1.5 px-4 text-xs font-bold rounded-md transition-all ${inputMode === 'text' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <FileText className="w-3.5 h-3.5"/> Text Input
                </button>
                <button 
                  onClick={() => setInputMode("file")}
                  className={`flex items-center gap-2 py-1.5 px-4 text-xs font-bold rounded-md transition-all ${inputMode === 'file' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <UploadCloud className="w-3.5 h-3.5"/> File Input
                </button>
              </div>

              {isProcessing && <span className="text-xs font-bold text-teal-500 animate-pulse flex items-center gap-1">Processing...</span>}
            </div>
            
            <div className="p-0 flex-grow">
              {inputMode === "text" ? (
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="w-full h-full min-h-[150px] p-6 bg-transparent text-sm font-mono text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                  spellCheck="false"
                />
              ) : (
                <div className="h-full min-h-[150px] flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-700 m-4 rounded-xl">
                  <UploadCloud className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4 text-center">
                    {fileName ? fileName : "Select a file to securely hash locally."}<br/>
                    <span className="text-xs font-normal text-slate-400">File never leaves your browser.</span>
                  </p>
                  <label className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2 px-6 rounded-lg transition-colors shadow-sm">
                    Browse File
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Hash className="w-4 h-4 text-teal-500" />
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Generated Hashes
              </label>
            </div>
            <div className="p-4 space-y-4">
              {HASH_ALGOS.map((algo) => {
                const hashValue = hashes[algo] || "";
                const isMatch = compareHash && hashValue && hashValue.toLowerCase() === compareHash.toLowerCase();

                return (
                  <div key={algo} className={`relative flex items-center justify-between p-3 rounded-lg border transition-colors ${isMatch ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'}`}>
                    <div className="flex flex-col overflow-hidden mr-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isMatch ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {useHmac ? `HMAC-${algo}` : algo}
                        {isMatch && " • MATCHED!"}
                      </span>
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate select-all">
                        {hashValue || "..."}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleCopy(hashValue, algo)}
                      disabled={!hashValue}
                      className="flex-shrink-0 p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-md transition-colors disabled:opacity-30"
                    >
                      {copiedHash === algo ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="space-y-6 lg:w-80 lg:max-w-80 flex flex-col h-full">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Search className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Hash Comparator</h3>
              </div>
              
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-500 mb-2">Paste expected hash to verify</label>
                <input 
                    type="text" 
                    value={compareHash}
                    onChange={(e) => setCompareHash(e.target.value.trim())}
                    placeholder="e.g. d41d8cd98f..."
                    className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 dark:text-slate-200"
                    spellCheck="false"
                />
                {compareHash && !Object.values(hashes).some(h => h.toLowerCase() === compareHash.toLowerCase()) && (
                  <span className="flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-2">
                    <AlertTriangle className="w-3 h-3"/> No match found
                  </span>
                )}
                {compareHash && Object.values(hashes).some(h => h.toLowerCase() === compareHash.toLowerCase()) && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold mt-2">
                    <CheckCircle className="w-3 h-3"/> Hash matches perfectly!
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">HMAC Security</h3>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <input type="checkbox" checked={useHmac} onChange={(e) => setUseHmac(e.target.checked)} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Enable HMAC Mode</span>
                    <span className="text-[10px] text-slate-400">Generate Webhook signatures</span>
                  </div>
                </label>

                {useHmac && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Secret Key</label>
                    <input 
                        type="text" 
                        value={hmacSecret}
                        onChange={(e) => setHmacSecret(e.target.value)}
                        placeholder="Enter your secret key..."
                        className="w-full text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 dark:text-slate-200"
                        spellCheck="false"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}