# Handoff (2026-11-24)

## Goal
Rename the game to Poly Runner everywhere, including the hidden saved-data names, shipped as one version (v194, desktop app 1.2). Published as v194 (2026-11-24).

## Done (on `next`)
- Commit 1: the game file is `poly-runner.html` (was `checker-run.html`); tools, tests, `release.yml`, docs, CLAUDE.md updated. Titles, menus and the desktop window already said Poly Runner.
- Commit 2: browser storage `polyrun` -> `polyrunner` (IndexedDB, `polyrun-*` localStorage keys, layout file names), copied once on first load (`idbMigrate` in molly.js, marker `__migrated`; localStorage copy at the top of core/start.html and path-editor.html, marker `polyrunner-migrated`; a key that doesn't fit is moved). Test `tests/fu/rename_saves.py`.
- Commit 3: desktop app 1.2: `window.polyrunner` and `polyrunner-backup`/`-restore`, folders `~/.config/PolyRunner` and `~/PolyRunner`, package `polyrunner`, app id `com.polyrunner.game`, `PolyRunner-1.2.0.AppImage`, `PolyRunner.desktop`, `run-polyrunner.sh`. The app does NOT migrate the old folders: Ricky runs a one-time script (`migrate-to-polyrunner.sh`, sent to him, not in the repo).
- v194 CHANGELOG entry written (label still v193).

## Decisions
- Ricky: rename the hidden names too; one release; app id without his name; desktop folders moved by a one-time script, not by app code (no cruft). `pr_*`, `runnerRig2`, `cometRig` keep their names.
- The script copies (old folders stay as backup), refuses if the app is running or a new folder exists, leaves out the old update folder `game/` (it would hide the new built-in game) and the lock files, and removes the old `PolyRun.desktop`.

## Next steps
1. (done) v194 published.
2. (done 2026-11-24) Ricky ran the script and installed desktop 1.2: migration worked, the game loads faster and runs smoother.
3. Saves confirmed: the in-game one-time copy can now be removed (BACKLOG entry), when Ricky asks.

## Gotchas
- Firefox opening `poly-runner.html` sees a different site than `checker-run.html`: no copy possible there (export Saved Sandboxes from the old file).
- `tools/mk_sweep_docs.py` is older than the SWEEP-*.md files: don't regenerate them with it.
- `tools/mk_electron.py` reads fonts from a hard-coded `/tmp/fx`; the release workflow uses `build_release.py`.
- The desktop app itself wasn't launched here (no Electron run); its JS syntax, the bridge test (`fu/pe_backup.py`) and the release build pass.
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
