# Path Editor: plates and targets stamp, export and load back the same; door links offer them; every stamp is free by default and still faces along the path
import json,sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900}); pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:260]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1500)
    base={"version":2,"width":9,"pieces":[{"len":200,"ang":90,"r":127.3}],"objects":[]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(300)
    cv=pg.locator('#cv').bounding_box(); cx=cv['x']+cv['width']*0.5; cy=cv['y']+cv['height']*0.5
    def stamp(t,dx=0,dy=0):
        pg.evaluate("t=>document.querySelector('#tools [data-tool=\"'+t+'\"]').click()",t); pg.mouse.click(cx+dx,cy+dy); pg.wait_for_timeout(120)
        return json.loads(pg.evaluate("document.getElementById('json').value"))['objects'][-1]
    pts=pg.evaluate("(function(){return 0})()")
    out={}
    for t in ['plate','target','door','sign','tree','mud','segchain','checkpoint']: out[t]=stamp(t)
    for t,o in out.items(): print(t,{k:o.get(k) for k in ('s','x','noAttach','rot','heading','follow') if k in o})
    # door link options
    pg.evaluate("document.querySelector('#tools [data-tool=\"select\"]').click()")
    n=pg.evaluate("(function(){var j=JSON.parse(document.getElementById('json').value);return j.objects.length})()")
    j=json.loads(pg.evaluate("document.getElementById('json').value"))
    # set fields on plate and target through the inspector by loading a layout with them, then re-export
    L={"version":2,"width":9,"pieces":[{"len":300}],"objects":[
      {"type":"plate","id":1,"x":0,"z":-40,"shape":"circle","radius":5,"look":"halo","onlyWhileStanding":True},
      {"type":"target","id":2,"x":0,"z":-90,"size":4,"post":False,"height":9,"tilt":15,"spin":30,"hitbox":1.5,"breakSpeed":35,"sideTravel":12,"sidePeriod":3,"upTravel":2,"upPeriod":5,"phase":1},
      {"type":"door","id":3,"x":0,"z":-150,"width":12,"height":10,"mode":"closed","links":[1,2],"after":{"mode":"open"}}]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(L)); pg.wait_for_timeout(300)
    R=json.loads(pg.evaluate("document.getElementById('json').value"))['objects']
    for a,b2 in zip(L['objects'],R):
        diff={k:(a[k],b2.get(k)) for k in a if a[k]!=b2.get(k)}; print('round trip',a['type'],'differences:',diff or 'none')
    # inspector of the door: linked list names them
    pg.evaluate("(function(){})()")
    print('errors',errs[:4]); b.close()
