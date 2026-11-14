# does a saved Path Editor layout survive into this build? seed the layout under the editor's storage key, open the editor, count objects, and see what is stored after
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
S={"width":9,"pieces":[{"len":300}],"more":[],"objs":[{"t":"tree","x":10,"z":-20,"rot":0,"id":1},{"t":"gap","id":2,"x":30,"z":-40,"th":0,"bend":0,"len":30,"w":15,"follow":False,"rot":0},{"t":"tree","x":-10,"z":-60,"rot":0,"id":3}],"layers":[{"id":1,"name":"Layer 1","vis":True}],"activeLayer":1}
for h in ['aud_pre.html','aud.html']:
    g=Rig(w=900,h=600,draw=False,html=h,storage={'polyrun-path-editor-v2':json.dumps(S)}); pg=g.pg
    pg.click('#bDevT'); pg.click('#dtPath'); pg.wait_for_timeout(2500)
    r=pg.evaluate("(function(){var s=document.getElementById('peHost').shadowRoot,j=s&&s.getElementById('json');var v=j?JSON.parse(j.value):null;return {objects:v?v.objects.length:null,stored:(JSON.parse(localStorage.getItem('polyrun-path-editor-v2')||'null')||{objs:[]}).objs.length}})()")
    print(h,r,'errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:2]); g.close()
