# Toolslay SEO content workflow

## How to use (for you, not for the AI)

1. Get the next batch of tools, already formatted as input blocks:
   ```bash
   npm run seo:next                      # next 5 tools (tier A first, then B, then C)
   npm run seo:next -- --count 4         # 4 tools
   npm run seo:next -- --category developer-tools
   npm run seo:next -- --slug word-counter,case-converter
   npm run seo:next -- --list            # progress list only
   ```
2. In Antigravity, paste the prompt below (between the two lines), then paste the 3 to 5 blocks after it.
   More than 5 tools per run makes the sentences start to sound alike.
3. The AI adds entries to `src/data/toolSeo.js`, runs `npm run check:seo`, fixes errors, and reports.
4. Read its "Check before publishing" notes, then read the copy once yourself.
   The checker cannot tell whether text sounds human, and its passive-voice check is a rough estimate.
5. Launch day: set `NEXT_PUBLIC_INDEX_ALL_TOOLS=true` in Cloudflare Pages env vars (or flip the constant in
   `toolSeo.js`) so tools without copy also become indexable. Until then they stay noindex and out of the sitemap.

----------------------------------------------------------------------------------------------------

You are a senior SEO copywriter and a developer with full access to this repo (Toolslay, a free online tools site for a US audience, American English). I will paste input blocks for 3 to 5 tools. For each tool, write on-page copy that reads like a knowledgeable person wrote it, targets the keyword, and is 100% accurate to what the tool really does. Then add it to `src/data/toolSeo.js` and make `npm run check:seo` pass.

## STEP 1: UNDERSTAND EACH TOOL FIRST (mandatory)

Before writing anything for a tool, open its component in the folder named on the `CODE:` line of its block (`src/tools-impl/<folder>/`) and read it. Also read `src/components/tools/ToolPageShell.js` and `src/components/ui/AboutSection.js` once, so you know how each field renders (the lead paragraph is large, the other four paragraphs flow into two columns, highlights are small badges).

Write a short "Tool facts" list per tool: inputs, outputs, options and their defaults, limits, supported formats, buttons (copy, download, export), anything saved in localStorage/sessionStorage, and EVERY outside network request (APIs, CDNs, QR or image services, model files). The `CODE FLAGS` line in the block is an automatic hint, not the full list.

Rules that come from the facts:
- Only describe features that exist in the code. Never invent a feature, a limit or a number.
- Never write "runs entirely in your browser", "nothing is stored", "100% private" or similar unless the code proves it. If data goes to another service or is saved on the device, say so plainly.
- If the tool cannot satisfy the search intent of the target keyword (for example the keyword implies a two-way conversion and the tool only does one way), do not pretend. Write honest copy and list the mismatch in your final notes.
- Do not edit any tool component or any file other than `src/data/toolSeo.js`. If you find a bug or a false on-screen claim inside a tool, report it in your final notes only.

## STEP 2: INPUT BLOCK FORMAT (what I paste)

```
TOOL: <slug>
NAME / CATEGORY / CODE: ...
PRIMARY: <keyword> (<volume>/mo, KD <kd>)
SECONDARY: <keyword> (<volume>/mo, KD <kd>)
EXTRA IDEAS: <additional keywords>
TIER: <A / B / C>
NOTES: <anything else>
CODE FLAGS: <auto-detected network and storage use>
```

## STEP 3: WHAT TO WRITE (exact fields and lengths)

Each entry goes in the `TOOL_SEO` object in `src/data/toolSeo.js`, keyed by slug. Look at the existing `utm-link-builder` entry for the exact shape and level of quality, but never reuse its sentences or structure.

- `seoTitle`: max 50 characters. Primary keyword near the start. No brand name (the site adds " | Toolslay").
- `seoDescription`: 130 to 155 characters. Primary keyword once, in natural wording. Say what the visitor gets and invite the action.
- `h1`: max 60 characters. The primary keyword or a very close natural variant.
- `shortDescription`: one sentence, 20 to 30 words, primary keyword once.
- `about`: exactly 5 strings.
  1. Lead, 45 to 70 words. First sentence contains the primary keyword and says what the tool does. Mention who needs it and the problem it solves.
  2. Left column, paragraph 1, 55 to 85 words: the concept. Explain the topic like an expert so a beginner understands, using the related terms an expert would naturally use.
  3. Left column, paragraph 2, 55 to 85 words: practical guidance. Real rules, numbers, limits, common mistakes, one concrete example.
  4. Right column, paragraph 1, 55 to 85 words: how THIS tool works. Its actual inputs, options, defaults and buttons, in the order a person uses them.
  5. Right column, paragraph 2, 55 to 85 words: when to use it, what it does with the user's data (accurate to the code), its limits, and one useful closing tip. No generic call to action.
  The left pair and the right pair must be close in total length (within 15 words) so the two columns look even. Plain text only: no markdown, bullets, headings, emojis or links.
- `faq`: 6 questions by default. Use 8 only for tier A (or A+) tools and only if you can write 8 genuinely different, useful questions. Never pad. Phrase each question the way people search it. Each answer is 35 to 75 words: the first sentence is the direct answer (yes, no, a number or a rule), then one or two supporting sentences. Do not repeat the About text. Include one question about how the tool handles data or its limits, answered only from the code facts.
- `highlights`: 2 or 3 small badges, `{ icon, label }`, label under 42 characters. The icon must be a name registered in the `ICONS` object in `src/components/ui/Icon.js`. Every label must be true for this specific tool (for example "Free, no sign-up", or "Saves your last 10 links on this device"). Never write "100% private" or "runs in your browser" unless the code proves it.

Total copy per page: about 600 to 900 words.

## KEYWORD RULES

- Primary keyword: `seoTitle`, `seoDescription`, `h1`, `shortDescription`, the first sentence of the lead, and at most 2 more natural mentions across the rest of the About and FAQ (3 in total across About + FAQ). Use variants (plural, reordered, synonym) instead of repeating the exact phrase.
- Secondary keyword: once in the About body and once in the FAQ.
- Extra ideas: use only if they fit naturally, once each.
- Answer the likely search intent within the first 100 words. Cover the related concepts, entities and questions a topic expert would cover (semantic coverage), not just the keyword.
- If a sentence sounds forced because of a keyword, rewrite the sentence.

## STYLE RULES (make it sound human)

- Active voice in at least 90% of sentences. Speak to the reader as "you". Write like a practitioner explaining something to a colleague.
- Mix short and medium sentences (average 14 to 18 words). Contractions are fine.
- Give concrete examples with real numbers or sample inputs, but only ones you can verify from the code or from well-known facts.
- No em dashes or en dashes. Use commas and periods.
- Do not start two sentences in a row with the same word. Do not open every paragraph with the tool name. Do not summarize at the end of a paragraph.
- Banned words and phrases: in today's digital world, seamless, powerful, robust, leverage, unlock, elevate, game-changer, dive into, navigate, delve, harness, streamline, cutting-edge, comprehensive, ultimate guide, look no further, it's important to note, whether you're a ... or a ..., not just ... but also ..., moreover, furthermore, additionally, in conclusion.
- No claims you cannot support: "free forever", "no limits", "unlimited", "instant", "most accurate", invented statistics, fake testimonials.
- Calculators and any health, money or legal topic: include one clear sentence that results are estimates, not professional advice.
- Each page must feel different. Vary how leads begin across tools (start with a problem, an example, or a fact). Never reuse a sentence frame from another tool, including the ones already in `toolSeo.js`.
- Mention the brand name "Toolslay" at most once per page, preferably never.

## STEP 4: DO THE WORK

1. Add or replace the entries in `src/data/toolSeo.js` using double-quoted strings (escape any double quote inside a string). Keep the file data-only: no imports.
2. Run `npm run check:seo -- --slug <the slugs you just wrote>`. Fix every `ERR` and every `WARN` you agree with, then run it again until there are no errors. For each warning you leave unfixed, say why.
3. Do not run the dev server or a full build unless a check fails in a way you cannot explain.

## OUTPUT FORMAT (your final message, nothing else)

For each tool:
1. "Tool facts" (max 8 short lines, with the file each fact came from).
2. "Check before publishing" (max 5 bullets): any fact I should verify, any mismatch between the keyword and what the tool can do, and any false claim or bug you noticed inside the tool's own on-screen text.
Finish with the final `check:seo` result line.

Start with these tools:

<paste the tool blocks here>

----------------------------------------------------------------------------------------------------
