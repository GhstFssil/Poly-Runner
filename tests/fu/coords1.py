# Show Coordinates: Y is the editor's true Y (from her feet at the path's start), so Oceana (built 40 up) reads 0 at the start
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
J={'width':9,'terrain':'level2','pieces':[{'t':'straight','len':200}],'objects':[{'type':'sign','id':3,'s':50,'u':0,'yAbs':12,'text':'x'}]}
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
pg.evaluate("()=>{document.getElementById('dvcoordsBtn').click()}")
pg.evaluate("()=>{__pos(0,__gh(0,-20),-20)}"); pg.wait_for_timeout(400)
print('on path start, world y %.1f readout:'%pg.evaluate("__dbg().y"), pg.evaluate("document.getElementById('coords').textContent"), '| y0', pg.evaluate("__dbg().SB.y0"))
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GL Driver' not in e][:3]); g.close()
