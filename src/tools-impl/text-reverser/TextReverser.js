"use client";

import React, { useState, useMemo } from "react";
import { Copy, Download, Check, Settings2, Trash2, AlignLeft, RotateCcw, FlipHorizontal, Sparkles, FileText, Layers, Split } from "lucide-react";

// Unicode mapping for upside-down text
const UPSIDE_DOWN_MAP = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ɓ', h: 'ɥ', i: 'ı', j: 'ɾ',
  k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'q', q: 'p', r: 'ɹ', s: 's', t: 'ʇ',
  u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: 'q', C: 'Ɔ', D: 'p', E: 'Ǝ', F: 'Ⅎ', G: 'פ', H: 'H', I: 'I', J: 'ſ',
  K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ò', R: 'ᴚ', S: 'S', T: '┴',
  U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': '⇂', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': '\'', '\'': ',', '"': ',,', '?': '¿', '!': '¡', '(': ')', ')': '(',
  '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '_': '‾'
};

export default function TextReverser() {
  const [input, setInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Settings
  const [mode, setMode] = useState("char"); // 'char', 'words-letters', 'words-order', 'lines', 'upside-down', 'delimiter'
  const [delimiter, setDelimiter] = useState(",");
  const [trimWhitespace, setTrimWhitespace] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);

  // Reversal & Palindrome Engine
  const { reversedText, stats } = useMemo(() => {
    if (!input) return { reversedText: "", stats: { totalWords: 0, palindromesCount: 0 } };

    let textToProcess = input;

    if (trimWhitespace) {
      textToProcess = textToProcess.split("\n").map(l => l.trim()).join("\n");
    }

    let output = "";

    switch (mode) {
      case "char":
        // Complete Character-by-Character Reversal
        output = textToProcess.split("").reverse().join("");
        break;

      case "words-letters":
        // Reverse lettering inside each word, keep word positions
        output = textToProcess.split("\n").map(line => 
          line.split(" ").map(word => word.split("").reverse().join("")).join(" ")
        ).join("\n");
        break;

      case "words-order":
        // Reverse word order, keep letter order intact
        output = textToProcess.split("\n").map(line => 
          line.split(/\s+/).reverse().join(" ")
        ).join("\n");
        break;

      case "lines":
        // Reverse line order (Flip rows)
        let lines = textToProcess.split("\n");
        if (removeEmpty) lines = lines.filter(l => l.trim() !== "");
        output = lines.reverse().join("\n");
        break;

      case "upside-down":
        // Convert to Upside Down Unicode
        output = textToProcess.split("").reverse().map(char => UPSIDE_DOWN_MAP[char] || char).join("");
        break;

      case "delimiter":
        // Reverse by custom delimiter (e.g., CSV items, tags)
        const sep = delimiter || ",";
        output = textToProcess.split(sep).reverse().map(item => trimWhitespace ? item.trim() : item).join(sep + " ");
        break;

      default:
        output = textToProcess;
    }

    if (removeEmpty && mode !== "lines") {
      output = output.split("\n").filter(l => l.trim() !== "").join("\n");
    }

    // Palindrome Inspector
    const words = input.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 1);
    const palindromes = words.filter(w => w === w.split("").reverse().join(""));

    return {
      reversedText: output,
      stats: {
        totalWords: words.length,
        palindromesCount: palindromes.length,
      }
    };
  }, [input, mode, delimiter, trimWhitespace, removeEmpty]);

  const handleCopy = async () => {
    if (!reversedText) return;
    try {
      await navigator.clipboard.writeText(reversedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    if (!reversedText) return;
    const blob = new Blob([reversedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reversed-text-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings Sidebar */}
        <div className="lg:col-span-4 space-y-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 h-fit">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Reversal Mode</h3>
            </div>
            <button onClick={() => setInput("")} className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors">
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "char", icon: RotateCcw, label: "Reverse Everything (Characters)" },
                { id: "words-order", icon: FlipHorizontal, label: "Reverse Word Order" },
                { id: "words-letters", icon: AlignLeft, label: "Flip Letters Inside Words" },
                { id: "lines", icon: Layers, label: "Reverse Line Order (Flip Rows)" },
                { id: "upside-down", icon: Sparkles, label: "Upside-Down / Mirror Text" },
                { id: "delimiter", icon: Split, label: "Custom Delimiter (CSV / Tags)" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-all border ${
                    mode === m.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                  }`}
                >
                  <m.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Delimiter Input */}
            {mode === "delimiter" && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Separator Symbol
                </label>
                <input
                  type="text"
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  placeholder="e.g. , or | or -"
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Extra Controls */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Text Formatting
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={trimWhitespace} onChange={(e) => setTrimWhitespace(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">Trim Extra Spaces</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">Remove Empty Lines</span>
              </label>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Palindrome Detector Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Words</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.totalWords}</span>
              </div>
              <FileText className="w-8 h-8 text-slate-200 dark:text-slate-700" />
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Palindromes Found</span>
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.palindromesCount}</span>
              </div>
              <Sparkles className="w-8 h-8 text-amber-300 dark:text-amber-700/50" />
            </div>
          </div>

          {/* Dual Work Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[450px]">
            
            {/* Input Side */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <FileText className="w-4 h-4 text-slate-400" /> Original Text
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste your text here...&#10;&#10;hello world&#10;racecar madam"
                className="w-full h-full min-h-[400px] p-4 bg-transparent text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 inset-ring"
                spellCheck="false"
              />
            </div>

            {/* Output Side */}
            <div className="flex flex-col bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-white dark:bg-slate-800 px-3 py-2 border-b border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 px-1">
                  <RotateCcw className="w-4 h-4" /> Reversed Output
                </div>
                
                <div className="flex gap-1">
                  <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-300 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/60 rounded-md transition-colors">
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={handleDownload} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md transition-colors" title="Export as TXT">
                    <Download className="w-3.5 h-3.5" /> TXT
                  </button>
                </div>
              </div>
              
              <textarea
                readOnly
                value={reversedText}
                placeholder="Reversed output will appear here..."
                className="w-full h-full min-h-[400px] p-4 bg-transparent text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}