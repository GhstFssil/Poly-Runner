from rv import *
import sys
g=V(); g.green=False
g.mode('rest'); g.fix()
SHOW="""(sel)=>{var d=document.getElementById('rigHost').__rigdbg(),r=d.rigRoot;r.children.forEach(function(o){if(o.name==='hl'){o.visible=!!sel;if(sel&&d.ranges[sel])o.geometry.setDrawRange(d.ranges[sel][0],d.ranges[sel][1]);}});return 1}"""
b=g.bone('HipL'); t=[b[0],b[1]-0.06,b[2]]
rows=[]
for sel in [None,'Thigh','LowerTorso']:
    g.ev(SHOW,sel)
    for v in ['front','fl','left','bl','back']:
        g.cam(t,v,0.5); g.pg.wait_for_timeout(120); rows.append(('%s  %s'%(v,'as drawn' if not sel else sel+' in yellow'),g.grab(560)))
print(sheet(rows,5,307,'/home/claude/poly-runner/tests/shots/hip_a.png'))
g.close()
