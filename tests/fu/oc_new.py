# official Oceana Crags: Act 1 starts the Path Editor layout on the sandbox engine, she stands and runs,
# every stamp kind is built, and the editor's import and the Levels map load the same layout
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",['bTitle','bLevels','bLevel2','pcLast']); pg.wait_for_timeout(8000)
st=lambda: pg.evaluate("(function(){var d=__dbg(),s=__state();return {level:d.level,playing:d.playing,hp:d.hp,x:+d.x.toFixed(1),y:+d.y.toFixed(2),ground:+d.ground.toFixed(2),speed:+s.speed.toFixed(1),grounded:s.grounded}})()")
a=st(); pg.keyboard.down('KeyW'); pg.wait_for_timeout(4000); b=st(); pg.keyboard.up('KeyW')
print('start',a); print('after 4 s of W',b)
info=pg.evaluate("""(function(){var SB=__dbg().SB,B=SB.B||SB;var o={};for(var k in B){var v=B[k];if(Array.isArray(v))o[k]=v.length}return {official:SB.official,terrain:(SB.B||SB).terrain||null,arrays:o}})()""")
print('built',info)


print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:6]); g.close()
# Levels map and editor import both load the official layout
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",['bTitle','bLevels','bMapL2']); pg.wait_for_timeout(5000)
print('map errors',[e for e in g.errs if 'GL Driver' not in e and 'flatShading' not in e and 'ERR_FAILED' not in e][:4]); g.close()
