# regression on the current build: every way into the game starts, she stands on the ground, runs, and nothing throws
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
def st(): return pg.evaluate("(function(){var d=__dbg(),s=__state();return {level:d.level,playing:d.playing,hp:d.hp,x:+d.x.toFixed(1),y:+d.y.toFixed(2),ground:+d.ground.toFixed(2),speed:+s.speed.toFixed(1),grounded:s.grounded,en:d.en}})()")
def run_for(ms):
    pg.keyboard.down('KeyW'); pg.wait_for_timeout(ms); r=st(); pg.keyboard.up('KeyW'); return r
pg.click('#bDevT'); pg.click('#dtRig'); pg.wait_for_timeout(2000)
print('rig open',pg.evaluate("!document.getElementById('rigHost').hidden"),'mesh',g.mesh())
g.click('#rigClose',400)
pg.click('#dtBlank'); pg.wait_for_timeout(4000); a=st(); b=run_for(2500); print('blank sandbox',a,'-> after 2.5 s of W',b)
for name,ids in [('level 2',['bTitle','bLevels','bLevel2']),('level 1',['bTitle','bLevels','bLevel1'])]:
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    pg.evaluate("(ids)=>ids.forEach(function(i){var e=document.getElementById(i);if(e)e.click()})",ids); pg.wait_for_timeout(6000); a=st(); b=run_for(3000); print(name,a,'-> after 3 s of W',b)
m=json.loads(pg.evaluate("JSON.stringify(__molly())")); print('molly',m['on'],m['verts'],m['nan'],m['clips'])
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:6]); g.close()
