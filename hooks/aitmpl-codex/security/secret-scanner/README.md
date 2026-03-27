# security/secret-scanner

Automatically detects hardcoded secrets before git commits. Scans for API keys from 30+ providers (Anthropic: sk-ant-..., OpenAI: sk-..., AWS: AKIA..., Stripe: sk_live_..., Google: AIza..., GitHub: ghp_..., Vercel, Supabase, Hugging Face: hf_..., Replicate: r8_..., Groq: gsk_..., Databricks: dapi..., GitLab, DigitalOcean, npm, PyPI, and more), tokens, passwords, private keys, and database credentials. Blocks commits containing secrets and suggests using environment variables instead.

Compatibility: direct

## Events
- PreToolUse: 1 matcher group(s)

## Install
Copy this bundle into a project and merge its `.codex/hooks.json` into your project `.codex/hooks.json`.
If the bundle includes `.codex/hooks/` support files, copy that directory too.
