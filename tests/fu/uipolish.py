# Menu checkerboard (every screen but the pause family), the underwater tint (camera below the surface) and the pointer-lock retry after a refused request.
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
g=Rig(w=640,h=400,draw=False); pg=g.pg
spl=lambda: pg.evaluate("document.getElementById('start').classList.contains('splash')")
ok=True
def chk(n,c):
    global ok; ok=ok and bool(c); print(n,'ok' if c else 'FAIL')
chk('main splash', spl())
pg.click('#bChars'); chk('characters splash', spl()); pg.click('#chBack')
pg.click('#bDevT'); chk('dev mode (title) splash', spl())
pg.click('#dtSaves'); chk('saves splash', spl()); pg.click('#svBack')
pg.click('#dtBlank'); pg.wait_for_timeout(2000)
pg.evaluate("j=>__sbStart(j)",{'width':9,'pieces':[{'t':'straight','len':300}],'terrain':'ocean'}); pg.wait_for_timeout(1500)
# pointer lock: headless Chrome grants it, so fake a refused lock (no lock element); a click must ask again
pg.evaluate("Object.defineProperty(document,'pointerLockElement',{get:function(){return null},configurable:true}); window.__lk=0; var c=document.getElementById('view'); c.requestPointerLock=function(){window.__lk++;return Promise.reject(new Error('no'))}; 0")
pg.mouse.click(300,200); pg.wait_for_timeout(200)
chk('click while playing without the lock asks again', pg.evaluate("window.__lk")>=1)
# underwater: the ocean's surface is B.waterY; put her and the camera well under it
sky=pg.evaluate("document.getElementById('uw').classList.contains('on')")
chk('not tinted above water', not sky)
pg.evaluate("__pos(60000,-40,300)"); pg.wait_for_timeout(600)
chk('tinted under water', pg.evaluate("document.getElementById('uw').classList.contains('on')"))
pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
chk('pause screen is not splash', not spl())
errs=[x for x in g.errs if 'flatShading' not in x and 'ERR_FAILED' not in x and 'GL Driver' not in x]; print('errors',errs[:3]); chk('no errors', not errs)
g.close(); print('OK' if ok else 'FAIL'); sys.exit(0 if ok else 1)
