# Handoff (2026-11-21)

## Goal
Split the single-file game into `src/` parts by function (areas: core, level1, level2, sandbox, characters, mobs, ui), with GLOSSARY.md as the one list of terms.

## Done
- Old procedural character body removed (47bdb52).
- Step 0: `src/manifest.json` + `tools/build.py`; `checker-run.html` is generated, byte-identical, `chk.py` detects drift.
- GLOSSARY.md written; docs-only push to main (7104d93), merged into `next`.
- On `next`: Enemy -> Mob rename in the game (`MOBS`, `killMob`, `updateMobs`; Path Editor's own list is `MOB_KINDS`); Path Editor labels in Title Case (Big Minion, Toxic Patch, Caution Sign, Seg Chain, Mud, Crags, ...).
- CLAUDE.md `src/` rules, BACKLOG.md and GLOSSARY.md updates on `next`.

## In progress
Nothing half-done. `next` has this batch committed (see HISTORY.md).

## Decisions
- Terms: mob / minion / Big Minion / Roost Gazer; character; stat; tile; Barrier; Mud; Crags; every word of a label capitalized.
- Frozen storage names stay (see GLOSSARY.md).
- Cut in place first (byte-identical), reorder later.

## Open (Ricky decides)
- Rotation (`rot`) vs Heading (`heading`).
- Sweep existing text for dials (~50), squares (~50), "Hedron Barrier", sentence-case labels outside the stamp tools?
- IIFE isolation for leaf files?
- Is "capitalized" meant as Title Case? (assumed yes)

## Next steps
1. Step 1: move data (settings JSON, glb blobs, CHANGELOG, OFFICIAL_L1) into `src/data/`.
2. Steps 2-5 as planned; add `tools/check_deps.py`.
3. At release: v185 bump + CHANGELOG entry (Mob wording, Path Editor labels); `tools/mk_sweep_docs.py` is behind the SWEEP docs, never regenerate it blindly.

## Gotchas
- Shallow clone: `git -c push.negotiate=true push`.
- `tests/fu/door4.py` fails and `minionhit.py` is ~50% flaky on both old and new builds (in BACKLOG).
- Comparison tests need old builds (aud_head.html, aud_pre.html).
