from rv import *
import sys
g=V(w=1000,h=760)
JOINTS=[('neck','Head',0,-0.10,0,0.4),('head','Head',0,0.12,0,0.7),('shoulderL','ShoulderL',0,0,0,0.7),('elbowL','ElbowL',0,0,0,0.55),('wristL','WristL',0,0,0,0.5),('waist','Spine',0,0,0,0.8),('hipL','HipL',0,0,0,0.7),('kneeL','KneeL',0,0,0,0.6),('ankleL','AnkleL',0,0,0,0.55),('shoulderR','ShoulderR',0,0,0,0.7),('hipR','HipR',0,0,0,0.7),('kneeR','KneeR',0,0,0,0.6),('pony','Pony2',0,0,0,0.8)]
DIRS=['front','back','left','right','top','under','fl','br']
def norm(v):
    L=math.sqrt(sum(x*x for x in v)); return [x/L for x in v]
POSES=json.loads(sys.argv[1]) if len(sys.argv)>1 else [['rest',None],['idle',0.25],['runS',0.0],['run',0.0],['run',0.25],['runF',0.25],['runF',0.6],['jump',0.14],['jump',0.42],['jump',0.72],['slide',0.36],['fall',0.32],['fall',0.58],['set',0.0],['drift',0.0]]
print('%-12s'%'pose'+' '.join('%9s'%j[0] for j in JOINTS))
for m,ph in POSES:
    g.mode(m,ph); g.pg.wait_for_timeout(200)
    views=[[j[1],norm(VIEWS[d]),j[5],j[2],j[3],j[4]] for j in JOINTS for d in DIRS]
    r=g.ev(COUNT,views)
    row=[]
    for i,j in enumerate(JOINTS):
        c=[(r[i*len(DIRS)+k][0] if r[i*len(DIRS)+k][0]<0.3*max(1,r[i*len(DIRS)+k][1]) else -1) for k in range(len(DIRS))]; row.append('%4d/%-4s'%(max(c),DIRS[c.index(max(c))][:2]))
    print('%-12s'%('%s %s'%(m,ph))+' '.join(row),flush=True)
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:5]); g.close()
