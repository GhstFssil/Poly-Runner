# pits are gone: an old layout with a trapped Big Minion loads, and the minion stands on the ground (no hole is dug)
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
J={'width':9,'pieces':[{'t':'straight','len':300}],'objects':[{'type':'bigminion','id':4,'x':30,'z':-100,'trapped':True,'idle':True}]}
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
r=pg.evaluate("()=>{var e=__en().filter(q=>q.sbp&&q.act&&q.big)[0];return e?{fy:e.fy,ground:__gh(e.x,e.z),flat:__l3(30,-100)}:null}")
ok=r and abs(r['fy']-r['ground'])<0.5 and abs(r['flat'])<0.01
print(r,'PASS' if ok else 'FAIL'); print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GL Driver' not in e][:3]); g.close()
