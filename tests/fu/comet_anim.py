# Rig Editor: Comet's Star Throw, Hover and Fly modes show her pose and stars and their stats change them
import sys; sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
SP=sys.argv[1] if len(sys.argv)>1 else '/tmp'
g=Rig(w=1100,h=760); g.open(); pg=g.pg
vis=lambda sel: g.ev("s=>{var e=document.getElementById('rigHost').shadowRoot.querySelector(s);return !!e&&getComputedStyle(e).display!=='none'}",sel)
print('on Molly page, Star Throw button shown:',vis('[data-m=cThrow]'))
g.click('#pages button[data-pg="comet"]',1500); print('on Comet page:',vis('[data-m=cThrow]'),vis('[data-m=cHover]'),vis('[data-m=cFly]'))
g.click('#views button[data-v="tq"]',300)
for m,ph in [('cThrow',0.3),('cThrow',0.62),('cHover',0.25),('cFly',0.3)]:
    g.click('#modes2 button[data-m="%s"]'%m,500)
    g.ev("p=>{var R=document.getElementById('rigHost').shadowRoot;var e=R.querySelector('#phase');e.value=p;e.dispatchEvent(new Event('input',{bubbles:true}))}",str(ph)); pg.wait_for_timeout(700)
    n=g.ev(R+".querySelectorAll('#animSec input[type=range]').length")
    pg.screenshot(path=SP+'/ed_%s_%s.png'%(m,ph)); print(m,ph,'stats',n,'title',g.ev(g.q('#animTitle')+'.textContent'))
g.click('#modes2 button[data-m="cFly"]',300); print('fly: arm raise typed',g.typed('comet.pf.aLp',90,400)); pg.screenshot(path=SP+'/ed_cFly_edit.png')
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GPU stall' not in e][:5]); g.close()
