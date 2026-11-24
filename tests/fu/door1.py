# doors: one behaviour; slide toward the bottom edge along the lean; linked doors only change mode; old layouts load
import sys,json,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
def door(extra):
    d={'type':'door','id':9,'s':40,'u':0,'width':12,'height':10}; d.update(extra)
    return {'width':9,'pieces':[{'t':'straight','len':300}],'objects':[d]}
def state():
    return pg.evaluate("""(function(){var m=__dbg().SB.movers.filter(function(q){return q.door})[0];var P=m.geo.attributes.position.array,V=[];for(var i=0;i<P.length;i+=3)V.push([+(P[i]-0).toFixed(2),+P[i+1].toFixed(2),+P[i+2].toFixed(2)]);
      return {k:+m.k.toFixed(3),dy:+m.dy.toFixed(2),sx:+m.sx.toFixed(2),sz:+m.sz.toFixed(2),tx:+(m.tx*180/Math.PI).toFixed(1),ys:[Math.min.apply(null,V.map(v=>v[1])),Math.max.apply(null,V.map(v=>v[1]))],zs:[Math.min.apply(null,V.map(v=>v[2])),Math.max.apply(null,V.map(v=>v[2]))]}})()""")
# 45 degree forward lean, always closed, then always open, sliding toward its bottom edge
pg.evaluate("j=>__sbStart(j)",door({'mode':'closed','shutTiltX':45,'openTiltX':45,'slide':'edge'})); pg.wait_for_timeout(1500); c=state()
pg.evaluate("j=>__sbStart(j)",door({'mode':'open','shutTiltX':45,'openTiltX':45,'slide':'edge'})); pg.wait_for_timeout(1500); o=state()
print('45° lean, shut:',c); print('45° lean, open (slid toward its bottom edge):',o)
h=10; print('expected slide: down %.2f and back along the way %.2f; got dy %.2f, horizontal %.2f'%(h*math.cos(math.pi/4),h*math.sin(math.pi/4),o['dy'],math.hypot(o['sx'],o['sz'])))
# straight down, as before
pg.evaluate("j=>__sbStart(j)",door({'mode':'open'})); pg.wait_for_timeout(1500); print('plain door, open (straight down):',{k:state()[k] for k in ('dy','sx','sz')})
# linked: closed before, open after; kill the minion and watch it ease open
L=door({'mode':'closed','links':[5],'after':{'mode':'open'},'shutTiltX':20,'openTiltX':-30,'slide':'none','speed':1})
L['objects'].append({'type':'minion','id':5,'x':20,'z':-120,'idle':True})
pg.evaluate("j=>__sbStart(j)",L); pg.wait_for_timeout(1200); s0=state()
pg.evaluate("""(function(){var e=__ens().filter(function(q){return q.act&&q.sbp})[0];__put(e.x,e.fy+e.H+0.5,e.z);__vy(-2);document.getElementById('dvpower').click()})()""")
pg.keyboard.press('Digit2'); pg.wait_for_timeout(100)
pg.evaluate("""(function(){var e=__ens().filter(function(q){return q.act&&q.sbp})[0];__put(e.x,e.fy+e.H+0.5,e.z);__vy(-2)})()"""); pg.wait_for_timeout(300)
dead=[q['dead'] for q in pg.evaluate("__ens()") if q['act'] and q['sbp']]
seq=[]
for i in range(8): seq.append(state()['tx']); pg.wait_for_timeout(200)
print('linked door: shut tilt',s0['tx'],'| minion beaten',dead,'| tilt as it opens over 1.6 s:',seq)
# an old layout with a whole second set of settings after: loads, and only the mode is used
old=door({'mode':'closed','links':[5],'after':{'mode':'open','speed':3,'openTiltX':80,'sink':False}})
old['objects'].append({'type':'minion','id':5,'x':20,'z':-120,'idle':True})
pg.evaluate("j=>__sbStart(j)",old); pg.wait_for_timeout(800)
print('old layout: modeA',pg.evaluate("__dbg().SB.movers.filter(function(q){return q.door})[0].o.modeA"),'slide',pg.evaluate("__dbg().SB.movers.filter(function(q){return q.door})[0].o.cfgB.slide"))
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
