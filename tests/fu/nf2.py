# segs counter vs power line; slam stats reach the game
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
J={'width':9,'pieces':[{'t':'straight','len':600}],'objects':[{'type':'segchain','id':1,'s':8,'u':0,'length':150,'spacing':5,'big':False}]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2500)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(2000)
st=lambda: pg.evaluate("(function(){var d=__dbg();return {power:+d.segs.toFixed(1),counter:d.segTotal,shown:document.getElementById('segval').textContent}})()")
pg.keyboard.down('KeyW'); pg.wait_for_timeout(9000); pg.keyboard.up('KeyW'); a=st(); print('after running through the chain:',a)
pg.keyboard.press('Digit2'); pg.wait_for_timeout(3000); b=st(); print('Barrier on for 3 s:',b,'| counter unchanged:',b['counter']==a['counter'] and b['shown']==a['shown'], '| power fell:',b['power']<a['power'])
print('slam stats in game (default):',pg.evaluate("(function(){var p=__phys();return p})()").get('SLAM_ACC','(not in __phys)'))
g.close()
