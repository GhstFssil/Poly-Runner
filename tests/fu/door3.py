import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
J={'width':9,'pieces':[{'t':'straight','len':300}],'objects':[{'type':'door','id':9,'s':40,'u':0,'width':12,'height':10,'mode':'closed','links':[5],'after':{'mode':'open'}},{'type':'minion','id':5,'x':20,'z':-120,'idle':True}]}
for h in ['aud_head.html','aud.html']:
    g=Rig(w=480,h=320,draw=False,html=h); pg=g.pg; pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1200)
    print(h,'linked door at path s=40 (expect x 0, z -40):',pg.evaluate("(function(){var m=__dbg().SB.movers.filter(function(q){return q.door})[0];return [m.cx,m.cz]})()"))
    g.close()
