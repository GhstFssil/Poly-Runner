// The only things the game page may ask of the app: keep a backup file, and read the latest one back. The page cannot choose a file name or folder.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('polyrun', {
  desktop: true,
  backup: (kind, text) => ipcRenderer.invoke('polyrun-backup', String(kind), String(text)),
  restore: (kind) => ipcRenderer.invoke('polyrun-restore', String(kind)),
});
