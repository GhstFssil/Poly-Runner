# Lock Heading: the Caps Lock press that turns Free Look on turns Molly once along the path under her; 1 s cooldown; a turn over 30 degrees above 20 Zips trips her
from righ import *
import sys, math
html = sys.argv[1] if len(sys.argv) > 1 else 'aud.html'
g = Rig(w=320, h=200, draw=False, html=html); pg = g.pg
pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})", ['bLevels', 'bLevel1', 'pcLast']); pg.wait_for_timeout(6000)
ok = True
def chk(name, c, L=None):
    global ok; ok = ok and c; print(('PASS ' if c else 'FAIL ') + name + ('' if c else '  %s' % lh()))
def wrap(a): return (a + math.pi) % (2 * math.pi) - math.pi
def lh(): return pg.evaluate("__lh()")
def caps(): pg.keyboard.press('CapsLock'); pg.wait_for_timeout(60)
p0 = lh()[0]
chk('a path under her at the start', p0 is not None)
pg.evaluate("(h)=>__st({speed:0,heading:h,yaw:h})", p0 + 0.35); caps(); L = lh()
chk('Free Look on, turned onto the path (off by %.3f)' % wrap(L[1] - p0), L[4] and abs(wrap(L[1] - p0)) < 0.02)
# from here she stays in Free Look while her heading is set (out of it, standing still, she turns to face the camera), then off and on again
def reon(): caps(); chk('  (off between)', not lh()[4]); caps()
CD = """(h)=>{function k(){document.dispatchEvent(new KeyboardEvent('keydown',{code:'CapsLock'}));}
  __st({heading:h,yaw:h}); k(); k(); var a=__lh(); __st({heading:h,yaw:h}); k(); k(); return [a, __lh()];}"""
pg.wait_for_timeout(1100); A, L = pg.evaluate(CD, p0 + 0.35)
chk('press after the cooldown turns her (off by %.3f)' % wrap(A[1] - p0), A[4] and abs(wrap(A[1] - p0)) < 0.02)
chk('press again at once: no turn (cooldown %.0f ms left)' % L[2], L[4] and abs(wrap(L[1] - p0 - 0.35)) < 0.01 and L[2] > 900)
pg.wait_for_timeout(1100)
pg.evaluate("(h)=>__st({heading:h,yaw:h})", p0 + 2.9); reon(); L = lh()
chk('facing back along the path: turns to the nearer way (off by %.3f)' % wrap(L[1] - p0 - math.pi), abs(wrap(L[1] - p0 - math.pi)) < 0.02)
pg.wait_for_timeout(1100)
pg.evaluate("(h)=>__st({heading:h,yaw:h,speed:30*2})", p0 + 0.8); reon(); L = lh()
chk('45 degrees off at 30 Zips: she trips, heading kept', L[3] and abs(wrap(L[1] - p0 - 0.8)) < 0.01)
chk('off the path: no path heading', pg.evaluate("(function(){var p=[__dbg().x,__dbg().y,__dbg().z];__pos(p[0]+60,p[1],p[2]);var r=__lh()[0];__pos(p[0],p[1],p[2]);return r})()") is None)
errs = [e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GL Driver' not in e]
chk('no page errors %s' % errs[:2], not errs)
print('ALL PASS' if ok else 'SOME FAILED'); g.close()
