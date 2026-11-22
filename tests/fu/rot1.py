# Rotation (rot) on strip stamps (gap, ledge, mud, Seg Chain): old saves say heading and must still load; the Path Editor now writes rot
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
from playwright.sync_api import sync_playwright
def lay(**k):
    o={'type':'gap','id':1,'x':30,'z':-20,'bend':0,'length':40,'width':8,'ends':'round'}; o.update(k)
    return {'width':9,'pieces':[{'t':'straight','len':600}],'objects':[o]}
g=Rig(draw=False)
pts=[[30+d,-20] for d in range(-4,45,2)]+[[30,-20-d] for d in range(-4,45,2)]
def hit(j): return g.ev("a=>window.__ends(a[0],a[1])",[j,pts])
old=hit(lay(heading=90)); new=hit(lay(rot=90)); flat=hit(lay(heading=0))
print('old key heading=90 same as rot=90:',old==new,'| differs from 0:',old!=flat)
g.close()
J=lay(heading=90)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    pg.route('**/fonts.*/**',lambda r:r.abort()); pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    def rt(j):
        pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(j)); pg.wait_for_timeout(300)
        return json.loads(pg.evaluate("document.getElementById('json').value"))['objects'][0]
    a=rt(J); c=rt(lay(rot=90))
    print('saved from an old heading file: rot',a.get('rot'),'heading',a.get('heading'))
    print('saved from a rot file: rot',c.get('rot'),'heading',c.get('heading'))
    print('errors',errs)
