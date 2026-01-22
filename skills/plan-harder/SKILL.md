---
name: plan-harder
description: >
  Use when user specfically says 'plan harder'. 
---

# Planner Agent

Create detailed, phased implementation plans for bugs, features, or tasks. 
You make phased implementation plans with sprints and atomic tasks.

## Process

### Phase 0: Research

1. **Investigate the codebase:**
   - Architecture and patterns
   - Similar existing implementations
   - Dependencies and frameworks
   - Related components

2. **Analyze the request:**
   - Core requirements
   - Challenges and edge cases
   - Security/performance/UX considerations

### Phase 1: Clarify Requirements

Use request_user_input to resolve ambiguities. Ask up to 10 targeted questions:
- Scope boundaries (in/out of scope)
- Technology/architectural constraints
- Priorities (critical vs nice-to-have)
- Edge case handling
- Success criteria

### Phase 2: Create Plan

#### Structure
- **Overview**: Brief summary and approach
- **Sprints**: Logical phases that build on each other
- **Tasks**: Specific, actionable items within sprints

#### Sprint Requirements
Each sprint must:
- Result in **demoable, runnable, testable** increment
- Build on prior sprint work
- Include demo/verification checklist

#### Task Requirements
Each task must be:
- **Atomic and committable** (small, independent)
- Specific with clear inputs/outputs
- Independently testable
- Include file paths when relevant
- Include dependencies for parallel execution
- Include tests or validation method

**Bad:** "Implement Google OAuth"
**Good:**
- "Add Google OAuth config to env variables"
- "Install passport-google-oauth20 package"
- "Create OAuth callback route in src/routes/auth.ts"
- "Add Google sign-in button to login UI"

### Phase 3: Save
Save the file

Generate filename from request:
1. Extract key words
2. Convert to kebab-case
3. Add `-plan.md` suffix

Examples:
- "fix xyz bug" → `xyz-bug-plan.md`
- "implement google auth" → `google-auth-plan.md`

### Phase 4: Gotchas

AFTER it is saved. Identify potential issues and edge cases in the plan. Address them proactively. Where could something go wrong? What about the plan is ambiguous? 
Is there a missing step, dependency, or pitfall?

Use the request_user_input tool again now that you have a plan to read, if any issues are identified.

Update the plan if you have improvements.

### Phase 5: Review

Provide the plan file location to a subagent for review, and ask it to provide feedback. Provide it useful context so it can make sound decisions. Explicitly tell it not to ask any questions. If it provides useful feedback, Incorporate useful suggestions to plan. 

## Plan Template

```markdown
# Plan: [Task Name]

**Generated**: [Date]
**Estimated Complexity**: [Low/Medium/High]

## Overview
[Summary of task and approach]

## Prerequisites
- [Dependencies or requirements]
- [Tools, libraries, access needed]

## Sprint 1: [Name]
**Goal**: [What this accomplishes]
**Demo/Validation**:
- [How to run/demo]
- [What to verify]

### Task 1.1: [Name]
- **Location**: [File paths]
- **Description**: [What to do]
- **Complexity**: [1-10]
- **Dependencies**: [Previous tasks]
- **Acceptance Criteria**:
  - [Specific criteria]
- **Validation**:
  - [Tests or verification]

### Task 1.2: [Name]
[...]

## Sprint 2: [Name]
[...]

## Testing Strategy
- [How to test]
- [What to verify per sprint]

## Potential Risks & Gotchas
- [What could go wrong]
- [Mitigation strategies]

## Rollback Plan
- [How to undo if needed]
```

## Important

- Think about full lifecycle: implementation, testing, deployment
- Consider non-functional requirements
- Show user summary and file path when done
- Do NOT implement - only create the plan
