from rv import *
import sys
g=V(w=1000,h=760)
JOINTS=[('neck','Head',0,-0.10,0,0.4),('head','Head',0,0.12,0,0.7),('shoulderL','ShoulderL',0,0,0,0.7),('elbowL','ElbowL',0,0,0,0.55),('wristL','WristL',0,0,0,0.5),('waist','Spine',0,0,0,0.8),('hipL','HipL',0,0,0,0.7),('kneeL','KneeL',0,0,0,0.6),('ankleL','AnkleL',0,0,0,0.55),('pony','Pony2',0,0,0,0.8)]
DIRS=['front','back','left','right','top','under','fl','br']
def norm(v):
    L=math.sqrt(sum(x*x for x in v)); return [x/L for x in v]
POSES=[['rest',None],['run',0.25],['jump',0.42],['slide',0.36]]
VARS=json.loads(sys.argv[1])
DEF=json.loads(g.ev("JSON.stringify("+D+".DEF)"))
print('%-26s %-10s'%('settings','pose')+' '.join('%9s'%j[0] for j in JOINTS),flush=True)
for name,ch in VARS:
    g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,c[k]);}",ch); g.pg.wait_for_timeout(700); g.fix()
    m=g.mesh()
    for pm,ph in POSES:
        g.mode(pm,ph); g.pg.wait_for_timeout(200)
        views=[[j[1],norm(VIEWS[d]),j[5],j[2],j[3],j[4]] for j in JOINTS for d in DIRS]
        r=g.ev(COUNT,views); row=[]
        for i,j in enumerate(JOINTS):
            c=[(r[i*len(DIRS)+k][0] if r[i*len(DIRS)+k][0]<0.3*max(1,r[i*len(DIRS)+k][1]) else -1) for k in range(len(DIRS))]; row.append('%4d/%-4s'%(max(c),DIRS[c.index(max(c))][:2]))
        print('%-26s %-10s'%(name if pm=='rest' else '','%s %s'%(pm,ph or ''))+' '.join(row)+('   tris %d nan %d'%(m['tris'],m['nan']) if pm=='rest' else ''),flush=True)
    g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,d.DEF[k]);}",ch)
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'ReadPixels' not in e][:5]); g.close()
