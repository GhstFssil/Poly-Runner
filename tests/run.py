# drive her along a stretch of a level and report what happened to her feet
# python3 run.py '<json or @file>' '[[s0,s1,{opts}],...]' ; opts: u (offset across), speed, ball, hold
import json,sys,copy
from audc import *
def drive(g, s0, s1, opt, maxwait=120):
    g.ev("__autorun(%f,%f,%s)"%(s0,s1,json.dumps(opt)))
    n=0
    while n<maxwait*4:
        g.pg.wait_for_timeout(250); n+=1
        if g.ev("__arLog.done"): break
    return json.loads(g.ev("JSON.stringify(__arLog)"))
if __name__=='__main__':
    arg=sys.argv[1]; j=json.load(open(arg[1:])) if arg.startswith('@') else json.loads(arg)
    runs=json.loads(sys.argv[2])
    g=Game(); g.load(j); g.pg.add_script_tag(content=open('/home/claude/poly-runner/tests/run_inpage.js').read())
    for r in runs:
        opt=r[2] if len(r)>2 else {}
        L=drive(g, r[0], r[1], opt)
        print('run s %.0f-%.0f %s -> end %s  frames %d  feet vs path: min %.2f max %.2f  air frames %d'%(r[0],r[1],json.dumps(opt),L.get('end'),L['n'],L['minD'],L['maxD'],L['airFrames']))
        for e in L['events'][:14]: print('     ',e)
    print(g.errs); g.close()
