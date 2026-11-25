# camera and controls: wheel zoom (clamped, saved), the speed pull-out, and Caps Lock Free Look (she does not steer by the camera; on release it swings back)
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
S=lambda: pg.evaluate("__state()")
def camd(): return pg.evaluate("(function(){var t=__T(),p=t.player.position;return t.camera.position.distanceTo(new t.THREE.Vector3(p.x,p.y+2.3,p.z))})()")
def caps(on):   # headless Chrome sends its own mousemoves that report Caps Lock off, so the test stands in for the key's real state
    pg.evaluate("(on)=>{window.__caps=on;if(!window.__capsHook){window.__capsHook=1;[KeyboardEvent,MouseEvent].forEach(function(C){var o=C.prototype.getModifierState;C.prototype.getModifierState=function(k){return k==='CapsLock'&&window.__caps!==undefined?window.__caps:o.call(this,k)}})}document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyX'}))}", on)
ok=True
def chk(name, c, extra=''):
    global ok; ok = ok and bool(c); print('PASS' if c else 'FAIL', name, extra)
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(4000)
s=S(); d0=camd(); chk('default zoom 8.5', abs(s['camZoom']-8.5)<0.01 and abs(d0-8.5)<0.2, (s['camZoom'],round(d0,2)))
for i in range(30): pg.mouse.wheel(0,100)
pg.wait_for_timeout(300); s=S(); chk('zoom out clamps at 20', abs(s['camZoom']-20)<0.01, s['camZoom'])
for i in range(40): pg.mouse.wheel(0,-100)
pg.wait_for_timeout(300); s=S(); chk('zoom in clamps at 4', abs(s['camZoom']-4)<0.01, s['camZoom'])
for i in range(8): pg.mouse.wheel(0,100)
pg.wait_for_timeout(300); z=S()['camZoom']; chk('saved', abs(float(pg.evaluate("localStorage.getItem('pr_camzoom')"))-z)<0.01, z)
pg.keyboard.down('KeyW'); pg.wait_for_timeout(5000); s=S(); chk('pulls out with speed', s['camPull']>1.03, (round(s['camPull'],3), round(s['speed']/2,1)))
caps(True); h0=S()['heading']; pg.evaluate("document.dispatchEvent(new MouseEvent('mousemove',{movementX:400,movementY:0,modifierCapsLock:true}))")
pg.wait_for_timeout(1000); s=S(); dyaw=abs((s['yaw']-s['heading']+3.14159)%6.28318-3.14159)
chk('free look: camera turned, she did not', s['freeLook'] and dyaw>0.5 and abs(s['heading']-h0)<0.05, (round(dyaw,2), round(s['heading']-h0,3)))
caps(False); pg.wait_for_timeout(50); s=S(); chk('release starts swing back', s['lookBack'] and not s['freeLook'])
pg.wait_for_timeout(1500); s=S(); dyaw=abs((s['yaw']-s['heading']+3.14159)%6.28318-3.14159); chk('camera back behind her', not s['lookBack'] and dyaw<0.03, round(dyaw,3))
pg.keyboard.up('KeyW')
errs=[e for e in g.errs if 'GL Driver' not in e and 'flatShading' not in e and 'ERR_FAILED' not in e]; chk('no errors', not errs, errs[:3])
print('ALL PASS' if ok else 'SOME FAILED'); g.close()
