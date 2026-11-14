# harness for the Rig Editor: open it in the hooked test copy
import json,sys,re,time
from playwright.sync_api import sync_playwright
OUT='/tmp/polyrun-work/'
R="document.getElementById('rigHost').shadowRoot"
class Rig:
    def __init__(self, w=1280, h=900, html='aud.html', dark=False, draw=True, storage=None):
        self.pw=sync_playwright().start()
        self.b=self.pw.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        self.ctx=self.b.new_context(viewport={'width':w,'height':h}, color_scheme='dark' if dark else 'light')
        self.pg=self.ctx.new_page(); pg=self.pg
        if not draw: pg.add_init_script("['WebGLRenderingContext','WebGL2RenderingContext'].forEach(function(n){var P=window[n]&&window[n].prototype;if(P){P.drawElements=function(){};P.drawArrays=function(){};}})")
        if storage: pg.add_init_script("(function(){var s=%s;if(!sessionStorage.getItem('__seeded')){for(var k in s)localStorage.setItem(k,s[k]);sessionStorage.setItem('__seeded','1');}})()"%json.dumps(storage))
        pg.route('**/three.min.js', lambda r: r.fulfill(path=OUT+'t/node_modules/three/build/three.min.js', content_type='application/javascript'))
        for n,fl in [('GLTFLoader.js','loaders/GLTFLoader.js'),('OrbitControls.js','controls/OrbitControls.js'),('GLTFExporter.js','exporters/GLTFExporter.js')]:
            pg.route('**/'+n, (lambda path: (lambda route, request=None: route.fulfill(path=path, content_type='application/javascript')))(OUT+'t/node_modules/three/examples/js/'+fl))
        pg.route('**/fonts.*/**', lambda r: r.abort())
        self.errs=[]; pg.on('pageerror', lambda e: self.errs.append(str(e)[:300])); pg.on('console', lambda m: self.errs.append('C:'+m.text[:200]) if m.type in('error','warning') else None)
        self.html=html
        pg.goto('file://'+OUT+'t/'+html); pg.wait_for_timeout(6000)
    def open(self):
        self.pg.click('#bDevT'); self.pg.click('#dtRig'); self.pg.wait_for_timeout(2500)
    def ev(self, js, arg=None):
        return self.pg.evaluate(js, arg) if arg is not None else self.pg.evaluate(js)
    def q(self, sel): return R+".querySelector(%s)"%json.dumps(sel)
    def click(self, sel, wait=150):
        self.ev(self.q(sel)+".click()"); self.pg.wait_for_timeout(wait)
    def typed(self, key, v, wait=0):
        r=self.ev("([k,v])=>{var R=document.getElementById('rigHost').shadowRoot;var e=R.querySelector('#s_'+k.replace(/\\./g,'_'));if(!e)return 'norow';var n=e.closest('.row').querySelector('input.num');n.value=v;n.dispatchEvent(new Event('change',{bubbles:true}));return n.value+'|'+e.value}",[key,str(v)])
        if wait: self.pg.wait_for_timeout(wait)
        return r
    def slide(self, key, v, wait=0):
        r=self.ev("([k,v])=>{var R=document.getElementById('rigHost').shadowRoot;var e=R.querySelector('#s_'+k.replace(/\\./g,'_'));if(!e)return 'norow';e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));return e.value+'|'+e.closest('.row').querySelector('input.num').value}",[key,str(v)])
        if wait: self.pg.wait_for_timeout(wait)
        return r
    def P(self, key): return self.ev("k=>document.getElementById('rigHost').__rigdbg().P[k]", key)
    def mesh(self):
        return self.ev("""()=>{var d=document.getElementById('rigHost').__rigdbg(),m=d.sk;if(!m)return {none:1,dirty:d.isDirty()};var a=m.geometry.attributes.position.array,w=m.geometry.attributes.skinWeight.array,nan=0,wn=0,mx=0,i;for(i=0;i<a.length;i++){if(!isFinite(a[i]))nan++;else if(Math.abs(a[i])>mx)mx=Math.abs(a[i]);}for(i=0;i<w.length;i++)if(!isFinite(w[i]))wn++;return {tris:a.length/9,nan:nan,wnan:wn,max:+mx.toFixed(2),ms:Math.round(d.rebuildMs()),dirty:d.isDirty()}}""")
    def status(self): return self.ev(self.q('#status')+".textContent")
    def shot(self, name, sel=None):
        p='/home/claude/poly-runner/tests/shots/%s.png'%name
        if sel:
            self.ev("s=>document.getElementById('rigHost').shadowRoot.querySelector(s).scrollIntoView({block:'start'})", sel); self.pg.wait_for_timeout(300)
        self.pg.screenshot(path=p); return p
    def close(self):
        self.b.close(); self.pw.stop()
