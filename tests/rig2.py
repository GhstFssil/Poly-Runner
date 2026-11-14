import sys,json,re
from playwright.sync_api import sync_playwright
out='/tmp/polyrun-work/'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1280,'height':900}, color_scheme='dark')
    pg.route('**/three.min.js', lambda r: r.fulfill(path=out+'t/node_modules/three/build/three.min.js', content_type='application/javascript'))
    for n,f in [('GLTFLoader.js','loaders/GLTFLoader.js'),('OrbitControls.js','controls/OrbitControls.js'),('GLTFExporter.js','exporters/GLTFExporter.js')]:
        pg.route('**/'+n, (lambda path: (lambda route, request=None: route.fulfill(path=path, content_type='application/javascript')))(out+'t/node_modules/three/examples/js/'+f))
    pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('file://'+out+'t/live.html'); pg.wait_for_timeout(6000)
    pg.click('#bDevT'); pg.click('#dtRig'); pg.wait_for_timeout(2500)
    R="document.getElementById('rigHost').shadowRoot"
    pg.evaluate(R+".querySelector('#statBox').open=true"); pg.evaluate(R+".querySelector('#moveBox').open=true"); pg.wait_for_timeout(400)
    def scen(slope,dr,sp,mode):
        pg.evaluate("([a,b,c,m])=>{var R=document.getElementById('rigHost').shadowRoot;[['ms_slope',a],['ms_dir',b],['ms_speed',c]].forEach(function(x){var e=R.querySelector('#'+x[0]);e.value=x[1];e.dispatchEvent(new Event('input',{bubbles:true}))});R.querySelector('#moveScen [data-ms=\"'+m+'\"]').click()}",[slope,dr,sp,mode])
        t=pg.evaluate(R+".querySelector('#moveOut').innerText")
        rows=[l for l in t.split('\n') if l.strip()]
        d={}
        for k in ['Its part along her heading','Its part across her heading','Her own part','Speed change','Speed after 1 s / 3 s','Heading after 1 s / 3 s','Turn radius, toward uphill','Ground covered on the map']:
            for i,l in enumerate(rows):
                if l.startswith(k): d[k]=l[len(k):].strip()+' | '+(rows[i+1] if i+1<len(rows) else ''); break
        return d
    for sc in [(30,0,80,'run'),(45,0,80,'run'),(45,0,100,'run'),(30,180,80,'run'),(45,180,80,'run'),(45,180,30,'run'),(45,180,10,'run'),(30,0,0,'coast'),(45,0,0,'coast'),(45,180,0,'coast'),(20,90,80,'coast'),(60,90,80,'run'),(30,90,40,'brake'),(0,90,80,'run'),(20,45,120,'run')]:
        d=scen(*sc); print(sc); [print('   ',k,'=>',v) for k,v in d.items()]
    # stat extremes
    def setstat(k,v):
        pg.evaluate("([k,v])=>{var R=document.getElementById('rigHost').shadowRoot;var e=R.querySelector('#s_'+k.replace(/\\./g,'_')).closest('.row').querySelector('input.num');e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))}",[k,v])
    bad=[]
    for k,vals in {'stat.top':[0,-5,1,1000],'stat.accelT':[0,-1,100],'stat.brake':[0,-2,50],'stat.jumpH':[0,-3,500],'stat.grip':[0,-10,1,1e6],'stat.fall':[0,-5],'stat.hearts':[0,-1,2.5,99],'stat.colH':[0,-1,50],'stat.colW':[0,-1,50],'stat.wallGrip':[0,-1,100],'stat.fric':[0,-5,1000]}.items():
        for v in vals:
            setstat(k,v)
            t=pg.evaluate(R+".querySelector('#moveLive').innerText+' '+"+R+".querySelector('#moveOut').innerText+' '+"+R+".querySelector('#statLive').innerText")
            if re.search(r'NaN|undefined|Infinity|null',t): bad.append((k,v,re.findall(r'.{30}(?:NaN|undefined|Infinity|null).{20}',t)[:3]))
        pg.evaluate(R+".querySelector('#resetStats').click()")
    print('bad stat displays',bad)
    pg.evaluate(R+".querySelector('aside').scrollTop=1500"); pg.wait_for_timeout(300)
    pg.screenshot(path='/home/claude/poly-runner/tests/shots/rig_dark.png')
    print('errors',errs); b.close()
