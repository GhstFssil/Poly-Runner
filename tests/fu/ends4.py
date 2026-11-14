import json
from playwright.sync_api import sync_playwright
exec(open('/home/claude/poly-runner/tests/fu/ends2.py').read().split('with sync_playwright')[0])
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
    pg.route('**/fonts.*/**', lambda r: r.abort()); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('dialog', lambda d: d.accept())
    pg.goto('file:///home/claude/poly-runner/tests/pe_test.html'); pg.wait_for_timeout(1500)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(300)
    pg.evaluate("()=>{var v=window.__v().view; v.cx=55; v.cz=-35; v.zoom=8;}"); pg.evaluate("()=>window.dispatchEvent(new Event('resize'))"); pg.wait_for_timeout(300)
    cv=pg.locator('#cv').bounding_box(); v=pg.evaluate("()=>{var v=window.__v();return [v.view.cx,v.view.cz,v.view.zoom,v.W,v.dpr]}")
    sx=cv['x']+((80-v[0])*v[2]+v[3]/2/v[4]); sy=cv['y']+((-35-v[1])*v[2]+pg.evaluate("window.__v().H")/2/v[4])
    pg.mouse.click(sx,sy); pg.wait_for_timeout(300)
    print('selects:',pg.evaluate("[...document.querySelectorAll('select[data-ok=ends]')].map(e=>e.value)"))
    pg.select_option('select[data-ok=ends]','round'); pg.wait_for_timeout(300)
    out=json.loads(pg.evaluate("document.getElementById('json').value"))
    print('after flipping object 2 to round:',[(o['id'],o.get('ends')) for o in out['objects']])
    print('errors',errs); b.close()
