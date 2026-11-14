import json,sys
from playwright.sync_api import sync_playwright
VALS=['0','-50','1000000','','abc','0.0001']
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1400,'height':900})
    pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:260]))
    pg.on('dialog', lambda d: d.accept())
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1500)
    base={"version":2,"width":9,"pieces":[{"len":200},{"len":80,"ang":45,"r":101.86},{"len":100}],"objects":[{"type":"start","id":1,"s":10,"u":0}]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(200)
    tools=pg.evaluate("[...document.querySelectorAll('#tools [data-tool]')].map(e=>e.dataset.tool)")
    print('tools',tools)
    cv=pg.locator('#cv').bounding_box()
    bad=[]; n=0
    for t in tools:
        if t in ('select','pan','move'): continue
        e0=len(errs)
        pg.evaluate("t=>document.querySelector('#tools [data-tool=\"'+t+'\"]').click()",t)
        x=cv['x']+cv['width']*0.5+ (n%5)*14-28; y=cv['y']+cv['height']*0.5+(n//5)*14-28; n+=1
        pg.mouse.click(x,y); pg.wait_for_timeout(80)
        cnt=pg.evaluate("JSON.parse(document.getElementById('json').value).objects.length")
        if len(errs)>e0: bad.append(('stamp',t,errs[e0:]))
        # fuzz inspector fields of the selected object
        ks=pg.evaluate("[...document.querySelectorAll('#insp [data-ok]')].map(e=>e.dataset.ok+'|'+e.tagName+'|'+e.type)")
        for kt in ks:
            k,tag,ty=kt.split('|')
            vals=VALS if (tag=='INPUT' and ty=='number') else (pg.evaluate("k=>{var e=document.querySelector('#insp [data-ok=\"'+k+'\"]');return e&&e.options?[...e.options].map(o=>o.value):[]}",k) if tag=='SELECT' else [])
            for v in vals:
                e1=len(errs)
                r=pg.evaluate("([k,v])=>{var e=document.querySelector('#insp [data-ok=\"'+k+'\"]');if(!e)return 'missing';e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'}",[k,v])
                pg.wait_for_timeout(15)
                st=pg.evaluate("""()=>{var bj='';try{var o=JSON.parse(document.getElementById('json').value);(function w(x,pth){if(x&&typeof x==='object')for(var q in x)w(x[q],pth+'.'+q);else if(x===null||(typeof x==='number'&&!isFinite(x)))bj+=pth+'='+x+' ';})(o,'');}catch(e){bj='JSON ERR '+e.message}
                  var iv=[...document.querySelectorAll('#insp input[type=number]')].filter(e=>/NaN|undefined|Infinity/.test(e.value)).map(e=>e.dataset.ok+'='+e.value).join(',');return [bj,iv]}""")
                if st[0] or st[1] or len(errs)>e1: bad.append((t,k,v,st,errs[e1:]))
        print(t,'objs',cnt,'fields',len(ks),flush=True)
    # round trip
    j1=pg.evaluate("document.getElementById('json').value")
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",j1); pg.wait_for_timeout(300)
    j2=pg.evaluate("document.getElementById('json').value")
    a=json.loads(j1); c=json.loads(j2)
    print('round trip equal:',a==c)
    if a!=c:
        for o1,o2 in zip(a.get('objects',[]),c.get('objects',[])):
            if o1!=o2: print(' DIFF',json.dumps(o1)[:200],'=>',json.dumps(o2)[:200])
        for kk in a:
            if kk!='objects' and a[kk]!=c.get(kk): print(' DIFF key',kk,str(a[kk])[:150],'=>',str(c.get(kk))[:150])
    pg.screenshot(path='shots/pe_objs.png')
    for x in bad[:50]: print('BAD',str(x)[:330])
    print('bad',len(bad),'errs',len(errs)); b.close()
