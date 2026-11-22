import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
# Oceana ground (terrain 'level2'): bubbles rise off the poisoned low ground near her (there were none before), none on the path, and they stay under the cap. (Hearts lost is shown but timing-dependent.)
g=Rig(w=480,h=320,draw=False); pg=g.pg
X=60000
J={'width':20,'terrain':'level2','pieces':[{'t':'straight','len':1200}],'objects':[]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2500)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(2000)
res=[]
for x,z in [(1672,-1000),(1700,-900),(1620,-1150),(1672,-1300),(1550,-800),(0,-300)]:
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(800)
    yy=pg.evaluate("([x,z])=>__gH(x,z)",[X+x,z]); hp0=pg.evaluate("__dbg().hp")
    for k in range(16): pg.evaluate("([x,y,z])=>__put(x,y,z)",[X+x,yy,z]); pg.wait_for_timeout(250)
    res.append((x,z,round(yy,1),pg.evaluate("__bub()"),hp0-pg.evaluate("__dbg().hp")))
cells=pg.evaluate("(function(){var m=__dbg().SB.toxCells,a=[];if(m)m.forEach(function(v){if(v)a.push(v[1])});a.sort(function(p,q){return p-q});return [m?m.size:0,a.length,a[0],a[a.length-1]]})()")
print('poisoned cells cached (looked at, poisoned, lowest y, highest y):',cells)
print('(x, z, ground y, bubbles, hearts lost):',res)
print('bubbles at every poisoned spot:',all(c>0 for *_,c,h in res[:5]),' none on the plain path:',res[5][3]==0,' all under cap 500:',all(c<=500 for _,_,_,c,_ in res))
print('errors',[e for e in g.errs if 'GPU stall' not in e and 'flatShading' not in e and 'ERR_FAILED' not in e][:5])
g.close()
