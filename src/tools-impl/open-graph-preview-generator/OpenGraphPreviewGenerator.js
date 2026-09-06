"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Eye, Code, Image as ImageIcon, Copy, CheckCircle2, AlertCircle, Facebook, Twitter, Linkedin, MessageSquare, Globe } from "lucide-react";

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "twitter", name: "Twitter (X)", icon: Twitter, color: "text-slate-800 dark:text-slate-200", bg: "bg-slate-100 dark:bg-slate-800" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "discord", name: "Discord", icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" }
];

export default function OpenGraphPreviewGenerator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Inputs
  const [title, setTitle] = useState("The Ultimate Guide to Next.js 15");
  const [description, setDescription] = useState("Discover the most powerful features of the new Next.js update. Learn how to build faster, scalable, and SEO-friendly applications.");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80");
  const [url, setUrl] = useState("https://yourwebsite.com/guide");
  const [siteName, setSiteName] = useState("DevHub Pro");
  
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SEO Limits
  const titleLimit = 60;
  const descLimit = 110;

  const generateMetaTags = useCallback(() => {
    return `<!-- Primary Meta Tags -->
<title>${title || 'Title'}</title>
<meta name="title" content="${title || 'Title'}" />
<meta name="description" content="${description || 'Description'}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url || 'https://example.com'}" />
<meta property="og:title" content="${title || 'Title'}" />
<meta property="og:description" content="${description || 'Description'}" />
<meta property="og:image" content="${imageUrl || 'https://example.com/image.jpg'}" />
${siteName ? `<meta property="og:site_name" content="${siteName}" />` : ''}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${url || 'https://example.com'}" />
<meta property="twitter:title" content="${title || 'Title'}" />
<meta property="twitter:description" content="${description || 'Description'}" />
<meta property="twitter:image" content="${imageUrl || 'https://example.com/image.jpg'}" />`.trim();
  }, [title, description, imageUrl, url, siteName]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateMetaTags());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getHostname = (link) => {
    try {
      return new URL(link).hostname.replace('www.', '');
    } catch {
      return link ? 'yourwebsite.com' : 'example.com';
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-violet-100 dark:bg-violet-900/50 p-2 rounded-lg">
            <Eye className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight">Pro Open Graph Previewer</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Social Media Meta Simulator</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,550px] gap-6 items-start">
        
        {/* ================= LEFT COLUMN: INPUTS & CODE ================= */}
        <div className="space-y-6 min-w-0">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm space-y-5">
             
             <div className="space-y-1.5 relative">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Page Title</label>
                  <span className={`text-[10px] font-bold ${title.length > titleLimit ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {title.length}/{titleLimit}
                  </span>
                </div>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter page title..."
                  className={`w-full text-sm font-semibold p-3 bg-slate-50 dark:bg-slate-800 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500 ${title.length > titleLimit ? 'border-rose-300 dark:border-rose-700' : 'border-slate-200 dark:border-slate-700'} text-slate-800 dark:text-slate-100`}
                />
             </div>

             <div className="space-y-1.5 relative">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                  <span className={`text-[10px] font-bold ${description.length > descLimit ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {description.length}/{descLimit}
                  </span>
                </div>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the page..."
                  rows="3"
                  className={`w-full text-sm font-medium p-3 bg-slate-50 dark:bg-slate-800 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500 resize-none ${description.length > descLimit ? 'border-rose-300 dark:border-rose-700' : 'border-slate-200 dark:border-slate-700'} text-slate-800 dark:text-slate-100`}
                />
             </div>

             <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Image URL (1200x630 ideal)
                </label>
                <input 
                  type="url" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                  className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Page URL
                  </label>
                  <input 
                    type="url" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Site Name (Optional)</label>
                  <input 
                    type="text" 
                    value={siteName} 
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-100"
                  />
               </div>
             </div>
          </div>

          {/* HTML Meta Code Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
             <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-slate-200 text-sm">Generated HTML Tags</h3>
                </div>
                <button 
                  onClick={handleCopyCode}
                  className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                    isCopied 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {isCopied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Tags</>}
                </button>
             </div>
             <div className="p-4 bg-[#0d1117] overflow-x-auto custom-scrollbar max-h-[300px]">
               <pre className="text-[11px] sm:text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap break-all">
                 <code>{generateMetaTags()}</code>
               </pre>
             </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: PREVIEWS ================= */}
        <div className="space-y-4 min-w-0 flex flex-col sticky top-6">
           
           {/* Platform Selector */}
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl flex gap-1 shadow-sm overflow-x-auto custom-scrollbar">
             {PLATFORMS.map((platform) => {
               const Icon = platform.icon;
               const isActive = activePlatform.id === platform.id;
               return (
                 <button 
                   key={platform.id}
                   onClick={() => setActivePlatform(platform)}
                   className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs font-bold transition-all ${
                     isActive ? `${platform.bg} ${platform.color} shadow-sm border border-slate-100 dark:border-slate-700` : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                   }`}
                 >
                   <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{platform.name}</span>
                 </button>
               )
             })}
           </div>

           {/* Live Preview Container */}
           <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm min-h-[400px] flex items-center justify-center overflow-hidden">
             
             {/* --- FACEBOOK PREVIEW --- */}
             {activePlatform.id === "facebook" && (
               <div className="w-full max-w-[500px] bg-white dark:bg-[#242526] rounded shadow border border-slate-200 dark:border-[#3E4042] overflow-hidden text-left font-sans">
                 <div className="w-full aspect-[1.91/1] bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-[#3E4042]">
                   {imageUrl ? (
                     <img src={imageUrl} alt="OG" className="w-full h-full object-cover" onError={(e) => {e.target.style.display='none'}} />
                   ) : (
                     <ImageIcon className="w-10 h-10 text-slate-400" />
                   )}
                 </div>
                 <div className="p-3">
                   <div className="text-[12px] uppercase text-[#65676B] dark:text-[#B0B3B8] truncate mb-1">
                     {getHostname(url)}
                   </div>
                   <h3 className="text-[16px] font-semibold text-[#050505] dark:text-[#E4E6EB] leading-tight truncate mb-1">
                     {title || "Enter a title"}
                   </h3>
                   <p className="text-[14px] text-[#65676B] dark:text-[#B0B3B8] leading-snug line-clamp-1">
                     {description || "Enter a description for your page"}
                   </p>
                 </div>
               </div>
             )}

             {/* --- TWITTER (X) PREVIEW --- */}
             {activePlatform.id === "twitter" && (
               <div className="w-full max-w-[500px] bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-[#2F3336] overflow-hidden text-left font-sans">
                 <div className="w-full aspect-[1.91/1] bg-slate-200 dark:bg-[#2F3336] flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-[#2F3336]">
                   {imageUrl ? (
                     <img src={imageUrl} alt="OG" className="w-full h-full object-cover" onError={(e) => {e.target.style.display='none'}} />
                   ) : (
                     <ImageIcon className="w-10 h-10 text-slate-400" />
                   )}
                 </div>
                 <div className="p-3 px-4 bg-slate-50 dark:bg-black">
                   <h3 className="text-[15px] font-semibold text-slate-900 dark:text-[#E7E9EA] leading-tight truncate mb-0.5">
                     {title || "Enter a title"}
                   </h3>
                   <p className="text-[15px] text-slate-500 dark:text-[#71767B] leading-snug line-clamp-2 mb-1">
                     {description || "Enter a description for your page"}
                   </p>
                   <div className="text-[15px] text-slate-500 dark:text-[#71767B] flex items-center gap-1">
                     <Globe className="w-3.5 h-3.5" /> {getHostname(url)}
                   </div>
                 </div>
               </div>
             )}

             {/* --- LINKEDIN PREVIEW --- */}
             {activePlatform.id === "linkedin" && (
               <div className="w-full max-w-[500px] bg-white dark:bg-[#1D2226] rounded-sm border border-slate-200 dark:border-[#38434F] overflow-hidden text-left font-sans">
                 <div className="w-full aspect-[1.91/1] bg-slate-200 dark:bg-[#38434F] flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-[#38434F]">
                   {imageUrl ? (
                     <img src={imageUrl} alt="OG" className="w-full h-full object-cover" onError={(e) => {e.target.style.display='none'}} />
                   ) : (
                     <ImageIcon className="w-10 h-10 text-slate-400" />
                   )}
                 </div>
                 <div className="p-3 bg-[#F8FAFD] dark:bg-[#1D2226]">
                   <h3 className="text-[14px] font-semibold text-[#000000] dark:text-[#E9EAEC] leading-tight line-clamp-2 mb-1">
                     {title || "Enter a title"}
                   </h3>
                   <div className="text-[12px] text-[#00000099] dark:text-[#E9EAEC99] truncate">
                     {getHostname(url)}
                   </div>
                 </div>
               </div>
             )}

             {/* --- DISCORD PREVIEW --- */}
             {activePlatform.id === "discord" && (
               <div className="w-full max-w-[500px] bg-[#F2F3F5] dark:bg-[#2B2D31] rounded flex text-left font-sans pl-1">
                 {/* Accent Line */}
                 <div className="w-1 bg-[#1E1F22] rounded-l"></div>
                 
                 <div className="p-4 flex-1">
                   <div className="text-[12px] font-semibold text-[#111214] dark:text-[#DBDEE1] mb-1">
                     {siteName || getHostname(url)}
                   </div>
                   <h3 className="text-[16px] font-bold text-[#006CE7] dark:text-[#00A8FC] hover:underline cursor-pointer mb-2 leading-tight">
                     {title || "Enter a title"}
                   </h3>
                   <p className="text-[14px] text-[#313338] dark:text-[#DBDEE1] leading-snug mb-3">
                     {description || "Enter a description for your page"}
                   </p>
                   {imageUrl && (
                     <div className="rounded overflow-hidden max-w-[400px]">
                       <img src={imageUrl} alt="OG" className="w-full h-auto object-cover max-h-[250px]" onError={(e) => {e.target.style.display='none'}} />
                     </div>
                   )}
                 </div>
               </div>
             )}

           </div>

           {/* Alert for Length Warnings */}
           {(title.length > titleLimit || description.length > descLimit) && (
             <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-3 rounded-lg flex items-start gap-2">
               <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
               <div className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                 {title.length > titleLimit && <p>Your title exceeds {titleLimit} characters and may be truncated on some platforms.</p>}
                 {description.length > descLimit && <p>Your description exceeds {descLimit} characters. Keep it under 110 for maximum visibility.</p>}
               </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}