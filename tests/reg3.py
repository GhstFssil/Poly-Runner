from righ import *
import sys
for html in sys.argv[1:]:
    g=Rig(w=480,h=320,draw=False,html=html); pg=g.pg
    def st(): return pg.evaluate("(function(){var d=__dbg(),s=__state();return {level:d.level,playing:d.playing,hp:d.hp,x:+d.x.toFixed(1),y:+d.y.toFixed(2),z:+d.z.toFixed(1),ground:+d.ground.toFixed(2),speed:+s.speed.toFixed(1),grounded:s.grounded,gt:+(window.__gt||0).toFixed(2)}})()")
    pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",['bLevels','bLevel2']); pg.wait_for_timeout(7000); a=st()
    pg.keyboard.down('KeyW'); pg.wait_for_timeout(4000); b=st(); pg.keyboard.up('KeyW')
    print(html,'level 2',a,'->',b,'| L2 hint:',pg.evaluate("(function(){var d=__dbg();return (d.hintTxt||'').slice(0,80)})()"),'errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
