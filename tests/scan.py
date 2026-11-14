import json,sys,copy,functools
print=functools.partial(print,flush=True)
from audc import *
def variant(base, mods):
    j=copy.deepcopy(base)
    for idx,ch in mods.items():
        for i in ([idx] if isinstance(idx,int) else idx): j['pieces'][i].update(ch)
    return j
def scan_range(g, i0, i1, step=3, margin=0.75, batch=9):
    """scan in small batches (one long call can run the page out of memory) and add the results up"""
    tot=None; rows=[]
    a=i0
    while a<i1:
        r=json.loads(g.ev("__scan(%d,%d,%d,%s)"%(a,min(i1,a+batch*step),step,margin)))
        st=r['stat']
        if tot is None: tot=dict(st)
        else:
            for k,v in st.items():
                if k.startswith('worst'): tot[k]=v if abs(v)>abs(tot[k]) else tot[k]
                else: tot[k]+=v
        rows+=r['rows']; a+=batch*step
    return tot or {}, rows
def run(g, j, ranges, label, step=3, show=7):
    g.load(j)
    g.pg.add_script_tag(content=open('/home/claude/poly-runner/tests/scan_inpage.js').read())
    for (s0,s1) in ranges:
        i0,i1=g.ev("__srange(%f,%f)"%(s0,s1))
        st,rows=scan_range(g,i0,i1,step)
        print('%-12s s %d-%d (samples %d-%d): %s'%(label,s0,s1,i0,i1,json.dumps(st)))
        for row in rows[:show]: print('     ',row)
if __name__=='__main__':
    base=json.load(open(OUT+'t/oc4.json'))
    which=sys.argv[1]
    g=Game()
    C=[1,2]            # the long curve over open water (samples ~8..636)
    R=[3,4,5,6,7,8,9]  # straights running onto the crag island (samples ~636..1022)
    T=list(range(10,18)) # the tight climbing curve over rock (samples ~1022..1078)
    RNG=[(800,1040),(3660,4085),(4087,4295)]
    cases={
      'plain':   ({}, RNG),
      'ov':      ({tuple(C+R+T):{'ov':1}}, RNG),
      'ovbank':  ({tuple(C+R+T):{'ov':1,'roll':20,'b0':20}}, RNG),
      'ovslab':  ({tuple(C+R+T):{'ov':1,'fl':6}}, RNG),
      'ovbankslab':({tuple(C+R+T):{'ov':1,'fl':6,'roll':20,'b0':20}}, RNG),
      'bank':    ({tuple(C+R+T):{'roll':20,'b0':20}}, RNG),
      'slab':    ({tuple(C+R+T):{'fl':6}}, RNG),
    }
    for k in which.split(','):
        mods,rng=cases[k]
        m2={}
        for kk,v in mods.items():
            for i in kk: m2[i]=v
        run(g, variant(base,m2), rng, k)
    print(g.errs); g.close()
