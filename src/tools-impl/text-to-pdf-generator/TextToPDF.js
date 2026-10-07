'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  FileText, Download, Trash2, Sliders, ShieldCheck, 
  CheckCircle2, FileUp, Sparkles, LayoutTemplate, AlignLeft, 
  Type, AlignCenter, AlignRight
} from 'lucide-react';

/* =========================================================
   TEXT TO PDF GENERATOR
   - No external packages
   - No API
   - No jsPDF
   - Browser-side PDF generation
   - Default export for registry compatibility
   ========================================================= */

const PAGE_SIZES = {
  A4: {
    width: 595.28,
    height: 841.89,
  },
  Letter: {
    width: 612,
    height: 792,
  },
  Legal: {
    width: 612,
    height: 1008,
  },
};

const MARGINS = {
  Narrow: 32,
  Normal: 48,
  Wide: 68,
};

const FONT_SIZES = {
  Small: 10,
  Normal: 12,
  Large: 14,
  XLarge: 16,
};

function cleanPdfText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[^\x20-\x7E\n\t]/g, '');
}

function escapePdfText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')     .replace(/\)/g, '\\)');
}

function estimateCharWidth(text, fontSize) {
  let width = 0;

  for (const char of text) {
    if ('ilI.,:;|!'.includes(char)) {
      width += fontSize * 0.25;
    } else if ('mwMW@#%'.includes(char)) {
      width += fontSize * 0.9;
    } else if ('ABCDEFGHJKLMNOPQRSTUVWXYZ'.includes(char)) {
      width += fontSize * 0.62;
    } else {
      width += fontSize * 0.52;
    }
  }

  return width;
}

function wrapText(text, maxWidth, fontSize) {
  const safeText = cleanPdfText(text);
  const paragraphs = safeText.split('\n');
  const lines = [];

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      lines.push('');
      return;
    }

    const words = paragraph.trim().split(/\s+/);
    let current = '';

    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;

      if (
        estimateCharWidth(test, fontSize) <= maxWidth ||
        !current
      ) {
        current = test;
      } else {
        lines.push(current);
        current = word;

        if (estimateCharWidth(current, fontSize) > maxWidth) {
          let chunk = '';

          for (const char of current) {
            const testChunk = chunk + char;

            if (
              estimateCharWidth(testChunk, fontSize) <= maxWidth
            ) {
              chunk = testChunk;
            } else {
              if (chunk) lines.push(chunk);
              chunk = char;
            }
          }

          current = chunk;
        }
      }
    });

    if (current) {
      lines.push(current);
    }
  });

  return lines;
}

function createPdf({
  text,
  title,
  author,
  header,
  footer,
  pageSize,
  orientation,
  margin,
  fontSize,
  lineSpacing,
  alignment,
  showPageNumbers,
}) {
  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;

  let pageWidth = size.width;
  let pageHeight = size.height;

  if (orientation === 'landscape') {
    [pageWidth, pageHeight] = [pageHeight, pageWidth];
  }

  const marginValue = MARGINS[margin] || MARGINS.Normal;
  const contentWidth = pageWidth - marginValue * 2;

  const baseLineHeight = fontSize * lineSpacing;

  const headerFontSize = Math.max(9, fontSize - 1);
  const footerFontSize = Math.max(8, fontSize - 2);

  const headerSpace = header ? 28 : 8;
  const footerSpace = 30;

  const availableHeight =
    pageHeight -
    marginValue * 2 -
    headerSpace -
    footerSpace;

  const linesPerPage = Math.max(
    1,
    Math.floor(availableHeight / baseLineHeight)
  );

  const lines = wrapText(
    text,
    contentWidth,
    fontSize
  );

  const pages = [];

  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }

  if (pages.length === 0) {
    pages.push(['']);
  }

  const objects = [];

  objects.push(
    '<< /Type /Catalog /Pages 2 0 R >>'
  );

  const pageObjectNumbers = [];
  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    pageObjectNumbers.push(5 + i * 2);
  }

  objects.push(
    `<< /Type /Pages /Kids [${pageObjectNumbers
      .map((n) => `${n} 0 R`)
      .join(' ')}] /Count ${totalPages} >>`
  );

  objects.push(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  );

  const metadataTitle = escapePdfText(
    cleanPdfText(title || 'Text Document')
  );

  const metadataAuthor = escapePdfText(
    cleanPdfText(author || 'Text to PDF Generator')
  );

  objects.push(
    `<< /Title (${metadataTitle}) /Author (${metadataAuthor}) /Creator (Text to PDF Generator) >>`
  );

  pages.forEach((pageLines, pageIndex) => {
    const pageObject = 5 + pageIndex * 2;
    const contentObject = pageObject + 1;

    const commands = [];

    if (header) {
      commands.push('BT');
      commands.push(`/F1 ${headerFontSize} Tf`);
      commands.push(
        `1 0 0 1 ${marginValue} ${
          pageHeight - marginValue + 2
        } Tm`
      );
      commands.push(
        `(${escapePdfText(header)}) Tj`
      );
      commands.push('ET');
    }

    let y =
      pageHeight -
      marginValue -
      headerSpace -
      fontSize;

    pageLines.forEach((line) => {
      let x = marginValue;

      const lineWidth = estimateCharWidth(
        line,
        fontSize
      );

      if (alignment === 'center') {
        x =
          marginValue +
          Math.max(
            0,
            (contentWidth - lineWidth) / 2
          );
      }

      if (alignment === 'right') {
        x =
          marginValue +
          Math.max(
            0,
            contentWidth - lineWidth
          );
      }

      commands.push('BT');
      commands.push(`/F1 ${fontSize} Tf`);
      commands.push(`1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`);

      if (line) {
        commands.push(
          `(${escapePdfText(line)}) Tj`
        );
      }

      commands.push('ET');

      y -= baseLineHeight;
    });

    let footerText = footer || '';

    if (showPageNumbers) {
      const pageLabel = `Page ${pageIndex + 1} of ${totalPages}`;

      if (footerText) {
        footerText = `${footerText}   •   ${pageLabel}`;
      } else {
        footerText = pageLabel;
      }
    }

    if (footerText) {
      const footerWidth = estimateCharWidth(
        footerText,
        footerFontSize
      );

      const footerX =
        marginValue +
        Math.max(
          0,
          (contentWidth - footerWidth) / 2
        );

      commands.push('BT');
      commands.push(`/F1 ${footerFontSize} Tf`);
      commands.push(
        `1 0 0 1 ${footerX.toFixed(2)} ${(
          marginValue - 10
        ).toFixed(2)} Tm`
      );
      commands.push(
        `(${escapePdfText(footerText)}) Tj`
      );
      commands.push('ET');
    }

    const stream = commands.join('\n');

    objects[pageObject - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(
        2
      )} ${pageHeight.toFixed(
        2
      )}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObject} 0 R >>`;

    objects[contentObject - 1] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = pdf.length;

    pdf += `${index + 1} 0 obj\n`;
    pdf += `${object}\n`;
    pdf += 'endobj\n';
  });

  const xrefPosition = pdf.length;

  pdf += `xref\n`;
  pdf += `0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(
      10,
      '0'
    )} 00000 n \n`;
  }

  pdf += 'trailer\n';
  pdf += `<< /Size ${
    objects.length + 1
  } /Root 1 0 R /Info 4 0 R >>\n`;
  pdf += 'startxref\n';
  pdf += `${xrefPosition}\n`;
  pdf += '%%EOF';

  return pdf;
}

function downloadPdf(options) {
  const pdf = createPdf(options);

  const blob = new Blob(
    [pdf],
    {
      type: 'application/pdf',
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;

  const filename =
    cleanPdfText(options.title || 'document')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .toLowerCase() || 'document';

  link.download = `${filename}.pdf`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export default function TextToPDF() {
  const [isMounted, setIsMounted] = useState(false);
  const [text, setText] = useState(
    'Type or paste your text here...\n\nYour document will be converted into a clean PDF.'
  );

  const [title, setTitle] = useState('My Document');
  const [author, setAuthor] = useState('');
  const [header, setHeader] = useState('');
  const [footer, setFooter] = useState('');
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState('Normal');
  const [fontSize, setFontSize] = useState('Normal');
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [alignment, setAlignment] = useState('left');
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = useMemo(() => {
    const clean = text.trim();
    const words = clean ? clean.split(/\s+/).length : 0;
    const characters = text.length;
    const lines = text ? text.split(/\n/).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    return {
      words,
      characters,
      lines,
      readingTime,
    };
  }, [text]);

  const handleGenerate = () => {
    downloadPdf({
      text,
      title,
      author,
      header,
      footer,
      pageSize,
      orientation,
      margin,
      fontSize: FONT_SIZES[fontSize] || FONT_SIZES.Normal,
      lineSpacing: Number(lineSpacing),
      alignment,
      showPageNumbers,
    });

    setDownloaded(true);

    setTimeout(() => {
      setDownloaded(false);
    }, 2500);
  };

  const handleClear = () => {
    setText('');
    setDownloaded(false);
  };

  const handleSample = () => {
    setText(
      `Welcome to Text to PDF Generator\n\nThis is a professional browser-based text to PDF tool.\n\nYou can write notes, reports, assignments, letters, documentation, meeting notes, or any other text and convert it into a clean PDF document.\n\nEverything is generated directly in your browser without uploading your text to a server.\n\nFeatures include page size selection, orientation, margins, font size, line spacing, alignment, headers, footers, and automatic page numbering.`
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 space-y-6 text-ink font-sans box-border overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-surface border border-line px-4 sm:px-6 py-4 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full box-border relative overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="bg-paper p-2.5 sm:p-3.5 rounded-xl border border-line shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-ink tracking-tight truncate">
              Text to PDF Generator
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-brand uppercase tracking-widest mt-0.5 whitespace-normal leading-relaxed">
              Turn your text into a clean, professional PDF instantly.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface border border-line text-brand text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 100% Browser Based
        </div>
      </div>

      <div className="bg-paper border border-line p-4 sm:p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-6">
          
          {/* TEXT AREA PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-ink">
              Your Content
            </h3>

            <textarea
              className="w-full min-h-[380px] sm:min-h-[430px] resize-y border border-line rounded-xl p-4 text-xs sm:text-sm bg-paper text-ink outline-none font-sans leading-relaxed focus:border-brand shadow-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write or paste your text here..."
              spellCheck="true"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-surface border border-line rounded-xl shadow-inner flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Words</span>
                <span className="text-base font-black text-ink font-mono mt-1">{stats.words}</span>
              </div>
              <div className="p-3 bg-surface border border-line rounded-xl shadow-inner flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Characters</span>
                <span className="text-base font-black text-ink font-mono mt-1">{stats.characters}</span>
              </div>
              <div className="p-3 bg-surface border border-line rounded-xl shadow-inner flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Lines</span>
                <span className="text-base font-black text-ink font-mono mt-1">{stats.lines}</span>
              </div>
              <div className="p-3 bg-surface border border-line rounded-xl shadow-inner flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted">Reading Time</span>
                <span className="text-base font-black text-brand font-mono mt-1">{stats.readingTime} min</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full h-11 rounded-xl border border-line bg-surface text-ink font-black text-xs uppercase tracking-wider hover:border-brand cursor-pointer shadow-sm flex items-center justify-center gap-2"
              onClick={handleSample}
            >
              <Sparkles className="w-4 h-4 text-brand shrink-0" /> Load Sample Content
            </button>
          </div>

          {/* SETTINGS PANEL */}
          <div className="bg-surface border border-line p-4 sm:p-6 rounded-2xl shadow-inner space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-ink">
              Document Settings
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Document Title
                </label>
                <input
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Document"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Author
                </label>
                <input
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Header
                </label>
                <input
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="Optional header"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Footer
                </label>
                <input
                  className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none"
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  placeholder="Optional footer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                    Page Size
                  </label>
                  <select
                    className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                    Orientation
                  </label>
                  <select
                    className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                    Margins
                  </label>
                  <select
                    className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                    value={margin}
                    onChange={(e) => setMargin(e.target.value)}
                  >
                    <option value="Narrow">Narrow</option>
                    <option value="Normal">Normal</option>
                    <option value="Wide">Wide</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                    Font Size
                  </label>
                  <select
                    className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                  >
                    <option value="Small">Small</option>
                    <option value="Normal">Normal</option>
                    <option value="Large">Large</option>
                    <option value="XLarge">Extra Large</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                    Line Spacing
                  </label>
                  <select
                    className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(e.target.value)}
                  >
                    <option value="1">Single</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">Double</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                    Alignment
                  </label>
                  <select
                    className="w-full h-10 px-3 border border-line rounded-xl bg-paper text-ink text-xs font-bold outline-none cursor-pointer"
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value)}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>

            <label className="flex items-center justify-between p-3 border border-line rounded-xl bg-paper cursor-pointer shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                Show page numbers
              </span>
              <input
                type="checkbox"
                checked={showPageNumbers}
                onChange={(e) => setShowPageNumbers(e.target.checked)}
                className="w-4 h-4 accent-brand rounded border-line cursor-pointer shrink-0"
              />
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="h-11 px-4 rounded-xl border border-line bg-surface text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider hover:bg-rose-500/10 cursor-pointer shadow-sm"
                onClick={handleClear}
              >
                Clear
              </button>

              <button
                type="button"
                className="flex-1 h-11 px-6 rounded-xl bg-brand text-surface font-black text-xs uppercase tracking-wider shadow-sm hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
                onClick={handleGenerate}
              >
                <Download className="w-4 h-4 shrink-0" />
                {downloaded ? 'PDF Created ✓' : 'Generate PDF'}
              </button>
            </div>

            {downloaded && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Your PDF has been generated successfully.</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-surface border border-line text-xs text-muted leading-relaxed flex items-start gap-2.5 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Your text stays in the browser. No upload, account, API, or external PDF service is required.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}