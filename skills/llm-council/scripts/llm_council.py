#!/usr/bin/env python3
import argparse
import json
import os
import queue
from pathlib import Path
import random
import re
import shutil
import shlex
import subprocess
import sys
import time
import threading
from datetime import datetime, timedelta, timezone
import webbrowser
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

import ui_server

RETRY_LIMIT = 2
DEFAULT_TIMEOUT_SEC = 180
DEFAULT_UI_KEEPALIVE_SEC = 20 * 60
DEFAULT_UI_SESSION_TTL_SEC = 30 * 60

CODEX_MODEL = "gpt-5.2-codex"
CODEX_REASONING = "xhigh"
CLAUDE_MODEL = "opus"
GEMINI_MODEL = "gemini-3-pro-preview"

@dataclass
class AgentConfig:
    name: str
    kind: str
    command: Optional[str] = None
    output_format: str = "text"
    model: Optional[str] = None
    reasoning_effort: Optional[str] = None
    agent: Optional[str] = None
    attach: Optional[str] = None
    cli_format: Optional[str] = None
    prompt_mode: str = "arg"
    extra_args: List[str] = field(default_factory=list)

@dataclass
class AgentResult:
    name: str
    raw_output: str
    data: Optional[Dict[str, Any]]
    valid: bool
    error: Optional[str]


@dataclass
class RunningAgent:
    config: AgentConfig
    prompt: str
    start_time: float
    process: Any


def load_json(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: str, payload: Dict[str, Any]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, sort_keys=True)


def extract_json(text: str) -> Optional[Dict[str, Any]]:
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def extract_json_array(text: str) -> Optional[List[Any]]:
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None


def extract_agent_response(config: AgentConfig, raw: str) -> str:
    kind = (config.kind or config.name).lower()
    if kind == "codex":
        for line in raw.splitlines():
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(event, dict):
                continue
            kind = event.get("event") or event.get("type")
            if kind == "turn.completed":
                content = event.get("content")
                if isinstance(content, str):
                    return content
                message = event.get("message")
                if isinstance(message, dict):
                    msg_content = message.get("content")
                    if isinstance(msg_content, str):
                        return msg_content
            if kind == "item.completed":
                item = event.get("item")
                if isinstance(item, dict):
                    if item.get("type") in ("agent_message", "assistant_message"):
                        text = item.get("text")
                        if isinstance(text, str):
                            return text
        return raw

    if kind == "claude":
        events = extract_json_array(raw)
        if events is None:
            return raw
        if isinstance(events, list):
            for item in reversed(events):
                if isinstance(item, dict) and item.get("type") == "result":
                    result = item.get("result")
                    if isinstance(result, str):
                        return result
            for item in reversed(events):
                if isinstance(item, dict) and item.get("type") == "assistant":
                    msg = item.get("message")
                    if isinstance(msg, dict):
                        content_list = msg.get("content")
                        if isinstance(content_list, list):
                            for block in content_list:
                                if isinstance(block, dict) and isinstance(block.get("text"), str):
                                    return block["text"]
        return raw

    if kind == "gemini":
        envelope = extract_json(raw)
        if envelope is None:
            try:
                envelope = json.loads(raw)
            except json.JSONDecodeError:
                return raw
        if isinstance(envelope, dict):
            for key in ("response", "completion", "content", "output", "text"):
                value = envelope.get(key)
                if isinstance(value, str):
                    return value
            content = envelope.get("content")
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and isinstance(item.get("text"), str):
                        return item["text"]
        return raw

    if kind == "opencode":
        # Prefer OpenCode JSON event stream output when --format json is used.
        text_parts: List[str] = []
        for line in raw.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(event, dict):
                continue
            direct_text = event.get("text")
            if isinstance(direct_text, str):
                text_parts.append(direct_text)
                continue
            part = event.get("part")
            if isinstance(part, dict):
                part_text = part.get("text")
                if isinstance(part_text, str):
                    text_parts.append(part_text)
        if text_parts:
            return "".join(text_parts).strip()
        envelope = extract_json(raw)
        if envelope is None:
            try:
                envelope = json.loads(raw)
            except json.JSONDecodeError:
                envelope = None
        if isinstance(envelope, dict):
            for key in ("response", "completion", "content", "output", "text", "message"):
                value = envelope.get(key)
                if isinstance(value, str):
                    return value
            content = envelope.get("content")
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and isinstance(item.get("text"), str):
                        return item["text"]
        if isinstance(envelope, list):
            for item in reversed(envelope):
                if isinstance(item, dict):
                    for key in ("content", "text", "message", "output"):
                        value = item.get(key)
                        if isinstance(value, str):
                            return value
        return raw

    return raw


def _build_command_and_input(config: AgentConfig, prompt: str) -> Tuple[List[str], Optional[str]]:
    kind = (config.kind or config.name).lower()
    if kind == "codex":
        model = config.model or CODEX_MODEL
        reasoning = config.reasoning_effort or CODEX_REASONING
        args = [
            "codex",
            "exec",
            "--json",
            "-m",
            model,
            "-c",
            f"model_reasoning_effort={reasoning}",
        ]
        args.extend(config.extra_args)
        args.append(prompt)
        return (
            args,
            None,
        )
    if kind == "gemini":
        model = config.model or GEMINI_MODEL
        args = ["gemini", "--output-format", "json"]
        if model:
            args.extend(["--model", model])
        args.extend(config.extra_args)
        args.extend(["-p", prompt])
        return (
            args,
            None,
        )
    if kind == "claude":
        model = config.model or CLAUDE_MODEL
        args = [
            "claude",
            "--output-format",
            "json",
            "--model",
            model,
            "--max-turns",
            "1",
            "--no-session-persistence",
            "--dangerously-skip-permissions",
            "--tools",
            "",
            "--disable-slash-commands",
        ]
        args.extend(config.extra_args)
        args.extend(["-p", prompt])
        return (
            args,
            None,
        )
    if kind == "opencode":
        args = ["opencode", "run"]
        args.extend(config.extra_args)
        if config.model:
            args.extend(["--model", config.model])
        if config.agent:
            args.extend(["--agent", config.agent])
        if config.cli_format:
            args.extend(["--format", config.cli_format])
        if config.attach:
            args.extend(["--attach", config.attach])
        args.append(prompt)
        return (args, None)
    if not config.command:
        raise ValueError(f"custom agent '{config.name}' requires a command")
    args = shlex.split(config.command)
    if config.extra_args:
        args.extend(config.extra_args)
    if (config.prompt_mode or "stdin").lower() == "stdin":
        return (args, prompt + "\n")
    return (args + [prompt], None)


def spawn_cli_agent(config: AgentConfig, prompt: str) -> RunningAgent:
    args, stdin_payload = _build_command_and_input(config, prompt)
    process = subprocess.Popen(
        args,
        stdin=subprocess.PIPE if stdin_payload is not None else None,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        start_new_session=True,
    )
    if stdin_payload is not None and process.stdin:
        process.stdin.write(stdin_payload)
        process.stdin.close()
    return RunningAgent(config=config, prompt=prompt, start_time=time.time(), process=process)


def collect_cli_output(running: RunningAgent, timeout_sec: int) -> str:
    try:
        stdout, stderr = running.process.communicate(timeout=timeout_sec)
    except subprocess.TimeoutExpired as exc:
        running.process.kill()
        stdout, stderr = running.process.communicate()
        raise TimeoutError(f"{running.config.name} timed out") from exc
    combined = stdout or ""
    if stderr:
        combined = combined + "\n" + stderr
    return combined


def anonymize_text(text: str) -> str:
    patterns = [
        r"codex",
        r"claude",
        r"gemini",
        r"opencode",
        r"openai",
        r"anthropic",
        r"google",
        r"gpt[-_\\w]*",
        r"sk-[A-Za-z0-9]{10,}",
        r"system prompt",
        r"tool trace",
        r"trace id",
    ]
    pattern = re.compile("|".join(patterns), flags=re.IGNORECASE)
    return pattern.sub("[REDACTED]", text)


def validate_markdown_plan(text: str) -> Tuple[bool, Optional[str]]:
    required = [
        "# Plan",
        "## Overview",
        "## Scope",
        "## Phases",
        "## Testing Strategy",
        "## Risks",
        "## Rollback Plan",
        "## Edge Cases",
    ]
    missing = [header for header in required if header not in text]
    if missing:
        return False, "missing headers: " + ", ".join(missing)
    return True, None


def validate_markdown_judge(text: str) -> Tuple[bool, Optional[str]]:
    required = [
        "# Judge Report",
        "## Scores",
        "## Comparative Analysis",
        "## Missing Steps",
        "## Contradictions",
        "## Improvements",
        "## Final Plan",
    ]
    missing = [header for header in required if header not in text]
    if missing:
        return False, "missing headers: " + ", ".join(missing)
    return True, None


def _ui_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ui_deadline_from_now(seconds: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(seconds=seconds)).isoformat()


def _ui_truncate(text: str, max_len: int = 600) -> str:
    cleaned = (text or "").strip()
    if not cleaned:
        return ""
    if len(cleaned) <= max_len:
        return cleaned
    return cleaned[:max_len].rstrip() + "…"


def _ui_update_timestamp(state: Dict[str, Any], timestamp: str) -> None:
    timestamps = state.get("timestamps")
    if not isinstance(timestamps, dict):
        timestamps = {}
    if "started_at" not in timestamps:
        timestamps["started_at"] = timestamp
    timestamps["updated_at"] = timestamp
    state["timestamps"] = timestamps


def _ui_emit(ui_instance: Optional["ui_server.UIServer"], event_type: str, payload: Dict[str, Any]) -> None:
    if not ui_instance:
        return
    ui_instance.broadcast({"type": event_type, "payload": payload})


def _ui_set_session_state(
    ui_state: Optional["ui_server.UIState"],
    ui_instance: Optional["ui_server.UIServer"],
    keep_open: bool,
    deadline: Optional[str],
    timestamp: str,
) -> None:
    if not ui_state:
        return
    def mutator(state: Dict[str, Any]) -> None:
        state["keep_open"] = keep_open
        state["ui_deadline"] = deadline or ""
        _ui_update_timestamp(state, timestamp)
    ui_state.mutate(mutator)
    _ui_emit(
        ui_instance,
        "session_update",
        {"keep_open": keep_open, "ui_deadline": deadline or "", "timestamp": timestamp},
    )


def _ui_set_phase(
    ui_state: Optional["ui_server.UIState"],
    ui_instance: Optional["ui_server.UIServer"],
    phase: str,
    timestamp: str,
) -> None:
    if not ui_state:
        return
    def mutator(state: Dict[str, Any]) -> None:
        state["phase"] = phase
        _ui_update_timestamp(state, timestamp)
    ui_state.mutate(mutator)
    _ui_emit(ui_instance, "phase_change", {"phase": phase, "timestamp": timestamp})


def _ui_upsert_planner(
    ui_state: Optional["ui_server.UIState"],
    ui_instance: Optional["ui_server.UIServer"],
    planner_id: str,
    status: str,
    summary: str,
    errors: Optional[List[str]],
    timestamp: str,
) -> None:
    if not ui_state:
        return
    entry = {"id": planner_id, "status": status, "summary": summary, "errors": errors or []}
    def mutator(state: Dict[str, Any]) -> None:
        planners = state.get("planners")
        if not isinstance(planners, list):
            planners = []
        index = next((i for i, item in enumerate(planners) if item.get("id") == planner_id), None)
        if index is None:
            planners.append(entry)
        else:
            planners[index] = entry
        state["planners"] = planners
        _ui_update_timestamp(state, timestamp)
    ui_state.mutate(mutator)
    _ui_emit(ui_instance, "planner_update", {"planner": entry, "timestamp": timestamp})


def _ui_update_judge(
    ui_state: Optional["ui_server.UIState"],
    ui_instance: Optional["ui_server.UIServer"],
    status: str,
    summary: str,
    errors: Optional[List[str]],
    timestamp: str,
) -> None:
    if not ui_state:
        return
    judge_entry = {"status": status, "summary": summary, "errors": errors or []}
    def mutator(state: Dict[str, Any]) -> None:
        state["judge"] = judge_entry
        _ui_update_timestamp(state, timestamp)
    ui_state.mutate(mutator)
    _ui_emit(ui_instance, "judge_update", {"judge": judge_entry, "timestamp": timestamp})


def _ui_set_final_plan(
    ui_state: Optional["ui_server.UIState"],
    ui_instance: Optional["ui_server.UIServer"],
    final_plan: str,
    timestamp: str,
) -> None:
    if not ui_state:
        return
    def mutator(state: Dict[str, Any]) -> None:
        state["final_plan"] = final_plan
        _ui_update_timestamp(state, timestamp)
    ui_state.mutate(mutator)
    _ui_emit(ui_instance, "final_plan", {"final_plan": final_plan, "timestamp": timestamp})


def _ui_action_result(
    ui_instance: Optional["ui_server.UIServer"],
    action: str,
    status: str,
    message: str,
    url: Optional[str],
    timestamp: str,
) -> None:
    if not ui_instance:
        return
    payload = {"action": action, "status": status, "message": message, "timestamp": timestamp}
    if url:
        payload["url"] = url
    _ui_emit(ui_instance, "action_result", payload)


class _KeepaliveController:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.keep_open = False

    def set_keep_open(self, value: bool) -> None:
        with self._lock:
            self.keep_open = value

    def should_keep_open(self) -> bool:
        with self._lock:
            return self.keep_open


def _parse_ui_deadline(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _start_ui_session_timer(
    ui_instance: "ui_server.UIServer",
    ui_state: "ui_server.UIState",
    stop_event: threading.Event,
    keepalive: Optional[_KeepaliveController],
) -> None:
    def run() -> None:
        while not stop_event.is_set():
            state = ui_state.get()
            keep_open = bool(state.get("keep_open"))
            if keepalive and keepalive.should_keep_open():
                keep_open = True
            if not keep_open:
                deadline = _parse_ui_deadline(state.get("ui_deadline"))
                if deadline and datetime.now(timezone.utc) >= deadline:
                    _ui_action_result(
                        ui_instance,
                        "session",
                        "expired",
                        "session expired",
                        None,
                        _ui_timestamp(),
                    )
                    stop_event.set()
                    ui_instance.shutdown()
                    break
            time.sleep(1)

    thread = threading.Thread(target=run, name="ui-session-timer", daemon=True)
    thread.start()


def _coerce_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    return str(value)


def _build_refine_prompt(plan_template: str, task_brief: str, final_plan: str, context: str) -> str:
    notes = context.strip() if context else "No extra context provided."
    return (
        "You are refining a plan. Return only updated plan markdown that follows the template below.\n\n"
        f"Task brief:\n{task_brief}\n\n"
        f"Template:\n{plan_template}\n\n"
        f"Current plan:\n{final_plan}\n\n"
        f"Refinement request:\n{notes}\n"
    )


def _rebuild_ui_state_from_run(run_dir: Path) -> Dict[str, Any]:
    planners = []
    for plan_path in sorted(run_dir.glob("plan-*.md")):
        name = plan_path.stem[len("plan-") :]
        if name.endswith("-attempt1") or name.endswith("-attempt2") or name.endswith("-attempt3"):
            continue
        planners.append(
            {
                "id": name,
                "status": "complete",
                "summary": load_text(str(plan_path)),
                "errors": [],
            }
        )
    judge_path = run_dir / "judge.md"
    final_path = run_dir / "final-plan.md"
    return {
        "run_id": run_dir.name,
        "task_brief": "",
        "phase": "complete",
        "planners": planners,
        "judge": {
            "status": "complete" if judge_path.exists() else "unknown",
            "summary": load_text(str(judge_path)) if judge_path.exists() else "",
            "errors": [],
        },
        "final_plan": load_text(str(final_path)) if final_path.exists() else "",
        "errors": [],
        "keep_open": False,
        "ui_deadline": _ui_deadline_from_now(DEFAULT_UI_SESSION_TTL_SEC),
        "timestamps": {"started_at": "", "updated_at": _ui_timestamp()},
    }


def _next_numbered_final_plan_path(run_dir: Path) -> Path:
    pattern = re.compile(r"^final-plan-(\d+)\.md$")
    max_num = 0
    for path in run_dir.glob("final-plan-*.md"):
        match = pattern.match(path.name)
        if not match:
            continue
        max_num = max(max_num, int(match.group(1)))
    return run_dir / f"final-plan-{max_num + 1}.md"


def _handle_ui_actions(
    ui_instance: "ui_server.UIServer",
    ui_state: Optional["ui_server.UIState"],
    run_dir: Path,
    task_spec: Dict[str, Any],
    args: argparse.Namespace,
    config_path: Path,
    stop_event: threading.Event,
    keepalive: Optional[_KeepaliveController] = None,
    judge: Optional[AgentConfig] = None,
    plan_template: Optional[str] = None,
) -> None:
    while not stop_event.is_set():
        try:
            action = ui_instance.actions.get(timeout=0.5)
        except queue.Empty:
            continue
        try:
            path = action.path
            payload = action.payload or {}
            if path == "/api/save":
                final_plan = _coerce_text(payload.get("final_plan"))
                save_path = _next_numbered_final_plan_path(run_dir)
                save_path.write_text(final_plan, encoding="utf-8")
                _ui_action_result(
                    ui_instance,
                    "save",
                    "saved",
                    f"Saved at {save_path.resolve()}!",
                    None,
                    _ui_timestamp(),
                )
                continue
            if path == "/api/accept":
                final_plan = _coerce_text(payload.get("final_plan"))
                accept_path = run_dir / "final-plan-accepted.md"
                accept_path.write_text(final_plan, encoding="utf-8")
                final_path = run_dir / "final-plan.md"
                final_path.write_text(final_plan, encoding="utf-8")
                _ui_set_final_plan(ui_state, ui_instance, final_plan, _ui_timestamp())
                _ui_action_result(
                    ui_instance,
                    "accept",
                    "accepted",
                    "accepted plan and closing UI",
                    None,
                    _ui_timestamp(),
                )
                stop_event.set()
                ui_instance.shutdown()
                continue
            if path == "/api/refine":
                if not judge or not plan_template:
                    _ui_action_result(ui_instance, "refine", "failed", "refine unavailable", None, _ui_timestamp())
                    continue
                context = _coerce_text(payload.get("context")).strip()
                final_plan = _coerce_text(payload.get("final_plan")).strip()
                if not final_plan:
                    _ui_action_result(ui_instance, "refine", "failed", "no plan to refine", None, _ui_timestamp())
                    continue
                start_ts = _ui_timestamp()
                _ui_update_judge(
                    ui_state,
                    ui_instance,
                    status="running",
                    summary="refining…",
                    errors=[],
                    timestamp=start_ts,
                )
                task_brief = build_task_brief(task_spec)
                prompt = _build_refine_prompt(plan_template, task_brief, final_plan, context)
                running = spawn_cli_agent(judge, prompt)
                try:
                    raw = collect_cli_output(running, args.timeout)
                except TimeoutError as exc:
                    _ui_update_judge(
                        ui_state,
                        ui_instance,
                        status="failed",
                        summary=str(exc),
                        errors=[str(exc)],
                        timestamp=_ui_timestamp(),
                    )
                    _ui_action_result(ui_instance, "refine", "failed", str(exc), None, _ui_timestamp())
                    continue
                normalized = extract_agent_response(judge, raw).strip()
                valid, err = validate_markdown_plan(normalized)
                if not valid:
                    _ui_update_judge(
                        ui_state,
                        ui_instance,
                        status="needs-fix",
                        summary=normalized,
                        errors=[err] if err else [],
                        timestamp=_ui_timestamp(),
                    )
                    _ui_action_result(ui_instance, "refine", "failed", err or "invalid plan", None, _ui_timestamp())
                    continue
                refined_name = f"final-plan-refined-{time.strftime('%Y%m%d-%H%M%S')}.md"
                refined_path = run_dir / refined_name
                refined_path.write_text(normalized, encoding="utf-8")
                final_path = run_dir / "final-plan.md"
                final_path.write_text(normalized, encoding="utf-8")
                _ui_set_final_plan(ui_state, ui_instance, normalized, _ui_timestamp())
                _ui_update_judge(
                    ui_state,
                    ui_instance,
                    status="complete",
                    summary=normalized,
                    errors=[],
                    timestamp=_ui_timestamp(),
                )
                _ui_action_result(ui_instance, "refine", "complete", "refined plan saved", None, _ui_timestamp())
                continue
            if path == "/api/keepalive":
                keep_open = bool(payload.get("keep_open"))
                if keepalive:
                    keepalive.set_keep_open(keep_open)
                deadline = "" if keep_open else _ui_deadline_from_now(DEFAULT_UI_SESSION_TTL_SEC)
                _ui_set_session_state(ui_state, ui_instance, keep_open, deadline, _ui_timestamp())
                status = "enabled" if keep_open else "disabled"
                _ui_action_result(ui_instance, "keepalive", status, f"keep open {status}", None, _ui_timestamp())
                continue
            _ui_action_result(ui_instance, "unknown", "ignored", f"unhandled action: {path}", None, _ui_timestamp())
        except Exception as exc:
            _ui_action_result(ui_instance, "error", "failed", str(exc), None, _ui_timestamp())


def render_planner_prompt(task_spec: Dict[str, Any], plan_template: str, prompt_template: str) -> str:
    brief = build_task_brief(task_spec)
    prompt = prompt_template.replace("{{TASK_BRIEF}}", brief)
    return prompt.replace("{{PLAN_TEMPLATE}}", plan_template)


def render_judge_prompt(task_spec: Dict[str, Any], plans: List[Dict[str, Any]], judge_template: str, prompt_template: str) -> str:
    brief = build_task_brief(task_spec)
    plans_block = "\n\n".join(f"### {p['label']}\n\n{p['plan']}" for p in plans)
    prompt = prompt_template.replace("{{TASK_BRIEF}}", brief)
    prompt = prompt.replace("{{PLANS_MD}}", plans_block)
    return prompt.replace("{{JUDGE_TEMPLATE}}", judge_template)


def load_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def resolve_path(relative_path: str) -> str:
    base_dir = Path(__file__).resolve().parent
    return str((base_dir / relative_path).resolve())


def get_run_root() -> Path:
    return Path.cwd() / "llm-council" / "runs"


def slugify(value: str, max_len: int = 40) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    if not cleaned:
        return "run"
    return cleaned[:max_len].strip("-")


def unique_run_dir(run_root: Path, base_name: str) -> Path:
    candidate = run_root / base_name
    if not candidate.exists():
        return candidate
    counter = 2
    while True:
        candidate = run_root / f"{base_name}-{counter}"
        if not candidate.exists():
            return candidate
        counter += 1


def maybe_trash_empty_dir(path: Path) -> None:
    if not path.exists() or not path.is_dir():
        return
    if any(path.iterdir()):
        return
    trash_bin = shutil.which("trash")
    if not trash_bin:
        return
    subprocess.run([trash_bin, str(path)], check=False)


def get_default_config_path() -> Path:
    base = os.environ.get("XDG_CONFIG_HOME")
    if base:
        return Path(base) / "llm-council" / "agents.json"
    return Path.home() / ".config" / "llm-council" / "agents.json"


def load_agent_config_file(path: Path) -> Optional[Dict[str, Any]]:
    if not path.exists():
        return None
    data = load_json(str(path))
    if isinstance(data, dict) and "agents" in data and isinstance(data["agents"], dict):
        return data["agents"]
    if isinstance(data, dict) and ("planners" in data or "judge" in data):
        return data
    return None


def configure_agents(config_path: Path) -> None:
    def prompt_text(label: str, default: Optional[str] = None) -> str:
        suffix = f" (default: {default})" if default else ""
        value = input(f"{label}{suffix}: ").strip()
        return value if value else (default or "")

    def prompt_choice(label: str, choices: List[str], default_idx: int = 1) -> int:
        while True:
            raw = input(f"{label} (default: {default_idx}): ").strip()
            if not raw:
                return default_idx
            try:
                value = int(raw)
            except ValueError:
                print("Please enter a number.")
                continue
            if 1 <= value <= len(choices):
                return value
            print(f"Choose a number between 1 and {len(choices)}.")

    def prompt_yes_no(label: str, default_yes: bool = True) -> bool:
        default = "Y/n" if default_yes else "y/N"
        raw = input(f"{label} [{default}] ").strip().lower()
        if not raw:
            return default_yes
        return raw in ("y", "yes")

    print("Council setup")
    if prompt_yes_no("Use default council (Codex CLI + Claude CLI + Gemini CLI)?", default_yes=True):
        planners = [
            {"name": "codex-1", "kind": "codex", "model": CODEX_MODEL, "reasoning_effort": CODEX_REASONING},
            {"name": "claude-2", "kind": "claude", "model": CLAUDE_MODEL},
            {"name": "gemini-3", "kind": "gemini", "model": GEMINI_MODEL},
        ]
        judge = planners[0]
    else:
        count_raw = prompt_text("How many planners?", "3")
        try:
            planner_count = max(1, int(count_raw))
        except ValueError:
            planner_count = 3

        planners = []
        for idx in range(1, planner_count + 1):
            print(f"\nPlanner {idx}")
            kinds = ["codex", "claude", "gemini", "opencode", "custom"]
            for i, kind in enumerate(kinds, start=1):
                print(f"{i}) {kind}")
            choice = prompt_choice("Choose CLI", kinds, default_idx=1)
            kind = kinds[choice - 1]

            default_name = f"{kind}-{idx}"
            name = prompt_text("Planner name", default_name) or default_name

            planner: Dict[str, Any] = {"name": name, "kind": kind}
            if kind == "codex":
                planner["model"] = prompt_text("Codex model", CODEX_MODEL)
                planner["reasoning_effort"] = prompt_text("Reasoning effort", CODEX_REASONING)
            elif kind == "claude":
                planner["model"] = prompt_text("Claude model", CLAUDE_MODEL)
            elif kind == "gemini":
                planner["model"] = prompt_text("Gemini model", GEMINI_MODEL)
            elif kind == "opencode":
                print(
                    "Opencode provider/model (note: run 'opencode models' in another terminal to see available models)"
                )
                model = prompt_text("Provider/model", "")
                while not model:
                    model = prompt_text("Provider/model", "")
                planner["model"] = model
            else:
                planner["command"] = prompt_text("Command", "")
                while not planner["command"]:
                    planner["command"] = prompt_text("Command", "")
                prompt_mode = prompt_text("Prompt mode (arg|stdin)", "arg").lower()
                planner["prompt_mode"] = "stdin" if prompt_mode == "stdin" else "arg"

            planners.append(planner)

        print("\nWhich model should be the judge?")
        for i, planner in enumerate(planners, start=1):
            model = planner.get("model")
            label = f"{planner['name']} ({planner['kind']}"
            if model:
                label += f": {model}"
            label += ")"
            print(f"{i}) {label}")
        judge_idx = prompt_choice("Select judge", planners, default_idx=1)
        judge = planners[judge_idx - 1]

    payload = {"planners": planners, "judge": judge}
    config_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = config_path.with_suffix(config_path.suffix + ".tmp")
    print(f"\nSaving config to {config_path}.")
    write_json(str(tmp_path), payload)
    os.replace(tmp_path, config_path)
    print("Saved.")


def build_task_brief(task_spec: Dict[str, Any]) -> str:
    lines = []
    task = (task_spec.get("task") or "").strip()
    lines.append(f"Task: {task}")
    constraints = task_spec.get("constraints") or []
    if constraints:
        lines.append("Constraints:")
        for item in constraints:
            lines.append(f"- {item}")
    repo = task_spec.get("repo_context") or {}
    if repo:
        root = repo.get("root")
        paths = repo.get("paths") or []
        notes = repo.get("notes")
        if root:
            lines.append(f"Repo root: {root}")
        if paths:
            lines.append("Relevant paths:")
            for path in paths:
                lines.append(f"- {path}")
        if notes:
            lines.append(f"Notes: {notes}")
    return "\n".join(lines).strip()


def _normalize_agent_spec(spec: Any, fallback_name: str) -> AgentConfig:
    if isinstance(spec, str):
        data = {"name": spec, "kind": spec}
    elif isinstance(spec, dict):
        data = spec
    else:
        raise ValueError("agent spec must be an object or string")
    name = str(data.get("name") or fallback_name).strip()
    kind = str(data.get("kind") or data.get("cli") or data.get("type") or name).strip().lower()
    output_format = str(data.get("output_format") or "text").strip()
    model = data.get("model")
    reasoning_effort = data.get("reasoning_effort") or data.get("reasoning")
    agent = data.get("agent")
    attach = data.get("attach")
    cli_format = data.get("format") or data.get("cli_format")
    command = data.get("command")
    prompt_mode = data.get("prompt_mode") or "arg"
    extra_args = data.get("extra_args") or []
    if not isinstance(extra_args, list):
        extra_args = [str(extra_args)]
    extra_args = [str(item) for item in extra_args]
    if kind == "opencode" and not cli_format:
        cli_format = "json"
    return AgentConfig(
        name=name,
        kind=kind,
        command=command,
        output_format=output_format,
        model=model,
        reasoning_effort=reasoning_effort,
        agent=agent,
        attach=attach,
        cli_format=cli_format,
        prompt_mode=prompt_mode,
        extra_args=extra_args,
    )


def load_agent_configs(task_spec: Dict[str, Any], config_path: Optional[Path] = None) -> Tuple[List[AgentConfig], AgentConfig]:
    agents_spec = task_spec.get("agents")
    if not agents_spec:
        config_path = config_path or get_default_config_path()
        config_spec = load_agent_config_file(config_path)
        if config_spec:
            agents_spec = config_spec

    if not agents_spec:
        raise ValueError(
            "Uh oh! Your models are not configured. Please run `./setup.sh` to select your models. "
            "You can override or change these models at any time by running the setup script again."
        )

    if isinstance(agents_spec, list):
        planner_specs = agents_spec
        judge_spec = None
    elif isinstance(agents_spec, dict):
        planner_specs = agents_spec.get("planners") or agents_spec.get("agents") or []
        judge_spec = agents_spec.get("judge")
    else:
        raise ValueError("agents must be a list or object with planners")

    if not planner_specs:
        raise ValueError("agents.planners must include at least one agent")

    planners: List[AgentConfig] = []
    seen = set()
    for idx, spec in enumerate(planner_specs, start=1):
        agent = _normalize_agent_spec(spec, f"planner-{idx}")
        if agent.name in seen:
            agent.name = f"{agent.name}-{idx}"
        seen.add(agent.name)
        planners.append(agent)

    if judge_spec:
        judge = _normalize_agent_spec(judge_spec, "judge")
    else:
        primary = planners[0]
        judge = AgentConfig(
            name=f"{primary.name}-judge",
            kind=primary.kind,
            command=primary.command,
            output_format=primary.output_format,
            model=primary.model,
            reasoning_effort=primary.reasoning_effort,
            agent=primary.agent,
            attach=primary.attach,
            cli_format=primary.cli_format,
            prompt_mode=primary.prompt_mode,
            extra_args=list(primary.extra_args),
        )

    return planners, judge


def run_planners(
    task_spec: Dict[str, Any],
    planners: List[AgentConfig],
    planner_prompt_template: str,
    plan_template: str,
    timeout_sec: int,
    run_dir: str,
    ui_state: Optional["ui_server.UIState"] = None,
    ui_instance: Optional["ui_server.UIServer"] = None,
) -> List[AgentResult]:
    results: List[AgentResult] = []
    remaining = planners[:]
    attempt = 0
    while remaining and attempt <= RETRY_LIMIT:
        running: List[RunningAgent] = []
        for planner in remaining:
            prompt = render_planner_prompt(task_spec, plan_template, planner_prompt_template)
            timestamp = _ui_timestamp()
            _ui_upsert_planner(
                ui_state,
                ui_instance,
                planner_id=planner.name,
                status="running",
                summary="starting…",
                errors=[],
                timestamp=timestamp,
            )
            running.append(spawn_cli_agent(planner, prompt))

        remaining = []
        for entry in running:
            try:
                raw = collect_cli_output(entry, timeout_sec)
                timeout_error = None
            except TimeoutError as exc:
                raw = ""
                timeout_error = str(exc)
            normalized = extract_agent_response(entry.config, raw)
            plan_text = normalized.strip()
            if timeout_error is not None:
                valid, err = False, timeout_error
            else:
                valid, err = validate_markdown_plan(plan_text)
            plan_path = Path(run_dir) / f"plan-{entry.config.name}-attempt{attempt + 1}.md"
            write_attempt = attempt > 0 or not valid
            if write_attempt:
                plan_path.write_text(plan_text, encoding="utf-8")
            if valid:
                final_path = Path(run_dir) / f"plan-{entry.config.name}.md"
                final_path.write_text(plan_text, encoding="utf-8")
            timestamp = _ui_timestamp()
            status = "complete" if valid else ("failed" if timeout_error else "needs-fix")
            errors = [err] if err else []
            summary = plan_text
            _ui_upsert_planner(
                ui_state,
                ui_instance,
                planner_id=entry.config.name,
                status=status,
                summary=summary or ("error" if errors else ""),
                errors=errors,
                timestamp=timestamp,
            )
            result = AgentResult(
                name=entry.config.name,
                raw_output=raw,
                data={"path": str(plan_path if write_attempt else final_path), "text": plan_text},
                valid=valid,
                error=err,
            )
            results.append(result)
            if not valid and attempt < RETRY_LIMIT:
                retry_timestamp = _ui_timestamp()
                _ui_upsert_planner(
                    ui_state,
                    ui_instance,
                    planner_id=entry.config.name,
                    status="retrying",
                    summary="retry scheduled",
                    errors=[err] if err else [],
                    timestamp=retry_timestamp,
                )
                remaining.append(entry.config)

        attempt += 1
    return results


def run_judge(
    task_spec: Dict[str, Any],
    plans: List[Dict[str, Any]],
    judge: AgentConfig,
    judge_prompt_template: str,
    judge_template: str,
    timeout_sec: int,
    run_dir: str,
    ui_state: Optional["ui_server.UIState"] = None,
    ui_instance: Optional["ui_server.UIServer"] = None,
) -> AgentResult:
    prompt = render_judge_prompt(task_spec, plans, judge_template, judge_prompt_template)
    start_timestamp = _ui_timestamp()
    _ui_update_judge(
        ui_state,
        ui_instance,
        status="running",
        summary="starting…",
        errors=[],
        timestamp=start_timestamp,
    )
    running = spawn_cli_agent(judge, prompt)
    try:
        raw = collect_cli_output(running, timeout_sec)
        timeout_error = None
    except TimeoutError as exc:
        raw = ""
        timeout_error = str(exc)
    normalized = extract_agent_response(judge, raw)
    judge_text = normalized.strip()
    judge_path = Path(run_dir) / "judge.md"
    judge_path.write_text(judge_text, encoding="utf-8")
    if timeout_error is not None:
        valid, err = False, timeout_error
    else:
        valid, err = validate_markdown_judge(judge_text)
    finish_timestamp = _ui_timestamp()
    status = "complete" if valid else ("failed" if timeout_error else "needs-fix")
    errors = [err] if err else []
    summary = judge_text
    _ui_update_judge(
        ui_state,
        ui_instance,
        status=status,
        summary=summary or ("error" if errors else ""),
        errors=errors,
        timestamp=finish_timestamp,
    )
    return AgentResult(
        name=judge.name,
        raw_output=raw,
        data={"path": str(judge_path), "text": judge_text},
        valid=valid,
        error=err,
    )


def extract_final_plan(judge_text: str) -> str:
    marker = "## Final Plan"
    if marker not in judge_text:
        return judge_text
    after = judge_text.split(marker, 1)[1]
    plan_start = after.find("# Plan")
    if plan_start == -1:
        return after.strip()
    return after[plan_start:].strip()


def main() -> int:
    parser = argparse.ArgumentParser(prog="llm-council")
    sub = parser.add_subparsers(dest="cmd", required=True)

    run = sub.add_parser("run")
    run.add_argument("--spec", required=True, help="Path to task spec JSON")
    run.add_argument("--out", required=False, help="Path to write final plan Markdown")
    run.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT_SEC)
    run.add_argument("--seed", type=int, default=None)
    run.add_argument("--config", required=False, help="Path to agents config JSON")
    run.add_argument("--no-ui", action="store_true", help="Disable the live UI server")
    run.add_argument(
        "--ui-keepalive-seconds",
        type=int,
        default=DEFAULT_UI_KEEPALIVE_SEC,
        help="Keep the UI server alive for N seconds after completion (0 to disable)",
    )

    ui = sub.add_parser("ui")
    ui.add_argument("--run-dir", required=True, help="Path to a run directory to resume")
    ui.add_argument("--no-open", action="store_true", help="Do not auto-open a browser window")

    configure = sub.add_parser("configure")
    configure.add_argument("--config", required=False, help="Path to write agents config JSON")

    args = parser.parse_args()

    if args.cmd == "configure":
        config_path = Path(args.config) if args.config else get_default_config_path()
        configure_agents(config_path)
        return 0
    if args.cmd == "ui":
        run_dir = Path(args.run_dir).expanduser().resolve()
        snapshot_path = run_dir / "ui-state.json"
        initial_state: Dict[str, Any] = _rebuild_ui_state_from_run(run_dir)
        ui_state = ui_server.UIState(initial_state, snapshot_path=snapshot_path)
        ui_instance = ui_server.start_server(state=ui_state)
        ui_url = ui_instance.ui_url
        action_stop = threading.Event()
        keepalive = _KeepaliveController()
        action_thread = threading.Thread(
            target=_handle_ui_actions,
            args=(
                ui_instance,
                ui_state,
                run_dir,
                {},
                argparse.Namespace(timeout=DEFAULT_TIMEOUT_SEC),
                get_default_config_path(),
                action_stop,
                keepalive,
                None,
                None,
            ),
            name="ui-action-handler",
            daemon=True,
        )
        action_thread.start()
        _start_ui_session_timer(ui_instance, ui_state, action_stop, keepalive)
        if not args.no_open:
            webbrowser.open(ui_url)
        print(f"UI server running at {ui_url}")
        try:
            while not action_stop.is_set():
                time.sleep(1)
        except KeyboardInterrupt:
            ui_instance.shutdown()
        return 0

    try:
        task_spec = load_json(args.spec)
    except FileNotFoundError:
        print(
            f"Spec file not found: {args.spec}\n"
            "Uh oh! Your models are not configured. Please run `./setup.sh` to select your models. "
            "You can override or change these models at any time by running the setup script again.",
            file=sys.stderr,
        )
        return 2
    config_path = Path(args.config) if args.config else get_default_config_path()
    prompt_text = load_text(resolve_path("../references/prompts.md"))
    planner_prompt = prompt_text.split("## Judge Prompt")[0].split("```text", 1)[1].rsplit("```", 1)[0]
    judge_prompt = prompt_text.split("## Judge Prompt", 1)[1].split("```text", 1)[1].rsplit("```", 1)[0]

    plan_template = load_text(resolve_path("../references/templates/plan.md"))
    judge_template = load_text(resolve_path("../references/templates/judge.md"))

    run_root = get_run_root()
    run_root.mkdir(parents=True, exist_ok=True)
    base_label = task_spec.get("run_id") or task_spec.get("run_label")
    if not base_label:
        task_label = slugify(task_spec.get("task") or "run")
        base_label = f"{time.strftime('%Y%m%d')}-{task_label}"
    run_dir = unique_run_dir(run_root, base_label)
    run_dir.mkdir(parents=True, exist_ok=True)

    ui_state: Optional[ui_server.UIState] = None
    ui_instance: Optional[ui_server.UIServer] = None
    keepalive = _KeepaliveController() if not args.no_ui else None
    if not args.no_ui:
        snapshot_path = run_dir / "ui-state.json"
        ui_state = ui_server.UIState(snapshot_path=snapshot_path)
        ui_instance = ui_server.start_server(state=ui_state)
        ui_url = ui_instance.ui_url
        webbrowser.open(ui_url)
        print(f"UI server running at {ui_url}")

    try:
        planners, judge = load_agent_configs(task_spec, config_path=config_path)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    if args.seed is not None:
        random.seed(args.seed)

    if ui_state:
        timestamp = _ui_timestamp()
        initial_planners = [
            {"id": planner.name, "status": "pending", "summary": "", "errors": []} for planner in planners
        ]
        initial_state = {
            "run_id": run_dir.name,
            "task_brief": build_task_brief(task_spec),
            "phase": "starting",
            "planners": initial_planners,
            "judge": {"status": "pending", "summary": "", "errors": []},
            "final_plan": "",
            "errors": [],
            "keep_open": False,
            "ui_deadline": _ui_deadline_from_now(DEFAULT_UI_SESSION_TTL_SEC),
            "timestamps": {"started_at": timestamp, "updated_at": timestamp},
        }
        ui_state.set(initial_state)
        _ui_emit(ui_instance, "phase_change", {"phase": "starting", "timestamp": timestamp})

    if ui_instance:
        action_stop = threading.Event()
        action_thread = threading.Thread(
            target=_handle_ui_actions,
            args=(
                ui_instance,
                ui_state,
                run_dir,
                task_spec,
                args,
                config_path,
                action_stop,
                keepalive,
                judge,
                plan_template,
            ),
            name="ui-action-handler",
            daemon=True,
        )
        action_thread.start()
        _start_ui_session_timer(ui_instance, ui_state, action_stop, keepalive)

    _ui_set_phase(ui_state, ui_instance, "planning", _ui_timestamp())
    planner_results = run_planners(
        task_spec,
        planners,
        planner_prompt,
        plan_template,
        args.timeout,
        str(run_dir),
        ui_state=ui_state,
        ui_instance=ui_instance,
    )
    latest_valid: Dict[str, Dict[str, Any]] = {}
    for result in planner_results:
        if result.valid and result.data:
            latest_valid[result.name] = result.data
    valid_plans = list(latest_valid.values())

    _ui_set_phase(ui_state, ui_instance, "judging", _ui_timestamp())
    randomized_plans = []
    for idx, plan in enumerate(valid_plans):
        labeled = {"label": f"Plan {idx + 1}", "plan": anonymize_text(plan["text"])}
        randomized_plans.append(labeled)
    random.shuffle(randomized_plans)

    judge_result = run_judge(
        task_spec,
        randomized_plans,
        judge,
        judge_prompt,
        judge_template,
        args.timeout,
        str(run_dir),
        ui_state=ui_state,
        ui_instance=ui_instance,
    )
    metadata = {
        "used_plans": [p["label"] for p in randomized_plans],
        "agents": {
            "planners": [planner.name for planner in planners],
            "judge": judge.name,
        },
        "validation": {
            "task_spec_valid": True,
            "plans_valid": {r.name: r.valid for r in planner_results},
            "judge_valid": judge_result.valid,
        },
        "warnings": [r.error for r in planner_results if r.error],
    }

    _ui_set_phase(ui_state, ui_instance, "finalizing", _ui_timestamp())
    final_text = extract_final_plan(judge_result.data.get("text", "") if judge_result.data else "")
    final_path = run_dir / "final-plan.md"
    final_path.write_text(final_text, encoding="utf-8")
    _ui_set_final_plan(ui_state, ui_instance, final_text, _ui_timestamp())
    _ui_set_phase(ui_state, ui_instance, "complete", _ui_timestamp())

    if args.out:
        Path(args.out).write_text(final_text, encoding="utf-8")
    else:
        print(final_text)

    if ui_instance:
        resume_cmd = f"python scripts/llm_council.py ui --run-dir {run_dir}"
        print(f"Resume UI: {resume_cmd}")
    if ui_instance and args.ui_keepalive_seconds > 0:
        print(f"Keeping UI server alive for {args.ui_keepalive_seconds}s unless kept open...")
        start = time.time()
        while True:
            if keepalive and keepalive.should_keep_open():
                time.sleep(1)
                continue
            if time.time() - start >= args.ui_keepalive_seconds:
                break
            time.sleep(1)
        ui_instance.shutdown()

    maybe_trash_empty_dir(run_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
