# Ringlets and the Ponytail toggle (Comet's hair), and Comet's own Faceplant. Ringlet Turns 0 leaves the locks as they were; turned up, each lock
# winds round its centre line (more faces), partners still mirror, the mesh stays sound. Ponytail off builds no ponytail parts; on brings them back.
# Comet's shipped look: ringlets, no ponytail; her Faceplant keys are her own (not Molly's), and her baked model has the clip.
import sys, os, json, struct; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from righ import *
ok=True
def chk(name, c, extra=''):
    global ok; ok = ok and bool(c); print('PASS' if c else 'FAIL', name, extra)
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D="document.getElementById('rigHost').__rigdbg()"
LOCKS="()=>%s.hairLocks().map(function(l){return [l.i,l.k,l.t1-l.t0]})"%D
VERTS="""([i,mir])=>{var d=%s,l=d.hairLocks().filter(function(q){return q.i===i})[0];if(!l)return null;var p=d.sk.geometry.attributes.position.array,h=d.ranges.Head[0],o=[];
  for(var t=l.t0;t<l.t1;t++){var tri=[];for(var k=0;k<3;k++){var v=h+3*t+k;tri.push([Math.round((mir?-p[3*v]:p[3*v])*2e3),Math.round(p[3*v+1]*2e3),Math.round(p[3*v+2]*2e3)].join(','));}o.push(tri.sort().join('|'));}
  return o.sort();}"""%D
PONY="()=>{var r=%s.ranges;return ['Pony1','Pony2','Pony3'].map(function(k){return r[k]?r[k][1]:-1})}"%D
def setP(k,v,w=900): g.ev("([k,v])=>%s.setP(k,v)"%D,[k,v]); g.pg.wait_for_timeout(w)

g=Rig(w=1000,h=760); g.open()
g.click('#chips .chip[data-id="Head"]',600)
L0=g.ev(LOCKS); v0=g.ev(VERTS,[1,0])
chk('Molly: Ringlet Turns 0 and Ponytail on by default', g.P('hair.ring')==0 and g.P('ponyOn')==1)
rows=g.ev("()=>['hair_ring','hair_ringW'].map(function(f){return !!%s.querySelector('#s_'+f)})"%R)
chk('Head shows the two ringlet rows', rows==[True,True], rows)
setP('hair.ring',2)
L1=g.ev(LOCKS)
chk('ringlets: each lock has more faces', len(L1)==len(L0) and all(b[2]>a[2] for a,b in zip(L0,L1)), (L0[:2],L1[:2]))
chk('ringlets: partners still mirror', g.ev(VERTS,[1,0])==g.ev(VERTS,[13,1]))
m=g.mesh(); chk('ringlets: mesh sound', m.get('nan')==0 and m.get('wnan')==0, m)
setP('hair.ring',0)
chk('Ringlet Turns back to 0: the lock is exactly as before', g.ev(VERTS,[1,0])==v0)

chk('ponytail built', all(x>0 for x in g.ev(PONY)), g.ev(PONY))
setP('ponyOn',0,1200)
m=g.mesh(); chk('Ponytail off: no ponytail faces, mesh sound', all(x<=0 for x in g.ev(PONY)) and m.get('nan')==0 and not m.get('none'), (g.ev(PONY),m))
setP('ponyOn',1,1200); chk('Ponytail on again: it is back', all(x>0 for x in g.ev(PONY)), g.ev(PONY))

g.click('#pages button[data-pg="comet"]',2500)
m=g.mesh()
chk('Comet ships with ringlets and no ponytail', g.P('hair.ring')>0 and g.P('ponyOn')==0 and all(x<=0 for x in g.ev(PONY)) and m.get('nan')==0, (g.P('hair.ring'),g.P('ponyOn'),m))
errs=[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GPU stall' not in e]
chk('no errors', not errs, errs[:3])
g.close()

ms=json.load(open(ROOT+'/src/data/molly-settings.json')); cs=json.load(open(ROOT+'/src/data/comet-settings.json'))
chk("Comet's Faceplant keys are her own", any(ms.get(k)!=v for k,v in cs.items() if k.startswith('m.fall.')))
b=open(ROOT+'/src/data/comet.glb','rb').read(); n=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+n])
chk("Comet's baked model has the Faceplant clip", 'Faceplant' in [a['name'] for a in j.get('animations',[])])
print('ALL PASS' if ok else 'SOME FAILED')
