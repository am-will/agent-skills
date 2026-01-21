---
name: codex-subagent
description: >
  Spawn Codex subagents via background shell to offload context-heavy work.
  Use for: deep research (3+ searches), codebase exploration (8+ files), multi-step
  workflows, exploratory tasks, long-running operations, documentation generation, or any other task
  where the intermediate steps will use large numbers of tokens.
---

# Codex Subagent Skill

Spawn autonomous subagents to offload context-heavy work. Subagents burn their own tokens, return only final results.

**Golden Rule:** If task + intermediate work would add 3,000+ tokens to parent context → use subagent.

## Intelligent Prompting

**Critical: Parent agent must provide subagent with essential context for success.**

### Good Prompting Principles

1. **Include relevant context** - Give the subagent thorough context
2. **Be specific** - Clear constraints, requirements, output format
3. **Provide direction** - Where to look, what sources to prioritize
4. **Define success** - What constitutes a complete answer

### Examples

❌ **Bad:** "Research authentication"

✅ **Good:** "Research authentication in this Next.js codebase. Focus on: 1) Session management strategy (JWT vs session cookies), 2) Auth provider integration (NextAuth, Clerk, etc), 3) Protected route patterns. Check /app, /lib/auth, and middleware files. Return architecture summary with code examples."

❌ **Bad:** "Search for Codex SDK"

✅ **Good:** "Find the most recent Codex SDK documentation and summarize key updates. Focus on: 1) Installation/quickstart, 2) Core API methods and parameters, 3) Breaking changes or deprecations. Prioritize official OpenAI docs and release notes. Return a concise summary with citations."

❌ **Bad:** "Find API endpoints"

✅ **Good:** "Find all REST API endpoints in this Express.js app. Look in /routes, /api, and /controllers directories. For each endpoint document: method (GET/POST/etc), path, auth requirements, request/response schemas. Return as markdown table."

### Prompting Template

```
[TASK CONTEXT]
You are researching/analyzing [SPECIFIC TOPIC] in [LOCATION/CODEBASE/DOMAIN].

[OBJECTIVES]
Your goals:
1. [1st objective with specifics]
2. [2nd objective]
3. [3rd objective if needed]

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
**Pure search only** - no additional work after gathering info.

#### Bash (Linux/macOS)
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m gpt-5.1-codex-mini -c 'model_reasoning_effort="medium"' \
  "Search web for [TOPIC] and summarize findings"
```

#### PowerShell (Windows)
```powershell
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
  -m gpt-5.1-codex-mini -c 'model_reasoning_effort="medium"' `
  "Search web for [TOPIC] and summarize findings"
```

### Inherit Parent Model + Reasoning
**Multi-step workflows** - search + analyze/refactor/generate:

#### Bash (Linux/macOS)
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" \
  "Find auth files THEN analyze security patterns and propose improvements"
```

#### PowerShell (Windows)
```powershell
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
  -m $MODEL -c "model_reasoning_effort=`"$REASONING`"" `
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

### Bash (Linux/macOS)

```bash
# Get parent session settings (respects active profile; falls back to top-level)
# NOTE: codex-parent-settings.sh prints two lines; use mapfile to avoid empty REASONING.
mapfile -t _settings < <(scripts/codex-parent-settings.sh)
MODEL="${_settings[0]}"
REASONING="${_settings[1]}"

# Spawn subagent (inherit parent)
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" \
  "DETAILED_PROMPT_WITH_CONTEXT"

# Safer prompt construction (no backticks / command substitution)
PROMPT=$(cat <<'EOF'
[TASK CONTEXT]
You are analyzing /path/to/repo.

[OBJECTIVES]
1. Do X
2. Do Y

[OUTPUT FORMAT]
Return: path - purpose
EOF
)
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" \
  "$PROMPT"

# Pure search (use mini)
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m gpt-5.1-codex-mini -c 'model_reasoning_effort="medium"' \
  "SEARCH_ONLY_PROMPT"

# JSON output for parsing
codex exec --dangerously-bypass-approvals-and-sandbox --json "PROMPT" | jq -r 'select(.event=="turn.completed") | .content'
```

### PowerShell (Windows)

```powershell
# Get parent session settings (respects active profile; falls back to top-level)
$scriptPath = Join-Path $env:USERPROFILE ".codex\skills\codex-subagent\scripts\codex-parent-settings.ps1"
$settings = & $scriptPath
$MODEL = $settings[0]
$REASONING = $settings[1]

# Spawn subagent (inherit parent)
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
  -m $MODEL -c "model_reasoning_effort=`"$REASONING`"" `
  "DETAILED_PROMPT_WITH_CONTEXT"

# Use here-string for multi-line prompts (avoids escaping issues)
$PROMPT = @'
[TASK CONTEXT]
You are analyzing /path/to/repo.

[OBJECTIVES]
1. Do X
2. Do Y

[OUTPUT FORMAT]
Return: path - purpose
'@

codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
  -m $MODEL -c "model_reasoning_effort=`"$REASONING`"" `
  $PROMPT

# Pure search (use mini)
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
  -m gpt-5.1-codex-mini -c 'model_reasoning_effort="medium"' `
  "SEARCH_ONLY_PROMPT"

# Method 1 (Recommended): Use -o to output directly to file
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
  -m $MODEL -c "model_reasoning_effort=`"$REASONING`"" `
  -o output.txt "PROMPT"
$content = Get-Content -Path output.txt -Raw

# Method 2: Parse JSONL event stream
$jsonl = codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check --json "PROMPT"
$events = $jsonl -split "`n" | Where-Object { $_ } | ForEach-Object { $_ | ConvertFrom-Json }
$content = $events |
    Where-Object -Property type -EQ "item.completed" |
    Where-Object { $_.item.type -eq "agent_message" } |
    Select-Object -ExpandProperty item |
    Select-Object -ExpandProperty text
```

## Parallel Subagents (Up to 5)

Spawn multiple subagents for independent tasks:

### Bash (Linux/macOS)

```bash
# Research different topics simultaneously
codex exec --dangerously-bypass-approvals-and-sandbox -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" "Research topic A..." &
codex exec --dangerously-bypass-approvals-and-sandbox -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" "Research topic B..." &
wait
```

### PowerShell (Windows)

Use PowerShell Jobs for parallel execution with `-o` to output to separate files:

```powershell
# Parallel execution with file output
$job1 = Start-Job -ScriptBlock {
    param($m, $r, $out)
    codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
      -m $m -c "model_reasoning_effort=`"$r`"" -o $out "Research topic A..."
} -ArgumentList $MODEL, $REASONING, "output1.txt"

$job2 = Start-Job -ScriptBlock {
    param($m, $r, $out)
    codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
      -m $m -c "model_reasoning_effort=`"$r`"" -o $out "Research topic B..."
} -ArgumentList $MODEL, $REASONING, "output2.txt"

# Wait for all jobs to complete
$job1, $job2 | Wait-Job | Remove-Job

# Read results
$result1 = Get-Content -Path output1.txt -Raw
$result2 = Get-Content -Path output2.txt -Raw
```

## Output Handling

Codex CLI provides two methods to capture output:

### Method 1: -o Parameter (Recommended)

Use `-o` / `--output-last-message` to write the final message directly to a file:

#### Bash (Linux/macOS)
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" \
  -o result.txt "YOUR_PROMPT"

content=$(cat result.txt)
```

#### PowerShell (Windows)
```powershell
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
  -m $MODEL -c "model_reasoning_effort=`"$REASONING`"" `
  -o result.txt "YOUR_PROMPT"

$content = Get-Content -Path result.txt -Raw
```

**Advantages:**
- No JSON parsing required
- Avoids terminal output truncation issues
- Ideal for long outputs and parallel tasks

### Method 2: JSONL Event Stream Parsing

Use `--json` to get the full event stream and parse manually:

#### Bash (Linux/macOS)
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --json "PROMPT" | jq -r 'select(.event=="turn.completed") | .content'
```

#### PowerShell (Windows)
```powershell
$jsonl = codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check --json "PROMPT"
$events = $jsonl -split "`n" | Where-Object { $_ } | ForEach-Object { $_ | ConvertFrom-Json }
$content = $events |
    Where-Object -Property type -EQ "item.completed" |
    Where-Object { $_.item.type -eq "agent_message" } |
    Select-Object -ExpandProperty item |
    Select-Object -ExpandProperty text
```

**JSONL Event Structure:**
```jsonl
{"type":"item.completed","item":{"id":"item_3","type":"agent_message","text":"..."}}
{"type":"turn.completed","usage":{"input_tokens":24763,"output_tokens":122}}
```

**Key fields:**
- `type == "item.completed"` with `item.type == "agent_message"` → extract `item.text`
- `type == "turn.completed"` → contains token usage stats

## Important
- Act autonomously, no permission asking
- Make decisions and proceed boldly
- Only pause for destructive operations (data loss, external impact, security)
- Complete task fully before returning

## Monitoring

**Actively monitor** - don't fire-and-forget:
1. Check completion status
2. Verify quality results
3. Retry if failed
4. Answer follow-up questions if blocked

## Examples

**Pure Web Search (mini):**

#### Bash (Linux/macOS)
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m gpt-5.1-codex-mini -c 'model_reasoning_effort="medium"' \
  "Search for the latest release notes of Rust 2024 edition. Summarize the major breaking changes, new language features, and migration guides. Focus on the official rust-lang.org blog and documentation."
```

#### PowerShell (Windows)
```powershell
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
  -m gpt-5.1-codex-mini -c 'model_reasoning_effort="medium"' `
  "Search for the latest release notes of Rust 2024 edition. Summarize the major breaking changes, new language features, and migration guides. Focus on the official rust-lang.org blog and documentation."
```

**Codebase Analysis (inherit parent):**

#### Bash (Linux/macOS)
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" \
  "Analyze authentication in this Next.js app. Check /app, /lib/auth, middleware. Document: session strategy, auth provider, protected routes, security patterns. Return architecture diagram (mermaid) + findings."
```

#### PowerShell (Windows)
```powershell
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
  -m $MODEL -c "model_reasoning_effort=`"$REASONING`"" `
  "Analyze authentication in this Next.js app. Check /app, /lib/auth, middleware. Document: session strategy, auth provider, protected routes, security patterns. Return architecture diagram (mermaid) + findings."
```

**Research + Proposal (inherit parent):**

#### Bash (Linux/macOS)
```bash
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -m "$MODEL" -c "model_reasoning_effort=\"$REASONING\"" \
  "Research WebGPU browser adoption (support tables, benchmarks, frameworks). THEN analyze feasibility for our React app. Consider: performance gains, browser compatibility, implementation effort. Return recommendation with pros/cons."
```

#### PowerShell (Windows)
```powershell
codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check `
  -m $MODEL -c "model_reasoning_effort=`"$REASONING`"" `
  "Research WebGPU browser adoption (support tables, benchmarks, frameworks). THEN analyze feasibility for our React app. Consider: performance gains, browser compatibility, implementation effort. Return recommendation with pros/cons."
```

## Config Reference

Parent settings: `~/.codex/config.toml`
```toml
model = "gpt-5.2-codex"
model_reasoning_effort = "high"  # none | minimal | low | medium | high | xhigh
profile = "yolo"                 # optional; when set, profile values override top-level
```
