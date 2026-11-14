import json,sys,math
from playwright.sync_api import sync_playwright
VALS=['0','-50','1000000','','abc','0.0001','720','-720','1e-9','-0']
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1400,'height':900})
    pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('console', lambda m: errs.append('console:'+m.text[:200]) if m.type=='error' else None)
    pg.on('dialog', lambda d: d.accept())
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1500)
    base={"version":2,"width":9,"pieces":[{"len":60},{"len":80,"ang":45,"r":101.86},{"len":40,"dy":10,"roll":20},{"len":50,"w":14}],"objects":[{"type":"start","id":1,"s":10,"u":0},{"type":"minion","id":2,"s":70,"u":2}]}
    def load():
        pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(150)
    load()
    pg.screenshot(path='shots/pe_base.png')
    keys=pg.evaluate("[...new Set([...document.querySelectorAll('#pieces [data-k]')].map(e=>e.dataset.k+'|'+e.tagName))]")
    print('fields',keys)
    bad=[]
    nseg=pg.evaluate("Math.max(...[...document.querySelectorAll('#pieces [data-k]')].map(e=>+e.dataset.i))+1")
    for i in range(nseg):
        for kt in keys:
            k,tag=kt.split('|')
            vals=VALS if tag=='INPUT' else pg.evaluate("([i,k])=>{var e=document.querySelector('#pieces [data-i=\"'+i+'\"][data-k=\"'+k+'\"]');return e?[...e.options].map(o=>o.value):[]}",[i,k])
            for v in vals:
                print('try',i,k,v,flush=True)
                load(); n0=len(errs)
                ok=pg.evaluate("([i,k,v])=>{var e=document.querySelector('#pieces [data-i=\"'+i+'\"][data-k=\"'+k+'\"]');if(!e)return 'missing';e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'}",[i,k,v])
                if ok!='ok': continue
                pg.wait_for_timeout(30)
                st=pg.evaluate("""()=>{var out=[];document.querySelectorAll('#pieces input[data-k]').forEach(e=>{if(/NaN|undefined|Infinity|null/.test(e.value)||(e.value===''))out.push(e.dataset.i+'.'+e.dataset.k+'='+e.value)});
                  document.getElementById('copy')&&0; var j=document.getElementById('json').value; var bj=''; try{var o=JSON.parse(j); (function w(x,pth){if(x&&typeof x==='object')for(var q in x)w(x[q],pth+'.'+q);else if(x===null||(typeof x==='number'&&!isFinite(x)))bj+=pth+'='+x+' ';})(o,'');}catch(e){bj='JSON ERR '+e.message}
                  return [out.join(','),bj,document.getElementById('stats').textContent.slice(0,80)]}""")
                if st[0] or st[1] or len(errs)>n0 or 'NaN' in st[2]: bad.append((i,k,v,st,errs[n0:]))
    for x in bad[:60]: print('BAD',x)
    print('total bad',len(bad),'errs',len(errs))
    b.close()
