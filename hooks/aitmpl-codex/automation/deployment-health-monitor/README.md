# automation/deployment-health-monitor

Monitor deployment status, error rates, and performance metrics, sending notifications for failed deployments or performance degradation. Tracks Vercel deployment health, monitors build success/failure rates, and provides alerts for deployment issues. Setup: Export 'export VERCEL_TOKEN=your_token' and 'export VERCEL_PROJECT_ID=your_project_id' (get from vercel.com/account/tokens and Vercel dashboard).

Compatibility: direct

## Events
- PostToolUse: 1 matcher group(s)
- SessionStart: 1 matcher group(s)

## Install
Copy this bundle into a project and merge its `.codex/hooks.json` into your project `.codex/hooks.json`.
If the bundle includes `.codex/hooks/` support files, copy that directory too.
