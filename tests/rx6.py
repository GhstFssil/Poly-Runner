from righ import *
g=Rig(draw=False); g.open()
D="document.getElementById('rigHost').__rigdbg()"
emb=json.loads(g.ev("document.getElementById('molly-settings').textContent"))
DEF=json.loads(g.ev("JSON.stringify("+D+".DEF)"))
RIG=json.loads(g.ev("JSON.stringify((function(){var o={};['stat.top','stat.accelT','stat.brake','stat.jumpH','stat.grip','stat.fall','stat.hearts','stat.colH','stat.colW','stat.wallGrip','stat.fric'].forEach(function(k){o[k]=1});return o})())"))
diff=[(k,DEF[k],emb[k]) for k in DEF if k in emb and DEF[k]!=emb[k]]
import collections
grp=collections.Counter(re.sub(r'\.\d+\.\w+$','.<key>',k) if k.startswith('m.') else k.split('.')[0] if '.' in k else k for k,_,_ in diff)
print(grp)
print('non-pose diffs:',[(k,a,b) for k,a,b in diff if not re.match(r'm\.\w+\.\d+\.',k)])
print('embedded has stat/barrier/drift/slope keys:',{k:emb[k] for k in emb if re.match(r'(stat|barrier|slope)\.|m\.drift\.(lean|angle|time|minZips|cool|rate)',k)})
print('embedded keys not in DEF:',[k for k in emb if k not in DEF])
print('n emb',len(emb),'n DEF',len(DEF))
g.close()
