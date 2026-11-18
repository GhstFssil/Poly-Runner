# Segment fields: angle and radius change each other but never the length; new pieces supersede the terrain; fields start collapsed and open on a click of the title.
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
    pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1500)
    base={"version":2,"width":9,"pieces":[{"len":200},{"len":100,"ang":30,"r":190.9859}],"objects":[]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(200)
    pcs=lambda: json.loads(pg.evaluate("document.getElementById('json').value"))['pieces']
    ok=True
    def chk(name,cond):
        global ok; ok = ok and cond; print(name,'ok' if cond else 'FAIL')
    chk('fields start collapsed', pg.evaluate("document.querySelectorAll('#pieces .piece:not(.shut)').length")==0)
    pg.evaluate("document.querySelector('#pieces [data-tg=\"1\"]').click()")
    chk('click opens the piece', pg.evaluate("document.querySelectorAll('#pieces .piece:not(.shut)').length")==1)
    def setf(k,v):
        pg.evaluate("([k,v])=>{var e=document.querySelector('#pieces input[data-i=\"1\"][data-k=\"'+k+'\"]');e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))}",[k,str(v)]); pg.wait_for_timeout(100)
    setf('ang',60); q=pcs()[1]
    chk('angle edit keeps length', abs(q['len']-100)<0.01 and abs(q['ang']-60)<1e-6 and abs(q['r']-100/(60*3.14159265/180))<0.05)
    setf('r',100); q=pcs()[1]
    chk('radius edit keeps length', abs(q['len']-100)<0.01 and abs(q['ang']-(100/100*180/3.14159265))<0.05)
    chk('piece stayed open after edits', pg.evaluate("document.querySelectorAll('#pieces .piece:not(.shut)').length")==1)
    pg.evaluate("document.querySelector('#pieces [data-act=addSeg]').click()"); pg.wait_for_timeout(100)
    chk('new piece supersedes terrain', pcs()[-1].get('ov')==1)
    chk('no errors', not errs)
    print('PASS' if ok else 'FAIL', errs); raise SystemExit(0 if ok else 1)
