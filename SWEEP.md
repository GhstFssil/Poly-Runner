# Nightly bug sweep

Purpose: every night, one small slice of the code is looked at through one lens (bugs, visual seams and edges, or running lighter and smoother), tested, and fixed only where the fix is proven and safe. A slice is small enough that a night's run stays cheap (aim for about 600 to 900 lines of code read, plus the tests for it).

## What a nightly session does
1. `git fetch`; choose the base (see CLAUDE.md: newest unmerged `origin/nightly/*`, else `main`); create `nightly/YYYY-MM-DD` from it; run `sh tests/setup.sh`.
2. Open the coverage table below. Take the first slice marked `todo` (when every slice is `done`, start a new round: set all back to `todo`, round number +1).
3. Pick the night's lens from the cycle below and apply it to the slice. For the Bugs lens, read that slice carefully for real bugs: wrong math or units, off-by-one, null or NaN paths, state that is not reset, swallowed errors, mismatches between the editor and the game, event handlers that leak, values that can leave their range, code that disagrees with its own comment. For each suspect, prove it: write a small test (headless, from `tests/`) that fails, or show the exact input that goes wrong.
4. Fix only a proven bug, with the smallest change. Add the test. Run `python3 tests/chk.py` and the tests related to the slice (see the table), plus `tests/reg2.py`. If a fix makes anything worse, undo it.
5. Never: change features, physics, tuning numbers or level content; reformat or refactor; bump the version label; send a zip or publish anything. If something might be a bug but might be intended, or needs a decision, do not change it: write it under "For Ricky".
6. Update the table (slice `done`, date, one line of result), write the night's report in `sweep-reports/YYYY-MM-DD.md` (what was read, what was found, what was fixed with its test, what is left for Ricky, any limits hit), commit, and push the branch.
7. If a session is cut off by the usage limit, note in the report which slice and which step it reached.

## Lenses (a six-night cycle: Bugs, Bugs, Visual, Bugs, Bugs, Performance; keep a counter in the table header comment below)
Each slice has its own status for each lens. A night takes the first slice that is `todo` for that night's lens. A Visual night skips slices with nothing to see (the PE JSON, menus); a Performance night skips slices with no hot path.

**Visual (seams and edges).** Render the slice's content headless (the harness has screenshot helpers: `tests/rv*.py`, `tests/shot*`-style scripts, `fu/modes.py`) from several close-up angles and look for: cracks or gaps between meshes, holes, z-fighting or flicker, stretched or flipped faces, visible T-junctions, lighting seams, wrong normals, pop-in, objects floating or sunk, texture or colour breaks at joins, jagged silhouettes where it should be smooth. Fix only a clear artifact that has one obvious cause and keep the fix local. Save before and after screenshots to `sweep-reports/YYYY-MM-DD/`. If the fix would change how something is designed (a shape, a colour, a size), do not change it: put the screenshot and your suggestion under "For Ricky".

**Performance (lighter and smoother, same behaviour).** Headless software rendering says nothing about real GPU speed, so measure only what it can: JavaScript time per frame and per build (for example with `performance.now()` around terrain chunk building, sandbox builds, rig rebuilds, the main update), allocations inside per-frame code (new objects, arrays, strings, closures made every frame), repeated work that could be cached, draw calls, triangle and material counts, texture and geometry sizes, and anything that scales badly (loops inside loops over many objects). Make a change only if (a) it saves a measurable amount, (b) the output is provably the same (identical positions, heights, sample values or screenshots before and after, plus the related tests), and (c) it is small and local. Record the before and after numbers in the report. A bigger idea (a restructure, an approach that changes how something looks or feels) goes under "For Ricky" with the estimated gain and the risk, never into the code. Never trade away behaviour, accuracy or looks for speed.

## Coverage table (round 1)
Find a section by its `// ---- name` comment (line numbers move). PE = `path-editor.html`; the rest is `checker-run.html`.

| # | Slice | Related tests | Bugs | Visual | Perf |
|---|-------|---------------|------|--------|------|
| 1 | PE: the path model, samples, widths, banks (`the path:`) | peobj, pefuzz | todo | todo | - |
| 2 | PE: shapes and drawing (`shapes`, `drawing`) | peobj | todo | todo | todo |
| 3 | PE: piece list and the inspector (`the piece list`, `the inspector`) | pefuzz | todo | - | - |
| 4 | PE: events, copy/paste, presets, layers, ground, live preview | peobj, pesave | todo | - | - |
| 5 | PE: export, import and autosave (JSON round trip) | pesave, peobj | todo | - | - |
| 6 | Speedometer, renderer and scene, sizing, clock, main loop | reg2 | todo | - | todo |
| 7 | Level 1 valley terrain and trees | reg2 | todo | todo | todo |
| 8 | The cave, doorway, mud ramp and field | reg2 | todo | todo | - |
| 9 | Level 2: Oceana, the Crags, the Sink | reg2 | todo | todo | todo |
| 10 | Sandbox build: `sbBuild`, object parsing, footprints | fu/ends1 | todo | todo | todo |
| 11 | Sandbox: caves | reg2 | todo | todo | - |
| 12 | Walls (banks past 80 degrees) | reg2 | todo | todo | - |
| 13 | Movement model: steering, gravity, grip, slopes, collisions in the main update | reg2 | todo | - | todo |
| 14 | Movement details and stat cards | fu/fu1 | todo | - | - |
| 15 | Health, strafe, signs, toxic patches, segs, streaks, gate, stone edges, start | reg2 | todo | todo | todo |
| 16 | Enemies and the big minions | reg2 | todo | todo | todo |
| 17 | Molly: character build, model load, IndexedDB store, state | fu/fu6, rx8 | todo | todo | todo |
| 18 | Rig Editor: dials, number boxes, loading, pasting and upgrading settings | rx8, fu/fu2, fu/fu4 | todo | - | - |
| 19 | Rig Editor: the model build, welds, bone weights, export | rw4, rm1, fu/fu3 | todo | todo | todo |
| 20 | Rig Editor: animation keys, previews, Barrier | rx8, rv | todo | todo | - |
| 21 | Menus, world map, change log, input | reg2 | todo | - | - |

## Known leftovers (not bugs to chase)
Ponytail blend at max opens a slit at the hair tie; Contour shift at max falls back to the old arm joint with a few holes; a soft fold at the top of the trailing thigh in deep strides.

Night counter: 0 (the lens for night N is cycle[N mod 6]).

## For Ricky (questions the sweeps could not decide)
(none yet)
