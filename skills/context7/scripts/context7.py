#!/usr/bin/env python3
"""
Context7 API client for searching libraries and fetching documentation.
"""

import argparse
import json
import sys
import urllib.request
import urllib.parse
import urllib.error
import os

API_BASE = "https://context7.com/api/v2"


def make_request(url: str, api_key: str) -> dict | str:
    """Make an authenticated request to Context7 API."""
    headers = {"Authorization": f"Bearer {api_key}"}
    req = urllib.request.Request(url, headers=headers)

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            content_type = response.headers.get("Content-Type", "")
            data = response.read().decode("utf-8")
            if "application/json" in content_type:
                return json.loads(data)
            return data
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}: {e.reason}", "body": e.read().decode("utf-8")}
    except urllib.error.URLError as e:
        return {"error": f"URL Error: {e.reason}"}


def search_libraries(library_name: str, api_key: str, query: str = "") -> dict:
    """Search for libraries by name and optional query."""
    params = {"libraryName": library_name}
    if query:
        params["query"] = query

    url = f"{API_BASE}/libs/search?{urllib.parse.urlencode(params)}"
    return make_request(url, api_key)


def get_context(library_id: str, query: str, api_key: str, output_type: str = "txt", tokens: int = None) -> str | dict:
    """Fetch documentation context for a specific library."""
    params = {
        "libraryId": library_id,
        "query": query,
        "type": output_type
    }
    if tokens:
        params["tokens"] = tokens

    url = f"{API_BASE}/context?{urllib.parse.urlencode(params)}"
    return make_request(url, api_key)


def main():
    parser = argparse.ArgumentParser(description="Context7 API client")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Search command
    search_parser = subparsers.add_parser("search", help="Search for libraries")
    search_parser.add_argument("library_name", help="Library name to search for (e.g., 'react', 'next.js')")
    search_parser.add_argument("--query", "-q", default="", help="Optional query to filter results")

    # Context command
    context_parser = subparsers.add_parser("context", help="Get documentation context")
    context_parser.add_argument("library_id", help="Library ID from search results (e.g., '/vercel/next.js')")
    context_parser.add_argument("query", help="Query describing what you need (e.g., 'setup ssr')")
    context_parser.add_argument("--type", "-t", default="txt", choices=["txt", "md"], help="Output format")
    context_parser.add_argument("--tokens", type=int, help="Max tokens to return")

    args = parser.parse_args()

    api_key = os.environ.get("CONTEXT7_API_KEY")
    if not api_key:
        print(
            "CONTEXT7_API_KEY is not set. Export it in your shell or load it from a .env file.",
            file=sys.stderr,
        )
        sys.exit(1)

    if args.command == "search":
        result = search_libraries(args.library_name, api_key, args.query)
        if isinstance(result, dict):
            print(json.dumps(result, indent=2))
        else:
            print(result)

    elif args.command == "context":
        result = get_context(args.library_id, args.query, api_key, args.type, args.tokens)
        if isinstance(result, dict):
            print(json.dumps(result, indent=2))
        else:
            print(result)


if __name__ == "__main__":
    main()
