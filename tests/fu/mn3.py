# damage tiers from the Barrier's speed (settings saved by the Rig Editor): she runs north into a Big Minion from 9 units south of it
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False,storage={'runnerRig2':json.dumps({'mn.big.k2':40,'mn.big.k3':80,'mn.big.hearts':5,'mn.min.top':14})}); pg=g.pg
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[{'type':'bigminion','id':2,'x':0,'z':-100,'idle':True}]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
def hit(zips):
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1200)
    b=[e for e in pg.evaluate("__ens()") if e['act'] and e['sbp'] and e['big']][0]
    if not pg.evaluate("__ball()"): pg.evaluate("document.getElementById('dvpower').click()"); pg.keyboard.press('Digit2'); pg.wait_for_timeout(200)
    pg.evaluate("([x,y,z])=>{__put(x,y,z)}",[b['x'],b['fy'],b['z']+9]); pg.wait_for_timeout(150)
    pg.evaluate("__spd(%f)"%(zips*2)); pg.wait_for_timeout(400)
    q=[e for e in pg.evaluate("__ens()") if e['i']==b['i']][0]; return 5-q['hearts']
print('settings in game: big hearts',[e for e in pg.evaluate("__ens()") if e['big']][0]['hearts'])
for z in (10,25,50,70,85): print('Barrier into a Big Minion at %d Zips: hearts of damage %d'%(z,hit(z)))
g.close()
