# Comet's Hover pose: hovering she stands (Idle clip) instead of running, even at speed; Hover off, she runs again
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
W=lambda: pg.evaluate("(function(){var w=__molly().w;return {Idle:+(w.Idle||0).toFixed(2),run:+((w.Run_Slow||0)+(w.Run_Mid||0)+(w.Run_Fast||0)).toFixed(2)}})()")
C=lambda: pg.evaluate("__comet()")
ok=True
def chk(name, c, extra=''):
    global ok; ok = ok and bool(c); print('PASS' if c else 'FAIL', name, extra)
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(3000)
pg.evaluate("__setChar('comet')"); pg.wait_for_timeout(2500)
pg.evaluate("__setPower(60)"); pg.keyboard.press('Digit2'); pg.wait_for_timeout(300)
chk('hover on', C()['hov'])
pg.keyboard.down('KeyW'); pg.wait_for_timeout(2500); w=W(); sp=pg.evaluate("__state().speed")
chk('hovering at speed: Idle clip, no run', w['Idle']>0.8 and w['run']<0.1, (w, sp))
pg.keyboard.press('Digit2'); pg.wait_for_timeout(800); w2=W()
chk('hover off while moving: she runs again', not C()['hov'] and w2['run']>0.8, w2)
pg.keyboard.up('KeyW')
print('ALL PASS' if ok else 'SOME FAILED')
g.close()
