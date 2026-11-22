# Rig Editor drift: the preview is her fast run with the lean, its stats change it, and a saved model plays the drift clips in the game while drifting
import sys; sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
SP=sys.argv[1] if len(sys.argv)>1 else '/tmp'
g=Rig(w=1100,h=760); g.open(); pg=g.pg
g.click('#modes2 button[data-m="drift"]',400); g.click('#views button[data-v="front"]',300)
print('stats:',g.ev(R+".querySelectorAll('#animKey input[type=range]').length"),'note:',g.ev(R+".querySelector('#animNote').textContent")[:60])
g.ev(g.q('#play')+".click()"); pg.wait_for_timeout(300)
pg.screenshot(path=SP+'/drift_a.png')
print(g.typed('dA.aLp',120,300), g.typed('dA.hp',20,300))
pg.screenshot(path=SP+'/drift_b.png')
g.click('#exportGlb',200); pg.wait_for_timeout(9000); print('status:',g.ev(g.q('#status')+'.textContent'))
g.click('#rigClose',300)
pg.evaluate("document.getElementById('dtBlank').click()"); pg.wait_for_timeout(2500)
pg.evaluate("()=>{__put(60000,__gH(60000,-10),-10);__hd(0)}"); pg.keyboard.down('KeyW')
for i in range(8): pg.evaluate("__spd(90)"); pg.wait_for_timeout(100)
pg.keyboard.down('KeyA'); r=[]
for i in range(8): pg.evaluate("__spd(90)"); pg.wait_for_timeout(150); r.append(pg.evaluate("__lean()")[2:])
pg.keyboard.up('KeyA'); pg.keyboard.up('KeyW')
print('drifting: [driftBlend, body z, has clips, model has run drift, drift clip weight]', r[-1])
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GPU stall' not in e][:4]); g.close()
