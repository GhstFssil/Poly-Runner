#!/usr/bin/env python3
"""Build the two downloads from this repository (used by the GitHub Action, and works locally too):
   <out>/polyrunner-game-<version>.zip                the offline game folder (paste over ~/.config/PolyRun/game, or open game/index.html)
   <out>/polyrunner-desktop-<app version>.zip          the desktop app source with that game inside (run build-and-install.sh)
Usage: python3 tools/build_release.py <three dir> <@fontsource dir> <out dir>
   <three dir>: node_modules/three (r128); <@fontsource dir>: node_modules/@fontsource
Prints the game version; under GitHub Actions it also writes version= and app= to $GITHUB_OUTPUT."""
import os, re, sys, json, shutil, zipfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TH, FS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
st = os.path.join(OUT, 'stage'); shutil.rmtree(st, ignore_errors=True); G = os.path.join(st, 'game'); os.makedirs(G + '/lib'); os.makedirs(G + '/fonts')
for src, dst in [('build/three.min.js', 'three.min.js'), ('examples/js/loaders/GLTFLoader.js', 'GLTFLoader.js'), ('examples/js/controls/OrbitControls.js', 'OrbitControls.js'), ('examples/js/exporters/GLTFExporter.js', 'GLTFExporter.js')]:
    shutil.copy(os.path.join(TH, src), G + '/lib/' + dst)
fonts = [('Rubik', 'rubik', [500, 700]), ('DM Mono', 'dm-mono', [400, 500]), ('Press Start 2P', 'press-start-2p', [400]), ('IBM Plex Sans', 'ibm-plex-sans', [400, 500, 600]), ('IBM Plex Mono', 'ibm-plex-mono', [400, 500])]
css = []
for fam, pk, ws in fonts:
    for w in ws:
        fn = '%s-latin-%d-normal.woff2' % (pk, w); shutil.copy(os.path.join(FS, pk, 'files', fn), G + '/fonts/' + fn)
        css.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;src:url(fonts/%s) format('woff2');}" % (fam, w, fn))
open(G + '/fonts.css', 'w').write('\n'.join(css) + '\n')
s = open(os.path.join(ROOT, 'poly-runner.html'), encoding='utf-8').read()
for a, b in [('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'lib/three.min.js'), ('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', 'lib/GLTFLoader.js'),
             ('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', 'lib/OrbitControls.js'), ('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/GLTFExporter.js', 'lib/GLTFExporter.js')]:
    s = s.replace(a, b)
s = re.sub(r'<link rel="preconnect"[^>]*>\n', '', s)
s = re.sub(r'<link href="https://fonts.googleapis.com[^>]*>', '<link rel="stylesheet" href="fonts.css">', s, count=1)
s = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>', '', s, count=1)
assert 'googleapis' not in s and 'cdnjs' not in s and 'jsdelivr' not in s, 'an online link is left in the offline game'
open(G + '/index.html', 'w', encoding='utf-8').write(s)
ver = re.search(r'<div class="ver">(v[0-9.]+)</div>', s).group(1)
app = json.load(open(os.path.join(ROOT, 'desktop', 'package.json')))['version']
def zipdir(zpath, base, top):
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, _, fs in os.walk(os.path.join(base, top)):
            for f in sorted(fs):
                p = os.path.join(d, f); arc = os.path.relpath(p, base); info = zipfile.ZipInfo.from_file(p, arc)
                info.compress_type = zipfile.ZIP_DEFLATED
                if f.endswith('.sh'): info.external_attr = (0o755 << 16)
                with open(p, 'rb') as fh: z.writestr(info, fh.read())
gz = os.path.join(OUT, 'polyrunner-game-%s.zip' % ver); zipdir(gz, st, 'game')
D = os.path.join(st, 'polyrunner-desktop'); shutil.copytree(os.path.join(ROOT, 'desktop'), D, ignore=shutil.ignore_patterns('node_modules', 'dist', 'game')); shutil.copytree(G, D + '/game')
dz = os.path.join(OUT, 'polyrunner-desktop-%s.zip' % app); zipdir(dz, st, 'polyrunner-desktop')
print(ver, app, gz, dz)
if os.environ.get('GITHUB_OUTPUT'):
    with open(os.environ['GITHUB_OUTPUT'], 'a') as f: f.write('version=%s\napp=%s\n' % (ver, app))
