import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False,storage={'runnerRig2':json.dumps({'mn.big.k2':40,'mn.big.k3':80,'mn.big.hearts':5})}); pg=g.pg
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[{'type':'bigminion','id':2,'x':40,'z':-60,'idle':True}]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1200)
b=[e for e in pg.evaluate("__ens()") if e['act'] and e['sbp'] and e['big']][0]
pg.evaluate("document.getElementById('dvpower').click()"); pg.keyboard.press('Digit2'); pg.wait_for_timeout(200)
pg.evaluate("window.__enLog=[]")
pg.evaluate("([x,y,z])=>{__put(x,y,z);__spd(120)}",[b['x']-b['R'],b['fy']+1,b['z']]); pg.wait_for_timeout(300)
print(pg.evaluate("window.__enLog.slice(-8)"))
g.close()
