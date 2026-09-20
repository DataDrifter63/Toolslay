// A small, dependency-free Markdown → HTML converter — enough for blog posts
// (headings, bold/italic, links, images, lists, code blocks, blockquotes).
// Not a full CommonMark implementation, but covers everything the admin
// editor's preview and the public blog page need. User text is HTML-escaped
// first, so only markdown-generated tags are ever trusted.

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(markdown) {
  if (!markdown) return "";

  const escaped = escapeHtml(markdown);
  const lines = escaped.split("\n");
  const html = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let listBuffer = [];
  let listType = null; // "ul" | "ol"

  function flushList() {
    if (listBuffer.length) {
      html.push(`<${listType}>${listBuffer.join("")}</${listType}>`);
      listBuffer = [];
      listType = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine;

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        html.push(`<pre><code>${codeBuffer.join("\n")}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (/^###\s+/.test(line)) {
      flushList();
      html.push(`<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      flushList();
      html.push(`<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (/^#\s+/.test(line)) {
      flushList();
      html.push(`<h1>${inline(line.replace(/^#\s+/, ""))}</h1>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushList();
      html.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    const ulMatch = /^[-*]\s+(.*)/.exec(line);
    const olMatch = /^\d+\.\s+(.*)/.exec(line);
    if (ulMatch) {
      if (listType !== "ul") { flushList(); listType = "ul"; }
      listBuffer.push(`<li>${inline(ulMatch[1])}</li>`);
      continue;
    }
    if (olMatch) {
      if (listType !== "ol") { flushList(); listType = "ol"; }
      listBuffer.push(`<li>${inline(olMatch[1])}</li>`);
      continue;
    }
    flushList();

    if (line.trim() === "") continue;
    html.push(`<p>${inline(line)}</p>`);
  }

  flushList();
  if (inCodeBlock && codeBuffer.length) {
    html.push(`<pre><code>${codeBuffer.join("\n")}</code></pre>`);
  }

  return html.join("\n");
}