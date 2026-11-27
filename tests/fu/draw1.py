# Path Editor Draw: with Draw on and Ledge (or Seg Chain, Gap, Mud) chosen, a drag becomes a chain of joined pieces that follows the stroke; off, a drag still pans; a short stroke makes nothing; undo takes the whole chain back
import json,math
from playwright.sync_api import sync_playwright
ok=True
def chk(n,c):
    global ok; ok=ok and bool(c); print(('PASS ' if c else 'FAIL ')+n)
def shape(objs):
    by={o['id']:o for o in objs}; memo={}
    def base(o):
        if 'after' in o:
            e=end(by[o['after']]); return (e[0],e[1],e[2]+math.radians(o.get('turn',0)))
        return (o['x'],o['z'],math.radians(o['rot']))
    def at(o,d):
        x,z,h=base(o); B=math.radians(o.get('bend',0)); L=max(1,o['length']); d=min(L,d)
        if abs(B)<1e-4: return (x+math.sin(h)*d,z-math.cos(h)*d,h)
        R=L/B; t=h+B*d/L; return (x+math.cos(h)*R-math.cos(t)*R,z+math.sin(h)*R-math.sin(t)*R,t)
    def end(o): return at(o,o['length'])
    return at
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1300,'height':850}); pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    base={"version":2,"width":9,"pieces":[{"len":300}],"objects":[{"type":"start","id":1,"s":10,"u":0}]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(300)
    J=lambda: json.loads(pg.evaluate("document.getElementById('json').value"))['objects']
    bx=pg.locator('#cv').bounding_box(); cx=bx['x']+bx['width']/2; cy=bx['y']+bx['height']/2
    def world(sx,sy):
        pg.mouse.move(sx,sy); t=pg.evaluate("document.getElementById('coord').textContent").split()
        return float(t[1]),float(t[3])
    pg.evaluate("document.querySelector('#tools [data-tool=\"ledge\"]').click()")
    def stroke(pts):
        pg.mouse.move(*pts[0]); pg.mouse.down()
        for q in pts[1:]: pg.mouse.move(*q)
        pg.mouse.up(); pg.wait_for_timeout(200)
    S=[(cx-250+i*5, cy+120*math.sin(i/14)) for i in range(101)]   # an S-curve across the map
    n0=len(J()); vc=pg.evaluate("document.getElementById('coord').textContent")
    stroke(S); chk('Draw off: a drag pans, no stamps (%d)'%len(J()), len(J())==n0)
    pg.check('#drawOn'); n0=len(J())
    (ax,az),(bx2,bz2)=world(cx-200,cy-150),world(cx+200,cy+150); kx=(bx2-ax)/400; kz=(bz2-az)/300   # after the pan
    print('zoom %.2f px/unit'%(1/kx))
    stroke(S); o=J(); new=[x for x in o if x['type']=='ledge']
    chk('Draw on: a chain of %d joined ledges'%len(new), len(new)>=2 and all('after' in x for x in new[1:]) and 'after' not in new[0])
    chk('each piece joins the one before', all(new[i]['after']==new[i-1]['id'] for i in range(1,len(new))))
    at=shape(o); dense=[at(x,x['length']*t/40) for x in new for t in range(41)]
    W=[(ax+(sx-(cx-200))*kx, az+(sy-(cy-150))*kz) for sx,sy in S]
    dev=max(min(math.hypot(q[0]-d[0],q[1]-d[1]) for d in dense) for q in W)
    st=at(new[0],0); en=at(new[-1],new[-1]['length'])
    chk('the chain follows the stroke (worst miss %.2f units, %.1f px; lengths %s)'%(dev,dev/kx,[x['length'] for x in new]), dev/kx<8)
    chk('it starts and ends where the stroke does (%.1f, %.1f)'%(math.hypot(st[0]-W[0][0],st[1]-W[0][1]),math.hypot(en[0]-W[-1][0],en[1]-W[-1][1])), math.hypot(st[0]-W[0][0],st[1]-W[0][1])/kx<2 and math.hypot(en[0]-W[-1][0],en[1]-W[-1][1])/kx<8)
    chk('kept the next-stamp width and height (%s, %s)'%(new[0].get('thickness'),new[0].get('height')), all(x.get('thickness')==new[0].get('thickness') for x in new))
    pg.keyboard.press('Control+z'); pg.wait_for_timeout(200)
    chk('one undo takes the whole chain back', len([x for x in J() if x['type']=='ledge'])==0)
    n0=len(J()); stroke([(cx,cy),(cx+3,cy+3),(cx+6,cy+3)])
    chk('a tiny stroke makes at most one piece', len(J())-n0<=1)
    pg.evaluate("document.querySelector('#tools [data-tool=\"segchain\"]').click()")
    C=[(cx-150+120*math.cos(a/20*math.pi), cy+120*math.sin(a/20*math.pi)) for a in range(0,31)]   # three quarters of a circle
    n0=len(J()); stroke(C); sc=[x for x in J() if x['type']=='segchain']
    chk('Seg Chain draws too (%d pieces)'%len(sc), len(sc)>=2)
    V=[(cx+200+i*4, cy-100+abs(i-20)*8) for i in range(41)]   # a sharp V
    pg.evaluate("document.querySelector('#tools [data-tool=\"gap\"]').click()"); stroke(V)
    gp=[x for x in J() if x['type']=='gap']; at=shape(J())
    chk('a sharp corner turns at a joint (turns %s)'%[x.get('turn') for x in gp[1:]], any(abs(x.get('turn',0))>35 for x in gp[1:]))
    chk('no page errors %s'%errs, not errs)
    b.close()
print('ALL PASS' if ok else 'SOME FAILED')
