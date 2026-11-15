# Poly Run (Polyrunner): notes for every session

Single-file three.js r128 platformer starring Molly, built by Ricky (level details) and Claude (tools and mechanics).
- `checker-run.html` is THE game (about 9,600 lines). It embeds the Path Editor (between `<!--PE-BEGIN-->` and `<!--PE-END-->`, generated) and the Rig Editor (`<template id="rig-tpl">`), plus Molly's baked model (`<script id="molly-glb">`) and settings (`<script id="molly-settings">`).
- `path-editor.html` is the SOURCE of the embedded Path Editor. Edit it, then run `python3 tools/mk_pe_embed.py` (idempotent) to regenerate the embed. Never hand-edit between PE-BEGIN and PE-END.
- `tests/` is the headless harness (Playwright + swiftshader). Run `sh tests/setup.sh` once per fresh session (installs three r128 into /tmp/polyrun-work and builds the hooked test copy). After every edit to the game, rerun `python3 tests/mk_test.py`, then run tests from inside `tests/`. `python3 tests/chk.py` is the syntax + swallowed-comment check; run it after every edit.
- Downloads: `.github/workflows/release.yml` builds the offline game zip and the desktop app zip (`tools/build_release.py`) on every push to `main` that touches the game or the app, and publishes them on the Releases page under the game's version label. So bump the version label for anything Ricky should download.
- `audit-notes.md` is the long audit log. `SWEEP.md` is the nightly sweep plan, its state and the table of 20 slices.

## Standing rules from Ricky
- Do not send a zip or publish an artifact unless he asks.
- The nightly sweep has three lenses (bugs, visual seams and edges, performance); see SWEEP.md. It never changes features, physics, tuning, looks or design on its own: those suggestions go in the report.
- If unsure about a decision, ask. In an unattended session, do not guess: write the question in the report and leave that thing alone.
- No physics changes to compensate for level problems.
- Units: TILE 2 (1 Zip = 2 u/s). Show speeds in Zips.
- Interactive sessions that change the game: keep a CHANGELOG entry for the coming version at the top of `var CHANGELOG`, and keep `audit-notes.md` current. Bump the version label (`<div class="ver">`) and publish only when Ricky says so.

- The sweep re-cuts the code into 20 slices by itself whenever the code has changed (`tools/reslice.py`), so new code needs no bookkeeping.

## Branches (so two sessions never edit the same thing)
- Interactive work with Ricky happens on the branch `next` (push it freely). Ricky controls version numbers: ALWAYS ask him before bumping the version label or merging `next` into `main` (a push to `main` publishes a release). He batches changes into versions.
- The nightly sweep NEVER touches `main`. It works on a branch `nightly/YYYY-MM-DD`, based on the newest unmerged `origin/nightly/*` branch if there is one (so the nights stack and merge as a chain), otherwise on `main`.
- At the start of each interactive session: `git fetch`, read any unmerged `nightly/*` reports and tell Ricky what they fixed and what they left for him. Merging nightly fixes into `main` publishes them, so it follows the version rule below.
- Version numbering for nightly fixes (Ricky's rule): fixes pushed to `main` from a nightly sweep add the next decimal to the current version (v178 -> v178.1 -> v178.2; after v179, v179.1). Each such push gets its own CHANGELOG entry and version label. Then merge `main` into `next`. Ricky's own versions (v179, v180, ...) stay his call: always ask before those.
- Commit messages end with the attribution lines the session was given.
