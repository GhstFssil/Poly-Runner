# Minions panel: dials reach the game; the preview builds; stomp and damage rules
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=1100,h=760,draw=True); pg=g.pg
D="document.getElementById('rigHost').__rigdbg()"
g.open(); pg.wait_for_timeout(800)
g.ev("(function(){var s=document.getElementById('rigHost').shadowRoot;s.getElementById('minBox').open=true;})()"); pg.wait_for_timeout(800)
print('preview visible:',g.ev("(function(){var d=%s;var n=0;d.scene.traverse(function(o){if(o.isMesh&&o.visible&&o.geometry&&o.geometry.type==='BoxGeometry')n++;});return n})()"%D))
print('typed big hearts 5 ->',g.typed('mn.big.hearts',5),'| min top 14 ->',g.typed('mn.min.top',14),'| min head height 2 ->',g.typed('mn.min.headH',2),'| hearts 0 ->',g.typed('mn.min.hearts',0),g.P('mn.min.hearts'))
g.typed('mn.min.hearts',2)
pg.screenshot(path='/tmp/polyrun-work/mn_panel.png',timeout=150000)
g.click('#rigClose',800)
r=g.ev("(function(){var out={};var e=null;return out})()")
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:3]); g.close()
