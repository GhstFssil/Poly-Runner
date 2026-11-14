from rv import *
import sys
g=V()
mode=sys.argv[1] if len(sys.argv)>1 else 'rest'; ph=float(sys.argv[2]) if len(sys.argv)>2 else None; tag=sys.argv[3] if len(sys.argv)>3 else mode
g.mode(mode,ph); g.fix()
def mid(a,b,f=0.5):
    A=g.bone(a); B=g.bone(b); return [A[i]+(B[i]-A[i])*f for i in range(3)]
sp=g.bone('Spine'); hd=g.bone('Head'); hips=g.bone('Hips')
J=[('neck',[hd[0],hd[1]-0.03,hd[2]],0.75,['front','left','back','fl']),
   ('shoulder L',g.bone('ShoulderL'),0.8,['front','left','back','under']),
   ('elbow L',g.bone('ElbowL'),0.6,['front','left','back','right']),
   ('wrist L',g.bone('WristL'),0.55,['front','left','back','right']),
   ('waist',sp,0.9,['front','left','back','fl']),
   ('hip L',g.bone('HipL'),0.8,['front','left','back','under']),
   ('knee L',g.bone('KneeL'),0.65,['front','left','back','right']),
   ('ankle L',g.bone('AnkleL'),0.6,['front','left','back','right']),
   ('ponytail',mid('Pony1','Pony3'),0.9,['left','back','bl','top']),
   ('shoulder R',g.bone('ShoulderR'),0.8,['front','right','back','under']),
   ('hip R + crotch',[0,hips[1]-0.08,hips[2]],0.8,['front','under','back','fr']),
   ('head',[hd[0],hd[1]+0.12,hd[2]],0.8,['front','fl','left','top'])]
items=[]; tot={}
for name,t,dist,views in J:
    for v in views:
        g.cam(t,v,dist); im=g.grab(560); n=greens(im); tot[name]=tot.get(name,0)+n; items.append(('%s / %s  %d'%(name,v,n),im))
for i in range(0,len(items),16): print(sheet(items[i:i+16],4,384,'/home/claude/poly-runner/tests/shots/seam_%s_%d.png'%(tag,i//16)))
print('see-inside pixels per joint:',tot)
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:5]); g.close()
