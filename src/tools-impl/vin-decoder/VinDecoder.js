"use client";

import React, { useState, useEffect } from "react";
import {
  Car, Search, AlertCircle, CheckCircle2, 
  History, Copy, MapPin, Wrench, 
  Fuel, Settings2, ShieldCheck, Loader2, 
  Gauge, Activity, Factory, Scale
} from "lucide-react";

export default function VinDecoder() {
  const [isMounted, setIsMounted] = useState(false);
  
  // States
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [garage, setGarage] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Initial Dummy Data for Premium Preview Effect
    setVehicleData({
      vin: "SAMPLEVIN12345678",
      make: "TESLA",
      model: "Model 3",
      year: "2023",
      trim: "Long Range",
      type: "Passenger Car",
      bodyClass: "Sedan/Saloon",
      doors: "4",
      manufacturer: "TESLA, INC.",
      plant: "Fremont, CA, USA",
      engine: "Dual Motor - Electric",
      fuel: "Electric",
      drive: "AWD",
      transmission: "1-Speed Automatic",
      gvwr: "Class 2E: 6,001 - 7,000 lb",
      abs: "Standard",
      isPreview: true
    });
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[IOQ]/g, "").slice(0, 17);
    setVin(val);
    if (error) setError(null);
  };

  // Upgraded Full Data Parsing Logic
  const decodeVin = async () => {
    if (vin.length !== 17) {
      setError("A valid VIN must be exactly 17 characters long.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`);
      const data = await res.json();
      const result = data.Results[0];

      if (result.ErrorCode !== "0" && !result.Make) {
        setError(result.ErrorText || "Invalid VIN or not found in the global database.");
        setVehicleData(null);
      } else {
        // Detailed Data Extraction Mapping
        const newVehicle = {
          vin: vin,
          make: result.Make || "Unknown",
          model: result.Model || "Unknown",
          year: result.ModelYear || "Unknown",
          trim: result.Trim || "N/A",
          
          // General & Body
          type: result.VehicleType || "N/A",
          bodyClass: result.BodyClass || "N/A",
          doors: result.Doors || "N/A",
          
          // Powertrain
          engine: `${result.EngineCylinders ? result.EngineCylinders + ' Cyl' : ''} ${result.DisplacementL ? result.DisplacementL + 'L' : ''}`.trim() || result.EngineConfiguration || "Unknown Engine",
          fuel: result.FuelTypePrimary || "N/A",
          drive: result.DriveType || "N/A",
          transmission: result.TransmissionStyle || "N/A",
          
          // Build & Safety
          manufacturer: result.Manufacturer || "Unknown",
          plant: [result.PlantCity, result.PlantState, result.PlantCountry].filter(Boolean).join(", ") || 'Unknown',
          gvwr: result.GVWR || "N/A",
          abs: result.ABS || "N/A",
          
          isPreview: false
        };
        
        setVehicleData(newVehicle);
        
        setGarage(prev => {
          if (!prev.some(v => v.vin === newVehicle.vin)) {
            return [newVehicle, ...prev].slice(0, 5); // Keep last 5 history
          }
          return prev;
        });
      }
    } catch (err) {
      setError("Network error. Could not connect to the VIN database.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!vehicleData) return;
    const text = `Full Vehicle Dossier (${vehicleData.vin}):\n\n• ${vehicleData.year} ${vehicleData.make} ${vehicleData.model} ${vehicleData.trim !== 'N/A' ? vehicleData.trim : ''}\n• Body: ${vehicleData.bodyClass} (${vehicleData.doors} Doors)\n• Engine: ${vehicleData.engine}\n• Drivetrain: ${vehicleData.drive} | ${vehicleData.transmission}\n• Fuel: ${vehicleData.fuel}\n• Manufacturer: ${vehicleData.manufacturer} (${vehicleData.plant})\n• GVWR: ${vehicleData.gvwr}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-100 to-transparent dark:from-cyan-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-cyan-50 dark:bg-cyan-900/30 p-3.5 rounded-2xl">
            <Search className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Pro VIN Decoder
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Deep Vehicle Specifications Lookup
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,500px] xl:grid-cols-[1fr,600px] gap-6 items-start">
        
        {/* ================= LEFT: INPUT & GARAGE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-500" /> Enter 17-Digit VIN
              </label>
              
              <div className={`relative flex items-center bg-slate-50 dark:bg-slate-800/50 border-2 rounded-2xl transition-all overflow-hidden ${
                error ? 'border-rose-400 focus-within:border-rose-500' : 
                vin.length === 17 ? 'border-emerald-400 focus-within:border-emerald-500' : 
                'border-slate-200 dark:border-slate-700 focus-within:border-cyan-500'
              }`}>
                <input
                  type="text" value={vin} onChange={handleInputChange} maxLength={17} placeholder="e.g. 1G1RC6E45BU..."
                  className="w-full bg-transparent px-5 py-4 text-2xl font-mono font-black text-slate-800 dark:text-slate-100 outline-none uppercase placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
                <div className="px-4 text-xs font-bold text-slate-400 font-mono">
                  {vin.length}/17
                </div>
              </div>
              
              <div className="flex justify-between items-center px-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${error ? 'text-rose-500' : 'text-slate-400'}`}>
                  {error || "Letters I, O, and Q are invalid."}
                </span>
                {vin.length === 17 && !error && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={decodeVin}
              disabled={vin.length !== 17 || loading}
              className="w-full py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest shadow-lg shadow-cyan-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Querying Database...</> : <><Search className="w-6 h-6" /> Decode Vehicle Data</>}
            </button>
          </div>

          {/* Virtual Garage */}
          {garage.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-500" /> Search History
              </h4>
              <div className="space-y-3">
                {garage.map((g, idx) => (
                  <div 
                    key={idx} onClick={() => { setVin(g.vin); setVehicleData(g); setError(null); }}
                    className="group cursor-pointer bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-cyan-300 transition-colors"
                  >
                    <div>
                      <span className="block text-sm font-black text-slate-800 dark:text-slate-100">
                        {g.year} {g.make} {g.model}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-slate-500">{g.vin}</span>
                    </div>
                    <Car className="w-5 h-5 text-slate-300 group-hover:text-cyan-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT: EXPANDED PRO DOSSIER ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[650px] max-h-[800px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-6 h-full flex flex-col relative overflow-y-auto custom-scrollbar">
              
              {vehicleData?.isPreview && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[22px]">
                  <Car className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                  <span className="text-sm font-black uppercase tracking-widest text-slate-500">Awaiting VIN Entry</span>
                </div>
              )}

              {vehicleData && (
                <div className={vehicleData.isPreview ? 'opacity-30 blur-sm pointer-events-none' : 'animate-in fade-in slide-in-from-bottom-4 duration-500'}>
                  
                  <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                      <Car className="w-4 h-4 text-cyan-500" /> Pro Dossier
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                      VIN: {vehicleData.vin}
                    </span>
                  </div>

                  {/* Grand Identification */}
                  <div className="text-center mb-8 bg-white dark:bg-slate-900 py-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <span className="text-xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight block mb-1">
                      {vehicleData.year}
                    </span>
                    <h3 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-none mb-2">
                      {vehicleData.make}
                    </h3>
                    <span className="text-lg font-bold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2">
                      {vehicleData.model} {vehicleData.trim !== 'N/A' && <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded text-xs">{vehicleData.trim}</span>}
                    </span>
                  </div>

                  {/* --- SECTION 1: General & Body --- */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                      <Settings2 className="w-3.5 h-3.5 text-cyan-500" /> General & Body
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block">{vehicleData.type}</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Class</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block">{vehicleData.bodyClass}</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Doors</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block">{vehicleData.doors}</span>
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 2: Engine & Powertrain --- */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-500" /> Engine & Powertrain
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Engine Specs</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block" title={vehicleData.engine}>{vehicleData.engine}</span>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <Fuel className="w-4 h-4 text-rose-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fuel Type</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block">{vehicleData.fuel}</span>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <Gauge className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Drivetrain</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block">{vehicleData.drive}</span>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <Settings2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Transmission</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block" title={vehicleData.transmission}>{vehicleData.transmission}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 3: Build & Safety --- */}
                  <div className="mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Build & Safety
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Factory className="w-5 h-5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-1 rounded shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Manufacturer & Origin</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block">{vehicleData.manufacturer}</span>
                          <span className="text-[10px] font-medium text-slate-500 truncate block">Plant: {vehicleData.plant}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                          <Scale className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Weight (GVWR)</span>
                            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-tight block" title={vehicleData.gvwr}>{vehicleData.gvwr}</span>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">ABS System</span>
                            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-tight block">{vehicleData.abs}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={handleCopy}
                    className="w-full py-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-cyan-200 dark:border-cyan-800"
                  >
                    {copied ? <><CheckCircle2 className="w-4 h-4"/> Full Report Copied</> : <><Copy className="w-4 h-4"/> Copy Complete Dossier</>}
                  </button>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}