#!/usr/bin/env python3
"""
CLI wrapper for gitmcp.io MCP servers.
Allows reading GitHub repository documentation via the GitMCP service.
"""

import argparse
import json
import subprocess
import sys
import re
from typing import Optional


def convert_github_to_gitmcp(url_or_path: str) -> str:
    """Convert a GitHub URL or owner/repo path to gitmcp.io URL."""
    # Handle full GitHub URLs
    if "github.com" in url_or_path:
        return url_or_path.replace("github.com", "gitmcp.io")

    # Handle owner/repo format
    if "/" in url_or_path and not url_or_path.startswith("http"):
        return f"https://gitmcp.io/{url_or_path}"

    return url_or_path


def get_repo_name_from_url(url: str) -> str:
    """Extract repo name from URL and convert to underscore format for tool names."""
    # Extract the repo name (last part of the path)
    match = re.search(r'/([^/]+)/?$', url.rstrip('/'))
    if match:
        repo_name = match.group(1)
        # Convert dashes to underscores for tool names
        return repo_name.replace('-', '_')
    return ""


def send_jsonrpc(proc: subprocess.Popen, method: str, params: dict = None, msg_id: int = 1) -> dict:
    """Send a JSON-RPC message and get response."""
    request = {
        "jsonrpc": "2.0",
        "id": msg_id,
        "method": method,
    }
    if params:
        request["params"] = params

    message = json.dumps(request) + "\n"
    proc.stdin.write(message)
    proc.stdin.flush()

    # Read response
    response_line = proc.stdout.readline()
    if response_line:
        return json.loads(response_line)
    return {}


def list_tools(mcp_url: str) -> dict:
    """Connect to MCP server and list available tools."""
    proc = subprocess.Popen(
        ["npx", "-y", "mcp-remote", mcp_url],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    try:
        # Initialize
        init_response = send_jsonrpc(proc, "initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "gitmcp-cli", "version": "1.0.0"}
        }, 1)

        # Send initialized notification
        proc.stdin.write(json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"}) + "\n")
        proc.stdin.flush()

        # List tools
        tools_response = send_jsonrpc(proc, "tools/list", {}, 2)

        return tools_response
    finally:
        proc.terminate()


def call_tool(mcp_url: str, tool_name: str, arguments: dict = None) -> dict:
    """Connect to MCP server and call a tool."""
    proc = subprocess.Popen(
        ["npx", "-y", "mcp-remote", mcp_url],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    try:
        # Initialize
        send_jsonrpc(proc, "initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "gitmcp-cli", "version": "1.0.0"}
        }, 1)

        # Send initialized notification
        proc.stdin.write(json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"}) + "\n")
        proc.stdin.flush()

        # Call tool
        tool_response = send_jsonrpc(proc, "tools/call", {
            "name": tool_name,
            "arguments": arguments or {}
        }, 2)

        return tool_response
    finally:
        proc.terminate()


def main():
    parser = argparse.ArgumentParser(
        description="CLI wrapper for gitmcp.io MCP servers",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # List tools for a repo
  %(prog)s list-tools karpathy/llm-council
  %(prog)s list-tools https://github.com/karpathy/llm-council

  # Fetch documentation
  %(prog)s fetch-docs karpathy/llm-council

  # Search documentation
  %(prog)s search-docs karpathy/llm-council "how to use"

  # Search code
  %(prog)s search-code karpathy/llm-council "def main"

  # Fetch a URL mentioned in docs
  %(prog)s fetch-url karpathy/llm-council "https://example.com/doc"

  # Call any tool directly
  %(prog)s call karpathy/llm-council fetch_llm_council_documentation '{}'
"""
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # list-tools command
    list_parser = subparsers.add_parser("list-tools", help="List available MCP tools for a repo")
    list_parser.add_argument("repo", help="GitHub repo (owner/repo or full URL)")

    # fetch-docs command
    fetch_docs_parser = subparsers.add_parser("fetch-docs", help="Fetch repository documentation")
    fetch_docs_parser.add_argument("repo", help="GitHub repo (owner/repo or full URL)")

    # search-docs command
    search_docs_parser = subparsers.add_parser("search-docs", help="Semantically search documentation")
    search_docs_parser.add_argument("repo", help="GitHub repo (owner/repo or full URL)")
    search_docs_parser.add_argument("query", help="Search query")

    # search-code command
    search_code_parser = subparsers.add_parser("search-code", help="Search code in the repository")
    search_code_parser.add_argument("repo", help="GitHub repo (owner/repo or full URL)")
    search_code_parser.add_argument("query", help="Search query (exact match)")

    # fetch-url command
    fetch_url_parser = subparsers.add_parser("fetch-url", help="Fetch content from a URL mentioned in docs")
    fetch_url_parser.add_argument("repo", help="GitHub repo (owner/repo or full URL)")
    fetch_url_parser.add_argument("url", help="URL to fetch")

    # call command (direct tool call)
    call_parser = subparsers.add_parser("call", help="Call an MCP tool directly")
    call_parser.add_argument("repo", help="GitHub repo (owner/repo or full URL)")
    call_parser.add_argument("tool", help="Tool name to call")
    call_parser.add_argument("args", nargs="?", default="{}", help="JSON arguments for the tool")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Convert repo to gitmcp URL
    mcp_url = convert_github_to_gitmcp(args.repo)
    repo_name = get_repo_name_from_url(mcp_url)

    try:
        if args.command == "list-tools":
            result = list_tools(mcp_url)
            if "result" in result and "tools" in result["result"]:
                print("Available tools:")
                for tool in result["result"]["tools"]:
                    print(f"\n  {tool['name']}")
                    if "description" in tool:
                        print(f"    {tool['description']}")
            else:
                print(json.dumps(result, indent=2))

        elif args.command == "fetch-docs":
            tool_name = f"fetch_{repo_name}_documentation"
            result = call_tool(mcp_url, tool_name)
            if "result" in result:
                content = result["result"]
                if isinstance(content, dict) and "content" in content:
                    for item in content["content"]:
                        if item.get("type") == "text":
                            print(item.get("text", ""))
                else:
                    print(json.dumps(content, indent=2))
            else:
                print(json.dumps(result, indent=2))

        elif args.command == "search-docs":
            tool_name = f"search_{repo_name}_documentation"
            result = call_tool(mcp_url, tool_name, {"query": args.query})
            if "result" in result:
                content = result["result"]
                if isinstance(content, dict) and "content" in content:
                    for item in content["content"]:
                        if item.get("type") == "text":
                            print(item.get("text", ""))
                else:
                    print(json.dumps(content, indent=2))
            else:
                print(json.dumps(result, indent=2))

        elif args.command == "search-code":
            tool_name = f"search_{repo_name}_code"
            result = call_tool(mcp_url, tool_name, {"query": args.query})
            if "result" in result:
                content = result["result"]
                if isinstance(content, dict) and "content" in content:
                    for item in content["content"]:
                        if item.get("type") == "text":
                            print(item.get("text", ""))
                else:
                    print(json.dumps(content, indent=2))
            else:
                print(json.dumps(result, indent=2))

        elif args.command == "fetch-url":
            result = call_tool(mcp_url, "fetch_generic_url_content", {"url": args.url})
            if "result" in result:
                content = result["result"]
                if isinstance(content, dict) and "content" in content:
                    for item in content["content"]:
                        if item.get("type") == "text":
                            print(item.get("text", ""))
                else:
                    print(json.dumps(content, indent=2))
            else:
                print(json.dumps(result, indent=2))

        elif args.command == "call":
            tool_args = json.loads(args.args)
            result = call_tool(mcp_url, args.tool, tool_args)
            print(json.dumps(result, indent=2))

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
