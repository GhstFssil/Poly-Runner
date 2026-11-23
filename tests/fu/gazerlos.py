# The Roost Gazer's laser: anything with collision stops it, and it holds its fire without a clear line to her.
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
def start(objs):
    pg.evaluate("j=>__sbStart(j)",{'width':40,'pieces':[{'t':'straight','len':400}],'terrain':'','objects':objs}); pg.wait_for_timeout(1500)
GZ={'type':'gazer','id':11,'x':0,'z':-100,'mode':'idle','height':6}
def hp_after(sec):
    pg.evaluate("()=>__put(0, 0, -80)"); pg.wait_for_timeout(int(sec*1000)); return pg.evaluate("()=>__state().hp")
# 1. the solid test itself: ground, a Big Minion, and (below) a door
start([GZ,{'type':'bigminion','id':4,'x':0,'z':-90,'idle':True}])
e=[q for q in pg.evaluate("()=>__ens()") if q['big'] and q['act']][0]; X=e['x']
print('ground: below',pg.evaluate("a=>__solid(a[0],-0.5,a[1])",[X+30,-60]),'above',pg.evaluate("a=>__solid(a[0],0.5,a[1])",[X+30,-60]))
assert pg.evaluate("a=>__solid(a[0],-0.5,a[1])",[X+30,-60]) and not pg.evaluate("a=>__solid(a[0],0.5,a[1])",[X+30,-60])
inside=pg.evaluate("a=>__solid(a[0],a[1],a[2])",[X,e['fy']+2,e['z']]); outside=pg.evaluate("a=>__solid(a[0],a[1],a[2])",[X+e['R']+1.5,e['fy']+2,e['z']]); above=pg.evaluate("a=>__solid(a[0],a[1],a[2])",[X,e['fy']+e['H']+1,e['z']])
print('Big Minion: inside',inside,'beside',outside,'over its head',above); assert inside and not outside and not above
# 2. with the Big Minion between them it never shoots her; without it she is hit
hb=hp_after(6); print('blocked by the Big Minion: hp',hb); assert hb==3
start([GZ]); hc=hp_after(6); print('clear line: hp',hc); assert hc<3
# 3. a closed door
start([GZ,{'type':'door','id':9,'s':60,'u':0,'width':30,'height':14,'mode':'closed'}])
zs=[z for z in range(-30,-130,-1) if pg.evaluate("a=>__solid(a[0],7,a[1])",[0,z])]; print('door found at z',zs[:1],'..',zs[-1:]); assert zs
dz=zs[0]
pg.evaluate("a=>__put(0,0,a)",dz+14); pg.wait_for_timeout(100)
pg.evaluate("z=>{var e=__en().filter(q=>q.gz)[0];e.z=z;e.hz=z;}",dz-14); pg.wait_for_timeout(200)
hd=hp_after(0)  # settle
pg.evaluate("a=>__put(0,0,a)",dz+14); pg.wait_for_timeout(6000); hd=pg.evaluate("()=>__state().hp"); print('behind a closed door: hp',hd); assert hd==3
errs=[x for x in g.errs if 'flatShading' not in x and 'ERR_FAILED' not in x and 'GL Driver' not in x]; print('errors',errs[:3]); assert not errs
g.close(); print('OK')
