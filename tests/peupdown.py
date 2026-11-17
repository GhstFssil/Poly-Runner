# Pressing up on the first piece (or down on the last) changes nothing, so it must not leave an empty undo step behind.
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
    pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1500)
    base={"version":2,"width":9,"pieces":[{"len":200},{"len":100,"ang":30,"r":190}],"objects":[]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(200)
    cnt=lambda: len(json.loads(pg.evaluate("document.getElementById('json').value"))['pieces'])
    pg.evaluate("document.querySelector('#pieces button[data-act=up][data-i=\"0\"]').click()")
    pg.evaluate("document.querySelector('#pieces button[data-act=down][data-i=\"1\"]').click()")
    pg.evaluate("document.getElementById('undo').click()"); pg.wait_for_timeout(100)
    n=cnt()    # one undo must take back the load (back to the 1-piece default), not an empty step
    ok = n!=2 and not errs
    print('pieces after one undo',n,'errs',errs,'PASS' if ok else 'FAIL'); raise SystemExit(0 if ok else 1)
