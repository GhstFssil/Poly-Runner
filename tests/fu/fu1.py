# follow-ups 7/8/9: stats in Zips, fade toggles, gravity
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
D="document.getElementById('rigHost').__rigdbg()"
def errs(g): return [e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'normalized normal' not in e][:6]
# 1. a browser with OLD saved stats (grip in units/s2 = 50) and nothing else
old={'stat.grip':50,'stat.top':90}
g=Rig(draw=False, storage={'runnerRig2':json.dumps(old)})
ph=g.ev("__phys()"); print('1 game on load, old saved grip 50 u/s2:',ph)
g.open(); g.ev(g.q('#statBox')+".open=true"); g.pg.wait_for_timeout(300)
print('  editor P: gripZ',g.P('stat.gripZ'),'grav',g.P('stat.grav'),'fadeWall',g.P('stat.fadeWall'),'fadeSlope',g.P('stat.fadeSlope'),'old key in P:',g.P('stat.grip'))
rows=g.ev("(function(){var R=document.getElementById('rigHost').shadowRoot;return Array.prototype.map.call(R.querySelectorAll('#statRows .row'),function(r){var l=r.querySelector('label').textContent,u=r.querySelector('.unit'),n=r.querySelector('input.num'),s=r.querySelector('.seg');return l+' | '+(n?n.value+' '+(u?u.textContent:''):'')+(s?Array.prototype.map.call(s.querySelectorAll('button'),function(b){return b.textContent+(b.getAttribute('aria-pressed')==='true'?'*':'')}).join('/'):'')})})()")
for r in rows: print('   ',r)
# 2. change them
print('2 typed gravity 30 ->',g.typed('stat.grav',30),'| grip 12.5 ->',g.typed('stat.gripZ',12.5),'| grav 0 ->',g.typed('stat.grav',0),g.P('stat.grav'),'| grip -3 ->',g.typed('stat.gripZ',-3),g.P('stat.gripZ'))
g.typed('stat.grav',30); g.typed('stat.gripZ',12.5)
g.ev("(function(){var R=document.getElementById('rigHost').shadowRoot;var rows=R.querySelectorAll('#statRows .row');for(var i=0;i<rows.length;i++){var s=rows[i].querySelector('.seg');if(s){var l=rows[i].querySelector('label').textContent;var b=s.querySelector(/slopes/.test(l)?'[data-v=\"1\"]':'[data-v=\"0\"]');b.click();}}})()"); g.pg.wait_for_timeout(300)
print('  toggles after clicking slope On / wall Off: fadeSlope',g.P('stat.fadeSlope'),'fadeWall',g.P('stat.fadeWall'))
card=g.ev(g.q('#statLive')+".innerText"); print('  card:',card.replace('\n',' | ')[:900])
g.ev(g.q('#moveBox')+".open=true"); g.pg.wait_for_timeout(500)
mv=g.ev(g.q('#moveBox')+".innerText"); 
import re
for key in ['Gravity is','Her grip','Past ','On a wall','Her grip on this slope','units a second','u/s']:
    i=mv.find(key); print('   movement text [%s]:'%key, mv[i:i+260].replace('\n',' ') if i>=0 else None)
# the across-a-slope table
i=mv.find('SLOPES: RUNNING STRAIGHT ACROSS'); print('   table:',mv[i:i+700].replace('\n',' ~ ') if i>=0 else mv[:300])
i=mv.find('WALL RUNNING'); print('   walls:',mv[i:i+500].replace('\n',' ~ ') if i>=0 else None)
saved=json.loads(g.ev("localStorage.getItem('runnerRig2')")); print('  saved stats: stat.grip' ,saved.get('stat.grip'),'gripZ',saved.get('stat.gripZ'),'grav',saved.get('stat.grav'),'fadeSlope',saved.get('stat.fadeSlope'),'fadeWall',saved.get('stat.fadeWall'))
# 3. close the editor: the game takes them
g.ev("(function(){var b=document.getElementById('rigHost').shadowRoot.querySelector('#closeRig')||document.querySelector('#rigClose');if(b)b.click();})()"); g.pg.wait_for_timeout(500)
print('3 buttons that could close:',g.ev("(function(){var R=document.getElementById('rigHost').shadowRoot;return Array.prototype.map.call(R.querySelectorAll('button'),function(b){return b.id+':'+b.textContent.trim().slice(0,18)}).filter(function(t){return /clos|back|done|exit|game/i.test(t)})})()"))
print('  game after:',g.ev("__phys()"))
# 4. reset stats
print('errors:',errs(g))
g.close()
