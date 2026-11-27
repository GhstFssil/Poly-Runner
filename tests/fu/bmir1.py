# Mirror Bulge 1 (a part's `umir`): bulge 2 becomes bulge 1 mirrored (direction negated, left/right widths and curvatures swapped); the Rig Editor shows the toggle in place of bulge 2's rows
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from righ import *
g=Rig(w=700,h=600,draw=False); g.open()
ok=True
def chk(name, c, extra=''):
    global ok; ok = ok and bool(c); print('PASS' if c else 'FAIL', name, extra)
STAT="""()=>{var m=document.getElementById('rigHost').__rigdbg().sk,geo=m.geometry,p=geo.attributes.position.array,c=geo.attributes.color.array,si=geo.attributes.skinIndex.array,tri=p.length/9,bones=m.skeleton.bones.map(function(b){return b.name});
  var key=function(x,y,z){return Math.round(x*2e3)+','+Math.round(y*2e3)+','+Math.round(z*2e3)},tv=function(t,neg){var a=[];for(var k=0;k<3;k++){var v=3*t+k;a.push(key(neg?-p[3*v]:p[3*v],p[3*v+1],p[3*v+2]))}return a.sort().join('|')};
  var col=function(t){return [c[9*t],c[9*t+1],c[9*t+2]].map(function(q){return Math.round(q*255)}).join(',')};
  var T={};for(var t=0;t<tri;t++){var k0=tv(t,0);(T[k0]=T[k0]||{})[col(t)]=1;}   /* (two parts' closed ends can sit on the same spot inside her, a cuff's and a forearm's: a facet matches if any facet there has its shade) */
  var ok=0,shade=0,limbOff=0,limbShade=0;for(var t=0;t<tri;t++){var o=T[tv(t,1)],limb=/^(Elbow|Wrist|Knee|Ankle)/.test(bones[si[12*t]]);
    if(o===undefined){if(limb)limbOff++;continue}ok++;if(!o[col(t)]){shade++;if(limb)limbShade++;}}
  return {tris:tri,mirrored:ok,shadeDiffers:shade,limbOff:limbOff,limbShade:limbShade}}"""
D="document.getElementById('rigHost').__rigdbg()"
g.ev("()=>%s.setP('jit',0.2)"%D); g.pg.wait_for_timeout(800); r0=g.ev(STAT)
g.ev("()=>{var d=%s;d.setP('LowerTorso.umir',1);}"%D); g.pg.wait_for_timeout(1200)
v=g.ev("()=>{var P=%s.P,a='LowerTorso.u1',b='LowerTorso.u2';return [P[a+'a'],P[b+'a'],P[a+'wl'],P[b+'wr'],P[a+'wr'],P[b+'wl'],P[a+'d'],P[b+'d'],P[a+'p'],P[b+'p']]}"%D)
chk('bulge 2 mirrors bulge 1', v[1]==-v[0] and v[2]==v[3] and v[4]==v[5] and v[6]==v[7] and v[8]==v[9], v)
r1=g.ev(STAT); chk('more facets mirrored than before (%d -> %d of %d)'%(r0['mirrored'],r1['mirrored'],r1['tris']), r1['mirrored']/r1['tris']>r0['mirrored']/r0['tris'])
g.ev("()=>{var d=%s;d.setP('LowerTorso.u1a',140);}"%D); g.pg.wait_for_timeout(900)
chk('follows a change to bulge 1', g.ev("()=>%s.P['LowerTorso.u2a']"%D)==-140)
errs=[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GL Driver' not in e]; chk('no page errors', not errs, errs[:2])
print('ALL PASS' if ok else 'SOME FAILED'); g.close()
