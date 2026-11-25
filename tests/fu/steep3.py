import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",['bTitle','bLevels','bLevel1','pcLast']); pg.wait_for_timeout(6000)
for x,z in [(-117,-100),(117,-100)]:
    print((x,z),'grad',pg.evaluate("([x,z])=>__grad(x,z)",[x,z]),'h',pg.evaluate("([x,z])=>__gH(x,z)",[x,z]))
print(pg.evaluate("""(function(){var out=[];for(var z=-100;z>-4000&&out.length<6;z-=37){for(var x=-120;x<=120;x+=3){var gx=(__gH(x+0.3,z)-__gH(x-0.3,z))/0.6,gz=(__gH(x,z+0.3)-__gH(x,z-0.3))/0.6,a=Math.atan(Math.hypot(gx,gz))*57.3;if(a>60&&a<75){out.push([x,z]);break;}}}return out})()"""))
g.close()
