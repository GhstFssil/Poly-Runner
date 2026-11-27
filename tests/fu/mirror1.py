# Faceting mirrored down the centre line: each facet has a mirror image (x to -x) with the same shade. Limbs (elbows, wrists, knees, ankles) must match exactly;
# quads across the centre plane are fanned into four round their middle; the welds are made mirrored when the body is its own mirror image, which with the shipped bulges it is not
# (they differ side to side), so the shipped figure is held to a share; with Mirror Bulge 1 on for both torso parts nearly all of it (the hair locks are still not)
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
for page in ['molly','comet']:
    if page=='comet': g.click('#pages button[data-pg="comet"]',2500)
    for jit in [0.2,0.5]:
        g.ev("j=>document.getElementById('rigHost').__rigdbg().setP('jit',j)",jit); g.pg.wait_for_timeout(800)
        r=g.ev(STAT)
        chk('%s jit %.1f: limbs mirrored, same shades'%(page,jit), r['limbOff']==0 and r['limbShade']==0, r)
        chk('%s jit %.1f: at least 86%% of facets mirrored, shades all but a few'%(page,jit), r["mirrored"]>=0.86*r["tris"] and r['shadeDiffers']<=0.03*r['tris'], r)
g.click('#pages button[data-pg="molly"]',2500)
g.ev("()=>{var d=document.getElementById('rigHost').__rigdbg();d.setP('LowerTorso.umir',1);d.setP('UpperTorso.umir',1);d.setP('jit',0.2);}"); g.pg.wait_for_timeout(1500)
r=g.ev(STAT); chk('Mirror Bulge 1 on both torso parts: the welds are mirrored too, at least 98% of facets', r["mirrored"]>=0.98*r["tris"] and r['shadeDiffers']==0, r)
print('ALL PASS' if ok else 'SOME FAILED')
g.close()
