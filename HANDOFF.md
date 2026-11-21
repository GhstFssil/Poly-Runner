# Handoff
Last updated 2026-11-20. Overwrite each time; keep under 40 lines. Change record: HISTORY.md (don't read unless asked).

## Goal
Poly Run (Polyrunner): a single-file three.js r128 platformer starring Molly, with an embedded Path Editor and Rig Editor. Standing rules: CLAUDE.md. Stable facts, branches and test commands: ARCHITECTURE.md.

## Done
- 2026-11-20: groups 1-3 are on `main` (v184, overwritten; Ricky accepted). Docs aligned (HISTORY.md, frozen `audit-notes.md`).
- 2026-11-20, on `next` (not merged): removed the old procedural runner body (~485 lines; the .glb model is the only runner; `body` group, blends and `RP_DROP` kept). Split step 0: `src/manifest.json` + `src/index.html` (the whole game, for now) + `tools/build.py`; `checker-run.html` is now generated, byte-identical to before. `mk_pe_embed.py` and `bake_models.py` edit `src/` and rebuild; `tests/chk.py` fails if the game file is out of sync.

## In progress
- The split into source files (BACKLOG.md, "Separate track"). Next is step 1.

## Decisions (Ricky's unless marked)
- Split plan (Claude's proposal, Ricky agreed broadly): files named by function (`src/data`, `editors/`, `game/{core,level1,level2,sandbox,runner,enemies,ui}`), joined by the manifest in today's order so each pure cut can be checked byte-identical; regrouping/reordering later, verified by tests. The main script is one closure: no code changes while cutting, no ES modules (`file://`).
- Area boundaries: manifest lists allowed dependencies per file, a `tools/check_deps.py` flags cross-area references (regex, a warning). One area per task. Open: also wrap leaf files in IIFEs? And Ricky approves a CLAUDE.md line (edit `src/`, then build; one area per task).
- Star aim (Claude's call; reported to Ricky): follows the camera's yaw and is level at the camera's resting pitch of 0.35, because a literal camera ray would hit the ground about 6 u ahead.
- Comet's poses are layered over the clips (upper-body override; Hover and Fly legs are additive), not baked into clips. Hover ignores mud, toxic ground, plates and landing damage.
- Mob dials live only in Molly's store. Comet's store never holds `mn.*` (`noMobs`).

## Next steps
1. Ricky: approve the CLAUDE.md changes (it still says `checker-run.html` is THE game) before `next` goes to `main`.
2. Step 1: cut the data (settings JSON, glb blobs, CHANGELOG, `OFFICIAL_L1`) into `src/data/`; step 2 editors; step 3 main script; step 4 update tools and tests; step 5 dependency check.
3. Keep the rename to Poly Runner and the glossary in mind: no new "Poly Run"/"checker-run" strings (the output name is `output` in `src/manifest.json`).
4. Session start: check nightly branches (none unmerged as of 2026-11-17).

## Gotchas
- Edit `src/`, then `python3 tools/build.py`; never hand-edit `checker-run.html`. A push to `main` with an unchanged label overwrites that release (CLAUDE.md, Shipping).
- Timing-based tests are noisy headless (fps 2-26, capped dt): poll state, don't use fixed waits; `fu/mov.py` needs an old build: `python3 tests/mk_test.py OLD.html /tmp/polyrun-work/t/aud_pre.html`.
- `__molly()` in `tests/mk_test.py` is a test hook inside the game's closure: it breaks when the code it names is removed (rx8.py caught `lower`).
- After changing the shipped settings, run `python3 tools/bake_models.py`.
- `tests/chk.py` flags a comment containing "x = y (" as swallowed code. Reword it.
