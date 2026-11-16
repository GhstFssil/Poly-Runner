# glancing hits on ledges and crags: does she end up pushed against the surface with speed but no movement?
import sys,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
J={'width':9,'pieces':[{'t':'straight','len':400}],'objects':[
 {'type':'ledge','id':1,'x':-30,'z':-60,'heading':90,'bend':0,'length':60,'thickness':20,'height':30},
 {'type':'crag','id':2,'x':40,'z':-80,'r':25,'count':10,'base':5.5,'baseV':2,'hgt':8,'hgtV':2,'gap':3,'gapV':2,'seed':7}]}
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
stuck=0
CASES=[(sx,-30,hd,'ledge x%d h%.2f'%(sx,hd)) for sx in (-25,-12,-5,10,20,27) for hd in (0.5,0.9,-0.3,-0.7)]+[(sx,-40,hd,'crag x%d h%.2f'%(sx,hd)) for sx in (34,40,46) for hd in (0.2,0.6,-0.4)]
for (sx,sz,hd,name) in CASES:
    pg.evaluate("([x,z])=>__put(60000+x,0,z)",[sx,sz]); pg.evaluate("h=>__hd(h)",hd); pg.wait_for_timeout(200)
    pg.evaluate("__spd(120)"); pg.keyboard.down('KeyW'); log=[]
    for i in range(40):
        pg.wait_for_timeout(100); s=pg.evaluate("__state()"); log.append((round(s['x']-60000,1),round(s['z'],1),round(s['speed'],1),round(s['heading'],2),int(s['grounded'])))
    pg.keyboard.up('KeyW')
    tail=log[-15:]; mv=math.hypot(tail[-1][0]-tail[0][0],tail[-1][1]-tail[0][1]); sp=sum(t[2] for t in tail)/len(tail)
    flag = 'STUCK' if (mv<1.0 and sp>5) else 'ok'
    if flag=='STUCK': stuck+=1
    if flag=='STUCK': print(name,'moved',round(mv,1),'avg speed',round(sp,1),flag)
print('stuck cases:',stuck,'of',len(CASES))
g.close()
