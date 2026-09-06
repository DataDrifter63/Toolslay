"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Copy, Check, Settings2, RefreshCw, Download } from "lucide-react";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed",
  "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua",
  "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris",
  "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in",
  "reprehenderit", "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur",
  "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

const LoremIpsumGenerator = () => {
  const [count, setCount] = useState(3);
  const [type, setType] = useState("paragraphs"); // paragraphs, sentences, words
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [format, setFormat] = useState("plain"); // plain, html
  const [generatedText, setGeneratedText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const getRandomWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

  const generateSentence = (wordCount = 0) => {
    const length = wordCount || Math.floor(Math.random() * 8) + 8; // 8 to 15 words
    let sentence = [];
    for (let i = 0; i < length; i++) {
      sentence.push(getRandomWord());
    }
    sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
    return sentence.join(" ") + ".";
  };

  const generateParagraph = (sentenceCount = 0) => {
    const length = sentenceCount || Math.floor(Math.random() * 4) + 4; // 4 to 7 sentences
    let paragraph = [];
    for (let i = 0; i < length; i++) {
      paragraph.push(generateSentence());
    }
    return paragraph.join(" ");
  };

  const handleGenerate = useCallback(() => {
    let output = [];
    const safeCount = Math.min(Math.max(1, count), 1000); // Max limit for safety

    if (type === "words") {
      for (let i = 0; i < safeCount; i++) {
        output.push(getRandomWord());
      }
      if (startWithLorem && safeCount >= 5) {
        output.splice(0, 5, "Lorem", "ipsum", "dolor", "sit", "amet");
      }
      setGeneratedText(output.join(" "));
      return;
    }

    if (type === "sentences") {
      for (let i = 0; i < safeCount; i++) {
        output.push(generateSentence());
      }
      let text = output.join(" ");
      if (startWithLorem) {
        text = text.replace(/^[^.]+/, "Lorem ipsum dolor sit amet, consectetur adipiscing elit");
      }
      setGeneratedText(text);
      return;
    }

    if (type === "paragraphs") {
      for (let i = 0; i < safeCount; i++) {
        let para = generateParagraph();
        if (i === 0 && startWithLorem) {
          para = para.replace(/^[^.]+/, "Lorem ipsum dolor sit amet, consectetur adipiscing elit");
        }
        output.push(para);
      }
      
      if (format === "html") {
        setGeneratedText(output.map(p => `<p>${p}</p>`).join("\n\n"));
      } else {
        setGeneratedText(output.join("\n\n"));
      }
    }
  }, [count, type, startWithLorem, format]);

  // Initial load
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    const ext = format === "html" ? "html" : "txt";
    const blob = new Blob([generatedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lorem-ipsum-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Settings Sidebar */}
      <div className="lg:col-span-4 space-y-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
          <Settings2 className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Generator Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Generate
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>

          {type === "paragraphs" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200"
              >
                <option value="plain">Plain Text</option>
                <option value="html">HTML Tags (&lt;p&gt;)</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Start with "Lorem ipsum dolor sit amet..."
              </span>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Generate Text
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div className="lg:col-span-8 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-slate-700 dark:text-slate-200">
            Generated Text
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {isCopied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
        <textarea
          readOnly
          value={generatedText}
          className="w-full flex-grow min-h-[400px] p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default LoremIpsumGenerator;