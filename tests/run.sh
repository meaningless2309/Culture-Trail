#!/bin/sh
# Cần: pip install playwright && playwright install chromium
# Chạy:  sh tests/run.sh smoke.py   (hoặc flows.py / layout_a11y.py)
cd "$(dirname "$0")/.."
python3 -m http.server 8765 >/dev/null 2>&1 &
SP=$!; sleep 1.2
python3 "tests/$1"
kill $SP 2>/dev/null
