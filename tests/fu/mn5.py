import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=640,h=400,draw=True,storage={'runnerRig2':json.dumps({'mn.min.headH':1.4,'mn.min.cBody':'#3a6b2e','mn.min.cEye':'#ffe23a','mn.big.cHead':'#7a2a2a'})}); pg=g.pg
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[{'type':'minion','id':1,'x':-4,'z':-30},{'type':'minion','id':3,'x':4,'z':-34},{'type':'bigminion','id':2,'x':0,'z':-70,'idle':True}]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(2500)
pg.screenshot(path='/tmp/polyrun-work/mn_game.png',timeout=150000)
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
