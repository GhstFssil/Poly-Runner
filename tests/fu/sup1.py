# Supersede (Height With Others on a Hill or Crags): everything under its footprint is flat at its bottom, the stamp stands on that, easing back over a short slope; ledges are cut too. Path Editor round trip
import sys,json,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
ok=True
def chk(n,c):
    global ok; ok=ok and bool(c); print(('PASS ' if c else 'FAIL ')+n)
def sm(t): t=max(0,min(1,t)); return t*t*(3-2*t)
def lay(mode, crag=None):
    S={'type':'hill','id':2,'x':80,'z':-240,'radius':30,'height':10}
    if mode: S['heightMode']=mode
    objs=[{'type':'start','id':9,'s':5,'u':0},
     {'type':'hill','id':1,'x':80,'z':-215,'radius':40,'height':20},
     S,
     {'type':'ledge','id':3,'x':140,'z':-240,'heading':-90,'bend':0,'length':120,'thickness':6,'height':5,'ends':'square'}]
    if crag: objs.append(crag)
    return {'version':2,'width':9,'pieces':[{'len':600}],'objects':objs}
g=Rig(draw=False); X=None
def heights(j,pts):
    global X
    g.ev("j=>__sbStart(j)",j); g.pg.wait_for_timeout(300)
    X=g.ev("__L3X()")
    return g.ev("p=>p.map(q=>[__l3m(q[0],q[1]),__gH(q[0],q[1])])",[[X+a,b] for a,b in pts])
# reference: the bottom is the ground at its centre without it = the other hill there (25 from its centre)
bot=20*(1-sm(25/40))
pts=[(80,-240),(80,-225),(80,-255),(100,-240),(60,-240),(80,-205),(80,-280)]
h=heights(lay('supersede'),pts)
for (a,b),(y,gy) in zip(pts,h):
    d=math.hypot(a-80,b+240)
    if d<30:
        want=bot+10*(1-sm(d/30))
        chk('inside at (%d,%d): %.3f == %.3f, ledge cut (%.3f)'%(a,b,y,want,gy-y), abs(y-want)<0.02 and abs(gy-y)<0.02)
plain=heights(lay(None),pts)
print('plain (ground, with ledges):',[(round(a,2),round(b,2)) for a,b in plain])
chk('without Supersede the other hill shows through (%.2f vs %.2f at (80,-225))'%(plain[1][0],h[1][0]), plain[1][0]-h[1][0]>5)
lg=heights(lay(None),[(100,-240),(130,-240)]); ls=heights(lay('supersede'),[(130,-240)])
chk('the ledge stands outside the footprint either way (%.2f, %.2f) and inside without it (%.2f)'%(lg[1][1]-lg[1][0],ls[0][1]-ls[0][0],lg[0][1]-lg[0][0]), abs(lg[1][1]-lg[1][0]-5)<0.01 and abs(ls[0][1]-ls[0][0]-5)<0.01 and lg[0][1]-lg[0][0]>4.9)
far=heights(lay('supersede'),[(80,-195),(150,-240)])
pf=heights(lay(None),[(80,-195),(150,-240)])
chk('untouched beyond the slope', all(abs(a[1]-b[1])<1e-6 for a,b in zip(far,pf)))
line=[(80,-240+30+i*0.5) for i in range(-4,20)]
hl=[v[1] for v in heights(lay('supersede'),line)]
mx=max(abs(hl[i+1]-hl[i]) for i in range(len(hl)-1))
chk('the edge eases (biggest step %.3f per 0.5 unit)'%mx, mx<1.2)
cr={'type':'crag','id':4,'x':-120,'z':-300,'radius':20,'count':6,'heightMode':'supersede'}
hc=heights(lay('supersede',cr),[(-120+dx,-300+dz) for dx in range(-20,21,4) for dz in range(-20,21,4)])
chk('superseding Crags build and rise (top %.1f)'%max(v[0] for v in hc), max(v[0] for v in hc)>2)
g.close() if hasattr(g,'close') else None
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.route('**/fonts.*/**', lambda r: r.abort())
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    j=lay('supersede',dict(cr)); j['objects'][3]['heightMode']='supersede'
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(j)); pg.wait_for_timeout(400)
    o=json.loads(pg.evaluate("document.getElementById('json').value"))['objects']
    m={x['id']:x.get('heightMode') for x in o}
    chk('Path Editor keeps it: hill %s, crags %s, ledge %s (ledges cannot)'%(m.get(2),m.get(4),m.get(3)), m.get(2)=='supersede' and m.get(4)=='supersede' and m.get(3) is None)
    b.close()
print('ALL PASS' if ok else 'SOME FAILED')
