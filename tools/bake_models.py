# Bakes the built-in runner models from the shipped settings (the molly-settings and comet-settings script tags), using the Rig Editor's own
# Save to game export in a headless browser with empty storage, and writes them into checker-run.html as molly-glb and comet-glb.
# Needs the test harness (sh tests/setup.sh once). Run from the repo root:  python3 tools/bake_models.py
import os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tests'))
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

p = os.path.join(ROOT, 'checker-run.html'); s = open(p).read()
s = re.sub(r'(<script id="molly-glb" type="text/plain">)[^<]*(</script>)', lambda m: m.group(1) + molly + m.group(2), s, count=1)
if '<script id="comet-glb"' in s:
    s = re.sub(r'(<script id="comet-glb" type="text/plain">)[^<]*(</script>)', lambda m: m.group(1) + comet + m.group(2), s, count=1)
else:
    m = re.search(r'<script id="molly-glb" type="text/plain">[^<]*</script>', s)
    s = s[:m.end()] + '\n<script id="comet-glb" type="text/plain">' + comet + '</script>' + s[m.end():]
open(p, 'w').write(s)
print('molly-glb %d bytes, comet-glb %d bytes (base64)' % (len(molly), len(comet)))
