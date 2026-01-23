---
name: parallel-task
description: >
  Execute plan files by launching multiple parallel subagents to complete tasks simultaneously.
  Triggers on explicit "/parallel-task" commands.
---

# Parallel Task Executor

Use Orchestration Mode. Parse plan files and delegate tasks to parallel subagents.

## Process

### Step 1: Parse Request

Extract from user request:
1. **Plan file**: The markdown plan to read
2. **Sprint/Phase** (optional): Which section to run

If sprint not provided, ask user which to run.

### Step 2: Read & Parse Plan

1. Find sprint/phase section (e.g., `## Sprint 1:`)
2. Extract task subsections (e.g., `### Task 1.1:`)
3. For each task, extract:
   - Task ID and name
   - Full content (description, location, acceptance criteria, validation)
4. Build task list

### Step 3: Launch Subagents

For each task, launch subagent with:
- **description**: "Implement task [ID]: [name]"
- **prompt**: Use template below

If there are multiple unblocked tasks, launch multiple subagents in parallel.

### Task Prompt Template

```
You are implementing a specific task from a development plan.

## Context
- Plan: [filename] - [sprint/phase]
- Goals: [relevant overview from plan]
- Dependencies: [prerequisites for this task]
- Related tasks: [tasks in same sprint]
- Constraints: [risks from plan]

## Your Task
**Task [ID]: [Name]**

Location: [File paths]
Description: [Full description]

Acceptance Criteria:
[List from plan]

Validation:
[Tests or verification from plan]

## Instructions
1. Examine and explore the plan, all relevant files & dependencies. Ensure ambiguities are cleared up.
2. Implement changes for all acceptance criteria
3. Keep work **atomic and committable**
4. For each file: read first, edit carefully, preserve formatting
5. Run validation if feasible
6. Return summary of:
   - Files modified/created
   - Changes made
   - How criteria are satisfied
   - Validation performed or deferred

## Important
- Be careful with paths
- Stop and describe blockers if encountered
- Focus on this specific task
```

### Step 4: Monitor & Log

After subagents complete:
1. Collect results
2. **ALWAYS mark completed tasks** and update with:
   - Concise work log
   - Files modified/created
   - Errors or gotchas encountered

### Step 5: Repeat

Continue launching unblocked tasks in parallel until plan is done.

Run all available unblocked tasks, wait for completion, log work, then launch next batch. Repeat until **entire plan** is complete.

## Step 6: Validate

After completing all tasks, validate the plan's success by checking the final state against the original plan. Perform available tests and ensure success. If there are any issues, address them before marking the plan as complete.

After validation, provide a summary of:
- Files modified/created
- Changes made
- How criteria are satisfied
- Validation performed or deferred

## Error Handling

- Sprint not found: List available sprints/phases
- Parse failure: Show what was tried, ask for clarification

## Example Usage

```
/parallel-task plan.md
/parallel-task ./plans/auth-plan.md sprint 2
/parallel-task user-profile-plan.md phase 1
```

## Execution Summary Template

```markdown
# Sprint/Phase Execution Summary

## Tasks Assigned: [N]

### Completed
- Task [ID]: [Name] - [Brief summary]

### Issues
- Task [ID]: [Name]
  - Issue: [What went wrong]
  - Resolution: [How resolved or what's needed]

### Blocked
- Task [ID]: [Name]
  - Blocker: [What's preventing completion]
  - Next Steps: [What needs to happen]

## Overall Status
[Completion summary]

## Files Modified
[List of changed files]

## Next Steps
[Recommendations]
```
