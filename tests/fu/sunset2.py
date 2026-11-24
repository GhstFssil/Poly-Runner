# Sunset Hill in the path editor: the ground is read over the whole hill (x -9,000..9,000, z -18,000..0), not just round a short layout.
#   python3 fu/sunset2.py
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1400, 'height': 900})
    pg.route('**/fonts.*/**', lambda r: r.abort())
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.add_init_script("""window.__ext=[1e18,-1e18,1e18,-1e18];window.HOST={__terrain:function(kind,x0,z0,nx,nz,cell){var e=window.__ext;
      e[0]=Math.min(e[0],x0);e[1]=Math.max(e[1],x0+nx*cell);e[2]=Math.min(e[2],z0);e[3]=Math.max(e[3],z0+nz*cell);
      return {h:new Float32Array(nx*nz),k:new Uint8Array(nx*nz)};}};""")
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1500)
    J = {"version": 2, "width": 9, "terrain": "sunset", "pieces": [{"len": 200}], "objects": []}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}", json.dumps(J)); pg.wait_for_timeout(4000)
    e = pg.evaluate("window.__ext")
    b.close()
    print('ground read over x %.0f..%.0f, z %.0f..%.0f' % tuple(e))
    ok = e[0] <= -9000 and e[1] >= 9000 and e[2] <= -18000 and e[3] >= 0 and not errs
    print('errors', errs[:3]); print('PASS' if ok else 'FAIL')
