"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Copy, Download, Trash2, Sparkles, 
  RefreshCw, CheckCircle2, AlertCircle, FileText, Settings, ShieldCheck, Volume2
} from "lucide-react";

export default function SpeechToTextTool() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [autoPunctuation, setAutoPunctuation] = useState(true);
  const [formatMode, setFormatMode] = useState("normal"); // normal, formal, bullets, email
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech Recognition API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let currentInterim = "";
      let finalBatch = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        let textPiece = event.results[i][0].transcript;
        
        if (autoPunctuation) {
          textPiece = textPiece
            .replace(/\bfull stop\b/gi, ".")
            .replace(/\bcomma\b/gi, ",")
            .replace(/\bquestion mark\b/gi, "?")
            .replace(/\bnew line\b/gi, "\n");
        }

        if (event.results[i].isFinal) {
          finalBatch += textPiece + " ";
        } else {
          currentInterim += textPiece;
        }
      }

      if (finalBatch) {
        setTranscript((prev) => (prev ? prev + " " + finalBatch : finalBatch).trim());
        setInterimTranscript("");
      } else {
        setInterimTranscript(currentInterim);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setError("Error occurred in recognition: " + event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, autoPunctuation]);

  const toggleListening = () => {
    setError("");
    setMessage("");

    if (!recognitionRef.current) {
      setError("Speech recognition is not initialized.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setMessage("Dictation paused.");
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setMessage("Listening... Start speaking into your microphone.");
      } catch (err) {
        console.error(err);
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  };

  const clearTranscript = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setTranscript("");
    setInterimTranscript("");
    setMessage("");
    setError("");
  };

  const copyToClipboard = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(processedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (fileType) => {
    const textToDownload = processedText;
    if (!textToDownload) return;

    const extension = fileType === "md" ? "md" : "txt";
    const filename = `dictation-notes-${Date.now()}.${extension}`;
    const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(`Successfully downloaded as .${extension}`);
  };

  // Unique Feature: AI Formatter Simulation based on selected mode
  const getProcessedText = () => {
    let text = (transcript + (interimTranscript ? " " + interimTranscript : "")).trim();
    if (!text) return "";

    if (formatMode === "formal") {
      return "Dear Recipient,\n\n" + text.charAt(0).toUpperCase() + text.slice(1) + ".\n\nSincerely,\nProfessional Writer";
    }
    if (formatMode === "bullets") {
      return text.split(/[.!?]+/).filter(Boolean).map(s => "• " + s.trim()).join("\n");
    }
    if (formatMode === "email") {
      return "Subject: Notes from Live Dictation\n\nHi Team,\n\n" + text + "\n\nBest regards,";
    }
    return text;
  };

  const processedText = getProcessedText();
  const wordCount = processedText ? processedText.trim().split(/\s+/).length : 0;
  const charCount = processedText.length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Speech to Text Dictation
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 whitespace-normal leading-relaxed">
              Dictate into your microphone and get live, editable text instantly with zero cost.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface border border-line text-brand text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Live Browser Engine
        </div>
      </div>

      <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          
          {/* MAIN EDITOR & RECORDING PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Controls Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`h-11 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-brand text-surface hover:opacity-90"
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4 shrink-0" /> : <Mic className="w-4 h-4 shrink-0" />}
                    {isListening ? "Stop Recording" : "Start Dictating"}
                  </button>

                  <button
                    type="button"
                    onClick={clearTranscript}
                    className="h-11 px-4 rounded-xl border border-line bg-paper text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider hover:bg-rose-500/10 cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" /> Clear
                  </button>
                </div>

                {/* Live Waveform Indicator */}
                {isListening && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Listening Live...</span>
                  </div>
                )}
              </div>

              {/* Editable Text Workspace */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-muted">
                  <span>Live Transcribed Output</span>
                  <span>{wordCount} words · {charCount} chars</span>
                </div>
                <textarea
                  value={processedText}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Click 'Start Dictating' or type here. Speak clearly into your mic..."
                  className="w-full h-[320px] sm:h-[380px] p-4 border border-line rounded-2xl bg-paper text-ink text-sm font-medium leading-relaxed outline-none resize-none shadow-inner focus:border-brand"
                />
              </div>

            </div>

            {/* Bottom Actions & Stats */}
            <div className="space-y-3 pt-3 border-t border-line">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    disabled={!processedText}
                    className="h-10 px-4 rounded-xl border border-line bg-paper text-ink text-xs font-black uppercase tracking-wider hover:border-brand cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-3.5 h-3.5 text-brand" /> {copied ? "Copied!" : "Copy Text"}
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadFile("txt")}
                    disabled={!processedText}
                    className="h-10 px-4 rounded-xl border border-line bg-paper text-ink text-xs font-black uppercase tracking-wider hover:border-brand cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5 text-brand" /> Save .TXT
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadFile("md")}
                    disabled={!processedText}
                    className="h-10 px-4 rounded-xl border border-line bg-paper text-ink text-xs font-black uppercase tracking-wider hover:border-brand cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand" /> Save .MD
                  </button>
                </div>

                <div className="text-[10px] font-black uppercase tracking-wider text-muted">
                  Est. Reading Time: ~{readingTime} min
                </div>
              </div>

              {message && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
                </div>
              )}
            </div>

          </div>

          {/* ADVANCED SETTINGS & AI REFINER PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-5">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand" /> Dictation Settings
              </h3>
              <p className="text-[10px] text-muted mt-0.5">
                Customize language and smart formatting rules.
              </p>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted block">
                Spoken Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
              >
                <option value="en-US">English (United States)</option>
                <option value="en-GB">English (United Kingdom)</option>
                <option value="ur-PK">Urdu (Pakistan)</option>
                <option value="hi-IN">Hindi (India)</option>
                <option value="es-ES">Spanish (Spain)</option>
                <option value="fr-FR">French (France)</option>
                <option value="de-DE">German (Germany)</option>
                <option value="ar-SA">Arabic (Saudi Arabia)</option>
              </select>
            </div>

            {/* Smart Punctuation Toggle */}
            <div className="space-y-2 pt-2 border-t border-line">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs font-black text-ink block">Voice Punctuation</strong>
                  <span className="text-[10px] text-muted block">Say "full stop", "comma", "new line"</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoPunctuation}
                  onChange={(e) => setAutoPunctuation(e.target.checked)}
                  className="w-4 h-4 accent-brand cursor-pointer"
                />
              </div>
            </div>

            {/* Unique Feature: Instant AI Tone Refiner */}
            <div className="space-y-2 pt-3 border-t border-line">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" /> Format / Rewrite Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "normal", label: "Raw Text" },
                  { id: "formal", label: "Formal Letter" },
                  { id: "bullets", label: "Bullet Points" },
                  { id: "email", label: "Email Draft" }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFormatMode(mode.id)}
                    className={`h-9 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      formatMode === mode.id
                        ? "border-brand bg-brand text-surface"
                        : "border-line bg-paper text-ink hover:border-brand"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-3.5 rounded-xl bg-paper border border-line text-xs text-muted leading-relaxed space-y-1.5 shadow-inner">
              <div className="font-black text-ink uppercase tracking-wider text-[10px]">💡 Pro Dictation Tips</div>
              <p className="text-[10px] leading-normal">
                Speak clearly at a normal conversational pace. Use the formatting options above to instantly restructure messy speech notes into professional templates.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}