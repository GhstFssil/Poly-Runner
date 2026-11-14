import json,sys,math
sys.path.insert(0,'/home/claude/poly-runner/tests/fu')
from playwright.sync_api import sync_playwright
exec(open('/home/claude/poly-runner/tests/fu/ends2.py').read().split('with sync_playwright')[0])
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
    pg.route('**/fonts.*/**', lambda r: r.abort()); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('dialog', lambda d: d.accept())
    pg.goto('file:///home/claude/poly-runner/tests/pe_test.html'); pg.wait_for_timeout(1500)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(300)
    # zoom in on the area so 1 unit = 8 px, centred on (30,-20)
    pg.evaluate("""()=>{var v=window.__v().view; v.cx=55; v.cz=-35; v.zoom=8;}""")
    pg.keyboard.press('Escape'); pg.mouse.move(5,5); pg.wait_for_timeout(300)
    # force a redraw
    pg.evaluate("()=>window.dispatchEvent(new Event('resize'))"); pg.wait_for_timeout(400)
    info=pg.evaluate("()=>{var v=window.__v(); return {cx:v.view.cx,cz:v.view.cz,z:v.view.zoom,W:v.W,H:v.H,dpr:v.dpr}}"); print(info)
    def px(wx,wz):
        return pg.evaluate("""([wx,wz])=>{var v=window.__v(),c=document.getElementById('cv'),x=((wx-v.view.cx)*v.view.zoom+v.W/2/v.dpr)*v.dpr,y=((wz-v.view.cz)*v.view.zoom+v.H/2/v.dpr)*v.dpr;var d=c.getContext('2d').getImageData(Math.round(x),Math.round(y),1,1).data;return [d[0],d[1],d[2]]}""",[wx,wz])
    bg=px(60,-70); print('background',bg)
    def covered(wx,wz): return px(wx,wz)!=bg
    # gap 1 round: centreline x=30, z -20..-50, half 9. Beyond the start (z=-20): round cap reaches z=-20+9 at the axis, a corner point (38,-18) is outside the circle (dist 8.2? choose (37.5,-14))
    t=[('round gap: inside cap (30,-13)',covered(30,-13),True),
       ('round gap: cap corner (38,-12.5) outside the disc',covered(38,-12.5),False),
       ('round gap: beyond cap (30,-10)',covered(30,-10),False),
       ('round gap: side margin (38,-35)',covered(38,-35),True),
       ('round gap: past side margin (40,-35)',covered(40,-35),False),
       ('square gap 80: end margin (80,-19)',covered(80,-19),True),
       ('square gap: corner (88,-19)',covered(88,-19),True),
       ('square gap: past end (80,-16.5)',covered(80,-16.5),False)]
    for n,got,want in t: print('OK ' if got==want else 'BAD',n,got)
    print('errors',errs); b.close()
