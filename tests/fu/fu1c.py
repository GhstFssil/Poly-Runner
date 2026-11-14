import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
pts="[[-640,-8215],[-1280,-7575],[-187,-8028],[-25,-7600],[0,-7500]]"   # on the built curve (centre -640,-7575, radius 640): far point, exit, 45 degrees in, start
for html in ['aud_pre.html','aud.html']:
    for st in [None,{'stat.top':90},{'stat.grip':60}]:
        g=Rig(draw=False, html=html, storage={'runnerRig2':json.dumps(st)} if st else None)
        print(html, st, [round(v,1) for v in g.ev("(function(){var p="+pts+";return p.map(function(q){return __gh0(q[0],q[1])})})()")])
        g.close()
