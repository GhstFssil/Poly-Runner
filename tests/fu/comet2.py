# Comet v180: throw timeline with a held star that leaves her hand, aim marker while charging, her colours on the Power line, charge bar and Segs (Molly keeps red)
import sys; sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=640,h=420,draw=False); pg=g.pg
C=lambda: pg.evaluate("__comet()")
pg.evaluate("document.getElementById('bDevT').click()"); pg.evaluate("document.getElementById('dtBlank').click()"); pg.wait_for_timeout(2500)
c=C(); print('Molly: seg colour',c['segCol'],'line',repr(c['line']))
pg.evaluate("__setChar('comet')"); pg.wait_for_timeout(1500); c=C(); print('Comet: seg colour',c['segCol'],'line',c['line'])
pg.evaluate("()=>{__put(0,__gH(0,-10),-10);__hd(0);__spd(0);__setPower(50)}"); pg.wait_for_timeout(500)
pg.keyboard.down('KeyE'); seen=[]
for i in range(12):
    pg.wait_for_timeout(120); c=C(); seen.append((c['thr'],c['held'],c['aim'],c['lvl']))
print('charging (phase, star in hand, aim marker, level):',seen[-1],'aim at',C()['aimXY'])
pg.keyboard.up('KeyE'); tl=[]
for i in range(20):
    c=C(); tl.append((c['thr'],c['held'],len(c['stars']),c['aim'])); pg.wait_for_timeout(40)
print('after letting go (phase, held, stars in flight, aim):',[t for i,t in enumerate(tl) if i==0 or t!=tl[i-1]])
pg.evaluate("__setChar('molly')"); pg.wait_for_timeout(1200); c=C(); print('back to Molly: seg colour',c['segCol'],'line',repr(c['line']))
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GPU stall' not in e][:5]); g.close()
