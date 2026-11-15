# pressure plates and targets: they build, plates press (for good, or only while she stands), targets are solid, break only to the Barrier at speed, and linked doors open
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[
 {'type':'plate','id':1,'x':0,'z':-40,'shape':'rect','width':8,'length':8,'look':'gray'},
 {'type':'door','id':2,'s':80,'u':0,'width':12,'height':10,'mode':'closed','links':[1],'after':{'mode':'open'},'speed':0.3},
 {'type':'target','id':3,'x':0,'z':-150,'size':6,'height':3,'breakSpeed':20},
 {'type':'door','id':4,'s':230,'u':0,'width':12,'height':10,'mode':'closed','links':[3],'after':{'mode':'open'},'speed':0.3},
 {'type':'plate','id':5,'x':30,'z':-20,'shape':'circle','radius':3,'look':'halo','onlyWhileStanding':True},
 {'type':'plate','id':7,'x':-30,'z':-20,'shape':'circle','radius':3,'look':'none'},
 {'type':'plate','id':8,'x':-30,'z':-60,'look':'brown'}]}
def st():
    return pg.evaluate("""(function(){var B=__dbg().SB,d=B.movers.filter(function(q){return q.door});return {plates:B.plates.map(function(p){return [p.id,p.look,!!p.mesh,p.on]}),targets:B.targets.map(function(t){return [t.id,t.on]}),doors:d.map(function(m){return [m.o.id,+m.k.toFixed(2)]}),z:+(__dbg().z).toFixed(2),x:+(__dbg().x-60000).toFixed(2)}})()""")
def put(x,z,y=None):
    pg.evaluate("([x,z,y])=>{var g=y===null?__gH(60000+x,z):y;__put(60000+x,g,z);__hd(0);__spd(0)}",[x,z,y])
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
print('built:',st())
put(0,-40); pg.wait_for_timeout(1500); print('on plate 1 for 1.5 s:',st())
put(0,-10); pg.wait_for_timeout(500); print('stepped off plate 1 (stays pressed):',st()['plates'][0])
put(30,-20); pg.wait_for_timeout(1000); a=st()['plates'][1]; put(30,-10); pg.wait_for_timeout(1000); b=st()['plates'][1]; print('halo plate, only while standing: on it',a,'| off it',b)
# target: run into it on foot, then with the Barrier slow, then fast
def run(zips,ball):
    if ball != pg.evaluate("__ball()"): pg.evaluate("document.getElementById('dvpower').click()"); pg.keyboard.press('Digit2'); pg.wait_for_timeout(250)
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1200)
    if ball != pg.evaluate("__ball()"): pg.evaluate("document.getElementById('dvpower').click()"); pg.keyboard.press('Digit2'); pg.wait_for_timeout(250)
    put(0,-125); pg.wait_for_timeout(150); pg.keyboard.down('KeyW'); zs=[]
    for i in range(14): pg.evaluate("__spd(%f)"%(zips*2)); pg.wait_for_timeout(100); zs.append(st()['z'])
    pg.keyboard.up('KeyW'); r=st(); r['minz']=min(zs); return r
r=run(20,False); print('on foot at 20 Zips: furthest z',r['minz'],'target',r['targets'],'(the target is at z -150)')
r=run(10,True); print('Barrier at 10 Zips: furthest z',r['minz'],'target',r['targets'])
r=run(30,True); print('Barrier at 30 Zips: furthest z',r['minz'],'target',r['targets'])
pg.wait_for_timeout(1200); print('door linked to the target, 1.2 s later:',st()['doors'])
bits=pg.evaluate("__dbg().SB.tgBits.map(function(b){return [+b.m.position.y.toFixed(1),b.m.visible]})"); print('halves:',bits)
pg.wait_for_timeout(2500); print('halves after 3.7 s:',pg.evaluate("__dbg().SB.tgBits.map(function(b){return b.m.visible})"))
M={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[{'type':'target','id':3,'x':0,'z':-150,'size':6,'height':5,'tilt':30,'spin':45,'sideTravel':10,'sidePeriod':2,'upTravel':4,'upPeriod':3}]}
pg.evaluate("j=>__sbStart(j)",M); pg.wait_for_timeout(800); cs=[]
for i in range(6): cs.append(pg.evaluate("(function(){var t=__dbg().SB.targets[0];return [+(t.C.x-60000).toFixed(2),+t.C.y.toFixed(2),+(Math.acos(Math.abs(t.ez.y))*57.3).toFixed(1)]})()")); pg.wait_for_timeout(300)
print('moving, tilted target: centre x, centre y, and its face normal from vertical (90 = upright; 30° tilt -> 60):',cs)
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:4]); g.close()
