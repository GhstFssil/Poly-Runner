# gradual slopes: editor and game heights agree; sharp is unchanged; the shape is right
import json,sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from playwright.sync_api import sync_playwright
from righ import *
s=open('/home/claude/poly-runner/path-editor.html').read()
s=s.replace("  function at(s) {\n","  window.__pe = { at: function (q) { return at(q); }, samples: function () { return samples; } };\n  function at(s) {\n",1)
open('/tmp/polyrun-work/pe_vc.html','w').write(s)
def lay(sm):
    P=[{"len":100,"ang":0,"r":640,"dy":0},{"len":100,"ang":0,"r":640,"dy":40},{"len":120,"ang":30,"r":229.18,"dy":-20},{"len":100,"ang":0,"r":640,"dy":0}]
    if sm: P[1]['sm']=1; P[1]['smL']=40
    return {"version":2,"width":9,"pieces":P,"objects":[]}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.route('**/fonts.*/**',lambda r:r.abort()); pg.goto('file:///tmp/polyrun-work/pe_vc.html'); pg.wait_for_timeout(1000)
    E={}
    for sm in (0,1):
        pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(lay(sm))); pg.wait_for_timeout(200)
        E[sm]=pg.evaluate("window.__pe.samples().map(q=>[+q.s.toFixed(3),+q.y.toFixed(4)])")
    b.close()
g=Rig(w=480,h=320,draw=False); pg=g.pg; pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
G={}
for sm in (0,1):
    pg.evaluate("j=>__sbStart(j)",lay(sm)); pg.wait_for_timeout(1200)
    G[sm]=pg.evaluate("__dbg().SB.samples.map(q=>[+q.s.toFixed(3),+q.y.toFixed(4)])")
g.close()
for sm in (0,1):
    d=max(abs(a[1]-c[1]) for a,c in zip(E[sm],G[sm])) if len(E[sm])==len(G[sm]) else 'count differs %d %d'%(len(E[sm]),len(G[sm]))
    print('sm',sm,'samples',len(E[sm]),'editor vs game max height difference',d)
# shape: around the joint at s=100 (grade 0 -> 0.4, blend 40): expected offset at the joint = 0.4*40/8 = 2; at s=80 and 120 no change
def y(arr,s0): return min(arr,key=lambda q:abs(q[0]-s0))
print('sharp at s=100',y(E[0],100),'gradual',y(E[1],100),'(expect +2)')
print('s=80',y(E[0],80),y(E[1],80),'| s=120',y(E[0],120),y(E[1],120),'(same)')
# joint at s=200 (0.4 -> -20/120): offset (g2-g1)*L/8 = (-0.1667-0.4)*40/8 = -2.83
print('s=200 sharp',y(E[0],200),'gradual',y(E[1],200),'(expect -2.83)')
print('joint s=320 (segment 3 -> 4) untouched, neither asks:',y(E[0],320),y(E[1],320))
# smoothness: max change in grade between consecutive samples near s=100
def maxkink(arr,a0,a1):
    gs=[(arr[i+1][1]-arr[i][1])/(arr[i+1][0]-arr[i][0]) for i in range(len(arr)-1) if a0<=arr[i][0]<=a1 and arr[i+1][0]>arr[i][0]]
    return round(max(abs(gs[i+1]-gs[i]) for i in range(len(gs)-1)),4)
print('largest grade jump between samples near the joints: sharp',maxkink(E[0],60,240),'gradual',maxkink(E[1],60,240))
