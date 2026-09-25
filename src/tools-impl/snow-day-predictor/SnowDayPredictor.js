"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  CloudSnow, MapPin, Search, Thermometer, 
  Wind, Snowflake, Loader2, CalendarDays, 
  Globe, ChevronRight, Info, AlertCircle,
  Activity, Map, Sun, Cloud, CloudRain, CloudLightning
} from "lucide-react";

const SNOW_CAPITALS = [
  { name: "Reykjavik", country: "Iceland", flag: "🇮🇸", lat: 64.1466, lon: -21.9426 },
  { name: "Anchorage", country: "USA", flag: "🇺🇸", lat: 61.2181, lon: -149.9003 },
  { name: "Montreal", country: "Canada", flag: "🇨🇦", lat: 45.5017, lon: -73.5673 },
  { name: "Syracuse", country: "USA", flag: "🇺🇸", lat: 43.0481, lon: -76.1474 },
  { name: "Sapporo", country: "Japan", flag: "🇯🇵", lat: 43.0618, lon: 141.3545 },
  { name: "Tromsø", country: "Norway", flag: "🇳🇴", lat: 69.6492, lon: 18.9553 }
];

const getWeatherIcon = (code) => {
  if (code === 0 || code === 1) return <Sun className="w-4 h-4 text-amber-500" />;
  if (code === 2 || code === 3) return <Cloud className="w-4 h-4 text-muted" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-4 h-4 text-blue-400" />;
  if (code >= 71 && code <= 86) return <Snowflake className="w-4 h-4 text-brand" />;
  if (code >= 95) return <CloudLightning className="w-4 h-4 text-indigo-500" />;
  return <Cloud className="w-4 h-4 text-muted" />;
};

export default function SnowDayPredictor() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [activeTab, setActiveTab] = useState("predictor");
  const [timeView, setTimeView] = useState("tomorrow");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState(null);
  
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  const [radarData, setRadarData] = useState([]);
  const [loadingRadar, setLoadingRadar] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchIpLocation();
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
  }, [activeTab]);

  const getStatus = (prob) => {
    if (prob >= 90) return { title: "Blizzard!", color: "text-brand", bar: "bg-brand", cardBg: "bg-surface", border: "border-brand/30" };
    if (prob >= 70) return { title: "Highly Likely", color: "text-brand", bar: "bg-brand", cardBg: "bg-surface", border: "border-brand/30" };
    if (prob >= 40) return { title: "Coin Toss", color: "text-amber-500", bar: "bg-amber-500", cardBg: "bg-surface", border: "border-line" };
    if (prob >= 10) return { title: "Dusting", color: "text-muted", bar: "bg-muted", cardBg: "bg-surface", border: "border-line" };
    return { title: "No Chance", color: "text-muted", bar: "bg-line", cardBg: "bg-surface", border: "border-line" };
  };

  const peakDayIndex = useMemo(() => {
    if (!forecast || forecast.length === 0) return 0;
    let max = -1;
    let idx = 0;
    forecast.forEach((day, i) => { if (day.prob > max) { max = day.prob; idx = i; } });
    return idx;
  }, [forecast]);

  if (!isMounted) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <CloudSnow className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              Snow Day Oracle Pro
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Silent auto-location and global winter storm radar.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,460px] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: DISCOVERY & RADAR */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-4 font-sans">
            
            <div className="flex bg-surface border border-line rounded-xl p-1 shadow-sm">
              <button 
                type="button"
                onClick={() => setActiveTab("predictor")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === "predictor" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
              >
                <Activity className="w-3.5 h-3.5" /> Predictor
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("radar")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === "radar" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}
              >
                <Globe className="w-3.5 h-3.5" /> Global Radar
              </button>
            </div>

            {activeTab === "predictor" ? (
              <div className="space-y-3 animate-in fade-in">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand" /> Search City or Zip</span>
                  {location?.isAuto && <span className="text-[8px] bg-brand/10 text-brand px-2 py-0.5 rounded border border-brand/20 font-black">Auto-Detected IP</span>}
                </label>
                
                <div className="relative z-20">
                  <div className="relative flex items-center bg-surface border border-line rounded-xl focus-within:border-brand transition-all">
                    <Search className="w-4 h-4 text-muted ml-3.5" />
                    <input
                      type="text" value={searchQuery} onChange={handleSearchInput} 
                      placeholder={location?.name || "Search city..."}
                      className="w-full bg-transparent px-3.5 py-3 text-xs font-bold text-ink outline-none placeholder:text-muted"
                    />
                    {isSearching && <Loader2 className="w-4 h-4 text-brand animate-spin mr-3.5" />}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-paper border border-line rounded-xl shadow-lg overflow-hidden z-30">
                      {searchResults.map((city) => (
                        <button
                          key={city.id} type="button" onClick={() => selectLocation(city)}
                          className="w-full text-left px-4 py-2.5 hover:bg-surface flex items-center justify-between border-b border-line last:border-0 transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="block text-xs font-bold text-ink truncate">{city.name}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted truncate">
                              {city.admin1 ? city.admin1 + ', ' : ''}{city.country}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-ink flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5 text-brand" /> Live Global Snow Map
                  </h3>
                  {loadingRadar && <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />}
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                  {radarData.map((city, idx) => (
                    <div 
                      key={idx} 
                      className={`relative flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        city.snowing 
                          ? "bg-surface border-brand/40 shadow-sm" 
                          : "bg-surface border-line"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{city.flag}</span>
                        <div>
                          <span className="block text-xs font-black text-ink">{city.name}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-muted flex items-center gap-1 mt-0.5">
                            <Thermometer className="w-2.5 h-2.5" /> {city.temp}°C
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {city.snowing ? (
                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand/10 text-brand text-[8px] font-black uppercase tracking-widest border border-brand/20">
                              <Snowflake className="w-2.5 h-2.5 animate-spin" /> Live Snow
                            </span>
                            <span className="text-[9px] font-black text-brand mt-1">{city.snowAmt} cm/hr</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-surface text-[8px] font-black uppercase tracking-widest text-muted border border-line">
                            Clear
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold border border-rose-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: THE ORACLE (PRO PREDICTIONS) */}
        <div className="space-y-4 sm:space-y-6 w-full font-sans">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col min-h-[550px]">
            <div className="bg-surface rounded-xl p-4 sm:p-5 h-full flex flex-col relative overflow-y-auto custom-scrollbar border border-line">
              
              {loadingWeather || forecast.length === 0 ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6">
                  <div className="relative">
                    <CloudSnow className="w-12 h-12 text-brand animate-pulse" />
                    <Loader2 className="w-5 h-5 text-brand absolute bottom-0 right-0 animate-spin" />
                  </div>
                  <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-muted block">Processing Satellite Data...</span>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300 flex flex-col h-full">
                  
                  <div className="flex items-center justify-between mb-4 border-b border-line pb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink truncate pr-2">
                      <MapPin className="w-3.5 h-3.5 text-brand shrink-0" /> {location?.name}
                    </span>
                  </div>

                  <div className="flex bg-paper rounded-xl p-1 shadow-sm border border-line mb-4">
                    <button type="button" onClick={() => setTimeView("tomorrow")} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${timeView === "tomorrow" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}>Tomorrow</button>
                    <button type="button" onClick={() => setTimeView("3days")} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${timeView === "3days" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}>Next 3 Days</button>
                    <button type="button" onClick={() => setTimeView("7days")} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${timeView === "7days" ? "bg-brand text-surface shadow-sm" : "text-muted hover:text-ink"}`}>Next 7 Days</button>
                  </div>

                  <div className="flex-1 flex flex-col">
                    
                    {timeView === "tomorrow" && (
                      <div className="flex-1 flex flex-col items-center justify-center py-4">
                        <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                          <div className="absolute inset-0 rounded-full border-4 border-line"></div>
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-line"/>
                            <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray="289.02" strokeDashoffset={289.02 - (289.02 * forecast[0].prob) / 100} className="text-brand transition-all duration-1000 ease-out" />
                          </svg>
                          <div className="text-center z-10 flex flex-col items-center">
                            <span className="text-5xl font-black text-ink tracking-tighter tabular-nums font-mono">
                              {forecast[0].prob}<span className="text-xl text-muted">%</span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted mt-0.5">Chance</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-black tracking-tight mb-5 text-brand">
                          {getStatus(forecast[0].prob).title}
                        </h3>

                        <div className="grid grid-cols-3 gap-2.5 w-full">
                          <div className="bg-paper p-2.5 rounded-xl border border-line text-center">
                            <Snowflake className="w-4 h-4 text-brand mx-auto mb-1" />
                            <span className="text-xs font-black tabular-nums block font-mono">{forecast[0].snow} cm</span>
                          </div>
                          <div className="bg-paper p-2.5 rounded-xl border border-line text-center">
                            <Thermometer className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                            <span className="text-xs font-black tabular-nums block font-mono">{forecast[0].minT}°C</span>
                          </div>
                          <div className="bg-paper p-2.5 rounded-xl border border-line text-center">
                            <Wind className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                            <span className="text-xs font-black tabular-nums block font-mono">{forecast[0].wind} kph</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {timeView === "3days" && (
                      <div className="flex flex-col gap-3">
                        {forecast.slice(0, 3).map((day, idx) => {
                          const status = getStatus(day.prob);
                          return (
                            <div key={idx} className="p-3.5 rounded-xl border border-line bg-paper shadow-sm flex flex-col justify-between">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <span className="block text-xs font-black text-ink uppercase tracking-wider">{idx === 0 ? 'Tomorrow' : day.dayName}</span>
                                  <span className="text-[9px] font-bold text-muted uppercase tracking-wider">{day.fullDate}</span>
                                </div>
                                <div className="text-2xl font-black tabular-nums tracking-tighter text-brand font-mono">
                                  {day.prob}%
                                </div>
                              </div>

                              <div className="flex items-center gap-3 bg-surface p-2.5 rounded-lg border border-line">
                                <div className="flex items-center gap-1 flex-1 justify-center">
                                  <Snowflake className="w-3.5 h-3.5 text-brand" />
                                  <span className="text-[10px] font-black tabular-nums text-ink">{day.snow} cm</span>
                                </div>
                                <div className="w-px h-4 bg-line"></div>
                                <div className="flex items-center gap-1 flex-1 justify-center">
                                  <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                                  <span className="text-[10px] font-black tabular-nums text-ink">{day.minT}°</span>
                                </div>
                                <div className="w-px h-4 bg-line"></div>
                                <div className="flex items-center justify-center flex-1">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-brand">{status.title}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {timeView === "7days" && (
                      <div className="flex flex-col gap-2.5 h-full">
                        <div className="bg-brand text-surface p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                          <div>
                            <span className="block text-[9px] font-black uppercase tracking-widest opacity-80">Peak Snow Chance</span>
                            <span className="text-xs font-black tracking-tight">{forecast[peakDayIndex].dayName}, {forecast[peakDayIndex].fullDate}</span>
                          </div>
                          <div className="text-2xl font-black tabular-nums font-mono">
                            {forecast[peakDayIndex].prob}%
                          </div>
                        </div>

                        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                          {forecast.map((day, idx) => (
                            <div key={idx} className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${idx === peakDayIndex ? 'bg-brand/10 border-brand/30' : 'bg-paper border-line'} shadow-sm`}>
                              <div className="w-10">
                                <span className="block text-[9px] font-black uppercase tracking-wider text-ink">{day.dayName}</span>
                              </div>
                              
                              <div className="bg-surface p-1 rounded-lg shrink-0 border border-line">
                                {getWeatherIcon(day.code)}
                              </div>

                              <div className="w-10 text-center">
                                <span className="text-[9px] font-black tabular-nums text-muted">{day.minT}°C</span>
                              </div>

                              <div className="flex-1 bg-surface h-1.5 rounded-full overflow-hidden border border-line">
                                <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(5, day.prob)}%` }}></div>
                              </div>
                              
                              <span className="w-8 text-right text-[10px] font-black tabular-nums text-brand font-mono">
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