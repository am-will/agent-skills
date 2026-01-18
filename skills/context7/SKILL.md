---
name: context7
description: |
  Fetch up-to-date library documentation via Context7 API. Use PROACTIVELY when:
  (1) Working with ANY external library (React, Next.js, Supabase, etc.)
  (2) User asks about library APIs, patterns, or best practices
  (3) Implementing features that rely on third-party packages
  (4) Debugging library-specific issues
  (5) Need current documentation beyond training data cutoff
  (6) AND MOST IMPORTANTLY, when you are installing dependencies, libraries, or frameworks you should ALWAYS check the docs to see what the latest versions are. Do not rely on outdated knowledge.
  Always prefer this over guessing library APIs or using outdated knowledge.
---

# Context7 Documentation Fetcher

Retrieve current library documentation via Context7 API.

## Authentication

This skill requires a Context7 API key in `CONTEXT7_API_KEY`.

Recommended setup options:
1) Export it in your shell profile (global):

```bash
export CONTEXT7_API_KEY="your-context7-key"
```

2) Use a local `.env` file (per-repo):

```bash
cp skills/context7/.env.example .env
set -a; source .env; set +a
```

## Workflow

### 1. Search for the library

```bash
python3 ~/.codex/skills/context7/scripts/context7.py search "<library-name>"
```

Example:
```bash
python3 ~/.codex/skills/context7/scripts/context7.py search "next.js"
```

Returns library metadata including the `id` field needed for step 2.

### 2. Fetch documentation context

```bash
python3 ~/.codex/skills/context7/scripts/context7.py context "<library-id>" "<query>"
```

Example:
```bash
python3 ~/.codex/skills/context7/scripts/context7.py context "/vercel/next.js" "app router middleware"
```

Options:
- `--type txt|md` - Output format (default: txt)
- `--tokens N` - Limit response tokens

## Quick Reference

| Task | Command |
|------|---------|
| Find React docs | `search "react"` |
| Get React hooks info | `context "/facebook/react" "useEffect cleanup"` |
| Find Supabase | `search "supabase"` |
| Get Supabase auth | `context "/supabase/supabase" "authentication row level security"` |

## When to Use

- Before implementing any library-dependent feature
- When unsure about current API signatures
- For library version-specific behavior
- To verify best practices and patterns
