# Path Editor Draw Path and Stretch: a stroke from a path's end extends it, one elsewhere starts a new path, and both follow the stroke; Stretch handles move a path joint (the piece before it reshapes, the rest follows) and a strip's ends; one undo per drag
import json,math
from playwright.sync_api import sync_playwright
ok=True
def chk(n,c):
    global ok; ok=ok and bool(c); print(('PASS ' if c else 'FAIL ')+n)
def pts_of(pcs, x, z, h):
    out=[(x,z)]
    for p in pcs:
        if 'sh' in p and p is not pcs[0]: h=math.radians(p['sh'])
        L=p['len']; B=math.radians(p.get('ang',0)); n=max(1,int(L/2))
        for i in range(1,n+1):
            d=L*i/n
            if abs(B)<1e-6: q=(x+math.sin(h)*d,z-math.cos(h)*d)
            else: R=L/B; t=h+B*d/L; q=(x+math.cos(h)*R-math.cos(t)*R,z+math.sin(h)*R-math.sin(t)*R)
            out.append(q)
        x,z=out[-1]; h=h+B
    return out
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1300,'height':850}); pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    base={"version":2,"width":9,"pieces":[{"len":150}],"objects":[{"type":"start","id":1,"s":10,"u":0},{"type":"ledge","id":2,"x":120,"z":-60,"rot":0,"bend":0,"length":40,"thickness":4,"height":5}]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(300)
    JJ=lambda: json.loads(pg.evaluate("document.getElementById('json').value"))
    bx=pg.locator('#cv').bounding_box(); cx=bx['x']+bx['width']/2; cy=bx['y']+bx['height']/2
    def world(sx,sy):
        pg.mouse.move(sx,sy); t=pg.evaluate("document.getElementById('coord').textContent").split(); return float(t[1]),float(t[3])
    (ax,az),(bx2,bz2)=world(cx-200,cy-150),world(cx+200,cy+150); kx=(bx2-ax)/400; kz=(bz2-az)/300
    scr=lambda x,z: (cx-200+(x-ax)/kx, cy-150+(z-az)/kz)
    wl=lambda sx,sy: (ax+(sx-(cx-200))*kx, az+(sy-(cy-150))*kz)
    def stroke(P):
        pg.mouse.move(*P[0]); pg.mouse.down()
        for q in P[1:]: pg.mouse.move(*q)
        pg.mouse.up(); pg.wait_for_timeout(250)
    tool=lambda t: pg.evaluate("t=>document.querySelector('#tools [data-tool=\"'+t+'\"]').click()",t)
    j0=JJ()
    tool('pathdraw')
    e0=scr(0,-150); P=[(e0[0]+i*4, e0[1]-60*math.sin(i/25)-i*1.5) for i in range(1,61)]
    P=[(e0[0]+3,e0[1]-3)]+P
    stroke(P); j=JJ(); pc=j['pieces']
    chk('a stroke from the main path\'s end extends it (%d -> %d pieces)'%(1,len(pc)), len(pc)>=2 and not j.get('paths'))
    path=pts_of(pc,0,0,0); W=[wl(*q) for q in P]
    dev=max(min(math.hypot(q[0]-d[0],q[1]-d[1]) for d in path) for q in W[3:])
    chk('the new pieces follow the stroke (worst miss %.1f px)'%(dev/kx), dev/kx<8)
    tool('pathdraw'); Q=[(cx-300+i*4, cy+200-i*2) for i in range(40)]
    stroke(Q); j=JJ(); mp=j.get('extraPaths') or []
    chk('a stroke elsewhere starts a new path (%d extra)'%len(mp), len(mp)==1 and len(mp[0]['pieces'])>=1)
    pg.click('#cv',position={'x':5,'y':5}); tool('pathdraw'); n=len(JJ()['pieces']); pg.mouse.click(cx,cy); pg.wait_for_timeout(150)
    chk('a click with Draw Path makes nothing', len(JJ()['pieces'])==n and len(JJ().get('extraPaths') or [])==1)
    pg.keyboard.press('Control+z'); pg.wait_for_timeout(200)
    chk('undo takes the new path back', not (JJ().get('extraPaths') or []))
    # Stretch a joint: the main path's first piece end
    tool('stretch'); pc=JJ()['pieces']; e1=scr(*pts_of(pc[:1],0,0,0)[-1]); tgt=(e1[0]+60,e1[1]+20)
    stroke([e1,(e1[0]+20,e1[1]+8),(e1[0]+40,e1[1]+14),tgt]); pc2=JJ()['pieces']
    ne=pts_of(pc2[:1],0,0,0)[-1]; tw=wl(*tgt)
    chk('Stretch moves the joint to the pointer (%.1f px off; first piece len %s ang %s)'%(math.hypot(ne[0]-tw[0],ne[1]-tw[1])/kx,pc2[0]['len'],pc2[0].get('ang')), math.hypot(ne[0]-tw[0],ne[1]-tw[1])/kx<2)
    chk('the rest of the path keeps its pieces', [q['len'] for q in pc2[1:]]==[q['len'] for q in pc[1:]])
    pg.keyboard.press('Control+z'); pg.wait_for_timeout(200)
    chk('one undo per stretch', JJ()['pieces'][0]['len']==pc[0]['len'])
    # Stretch a ledge's end: select it, drag its end handle
    l=[o for o in JJ()['objects'] if o['type']=='ledge'][0]; mid=scr(120,-80); pg.mouse.click(*mid); pg.wait_for_timeout(150)
    en=scr(120,-100); t2=(en[0]+50,en[1]-30); stroke([en,(en[0]+20,en[1]-10),t2]); l2=[o for o in JJ()['objects'] if o['type']=='ledge'][0]
    end=pts_of([{'len':l2['length'],'ang':l2['bend']}],l2['x'],l2['z'],math.radians(l2['rot']))[-1]; tw=wl(*t2)
    chk('Stretch moves a ledge\'s end (len %s bend %s, %.1f px off), start kept'%(l2['length'],l2['bend'],math.hypot(end[0]-tw[0],end[1]-tw[1])/kx), math.hypot(end[0]-tw[0],end[1]-tw[1])/kx<2 and (l2['x'],l2['z'])==(120,-60))
    st=scr(120,-60); t3=(st[0]-30,st[1]+10); stroke([st,(st[0]-15,st[1]+5),t3]); l3=[o for o in JJ()['objects'] if o['type']=='ledge'][0]
    e3=pts_of([{'len':l3['length'],'ang':l3['bend']}],l3['x'],l3['z'],math.radians(l3['rot']))[-1]
    chk('Stretch moves its start and keeps its end (%.1f px)'%(math.hypot(e3[0]-end[0],e3[1]-end[1])/kx), math.hypot(e3[0]-end[0],e3[1]-end[1])/kx<2 and abs(l3['x']-wl(*t3)[0])<2)
    tool('pathdraw'); e2=scr(*pts_of(JJ()['pieces'],0,0,0)[-1]); V=[(e2[0]+2,e2[1]-2)]+[(e2[0]+i*4, e2[1]-160+abs(i-20)*8) for i in range(41)]
    stroke(V); pc=JJ()['pieces']; vp=pts_of(pc,0,0,0); WV=[wl(*q) for q in V]
    dv=max(min(math.hypot(q[0]-d[0],q[1]-d[1]) for d in vp) for q in WV[6:])
    chk('a sharp corner starts the next piece on its own heading (sh %s), path still follows (%.1f px)'%([q.get('sh') for q in pc if 'sh' in q],dv/kx), any('sh' in q for q in pc[1:]) and dv/kx<8)
    chk('no page errors %s'%errs, not errs)
    b.close()
print('ALL PASS' if ok else 'SOME FAILED')
