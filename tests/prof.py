import json,sys
from audc import *
j=json.load(open(OUT+'t/oc4.json'))
g=Game()
g.load(j)
r=g.ev("""(function(){var B=__dbg().SB,sm=B.samples,o=[];for(var i=0;i<sm.length;i+=10){var q=sm[i];o.push([i,Math.round(q.s),+q.x.toFixed(0),+q.z.toFixed(0),+q.y.toFixed(1),+__tb('level2',q.x,q.z).toFixed(1),q.tn?1:0,+(q.roll||0).toFixed(1)]);}return JSON.stringify({n:sm.length,o:o,start:B.startPt});})()""")
r=json.loads(r); print('samples',r['n'],'start',r['start'])
last=None
for row in r['o']:
    cls='rock' if row[5]>row[4]+0.3 else ('near' if row[5]>row[4]-4 else ('shallow' if row[5]>30 else 'water'))
    if cls!=last: print(row,cls); last=cls
print(g.errs); g.close()
