#!/usr/bin/env python3
"""Check an authored wiki's structure and offline dependencies, not HTML safety."""

import argparse
from datetime import datetime
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit


def embedded(value):
    return value.startswith("#") or bool(re.match(
        r"data:image/(?:png|jpeg|gif|webp|avif);base64,", value, re.I))


class WikiParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.errors = []
        self.ids = set()
        self.sections = set()
        self.nav_links = set()
        self.fragments = []
        self.label_refs = []
        self.tags = set()
        self.raw_tag = None
        self.raw = []
        self.is_metadata = False
        self.metadata = []
        self.nav_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.add(tag)
        identity = attrs.get("id")
        if identity is not None:
            if not identity or identity in self.ids:
                self.errors.append(f"empty or duplicate id: {identity!r}")
            self.ids.add(identity)
        if "data-wiki-section" in attrs:
            if tag != "section" or not identity:
                self.errors.append("wiki sections need a section element and id")
            else:
                self.sections.add(identity)
        if tag == "nav":
            self.nav_depth += 1
        if tag == "html" and not attrs.get("lang"):
            self.errors.append("html needs a language")
        if tag in {"base", "iframe", "object", "embed", "form"}:
            self.errors.append(f"unsupported dependency or active embed: {tag}")
        if tag == "meta" and attrs.get("http-equiv", "").lower() == "refresh":
            self.errors.append("meta refresh is not offline navigation")
        for key, value in attrs.items():
            value = value or ""
            if key in {"src", "poster", "data", "srcset"}:
                if tag == "script" or key == "srcset" or not embedded(value):
                    self.errors.append(f"non-embedded resource: {tag}[{key}]")
            if key in {"href", "xlink:href"}:
                if tag == "a":
                    parts = urlsplit(value)
                    if value.startswith("#"):
                        target = unquote(value[1:])
                        self.fragments.append(target)
                        if self.nav_depth:
                            self.nav_links.add(target)
                    elif parts.scheme not in {"http", "https", "mailto"}:
                        self.errors.append(f"non-portable hyperlink: {value}")
                    elif parts.username or parts.password:
                        self.errors.append("hyperlink contains credentials")
                elif not embedded(value):
                    self.errors.append(f"non-embedded resource: {tag}[{key}]")
            if key == "style":
                self.check_css(value)
            if key in {"aria-labelledby", "aria-describedby"}:
                self.label_refs.extend(value.split())
            if key == "for":
                self.label_refs.append(value)
        if tag == "svg" and (not attrs.get("viewbox") or not attrs.get("aria-labelledby")):
            self.errors.append("SVG needs viewBox and aria-labelledby")
        if tag in {"script", "style"}:
            if tag == "script" and (attrs.get("type") or "").strip().lower() == "module":
                self.errors.append("module scripts are unsupported; use classic inline scripts")
            self.raw_tag, self.raw = tag, []
            self.is_metadata = identity == "wiki-metadata"
            if self.is_metadata and attrs.get("type") != "application/json":
                self.errors.append("wiki-metadata must be inert application/json")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_data(self, data):
        if self.raw_tag:
            self.raw.append(data)

    def handle_endtag(self, tag):
        if tag == "nav":
            self.nav_depth = max(0, self.nav_depth - 1)
        if tag == self.raw_tag:
            content = "".join(self.raw)
            if tag == "style":
                self.check_css(content)
            elif self.is_metadata:
                self.metadata.append(content)
            elif re.search(r"\b(fetch|XMLHttpRequest|WebSocket|EventSource|importScripts)\b|\bimport\s*\(", content):
                self.errors.append("script contains a network-loading API")
            self.raw_tag = None

    def check_css(self, css):
        # Decode CSS escapes before examining resource URLs and imports.
        css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        css = re.sub(r"\\([0-9a-fA-F]{1,6})\s?", lambda m: chr(int(m[1], 16)), css)
        css = re.sub(r"\\([^\n])", r"\1", css)
        if re.search(r"@import\b", css, re.I):
            self.errors.append("CSS imports an external stylesheet")
        for value in re.findall(r"url\(\s*([^)]*)\)", css, re.I):
            if not embedded(value.strip().strip("\"'")):
                self.errors.append("CSS contains a non-embedded resource")


def validate(text):
    parser = WikiParser()
    parser.feed(text)
    parser.close()
    errors = parser.errors
    if not re.match(r"\s*<!doctype html>", text, re.I):
        errors.append("missing HTML doctype")
    if re.search(r"\bWIKI_[A-Z_]+\b", text):
        errors.append("unfilled template markers")
    for tag in {"html", "head", "title", "body", "main", "h1", "nav"} - parser.tags:
        errors.append(f"missing semantic element: {tag}")
    if not parser.sections:
        errors.append("no wiki sections")
    for target in set(parser.fragments + parser.label_refs) - parser.ids:
        errors.append(f"broken anchor or label: {target}")
    for section in parser.sections - parser.nav_links:
        errors.append(f"section missing from navigation: {section}")
    if len(parser.metadata) != 1:
        errors.append("expected one wiki-metadata JSON block")
        return errors
    try:
        metadata = json.loads(parser.metadata[0])
        if not isinstance(metadata, dict) or metadata.get("version") != 1:
            raise ValueError("expected metadata version 1")
        commit = metadata["source_commit"]
        if commit is not None and not re.fullmatch(r"[0-9a-f]{40}|[0-9a-f]{64}", str(commit)):
            raise ValueError("source_commit must be a full SHA or null")
        timestamp = datetime.fromisoformat(metadata["generated_at"].replace("Z", "+00:00"))
        if timestamp.utcoffset() is None or timestamp.utcoffset().total_seconds() != 0:
            raise ValueError("generated_at must be a UTC ISO timestamp")
        if metadata["working_tree"] not in {"clean", "dirty", "unknown"}:
            raise ValueError("invalid working_tree state")
        scope = metadata["scope"]
        if not all(isinstance(scope[key], str) and scope[key].strip() for key in ("audience", "depth")):
            raise ValueError("scope needs audience and depth")
        for key in ("included", "excluded"):
            if not isinstance(scope[key], list) or not all(isinstance(p, str) and p for p in scope[key]):
                raise ValueError(f"scope.{key} must be a string array")
        sections = metadata["sections"]
        if not isinstance(sections, dict) or set(sections) != parser.sections:
            raise ValueError("metadata sections must match HTML sections")
        for sources in sections.values():
            if not isinstance(sources, list) or not sources:
                raise ValueError("each section needs source paths")
            for source in sources:
                if not isinstance(source, str) or not source or source.startswith(("/", "\\")) or ".." in source.replace("\\", "/").split("/"):
                    raise ValueError("source paths must stay relative to the repository")
    except (ValueError, TypeError, KeyError, AttributeError) as error:
        errors.append(f"invalid metadata: {error}")
    return errors


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("html", type=Path)
    args = cli.parse_args()
    try:
        errors = validate(args.html.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, ValueError) as error:
        print(f"Cannot validate: {error}", file=sys.stderr)
        return 1
    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors), file=sys.stderr)
        return 1
    print("PASS: wiki structure, metadata, anchors, and static offline dependencies")
    return 0


if __name__ == "__main__":
    sys.exit(main())
