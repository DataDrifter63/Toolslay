"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Server, Shield, Zap, Route, Copy, 
  CheckCircle2, Download, PlusCircle, MinusCircle, 
  Settings2, Activity, Globe, FileCode2
} from "lucide-react";

export default function HtaccessGenerator() {
  const [isMounted, setIsMounted] = useState(false);

  const [preset, setPreset] = useState("custom");
  
  const [forceHttps, setForceHttps] = useState(true);
  const [wwwPref, setWwwPref] = useState("none");
  const [customRedirects, setCustomRedirects] = useState([]);
  
  const [preventDirListing, setPreventDirListing] = useState(true);
  const [securityHeaders, setSecurityHeaders] = useState(true);
  const [preventHotlinking, setPreventHotlinking] = useState(false);
  const [blockSpamBots, setBlockSpamBots] = useState(false);

  const [enableGzip, setEnableGzip] = useState(true);
  const [enableBrowserCache, setEnableBrowserCache] = useState(true);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const generatedCode = useMemo(() => {
    let rules = [];
    
    rules.push(`# =====================================================================`);
    rules.push(`# Muxair Enterprise .htaccess Configuration`);
    rules.push(`# Generated on: ${new Date().toLocaleDateString()}`);
    rules.push(`# =====================================================================\n`);

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
      rules.push(``);
    }

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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              .htaccess Architect
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Apache server configuration engine.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 items-start w-full">
        
        {/* LEFT: CONFIGURATION ENGINE */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6 w-full box-border font-sans">
            
            {/* 1. App Presets */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <FileCode2 className="w-3.5 h-3.5 text-brand" /> 1. Application Presets
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => handlePresetChange('custom')} className={`p-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${preset === 'custom' ? 'bg-brand text-surface border-brand shadow-sm' : 'border-line text-muted hover:text-ink bg-surface'}`}>
                  Custom
                </button>
                <button type="button" onClick={() => handlePresetChange('spa')} className={`p-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${preset === 'spa' ? 'bg-brand text-surface border-brand shadow-sm' : 'border-line text-muted hover:text-ink bg-surface'}`}>
                  React / SPA
                </button>
                <button type="button" onClick={() => handlePresetChange('wp')} className={`p-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${preset === 'wp' ? 'bg-brand text-surface border-brand shadow-sm' : 'border-line text-muted hover:text-ink bg-surface'}`}>
                  WordPress
                </button>
              </div>
            </div>

            <hr className="border-line" />

            {/* 2. Routing & Redirects */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Route className="w-3.5 h-3.5 text-brand" /> 2. Traffic Routing
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Force HTTPS Toggle */}
                <div className={`flex flex-col p-3.5 rounded-xl border ${forceHttps ? 'border-brand/30 bg-brand/10' : 'border-line bg-surface'} transition-colors`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-black text-ink uppercase tracking-wider">Force HTTPS (SSL)</span>
                    <button type="button" onClick={() => setForceHttps(!forceHttps)} className={`w-9 h-5 rounded-full transition-colors relative p-1 shadow-inner ${forceHttps ? 'bg-brand' : 'bg-line'}`}>
                      <div className={`w-3 h-3 rounded-full bg-surface shadow-sm transition-transform ${forceHttps ? "translate-x-4" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="text-[9px] font-bold text-muted">Redirects http:// to https://</span>
                </div>

                {/* WWW Preference */}
                <div className="flex flex-col p-3.5 rounded-xl border border-line bg-surface">
                  <span className="text-xs font-black text-ink uppercase tracking-wider mb-2">WWW Preference</span>
                  <select 
                    value={wwwPref} onChange={(e) => setWwwPref(e.target.value)}
                    className="w-full bg-surface border border-line rounded-lg px-2.5 py-2 text-xs font-bold text-ink outline-none cursor-pointer"
                  >
                    <option value="none">No Preference</option>
                    <option value="www">Force www.</option>
                    <option value="non-www">Force Non-www</option>
                  </select>
                </div>
              </div>

              {/* Custom Redirects Builder */}
              <div className="mt-3 p-3.5 bg-surface rounded-xl border border-line">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-ink uppercase tracking-wider">Visual Redirect Builder</span>
                  <button type="button" onClick={addRedirect} className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2 py-1 rounded-lg border border-brand/30 hover:opacity-80 transition-opacity flex items-center gap-1"><PlusCircle className="w-3 h-3"/> Add</button>
                </div>
                
                {customRedirects.length === 0 ? (
                  <p className="text-[10px] text-muted font-bold italic">No custom redirects added.</p>
                ) : (
                  <div className="space-y-2">
                    {customRedirects.map((redir, idx) => (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <input type="text" placeholder="/old-path" value={redir.old} onChange={(e) => updateRedirect(idx, 'old', e.target.value)} className="flex-1 min-w-[90px] bg-surface border border-line rounded-lg px-2 py-1.5 text-xs font-mono text-ink outline-none focus:border-brand" />
                        <Route className="w-3.5 h-3.5 text-muted shrink-0 hidden sm:block" />
                        <input type="text" placeholder="https://site.com/new" value={redir.new} onChange={(e) => updateRedirect(idx, 'new', e.target.value)} className="flex-1 min-w-[110px] bg-surface border border-line rounded-lg px-2 py-1.5 text-xs font-mono text-ink outline-none focus:border-brand" />
                        <select value={redir.type} onChange={(e) => updateRedirect(idx, 'type', e.target.value)} className="bg-surface border border-line rounded-lg px-2 py-1.5 text-xs font-bold text-ink outline-none cursor-pointer">
                          <option value="301">301</option>
                          <option value="302">302</option>
                        </select>
                        <button type="button" onClick={() => removeRedirect(idx)} className="p-1.5 text-muted hover:text-[#fb7185] transition-colors"><MinusCircle className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-line" />

            {/* 3. Security & Performance */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                <Shield className="w-3.5 h-3.5 text-brand" /> 3. Security & Performance
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors">
                  <input type="checkbox" checked={preventDirListing} onChange={(e) => setPreventDirListing(e.target.checked)} className="w-4 h-4 accent-brand rounded cursor-pointer" />
                  <div>
                    <span className="block text-xs font-black text-ink uppercase tracking-wider">Disable Directory List</span>
                    <span className="block text-[9px] text-muted">Prevents viewing folder contents.</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors">
                  <input type="checkbox" checked={securityHeaders} onChange={(e) => setSecurityHeaders(e.target.checked)} className="w-4 h-4 accent-brand rounded cursor-pointer" />
                  <div>
                    <span className="block text-xs font-black text-ink uppercase tracking-wider">Add Security Headers</span>
                    <span className="block text-[9px] text-muted">HSTS, X-Frame-Options, XSS block.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors">
                  <input type="checkbox" checked={enableGzip} onChange={(e) => setEnableGzip(e.target.checked)} className="w-4 h-4 accent-brand rounded cursor-pointer" />
                  <div>
                    <span className="block text-xs font-black text-ink uppercase tracking-wider">Enable Gzip / Deflate</span>
                    <span className="block text-[9px] text-muted">Compresses assets for faster load.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-line cursor-pointer hover:border-brand/50 transition-colors">
                  <input type="checkbox" checked={enableBrowserCache} onChange={(e) => setEnableBrowserCache(e.target.checked)} className="w-4 h-4 accent-brand rounded cursor-pointer" />
                  <div>
                    <span className="block text-xs font-black text-ink uppercase tracking-wider">Browser Caching</span>
                    <span className="block text-[9px] text-muted">Adds Expires headers for caching.</span>
                  </div>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: THE CODE CONSOLE */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border font-sans">
            
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Globe className="w-4 h-4 text-brand" /> .htaccess Configuration
              </span>
              
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={handleCopy} 
                  className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                    copied ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-surface text-muted border-line hover:text-ink"
                  }`}
                >
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy</>}
                </button>
                <button 
                  type="button"
                  onClick={handleDownload} 
                  className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-brand text-surface border-brand hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Download className="w-3.5 h-3.5"/> Save
                </button>
              </div>
            </div>

            {/* Status Notice */}
            <div className="flex items-start gap-2 p-3 bg-surface border border-line rounded-xl shadow-sm">
              <Activity className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium text-muted leading-relaxed">
                Rules are smartly wrapped in <code className="text-brand">{'<IfModule>'}</code> tags to prevent 500 Internal Server Errors if a module isn't supported by your Apache server.
              </p>
            </div>

            {/* Output Area */}
            <div className="flex flex-col bg-surface border border-line rounded-xl shadow-sm overflow-hidden w-full">
              <div className="flex items-center px-3.5 py-2.5 bg-surface border-b border-line">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider font-black">.htaccess</span>
              </div>
              <div className="p-4 max-h-[480px] overflow-y-auto custom-scrollbar">
                <pre className="text-xs break-all text-ink leading-relaxed font-mono m-0 whitespace-pre-wrap tabular-nums">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}