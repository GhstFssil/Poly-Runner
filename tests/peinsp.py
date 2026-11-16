# inspector smoke test on three randomly picked stamp kinds (pass a seed, or one is printed):
# labels of at most two words, boxes in their fixed grid slots (same place in the next-stamp panel and the placed one), no overflow, typed values still land on the stamp
import json,random,sys
from playwright.sync_api import sync_playwright
seed=int(sys.argv[1]) if len(sys.argv)>1 else random.randrange(10**6); random.seed(seed); print('seed',seed)
SLOT={'noat':(1,1),'after':(1,1),'layer':(1,2),'X':(2,1),'s':(2,1),'Z':(2,2),'u':(2,2),'rot':(3,1),'th':(3,1),'turn':(3,1),'ya':(3,2),'len':(4,1),'d':(4,1),'r':(4,1),'w':(4,2),'hgt':(5,1),'h':(5,1),'bend':(5,2)}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900}); pg.route('**/fonts.*/**', lambda r: r.abort()); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1500)
    base={"version":2,"width":9,"pieces":[{"len":400}],"objects":[]}
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(base)); pg.wait_for_timeout(200)
    tools=[t for t in pg.evaluate("[...document.querySelectorAll('#tools [data-tool]')].map(e=>e.dataset.tool)") if t not in ('select','erase','preset','forest','crag')]
    picks=random.sample(tools,3); print('kinds',picks); cv=pg.locator('#cv').bounding_box(); bad=[]
    INFO="[...document.querySelectorAll('#insp .fields label.f')].map(l=>{var c=l.querySelector('[data-ok]');return {k:c&&c.dataset.ok,txt:l.firstChild.nodeValue,row:l.style.gridRow,col:l.style.gridColumn}})"
    for n,t in enumerate(picks):
        pg.evaluate("t=>document.querySelector('#tools [data-tool=\"'+t+'\"]').click()",t); pg.wait_for_timeout(80)
        nxt=pg.evaluate(INFO)
        pg.mouse.click(cv['x']+cv['width']*0.35+n*70, cv['y']+cv['height']*0.5); pg.wait_for_timeout(100)
        pg.evaluate("document.querySelector('#tools [data-tool=\"select\"]').click()"); pg.wait_for_timeout(80)
        pl=pg.evaluate(INFO)
        for name,L in (('next',nxt),('placed',pl)):
            for f in L:
                if len((f['txt'] or '').split())>2: bad.append((t,name,'label over two words',f['txt']))
                if not f['row'] or not f['col']: bad.append((t,name,'no slot',f['k']))
                if f['k'] in SLOT and (int(f['row']),int(f['col'].split()[0]))!=SLOT[f['k']]: bad.append((t,name,'wrong slot',f['k'],f['row'],f['col']))
        pos={f['k']:(f['row'],f['col']) for f in nxt}
        for f in pl:
            if f['k'] in pos and pos[f['k']]!=(f['row'],f['col']): bad.append((t,'differs between next and placed',f['k'],pos[f['k']],(f['row'],f['col'])))
        ov=pg.evaluate("(()=>{var e=document.getElementById('insp');return e.scrollWidth>e.clientWidth+1})()")
        if ov: bad.append((t,'panel overflows sideways'))
        print(t,'next:',[(f['txt'],f['row']+','+f['col']) for f in nxt][:8]); print('   placed:',[(f['txt'],f['row']+','+f['col']) for f in pl][:10])
        if n==0: pg.locator('#insp').screenshot(path='/tmp/insp-'+t+'.png')
    # a typed value still lands on a stamp
    pg.evaluate("t=>document.querySelector('#tools [data-tool=\"'+t+'\"]').click()",'ledge'); pg.wait_for_timeout(60)
    el=pg.locator('#insp [data-ok="hgt"]').first; el.fill('17'); el.press('Tab'); pg.mouse.click(cv['x']+cv['width']*0.7, cv['y']+cv['height']*0.3); pg.wait_for_timeout(80)
    o=pg.evaluate("(()=>{var a=JSON.parse(document.getElementById('json').value).objects;return a[a.length-1]})()")
    if o.get('height')!=17: bad.append(('typed value lost',o))
    print('PROBLEMS:',bad or 'none','errors',errs[:2])
