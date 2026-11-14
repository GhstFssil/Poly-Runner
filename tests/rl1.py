from righ import *
for w,h in [(400,800),(820,900),(1280,800)]:
    g=Rig(w=w,h=h,draw=True); g.ev('window.__noRender=true'); g.open()
    box=g.ev("(function(){var R=document.getElementById('rigHost').shadowRoot,a=R.querySelector('aside').getBoundingClientRect(),s=R.querySelector('#stageWrap').getBoundingClientRect(),b=R.querySelector('.bar').getBoundingClientRect();return {aside:[Math.round(a.left),Math.round(a.top),Math.round(a.width),Math.round(a.height)],stageWrap:[Math.round(s.left),Math.round(s.top),Math.round(s.width),Math.round(s.height)],bar:Math.round(b.height),scrollW:document.getElementById('rigHost').scrollWidth,hostW:document.getElementById('rigHost').clientWidth}})()")
    print(w,h,box); g.pg.screenshot(path='/home/claude/poly-runner/tests/shots/rig_layout_%d.png'%w); g.close()
