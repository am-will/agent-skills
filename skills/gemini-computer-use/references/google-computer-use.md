# Gemini Computer Use Notes

- Model: `gemini-2.5-computer-use-preview-10-2025` (required when using the Computer Use tool).
- The model emits `function_call` actions that must be executed client-side.
- After each action, return a `function_response` with the latest screenshot + URL.
- If a response includes `safety_decision: require_confirmation`, you must ask the user to confirm before executing the action.

Supported actions (browser environment):
- open_web_browser
- wait_5_seconds
- go_back
- go_forward
- search
- navigate
- click_at
- hover_at
- type_text_at
- key_combination
- scroll_document
- scroll_at
- drag_and_drop
