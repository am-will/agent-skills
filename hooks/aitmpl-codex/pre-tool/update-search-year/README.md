# pre-tool/update-search-year

Automatically adds current year to WebSearch queries when no year is specified. This hook intercepts WebSearch tool usage and appends the current year to queries that don't already contain a year, ensuring search results are current and relevant.

Compatibility: adapted

## Events
- UserPromptSubmit: 1 matcher group(s)

## Notes
- PreToolUse/WebSearch was rewritten as a UserPromptSubmit approximation.

## Install
Copy this bundle into a project and merge its `.codex/hooks.json` into your project `.codex/hooks.json`.
If the bundle includes `.codex/hooks/` support files, copy that directory too.
