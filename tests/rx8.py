from righ import *
D="document.getElementById('rigHost').__rigdbg()"
def errs(g): return [e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'normalized normal' not in e][:6]
g=Rig(draw=False); g.open()
emb=json.loads(g.ev("document.getElementById('molly-settings').textContent"))
P0=json.loads(g.ev("JSON.stringify("+D+".P)")); DEF=json.loads(g.ev("JSON.stringify("+D+".DEF)"))
print('A clean browser: P==DEF',P0==DEF,'| DEF differs from shipped settings in',len([k for k in emb if k in DEF and DEF[k]!=emb[k]]),'keys | P differs from shipped in',[(k,P0[k],emb[k]) for k in emb if k in P0 and P0[k]!=emb[k]][:6])
# B resets
g.ev(g.q('#statBox')+".open=true"); g.typed('stat.top',123); g.typed('runM.stride',55); g.typed('Thigh.dia',30)
g.click('#resetAll',500)
P1=json.loads(g.ev("JSON.stringify("+D+".P)"))
print('B Reset all: P==shipped defaults',P1==DEF,'| stat slider',g.ev(g.q('#s_stat_top')+".value"),'| runM.stride slider',g.ev(g.q('#s_runM_stride')+".value"),'(shipped',emb['runM.stride'],')')
# C typed extremes through the boxes
g.click('#chips [data-id="Foot"]',200)
r=[]
for k,v in [('Foot.len',0),('Foot.dia',0),('Foot.depth',0),('Foot.peak',0),('Foot.cS',-5),('Foot.tE',0)]:
    r.append((k,v,g.typed(k,v,250),g.P(k),g.mesh()['nan']))
print('C typed part values:',r); g.click('#resetPart',300)
r=[]
for k,v in [('sides',1e7),('rings',1e9),('scale',0),('sides',2.4)]:
    r.append((k,v,g.typed(k,v,900),g.P(k),g.mesh()))
print('  typed global values:',r)
g.typed('sides',8); g.typed('rings',2); g.typed('scale',1,400)
g.click('#modes [data-m="run"]',200); g.click('#play',100) if g.ev(g.q('#play')+".textContent")=='Play' else None
print('  runM.dur 0 ->',g.typed('runM.dur',0,500),g.P('runM.dur'),'phase finite',g.ev("isFinite("+D+".ui.phase)")); g.click('#resetAnim',200)
print('  hearts 500 ->',g.typed('stat.hearts',500),g.P('stat.hearts'),'| top -5 ->',g.typed('stat.top',-5),g.P('stat.top')); g.click('#resetStats',200)
# D key order
g.click('#modes2 [data-m="slide"]',300)
g.ev("document.getElementById('rigHost').shadowRoot.querySelectorAll('#animStages .chip')[2].click()"); g.pg.wait_for_timeout(300)
a=g.slide('m.slide.2.t',0.99); b=g.slide('m.slide.3.t',0.0)
print('D slide keys after dragging key2 up then hold key down:',[g.P('m.slide.%d.t'%i) for i in range(6)],'| preview phase follows key2:',g.ev(D+".ui.phase"))
print('  typed hold key 5% ->',g.typed('m.slide.3.t',5),[g.P('m.slide.%d.t'%i) for i in range(6)])
g.click('#resetAnim',300)
# E hold time reaches the game
g.typed('m.slide.3.t',50); g.click('#exportGlb',3500)
m=json.loads(g.ev("JSON.stringify(__molly())")); print('E status:',g.status(),'| game holds slide at',round(m['hold'][0]/m['durs'][5],3),'of the clip (editor says',g.P('m.slide.3.t'),') slide dur',m['durs'][5],'faceplant at',round(m['hold'][1]/m['durs'][6],3))
g.click('#resetAnim',300)
# F too big to keep
st0=m['stored']; g.typed('sides',48); g.typed('rings',8,1500); g.click('#exportGlb',9000)
m=json.loads(g.ev("JSON.stringify(__molly())")); print('F big build status:',g.status(),'| stored before',st0,'after',m['stored'],'| game verts',m['verts'],'on',m['on'])
g.typed('sides',8); g.typed('rings',2,800)
# G a broken build (forced past the holds) is turned away
g.ev("window.__cap=null;(function(){var h=document.getElementById('rigHost'),s=h.__save;h.__save=function(b,j,d){window.__cap=b;return s(b,j,d)}})()")
g.ev(D+".setP('Foot.len',0)"); g.pg.wait_for_timeout(600); g.click('#exportGlb',3500)
m=json.loads(g.ev("JSON.stringify(__molly())")); print('G broken build status:',g.status(),'| game molly on',m['on'],'nan',m['nan'],'bb finite',all(x is not None for x in m['bb']),'verts',m['verts'])
bad64=g.ev("(function(){var u=new Uint8Array(window.__cap),t='';for(var i=0;i<u.length;i+=0x8000)t+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(t)})()")
g.ev(D+".setP('Foot.len',27)"); g.pg.wait_for_timeout(400)
# H barrier mode
g.click('#modes2 [data-m="barrier"]',500); sel0=g.ev(D+".ui.sel")
box=g.ev("(function(){var r="+g.q('#stage canvas')+".getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
for fy in [0.3,0.45,0.6,0.75]: g.pg.mouse.click(box[0]+box[2]*0.5, box[1]+box[3]*fy); g.pg.wait_for_timeout(120)
g.typed('barrier.preview',60,300); a0=g.ev(D+".barrier.children[0].rotation.x"); g.pg.wait_for_timeout(300); a1=g.ev(D+".barrier.children[0].rotation.x")
g.click('#play',100); a2=g.ev(D+".barrier.children[0].rotation.x"); g.pg.wait_for_timeout(300); a3=g.ev(D+".barrier.children[0].rotation.x"); g.click('#play',100)
print('H barrier: selection',sel0,'->',g.ev(D+".ui.sel"),'| rolling while playing',a0!=a1,'| rolling while paused',a2!=a3,'| cycle slider disabled',g.ev(g.q('#phase')+".disabled"))
g.typed('barrier.radius',2.5,300); r1=g.ev(D+".barrier.children[0].children[0].geometry.parameters.radius"); g.click('#resetAnim',400); r2=g.ev(D+".barrier.children[0].children[0].geometry.parameters.radius")
print('  Reset this animation rebuilds the preview: radius',r1,'->',r2)
# J pasted settings
g.ev("(function(){var R=document.getElementById('rigHost').shadowRoot;R.querySelector('#json').value=JSON.stringify({'Shin.len':0,'sides':1e9,'m.jump.3.t':0.05,'m.jump.5.t':0.02,'cSuit':'banana','stat.grip':-4,'runF.dur':-2,'nonsense':5});R.querySelector('#applyJson').click()})()"); g.pg.wait_for_timeout(900)
print('J pasted bad settings:',g.status(),{k:g.P(k) for k in ['Shin.len','sides','cSuit','stat.grip','runF.dur']},'jump times',[g.P('m.jump.%d.t'%i) for i in range(8)],g.mesh())
g.click('#resetAll',500)
print('errs',errs(g)); g.close()
# K + L: a browser that already holds bad dials and a broken saved model
g=Rig(draw=False, storage={'runnerRig2':json.dumps({'Foot.len':0,'sides':1e7,'m.slide.3.t':0.05,'cSuit':'xyz','barrier.radius':0,'m.drift.rate':-9,'stat.hearts':500,'barrier.cBody':'nope'}),'mollyGlb':bad64})
m=json.loads(g.ev("JSON.stringify(__molly())")); print('L start with a broken saved model: molly on',m['on'],'verts',m['verts'],'nan',m['nan'],'bb finite',all(x is not None for x in m['bb']))
print('K game hearts',g.ev("document.getElementById('hearts').children.length"))
g.open(); print('  editor dials held:',{k:g.P(k) for k in ['Foot.len','sides','m.slide.3.t','cSuit','barrier.radius','m.drift.rate','stat.hearts','barrier.cBody']},g.mesh())
print('errs',errs(g)); g.close()
