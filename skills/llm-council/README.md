# LLM Council

A multi-agent orchestration system for generating high-quality, bias-resistant implementation plans. LLM Council launches multiple AI planners in parallel, collects their independent plans, anonymizes them, and uses a judge agent to evaluate and merge the best elements into a final plan.

## How It Works

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                         LLM Council                      │
                    └─────────────────────────────────────────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
            ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
            │   Planner 1  │     │   Planner 2  │     │   Planner N  │
            │  (Codex)     │     │  (Claude)    │     │  (Gemini)    │
            └──────────────┘     └──────────────┘     └──────────────┘
                    │                    │                    │
                    └────────────────────┼────────────────────┘
                                         ▼
                              ┌──────────────────┐
                              │   Anonymize &    │
                              │   Randomize      │
                              └──────────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │     Judge        │
                              │  (Evaluate &     │
                              │   Merge Plans)   │
                              └──────────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │   Final Plan     │
                              └──────────────────┘
```

## Features

- **Parallel Execution**: Spawns multiple AI planners simultaneously for faster results
- **Bias Reduction**: Plans are anonymized and shuffled before judging to reduce position and provider bias
- **Multiple CLI Support**: Works with Codex, Claude, Gemini, OpenCode, and custom agents
- **Real-time Web UI**: Watch planners work, compare outputs, edit the final plan, and refine iteratively
- **Automatic Retry**: Failed plans are retried up to 2 times with detailed error tracking
- **Structured Evaluation**: Judge scores each plan on coverage, feasibility, risk handling, and more
- **Persistent Output**: All plans, judge reports, and artifacts saved to disk for review

## Quick Start

### 1. Installation

Clone the repository and ensure you have Python 3.10+ and your desired AI CLI tools installed:

```bash
# Required CLI tools (install at least one)
codex    # https://github.com/openai/openai-python
claude   # https://github.com/anthropics/claude-code
gemini   # https://github.com/google/gemini-cli
opencode # https://github.com/opencode-org/opencode
```

### 2. Configuration

Run the setup wizard to configure your AI models:

**Linux / macOS:**
```bash
./setup.sh
```

**Windows (Command Prompt):**
```cmd
setup.bat
```

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

The wizard will prompt you to:

1. **Choose default council** or configure custom planners
   - Default: Codex (gpt-5.2-codex, xhigh) + Claude (opus) + Gemini (gemini-3-pro-preview)

2. **Or configure custom planners**:
   - Number of planners (1 or more)
   - CLI type for each planner (codex, claude, gemini, opencode, custom)
   - Model selection
   - Reasoning effort (for Codex)

3. **Select the judge**:
   - Choose any of your configured planners to serve as the judge

Configuration is saved to `~/.config/llm-council/agents.json`

You can re-run the setup script at any time to change your configuration (`./setup.sh`, `setup.bat`, or `.\setup.ps1`).

### 3. Using as a Skill in Coding Agents (Recommended)

The easiest way to use LLM Council is as a skill within your coding agent (Codex, Claude, etc.). The agent will:

1. **Interview you** to understand your task through interactive questions
2. **Build the specification** automatically from your answers
3. **Launch the council** and display the web UI
4. **Return the final plan** for your review and approval

Simply invoke the skill from within your coding agent:

```bash
# In your coding agent session
/llm-council
```

Or ask your agent directly:

```
"Can you help me plan this feature using the LLM council?"
"I need multiple AI perspectives on how to implement this"
```

The agent handles all the complexity - spec creation, council execution, and result integration - automatically.

## Manual Council Invocation

If you prefer direct control, you can manually create task specifications and run the council from the command line.

### Create a Task Specification

Create a JSON file describing what you want to plan:

```json
{
  "task": "Add a dark mode toggle to the application settings",
  "constraints": [
    "Use existing theme system",
    "Persist user preference in localStorage"
  ],
  "repo_context": {
    "root": ".",
    "paths": ["src/components/Settings.tsx", "src/theme.ts"],
    "notes": "Theme system already supports light/dark variants"
  }
}
```

#### Task Spec Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task` | string | Yes | The task description to plan |
| `constraints` | array | No | List of constraints or requirements |
| `repo_context` | object | No | Repository context (root, paths, notes) |
| `agents` | object | No | Override default agents (see below) |

#### Agent Configuration Override

You can override the default agents directly in your task spec:

```json
{
  "task": "Your task here",
  "agents": {
    "planners": [
      { "name": "codex", "kind": "codex", "model": "gpt-5.2-codex", "reasoning_effort": "xhigh" },
      { "name": "claude-opus", "kind": "claude", "model": "opus" },
      { "name": "gemini-pro", "kind": "gemini", "model": "gemini-3-pro-preview" }
    ],
    "judge": { "name": "codex-judge", "kind": "codex", "model": "gpt-5.2-codex" }
  }
}
```

### Run a Council

```bash
python scripts/llm_council.py run --spec task.json
```

The web UI will open automatically, showing real-time progress as planners generate their plans and the judge evaluates them.

## CLI Usage

### Run Command

```bash
python scripts/llm_council.py run [OPTIONS]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--spec PATH` | Path to task spec JSON | Required |
| `--out PATH` | Path to write final plan | stdout |
| `--timeout SEC` | Timeout per agent in seconds | 180 |
| `--seed INT` | Random seed for reproducibility | None |
| `--config PATH` | Path to agents config | ~/.config/llm-council/agents.json |
| `--no-ui` | Disable web UI | false |
| `--ui-keepalive-seconds SEC` | Keep UI alive after completion | 1200 |

### UI Command (Resume Previous Run)

```bash
python scripts/llm_council.py ui --run-dir llm-council/runs/TIMESTAMP-TASK
```

| Option | Description |
|--------|-------------|
| `--run-dir PATH` | Path to run directory | Required |
| `--no-open` | Don't auto-open browser |

### Configure Command

```bash
python scripts/llm_council.py configure [--config PATH]
```

Equivalent to running the setup script (`./setup.sh`, `setup.bat`, or `.\setup.ps1`)

## Web UI

The web UI provides a real-time dashboard for monitoring and interacting with your council runs.

### Interface Sections

#### Hero Header
- **Run ID**: Unique identifier for this council run
- **Phase**: Current phase (starting, planning, judging, finalizing, complete)
- **Connection Status**: SSE connection status
- **Session Timer**: Countdown until auto-close (30 min default)

#### Task Brief
Displays the task being planned, including constraints and repository context.

#### Planner Outputs
- **Dropdown**: Switch between individual planner outputs
- **Status**: Shows pending, running, complete, failed, or needs-fix
- **Summary**: Full plan output from the selected planner
- **Errors**: Any validation errors or failures

#### Judge Output
- **Status**: Judge execution status
- **Summary**: Full judge report including scores, comparative analysis, and recommendations
- **Errors**: Any validation errors

#### Final Plan Editor
- **Split View**: Edit on the left, live preview on the right
- **Status Indicator**: Shows "synced" or "edited locally"
- **Reset Button**: Restore to the latest server version

### UI Actions

| Action | Description |
|--------|-------------|
| **Accept** | Saves plan as `final-plan-accepted.md` and closes UI |
| **Save** | Creates a timestamped version (`final-plan-N.md`) |
| **Refine** | Re-runs judge with additional context to improve the plan |
| **Keep Open** | Toggle to prevent auto-close (default: 30 min timer) |

### Session Management

- The UI session automatically closes after 30 minutes by default
- Enable "Keep Open" to disable the timer
- Session timer resets on refinement actions
- Re-open a previous run using the `ui` command

## Agent Configuration

### Supported Agent Types

#### Codex
```json
{
  "name": "codex-1",
  "kind": "codex",
  "model": "gpt-5.2-codex",
  "reasoning_effort": "xhigh"
}
```

| Field | Values |
|-------|--------|
| `model` | gpt-5.2-codex, gpt-4.1, etc. |
| `reasoning_effort` | low, medium, high, xhigh |

#### Claude
```json
{
  "name": "claude-2",
  "kind": "claude",
  "model": "opus"
}
```

| Field | Values |
|-------|--------|
| `model` | opus, sonnet, haiku |

#### Gemini
```json
{
  "name": "gemini-3",
  "kind": "gemini",
  "model": "gemini-3-pro-preview"
}
```

| Field | Values |
|-------|--------|
| `model` | gemini-3-pro-preview, gemini-2-flash, etc. |

#### OpenCode
```json
{
  "name": "opencode-claude",
  "kind": "opencode",
  "model": "anthropic/claude-sonnet-4-5",
  "cli_format": "json"
}
```

| Field | Description |
|-------|-------------|
| `model` | Provider/model (run `opencode models` to list) |
| `cli_format` | Output format (json recommended) |
| `agent` | Agent name (optional) |
| `attach` | Attach to running server (optional) |

#### Custom
```json
{
  "name": "my-planner",
  "kind": "custom",
  "command": "my-ai-tool --json",
  "prompt_mode": "stdin"
}
```

| Field | Values |
|-------|--------|
| `command` | Shell command to execute |
| `prompt_mode` | `arg` (append prompt) or `stdin` (pipe to stdin) |
| `extra_args` | Additional CLI arguments |

## Output Structure

Each council run creates a directory under `llm-council/runs/`:

```
llm-council/runs/20260120-my-task/
├── plan-codex-1.md              # Planner 1 output
├── plan-claude-2.md             # Planner 2 output
├── plan-gemini-3.md             # Planner 3 output
├── judge.md                     # Judge evaluation report
├── final-plan.md                # Merged final plan
├── final-plan-1.md              # User-saved version
├── final-plan-accepted.md       # User-accepted version
├── final-plan-refined-*.md      # Refined versions
├── ui-state.json                # UI state snapshot
└── plan-*-attempt*.md           # Retry attempts (if any)
```

## Plan Template

Planners generate structured plans with the following sections:

- **Overview**: High-level description of the approach
- **Scope**: What is included and excluded
- **Phases**: Step-by-step implementation phases
- **Testing Strategy**: How to verify the implementation
- **Risks**: Potential issues and mitigations
- **Rollback Plan**: How to undo changes if needed
- **Edge Cases**: Special cases to handle
- **Open Questions**: Items that need clarification

## Judge Report

The judge provides:

- **Scores (1-10)**: Coverage, feasibility, risk handling, clarity, completeness
- **Comparative Analysis**: Strengths and weaknesses of each plan
- **Missing Steps**: Gaps identified across all plans
- **Contradictions**: Conflicting approaches between plans
- **Improvements**: Recommendations for enhancement
- **Final Plan**: Merged plan incorporating the best elements

## Examples

See `references/task-spec.example.json` for a complete example.

### Example: Add Feature

```json
{
  "task": "Add user authentication with OAuth2 support",
  "constraints": [
    "Support Google and GitHub providers",
    "Use JWT for session management",
    "Follow OWASP security guidelines"
  ],
  "repo_context": {
    "root": ".",
    "paths": ["src/auth/", "src/middleware/"],
    "notes": "Existing user table needs schema updates"
  }
}
```

### Example: Refactor

```json
{
  "task": "Refactor the payment processing module to use Stripe SDK v15",
  "constraints": [
    "Maintain backward compatibility during transition",
    "Add comprehensive integration tests"
  ],
  "repo_context": {
    "root": ".",
    "paths": ["src/payments/", "tests/payments/"]
  }
}
```

## Advanced Usage

### Reproducible Runs

Use `--seed` for reproducible plan randomization:

```bash
python scripts/llm_council.py run --spec task.json --seed 42
```

### Custom Timeout

Increase timeout for complex tasks:

```bash
python scripts/llm_council.py run --spec task.json --timeout 300
```

### No UI Mode

Run without the web UI (output to stdout):

```bash
python scripts/llm_council.py run --spec task.json --no-ui
```

### Save to File

```bash
python scripts/llm_council.py run --spec task.json --out plan.md
```

## Troubleshooting

### "Models not configured" Error

Run the setup script (`./setup.sh`, `setup.bat`, or `.\setup.ps1`) to configure your agents.

### Planner Timed Out

Increase timeout with `--timeout` or simplify your task.

### "Missing headers" Validation Error

The planner output doesn't follow the expected template. This can happen if:
- The model ignores the template instructions
- The output was truncated
- The model had an error

Check the individual plan file in the run directory for details.

### UI Won't Open

Check that port 8765 is available. The UI binds to `127.0.0.1:8765` by default.

## Reference Documentation

Additional documentation is available in the `references/` directory:

- `architecture.md` - System architecture and data flow
- `prompts.md` - Planner and judge prompt templates
- `data-contracts.md` - Data schema documentation
- `cli-notes.md` - CLI-specific invocation patterns
- `schemas/` - JSON schemas for validation
- `templates/` - Output templates

## License

MIT License - See LICENSE file for details.
