# joined tunnels of different angles (and heights): she runs across each joint instead of stalling on the step between their floors
import sys
sys.path.insert(0,'/home/claude/poly-runner/tests')
from righ import *
html=sys.argv[1] if len(sys.argv)>1 else 'aud.html'
g=Rig(w=480,h=320,draw=False,html=html); pg=g.pg
pg.click('#bDevT'); pg.click('#dtBlank'); pg.wait_for_timeout(2000)
cases=[([30,0,-35],(8,8),15),([30,0,-20],(8,8),15),([30,10,-35],(8,8),15),([30,10,-20],(8,8),15),([30,25,-35],(8,8),15),([30,10,-10],(10,8),30)]   # each stalled at the second joint every time before the fix
def once(angs,h1,h2,zips):
  objs=[{'type':'cave','id':1,'s':60,'u':0,'rot':0,'shape':'rect','width':10,'height':8,'angle':angs[0],'depth':40},
        {'type':'cave','id':2,'after':1,'shape':'rect','width':10,'height':h1,'angle':angs[1],'angleSet':True,'depth':40},
        {'type':'cave','id':3,'after':2,'shape':'rect','width':10,'height':h2,'angle':angs[2],'angleSet':True,'depth':80}]
  pg.evaluate("j=>__sbStart(j)",{'width':12,'pieces':[{'t':'straight','len':600}],'objects':objs}); pg.wait_for_timeout(900)
  jz=pg.evaluate("()=>__dbg().SB.caves.map(c=>c.end?c.end.z:null)")[:2]
  pg.evaluate("""z=>{window.__tr=[];(function f(){var d=__dbg();__tr.push(d.z);if(__tr.length<400)requestAnimationFrame(f)})();__pos(60000,0,-40);__st({vy:0,speed:z*2,heading:0,yaw:0});__keys({KeyW:true,w:true,ArrowUp:true})}""",zips)
  pg.wait_for_timeout(4000); pg.evaluate("__keys({KeyW:false,w:false,ArrowUp:false})")
  tr=pg.evaluate("__tr")
  for i in range(40,len(tr)):              # stalled: under 1 unit of progress over 40 frames
    if abs(tr[i]-tr[i-40])<1:
      for k,j in enumerate(jz):
        if abs(tr[i]-j)<4: return 'stalled at joint %d (z %.1f)'%(k+1,tr[i])
      return None
  return None
bad=[]
for angs,(h1,h2),zips in cases:
  r=[once(angs,h1,h2,zips) for _ in range(3)]
  if all(r): bad.append((angs,(h1,h2),zips,r[0]))
print('PASS' if not bad else 'FAIL'); print(html,'cases',len(cases),'stalled at a joint in 3 of 3 tries:',len(bad)); [print(' ',b) for b in bad]; g.close()
