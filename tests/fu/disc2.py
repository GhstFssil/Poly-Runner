import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=640,h=400,draw=True); pg=g.pg; pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
for name,L in [('bowl',{"version":2,"width":9,"pieces":[{"len":100,"ang":0,"r":640,"dy":10},{"disc":1,"rad":40,"cs":-12,"bk":0,"h":60},{"len":100,"ang":0,"r":640,"dy":0}],"objects":[]}),
               ('oceana',{"version":2,"width":9,"terrain":"level2","pieces":[{"len":60,"ang":0,"r":640,"dy":0},{"disc":1,"rad":40,"cs":8,"bk":6},{"len":100,"ang":0,"r":640,"dy":0}],"objects":[]})]:
    pg.evaluate("j=>__sbStart(j)",L); pg.wait_for_timeout(2500)
    pg.evaluate("__tp(0,-40)"); pg.wait_for_timeout(2500)
    pg.screenshot(path='/tmp/polyrun-work/disc_%s.png'%name, timeout=150000)
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
