# Poly Run (Polyrunner): notes for every session

Single-file three.js r128 platformer starring Molly, built by Ricky (level details) and Claude (tools and mechanics).
- `checker-run.html` is THE game (about 9,600 lines). It embeds the Path Editor (between `<!--PE-BEGIN-->` and `<!--PE-END-->`, generated) and the Rig Editor (`<template id="rig-tpl">`), plus Molly's baked model (`<script id="molly-glb">`) and settings (`<script id="molly-settings">`).
- `path-editor.html` is the SOURCE of the embedded Path Editor. Edit it, then run `python3 tools/mk_pe_embed.py` (idempotent) to regenerate the embed. Never hand-edit between PE-BEGIN and PE-END.
- `tests/` is the headless harness (Playwright + swiftshader). Run `sh tests/setup.sh` once per fresh session (installs three r128 into /tmp/polyrun-work and builds the hooked test copy). After every edit to the game, rerun `python3 tests/mk_test.py`, then run tests from inside `tests/`. `python3 tests/chk.py` is the syntax + swallowed-comment check; run it after every edit.
- `audit-notes.md` is the long audit log. `SWEEP.md` is the nightly sweep plan, its state and the table of 20 slices.

## Standing rules from Ricky
- Do not send a zip or publish an artifact unless he asks.
- The nightly sweep has three lenses (bugs, visual seams and edges, performance); see SWEEP.md. It never changes features, physics, tuning, looks or design on its own: those suggestions go in the report.
- If unsure about a decision, ask. In an unattended session, do not guess: write the question in the report and leave that thing alone.
- No physics changes to compensate for level problems.
- Units: TILE 2 (1 Zip = 2 u/s). Show speeds in Zips.
- Interactive sessions that change the game: bump the version label (`<div class="ver">`) and add a CHANGELOG entry (top of `var CHANGELOG`), keep `audit-notes.md` current.

- The sweep re-cuts the code into 20 slices by itself whenever the code has changed (`tools/reslice.py`), so new code needs no bookkeeping.

## Branches (so two sessions never edit the same thing)
- Interactive work with Ricky happens on `main`.
- The nightly sweep NEVER touches `main`. It works on a branch `nightly/YYYY-MM-DD`, based on the newest unmerged `origin/nightly/*` branch if there is one (so the nights stack and merge as a chain), otherwise on `main`.
- At the start of each interactive session: `git fetch`, then merge any unmerged `nightly/*` branches into `main` oldest first (after reading their reports), tell Ricky what they fixed and what they left for him, add the fixes to the next CHANGELOG entry, and push `main`.
- Commit messages end with the attribution lines the session was given.
