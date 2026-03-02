---
name: tdd-test-writer
description: Writes failing tests first for test-driven development and hands off a strict implementation contract that requires agents to make those tests pass without weakening the tests. Use when users ask for test-first workflows, RED/GREEN cycles, or behavior-gating tasks with automated tests.
---

# TDD Test Writer

Use this skill to complete the RED phase of TDD: define behavior with tests first, verify they fail for the right reason, then hand off implementation with objective pass criteria.

## When To Use

Use this skill when the user asks for:

- test-first development
- TDD / RED-GREEN-REFACTOR workflow
- writing tests that implementation agents must satisfy
- bugfixes that need regression tests before code changes

## Required Rules

1. Do not modify production code while running this skill.
2. Use subagent role `tdd_test_writer` for RED-phase test authoring whenever available.
3. Write behavior-focused tests, not placeholders.
4. Every new/updated test must fail before handoff.
5. Failures must come from missing or incorrect production behavior, not broken tests.
6. Prefer deterministic, targeted test commands over full-suite runs when possible.
7. For bugfix tasks, add a regression test that captures the reported failure mode.

## Workflow

### 1. Define Behavior Contract

- Convert user request into explicit acceptance criteria.
- Identify happy path, edge cases, and negative-path expectations.
- If requirements are ambiguous, record `ASSUMPTION:` lines in output.

### 2. Delegate Test Authoring To `tdd_test_writer`

- Spawn a `tdd_test_writer` subagent with task scope, target files, and acceptance criteria.
- Require the subagent to write/update tests only (no production code changes).
- Require command output proving RED-state failure for the new tests.
- If `tdd_test_writer` is unavailable, continue directly and note `FALLBACK: tdd_test_writer unavailable`.

### 3. Discover Existing Test Conventions

- Detect framework and runner from the repo (for example `vitest`, `jest`, `pytest`, `go test`, `cargo test`).
- Follow existing directory, naming, and fixture conventions.
- Reuse existing helpers instead of introducing duplicate test utilities.

### 4. Author RED-Phase Tests

- Create or update test files that encode the behavior contract.
- Keep tests small and intention-revealing (clear names and assertions).
- Include at least one negative-path assertion where applicable.
- Avoid network/time randomness; mock or fixture external systems.

### 5. Verify RED State

- Run the narrowest command that executes the new tests.
- Confirm they fail for the expected behavioral gap.
- If failure is caused by test syntax/setup, fix tests and rerun.

### 6. Produce Implementation Handoff

Return a block that implementation agents must follow. The handoff must include:

- subagent used (`tdd_test_writer`) or explicit fallback reason
- exact test files created/updated
- exact verification command(s)
- short failure summary proving RED state
- immutable test constraint (do not edit tests unless requirement changes)
- pass criteria that define task completion

## Required Output Format

```markdown
TDD RED PHASE COMPLETE

## Authoring Mode
- Subagent: tdd_test_writer
- Fallback: [only if subagent unavailable]

## Test Files
- [path]

## Verification
- Command: [exact command]
- Result: FAIL (expected)
- Failure reason: [1-2 lines tied to missing behavior]

## Implementation Contract (for next agent)
1. Do not modify these tests: [paths]
2. Implement production changes only in: [paths or modules]
3. Completion gate: [exact command] passes with no test weakening.
4. Run broader safety check: [secondary command]
5. Return evidence: changed files + command output summary.

## Assumptions
- ASSUMPTION: [only if needed]
```

## Quality Bar

- Tests fail before implementation and are reproducible locally.
- Assertions are specific enough to prevent false positives.
- Regression coverage is present for bugfix-driven tasks.
- Handoff is precise enough that another agent can execute without clarifications.
