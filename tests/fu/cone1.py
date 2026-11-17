# a narrow cone-shaped hole (a hill of negative height): she lands at the bottom instead of falling/sliding between its faces for ever
import sys,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
html=sys.argv[1] if len(sys.argv)>1 else 'aud.html'
g=Rig(w=480,h=320,draw=False,html=html); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
bad=0
for r,h,mode in [(10,-20,'drop'),(6,-15,'drop'),(4,-10,'drop'),(6,-15,'run')]:
  J={'width':9,'pieces':[{'t':'straight','len':300}],'objects':[{'type':'hill','id':1,'x':0,'z':-150,'radius':r,'height':h,'surface':'grass'}]}
  pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1200)
  if mode=='drop': pg.evaluate("()=>{__pos(60001.5,__gh(60001.5,-150)+6,-150);__st({vy:0,speed:0})}")
  else:
    pg.evaluate("r=>{__pos(60000,__gh(60000,-147+r),-147+r);__st({vy:0,speed:30,heading:0,yaw:0});__keys({KeyW:true,w:true,ArrowUp:true})}",r)
    pg.wait_for_timeout(600); pg.evaluate("__keys({KeyW:false,w:false,ArrowUp:false})")
  pg.wait_for_timeout(4000)
  pg.evaluate("()=>{window.__tr=[];(function f(){var d=__dbg();__tr.push([__hd()[5]?1:0,d.y]);if(__tr.length<60)requestAnimationFrame(f)})()}"); pg.wait_for_timeout(2500)
  tr=pg.evaluate("__tr"); gr=sum(t[0] for t in tr); bot=pg.evaluate("__gh(60000,-150)"); y=tr[-1][1]
  ok=gr==len(tr) and y-bot<1.0; bad+=not ok
  print('hill r%d h%d %s: grounded %d/%d, %.2f above the bottom %s'%(r,h,mode,gr,len(tr),y-bot,'ok' if ok else 'NOT LANDED'))
print('PASS' if not bad else 'FAIL'); g.close()
