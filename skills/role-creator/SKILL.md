---
name: role-creator
description: Create and update Codex custom agents using standalone custom-agent TOML files.
---

# Role Creator

## Overview

Use this skill to author, update, or troubleshoot custom Codex agents as standalone TOML files.

Current behavior:
- Each custom agent is defined by one file:
  - Global: `~/.codex/agents/<agent-name>.toml`
  - Project: `<project>/.codex/agents/<agent-name>.toml`
- The agent file is the role source of truth.
- `~/.codex/config.toml` is only for global/runtime settings (for example `[agents]` thread limits), not per-role registration.

## Non-Negotiable Inputs

Step 1 is required before writing files:

- `name` (role identifier used by `agent_type`)
- `description` (short, human-readable purpose)
- `developer_instructions`
- `model` (recommend `gpt-5.3-codex` unless requested)
- `model_reasoning_effort` (`none|minimal|low|medium|high|xhigh`)
- role scope (`global` or `project`)
- output TOML path (canonical absolute path preferred)
- whether to include `nickname_candidates` and exact values

Execution rule:
- Do not infer required values.
- Do not write until required inputs are explicitly confirmed.

## Role file contract (current)

From Codex custom agent docs (`/codex/subagents`):
- Required keys: `name`, `description`, `developer_instructions`.
- Optional keys: `nickname_candidates`, `model`, `model_reasoning_effort`, `sandbox_mode`, `web_search`, `mcp_servers`, `skills.config`, etc.
- `name` is the spawn identifier and source of truth.
- `description` + `developer_instructions` define behavior and usage boundaries.
- `nickname_candidates` is optional and used only for display.

`nickname_candidates` requirements:
- Must be a non-empty list of unique values when present.
- Allowed characters: ASCII letters, digits, spaces, hyphens, underscores.

## Default policy for optional settings

- Do not add sandboxing/MCP/web-search/model extras unless requested.
- Keep generated files minimal by default.
- If the user says "inherit defaults", omit optional keys instead of setting explicit values.

## Workflow

1. Collect and confirm required inputs.
2. Resolve output path:
   - `global` → `~/.codex/agents/<name>.toml`
   - `project` → `<project>/.codex/agents/<name>.toml`
3. Create or update the file directly with required keys.
4. Validate TOML parse and required keys.
5. Return a ready-to-run example call:

```json
{"agent_type":"<name>","message":"<task>"}
```

## Commands

```bash
# 1) Write a standalone custom-agent file
/home/willr/Applications/skills/skills/role-creator/scripts/write_role_config.sh \
  --output ~/.codex/agents/reviewer.toml \
  --role-name reviewer \
  --description "PR reviewer focused on correctness, security, and risk." \
  --model gpt-5.4 \
  --reasoning high \
  --developer-instructions "Review code like an owner. Lead with concrete findings and residual risks."

# Optional: include nickname candidates for display
/home/willr/Applications/skills/skills/role-creator/scripts/write_role_config.sh \
  --output ~/.codex/agents/reviewer.toml \
  --role-name reviewer \
  --description "PR reviewer focused on correctness, security, and risk." \
  --model gpt-5.4 \
  --reasoning high \
  --developer-instructions "Review code like an owner. Lead with concrete findings and residual risks." \
  --nickname-candidates "Atlas,Delta,Echo" \
  --sandbox-mode read-only \
  --web-search disabled
```

## Guardrails

- If runtime returns `unknown agent_type`, verify the active scope and confirm the file exists at the expected path.
- Check syntax first with `tomlq` or `tomlq -C`.
- Keep role instructions operational and narrowly scoped to avoid drift.

## References

- Codex subagents docs: `https://developers.openai.com/codex/subagents`
- Display nicknames: `https://developers.openai.com/codex/subagents#display-nicknames`
- Reusable templates: `templates/`
