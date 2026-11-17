# Big Minion: no Placement box; an old layout with trapped:true still loads, and exports without it (pits were removed Nov 17)
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900}); pg.route('**/fonts.*/**', lambda r: r.abort()); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1500)
    base={"version":2,"width":9,"pieces":[{"len":400}],"objects":[{"type":"bigminion","x":10,"z":-50,"trapped":True,"id":1}]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(200)
    pg.evaluate("document.querySelector('#tools [data-tool=\"bigminion\"]').click()"); pg.wait_for_timeout(60)
    print('next panel trap boxes:',pg.locator('#insp [data-ok="trap"]').count())
    cv=pg.locator('#cv').bounding_box(); pg.mouse.click(cv['x']+cv['width']*0.4,cv['y']+cv['height']*0.5); pg.wait_for_timeout(80)
    pg.evaluate("document.querySelector('#tools [data-tool=\"select\"]').click()"); pg.wait_for_timeout(60)
    print('placed panel trap boxes:',pg.locator('#insp [data-ok="trap"]').count())
    o=pg.evaluate("JSON.parse(document.getElementById('json').value).objects"); print([ (x['type'],x.get('trapped')) for x in o]); print('errors',errs)
