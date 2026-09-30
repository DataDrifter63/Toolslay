"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText, FileCode2, Copy, CheckCircle2, 
  Trash2, Link2, Sparkles, Activity,
  Braces, Code2, AlertCircle, Eye, LayoutTemplate
} from "lucide-react";

export default function HtmlToMarkdownConverter() {
  const [isMounted, setIsMounted] = useState(false);

  const [htmlInput, setHtmlInput] = useState(
`<h2>Muxair Conversion Engine</h2>
<p>Welcome to the <b>premium</b> HTML to Markdown compiler.</p>

<div class="wrapper-junk" style="color: red;">
  <span>Check out our <a href="https://muxair.com">official website</a> for more tools!</span>
  <script>alert('malicious');</script>
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
  
  const [useReferenceLinks, setUseReferenceLinks] = useState(false);
  const [viewMode, setViewMode] = useState("split"); // 'split' or 'preview'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const convertToMarkdown = (htmlString, useRefLinks) => {
    if (!htmlString || typeof window === 'undefined') return "";
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // --- ADVANCED GARBAGE SANITIZER ---
    const garbageTags = ['script', 'style', 'noscript', 'meta', 'link', 'object', 'embed', 'iframe'];
    garbageTags.forEach(tag => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });

    let linksMap = [];
    
    function processNode(node) {
      if (node.nodeType === 3) {
        let text = node.textContent;
        if (node.parentNode && !['PRE', 'CODE'].includes(node.parentNode.tagName)) {
           text = text.replace(/\s+/g, ' ');
        }
        return text;
      }
      
      if (node.nodeType !== 1) return '';

      const tag = node.tagName.toLowerCase();
      
      let childrenText = '';
      node.childNodes.forEach(child => {
        childrenText += processNode(child);
      });

      if (childrenText.trim() === '' && !['hr', 'br', 'img'].includes(tag)) {
        return '';
      }

      switch (tag) {
        case 'h1': return `\n# ${childrenText.trim()}\n\n`;
        case 'h2': return `\n## ${childrenText.trim()}\n\n`;
        case 'h3': return `\n### ${childrenText.trim()}\n\n`;
        case 'h4': return `\n#### ${childrenText.trim()}\n\n`;
        case 'h5': return `\n##### ${childrenText.trim()}\n\n`;
        case 'h6': return `\n###### ${childrenText.trim()}\n\n`;
        
        case 'p': return `\n${childrenText.trim()}\n\n`;
        case 'br': return `  \n`;
        case 'hr': return `\n---\n\n`;
        
        case 'strong':
        case 'b': return `**${childrenText.trim()}**`;
        case 'em':
        case 'i': return `*${childrenText.trim()}*`;
        case 'del':
        case 's': return `~~${childrenText.trim()}~~`;
        
        case 'a':
          const href = node.getAttribute('href') || '#';
          if (useRefLinks) {
            linksMap.push(href);
            return `[${childrenText.trim()}][${linksMap.length}]`;
          }
          return `[${childrenText.trim()}](${href})`;
          
        case 'img':
          const src = node.getAttribute('src') || '';
          const alt = node.getAttribute('alt') || '';
          return `![${alt}](${src})`;
          
        case 'pre':
          let lang = '';
          const codeNode = node.querySelector('code');
          if (codeNode && codeNode.className) {
            const match = codeNode.className.match(/language-(\w+)/);
            if (match) lang = match[1];
          }
          const preText = codeNode ? codeNode.textContent : node.textContent;
          return `\n\`\`\`${lang}\n${preText}\n\`\`\`\n\n`;
        case 'code':
          if (node.parentNode && node.parentNode.tagName === 'PRE') return childrenText;
          return `\`${childrenText.trim()}\``;
          
        case 'blockquote':
          const quotedLines = childrenText.trim().split('\n').map(line => `> ${line}`).join('\n');
          return `\n${quotedLines}\n\n`;
          
        case 'ul':
        case 'ol':
          return `\n${childrenText}\n`;
        case 'li':
          const isOrdered = node.parentNode && node.parentNode.tagName === 'OL';
          let depth = -1;
          let current = node;
          while (current) {
            if (current.tagName === 'UL' || current.tagName === 'OL') depth++;
            current = current.parentNode;
          }
          const indent = '  '.repeat(Math.max(0, depth));
          const marker = isOrdered ? '1.' : '-';
          return `${indent}${marker} ${childrenText.trim()}\n`;

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
            
            if (rowIndex === 0) {
               let sep = '|';
               cells.forEach(() => sep += ' --- |');
               tableMd += `${sep}\n`;
            }
          });
          return `${tableMd}\n`;

        case 'div':
        case 'span':
        case 'section':
        case 'article':
        case 'main':
        case 'header':
        case 'footer':
          return childrenText;

        default:
          return childrenText;
      }
    }

    let finalMarkdown = processNode(doc.body);
    finalMarkdown = finalMarkdown.replace(/\n{3,}/g, '\n\n').trim();

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

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative box-border font-mono">
      
      {/* COMPACT SLEEK HEADER BAR */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full box-border font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
              HTML to Markdown Compiler
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-muted truncate">
              Deep DOM sanitizer & formatting engine.
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex bg-surface rounded-xl p-1 border border-line shrink-0">
          <button 
            type="button"
            onClick={() => setViewMode("split")}
            className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'split' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" /> Split Workspace
          </button>
          <button 
            type="button"
            onClick={() => setViewMode("preview")}
            className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${viewMode === 'preview' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            <Eye className="w-3.5 h-3.5" /> Full Output Preview
          </button>
        </div>
      </div>

      {/* WORKSPACE LAYOUT */}
      <div className={`grid grid-cols-1 ${viewMode === 'split' ? 'lg:grid-cols-[1fr_1fr]' : 'lg:grid-cols-1'} gap-4 sm:gap-6 items-start w-full transition-all duration-300`}>
        
        {/* LEFT: HTML INPUT ENGINE (Hidden in Full Preview Mode) */}
        {viewMode === 'split' && (
          <div className="space-y-4 sm:space-y-6 min-w-0">
            <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border">
              
              {/* Settings Controls */}
              <div className="space-y-2 font-sans">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5 border-b border-line pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand" /> Compiler Configuration
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col p-3 rounded-xl border border-brand/30 bg-brand/10">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="p-1.5 rounded-lg bg-surface border border-line text-brand shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">Active</span>
                    </div>
                    <span className="block text-xs font-black text-ink uppercase tracking-wider">Garbage Sanitizer</span>
                    <span className="text-[9px] font-bold text-muted block mt-0.5">Strips scripts, styles & useless elements.</span>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-muted">Link Format</span>
                    <div className="flex bg-surface rounded-xl p-1 border border-line h-[46px]">
                      <button 
                        type="button"
                        onClick={() => setUseReferenceLinks(false)}
                        className={`flex-1 text-[10px] font-black uppercase tracking-wider py-1 rounded-lg transition-all ${!useReferenceLinks ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                      >
                        Inline
                      </button>
                      <button 
                        type="button"
                        onClick={() => setUseReferenceLinks(true)}
                        className={`flex-1 text-[10px] font-black uppercase tracking-wider py-1 rounded-lg transition-all ${useReferenceLinks ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
                      >
                        Reference
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-line" />

              {/* Raw HTML Source */}
              <div className="space-y-2 font-sans">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-brand" /> Raw HTML Source
                  </h3>
                </div>
                
                <div className="bg-surface border border-line rounded-xl overflow-hidden focus-within:border-brand transition-all w-full">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border-b border-line">
                     <Code2 className="w-3.5 h-3.5 text-muted" />
                     <span className="text-[9px] font-black uppercase tracking-wider text-muted">Paste code here</span>
                  </div>
                  <textarea
                    value={htmlInput} 
                    onChange={(e) => setHtmlInput(e.target.value)}
                    placeholder="<div><p>Hello World</p></div>"
                    rows="12"
                    className="w-full bg-surface px-4 py-3 text-xs sm:text-sm font-mono text-ink outline-none resize-none custom-scrollbar whitespace-pre tabular-nums"
                    spellCheck="false"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* RIGHT: THE MARKDOWN OUTPUT (Expands fully when in Full Preview Mode) */}
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="bg-paper border border-line p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 w-full box-border">
            
            <div className="flex items-center justify-between border-b border-line pb-3 font-sans">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink">
                <Activity className="w-4 h-4 text-brand" /> Compiled Output
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-xl border border-brand/30">
                Markdown (.MD)
              </span>
            </div>

            {results && (
              <div className="flex items-start gap-2 p-3 bg-surface border border-line rounded-xl shadow-sm font-sans">
                <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-muted leading-relaxed">
                  Garbage sanitizer successfully removed unwanted tags, styles, and scripts.
                </p>
              </div>
            )}

            {/* The Actual Output Area */}
            <div className="flex flex-col bg-surface border border-line rounded-xl shadow-sm overflow-hidden w-full">
              
              <div className="flex justify-between items-center px-3.5 py-2.5 bg-surface border-b border-line font-sans">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Braces className="w-3.5 h-3.5" /> Resulting Markdown
                </span>
                
                <button 
                  type="button"
                  onClick={handleCopy} 
                  disabled={!results}
                  className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                    copied ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-surface text-muted border-line hover:text-ink disabled:opacity-50"
                  }`}
                >
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy Markdown</>}
                </button>
              </div>

              <div className={`p-4 ${viewMode === 'preview' ? 'max-h-[500px]' : 'max-h-[380px]'} overflow-y-auto custom-scrollbar`}>
                {!results ? (
                  <div className="h-32 flex flex-col items-center justify-center text-muted font-sans">
                    <FileText className="w-8 h-8 mb-2 opacity-30" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-center">
                      Awaiting HTML Data
                    </span>
                  </div>
                ) : (
                  <pre className="text-xs sm:text-sm break-all text-ink leading-relaxed font-mono m-0 whitespace-pre-wrap tabular-nums">
                    <code>{results}</code>
                  </pre>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}