# Stamps on a hidden layer are drawn as faint shadows: no stroke may be drawn above that faint alpha.
import json
from playwright.sync_api import sync_playwright
objs=[{"type":"crag","id":1,"x":0,"z":-60,"layer":2},{"type":"spawner","id":2,"x":40,"z":-60,"layer":2},{"type":"tip","id":3,"x":-40,"z":-60,"layer":2},
      {"type":"ledge","id":4,"x":0,"z":-100,"layer":2,"length":40},{"type":"platform","id":5,"x":30,"z":-120,"layer":2,"length":40,"move":"side","dist":20}]
lay={"version":2,"width":9,"pieces":[{"len":200}],"layers":[{"id":1,"name":"A"},{"id":2,"name":"B","visible":False}],"objects":objs}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900}); pg.route('**/fonts.*/**',lambda r:r.abort())
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    pg.goto('file:///home/claude/poly-runner/path-editor.html'); pg.wait_for_timeout(800)
    pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(lay)); pg.wait_for_timeout(400)
    def run(l):
      pg.evaluate("j=>{document.getElementById('json').value=j;document.getElementById('load').click()}",json.dumps(l)); pg.wait_for_timeout(300)
      return pg.evaluate("""()=>{var P=CanvasRenderingContext2D.prototype,os=P.stroke,of=P.fill,log=[];
      P.stroke=function(){log.push(this.globalAlpha);return os.apply(this,arguments)};P.fill=function(){log.push(this.globalAlpha);return of.apply(this,arguments)};
      window.dispatchEvent(new Event('resize'));
      var cv=document.querySelector('canvas');cv.dispatchEvent(new MouseEvent('mousemove',{clientX:5,clientY:5}));
      P.stroke=os;P.fill=of;return log}""")
    base=dict(lay,objects=[])
    a=run(lay); e=run(base)
    strong=lambda L:sum(1 for x in L if x>0.17)
    print('strong draws with ghosts',strong(a),'without',strong(e),'total',len(a),len(e))
    extra=strong(a)-strong(e)
    print('BAD' if extra>0 else 'OK', errs)
