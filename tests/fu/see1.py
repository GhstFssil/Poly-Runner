# see-through: put a wall between the camera and Molly, and compare her visibility with it off and on
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=640,h=400,draw=True); pg=g.pg
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[{'type':'platform','id':1,'x':-8,'z':-14,'heading':90,'bend':0,'length':16,'width':2,'height':12,'thick':14,'move':'none'}]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(2500)
pg.evaluate("__put(60000,0,-20)"); pg.wait_for_timeout(1500)
pg.screenshot(path='/tmp/polyrun-work/see_on.png',timeout=150000)
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
