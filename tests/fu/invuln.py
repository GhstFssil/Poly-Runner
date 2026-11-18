# Dev Mode > Invulnerable: a big minion touching her costs hearts and pushes her when it is Off; when On, neither.
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
J={'width':9,'pieces':[{'t':'straight','len':300}],'objects':[{'type':'bigminion','id':4,'x':30,'z':-100,'idle':True}]}
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
def trial(on):
    txt=pg.evaluate("()=>{var b=document.getElementById('dvinvBtn');return b.textContent}")
    want='Invulnerable: '+('On' if on else 'Off')
    if txt!=want: pg.evaluate("()=>document.getElementById('dvinvBtn').click()")
    e=[q for q in pg.evaluate("()=>__ens()") if q['big'] and q['act']][0]
    pg.evaluate("a=>__put(a[0],a[1],a[2])",[e['x']+0.2,e['fy'],e['z']]); pg.wait_for_timeout(600)
    s=pg.evaluate("()=>__state()"); return e,s,pg.evaluate("()=>document.getElementById('dvinvBtn').textContent")
e,s,t=trial(False); d0=((s['x']-e['x'])**2+(s['z']-e['z'])**2)**.5
print('Off:',t,'hp',s['hp'],'dist',round(d0,2)); assert s['hp']<3 or d0>0.5, 'Off should hurt or push'
hp_off=s['hp']
pg.wait_for_timeout(1500)
e,s,t=trial(True); d1=((s['x']-e['x'])**2+(s['z']-e['z'])**2)**.5
print('On: ',t,'hp',s['hp'],'dist',round(d1,2))
assert t=='Invulnerable: On' and s['hp']>=hp_off and d1<0.5
errs=[x for x in g.errs if 'flatShading' not in x and 'ERR_FAILED' not in x and 'GL Driver' not in x]; print('errors',errs[:3]); assert not errs
g.close(); print('OK')
