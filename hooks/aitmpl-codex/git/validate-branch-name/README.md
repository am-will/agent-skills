# git/validate-branch-name

Validate Git Flow branch naming conventions before checkout. Ensures branches follow the pattern: feature/*, release/v*.*.*, hotfix/*. Prevents creation of branches that don't follow Git Flow standards.

Compatibility: direct

## Events
- PreToolUse: 1 matcher group(s)

## Install
Copy this bundle into a project and merge its `.codex/hooks.json` into your project `.codex/hooks.json`.
If the bundle includes `.codex/hooks/` support files, copy that directory too.
