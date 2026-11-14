# common harness for the audit: open the test copy, load a level into the sandbox and play it
import json,sys,math
from playwright.sync_api import sync_playwright
OUT='/tmp/polyrun-work/'
class Game:
    def __init__(self, html='aud.html', w=320, h=200, draw=False):
        self.pw=sync_playwright().start()
        self.b=self.pw.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        self.pg=self.b.new_page(viewport={'width':w,'height':h})
        pg=self.pg
        if not draw: pg.add_init_script("['WebGLRenderingContext','WebGL2RenderingContext'].forEach(function(n){var P=window[n]&&window[n].prototype;if(P){P.drawElements=function(){};P.drawArrays=function(){};}})")
        pg.route('**/three.min.js', lambda r: r.fulfill(path=OUT+'t/node_modules/three/build/three.min.js', content_type='application/javascript'))
        for n,fl in [('GLTFLoader.js','loaders/GLTFLoader.js'),('OrbitControls.js','controls/OrbitControls.js'),('GLTFExporter.js','exporters/GLTFExporter.js')]:
            pg.route('**/'+n, (lambda path: (lambda route, request=None: route.fulfill(path=path, content_type='application/javascript')))(OUT+'t/node_modules/three/examples/js/'+fl))
        pg.route('**/fonts.*/**', lambda r: r.abort())
        self.errs=[]; pg.on('pageerror', lambda e: self.errs.append(str(e)[:400]))
        pg.goto('file://'+OUT+'t/'+html); pg.wait_for_timeout(7000)
        pg.click('#bDevT'); pg.click('#dtPath'); pg.wait_for_timeout(1500)
    def load(self, j, wait=4000):
        if not isinstance(j,str): j=json.dumps(j)
        self.pg.evaluate("j=>document.getElementById('peHost').__pe.load(j)", j); self.pg.wait_for_timeout(300)
        self.pg.evaluate("document.getElementById('peHost').shadowRoot.getElementById('pePlay').click()"); self.pg.wait_for_timeout(wait)
    def ev(self, js, arg=None):
        return self.pg.evaluate(js, arg) if arg is not None else self.pg.evaluate(js)
    def close(self):
        self.b.close(); self.pw.stop()
