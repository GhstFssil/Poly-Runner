from rv import *
g=V(); g.mode('rest'); 
hd=g.bone('Head'); sh=g.bone('ShoulderL')
items=[]
for green in [False,True]:
    g.green=green; g.fix()
    for name,t,v,dist in [('head front',[hd[0],hd[1]+0.1,hd[2]],'front',0.55),('head front-left',[hd[0],hd[1]+0.1,hd[2]],'fl',0.55),('neck base left',[hd[0],hd[1]-0.12,hd[2]],'left',0.35),('shoulder L left',sh,'left',0.45)]:
        g.cam(t,v,dist); im=g.grab(560); items.append(('%s %s'%(name,'(back faces green)' if green else '(as drawn)'),im))
print(sheet(items,4,384,'/home/claude/poly-runner/tests/shots/seam_head_real.png'))
g.close()
