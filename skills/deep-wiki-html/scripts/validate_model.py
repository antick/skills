#!/usr/bin/env python3
"""Validate an embedded architecture model and optional matching JSON export.

Usage: python3 validate_model.py HTML [--json JSON]
Checks structure and consistency, not source accuracy or visible diagram content.
"""

import argparse
from datetime import datetime
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys


class ModelParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks = {}
        self.current = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script" and attrs.get("id") in {"architecture-model", "wiki-metadata"}:
            identity = attrs["id"]
            if identity in self.blocks or attrs.get("type") != "application/json":
                raise ValueError("model and metadata need unique inert JSON blocks")
            self.current = identity
            self.blocks[identity] = ""

    def handle_data(self, data):
        if self.current:
            self.blocks[self.current] += data

    def handle_endtag(self, tag):
        if tag == "script":
            self.current = None


def require(condition, message):
    if not condition:
        raise ValueError(message)


def text(value):
    return isinstance(value, str) and bool(value.strip())


def strings(value):
    return isinstance(value, list) and all(text(item) for item in value)


def evidence(entries):
    require(isinstance(entries, list) and bool(entries), "evidence must be nonempty")
    for entry in entries:
        require(isinstance(entry, dict), "evidence entry must be an object")
        path = entry.get("path")
        require(text(path) and not path.startswith(("/", "\\"))
                and not re.match(r"^[A-Za-z]:|^[a-z]+://", path)
                and ".." not in path.replace("\\", "/").split("/"),
                "evidence paths must be project-relative")
        start, end = entry.get("start_line"), entry.get("end_line")
        require(type(start) is int and type(end) is int and 0 < start <= end,
                "invalid evidence line range")
        require(entry.get("basis") in {"source", "test", "runtime"}, "invalid evidence basis")


def records(model, key, fields):
    entries = model.get(key)
    require(isinstance(entries, list), f"{key} must be an array")
    identities = set()
    for entry in entries:
        require(isinstance(entry, dict), f"{key} entry must be an object")
        require(all(text(entry.get(field)) for field in ("id", *fields)),
                f"{key} needs id and {', '.join(fields)}")
        require(entry["id"] not in identities, f"duplicate {key} id")
        identities.add(entry["id"])
    return entries, identities


def validate(html, exported=None):
    parser = ModelParser()
    parser.feed(html)
    parser.close()
    require(set(parser.blocks) == {"wiki-metadata", "architecture-model"},
            "expected metadata and architecture-model JSON blocks")
    model = json.loads(parser.blocks["architecture-model"])
    metadata = json.loads(parser.blocks["wiki-metadata"])
    require(isinstance(model, dict) and isinstance(metadata, dict), "expected JSON objects")
    require(type(model.get("schema_version")) is int and model["schema_version"] == 1,
            "expected model schema_version 1")
    for key in ("source_commit", "working_tree", "generated_at"):
        require(key in model and key in metadata and model[key] == metadata[key],
                f"model and metadata disagree on {key}")
    commit = model["source_commit"]
    require(commit is None or (isinstance(commit, str) and
            re.fullmatch(r"[0-9a-f]{40}|[0-9a-f]{64}", commit)), "invalid source_commit")
    require(model["working_tree"] in ("clean", "dirty", "unknown"), "invalid working_tree")
    timestamp = datetime.fromisoformat(model["generated_at"].replace("Z", "+00:00"))
    require(timestamp.utcoffset() is not None and timestamp.utcoffset().total_seconds() == 0,
            "generated_at must be UTC")
    coverage = model.get("coverage")
    require(isinstance(coverage, dict) and all(strings(coverage.get(key))
            for key in ("included", "excluded", "unknowns")), "invalid coverage")
    components, ids = records(model, "components", ("name", "kind", "responsibility"))
    require(bool(components), "model needs at least one component")
    for component in components:
        evidence(component.get("evidence"))
    relationships, _ = records(model, "relationships", ("from", "to", "type", "description"))
    for edge in relationships:
        require(edge["from"] in ids and edge["to"] in ids, "unknown relationship component")
        evidence(edge.get("evidence"))
    flows, _ = records(model, "flows", ("name",))
    for flow in flows:
        steps = flow.get("steps")
        require(isinstance(steps, list) and bool(steps), "flow needs ordered steps")
        for step in steps:
            require(isinstance(step, dict) and text(step.get("description")), "invalid flow step")
            require(text(step.get("component_id")) and step["component_id"] in ids,
                    "unknown flow component")
            evidence(step.get("evidence"))
    if exported is not None:
        require(json.loads(exported) == model, "JSON export differs from embedded model")


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("html", type=Path)
    cli.add_argument("--json", type=Path)
    args = cli.parse_args()
    try:
        validate(args.html.read_text(encoding="utf-8"),
                 args.json.read_text(encoding="utf-8") if args.json else None)
    except (OSError, ValueError, TypeError, KeyError, AttributeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print("PASS: architecture model structure, references, metadata, and supplied export")
    return 0


if __name__ == "__main__":
    sys.exit(main())
