# smoke probe for both official levels: ground height, slope and mud on a grid (in the level's own coordinates),
# a short run, and a screenshot of each start. Coordinates are relative to the level's origin, so it still works
# after the play space moves.
#   python3 lvprobe.py save BASE.json    record a baseline
#   python3 lvprobe.py BASE.json         compare against it (PASS/FAIL)
import sys, json, os
sys.path.insert(0, '/home/claude/poly-runner/tests')
from righ import *
save = sys.argv[1] == 'save'; base = sys.argv[2] if save else sys.argv[1]
shotdir = '/tmp/polyrun-work/probe/'; os.makedirs(shotdir, exist_ok=True)
g = Rig(w=640, h=400, draw=True); pg = g.pg
GRIDS = {'bLevel1': (range(-300, 301, 30), range(200, -7700, -60)), 'bLevel2': (range(-400, 2601, 50), range(500, -3001, -50))}
out = {}
for bid, (xs, zs) in GRIDS.items():
    pg.evaluate("()=>{try{showScreen('levels')}catch(e){}}"); pg.evaluate("b=>document.getElementById(b).click()", bid); pg.wait_for_timeout(3000)
    r = pg.evaluate("""([xs,zs])=>{var d=__dbg(),S=d.SB,OX=d.x-(S&&S.startPt?S.startPt.x:0),h=[],gr=[],m=[];
      for(var x of xs)for(var z of zs){var X=OX+x;h.push(+__gh(X,z).toFixed(3));var q=__gg(X,z);gr.push(+q[0].toFixed(3),+q[1].toFixed(3));m.push(__mudAt(X,z)?1:0);}
      return {OX:OX,start:[d.x-OX,d.y,d.z],h:h,gr:gr,m:m}}""", [list(xs), list(zs)])
    pg.evaluate("()=>__st({speed:0,vy:0})"); pg.wait_for_timeout(1500); pg.screenshot(path=shotdir + bid + ('_base' if save else '') + '.png')
    pg.evaluate("()=>__keys({KeyW:true,w:true,ArrowUp:true})"); pg.wait_for_timeout(10000)
    d = pg.evaluate("()=>{__keys({KeyW:false,w:false,ArrowUp:false});var d=__dbg();return [d.x,d.y,d.z,d.hp]}")
    r['run'] = [d[0] - r['OX'], d[1], d[2], d[3]]; del r['OX']; out[bid] = r
errs = [e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GL Driver' not in e]
g.close()
if save:
    json.dump(out, open(base, 'w')); print('saved', base, 'errors', errs[:3]); sys.exit()
B = json.load(open(base)); ok = not errs
for bid, r in out.items():
    b = B[bid]
    dh = max(abs(a - c) for a, c in zip(r['h'], b['h'])); dg = max(abs(a - c) for a, c in zip(r['gr'], b['gr']))
    dm = sum(a != c for a, c in zip(r['m'], b['m'])); ds = max(abs(a - c) for a, c in zip(r['start'], b['start']))
    run = 'run from z %.0f to %.0f (base %.0f), hp %s (base %s)' % (r['start'][2], r['run'][2], b['run'][2], r['run'][3], b['run'][3])
    good = dh < 1e-3 and dg < 1e-3 and dm == 0 and ds < 1e-3 and r['run'][3] == b['run'][3] and abs(r['run'][2] - b['run'][2]) < 0.15 * abs(b['run'][2] - b['start'][2]) + 5
    print('%s: height diff %.4f, slope diff %.4f, mud diffs %d, start diff %.4f; %s %s' % (bid, dh, dg, dm, ds, run, 'ok' if good else 'DIFF'))
    ok = ok and good
print('errors', errs[:3]); print('screenshots in', shotdir, '(compare *_base.png by eye if needed)')
print('PASS' if ok else 'FAIL')
