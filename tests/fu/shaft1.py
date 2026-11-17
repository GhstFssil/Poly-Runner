# a cave joined to a shaft heads the way the shaft faces (plus its turn), as the editor draws it: turning the shaft turns it in the game too
import sys,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
bad=0
for srot,turn in [(0,0),(90,0),(45,30)]:
  J={'width':9,'pieces':[{'t':'straight','len':300}],'objects':[
    {'type':'cave','id':1,'x':40,'z':-100,'rot':srot,'shape':'rect','width':8,'height':8,'angle':85,'length':30},
    {'type':'cave','id':2,'after':1,'turn':turn,'x':40,'z':-100,'rot':0,'shape':'rect','width':8,'height':8,'angle':10,'length':40}]}
  pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
  r=pg.evaluate("()=>__dbg().SB.caves.map(c=>c.shaft?['shaft',c.shaft.th*180/Math.PI]:c.end?['tunnel',(c.end.hd)*180/Math.PI]:['?'])")
  want=srot+turn; got=r[1][1] if r[1][0]=='tunnel' else None
  ok=got is not None and abs(((got-want)+180)%360-180)<0.5; bad+=not ok
  print('shaft rot %d, turn %d:'%(srot,turn),r,'want tunnel heading',want,'ok' if ok else 'WRONG')
print('PASS' if not bad else 'FAIL'); g.close()
