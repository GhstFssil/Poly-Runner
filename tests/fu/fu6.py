# follow-up 6: the saved model lives in IndexedDB
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
D="document.getElementById('rigHost').__rigdbg()"
def info(g):
    m=g.ev("__molly()"); ph=g.ev("__phys()")
    return {'on':m['on'],'verts':m['verts'],'height':round(m['bb'][1]-m['bb'][0],3) if m['bb'] else None,'scale':ph['mollyScale'],'idbBytes':m['stored'],'lsChars':m['storedLS']}
IDB="""()=>new Promise(function(res){var r=indexedDB.open('polyrun',1);r.onupgradeneeded=function(){r.result.createObjectStore('kv')};r.onsuccess=function(){try{var q=r.result.transaction('kv','readonly').objectStore('kv').get('mollyGlb');q.onsuccess=function(){res(q.result?q.result.byteLength:0)};q.onerror=function(){res(-1)}}catch(e){res(-2)}};r.onerror=function(){res(-3)}})"""
def errs(g): return [e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'normalized normal' not in e][:4]
# 1 fresh browser
g=Rig(draw=False); print('1 fresh:',info(g),'in the database:',g.ev(IDB))
g.open(); g.typed('scale',1.1,900); g.click('#exportGlb',4500); print('  save:',g.status(),'|',info(g),'| database bytes',g.ev(IDB))
g.pg.reload(); g.pg.wait_for_timeout(6500); print('  after a reload:',info(g))
# 3 a big build
g.open(); g.typed('sides',48); g.typed('rings',8,2500); g.click('#exportGlb',14000); print('3 big build:',g.status(),'|',info(g),'| database bytes',g.ev(IDB))
g.pg.reload(); g.pg.wait_for_timeout(9000); print('  after a reload:',info(g)); print('  errors',errs(g))
# capture a small saved model as base64 for the migration test (as an old build would have stored it)
g.open(); g.click('#resetAll',1200); g.typed('scale',0.9,900)
g.ev("window.__cap=null;(function(){var h=document.getElementById('rigHost'),s=h.__save;h.__save=function(b,j,d){window.__cap=b;return s(b,j,d)}})()")
g.click('#exportGlb',4500)
b64=g.ev("(function(){var u=new Uint8Array(window.__cap),t='';for(var i=0;i<u.length;i+=0x8000)t+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(t)})()")
g.close()
# 2 migration from localStorage
g=Rig(draw=False, storage={'mollyGlb':b64}); g.pg.wait_for_timeout(1500)
print('2 old text copy in localStorage (%d chars): first load'%len(b64),info(g),'| database bytes',g.ev(IDB))
g.pg.reload(); g.pg.wait_for_timeout(6500); print('  after a reload:',info(g),'| errors',errs(g)); g.close()
# 4 no IndexedDB at all
class NoIdb(Rig):
    pass
import righ
g=Rig.__new__(Rig)
from playwright.sync_api import sync_playwright
def mk(extra):
    r=Rig.__new__(Rig)
    r.pw=sync_playwright().start(); r.b=r.pw.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader']); r.ctx=r.b.new_context(viewport={'width':1280,'height':900}); r.pg=r.ctx.new_page(); pg=r.pg
    pg.add_init_script("['WebGLRenderingContext','WebGL2RenderingContext'].forEach(function(n){var P=window[n]&&window[n].prototype;if(P){P.drawElements=function(){};P.drawArrays=function(){};}})")
    pg.add_init_script(extra)
    pg.route('**/three.min.js', lambda rt: rt.fulfill(path=OUT+'t/node_modules/three/build/three.min.js', content_type='application/javascript'))
    for n,fl in [('GLTFLoader.js','loaders/GLTFLoader.js'),('OrbitControls.js','controls/OrbitControls.js'),('GLTFExporter.js','exporters/GLTFExporter.js')]:
        pg.route('**/'+n, (lambda path: (lambda route, request=None: route.fulfill(path=path, content_type='application/javascript')))(OUT+'t/node_modules/three/examples/js/'+fl))
    pg.route('**/fonts.*/**', lambda rt: rt.abort())
    r.errs=[]; pg.on('pageerror', lambda e: r.errs.append(str(e)[:300])); pg.on('console', lambda m: r.errs.append('C:'+m.text[:200]) if m.type in('error','warning') else None)
    r.html='aud.html'; pg.goto('file://'+OUT+'t/aud.html'); pg.wait_for_timeout(6000); return r
g=mk("Object.defineProperty(window,'indexedDB',{get:function(){return undefined}})")
print('4 no IndexedDB: fresh',info(g))
g.open(); g.typed('scale',1.2,900); g.click('#exportGlb',4500); print('  save:',g.status(),'|',info(g))
g.pg.reload(); g.pg.wait_for_timeout(6500); print('  after a reload:',info(g),'| errors',errs(g)); g.close()
g=mk("(function(){var o=window.indexedDB;Object.defineProperty(window,'indexedDB',{get:function(){return {open:function(){return {}}}}})})()")
print('5 an IndexedDB that never answers: fresh',info(g)); g.pg.wait_for_timeout(1500); print('  1.5 s later',info(g)); g.close()
