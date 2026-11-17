# Nightly sweep

Purpose: every night, one slice of the code (about 5% of it, 20 slices in all) is looked at through one lens (bugs, visual seams and edges, or running lighter and smoother), tested, and fixed only where the fix is proven and safe. A slice is small enough that a night's run stays cheap.

This file is the whole job for the unattended nightly run. Read it as cloned from `main`, before switching branches; the base branch may carry an older SWEEP.md, which you ignore.

## Unattended rules
- Nobody is watching: never ask. Decide, or leave the thing alone and write the question for Ricky (see "For Ricky").
- From CLAUDE.md, these do not apply tonight: the session-start summary, naming files before a big read, proposing a plan and waiting for a go-ahead, and the closing reply style. Everything else in CLAUDE.md does. It loads by itself when the repo is registered: don't read it again.
- Git identity: `git config user.email noreply@anthropic.com` and `git config user.name "Poly Run nightly sweep"`. Never use or write Ricky's email anywhere. Commit messages end with the attribution lines this session was given; if none were given, end with `Co-Authored-By: Claude <noreply@anthropic.com>`.
- Never: change features, physics, tuning numbers, level content, looks or design; reformat or refactor; bump the version label; add a CHANGELOG entry or edit `audit-notes.md` (those come when Ricky merges, see ARCHITECTURE.md); send a zip or publish anything.
- On `main`, the run only appends to `.md` docs (never rewrites them, never sweep reports or STATE.md), mainly the "For Ricky" lines in BACKLOG.md, then merges `main` into `next` (below). Everything else goes on tonight's nightly branch.

## State
The night's state lives in `sweep-reports/STATE.md` on the nightly branches, not here, so this file can be edited on `main` without clashing with the chain of nightly branches:

```
Next slice: 4
Night counter: 3

## Tests added by nights
- (area): tests/name.py, what it checks (nightly/YYYY-MM-DD)
```

Read it from the base branch. If the base has none yet (the first night after this change), take the two numbers from the "## State" block of the base's own SWEEP.md, and the tests from its old reports; if that block is missing too, start at Next slice 4, Night counter 3.

## What a nightly session does
1. **Choose the base.** Run `git ls-remote origin 'refs/heads/nightly/*'` and take the newest name (sort the names; `2026-11-17-2` comes after `2026-11-17`). It is merged if `main` has its report: `git cat-file -e origin/main:sweep-reports/<name>.md`, where `<name>` is the branch name without `nightly/`. If it is merged, or there are no nightly branches, the base is `origin/main`. Otherwise fetch it with `git fetch --depth=1 origin nightly/<name>:refs/remotes/origin/nightly/<name>` and use that.
2. **Create tonight's branch** `nightly/YYYY-MM-DD` (today in America/Chicago). If that name is already in the list from step 1, add `-2` (or `-3`, and so on). `git switch -c <branch> <base>`, then `sh tests/setup.sh`.
3. **Get the slices.** Run `python3 tools/reslice.py --check` (always with `--check`: it prints the table and writes nothing). Unchanged code gives the same table, so no other check is needed. Take the row numbered "Next slice". Also look at the slices for the next three nights (Next slice + 1, + 2, + 3; after 20 comes 1): any that is over 7% of the code goes in tonight's message. Slice 5 is about 12.5% (one long section the tool can't cut); leave it as it is.
4. **Read the slice.** Read all of its code. A slice is a starting point, not a fence: if something in it leans on code elsewhere (a helper, a shared value), read that too.
5. **Pick the lens**: cycle[Night counter mod 7], counted from 0: 0 Bugs, 1 Bugs, 2 Visual, 3 Bugs, 4 Bugs, 5 Performance, 6 Bugs. (20 slices and a 7-night cycle, so over time every slice meets every lens.) If the lens makes no sense for the slice (Visual for code with nothing to see, such as import/export, menus and input; Performance for code with no hot path), use Bugs instead; never skip a slice.
6. **Do the work** under that lens (below), with the tests that fit the area (below).
7. **Close the night.** In `sweep-reports/STATE.md`: "Next slice" + 1 (after 20 comes 1), "Night counter" + 1, and add any test you wrote to "Tests added by nights". Write the report to `sweep-reports/<name>.md` (named after tonight's branch, without `nightly/`). Commit, then push: `git -c push.negotiate=true push -u origin <branch>`. Write the "For Ricky" items to BACKLOG.md (below). Then send the message (below).
8. **If a usage limit stops you**, write the slice and step you reached in the report, still update STATE.md so the next night continues from the right place, and push whatever is safe.

## Testing rules
- After every edit: if you touched `path-editor.html`, run `python3 tools/mk_pe_embed.py` first. Then `python3 tests/chk.py && python3 tests/mk_test.py` (this rebuilds the test copy; without it the tests run on the old game). Then, from inside `tests/`, the tests for the area and `python3 reg2.py`.
- Commit only when all of those pass. If a fix makes anything worse, undo it. After two failed attempts at the same fix, undo it and write it up in the report.

## Lenses
**Bugs.** Read for wrong math or units, off-by-one, null or NaN paths, state that is not reset, swallowed errors, mismatches between the editor and the game, event handlers that leak, values that can leave their range, code that disagrees with its own comment. For each suspect, prove it: write a small test (headless, in `tests/`) that fails, or show the exact input that goes wrong. Fix only a proven bug, with the smallest change, and keep the test.

**Visual (seams and edges).** Render the slice's content headless from several close-up angles (screenshot helpers: `tests/rv*.py`, `tests/shot.py`, `tests/fu/modes.py`) and look for: cracks or gaps between meshes, holes, z-fighting or flicker, stretched or flipped faces, T-junctions, lighting seams, wrong normals, pop-in, objects floating or sunk, colour breaks at joins, jagged silhouettes where it should be smooth. Fix only a clear artifact with one obvious cause, locally. Save before and after screenshots to `sweep-reports/<name>/`. If a fix would change how something is designed (a shape, a colour, a size), do not change it: it goes to "For Ricky" with the screenshot's path.

**Performance (lighter and smoother, same behaviour).** Headless software rendering says nothing about real GPU speed, so measure only what it can: JavaScript time per frame and per build (`performance.now()` around terrain chunks, sandbox builds, rig rebuilds, the main update), allocations inside per-frame code (new objects, arrays, strings, closures made every frame), repeated work that could be cached, draw calls, triangle and material counts, texture and geometry sizes, anything that scales badly. Make a change only if (a) it saves a measurable amount, (b) the output is provably the same (identical positions, heights, sample values or screenshots before and after, plus the related tests) and (c) it is small and local. Record before and after numbers in the report. A bigger idea (a restructure, or anything that changes how something looks or feels) goes to "For Ricky" with the estimated gain and the risk, never into the code. Never trade away behaviour, accuracy or looks for speed.

## Tests by area (run from inside `tests/`)
- Path Editor (`path-editor.html`): `peobj.py`, `pesave.py`, `pecycle.py`, `pegho.py`, `pefuzz.py` (several minutes: run it last).
- Sandbox and levels (`sbBuild`, footprints, caves, walls): `fu/ends1.py` plus a test of your own for what you touched.
- Stats and movement details: `fu/fu1.py`, `fu/fu1b.py`.
- Rig Editor dials, loading and settings: `rx8.py`, `fu/fu2.py`, `fu/fu4.py`; model build, welds and weights: `rw4.py`, `rm1.py`, `fu/fu3.py`; saved model storage: `fu/fu6.py`.
- Plus every test in STATE.md's "Tests added by nights" for the area.

## For Ricky
Anything that might be a bug but might be intended, or needs a decision (including design, tuning and bigger performance ideas), is not changed. Write each one in tonight's report, and also append it to BACKLOG.md on `main`, under "## Nightly sweep suggestions", as one line: `- (nightly/<name>) the question, in plain words; where in the code`. Don't repeat an item that is already there. If another doc on `main` needs a note (for example a test map line here), append it the same way, in the same commit. Then merge `main` into `next`. Do all of it in a separate worktree so tonight's branch is untouched:
```
git fetch --depth=200 origin main next
git worktree add --detach /tmp/pr-main origin/main
(append to /tmp/pr-main/BACKLOG.md, that section only, and any other .md note)
git -C /tmp/pr-main commit -am "Nightly <name>: notes for Ricky"      (message ends with the attribution lines)
git -C /tmp/pr-main -c push.negotiate=true push origin HEAD:main
M=$(git -C /tmp/pr-main rev-parse HEAD)
git -C /tmp/pr-main checkout --detach origin/next
git -C /tmp/pr-main merge --no-ff -m "Merge main into next (nightly <name>)" $M      (message ends with the attribution lines)
git -C /tmp/pr-main -c push.negotiate=true push origin HEAD:next
```
If the push to `main` is refused because `main` moved, fetch again, redo the append on the new `main` and retry once; if it still fails, say so in the message (the items are in the report either way). If the merge into `next` conflicts or fails for any reason, run `git -C /tmp/pr-main merge --abort`, leave `next` alone and say so in the message; never resolve a conflict on `next`.

## The report and the message
- The report file (`sweep-reports/<name>.md`): the slice and what it covers, the lens, what you looked at, what you found and fixed with its test, numbers for performance work, screenshots for visual work, what you left for Ricky, any limit you hit, and any setup oddity (for example, a clone that was already there).
- The message: your final message, and a SendUserMessage call with the same text. Plain language for Ricky, no code or jargon, about 15 lines at most: the date and branch, the lens and slice (and what part of the game it covers), what you found, what you fixed (one line each), what you left for him and why (and that it is in BACKLOG), anything you could not finish, and any slice over 7% coming in the next three nights. If you found nothing, say so plainly.

## Known leftovers (not bugs to chase)
Ponytail blend at max opens a slit at the hair tie; Contour shift at max falls back to the old arm joint with a few holes; a soft fold at the top of the trailing thigh in deep strides.
