# Repository Guidelines

## Project Structure & Module Organization
- `bin/codexskills.js` is the CLI entry point (Node.js CommonJS).
- `skills/<skill-name>/` holds individual skills. Each skill must include `SKILL.md` and may add `scripts/`, `references/`, or `assets/` as needed (e.g., `skills/context7/.env.example`).
- `README.md` documents available skills and install usage.
- `codex-plan.md` is internal planning/notes.

## Build, Test, and Development Commands
- `npm install` — installs dependencies (Node >= 18 required).
- `node bin/codexskills.js --help` — run the CLI from this repo to verify flags and usage.
- Example local smoke run: `node bin/codexskills.js --project owner/repo/skills /tmp/skill-test` (installs into `/tmp/skill-test/.codex/skills`).
- No build step or test runner is configured in `package.json` today.

## Coding Style & Naming Conventions
- JavaScript style follows the existing CLI: CommonJS `require`, 2-space indentation, semicolons, and single quotes.
- Skill directories use kebab-case (e.g., `openai-docs-skill`). Keep `SKILL.md` uppercase and at the skill root.
- Prefer concise Markdown docs with explicit command examples and environment variable names.

## Testing Guidelines
- There are no automated tests in this repo.
- For changes to the installer, perform a manual smoke test using a temporary project directory and confirm the expected `SKILL.md` files are copied.

## Commit & Pull Request Guidelines
- Commit messages are short, imperative, and capitalized (e.g., “Fix openai-docs MCP jq compatibility”).
- PRs should describe the affected skills, CLI behavior changes, and any new environment variables.
- If you add a new skill, update `README.md` and ensure it includes a `SKILL.md` at the skill root.

## Security & Configuration Tips
- Never commit API keys or tokens. Add `.env.example` files for skills that require credentials and document the variables in the skill’s `SKILL.md`.
