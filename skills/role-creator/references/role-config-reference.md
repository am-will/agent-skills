# Role Config Reference

## Canonical Sources In This Repo

- `codex-rs/core/src/config/mod.rs`
- `codex-rs/core/src/agent/role.rs`
- `codex-rs/core/src/tools/handlers/multi_agents.rs`
- `codex-rs/core/config.schema.json`

## Role Declaration Shape (`~/.codex/config.toml`)

```toml
[agents.researcher]
description = "Read-only researcher role"
config_file = "~/.codex/agents/researcher.toml"
```

### Supported keys under `[agents.<role>]`

- `description`
- `config_file`

Anything else under `[agents.<role>]` is unsupported.

## Role `config_file` Shape

Role `config_file` is parsed as a full `ConfigToml` layer. Top-level keys must be valid top-level keys from `codex-rs/core/config.schema.json`.

### Minimum policy for this skill

Require these fields in every role config:

- `model`
- `model_reasoning_effort`
- `developer_instructions`

Do not add optional keys (sandbox, `web_search`, `mcp_servers`, or others) unless explicitly requested by the user.

Recommended default profile (when user does not specify):

- `model = "gpt-5.3-codex"`
- `model_reasoning_effort = "medium"`

### Useful enums

- `model_reasoning_effort`: `none|minimal|low|medium|high|xhigh`
- `sandbox_mode`: `read-only|workspace-write|danger-full-access`
- `web_search`: `disabled|cached|live`

## Runtime Merge Notes

- Spawn starts from parent turn config.
- Role config file is merged as a config layer.
- Spawn then forces `approval_policy = never`.
- Collab depth limits still apply.

Practical implication: role config can tune model/sandbox/tools/etc., but spawn-time enforced overrides still win.

## Configuration Categories With Examples

These are common categories users ask for when building custom roles.

### 1) Minimal role (recommended default)

```toml
model = "gpt-5.3-codex"
model_reasoning_effort = "medium"
developer_instructions = """
You are a focused implementation assistant.
Work only in requested files, validate changes, and report exact evidence.
"""
```

### 2) Model/reasoning/style knobs

```toml
model = "gpt-5.3-codex"
model_reasoning_effort = "high"
model_reasoning_summary = "detailed"
model_verbosity = "high"
personality = "pragmatic"
developer_instructions = "..."
```

### 3) Sandboxing and workspace controls

```toml
sandbox_mode = "workspace-write"

[sandbox_workspace_write]
network_access = true
writable_roots = ["/path/to/repo"]
```

### 4) Search and feature toggles

```toml
web_search = "cached"

[features]
memory_tool = false
shell_tool = false
```

### 5) MCP server controls (basic and rich)

Basic enable/disable:
```toml
[mcp_servers.linear]
enabled = true
required = false
```

Rich server definition:
```toml
[mcp_servers.linear]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-linear"]
env_vars = ["LINEAR_API_KEY"]
enabled = true
required = false
```

### 6) App connector toggles

```toml
[apps.notion]
enabled = true

[apps.monday]
enabled = false
```

### 7) Skill-aware role instructions

```toml
developer_instructions = """
Use the $frontend-design skill for UI/UX work.
Build mobile-first, accessible, and production-grade interfaces.
"""
```

## Inheritance Rule Of Thumb

- Configure only what must differ from parent.
- Leave everything else omitted to inherit.
- Prefer minimal role config unless user explicitly requests stronger constraints.
