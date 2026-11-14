# Path Editor: free mud and toxic surfaces round-trip; mud stamped away from the path is free
import json
from playwright.sync_api import sync_playwright
J={"version":2,"width":9,"pieces":[{"len":400}],"objects":[
 {"type":"mud","id":1,"x":60,"z":-50,"heading":30,"bend":20,"length":40,"width":20,"slowdown":40,"ends":"square"},
 {"type":"mud","id":2,"s":200,"u":0,"length":40,"slowdown":50},
 {"type":"ledge","id":3,"x":-60,"z":-50,"heading":0,"bend":0,"length":30,"thickness":10,"height":5,"toxic":True},
 {"type":"platform","id":4,"x":120,"z":-150,"heading":0,"bend":0,"length":30,"width":12,"height":10,"thick":2,"toxic":True,"move":"none"}]}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200])); pg.route('**/fonts.*/**',lambda r:r.abort())
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(300)
    out=json.loads(pg.evaluate("document.getElementById('json').value"))
    for o in out['objects']: print({k:o.get(k) for k in ['type','id','s','x','z','heading','bend','length','width','slowdown','ends','toxic']})
    # stamp mud far from the path
    pg.evaluate("document.querySelector('#tools [data-tool=\"mud\"]').click()"); cv=pg.locator('#cv').bounding_box()
    pg.mouse.click(cv['x']+60,cv['y']+60); pg.wait_for_timeout(300)
    o=json.loads(pg.evaluate("document.getElementById('json').value"))['objects'][-1]
    print('stamped away from the path:',o['type'],'free' if 's' not in o else 'on the path',o.get('width'))
    pg.evaluate("document.querySelector('#tools [data-tool=\"select\"]').click()"); pg.mouse.click(cv['x']+60,cv['y']+60); pg.wait_for_timeout(300)
    print('inspector fields:',pg.evaluate("[...document.querySelectorAll('#insp [data-ok]')].map(e=>e.dataset.ok).join(',')"))
    print('errors',errs); b.close()
