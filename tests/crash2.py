import json,sys,time
from audc import *
base=json.load(open(OUT+'t/oc4.json'))
g=Game(); g.pg.on('crash', lambda: print('PAGE CRASHED',flush=True))
g.load(base); g.pg.add_script_tag(content=open('/home/claude/poly-runner/tests/scan_inpage.js').read())
t0=time.time()
for (s0,s1) in [(800,1040),(3660,4085)]:
    i0,i1=g.ev("__srange(%f,%f)"%(s0,s1)); print('range',s0,s1,i0,i1,flush=True)
    try:
        r=json.loads(g.ev("__scan(%d,%d,3)"%(i0,i1)))
        print(' ok',r['stat'],'heapMB',g.ev("Math.round(performance.memory.usedJSHeapSize/1e6)"),'t',round(time.time()-t0),flush=True)
    except Exception as e:
        print('FAILED',str(e)[:120],'t',round(time.time()-t0),flush=True); break
g.close()
