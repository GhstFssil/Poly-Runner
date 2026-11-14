from righ import *
D="document.getElementById('rigHost').__rigdbg()"
g=Rig(draw=False); g.open()
g.click('#modes2 [data-m="barrier"]',500)
print(g.typed('barrier.radius',2.5,400), g.P('barrier.radius'), g.ev(D+".barrier.children[0].children[0].geometry.parameters.radius"))
g.click('#resetAnim',600)
print('status',g.status(),'P',g.P('barrier.radius'),'DEF',g.ev(D+".DEF['barrier.radius']"),'geo',g.ev(D+".barrier.children[0].children[0].geometry.parameters.radius"),'mode',g.ev(D+".ui.mode"), 'box',g.ev(g.q('#s_barrier_radius')+".value"))
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:5]); g.close()
