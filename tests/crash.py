import json,sys
from audc import *
base=json.load(open(OUT+'t/oc4.json'))
g=Game(); g.pg.on('console', lambda m: print('CONSOLE',m.text[:200]) if m.type in('error','warning') else None)
g.pg.on('crash', lambda: print('PAGE CRASHED'))
g.load(base); g.pg.add_script_tag(content=open('/home/claude/poly-runner/tests/scan_inpage.js').read())
i0,i1=g.ev("__srange(3660,4085)"); print(i0,i1)
for a in range(i0,i1,6):
    try:
        r=json.loads(g.ev("__scan(%d,%d,3)"%(a,min(i1,a+6))))
        mem=g.ev("performance.memory?Math.round(performance.memory.usedJSHeapSize/1e6):-1")
        ng=g.ev("(function(){var n=0;__T().scene.traverse(function(o){n++});return n})()")
        print(a,r['stat']['n'],'heapMB',mem,'sceneObjs',ng,flush=True)
    except Exception as e:
        print('FAILED at',a,str(e)[:100]); break
g.close()
