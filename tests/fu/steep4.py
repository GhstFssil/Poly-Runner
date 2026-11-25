import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",['bTitle','bLevels','bLevel1','pcLast']); pg.wait_for_timeout(6000)
x,z=114,-100; y=pg.evaluate("([x,z])=>__gH(x,z)",[x,z])
pg.evaluate("([x,y,z])=>{__put(x,y,z);__spd(0)}",[x,y,z])
for i in range(8):
    pg.wait_for_timeout(150); d=pg.evaluate("(function(){var d=__dbg();return [+d.x.toFixed(2),+d.y.toFixed(2),__gr(),+__vy().toFixed(2)]})()"); print(d, pg.evaluate("([x,z])=>__grad(x,z)",[d[0],-100]))
g.close()
