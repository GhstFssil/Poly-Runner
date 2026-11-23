import sys,json,random
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
# Many toxic patches: ground lookups and frame time stay cheap, damage still lands only inside a (rotated) patch.
g=Rig(w=480,h=320,draw=False); pg=g.pg
X=0
random.seed(7)
objs=[{'type':'toxic','id':100+i,'x':random.uniform(-600,600),'z':random.uniform(-200,1400),'width':random.uniform(4,30),'length':random.uniform(4,30),'rot':random.uniform(0,360)} for i in range(400)]
objs.append({'type':'toxic','id':7,'x':-900,'z':300,'width':10,'length':40,'rot':45})   # a lone rotated patch, away from the rest
J={'width':9,'pieces':[{'t':'straight','len':1600}],'objects':objs}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2500)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(2000)
ms=pg.evaluate("""()=>{var t0=performance.now(),s=0;for(var i=0;i<40000;i++)s+=__gH(0+((i*37)%1200)-600,((i*53)%1600)-200);return performance.now()-t0;}""")
print('40000 ground lookups ms', round(ms,1))
fr=pg.evaluate("""()=>new Promise(r=>{var n=0,t0=performance.now();function f(){if(++n<120)requestAnimationFrame(f);else r((performance.now()-t0)/120);}requestAnimationFrame(f);})""")
print('avg frame ms near patches', round(fr,2))
def hurt(x,z,secs=3):   # (hp before, lowest hp seen): toxic ground costs a heart a second, so she can lose all three and respawn full; the lowest count catches that
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
    yy=pg.evaluate("([x,z])=>__gH(x,z)",[X+x,z]); hp0=pg.evaluate("__dbg().hp"); lo=hp0; t0=pg.evaluate("performance.now()")
    while pg.evaluate("performance.now()")-t0<secs*1000:
        pg.evaluate("([x,y,z])=>__put(x,y,z)",[X+x,yy,z]); pg.wait_for_timeout(200)
        lo=min(lo,pg.evaluate("__dbg().hp"))
    return hp0,lo
# 15 units out from the middle along each diagonal: one runs along the turned patch's long axis (inside, half-length 20), the other across it (outside, half-width 5)
import math
a=math.radians(45)
d1=hurt(-900+15*math.cos(a),300+15*math.sin(a)); d2=hurt(-900-15*math.cos(a),300+15*math.sin(a))
print('15 out along each diagonal (hp before, lowest):',d1,d2,'-> exactly one hurts:',(d1[1]<d1[0])!=(d2[1]<d2[0]))
print('centre of the lone patch:',hurt(-900,300))
print('errors',[e for e in g.errs if 'GPU stall' not in e and 'flatShading' not in e and 'ERR_FAILED' not in e] if hasattr(g,'errs') else '')
g.close()
