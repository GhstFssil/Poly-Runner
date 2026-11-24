# Sunset Hill (ground 'sunset'): the hill's slopes range from almost flat to about 45 degrees and every spoke meets at the summit;
# ravines exist and cut through a path instead of bridging it; the terrain's own trees grow below the treeline and none above it.
#   python3 fu/sunset1.py [html]
import sys
sys.path.insert(0, '/home/claude/poly-runner/tests')
from righ import *
html = sys.argv[1] if len(sys.argv) > 1 else 'aud.html'
g = Rig(w=480, h=320, draw=False, html=html); pg = g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
J = {'width': 9, 'terrain': 'sunset', 'pieces': [{'t': 'straight', 'len': 6000}], 'objects': []}
pg.evaluate("j=>__sbStart(j)", J); pg.wait_for_timeout(1500)
r = pg.evaluate("""()=>{var A=[],rv=0,n=0,e=5,tops=[];
  for(var a=0;a<12;a++)tops.push(__shDbg(30*Math.cos(a/2),-9000+30*Math.sin(a/2))[0]);
  for(var x=-8000;x<=8000;x+=131)for(var z=-17000;z<=1000;z+=131){if(Math.hypot(x,z+9000)>8800)continue;n++;
    var q=__shDbg(x,z),gx=(__shDbg(x+e,z)[0]-q[0])/e,gz=(__shDbg(x,z+e)[0]-q[0])/e;A.push(Math.atan(Math.hypot(gx,gz))*180/Math.PI);if(q[1]>0)rv++;}
  A.sort((a,b)=>a-b);
  var cut=0;for(var z=-200;z>-6000;z-=3){var d=__shDbg(0,z);if(d[1]>30){cut=Math.max(cut,d[0]-__gh(0,z));}}
  return {tmin:Math.min(...tops),tmax:Math.max(...tops),p5:A[Math.floor(A.length*.05)],p95:A[Math.floor(A.length*.95)],max:A[A.length-1],rav:rv/n,cut:cut}}""")
low = pg.evaluate("()=>__treeDbg(0,-400)"); high = pg.evaluate("()=>__treeDbg(0,-8000)")
errs = [e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'GL Driver' not in e]
g.close()
print('summit %.0f-%.0f, slopes p5 %.1f p95 %.1f max %.1f deg, ravines %.1f%% of the hill, deepest cut through the path %.0f, trees near the foot %d, near the summit %d'
      % (r['tmin'], r['tmax'], r['p5'], r['p95'], r['max'], 100 * r['rav'], r['cut'], low[0], high[0]))
ok = (abs(r['tmax'] - r['tmin']) < 1 and r['p5'] < 5 and 35 < r['p95'] < 45 and r['max'] < 47 and 0.03 < r['rav'] < 0.2
      and r['cut'] > 30 and low[0] > 500 and high[0] == 0 and not errs)
print('errors', errs[:3]); print('PASS' if ok else 'FAIL')
