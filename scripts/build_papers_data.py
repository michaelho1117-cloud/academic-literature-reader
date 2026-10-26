#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Academic Literature Reader - Data Builder Script
Converts structured JSON or Markdown files into papers_data.json & papers_data.js
"""

import os
import json
import re
import argparse

def build_data(input_file, output_dir):
    """
    Builds data/papers_data.json and data/papers_data.js from input JSON or Markdown.
    """
    os.makedirs(output_dir, exist_ok=True)
    json_out = os.path.join(output_dir, "papers_data.json")
    js_out = os.path.join(output_dir, "papers_data.js")

    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Format check
    if not isinstance(data, list):
        raise ValueError("Input data must be an array of paper objects.")

    print(f"Loaded {len(data)} papers from {input_file}.")

    # Write papers_data.json
    with open(json_out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Wrote {json_out} ({os.path.getsize(json_out)} bytes).")

    # Write papers_data.js
    js_str = f"/**\n * Academic Literature Reader Dataset\n * Generated automatically for offline local file:/// reading.\n */\nwindow.PAPERS_DATA = {json.dumps(data, ensure_ascii=False, indent=2)};\n"
    with open(js_out, 'w', encoding='utf-8') as f:
        f.write(js_str)
    print(f"Wrote {js_out} ({os.path.getsize(js_out)} bytes).")
    print("Build complete! Open index.html to view your literature dashboard.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Build literature data for Academic Literature Reader")
    parser.add_argument("--input", default="data/papers_data.json", help="Input JSON file")
    parser.add_argument("--outdir", default="data", help="Output directory")
    args = parser.parse_args()

    build_data(args.input, args.outdir)
