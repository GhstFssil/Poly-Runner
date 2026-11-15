# the editor's Y field: shows the game's height, takes a typed Y, puts it back on the ground
import json
from playwright.sync_api import sync_playwright
s=open('/home/claude/poly-runner/path-editor.html').read()
s=s.replace("  function w2s(x, z) {","  window.__S = function () { return S; }; window.__sel = function (i) { setSelList([S.objs[i]]); renderInsp(); draw(); };\n  function w2s(x, z) {",1)
open('/tmp/polyrun-work/pe_y.html','w').write(s)
J={'version':2,'width':9,'pieces':[{'len':400}],'objects':[{'type':'tree','id':2,'x':60,'z':-80},{'type':'seg','id':5,'x':0,'z':-50,'yAbs':4},{'type':'gap','id':8,'s':150,'u':0,'length':10,'width':12}]}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200])); pg.route('**/fonts.*/**',lambda r:r.abort())
    pg.add_init_script("window.HOST={__yInfo:function(j,ids){var ys={};ids.forEach(function(i){ys[i]=12.5});return {y0:0,ys:ys}}};")
    pg.goto('file:///tmp/polyrun-work/pe_y.html'); pg.wait_for_timeout(1200)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(300)
    Y=lambda: pg.evaluate("(function(){var i=document.querySelector('#insp input[data-ok=ya]');return i?[i.value,i.disabled,document.querySelector('#insp input[data-ok=ya]').closest('label').textContent.slice(0,60)]:null})()")
    pg.evaluate("__sel(0)"); pg.wait_for_timeout(300); print('tree, on the ground:',Y())
    pg.fill('#insp input[data-ok=ya]','21.5'); pg.press('#insp input[data-ok=ya]','Tab'); pg.wait_for_timeout(300)
    out=json.loads(pg.evaluate("document.getElementById('json').value")); print('after typing 21.5: export',[(o['id'],o.get('yAbs')) for o in out['objects']],'| field',Y())
    pg.click('#insp button[data-oact=ground]'); pg.wait_for_timeout(300)
    out=json.loads(pg.evaluate("document.getElementById('json').value")); print('after Back on the ground:',[(o['id'],o.get('yAbs')) for o in out['objects']],'| field',Y())
    pg.evaluate("__sel(1)"); pg.wait_for_timeout(300); print('seg with a Y:',Y())
    pg.evaluate("__sel(2)"); pg.wait_for_timeout(300); print('gap:',Y())
    print('errors',errs); b.close()
