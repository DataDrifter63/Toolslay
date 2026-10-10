# Blog formatting cheat sheet

Write posts in the admin editor as normal text. For anything fancier, use the **Insert block** buttons above the
editor (they paste ready-made examples), or type the syntax below. The Preview tab shows exactly what readers see.

## Normal text

| You type | You get |
| --- | --- |
| `## Section title` | big section heading (shows in the table of contents) |
| `### Smaller heading` | sub heading |
| `**bold**`, `*italic*`, `~~strike~~`, `==highlight==` | formatting |
| `[link text](https://example.com)` or `[tool](/tools/password-generator)` | link (external links open in a new tab) |
| `![caption](https://image-url)` on its own line | full-width image with caption |
| `- item` / `1. item` / `- [ ] task` | bullet list / numbered list / checklist |
| `> quote` | quote block |
| `---` | divider line |
| `` `code` `` and ``` fenced code blocks ``` | code |

Tip: start sections with `##`. Never use `#`: the post title is already the page's main heading.

## Tables, including VS tables

```
| Feature | Tool A | Tool B |
| --- | :---: | :---: |
| Free to use | ✓ | ✓ |
| No sign-up | ✓ | ✗ |
```

- First column becomes the row label. `:---:` centers a column, `---:` right-aligns it.
- A cell that is only `✓` or `✗` turns into a green or red badge.

## Blocks

Every block starts with `:::name` and ends with `:::` on its own line.

| Block | Example |
| --- | --- |
| Callouts: `tip`, `note`, `info`, `warning`, `danger`, `success` | `:::tip Pro tip` then text then `:::` (title is optional) |
| Key takeaways box | `:::takeaways` then a `- list` then `:::` |
| VS cards (two sides split by a `---` line) | `:::vs Option A \| Option B` ... `---` ... `:::` |
| Pros and cons (pros, `---`, cons) | `:::proscons` (or `:::proscons Good \| Bad`) |
| Steps | `:::steps` then `1. **Step title.** text` lines then `:::` |
| Link cards | `:::cards` then `- Title \| Description \| /tools/slug` lines then `:::` |
| Big numbers | `:::stats` then `- 128 \| bits in a UUID` lines then `:::` |
| FAQ accordion (adds FAQ schema for Google) | `:::faq` then `### Question?` + answer, repeat, then `:::` |

## Cards that link elsewhere (internal linking)

These are **one line, no closing `:::` needed**:

| Syntax | Result |
| --- | --- |
| `:::tool password-generator` | inline "Free tool" card with a **Try it now** button |
| `:::tool password-generator, passphrase-generator` | several tool cards in a row |
| `:::post how-long-should-a-password-be` | **Read next** card for another blog post (cover, title, summary) |

In the editor use **Tool card** / **Post card**: search, click, and the line is inserted for you.

## "Try it now" card at the end of the post

In the editor's **Related tool(s)** field, pick up to 3 tools. The first becomes the big **Try it now** card under
the article (and a small card in the sidebar on desktop); the others appear as regular tool cards.

## Prompt for AI (Antigravity, etc.) when you want it to write a post in this format

> Write a blog post in Markdown for Toolslay about: <topic>. Related tool slug(s): <slugs>. Target keyword: <keyword>.
> Use only `##` and `###` headings (never `#`). Use plain, active, human-sounding sentences. Include: a short intro,
> a `:::takeaways` block, at least one `|` comparison table or `:::vs` block, one `:::tip` or `:::warning` callout,
> a `:::steps` block if the post is a how-to, one `:::tool <slug>` card where the tool is first mentioned, a
> `:::post <existing-slug>` card if a related post exists, and a `:::faq` block with 4 questions.
> Only state facts about the tool that are true for the real tool in src/tools-impl/. Return Markdown only.
