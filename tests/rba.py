# before / after sheets on the editor's own background
import os,sys,json
from rv import *
def shots(html, mode, ph, specs):
    os.environ['RIGHTML']=html
    import importlib, rv; importlib.reload(rv)
    g=rv.V(); g.green=False; g.fix()
    g.ev("()=>{var R=document.getElementById('rigHost').shadowRoot;R.querySelector('#stage').style.background='#d9d6d2';}")
    g.mode(mode,ph); g.pg.wait_for_timeout(300); out=[]
    for bone,dy,view,dist in specs:
        b=g.bone(bone); g.cam([b[0],b[1]+dy,b[2]],view,dist); g.pg.wait_for_timeout(150); out.append(g.grab(560))
    g.close(); return out
mode=sys.argv[1]; ph=None if sys.argv[2]=='-' else float(sys.argv[2]); specs=json.loads(sys.argv[3]); out=sys.argv[4]
a=shots('aud_old.html',mode,ph,specs); b=shots('aud.html',mode,ph,specs)
items=[('BEFORE  %s'%s[2],im) for s,im in zip(specs,a)]+[('AFTER  %s'%s[2],im) for s,im in zip(specs,b)]
print(sheet(items,len(specs),int(1536/len(specs)),out))
