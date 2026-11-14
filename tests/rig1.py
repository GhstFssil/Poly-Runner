import sys,json
from playwright.sync_api import sync_playwright
out='/tmp/polyrun-work/'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':1280,'height':900})
    pg.route('**/three.min.js', lambda r: r.fulfill(path=out+'t/node_modules/three/build/three.min.js', content_type='application/javascript'))
    for n,f in [('GLTFLoader.js','loaders/GLTFLoader.js'),('OrbitControls.js','controls/OrbitControls.js'),('GLTFExporter.js','exporters/GLTFExporter.js')]:
        pg.route('**/'+n, (lambda path: (lambda route, request=None: route.fulfill(path=path, content_type='application/javascript')))(out+'t/node_modules/three/examples/js/'+f))
    pg.route('**/fonts.*/**', lambda r: r.abort())
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append('C:'+m.text[:200]) if m.type=='error' else None)
    pg.goto('file://'+out+'t/live.html'); pg.wait_for_timeout(6000)
    pg.click('#bDevT'); pg.click('#dtRig'); pg.wait_for_timeout(2500)
    R="document.getElementById('rigHost').shadowRoot"
    pg.evaluate(R+".querySelector('#statBox').open=true"); pg.wait_for_timeout(200)
    pg.evaluate(R+".querySelector('#moveBox').open=true"); pg.wait_for_timeout(400)
    print('move html len', pg.evaluate(R+".querySelector('#moveLive').innerHTML.length"), pg.evaluate(R+".querySelector('#moveOut').innerHTML.length"), pg.evaluate(R+".querySelectorAll('#moveScen .row').length"))
    # full-height screenshot of the aside: temporarily let it grow
    pg.evaluate(R+".querySelector('aside').scrollTop=0")
    h=pg.evaluate(R+".querySelector('aside').scrollHeight"); print('aside scrollHeight',h)
    pg.set_viewport_size({'width':1280,'height':min(h+40,9000)}); pg.wait_for_timeout(600)
    el=pg.evaluate_handle(R+".querySelector('aside')")
    el.as_element().screenshot(path='/home/claude/poly-runner/tests/shots/rig_move.png')
    print(pg.evaluate(R+".querySelector('#moveLive').innerText")[:6000])
    print('----'); print(pg.evaluate(R+".querySelector('#moveOut').innerText"))
    print('errors',errs); b.close()
