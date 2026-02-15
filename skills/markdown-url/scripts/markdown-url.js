#!/usr/bin/env node
'use strict';

function normalizeToAbsoluteUrl(input) {
  const s = String(input || '').trim();
  if (!s) return null;

  // If it already looks like http(s), keep it as-is.
  if (/^https?:\/\//i.test(s)) return s;

  // Reject other schemes (mailto:, file:, etc).
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return null;

  // Treat bare hosts/paths as https.
  return 'https://' + s;
}

function toMarkdownNewUrl(input) {
  const abs = normalizeToAbsoluteUrl(input);
  if (!abs) return null;
  return 'https://markdown.new/' + abs;
}

const input = process.argv.slice(2).join(' ');
const out = toMarkdownNewUrl(input);
if (!out) {
  process.stderr.write('Usage: markdown-url <http(s)://url | host/path>\\n');
  process.exit(2);
}
process.stdout.write(out + '\n');
