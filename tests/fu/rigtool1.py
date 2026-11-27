# Rig Editor Stretch and Draw: Stretch's dots set a part's Length (and a selected hair lock's own Length) by dragging; Draw fits a hair lock's
# own Length, Extra Curl and Angle to a stroke started on its root; either tool poses her at Rest and gives the old pose back when turned off
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from righ import *
g=Rig(w=1100,h=800,draw=False); g.open()
ok=True
def chk(name, c, extra=''):
    global ok; ok = ok and bool(c); print('PASS' if c else 'FAIL', name, extra)
D="document.getElementById('rigHost').__rigdbg()"
def stage(): return g.ev("()=>{var r=%s.querySelector('#stage').getBoundingClientRect();return [r.left,r.top]}"%R)
def dots(): return g.ev("()=>Array.prototype.map.call(%s.querySelectorAll('#toolLayer .hdl'),function(d){return {x:parseFloat(d.style.left),y:parseFloat(d.style.top),a:d.__a,hidden:d.hidden}})"%R)
def drag(pts, button='left'):
    m=g.pg.mouse; m.move(pts[0][0],pts[0][1]); m.down(button=button)
    for p in pts[1:]: m.move(p[0],p[1],steps=3)
    m.up(button=button); g.pg.wait_for_timeout(900)
mode0=g.ev(D+".ui.mode")
g.click('#tools button[data-t="stretch"]',600)
chk('Stretch on: posed at Rest', g.ev(D+".ui.mode")=='rest' and g.ev(D+".tool()")=='stretch')
g.ev(D+".ui.sel='UpperArm'"); g.click('#chips .chip[data-id="UpperArm"]',600)
ds=dots(); sx,sy=stage()
chk('Upper Arms: a dot at each elbow', len(ds)==2 and not any(d['hidden'] for d in ds), ds)
L0=g.P('UpperArm.len'); d=ds[0]; a=d['a']
end=[a[0]+(d['x']-a[0])*1.3, a[1]+(d['y']-a[1])*1.3]
drag([[sx+d['x'],sy+d['y']],[sx+end[0],sy+end[1]]])
L1=g.P('UpperArm.len'); m=g.mesh()
chk('dragging the dot 30% further along the arm lengthens it about 30%', abs(L1/L0-1.3)<.06, (L0,L1))
chk('the model still builds', m.get('nan',1)==0 and not g.ev(D+".isDirty()"), m)
cam0=g.ev(D+".camera.position.toArray()")
drag([[sx+200,sy+200],[sx+300,sy+220]])
chk('a drag off the dots still turns the view', g.ev(D+".camera.position.toArray()")!=cam0 and g.P('UpperArm.len')==L1)
g.ev(D+".setP('UpperArm.len',%r)"%L0); g.pg.wait_for_timeout(600)
# a hair lock's tip
g.ev(D+".pickLock(1)"); g.pg.wait_for_timeout(900); ds=dots()
chk('a selected hair lock: one dot at its tip', len(ds)==1, ds)
d=ds[0]; a=d['a']; h0=g.P('hair.L1.len')
drag([[sx+d['x'],sy+d['y']],[sx+a[0]+(d['x']-a[0])*.6, sy+a[1]+(d['y']-a[1])*.6]])
h1=g.P('hair.L1.len')
chk('dragging the tip 40% toward the root shortens the lock to about 60%', abs(h1/h0-.6)<.08, (h0,h1))
# the lock's centre line sits inside the lock built on the model
r=g.ev("""()=>{var d=%s,lk=d.hairLocks().filter(function(l){return l.i===1})[0],P=d.P,c=lk.path({len:P['hair.L1.len'],curl:P['hair.L1.curl'],ang:P['hair.L1.ang']}),m=d.sk,
  r0=d.ranges.Head[0],V=[],i,worst=0;for(i=r0+lk.t0*3;i<r0+lk.t1*3;i++)V.push(m.boneTransform(i,new THREE.Vector3()).applyMatrix4(m.matrixWorld));
  c.forEach(function(p){var w=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(d.bones.Head.matrixWorld),b=1e9;V.forEach(function(v){b=Math.min(b,v.distanceTo(w));});worst=Math.max(worst,b);});return worst}"""%D)
chk('the lock\'s centre line runs inside the built lock (within 2 cm)', r<.02, r)
g.click('#tools button[data-t="stretch"]',600)
chk('Stretch off: the old pose is back, no dots', g.ev(D+".ui.mode")==mode0 and len(dots())==0, g.ev(D+".ui.mode"))
# Draw: a stroke traced along lock 13 (the right partner of lock 1) with known changes is fitted back
g.click('#tools button[data-t="draw"]',600)
chk('Draw on: posed at Rest', g.ev(D+".ui.mode")=='rest' and g.ev(D+".tool()")=='draw')
g.click('#views button[data-v="tq"]',600)
tgt={'len':1.6,'curl':110,'ang':20}
pts=g.ev("""(o)=>{var d=%s,lk=d.hairLocks().filter(function(l){return l.i===13})[0],r=document.getElementById('rigHost').shadowRoot.querySelector('#stage').getBoundingClientRect(),c=lk.path(o),out=[];
  d.rigRoot.updateMatrixWorld(true);for(var j=0;j+1<c.length;j++)for(var f=0;f<4;f++){var p=[0,1,2].map(function(q){return c[j][q]+(c[j+1][q]-c[j][q])*f/4}),v=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(d.bones.Head.matrixWorld).project(d.camera);
  out.push([r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]);}var e=c[c.length-1],v=new THREE.Vector3(e[0],e[1],e[2]).applyMatrix4(d.bones.Head.matrixWorld).project(d.camera);out.push([r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]);return out}"""%D, tgt)
g.ev(D+".setP('hair.L1.len',1);"+D+".setP('hair.L1.curl',0);"+D+".setP('hair.L1.ang',0)"); g.pg.wait_for_timeout(900)
cam0=g.ev(D+".camera.position.toArray()")
import time; t0=time.time(); drag(pts); dt=time.time()-t0
last=g.ev(D+".drawLast()")
got={k:g.P('hair.L1.'+k) for k in ('len','curl','ang')}
chk('the stroke is fitted to lock 1 and its partner, lock 13, close on screen', last and last['k']==1 and last['rms']<4, last)
chk('the fitted changes are near the ones traced', abs(got['len']-1.6)<.25 and abs(got['curl']-110)<35 and abs(got['ang']-20)<12, got)
chk('drawing does not turn the view; the lock is selected', g.ev(D+".camera.position.toArray()")==cam0 and g.ev(D+".ui.lock")==13)
chk('the fit is quick (under 400 ms)', last['ms']<400, last['ms'])
drag([[sx+40,sy+60],[sx+120,sy+90]])
chk('a stroke away from any root changes nothing and says why', 'leaves the cap' in g.status() and g.P('hair.L1.curl')==got['curl'], g.status())
drag([[sx+300,sy+300],[sx+420,sy+320]],'right')
chk('right-drag turns the view while Draw is on', g.ev(D+".camera.position.toArray()")!=cam0)
g.click('#pages button[data-pg="mobs"]',1500)
chk('the Mobs page turns the tools off', g.ev(D+".tool()") is None)
errs=[e for e in g.errs if not e.startswith('C:')]
chk('no page errors', not errs, errs[:3])
print('ALL PASS' if ok else 'SOME FAILED')
g.close()
