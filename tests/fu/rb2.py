import sys; sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(draw=False); m=g.ev("__molly()"); p=g.ev("__phys()")
print('fresh load verts',m['verts'],'bb',[round(x,3) for x in m['bb']],'scale',p['mollyScale'],'GRAV',p['GRAV'],'GRIP',p['GRIP'])
g.open(); g.pg.wait_for_timeout(1200)
d=g.ev("(function(){var d=document.getElementById('rigHost').__rigdbg();return {fmt:d.P.fmt,bandA:d.P['UpperArm.bandA'],ringGap:d.P.ringGap,grip:d.P['stat.gripZ']}})()"); print('editor',d)
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
