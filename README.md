<img width="721" height="321" alt="image" src="https://github.com/user-attachments/assets/28bb993b-4c49-4107-9e65-d6bfa6bf21a4" />

# CodexSkills

A collection of Codex/agent skills. Check the /skills/ folder for a library of skills (like the OpenAI Developer Documenation Skill)

## Available skills

- `context7`: Fetch up-to-date library documentation via Context7 API.
- `openai-docs-skill`: Query OpenAI developer docs via the OpenAI Docs MCP server using CLI.
- `frontend-design`: Distinctive frontend design system guidance (imported from Anthropic).
- `frontend-responsive-ui`: Responsive UI standards (imported from Anthropic).
- `playwright-skill`: Browser automation/testing helper that auto-detects dev servers, runs Playwright scripts, captures UX data, and stores scripts in `/tmp`.
- `gemini-computer-use`: Gemini 2.5 Computer Use browser-control agent skill (Playwright + safety confirmation loop).
- `agent-browser`: Fast Rust-based headless browser automation CLI from Vercel Labs with snapshot/act pattern for AI agents.
- `vercel-react-best-practices`: React/Next.js performance guidance (imported from Vercel).

**Note on Browser Tools**: The repo includes three browser automation tools (`playwright-skill`, `gemini-computer-use`, and `agent-browser`). You don't need to install all of them as they all do similar things - choose the one that best fits your workflow.

## Install with codexskills (recommended)

Install a single skill into your user scope (installs globally for all projects):

```bash
npx codexskills --user am-will/codex-skills/skills/openai-docs-skill
```

Install all skills (or pick from the list):

```bash
npx codexskills --user am-will/codex-skills/skills
```

Install into a project (install to just one specific project):

```bash
npx codexskills --project am-will/codex-skills/skills /path/to/your/project
```

Install skills from other Github repositories:

All of the above commands work for any Github Skill repository:

```bash
npx codexskills --project https://github.com/numman-ali/n-skills/tree/main/skills /path/to/your/project
```

Notes:
- When multiple skills are found, codexskills prompts you to choose (space to toggle, enter to confirm).
- When you post a path to just one skill, it will not prompt you "are you sure?"
