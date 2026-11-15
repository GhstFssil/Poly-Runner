import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
from playwright.sync_api import sync_playwright
exec(open('fu/y1.py').read().split("pg.click('#bDevT')")[0].split("g=Rig(")[0])
J=json.loads(json.dumps({'width':9,'pieces':[{'t':'straight','len':400}],'objects':[
 {'type':'hill','id':1,'x':60,'z':-80,'radius':40,'height':12},
 {'type':'tree','id':2,'x':60,'z':-80},{'type':'tree','id':3,'x':60,'z':-80,'y':3},{'type':'sign','id':4,'x':0,'z':-100,'yAbs':20},
 {'type':'seg','id':5,'x':0,'z':-50},{'type':'platform','id':6,'x':-60,'z':-120,'heading':0,'bend':0,'length':20,'width':10,'height':10,'thick':2},
 {'type':'ledge','id':7,'x':-120,'z':-60,'heading':0,'bend':0,'length':30,'thickness':10,'height':5},{'type':'gap','id':8,'s':150,'u':0,'length':10,'width':12}]}))
g=Rig(w=480,h=320,draw=False); pg=g.pg
pg.click('#bDevT'); pg.click('#dtPath'); pg.wait_for_timeout(2000)
print('game yInfo:',pg.evaluate("j=>document.getElementById('peHost').__yInfo(j)",J))
g.close()
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200])); pg.route('**/fonts.*/**',lambda r:r.abort())
    pg.add_init_script("window.HOST={__yInfo:function(j,ids){var ys={};ids.forEach(function(i){ys[i]=12.5});return {y0:0,ys:ys}}};")
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(300)
    s=open('/home/claude/poly-runner/path-editor.html').read()
    # select the seg: box-select around it
    pg.evaluate("(function(){})()")
    cv=pg.locator('#cv').bounding_box()
    vw=pg.evaluate("(function(){return 0})()")
    # use the editor's own selection by clicking the seg position via its view
    pg.evaluate("document.querySelector('#tools [data-tool=\"select\"]').click()")
    b.close()
print('ok')
