from rv import *
import sys
g=V()
CASES=json.loads(sys.argv[1]); out=sys.argv[2]
def norm(v):
    L=math.sqrt(sum(x*x for x in v)); return [x/L for x in v]
rows=[[],[]]
for m,ph,bone,dy,view,dist in CASES:
    g.mode(m,ph)
    for gi,green in enumerate([False,True]):
        g.green=green; g.fix(); b=g.bone(bone); t=[b[0],b[1]+dy,b[2]]
        g.cam(t,view,dist); g.pg.wait_for_timeout(150); im=g.grab(560); rows[gi].append(('%s %s %s/%s %s'%(m,ph,bone,view,('green %d'%greens(im)) if green else 'as drawn'),im))
items=rows[0]+rows[1]
print(sheet(items,len(CASES),int(1536/len(CASES)),out))
g.close()
