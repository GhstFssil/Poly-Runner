# new features batch 1: segs counter, slam stats, free mud, toxic ledge / platform
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=640,h=420,draw=False); pg=g.pg
X=60000
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[
 {'type':'mud','id':1,'x':60,'z':-50,'heading':0,'bend':0,'length':40,'width':20,'slowdown':50},
 {'type':'mud','id':2,'s':200,'u':0,'length':40,'slowdown':50},
 {'type':'ledge','id':3,'x':-60,'z':-50,'heading':0,'bend':0,'length':30,'thickness':10,'height':5,'toxic':True},
 {'type':'ledge','id':4,'x':-120,'z':-50,'heading':0,'bend':0,'length':30,'thickness':10,'height':5},
 {'type':'platform','id':5,'x':120,'z':-150,'heading':0,'bend':0,'length':30,'width':12,'height':10,'thick':2,'toxic':True},
 {'type':'platform','id':6,'x':180,'z':-150,'heading':0,'bend':0,'length':30,'width':12,'height':10,'thick':2},
]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2500)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(2500)
m=lambda x,z: pg.evaluate("([x,z])=>__mudAt(x,z)",[X+x,z])
print('free mud: centre',m(60,-70),'edge inside (x+10.5)',m(70.5,-70),'outside (x+13)',m(73,-70),'| path mud at s=220:',m(0,-220),'| bare path s=100:',m(0,-100))
def hurt(x,z,y=None):
    pg.evaluate("__dbg()"); hp0=pg.evaluate("__dbg().hp")
    yy=pg.evaluate("([x,z])=>__gH(x,z)",[X+x,z]) if y is None else y
    for i in range(12): pg.evaluate("([x,y,z])=>__put(x,y,z)",[X+x,yy,z]); pg.wait_for_timeout(250)
    return hp0, pg.evaluate("__dbg().hp"), round(yy,2)
print('toxic ledge top (hp before, after 3 s, ground y):',hurt(-60,-65))
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
print('plain ledge top:',hurt(-120,-65))
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
print('toxic platform top:',hurt(120,-165,10))
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
print('plain platform top:',hurt(180,-165,10))
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
print('ground beside the toxic ledge:',hurt(-60,-110))
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
