# can she climb a near-vertical face by jumping into it?
import sys,json,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[{'type':'ledge','id':1,'x':-30,'z':-60,'heading':90,'bend':0,'length':60,'thickness':20,'height':30}]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
print('ground across the face (z):',[(z,round(pg.evaluate("([x,z])=>__gH(x,z)",[60000,z]),1)) for z in (-44,-46,-47,-48,-49,-50,-52)])
pg.evaluate("__put(60000,0,-42)"); pg.wait_for_timeout(300)
pg.keyboard.down('KeyW'); ys=[]
for i in range(16):
    pg.keyboard.press('Space'); pg.wait_for_timeout(450)
    d=pg.evaluate("__dbg()"); ys.append((round(d['y'],1),0,d.get('grounded',d.get('gr'))))
pg.keyboard.up('KeyW')
print('jumping into it 16 times, (y, grounded):',[(y,gr) for y,z,gr in ys])
g.close()
