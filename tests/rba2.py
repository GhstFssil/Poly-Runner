# before / after sheet with a pose per picture, on the editor's own background
import os,sys,json
from PIL import Image, ImageDraw
def shots(html, specs):
    os.environ['RIGHTML']=html
    import importlib, rv; importlib.reload(rv)
    g=rv.V(w=1200,h=900); g.green=False; g.fix()
    g.ev("()=>{var R=document.getElementById('rigHost').shadowRoot;R.querySelector('#stage').style.background='#dcd9d5';}")
    out=[]; last=None
    for mode,ph,bone,dy,view,dist in specs:
        if (mode,ph)!=last: g.mode(mode,ph); g.pg.wait_for_timeout(350); last=(mode,ph)
        b=g.bone(bone); g.cam([b[0],b[1]+dy,b[2]],view,dist); g.pg.wait_for_timeout(180); out.append(g.grab(640))
    g.close(); return out
specs=json.loads(sys.argv[1]); labels=json.loads(sys.argv[2]); out=sys.argv[3]
a=shots('aud_old.html',specs); b=shots('aud.html',specs)
n=len(specs); cell=int(1536/n); S=Image.new('RGB',(n*cell,2*cell+2*26),(245,243,240)); dr=ImageDraw.Draw(S)
for r,(tag,ims) in enumerate([('Before',a),('After',b)]):
    y0=r*(cell+26)
    for i,im in enumerate(ims):
        S.paste(im.resize((cell,cell),Image.LANCZOS),(i*cell,y0+26)); dr.text((i*cell+8,y0+7),'%s: %s'%(tag,labels[i]),fill=(40,30,25))
S.save(out); print(out)
