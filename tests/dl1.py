# Dash Line: shown only while a Dodecadash charges, 200 units ahead along her heading, on the ground
from righ import *
import sys, math
html = sys.argv[1] if len(sys.argv) > 1 else 'aud.html'
g = Rig(w=320, h=200, draw=False, html=html); pg = g.pg
pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})", ['bLevels', 'bLevel1', 'pcLast']); pg.wait_for_timeout(6000)
ok = True
def chk(name, c):
    global ok; ok = ok and c; print(('PASS ' if c else 'FAIL ') + name)
chk('hidden before charging', not pg.evaluate("__dashLine()[0]"))
pg.evaluate("__st({segs:100,ballOn:true,speed:0})"); pg.wait_for_timeout(300)
pg.evaluate("__keys({s:true,w:false})"); pg.wait_for_timeout(1200)
d = pg.evaluate("__dashLine()"); hd = pg.evaluate("__hd()"); x, z = pg.evaluate("[__dbg().x,__dbg().z]")
chk('shown while charging', d[0])
fx, fz = -math.sin(hd[0]), -math.cos(hd[0])
L = (d[2][0] - x) * fx + (d[2][2] - z) * fz
chk('last dot 200 units ahead (%.1f)' % L, abs(L - 200) < 0.5)
gh = pg.evaluate("(p)=>__gh(p[0],p[2])", d[1])
chk('first dot on the ground (%.2f above)' % (d[1][1] - gh), abs(d[1][1] - gh - 0.08) < 0.01)
pg.evaluate("__keys({s:false})"); pg.wait_for_timeout(300)
chk('hidden after launch', not pg.evaluate("__dashLine()[0]"))
errs = [e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GL Driver' not in e]
chk('no page errors %s' % errs[:2], not errs)
print('ALL PASS' if ok else 'SOME FAILED'); g.close()
