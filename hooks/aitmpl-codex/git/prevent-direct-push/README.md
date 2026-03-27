# git/prevent-direct-push

Prevent direct pushes to protected branches (main, develop). Blocks git push commands targeting main or develop branches to enforce Git Flow workflow. Requires using feature/release/hotfix branches and pull requests instead of direct commits to protected branches.

Compatibility: direct

## Events
- PreToolUse: 1 matcher group(s)

## Install
Copy this bundle into a project and merge its `.codex/hooks.json` into your project `.codex/hooks.json`.
If the bundle includes `.codex/hooks/` support files, copy that directory too.
