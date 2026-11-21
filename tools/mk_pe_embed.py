# Builds the Path Editor into the game: a <template> + a boot function, between markers in the source part that holds them (see src/manifest.json), then rebuilds the game file
import re,sys,os
src=open('/home/claude/poly-runner/path-editor.html').read()
css=re.search(r'<style>(.*?)</style>',src,re.S).group(1)
css=css[css.index('*{box-sizing'):].replace('body{','.pe-wrap{',1)
css=css.replace('.pe-wrap{margin:0;','.pe-wrap{margin:0;position:absolute;inset:0;overflow:auto;')
head=""":host([hidden]){display:none!important}
:host{display:block;--bg:#1d1812;--panel:#262019;--ink:#efe6d6;--mute:#a2927c;--line:#3a3226;--accent:#e0703f;--accent-ink:#1d1812;--map:#2a2419;--grid:#352d20;--grid2:#443a29;--road:#9a7c58;--road-edge:#caa77a;--tree:#6fa356;--trunk:#9a7347;--minion:#0e0f11;--eye:#ff5a48;--tox:#58595f;--font-d:'Rubik',system-ui,sans-serif;--font-m:'DM Mono',ui-monospace,monospace;color-scheme:dark}
.pe-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;max-width:1400px;margin:-16px auto 12px;position:sticky;top:-16px;z-index:50;background:var(--bg);padding:10px 4px;box-shadow:0 8px 12px -8px rgba(0,0,0,.65)}
.pe-bar b{margin-right:auto;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
canvas:focus{outline:none}
"""
body=src[src.index('</style>')+8:src.index('<script>')]
body=body.replace('<div class="app">','<div class="pe-wrap"><div class="pe-bar"><button id="peClose">← Back</button><b>Dev Mode · Path Editor</b><button id="peL1" class="small">Import Grass Canyon</button><button id="peL2" class="small">Import Oceana Crags</button><button id="peLive" class="small" title="Run the level beside the editor; your edits show up in it a moment after you stop">◉ Live preview</button><span id="peLiveMsg" class="stats"></span><input id="peName" type="text" maxlength="40" placeholder="Name this sandbox" style="width:170px"><button id="peSave" class="small">💾 Save</button><button id="pePlay" class="on">▶ Play in Sandbox</button></div><div class="app">',1)
body=body.rstrip()+'\n</div>'
js=re.search(r'<script>\s*\(function \(\) \{(.*)\}\)\(\);\s*</script>',src,re.S).group(1)
js=js.replace("var $ = function (id) { return document.getElementById(id); };","var $ = function (id) { return SR.getElementById(id); };")
js=js.replace("getComputedStyle(document.documentElement)","getComputedStyle(HOST)")
js=js.replace("document.activeElement","SR.activeElement")
assert "window.addEventListener('keydown'" in js
js=js.replace("window.addEventListener('keydown'","HOST.addEventListener('keydown'")
js+="""
  cv.tabIndex = 0; cv.addEventListener('pointerdown', function () { cv.focus(); });
  HOST.__pe = { pick: function (i) { setSel(i); renderInsp(); }, mapImage: mapImage, size: size, setName: function (n) { $('peName').value = n || ''; }, load: function (j, n) { if (n !== undefined) $('peName').value = n; $('json').value = typeof j === 'string' ? j : JSON.stringify(j); $('load').click(); }, json: function () { return $('json').value; } };
  $('peSave').onclick = function () {
    var nm = ($('peName').value || '').trim(); if (!nm) { $('peName').focus(); $('peName').placeholder = 'Type a name first'; return; }
    var all = {}; try { all = JSON.parse(localStorage.getItem('polyrun-sandboxes') || '{}') || {}; } catch (e) {}
    all[nm] = { json: $('json').value, saved: Date.now() };
    try { localStorage.setItem('polyrun-sandboxes', JSON.stringify(all)); $('peSave').textContent = '✓ Saved'; } catch (e) { $('peSave').textContent = 'Save failed'; }
    setTimeout(function () { $('peSave').textContent = '💾 Save'; }, 1500);
  };
  $('peLive').onclick = function () { var on = !HOST.__liveOn; HOST.__liveOn = on; this.classList.toggle('on', on); $('peLiveMsg').textContent = ''; var j = null; try { j = JSON.parse($('json').value); } catch (e) {} if (HOST.__liveToggle) HOST.__liveToggle(on, j); };
  HOST.__liveMsg = function (t) { $('peLiveMsg').textContent = t; };
  HOST.__liveReset = function () { HOST.__liveOn = false; $('peLive').classList.remove('on'); $('peLiveMsg').textContent = ''; };
  $('peClose').onclick = function () { if (HOST.__close) HOST.__close(); };
  $('pePlay').onclick = function () { var j = null; try { j = JSON.parse($('json').value); } catch (e) {} if (HOST.__play) HOST.__play(j); };
  $('peL1').onclick = function () { if (HOST.__import) HOST.__import(1); };
  $('peL2').onclick = function () { if (HOST.__import) HOST.__import(2); };
"""
block="<!--PE-BEGIN-->\n<template id=\"pe-tpl\"><style>"+head+css+"</style>"+body+"</template>\n<script>window.__peBoot=function(SR,HOST){"+js+"};</script>\n<!--PE-END-->\n"
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import build
try: sp,g=build.part_with('<!--PE-BEGIN-->')
except SystemExit: sp,g=build.part_with('<script id="molly-settings"')
if '<!--PE-BEGIN-->' in g:
    i=g.index('<!--PE-BEGIN-->'); j=g.index('<!--PE-END-->\n')+len('<!--PE-END-->\n'); g=g[:i]+block+g[j:]
else:
    k=g.index('<script id="molly-settings"'); g=g[:k]+block+g[k:]
build.write_part(sp,g); build.write()
print('ok',len(block))
