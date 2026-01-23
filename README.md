<img width="750" height="491" alt="image" src="https://github.com/user-attachments/assets/c244cbdd-6f98-40b5-81f0-754aad546be4" />


# CodexSkills

A collection of Codex/agent skills for planning, documentation access, frontend development, and browser automation.

## Available skills

### Agent Orchestration

- `planner`:
  Create comprehensive, phased implementation plans with sprints and atomic tasks. Use for planning implementations, breaking down features, or creating structured roadmaps.
- `plan-harder`:
  Enhanced planning variant for more detailed analysis and task breakdown.
- `parallel-task`:
  Execute plan files by launching multiple parallel subagents to complete tasks simultaneously. Requires an existing plan file from `planner`.
- `llm-council`:
  Multi-agent orchestration system for planning complex tasks. Spawns multiple AI planners (Claude, Codex, Gemini) to generate independent plans, then uses a judge agent to synthesize the best approach. Includes a real-time web UI for monitoring progress and refining plans interactively.

### Documentation Access

- `context7`:
  Fetch up-to-date library documentation via Context7 API.
- `openai-docs-skill`:
  Query OpenAI developer docs via the OpenAI Docs MCP server using CLI.
- `read-github`:
  Read and search GitHub repository documentation via gitmcp.io MCP service. Converts `github.com/owner/repo` URLs to `gitmcp.io/owner/repo` for LLM-friendly access to repos.

### Frontend & Design

- `frontend-design`:
  Distinctive frontend design system guidance (imported from Anthropic).
- `frontend-responsive-ui`:
  Responsive UI standards (imported from Anthropic).
- `vercel-react-best-practices`:
  React/Next.js performance guidance (imported from Vercel).

### Browser Automation

- `gemini-computer-use`:
  Gemini 2.5 Computer Use browser-control agent skill (Playwright + safety confirmation loop).
- `agent-browser`:
  Fast Rust-based headless browser automation CLI from Vercel Labs with snapshot/act pattern for AI agents.

## Install with codexskills (recommended)

Install a single skill into your user scope (installs globally for all projects):

```bash
npx @am-will/codexskills --user am-will/codex-skills/skills/planner
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

**Notes:**
- When multiple skills are found, codexskills prompts you to choose (space to toggle, enter to confirm).
- When you post a path to just one skill, it will not prompt you "are you sure?"

**Note on Browser Tools**: The repo includes two browser automation tools (`gemini-computer-use` and `agent-browser`). You don't need to install both - choose the one that best fits your workflow. I recommend agent-browser for speed and simplicity.

**Note on Context7**: This skill requires a Context7 API key in `CONTEXT7_API_KEY`. See `skills/context7/.env.example` and the Authentication section in `skills/context7/SKILL.md`.

**Note on Gemini Computer Use Skill**: This skill requires a GEMINI_API_KEY. Ask Codex to help you set it up.

**Note on llm-council**: This skill requires API keys or Active Subscriptions for multiple providers (Claude/Anthropic, OpenAI for Codex, Google for Gemini). Run `./setup.sh` in the skill directory to configure. Includes a real-time web UI that auto-launches during planning sessions.
