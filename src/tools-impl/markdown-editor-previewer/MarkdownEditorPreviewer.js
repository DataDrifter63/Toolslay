"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  Check,
  Code,
  Copy,
  Download,
  FileDown,
  FileText,
  Italic,
  LayoutTemplate,
  Link as LinkIcon,
  List,
  Maximize2,
  Minimize2,
  Printer,
  Trash2,
  Type,
} from "lucide-react";

// --- Zero-Dependency Lightweight Markdown Parser ---
const parseMarkdown = (md) => {
  if (!md) return "";
  let html = md;

  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre style="background:#1e293b; color:#f8fafc; padding:1rem; border-radius:0.5rem; overflow-x:auto; margin:1rem 0; font-family:monospace; font-size:0.875rem;"><code>$1</code></pre>'
  );
  html = html.replace(
    /`([^`]+)`/g,
    '<code style="background:#f1f5f9; color:#db2777; padding:0.125rem 0.375rem; border-radius:0.25rem; font-family:monospace; font-size:0.875rem;">$1</code>'
  );
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 style="font-size:1.25rem; font-weight:bold; margin-top:1.5rem; margin-bottom:0.75rem; color:#1e293b;">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 style="font-size:1.5rem; font-weight:bold; margin-top:2rem; margin-bottom:1rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.5rem; color:#0f172a;">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 style="font-size:1.875rem; font-weight:900; margin-top:2rem; margin-bottom:1.5rem; border-bottom:2px solid #6366f1; padding-bottom:0.5rem; color:#0f172a;">$1</h1>'
  );
  html = html.replace(
    /^\> (.*$)/gim,
    '<blockquote style="border-left:4px solid #6366f1; padding-left:1rem; padding-top:0.25rem; padding-bottom:0.25rem; font-style:italic; color:#475569; background:#f8fafc; margin:1rem 0;">$1</blockquote>'
  );
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong style="font-weight:bold; color:#0f172a;">$1</strong>'
  );
  html = html.replace(/\*([^*]+)\*/g, '<em style="font-style:italic;">$1</em>');
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" style="color:#4f46e5; text-decoration:none; font-weight:500;" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  html = html.replace(
    /^\s*[-*]\s+(.*)$/gim,
    '<li style="margin-left:1.5rem; list-style-type:disc; margin-top:0.25rem; margin-bottom:0.25rem;">$1</li>'
  );
  html = html.replace(
    /!\[([^\]]+)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%; height:auto; border-radius:0.5rem; margin:1rem 0; box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);" />'
  );

  return html;
};

const TEMPLATES = {
  blank: "",
  professional: `# Project Apollo 🚀\n\nApollo is an enterprise-level framework designed for speed, reliability, and seamless developer experience.\n\n## ✨ Core Features\n\n* **Zero-Dependency Architecture:** No bloated ` +
    "node_modules" +
    `.\n* **Lightning Fast:** Optimized rendering pipeline.\n* **Enterprise Ready:** Built for scalability.\n\n## 📦 Installation Guide\n\nGetting started is incredibly simple. Run the following command in your terminal:\n\n\`\`\`bash\nnpm install @apollo/core --save\nnpm run start:dev\n\`\`\`\n\n## 💡 Usage Example\n\n> "Simplicity is the ultimate sophistication." - Leonardo da Vinci\n\nOnce installed, you can initialize the core module:\n\n\`\`\`javascript\nimport { ApolloCore } from '@apollo/core';\n\nconst app = new ApolloCore({\n  debugMode: true,\n  port: 8080\n});\n\napp.launch();\n\`\`\`\n\n## 🔗 Important Links\n* [Read the Documentation](https://example.com)\n* [Join our Discord Community](https://example.com)\n\n![Developer Desk](https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80)`,
};

export default function MarkdownEditorPreviewer() {
  const [markdown, setMarkdown] = useState(TEMPLATES.professional);
  const [viewMode, setViewMode] = useState("split"); // 'split', 'edit', 'preview'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false); // Mobile & Desktop Editor Fullscreen
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

    const newText =
      text.substring(0, start) + before + selected + after + text.substring(end);
    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedState("md");
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
    const header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + htmlContent + footer;

    const blob = new Blob(["\ufeff", sourceHTML], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `document-${Date.now()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    window.print();
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
        setIsEditorFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative print:m-0 print:p-0">
      
      {/* CARD CONTAINER */}
      <div className="bg-surface border border-line p-4 sm:p-8 rounded-2xl shadow-card space-y-6 min-w-0 print:border-none print:shadow-none print:p-0">
        
        {/* Top Utility Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 min-w-0 print:hidden">
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand/10 text-brand shrink-0">
              <LayoutTemplate className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-xs text-ink uppercase tracking-wider hidden sm:block">Templates</span>
              <select
                onChange={(e) => setMarkdown(TEMPLATES[e.target.value])}
                className="px-3 py-2 bg-paper border border-line rounded-xl text-xs font-bold text-ink outline-none cursor-pointer"
              >
                <option value="professional">Enterprise README</option>
                <option value="blank">Blank File</option>
              </select>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex items-center bg-paper border border-line p-1 rounded-xl gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'edit' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'split' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'preview' ? 'bg-brand text-surface shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              Preview
            </button>
          </div>

          {/* Advanced Exports */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={downloadDocx}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-paper text-blue-600 hover:bg-surface text-xs font-black uppercase tracking-wider transition-all"
              title="Download as MS Word"
            >
              <FileDown className="w-3.5 h-3.5" /> Word
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-paper text-[#fb7185] hover:bg-surface text-xs font-black uppercase tracking-wider transition-all"
              title="Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              type="button"
              onClick={downloadMD}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-paper text-ink hover:bg-surface text-xs font-black uppercase tracking-wider transition-all"
            >
              <Download className="w-3.5 h-3.5" /> .MD
            </button>
          </div>
        </div>

        {/* Editor & Preview Workspace */}
        <div className={`grid gap-6 min-h-[500px] sm:min-h-[600px] h-[75vh] sm:h-[70vh] print:h-auto print:block ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}>
          
          {/* LEFT: Editor Panel */}
          <div className={`bg-paper border border-line rounded-2xl overflow-hidden flex flex-col min-w-0 print:hidden ${
            viewMode === 'preview' ? 'hidden' : 'flex'
          } ${isEditorFullscreen ? 'fixed inset-3 sm:inset-4 z-50 shadow-2xl transition-all border-brand ring-4 ring-brand/20 h-auto' : ''}`}>
            
            <div className="bg-surface border-b border-line p-2.5 flex flex-wrap gap-1 items-center min-w-0">
              <button type="button" onClick={() => insertText("**", "**")} className="p-2 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors"><Bold className="w-4 h-4" /></button>
              <button type="button" onClick={() => insertText("*", "*")} className="p-2 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors"><Italic className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-line mx-1"></div>
              <button type="button" onClick={() => insertText("### ")} className="px-2 py-1 text-muted hover:text-brand hover:bg-paper rounded-xl text-xs font-black transition-colors">H3</button>
              <div className="w-px h-4 bg-line mx-1"></div>
              <button type="button" onClick={() => insertText("[", "](url)")} className="p-2 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors"><LinkIcon className="w-4 h-4" /></button>
              <button type="button" onClick={() => insertText("`", "`")} className="p-2 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors"><Code className="w-4 h-4" /></button>
              <button type="button" onClick={() => insertText("```\n", "\n```")} className="p-2 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors"><FileText className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-line mx-1"></div>
              <button type="button" onClick={() => insertText("- ")} className="p-2 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors"><List className="w-4 h-4" /></button>
              
              <div className="ml-auto flex items-center gap-1.5">
                {/* Editor Fullscreen Button */}
                <button 
                  type="button"
                  onClick={() => setIsEditorFullscreen(!isEditorFullscreen)} 
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-line bg-surface text-brand hover:bg-paper text-[10px] font-black uppercase tracking-wider transition-all"
                  title="Toggle Editor Fullscreen"
                >
                  {isEditorFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="hidden xs:inline">{isEditorFullscreen ? "Exit" : "Expand"}</span>
                </button>

                <button type="button" onClick={handleCopy} className="p-2 text-muted hover:text-brand hover:bg-paper rounded-xl transition-colors" title="Copy Raw MD">
                  {copiedState === 'md' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => setMarkdown("")} className="p-2 text-muted hover:text-[#fb7185] hover:bg-paper rounded-xl transition-colors" title="Clear All"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Start writing markdown here..."
              className="w-full flex-grow p-4 sm:p-5 bg-surface border-0 text-xs sm:text-sm font-mono leading-relaxed text-ink outline-none resize-none tabular-nums min-h-[350px] sm:min-h-[400px]"
              spellCheck="false"
            />
            
            <div className="bg-surface px-4 py-3 border-t border-line text-[11px] font-bold text-muted flex justify-between items-center min-w-0">
              <div className="flex gap-4">
                <span>{stats.words} Words</span>
                <span>{markdown.length} Chars</span>
              </div>
              <span>~{stats.readingTime} min read</span>
            </div>
          </div>

          {/* RIGHT: Live Preview Panel */}
          <div className={`bg-paper border border-line rounded-2xl overflow-hidden flex flex-col min-w-0 print:border-none print:shadow-none print:bg-transparent ${
            viewMode === 'edit' ? 'hidden' : 'flex'
          } ${isFullscreen ? 'fixed inset-3 sm:inset-4 z-50 shadow-2xl transition-all border-brand ring-4 ring-brand/20 print:relative print:inset-auto print:ring-0 h-auto' : ''}`}>
            
            <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between min-w-0 print:hidden">
              <div className="flex items-center gap-2 text-xs font-black text-brand uppercase tracking-wider">
                <Type className="w-4 h-4" /> Live Render Preview
              </div>
              <button 
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-paper text-brand hover:bg-surface text-xs font-black uppercase tracking-wider transition-all"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                {isFullscreen ? "Exit Full-Screen" : "Full-Screen"}
              </button>
            </div>
            
            <div className="flex-grow p-5 sm:p-8 overflow-y-auto bg-surface print:p-0 print:bg-white print:text-black min-h-[350px] sm:min-h-[400px]">
              {markdown.trim() ? (
                <div 
                  className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed text-ink print:text-black"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted italic space-y-2 opacity-50 print:hidden">
                  <FileText className="w-12 h-12" />
                  <p className="text-xs font-bold uppercase tracking-wider">Preview will appear here</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}