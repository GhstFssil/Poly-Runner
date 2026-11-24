# The rename migration (v194): saves kept under the old names ('polyrun' IndexedDB, 'polyrun-*' localStorage) are copied to the new ones on first load.
#   python3 fu/rename_saves.py
# 1. a browser with no old saves: nothing breaks, and no old database is created.
# 2. old saves (a model in IndexedDB, layouts, presets, sandboxes) plus one new key already set: the old ones are copied, the new one is not overwritten, the old data stays.
# 3. the same in the standalone Path Editor.
# 4. storage full: a key whose copy does not fit is moved instead, so it still exists once.
import json
from playwright.sync_api import sync_playwright
GAME = 'file:///home/claude/poly-runner/poly-runner.html'
PE = 'file:///home/claude/poly-runner/path-editor.html'
OLD = {'polyrun-sandboxes': json.dumps({'Test Hill': {'json': '{"version":2,"pieces":[{"len":300}],"objects":[]}', 'saved': 1}}),
       'polyrun-pe-presets': '[]', 'polyrun-last-export': '{"version":2}', 'polyrun-pe-clip': '{"a":1}',
       'polyrunner-path-editor-v2': '{"KEEP":1}', 'polyrun-path-editor-v2': '{"OLD":1}'}
SEED = """async (old) => {
  localStorage.clear(); for (const k in old) localStorage.setItem(k, old[k]);
  await new Promise(r => { const d = indexedDB.deleteDatabase('polyrunner'); d.onsuccess = d.onerror = d.onblocked = r; });
  await new Promise((res, rej) => { const r = indexedDB.open('polyrun', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => { const tx = r.result.transaction('kv', 'readwrite'); tx.objectStore('kv').put(new Uint8Array([7, 7, 7]).buffer, 'cometGlb');
      tx.oncomplete = () => { r.result.close(); res(); }; }; r.onerror = rej; });
}"""
READ = """async (name) => {
  const dbs = indexedDB.databases ? (await indexedDB.databases()).map(d => d.name) : [];
  let kv = null;
  if (dbs.includes(name)) kv = await new Promise(res => { const r = indexedDB.open(name); r.onsuccess = () => { const db = r.result;
    if (!db.objectStoreNames.contains('kv')) { db.close(); res({}); return; }
    const out = {}, c = db.transaction('kv').objectStore('kv').openCursor();
    c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value instanceof ArrayBuffer ? cur.value.byteLength : cur.value; cur.continue(); } else { db.close(); res(out); } }; }; });
  const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); }
  return { dbs, kv, ls };
}"""
def wait_db(pg):
    for _ in range(40):
        st = pg.evaluate(READ, 'polyrunner')
        if st['kv'] and st['kv'].get('__migrated'): return st
        pg.wait_for_timeout(250)
    return pg.evaluate(READ, 'polyrunner')
fails = []
def check(c, msg):
    print(('ok   ' if c else 'FAIL ') + msg)
    if not c: fails.append(msg)
with sync_playwright() as p:
    b = p.chromium.launch()
    errs = []
    # 1 and 2: the game
    ctx = b.new_context(); pg = ctx.new_page(); pg.route('**/fonts.*/**', lambda r: r.abort()); pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(GAME); pg.wait_for_timeout(2500)
    st = wait_db(pg)
    check('polyrun' not in st['dbs'], 'no saves: no old database created (%s)' % st['dbs'])
    check(st['ls'].get('polyrunner-migrated') == '1', 'no saves: localStorage marked done')
    pg.evaluate(SEED, OLD); pg.reload(); pg.wait_for_timeout(2500)
    st = wait_db(pg)
    ls = st['ls']
    for k in ['sandboxes', 'pe-presets', 'last-export', 'pe-clip']:
        check(ls.get('polyrunner-' + k) == OLD['polyrun-' + k], 'game: polyrun-%s copied' % k)
        check(ls.get('polyrun-' + k) == OLD['polyrun-' + k], 'game: polyrun-%s left in place' % k)
    check(ls.get('polyrunner-path-editor-v2') == '{"KEEP":1}', 'game: a new key already set is not overwritten')
    check(st['kv'].get('cometGlb') == 3, 'game: saved model copied to the new database (%s)' % st['kv'])
    old = pg.evaluate(READ, 'polyrun')
    check(old['kv'] and old['kv'].get('cometGlb') == 3, 'game: old database left in place')
    # the sandboxes list on the menu reads the new key
    n = pg.evaluate("() => { const a = JSON.parse(localStorage.getItem('polyrunner-sandboxes') || '{}'); return Object.keys(a).length; }")
    check(n == 1, 'game: Saved Sandboxes readable under the new name')
    ctx.close()
    # 3: the standalone Path Editor
    ctx = b.new_context(); pg = ctx.new_page(); pg.route('**/fonts.*/**', lambda r: r.abort()); pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(PE); pg.wait_for_timeout(800)
    pg.evaluate("(old) => { localStorage.clear(); for (const k in old) localStorage.setItem(k, old[k]); }", OLD); pg.reload(); pg.wait_for_timeout(1500)
    ls = pg.evaluate(READ, 'x')['ls']
    check(ls.get('polyrunner-pe-presets') == OLD['polyrun-pe-presets'] and ls.get('polyrunner-migrated') == '1', 'Path Editor: copied and marked')
    ctx.close()
    # 4: storage full: the first copy of the sandboxes fails, so that key is moved
    ctx = b.new_context(); pg = ctx.new_page(); pg.route('**/fonts.*/**', lambda r: r.abort()); pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(PE); pg.wait_for_timeout(800)
    pg.evaluate("(old) => { localStorage.clear(); for (const k in old) localStorage.setItem(k, old[k]); }", OLD)
    pg.add_init_script("""(()=>{const f=Storage.prototype.setItem;let once=false;Storage.prototype.setItem=function(k,v){
      if(k==='polyrunner-sandboxes'&&!once&&this.getItem('polyrun-sandboxes')!==null){once=true;throw new DOMException('full','QuotaExceededError');}return f.call(this,k,v);};})();""")
    pg.reload(); pg.wait_for_timeout(1500)
    ls = pg.evaluate(READ, 'x')['ls']
    check(ls.get('polyrunner-sandboxes') == OLD['polyrun-sandboxes'] and 'polyrun-sandboxes' not in ls, 'storage full: sandboxes moved, not lost')
    check(ls.get('polyrunner-pe-presets') == OLD['polyrun-pe-presets'], 'storage full: the other keys still copied')
    ctx.close(); b.close()
check(not errs, 'no page errors %s' % errs[:3])
print('PASS' if not fails else 'FAIL (%d)' % len(fails))
