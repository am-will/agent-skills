---
name: read-github
description: |
  Read and search GitHub repository documentation via gitmcp.io MCP service.

  **WHEN TO USE:**
  - User provides a GitHub URL
  - User mentions a specific repo in owner/repo format
  - User asks "what does this repo do?", "read the docs for X repo", or similar
  - User wants to search code or docs within a repo
---

# Read GitHub Docs

Access GitHub repository documentation and code via the gitmcp.io MCP service.

## URL Conversion

Convert GitHub URLs to gitmcp.io:
- `github.com/owner/repo` → `gitmcp.io/owner/repo`
- `https://github.com/karpathy/llm-council` → `https://gitmcp.io/karpathy/llm-council`

## CLI Usage

The `scripts/gitmcp.py` script provides CLI access to repository docs.

### List Available Tools

```bash
python3 scripts/gitmcp.py list-tools owner/repo
```

### Fetch Documentation

Retrieves the full documentation file (README, docs, etc.):

```bash
python3 scripts/gitmcp.py fetch-docs owner/repo
```

### Search Documentation

Semantic search within repository documentation:

```bash
python3 scripts/gitmcp.py search-docs owner/repo "query"
```

### Search Code

Search code using GitHub Search API (exact match):

```bash
python3 scripts/gitmcp.py search-code owner/repo "function_name"
```

### Fetch Referenced URL

Fetch content from URLs mentioned in documentation:

```bash
python3 scripts/gitmcp.py fetch-url owner/repo "https://example.com/doc"
```

### Direct Tool Call

Call any MCP tool directly:

```bash
python3 scripts/gitmcp.py call owner/repo tool_name '{"arg": "value"}'
```

## Tool Names

Tool names are dynamically prefixed with the repo name (underscored):
- `karpathy/llm-council` → `fetch_llm_council_documentation`
- `facebook/react` → `fetch_react_documentation`
- `my-org/my-repo` → `fetch_my_repo_documentation`

## Available MCP Tools

For any repository, these tools are available:

1. **fetch_{repo}_documentation** - Fetch entire documentation. Call first for general questions.
2. **search_{repo}_documentation** - Semantic search within docs. Use for specific queries.
3. **search_{repo}_code** - Search code via GitHub API (exact match). Returns matching files.
4. **fetch_generic_url_content** - Fetch any URL referenced in docs, respecting robots.txt.

## Workflow

1. When given a GitHub repo, first fetch documentation to understand the project
2. Use search-docs for specific questions about usage or features
3. Use search-code to find implementations or specific functions
4. Use fetch-url to retrieve external references mentioned in docs
