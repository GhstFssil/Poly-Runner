# in a sloped tunnel she stands on the drawn floor: the height she gets at the tunnel's middle line matches the line between the drawn rings' floor points (before Nov 17 she stood 0.5 above it at 20 degrees, 1.6 at 35)
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
html=sys.argv[1] if len(sys.argv)>1 else 'aud.html'
g=Rig(w=480,h=320,draw=False,html=html); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
worst=0
for ang in [10,20,35,60,-20,-35]:
  objs=[{'type':'cave','id':1,'s':60,'u':0,'rot':0,'shape':'rect','width':10,'height':8,'angle':ang if ang>0 else 45,'depth':80}]
  if ang<0: objs.append({'type':'cave','id':2,'after':1,'shape':'rect','width':10,'height':8,'angle':ang,'angleSet':True,'depth':60})   # a climb, joined on deep down
  J={'width':12,'pieces':[{'t':'straight','len':300}],'objects':objs}
  pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1000)
  r=pg.evaluate("""()=>{var cs=__dbg().SB.caves,c=cs[cs.length-1],S=c.S,out=[],k,f,g,t;
    for(k=1;k<S.length-4;k++){f=S[k];g=S[k+1];if(!f.cov||!g.cov||!S[k-1].cov||!S[k+2].cov)continue;
      var fa=[f.x+f.Nx*-4,f.y+f.Ny*-4,f.z+f.Nz*-4],fb=[g.x+g.Nx*-4,g.y+g.Ny*-4,g.z+g.Nz*-4];
      for(t=0.25;t<1;t+=0.5){var px=fa[0]+(fb[0]-fa[0])*t,py=fa[1]+(fb[1]-fa[1])*t,pz=fa[2]+(fb[2]-fa[2])*t;__pos(0+px,py+0.3,pz);out.push(__gh(0+px,pz)-py)}}
    return out}""")
  if not r: print('angle %d: no covered stretch'%ang); worst=99; continue
  w=max(abs(v) for v in r); worst=max(worst,w)
  print('angle %d: %d points, largest gap between her floor and the drawn floor %.3f'%(ang,len(r),w))
print('PASS' if worst<0.05 else 'FAIL'); g.close()
