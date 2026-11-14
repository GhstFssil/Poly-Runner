import sys; sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(draw=False); g.open()
print(g.ev("(function(){var R=document.getElementById('rigHost').shadowRoot;return Array.prototype.map.call(R.querySelectorAll('#modes [data-m], #modes2 [data-m]'),function(b){return b.getAttribute('data-m')+':'+b.textContent.trim()})})()"))
g.close()
