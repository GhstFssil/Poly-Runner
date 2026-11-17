# a closed door between two paths stops her at any speed (it is only 2 thick: a fast run once skipped through it, and the door then thought she came from the far side)
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
bad=0
for s,cz in [(98,-98),(102,-100)]:
  J={'width':9,'pieces':[{'t':'straight','len':100}],'extraPaths':[{'x':0,'z':-104,'rise':10,'pieces':[{'t':'straight','len':100}]}],'objects':[{'type':'door','id':9,'s':s,'u':0,'width':12,'height':10,'mode':'closed'}]}
  for zips in [5,20,50]:
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1200)
    pg.evaluate("""z=>{window.__tr=[];(function f(){var d=__dbg();__tr.push([d.x-60000,d.z]);if(__tr.length<200)requestAnimationFrame(f)})();__pos(60000,0,-60);__st({vy:0,speed:z*2,heading:0,yaw:0});__keys({KeyW:true,w:true,ArrowUp:true})}""",zips)
    pg.wait_for_timeout(2500); pg.evaluate("__keys({KeyW:false,w:false,ArrowUp:false})")
    tr=pg.evaluate("__tr"); past=max(cz-1-t[1] for t in tr if abs(t[0])<6)   # how far past the door's far face she got (one frame of overshoot before the push is fine)
    ok=past<1.5 and tr[-1][1]>cz-1; bad+=not ok
    print('door s=%d, %d Zips: furthest past far face %.2f, ends z %.2f %s'%(s,zips,past,tr[-1][1],'ok' if ok else 'THROUGH'))
print('PASS' if not bad else 'FAIL %d'%bad); g.close()
