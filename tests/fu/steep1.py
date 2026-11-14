# steep ground: does she stand on it? can she climb it by jumping while running along it?
import sys,json,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
for H in [3.5, 5, 9]:
  J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[{'type':'ledge','id':1,'x':-60,'z':-60,'heading':90,'bend':0,'length':120,'thickness':20,'height':H,'ends':'square'}]}
  for h in ['aud_main.html','aud.html']:
    g=Rig(w=480,h=320,draw=False,html=h); pg=g.pg; pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(1800)
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1200)
    prof=[(z/4,round(pg.evaluate("([x,z])=>__gH(x,z)",[60010,z/4]),2)) for z in range(-196,-184)]
    face=[p for p in prof if 0.2<p[1]<H-0.2]; zf=face[len(face)//2][0] if face else -47.5
    gr=pg.evaluate("([x,z])=>__gH(x,z)",[60010,zf])
    pg.evaluate("([x,y,z])=>{__put(x,y,z);__spd(0)}",[60010,gr,zf]); pg.wait_for_timeout(1500)
    d=pg.evaluate("__dbg()"); stood=(round(gr,2),round(d['y'],2))
    # run along the face (east) jumping, starting at its foot
    pg.evaluate("([x,z])=>{__put(x,__gH(x,z),z);__hd(-Math.PI/2)}",[60000-40,zf+1.0]); pg.wait_for_timeout(300)
    pg.keyboard.down('KeyW'); top=0
    for i in range(14):
        pg.keyboard.press('Space'); pg.wait_for_timeout(300); top=max(top,pg.evaluate("__dbg().y"))
    pg.keyboard.up('KeyW')
    print('ledge %.1f high (face cell slope about %.0f°) %-14s placed on the face at y %s -> after 1.5 s y %s | running along it jumping: highest %.2f'%(H,math.degrees(math.atan(H/max(0.25,len(face)*0.25+0.25))),h,stood[0],stood[1],top))
    g.close()
