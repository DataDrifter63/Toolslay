"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Trash2, AlignLeft, BarChart3, Target, AlertTriangle, AlertCircle, CheckCircle2, GraduationCap } from "lucide-react";

const countSyllables = (word) => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
};

const splitSentences = (text) => {
  if (!text) return [];
  const matches = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
  return matches.map(s => s.trim()).filter(s => s.length > 0);
};

export default function ReadabilityChecker() {
  const [text, setText] = useState("");
  const [targetAudience, setTargetAudience] = useState("general");
  const [isCopied, setIsCopied] = useState(false);

  const { stats, scores, issues } = useMemo(() => {
    if (!text.trim()) {
      return {
        stats: { words: 0, sentences: 0, syllables: 0, complexWordsCount: 0 },
        scores: { fleschEase: 0, fleschGrade: 0 },
        issues: { hardSentences: [], veryHardSentences: [], complexWords: [], tooBasic: false }
      };
    }

    let hardLimit = 14;
    let veryHardLimit = 20;

    if (targetAudience === "kids") {
      hardLimit = 10;
      veryHardLimit = 14;
    } else if (targetAudience === "academic") {
      hardLimit = 25; 
      veryHardLimit = 35;
    }

    const sentences = splitSentences(text);
    const wordsMatch = text.match(/\b[-?a-zA-Z0-9_]+\b/g) || [];
    const totalWords = wordsMatch.length;
    const totalSentences = sentences.length || 1;

    let totalSyllables = 0;
    const complexWordsSet = new Set();
    let complexWordsCount = 0;
    const hardSentencesList = [];
    const veryHardSentencesList = [];

    wordsMatch.forEach(word => {
      const syllables = countSyllables(word);
      totalSyllables += syllables;
      if (syllables >= 3) {
        complexWordsCount++;
        complexWordsSet.add(word.toLowerCase());
      }
    });

    sentences.forEach(sentence => {
      const sWords = (sentence.match(/\b[-?a-zA-Z0-9_]+\b/g) || []).length;
      if (sWords > veryHardLimit) {
        veryHardSentencesList.push(sentence);
      } else if (sWords > hardLimit) {
        hardSentencesList.push(sentence);
      }
    });

    const avgWordsPerSentence = totalWords / totalSentences;
    const avgSyllablesPerWord = totalSyllables / totalWords;

    let fleschEase = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    let fleschGrade = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;

    return {
      stats: {
        words: totalWords,
        sentences: totalSentences,
        syllables: totalSyllables,
        complexWordsCount
      },
      scores: {
        fleschEase: Math.max(0, Math.min(100, Math.round(fleschEase))),
        fleschGrade: Math.max(0, Math.round(fleschGrade * 10) / 10),
      },
      issues: {
        hardSentences: hardSentencesList,
        veryHardSentences: veryHardSentencesList,
        complexWords: Array.from(complexWordsSet),
        tooBasic: targetAudience === "academic" && fleschGrade < 11
      }
    };
  }, [text, targetAudience]);

  const evaluation = useMemo(() => {
    const grade = scores.fleschGrade;
    let status = "gray";
    let msg = "Start typing...";
    let targetRange = "";

    if (text.trim()) {
      if (targetAudience === "kids") {
        targetRange = "Grade 6 or lower";
        if (grade <= 6) { status = "green"; msg = "Perfectly readable for kids!"; }
        else if (grade <= 8) { status = "yellow"; msg = "A bit complex for young kids."; }
        else { status = "red"; msg = "Too difficult! Simplify your text heavily."; }
      } 
      else if (targetAudience === "academic") {
        targetRange = "Grade 11+";
        if (grade >= 11) { status = "green"; msg = "Excellent academic tone."; }
        else if (grade >= 9) { status = "yellow"; msg = "A bit too simple for research papers."; }
        else { status = "red"; msg = "Too basic! Use more formal vocabulary."; }
      } 
      else { 
        targetRange = "Grade 7 to 10";
        if (grade >= 7 && grade <= 10) { status = "green"; msg = "Ideal for the general public."; }
        else if (grade > 10) { status = "yellow"; msg = "Slightly hard to read for average users."; }
        else { status = "yellow"; msg = "A bit too simple, but highly readable."; }
      }
    }

    const colors = {
      green: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
      yellow: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
      red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      gray: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
    };

    return { status, msg, targetRange, colorClasses: colors[status] };
  }, [scores.fleschGrade, targetAudience, text]);

  // Dynamic Colors for Indices based on Audience
  const indicesColors = useMemo(() => {
    let easeColor = "text-slate-800 dark:text-slate-200";
    let complexColor = "text-slate-800 dark:text-slate-200";
    
    if (text.trim()) {
      const ease = scores.fleschEase;
      const complexPct = stats.words > 0 ? (stats.complexWordsCount / stats.words) * 100 : 0;

      if (targetAudience === "kids") {
        easeColor = ease >= 80 ? "text-emerald-500" : ease >= 60 ? "text-amber-500" : "text-red-500";
        complexColor = complexPct <= 5 ? "text-emerald-500" : complexPct <= 10 ? "text-amber-500" : "text-red-500";
      } else if (targetAudience === "academic") {
        easeColor = ease <= 50 ? "text-emerald-500" : ease <= 70 ? "text-amber-500" : "text-red-500"; // Lower ease is expected
        complexColor = complexPct >= 15 ? "text-emerald-500" : complexPct >= 8 ? "text-amber-500" : "text-red-500"; // Higher complex % is expected
      } else {
        easeColor = ease >= 60 ? "text-emerald-500" : ease >= 40 ? "text-amber-500" : "text-red-500";
        complexColor = complexPct <= 12 ? "text-emerald-500" : complexPct <= 20 ? "text-amber-500" : "text-red-500";
      }
    }
    
    return { easeColor, complexColor };
  }, [scores.fleschEase, stats.words, stats.complexWordsCount, targetAudience, text]);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {}
  };

  const showActionItems = text.trim() && (
    issues.hardSentences.length > 0 || 
    issues.veryHardSentences.length > 0 || 
    (targetAudience !== "academic" && issues.complexWords.length > 0) ||
    issues.tooBasic
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">Who are you writing for?</span>
        </div>
        <div className="flex gap-2">
          {[
            { id: "kids", label: "Kids / ESL", target: "< Grade 6" },
            { id: "general", label: "General Public", target: "Grade 7-10" },
            { id: "academic", label: "Academic", target: "Grade 11+" }
          ].map(aud => (
            <button
              key={aud.id}
              onClick={() => setTargetAudience(aud.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                targetAudience === aud.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {aud.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex-grow">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <AlignLeft className="w-4 h-4 text-slate-400" /> Content Editor
              </div>
              
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md transition-colors" title="Copy text">
                  {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => setText("")} className="p-1.5 text-slate-500 hover:text-red-600 rounded-md transition-colors" title="Clear">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your article, essay, or blog post here... The readability score and issues will update in real-time based on your audience."
              className="w-full h-full min-h-[350px] p-6 bg-transparent text-base leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              spellCheck="false"
            />
          </div>

          {showActionItems ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> 
                Action Items (Optimization Suggestions)
              </h3>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                
                {issues.tooBasic && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-indigo-500 rounded-r-md text-sm">
                    <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-1">Vocabulary is too basic:</span>
                    <span className="text-slate-700 dark:text-slate-300">Try incorporating more formal vocabulary and complex sentence structures to match your Academic audience.</span>
                  </div>
                )}

                {issues.veryHardSentences.map((s, idx) => (
                  <div key={`vh-${idx}`} className="p-3 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-md text-sm">
                    <span className="font-bold text-red-700 dark:text-red-400 block mb-1">Very hard to read:</span>
                    <span className="text-slate-700 dark:text-slate-300">"{s}"</span>
                  </div>
                ))}
                
                {issues.hardSentences.map((s, idx) => (
                  <div key={`h-${idx}`} className="p-3 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-r-md text-sm">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">Hard to read:</span>
                    <span className="text-slate-700 dark:text-slate-300">"{s}"</span>
                  </div>
                ))}

                {targetAudience !== "academic" && issues.complexWords.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-md text-sm">
                    <span className="font-bold text-blue-700 dark:text-blue-400 block mb-1">Complex words (Try simpler alternatives):</span>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {issues.complexWords.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : text.trim() ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-5 shadow-sm flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <div>
                <h3 className="font-bold text-emerald-700 dark:text-emerald-400">Great Job!</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-500">Your text perfectly matches the chosen audience's requirements.</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-4 space-y-4">
          
          <div className={`p-6 rounded-xl border shadow-sm text-center transition-colors duration-300 ${evaluation.colorClasses}`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
              <GraduationCap className="w-5 h-5" /> Flesch-Kincaid Grade
            </h3>
            <div className="text-6xl font-black my-4 tracking-tighter">
              {scores.fleschGrade > 0 ? scores.fleschGrade : "0.0"}
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 mt-4 text-sm font-medium">
              <span className="block opacity-80 mb-1">Target Range: {evaluation.targetRange}</span>
              <span className="font-bold">{evaluation.msg}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" /> Reading Indices
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Reading Ease Score</span>
              <span className={`font-bold transition-colors ${indicesColors.easeColor}`}>
                {scores.fleschEase} / 100
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                Complex Words <AlertCircle className="w-3.5 h-3.5 text-slate-400" title="Words with 3+ syllables" />
              </span>
              <span className={`font-bold transition-colors ${indicesColors.complexColor}`}>
                {stats.words > 0 ? Math.round((stats.complexWordsCount / stats.words) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
              <span className="block text-2xl font-bold text-slate-700 dark:text-slate-300">{stats.words}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Words</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
              <span className="block text-2xl font-bold text-slate-700 dark:text-slate-300">{stats.sentences}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentences</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}