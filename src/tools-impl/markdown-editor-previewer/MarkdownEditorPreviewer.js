"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Copy, Download, Trash2, FileText, LayoutTemplate, Bold, Italic, Link as LinkIcon, Code, List, Type, Check, Maximize2, Minimize2, FileDown, Printer } from "lucide-react";

// --- Zero-Dependency Lightweight Markdown Parser ---
const parseMarkdown = (md) => {
  if (!md) return "";
  let html = md;
  
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background:#1e293b; color:#f8fafc; padding:1rem; border-radius:0.5rem; overflow-x:auto; margin:1rem 0; font-family:monospace; font-size:0.875rem;"><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; color:#db2777; padding:0.125rem 0.375rem; border-radius:0.25rem; font-family:monospace; font-size:0.875rem;">$1</code>');
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size:1.25rem; font-weight:bold; margin-top:1.5rem; margin-bottom:0.75rem; color:#1e293b;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size:1.5rem; font-weight:bold; margin-top:2rem; margin-bottom:1rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem; color:#0f172a;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size:1.875rem; font-weight:900; margin-top:2rem; margin-bottom:1.5rem; border-bottom:2px solid #6366f1; padding-bottom:0.5rem; color:#0f172a;">$1</h1>');
  html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left:4px solid #6366f1; padding-left:1rem; padding-top:0.25rem; padding-bottom:0.25rem; font-style:italic; color:#475569; background:#f8fafc; margin:1rem 0;">$1</blockquote>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:bold; color:#0f172a;">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em style="font-style:italic;">$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#4f46e5; text-decoration:none; font-weight:500;" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li style="margin-left:1.5rem; list-style-type:disc; margin-top:0.25rem; margin-bottom:0.25rem;">$1</li>');
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%; height:auto; border-radius:0.5rem; margin:1rem 0; box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);" />');
  
  return html;
};

const TEMPLATES = {
  blank: "",
  professional: `# Project Apollo 🚀\n\nApollo is an enterprise-level framework designed for speed, reliability, and seamless developer experience.\n\n## ✨ Core Features\n\n* **Zero-Dependency Architecture:** No bloated ` + `node_modules` + `.\n* **Lightning Fast:** Optimized rendering pipeline.\n* **Enterprise Ready:** Built for scalability.\n\n## 📦 Installation Guide\n\nGetting started is incredibly simple. Run the following command in your terminal:\n\n\`\`\`bash\nnpm install @apollo/core --save\nnpm run start:dev\n\`\`\`\n\n## 💡 Usage Example\n\n> "Simplicity is the ultimate sophistication." - Leonardo da Vinci\n\nOnce installed, you can initialize the core module:\n\n\`\`\`javascript\nimport { ApolloCore } from '@apollo/core';\n\nconst app = new ApolloCore({\n  debugMode: true,\n  port: 8080\n});\n\napp.launch();\n\`\`\`\n\n## 🔗 Important Links\n* [Read the Documentation](https://example.com)\n* [Join our Discord Community](https://example.com)\n\n![Developer Desk](https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80)`
};

const MarkdownEditorPreviewer = () => {
  const [markdown, setMarkdown] = useState(TEMPLATES.professional);
  const [viewMode, setViewMode] = useState("split"); // 'split', 'edit', 'preview'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedState, setCopiedState] = useState(null);
  
  const textareaRef = useRef(null);

  const { htmlContent, stats } = useMemo(() => {
    const html = parseMarkdown(markdown);
    const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    return { htmlContent: html, stats: { words, readingTime } };
  }, [markdown]);

  const insertText = (before, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedState('md');
      setTimeout(() => setCopiedState(null), 2000);
    } catch (err) {}
  };

  const downloadMD = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `document-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadDocx = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + htmlContent + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `document-${Date.now()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    // Triggers browser print which allows saving as PDF beautifully
    window.print();
  };

  // Keyboard shortcut for exiting full screen
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 print:m-0 print:p-0">
      
      {/* Top Utility Bar - Hides when printing */}
      <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm gap-4 print:hidden">
        
        <div className="flex items-center gap-3">
          <LayoutTemplate className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 hidden sm:block">Templates</span>
          <select
            onChange={(e) => setMarkdown(TEMPLATES[e.target.value])}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
          >
            <option value="professional">Enterprise README</option>
            <option value="blank">Blank File</option>
          </select>
        </div>

        {/* View Toggles (Now perfectly controls the grid) */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button onClick={() => setViewMode("edit")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === 'edit' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Edit</button>
          <button onClick={() => setViewMode("split")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === 'split' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Split</button>
          <button onClick={() => setViewMode("preview")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === 'preview' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Preview</button>
        </div>

        {/* Advanced Exports */}
        <div className="flex gap-2">
          <button onClick={downloadDocx} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900/40 rounded-lg transition-colors" title="Download as MS Word">
            <FileDown className="w-3.5 h-3.5" /> Word
          </button>
          <button onClick={downloadPdf} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/40 rounded-lg transition-colors" title="Save as PDF">
            <Printer className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={downloadMD} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" /> .MD
          </button>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className={`grid gap-6 min-h-[600px] h-[70vh] print:h-auto print:block ${
        viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        
        {/* LEFT: Editor Panel */}
        <div className={`flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm print:hidden ${
          viewMode === 'preview' ? 'hidden' : 'flex'
        }`}>
          <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 flex flex-wrap gap-1 items-center">
            <button onClick={() => insertText("**", "**")} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded"><Bold className="w-4 h-4" /></button>
            <button onClick={() => insertText("*", "*")} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded"><Italic className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <button onClick={() => insertText("### ")} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded text-sm font-bold font-serif">H3</button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <button onClick={() => insertText("[", "](url)")} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded"><LinkIcon className="w-4 h-4" /></button>
            <button onClick={() => insertText("`", "`")} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded"><Code className="w-4 h-4" /></button>
            <button onClick={() => insertText("```\n", "\n```")} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded"><FileText className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <button onClick={() => insertText("- ")} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded"><List className="w-4 h-4" /></button>
            
            <div className="ml-auto flex items-center gap-1">
              <button onClick={handleCopy} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded" title="Copy Raw MD">
                {copiedState === 'md' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={() => setMarkdown("")} className="p-1.5 text-slate-400 hover:text-red-600 rounded" title="Clear All"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Start writing markdown here..."
            className="w-full flex-grow p-6 bg-transparent text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-0"
            spellCheck="false"
          />
          
          <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex justify-between">
            <div className="flex gap-4">
              <span>{stats.words} Words</span>
              <span>{markdown.length} Chars</span>
            </div>
            <span>~{stats.readingTime} min read</span>
          </div>
        </div>

        {/* RIGHT: Live Preview Panel */}
        <div className={`flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm print:border-none print:shadow-none print:bg-transparent ${
          viewMode === 'edit' ? 'hidden' : 'flex'
        } ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl transition-all border-indigo-500 ring-4 ring-indigo-500/20 print:relative print:inset-auto print:ring-0' : ''}`}>
          
          <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              <Type className="w-4 h-4" /> Live Render Preview
            </div>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-300 dark:bg-indigo-900/40 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              {isFullscreen ? "Exit Full-Screen" : "Full-Screen"}
            </button>
          </div>
          
          <div className="flex-grow p-8 overflow-y-auto bg-[#fdfdfd] dark:bg-[#0d1117] print:p-0 print:bg-white print:text-black">
            {markdown.trim() ? (
              <div 
                className="whitespace-pre-wrap font-sans text-base leading-relaxed text-slate-800 dark:text-slate-300 print:text-black"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 italic space-y-2 opacity-50 print:hidden">
                <FileText className="w-12 h-12" />
                <p>Preview will appear here</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarkdownEditorPreviewer;