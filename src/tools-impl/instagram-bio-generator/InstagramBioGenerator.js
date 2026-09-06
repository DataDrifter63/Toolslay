"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Copy, Check, Settings2, Sparkles, MapPin, Link as LinkIcon, Type, RefreshCw, LayoutTemplate } from "lucide-react";

// --- Unicode Font Engine ---
const FONTS = {
  normal: (text) => text,
  bold: (text) => {
    const map = { a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵', i: '𝗶', j: '𝗷', k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻', o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿', s: '𝘀', t: '𝘁', u: '𝘂', v: '𝘃', w: '𝘄', x: '𝘅', y: '𝘆', z: '𝘇', A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚', H: '𝗛', I: '𝗜', J: '𝗝', K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡', O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧', U: '𝗨', V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭' };
    return text.split('').map(c => map[c] || c).join('');
  },
  cursive: (text) => {
    const map = { a: '𝘢', b: '𝘣', c: '𝘤', d: '𝘥', e: '𝘦', f: '𝘧', g: '𝘨', h: '𝘩', i: '𝘪', j: '𝘫', k: '𝘬', l: '𝘭', m: '𝘮', n: '𝘯', o: '𝘰', p: '𝘱', q: '𝘲', r: '𝘳', s: '𝘴', t: '𝘵', u: '𝘶', v: '𝘷', w: '𝘸', x: '𝘹', y: '𝘺', z: '𝘻', A: '𝘈', B: '𝘉', C: '𝘊', D: '𝘋', E: '𝘌', F: '𝘍', G: '𝘎', H: '𝘏', I: '𝘐', J: '𝘑', K: '𝘒', L: '𝘓', M: '𝘔', N: '𝘕', O: '𝘖', P: '𝘗', Q: '𝘘', R: '𝘙', S: '𝘚', T: '𝘛', U: '𝘜', V: '𝘝', W: '𝘞', X: '𝘟', Y: '𝘠', Z: '𝘡' };
    return text.split('').map(c => map[c] || c).join('');
  }
};

// --- Bio Templates Database ---
const TEMPLATES = {
  developer: [
    "Turning ☕ into code\nBuilding the future pixel by pixel 💻\nOpen source enthusiast 🌐",
    "Ctrl+C, Ctrl+V Developer 👨‍💻\n404 Sleep not found 🌙\nBuilding cool stuff 🚀",
    "Tech Geek | Problem Solver 🧠\nDebugging my life... 🐛\nCheck out my latest project"
  ],
  creator: [
    "Creating things that make you smile ✨\nArt | Life | Vibes 🎨\nJoin the journey 🚀",
    "Romanticizing my life 🌸\nDigital Diary 📸\nCollaborations in email 💌",
    "Just a storyteller with a camera 🎥\nFinding beauty in the chaos 🌪️\nWatch my latest video"
  ],
  business: [
    "Helping you achieve your goals 📈\nPremium quality, always 💎\nTrusted by 10k+ customers 🌟",
    "Your one-stop solution for excellence 🎯\nInnovating everyday 💡\nShop our new collection",
    "Empowering brands to scale 🚀\nConsulting | Strategy | Growth 📊\nBook a free call"
  ],
  fitness: [
    "Sweat now, shine later 💪\nFitness & Nutrition Coach 🥗\nHelping you build your dream body 🔥",
    "Iron addict 🏋️‍♂️\nProgress over perfection 📈\nJoin my 30-day challenge",
    "Eat. Sleep. Train. Repeat. 🔄\nMarathoner 🏃‍♂️ | Yogi 🧘‍♀️\nGet my free workout guide"
  ],
  minimalist: [
    "Less is more. 🤍",
    "Living simply. 🌿",
    "Creating space. ✨\nJust breathing."
  ]
};

export default function InstagramBioGenerator() {
  const [niche, setNiche] = useState("creator");
  const [fontStyle, setFontStyle] = useState("normal");
  const [includeCTA, setIncludeCTA] = useState(true);
  const [location, setLocation] = useState("");
  const [name, setName] = useState("Jane Doe");
  const [pronouns, setPronouns] = useState("she/her");
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // NEW: State to track which generated bio is currently selected for preview
  const [selectedBioIndex, setSelectedBioIndex] = useState(0);

  // Reset selected bio to 0 whenever a new batch is generated
  useEffect(() => {
    setSelectedBioIndex(0);
  }, [refreshTrigger, niche, fontStyle, includeCTA, location]);

  // Generate 3 unique bio variations
  const generatedBios = useMemo(() => {
    // eslint-disable-next-line no-unused-expressions
    refreshTrigger; 
    
    let baseTemplates = [...(TEMPLATES[niche] || TEMPLATES.creator)];
    // Shuffle templates
    baseTemplates.sort(() => 0.5 - Math.random());
    
    return baseTemplates.slice(0, 3).map(template => {
      let bio = template;
      
      // Apply Font
      bio = FONTS[fontStyle](bio);
      
      // Apply Location
      if (location) {
        bio += `\n📍 ${location}`;
      }
      
      // Apply CTA
      if (includeCTA) {
        const ctas = ["\n👇 Click below", "\n🔗 Link in bio", "\n👇 See more here"];
        bio += ctas[Math.floor(Math.random() * ctas.length)];
      }
      
      return bio;
    });
  }, [niche, fontStyle, includeCTA, location, refreshTrigger]);

  const handleCopy = async (e, text, index) => {
    e.stopPropagation(); // Prevent card selection when just clicking copy
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Configuration */}
        <div className="lg:col-span-4 space-y-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 h-fit">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Bio Personalization</h3>
          </div>

          <div className="space-y-4">
            
            {/* Vibe / Niche */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Your Niche / Vibe
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "creator", label: "🎨 Creator" },
                  { id: "developer", label: "💻 Tech/Dev" },
                  { id: "business", label: "💼 Business" },
                  { id: "fitness", label: "💪 Fitness" },
                  { id: "minimalist", label: "🌿 Minimal" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setNiche(item.id)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors ${
                      niche === item.id 
                        ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-400" 
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pronouns (Opt)</label>
                  <input 
                    type="text" 
                    value={pronouns} 
                    onChange={(e) => setPronouns(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="she/her"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="New York, NY"
                  />
                </div>
              </div>
            </div>

            {/* Typography / Font Style */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Type className="w-4 h-4 text-pink-500" /> Bio Typography
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setFontStyle("normal")} className={`py-1.5 text-sm rounded-md border ${fontStyle === "normal" ? "bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/30" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>
                  Normal
                </button>
                <button onClick={() => setFontStyle("bold")} className={`py-1.5 text-sm font-bold rounded-md border ${fontStyle === "bold" ? "bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/30" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>
                  𝗕𝗼𝗹𝗱
                </button>
                <button onClick={() => setFontStyle("cursive")} className={`py-1.5 text-sm italic rounded-md border ${fontStyle === "cursive" ? "bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/30" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>
                  𝘊𝘶𝘳𝘴𝘪𝘷𝘦
                </button>
              </div>
            </div>

            {/* Smart Add-ons */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={includeCTA} onChange={(e) => setIncludeCTA(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Add Link-in-Bio Arrow (👇)</span>
              </label>
            </div>
            
            <button 
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Generate New Ideas
            </button>
          </div>
        </div>

        {/* Results & Live Preview */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <LayoutTemplate className="w-5 h-5 text-indigo-500" /> 
            Suggestions (Click to Preview)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generatedBios.map((bio, index) => (
              <div 
                key={index}
                onClick={() => setSelectedBioIndex(index)}
                className={`flex flex-col bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm relative group cursor-pointer transition-all duration-200 ${
                  selectedBioIndex === index 
                    ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-900/20" 
                    : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                {selectedBioIndex === index && (
                  <div className="absolute -top-2 -right-2 bg-indigo-500 text-white p-1 rounded-full shadow-md">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-8 flex-grow">
                  {bio}
                </pre>
                
                <button 
                  onClick={(e) => handleCopy(e, bio, index)}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                >
                  {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedIndex === index ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          {/* Instagram Mockup UI */}
          <div className="mt-4 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-4 shadow-xl max-w-sm mx-auto w-full relative overflow-hidden transition-all duration-300">
            {/* Top Bar Mockup */}
            <div className="flex justify-between items-center px-4 pt-2 pb-4">
              <div className="font-bold text-lg flex items-center gap-1 dark:text-white">
                {name.replace(/\s+/g, '').toLowerCase() || "username"}
              </div>
              <div className="flex gap-4">
                <div className="w-5 h-5 border-2 border-black dark:border-white rounded-md"></div>
                <div className="w-6 h-0.5 bg-black dark:bg-white mt-2"></div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="flex items-center justify-between px-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-1">
                <div className="w-full h-full rounded-full border-2 border-white dark:border-black bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  <span className="text-2xl">📸</span>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div><div className="font-bold dark:text-white">142</div><div className="text-xs text-slate-500">Posts</div></div>
                <div><div className="font-bold dark:text-white">10.5K</div><div className="text-xs text-slate-500">Followers</div></div>
                <div><div className="font-bold dark:text-white">420</div><div className="text-xs text-slate-500">Following</div></div>
              </div>
            </div>

            {/* The Actual Bio Preview (DYNAMICALLY CHANGING) */}
            <div className="px-4 pb-6">
              <div className="font-bold text-sm dark:text-white flex items-center gap-2">
                {name || "Jane Doe"} 
                {pronouns && <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 rounded-full">{pronouns}</span>}
              </div>
              
              <div className="text-sm mt-1 mb-2 whitespace-pre-wrap dark:text-slate-100 leading-snug">
                {generatedBios[selectedBioIndex]}
              </div>
              
              {/* Link Mockup */}
              {includeCTA && (
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5" /> linktr.ee/yourlink
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <div className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-center text-sm font-semibold dark:text-white">Edit profile</div>
                <div className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-center text-sm font-semibold dark:text-white">Share profile</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}