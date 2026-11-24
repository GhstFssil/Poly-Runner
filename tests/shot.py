# screenshots of a level at chosen spots: python3 shot.py '<json or @file>' '[[name, s, back, up, side, ahead(look distance), lookUp], ...]' [w h]
import json,sys
from audc import *
arg=sys.argv[1]; j=json.load(open(arg[1:])) if arg.startswith('@') else json.loads(arg)
views=json.loads(sys.argv[2]); W=int(sys.argv[3]) if len(sys.argv)>3 else 960; H=int(sys.argv[4]) if len(sys.argv)>4 else 540
g=Game(w=W,h=H,draw=True); g.pg.set_default_timeout(240000); g.load(j, wait=6000); g.ev('window.__noRender=true')
g.ev("(function(){var h=document.getElementById('hud');if(h)h.style.visibility='hidden';})()")
for v in views:
    name,s,back,up,side,ahead,lookUp=v
    r=g.ev("""([s,back,up,side,ahead,lookUp])=>{var B=__dbg().SB,sm=B.samples,i=0;while(i+2<sm.length&&sm[i+1].s<s)i++;var a=sm[i],b=sm[i+1],t=Math.max(0,Math.min(1,(s-a.s)/Math.max(1e-6,b.s-a.s))),x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=a.y+(b.y-a.y)*t,th=a.th+(b.th-a.th)*t,fx=Math.sin(th),fz=-Math.cos(th),lx=Math.cos(th),lz=Math.sin(th);
      __chunks(0+x,z); __tp(0+x+fx*8,z+fz*8); __st({heading:-th,yaw:-th,speed:0});
      window.__camOv={p:[0+x-fx*back+lx*side,y+up,z-fz*back+lz*side],l:[0+x+fx*ahead,y+lookUp,z+fz*ahead]};return [x,y,z,th];}""",[s,back,up,side,ahead,lookUp])
    g.pg.wait_for_timeout(5000)
    g.pg.screenshot(path='/home/claude/poly-runner/tests/shots/%s.png'%name)
    print(name,'at',[round(q,1) for q in r])
print(g.errs); g.close()
