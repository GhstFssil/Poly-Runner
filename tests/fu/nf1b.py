import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
X=0
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[
 {'type':'ledge','id':3,'x':-60,'z':-50,'heading':0,'bend':0,'length':30,'thickness':10,'height':5,'toxic':True},
 {'type':'toxic','id':7,'x':-200,'z':-60,'width':20,'length':20},
]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2500)
def hurt(x,z,secs):
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
    hp=[]; yy=pg.evaluate("([x,z])=>__gH(x,z)",[X+x,z]); t0=pg.evaluate("performance.now()")
    while pg.evaluate("performance.now()")-t0<secs*1000:
        pg.evaluate("([x,y,z])=>__put(x,y,z)",[X+x,yy,z]); pg.wait_for_timeout(200); hp.append(pg.evaluate("__dbg().hp"))
    return hp[::3]
print('toxic patch  ',hurt(-200,-60,4))
print('toxic ledge  ',hurt(-60,-65,4))
g.close()
