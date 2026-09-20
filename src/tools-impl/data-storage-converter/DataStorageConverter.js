"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  HardDrive, Cpu, Image as ImageIcon, Film, 
  Music, Clock, Wifi, Usb, Zap, 
  ArrowRightLeft, Activity, Info, CheckCircle2
} from "lucide-react";

// Standard SI (Base-10) and IEC (Base-2) Data
const UNITS = [
  { id: "b", name: "Bit", decSymbol: "b", binSymbol: "b" },
  { id: "B", name: "Byte", decSymbol: "B", binSymbol: "B" },
  { id: "K", name: "Kilobyte", decSymbol: "KB", binSymbol: "KiB" },
  { id: "M", name: "Megabyte", decSymbol: "MB", binSymbol: "MiB" },
  { id: "G", name: "Gigabyte", decSymbol: "GB", binSymbol: "GiB" },
  { id: "T", name: "Terabyte", decSymbol: "TB", binSymbol: "TiB" },
  { id: "P", name: "Petabyte", decSymbol: "PB", binSymbol: "PiB" }
];

// Media Context Averages (in Bytes)
const MEDIA_SIZES = {
  photo: 5 * 1000 * 1000, // 5 MB (High Res)
  song: 4 * 1000 * 1000, // 4 MB (MP3)
  movie: 2 * 1000 * 1000 * 1000, // 2 GB (HD Movie)
  movie4k: 15 * 1000 * 1000 * 1000, // 15 GB (4K Movie)
  game: 80 * 1000 * 1000 * 1000 // 80 GB (AAA Game)
};

// Transfer Speeds (Bytes per second - Real world averages)
const TRANSFER_SPEEDS = {
  usb2: 40 * 1000 * 1000, // ~40 MB/s
  usb3: 400 * 1000 * 1000, // ~400 MB/s
  eth1g: 115 * 1000 * 1000, // 1 Gbps Ethernet (~115 MB/s)
  wifi6: 150 * 1000 * 1000 // Wi-Fi 6 (~150 MB/s)
};

export default function DataStorageConverter() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [inputValue, setInputValue] = useState("1");
  const [inputUnit, setInputUnit] = useState("T"); // Default 1 TB
  const [calculationMode, setCalculationMode] = useState("binary"); // 'decimal' (Base-10) or 'binary' (Base-2)

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNumInput = (value) => {
    if (value === "") {
      setInputValue("");
      return;
    }
    if (/^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  // --- CORE DATA ENGINE ---
  const results = useMemo(() => {
    const val = parseFloat(inputValue) || 0;
    const baseMultiplier = calculationMode === "decimal" ? 1000 : 1024;
    
    // 1. Convert everything to Base Bytes first
    let bytes = 0;
    const unitIndex = UNITS.findIndex(u => u.id === inputUnit);
    
    if (inputUnit === "b") {
      bytes = val / 8;
    } else if (inputUnit === "B") {
      bytes = val;
    } else {
      // Multiply by base (1000 or 1024) to the power of index - 1 (since index 1 is Byte)
      bytes = val * Math.pow(baseMultiplier, unitIndex - 1);
    }

    // 2. Generate Grid Conversions
    const grid = UNITS.map((unit, idx) => {
      let converted = 0;
      if (unit.id === "b") {
        converted = bytes * 8;
      } else if (unit.id === "B") {
        converted = bytes;
      } else {
        converted = bytes / Math.pow(baseMultiplier, idx - 1);
      }
      
      // Dynamic formatting to avoid scientific notation for normal numbers and remove trailing zeros
      const formatted = converted > 0 && converted < 0.0001 
        ? converted.toExponential(4) 
        : parseFloat(converted.toPrecision(10)).toString(); // Max 10 sig figs

      return {
        ...unit,
        value: formatted,
        symbol: calculationMode === "decimal" ? unit.decSymbol : unit.binSymbol
      };
    });

    // 3. Media Context Estimator
    const media = {
      photos: Math.floor(bytes / MEDIA_SIZES.photo),
      songs: Math.floor(bytes / MEDIA_SIZES.song),
      movies: Math.floor(bytes / MEDIA_SIZES.movie),
      movies4k: Math.floor(bytes / MEDIA_SIZES.movie4k),
      games: Math.floor(bytes / MEDIA_SIZES.game),
    };

    // 4. Transfer Time Estimator Helper
    const formatTime = (seconds) => {
      if (seconds === 0) return "Instant";
      if (seconds < 1) return "< 1 sec";
      if (seconds < 60) return `${Math.ceil(seconds)} secs`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    const transfers = {
      usb2: formatTime(bytes / TRANSFER_SPEEDS.usb2),
      usb3: formatTime(bytes / TRANSFER_SPEEDS.usb3),
      eth1g: formatTime(bytes / TRANSFER_SPEEDS.eth1g),
      wifi6: formatTime(bytes / TRANSFER_SPEEDS.wifi6),
    };

    const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

    return { bytes, grid, media, transfers, formatNumber };
  }, [inputValue, inputUnit, calculationMode]);

  if (!isMounted) return null;

  // Premium Theme (Cyan & Violet for Tech Vibe)
  const theme = {
    gradient: "from-cyan-100 via-violet-50 to-transparent dark:from-cyan-900/30 dark:via-violet-900/10",
    bgIcon: "bg-gradient-to-br from-cyan-500 to-violet-600",
    textPri: "text-cyan-600 dark:text-cyan-400",
    textSec: "text-violet-600 dark:text-violet-400",
    borderLight: "border-cyan-200 dark:border-cyan-800",
    bgLight: "bg-cyan-50 dark:bg-cyan-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Data & Bandwidth Oracle
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Storage Sizing & Transfer Speed Estimator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,500px] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Base Logic Toggle */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Cpu className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Calculation Engine
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={() => setCalculationMode("binary")}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-1.5 ${calculationMode === "binary" ? `${theme.borderLight}${theme.bgLight}` : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50"}`}
                >
                  <div className="flex justify-between w-full items-center">
                    <span className={`text-xs font-black uppercase tracking-widest ${calculationMode === "binary" ? theme.textSec : "text-slate-600 dark:text-slate-400"}`}>Operating System</span>
                    {calculationMode === "binary" && <CheckCircle2 className={`w-4 h-4 ${theme.textSec}`} />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 text-left">Base-2 (1024) • Used by Windows/Mac</span>
                </button>
                
                <button 
                  onClick={() => setCalculationMode("decimal")}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-1.5 ${calculationMode === "decimal" ? `${theme.borderLight}${theme.bgLight}` : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50"}`}
                >
                  <div className="flex justify-between w-full items-center">
                    <span className={`text-xs font-black uppercase tracking-widest ${calculationMode === "decimal" ? theme.textPri : "text-slate-600 dark:text-slate-400"}`}>Hard Drive Makers</span>
                    {calculationMode === "decimal" && <CheckCircle2 className={`w-4 h-4 ${theme.textPri}`} />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 text-left">Base-10 (1000) • Used on HDD/SSD boxes</span>
                </button>
              </div>

              {/* Smart Insight Alert */}
              <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                  Ever wondered why a "1 TB" drive only shows ~931 GB in Windows? Manufacturers use Base-10 (1TB = 1,000,000,000,000 bytes), but Windows calculates in Base-2 (1TiB = 1,099,511,627,776 bytes). Use the toggle above to see the real difference!
                </p>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Primary Input */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <ArrowRightLeft className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Data Size
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">File / Drive Size</label>
                  <div className={`relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-500/10 transition-all overflow-hidden group`}>
                    <input
                      type="text" value={inputValue} onChange={(e) => handleNumInput(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full bg-transparent px-5 py-4 text-3xl font-black text-slate-800 dark:text-slate-100 outline-none tabular-nums"
                    />
                  </div>
                </div>
                
                <div className="w-full sm:w-32">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Unit</label>
                  <select
                    value={inputUnit} onChange={(e) => setInputUnit(e.target.value)}
                    className="w-full h-[72px] bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-base font-black text-slate-800 dark:text-slate-100 outline-none cursor-pointer focus:border-slate-400 tracking-widest"
                  >
                    {UNITS.map(u => (
                      <option key={u.id} value={u.id}>{calculationMode === 'decimal' ? u.decSymbol : u.binSymbol}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Omni Grid Displays */}
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">All Conversions</h3>
              <div className="grid grid-cols-2 gap-2">
                {results.grid.filter(u => u.id !== 'b' && u.id !== 'B').map((unit) => (
                  <div key={unit.id} className={`flex flex-col p-3 rounded-xl border ${inputUnit === unit.id ? `${theme.borderLight}${theme.bgLight}` : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"} transition-colors`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{unit.name}</span>
                    <div className="flex justify-between items-baseline">
                      <span className={`text-sm font-black tabular-nums truncate pr-2 ${inputUnit === unit.id ? theme.textPri : "text-slate-700 dark:text-slate-200"}`}>
                        {unit.value}
                      </span>
                      <span className={`text-xs font-bold ${inputUnit === unit.id ? theme.textSec : "text-slate-400"}`}>{unit.symbol}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Bit / Byte small bar */}
              <div className="flex gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest justify-center bg-slate-50 dark:bg-slate-800/50 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span>{results.grid.find(u => u.id === 'B').value} Bytes</span>
                <span>•</span>
                <span>{results.grid.find(u => u.id === 'b').value} Bits</span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE DASHBOARD / ORACLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[640px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Contextual Oracle
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  Real-World Metrics
                </span>
              </div>

              {/* MEDIA CONTEXT ESTIMATOR */}
              <div className="mb-6 shrink-0 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" /> What fits in this size?
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                    <ImageIcon className="w-5 h-5 text-emerald-500 mb-2" />
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">{results.formatNumber(results.media.photos)}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">High-Res Photos</span>
                  </div>
                  
                  <div className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                    <Music className="w-5 h-5 text-sky-500 mb-2" />
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">{results.formatNumber(results.media.songs)}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MP3 Songs</span>
                  </div>
                  
                  <div className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                    <Film className="w-5 h-5 text-indigo-500 mb-2" />
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">{results.formatNumber(results.media.movies)}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">HD 1080p Movies</span>
                  </div>

                  <div className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                    <Zap className="w-5 h-5 text-rose-500 mb-2" />
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none mb-1">{results.formatNumber(results.media.games)}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AAA Video Games</span>
                  </div>
                </div>
              </div>

              {/* TRANSFER SPEED ESTIMATOR */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden mt-auto">
                
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time to Transfer</span>
                  <span className="text-[8px] bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">ESTIMATES</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                  
                  {/* USB 3.0 */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Usb className="w-4 h-4"/></div>
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">USB 3.0 Drive</span>
                        <span className="text-[9px] font-bold text-slate-400">~400 MB/s Avg</span>
                      </div>
                    </div>
                    <span className="text-sm font-black tabular-nums text-slate-700 dark:text-slate-200">{results.transfers.usb3}</span>
                  </div>

                  {/* 1 Gbps Ethernet */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Activity className="w-4 h-4"/></div>
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">1 Gbps LAN</span>
                        <span className="text-[9px] font-bold text-slate-400">~115 MB/s Avg</span>
                      </div>
                    </div>
                    <span className="text-sm font-black tabular-nums text-slate-700 dark:text-slate-200">{results.transfers.eth1g}</span>
                  </div>

                  {/* Wi-Fi 6 */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg"><Wifi className="w-4 h-4"/></div>
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Wi-Fi 6 Network</span>
                        <span className="text-[9px] font-bold text-slate-400">~150 MB/s Avg</span>
                      </div>
                    </div>
                    <span className="text-sm font-black tabular-nums text-slate-700 dark:text-slate-200">{results.transfers.wifi6}</span>
                  </div>

                  {/* Older USB 2.0 */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg"><Usb className="w-4 h-4"/></div>
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Old USB 2.0</span>
                        <span className="text-[9px] font-bold text-slate-400">~40 MB/s Avg</span>
                      </div>
                    </div>
                    <span className="text-sm font-black tabular-nums text-slate-500">{results.transfers.usb2}</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}