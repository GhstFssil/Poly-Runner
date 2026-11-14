# Rig Editor visual checks: close-ups of the model's joints, with a count of "see-inside" pixels (back faces showing through an opening, drawn green)
from righ import *
from PIL import Image, ImageDraw
import io, math
D="document.getElementById('rigHost').__rigdbg()"
PREP="""()=>{var d=document.getElementById('rigHost').__rigdbg(),R=document.getElementById('rigHost').shadowRoot;
  R.querySelector('#stage').style.background='#ff00ff';R.querySelector('#tri').style.display='none';
  d.scene.children.forEach(function(o){if(o.type==='GridHelper')o.visible=false;});d.controls.minDistance=0.15;d.controls.enableDamping=false;d.controls.maxPolarAngle=Math.PI;return 1}"""
# after every rebuild: hide the yellow highlight, add the green back-face copy
FIX="""(green)=>{var d=document.getElementById('rigHost').__rigdbg(),r=d.rigRoot;if(!r||!d.sk)return 0;
  r.children.forEach(function(o){if(o.name==='hl')o.visible=false;});
  var old=r.children.filter(function(o){return o.name==='__back'});old.forEach(function(o){r.remove(o)});
  if(green){var m=new THREE.SkinnedMesh(d.sk.geometry,new THREE.MeshBasicMaterial({color:0x00ff00,side:THREE.BackSide,skinning:true,polygonOffset:true,polygonOffsetFactor:6,polygonOffsetUnits:6}));m.name='__back';m.frustumCulled=false;r.add(m);m.bind(d.sk.skeleton,new THREE.Matrix4());}
  return 1}"""
CAM="""([t,dir,dist])=>{var d=document.getElementById('rigHost').__rigdbg();d.camera.fov=2*Math.atan(Math.tan(15*Math.PI/180)*dist/2.4)*180/Math.PI;d.camera.updateProjectionMatrix();d.controls.target.set(t[0],t[1],t[2]);d.camera.position.set(t[0]+dir[0]*2.4,t[1]+dir[1]*2.4,t[2]+dir[2]*2.4);d.controls.update();return 1}"""
BONE="""(n)=>{var d=document.getElementById('rigHost').__rigdbg(),b=d.bones[n];if(!b)return null;d.rigRoot.updateMatrixWorld(true);var v=new THREE.Vector3();b.getWorldPosition(v);return [v.x,v.y,v.z]}"""
VIEWS={'front':[0,0.12,1],'back':[0,0.12,-1],'left':[1,0.12,0],'right':[-1,0.12,0],'fl':[0.7,0.15,0.7],'fr':[-0.7,0.15,0.7],'bl':[0.7,0.15,-0.7],'br':[-0.7,0.15,-0.7],'top':[0,1,0.05],'under':[0,-0.9,0.4]}
import os
HTML=os.environ.get('RIGHTML','aud.html')
class V(Rig):
    def __init__(self, w=1040, h=800, **k):
        Rig.__init__(self, w=w, h=h, html=HTML, **k); self.ev('window.__noRender=true'); self.open(); self.ev(PREP); self.green=True; self.fix()
    def fix(self): self.pg.wait_for_timeout(250); self.ev(FIX, self.green)
    def mode(self, m, phase=None):
        self.click('#modes [data-m="%s"], #modes2 [data-m="%s"]'%(m,m), 150)
        if phase is not None:
            self.ev("(p)=>{var d=document.getElementById('rigHost').__rigdbg();d.ui.playing=false;d.ui.phase=p;}", phase)
        self.pg.wait_for_timeout(200)
    def bone(self, n): return self.ev(BONE, n)
    def cam(self, t, view, dist):
        v=VIEWS[view] if isinstance(view,str) else view; L=math.sqrt(sum(x*x for x in v)); self.ev(CAM,[t,[x/L for x in v],dist]); self.pg.wait_for_timeout(120)
    def grab(self, size=None):
        box=self.ev("(function(){var r="+self.q('#stage canvas')+".getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
        png=self.pg.screenshot(clip={'x':box[0],'y':box[1],'width':box[2],'height':box[3]})
        im=Image.open(io.BytesIO(png)).convert('RGB')
        if size:
            w,h=im.size; s=min(w,h); im=im.crop(((w-s)//2,(h-s)//2,(w-s)//2+s,(h-s)//2+s)).resize((size,size),Image.LANCZOS)
        return im
import numpy as np
def greens(im):
    a=np.asarray(im).astype(int); return int(((a[:,:,1]>200)&(a[:,:,0]<90)&(a[:,:,2]<90)).sum())
def sheet(items, cols, cell, path):
    rows=(len(items)+cols-1)//cols; S=Image.new('RGB',(cols*cell,rows*cell),(30,30,30)); dr=ImageDraw.Draw(S)
    for i,(label,im) in enumerate(items):
        x=(i%cols)*cell; y=(i//cols)*cell; S.paste(im.resize((cell,cell),Image.LANCZOS) if im.size!=(cell,cell) else im,(x,y))
        dr.rectangle([x,y,x+len(label)*6+6,y+13],fill=(0,0,0)); dr.text((x+3,y+1),label,fill=(255,255,255))
    S.save(path); return path
# count see-inside pixels for many views in one go (reads the canvas directly: no screenshots)
COUNT="""(views)=>{var d=document.getElementById('rigHost').__rigdbg(),gl=d.renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,buf=new Uint8Array(w*h*4),out=[];
  d.rigRoot.updateMatrixWorld(true);
  views.forEach(function(v){var t=v[0],dir=v[1],dist=v[2];if(typeof t==='string'){var b=d.bones[t],p=new THREE.Vector3();b.getWorldPosition(p);t=[p.x+(v[3]||0),p.y+(v[4]||0),p.z+(v[5]||0)];}
    d.camera.fov=2*Math.atan(Math.tan(15*Math.PI/180)*dist/2.4)*180/Math.PI;d.camera.updateProjectionMatrix();d.controls.target.set(t[0],t[1],t[2]);d.camera.position.set(t[0]+dir[0]*2.4,t[1]+dir[1]*2.4,t[2]+dir[2]*2.4);d.controls.update();d.renderer.render(d.scene,d.camera);
    gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,buf);var n=0,body=0;for(var i=0;i<buf.length;i+=4){if(buf[i+3]>0){body++;if(buf[i+1]>200&&buf[i]<90&&buf[i+2]<90)n++;}}out.push([n,body]);});
  return out}"""
