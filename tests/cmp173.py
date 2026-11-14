import json,sys
from audc import *
base=json.load(open(OUT+'t/oc4.json'))
for html in ['aud173.html','aud.html']:
    g=Game(html=html); g.load(base)
    r=g.ev("""()=>{var B=__dbg().SB,sm=B.samples,o=[],pl=__T().player;for(var i=0;i<sm.length;i+=1){var q=sm[i];if(q.s<3600||q.s>4300)continue;if(i%8)continue;__chunks(60000+q.x,q.z);pl.position.set(60000+q.x,q.y+0.05,q.z);o.push([i,+q.s.toFixed(0),+q.y.toFixed(1),+__gh(60000+q.x,q.z).toFixed(1),+__tb('level2',q.x,q.z).toFixed(1)]);}return JSON.stringify(o)}""")
    print(html); print(r); print(g.errs); g.close()
