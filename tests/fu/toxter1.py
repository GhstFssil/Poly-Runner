import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
# Toxic terrain patch: bubbles show over it, sit on its ground, and the count stays near the asked-for share.
g=Rig(w=480,h=320,draw=False); pg=g.pg
X=60000
J={'width':9,'pieces':[{'t':'straight','len':600}],'objects':[{'type':'patch','id':1,'x':40,'z':200,'shape':'rect','width':60,'length':60,'heading':30,'ground':'toxic','edge':'hard'}]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2500)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
yy=pg.evaluate("([x,z])=>__gH(x,z)",[X+40,200]); pg.evaluate("([x,y,z])=>__put(x,y,z)",[X+40,yy,200]); pg.wait_for_timeout(600)
info=pg.evaluate("""()=>{var b=typeof __bubInfo==="function"?__bubInfo():null;return {n:__bub(),b:b};}""")
print('bubbles near the toxic terrain patch:',info['n'])
if info['b']: print('first bubbles (x,y,z):',info['b'][:3],' ground at patch',round(yy,2))
print('errors',[e for e in g.errs if 'GPU stall' not in e and 'flatShading' not in e and 'ERR_FAILED' not in e] if hasattr(g,'errs') else '')
g.close()
