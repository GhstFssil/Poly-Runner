# Hair locks (step 4): one ring of locks round the hairline. Defaults give the old three bangs; partners mirror each other; the length, count and per-lock stats
# change the right locks; clicking a lock on the model picks it; old saved stats with Bang Length (bangL) become the front length; Reset Part puts the hair back
import sys, os, json; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from righ import *
ok=True
def chk(name, c, extra=''):
    global ok; ok = ok and bool(c); print('PASS' if c else 'FAIL', name, extra)
D="document.getElementById('rigHost').__rigdbg()"
LOCKS="()=>{var d=%s;return d.hairLocks().map(function(l){return [l.i,l.k,l.t1-l.t0]})}"%D
# the figure-space corners of one lock's triangles (from the built mesh), rounded, as a sorted list; mir: x negated
VERTS="""([i,mir])=>{var d=%s,l=d.hairLocks().filter(function(q){return q.i===i})[0];if(!l)return null;var p=d.sk.geometry.attributes.position.array,h=d.ranges.Head[0],o=[];
  for(var t=l.t0;t<l.t1;t++){var tri=[];for(var k=0;k<3;k++){var v=h+3*t+k;tri.push([Math.round((mir?-p[3*v]:p[3*v])*2e3),Math.round(p[3*v+1]*2e3),Math.round(p[3*v+2]*2e3)].join(','));}o.push(tri.sort().join('|'));}
  return o.sort();}"""%D
def setP(k,v,w=900): g.ev("([k,v])=>%s.setP(k,v)"%D,[k,v]); g.pg.wait_for_timeout(w)

g=Rig(w=1000,h=760); g.open()
g.click('#chips .chip[data-id="Head"]',600)
L=g.ev(LOCKS)
chk('defaults: three front locks (the old bangs), front one alone and pair 1', [x[:2] for x in L]==[[0,0],[1,1],[13,1]], L)
chk('partners are mirror images', g.ev(VERTS,[1,0])==g.ev(VERTS,[13,1]))
a0=g.ev(VERTS,[0,0]); b0=set(g.ev(VERTS,[0,1]))
chk('front lock is its own mirror image but for its underside strip across the centre line (BACKLOG)', sum(1 for t in a0 if t in b0)>=len(a0)-10, (sum(1 for t in a0 if t in b0),len(a0)))
m=g.mesh(); chk('mesh sound', m['nan']==0 and m['wnan']==0, m)

setP('hair.lenS',1.5); setP('hair.lenB',2)
L=g.ev(LOCKS); chk('side and back lengths add locks all round', len(L)==14, len(L))
setP('hair.count',10); L=g.ev(LOCKS); chk('lock count 10', len(L)==10 and max(x[0] for x in L)==9, len(L))
setP('hair.taper',.5); L2=g.ev(LOCKS); chk('a blunt tip: one more stretch (6 faces) and one closing face instead of a fan of three', all(b[2]==a[2]+4 for a,b in zip(L,L2)), (L[0],L2[0]))
setP('hair.taper',1)

before0=g.ev(VERTS,[0,0]); g.ev("()=>%s.pickLock(3)"%D); g.pg.wait_for_timeout(400)
rows=g.ev("()=>['len','curl','ang'].map(function(f){return !!%s.querySelector('#s_hair_L3_'+f)})"%R)
chk('a picked lock shows its own rows', rows==[True,True,True], rows)
b3=g.ev(VERTS,[3,0]); g.typed('hair.L3.len',2,900)
chk('its own length changes it and its partner, not the front lock', g.ev(VERTS,[3,0])!=b3 and g.ev(VERTS,[3,0])==sorted(g.ev(VERTS,[7,1])) and g.ev(VERTS,[0,0])==before0)
g.typed('hair.L3.ang',25,900)
chk('its angle keeps the partner mirrored', g.ev(VERTS,[3,0])==g.ev(VERTS,[7,1]))
chk('only the picked lock is highlighted', g.ev("()=>{var d=%s,h=d.rigRoot.getObjectByName('hl').geometry.drawRange,l=d.hairLocks().filter(function(q){return q.i===3})[0];return h.count===(l.t1-l.t0)*3}"%D))
setP('hair.part',20); L=g.ev(LOCKS); chk('part position still builds every lock', len(L)==10, len(L))
setP('hair.part',0)

# a real click on a lock picks it
xy=g.ev("""()=>{var d=%s,l=d.hairLocks().filter(function(q){return q.i===1})[0],m=d.sk,h=d.ranges.Head[0],v=new THREE.Vector3(),c=new THREE.Vector3(),n=0;
  d.camera.position.set(0,1.7,1.3);d.controls.target.set(0,1.6,0);d.controls.update();d.rigRoot.updateMatrixWorld(true);
  for(var t=l.t0;t<l.t1;t++)for(var k=0;k<3;k++){m.boneTransform(h+3*t+k,v);v.applyMatrix4(m.matrixWorld);c.add(v);n++;}
  c.multiplyScalar(1/n).project(d.camera);var r=d.renderer.domElement.getBoundingClientRect();return [r.left+(c.x+1)/2*r.width,r.top+(1-c.y)/2*r.height]}"""%D)
g.ev("()=>{var d=%s;d.ui.playing=false;d.ui.mode='rest'}"%D); g.pg.wait_for_timeout(500)
xy=g.ev("""()=>{var d=%s,l=d.hairLocks().filter(function(q){return q.i===1})[0],m=d.sk,h=d.ranges.Head[0],v=new THREE.Vector3(),c=new THREE.Vector3(),n=0;d.rigRoot.updateMatrixWorld(true);
  for(var t=l.t0;t<l.t1;t++)for(var k=0;k<3;k++){m.boneTransform(h+3*t+k,v);v.applyMatrix4(m.matrixWorld);c.add(v);n++;}
  c.multiplyScalar(1/n).project(d.camera);var r=d.renderer.domElement.getBoundingClientRect();return [r.left+(c.x+1)/2*r.width,r.top+(1-c.y)/2*r.height]}"""%D)
g.pg.mouse.move(xy[0],xy[1]); g.pg.mouse.down(); g.pg.mouse.up(); g.pg.wait_for_timeout(600)
chk('clicking a lock on the model picks it', g.ev("()=>%s.ui.lock"%D) in (1,9), (xy, g.ev("()=>%s.ui.lock"%D)))
g.click('#resetPart',900)
chk('Reset Part puts the hair back', g.P('hair.count')==14 and g.P('hair.lenS')==0 and g.P('hair.L3.len')==1 and g.ev("()=>%s.ui.lock"%D) is None and len(g.ev(LOCKS))==3)
errs=[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GPU stall' not in e]
chk('no errors', not errs, errs[:3])
g.close()

# old saved stats: Bang Length becomes the front length
g=Rig(w=900,h=700,draw=False,storage={'runnerRig2':json.dumps({'bangL':1.6,'fmt':2})}); g.open()
chk('old bangL moves to Lock Length at the Front', abs(g.P('hair.lenF')-1.6)<1e-9, g.P('hair.lenF'))
g.close()
print('ALL PASS' if ok else 'SOME FAILED')
