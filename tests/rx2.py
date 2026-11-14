from righ import *
g=Rig(draw=False); g.open()
JS="""async (spec)=>{
  var d=document.getElementById('rigHost').__rigdbg(),P=d.P,DEF=d.DEF,out=[],errs=[];
  window.addEventListener('error',function(e){errs.push(String(e.message).slice(0,160));});
  function raf(){return new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r);});});}
  function stat(){var m=document.getElementById('rigHost').__rigdbg().sk;if(!m)return {none:1};var a=m.geometry.attributes.position.array,w=m.geometry.attributes.skinWeight.array,nan=0,wn=0,mx=0,i;for(i=0;i<a.length;i++){if(!isFinite(a[i]))nan++;else if(Math.abs(a[i])>mx)mx=Math.abs(a[i]);}for(i=0;i<w.length;i++)if(!isFinite(w[i]))wn++;return {tris:a.length/9,nan:nan,wnan:wn,max:+mx.toFixed(1)};}
  var keys=Object.keys(DEF).filter(function(k){return typeof DEF[k]==='number'&&new RegExp(spec.re).test(k);});
  for(var i=0;i<keys.length;i++){var k=keys[i];
    for(var j=0;j<spec.vals.length;j++){var v=spec.vals[j],e0=errs.length,t0=performance.now();
      d.setP(k,v);await raf();var s=stat(),ms=Math.round(performance.now()-t0);
      if(s.none||s.nan||s.wnan||s.max>50||errs.length>e0||ms>1500)out.push([k,v,s,ms,errs.slice(e0,e0+1)]);
    }
    d.setP(k,DEF[k]);await raf();
  }
  return JSON.stringify({n:keys.length,bad:out});
}"""
import sys
spec={'re':sys.argv[1],'vals':json.loads(sys.argv[2])}
r=json.loads(g.pg.evaluate(JS,spec))
print('keys',r['n'],'bad',len(r['bad']))
for b in r['bad']: print('  ',b)
print('errs',[e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:8])
g.close()
