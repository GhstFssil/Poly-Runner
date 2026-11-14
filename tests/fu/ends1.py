# item 10: game footprint of gap / ledge / mud, rounded and squared, against an independent reference
import sys,json,math
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(draw=False)
HW=4.5
def obj(**k): return k
J={'width':9,'pieces':[{'t':'straight','len':600}],'objects':[
 {'type':'gap','id':1,'x':30,'z':-20,'heading':0,'bend':0,'length':30,'width':15,'ends':'round'},
 {'type':'gap','id':2,'x':80,'z':-20,'heading':0,'bend':0,'length':30,'width':15,'ends':'square'},
 {'type':'ledge','id':3,'x':-30,'z':-20,'heading':0,'bend':0,'length':30,'thickness':4,'height':5,'ends':'round'},
 {'type':'ledge','id':4,'x':-80,'z':-20,'heading':0,'bend':0,'length':30,'thickness':4,'height':5,'ends':'square'},
 {'type':'gap','id':5,'x':200,'z':-100,'heading':0,'bend':90,'length':40,'width':10,'ends':'square'},
 {'type':'gap','id':6,'x':-200,'z':-100,'heading':30,'bend':-70,'length':40,'width':10,'ends':'round'},
 {'type':'mud','id':7,'s':50,'u':0,'length':60,'slowdown':50,'ends':'round'},
 {'type':'mud','id':8,'s':200,'u':0,'length':60,'slowdown':50,'ends':'square'},
 {'type':'ledge','id':9,'x':-30,'z':-300,'heading':0,'bend':0,'length':30,'thickness':1,'height':5,'ends':'square'},
]}
def centre(x,z,h,bend,L):
    h=math.radians(h); B=math.radians(bend); pts=[]
    N=int(L*20)
    for i in range(N+1):
        d=L*i/N
        if abs(B)<1e-6: pts.append((x+math.sin(h)*d,z-math.cos(h)*d,h,d))
        else:
            R=L/B; t2=h+B*d/L
            pts.append((x+math.cos(h)*R-math.cos(t2)*R, z+math.sin(h)*R-math.sin(t2)*R, t2, d))
    return pts
def ref(pts,half,m,sq,L,px,pz):
    # returns (inside, margin) where margin = signed distance-ish to the boundary (>0 inside)
    best=None
    for (x,z,t,d) in pts:
        dist=math.hypot(px-x,pz-z)
        if best is None or dist<best[0]: best=(dist,x,z,t,d)
    dist,x,z,t,d=best
    if not sq: return half-dist
    fx,fz=math.sin(t),-math.cos(t); dx,dz=px-x,pz-z
    al=dx*fx+dz*fz; la=abs(dx*math.cos(t)+dz*math.sin(t))
    if d<=1e-9 and al<0: al=-al-m   # beyond the start: along distance past the end
    elif d>=L-1e-9 and al>0: al=al-m
    else: al=0 if abs(al)<1e-6 else 0   # interior: along is ~0 by construction of nearest point
    return min(half-la, -al if (d<=1e-9 or d>=L-1e-9) else 9)
specs=[ # id, kind, centre args, half incl margin, margin
 (1,'g',(30,-20,0,0,30),7.5+1.5,1.5,False),(2,'g',(80,-20,0,0,30),7.5+1.5,1.5,True),
 (3,'l',(-30,-20,0,0,30),max(2,1.3)+1.5,1.5,False),(4,'l',(-80,-20,0,0,30),2+1.5,1.5,True),
 (5,'g',(200,-100,0,90,40),5+1.5,1.5,True),(6,'g',(-200,-100,30,-70,40),5+1.5,1.5,False),
 (7,'m',(0,-50,0,0,60),4.5+1,1,False),(8,'m',(0,-200,0,0,60),4.5+1,1,True),
 (9,'l',(-30,-300,0,0,30),1.3+1.5,1.5,True)]
tot=bad=0; worst=[]
for sid,kind,(x,z,h,b,L),half,m,sq in specs:
    pts=centre(x,z,h,b,L)
    xs=[p[0] for p in pts]; zs=[p[1] for p in pts]
    grid=[(px,pz) for px in [i*0.7 for i in range(int((min(xs)-14)/0.7),int((max(xs)+14)/0.7))] for pz in [i*0.7 for i in range(int((min(zs)-14)/0.7),int((max(zs)+14)/0.7))]]
    res=g.ev("(function(j,p){return __ends(j,p)})(%s,%s)"%(json.dumps(J),json.dumps(grid)))
    idx={'g':0,'m':1,'l':2}[kind]
    n=b2=0; sub=[]
    for (px,pz),r in zip(grid,res):
        mg=ref(pts,half,m,sq,L,px,pz)
        if abs(mg)<0.45: continue                      # skip the boundary band (the game samples discs every 3 units)
        # other pieces of the same kind can overlap the grid: only judge points no other same-kind piece covers
        n+=1
        game=r[idx]==1
        if game!=(mg>0):
            # a neighbour of the same kind might cover it; check against all specs of that kind
            others=False
            for sid2,k2,(x2,z2,h2,b2_,L2),half2,m2,sq2 in specs:
                if sid2!=sid and k2==kind:
                    if ref(centre(x2,z2,h2,b2_,L2),half2,m2,sq2,L2,px,pz)>0: others=True
            if not others: b2+=1; sub.append((round(px,1),round(pz,1),round(mg,2),r))
    print('piece',sid,kind,'square' if sq else 'round','points judged',n,'mismatches',b2, sub[:3])
    tot+=n; bad+=b2
print('TOTAL judged',tot,'mismatches',bad)
g.close()
