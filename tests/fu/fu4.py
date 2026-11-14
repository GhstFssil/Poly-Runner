# band conversion from saved / pasted old settings; ringGap dial
import sys,json
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
D="document.getElementById('rigHost').__rigdbg()"
GEO="""()=>{var d=document.getElementById('rigHost').__rigdbg(),m=d.sk,a=m.geometry.attributes.position.array;return {n:a.length/3,pos:Array.from(a).map(function(v){return Math.round(v*1e5)/1e5}),bA:d.P['UpperArm.bandA'],bL:d.P['UpperArm.bandL'],fmt:d.P.fmt}}"""
def same(a,b): return a['n']==b['n'] and max(abs(x-y) for x,y in zip(a['pos'],b['pos']))<2e-5
# old build: make a full dump with changed dials
g=Rig(draw=False, html='aud_pre.html'); g.open()
for k,v in [('UpperArm.bandA',15),('UpperArm.bandL',8),('rings',3),('UpperArm.len',31),('jShoulder',7)]: g.ev(D+".setP('%s',%s)"%(k,v))
g.pg.wait_for_timeout(1500); old=g.ev(GEO); dump=g.ev("JSON.stringify("+D+".P)"); g.close()
print('old build, changed dials: band dials',old['bA'],old['bL'],'verts',old['n'])
# 1 new build with those dials saved in the browser
g=Rig(draw=False, storage={'runnerRig2':dump}); g.open(); g.pg.wait_for_timeout(1500); new=g.ev(GEO)
print('1 new build, same saved dials: band dials now',new['bA'],new['bL'],'fmt',new['fmt'],'| same model as the old build:',same(old,new),'| saved back with fmt',json.loads(g.ev("localStorage.getItem('runnerRig2')")).get('fmt'))
# reload: must not convert twice
g.pg.reload(); g.pg.wait_for_timeout(6000); g.open(); g.pg.wait_for_timeout(1500); new2=g.ev(GEO); print('  after a reload: band dials',new2['bA'],new2['bL'],'same:',same(old,new2))
# 2 paste the old dump into a clean new build
g.close(); g=Rig(draw=False); g.open()
g.ev("(t)=>{var R=document.getElementById('rigHost').shadowRoot;R.querySelector('#json').value=t;R.querySelector('#applyJson').click()}",dump); g.pg.wait_for_timeout(1800); p=g.ev(GEO)
print('2 pasted old dump: band dials',p['bA'],p['bL'],'same model:',same(old,p),'|',g.status())
# 3 copy the new settings out and paste them back: nothing moves
dump2=g.ev("JSON.stringify("+D+".P)"); g.click('#resetAll',900)
g.ev("(t)=>{var R=document.getElementById('rigHost').shadowRoot;R.querySelector('#json').value=t;R.querySelector('#applyJson').click()}",dump2); g.pg.wait_for_timeout(1800); p2=g.ev(GEO)
print('3 pasted new dump (fmt 2): band dials',p2['bA'],p2['bL'],'same model:',same(old,p2))
# the band really is where the dials say: ring positions of the upper arm
g.click('#resetAll',900)
tl=g.ev("(function(){var d="+D+";var L=d.P['UpperArm.len'];return d.tList('UpperArm').map(function(t){return Math.round(t*L*100)/100})})()")
print('  default upper arm rings (cm):',tl,'| band dials',g.P('UpperArm.bandA'),'+',g.P('UpperArm.bandL'),'=',round(g.P('UpperArm.bandA')+g.P('UpperArm.bandL'),4))
# 4 the thinnest-strip dial
r=[]
for v in [0,0.8,2,3,50,-1]:
    g.click('#chips [data-id="UpperTorso"]',100)
    t=g.typed('ringGap',v,1200); mm=g.mesh(); nr=g.ev("(function(){var d="+D+";return ['UpperTorso','Thigh','Head','UpperArm'].map(function(i){return d.tList(i).length})})()")
    r.append((v,t,mm['tris'],mm['nan'],nr))
for x in r: print('4 ringGap',x)
print('errors',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e and 'normalized normal' not in e][:4])
g.close()
