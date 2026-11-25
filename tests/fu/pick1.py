# Character Select: choosing a level opens it; the last pick is marked and focused; Back returns to Level Select without starting; picking Comet starts the level as her and is remembered; the Characters page has no Play buttons
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from righ import *
g=Rig(w=480,h=320,draw=False); pg=g.pg
ok=True
def chk(name, c, extra=''):
    global ok; ok = ok and bool(c); print('PASS' if c else 'FAIL', name, extra)
scr=lambda: pg.evaluate("[...document.querySelectorAll('.scr.on')].map(s=>s.id).join(',')")
pg.evaluate("localStorage.removeItem('pr_char')")
pg.click('#bChars'); pg.wait_for_timeout(300)
chk('Characters page: two cards, no Play buttons', pg.evaluate("document.querySelectorAll('#charStats .pickChar').length")==0 and pg.evaluate("document.querySelectorAll('#charStats > div').length")==2)
pg.click('#chBack'); pg.click('#bLevels'); pg.wait_for_timeout(200)
pg.click('#bLevel1'); pg.wait_for_timeout(300)
chk('level button opens Character Select', scr()=='scr-pickchar', scr())
chk('level not started yet', pg.evaluate("!document.getElementById('start').hidden"))
btns=pg.evaluate("[...document.querySelectorAll('#pickCards .pickChar')].map(b=>b.textContent)")
chk('two Play buttons, Molly marked as last', btns==['Play as Molly (last time)','Play as Comet'], btns)
chk('last pick has the focus', pg.evaluate("document.activeElement&&document.activeElement.getAttribute('data-ch')")=='molly')
pg.click('#pcBack'); pg.wait_for_timeout(200)
chk('Back returns to Level Select', scr()=='scr-levels', scr())
pg.click('#bLevel2'); pg.wait_for_timeout(300)
pg.click("#pickCards .pickChar[data-ch=comet]"); pg.wait_for_timeout(3000)
chk('picking Comet starts the level', pg.evaluate("document.getElementById('start').hidden"))
chk('playing as Comet, remembered', pg.evaluate("__comet().char")=='comet' and pg.evaluate("localStorage.getItem('pr_char')")=='comet')
print('ALL PASS' if ok else 'SOME FAILED')
g.close()
