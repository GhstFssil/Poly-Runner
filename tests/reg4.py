from righ import *
import sys
for html in sys.argv[1:]:
    g=Rig(w=320,h=200,draw=False,html=html); pg=g.pg
    def st(): return pg.evaluate("(function(){var d=__dbg(),s=__state();return [d.level,d.hp,+d.x.toFixed(1),+d.y.toFixed(2),+d.z.toFixed(1),+d.ground.toFixed(2),+s.speed.toFixed(1),s.grounded,+(window.__gt||0).toFixed(2)]})()")
    pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",['bLevels','bLevel2']); pg.wait_for_timeout(5000)
    pg.keyboard.down('KeyW'); out=[st()]
    for k in range(4): pg.wait_for_timeout(12000); out.append(st())
    pg.keyboard.up('KeyW')
    print(html); [print('   [level,hp,x,y,z,ground,speed,grounded,game s]',o) for o in out]; print('   errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
