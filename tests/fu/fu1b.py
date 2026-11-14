import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(draw=False, storage={'runnerRig2':json.dumps({'stat.grip':50,'stat.top':90})})
g.open(); g.ev(g.q('#statBox')+".open=true"); g.pg.wait_for_timeout(300)
g.typed('stat.grav',30); g.typed('stat.gripZ',12.5)
g.ev("(function(){var R=document.getElementById('rigHost').shadowRoot;var rows=R.querySelectorAll('#statRows .row');for(var i=0;i<rows.length;i++){var s=rows[i].querySelector('.seg');if(s){var l=rows[i].querySelector('label').textContent;var b=s.querySelector(/slopes/.test(l)?'[data-v=\"1\"]':'[data-v=\"0\"]');b.click();}}})()"); g.pg.wait_for_timeout(300)
g.click('#rigClose',800)
print('game after closing the editor:',g.ev("__phys()"))
print('pause/character card:',g.ev("(function(){var a=document.getElementById('charStats');return a?a.innerText.replace(/\\n/g,' | ').slice(0,400):null})()"))
# reset stats goes back to the shipped ones
print('visible:',g.ev("['bDevT','dtRig','bPlay','devMenu','titleCard'].map(function(i){var e=document.getElementById(i);return i+':'+(e?(e.offsetParent!==null):'none')})"));
g.ev("document.getElementById('dtRig').click()"); g.pg.wait_for_timeout(2500); g.ev(g.q('#statBox')+".open=true"); g.click('#resetStats',300)
print('after Reset stats:',{k:g.P(k) for k in ['stat.top','stat.grav','stat.gripZ','stat.fadeSlope','stat.fadeWall','stat.wallGrip']})
g.click('#rigClose',800); print('game:',g.ev("__phys()"))
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:5])
g.close()
