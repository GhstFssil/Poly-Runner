from righ import *
g=Rig(draw=False); g.open()
def save(label):
    g.click('#exportGlb', 4000)
    m=json.loads(g.ev("JSON.stringify(__molly())"))
    print(label,'| status:',g.status(),'| verts',m['verts'],'stored chars',m['stored'],'on',m['on'],'nan',m['nan'],'bb',m['bb'])
print('quota probe:', g.ev("""()=>{var n=0,s='x'.repeat(262144);try{for(var i=0;i<200;i++){localStorage.setItem('__q'+i,s);n++;}}catch(e){}for(var i=0;i<n;i++)localStorage.removeItem('__q'+i);return n*262144}"""))
for c in [(8,2),(20,4),(32,4),(40,8)]:
    g.ev("([a,b])=>{var d=document.getElementById('rigHost').__rigdbg();d.setP('sides',a);d.setP('rings',b)}",list(c)); g.pg.wait_for_timeout(1500)
    save('sides %d rings %d'%c)
# worst case: a broken build saved to the game
g.ev("()=>{var d=document.getElementById('rigHost').__rigdbg();d.setP('sides',8);d.setP('rings',2);d.setP('Foot.len',0)}"); g.pg.wait_for_timeout(800)
save('Foot.len 0')
g.ev("()=>{var d=document.getElementById('rigHost').__rigdbg();d.setP('Foot.len',27);d.setP('scale',0)}"); g.pg.wait_for_timeout(800)
save('scale 0')
g.ev("()=>{var d=document.getElementById('rigHost').__rigdbg();d.setP('scale',1);d.setP('runM.dur',0)}"); g.pg.wait_for_timeout(800)
save('runM.dur 0')
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'normalized normal' not in e][:8]); g.close()
