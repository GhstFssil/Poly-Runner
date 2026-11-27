# Rig Editor Mobs page: Save to Game hands the mobs' stats to the game right away (no close needed) and says so on the Mobs page's own status line; Reset This One's message shows there too
import sys; sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=1100,h=760); g.open(); pg=g.pg
vis=lambda sel: g.ev("s=>{var e=document.getElementById('rigHost').shadowRoot.querySelector(s);return !!e&&getComputedStyle(e).display!=='none'}",sel)
ok=True
def chk(name,c):
    global ok; ok=ok and bool(c); print(('PASS ' if c else 'FAIL ')+name)
chk('no mobs Save to Game on the Molly page', g.ev(g.q('#saveMobs')+'.getClientRects().length')==0)
g.click('#pages button[data-pg="mobs"]',1200)
chk('button and status line shown on Mobs', vis('#saveMobs') and vis('#minStatus'))
g.click('#minTabs button[data-mt="min"]',400)
g.ev("(()=>{var h=document.getElementById('rigHost'),f=h.__apply;window.__applied=0;h.__apply=function(){window.__applied++;f();};})()")
r=g.typed('mn.min.scale',1.7,300)
chk('scale row took 1.7 ('+str(r)+')', r!='norow')
chk('not handed to the game before saving', g.ev("window.__applied")==0)
g.click('#saveMobs',400)
chk('Save hands the stats to the game once', g.ev("window.__applied")==1)
chk('stored with Molly: mn.min.scale 1.7', abs(g.ev("JSON.parse(localStorage.getItem('runnerRig2'))['mn.min.scale']")-1.7)<1e-6)
msg=g.ev(g.q('#minStatus')+'.textContent')
chk('status says saved: '+msg, msg.startswith('Saved.'))
chk('editor still open', g.ev("document.getElementById('rigHost').__open")==True)
g.click('#resetMin',300)
chk('reset message shows on Mobs: '+g.ev(g.q('#minStatus')+'.textContent'), 'reset' in g.ev(g.q('#minStatus')+'.textContent'))
print('ALL PASS' if ok else 'SOME FAILED')
