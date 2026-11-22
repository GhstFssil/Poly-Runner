# Shipped defaults (fresh browser): Molly and Comet play with their own settings and models; Copy Settings carries all three pages and Apply puts each back; Comet keeps no mob stats
import sys,json; sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=1100,h=760,draw=False); pg=g.pg
st=lambda: pg.evaluate("(function(){var c=__comet();return {char:c.char,top:c.top}})()")
cfg=lambda: pg.evaluate("(function(){var p=__phys?__phys():{};return p})()")
print('fresh Molly:',st(),'brake/fric/wallGrip from __statcard:',pg.evaluate("document.getElementById('charStats')?1:0"))
pg.evaluate("__setChar('comet')"); pg.wait_for_timeout(3000); print('fresh Comet:',st())
suit=pg.evaluate("(function(){var c=null;try{var r=__dbg();}catch(e){}return null})()")
g.open()
print('editor opens on',g.ev(g.q('#rigH1')+'.textContent'),'brake',g.ev(R+".querySelector('#s_stat_brake').value"),'fric',g.ev(R+".querySelector('#s_stat_fric').value"))
g.click('#pages button[data-pg="comet"]',1500); print('comet page top',g.ev(R+".querySelector('#s_stat_top').value"),'accel',g.ev(R+".querySelector('#s_stat_accelT').value"),'suit',g.ev("document.getElementById('rigHost').shadowRoot.querySelector('#c_cSuit').value"))
g.typed('stat.top',66,200); g.click('#resetStats',300); print('Reset Stats on Comet: top',g.ev(R+".querySelector('#s_stat_top').value"),'(her default 50)')
g.typed('stat.top',61,200); g.click('#copyJson',300)
blk=json.loads(g.ev(g.q('#json')+'.value')); print('copied block parts:',[k for k in blk],'molly has mn:',any(k.startswith('mn.') for k in blk['molly']),'comet has mn:',any(k.startswith('mn.') for k in blk['comet']),'mobs keys',len(blk['mobs']),'comet top',blk['comet']['stat.top'])
blk['molly']['stat.top']=77; blk['comet']['stat.top']=55; blk['mobs']['mn.min.top']=19
g.ev("t=>{var R=document.getElementById('rigHost').shadowRoot;R.querySelector('#json').value=t;R.querySelector('#applyJson').click()}",json.dumps(blk)); pg.wait_for_timeout(800)
print('apply:',g.ev(g.q('#status')+'.textContent'),'| comet page top now',g.ev(R+".querySelector('#s_stat_top').value"))
s=pg.evaluate("[JSON.parse(localStorage.getItem('runnerRig2'))['stat.top'],JSON.parse(localStorage.getItem('runnerRig2'))['mn.min.top'],JSON.parse(localStorage.getItem('cometRig'))['stat.top'],Object.keys(JSON.parse(localStorage.getItem('cometRig'))).filter(function(k){return k.indexOf('mn.')===0}).length]")
print('stored: molly top, mob top, comet top, mob keys in comet store:',s)
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:5]); g.close()
