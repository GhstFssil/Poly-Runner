(function () {
  var box = document.getElementById('clogList'); if (!box) return;
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  box.innerHTML = CHANGELOG.map(function (e, i) {
    return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(e.v) + '<span class="cd">' + esc(e.d) + ' · ' + esc(e.t) + '</span></summary>' +
      e.g.map(function (g) { return '<h3>' + esc(g[0]) + '</h3><ul>' + g[1].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }).join('') + '</details>';
  }).join('') + '<div class="cn">Entries before v162 are reconstructed from my build notes, so they list what was added without the full detail.</div>';
})();
function showScreen(name) {                                // the menu shows one screen at a time
    screenNow = name;
    var all = startEl.querySelectorAll('.scr');
    for (var q = 0; q < all.length; q++) all[q].classList.toggle('on', all[q].id === 'scr-' + name);
    startEl.classList.toggle('splash', !(name === 'pause' || name === 'dev' || name === 'cps' || name === 'controls' && controlsBack === 'pause' || name === 'settings' && settingsBack === 'pause'));   // every menu screen has the checks; only the pause screen and what opens from it stay see-through over the game
    if (name === 'pause' || name === 'chars' || name === 'pickchar') refreshStatCards();
    if (name === 'pause') { document.getElementById('bPE').hidden = level !== 3 || !!(SB && SB.official); document.getElementById('bCps').hidden = false; }
    if (name === 'dev') { if (typeof updateCoords === 'function') updateCoords(); cpFill(document.getElementById('dvDyn')); }     // Oceana Crags has just the one checkpoint so far
    if (name === 'cps') {                                    // only checkpoints reached this run can be restarted from
      var dyn = document.getElementById('cpDyn'); dyn.innerHTML = '';
      cpFill(dyn);
    }
  }
  function begin() {
    if (cleared) { newRun(); spawnStart(''); }                     // after a clear the main button starts the level over
    started = true;
    playing = true;
    startEl.hidden = true;
    speedo.hidden = false;
    segsEl.hidden = false; seglineEl.hidden = false;
    hpEl.hidden = false;
    lockPointer();
  }
  function pause() {
    playing = false;
    keys.w = false;
    keys.s = false;
    spaceDown = false;
    startEl.hidden = false;
    speedo.hidden = true;
    segsEl.hidden = true; seglineEl.hidden = true;
    hpEl.hidden = true;
    resumeBtn.textContent = cleared ? 'Restart' : 'Resume';
    showScreen('pause');
  }
  function on(id, fn) { document.getElementById(id).addEventListener('click', function (e) { e.stopPropagation(); fn(); }); }
  var settingsBack = 'main';
  function gfxSave() { try { localStorage.setItem('pr_gfx', JSON.stringify(GFX)); } catch (e) {} }
  function gfxShow() {
    document.getElementById('gAA').textContent = 'Antialiasing: ' + (GFX.aa ? 'On' : 'Off') + '  (restarts the game)';
    document.getElementById('gSoft').textContent = 'Soft Shadows: ' + (GFX.soft ? 'On' : 'Off');
    document.getElementById('gFogV').textContent = Math.round(GFX.fog * 100) + '%';
    document.getElementById('gFog').value = Math.round(GFX.fog * 100);
  }
  on('bSettings', function () { settingsBack = 'main'; gfxShow(); showScreen('settings'); });
  on('bPSettings', function () { settingsBack = 'pause'; gfxShow(); showScreen('settings'); });
  on('bSetBack', function () { showScreen(settingsBack); });
  on('gAA', function () { GFX.aa = !GFX.aa; gfxSave(); location.reload(); });       // antialiasing is fixed when the renderer is made, so the page starts over
  on('gSoft', function () {
    GFX.soft = !GFX.soft; gfxSave(); gfxShow();
    renderer.shadowMap.type = GFX.soft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    scene.traverse(function (o) { if (o.material) [].concat(o.material).forEach(function (m) { m.needsUpdate = true; }); });
  });
  document.getElementById('gFog').addEventListener('input', function () {
    GFX.fog = Math.max(0.3, Math.min(1, this.value / 100)); gfxSave(); gfxShow();
    scene.fog.near = 160 * GFX.fog; scene.fog.far = 640 * GFX.fog; camera.far = 700 * GFX.fog; camera.updateProjectionMatrix(); VIEW_AHEAD = 680 * GFX.fog;
  });
  on('bControls', function () { controlsBack = 'main'; showScreen('controls'); });
  on('bPControls', function () { controlsBack = 'pause'; showScreen('controls'); });
  startEl.querySelector('[data-back]').addEventListener('click', function () { showScreen(controlsBack); });
  on('bLevels', function () { showScreen('levels'); });
  on('bChars', function () { showScreen('chars'); });
  on('bClog', function () { showScreen('clog'); });
  on('clBack', function () { showScreen('main'); });
  on('chBack', function () { showScreen('main'); });
  on('bDevT', function () { showScreen('devt'); });
  on('dtBack', function () { showScreen('main'); });
  on('bPE', function () { openPE(); });
  on('dtRig', openRig);
  on('dtPath', openPE);
  on('dtSandbox', function () { var j = null; try { j = JSON.parse(localStorage.getItem('polyrunner-last-export')); } catch (e) {} startSandbox(j); });
  on('dtBlank', function () { startSandbox(null); });
  function readSaves() { try { return JSON.parse(localStorage.getItem('polyrunner-sandboxes') || '{}') || {}; } catch (e) { return {}; } }
  function fillSaves() {
    var box = document.getElementById('saveList'), all = readSaves(), names = Object.keys(all).sort(function (a, b) { return all[b].saved - all[a].saved; });
    box.innerHTML = '';
    if (!names.length) { var em = document.createElement('p'); em.textContent = 'Nothing saved yet. Name a layout in the Path Editor and press Save.'; box.appendChild(em); return; }
    names.forEach(function (nm) {
      var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:6px;align-items:stretch';
      function mk(t, f, grow) { var b = document.createElement('button'); b.type = 'button'; b.className = 'go2'; b.textContent = t; b.style.cssText = 'margin-top:0;' + (grow ? 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis' : 'padding-left:10px;padding-right:10px'); b.onclick = f; row.appendChild(b); }
      mk(nm, function () { var j = null; try { j = JSON.parse(all[nm].json); } catch (e) {} startSandbox(j); }, true);
      mk('Edit', function () { openPE(); peHost.__pe.load(all[nm].json, nm); });
      mk('✕', function () { if (this.dataset.sure) { var a2 = readSaves(); delete a2[nm]; try { localStorage.setItem('polyrunner-sandboxes', JSON.stringify(a2)); } catch (e) {} fillSaves(); } else { this.dataset.sure = 1; this.textContent = 'Sure?'; } });
      box.appendChild(row);
    });
  }
  on('dtSaves', function () { fillSaves(); showScreen('saves'); });
  on('svBack', function () { showScreen('devt'); });
  on('bLevelsBack', function () { showScreen('main'); });
