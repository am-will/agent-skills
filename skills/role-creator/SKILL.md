---
name: role-creator
description: Create and install Codex custom agent roles in ~/.codex/config.toml, generate role config files, enforce supported keys, and guide users through required role inputs (model, reasoning effort, developer_instructions) plus sandbox/web-search/MCP controls.
---

# Role Creator

## Overview

Use this skill when the user wants to create, update, or troubleshoot custom subagent roles backed by `[agents.<role>]` and a role `config_file`.

This skill installs the role into `~/.codex/config.toml`, writes the role-specific config file, and validates key support against `codex-rs/core/config.schema.json`.

## Non-Negotiable Inputs

Always collect these before writing files:

- `model`
- `model_reasoning_effort`
- `developer_instructions`

If any are missing, ask concise questions first:

1. `Which model should this role use?` (example: `gpt-5.1-codex-mini`)
2. `What reasoning effort should it use?` (`none|minimal|low|medium|high|xhigh`)
3. `What should the role's developer instructions prioritize?` (goal, boundaries, success criteria)

Also gather:

- `role_name` (machine-friendly)
- `description` (shown in `spawn_agent` role help)
- `role_config_file` (absolute path preferred)

## Supported Role Declaration Keys

For `[agents.<role_name>]`, only these keys are supported:

- `description`
- `config_file`

Do not add anything else under `[agents.<role_name>]`.

## Workflow

1. Validate environment and paths.
- Ensure repo schema exists: `codex-rs/core/config.schema.json`
- Use config target default `~/.codex/config.toml` unless user overrides.

2. Create or update role config file.
- Use `scripts/write_role_config.sh` to write required fields and optional controls.
- Optional controls supported by script:
- `sandbox_mode` + workspace-write settings
- `web_search` mode (set to `disabled` to prevent web search)
- MCP controls (`mcp_clear`, `mcp_enable`, `mcp_disable`)

3. Install role in main config.
- Use `scripts/install_role.sh`.
- This writes/updates:
- `features.multi_agent = true`
- `[agents.<role_name>] description/config_file`
- Additive safety:
- Installer only mutates role-related keys and keeps the rest of `config.toml` intact.
- Existing role definitions are not overwritten unless `--update-existing` is passed.

4. Validate before reporting success.
- Use `scripts/validate_role.sh`.
- Confirm required role-config fields are present.
- Confirm role declaration keys are only `description/config_file`.
- Confirm top-level role config keys are valid against schema.

5. Share runnable spawn example.
- Example:
```json
{"agent_type":"<role_name>","message":"<task>"}
```

## Commands

```bash
# 1) Write role config file (required fields + optional controls)
.codex/skills/role-creator/scripts/write_role_config.sh \
  --output ~/.codex/agents/researcher.toml \
  --role-name researcher \
  --model gpt-5.1-codex-mini \
  --reasoning medium \
  --developer-instructions "Research code and docs only; no edits; return file:line evidence." \
  --sandbox-mode workspace-write \
  --network-access false \
  --writable-roots "/home/willr/Applications/codex1" \
  --web-search disabled

# 2) Register role in ~/.codex/config.toml
.codex/skills/role-creator/scripts/install_role.sh \
  --role-name researcher \
  --description "Read-only codebase research specialist" \
  --role-config-file ~/.codex/agents/researcher.toml

# 2b) Intentionally update an existing role definition
.codex/skills/role-creator/scripts/install_role.sh \
  --role-name researcher \
  --description "Updated role description" \
  --role-config-file ~/.codex/agents/researcher.toml \
  --update-existing

# 3) Validate role config and declaration keys
.codex/skills/role-creator/scripts/validate_role.sh \
  --role-name researcher \
  --config ~/.codex/config.toml \
  --role-config ~/.codex/agents/researcher.toml \
  --schema /home/willr/Applications/codex1/codex-rs/core/config.schema.json
```

## Guardrails

- If runtime returns `unknown agent_type`, verify role exists in active config and `config_file` path exists/readable.
- If runtime returns `agent type is currently not available`, inspect role file TOML validity and unsupported keys.
- Keep instructions role-specific and operational (scope, do/don't, deliverable format).
- Do not claim success without running validation.

## References

- Role key matrix and runtime behavior: `references/role-config-reference.md`
