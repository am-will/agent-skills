---
name: codex-subagent
description: >
  Spawn autonomous Codex subagents via background shell to offload context-heavy work.
  USE THIS SKILL automatically when (1) Deep research requiring 5+ web searches or source analysis,
  (2) Codebase exploration across many files, (3) Multi-step workflows where only the
  final result matters, (4) Parallel independent tasks (up to 5 subagents simultaneously),
  (5) Exploratory/discovery tasks with uncertain scope, (6) Long-running operations with
  verbose intermediate output, (7) Documentation or analysis generation, (8) ANY task
  where the work + context would pollute the parent context window. User can also
  explicitly request "use a subagent" or "spawn a subagent". Subagents run in YOLO mode
  (--yolo), act autonomously and boldly, only pausing for potentially destructive operations.
---

# Subagent Skill

Spawn autonomous Codex subagents via background shell to offload context-heavy work. Subagents burn their own context window doing the heavy lifting, then return only clean, synthesized results to the parent.

**All subagents run in YOLO mode by default** (`--yolo` flag).

## Inheriting Parent Settings

**Subagents inherit the parent's model and reasoning level by default** unless explicitly overridden or optimized for pure search tasks.

### Model Selection Strategy

Choose the appropriate model based on task complexity:

#### Use Cheap Model (gpt-5.1-codex-mini + medium reasoning)

Use when the task is **PURELY web search** or **PURELY codebase search** with no additional work:

```bash
# Pure web search - use mini model
codex exec --yolo --skip-git-repo-check \
  -c model=gpt-5.1-codex-mini \
  -c model_reasoning_effort=medium \
  "Search the web for latest news on [TOPIC] and summarize findings"

# Pure codebase search - use mini model
codex exec --yolo --skip-git-repo-check \
  -c model=gpt-5.1-codex-mini \
  -c model_reasoning_effort=medium \
  "Search the codebase for all authentication-related files and list them"
```

**When to use mini model:**
- Task is ONLY web search + summarize
- Task is ONLY codebase search + list/report findings
- No analysis, refactoring, or complex reasoning required
- Just information gathering and basic synthesis

#### Inherit Parent Model/Reasoning

Use parent's model/reasoning when the task is a **multi-step workflow** (search + additional work):

```bash
# Multi-step: search THEN analyze - inherit parent
codex exec --yolo --skip-git-repo-check \
  -c model=gpt-5.2-codex \
  -c model_reasoning_effort=high \
  "Search the codebase for authentication files, THEN analyze the security patterns and identify vulnerabilities"

# Multi-step: research THEN create - inherit parent
codex exec --yolo --skip-git-repo-check \
  -c model=gpt-5.2-codex \
  -c model_reasoning_effort=high \
  "Research WebGPU adoption, THEN write a technical proposal for integrating it into our project"
```

**When to inherit parent model:**
- Task involves search + analysis
- Task involves search + refactoring
- Task involves search + code generation
- Task involves search + decision-making
- Any multi-step workflow beyond pure information gathering

### How to Inherit

Before spawning a subagent, read the parent's config to get model and reasoning settings:

```bash
# Read parent's model and reasoning level from config
grep -E "^model|^model_reasoning_effort" ~/.codex/config.toml
```

Config location: `~/.codex/config.toml`
Key settings:
- `model` - e.g., "gpt-5.2-codex"
- `model_reasoning_effort` - e.g., "high", "medium", "low"

### Passing Settings to Subagent

Pass inherited or optimized settings via `-c` config overrides:

```bash
# Full subagent invocation with inherited settings
codex exec --yolo --skip-git-repo-check \
  -c model=gpt-5.2-codex \
  -c model_reasoning_effort=high \
  "TASK DESCRIPTION"
```

### Inheritance Rules

1. **Pure search tasks**: Use `gpt-5.1-codex-mini` + `medium` reasoning (cost optimization)
2. **Multi-step workflows**: Inherit parent's model + reasoning (need full capability)
3. **User-specified**: If user explicitly requests a model, use that
4. **Default fallback**: If unsure, inherit parent's settings

### Decision Tree

```
Is the task PURELY web search or codebase search?
├─ YES: Is there any additional work after the search?
│  ├─ NO → Use gpt-5.1-codex-mini + medium reasoning
│  └─ YES → Inherit parent model + reasoning
└─ NO → Inherit parent model + reasoning
```

### Quick Reference Table

| Task Type | Model | Reasoning | Example |
|-----------|-------|-----------|---------|
| Pure web search | gpt-5.1-codex-mini | medium | "Search web for news on X" |
| Pure codebase search | gpt-5.1-codex-mini | medium | "Find all files related to auth" |
| Search + analyze | Inherit parent | Inherit parent | "Search + analyze security patterns" |
| Search + refactor | Inherit parent | Inherit parent | "Find deprecated code + update it" |
| Search + generate | Inherit parent | Inherit parent | "Research + write proposal" |
| Complex workflow | Inherit parent | Inherit parent | Any multi-step beyond search |

## When to Spawn Subagents

### Automatic Triggers (Use Judgment)

Spawn a subagent when ANY of these conditions apply:

| Condition | Why Subagent? |
|-----------|---------------|
| **5+ web searches expected** | Research pollutes context with source material |
| **Reading 8+ files** | Codebase exploration generates massive intermediate context |
| **Multi-step workflow** | Intermediate steps don't matter, only final output |
| **Exploratory/discovery task** | Unknown scope = unpredictable context growth |
| **Long-running operation** | Verbose progress output clutters parent context |
| **Data analysis** | Raw data + processing steps = context bloat |
| **Documentation generation** | Reading entire codebases to synthesize docs |
| **Migration/refactoring analysis** | Understanding large-scale changes |
| **Log/error analysis** | Parsing large logs, stack traces, debug output |
| **API exploration** | Testing endpoints, reading responses, mapping schemas |
| **Dependency auditing** | Scanning package trees, security advisories |
| **Test suite analysis** | Running/analyzing comprehensive test results |
| **Competitive research** | Analyzing multiple products/services |
| **Writing long-form content** | Drafts, revisions, research for articles/docs |

### User-Invoked

User can explicitly request subagent usage:
- "Use a subagent for this"
- "Spawn a subagent to..."
- "Have a subagent research..."
- "Run this in the background"
- "Offload this task"

### The Golden Rule

**If the task + all its intermediate context would pollute the parent's context window, use a subagent.**

Think of it this way: Will completing this task generate 3,000+ tokens of intermediate work (searches, file reads, analysis steps) that the parent doesn't need to see? If yes → subagent.

## Parallel Subagents

You can spawn **up to 5 subagents simultaneously** for independent tasks:

```bash
# Example: Researching multiple topics in parallel
# Subagent 1: Research topic A
# Subagent 2: Research topic B  
# Subagent 3: Analyze codebase module X
# Subagent 4: Analyze codebase module Y
# Subagent 5: Generate documentation

# Each runs in its own background shell, burning its own context
```

**When to parallelize:**
- Multiple independent research topics
- Analyzing different parts of a codebase
- Running different types of analysis on same data
- Generating multiple deliverables
- Any N independent subtasks where N ≤ 5

## YOLO Mode (Default for All Subagents)

**All subagents use `--yolo` flag by default.** This bypasses approval prompts and sandboxing for maximum autonomy.

```bash
# Standard subagent invocation - ALWAYS use --yolo
codex exec --yolo "TASK DESCRIPTION"
```

### Why YOLO is Default

1. **Subagents should act, not ask** - They're spawned to do a job autonomously
2. **No back-and-forth** - Parent can't easily interact with background subagent
3. **Speed matters** - Waiting for approvals defeats the purpose
4. **Isolated context** - Subagent mistakes don't pollute parent; can retry

### Autonomy Principles

1. **Act boldly** - Don't hesitate, don't second-guess, execute the task
2. **No permission asking** - Proceed without checking back with parent
3. **Make decisions** - Choose the best path forward autonomously
4. **Handle obstacles** - Work around issues, try alternatives
5. **Complete the mission** - Don't stop until the task is done or clearly impossible

### Only Pause For Truly Destructive Operations

Subagents should ONLY stop to confirm if the action could be:
- **Irreversibly destructive** (deleting production data, force-pushing to main)
- **Externally impactful** (sending emails, making payments, posting publicly)
- **Security-sensitive** (exposing credentials, modifying auth systems)

Everything else: **just do it**.

## Spawning a Subagent

Use the experimental **`background` shell** tool:

```bash
# Standard subagent with inherited settings
codex exec --yolo --skip-git-repo-check \
  -c model=$(grep "^model = " ~/.codex/config.toml | cut -d'"' -f2) \
  -c model_reasoning_effort=$(grep "^model_reasoning_effort" ~/.codex/config.toml | cut -d'"' -f2) \
  "TASK DESCRIPTION"

# Simplified (if you know the settings)
codex exec --yolo --skip-git-repo-check \
  -c model=gpt-5.2-codex \
  -c model_reasoning_effort=high \
  "TASK DESCRIPTION"

# With JSON output for parsing results
codex exec --yolo --json "TASK" | jq -r 'select(.event=="turn.completed") | .content'

# Capture result to file
codex exec --yolo --output-last-message /tmp/result.txt "TASK"
```

### Subagent Prompt Template

When spawning, instruct the subagent clearly:

```
You are a subagent working autonomously in YOLO mode. Your task: [TASK]

Instructions:
- Act boldly and autonomously - do not ask for permission
- Make decisions and proceed without hesitation
- Only pause for potentially destructive operations (data loss, external impact)
- Complete the task fully before returning results
- Return a clean, synthesized summary of findings/work done

Begin immediately.
```

## Monitoring Subagents

**Actively monitor** subagent progress to ensure success:

1. **Check completion** - Ensure the task finished successfully
2. **Handle follow-ups** - If subagent encountered blockers, address them
3. **Verify quality** - Check that the output meets the task requirements
4. **Retry if needed** - Spawn another subagent if the first failed
5. **Answer questions** - If subagent needed info it couldn't find, provide it

```bash
# Monitor with JSON events
codex exec --yolo --json "TASK" | jq -c 'select(.event | test("started|completed|failed|error"))'
```

## Token Savings

| Task Type | Context Saved | Notes |
|-----------|--------------|-------|
| Deep web research | 8,000-20,000 | Multiple sources, quotes, synthesis |
| Codebase exploration | 5,000-15,000 | File contents, patterns, analysis |
| Documentation generation | 10,000-30,000 | Full codebase read + writing |
| Log analysis | 3,000-10,000 | Raw logs + parsing + findings |
| API exploration | 4,000-12,000 | Requests, responses, schemas |
| Parallel tasks (5x) | 25,000-75,000 | Multiply by number of subagents |

## Examples

### Pure Web Search (use mini model)
```bash
# Pure search task - use cheap model
codex exec --yolo --skip-git-repo-check \
  -c model=gpt-5.1-codex-mini -c model_reasoning_effort=medium \
  "Search the web for today's news about Iran protests and summarize key developments."
```

### Pure Codebase Search (use mini model)
```bash
# Pure search task - use cheap model
codex exec --yolo --skip-git-repo-check \
  -c model=gpt-5.1-codex-mini -c model_reasoning_effort=medium \
  "Search the codebase for all files related to authentication and list them with brief descriptions."
```

### Research + Analysis (inherit parent model)
```bash
# Multi-step: research THEN analyze - inherit parent
codex exec --yolo --skip-git-repo-check \
  -c model=gpt-5.2-codex -c model_reasoning_effort=high \
  "Research the current state of WebGPU adoption. Search multiple sources, find browser support tables, performance benchmarks, and major frameworks using it. THEN analyze the feasibility of integrating it into our project. Return comprehensive summary with recommendations."
```

### Codebase Search + Analysis (inherit parent model)
```bash
# Multi-step: search THEN analyze - inherit parent
codex exec --yolo --skip-git-repo-check \
  -c model=gpt-5.2-codex -c model_reasoning_effort=high \
  "Find all authentication-related files in this codebase, THEN analyze the security patterns and identify potential vulnerabilities. Return architecture diagram (mermaid) and findings."
```

### Parallel Documentation (3 subagents, all multi-step)
```bash
# All involve search + synthesis, so inherit parent model

# Subagent 1:
codex exec --yolo -c model=gpt-5.2-codex -c model_reasoning_effort=high \
  "Document the API layer: endpoints, request/response schemas, error handling."

# Subagent 2:
codex exec --yolo -c model=gpt-5.2-codex -c model_reasoning_effort=high \
  "Document the data layer: models, migrations, relationships, queries."

# Subagent 3:
codex exec --yolo -c model=gpt-5.2-codex -c model_reasoning_effort=high \
  "Document the frontend: components, state management, routing."
```

## Key Parameters

| Flag | Description |
|------|-------------|
| `--yolo` | **ALWAYS USE** - Bypass approvals and sandboxing for full autonomy |
| `-c model=X` | Inherit/override model (default: inherit from parent) |
| `-c model_reasoning_effort=X` | Inherit/override reasoning level (high/medium/low) |
| `--json` | Machine-readable JSONL output |
| `--output-last-message, -o` | Write final message to file |
| `-m, --model` | Shorthand model override |
| `-C, --cd` | Set workspace root for subagent |
| `--skip-git-repo-check` | Allow running outside git repo |

### Flag Comparison

| Flag | Approvals | Sandbox | Use Case |
|------|-----------|---------|----------|
| `--yolo` | **Bypassed** | **Bypassed** | **Default for subagents** - full autonomy |
| `--full-auto` | On-request | workspace-write | Lower autonomy, more guardrails |
| (neither) | Required | read-only | Interactive use only |

## Important Notes

- **Always use `--yolo`** for subagent execution - this is the default
- **Inherit model/reasoning** from parent unless explicitly overriding
- **Monitor actively** - don't fire-and-forget, verify completion and handle follow-ups
- **Up to 5 parallel** - but only for truly independent tasks
- **Subagent context is discarded** - only final output returns to parent
- **Can resume sessions** with `codex exec resume --last` if needed

## Config Reference

Parent config location: `~/.codex/config.toml`

Relevant settings:
```toml
model = "gpt-5.2-codex"
model_reasoning_effort = "high"  # high | medium | low
```

## Docs

- https://developers.openai.com/codex/noninteractive
- https://developers.openai.com/codex/cli/reference#codex-exec
