# Bakes the built-in runner models from the shipped settings (the molly-settings and comet-settings script tags), using the Rig Editor's own
# Save to Game export in a headless browser with empty storage, and writes them to src/data/molly.glb and comet.glb (the build embeds them as molly-glb and comet-glb), then rebuilds the game file.
# Needs the test harness (sh tests/setup.sh once). Run from the repo root:  python3 tools/bake_models.py
import base64, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tests'))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build
subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools', 'build.py')], stdout=subprocess.DEVNULL)   # the test copy is made from the built game file
subprocess.check_call([sys.executable, os.path.join(ROOT, 'tests', 'mk_test.py')], stdout=subprocess.DEVNULL)
from righ import Rig, R

CAPTURE = """() => { var h = document.getElementById('rigHost'); window.__bk = null;
  h.__save = function (buf, json, done) { var u = new Uint8Array(buf), t = ''; for (var i = 0; i < u.length; i += 0x8000) t += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); window.__bk = btoa(t); if (done) done('ok'); }; }"""

def export(g):
    g.ev(CAPTURE); g.click('#exportGlb', 200)
    for _ in range(240):
        b = g.ev("window.__bk")
        if b: return b
        g.pg.wait_for_timeout(250)
    raise SystemExit('export did not finish')

g = Rig(w=1100, h=760); g.open()
molly = export(g)
g.click('#pages button[data-pg="comet"]', 2500)
comet = export(g)
errs = [e for e in g.errs if 'flatShading' not in e and 'normalized normal' not in e and 'ERR_FAILED' not in e and 'GPU stall' not in e]
g.close()
if errs: print('warnings:', errs[:4])

for name, b in (('molly', molly), ('comet', comet)):
    with open(os.path.join(build.SRC, 'data', name + '.glb'), 'wb') as f: f.write(base64.b64decode(b))
build.write()
print('molly.glb %d bytes, comet.glb %d bytes' % (len(base64.b64decode(molly)), len(base64.b64decode(comet))))
