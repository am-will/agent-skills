# Hook Harness

Run `python3 hooks/aitmpl-codex/tools/harness.py` to exercise every bundle from `hooks/aitmpl-codex/catalog.json` in a temporary workspace.

If you want to install one bundle into a real repo first, use `hooks/aitmpl-codex/install-bundle.py`.

The harness:
- copies each bundle's `hooks.json` and `.codex/hooks/` into a temp `.codex/` tree
- feeds a synthetic payload for the event that the bundle supports
- marks hooks that look networky (`slack`, `discord`, `telegram`, `vercel`, `langsmith`) as skipped
- records stdout, exit code, and whether the hook printed JSON
- writes `hooks/aitmpl-codex/tools/report.json` with the per-hook summary

Inspect `report.json` for results, note the `notes` array when a hook fails or is skipped.
