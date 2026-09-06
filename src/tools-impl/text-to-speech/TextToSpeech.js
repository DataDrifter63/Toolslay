"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, Settings2, Volume2, Activity, Sparkles, Globe, Volume1, AlignLeft } from "lucide-react";

// Sentence Splitter
const splitIntoSentences = (text) => {
  if (!text) return [];
  return text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g)?.map(s => s.trim()).filter(s => s.length > 0) || [];
};

// Premium Human Names & Quotes Database
const FEMALE_NAMES = ["Sophia", "Olivia", "Ava", "Emma", "Isabella", "Mia", "Amelia", "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth", "Mila", "Ella", "Avery", "Sofia", "Camila", "Aria", "Scarlett", "Victoria", "Madison", "Luna", "Grace", "Chloe", "Penelope", "Layla", "Riley", "Zoey", "Nora", "Lily"];
const MALE_NAMES = ["Liam", "Noah", "William", "James", "Oliver", "Benjamin", "Elijah", "Lucas", "Mason", "Logan", "Alexander", "Ethan", "Jacob", "Michael", "Daniel", "Henry", "Jackson", "Sebastian", "Aiden", "Matthew", "Samuel", "David", "Joseph", "Carter", "Owen", "Wyatt", "John", "Jack", "Luke", "Jayden"];
const QUOTES = [
  "Believe you can and you're halfway there.",
  "Act as if what you do makes a difference. It does.",
  "Success is not final, failure is not fatal.",
  "Do what you can, with what you have, where you are.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "It always seems impossible until it's done.",
  "Keep your face always toward the sunshine, and shadows will fall behind you.",
  "You are never too old to set another goal or to dream a new dream.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Opportunities don't happen, you create them.",
  "Don't watch the clock; do what it does. Keep going.",
  "The secret of getting ahead is getting started.",
  "Quality is not an act, it is a habit.",
  "Well done is better than well said.",
  "Always deliver more than expected.",
  "Action is the foundational key to all success.",
  "A winner is a dreamer who never gives up.",
  "Every moment is a fresh beginning.",
  "Whatever you are, be a good one.",
  "Tough times never last, but tough people do.",
  "Strive not to be a success, but rather to be of value.",
  "I attribute my success to this: I never gave or took any excuse.",
  "The most difficult thing is the decision to act.",
  "Definiteness of purpose is the starting point of all achievement.",
  "Life is 10% what happens to me and 90% of how I react to it.",
  "The mind is everything. What you think you become.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Eighty percent of success is showing up.",
  "Your time is limited, so don't waste it living someone else's life.",
  "Winning isn't everything, but wanting to win is."
];

export default function TextToSpeech() {
  const [text, setText] = useState("Welcome to ToolSlay! Our voice agents now have unique names, perfect gender-matching photos, and they never repeat. Click on any agent's photo to hear their unique greeting.");
  
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedLang, setSelectedLang] = useState("all");
  
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [viewMode, setViewMode] = useState("edit");
  
  const sentencesRef = useRef([]);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const loadVoices = () => {
      let availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        
        // Sort: English first
        availableVoices.sort((a, b) => {
          const isEnA = a.lang.startsWith('en') ? -1 : 1;
          const isEnB = b.lang.startsWith('en') ? -1 : 1;
          return isEnA - isEnB || a.name.localeCompare(b.name);
        });

        const usedNames = new Set();

        const mappedVoices = availableVoices.map((voice, index) => {
          const lowerName = voice.name.toLowerCase();
          
          // Smart Gender Detection based on Voice Name
          let gender = 'female';
          if (lowerName.includes('male') && !lowerName.includes('female')) gender = 'male';
          else if (lowerName.match(/(david|mark|ravi|alex|daniel|fred|arthur|bruce|george|john)/)) gender = 'male';
          else if (lowerName.match(/(female|zira|samantha|victoria|karen|tessa|susan|hazel|catherine|heera)/)) gender = 'female';
          else {
            // Hash fallback if browser doesn't specify
            let hash = 0;
            for (let i = 0; i < lowerName.length; i++) hash = lowerName.charCodeAt(i) + ((hash << 5) - hash);
            gender = (Math.abs(hash) % 2 === 0) ? 'female' : 'male';
          }

          // Pick a Unique Name
          const nameArray = gender === 'female' ? FEMALE_NAMES : MALE_NAMES;
          let displayName = nameArray.find(n => !usedNames.has(n));
          if (!displayName) {
             // If we somehow run out of 30 names per gender, append a letter
             const fallbackBase = nameArray[index % nameArray.length];
             displayName = `${fallbackBase} ${String.fromCharCode(65 + (index % 26))}`; 
          }
          usedNames.add(displayName);

          // Get Real Human Avatar matching the exact gender
          let hashStr = 0;
          for (let i = 0; i < voice.name.length; i++) hashStr = voice.name.charCodeAt(i) + ((hashStr << 5) - hashStr);
          const imgId = (Math.abs(hashStr) % 90) + 1; // 1 to 90
          const avatarUrl = `https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${imgId}.jpg`;

          // Get Unique Quote
          const quote = QUOTES[Math.abs(hashStr) % QUOTES.length];

          return {
            originalName: voice.name,
            voice: voice,
            lang: voice.lang,
            displayName: displayName,
            genderLabel: gender === 'female' ? 'Female' : 'Male',
            quote: quote,
            avatar: avatarUrl
          };
        });

        setVoices(mappedVoices);
        
        const defaultVoice = mappedVoices.find(v => v.lang.startsWith("en-US") || v.lang.startsWith("en-GB"));
        if (defaultVoice) setSelectedVoice(defaultVoice.originalName);
        else setSelectedVoice(mappedVoices[0]?.originalName || "");
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => window.speechSynthesis.cancel();
  }, []);

  const availableLanguages = Array.from(new Set(voices.map(v => v.lang.split('-')[0]))).sort();
  const filteredVoices = selectedLang === "all" ? voices : voices.filter(v => v.lang.startsWith(selectedLang));

  // Play Demo with unique quote
  const playDemo = (e, voiceItem) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    
    const demoUtterance = new SpeechSynthesisUtterance(`Hi, I am ${voiceItem.displayName}. ${voiceItem.quote}`);
    demoUtterance.voice = voiceItem.voice;
    demoUtterance.rate = 1;
    demoUtterance.pitch = 1;
    
    window.speechSynthesis.speak(demoUtterance);
  };

  const applyPreset = (speed, p) => {
    setRate(speed);
    setPitch(p);
  };

  const speakNextSentence = useCallback((index) => {
    if (index >= sentencesRef.current.length || !isPlayingRef.current || isPausedRef.current) {
      if (index >= sentencesRef.current.length) {
        setIsPlaying(false);
        setIsPaused(false);
        isPlayingRef.current = false;
        isPausedRef.current = false;
        setActiveSentenceIndex(-1);
        setViewMode("edit");
      }
      return;
    }

    setActiveSentenceIndex(index);
    const sentence = sentencesRef.current[index];
    
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    if (selectedVoice) {
      const voiceObj = voices.find(v => v.originalName === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj.voice;
    }

    utterance.onend = () => {
      if (isPlayingRef.current && !isPausedRef.current) {
        speakNextSentence(index + 1);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        setIsPlaying(false);
        setIsPaused(false);
        isPlayingRef.current = false;
        isPausedRef.current = false;
        setActiveSentenceIndex(-1);
        setViewMode("edit");
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, selectedVoice, voices]);

  const handlePlay = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    if (isPaused) {
      window.speechSynthesis.cancel();
      setIsPaused(false);
      setIsPlaying(true);
      isPausedRef.current = false;
      isPlayingRef.current = true;
      speakNextSentence(activeSentenceIndex !== -1 ? activeSentenceIndex : 0);
      return;
    }

    window.speechSynthesis.cancel(); 
    sentencesRef.current = splitIntoSentences(trimmedText);
    
    setViewMode("teleprompter");
    setIsPlaying(true);
    setIsPaused(false);
    isPlayingRef.current = true;
    isPausedRef.current = false;
    
    setTimeout(() => {
      speakNextSentence(0);
    }, 100);
  };

  const handlePause = () => {
    setIsPaused(true);
    isPausedRef.current = true;
    window.speechSynthesis.cancel();
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    isPlayingRef.current = false;
    isPausedRef.current = false;
    setActiveSentenceIndex(-1);
    setViewMode("edit");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings Sidebar */}
        <div className="lg:col-span-5 space-y-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 h-fit">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Voice Configuration</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" /> Filter by Language
              </label>
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value);
                  const firstVoice = voices.find(v => e.target.value === "all" || v.lang.startsWith(e.target.value));
                  if (firstVoice) setSelectedVoice(firstVoice.originalName);
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Languages</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* PREMIUM VOICE LIST UI WITH FIXED HUMAN AVATARS */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select a Voice Agent
              </label>
              <div className="h-[280px] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-2 shadow-inner">
                {filteredVoices.length === 0 && (
                  <div className="p-4 text-center text-sm text-slate-500">Loading agents...</div>
                )}
                {filteredVoices.map((voiceItem) => {
                  const isSelected = selectedVoice === voiceItem.originalName;
                  return (
                    <div 
                      key={voiceItem.originalName}
                      onClick={() => setSelectedVoice(voiceItem.originalName)}
                      className={`relative flex items-center p-3 rounded-lg cursor-pointer transition-all border ${
                        isSelected 
                          ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 shadow-sm" 
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}
                    >
                      {/* Gender Matching Avatar */}
                      <img 
                        src={voiceItem.avatar} 
                        alt={voiceItem.displayName}
                        onClick={(e) => playDemo(e, voiceItem)}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 cursor-pointer shadow-sm hover:ring-2 hover:ring-indigo-400 transition-all bg-slate-200"
                        title={`Listen to ${voiceItem.displayName}'s demo`}
                      />
                      
                      {/* Details */}
                      <div className="ml-3 flex-grow overflow-hidden">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate pr-8">
                          {voiceItem.displayName}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md text-[10px] font-medium uppercase tracking-wider">
                            {voiceItem.lang}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider hidden sm:inline-block ${
                            voiceItem.genderLabel === 'Female' 
                              ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' 
                              : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {voiceItem.genderLabel}
                          </span>
                        </div>
                      </div>

                      {/* Demo Play Button */}
                      <button 
                        onClick={(e) => playDemo(e, voiceItem)}
                        className="absolute right-3 p-2 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900 text-slate-500 rounded-full transition-colors"
                        title="Play Demo"
                      >
                        <Volume1 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => applyPreset(1, 1)} className="px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-indigo-500 transition-colors text-slate-600 dark:text-slate-300">
                  🎙️ Normal Pace
                </button>
                <button onClick={() => applyPreset(1.5, 1)} className="px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-indigo-500 transition-colors text-slate-600 dark:text-slate-300">
                  ⚡ Fast
                </button>
              </div>
            </div>

            <div className="space-y-5 pt-2">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" /> Speed (Rate)
                  </label>
                  <span className="text-indigo-600 font-mono font-medium">{rate.toFixed(1)}x</span>
                </div>
                <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-slate-400" /> Pitch
                  </label>
                  <span className="text-indigo-600 font-mono font-medium">{pitch.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Area & Teleprompter */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              <AlignLeft className="w-4 h-4" />
              {text.trim() ? text.trim().split(/\s+/).length : 0} Words
            </div>
          </div>

          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
            
            <div className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'edit' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the text you want to read here..."
                className="w-full h-full p-6 bg-transparent text-base leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                spellCheck="false"
              />
            </div>

            <div className={`absolute inset-0 bg-slate-50 dark:bg-slate-900 overflow-y-auto p-8 transition-opacity duration-300 ${viewMode === 'teleprompter' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <div className="flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider text-xs">
                <Sparkles className="w-4 h-4" /> Reading Mode Active
              </div>
              <div className="text-xl md:text-2xl leading-loose font-serif whitespace-pre-wrap">
                {sentencesRef.current.map((sentence, idx) => (
                  <span 
                    key={idx} 
                    className={`transition-colors duration-300 ${
                      idx === activeSentenceIndex 
                        ? "text-slate-900 dark:text-white bg-indigo-200 dark:bg-indigo-900/60 rounded-md py-1 px-2 -mx-2 shadow-sm font-medium" 
                        : "text-slate-400 dark:text-slate-600"
                    } mr-2`}
                  >
                    {sentence}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-lg mt-auto">
            {(!isPlaying || isPaused) ? (
              <button
                onClick={handlePlay}
                disabled={!text.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-md hover:shadow-indigo-500/30 active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                {isPaused ? "Resume Audio" : "Play Audio"}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-md hover:shadow-amber-500/30 active:scale-95"
              >
                <Pause className="w-5 h-5 fill-current" />
                Pause
              </button>
            )}

            {isPlaying && (
              <button
                onClick={handleStop}
                className="flex items-center justify-center w-14 h-14 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 rounded-full transition-colors"
                title="Stop & Edit"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}