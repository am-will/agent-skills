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
