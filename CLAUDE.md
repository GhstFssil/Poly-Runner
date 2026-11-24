# Poly Runner: working rules
Single-file three.js r128 platformer starring Molly, built by Ricky (levels) and Claude (tools, mechanics). Don't edit this file without Ricky's approval. Keep it under ~25 lines of rules.

## Session economy
- Search before reading. Never read a large file whole; read only the relevant range. Don't re-read unchanged files.
- Before a big read or wide change, say which files/sections. For multi-step work, propose a short plan and wait for go-ahead before large edits.
- Prefer small, targeted edits over rewrites.
- Filter command output: show failures and the last ~30 lines, not full logs.
- After two failed attempts at the same fix, stop, summarize what was tried, recommend reverting or starting fresh.
- Replies short: outcome first, no recaps, don't paste back code visible in the file.
- Ambiguous requirements: ask one focused question (only if the choice is costly to redo and unclear). Unattended: write the question in the report and leave that thing alone.
- When a task is done, say so and suggest continuing here or starting fresh.

## Docs
- Stable facts (files, characters, world, branches, versions, test commands) live in ARCHITECTURE.md, not in conversation. Read only the section you need.
- GLOSSARY.md is the one list of terms: use its terms and spellings in text, comments, docs and names, and add a term in the same change that introduces it. Names it lists as frozen hold saved data: never rename them without a migration.
- HANDOFF.md (repo root; overwrite each time; Goal, Done, In progress, Decisions, Next steps, Gotchas; under 40 lines): update after each completed step or major decision. If the session gets long, off-topic or cluttered, say so in one line, update HANDOFF.md first, then recommend a fresh session.
- BACKLOG.md: either of us logs bugs and ideas as `- [ ] (who, YYYY-MM-DD) text`. Don't act on entries unasked. Delete an entry when it's done.
- HISTORY.md: append-only record of every change since 2026-11-20. In the same commit as each change, add one line: `echo '- YYYY-MM-DD HH:MM | branch or version | what changed' >> HISTORY.md` (America/Chicago time). Never edit or delete earlier lines (correct with a new line). It is long, so don't read it unless Ricky asks. The nightly sweeps add their own line every night.
- `audit-notes.md` is frozen (log up to 2026-11-20, v184): no new entries; read only its last section if you need it. The player-facing log is `var CHANGELOG` in the game.

## Testing
- After every edit: `python3 tools/build.py && python3 tests/chk.py && python3 tests/mk_test.py` (`chk.py` fails if the game file is out of sync with `src/`), then only the tests for the area touched (each SWEEP-*.md has the map). Once per fresh session: `sh tests/setup.sh`.

## Project
- The game is built from `src/` (`src/manifest.json` lists the parts) into `poly-runner.html` (3.4 MB, generated, committed). Edit `src/`, never `poly-runner.html`, then run `python3 tools/build.py`. Grep and read line ranges only. Never hand-edit between `<!--PE-BEGIN-->` and `<!--PE-END-->`: edit `path-editor.html`, then run `python3 tools/mk_pe_embed.py` (it rebuilds).
- Work in one area at a time (an area is a group of source files by function; see GLOSSARY.md): name it first, edit only its files and tests, and give a reason before touching another.
- No physics changes to compensate for level problems. Units: TILE 2, 1 Zip = 2 u/s; show speeds in Zips.
- Game-changing sessions: add a CHANGELOG entry at the top of `var CHANGELOG`.
- Session start: `git ls-remote origin 'refs/heads/nightly/*'`; read the newest unmerged report of each sweep and give Ricky a 3-line summary. Merging nightly fixes follows the decimal-version rule in ARCHITECTURE.md.
- The nightly sweeps (bugs, edges, perf) work only on `nightly/*` branches, never `main`, except appending to `.md` docs there (not sweep reports), then merging `main` into `next`. They never change features, physics, tuning, looks or design: those suggestions go in the report and BACKLOG.md (SWEEP-BUGS.md, SWEEP-EDGES.md, SWEEP-PERF.md).

## Shipping
- Publish means merging `next` into `main` as the next version (rules below); the release workflow does the rest. Never send a zip or publish an artifact unless asked.
- Interactive work goes on `next`. Always ask before merging `next` into `main` or any other push to `main`.
- By default, every push to `main` that isn't docs-only bumps the `<div class="ver">` label to the next whole number (v184 -> v185) in that same push, with its CHANGELOG entry, unless Ricky says otherwise. The release workflow publishes under the label, so an unchanged label overwrites that release.
- Nightly sweeps: one decimal bump per night (v184 -> v184.1, then v184.1 -> v184.2), applied when the night's first fix branch is merged to `main`; the rest of that night's edits keep the number (details: ARCHITECTURE.md).
- Docs-only pushes (only `.md` files and `.gitattributes`) never change the version unless Ricky explicitly says so. They go straight to `main` by default, then merge `main` into `next`.
- Commit messages end with the attribution lines the session was given.

## Rules maintenance
- After each release (or on request), suggest changes in one short list: rules to add (friction seen), trim (redundant/outdated/something you'd do anyway), and wording to tighten.
