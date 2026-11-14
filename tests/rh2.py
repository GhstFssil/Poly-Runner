from rv import *
import sys
g=V(); g.green=False
g.mode('rest')
VARS=json.loads(sys.argv[1]); out=sys.argv[2]; views=json.loads(sys.argv[3]) if len(sys.argv)>3 else ['front','fl','left','bl','back']
dist=float(sys.argv[4]) if len(sys.argv)>4 else 0.55
rows=[]
for name,ch in VARS:
    c=dict(ch); c['armSpread']=40
    g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,c[k]);}",c); g.pg.wait_for_timeout(700); g.fix()
    b=g.bone('HipL'); t=[b[0],b[1]-0.07,b[2]]
    for v in views:
        g.cam(t,v,dist); g.pg.wait_for_timeout(120); rows.append(('%s  %s'%(name,v),g.grab(560)))
    g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,d.DEF[k]);}",c)
print(sheet(rows,len(views),int(1536/len(views)),out))
g.close()
