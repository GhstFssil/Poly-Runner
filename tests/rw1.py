from righ import *
import sys
g=Rig(draw=False); g.open()
D="document.getElementById('rigHost').__rigdbg()"
MAN="""(ids)=>{var d=document.getElementById('rigHost').__rigdbg(),a=d.sk.geometry.attributes.position.array,E={},n=0,open=0,bad=0;
  function key(i){return Math.round(a[i*3]*2e5)+','+Math.round(a[i*3+1]*2e5)+','+Math.round(a[i*3+2]*2e5);}
  ids.forEach(function(id){var r=d.ranges[id];for(var v=r[0];v<r[0]+r[1];v+=3){n++;for(var e=0;e<3;e++){var p=key(v+e),q=key(v+(e+1)%3);if(p===q)continue;var k=p<q?p+'|'+q:q+'|'+p;E[k]=(E[k]||0)+1;}}});
  for(var k in E){if(E[k]===1)open++;else if(E[k]!==2)bad++;}return {tris:n,edges:Object.keys(E).length,open:open,odd:bad};}"""
VARS=json.loads(sys.argv[1]) if len(sys.argv)>1 else [["shipped",{}]]
for name,ch in VARS:
    g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,c[k]);}",ch); g.pg.wait_for_timeout(900)
    m=g.mesh()
    print('%-22s'%name,'tris',m['tris'],'nan',m['nan'],'rebuild ms',m['ms'],'| pelvis+thighs',g.ev(MAN,['LowerTorso','Thigh']),'| torso+arms',g.ev(MAN,['UpperTorso','UpperArm']))
    g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,d.DEF[k]);}",ch)
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:5]); g.close()
