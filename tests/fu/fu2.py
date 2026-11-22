# follow-ups 3/2/4: same rest model as before, band stats converted, pad weights
import sys,json,hashlib
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
D="document.getElementById('rigHost').__rigdbg()"
def grab(g):
    return g.ev("""()=>{var d=document.getElementById('rigHost').__rigdbg(),m=d.sk,a=m.geometry.attributes.position.array,w=m.geometry.attributes.skinWeight.array,si=m.geometry.attributes.skinIndex.array;
      return {n:a.length/3,pos:Array.from(a).map(function(v){return Math.round(v*1e5)/1e5}),w:Array.from(w).map(function(v){return Math.round(v*1e4)/1e4}),si:Array.from(si),bA:d.P['UpperArm.bandA'],bL:d.P['UpperArm.bandL'],dA:d.DEF['UpperArm.bandA'],dL:d.DEF['UpperArm.bandL'],fmt:d.P.fmt,rg:d.P.ringGap,names:Object.keys(d.bones)}}""")
res={}
for html in ['aud_pre.html','aud.html']:
    g=Rig(draw=False, html=html); g.open(); g.pg.wait_for_timeout(1500)
    res[html]=grab(g)
    print(html,'verts',res[html]['n'],'band stats',res[html]['bA'],res[html]['bL'],'defaults',res[html]['dA'],res[html]['dL'],'fmt',res[html]['fmt'],'ringGap',res[html]['rg'],'errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3])
    if html=='aud.html':
        print('  saved to storage on a clean open:',g.ev("localStorage.getItem('runnerRig2')===null"))
    g.close()
a,b=res['aud_pre.html'],res['aud.html']
if a['n']==b['n']:
    dmax=max(abs(x-y) for x,y in zip(a['pos'],b['pos']))
    print('rest positions: max difference',dmax,'m')
    # weights: compare as bone->weight maps per vertex
    nd=0; ex=[]
    for v in range(a['n']):
        ma={}; mb={}
        for q in range(4):
            if a['w'][4*v+q]>0: ma[a['si'][4*v+q]]=ma.get(a['si'][4*v+q],0)+a['w'][4*v+q]
            if b['w'][4*v+q]>0: mb[b['si'][4*v+q]]=mb.get(b['si'][4*v+q],0)+b['w'][4*v+q]
        if any(abs(ma.get(k,0)-mb.get(k,0))>2e-4 for k in set(ma)|set(mb)):
            nd+=1
            if len(ex)<6: ex.append((v,[round(c,3) for c in b['pos'][3*v:3*v+3]],{b['names'][k]:w for k,w in ma.items()},{b['names'][k]:w for k,w in mb.items()}))
    print('vertices whose weights changed:',nd); 
    for e in ex: print('   ',e)
else: print('DIFFERENT vertex counts')
