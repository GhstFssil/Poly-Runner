import json
from playwright.sync_api import sync_playwright
J={"version":2,"width":9,"pieces":[{"len":300}],"objects":[
 {"type":"toxic","id":1,"x":40,"z":-40,"width":20,"length":20},
 {"type":"toxic","id":2,"x":48,"z":-44,"width":20,"length":20},
 {"type":"toxic","id":3,"x":55,"z":-38,"width":20,"length":20},
 {"type":"tree","id":4,"x":-40,"z":-40},
 {"type":"sign","id":5,"x":-80,"z":-80}]}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200])); pg.route('**/fonts.*/**',lambda r:r.abort())
    pg.goto('file:///tmp/polyrun-work/pe_layers.html'); pg.wait_for_timeout(1200)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(300)
    L=lambda: pg.evaluate("__S().layers.map(l=>l.name+(l.vis===false?'(hidden)':''))")
    lay=lambda: pg.evaluate("__S().objs.map(o=>[o.id,(__S().layers.filter(l=>l.id===(o.layer||__S().layers[0].id))[0]||{}).name])")
    pg.keyboard.press('Control+a'); pg.wait_for_timeout(200)
    pg.click('button[data-gact=split]'); pg.wait_for_timeout(300)
    print('after Layer-Split Overlap:',pg.evaluate("document.getElementById('msg').textContent"),'| layers',L(),'| stamps',lay())
    # select layer 2
    pg.locator('#layers [data-lid]').nth(1).locator('button[data-lact=sel]').click(); pg.wait_for_timeout(200)
    print('Select on the second row:',pg.evaluate("document.getElementById('msg').textContent"))
    # move the last layer up
    rows=lambda: pg.evaluate("[...document.querySelectorAll('#layers [data-lid] input[data-lname]')].map(i=>i.value)")
    print('rows before',rows()); pg.locator('#layers [data-lid]').nth(2).locator('button[data-lact=up]').click(); pg.wait_for_timeout(200); print('after ▲ on row 3',rows())
    # hide the tree's layer: it should be a faint shadow, not pickable
    pg.evaluate("(function(){var v=__v().view;v.cx=-40;v.cz=-40;v.zoom=6;window.dispatchEvent(new Event('resize'))})()"); pg.wait_for_timeout(300)
    def px(wx,wz): return pg.evaluate("""([wx,wz])=>{var v=__v(),c=document.getElementById('cv'),x=((wx-v.view.cx)*v.view.zoom+v.W/2/v.dpr)*v.dpr,y=((wz-v.view.cz)*v.view.zoom+v.H/2/v.dpr)*v.dpr;var d=c.getContext('2d').getImageData(Math.round(x),Math.round(y),1,1).data;return [d[0],d[1],d[2]]}""",[wx,wz])
    bg=px(-30,-25); shown=px(-40,-40)
    tl=pg.evaluate("(function(){var S=__S(),o=S.objs.filter(o=>o.id===4)[0];return o.layer||S.layers[0].id})()")
    pg.evaluate("id=>{var S=__S();S.layers.forEach(l=>{if(l.id===id)l.vis=false});document.querySelector('#layers button[data-lact=vis]').click();document.querySelector('#layers button[data-lact=vis]').click()}",tl); pg.wait_for_timeout(300)
    ghost=px(-40,-40)
    print('tree pixel: background',bg,'| shown',shown,'| hidden layer (shadow)',ghost,'| layers',L())
    print('errors',errs); b.close()
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1200,'height':760}); pg.route('**/fonts.*/**',lambda r:r.abort())
    pg.goto('file:///tmp/polyrun-work/pe_layers.html'); pg.wait_for_timeout(1200)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(300)
    pg.keyboard.press('Control+a'); pg.click('button[data-gact=split]'); pg.wait_for_timeout(200)
    pg.locator('#layers [data-lid]').nth(1).locator('button[data-lact=vis]').click(); pg.wait_for_timeout(200)
    pg.evaluate("(function(){var v=__v().view;v.cx=20;v.cz=-45;v.zoom=5;window.dispatchEvent(new Event('resize'))})()"); pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
    pg.screenshot(path='/tmp/polyrun-work/layers.png'); b.close()
