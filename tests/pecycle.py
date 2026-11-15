# Importing a layout whose joined pieces (after:) form a loop must not hang or throw.
import json
from playwright.sync_api import sync_playwright
def lay(objs): return {"version":2,"width":9,"pieces":[{"len":200}],"objects":objs}
CASES={
 'cave2':[{"type":"cave","id":1,"x":0,"z":-50,"after":2},{"type":"cave","id":2,"x":0,"z":-80,"after":1}],
 'ledge2':[{"type":"ledge","id":1,"x":0,"z":-50,"after":2,"length":40},{"type":"ledge","id":2,"x":0,"z":-80,"after":1,"length":40}],
 'cave3':[{"type":"cave","id":1,"x":0,"z":-50,"after":3},{"type":"cave","id":2,"after":1},{"type":"cave","id":3,"after":2}],
}
bad=[]
with sync_playwright() as p:
    b=p.chromium.launch(); 
    for name,objs in CASES.items():
        pg=b.new_page(viewport={'width':1400,'height':900}); pg.route('**/fonts.*/**',lambda r:r.abort())
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200])); pg.on('dialog',lambda d:d.accept())
        pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1000)
        pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(lay(objs))); pg.wait_for_timeout(400)
        print(name,pg.evaluate("document.getElementById('msg').textContent"),len(json.loads(pg.evaluate("document.getElementById('json').value")).get('objects',[])))
        if errs: bad.append((name,errs[:2]))
        pg.close()
print('BAD' if bad else 'OK',bad)
