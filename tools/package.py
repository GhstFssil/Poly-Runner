#!/usr/bin/env python3
"""Build the two things Ricky installs, from this repository (run tools/mk_electron.py first; it writes the offline game folder):
   /home/claude/polyrunner-game-vNNN.zip      the game folder alone (paste over ~/.config/PolyRun/game, or run it in a browser)
   /home/claude/polyrunner-desktop-X.Y.zip    the desktop app source + the game folder, for build-and-install.sh
Usage: python3 tools/package.py <game version, e.g. v175>"""
import sys, os, shutil, subprocess, json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); W='/tmp/polyrun-work'; G=W+'/electron-src/game'
ver=sys.argv[1]; dv=json.load(open(ROOT+'/desktop/package.json'))['version']
st=W+'/stage'; shutil.rmtree(st,ignore_errors=True); os.makedirs(st+'/g'); os.makedirs(st+'/d')
shutil.copytree(G,st+'/g/game'); subprocess.check_call(['zip','-qr','/home/claude/polyrunner-game-%s.zip'%ver,'game'],cwd=st+'/g')
shutil.copytree(ROOT+'/desktop',st+'/d/polyrunner-desktop',ignore=shutil.ignore_patterns('node_modules','dist','game')); shutil.copytree(G,st+'/d/polyrunner-desktop/game')
subprocess.check_call(['zip','-qr','/home/claude/polyrunner-desktop-%s.zip'%dv,'polyrunner-desktop'],cwd=st+'/d')
print('built', ver, dv)
