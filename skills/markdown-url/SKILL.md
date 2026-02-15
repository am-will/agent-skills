---
name: markdown-url
description: |
  Route any website you need to visit through markdown.new by prefixing the URL.

  **WHEN TO USE:**
  - You would normally open a website link to read content (docs, blog posts, changelogs, GitHub issues, etc.)
  - You need a cleaner, Markdown-friendly view for copying notes or summarizing
---

# markdown.new URL Prefix

Whenever you need to visit a website URL, you must:
1) rewrite it to go through `https://markdown.new/`, then
2) visit the rewritten URL, and
3) pull the Markdown content from that page for use in your answer/notes.

## Rewrite Rule

1. Normalize the destination into an absolute URL with a scheme (`https://` preferred).
2. Prefix it with `https://markdown.new/` (do not drop the original scheme).

### Examples

- `https://example.com` -> `https://markdown.new/https://example.com`
- `https://example.com/docs?a=1#b` -> `https://markdown.new/https://example.com/docs?a=1#b`
- `example.com` -> `https://markdown.new/https://example.com`

## Agent Workflow (Required)

When you would normally open a website to read it:

1. Produce the rewritten `markdown.new` URL.
2. Visit the rewritten URL (not the original).
3. Extract the page content from the Markdown view (the rendered Markdown and/or the raw Markdown).
4. Use that extracted Markdown as the source for summaries, quotes, checklists, or copy/pasteable notes.

If the `markdown.new` view fails to load or breaks critical functionality, fall back to the original URL for browsing, but still prefer `markdown.new` for any content extraction if possible.

## Notes / Exceptions

- Keep this for reading/browsing. For API endpoints, OAuth flows, file uploads, or anything that depends on cookies/login state, use the original URL if the proxy breaks functionality.
- Do not rewrite local paths (`./README.md`) or non-HTTP(S) schemes.

## Optional CLI Helper

Convert a URL into its markdown.new-prefixed form:

```bash
node skills/markdown-url/scripts/markdown-url.js "https://example.com/docs"
```
