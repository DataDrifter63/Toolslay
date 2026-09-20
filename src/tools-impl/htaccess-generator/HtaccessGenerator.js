"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Server, Shield, Zap, Route, Copy, 
  CheckCircle2, Download, PlusCircle, MinusCircle, 
  Settings2, Activity, Globe, FileCode2
} from "lucide-react";

export default function HtaccessGenerator() {
  const [isMounted, setIsMounted] = useState(false);

  // --- CONFIGURATION STATES ---
  const [preset, setPreset] = useState("custom"); // custom, wp, spa
  
  // Routing & Redirects
  const [forceHttps, setForceHttps] = useState(true);
  const [wwwPref, setWwwPref] = useState("none"); // none, www, non-www
  const [customRedirects, setCustomRedirects] = useState([]);
  
  // Security
  const [preventDirListing, setPreventDirListing] = useState(true);
  const [securityHeaders, setSecurityHeaders] = useState(true);
  const [preventHotlinking, setPreventHotlinking] = useState(false);
  const [blockSpamBots, setBlockSpamBots] = useState(false);

  // Performance
  const [enableGzip, setEnableGzip] = useState(true);
  const [enableBrowserCache, setEnableBrowserCache] = useState(true);

  // UI States
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handlers for Custom Redirects
  const addRedirect = () => {
    setCustomRedirects([...customRedirects, { old: "", new: "", type: "301" }]);
  };

  const updateRedirect = (index, key, value) => {
    const updated = [...customRedirects];
    updated[index][key] = value;
    setCustomRedirects(updated);
  };

  const removeRedirect = (index) => {
    const updated = customRedirects.filter((_, i) => i !== index);
    setCustomRedirects(updated);
  };

  // Preset Handler
  const handlePresetChange = (val) => {
    setPreset(val);
    if (val === "wp") {
      setForceHttps(true);
      setPreventDirListing(true);
      setEnableGzip(true);
      setEnableBrowserCache(true);
    } else if (val === "spa") {
      setForceHttps(true);
      setPreventDirListing(true);
      setEnableGzip(true);
      setEnableBrowserCache(true);
    }
  };

  // --- CORE ENGINE: GENERATE .HTACCESS ---
  const generatedCode = useMemo(() => {
    let rules = [];
    
    rules.push(`# =====================================================================`);
    rules.push(`# Muxair Enterprise .htaccess Configuration`);
    rules.push(`# Generated on: ${new Date().toLocaleDateString()}`);
    rules.push(`# =====================================================================\n`);

    // 1. Presets (WP or SPA)
    if (preset === "wp") {
      rules.push(`# --- WordPress Standard Routing ---`);
      rules.push(`<IfModule mod_rewrite.c>`);
      rules.push(`RewriteEngine On`);
      rules.push(`RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]`);
      rules.push(`RewriteBase /`);
      rules.push(`RewriteRule ^index\\.php$ - [L]`);
      rules.push(`RewriteCond %{REQUEST_FILENAME} !-f`);
      rules.push(`RewriteCond %{REQUEST_FILENAME} !-d`);
      rules.push(`RewriteRule . /index.php [L]`);
      rules.push(`</IfModule>\n`);
    } else if (preset === "spa") {
      rules.push(`# --- Single Page Application (SPA) Routing (React/Vue/Angular) ---`);
      rules.push(`<IfModule mod_rewrite.c>`);
      rules.push(`RewriteEngine On`);
      rules.push(`RewriteBase /`);
      rules.push(`RewriteRule ^index\\.html$ - [L]`);
      rules.push(`RewriteCond %{REQUEST_FILENAME} !-f`);
      rules.push(`RewriteCond %{REQUEST_FILENAME} !-d`);
      rules.push(`RewriteRule . /index.html [L]`);
      rules.push(`</IfModule>\n`);
    }

    // 2. Global Rewrite Engine Setup (If not already enabled by presets)
    const needsRewriteEngine = forceHttps || wwwPref !== "none" || customRedirects.length > 0 || preventHotlinking;
    if (needsRewriteEngine) {
      rules.push(`# --- Global Routing & Redirects ---`);
      rules.push(`<IfModule mod_rewrite.c>`);
      rules.push(`RewriteEngine On`);
      
      if (forceHttps) {
        rules.push(`\n  # Force HTTPS`);
        rules.push(`  RewriteCond %{HTTPS} off`);
        rules.push(`  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`);
      }

      if (wwwPref === "www") {
        rules.push(`\n  # Force WWW`);
        rules.push(`  RewriteCond %{HTTP_HOST} !^www\\. [NC]`);
        rules.push(`  RewriteRule ^(.*)$ https://www.%{HTTP_HOST}/$1 [L,R=301]`);
      } else if (wwwPref === "non-www") {
        rules.push(`\n  # Force Non-WWW`);
        rules.push(`  RewriteCond %{HTTP_HOST} ^www\\.(.*)$ [NC]`);
        rules.push(`  RewriteRule ^(.*)$ https://%1/$1 [L,R=301]`);
      }

      if (customRedirects.length > 0) {
        rules.push(`\n  # Custom User Redirects`);
        customRedirects.forEach(redir => {
          if (redir.old && redir.new) {
            // Strip leading slashes to prevent syntax errors
            const oldPath = redir.old.replace(/^\//, '');
            rules.push(`  RewriteRule ^${oldPath}$ ${redir.new} [L,R=${redir.type}]`);
          }
        });
      }

      if (preventHotlinking) {
        rules.push(`\n  # Prevent Image Hotlinking`);
        rules.push(`  RewriteCond %{HTTP_REFERER} !^$`);
        rules.push(`  RewriteCond %{HTTP_REFERER} !^https?://(www\\.)?%{HTTP_HOST} [NC]`);
        rules.push(`  RewriteRule \\.(jpe?g|png|gif|webp|svg)$ - [F,NC]`);
      }

      rules.push(`</IfModule>\n`);
    }

    // 3. Security Hardening
    const needsSecurity = preventDirListing || securityHeaders || blockSpamBots;
    if (needsSecurity) {
      rules.push(`# --- Security Hardening ---`);
      
      if (preventDirListing) {
        rules.push(`Options -Indexes`);
      }

      if (securityHeaders) {
        rules.push(`<IfModule mod_headers.c>`);
        rules.push(`  Header set X-XSS-Protection "1; mode=block"`);
        rules.push(`  Header always append X-Frame-Options SAMEORIGIN`);
        rules.push(`  Header set X-Content-Type-Options nosniff`);
        rules.push(`  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"`);
        rules.push(`</IfModule>`);
      }

      if (blockSpamBots) {
        rules.push(`<IfModule mod_rewrite.c>`);
        rules.push(`  RewriteEngine On`);
        rules.push(`  RewriteCond %{HTTP_USER_AGENT} (badbot|scam|spam|hacker) [NC]`);
        rules.push(`  RewriteRule .* - [F,L]`);
        rules.push(`</IfModule>`);
      }
      rules.push(``); // Empty line
    }

    // 4. Performance (GZIP & Cache)
    const needsPerf = enableGzip || enableBrowserCache;
    if (needsPerf) {
      rules.push(`# --- Performance Optimization ---`);
      
      if (enableGzip) {
        rules.push(`<IfModule mod_deflate.c>`);
        rules.push(`  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json image/svg+xml`);
        rules.push(`</IfModule>\n`);
      }

      if (enableBrowserCache) {
        rules.push(`<IfModule mod_expires.c>`);
        rules.push(`  ExpiresActive On`);
        rules.push(`  ExpiresByType image/jpg "access plus 1 year"`);
        rules.push(`  ExpiresByType image/jpeg "access plus 1 year"`);
        rules.push(`  ExpiresByType image/gif "access plus 1 year"`);
        rules.push(`  ExpiresByType image/png "access plus 1 year"`);
        rules.push(`  ExpiresByType image/webp "access plus 1 year"`);
        rules.push(`  ExpiresByType image/svg+xml "access plus 1 year"`);
        rules.push(`  ExpiresByType text/css "access plus 1 month"`);
        rules.push(`  ExpiresByType application/pdf "access plus 1 month"`);
        rules.push(`  ExpiresByType text/javascript "access plus 1 month"`);
        rules.push(`  ExpiresByType application/javascript "access plus 1 month"`);
        rules.push(`  ExpiresDefault "access plus 2 days"`);
        rules.push(`</IfModule>\n`);
      }
    }

    return rules.join('\n');
  }, [
    preset, forceHttps, wwwPref, customRedirects, 
    preventDirListing, securityHeaders, preventHotlinking, blockSpamBots,
    enableGzip, enableBrowserCache
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.htaccess';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isMounted) return null;

  // Premium Slate & Cyan Theme
  const theme = {
    gradient: "from-cyan-200 via-sky-100 to-transparent dark:from-cyan-900/30 dark:via-sky-900/20",
    bgIcon: "bg-gradient-to-br from-cyan-500 to-sky-600",
    textPri: "text-cyan-600 dark:text-cyan-400",
    textSec: "text-sky-600 dark:text-sky-400",
    borderLight: "border-cyan-200 dark:border-cyan-800/50",
    bgLight: "bg-cyan-50 dark:bg-cyan-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              .htaccess Architect
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Apache Server Configuration Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: CONFIGURATION ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 font-sans">
            
            {/* 1. App Presets */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <FileCode2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Application Presets
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handlePresetChange('custom')} className={`p-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all border-2 ${preset === 'custom' ? theme.borderLight + " " + theme.bgLight + " " + theme.textPri : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  Custom
                </button>
                <button onClick={() => handlePresetChange('spa')} className={`p-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all border-2 ${preset === 'spa' ? theme.borderLight + " " + theme.bgLight + " " + theme.textPri : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  React / SPA
                </button>
                <button onClick={() => handlePresetChange('wp')} className={`p-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all border-2 ${preset === 'wp' ? theme.borderLight + " " + theme.bgLight + " " + theme.textPri : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  WordPress
                </button>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Routing & Redirects */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Route className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Traffic Routing
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Force HTTPS Toggle */}
                <div className={`flex flex-col p-4 rounded-xl border ${forceHttps ? theme.borderLight + " " + theme.bgLight : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">Force HTTPS (SSL)</span>
                    <button onClick={() => setForceHttps(!forceHttps)} className={`w-9 h-5 rounded-full transition-colors relative p-1 shadow-inner ${forceHttps ? `bg-gradient-to-r ${theme.gradient.split(' ').slice(0, 2).join(' ')}` : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${forceHttps ? "translate-x-4" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 block">Redirects http:// to https://</span>
                </div>

                {/* WWW Preference */}
                <div className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 mb-2">WWW Preference</span>
                  <select 
                    value={wwwPref} onChange={(e) => setWwwPref(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="none">No Preference (Leave as is)</option>
                    <option value="www">Force www. (e.g. www.site.com)</option>
                    <option value="non-www">Force Non-www (e.g. site.com)</option>
                  </select>
                </div>
              </div>

              {/* Custom Redirects Builder */}
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">Visual Redirect Builder</span>
                  <button onClick={addRedirect} className="text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-1 rounded border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-colors flex items-center gap-1"><PlusCircle className="w-3 h-3"/> Add</button>
                </div>
                
                {customRedirects.length === 0 ? (
                  <p className="text-[10px] text-slate-500 font-bold italic">No custom redirects added.</p>
                ) : (
                  <div className="space-y-2">
                    {customRedirects.map((redir, idx) => (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <input type="text" placeholder="/old-path" value={redir.old} onChange={(e) => updateRedirect(idx, 'old', e.target.value)} className="flex-1 min-w-[100px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-cyan-500" />
                        <Route className="w-3 h-3 text-slate-400 shrink-0 hidden sm:block" />
                        <input type="text" placeholder="https://site.com/new" value={redir.new} onChange={(e) => updateRedirect(idx, 'new', e.target.value)} className="flex-1 min-w-[120px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-cyan-500" />
                        <select value={redir.type} onChange={(e) => updateRedirect(idx, 'type', e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1 py-1.5 text-xs outline-none">
                          <option value="301">301</option>
                          <option value="302">302</option>
                        </select>
                        <button onClick={() => removeRedirect(idx)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"><MinusCircle className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 3. Security & Performance */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Shield className={`w-3.5 h-3.5 ${theme.textPri}`} /> 3. Security & Perfomance
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Security Toggles */}
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-cyan-300 transition-colors">
                  <input type="checkbox" checked={preventDirListing} onChange={(e) => setPreventDirListing(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Disable Directory List</span>
                    <span className="block text-[9px] text-slate-500">Prevents viewing folder contents.</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-cyan-300 transition-colors">
                  <input type="checkbox" checked={securityHeaders} onChange={(e) => setSecurityHeaders(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Add Security Headers</span>
                    <span className="block text-[9px] text-slate-500">HSTS, X-Frame-Options, XSS block.</span>
                  </div>
                </label>

                {/* Perf Toggles */}
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-cyan-300 transition-colors">
                  <input type="checkbox" checked={enableGzip} onChange={(e) => setEnableGzip(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Enable Gzip / Deflate</span>
                    <span className="block text-[9px] text-slate-500">Compresses assets for faster load.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-cyan-300 transition-colors">
                  <input type="checkbox" checked={enableBrowserCache} onChange={(e) => setEnableBrowserCache(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
                  <div>
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Browser Caching</span>
                    <span className="block text-[9px] text-slate-500">Adds Expires headers for caching.</span>
                  </div>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE CODE CONSOLE ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col h-[700px]">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-5 h-full flex flex-col relative overflow-hidden font-sans">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Globe className={`w-4 h-4 ${theme.textPri}`} /> .htaccess Configuration
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy} 
                    className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                      copied ? "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy</>}
                  </button>
                  <button 
                    onClick={handleDownload} 
                    className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-slate-800 text-white border-slate-700 hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5"/> Save
                  </button>
                </div>
              </div>

              {/* Status Notice */}
              <div className="flex items-start gap-2 p-3 bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200/50 dark:border-cyan-800/50 rounded-xl mb-4 shadow-sm shrink-0 font-sans">
                <Activity className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                  Rules are smartly wrapped in <code className="text-cyan-600 dark:text-cyan-400">{'<IfModule>'}</code> tags to prevent 500 Internal Server Errors if a module isn't supported by your Apache server.
                </p>
              </div>

              {/* Output Area */}
              <div className="flex-1 bg-[#1e293b] dark:bg-[#0d1117] rounded-xl border border-slate-700 dark:border-slate-800 shadow-inner overflow-hidden flex flex-col">
                <div className="flex items-center px-4 py-2 bg-slate-800 dark:bg-[#161b22] border-b border-slate-700 dark:border-slate-800 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">.htaccess</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                  <pre className="text-[11.5px] text-slate-300 leading-relaxed font-mono m-0 whitespace-pre-wrap">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}