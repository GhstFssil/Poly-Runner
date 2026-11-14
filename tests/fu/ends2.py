import json,sys
from playwright.sync_api import sync_playwright
J={"version":2,"width":9,"pieces":[{"len":400}],"objects":[
 {"type":"gap","id":1,"x":30,"z":-20,"heading":0,"bend":0,"length":30,"width":15,"ends":"round"},
 {"type":"gap","id":2,"x":80,"z":-20,"heading":0,"bend":0,"length":30,"width":15,"ends":"square"},
 {"type":"ledge","id":3,"x":-30,"z":-20,"heading":0,"bend":0,"length":30,"thickness":4,"height":5},
 {"type":"mud","id":4,"s":150,"u":0,"length":60,"slowdown":50,"ends":"square"}]}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
    pg.route('**/fonts.*/**', lambda r: r.abort()); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('dialog', lambda d: d.accept())
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1500)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(300)
    out=json.loads(pg.evaluate("document.getElementById('json').value"))
    print('export ends:',[(o['type'],o['id'],o.get('ends')) for o in out['objects']])
    print('w2s visible:',pg.evaluate("typeof w2s"), 'view:',pg.evaluate("typeof view"))
    print('select present:', pg.evaluate("1"))
    print('errors',errs)
    # inspector: select object 3 by clicking its centre, then flip Ends
    print(pg.evaluate("typeof S"))
    b.close()
