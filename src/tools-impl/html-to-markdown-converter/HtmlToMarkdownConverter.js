"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText, FileCode2, Copy, CheckCircle2, 
  Trash2, Link2, Sparkles, Activity,
  Braces, Code2, AlertCircle
} from "lucide-react";

export default function HtmlToMarkdownConverter() {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [htmlInput, setHtmlInput] = useState(
`<h1>Muxair Conversion Engine</h1>
<p>Welcome to the <b>premium</b> HTML to Markdown compiler.</p>

<div class="wrapper-junk">
  <span>Check out our <a href="https://muxair.com">official website</a> for more tools!</span>
</div>

<h2>Supported Elements</h2>
<ul>
  <li>Headers and Paragraphs</li>
  <li><i>Italics</i> and <strong>Bold</strong> text</li>
  <li>Complex <a href="#tables">Data Tables</a></li>
</ul>

<blockquote>
  <p>The best tool for stripping out garbage CSS/JS tags!</p>
</blockquote>`
  );
  
  const [useReferenceLinks, setUseReferenceLinks] = useState(false); // [text](url) vs [text][1]
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- CORE HTML TO MARKDOWN ENGINE (Custom DOM Crawler) ---
  const convertToMarkdown = (htmlString, useRefLinks) => {
    if (!htmlString || typeof window === 'undefined') return "";
    
    // Create a temporary DOM element to parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    let linksMap = [];
    
    function processNode(node) {
      if (node.nodeType === 3) { // Text Node
        let text = node.textContent;
        // Only trim excessive spaces if it's not inside a pre/code block (handled separately)
        if (node.parentNode && node.parentNode.tagName !== 'PRE' && node.parentNode.tagName !== 'CODE') {
           text = text.replace(/\s+/g, ' ');
        }
        return text;
      }
      
      if (node.nodeType !== 1) return ''; // Element Node

      let markdown = '';
      const tag = node.tagName.toLowerCase();
      
      // Process children recursively
      let childrenText = '';
      node.childNodes.forEach(child => {
        childrenText += processNode(child);
      });

      // Avoid rendering empty structural tags if they have no text
      if (childrenText.trim() === '' && !['hr', 'br', 'img'].includes(tag)) {
        return '';
      }

      switch (tag) {
        // Headers
        case 'h1': return `\n# ${childrenText.trim()}\n\n`;
        case 'h2': return `\n## ${childrenText.trim()}\n\n`;
        case 'h3': return `\n### ${childrenText.trim()}\n\n`;
        case 'h4': return `\n#### ${childrenText.trim()}\n\n`;
        case 'h5': return `\n##### ${childrenText.trim()}\n\n`;
        case 'h6': return `\n###### ${childrenText.trim()}\n\n`;
        
        // Paragraphs & Breaks
        case 'p': return `\n${childrenText.trim()}\n\n`;
        case 'br': return `  \n`;
        case 'hr': return `\n---\n\n`;
        
        // Emphasis
        case 'strong':
        case 'b': return `**${childrenText.trim()}**`;
        case 'em':
        case 'i': return `*${childrenText.trim()}*`;
        case 'del':
        case 's': return `~~${childrenText.trim()}~~`;
        
        // Links
        case 'a':
          const href = node.getAttribute('href') || '#';
          if (useRefLinks) {
            linksMap.push(href);
            return `[${childrenText.trim()}][${linksMap.length}]`;
          }
          return `[${childrenText.trim()}](${href})`;
          
        // Images
        case 'img':
          const src = node.getAttribute('src') || '';
          const alt = node.getAttribute('alt') || '';
          return `![${alt}](${src})`;
          
        // Code Blocks
        case 'pre':
          // Extract language from inner <code> if it has class="language-js"
          let lang = '';
          const codeNode = node.querySelector('code');
          if (codeNode && codeNode.className) {
            const match = codeNode.className.match(/language-(\w+)/);
            if (match) lang = match[1];
          }
          const preText = codeNode ? codeNode.textContent : node.textContent;
          return `\n\`\`\`${lang}\n${preText}\n\`\`\`\n\n`;
        case 'code':
          // If code is not inside a pre, it's inline
          if (node.parentNode && node.parentNode.tagName === 'PRE') return childrenText;
          return `\`${childrenText.trim()}\``;
          
        // Blockquotes
        case 'blockquote':
          const quotedLines = childrenText.trim().split('\n').map(line => `> ${line}`).join('\n');
          return `\n${quotedLines}\n\n`;
          
        // Lists
        case 'ul':
        case 'ol':
          return `\n${childrenText}\n`;
        case 'li':
          const isOrdered = node.parentNode && node.parentNode.tagName === 'OL';
          // Calculate depth based on parent ul/ol tags
          let depth = -1;
          let current = node;
          while (current) {
            if (current.tagName === 'UL' || current.tagName === 'OL') depth++;
            current = current.parentNode;
          }
          const indent = '  '.repeat(Math.max(0, depth));
          const marker = isOrdered ? '1.' : '-';
          return `${indent}${marker} ${childrenText.trim()}\n`;

        // GitHub Flavored Tables (Killer Feature)
        case 'table':
          let tableMd = '\n';
          const rows = Array.from(node.querySelectorAll('tr'));
          if (rows.length === 0) return '';
          
          rows.forEach((row, rowIndex) => {
            let rowText = '|';
            const cells = Array.from(row.querySelectorAll('th, td'));
            cells.forEach(cell => {
              rowText += ` ${cell.textContent.trim()} |`;
            });
            tableMd += `${rowText}\n`;
            
            // Add markdown separator after header row
            if (rowIndex === 0) {
               let sep = '|';
               cells.forEach(() => sep += ' --- |');
               tableMd += `${sep}\n`;
            }
          });
          return `${tableMd}\n`;

        // Structural Garbage Tags (Skip tag, just return content)
        case 'div':
        case 'span':
        case 'section':
        case 'article':
        case 'main':
        case 'header':
        case 'footer':
          return childrenText;
          
        // Ignore Non-Content Tags
        case 'script':
        case 'style':
        case 'noscript':
        case 'meta':
        case 'link':
          return '';

        default:
          return childrenText;
      }
    }

    let finalMarkdown = processNode(doc.body);

    // Clean up excessive newlines generated by recursion
    finalMarkdown = finalMarkdown.replace(/\n{3,}/g, '\n\n').trim();

    // Append Reference Links at the bottom if enabled
    if (useRefLinks && linksMap.length > 0) {
      finalMarkdown += '\n\n';
      linksMap.forEach((link, idx) => {
        finalMarkdown += `[${idx + 1}]: ${link}\n`;
      });
    }

    return finalMarkdown;
  };

  const results = useMemo(() => {
    return convertToMarkdown(htmlInput, useReferenceLinks);
  }, [htmlInput, useReferenceLinks]);

  const handleCopy = () => {
    navigator.clipboard.writeText(results);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  // Premium Violet/Fuchsia Theme
  const theme = {
    gradient: "from-violet-200 via-fuchsia-100 to-transparent dark:from-violet-900/30 dark:via-fuchsia-900/20",
    bgIcon: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    textPri: "text-violet-600 dark:text-violet-400",
    textSec: "text-fuchsia-600 dark:text-fuchsia-400",
    borderLight: "border-violet-200 dark:border-violet-800/50",
    bgLight: "bg-violet-50 dark:bg-violet-900/20"
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Premium Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 px-6 py-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500 font-sans`}>
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${theme.gradient} rounded-bl-full -z-10 opacity-70`}></div>
        <div className="flex items-center gap-4">
          <div className={`${theme.bgIcon} p-3.5 rounded-2xl shadow-md`}>
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              HTML to Markdown Compiler
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              Deep DOM Sanitizer & Formatting Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr] gap-6 items-start">
        
        {/* ================= LEFT: HTML INPUT ENGINE ================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
            
            {/* 1. Feature Toggles */}
            <div className="space-y-4 font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Sparkles className={`w-3.5 h-3.5 ${theme.textPri}`} /> 1. Compiler Settings
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Garbage Collector Indicator (Always ON) */}
                <div className={`flex flex-col p-4 rounded-xl border ${theme.borderLight} ${theme.bgLight} transition-colors duration-500`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${theme.textPri}`}>
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded shadow-sm border border-emerald-100 dark:border-emerald-800">Enabled</span>
                  </div>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100 font-sans">Garbage Sanitizer</span>
                  <span className="text-[9px] font-bold text-slate-500 block leading-snug mt-1 font-sans">Auto-removes scripts, styles, spans, and useless divs.</span>
                </div>

                {/* Reference Links Toggle */}
                <div className={`flex flex-col p-4 rounded-xl border ${useReferenceLinks ? theme.borderLight + " " + theme.bgLight : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"} transition-colors duration-500`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${useReferenceLinks ? `bg-white dark:bg-slate-800 shadow-sm ${theme.textSec}` : "text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}>
                      <Link2 className="w-4 h-4" />
                    </div>
                    <button onClick={() => setUseReferenceLinks(!useReferenceLinks)} className={`w-10 h-5 rounded-full transition-colors relative p-1 shadow-inner ${useReferenceLinks ? `bg-gradient-to-r ${theme.gradient.split(' ').slice(0, 2).join(' ')}` : "bg-slate-300 dark:bg-slate-700"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${useReferenceLinks ? "translate-x-5" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100 font-sans">Reference Links</span>
                  <span className="text-[9px] font-bold text-slate-500 block leading-snug mt-1 font-sans">Moves long URLs to the bottom of the file.</span>
                </div>

              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. HTML Input */}
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <FileCode2 className={`w-3.5 h-3.5 ${theme.textPri}`} /> 2. Raw HTML Source
                </h3>
              </div>
              
              <div className={`relative flex flex-col bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all overflow-hidden group shadow-inner`}>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-700/50 font-sans shrink-0">
                   <Code2 className="w-3.5 h-3.5 text-slate-400" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Paste code here</span>
                </div>
                <textarea
                  value={htmlInput} 
                  onChange={(e) => setHtmlInput(e.target.value)}
                  placeholder="<div><p>Hello World</p></div>"
                  rows="14"
                  className="w-full bg-transparent px-5 py-4 text-xs font-mono text-slate-800 dark:text-slate-300 outline-none resize-none custom-scrollbar whitespace-pre"
                  spellCheck="false"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT: THE MARKDOWN OUTPUT ================= */}
        <div className="space-y-6 sticky top-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-1 rounded-3xl shadow-lg relative flex flex-col min-h-[680px]">
            <div className="bg-slate-50 dark:bg-[#161b22] rounded-[22px] p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 shrink-0 font-sans">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
                  <Activity className={`w-4 h-4 ${theme.textPri}`} /> Compiled Output
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.textPri} bg-white dark:bg-[#0d1117] px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700`}>
                  Markdown (.MD)
                </span>
              </div>

              {/* Data Notice */}
              {results && (
                <div className="flex items-start gap-2 p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl mb-4 shadow-sm shrink-0 font-sans">
                  <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                    Invisible structure tags (`&lt;div&gt;`, `&lt;span&gt;`) and active scripts have been stripped. Tables and nested lists are fully formatted.
                  </p>
                </div>
              )}

              {/* The Actual Output Area */}
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0d1117] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                
                <div className="flex justify-between items-center px-4 py-3 bg-slate-100/50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800 font-sans shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <Braces className="w-3.5 h-3.5" /> Resulting Markdown
                  </span>
                  
                  <button 
                    onClick={handleCopy} 
                    disabled={!results}
                    className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                      copied ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    }`}
                  >
                    {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy Markdown</>}
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                  {!results ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans">
                      <FileText className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest text-center">
                        Awaiting HTML Data
                      </span>
                    </div>
                  ) : (
                    <pre className="text-[13px] break-all text-slate-800 dark:text-slate-300 leading-relaxed font-mono m-0 whitespace-pre-wrap">
                      <code>{results}</code>
                    </pre>
                  )}
                </div>

              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}