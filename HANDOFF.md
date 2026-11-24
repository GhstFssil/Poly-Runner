# Handoff (2026-11-24)

## Goal
Rename the game to Poly Runner everywhere, including the hidden saved-data names (with a migration), shipped as one version (v194). Three commits on `next`.

## Done
- v193 published (Sunset Hill fixes). The source split is finished (its BACKLOG entry deleted).
- Commit 1 (on `next`): the game file is `poly-runner.html` (was `checker-run.html`; `src/manifest.json` output). Paths updated in `tools/` (build_release, mk_electron, reslice), `tests/` (chk, mk_test), `release.yml`, README, ARCHITECTURE, GLOSSARY; "Poly Run" -> "Poly Runner" in the sweep docs and `mk_sweep_docs.py`. Game file byte-identical apart from its name. Titles, menus and the desktop window already said Poly Runner.

- Commit 2 (on `next`): browser storage. IndexedDB `polyrunner` (`idbMigrate` in molly.js copies keys from `polyrun` once, marker key `__migrated`; never creates an old database). localStorage `polyrun-*` -> `polyrunner-*`, copied once (marker `polyrunner-migrated`) at the top of core/start.html and path-editor.html; a key that doesn't fit is moved instead. Saved layout file names `polyrunner-layout-*`. Test `tests/fu/rename_saves.py`. CHANGELOG entry v194 added (label not bumped yet). CLAUDE.md file name updated (Ricky OK'd).

## In progress
- Commit 3: desktop app. `window.polyrunner` and its messages, `~/PolyRunner`, `~/.config/PolyRunner` (copy the old folder before the game starts: Electron keeps the saves there), package `polyrunner`, app id `com.polyrunner.game`, AppImage name, build-and-install.sh.

## Decisions
- Ricky: rename the hidden names too; one release; app id without his name (`com.polyrunner.game`). `pr_*`, `runnerRig2`, `cometRig` keep their names (GLOSSARY.md, Frozen names).
- Firefox opening the renamed local file sees a different site: a migration can't reach the old saves there (export Saved Sandboxes from the old file first).

## Next steps
1. Commit 3, tested with fake saves (add its line to the v194 CHANGELOG entry).
2. Ricky backs up `~/.config/PolyRun` and `~/PolyRun`, then ask before publishing v194 (label bump + CHANGELOG entry).

## Gotchas
- `tools/mk_sweep_docs.py` is older than the SWEEP-*.md files (they gained HISTORY.md rules by hand): don't regenerate them with it, or those rules are lost.
- `tools/mk_electron.py` reads fonts from a hard-coded `/tmp/fx` (fails in a fresh workspace; the release workflow uses `build_release.py` instead).
- Shallow clone: `git -c push.negotiate=true push`. Tests leave `shots/` and `tests/fu/new_*` behind; don't commit them.
