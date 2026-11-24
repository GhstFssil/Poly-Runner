# Poly Runner (desktop)

A thin Electron shell around the game. The game itself is the `game/` folder.

## One step: build and put it on the Desktop
    bash build-and-install.sh
Builds the AppImage, copies it to `~/PolyRunner`, and puts `PolyRunner.desktop` and `Run Poly Runner.sh` on the Desktop.

## Run it
    npm install
    npm start

## Build a single-file app (AppImage)
    npm install
    npm run dist
The result is `dist/PolyRunner-1.2.0.AppImage`. `chmod +x` it and double-click, or run it from a terminal.
(If it complains about FUSE, run it with `--appimage-extract-and-run`.)

## Updating the game (no reinstall)
1. In the app, choose **Game > Open game folder**. A folder opens (`~/.config/PolyRunner/game`).
2. Paste the new `game` folder's contents over it (replace everything, including `lib` and `fonts`).
3. **Game > Reload**, or restart.

To go back to the version built into the app, use **Game > Use built-in version**, or delete or rename that folder.
Your saved settings (Rig Editor and so on) are kept by the app, not in the game folder, so updating does not touch them.

## Keys
F11 full screen, Ctrl+R reload.

## One copy at a time, and automatic backups (1.1)
- Opening the app a second time just brings the first window forward. (Two copies sharing one storage folder can corrupt it.)
- While you work, the Path Editor's layout and presets are copied to ordinary files in `~/PolyRunner/layouts` (`layout-latest.json`, plus dated snapshots, at most one every ten minutes, the newest 40 kept). **Game > Open backups folder** opens it. If the app's own storage is ever lost, press **Open latest backup** under File in the Path Editor, or **Open from file** and pick one of the dated files. A blank layout never replaces a backup.
