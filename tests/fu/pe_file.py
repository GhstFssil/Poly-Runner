# Save to file / Open from file: standalone editor and the editor inside the game
import json,sys,os,tempfile
from playwright.sync_api import sync_playwright
J={"version":2,"width":9,"pieces":[{"len":300}],"objects":[{"type":"tree","id":1,"x":10,"z":-20},{"type":"gap","id":2,"x":30,"z":-40,"heading":0,"bend":0,"length":30,"width":15,"ends":"square"},{"type":"ledge","id":3,"x":-30,"z":-20,"heading":0,"bend":0,"length":30,"thickness":4,"height":5,"ends":"round"}]}
def objs(t): return [(o['type'],o.get('ends')) for o in json.loads(t)['objects']]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    # 1 standalone
    pg=b.new_context(accept_downloads=True).new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    pg.route('**/fonts.*/**',lambda r:r.abort()); pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(1200)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(J)); pg.wait_for_timeout(300)
    box=pg.evaluate("document.getElementById('json').value")
    with pg.expect_download() as d: pg.click('#saveFile')
    dl=d.value; path=os.path.join(tempfile.mkdtemp(),dl.suggested_filename); dl.save_as(path)
    print('1 saved file name:',dl.suggested_filename,'| same text as the box:',open(path).read()==box,'| msg:',pg.evaluate("document.getElementById('msg').textContent")[:60])
    pg.click('#reset'); pg.wait_for_timeout(200); print('  after Start over objects:',len(json.loads(pg.evaluate("document.getElementById('json').value"))['objects']))
    pg.set_input_files('#fileIn',path); pg.wait_for_timeout(500)
    print('  after opening the file:',objs(pg.evaluate("document.getElementById('json').value")),'| msg:',pg.evaluate("document.getElementById('msg').textContent"))
    bad=os.path.join(os.path.dirname(path),'notes.txt'); open(bad,'w').write('hello, not a layout')
    before=pg.evaluate("document.getElementById('json').value"); pg.set_input_files('#fileIn',bad); pg.wait_for_timeout(400)
    print('  a non-layout file: layout unchanged',pg.evaluate("document.getElementById('json').value")==before,'| msg:',pg.evaluate("document.getElementById('msg').textContent"))
    pg.keyboard.press('Control+z'); print('  errors',errs)
    # 2 inside the game
    ctx=b.new_context(accept_downloads=True); g=ctx.new_page(); e2=[]; g.on('pageerror',lambda e:e2.append(str(e)[:200]))
    g.route('**/three.min.js',lambda r:r.fulfill(path='/tmp/polyrun-work/t/node_modules/three/build/three.min.js',content_type='application/javascript'))
    for n,fl in [('GLTFLoader.js','loaders/GLTFLoader.js'),('OrbitControls.js','controls/OrbitControls.js'),('GLTFExporter.js','exporters/GLTFExporter.js')]:
        g.route('**/'+n,(lambda pth:(lambda route,request=None:route.fulfill(path=pth,content_type='application/javascript')))('/tmp/polyrun-work/t/node_modules/three/examples/js/'+fl))
    g.route('**/fonts.*/**',lambda r:r.abort()); g.goto('file:///tmp/polyrun-work/t/aud.html'); g.wait_for_timeout(5000)
    g.click('#bDevT'); g.click('#dtPath'); g.wait_for_timeout(2000)
    SR="document.getElementById('peHost').shadowRoot"
    g.evaluate("j=>{var s=%s;s.getElementById('json').value=j;s.getElementById('load').click()}"%SR,json.dumps(J)); g.wait_for_timeout(300)
    box=g.evaluate("%s.getElementById('json').value"%SR)
    with g.expect_download() as d2: g.evaluate("%s.getElementById('saveFile').click()"%SR)
    dl=d2.value; p2=os.path.join(tempfile.mkdtemp(),dl.suggested_filename); dl.save_as(p2)
    print('2 in the game: saved file matches the box:',open(p2).read()==box,dl.suggested_filename)
    g.evaluate("%s.getElementById('reset').click()"%SR); g.wait_for_timeout(200)
    g.evaluate("""()=>{var s=%s,f=s.getElementById('fileIn');window.__fi=f;}"""%SR)
    # set the file on the shadow input through a chooser
    with g.expect_file_chooser() as fc: g.evaluate("%s.getElementById('openFile').click()"%SR)
    fc.value.set_files(p2); g.wait_for_timeout(600)
    print('  after opening in the game:',objs(g.evaluate("%s.getElementById('json').value"%SR)),'| errors',e2[:2])
    b.close()
