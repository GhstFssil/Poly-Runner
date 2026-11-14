import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1200,'height':800}); pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    base={"version":2,"width":9,"pieces":[{"len":300}],"objects":[{"type":"start","id":1,"s":10,"u":0},{"type":"minion","id":2,"s":100,"u":0,"idle":True},{"type":"minion","id":3,"s":150,"u":2},{"type":"bigminion","id":4,"s":200,"u":0,"idle":True}]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(300)
    out=json.loads(pg.evaluate("document.getElementById('json').value"))
    print('exported:',[(o['type'],o.get('idle')) for o in out['objects']],'errs',errs); b.close()
