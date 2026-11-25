# Glossary

One source of truth for the game's words. Use these terms, spelled this way, in the game's text, the CHANGELOG, code comments, docs and commit messages. Ricky owns the names.

- **proposed** marks a term Ricky has not confirmed yet. Claude proposes where the repo disagrees with itself; the mark goes when Ricky confirms. Every term here is confirmed today.
- Labels: every label in the UI is in Title Case: buttons, tabs, panels, menu items, stat names, field names and option names (Big Minion, Pressure Plate, Seg Chain, Left Arm Raise). Small words stay lowercase (a, an, the, and, but, or, for, at, by, in, of, on, to, per) unless first; the word after a colon is capitalized; each part of a hyphenated word is (Side-to-Side). Not changed: anything in parentheses, units, tooltips (`title=`), placeholders, messages, hints and sentences. A label built from pieces goes through `tcLabel` (in the Rig Editor code). Stat keys (`Foot.len`) and file keys (`'Poly Runner rig settings'`) are not labels.
- Add a term here in the same change that introduces it. Numbers (speeds, costs, cooldowns, sizes) live in the game and the Rig Editor, never here, so they can't go stale.
- Checked against the game at v184 (2026-11-21). "Code" cells name the identifiers to search for.

## Say this, not that
| Say | Not | Why |
|---|---|---|
| Poly Runner | Poly Run, Polyrunner, PolyRun | the game's name everywhere players see it; old spellings survive only in frozen names (below) and old log lines |
| Seg | segment (for the collectible) | a segment is a piece of a path |
| segment | Seg (for a path piece) | see above |
| Barrier | ball, shell, Hedron Barrier | one name; the Controls screen says Barrier |
| stamp | object, element | the Path Editor's word for something placed |
| mob (any kind); minion, Big Minion, Roost Gazer (the kinds) | enemy, enemies | everywhere: text, comments and code names. See Mobs |
| character | runner (for Molly or Comet) | "runner" is part of the game's name |
| tile | square | TILE is 2 units |
| stat, stats | dial, dials | the Rig Editor has a Stats panel and no panel of dials |
| saved / shipped / built-in | custom, default, baked-in (see Settings) | three distinct places |
| Zips | u/s, units per second (in anything players read) | speeds are shown in Zips |

## The game and the people
| Term | Meaning | Code / notes |
|---|---|---|
| Poly Runner | the game | the game file is `poly-runner.html` (was `checker-run.html` until 2026-11-24) |
| Molly | the main character | `CHAR = 'molly'` |
| Comet | the second character: no Strafe, no Barrier; has Star Throw, Hover and Fly | `CHAR = 'comet'` |
| character | Molly or Comet; picked on Character Select | `CHAR`, `setChar`, `loadCharModel`, `pr_char` |
| Character Select | the screen after choosing a level where you pick who runs it; the last pick is marked and focused | `scr-pickchar`, `pickThen`, `__pickChar`, `pcLast` |
| Ricky | builds the levels; Claude builds the tools and mechanics | CLAUDE.md |

## Units and space
| Term | Meaning | Code / notes |
|---|---|---|
| unit (u) | the base length | |
| tile | 2 units. Players' text says "tile", never "square" | `TILE` |
| Zip | the speed unit: 1 Zip = 2 u/s, so one tile a second. Gravity is also in Zips (per second) | |
| True Y | height measured from where her feet are at the start of the path | `yAbs`, `B.y0`, `o.T = ya + y0` |
| world offsets | each level sits at its own x offset so levels never overlap | `L2_X`, `L3_X` |

## Levels and the world
| Term | Meaning | Code / notes |
|---|---|---|
| level | a place you play. Level 1 Grass Canyon, Level 2 Oceana Crags, Level 3 the Sandbox | |
| Act | a part of a level; Level Select lists "Grass Canyon, Act 1". Only Act 1 exists | |
| Level Select | the screen that lists the levels, with View Map beside each | |
| Map | the WORLD MAP overview of a level, opened by View Map | `scr-map` |
| Sandbox | the level built from a Path Editor layout; Level 3, and the engine Levels 1 and 2 now play on | `sbBuild`, `sb*`, `sbHash`, `sbNear` |
| layout | a Path Editor document: the path, the stamps and the terrain, saved as JSON. Never "map" or "level file" | `OFFICIAL_L1` (Grass Canyon), `OFFICIAL_L2` (Oceana Crags) |
| path | the line of straights and arcs a layout is built around | `B.samples` |
| segment | one straight or arc of a path (not a Seg) | |
| Ground | a layout's terrain, picked in the Path Editor's Ground list: Flat Patchy Grass, Grass Canyon's / Oceana Crags' Generated Terrain, Bumpy Grass, Open Ocean, Crags, Giant Hill, Sunset Hill | `terrain`: '', `level1`, `level2`, `grass`, `ocean`, `crags`, `giant`, `sunset` |
| Sunset Hill (ground) | the Giant Hill's footprint with slopes that wander between almost flat and about 45 degrees, Ravines, its own trees up to the Treeline, and the sunset sky. Also the stage name (Sunset Hill, Act 1) | `sunset`, `shBase`, `shTable`, `skyDome` |
| Ravine | a winding steep-walled channel carved through Sunset Hill's ground; it cuts through a path rather than being bridged (a floating piece can span it) | `shRavine`, `shCut` |
| Treeline | the height on Sunset Hill above which its own trees stop growing | `SH_TREES`, `shTrees` |
| Valley, The Sink | names in the old hand-coded terrain code only: Level 1's original terrain, and the poisoned low ground in Oceana Crags. Not for players | code comments |
| Dev Mode | the menu screen (title page and pause) with the Path Editor, Rig Editor, Sandbox buttons, Saved Sandboxes, the Change Log, and in-game tools (Fill Power Line, Invulnerable) | `bDevT`, `bDev` |
| Saved Sandboxes | layouts kept in the browser | `polyrunner-sandboxes` |

## Things you place (Path Editor stamps)
Each is a stamp. The first column is the exact label, as the Path Editor shows it.

| Stamp | Code id | Notes |
|---|---|---|
| Tree, Trees (Patch) | `tree`, `forest` | |
| Minion, Big Minion, Roost Gazer | `minion`, `bigminion`, `gazer` | see Mobs |
| Seg, Seg Chain | `seg`, `segchain` | a chain follows the path or its own curve |
| Toxic Patch | `toxic` | hurts. Toxic ground is terrain, a Toxic Patch is a stamp |
| Caution Sign | `sign` | |
| Ramp | `ramp` | its last stretch is the Style Boost zone, marked with a red and white checkerboard |
| Door, Pressure Plate, Target | `door`, `plate`, `target` | a Door opens once every linked minion is beaten, the plate is pressed and the target is broken (`sbDoorLinked`) |
| Checkpoint, Goal | `checkpoint`, `goal` | |
| Player Start | `start` | |
| Tip Area | `tip` | a hint box that types itself out when you enter it (`showHint`) |
| Cave, Hill, Lake, Spawner | `cave`, `hill`, `lake`, `spawner` | |
| Ledge, Platform, Gap | `ledge`, `platform`, `gap` | |
| Mud | `mud` | not "Mud stretch" |
| Crags, Terrain Patch | `crag`, `patch` | Crags, not "Crag patch" |

Path Editor panel words: inspector, next-stamp panel, presets (`polyrunner-pe-presets`), Snap, Layer, Bend, Rise, Length, Width, Height, Rotation.

## Moves and the HUD
| Term | Meaning | Code / notes |
|---|---|---|
| Brake | S: slide to a stop | |
| Drift | A or D while fast: a quick swing to that side. "Grip while drifting" is a stat | |
| Strafe | Q or E: an instant hop to the side (Molly only). Its distance is a stat | `strafe`, `stat.strafe` |
| Sidestep | left or right mouse button held: she walks to her left or right of her heading, at a stat speed; its own animation (Rig Editor page Sidestep, clips `Step_L`, `Step_R`) shows only while she is not running forward | `sidestepTick`, `sideKeys`, `sideNow`, `stat.sidestep`, `step.*` |
| Camera Zoom | the mouse wheel: how far the camera sits behind her (4 to 20, saved), stretched up to 30% by her speed | `camZoom`, `camPull`, `CAM_PULL`, `pr_camzoom` |
| Free Look | Caps Lock on: the mouse turns only the camera, not her; turned off, the camera swings back behind her | `freeLook`, `lookBack` |
| Runner's Pose | hold S standing still, then let go to launch | `RP_DROP` |
| Barrier | Molly's key 2: a red shell nothing can hurt (a ball you roll in). Costs Power | `ballOn`, `barrier*`, `BARRIER_COST` |
| Dodecadash | hold S inside the Barrier, then let go to launch | |
| Style Boost | what a jump from the Style Boost zone of a ramp gives: it multiplies how fast Segs fill the Power Line for a while | `styleStacks`, `styleMult` |
| Star Throw | Comet's Q or E: a thrown star, bigger the longer it is charged | `starPress`, `spawnStar`, `cometStars` |
| Star | the thrown projectile | |
| Hover, Fly | Comet's key 2 (Hover); hold Space while hovering (Fly) | `hovOn`, `flyOn` |
| Seg | the red collectible (blue for Comet). Each one fills the Power Line and adds to the SEGS counter | `SEGS`, `SEGBY` |
| Big Seg | a Seg worth ten on the SEGS counter | |
| SEGS counter | how many Segs this run, ever up. Not the Power Line | `SEGS_MAX`, `#segs` |
| Power Line | the meter of Power: filled by Segs and by beating minions, spent by the Barrier and Star Throw. Written "Power Line" (changelog also has "Power line": use the capital L) | `POWER_MAX`, `setPower` |
| Power | what the Power Line holds | |
| charge bar | the speedometer's bar that shows how long Star Throw has been charged | |
| speedometer | the HUD readout of speed, in Zips | |
| hearts | health, shown as hearts; damage can take half a heart | `#hearts`, `#hp` |
| respawn | coming back at the last Checkpoint; Plates, targets and minions reset | |
| Invulnerable | a Dev Mode switch: minions can't hurt or push her | |

## Mobs
| Term | Meaning | Code / notes |
|---|---|---|
| mob | any kind of creature that is not a character: the umbrella word, and the Rig Editor's Mobs page | `MOBS` (the mobs in the level), `MOB_KINDS` (Path Editor: kinds that can be set Idle), `killMob`, `updateMobs`; `mn.*` (Molly's store only; Comet's never has them: `noMobs`) |
| minion | the basic mob; in the changelog the word for the kind | |
| Big Minion | the large minion | |
| Roost Gazer | the flying mob: a minion's head with wings and one big eye. Behavior is Chases, Idle or Cycle | |
| enemy | retired: say mob, or the kind. Applies to text, comments and code names | |

## Editors and settings
| Term | Meaning | Code / notes |
|---|---|---|
| Path Editor | builds layouts. Source `path-editor.html`, embedded in the game | `__peBoot`, `PE-BEGIN`/`PE-END` |
| Rig Editor | edits the characters' and mobs' models and stats. Pages: Molly, Comet, Mobs | `rig-tpl`, `__rigBoot`, `setPage` |
| model | a character's 3D body, a `.glb` file | |
| stat | one number that changes how a character or mob plays or looks. The Rig Editor's Stats panel lists them. "Dials" is retired | `DEFM`, `DEFC` |
| settings | a character's or the mobs' whole set of stats, as one bundle. Copy settings copies all three pages as a block | |
| saved | in the player's browser: localStorage `runnerRig2`, `cometRig`; models in IndexedDB | |
| shipped | inside the game file: `#molly-settings`, `#comet-settings` (Comet's has no `mn.*`), and the models `#molly-glb`, `#comet-glb` | `SHIPPED[ch]` |
| built-in | the numbers written in the code | `RIGCFG`, `COMET_DEF` |
| lookup order | saved, then shipped, then built-in | `rigPick` |
| bake | write the shipped models into the game file | `tools/bake_models.py` |
| hair lock | one of the ring of locks round a character's hairline, all built alike from the shared hair stats (Lock Count, Thickness, Taper, Curl Amount, Curl Tightness, Spread, Part Position, Lock Length at the Front / Sides / Back). The old three bangs are the front locks; "bangs" is retired. Click one in the Rig Editor to give it (and its partner) its own Length, Extra Curl and Angle | `hair.*`, `hair.L<k>.*` (k: pairs counted from the front), `hairLocks`, `HAIRLOCKS`; old saved `bangL` becomes `hair.lenF` |
| partner | a hair lock's mirror-image lock on the other side; the two share their own stats | `hairPair` |

## Build, repo and process
The rows for src, part, build and the game file describe the source split, which is on `next` until the next version ships. On `main` the game file is still edited directly.

| Term | Meaning | Code / notes |
|---|---|---|
| src, part | the source files in `src/`; a part is one file the build joins: a source file as it is, or a data file in `src/data/` (JSON, `.glb`) that the build wraps | `src/manifest.json` |
| build | join the parts, byte for byte, into the game file | `python3 tools/build.py` |
| the game file | the generated, committed single HTML file | `poly-runner.html` |
| area | a group of source files by function (core, level1, level2, sandbox, characters, mobs, ui; level1 and level2 now hold only the old levels' terrain). One task works in one area. The tests are mapped by area | |
| play world | where she runs: the loaded layout, at the origin | `worldH0`, `ledgeH` |
| old levels | the original hand-made Grass Canyon and Oceana Crags; only their terrain is left, sampled by a layout's `level1` and `level2` grounds in the old levels' own coordinates | `oldWorldH`, `oldLedgeH` |
| version label | the `v184` in `<div class="ver">`; a push to `main` bumps it | |
| next, main | `next` is where work happens; `main` is what ships | |
| publish | merge `next` into `main` as the next version; the release workflow does the rest | CLAUDE.md |
| nightly sweep | the three overnight reviews (bugs, edges, perf), on `nightly/*` branches; they report, they don't change design | `SWEEP-*.md` |
| CHANGELOG | the player-facing log, `var CHANGELOG` in the game | |
| HISTORY, HANDOFF, BACKLOG | the change record (append-only), the state of the work, the list of bugs and ideas | |
| audit-notes | the old log, frozen at v184 | |

## Frozen names (they look old but hold players' saved data)
Renaming any of these loses saved layouts, settings and models unless the game reads the old name first and writes the new one. The rename task must decide each one; until then they stay as they are.

Decided 2026-11-24 (Ricky), renamed in v194 (browser storage: copied on first load; desktop app folders: a one-time script) (fill the new name only when it is empty; the old data stays): IndexedDB `polyrun` -> `polyrunner`; localStorage `polyrun-*` -> `polyrunner-*`; `window.polyrun` and `polyrun-*` messages -> `polyrunner`; `~/PolyRun` -> `~/PolyRunner`; `~/.config/PolyRun` -> `~/.config/PolyRunner`; package `polyrunner`; app id `com.polyrunner.game`. `pr_char`, `pr_gfx`, `pr_mouse2`, `runnerRig2` and `cometRig` keep their names.

- Browser storage: IndexedDB `polyrunner` (store `kv`, keys `mollyGlb` and `cometGlb`); localStorage `runnerRig2`, `cometRig`, `pr_char`, `pr_gfx`, `pr_mouse2`, `polyrunner-sandboxes`, `polyrunner-pe-presets`, `polyrunner-pe-clip`, `polyrunner-last-export`, `polyrunner-path-editor-v2` (and `-v1`). Until v194 these were `polyrun` / `polyrun-*` (v194 copied them across once; that copy was removed in v195). Never reuse the old names, nor the retired markers `__migrated` and `polyrunner-migrated`.
- Desktop app: the bridge `window.polyrunner` and its `polyrunner-backup`/`polyrunner-restore` messages, the folders `~/PolyRunner` and `~/.config/PolyRunner` (with the update folder `game`), the package name `polyrunner` and the app id `com.polyrunner.game`. Until desktop app 1.2 these were `polyrun` / `PolyRun` / `com.ricky.polyrun`; the app does not migrate them itself (Ricky copied his with a one-time script).
- Saved layouts: a stamp's angle is `rot` (Rotation). Layouts saved before 2026-11-21 hold `heading` on gaps, ledges, platforms, mud and Seg Chains: both loaders (the game's and the Path Editor's) still read it, and the Path Editor writes `rot`. The shipped levels (`src/data/level1.js`, `level2.js`) still say `heading`; they load fine. `heading` also stays as the name for a path's own start angle (`extraPaths`) and for the direction the player faces in the game.
