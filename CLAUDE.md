# Poly Run (Polyrunner): notes for every session

Single-file three.js r128 platformer starring Molly, built by Ricky (levels) and Claude (tools, mechanics). Files, runners, world, branches, versions and test commands: ARCHITECTURE.md (read only the section you need). Open work: BACKLOG.md.
- `checker-run.html` (3.4 MB) is THE game: grep and read line ranges only. Never hand-edit between `<!--PE-BEGIN-->` and `<!--PE-END-->`: edit `path-editor.html`, then run `python3 tools/mk_pe_embed.py`.
- After every edit: `python3 tests/chk.py && python3 tests/mk_test.py`, then only the tests for the area touched (each SWEEP-*.md has the map). Once per fresh session: `sh tests/setup.sh`.
- `audit-notes.md` is the long log: read only its last section.

## Standing rules from Ricky
- Do not send a zip or publish an artifact unless asked.
- Interactive work goes on `next`. Always ask before bumping the version label (`<div class="ver">`), merging `next` into `main`, or any other push to `main` (game or desktop changes publish a release).
- Exception: doc-only changes (`.md` files only, not sweep reports) go straight to `main` by default, then merge `main` into `next`. They don't publish a release.
- The nightly sweeps (bugs, edges, perf) work only on `nightly/*` branches, never `main`, except appending to `.md` docs there (not sweep reports), then merging `main` into `next`. It never changes features, physics, tuning, looks or design: those suggestions go in the report and BACKLOG.md (SWEEP-BUGS.md, SWEEP-EDGES.md, SWEEP-PERF.md).
- If unsure, ask one focused question. Unattended: write the question in the report and leave that thing alone.
- No physics changes to compensate for level problems. Units: TILE 2, 1 Zip = 2 u/s; show speeds in Zips.
- Game-changing sessions: add a CHANGELOG entry at the top of `var CHANGELOG` and keep `audit-notes.md` current.
- Session start: `git ls-remote origin 'refs/heads/nightly/*'`; read the newest unmerged report of each sweep and give me a 3-line summary. Merging nightly fixes follows the decimal-version rule in ARCHITECTURE.md.
- Commit messages end with the attribution lines the session was given.

## Session economy
- Search before reading; don't re-read unchanged files; filter command output to failures and the last ~30 lines.
- Before a big read or wide change, name the files and sections. For multi-step work, propose a short plan and wait for my go-ahead.
- After two failed attempts at the same fix, stop, summarize, and recommend reverting or starting fresh.
- Replies: outcome first, no recaps. When done, say so and suggest continuing here or starting fresh.

## Rules maintenance
After each release (or on request), suggest changes to this file in one short list. Don't edit it without my approval. Keep it under ~25 lines.
