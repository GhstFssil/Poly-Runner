# Half hearts: hp with a .5 draws a cracked heart (left half full); whole values draw as before.
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
pg.evaluate("j=>__sbStart(j)",{'width':9,'pieces':[{'t':'straight','len':300}],'terrain':''}); pg.wait_for_timeout(1500)
def hearts(v):
    pg.evaluate("v=>__setHp(v)",v)
    return pg.evaluate("()=>{var h=document.querySelector('#hp .hearts');return [h.querySelectorAll('.heart-full').length,h.querySelectorAll('.heart-half').length,h.querySelectorAll('.heart-empty').length,h.querySelectorAll('.heart-crack').length]}")
# a half heart is drawn as an empty base with its left half filled and a crack, so it counts once under 'empty' too (hp 0 is skipped: the game respawns her)
for v,want in [(3,[3,0,0,0]),(2.5,[2,1,1,1]),(2,[2,0,1,0]),(1.5,[1,1,2,1]),(0.5,[0,1,3,1])]:
    r=hearts(v); print('hp',v,'(full, half, empty, cracks):',r); assert r==want
hearts(2.5); pg.locator('#hp').screenshot(path='/tmp/polyrun-work/halfheart.png')
errs=[x for x in g.errs if 'flatShading' not in x and 'ERR_FAILED' not in x and 'GL Driver' not in x]; print('errors',errs[:3]); assert not errs
g.close(); print('OK')
