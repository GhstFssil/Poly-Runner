import json
from playwright.sync_api import sync_playwright
J={"version":2,"width":9,"pieces":[{"len":300}],"objects":[
 {"type":"door","id":9,"s":40,"u":0,"width":12,"height":10,"mode":"closed","links":[5],"after":{"mode":"cycle","speed":3,"openTiltX":80,"sink":False},"shutTiltX":45,"openTiltX":45,"slide":"edge"},
 {"type":"door","id":10,"s":90,"u":0,"width":12,"height":10,"sink":False},
 {"type":"minion","id":5,"x":20,"z":-120,"idle":True}]}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200])); pg.route('**/fonts.*/**',lambda r:r.abort())
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('#tools [data-tool=\"select\"]').click()"); pg.keyboard.press('Control+a'); pg.wait_for_timeout(200); pg.keyboard.press('Control+c'); pg.keyboard.press('Control+v'); pg.wait_for_timeout(300); pg.keyboard.press('Control+z'); pg.wait_for_timeout(300)
    out=json.loads(pg.evaluate("document.getElementById('json').value"))
    for o in out['objects']:
        if o['type']=='door': print({k:o.get(k) for k in ['id','mode','links','after','slide','sink','shutTiltX','openTiltX','open','closed']})
    print('errors',errs); b.close()
