from righ import *
import subprocess
g=Rig(draw=False); g.open()
D="document.getElementById('rigHost').__rigdbg()"
print('band range, upper arm (cm):',g.ev("(function(){var d="+D+";return JSON.stringify(d.tList('UpperArm').map(function(t){return +(t*d.P['UpperArm.len']).toFixed(2)}))})()"))
for name,ch in [('default',{}),('irrC 1.5',{'irrC':1.5}),('irr 1 irrC 1.5',{'irr':1,'irrC':1.5})]:
    g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,c[k]);}",ch); g.pg.wait_for_timeout(900)
    open('/home/claude/poly-runner/tests/weld/s.json','w').write(g.ev("window.__soups0"))
    r=subprocess.run(['node','-e',"""const W=require('/home/claude/poly-runner/tests/weld/weld.js'),S=JSON.parse(require('fs').readFileSync('/home/claude/poly-runner/tests/weld/s.json'));var o=[];Object.keys(S).forEach(function(k){var E={},open=0,odd=0,flip=0;S[k].forEach(function(t){for(var i=0;i<3;i++){var a=W.wKey(t[i]),b=W.wKey(t[(i+1)%3]);if(a===b)continue;var kk=a<b?a+'|'+b:b+'|'+a;var e=E[kk]=E[kk]||[0,0];e[a<b?0:1]++;}});for(var kk in E){var e=E[kk],n=e[0]+e[1];if(n===1)open++;else if(n!==2)odd++;else if(e[0]!==1)flip++;}if(open||odd||flip)o.push(k+' open '+open+' odd '+odd+' flipped '+flip);});console.log(o.join(' | ')||'every part closed and consistently faced');"""],capture_output=True,text=True)
    m=g.mesh(); print('%-16s'%name,'tris',m['tris'],'|',r.stdout.strip()[:400],'| weld loops',g.ev("JSON.stringify(window.__weldlog.map(function(l){return l[1].join(',')+'/'+l[2].join(',')}))"))
    g.ev("(c)=>{var d=document.getElementById('rigHost').__rigdbg();for(var k in c)d.setP(k,d.DEF[k]);}",ch)
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:5]); g.close()
