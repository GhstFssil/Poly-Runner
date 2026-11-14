from rv import *
import sys
g=V(); g.green=False; g.fix()
POSES=json.loads(sys.argv[1]); out=sys.argv[2]; bone=sys.argv[3]; views=json.loads(sys.argv[4]); dist=float(sys.argv[5]); dy=float(sys.argv[6]) if len(sys.argv)>6 else 0
rows=[]
for m,ph in POSES:
    g.mode(m,ph); g.pg.wait_for_timeout(250)
    b=g.bone(bone); t=[b[0],b[1]+dy,b[2]]
    for v in views:
        g.cam(t,v,dist); g.pg.wait_for_timeout(120); im=g.grab(560); rows.append(('%s %s  %s'%(m,ph if ph is not None else '',v),im))
print(sheet(rows,len(views),int(1536/len(views)),out))
g.close()
