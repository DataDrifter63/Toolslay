"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  CloudSnow, MapPin, Search, Thermometer, 
  Wind, Snowflake, Loader2, CalendarDays, 
  Globe, ChevronRight, Info, AlertCircle,
  Activity, Map, Sun, Cloud, CloudRain, CloudLightning
} from "lucide-react";

// Premium Global Snow Capitals with Flags
const SNOW_CAPITALS = [
  { name: "Reykjavik", country: "Iceland", flag: "🇮🇸", lat: 64.1466, lon: -21.9426 },
  { name: "Anchorage", country: "USA", flag: "🇺🇸", lat: 61.2181, lon: -149.9003 },
  { name: "Montreal", country: "Canada", flag: "🇨🇦", lat: 45.5017, lon: -73.5673 },
  { name: "Syracuse", country: "USA", flag: "🇺🇸", lat: 43.0481, lon: -76.1474 },
  { name: "Sapporo", country: "Japan", flag: "🇯🇵", lat: 43.0618, lon: 141.3545 },
  { name: "Tromsø", country: "Norway", flag: "🇳🇴", lat: 69.6492, lon: 18.9553 }
];

// WMO Weather Code Mapper for Icons
const getWeatherIcon = (code) => {
  if (code === 0 || code === 1) return <Sun className="w-4 h-4 text-amber-500" />;
  if (code === 2 || code === 3) return <Cloud className="w-4 h-4 text-slate-400" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-4 h-4 text-blue-400" />;
  if (code >= 71 && code <= 86) return <Snowflake className="w-4 h-4 text-cyan-500" />;
  if (code >= 95) return <CloudLightning className="w-4 h-4 text-indigo-500" />;
  return <Cloud className="w-4 h-4 text-slate-400" />; // Fallback
};

export default function SnowDayPredictor() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Navigation
  const [activeTab, setActiveTab] = useState("predictor");
  const [timeView, setTimeView] = useState("tomorrow"); // 'tomorrow' | '3days' | '7days'

  // Location States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState(null);
  
  // Predictor States
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Radar States
  const [radarData, setRadarData] = useState([]);
  const [loadingRadar, setLoadingRadar] = useState(false);

  // --- INITIALIZATION (Silent IP Geolocation) ---
  useEffect(() => {
    setIsMounted(true);
    fetchIpLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIpLocation = async () => {
    try {
      const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
      const data = await res.json();
      const loc = {
        name: `${data.city || data.region}, ${data.country}`,
        lat: data.latitude,
        lon: data.longitude,
        isAuto: true
      };
      setLocation(loc);
      fetchWeather(loc.lat, loc.lon);
    } catch (err) {
      setError("Auto-location failed. Please search your city manually.");
      setLoadingWeather(false);
    }
  };

  // --- SEARCH ENGINE ---
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.length < 3) { setSearchResults([]); return; }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5&language=en&format=json`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const selectLocation = (city) => {
    const loc = {
      name: `${city.name}${city.admin1 ? ', ' + city.admin1 : ''}, ${city.country}`,
      lat: city.latitude,
      lon: city.longitude,
      isAuto: false
    };
    setLocation(loc);
    setSearchQuery("");
    setSearchResults([]);
    fetchWeather(loc.lat, loc.lon);
  };

  // --- WEATHER & ALGORITHM (Upgraded with Weather Codes) ---
  const calculateProbability = (snow, minT, wind) => {
    let p = 0;
    if (snow > 0) {
      p += 10;
      if (snow >= 2 && snow < 5) p += 20;
      else if (snow >= 5 && snow < 10) p += 40;
      else if (snow >= 10 && snow < 20) p += 65;
      else if (snow >= 20) p += 85;

      if (minT <= -2) p += 15;
      else if (minT > 2) p -= 30;

      if (wind > 30) p += 10;
      if (wind > 50) p += 20;
    } else {
      if (minT < -20) p = 40;
    }
    return Math.max(0, Math.min(99, Math.round(p)));
  };

  const fetchWeather = async (lat, lon) => {
    setLoadingWeather(true);
    setError(null);
    try {
      // Added weather_code to fetch
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,windspeed_10m_max,weather_code&timezone=auto&forecast_days=8`);
      const data = await res.json();
      
      const daily = data.daily;
      const parsedForecast = [];

      for (let i = 1; i <= 7; i++) {
        const snow = daily.snowfall_sum[i];
        const minT = daily.temperature_2m_min[i];
        const maxT = daily.temperature_2m_max[i];
        const wind = daily.windspeed_10m_max[i];
        const code = daily.weather_code[i];
        const prob = calculateProbability(snow, minT, wind);
        
        parsedForecast.push({
          date: daily.time[i],
          dayName: new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: new Date(daily.time[i]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          snow, minT, maxT, wind, prob, code
        });
      }
      setForecast(parsedForecast);
    } catch (err) {
      setError("Forecast unavailable. Please try again.");
    } finally {
      setLoadingWeather(false);
    }
  };

  // --- PREMIUM GLOBAL RADAR FETCH ---
  const fetchRadar = async () => {
    if (radarData.length > 0) return;
    setLoadingRadar(true);
    try {
      const lats = SNOW_CAPITALS.map(c => c.lat).join(',');
      const lons = SNOW_CAPITALS.map(c => c.lon).join(',');
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=snowfall,temperature_2m,weather_code&timezone=auto`);
      const data = await res.json();
      
      const radar = SNOW_CAPITALS.map((cap, idx) => ({
        ...cap,
        temp: data[idx]?.current?.temperature_2m || 0,
        snowing: (data[idx]?.current?.snowfall || 0) > 0 || [71,73,75,77,85,86].includes(data[idx]?.current?.weather_code),
        snowAmt: data[idx]?.current?.snowfall || 0
      }));
      setRadarData(radar);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRadar(false);
    }
  };

  useEffect(() => {
    if (activeTab === "radar") fetchRadar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Helpers
  const getStatus = (prob) => {
    if (prob >= 90) return { title: "Blizzard!", color: "text-blue-500", bar: "bg-blue-500", cardBg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" };
    if (prob >= 70) return { title: "Highly Likely", color: "text-cyan-500", bar: "bg-cyan-500", cardBg: "bg-cyan-50 dark:bg-cyan-900/20", border: "border-cyan-200 dark:border-cyan-800" };
    if (prob >= 40) return { title: "Coin Toss", color: "text-amber-500", bar: "bg-amber-500", cardBg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" };
    if (prob >= 10) return { title: "Dusting", color: "text-slate-500", bar: "bg-slate-500", cardBg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700" };
    return { title: "No Chance", color: "text-slate-400", bar: "bg-slate-300 dark:bg-slate-700", cardBg: "bg-white dark:bg-slate-900", border: "border-slate-100 dark:border-slate-800" };
  };

  // Find Peak Day for 7-Day view
  const peakDayIndex = useMemo(() => {
    if (!forecast || forecast.length === 0) return 0;
    let max = -1;
    let idx = 0;
    forecast.forEach((day, i) => { if (day.prob > max) { max = day.prob; idx = i; } });
    return idx;
  }, [forecast]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100 via-cyan-50 to-transparent dark:from-blue-900/30 dark:via-cyan-900/10 rounded-bl-full -z-10 opacity-70"></div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-3.5 rounded-2xl shadow-md">
            <CloudSnow className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Snow Day Oracle Pro
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Silent Auto-Location & Global Radar
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,500px] gap-6 items-start">
        
        {/* ================= LEFT: DISCOVERY & RADAR ================= */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            
            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner mb-6">
              <button 
                onClick={() => setActiveTab("predictor")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "predictor" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <Activity className="w-4 h-4" /> Predictor
              </button>
              <button 
                onClick={() => setActiveTab("radar")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] sm:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "radar" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <Globe className="w-4 h-4" /> Global Radar
              </button>
            </div>

            {/* PREDICTOR SEARCH */}
            {activeTab === "predictor" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500" /> Search City or Zip</span>
                    {location?.isAuto && <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded text-right border border-blue-200 dark:border-blue-800">Auto-Detected IP</span>}
                  </label>
                  
                  <div className="relative z-20">
                    <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-blue-500 transition-all">
                      <Search className="w-5 h-5 text-slate-400 ml-4" />
                      <input
                        type="text" value={searchQuery} onChange={handleSearchInput} 
                        placeholder={location?.name || "Search city..."}
                        className="w-full bg-transparent px-4 py-4 text-base font-bold text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
                      />
                      {isSearching && <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-4" />}
                    </div>

                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-30">
                        {searchResults.map((city) => (
                          <button
                            key={city.id} onClick={() => selectLocation(city)}
                            className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 transition-colors"
                          >
                            <div>
                              <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">{city.name}</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {city.admin1 ? city.admin1 + ', ' : ''}{city.country}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* PRO GLOBAL RADAR */
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Map className="w-4 h-4 text-cyan-500" /> Live Global Snow Map
                  </h3>
                  {loadingRadar && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {radarData.map((city, idx) => (
                    <div 
                      key={idx} 
                      className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        city.snowing 
                        ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700"
                      }`}
                    >
                      {/* Pulse effect if snowing */}
                      {city.snowing && (
                        <div className="absolute -left-[1px] top-4 bottom-4 w-1 bg-blue-500 rounded-r-full animate-pulse"></div>
                      )}

                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{city.flag}</span>
                        <div>
                          <span className="block text-sm font-black text-slate-800 dark:text-slate-100">{city.name}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 mt-0.5">
                            <Thermometer className="w-3 h-3" /> {city.temp}°C
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {city.snowing ? (
                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest shadow-md shadow-blue-500/30">
                              <Snowflake className="w-3 h-3 animate-spin-slow" /> Live Snow
                            </span>
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 mt-1">{city.snowAmt} cm/hr</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm">
                            Clear Skies
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800/50">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT: THE ORACLE (PRO PREDICTIONS) ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative overflow-hidden flex flex-col min-h-[600px]">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[22px] p-5 sm:p-6 h-full flex flex-col relative overflow-y-auto custom-scrollbar">
              
              {loadingWeather || forecast.length === 0 ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6">
                  <div className="relative">
                    <CloudSnow className="w-16 h-16 text-blue-300 dark:text-blue-700/50 animate-pulse" />
                    <Loader2 className="w-6 h-6 text-blue-600 absolute bottom-0 right-0 animate-spin" />
                  </div>
                  <span className="mt-4 text-sm font-black uppercase tracking-widest text-slate-500 block">Processing Satellite Data...</span>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
                  
                  {/* Location Title */}
                  <div className="flex items-center justify-between mb-5 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 truncate pr-4">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0" /> {location?.name}
                    </span>
                  </div>

                  {/* PRO Timeline Selector */}
                  <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                    <button onClick={() => setTimeView("tomorrow")} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeView === "tomorrow" ? "bg-blue-500 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>Tomorrow</button>
                    <button onClick={() => setTimeView("3days")} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeView === "3days" ? "bg-blue-500 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>Next 3 Days</button>
                    <button onClick={() => setTimeView("7days")} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeView === "7days" ? "bg-blue-500 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>Next 7 Days</button>
                  </div>

                  {/* VIEWS */}
                  <div className="flex-1 flex flex-col">
                    
                    {/* --- VIEW 1: TOMORROW --- */}
                    {timeView === "tomorrow" && (
                      <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95">
                        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                          <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800"/>
                            <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray="289.02" strokeDashoffset={289.02 - (289.02 * forecast[0].prob) / 100} className={`${getStatus(forecast[0].prob).color.replace('text-', 'stroke-')} transition-all duration-1000 ease-out`} />
                          </svg>
                          <div className="text-center z-10 flex flex-col items-center">
                            <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums drop-shadow-sm">
                              {forecast[0].prob}<span className="text-2xl text-slate-400">%</span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Chance</span>
                          </div>
                        </div>
                        
                        <h3 className={`text-2xl font-black tracking-tight mb-6 ${getStatus(forecast[0].prob).color}`}>
                          {getStatus(forecast[0].prob).title}
                        </h3>

                        <div className="grid grid-cols-3 gap-3 w-full">
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                            <Snowflake className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                            <span className="text-sm font-black tabular-nums block">{forecast[0].snow} cm</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                            <Thermometer className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                            <span className="text-sm font-black tabular-nums block">{forecast[0].minT}°C</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                            <Wind className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                            <span className="text-sm font-black tabular-nums block">{forecast[0].wind} kph</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* --- VIEW 2: NEXT 3 DAYS (Premium Stacked Cards) --- */}
                    {timeView === "3days" && (
                      <div className="flex flex-col gap-4 animate-in fade-in">
                        {forecast.slice(0, 3).map((day, idx) => {
                          const status = getStatus(day.prob);
                          return (
                            <div key={idx} className={`relative p-5 rounded-[1.5rem] border-2 shadow-sm flex flex-col justify-between ${status.cardBg} ${status.border} transition-all hover:scale-[1.02]`}>
                              
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <span className="block text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{idx === 0 ? 'Tomorrow' : day.dayName}</span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{day.fullDate}</span>
                                </div>
                                <div className={`text-3xl font-black tabular-nums tracking-tighter ${status.color}`}>
                                  {day.prob}%
                                </div>
                              </div>

                              <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl backdrop-blur-sm">
                                <div className="flex items-center gap-1.5 flex-1 justify-center">
                                  <Snowflake className="w-4 h-4 text-cyan-500" />
                                  <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-200">{day.snow} <span className="text-[9px] text-slate-400">cm</span></span>
                                </div>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="flex items-center gap-1.5 flex-1 justify-center">
                                  <Thermometer className="w-4 h-4 text-blue-500" />
                                  <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-200">{day.minT}°</span>
                                </div>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="flex flex-col flex-1 items-center justify-center">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>{status.title}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* --- VIEW 3: NEXT 7 DAYS (Weather Code Integrated Dashboard) --- */}
                    {timeView === "7days" && (
                      <div className="flex flex-col gap-3 animate-in fade-in h-full">
                        
                        {/* Peak Alert Banner */}
                        <div className="bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-500/20 mb-2">
                          <div>
                            <span className="block text-[10px] font-black uppercase tracking-widest text-blue-200">Peak Snow Chance</span>
                            <span className="text-lg font-black tracking-tight">{forecast[peakDayIndex].dayName}, {forecast[peakDayIndex].fullDate}</span>
                          </div>
                          <div className="text-3xl font-black tabular-nums drop-shadow-md">
                            {forecast[peakDayIndex].prob}%
                          </div>
                        </div>

                        {/* List */}
                        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                          {forecast.map((day, idx) => (
                            <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${idx === peakDayIndex ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'} shadow-sm`}>
                              
                              <div className="w-12">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">{day.dayName}</span>
                              </div>
                              
                              <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg shrink-0">
                                {getWeatherIcon(day.code)}
                              </div>

                              <div className="w-12 text-center">
                                <span className="text-[10px] font-black tabular-nums text-slate-500">{day.minT}°C</span>
                              </div>

                              <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getStatus(day.prob).bar}`} style={{ width: `${Math.max(5, day.prob)}%` }}></div>
                              </div>
                              
                              <span className={`w-8 text-right text-xs font-black tabular-nums ${getStatus(day.prob).color}`}>
                                {day.prob}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}