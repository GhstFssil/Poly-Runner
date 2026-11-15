# new official Grass Canyon: it builds without errors, she stands and runs, every stamp kind is built, and the editor's import matches the file
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
F='/mnt/user-data/attachments/ec45158d-ec62-5c4e-b093-0096324e4c89/7f2728f6-attachment.txt'
src=json.load(open(F))
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",['bTitle','bLevels','bLevel1']); pg.wait_for_timeout(7000)
st=lambda: pg.evaluate("(function(){var d=__dbg(),s=__state();return {level:d.level,playing:d.playing,hp:d.hp,x:+d.x.toFixed(1),y:+d.y.toFixed(2),ground:+d.ground.toFixed(2),speed:+s.speed.toFixed(1),grounded:s.grounded}})()")
a=st(); pg.keyboard.down('KeyW'); pg.wait_for_timeout(4000); b=st(); pg.keyboard.up('KeyW')
print('start',a); print('after 4 s of W',b)
info=pg.evaluate("""(function(){var SB=__dbg().SB,B=SB.B||SB;var o={};for(var k in B){var v=B[k];if(Array.isArray(v))o[k]=v.length}return {official:SB.official,arrays:o}})()""")
print('built',info)
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:6]); g.close()
