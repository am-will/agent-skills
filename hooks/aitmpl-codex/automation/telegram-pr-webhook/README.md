# automation/telegram-pr-webhook

Send Telegram notification when a new PR is created via gh pr create. Includes PR URL and Vercel preview URL. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables. Optionally set VERCEL_PROJECT_NAME and VERCEL_TEAM_SLUG to construct the Vercel preview URL automatically.

Compatibility: direct

## Events
- PostToolUse: 1 matcher group(s)

## Install
Copy this bundle into a project and merge its `.codex/hooks.json` into your project `.codex/hooks.json`.
If the bundle includes `.codex/hooks/` support files, copy that directory too.
