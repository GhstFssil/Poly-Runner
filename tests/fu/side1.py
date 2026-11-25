# Sidestep: the left / right mouse button held walks her to her left / right of her heading at the Sidestep stat speed; the Step clip shows only while she is not running forward
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
S=lambda: pg.evaluate("__state()")
W=lambda: pg.evaluate("(function(){var w=__molly().w;return {L:+(w.Step_L||0).toFixed(2),R:+(w.Step_R||0).toFixed(2),Idle:+(w.Idle||0).toFixed(2),run:+((w.Run_Slow||0)+(w.Run_Mid||0)+(w.Run_Fast||0)).toFixed(2)}})()")
def btn(b, down): pg.evaluate("([b,d])=>(d?document:window).dispatchEvent(new MouseEvent(d?'mousedown':'mouseup',{button:b}))", [b, down])
ok=True
def chk(name, c, extra=''):
    global ok; ok = ok and bool(c); print('PASS' if c else 'FAIL', name, extra)
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(4000)
chk('model has Step clips', 'Step_L' in pg.evaluate("__molly().clips") and 'Step_R' in pg.evaluate("__molly().clips"))
def side(b, ms):
    a=S(); btn(b,True); pg.wait_for_timeout(ms); w=W(); m=S(); btn(b,False); pg.wait_for_timeout(200); m2=S(); pg.wait_for_timeout(400); e=S()
    h=a['heading']; rx,rz=math.cos(h),-math.sin(h); along=(m['x']-a['x'])*rx+(m['z']-a['z'])*rz; fwd=(m['x']-a['x'])*-math.sin(h)+(m['z']-a['z'])*-math.cos(h)
    return along, fwd, w, math.hypot(e['x']-m2['x'],e['z']-m2['z'])
al,fw,w,after=side(0,1000); chk('left button: walks to her left, not forward', al<-6 and abs(fw)<0.5, (round(al,2),round(fw,2)))
chk('left: Step_L clip shows', w['L']>0.8, w); chk('stops when let go', after<0.05, round(after,2))
al,fw,w,after=side(2,1000); chk('right button: walks to her right', al>6 and abs(fw)<0.5, (round(al,2),round(fw,2))); chk('right: Step_R clip shows', w['R']>0.8, w)
pg.keyboard.down('KeyW'); pg.wait_for_timeout(2500); al,fw,w,after=side(2,800); pg.keyboard.up('KeyW')
chk('running: still steps sideways', al>2, round(al,2)); chk('running: the run wins over the Step clip', w['R']<0.05 and w['run']>0.8, w)
errs=[e for e in g.errs if 'GL Driver' not in e and 'flatShading' not in e and 'ERR_FAILED' not in e]; chk('no errors', not errs, errs[:3])
print('ALL PASS' if ok else 'SOME FAILED'); g.close()
