# the stomp rules and the damage tiers, in the Sandbox
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
X=0
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[{'type':'minion','id':1,'x':0,'z':-60,'idle':True},{'type':'bigminion','id':2,'x':40,'z':-60,'idle':True}]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
def start():
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1200)
    E=[e for e in pg.evaluate("__ens()") if e['act'] and e['sbp']]; return E
def drop(e,dy,ball,vy0=-6):
    # her feet dy above the top of its head (negative: below the top), falling
    if ball and not pg.evaluate("__ball()"): pg.evaluate("document.getElementById('dvpower').click()"); pg.keyboard.press('Digit2'); pg.wait_for_timeout(200)
    hp0=pg.evaluate("__dbg().hp")
    pg.evaluate("([x,y,z])=>{__put(x,y,z);__vy(%f)}"%vy0,[e['x'],e['fy']+e['H']+dy,e['z']]); pg.wait_for_timeout(120)
    vy=pg.evaluate("__vy()"); E2={q['i']:q for q in pg.evaluate("__ens()")}; q=E2[e['i']]
    return {'dead':q['dead'],'hearts':q['hearts'],'herVy':round(vy,1),'herHp':pg.evaluate("__dbg().hp"),'hp0':hp0}
E=start(); m=[e for e in E if not e['big']][0]; b=[e for e in E if e['big']][0]
print('minion H',round(m['H'],2),'big H',round(b['H'],2),'| stomp speeds (Zips)',m['stomp'],b['stomp'])
print('Barrier, minion, landing on its head:',drop(m,0.5,True))
E=start(); m=[e for e in E if not e['big']][0]
print('Barrier, minion, feet at half the head (0.45 down):',drop(m,-0.45,True))
E=start(); b=[e for e in E if e['big']][0]
print('Barrier, big, landing on its head:',drop(b,0.5,True))
E=start(); b=[e for e in E if e['big']][0]
print('no Barrier, big, landing on its head:',drop(b,0.5,False))
E=start(); m=[e for e in E if not e['big']][0]
print('no Barrier, minion, into the side of its head (0.45 below the top):',drop(m,-0.45,False,-1))
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
