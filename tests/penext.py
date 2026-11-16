# next-stamp panel: does a value typed before placing end up on the placed stamp?
import json,sys
from playwright.sync_api import sync_playwright
kinds=sys.argv[1:] or ['ledge','gap','platform','mud','segchain','tree','hill']
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
    pg.route('**/fonts.*/**', lambda r: r.abort()); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1500)
    base={"version":2,"width":9,"pieces":[{"len":400}],"objects":[]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(200)
    cv=pg.locator('#cv').bounding_box(); n=0
    for t in kinds:
        pg.evaluate("t=>document.querySelector('#tools [data-tool=\"'+t+'\"]').click()",t); pg.wait_for_timeout(100)
        keys=pg.evaluate("[...document.querySelectorAll('#insp [data-ok]')].map(e=>e.dataset.ok)")
        sets={}
        for k in keys:
            if k in ('noat','hm','follow','after','layer','move','shape','ends','tox','big'): continue
            sets[k]=(k,'')
        got={}
        for k in list(sets):
            el=pg.locator('#insp [data-ok="%s"]'%k).first
            if el.evaluate('e=>e.tagName')!='INPUT': got.pop(k,None); continue
            v=el.input_value(); nv=str(round(float(v)+3,2)) if v not in ('',None) else '5'
            el.fill(nv); el.press('Tab'); pg.wait_for_timeout(40); got[k]=float(nv)
        x=cv['x']+cv['width']*0.5+n*40-80; y=cv['y']+cv['height']*0.5; n+=1
        pg.mouse.click(x,y); pg.wait_for_timeout(100)
        o=pg.evaluate("(()=>{var a=JSON.parse(document.getElementById('json').value).objects;return a[a.length-1]})()")
        print(t,'typed',got); print('   placed',{k:v for k,v in o.items() if k not in ('id','layer')})
    bad=[]
    for t in ('tree','hill'):
        pg.evaluate("t=>document.querySelector('#tools [data-tool=\"'+t+'\"]').click()",t); pg.wait_for_timeout(60)
        el=pg.locator('#insp [data-ok="rot"]'); 
        if el.count()!=1: bad.append((t,'no Rotation box in the next-stamp panel'))
    pg.evaluate("t=>document.querySelector('#tools [data-tool=\"'+t+'\"]').click()",'mud'); pg.wait_for_timeout(60)
    if pg.locator('#insp [data-ok="th"]').count(): bad.append(('mud','dead Heading box in the next-stamp panel'))
    print('PROBLEMS:',bad or 'none'); print('errors',errs[:3])
