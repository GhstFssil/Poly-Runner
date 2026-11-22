from righ import *
g=Rig(draw=False); g.open()
D="document.getElementById('rigHost').__rigdbg()"
emb=json.loads(g.ev("document.getElementById('molly-settings').textContent"))
# (a) Reset All vs the embedded settings
P0=json.loads(g.ev("JSON.stringify("+D+".P)")); DEF=json.loads(g.ev("JSON.stringify("+D+".DEF)"))
d1=[(k,DEF[k],emb[k]) for k in DEF if k in emb and DEF[k]!=emb[k]]
print('(a) keys where Reset All (DEF) differs from the shipped Molly settings:',len(d1), d1[:25])
print('    keys in DEF missing from embedded:',[k for k in DEF if k not in emb][:40])
print('    P at first open differs from embedded:',[(k,P0[k],emb.get(k)) for k in P0 if k in emb and P0[k]!=emb[k]][:10])
# (b) stale after Reset All
g.ev(g.q('#statBox')+".open=true")
g.typed('stat.top',123); g.click('#modes [data-m="run"]'); g.typed('runM.stride',55)
g.click('#resetAll',400)
print('(b) after Reset All: P stat.top',g.P('stat.top'),'slider shows',g.ev(g.q('#s_stat_top')+".value"),'| P runM.stride',g.P('runM.stride'),'slider shows',g.ev(g.q('#s_runM_stride')+".value"),'| card top:',re.findall(r'Top Speed\s*([\d.]+)',g.ev(g.q('#statLive')+".innerText").replace('\n',' '))[:1])
# (c) hold key crossing
g.click('#modes2 [data-m="slide"]',300)
g.ev("(function(){var R=document.getElementById('rigHost').shadowRoot;var b=R.querySelectorAll('#animStages .chip');b[2].click();})()"); g.pg.wait_for_timeout(300)
print('(c) slide stage keys t:',[g.P('m.slide.%d.t'%i) for i in range(6)])
print('    drag "When it happens" (key2) to max:',g.slide('m.slide.2.t',0.99),' then "Slide Held Until" (key3) to min:',g.slide('m.slide.3.t',0.0))
print('    now t:',[g.P('m.slide.%d.t'%i) for i in range(6)])
g.click('#resetAnim',300)
print('    typed key3 t = 5%:',g.typed('m.slide.3.t',5),[g.P('m.slide.%d.t'%i) for i in range(6)])
g.click('#resetAnim',300)
# (d) mollyHold after changing the hold key and saving
g.slide('m.slide.3.t',0.5); g.click('#exportGlb',3000)
m=json.loads(g.ev("JSON.stringify(__molly())")); print('(d) after hold=50%% save: game hold',m['hold'],'slide dur',m['durs'][5],'-> hold fraction used',round(m['hold'][0]/m['durs'][5],3),'(editor key3 t =',g.P('m.slide.3.t'),')')
g.click('#resetAnim',300)
# (e) duration 0
g.click('#modes [data-m="run"]',300)
print('(e) typed runM.dur 0:',g.typed('runM.dur',0,600),'phase now',g.ev(D+".ui.phase"),'bones finite',g.ev("(function(){var b="+D+".bones,ok=true;for(var k in b){var q=b[k].quaternion;if(!isFinite(q.x+q.y+q.z+q.w))ok=false;}return ok})()"))
g.typed('runM.dur',0.8,600)
print('    back to 0.8: phase',g.ev(D+".ui.phase"),'bones finite',g.ev("(function(){var b="+D+".bones,ok=true;for(var k in b){var q=b[k].quaternion;if(!isFinite(q.x+q.y+q.z+q.w))ok=false;}return ok})()"))
g.ev("(function(){var e="+g.q('#phase')+";e.value=0.3;e.dispatchEvent(new Event('input',{bubbles:true}))})()")
# (g) click in barrier mode
g.click('#modes2 [data-m="barrier"]',500)
sel0=g.ev(D+".ui.sel")
box=g.ev("(function(){var r="+g.q('#stage canvas')+".getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
for fy in [0.3,0.45,0.6,0.75]:
    g.pg.mouse.click(box[0]+box[2]*0.5, box[1]+box[3]*fy); g.pg.wait_for_timeout(150)
print('(g) barrier mode clicks: selected part before',sel0,'after',g.ev(D+".ui.sel"))
# (h) hearts huge
g.typed('stat.hearts',500); 
print('(h) hearts 500 typed: P',g.P('stat.hearts'))
g.click('#rigClose',600)
print('    game hearts svg count',g.ev("document.getElementById('hearts').children.length"), 'hud width',g.ev("document.getElementById('hearts').getBoundingClientRect().width"))
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'normalized normal' not in e][:8]); g.close()
