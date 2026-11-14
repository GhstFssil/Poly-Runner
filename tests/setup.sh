#!/bin/sh
# One-time setup for the test harness in a fresh session: three.js r128 for the offline test page, then the hooked test copy of the game.
mkdir -p /tmp/polyrun-work/t && cd /tmp/polyrun-work/t && { [ -d node_modules/three ] || npm install three@0.128.0 --no-audit --no-fund; }
cd /home/claude/poly-runner/tests && python3 mk_test.py
