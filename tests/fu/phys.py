import sys; sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
r={}
for h in ['aud_pre.html','aud.html']:
    g=Rig(w=480,h=320,draw=False,html=h); r[h]=g.ev("__phys2()"); g.close()
a,b=r['aud_pre.html'],r['aud.html']
print(b)
print('differences at default settings:',{k:(a.get(k),b.get(k)) for k in set(a)|set(b) if a.get(k)!=b.get(k)})
