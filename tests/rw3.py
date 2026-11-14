from righ import *
g=Rig(draw=False); g.open()
r=g.ev("""()=>{var d=document.getElementById('rigHost').__rigdbg(),a=d.sk.geometry.attributes.position.array,E={},o=[];
  function key(i){return Math.round(a[i*3]*2e5)+','+Math.round(a[i*3+1]*2e5)+','+Math.round(a[i*3+2]*2e5);}
  ['UpperTorso','UpperArm'].forEach(function(id){var r=d.ranges[id];for(var v=r[0];v<r[0]+r[1];v+=3){for(var e=0;e<3;e++){var p=key(v+e),q=key(v+(e+1)%3);if(p===q)continue;var k=p<q?p+'|'+q:q+'|'+p;(E[k]=E[k]||[]).push([id,v,e]);}}});
  for(var k in E)if(E[k].length===1){var t=E[k][0],v=t[1],pts=[];for(var j=0;j<3;j++)pts.push([+(a[(v+j)*3]*100).toFixed(2),+(a[(v+j)*3+1]*100).toFixed(2),+(a[(v+j)*3+2]*100).toFixed(2)]);o.push([t[0],t[2],pts]);}
  return JSON.stringify(o)}""")
for e in json.loads(r): print(e)
print('weldlog',g.ev("JSON.stringify(window.__weldlog)"))
g.close()
