# Big Minion hits: the Barrier bounce goes back along the ground (no upward launch); its head is harmless to touch;
# a damaged Big Minion rests 1.5 s before it can hurt her; contact never pushes her across a wall's face.
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
J={'width':9,'pieces':[{'t':'straight','len':300}],'objects':[{'type':'bigminion','id':4,'x':30,'z':-100,'idle':True}]}
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
def big(): return [q for q in pg.evaluate("()=>__ens()") if q['big'] and q['act']][0]
def touch(dy, frames=6):
    e=big()
    return pg.evaluate("a=>{var hp0=__state().hp;for(var i=0;i<a[3];i++){__put(a[0],a[1],a[2]);__enUpd(0.016);}return [hp0,__state().hp]}",[e['x']+0.2,e['fy']+dy,e['z'],frames])
# 1. bounce: flat
e=big(); pg.evaluate("a=>__put(a[0],a[1],a[2])",[e['x']+0.2,e['fy'],e['z']])
r=pg.evaluate("()=>{var a=__state();__bounce(%d);var b=__state();return [a.vy,b.vy,b.grounded,b.y-a.y]}"%e['i']); print('bounce vy/grounded/dy:',r)
assert r[1]<5 and r[2] and abs(r[3])<0.01, 'bounce must not launch up'
# 2. head harmless, body hurts
e=big(); h0,h1=touch(e['H']-0.3); print('head touch hp',h0,'->',h1); assert h1==h0
pg.wait_for_timeout(1200)
h0,h1=touch(0); print('body touch hp',h0,'->',h1); assert h1<h0
# 3. rest after damage
pg.wait_for_timeout(1500)
pg.evaluate("()=>{__en().filter(q=>q.big)[0].restUntil=performance.now()+1500}")
h0,h1=touch(0); print('resting minion hp',h0,'->',h1); assert h1==h0
pg.evaluate("()=>{__en().filter(q=>q.big)[0].restUntil=0}")
h0,h1=touch(0); print('rested minion hp',h0,'->',h1); assert h1<h0
# 4. wall: contact must not push across the face
e=big(); pg.evaluate("a=>__put(a[0],a[1],a[2])",[e['x']+0.2,e['fy'],e['z']])
c=pg.evaluate("()=>{var a=__state();__pushOutOf(a.x-0.2,a.z,1.0);var b=__state();return [b.x-a.x,b.z-a.z]}"); print('control push on the ground:',c); assert abs(c[0])>0.5
pg.evaluate("j=>__sbStart(j)",{'width':9,'pieces':[{'t':'straight','len':60},{'t':'straight','len':150,'roll':90},{'t':'straight','len':100,'roll':90}],'terrain':''}); pg.wait_for_timeout(3500)
pg.keyboard.down('KeyW'); on=False
for i in range(40):
    pg.wait_for_timeout(250)
    if pg.evaluate("()=>__state().wallOn"): on=True; break
print('on wall:',on); assert on
r=pg.evaluate("()=>{var a=__state();__pushOutOf(a.x+0.3,a.z,1.0);var b=__state();return [b.x-a.x,b.z-a.z]}"); print('push on wall (dx,dz):',r)
pg.keyboard.up('KeyW')
assert abs(r[0])<1e-6, 'across-face push must be dropped on a wall'
errs=[x for x in g.errs if 'flatShading' not in x and 'ERR_FAILED' not in x and 'GL Driver' not in x]; print('errors',errs[:3]); assert not errs
g.close(); print('OK')
