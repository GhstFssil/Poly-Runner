# true Y in the game: each kind lands where its Y says
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
X=0
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[
 {'type':'hill','id':1,'x':60,'z':-80,'radius':40,'height':12},
 {'type':'sign','id':2,'x':60,'z':-80,'yAbs':20},
 {'type':'seg','id':3,'x':-20,'z':-40,'yAbs':9},
 {'type':'platform','id':4,'x':-60,'z':-120,'heading':0,'bend':0,'length':20,'width':10,'height':10,'thick':2,'yAbs':15},
 {'type':'ledge','id':5,'x':-120,'z':-60,'heading':0,'bend':0,'length':30,'thickness':10,'height':5,'yAbs':8},
 {'type':'minion','id':6,'x':-60,'z':-125,'yAbs':15,'idle':True},
 {'type':'lake','id':7,'x':150,'z':-200,'radius':25,'depth':6,'yAbs':-1},
 {'type':'patch','id':8,'x':-150,'z':-200,'width':30,'depth':30,'shape':'rect','ground':'grass','hard':True,'soft':4,'yAbs':4},
 {'type':'mud','id':9,'x':150,'z':-60,'heading':0,'bend':0,'length':20,'width':12,'slowdown':50,'yAbs':3},
 {'type':'hill','id':10,'x':-200,'z':-60,'radius':20,'height':6,'yAbs':10},
 {'type':'door','id':11,'x':200,'z':-150,'width':12,'height':10,'yAbs':5,'mode':'closed'},
 {'type':'start','id':12,'x':0,'z':-30,'yAbs':6},
]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(2500)
gH=lambda x,z: round(pg.evaluate("([x,z])=>__gH(x,z)",[X+x,z]),2)
print('y0',pg.evaluate("__dbg().SB.y0"))
print('ledge top at its start (expect 8):',gH(-120,-62),'| ground before it:',gH(-120,-50))
print('patch ground (expect 4):',gH(-150,-200),'| mud ground (expect 3):',gH(150,-70),'| hill with Y=10, h 6: centre (expect 16):',gH(-200,-60))
print('platform top (expect 15):',pg.evaluate("(function(){var m=__dbg().SB.movers.filter(q=>!q.door)[0];return +(m.base+m.hgt).toFixed(2)})()"),'| door foot (expect 5):',pg.evaluate("(function(){var m=__dbg().SB.movers.filter(q=>q.door)[0];return +m.base.toFixed(2)})()"))
print('minion feet (expect 15, on the platform):',[round(e['fy'],2) for e in pg.evaluate("__ens()") if e['act'] and e['sbp']])
print('lake water (expect -1):',pg.evaluate("+__dbg().SB.lakes[0].wy.toFixed(2)"))
print('her start height (expect 6, then she falls):',round(pg.evaluate("__dbg().y"),2))
print('sign y (expect 20):',pg.evaluate("(function(){var s=__dbg().SB.signs[0];return s.T})()"),'| seg:',pg.evaluate("__dbg().SB.segs[0].T"))
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
