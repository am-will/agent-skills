# quality-gates/scope-guard

Scope guard that detects files modified outside the declared scope of a specification. When a .spec.md file contains a 'Files to Create/Modify' section, this hook compares git-modified files against the declared list. Files outside scope trigger a warning (non-blocking). Automatically excludes test files, config files, infrastructure files, and documentation. Essential for Spec-Driven Development to prevent scope creep during implementation.

Compatibility: direct

## Events
- Stop: 1 matcher group(s)

## Install
Copy this bundle into a project and merge its `.codex/hooks.json` into your project `.codex/hooks.json`.
If the bundle includes `.codex/hooks/` support files, copy that directory too.
