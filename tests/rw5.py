from righ import *
g=Rig(draw=False); g.open()
g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,c[k]);}",{"irrC":1.5}); g.pg.wait_for_timeout(900)
open('/home/claude/poly-runner/tests/weld/soups_irrc.json','w').write(g.ev("window.__soups0"))
g.close()
