'use client';

import React, { useMemo, useState } from 'react';

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
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
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

        // Handle extremely long words.
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

  // Object 1 = Catalog
  objects.push(
    '<< /Type /Catalog /Pages 2 0 R >>'
  );

  // Object 2 = Pages
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

  // Object 3 = Helvetica font
  objects.push(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  );

  // Object 4 = Metadata
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

    // Header
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

    // Main text
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

    // Footer
    let footerText = footer || '';

    if (showPageNumbers) {
      const pageLabel = `Page ${pageIndex + 1} of ${totalPages}`;

      if (footerText) {
        footerText = `${footerText}  •  ${pageLabel}`;
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
  const [text, setText] = useState(
    'Type or paste your text here...\n\nYour document will be converted into a clean PDF.'
  );

  const [title, setTitle] = useState(
    'My Document'
  );

  const [author, setAuthor] = useState('');

  const [header, setHeader] = useState('');

  const [footer, setFooter] = useState('');

  const [pageSize, setPageSize] = useState('A4');

  const [orientation, setOrientation] =
    useState('portrait');

  const [margin, setMargin] =
    useState('Normal');

  const [fontSize, setFontSize] =
    useState('Normal');

  const [lineSpacing, setLineSpacing] =
    useState(1.5);

  const [alignment, setAlignment] =
    useState('left');

  const [showPageNumbers, setShowPageNumbers] =
    useState(true);

  const [downloaded, setDownloaded] =
    useState(false);

  const stats = useMemo(() => {
    const clean = text.trim();

    const words = clean
      ? clean.split(/\s+/).length
      : 0;

    const characters = text.length;

    const lines = text
      ? text.split(/\n/).length
      : 0;

    const readingTime = Math.max(
      1,
      Math.ceil(words / 200)
    );

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
      fontSize:
        FONT_SIZES[fontSize] ||
        FONT_SIZES.Normal,
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
      `Welcome to Text to PDF Generator

This is a professional browser-based text to PDF tool.

You can write notes, reports, assignments, letters, documentation, meeting notes, or any other text and convert it into a clean PDF document.

Everything is generated directly in your browser without uploading your text to a server.

Features include page size selection, orientation, margins, font size, line spacing, alignment, headers, footers, and automatic page numbering.`
    );
  };

  return (
    <div className="ttp-wrapper">
      <style>{`
        .ttp-wrapper {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #111827;
        }

        .ttp-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }

        .ttp-header {
          padding: 28px 30px;
          background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
          color: #ffffff;
        }

        .ttp-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .ttp-title-area {
          min-width: 0;
        }

        .ttp-title {
          margin: 0;
          font-size: 27px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .ttp-subtitle {
          margin: 8px 0 0;
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.6;
        }

        .ttp-badge {
          flex: 0 0 auto;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 999px;
          background: rgba(255,255,255,.07);
          color: #e2e8f0;
          font-size: 12px;
          font-weight: 700;
        }

        .ttp-body {
          padding: 26px;
        }

        .ttp-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(280px, .65fr);
          gap: 22px;
        }

        .ttp-panel {
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #ffffff;
          padding: 20px;
        }

        .ttp-panel-title {
          margin: 0 0 16px;
          font-size: 15px;
          font-weight: 800;
          color: #111827;
        }

        .ttp-textarea {
          display: block;
          width: 100%;
          min-height: 430px;
          resize: vertical;
          border: 1px solid #d1d5db;
          border-radius: 14px;
          padding: 16px;
          box-sizing: border-box;
          outline: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.65;
          color: #111827;
          background: #f9fafb;
          transition: .2s ease;
        }

        .ttp-textarea:focus {
          border-color: #111827;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(17,24,39,.07);
        }

        .ttp-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 12px;
        }

        .ttp-stat {
          padding: 10px 8px;
          border-radius: 11px;
          background: #f8fafc;
          border: 1px solid #eef2f7;
          text-align: center;
        }

        .ttp-stat-number {
          display: block;
          font-weight: 800;
          font-size: 14px;
          color: #111827;
        }

        .ttp-stat-label {
          display: block;
          margin-top: 3px;
          font-size: 10px;
          color: #64748b;
        }

        .ttp-field {
          margin-bottom: 14px;
        }

        .ttp-label {
          display: block;
          margin-bottom: 7px;
          font-size: 12px;
          font-weight: 750;
          color: #374151;
        }

        .ttp-input,
        .ttp-select {
          width: 100%;
          height: 42px;
          box-sizing: border-box;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 0 12px;
          outline: none;
          background: #ffffff;
          color: #111827;
          font-family: inherit;
          font-size: 13px;
        }

        .ttp-input:focus,
        .ttp-select:focus {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17,24,39,.06);
        }

        .ttp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .ttp-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 13px;
          margin-top: 3px;
          border: 1px solid #e5e7eb;
          border-radius: 11px;
          background: #f8fafc;
          cursor: pointer;
        }

        .ttp-toggle-text {
          font-size: 12px;
          font-weight: 700;
          color: #374151;
        }

        .ttp-toggle input {
          width: 18px;
          height: 18px;
          accent-color: #111827;
        }

        .ttp-actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .ttp-button {
          border: 0;
          border-radius: 11px;
          height: 45px;
          padding: 0 18px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: transform .15s ease, opacity .15s ease;
        }

        .ttp-button:hover {
          transform: translateY(-1px);
        }

        .ttp-button-primary {
          flex: 1;
          background: #111827;
          color: #ffffff;
        }

        .ttp-button-secondary {
          background: #f1f5f9;
          color: #334155;
        }

        .ttp-button-sample {
          width: 100%;
          margin-top: 10px;
          background: #f1f5f9;
          color: #334155;
        }

        .ttp-success {
          margin-top: 12px;
          padding: 11px 13px;
          border-radius: 10px;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          color: #166534;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        .ttp-note {
          margin-top: 15px;
          padding: 13px;
          border-radius: 12px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        @media (max-width: 800px) {
          .ttp-wrapper {
            padding: 12px;
          }

          .ttp-layout {
            grid-template-columns: 1fr;
          }

          .ttp-header-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .ttp-body {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .ttp-title {
            font-size: 22px;
          }

          .ttp-grid {
            grid-template-columns: 1fr;
          }

          .ttp-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .ttp-actions {
            flex-direction: column;
          }

          .ttp-textarea {
            min-height: 330px;
          }
        }
      `}</style>

      <div className="ttp-card">
        <div className="ttp-header">
          <div className="ttp-header-row">
            <div className="ttp-title-area">
              <h2 className="ttp-title">
                Text to PDF Generator
              </h2>

              <p className="ttp-subtitle">
                Turn your text into a clean, professional PDF instantly.
              </p>
            </div>

            <div className="ttp-badge">
              100% Browser Based
            </div>
          </div>
        </div>

        <div className="ttp-body">
          <div className="ttp-layout">
            {/* TEXT AREA */}
            <div className="ttp-panel">
              <h3 className="ttp-panel-title">
                Your Content
              </h3>

              <textarea
                className="ttp-textarea"
                value={text}
                onChange={(e) =>
                  setText(e.target.value)
                }
                placeholder="Write or paste your text here..."
                spellCheck="true"
              />

              <div className="ttp-stats">
                <div className="ttp-stat">
                  <span className="ttp-stat-number">
                    {stats.words}
                  </span>
                  <span className="ttp-stat-label">
                    Words
                  </span>
                </div>

                <div className="ttp-stat">
                  <span className="ttp-stat-number">
                    {stats.characters}
                  </span>
                  <span className="ttp-stat-label">
                    Characters
                  </span>
                </div>

                <div className="ttp-stat">
                  <span className="ttp-stat-number">
                    {stats.lines}
                  </span>
                  <span className="ttp-stat-label">
                    Lines
                  </span>
                </div>

                <div className="ttp-stat">
                  <span className="ttp-stat-number">
                    {stats.readingTime} min
                  </span>
                  <span className="ttp-stat-label">
                    Reading Time
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="ttp-button ttp-button-sample"
                onClick={handleSample}
              >
                Load Sample Content
              </button>
            </div>

            {/* SETTINGS */}
            <div className="ttp-panel">
              <h3 className="ttp-panel-title">
                Document Settings
              </h3>

              <div className="ttp-field">
                <label className="ttp-label">
                  Document Title
                </label>

                <input
                  className="ttp-input"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="My Document"
                />
              </div>

              <div className="ttp-field">
                <label className="ttp-label">
                  Author
                </label>

                <input
                  className="ttp-input"
                  value={author}
                  onChange={(e) =>
                    setAuthor(e.target.value)
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="ttp-field">
                <label className="ttp-label">
                  Header
                </label>

                <input
                  className="ttp-input"
                  value={header}
                  onChange={(e) =>
                    setHeader(e.target.value)
                  }
                  placeholder="Optional header"
                />
              </div>

              <div className="ttp-field">
                <label className="ttp-label">
                  Footer
                </label>

                <input
                  className="ttp-input"
                  value={footer}
                  onChange={(e) =>
                    setFooter(e.target.value)
                  }
                  placeholder="Optional footer"
                />
              </div>

              <div className="ttp-grid">
                <div className="ttp-field">
                  <label className="ttp-label">
                    Page Size
                  </label>

                  <select
                    className="ttp-select"
                    value={pageSize}
                    onChange={(e) =>
                      setPageSize(e.target.value)
                    }
                  >
                    <option value="A4">
                      A4
                    </option>
                    <option value="Letter">
                      Letter
                    </option>
                    <option value="Legal">
                      Legal
                    </option>
                  </select>
                </div>

                <div className="ttp-field">
                  <label className="ttp-label">
                    Orientation
                  </label>

                  <select
                    className="ttp-select"
                    value={orientation}
                    onChange={(e) =>
                      setOrientation(e.target.value)
                    }
                  >
                    <option value="portrait">
                      Portrait
                    </option>
                    <option value="landscape">
                      Landscape
                    </option>
                  </select>
                </div>

                <div className="ttp-field">
                  <label className="ttp-label">
                    Margins
                  </label>

                  <select
                    className="ttp-select"
                    value={margin}
                    onChange={(e) =>
                      setMargin(e.target.value)
                    }
                  >
                    <option value="Narrow">
                      Narrow
                    </option>
                    <option value="Normal">
                      Normal
                    </option>
                    <option value="Wide">
                      Wide
                    </option>
                  </select>
                </div>

                <div className="ttp-field">
                  <label className="ttp-label">
                    Font Size
                  </label>

                  <select
                    className="ttp-select"
                    value={fontSize}
                    onChange={(e) =>
                      setFontSize(e.target.value)
                    }
                  >
                    <option value="Small">
                      Small
                    </option>
                    <option value="Normal">
                      Normal
                    </option>
                    <option value="Large">
                      Large
                    </option>
                    <option value="XLarge">
                      Extra Large
                    </option>
                  </select>
                </div>

                <div className="ttp-field">
                  <label className="ttp-label">
                    Line Spacing
                  </label>

                  <select
                    className="ttp-select"
                    value={lineSpacing}
                    onChange={(e) =>
                      setLineSpacing(
                        e.target.value
                      )
                    }
                  >
                    <option value="1">
                      Single
                    </option>
                    <option value="1.25">
                      1.25x
                    </option>
                    <option value="1.5">
                      1.5x
                    </option>
                    <option value="2">
                      Double
                    </option>
                  </select>
                </div>

                <div className="ttp-field">
                  <label className="ttp-label">
                    Alignment
                  </label>

                  <select
                    className="ttp-select"
                    value={alignment}
                    onChange={(e) =>
                      setAlignment(e.target.value)
                    }
                  >
                    <option value="left">
                      Left
                    </option>
                    <option value="center">
                      Center
                    </option>
                    <option value="right">
                      Right
                    </option>
                  </select>
                </div>
              </div>

              <label className="ttp-toggle">
                <span className="ttp-toggle-text">
                  Show page numbers
                </span>

                <input
                  type="checkbox"
                  checked={showPageNumbers}
                  onChange={(e) =>
                    setShowPageNumbers(
                      e.target.checked
                    )
                  }
                />
              </label>

              <div className="ttp-actions">
                <button
                  type="button"
                  className="ttp-button ttp-button-secondary"
                  onClick={handleClear}
                >
                  Clear
                </button>

                <button
                  type="button"
                  className="ttp-button ttp-button-primary"
                  onClick={handleGenerate}
                >
                  {downloaded
                    ? 'PDF Created ✓'
                    : 'Generate PDF'}
                </button>
              </div>

              {downloaded && (
                <div className="ttp-success">
                  Your PDF has been generated successfully.
                </div>
              )}

              <div className="ttp-note">
                Your text stays in the browser. No upload,
                account, API, or external PDF service is
                required.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}