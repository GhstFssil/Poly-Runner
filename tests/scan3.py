# scan any level file: python3 scan3.py '<json or @file>' '[[s0,s1],...]' [step] [margin]
import json,sys
from audc import *
from scan import scan_range
arg=sys.argv[1]; j=json.load(open(arg[1:])) if arg.startswith('@') else json.loads(arg)
rngs=json.loads(sys.argv[2]); step=int(sys.argv[3]) if len(sys.argv)>3 else 1; margin=sys.argv[4] if len(sys.argv)>4 else '0.75'
g=Game(); g.load(j); g.pg.add_script_tag(content=open('/home/claude/poly-runner/tests/scan_inpage.js').read())
for (s0,s1) in rngs:
    i0,i1=g.ev("__srange(%f,%f)"%(s0,s1))
    st,rows=scan_range(g,i0,i1,step,float(margin))
    print(s0,s1,'samples',i0,i1,json.dumps(st))
    ins=[x for x in rows if x[9]==1]; outs=[x for x in rows if x[9]!=1]
    print('  inside-width problems:',len(ins)); [print('    ',x) for x in ins[:int(sys.argv[5]) if len(sys.argv)>5 else 14]]
    print('  outside problems:',len(outs)); [print('    ',x) for x in outs[:6]]
print(g.errs); g.close()
