# Poly Runner — repo GhstFssil/Poly-Runner, local clone /home/claude/poly-runner (handoff written 2026-11-15, after v180)

## Goal
Single-file three.js r128 3D platformer. Ricky (GitHub GhstFssil) builds the levels and decides versions; Claude builds tools and mechanics. Read CLAUDE.md first: it has the standing rules.

## Architecture
- `checker-run.html`: the whole game. It embeds the Path Editor (between `<!--PE-BEGIN-->` and `<!--PE-END-->`, generated from `path-editor.html` by `python3 tools/mk_pe_embed.py`), the Rig Editor (`<template id="rig-tpl">`, `window.__rigBoot`), the built-in models (`#molly-glb`, `#comet-glb`) and the shipped settings (`#molly-settings`, `#comet-settings`).
- Runners: `CHAR` is 'molly' or 'comet' (localStorage `pr_char`, picked on the Characters page). Dials: `runnerRig2` for Molly plus the mobs, `cometRig` for Comet. Saved models live in IndexedDB `polyrun/kv` under `mollyGlb` and `cometGlb`. Dial fallback order: stored, then `SHIPPED[ch]`, then the RIGCFG literals (`rigPick`).
- Sandbox levels: Path Editor JSON goes through `sbBuild`. Grass Canyon is `OFFICIAL_L1` (Ricky's re-edit, v179).
- Desktop app: `desktop/` (Electron 1.1.0: one copy only, backups). The game update folder is `~/.config/PolyRun/game`.
- Releases: a push to `main` that touches the game, app or tools runs `.github/workflows/release.yml` (`tools/build_release.py`) and publishes under the `<div class="ver">` label.

## Done and verified (v178.1 to v180, all published; main = next = 39e44dc)
- v178.1: nightly fix for looped joined pieces (`tests/pecycle.py`).
- v179:
  - New Grass Canyon (`fu/gc_new.py`).
  - Pressure plates and targets linked to doors (`fu/trig1.py`, `fu/pe_trig.py`).
  - Stamps are free by default.
  - Rig Editor pages Molly / Comet / Mobs (`fu/rigpages.py`).
  - Drift preview and dials over the run (`fu/drift2.py`).
  - Comet: Star Throw on Q/E, Hover on 2, Fly with Space (`fu/comet1.py`).
- v180:
  - Comet's throw, hover and fly poses and stars are editable dials (`comet.pc/pt/pf/ho/fl.*`), read live through `window.__cometQ`.
  - Throw timeline with a held star; aim marker `#starAim`; star-coloured Power line, charge bar and Segs (`fu/comet2.py`, `fu/comet_anim.py`).
  - Copy settings copies {molly, comet, mobs}.
  - Ricky's settings are the shipped defaults; both models rebaked (`fu/defaults1.py`).

## In progress
Nothing. The nightly sweep (scheduled task trig_018iQp7myjjf62rgS8cuFrt8, 03:00 America/Chicago) runs next on v180 and writes `nightly/YYYY-MM-DD` plus `sweep-reports/`.

## Key decisions (Ricky's unless marked)
- Ask before every whole-number version. Nightly fixes merged to `main` take the next decimal (v180.1 ...), each with its own CHANGELOG entry.
- Never send a zip or publish an artifact unless asked. No physics changes to fix level problems. Speeds are shown in Zips (1 Zip = 2 u/s).
- Star aim (Claude's call; reported to Ricky): it follows the camera's yaw and is level at the camera's resting pitch of 0.35, because a literal camera ray would hit the ground about 6 u ahead.
- Comet's poses are layered over the clips (upper-body override; Hover and Fly legs are additive), not baked into clips. Hover ignores mud, toxic ground, plates and landing damage.
- The mob dials live only in Molly's store. Comet's store never holds `mn.*` (`noMobs`).

## Gotchas and failed approaches
- After changing the shipped settings, run `python3 tools/bake_models.py`, or the built-in models won't match them.
- When rewriting a tag with regex, recompute match positions after each edit. A stale `m.end()` once nested `comet-settings` inside Molly's JSON.
- Headless fps swings from 2 to 26 and dt is capped, so timing-based results vary. Poll state instead of using fixed waits. `fu/steep1.py` is noisy.
- Test minions: use `__ens().filter(q => q.x > 59000 && q.x < 9e6)`. Index 0 is a level-1 minion. Start the blank sandbox (`#dtBlank`) before `__sbStart`.
- `tests/chk.py` flags a comment containing "x = y (" as swallowed code. Reword it.
- Pushing `main` publishes. Branch deletion on GitHub is refused, so the merged `nightly/2026-11-15` stays.
- `git fetch` has no remote-tracking refs for other branches. Use `git ls-remote origin`.

## Run and test
- Once per fresh session: `sh tests/setup.sh`.
- After every edit: `python3 tests/chk.py && python3 tests/mk_test.py`.
- Tests, run from `tests/`: `python3 reg2.py`, `peobj.py`, `pesave.py`, `pecycle.py`, and `fu/<name>.py`. The ones listed above take an optional screenshot dir argument.
- Old build for comparison: `python3 tests/mk_test.py OLD.html /tmp/polyrun-work/t/aud_main.html`, then pass `html='aud_main.html'` to `Rig()`.
- Publish (only when Ricky says): bump the `ver` label on `next`, merge `--no-ff` into `main`, push, `gh run list -b main -L 1`, fast-forward `next`.

## Next steps (priority order)
1. Session start: `git ls-remote origin 'refs/heads/nightly/*'`. Read each report in `sweep-reports/`, tell Ricky what was fixed, and merge to `main` as v180.N (CLAUDE.md rule). Then merge `main` into `next`.
2. Ask Ricky whether the runner ever looks flat red and stippled near the camera in his game. It does in headless renders, and in pre-v179 builds too; the suspect is the see-through shader.
3. New work goes on `next` with a CHANGELOG entry at the top and a line in `audit-notes.md`.
