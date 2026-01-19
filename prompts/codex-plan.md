# Codex Skill Expansion Plan

Date: 2026-01-19
Goal: Fill meaningful gaps in the current skill library with high-impact skills for DevOps/automation, planning/architecture, and code generation/refactoring. Focus on complementary capabilities.

## Gap Analysis Summary

Key gaps identified relative to current skills:
- Git/GitHub workflow automation (PRs, issues, releases, branch management)
- CI/CD pipeline creation and troubleshooting
- Testing automation & quality gates (unit/integration/e2e/lint)
- Database migrations and schema management
- Environment/secrets management across local/CI/deploy
- Code review, static analysis, and security scanning
- Documentation generation and maintenance
- Debugging/profiling tools beyond UI/browser automation
- API development/testing workflows
- Deployment/infrastructure scaffolding and verification
- AI/ML workflow helpers (RAG, embeddings, prompt evaluation)

## Proposed New Skills (9)

### 1) gh-workflow-automation
- Problem it solves: Automates GitHub PR/issue/release workflows missing from the current library.
- Core functionality:
  - Create/update PRs, add labels/reviewers, manage milestones.
  - Generate release notes and draft releases from merged PRs.
  - Sync issues with local branch names and link PRs to issues.
  - Triage stale PRs/issues with rules (age, labels, checks).
- Integration type: MCP-integrated or hybrid (gh CLI + GitHub API).
- Implementation complexity: Medium — gh CLI and API orchestration + auth handling.
- Dependencies: gh CLI, GitHub API token or gh auth.
- Example use cases:
  - “Create a PR from current branch, add reviewers and labels.”
  - “Generate draft release notes for v1.4.0.”
  - “Close stale issues older than 90 days without activity.”

### 2) ci-cd-pipeline-builder
- Problem it solves: Builds or fixes CI/CD pipelines across common providers.
- Core functionality:
  - Scaffold CI configs (GitHub Actions, GitLab CI, CircleCI).
  - Add job matrices, caching, secrets, and artifact uploads.
  - Diagnose failing CI runs from logs and propose fixes.
  - Add deployment stages (preview/prod) with approvals.
- Integration type: Hybrid (local files + provider docs or APIs).
- Implementation complexity: High — multi-provider templates and troubleshooting logic.
- Dependencies: CI config templates, provider docs, optional provider APIs.
- Example use cases:
  - “Add a lint+test matrix for Node 18/20.”
  - “Fix failing GitHub Actions job from recent run.”
  - “Add deploy-to-staging step after tests pass.”

### 3) test-qa-orchestrator
- Problem it solves: Standardizes test setup, execution, and reporting across stacks.
- Core functionality:
  - Detect test frameworks and generate test scripts.
  - Add coverage thresholds and reports (lcov/junit).
  - Wire tests into CI and pre-commit hooks.
  - Create smoke tests for critical paths.
- Integration type: Standalone or hybrid.
- Implementation complexity: Medium — framework detection + scripted updates.
- Dependencies: Project test runner(s) (pytest/jest/go test/etc.).
- Example use cases:
  - “Add Jest coverage thresholds and CI reporting.”
  - “Create a smoke test for the login flow.”
  - “Wire pytest into GitHub Actions with artifacts.”

### 4) db-migrations-schema
- Problem it solves: Adds migrations and schema management workflows.
- Core functionality:
  - Detect ORM/DB tool (Prisma, Alembic, Flyway, Liquibase).
  - Generate migration and apply/rollback plans.
  - Validate schema drift and environment differences.
  - Document schema changes with changelogs.
- Integration type: Hybrid.
- Implementation complexity: Medium — DB tool detection + command orchestration.
- Dependencies: DB CLI tools, database access or local schema files.
- Example use cases:
  - “Create a migration to add a users.last_login column.”
  - “Compare prod vs staging schema and report drift.”
  - “Generate schema changelog for release notes.”

### 5) secrets-env-manager
- Problem it solves: Centralizes environment variable and secret management.
- Core functionality:
  - Inventory env vars from code/config and generate .env.example.
  - Add validation and safe defaults for missing env vars.
  - Integrate with secret managers (1Password, Vault, AWS SSM).
  - Redact secrets from logs and test outputs.
- Integration type: Hybrid or MCP-integrated.
- Implementation complexity: High — secure handling and provider integrations.
- Dependencies: Secret manager APIs/CLIs (optional), dotenv parsers.
- Example use cases:
  - “Create .env.example and validate required vars.”
  - “Sync staging secrets from Vault.”
  - “Audit repo for leaked secrets and rotate.”

### 6) code-review-static-analysis
- Problem it solves: Automates code review checks and static analysis.
- Core functionality:
  - Run linters/formatters and collect reports.
  - Run static analyzers (Semgrep, ESLint, Pylint, golangci-lint).
  - Summarize key findings with severity and fixes.
  - Auto-generate review checklist tailored to repo.
- Integration type: Standalone or hybrid.
- Implementation complexity: Medium — tool integration and report parsing.
- Dependencies: Linter/analyzer CLIs and configs.
- Example use cases:
  - “Run semgrep and report high-severity findings.”
  - “Generate a review checklist for this repo.”
  - “Auto-fix lint errors and open a PR.”

### 7) api-dev-test-kit
- Problem it solves: Speeds API development, validation, and testing.
- Core functionality:
  - Generate OpenAPI specs from routes or code annotations.
  - Create API tests (Postman/newman, REST Assured, pytest).
  - Mock APIs and generate fixtures.
  - Validate backwards compatibility between versions.
- Integration type: Hybrid.
- Implementation complexity: Medium — spec tooling integration.
- Dependencies: OpenAPI tools, test frameworks, mock servers.
- Example use cases:
  - “Create OpenAPI spec for existing Express routes.”
  - “Generate contract tests from OpenAPI.”
  - “Mock a payment API for local dev.”

### 8) deploy-infra-scout
- Problem it solves: Scaffolds and verifies deployments and infra configs.
- Core functionality:
  - Detect deployment targets (Vercel, Netlify, Docker, K8s).
  - Generate deploy config and environment checks.
  - Add health checks and rollback recommendations.
  - Validate infra drift and required permissions.
- Integration type: Hybrid.
- Implementation complexity: High — provider-specific templates and checks.
- Dependencies: Docker/K8s CLIs, cloud provider CLIs, IaC tools.
- Example use cases:
  - “Create Dockerfile + healthcheck for Node app.”
  - “Generate Kubernetes manifest for app + DB.”
  - “Audit Vercel project config and env vars.”

### 9) rag-ml-workbench
- Problem it solves: Adds AI/ML workflow helpers (RAG, embeddings, prompt eval).
- Core functionality:
  - Scaffold RAG pipeline (ingest, chunk, embed, retrieve).
  - Set up vector DB integrations (Pinecone, Weaviate, pgvector).
  - Evaluate prompts with test sets and regression metrics.
  - Generate safety checks and prompt templates.
- Integration type: Hybrid or MCP-integrated.
- Implementation complexity: High — model/provider-specific tooling.
- Dependencies: Vector DB SDKs, embedding APIs, eval tools.
- Example use cases:
  - “Set up a pgvector-based RAG pipeline.”
  - “Create prompt regression tests for chat agent.”
  - “Benchmark retrieval strategies on sample corpus.”

## Prioritization

Recommended initial build order based on impact and effort:
1. gh-workflow-automation
2. ci-cd-pipeline-builder
3. test-qa-orchestrator
4. code-review-static-analysis
5. secrets-env-manager
6. db-migrations-schema
7. api-dev-test-kit
8. deploy-infra-scout
9. rag-ml-workbench

## Implementation Notes

- Favor composable, modular skills that can chain (e.g., test-qa-orchestrator + ci-cd-pipeline-builder).
- Provide consistent CLI entry points and predictable output schemas.
- Add a short “detect” phase to each skill to reduce manual configuration.
- Include “dry-run” modes for destructive operations.
- Use deterministic command execution and file edits for reproducibility.
