#!/usr/bin/env python3
"""Rebuild the offline game folder for the desktop app from the working game file.
Usage: python3 mk_electron.py   ->  /tmp/polyrun-work/electron-src/game/ (and /tmp/polyrun-work/polyrun-desktop.zip, /tmp/polyrun-work/polyrun-game-update.zip)"""
import re, shutil, os, subprocess
SRC='/home/claude/poly-runner/poly-runner.html'; OUT='/tmp/polyrun-work/electron-src/game'
TH='/tmp/polyrun-work/t/node_modules/three'
FS='/tmp/fx/node_modules/@fontsource'
shutil.rmtree(OUT,ignore_errors=True); os.makedirs(OUT+'/lib'); os.makedirs(OUT+'/fonts')
for src,dst in [(TH+'/build/three.min.js','three.min.js'),(TH+'/examples/js/loaders/GLTFLoader.js','GLTFLoader.js'),(TH+'/examples/js/controls/OrbitControls.js','OrbitControls.js'),(TH+'/examples/js/exporters/GLTFExporter.js','GLTFExporter.js')]:
    shutil.copy(src,OUT+'/lib/'+dst)
fonts=[('Rubik','rubik',[500,700]),('DM Mono','dm-mono',[400,500]),('Press Start 2P','press-start-2p',[400]),('IBM Plex Sans','ibm-plex-sans',[400,500,600]),('IBM Plex Mono','ibm-plex-mono',[400,500])]
css=[]
for fam,pk,ws in fonts:
    for w in ws:
        fn='%s-latin-%d-normal.woff2'%(pk,w); shutil.copy('%s/%s/files/%s'%(FS,pk,fn),OUT+'/fonts/'+fn)
        css.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;src:url(fonts/%s) format('woff2');}"%(fam,w,fn))
open(OUT+'/fonts.css','w').write('\n'.join(css)+'\n')
s=open(SRC).read()
s=s.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','lib/three.min.js')
s=s.replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','lib/GLTFLoader.js')
s=s.replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js','lib/OrbitControls.js')
s=s.replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/GLTFExporter.js','lib/GLTFExporter.js')
s=re.sub(r'<link rel="preconnect"[^>]*>\n','',s)
s=re.sub(r'<link href="https://fonts.googleapis.com[^>]*>','<link rel="stylesheet" href="fonts.css">',s,count=1)
s=re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>','',s,count=1)
assert 'googleapis' not in s and 'cdnjs' not in s and 'jsdelivr' not in s
open(OUT+'/index.html','w').write(s)
print('ok',len(s))
