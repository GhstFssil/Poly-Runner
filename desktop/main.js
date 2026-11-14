// Poly Runner: a thin desktop shell around the game. The game itself lives in a plain folder ("game") so it can be
// updated by pasting a new folder over the old one: no reinstall needed.
const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const os = require('os');
const { saveBackup, readLatest } = require('./backup');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');   // Ubuntu's setuid sandbox helper is usually not set up for a home-folder install, and this is a local, offline game

app.setPath('userData', path.join(app.getPath('appData'), 'PolyRun'));   // a plain, predictable folder name: ~/.config/PolyRun

// One copy at a time: two copies sharing one storage folder can corrupt it, and the app then throws the storage away (that is how saved layouts were lost once).
// A second launch just brings the first window to the front.
let win;
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });

const backupDir = () => path.join(os.homedir(), 'PolyRun', 'layouts');   // automatic file backups of the Path Editor's layout and presets, outside the app's own storage
ipcMain.handle('polyrun-backup', (e, kind, text) => { try { return saveBackup(backupDir(), kind, text); } catch (err) { return { error: String(err && err.message || err) }; } });
ipcMain.handle('polyrun-restore', (e, kind) => { try { return readLatest(backupDir(), kind); } catch (err) { return null; } });

const bundled = path.join(__dirname, 'game');                       // the copy that ships inside the app
const userGame = () => path.join(app.getPath('userData'), 'game');  // ~/.config/PolyRun/game: if it holds an index.html, it wins

function gameDir() {
  return fs.existsSync(path.join(userGame(), 'index.html')) ? userGame() : bundled;
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

function openGameFolder() {
  const dir = userGame();
  if (!fs.existsSync(path.join(dir, 'index.html'))) copyDir(bundled, dir);   // first time: start from the built-in copy so there is something to replace
  shell.openPath(dir);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, backgroundColor: '#000000', title: 'Poly Runner', autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false, preload: path.join(__dirname, 'preload.js') },
  });
  win.loadFile(path.join(gameDir(), 'index.html'));
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
}

function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Game', submenu: [
      { label: 'Open game folder', click: openGameFolder },
      { label: 'Open backups folder', click: () => { const d = backupDir(); try { fs.mkdirSync(d, { recursive: true }); } catch (e) {} shell.openPath(d); } },
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => win && win.loadFile(path.join(gameDir(), 'index.html')) },
      { label: 'Use built-in version', click: () => {
          const r = dialog.showMessageBoxSync(win, { type: 'question', buttons: ['Cancel', 'Rename update folder'], defaultId: 0, message: 'Rename the update folder so the game falls back to the built-in version?' });
          if (r === 1 && fs.existsSync(userGame())) { fs.renameSync(userGame(), userGame() + '-old-' + Date.now()); win.loadFile(path.join(bundled, 'index.html')); }
        } },
      { type: 'separator' },
      { label: 'Full screen', accelerator: 'F11', click: () => win && win.setFullScreen(!win.isFullScreen()) },
      { role: 'quit' },
    ] },
    { label: 'View', submenu: [{ role: 'toggleDevTools' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
  ]));
}

if (gotLock) app.whenReady().then(() => { buildMenu(); createWindow(); });
app.on('window-all-closed', () => app.quit());
