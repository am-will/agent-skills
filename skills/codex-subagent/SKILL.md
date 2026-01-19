---
name: codex-subagent
description: >
  Spawn autonomous Codex subagents via background shell to offload context-heavy work.
  Auto-trigger for: deep research (3+ searches), codebase exploration (6+ files), multi-step
  workflows, exploratory tasks, long-running operations, documentation generation. Subagents
  run in full-auto mode, act autonomously, use smart model selection (mini for pure search, inherit
  parent for multi-step). Can spawn up to 5 parallel subagents.
---

# Codex Subagent Skill

Spawn autonomous subagents to offload context-heavy work. Subagents burn their own tokens, return only final results.

## When to Use

**Auto-trigger when:**
- 3+ web searches expected
- 6+ file reads required
- Multi-step workflows (only final result matters)
- Exploratory/discovery tasks (unknown scope)
- Long-running operations (verbose output)
- Documentation/analysis generation

**Golden Rule:** If task + intermediate work would add 3,000+ tokens to parent context → use subagent.

## Intelligent Prompting

**Critical: Parent agent must provide subagent with essential context for success.**

### Good Prompting Principles

1. **Include relevant context** - Give the subagent what it needs to find the right information
2. **Be specific** - Clear constraints, requirements, output format
3. **Provide direction** - Where to look, what sources to prioritize
4. **Define success** - What constitutes a complete answer

### Examples

❌ **Bad:** "Research authentication"

✅ **Good:** "Research authentication in this Next.js codebase. Focus on: 1) Session management strategy (JWT vs session cookies), 2) Auth provider integration (NextAuth, Clerk, etc), 3) Protected route patterns. Check /app, /lib/auth, and middleware files. Return architecture summary with code examples."

❌ **Bad:** "Search for news"

✅ **Good:** "Find the most recent Codex SDK documentation and summarize key updates. Focus on: 1) Installation/quickstart, 2) Core API methods and parameters, 3) Breaking changes or deprecations. Prioritize official OpenAI docs and release notes. Return a concise summary with citations."

❌ **Bad:** "Find API endpoints"

✅ **Good:** "Find all REST API endpoints in this Express.js app. Look in /routes, /api, and /controllers directories. For each endpoint document: method (GET/POST/etc), path, auth requirements, request/response schemas. Return as markdown table."

### Prompting Template

```
[TASK CONTEXT]
You are researching/analyzing [SPECIFIC TOPIC] in [LOCATION/CODEBASE/DOMAIN].

[OBJECTIVES]
Your goals:
1. [Primary objective with specifics]
2. [Secondary objective]
3. [Tertiary objective if needed]

[CONSTRAINTS]
- Focus on: [specific areas/files/sources]
- Prioritize: [what matters most]
- Ignore: [what to skip]

[OUTPUT FORMAT]
Return: [exactly what format parent needs]

[SUCCESS CRITERIA]
Complete when: [specific conditions met]
```

## Model Selection

### Use Mini Model (gpt-5.1-codex-mini + medium)
**Pure search only** - no additional work after gathering info:
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m gpt-5.1-codex-mini -c 'model_reasoning_effort="medium"' \
  "Search web for [TOPIC] and summarize findings"
```

### Inherit Parent Model + Reasoning
**Multi-step workflows** - search + analyze/refactor/generate:
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" \
  "Find auth files THEN analyze security patterns and propose improvements"
```

### Decision Logic
```
Is task PURELY search/gather?
├─ YES: Any work after gathering?
│  ├─ NO → mini model
│  └─ YES → inherit parent
└─ NO → inherit parent
```

## Basic Usage

```bash
# Get parent session settings (respects active profile; falls back to top-level)
read -r MODEL REASONING < <(scripts/codex-parent-settings.sh)

# Spawn subagent (inherit parent)
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" \
  "DETAILED_PROMPT_WITH_CONTEXT"

# Pure search (use mini)
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m gpt-5.1-codex-mini -c 'model_reasoning_effort="medium"' \
  "SEARCH_ONLY_PROMPT"

# JSON output for parsing
codex exec --dangerously-bypass-approvals-and-sandbox --json "PROMPT" | jq -r 'select(.event=="turn.completed") | .content'
```

## Parallel Subagents (Up to 5)

Spawn multiple subagents for independent tasks:
```bash
# Research 3 different topics simultaneously
codex exec --dangerously-bypass-approvals-and-sandbox -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" "Research topic A..." &
codex exec --dangerously-bypass-approvals-and-sandbox -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" "Research topic B..." &
codex exec --dangerously-bypass-approvals-and-sandbox -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" "Research topic C..." &
wait
```

## Key Parameters

| Flag | Purpose |
|------|---------|
| `--dangerously-bypass-approvals-and-sandbox` | **Required** - Full autonomy, bypass approvals + sandbox |
| `-m X` | Specify model (mini for search, parent for multi-step) |
| `-c model_reasoning_effort="X"` | Specify reasoning level (TOML string) |
| `--json` | Machine-readable output |
| `--output-last-message, -o` | Save final result to file |
| `--skip-git-repo-check` | Allow outside git repos |

## Full-Auto Mode

All subagents run in full-auto mode (bypass approvals + sandboxing):
- Act autonomously, no permission asking
- Make decisions and proceed boldly
- Only pause for destructive operations (data loss, external impact, security)
- Complete task fully before returning

## Monitoring

**Actively monitor** - don't fire-and-forget:
1. Check completion status
2. Verify quality of results
3. Retry if failed
4. Answer follow-up questions if subagent was blocked

## Examples

**Pure Web Search (mini):**
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m gpt-5.1-codex-mini -c 'model_reasoning_effort="medium"' \
  "Find the most recent Codex SDK documentation. Summarize: install/quickstart, core API methods, and any breaking changes. Prioritize official OpenAI docs and release notes. Return a concise summary with citations."
```

**Codebase Analysis (inherit parent):**
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" \
  "Analyze authentication in this Next.js app. Check /app, /lib/auth, middleware. Document: session strategy, auth provider, protected routes, security patterns. Return architecture diagram (mermaid) + findings."
```

**Research + Proposal (inherit parent):**
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" \
  "Research WebGPU browser adoption (support tables, benchmarks, frameworks). THEN analyze feasibility for our React app. Consider: performance gains, browser compatibility, implementation effort. Return recommendation with pros/cons."
```

## Token Savings

| Task Type | Tokens Saved |
|-----------|-------------|
| Deep web research | 8k-20k |
| Codebase exploration | 5k-15k |
| Documentation generation | 10k-30k |
| API exploration | 4k-12k |
| Parallel tasks (5x) | 25k-75k |

## Config Reference

Parent settings: `~/.codex/config.toml`
```toml
model = "gpt-5.2-codex"
model_reasoning_effort = "high"  # none | minimal | low | medium | high | xhigh
profile = "yolo"                 # optional; when set, profile values override top-level
```

## Docs
- https://developers.openai.com/codex/noninteractive
- https://developers.openai.com/codex/cli/reference#codex-exec
