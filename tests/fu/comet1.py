# Comet: pick her, Star Throw (tap, charge, auto-release, cooldown, no power), Hover (cost, drain, float, own stats, no toxic/plates), Fly (lift), a star kills a minion and breaks a target, Molly keeps strafe
import sys; sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=640,h=420,draw=False); pg=g.pg
C=lambda: pg.evaluate("__comet()")
pg.click('#bChars'); pg.wait_for_timeout(400)
print('cards:',pg.evaluate("[...document.querySelectorAll('#charStats .pickChar')].map(b=>b.textContent)"))
pg.evaluate("document.querySelector('#charStats .pickChar[data-ch=comet]').click()"); pg.wait_for_timeout(1500)
print('after Play as Comet:',pg.evaluate("[...document.querySelectorAll('#charStats .pickChar')].map(b=>b.textContent)"),'char',C()['char'],'saved',pg.evaluate("localStorage.getItem('pr_char')"))
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[{'type':'minion','id':1,'x':0,'z':-390},{'type':'target','id':2,'x':0,'z':-80,'size':6,'height':3},{'type':'plate','id':3,'x':0,'z':-10,'width':8,'length':8}]}
pg.evaluate("document.getElementById('chBack').click()"); pg.evaluate("document.getElementById('bDevT').click()"); pg.evaluate("document.getElementById('dtBlank').click()"); pg.wait_for_timeout(2000)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(2000)
def put(x,z): pg.evaluate("([x,z])=>{__put(0+x,__gH(0+x,z),z);__hd(0);__spd(0)}",[x,z])
def wait_until(js,ms=15000):
    t=0
    while t<ms:
        if pg.evaluate(js): return True
        pg.wait_for_timeout(100); t+=100
    return False
put(0,0); pg.evaluate("__setPower(50)")
pg.keyboard.down('KeyQ'); pg.wait_for_timeout(60); pg.keyboard.up('KeyQ'); pg.wait_for_timeout(100); c=C()
print('tap Q: power',c['power'],'stars',c['stars'],'cooldown s',round(c['cool'],2))
pg.keyboard.down('KeyE'); pg.wait_for_timeout(60); pg.keyboard.up('KeyE'); pg.wait_for_timeout(100); print('E again during cooldown: stars in flight',len(C()['stars']),'power',C()['power'])
wait_until("__comet().cool<=0")
pg.keyboard.down('KeyE'); wait_until("__comet().lvl>=2"); pg.keyboard.up('KeyE'); pg.wait_for_timeout(60); c=C()
print('held E to 2 s: power',c['power'],'(50-1-1-4=44) star [radius, damage, range left]',c['stars'][-1] if c['stars'] else None)
wait_until("__comet().cool<=0")
pg.evaluate("__setPower(20)"); pg.keyboard.down('KeyQ'); ok=wait_until("!__comet().charging",20000); c=C(); pg.keyboard.up('KeyQ')
print('held Q past 3 s: released by itself',ok,'level',c['lvl'],'power',c['power'],'(20-1-6=13)')
wait_until("__comet().cool<=0")
pg.evaluate("__setPower(2)"); pg.keyboard.down('KeyQ'); ok=wait_until("!__comet().charging",8000); c=C(); pg.keyboard.up('KeyQ')
print('power 2, held: released when it could not pay',ok,'level',c['lvl'],'power',c['power'])
wait_until("__comet().cool<=0"); pg.evaluate("__setPower(0)"); pg.keyboard.press('KeyQ'); pg.wait_for_timeout(150); print('power 0: cooldown started?',C()['cool']>0)
# star vs minion and target: charged once (1 heart) kills the minion
wait_until("__comet().cool<=0"); J2={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[{'type':'minion','id':1,'x':0,'z':-30}]}; pg.evaluate("j=>__sbStart(j)",J2); pg.wait_for_timeout(1500); pg.evaluate("__setPower(50)"); put(0,-14)
mh=lambda: pg.evaluate("(function(){var e=__ens().filter(function(q){return q.x>-9e6&&q.x<9e6})[0];return e?[e.hearts,e.dead]:null})()")
print('minion before:',mh())
pg.keyboard.down('KeyQ'); wait_until("__comet().lvl>=1"); pg.keyboard.up('KeyQ'); pg.wait_for_timeout(1500); print('minion after a 1 s charged star:',mh())
wait_until("__comet().cool<=0"); pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500); pg.evaluate("__setPower(50)"); put(0,-60)
for i in range(2):
    pg.keyboard.press('KeyQ'); pg.wait_for_timeout(600); wait_until("__comet().cool<=0")
print('target after two plain stars (half a heart each):',pg.evaluate("__dbg().SB.targets.map(function(t){return [t.on,t.hp]})"))
# hover
put(0,0); pg.evaluate("__setPower(20)"); pg.keyboard.press('Digit2'); pg.wait_for_timeout(300); c=C()
print('hover on: ',c['hov'],'power',c['power'],'(20-6)','body lifted',c['bodyY'],'top speed',c['top'])
put(0,-10); pg.wait_for_timeout(800); print('hovering over the plate: pressed?',pg.evaluate("__dbg().SB.plates[0].on"))
p0=C()['power']; pg.wait_for_timeout(2000); print('power after 2 s of hover',C()['power'],'from',p0)
pg.evaluate("__setPower(60)"); put(0,0); pg.keyboard.down('Space'); pg.wait_for_timeout(1500); c=C(); pg.keyboard.up('Space')
print('space held while hovering: flying',c['fly'],'y',c['y'],'vy',c['vy'],'power',c['power'])
pg.keyboard.press('Digit2'); pg.wait_for_timeout(200); print('2 again: hover',C()['hov'])
# Molly: strafe still on Q/E, Barrier on 2
pg.evaluate("__setChar('molly')"); pg.wait_for_timeout(1200); put(0,0); x0=pg.evaluate("__dbg().x"); pg.keyboard.press('KeyE'); pg.wait_for_timeout(300)
print('Molly: E strafes',round(pg.evaluate("__dbg().x")-x0,2),'stars',len(C()['stars']))
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GPU stall' not in e][:5]); g.close()
