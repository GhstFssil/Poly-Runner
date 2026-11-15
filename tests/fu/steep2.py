# Grass Canyon: find open ground about 60-75° steep and see whether she can stand there, before and after
import sys,json,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
def find(pg):
    return pg.evaluate("""(function(){var out=[];for(var z=-100;z>-4000&&out.length<6;z-=37){for(var x=-120;x<=120;x+=3){var h=__gH(x,z),gx=(__gH(x+0.3,z)-__gH(x-0.3,z))/0.6,gz=(__gH(x,z+0.3)-__gH(x,z-0.3))/0.6,m=Math.hypot(gx,gz),a=Math.atan(m)*57.3;
      if(a>60&&a<75){var gx2=(__gH(x+1,z)-__gH(x-1,z))/2,gz2=(__gH(x,z+1)-__gH(x,z-1))/2;if(Math.atan(Math.hypot(gx2,gz2))*57.3>55){out.push([x,z,+h.toFixed(2),+a.toFixed(1)]);break;}}}}return out})()""")
res={}
for h in ['aud_main.html','aud.html']:
    g=Rig(w=480,h=320,draw=False,html=h); pg=g.pg
    pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",['bTitle','bLevels','bLevel1']); pg.wait_for_timeout(6000)
    pts=res.get('pts') or find(pg); res['pts']=pts; out=[]
    for x,z,y,a in pts:
        pg.evaluate("([x,y,z])=>{__put(x,y,z);__spd(0)}",[x,y,z]); pg.wait_for_timeout(4000)
        d=pg.evaluate("__dbg()"); out.append((a,y,round(d['y'],2)))
    print(h,'(slope°, placed at y, y after 1.5 s):',out); g.close()
