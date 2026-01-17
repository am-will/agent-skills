#!/usr/bin/env python3
import argparse
import os
import sys
import time
from typing import Any, Dict, List, Tuple

from playwright.sync_api import sync_playwright
from google import genai
from google.genai import types
from google.genai.types import Content, Part

MODEL_NAME = "gemini-2.5-computer-use-preview-10-2025"
DEFAULT_START_URL = "https://www.google.com"
DEFAULT_SCREEN_WIDTH = 1440
DEFAULT_SCREEN_HEIGHT = 900

SUPPORTED_ACTIONS = {
    "open_web_browser",
    "wait_5_seconds",
    "go_back",
    "go_forward",
    "search",
    "navigate",
    "click_at",
    "hover_at",
    "type_text_at",
    "key_combination",
    "scroll_document",
    "scroll_at",
    "drag_and_drop",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run a Gemini Computer Use browser automation loop via Playwright.",
    )
    parser.add_argument("--prompt", required=True, help="User goal to send to the model")
    parser.add_argument(
        "--start-url",
        default=DEFAULT_START_URL,
        help=f"Initial page to load (default: {DEFAULT_START_URL})",
    )
    parser.add_argument("--turn-limit", type=int, default=6, help="Max turns")
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run browser in headless mode",
    )
    parser.add_argument(
        "--screen-width",
        type=int,
        default=DEFAULT_SCREEN_WIDTH,
        help="Viewport width in pixels",
    )
    parser.add_argument(
        "--screen-height",
        type=int,
        default=DEFAULT_SCREEN_HEIGHT,
        help="Viewport height in pixels",
    )
    parser.add_argument(
        "--exclude",
        action="append",
        default=[],
        help="Exclude predefined Computer Use actions (can repeat)",
    )
    return parser.parse_args()


def require_env() -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Missing GEMINI_API_KEY. Export it before running.", file=sys.stderr)
        sys.exit(1)
    return api_key


def denormalize(value: int, size: int) -> int:
    return int(value / 1000 * size)


def normalize_keys(keys: str) -> str:
    mapping = {
        "ctrl": "Control",
        "control": "Control",
        "cmd": "Meta",
        "command": "Meta",
        "meta": "Meta",
        "alt": "Alt",
        "shift": "Shift",
        "enter": "Enter",
        "return": "Enter",
        "tab": "Tab",
        "backspace": "Backspace",
        "delete": "Delete",
        "esc": "Escape",
        "escape": "Escape",
        "space": "Space",
    }
    parts = [p.strip() for p in keys.split("+")]
    normalized_parts = []
    for part in parts:
        lower = part.lower()
        if lower in mapping:
            normalized_parts.append(mapping[lower])
        elif len(part) == 1:
            normalized_parts.append(part.upper())
        else:
            normalized_parts.append(part.capitalize())
    return "+".join(normalized_parts)


def get_select_all_shortcut() -> str:
    return "Meta+A" if sys.platform == "darwin" else "Control+A"


def maybe_cast_args(args: Any) -> Dict[str, Any]:
    if args is None:
        return {}
    if isinstance(args, dict):
        return args
    try:
        return dict(args)
    except Exception:
        return args


def prompt_for_safety_confirmation(safety_decision: Dict[str, Any]) -> bool:
    explanation = safety_decision.get("explanation", "")
    decision = safety_decision.get("decision", "")
    print("Safety decision:")
    if explanation:
        print(explanation)
    if decision != "require_confirmation":
        return True

    while True:
        response = input("Proceed with the action? [y/n] ").strip().lower()
        if response in ("y", "yes"):
            return True
        if response in ("n", "no"):
            return False


def execute_function_call(
    call: Any,
    page: Any,
    screen_width: int,
    screen_height: int,
) -> Tuple[Dict[str, Any], bool]:
    args = maybe_cast_args(call.args)
    safety_decision = args.get("safety_decision") if isinstance(args, dict) else None

    if safety_decision and isinstance(safety_decision, dict):
        if not prompt_for_safety_confirmation(safety_decision):
            return {"blocked": "user_denied"}, True

    name = call.name
    result: Dict[str, Any] = {}

    if name not in SUPPORTED_ACTIONS:
        return {"error": f"unsupported action: {name}"}, False

    if name == "open_web_browser":
        pass
    elif name == "wait_5_seconds":
        time.sleep(5)
    elif name == "go_back":
        page.go_back()
    elif name == "go_forward":
        page.go_forward()
    elif name == "search":
        page.goto(DEFAULT_START_URL)
    elif name == "navigate":
        page.goto(args["url"])
    elif name == "click_at":
        x = denormalize(int(args["x"]), screen_width)
        y = denormalize(int(args["y"]), screen_height)
        page.mouse.click(x, y)
    elif name == "hover_at":
        x = denormalize(int(args["x"]), screen_width)
        y = denormalize(int(args["y"]), screen_height)
        page.mouse.move(x, y)
    elif name == "type_text_at":
        x = denormalize(int(args["x"]), screen_width)
        y = denormalize(int(args["y"]), screen_height)
        text = args["text"]
        press_enter = args.get("press_enter", True)
        clear_before_typing = args.get("clear_before_typing", True)
        page.mouse.click(x, y)
        if clear_before_typing:
            page.keyboard.press(get_select_all_shortcut())
            page.keyboard.press("Backspace")
        page.keyboard.type(text)
        if press_enter:
            page.keyboard.press("Enter")
    elif name == "key_combination":
        keys = normalize_keys(args["keys"])
        page.keyboard.press(keys)
    elif name == "scroll_document":
        direction = args["direction"]
        magnitude = 800
        dx, dy = 0, 0
        if direction == "down":
            dy = magnitude
        elif direction == "up":
            dy = -magnitude
        elif direction == "right":
            dx = magnitude
        elif direction == "left":
            dx = -magnitude
        page.evaluate("window.scrollBy(arguments[0], arguments[1])", dx, dy)
    elif name == "scroll_at":
        x = denormalize(int(args["x"]), screen_width)
        y = denormalize(int(args["y"]), screen_height)
        direction = args["direction"]
        magnitude = int(args.get("magnitude", 800))
        dx, dy = 0, 0
        if direction == "down":
            dy = magnitude
        elif direction == "up":
            dy = -magnitude
        elif direction == "right":
            dx = magnitude
        elif direction == "left":
            dx = -magnitude
        page.mouse.move(x, y)
        page.mouse.wheel(dx, dy)
    elif name == "drag_and_drop":
        start_x = denormalize(int(args["x"]), screen_width)
        start_y = denormalize(int(args["y"]), screen_height)
        dest_x = denormalize(int(args["destination_x"]), screen_width)
        dest_y = denormalize(int(args["destination_y"]), screen_height)
        page.mouse.move(start_x, start_y)
        page.mouse.down()
        page.mouse.move(dest_x, dest_y, steps=10)
        page.mouse.up()

    page.wait_for_load_state(timeout=5000)
    time.sleep(1)

    if safety_decision and isinstance(safety_decision, dict):
        if safety_decision.get("decision") == "require_confirmation":
            result["safety_acknowledgement"] = "true"

    return result, False


def build_function_responses(page: Any, results: List[Tuple[str, Dict[str, Any]]]) -> List[Any]:
    screenshot_bytes = page.screenshot(type="png")
    current_url = page.url
    responses = []
    for name, result in results:
        payload = {"url": current_url}
        payload.update(result)
        responses.append(
            types.FunctionResponse(
                name=name,
                response=payload,
                parts=[
                    types.FunctionResponsePart(
                        inline_data=types.FunctionResponseBlob(
                            mime_type="image/png",
                            data=screenshot_bytes,
                        )
                    )
                ],
            )
        )
    return responses


def run() -> int:
    args = parse_args()
    api_key = require_env()

    client = genai.Client(api_key=api_key)

    browser_channel = os.getenv("COMPUTER_USE_BROWSER_CHANNEL")
    browser_executable = os.getenv("COMPUTER_USE_BROWSER_EXECUTABLE")

    with sync_playwright() as playwright:
        launch_options: Dict[str, Any] = {"headless": args.headless}
        if browser_channel:
            launch_options["channel"] = browser_channel
        if browser_executable:
            launch_options["executable_path"] = browser_executable

        browser = playwright.chromium.launch(**launch_options)
        context = browser.new_context(
            viewport={"width": args.screen_width, "height": args.screen_height}
        )
        page = context.new_page()
        page.goto(args.start_url)

        config = types.GenerateContentConfig(
            tools=[
                types.Tool(
                    computer_use=types.ComputerUse(
                        environment=types.Environment.ENVIRONMENT_BROWSER,
                        excluded_predefined_functions=args.exclude,
                    )
                )
            ],
        )

        initial_screenshot = page.screenshot(type="png")
        contents = [
            Content(
                role="user",
                parts=[
                    Part(text=args.prompt),
                    Part.from_bytes(
                        data=initial_screenshot,
                        mime_type="image/png",
                    ),
                ],
            )
        ]

        for turn in range(args.turn_limit):
            print(f"\n--- Turn {turn + 1} ---")
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=contents,
                config=config,
            )

            candidate = response.candidates[0]
            contents.append(candidate.content)

            function_calls = [
                part.function_call
                for part in candidate.content.parts
                if part.function_call
            ]

            if not function_calls:
                text_output = " ".join(
                    part.text for part in candidate.content.parts if part.text
                )
                print("Agent output:", text_output)
                break

            results: List[Tuple[str, Dict[str, Any]]] = []
            for call in function_calls:
                print(f"Executing: {call.name}")
                result, should_stop = execute_function_call(
                    call, page, args.screen_width, args.screen_height
                )
                results.append((call.name, result))
                if should_stop:
                    print("Terminating due to safety denial.")
                    browser.close()
                    return 2

            function_responses = build_function_responses(page, results)

            contents.append(
                Content(
                    role="user",
                    parts=[
                        Part(function_response=fr)
                        for fr in function_responses
                    ],
                )
            )

        browser.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(run())
