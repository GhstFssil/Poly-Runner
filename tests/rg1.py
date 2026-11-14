# Molly in a level after "Save to game": close-ups from a camera that follows her
from righ import *
from PIL import Image
import io,sys,os
from rv import sheet
def run(html, save=True):
    g=Rig(w=640,h=440,html=html,draw=True); pg=g.pg; pg.set_default_timeout(120000)
    if save:
        g.open(); g.click('#exportGlb',4000); st=g.status(); g.click('#rigClose',500)
    else: st='(built-in model)'
    pg.evaluate("['bTitle','bLevels','bLevel1'].forEach(function(i){var e=document.getElementById(i);if(e)e.click()})"); pg.wait_for_timeout(6000)
    d=pg.evaluate("window.__dbg()"); m=json.loads(pg.evaluate("JSON.stringify(__molly())"))
    print(html,'| save:',st,'| level',d['level'],'playing',d['playing'],'| molly on',m['on'],'verts',m['verts'],'nan',m['nan'],'clips',len(m['clips']))
    pg.evaluate("""()=>{Array.prototype.forEach.call(document.querySelectorAll('#stage > *:not(canvas)'),function(e){e.style.visibility='hidden'});
      window.__noRender=true;window.__fv=[4.6,1.5,2.2];(function f(){var s=__state(),h=s.heading,fx=-Math.sin(h),fz=-Math.cos(h),v=window.__fv;window.__camOv={p:[s.x-fx*v[0]+fz*v[2],s.y+v[1],s.z-fz*v[0]-fx*v[2]],l:[s.x,s.y+1.7,s.z],fov:30};requestAnimationFrame(f);})();}""")
    shots=[]
    def snap(label):
        pg.wait_for_timeout(200); im=Image.open(io.BytesIO(pg.screenshot())).convert('RGB'); w,h=im.size; s=min(w,h); shots.append((label,im.crop(((w-s)//2,0,(w-s)//2+s,s))))
    snap('standing')
    pg.keyboard.down('KeyW'); pg.wait_for_timeout(2500); snap('running, behind-right')
    pg.evaluate("window.__fv=[4.2,1.3,-2.4]"); pg.wait_for_timeout(1500); snap('running, behind-left')
    pg.evaluate("window.__fv=[4.8,0.4,0.3]"); pg.wait_for_timeout(1500); snap('running, behind low')
    pg.keyboard.press('Space'); pg.wait_for_timeout(350); snap('jump')
    pg.wait_for_timeout(1500); pg.evaluate("window.__fv=[-4.5,1.4,2]"); pg.wait_for_timeout(1200); snap('running, from the front')
    pg.keyboard.up('KeyW')
    print('  errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'normalized normal' not in e][:4]); g.close(); return shots
a=run('aud_old.html'); b=run('aud.html')
items=[('BEFORE '+l,im) for l,im in a]+[('AFTER '+l,im) for l,im in b]
print(sheet(items,len(a),int(1536/len(a)),'/home/claude/poly-runner/tests/shots/ingame_ba.png'))
