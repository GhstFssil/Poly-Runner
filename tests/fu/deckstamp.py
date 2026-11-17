# Oceana: a ledge and a hill placed on a path deck stand on the deck (raise its top where she stands and where it is drawn); one off the deck stays on the ground
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
shots='shots' in sys.argv
g=Rig(w=900,h=600,draw=shots) if shots else Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
J={'width':12,'terrain':'level2','pieces':[{'t':'straight','len':400}],'objects':[
  {'type':'ledge','id':1,'s':60,'u':0,'length':20,'width':6,'height':3,'ends':'square'},
  {'type':'hill','id':2,'s':140,'u':0,'radius':15,'height':4,'surface':'grass'},
  {'type':'ledge','id':3,'x':80,'z':-60,'length':20,'width':6,'height':3}]}
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(2000)
r=pg.evaluate("""()=>{var B=__dbg().SB;__pos(60000,40,-20);return {deck:__gh(60000,-20),onLedge:__gh(60000,-70),hillTop:__gh(60000,-140),hillSide:__gh(60000,-148),offLedgeDk:B.objs.filter(o=>o.id===3)[0].dk,dl:!!B.dLedgeH,dh:B.dHills.length,
  groundUnderLedge:__l3(60000,-70)}}""")
print(r)
ok=abs(r['onLedge']-r['deck']-3)<0.05 and abs(r['hillTop']-r['deck']-4)<0.1 and 0<r['hillSide']-r['deck']<4 and r['offLedgeDk']==False and r['dl'] and r['dh']==1
# run along the deck over the hill and into the ledge from the start
pg.evaluate("()=>{__pos(60000,40,-110);__st({vy:0,speed:40,heading:0,yaw:0});__keys({KeyW:true,w:true,ArrowUp:true})}"); pg.wait_for_timeout(3000)
d=pg.evaluate("()=>{__keys({KeyW:false,w:false,ArrowUp:false});var d=__dbg();return [d.z,d.y,d.ground]}")
print('ran over the hill: z %.1f y %.2f ground %.2f'%tuple(d)); ok=ok and d[0]<-160 and abs(d[1]-d[2])<1
if shots:
  pg.evaluate("()=>{__pos(60000,40,-38);__st({vy:0,speed:0,heading:0,yaw:0})}"); pg.wait_for_timeout(1500)
  g.shot('deckstamp'); pg.evaluate("()=>{__pos(60000,40,-118);__st({vy:0,speed:0,heading:0,yaw:0})}"); pg.wait_for_timeout(1500); g.shot('deckhill')
print('PASS' if ok else 'FAIL'); print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GL Driver' not in e][:3]); g.close()
