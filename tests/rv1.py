from rv import *
g=V()
items=[]
for m,ph in [('rest',None),('run',0.25)]:
    g.mode(m,ph); g.fix()
    for v,dist in [('front',4.6),('left',4.6),('back',4.6),('fl',4.6)]:
        g.cam([0,0.9,0],v,dist); im=g.grab(640); items.append(('%s %s  see-inside px %d'%(m,v,greens(im)),im))
print(sheet(items,4,384,'/home/claude/poly-runner/tests/shots/seam_overview.png'))
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:5]); g.close()
