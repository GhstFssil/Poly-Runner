# Poly Run

A single-file 3D platformer (three.js r128) with an embedded Path Editor and Rig Editor.

## Run
Open `checker-run.html` in a browser (it loads three.js from a CDN). The desktop app is described in `desktop/README.md`.

## Test
Once per fresh session: `sh tests/setup.sh`. After every edit: `python3 tests/chk.py && python3 tests/mk_test.py`, then the tests for the area touched, from inside `tests/` (see ARCHITECTURE.md, Run and test). The three nightly sweeps (`SWEEP-BUGS.md`, `SWEEP-EDGES.md`, `SWEEP-PERF.md`) run their own tests.

## Updating
A push to `main` that touches the game, `desktop/` or the release tooling publishes a release under the `<div class="ver">` label in `checker-run.html`, and every push to `main` except a docs-only one bumps that label first (see ARCHITECTURE.md, Branches and versions).

## Files
See `ARCHITECTURE.md` for what each file does.
