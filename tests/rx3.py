from righ import *
g=Rig(draw=False); g.open()
JS="""async (cases)=>{
  var d=document.getElementById('rigHost').__rigdbg(),P=d.P,DEF=d.DEF,out=[];
  function raf(){return new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r);});});}
  for(var i=0;i<cases.length;i++){var c=cases[i];for(var k in c)d.setP(k,c[k]);await raf();var dd=document.getElementById('rigHost').__rigdbg();
    out.push([JSON.stringify(c),dd.sk?dd.sk.geometry.attributes.position.count/3:null,Math.round(dd.rebuildMs())]);for(var k in c)d.setP(k,DEF[k]);}
  await raf();return JSON.stringify(out);}"""
cases=[{'sides':8,'rings':2},{'sides':20,'rings':4},{'sides':40,'rings':4},{'sides':40,'rings':8},{'sides':64,'rings':8},{'sides':200,'rings':2},{'sides':8,'rings':50},{'sides':8,'rings':100000}]
for r in json.loads(g.pg.evaluate(JS,cases)): print(r)
print([e for e in g.errs if 'flatShading' not in e and 'ERR_FAILED' not in e][:5]); g.close()
