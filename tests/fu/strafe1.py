# Strafe distance stat: default is one tile (2 units); a set value changes how far Q/E moves her; the Rig Editor shows the row
import sys,json,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[]}
def run(stats):
    g=Rig(w=480,h=320,draw=False,storage=({'runnerRig2':json.dumps(stats)} if stats else None)); pg=g.pg
    pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
    pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
    pg.evaluate("__put(60000,0,-30)"); pg.wait_for_timeout(300)
    a=pg.evaluate("__state()"); pg.keyboard.press('KeyE'); pg.wait_for_timeout(400); b=pg.evaluate("__state()")
    pg.keyboard.press('KeyQ'); pg.wait_for_timeout(400); c=pg.evaluate("__state()")
    g.close()
    return round(math.hypot(b['x']-a['x'],b['z']-a['z']),2), round(math.hypot(c['x']-b['x'],c['z']-b['z']),2)
print('default  (E, Q):',run(None))
print('strafe 6 (E, Q):',run({'stat.strafe':6}))
print('strafe 0 -> held to 0.25 (E):',run({'stat.strafe':0})[0])
g=Rig(w=900,h=600,draw=False); g.open(); print('row in Rig Editor:',g.ev("!!document.getElementById('rigHost').shadowRoot.querySelector('[data-k=\"stat.strafe\"]')||!!document.getElementById('rigHost').shadowRoot.innerHTML.includes('Strafe distance')")); g.close()
