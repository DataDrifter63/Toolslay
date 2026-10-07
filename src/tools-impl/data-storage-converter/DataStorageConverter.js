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

  const results = useMemo(() => {
    const val = parseFloat(inputValue) || 0;
    const baseMultiplier = calculationMode === "decimal" ? 1000 : 1024;
    
    let bytes = 0;
    const unitIndex = UNITS.findIndex(u => u.id === inputUnit);
    
    if (inputUnit === "b") {
      bytes = val / 8;
    } else if (inputUnit === "B") {
      bytes = val;
    } else {
      bytes = val * Math.pow(baseMultiplier, unitIndex - 1);
    }

    const grid = UNITS.map((unit, idx) => {
      let converted = 0;
      if (unit.id === "b") {
        converted = bytes * 8;
      } else if (unit.id === "B") {
        converted = bytes;
      } else {
        converted = bytes / Math.pow(baseMultiplier, idx - 1);
      }
      
      const formatted = converted > 0 && converted < 0.0001 
        ? converted.toExponential(4) 
        : parseFloat(converted.toPrecision(10)).toString();

      return {
        ...unit,
        value: formatted,
        symbol: calculationMode === "decimal" ? unit.decSymbol : unit.binSymbol
      };
    });

    const media = {
      photos: Math.floor(bytes / MEDIA_SIZES.photo),
      songs: Math.floor(bytes / MEDIA_SIZES.song),
      movies: Math.floor(bytes / MEDIA_SIZES.movie),
      movies4k: Math.floor(bytes / MEDIA_SIZES.movie4k),
      games: Math.floor(bytes / MEDIA_SIZES.game),
    };

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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-sans">
      
      {/* HEADER BAR */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-4 sm:space-y-6 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-brand/10 text-brand text-lg sm:text-xl font-black shrink-0">
            <HardDrive className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-brand uppercase mb-0.5 sm:mb-1">
              STORAGE & BANDWIDTH UTILITY
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight truncate">
              Data & Bandwidth Oracle
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted mt-0.5 truncate">
              Storage sizing & transfer speed estimator with real-world metrics.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIGURATION ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border">
            
            {/* 1. Base Logic Toggle */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Cpu className="w-3.5 h-3.5 text-brand" /> 1. Calculation Engine
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setCalculationMode("binary")}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-1 ${calculationMode === "binary" ? 'border-brand bg-brand/10' : 'border-line hover:border-brand/50 bg-surface'}`}
                >
                  <div className="flex justify-between w-full items-center">
                    <span className={`text-xs font-black uppercase tracking-wider ${calculationMode === "binary" ? 'text-brand' : 'text-ink'}`}>Operating System</span>
                    {calculationMode === "binary" && <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />}
                  </div>
                  <span className="text-[10px] font-bold text-muted text-left">Base-2 (1024) • Used by Windows/Mac</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setCalculationMode("decimal")}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-1 ${calculationMode === "decimal" ? 'border-brand bg-brand/10' : 'border-line hover:border-brand/50 bg-surface'}`}
                >
                  <div className="flex justify-between w-full items-center">
                    <span className={`text-xs font-black uppercase tracking-wider ${calculationMode === "decimal" ? 'text-brand' : 'text-ink'}`}>Hard Drive Makers</span>
                    {calculationMode === "decimal" && <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />}
                  </div>
                  <span className="text-[10px] font-bold text-muted text-left">Base-10 (1000) • Used on HDD/SSD boxes</span>
                </button>
              </div>

              <div className="flex items-start gap-2 bg-surface p-3 rounded-xl border border-line">
                <Info className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-muted leading-relaxed">
                  Ever wondered why a "1 TB" drive only shows ~931 GB in Windows? Manufacturers use Base-10, but Windows calculates in Base-2. Use the toggle above to see the real difference!
                </p>
              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Primary Input */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <ArrowRightLeft className="w-3.5 h-3.5 text-brand" /> 2. Data Size
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider mb-1.5 block">File / Drive Size</label>
                  <input
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => handleNumInput(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full h-12 sm:h-14 bg-surface border border-line rounded-xl px-4 text-xl sm:text-2xl font-black text-ink outline-none focus:border-brand tabular-nums"
                  />
                </div>
                
                <div className="w-full sm:w-32 shrink-0">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider mb-1.5 block">Unit</label>
                  <select
                    value={inputUnit} 
                    onChange={(e) => setInputUnit(e.target.value)}
                    className="w-full h-12 sm:h-14 bg-surface border border-line rounded-xl px-3 text-xs font-black text-ink outline-none cursor-pointer focus:border-brand uppercase tracking-wider"
                  >
                    {UNITS.map(u => (
                      <option key={u.id} value={u.id}>{calculationMode === 'decimal' ? u.decSymbol : u.binSymbol}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Omni Grid Displays */}
            <div className="space-y-3 animate-in fade-in">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">All Conversions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {results.grid.filter(u => u.id !== 'b' && u.id !== 'B').map((unit) => (
                  <div key={unit.id} className={`flex flex-col p-3 rounded-xl border ${inputUnit === unit.id ? 'border-brand/50 bg-brand/10' : 'border-line bg-surface'} transition-colors`}>
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider mb-0.5 truncate">{unit.name}</span>
                    <div className="flex justify-between items-baseline min-w-0">
                      <span className={`text-xs sm:text-sm font-black tabular-nums truncate pr-1 ${inputUnit === unit.id ? 'text-brand' : 'text-ink'}`}>
                        {unit.value}
                      </span>
                      <span className="text-[10px] font-bold text-muted shrink-0">{unit.symbol}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-black text-muted uppercase tracking-wider justify-center bg-surface py-2.5 px-3 rounded-xl border border-line">
                <span className="truncate">{results.grid.find(u => u.id === 'B').value} Bytes</span>
                <span>•</span>
                <span className="truncate">{results.grid.find(u => u.id === 'b').value} Bits</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: THE DASHBOARD / ORACLE */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-5 w-full box-border">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className="w-4 h-4 text-brand" /> Contextual Oracle
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30">
                Real-World
              </span>
            </div>

            {/* MEDIA CONTEXT ESTIMATOR */}
            <div className="space-y-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-brand" /> What fits in this size?
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col p-3 rounded-xl border border-line bg-surface shadow-sm">
                  <ImageIcon className="w-4 h-4 text-emerald-500 mb-1.5" />
                  <span className="text-base sm:text-lg font-black text-ink tabular-nums leading-none mb-1 truncate">{results.formatNumber(results.media.photos)}</span>
                  <span className="text-[9px] font-black text-muted uppercase tracking-wider truncate">High-Res Photos</span>
                </div>
                
                <div className="flex flex-col p-3 rounded-xl border border-line bg-surface shadow-sm">
                  <Music className="w-4 h-4 text-sky-500 mb-1.5" />
                  <span className="text-base sm:text-lg font-black text-ink tabular-nums leading-none mb-1 truncate">{results.formatNumber(results.media.songs)}</span>
                  <span className="text-[9px] font-black text-muted uppercase tracking-wider truncate">MP3 Songs</span>
                </div>
                
                <div className="flex flex-col p-3 rounded-xl border border-line bg-surface shadow-sm">
                  <Film className="w-4 h-4 text-indigo-500 mb-1.5" />
                  <span className="text-base sm:text-lg font-black text-ink tabular-nums leading-none mb-1 truncate">{results.formatNumber(results.media.movies)}</span>
                  <span className="text-[9px] font-black text-muted uppercase tracking-wider truncate">HD 1080p Movies</span>
                </div>

                <div className="flex flex-col p-3 rounded-xl border border-line bg-surface shadow-sm">
                  <Zap className="w-4 h-4 text-[#fb7185] mb-1.5" />
                  <span className="text-base sm:text-lg font-black text-ink tabular-nums leading-none mb-1 truncate">{results.formatNumber(results.media.games)}</span>
                  <span className="text-[9px] font-black text-muted uppercase tracking-wider truncate">AAA Video Games</span>
                </div>
              </div>
            </div>

            {/* TRANSFER SPEED ESTIMATOR */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted border-b border-line pb-2">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand" /> Transfer Time</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Estimates</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-line">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0"><Usb className="w-4 h-4"/></div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-ink uppercase tracking-wider block truncate">USB 3.0 Drive</span>
                      <span className="text-[9px] font-medium text-muted block truncate">~400 MB/s Avg</span>
                    </div>
                  </div>
                  <span className="text-xs font-black tabular-nums text-ink shrink-0 ml-2">{results.transfers.usb3}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-line">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0"><Activity className="w-4 h-4"/></div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-ink uppercase tracking-wider block truncate">1 Gbps LAN</span>
                      <span className="text-[9px] font-medium text-muted block truncate">~115 MB/s Avg</span>
                    </div>
                  </div>
                  <span className="text-xs font-black tabular-nums text-ink shrink-0 ml-2">{results.transfers.eth1g}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-line">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-violet-500/10 text-violet-500 rounded-lg shrink-0"><Wifi className="w-4 h-4"/></div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-ink uppercase tracking-wider block truncate">Wi-Fi 6 Network</span>
                      <span className="text-[9px] font-medium text-muted block truncate">~150 MB/s Avg</span>
                    </div>
                  </div>
                  <span className="text-xs font-black tabular-nums text-ink shrink-0 ml-2">{results.transfers.wifi6}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-line opacity-60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-surface text-muted rounded-lg shrink-0"><Usb className="w-4 h-4"/></div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-ink uppercase tracking-wider block truncate">Old USB 2.0</span>
                      <span className="text-[9px] font-medium text-muted block truncate">~40 MB/s Avg</span>
                    </div>
                  </div>
                  <span className="text-xs font-black tabular-nums text-muted shrink-0 ml-2">{results.transfers.usb2}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}