from rv import *
import sys
g=V()
VARS=json.loads(sys.argv[1]); out=sys.argv[2]; specs=json.loads(sys.argv[3])
rows=[]
for name,ch in VARS:
    g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,c[k]);}",ch); g.pg.wait_for_timeout(900); g.mode('rest'); g.fix()
    for bone,dy,view,dist in specs:
        b=g.bone(bone); g.cam([b[0],b[1]+dy,b[2]],view,dist); g.pg.wait_for_timeout(150); im=g.grab(560); rows.append(('%s  %s/%s  %d'%(name,bone,view,greens(im)),im))
    g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,d.DEF[k]);}",ch)
print(sheet(rows,len(specs),int(1536/len(specs)),out)); g.close()
