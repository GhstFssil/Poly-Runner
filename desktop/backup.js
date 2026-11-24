// Automatic file backups of the Path Editor's layout and presets, kept in an ordinary folder (~/PolyRunner/layouts) that has nothing to do
// with the app's own browser-style storage. Pure file logic (no Electron), so it can be tested on its own.
const fs = require('fs');
const path = require('path');

const KINDS = ['layout', 'presets'];
const KEEP = 40;                       // dated snapshots kept per kind
const SNAP_EVERY_MS = 10 * 60 * 1000;  // at most one new dated snapshot per kind every 10 minutes
const MAX_CHARS = 20 * 1000 * 1000;

function count(kind, text) {           // how much is in it: a layout's objects, or a preset list's entries; -1 if it is not valid
  let j; try { j = JSON.parse(text); } catch (e) { return -1; }
  if (kind === 'layout') return j && Array.isArray(j.objects) && Array.isArray(j.pieces) ? j.objects.length : -1;
  if (Array.isArray(j)) return j.length;
  return j && typeof j === 'object' ? Object.keys(j).length : -1;
}
function stamp(d) { const p = (n, w) => String(n).padStart(w || 2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()); }
function latestPath(dir, kind) { return path.join(dir, kind + '-latest.json'); }
function readLatest(dir, kind) {
  if (!KINDS.includes(kind)) return null;
  try { return fs.readFileSync(latestPath(dir, kind), 'utf8'); } catch (e) { return null; }
}
function writeAtomic(file, text) { const tmp = file + '.tmp'; fs.writeFileSync(tmp, text); fs.renameSync(tmp, file); }

function saveBackup(dir, kind, text, now) {
  if (!KINDS.includes(kind) || typeof text !== 'string' || text.length > MAX_CHARS) return { skipped: 'bad request' };
  const n = count(kind, text);
  if (n <= 0) return { skipped: 'empty or not valid' };           // a blank layout (what a freshly wiped store shows) never replaces a backup
  fs.mkdirSync(dir, { recursive: true });
  const prev = readLatest(dir, kind);
  if (prev === text) return { skipped: 'unchanged' };
  writeAtomic(latestPath(dir, kind), text);
  now = now || new Date();
  const re = new RegExp('^' + kind + '-\\d{4}-\\d{2}-\\d{2}-\\d{6}\\.json$');
  let snaps = fs.readdirSync(dir).filter(f => re.test(f)).sort();
  let newest = 0; if (snaps.length) { const m = /(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})(\d{2})\.json$/.exec(snaps[snaps.length - 1]); if (m) newest = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime(); }   // the newest snapshot's time, from its name
  let snap = false;
  if (!snaps.length || now.getTime() - newest >= SNAP_EVERY_MS) {
    writeAtomic(path.join(dir, kind + '-' + stamp(now) + '.json'), text); snap = true;
    snaps = fs.readdirSync(dir).filter(f => re.test(f)).sort();
    while (snaps.length > KEEP) { try { fs.unlinkSync(path.join(dir, snaps.shift())); } catch (e) { break; } }
  }
  return { saved: true, snapshot: snap };
}
module.exports = { saveBackup, readLatest, count, KINDS };
