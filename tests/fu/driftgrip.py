# The 'Grip while drifting' stat: default 1, reaches the game, clamps at 0..10, a settings file from before it still loads as 1.
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(draw=False, storage={'runnerRig2':json.dumps({'stat.top':90})})
g.open(); g.ev(g.q('#statBox')+".open=true"); g.pg.wait_for_timeout(300)
print('default:',g.P('stat.driftGrip'))
assert g.P('stat.driftGrip')==1
g.typed('stat.driftGrip',2); g.click('#rigClose',800)
d=g.ev("__phys()")['DRIFT_GRIP']; print('after typing 2:',d); assert d==2
g.ev("document.getElementById('dtRig').click()"); g.pg.wait_for_timeout(2500); g.ev(g.q('#statBox')+".open=true")
g.typed('stat.driftGrip',99); print('typed 99 ->',g.P('stat.driftGrip')); assert g.P('stat.driftGrip')<=10
g.click('#resetStats',300); print('after reset:',g.P('stat.driftGrip')); assert g.P('stat.driftGrip')==1
g.click('#rigClose',800); assert g.ev("__phys()")['DRIFT_GRIP']==1
errs=[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GPU stall' not in e]; print('errors:',errs[:3]); assert not errs
g.close(); print('OK')
