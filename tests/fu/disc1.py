# circular decks: editor and game agree on the path; the ground (and the Oceana deck) is the deck's surface; the next segment leaves where the heading says
import json,sys,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from playwright.sync_api import sync_playwright
from righ import *
s=open('/home/claude/poly-runner/path-editor.html').read()
s=s.replace("  function at(s) {\n","  window.__pe = { samples: function () { return samples; }, discs: function () { return DISCS; } };\n  function at(s) {\n",1)
open('/tmp/polyrun-work/pe_disc.html','w').write(s)
def lay(cs,bk,h,terrain=''):
    return {"version":2,"width":9,"terrain":terrain or None,"pieces":[{"len":100,"ang":0,"r":640,"dy":10},{"disc":1,"rad":40,"cs":cs,"bk":bk,"h":h},{"len":100,"ang":0,"r":640,"dy":0}],"objects":[]}
cases=[(0,0,None),(-10,0,None),(12,0,90),(0,8,45),(-8,6,-60)]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200])); pg.route('**/fonts.*/**',lambda r:r.abort()); pg.goto('file:///tmp/polyrun-work/pe_disc.html'); pg.wait_for_timeout(1000)
    E=[]
    for c in cases:
        L=lay(*c); 
        if c[2] is None: del L['pieces'][1]['h']
        pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(L)); pg.wait_for_timeout(200)
        E.append(pg.evaluate("window.__pe.samples().map(q=>[+q.x.toFixed(3),+q.z.toFixed(3),+q.y.toFixed(3)])"))
    print('editor errors',errs); b.close()
g=Rig(w=480,h=320,draw=False); pg=g.pg; pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
X=60000
for ci,c in enumerate(cases):
    L=lay(*c)
    if c[2] is None: del L['pieces'][1]['h']
    pg.evaluate("j=>__sbStart(j)",L); pg.wait_for_timeout(1200)
    Gs=pg.evaluate("__dbg().SB.samples.map(q=>[+q.x.toFixed(3),+q.z.toFixed(3),+q.y.toFixed(3)])")
    D=pg.evaluate("__dbg().SB.discs[0]")
    dmax=max(max(abs(a[i]-b2[i]) for i in range(3)) for a,b2 in zip(E[ci],Gs)) if len(E[ci])==len(Gs) else 'count %d vs %d'%(len(E[ci]),len(Gs))
    # ground inside the disc vs the formula
    def f(x,z): dx,dz=x-D['cx'],z-D['cz']; r=math.hypot(dx,dz); return D['base']+(D['R']-min(D['R'],r))*D['tanC']-(dx*math.cos(D['hh'])+dz*math.sin(D['hh']))*D['tanB']
    pts=[(D['cx']+r*math.cos(a),D['cz']+r*math.sin(a)) for r in (0,10,20,30,37) for a in (0,1.3,2.6,4,5.2)]
    gy=pg.evaluate("ps=>ps.map(p=>__gH(p[0]+60000,p[1]))",pts)
    gerr=max(abs(gy[i]-f(*pts[i])) for i in range(len(pts)))
    last=Gs[-1]; exitp=Gs[len(Gs)-1-25]
    print('case slope %s bank %s heading %s: editor vs game %s | ground vs deck formula max %.3f | entry y %.2f | exit point (%.1f, %.1f) | end of path (%.1f, %.1f, y %.2f)'%(c[0],c[1],c[2],dmax,gerr,Gs[25][2],exitp[0],exitp[1],last[0],last[1],last[2]))
# Oceana: the deck top
L=lay(-10,5,90,'level2'); pg.evaluate("j=>__sbStart(j)",L); pg.wait_for_timeout(2000)
D=pg.evaluate("__dbg().SB.discs[0]")
print('Oceana deck top at centre:',round(pg.evaluate("([x,z])=>__l3f(x,z)[0]",[X+D['cx'],D['cz']]),2),'vs formula',round(D['base']+D['R']*D['tanC'],2),'| l3Top:',round(pg.evaluate("([x,z])=>{return __gH(x,z)}",[X+D['cx'],D['cz']]),2))
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
