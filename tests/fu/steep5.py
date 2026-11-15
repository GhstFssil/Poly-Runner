# Grass Canyon run, before and after: does she keep her footing on ordinary ground?
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
for h in ['aud_main.html','aud.html']:
    g=Rig(w=480,h=320,draw=False,html=h); pg=g.pg
    pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",['bTitle','bLevels','bLevel1']); pg.wait_for_timeout(6000)
    print(h,'level',pg.evaluate("__dbg().level"))
    pg.keyboard.down('KeyW'); air=0; n=0; z0=pg.evaluate("__dbg().z") if 'z' in pg.evaluate("__dbg()") else None
    for i in range(40): pg.wait_for_timeout(250); n+=1; air+=0 if pg.evaluate("__gr()") else 1
    pg.keyboard.up('KeyW'); d=pg.evaluate("__dbg()")
    print('  airborne in %d of %d samples; hp %s; y %.1f'%(air,n,d['hp'],d['y']))
    g.close()
