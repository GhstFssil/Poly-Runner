import json,sys,copy
from audc import *
from scan import variant
base=json.load(open(OUT+'t/oc4.json'))
mods=json.loads(sys.argv[1]); s0=float(sys.argv[2]); s1=float(sys.argv[3])
C=[1,2]; R=[3,4,5,6,7,8,9]; T=list(range(10,18))
g=Game(); j=variant(base,{i:mods for i in C+R+T}); g.load(j); g.pg.add_script_tag(content=open('/home/claude/poly-runner/tests/scan_inpage.js').read())
r=json.loads(g.ev("__along(%f,%f)"%(s0,s1)))
print(' i      s      y   fl pv tn  terr |  dF(L)  dV(L) | dF(C) dV(C) | dF(R) dV(R)')
for row in r: print(' '.join(str(v).rjust(6) for v in row))
print(g.errs); g.close()
