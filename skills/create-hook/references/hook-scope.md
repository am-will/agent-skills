# Hook Scope

## Scope choices

- **Global / personal**
  - `~/.codex/hooks.json`
  - `~/.codex/hooks/`
  - `~/.codex/config.toml`

- **Project / repo**
  - `<repo>/.codex/hooks.json`
  - `<repo>/.codex/hooks/`
  - `<repo>/.codex/config.toml`

## Hook events

- `SessionStart`
- `UserPromptSubmit`
- `PreToolUse`
- `PostToolUse`
- `Stop`

## Useful defaults

- `PreToolUse`: block or rewrite before execution
- `PostToolUse`: log, format, or validate after execution
- `UserPromptSubmit`: inject instructions or reject bad prompts
- `SessionStart`: seed session context
- `Stop`: final checks or continuation prompts
