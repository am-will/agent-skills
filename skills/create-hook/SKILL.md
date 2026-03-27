---
name: create-hook
description: Create or update Codex hooks for global or project scope by asking for scope and hook type when ambiguous, then writing the hook config, scripts, and any required feature flag config.
---

# Create Hook

Use when the user wants to add Codex hooks and explains the behavior they want.

## Workflow

1. Determine scope.
   - If the user says `global`, use the personal/home scope.
   - If the user says `project`, use the repo scope.
   - If scope is missing or unclear, ask: `Should this be global or project-scoped?`

2. Determine hook type.
   - If the event is missing or unclear, ask which hook they want:
     - `SessionStart`
     - `UserPromptSubmit`
     - `PreToolUse`
     - `PostToolUse`
     - `Stop`
   - If the user wants more than one, keep them separate unless they explicitly want shared behavior.

3. Determine behavior.
   - Ask what the hook should do if the intent is not already clear.
   - Prefer the smallest deterministic script that satisfies the request.

4. Write the hook files in the chosen scope.
   - Global: `~/.codex/hooks.json` and `~/.codex/hooks/`
   - Project: `<repo>/.codex/hooks.json` and `<repo>/.codex/hooks/`
   - Keep script paths explicit and relative where practical.

5. Enable the feature flag if the target Codex build still gates hooks.
   - Set `[features] codex_hooks = true` in the relevant `config.toml`.

6. Keep the hook output clear.
   - Use `statusMessage` for a short visible signal.
   - For logging hooks, write to a repo-local or home-local log file.
   - For blocking hooks, return a nonzero exit only when the hook should actually stop the tool.

7. Verify the result.
   - Run a command that should trigger the hook.
   - Confirm the log, output, or blocking behavior matches the requested scope and event.

## Practical defaults

- Use `PreToolUse` for prevention.
- Use `PostToolUse` for logging, formatting, or test follow-up.
- Use `UserPromptSubmit` for prompt shaping and injected context.
- Use `SessionStart` for startup context.
- Use `Stop` for end-of-turn checks.
