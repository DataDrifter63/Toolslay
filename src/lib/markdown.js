// Dependency-free Markdown → HTML for blog posts (used by the public post page AND the
// admin preview, so what you see while writing is what readers get).
//
// Standard Markdown that works:
//   # headings, **bold**, *italic*, ~~strike~~, ==highlight==, `code`, [links](url),
//   ![image](url), - lists (nested, with - [ ] tasks), 1. numbered lists, > quotes,
//   ``` code blocks, --- divider, and | pipe | tables | (with :--- alignment).
//
// Extra "block" syntax (see docs/BLOG_FORMATTING.md for the cheat sheet):
//   :::tip / :::note / :::info / :::warning / :::danger / :::success   callout boxes
//   :::takeaways                                                        key points box
//   :::vs Name A | Name B   (sides separated by a --- line)             VS comparison cards
//   :::proscons             (pros, then ---, then cons)                 pros / cons columns
//   :::steps                (list)                                      numbered step cards
//   :::cards                (- Title | Description | /link)              link cards grid
//   :::stats                (- 122 | label)                             big-number row
//   :::faq                  (### Question + answer text)                accordion (+ FAQ schema)
//   :::tool slug-one, slug-two   (one line, no closing)                 inline tool card(s)
//   :::post blog-post-slug       (one line, no closing)                 inline "Read next" blog card
//
// Safety: all author text is HTML-escaped first and only URLs starting with http(s), mailto,
// tel, "/" or "#" are allowed in links/images, so only tags generated here reach the page.

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(url) {
  const u = url.trim();
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(u) ? u : "#";
}

// ---------- inline formatting (input is RAW text, output is safe HTML) ----------
function inline(raw) {
  let t = esc(raw);
  const stash = [];
  const keep = (html) => {
    stash.push(html);
    return `\u0000${stash.length - 1}\u0000`;
  };

  t = t.replace(/`([^`]+)`/g, (_, code) => keep(`<code>${code}</code>`));
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) =>
    keep(`<img src="${safeUrl(src)}" alt="${alt}" loading="lazy" decoding="async" />`)
  );
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const url = safeUrl(href);
    const external = /^https?:\/\//i.test(url);
    return keep(
      `<a href="${url}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`
    );
  });

  t = t
    .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/==([^=]+)==/g, "<mark>$1</mark>");

  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[Number(i)]);
}

function plainText(raw) {
  return String(raw)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~=]/g, "")
    .trim();
}

function slugifyHeading(text) {
  return (
    plainText(text)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "section"
  );
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------- small inline SVG icons for callouts ----------
const svg = (inner) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

const ICONS = {
  info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
  tip: svg(
    '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'
  ),
  warning: svg(
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
  ),
  danger: svg('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
  success: svg('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>'),
  takeaways: svg(
    '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>'
  ),
};

const CALLOUTS = {
  tip: { icon: "tip", title: "Tip" },
  note: { icon: "info", title: "Note" },
  info: { icon: "info", title: "Good to know" },
  warning: { icon: "warning", title: "Watch out" },
  danger: { icon: "danger", title: "Important" },
  success: { icon: "success", title: "Result" },
};

const OPEN_RE = /^:::\s*([a-z-]+)\s*(.*)$/i;
const CLOSE_RE = /^:::\s*$/;
// ":::tool slug" and ":::post slug" are single lines (no closing ::: needed),
// so they never open a nested block.
const TOOL_RE = /^:::\s*(tool|post|posts)\b/i;
const isOpen = (t) => OPEN_RE.test(t) && !TOOL_RE.test(t);

// ---------- helpers ----------
function findContainerEnd(lines, start) {
  let depth = 1;
  for (let i = start + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (CLOSE_RE.test(t)) {
      depth -= 1;
      if (depth === 0) return i;
    } else if (isOpen(t)) {
      depth += 1;
    }
  }
  return -1;
}

function splitOnRule(lines) {
  const parts = [[]];
  let depth = 0;
  for (const l of lines) {
    const t = l.trim();
    if (CLOSE_RE.test(t)) depth -= 1;
    else if (isOpen(t)) depth += 1;
    if (depth === 0 && /^-{3,}$/.test(t)) parts.push([]);
    else parts[parts.length - 1].push(l);
  }
  return parts;
}

function pullTitle(lines) {
  const i = lines.findIndex((l) => l.trim() !== "");
  if (i !== -1) {
    const m = /^#{1,6}\s+(.*)$/.exec(lines[i].trim());
    if (m) return { title: m[1].trim(), rest: lines.slice(i + 1) };
  }
  return { title: "", rest: lines };
}

const LIST_RE = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

function renderList(items) {
  // items: [{indent, ordered, text}] consecutive; nested lists are built from indentation
  const root = { children: [], indent: -1 };
  const stack = [root];
  for (const it of items) {
    while (stack.length > 1 && stack[stack.length - 1].indent >= it.indent) stack.pop();
    const node = { ...it, children: [] };
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  const build = (nodes) => {
    if (!nodes.length) return "";
    const tag = nodes[0].ordered ? "ol" : "ul";
    const lis = nodes
      .map((n) => {
        const task = /^\[( |x|X)\]\s+(.*)$/.exec(n.text);
        const body = task ? inline(task[2]) : inline(n.text);
        const cls = task ? ` class="bc-task${task[1] !== " " ? " bc-task-done" : ""}"` : "";
        const box = task ? `<span class="bc-checkbox" aria-hidden="true"></span>` : "";
        return `<li${cls}>${box}${body}${build(n.children)}</li>`;
      })
      .join("");
    return `<${tag}>${lis}</${tag}>`;
  };
  return build(root.children);
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

const SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const YES = new Set(["✓", "✔", "✅", "yes", "(yes)"]);
const NO = new Set(["✗", "✘", "✕", "❌", "no", "(no)"]);

function cellHtml(text) {
  const key = text.trim().toLowerCase();
  if (YES.has(key)) return `<span class="bc-yes" aria-label="Yes">✓</span>`;
  if (NO.has(key)) return `<span class="bc-no" aria-label="No">✗</span>`;
  return inline(text);
}

function renderTable(headerLine, sepLine, bodyLines) {
  const head = splitRow(headerLine);
  const aligns = splitRow(sepLine).map((c) => {
    const l = c.startsWith(":");
    const r = c.endsWith(":");
    return l && r ? "center" : r ? "right" : l ? "left" : "";
  });
  const al = (i) => (aligns[i] ? ` style="text-align:${aligns[i]}"` : "");
  const thead = `<thead><tr>${head.map((c, i) => `<th scope="col"${al(i)}>${inline(c)}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${bodyLines
    .map((ln) => {
      const cells = splitRow(ln);
      return `<tr>${head
        .map((_, i) => {
          const tag = i === 0 ? "th" : "td";
          const scope = i === 0 ? ' scope="row"' : "";
          return `<${tag}${scope}${al(i)}>${cellHtml(cells[i] ?? "")}</${tag}>`;
        })
        .join("")}</tr>`;
    })
    .join("")}</tbody>`;
  return `<div class="bc-table-wrap"><table class="bc-table">${thead}${tbody}</table></div>`;
}

function listItems(lines) {
  return lines
    .map((l) => LIST_RE.exec(l))
    .filter(Boolean)
    .map((m) => m[3].trim());
}

// ---------- block container renderers ----------
function renderContainer(name, args, inner, ctx) {
  const sub = (ls) => parseBlocks(ls, { ...ctx, top: false });

  if (CALLOUTS[name]) {
    const c = CALLOUTS[name];
    const title = args.trim() || c.title;
    return `<aside class="bc-callout bc-${name}"><div class="bc-callout-head"><span class="bc-callout-icon">${ICONS[c.icon]}</span><span class="bc-callout-title">${inline(title)}</span></div><div class="bc-callout-body">${sub(inner)}</div></aside>`;
  }

  if (name === "takeaways") {
    const title = args.trim() || "Key takeaways";
    return `<aside class="bc-takeaways"><div class="bc-callout-head"><span class="bc-callout-icon">${ICONS.takeaways}</span><span class="bc-callout-title">${inline(title)}</span></div><div class="bc-callout-body">${sub(inner)}</div></aside>`;
  }

  if (name === "vs") {
    const [a, b] = splitOnRule(inner);
    const named = args.split("|").map((s) => s.trim());
    const side = (lines, fallbackTitle, cls) => {
      const { title, rest } = pullTitle(lines || []);
      const heading = title || fallbackTitle || "";
      return `<div class="bc-vs-card ${cls}">${heading ? `<h4 class="bc-vs-title">${inline(heading)}</h4>` : ""}<div class="bc-vs-body">${sub(rest)}</div></div>`;
    };
    return `<div class="bc-vs">${side(a, named[0], "bc-vs-a")}<div class="bc-vs-badge" aria-hidden="true"><span>VS</span></div>${side(b, named[1], "bc-vs-b")}</div>`;
  }

  if (name === "proscons") {
    const [pros, cons] = splitOnRule(inner);
    const named = args.split("|").map((s) => s.trim());
    const col = (lines, title, cls, icon) =>
      `<div class="bc-pc ${cls}"><div class="bc-pc-head"><span class="bc-callout-icon">${icon}</span>${inline(title)}</div><div class="bc-pc-body">${sub(lines || [])}</div></div>`;
    return `<div class="bc-proscons">${col(pros, named[0] || "Pros", "bc-pros", ICONS.success)}${col(cons, named[1] || "Cons", "bc-cons", ICONS.danger)}</div>`;
  }

  if (name === "steps") {
    const items = listItems(inner);
    if (!items.length) return sub(inner);
    return `<ol class="bc-steps">${items.map((t) => `<li><div class="bc-step-body">${inline(t)}</div></li>`).join("")}</ol>`;
  }

  if (name === "cards") {
    const items = listItems(inner).map((t) => t.split("|").map((s) => s.trim()));
    const html = items
      .map(([title, desc, url]) => {
        const body = `<span class="bc-card-title">${inline(title || "")}</span>${desc ? `<span class="bc-card-desc">${inline(desc)}</span>` : ""}${url ? `<span class="bc-card-cta">Open &rarr;</span>` : ""}`;
        if (!url) return `<div class="bc-card">${body}</div>`;
        const u = safeUrl(url);
        const ext = /^https?:\/\//i.test(u);
        return `<a class="bc-card bc-card-link" href="${u}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${body}</a>`;
      })
      .join("");
    return `<div class="bc-cards">${html}</div>`;
  }

  if (name === "stats") {
    const items = listItems(inner).map((t) => t.split("|").map((s) => s.trim()));
    return `<div class="bc-stats">${items
      .map(
        ([n, label]) =>
          `<div class="bc-stat"><span class="bc-stat-num">${inline(n || "")}</span><span class="bc-stat-label">${inline(label || "")}</span></div>`
      )
      .join("")}</div>`;
  }

  if (name === "faq") {
    const groups = [];
    for (const l of inner) {
      const m = /^#{1,6}\s+(.*)$/.exec(l.trim());
      if (m) groups.push({ q: m[1].trim(), lines: [] });
      else if (groups.length) groups[groups.length - 1].lines.push(l);
    }
    if (!groups.length) return sub(inner);
    const out = groups
      .map((g) => {
        const answer = sub(g.lines);
        ctx.faqs.push({ q: plainText(g.q), a: stripTags(answer).slice(0, 900) });
        return `<details class="bc-faq-item"><summary>${inline(g.q)}</summary><div class="bc-faq-answer">${answer}</div></details>`;
      })
      .join("");
    return `<div class="bc-faq">${out}</div>`;
  }

  if (name === "tool" || name === "post" || name === "posts") {
    const kind = name === "tool" ? "tool" : "post";
    return args
      .split(/[,\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^[a-z0-9-]+$/.test(s))
      .map((slug) => `<div class="bc-${kind}-slot" data-slug="${slug}"></div>`)
      .join("");
  }

  // unknown block name: just render its content
  return sub(inner);
}

// ---------- main block parser ----------
function parseBlocks(lines, ctx) {
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    // fenced code
    if (line.startsWith("```")) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // closing fence
      html.push(`<pre class="bc-code"><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }

    // :::tool slug / :::post slug  (single line, optional closing :::)
    if (TOOL_RE.test(line)) {
      const m = OPEN_RE.exec(line);
      html.push(renderContainer(m[1].toLowerCase(), (m && m[2]) || "", [], ctx));
      i++;
      if (i < lines.length && CLOSE_RE.test(lines[i].trim())) i++;
      continue;
    }

    // :::container
    const open = OPEN_RE.exec(line);
    if (open) {
      const end = findContainerEnd(lines, i);
      if (end !== -1) {
        html.push(renderContainer(open[1].toLowerCase(), open[2] || "", lines.slice(i + 1, end), ctx));
        i = end + 1;
        continue;
      }
    }

    if (line === "") {
      i++;
      continue;
    }

    // heading
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = Math.min(Math.max(h[1].length - ctx.shift, 2), 6);
      let attrs = "";
      if (ctx.top) {
        let id = slugifyHeading(h[2]);
        const n = (ctx.ids[id] = (ctx.ids[id] || 0) + 1);
        if (n > 1) id = `${id}-${n}`;
        attrs = ` id="${id}"`;
        if (level <= 3) ctx.headings.push({ id, text: plainText(h[2]), level });
      }
      html.push(`<h${level}${attrs}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // divider
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      html.push('<hr class="bc-hr" />');
      i++;
      continue;
    }

    // table
    if (line.includes("|") && i + 1 < lines.length && SEP_RE.test(lines[i + 1]) && lines[i + 1].includes("-")) {
      const body = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim() !== "" && lines[j].includes("|")) {
        body.push(lines[j]);
        j++;
      }
      html.push(renderTable(raw, lines[i + 1], body));
      i = j;
      continue;
    }

    // blockquote
    if (/^>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i].trim())) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      html.push(`<blockquote>${parseBlocks(buf, { ...ctx, top: false })}</blockquote>`);
      continue;
    }

    // list
    if (LIST_RE.test(raw)) {
      const items = [];
      while (i < lines.length && LIST_RE.test(lines[i])) {
        const m = LIST_RE.exec(lines[i]);
        items.push({ indent: m[1].replace(/\t/g, "  ").length, ordered: /\d/.test(m[2]), text: m[3] });
        i++;
      }
      html.push(renderList(items));
      continue;
    }

    // standalone image → figure with caption
    const img = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(line);
    if (img) {
      const cap = img[1].trim();
      html.push(
        `<figure class="bc-figure"><img src="${safeUrl(img[2])}" alt="${esc(cap)}" loading="lazy" decoding="async" />${cap ? `<figcaption>${inline(cap)}</figcaption>` : ""}</figure>`
      );
      i++;
      continue;
    }

    // paragraph (one line = one paragraph, same as the original renderer)
    html.push(`<p>${inline(line)}</p>`);
    i++;
  }

  return html.join("\n");
}

// ---------- public API ----------
export function renderMarkdown(markdown) {
  if (!markdown) return { html: "", headings: [], faqs: [], wordCount: 0, readingMinutes: 1 };

  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");

  // Shift headings so the shallowest top-level heading becomes <h2>
  // (the post title is the page's only <h1>).
  let fence = false;
  let depth = 0;
  let minLevel = 7;
  for (const l of lines) {
    const t = l.trim();
    if (t.startsWith("```")) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    if (CLOSE_RE.test(t)) {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (isOpen(t)) {
      depth += 1;
      continue;
    }
    if (depth > 0) continue;
    const m = /^(#{1,4})\s+/.exec(t);
    if (m && m[1].length < minLevel) minLevel = m[1].length;
  }

  const ctx = {
    shift: minLevel === 7 ? 0 : minLevel - 2,
    headings: [],
    faqs: [],
    ids: {},
    top: true,
  };
  const html = parseBlocks(lines, ctx);

  const words = String(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_`>|:\-[\]()!~=]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    html,
    headings: ctx.headings,
    faqs: ctx.faqs,
    wordCount: words,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
  };
}

// Backwards-compatible helper: just the HTML.
export function markdownToHtml(markdown) {
  return renderMarkdown(markdown).html;
}

// Slugs of the blog posts referenced with ":::post slug" (used to fetch their cards).
export function extractPostSlugs(html) {
  const out = [];
  const re = /<div class="bc-post-slot" data-slug="([a-z0-9-]+)"><\/div>/g;
  let m;
  while ((m = re.exec(html || ""))) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}
