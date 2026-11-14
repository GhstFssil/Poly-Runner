# follow-up 5: Overall scale reaches the game
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
D="document.getElementById('rigHost').__rigdbg()"
g=Rig(draw=False)
m=g.ev("__molly()"); print('built-in on load: model box',[round(x,3) for x in m['bb']],'| phys',{k:round(v,3) for k,v in g.ev("__phys()").items() if k in('PLAYER_H','PLAYER_RADIUS','SLIDE_H','mollyScale')})
g.open()
for sc in [1.25,0.8,1]:
    g.typed('scale',sc,900); g.click('#exportGlb',4000)
    m=g.ev("__molly()"); ph=g.ev("__phys()")
    print('scale',sc,'->',g.status(),'| model box [minY,maxY,width]',[round(x,3) for x in m['bb']],'| H',round(ph['PLAYER_H'],3),'R',round(ph['PLAYER_RADIUS'],3),'slide',ph['SLIDE_H'],'mollyScale',ph['mollyScale'])
g.ev(g.q('#statBox')+".open=true"); g.typed('scale',1.25,500)
card=g.ev(g.q('#statLive')+".innerText"); print('editor card at 1.25:',card.replace('\n',' | ')[:120])
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:4])
g.close()
