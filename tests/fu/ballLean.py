# The Hedron Barrier leans to the ground's cross-slope like her body does (it used to stay level).
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
pg.evaluate("j=>__sbStart(j)",{'width':14,'pieces':[{'t':'straight','len':40},{'t':'straight','len':400,'roll':25}],'terrain':''}); pg.wait_for_timeout(3000)
pg.keyboard.down('KeyW'); pg.wait_for_timeout(3500)
run=pg.evaluate("()=>__ballLean()"); print('running (z, side, ballOn, grounded, wall):',run)
pg.evaluate("()=>document.getElementById('dvpower').click()"); pg.keyboard.press('Digit2')
for i in range(40):
    pg.wait_for_timeout(250); b=pg.evaluate("()=>__ballLean()")
    if abs(b[1])>0.1: break
print('barrier:',b)
assert b[2] and b[3], 'barrier should be on and grounded'
assert abs(b[1])>0.1, 'the slope should tilt the frame'
assert abs(b[0]-b[1])<0.01, 'barrier lean must follow the same tilt'
pg.keyboard.press('Digit2'); pg.wait_for_timeout(500)
o=pg.evaluate("()=>__ballLean()"); print('barrier off:',o); assert o[0]==0
pg.keyboard.up('KeyW')
errs=[x for x in g.errs if 'flatShading' not in x and 'ERR_FAILED' not in x and 'GL Driver' not in x]; print('errors',errs[:3]); assert not errs
g.close(); print('OK')
