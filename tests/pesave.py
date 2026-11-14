import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1200,'height':800}); pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    base={"version":2,"width":9,"pieces":[{"len":300}],"objects":[{"type":"start","id":1,"s":10,"u":0}]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(300)
    print('hint normally:',pg.evaluate("document.getElementById('hint').textContent")[:60])
    pg.evaluate("() => { Storage.prototype.setItem=function(){throw new Error('QuotaExceededError')}; }")
    pg.evaluate("document.querySelector('#tools [data-tool=\"tree\"]').click()"); bx=pg.locator('#cv').bounding_box(); pg.mouse.click(bx['x']+bx['width']/2,bx['y']+bx['height']/2); pg.wait_for_timeout(200)
    print('hint with storage full:',pg.evaluate("document.getElementById('hint').textContent")[:90],'| objects',len(json.loads(pg.evaluate("document.getElementById('json').value"))['objects']),'errs',errs); b.close()
