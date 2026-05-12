#!/usr/bin/env python3
"""Shortcut: force a full re-index. Equivalent to `python rag_cli.py reindex`."""

from rag_cli import cmd_index

if __name__ == "__main__":
    cmd_index(force=True)
