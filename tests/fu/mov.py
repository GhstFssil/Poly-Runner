import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
def run(html):
    g=Rig(w=480,h=320,draw=False,html=html); pg=g.pg; out={}
    S="(function(){var d=__dbg(),s=__state();return [+d.x.toFixed(1),+d.y.toFixed(2),+(s.z||0).toFixed(1),+s.speed.toFixed(1),s.grounded?1:0,s.wallOn?1:0]})()"
    # A: Grass Canyon, W held, one jump at 3 s
    pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",['bTitle','bLevels','bLevel1']); pg.wait_for_timeout(6000)
    pg.keyboard.down('KeyW'); a=[]
    for i in range(6):
        pg.wait_for_timeout(1000); a.append(pg.evaluate(S))
        if i==2: pg.keyboard.press('Space')
    pg.keyboard.up('KeyW'); out['canyon']=a
    # B: a sandbox whose path banks up to a wall
    J={'width':9,'pieces':[{'t':'straight','len':60},{'t':'straight','len':150,'roll':90},{'t':'straight','len':100,'roll':90}],'terrain':''}
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(3500)
    pg.keyboard.down('KeyW'); b=[]
    for i in range(7):
        pg.wait_for_timeout(1000); b.append(pg.evaluate(S))
    pg.keyboard.up('KeyW'); out['wallpath']=b
    out['errs']=[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]
    g.close(); return out
A=run('aud_pre.html'); B=run('aud.html')
for k in ['canyon','wallpath']:
    print(k); 
    for i,(x,y) in enumerate(zip(A[k],B[k])): print(' t=%ds'%(i+1),'before',x,'| now',y)
print('errs',A['errs'],B['errs'])
