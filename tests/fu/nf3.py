import sys; sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=900,h=640,draw=False)
print('default in game:',{k:v for k,v in g.ev("__phys2()").items() if k.startswith('SLAM')})
g.open(); print('typed slam accel 90 ->',g.typed('stat.slamAcc',90),'| slam top 120 ->',g.typed('stat.slamMax',120),'| 0 ->',g.typed('stat.slamAcc',0),g.P('stat.slamAcc'))
g.typed('stat.slamAcc',90); g.click('#rigClose',600)
print('in game after closing the editor:',{k:v for k,v in g.ev("__phys2()").items() if k.startswith('SLAM')})
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
