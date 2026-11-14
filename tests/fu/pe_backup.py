# the desktop hooks: a fake window.polyrun records backups and serves a restore
import json,sys
from playwright.sync_api import sync_playwright
J={"version":2,"width":9,"pieces":[{"len":300}],"objects":[{"type":"tree","id":1,"x":10,"z":-20},{"type":"gap","id":2,"x":30,"z":-40,"heading":0,"bend":0,"length":30,"width":15,"ends":"square"}]}
FAKE="""window.__calls=[];window.__latest=%s;window.polyrun={desktop:true,backup:function(k,t){window.__calls.push([k,t.length]);return Promise.resolve({saved:true})},restore:function(k){return Promise.resolve(k==='layout'?window.__latest:null)}};"""
with sync_playwright() as p:
    b=p.chromium.launch(); 
    # standalone, with the fake bridge
    pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200])); pg.route('**/fonts.*/**',lambda r:r.abort())
    pg.add_init_script(FAKE%json.dumps(json.dumps(J)))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1000)
    print('restore button visible with the bridge:',pg.evaluate("!document.getElementById('restoreBk').hidden"))
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(200)
    pg.evaluate("document.getElementById('reset').click()"); pg.wait_for_timeout(200)
    pg.evaluate("document.getElementById('restoreBk').click()"); pg.wait_for_timeout(500)
    v=json.loads(pg.evaluate("document.getElementById('json').value")); print('after Open latest backup: objects',len(v['objects']),'| msg:',pg.evaluate("document.getElementById('msg').textContent"))
    print('backups sent so far (should be none yet, first fires after 20 s):',pg.evaluate("window.__calls.length"))
    pg.wait_for_timeout(21000); print('after 21 s of idle with changes:',pg.evaluate("window.__calls"))
    # no bridge (a plain browser): the button stays hidden and nothing breaks
    q=b.new_page(); q.on('pageerror',lambda e:errs.append(str(e)[:200])); q.route('**/fonts.*/**',lambda r:r.abort()); q.goto('file:///home/claude/poly-runner/path-editor.html'); q.wait_for_timeout(800)
    q.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); q.wait_for_timeout(300)
    print('plain browser: button hidden',q.evaluate("document.getElementById('restoreBk').hidden"),'| errors',errs)
    b.close()
