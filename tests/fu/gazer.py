# Roost Gazer: Path Editor stamp + save/load; in the game: chase buzzes round her head, idle hovers, cycle moves like a platform,
# touching it does no damage, it shoots a laser (half a heart), the Barrier absorbs lasers, hitting it with the Barrier defeats it.
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1200,'height':800}); pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    base={"version":2,"width":9,"pieces":[{"len":300}],"objects":[{"type":"start","id":1,"s":10,"u":0}]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('#tools [data-tool=\"gazer\"]').click()"); pg.wait_for_timeout(300)
    print('inspector has Behavior:',pg.evaluate("!!document.querySelector('[data-ok=\"gm\"]')")); assert pg.evaluate("!!document.querySelector('[data-ok=\"gm\"]')")
    bx=pg.locator('#cv').bounding_box(); pg.mouse.click(bx['x']+bx['width']/2,bx['y']+bx['height']/2); pg.wait_for_timeout(300)
    out=json.loads(pg.evaluate("document.getElementById('json').value")); g=[o for o in out['objects'] if o['type']=='gazer']
    print('placed:',g); assert len(g)==1 and g[0]['mode']=='chase' and g[0]['height']==6
    # the next gazer starts as cycle once it is set that way (the inspector edits the next stamp until one is picked)
    pg.evaluate("()=>{var s=document.querySelector('[data-ok=\"gm\"]');s.value='cycle';s.dispatchEvent(new Event('change',{bubbles:true}))}"); pg.wait_for_timeout(300)
    print('cycle fields shown:',pg.evaluate("!!document.querySelector('[data-ok=\"move\"]')")); assert pg.evaluate("!!document.querySelector('[data-ok=\"move\"]')")
    pg.mouse.click(bx['x']+bx['width']/2+120,bx['y']+bx['height']/2); pg.wait_for_timeout(300)
    out=json.loads(pg.evaluate("document.getElementById('json').value")); g=[o for o in out['objects'] if o['type']=='gazer'][-1]; print('cycle saved:',g)
    assert g['mode']=='cycle' and g['move']=='side' and g['travel']==40 and g['period']==4
    rt=json.dumps(out); pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",rt); pg.wait_for_timeout(300)
    out2=json.loads(pg.evaluate("document.getElementById('json').value")); assert [o for o in out2['objects'] if o['type']=='gazer']==[o for o in out['objects'] if o['type']=='gazer'], 'round trip'
    print('editor errors:',errs); assert not errs
    b.close()
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
J={'width':40,'pieces':[{'t':'straight','len':600}],'terrain':'','objects':[
 {'type':'gazer','id':11,'x':20,'z':-100,'mode':'chase','height':6},
 {'type':'gazer','id':12,'x':-20,'z':-100,'mode':'idle','height':9},
 {'type':'gazer','id':13,'x':0,'z':-300,'mode':'cycle','height':6,'move':'side','travel':40,'period':4}]}
pg.evaluate("j=>__sbStart(j)",J); pg.wait_for_timeout(1500)
def gz(): return [q for q in pg.evaluate("()=>__ens()") if q['gz'] and q['act']]
G=gz(); print('gazers:',[(q['gm'],round(q['x']-60000,1),round(q['z'],1)) for q in G]); assert len(G)==3
# idle: stays home, hovers 9 up
pg.evaluate("()=>document.getElementById('dvinvBtn').click()")   # invulnerable on, so lasers don't muddy these checks
pg.evaluate("()=>__put(60000, 0, -60)"); pg.wait_for_timeout(2500)
I=[q for q in gz() if q['gm']=='idle'][0]; print('idle at',round(I['x']-60000,2),round(I['z'],2),'fy',round(I['fy'],2)); assert abs(I['x']-59980)<0.01 and abs(I['z']+100)<0.01 and abs(I['fy']-9)<0.6
# chase: within ~10-13 of her, above her head
import math
for i in range(60):
    C=[q for q in gz() if q['gm']=='chase'][0]; s=pg.evaluate("()=>__state()"); dd=math.hypot(C['x']-s['x'],C['z']-s['z'])
    if dd<16: break
    pg.wait_for_timeout(250)
print('chase: distance',round(dd,1),'height above her',round(C['fy']-s['y'],2)); assert dd<16 and C['fy']-s['y']>3
# cycle: swings +-20 across the path
xs=[]
for i in range(16): pg.wait_for_timeout(250); xs.append([q for q in gz() if q['gm']=='cycle'][0]['x']-60000)
print('cycle x range',round(min(xs),1),round(max(xs),1)); assert max(xs)-min(xs)>25
pg.evaluate("()=>document.getElementById('dvinvBtn').click()")   # off again
# touching it does no damage and still blocks her
e=[q for q in gz() if q['gm']=='idle'][0]
r=pg.evaluate("a=>{var h0=__state().hp;for(var i=0;i<6;i++){__put(a[0],a[1],a[2]);__enUpd(0.016);}var s=__state();return [h0,s.hp,Math.hypot(s.x-a[0]+0.2,s.z-a[2])]}",[e['x']+0.2,e['fy']+0.2,e['z']])
print('contact hp',r[0],'->',r[1],'pushed out to',round(r[2],2)); assert r[1]==r[0] and r[2]>0.5
# laser: standing in range of the idle gazer costs half hearts (a half heart on the display)
pg.evaluate("()=>__put(59980, 0, -85)"); pg.wait_for_timeout(5000)
hp=pg.evaluate("()=>__state().hp"); print('hp after 5 s in laser range:',hp); assert hp<3 and (hp*2)%1==0 and hp!=int(hp) or hp<=2
half=pg.evaluate("()=>document.querySelectorAll('#hp .heart-crack').length"); print('cracked hearts shown:',half)
# Barrier: absorbed
pg.evaluate("()=>{document.getElementById('dvpower').click(); __setHp(3)}"); pg.keyboard.press('Digit2'); pg.wait_for_timeout(300)
pg.evaluate("()=>__put(59980, 0, -85)"); pg.wait_for_timeout(4500); hb=pg.evaluate("()=>[__state().hp,__ballLean()[2]]"); print('hp with Barrier on:',hb); assert hb[1] and hb[0]==3
# Barrier hit at speed defeats it
e=[q for q in gz() if q['gm']=='idle'][0]
pg.evaluate("a=>{__st({ballOn:true,speed:120*2});for(var i=0;i<4;i++){__put(a[0],a[1]-0.5,a[2]);__st({speed:240});__enUpd(0.016);}}",[e['x']+0.2,e['fy'],e['z']])
dead=[q for q in pg.evaluate("()=>__ens()") if q['gz'] and q['gm']=='idle'][0]['dead']; print('idle gazer dead after a fast Barrier hit:',dead); assert dead
errs=[x for x in g.errs if 'flatShading' not in x and 'ERR_FAILED' not in x and 'GL Driver' not in x]; print('game errors',errs[:3]); assert not errs
g.close(); print('OK')
