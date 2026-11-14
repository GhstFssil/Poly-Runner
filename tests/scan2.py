import json,sys,copy
from audc import *
from scan import variant, scan_range
base=json.load(open(OUT+'t/oc4.json'))
mods=json.loads(sys.argv[1]); rngs=json.loads(sys.argv[2]); step=int(sys.argv[3]) if len(sys.argv)>3 else 1
C=[1,2]; R=[3,4,5,6,7,8,9]; T=list(range(10,18))
g=Game(); j=variant(base,{i:mods for i in C+R+T}); g.load(j); g.pg.add_script_tag(content=open('/home/claude/poly-runner/tests/scan_inpage.js').read())
for (s0,s1) in rngs:
    i0,i1=g.ev("__srange(%f,%f)"%(s0,s1))
    st,rows=scan_range(g,i0,i1,step,float(sys.argv[4]) if len(sys.argv)>4 else 0.75)
    print(s0,s1,'samples',i0,i1,json.dumps(st))
    ins=[x for x in rows if x[9]==1]; outs=[x for x in rows if x[9]!=1]
    print('  inside-width problems:',len(ins)); [print('    ',x) for x in ins[:25]]
    print('  outside problems:',len(outs)); [print('    ',x) for x in outs[:8]]
print(g.errs); g.close()
