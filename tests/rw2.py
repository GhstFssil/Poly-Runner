from righ import *
g=Rig(draw=False); g.open()
print('weld log',g.ev("JSON.stringify(window.__weldlog)"))
open('/home/claude/poly-runner/tests/weld/soups0.json','w').write(g.ev("window.__soups0"))
g.close()
