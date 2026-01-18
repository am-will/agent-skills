<img width="750" height="491" alt="image" src="https://github.com/user-attachments/assets/c244cbdd-6f98-40b5-81f0-754aad546be4" />


# CodexSkills

A collection of Codex/agent skills. Check the /skills/ folder for a library of skills (like the OpenAI Developer Documenation Skill or Codex Subagents Skill)

## Available skills

- `codex-subagent`: Spawn autonomous Codex subagents via background shell to offload context-heavy work (web research, codebase exploration, multi-step workflows). Uses YOLO mode by default with smart model selection (mini for pure search, inherit parent for multi-step tasks).
- `context7`: Fetch up-to-date library documentation via Context7 API.
- `openai-docs-skill`: Query OpenAI developer docs via the OpenAI Docs MCP server using CLI.
- `frontend-design`: Distinctive frontend design system guidance (imported from Anthropic).
- `frontend-responsive-ui`: Responsive UI standards (imported from Anthropic).
- `playwright-skill`: Browser automation/testing helper that auto-detects dev servers, runs Playwright scripts, captures UX data, and stores scripts in `/tmp`.
- `gemini-computer-use`: Gemini 2.5 Computer Use browser-control agent skill (Playwright + safety confirmation loop).
- `agent-browser`: Fast Rust-based headless browser automation CLI from Vercel Labs with snapshot/act pattern for AI agents.
- `vercel-react-best-practices`: React/Next.js performance guidance (imported from Vercel).

**Note on Browser Tools**: The repo includes three browser automation tools (`playwright-skill`, `gemini-computer-use`, and `agent-browser`). You don't need to install all of them as they all do similar things - choose the one that best fits your workflow. I recommend agent-browser.

**Note on Context7**: This skill requires a Context7 API key in `CONTEXT7_API_KEY`. See `skills/context7/.env.example` and the Authentication section in `skills/context7/SKILL.md`.

**Note on Gemini Computer Use Skill**: This skill requires a GEMINI_API_KEY. Ask Codex to help you set it up.

## Install with codexskills (recommended)

Install a single skill into your user scope (installs globally for all projects):

```bash
npx @am-will/codexskills --user am-will/codex-skills/skills/codex-subagent
```

Install all skills (or pick from the list):

```bash
npx @am-will/codexskills --user am-will/codex-skills/skills
```

Install into a project (install to just one specific project):

```bash
npx @am-will/codexskills --project am-will/codex-skills/skills /path/to/your/project
```

Install skills from other Github repositories:

All of the above commands work for any Github Skill repository:

```bash
npx @am-will/codexskills --project https://github.com/numman-ali/n-skills/tree/main/skills /path/to/your/project
```

Install globally and use `codexskills` directly:

```bash
npm install -g @am-will/codexskills
codexskills --user am-will/codex-skills/skills
```

Notes:
- When multiple skills are found, codexskills prompts you to choose (space to toggle, enter to confirm).
- When you post a path to just one skill, it will not prompt you "are you sure?"
