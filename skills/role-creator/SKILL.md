---
name: role-creator
description: Create and install Codex custom agent roles in ~/.codex/config.toml, generate role config files, enforce supported keys, and guide users through required role inputs (model, reasoning effort, developer_instructions).
---

# Role Creator

## Overview

Use this skill when the user wants to create, update, or troubleshoot custom subagent roles backed by `[agents.<role>]` and a role `config_file`.

This skill installs the role into `~/.codex/config.toml` (or a user-selected project config), writes the role-specific config file, and validates key support against `codex-rs/core/config.schema.json`.

Default behavior is strict-minimal: configure only `model`, `model_reasoning_effort`, and `developer_instructions` unless the user explicitly asks for additional parameters.

Default location is `~/.codex/config.toml` however, if the user asks for a project scoped role, the role will be installed in the project's `.codex/config.toml`. Can also be installed to subfolders in a repo.

## Non-Negotiable Inputs

Step 1 must always be input collection. Before running any write/install/validate command, collect and confirm:

- `model`
- `model_reasoning_effort`
- `developer_instructions`
- install scope (`global` or `project`)
- `role_name`
- `description`
- `role_config_file` (absolute path preferred)

Ask concise questions:

1. `Which model should this role use?` (recommend: `gpt-5.3-codex`)
2. `What reasoning effort should it use?` (recommend: `medium`; options `medium|high|xhigh`)
3. `What should the role's developer instructions prioritize?` (goal, boundaries, success criteria)
4. `Do you want this installed globally (~/.codex/config.toml) or in a project (.codex/config.toml)?`
5. `Do you want any sandboxing, web_search, MCP, or other restrictions?`
6. `What role name and description should be shown in spawn_agent?`

Execution gate:

- Do not infer missing required values.
- Do not start Step 2 (writing files) until all required inputs above are explicitly provided or explicitly accepted as defaults by the user.



## Default Policy For Optional Parameters

- Do not set sandbox flags unless explicitly requested.
- Do not set `web_search` unless explicitly requested.
- Do not set MCP flags/entries unless explicitly requested.
- Do not add any other optional `config_file` keys unless explicitly requested.
- If user intent is ambiguous, ask a short clarification question before adding optional keys.

## Knowledge vs Application Rule

The role creator must know the full configuration surface area, but must only apply keys the user asked for.

- Required behavior:
- Explain available optional categories when helpful.
- Provide specific examples/templates when user asks what is possible.
- Keep generated config minimal by default.
- Add optional keys only with explicit user request.
- If user says "keep defaults/inherit", omit optional keys rather than setting explicit values.

## Role Config Surface Area (What Can Be Customized)

Role `config_file` is parsed as a full config layer. If a key is omitted, it generally inherits from the parent.

- Model and reasoning:
- `model`
- `model_reasoning_effort`
- `model_reasoning_summary`
- `model_verbosity`
- `personality`
- Core behavior:
- `developer_instructions`
- Sandboxing and permissions:
- `sandbox_mode`
- `[sandbox_workspace_write]` fields like `network_access`, `writable_roots`
- Web search:
- `web_search` (`disabled|cached|live`)
- Feature toggles:
- `[features]` keys such as `memory_tool`, `shell_tool`
- MCP servers:
- `[mcp_servers.<name>]` entries (`enabled`, `required`, `command`, `args`, `env_vars`)
- Apps/connectors:
- `[apps.<name>]` entries (`enabled`)

When user asks for advanced role controls, use concrete examples from:

- `templates/minimal-role-config.toml`
- `templates/restricted-role-config.toml`
- `templates/full-role-config.toml`
- `templates/frontend-architecture-role.toml`

## Supported Role Declaration Keys

For `[agents.<role_name>]`, only these keys are supported:

- `description`
- `config_file`

Do not add anything else under `[agents.<role_name>]`.

## Workflow

1. Collect and confirm required inputs (hard gate).
- Ask for model, reasoning, developer instructions, install scope, role name, description, and role config file path.
- Confirm whether to use defaults only if user explicitly agrees.
- Do not write files in this step.

2. Validate environment and resolved paths.
- Ensure repo schema exists: `codex-rs/core/config.schema.json`
- Resolve config target from scope:
- `global` -> `~/.codex/config.toml`
- `project` -> `<project>/.codex/config.toml`

3. Create or update role config file.
- Use `scripts/write_role_config.sh` to write required fields.
- Add optional controls only if the user explicitly requested them.
- Optional controls supported by script:
- `sandbox_mode` + workspace-write settings
- `web_search` mode (set to `disabled` to prevent web search)
- MCP controls (`mcp_clear`, `mcp_enable`, `mcp_disable`)
- If user wants options beyond script flags (for example `model_reasoning_summary`, `features`, `apps`, rich MCP server definitions), start from a template under `templates/` and edit manually, then run validation.
- Communicate clearly in output:
- `Configured now:` keys that were written
- `Available but not set:` relevant optional keys left to inherit

4. Install role in main config.
- Use `scripts/install_role.sh`.
- This writes/updates:
- `features.multi_agent = true`
- `[agents.<role_name>] description/config_file`
- Additive safety:
- Installer only mutates role-related keys and keeps the rest of `config.toml` intact.
- Installer always creates a timestamped backup of the target `config.toml` before writing.
- Existing role definitions are not overwritten unless `--update-existing` is passed.

5. Validate before reporting success.
- Use `scripts/validate_role.sh`.
- Confirm required role-config fields are present.
- Confirm role declaration keys are only `description/config_file`.
- Confirm top-level role config keys are valid against schema.

6. Share runnable spawn example.
- Example:
```json
{"agent_type":"<role_name>","message":"<task>"}
```

## Commands

```bash
# 1) Write role config file (required fields only; default behavior)
.codex/skills/role-creator/scripts/write_role_config.sh \
  --output ~/.codex/agents/researcher.toml \
  --role-name researcher \
  --model gpt-5.3-codex \
  --reasoning medium \
  --developer-instructions "Research code and docs only; no edits; return file:line evidence."

# 1b) Optional controls (only when explicitly requested)
.codex/skills/role-creator/scripts/write_role_config.sh \
  --output ~/.codex/agents/researcher.toml \
  --role-name researcher \
  --model gpt-5.3-codex \
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
- Reusable templates: `templates/`
