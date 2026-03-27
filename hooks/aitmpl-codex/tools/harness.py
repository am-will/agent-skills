#!/usr/bin/env python3
import json
import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / 'catalog.json'
REPORT = ROOT / 'tools' / 'report.json'
NETWORK_KEYWORDS = ['slack', 'discord', 'telegram', 'vercel', 'langsmith']


def load_catalog():
    with CATALOG.open() as fh:
        return json.load(fh)


def install_bundle(bundle_dir: Path, workspace: Path):
    codex_dir = workspace / '.codex'
    codex_dir.mkdir(parents=True, exist_ok=True)
    hooks_json = bundle_dir / 'hooks.json'
    shutil.copy2(hooks_json, codex_dir / 'hooks.json')
    src_hooks = bundle_dir / '.codex' / 'hooks'
    if src_hooks.exists():
        shutil.copytree(src_hooks, codex_dir / 'hooks')
    return codex_dir


def sample_payload(event: str, workspace: Path):
    base = {
        'session_id': str(uuid.uuid4()),
        'turn_id': str(uuid.uuid4()),
        'cwd': str(workspace),
        'model': 'codex-llm',
        'permission_mode': 'standard',
    }
    if event == 'PreToolUse':
        return json.dumps({
            **base,
            'hook_event_name': 'PreToolUse',
            'tool_name': 'Bash',
            'tool_input': {'command': 'echo prehook'},
            'tool_use_id': str(uuid.uuid4()),
        })
    if event == 'PostToolUse':
        payload = {
            **base,
            'hook_event_name': 'PostToolUse',
            'transcript_path': '/tmp/transcript.json',
            'call_id': str(uuid.uuid4()),
            'tool_name': 'Bash',
            'tool_kind': 'command',
            'tool_input': json.dumps({'command': 'echo posthook'}),
            'executed': True,
            'success': True,
            'duration_ms': 30,
            'mutating': False,
            'sandbox': 'none',
            'sandbox_policy': 'none',
            'output_preview': 'ok',
        }
        return json.dumps(payload)
    if event == 'SessionStart':
        return json.dumps({**base, 'hook_event_name': 'SessionStart', 'source': 'startup'})
    if event == 'UserPromptSubmit':
        return json.dumps({**base, 'hook_event_name': 'UserPromptSubmit', 'prompt': 'hey codex'})
    if event == 'Stop':
        return json.dumps({
            **base,
            'hook_event_name': 'Stop',
            'stop_hook_active': True,
            'last_assistant_message': 'done',
        })
    return json.dumps(base)


def should_skip(command: str) -> bool:
    lower = command.lower()
    return any(keyword in lower for keyword in NETWORK_KEYWORDS)


def run_command(cmd: str, payload: str, workspace: Path):
    env = os.environ.copy()
    proc = subprocess.run(
        ['bash', '-lc', cmd],
        input=payload.encode(),
        capture_output=True,
        cwd=workspace,
        env=env,
        timeout=60,
    )
    return proc


def make_report():
    catalog = load_catalog()
    results = []
    for bundle in catalog.get('bundles', []):
        bundle_path = ROOT / bundle['bundlePath']
        if not bundle_path.exists():
            results.append({
                'bundle': bundle['bundlePath'],
                'notes': ['bundle missing, skipped'],
            })
            continue
        with tempfile.TemporaryDirectory(prefix='codex-hook-test-') as tmpdir:
            workspace = Path(tmpdir)
            install_bundle(bundle_path, workspace)
            hooks_file = workspace / '.codex' / 'hooks.json'
            if not hooks_file.exists():
                results.append({
                    'bundle': bundle['bundlePath'],
                    'notes': ['missing hooks.json after install'],
                })
                continue
            with hooks_file.open() as fh:
                hooks = json.load(fh)
            for event, groups in hooks.get('hooks', {}).items():
                for group in groups:
                    for hook in group.get('hooks', []):
                        cmd = hook.get('command')
                        entry = {
                            'bundle': bundle['bundlePath'],
                            'event': event,
                            'command': cmd,
                            'exit_code': None,
                            'stdout_json': False,
                            'runnable': False,
                            'notes': [],
                        }
                        if not cmd:
                            entry['notes'].append('empty command')
                            results.append(entry)
                            continue
                        if should_skip(cmd):
                            entry['notes'].append('skipped (network dependency)')
                            results.append(entry)
                            continue
                        payload = sample_payload(event, workspace)
                        try:
                            proc = run_command(cmd, payload, workspace)
                        except Exception as exc:
                            entry['notes'].append(f'failed to run: {exc}')
                            results.append(entry)
                            continue
                        entry['exit_code'] = proc.returncode
                        entry['runnable'] = proc.returncode == 0
                        try:
                            if proc.stdout.strip():
                                json.loads(proc.stdout.decode().strip())
                                entry['stdout_json'] = True
                        except Exception:
                            entry['stdout_json'] = False
                        if proc.stderr:
                            entry['notes'].append(proc.stderr.decode().strip())
                        results.append(entry)
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps({'results': results}, indent=2))
    print('wrote', REPORT)


def main():
    if not CATALOG.exists():
        raise SystemExit('catalog.json missing')
    make_report()


if __name__ == '__main__':
    main()
