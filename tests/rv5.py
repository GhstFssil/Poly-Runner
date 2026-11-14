from righ import *
g=Rig(draw=False); g.open()
r=g.ev("""()=>{var d=document.getElementById('rigHost').__rigdbg(),o={};d.SEGS.forEach(function(s){var L=d.P[s.id+'.len'];o[s.id]=[L,d.tList(s.id).map(function(t){return +(t*L).toFixed(2)})];});return o}""")
for k,(L,ts) in r.items():
    gaps=[round(ts[i+1]-ts[i],2) for i in range(len(ts)-1)]
    print('%-11s len %5.1f cm  rings %2d  thinnest strips (cm): %s   all: %s'%(k,L,len(ts),sorted(gaps)[:5],ts))
g.close()
