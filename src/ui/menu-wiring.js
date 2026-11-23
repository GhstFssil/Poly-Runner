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
    startEl.classList.toggle('splash', !(name === 'pause' || name === 'dev' || name === 'cps' || name === 'map' || name === 'controls' && controlsBack === 'pause' || name === 'settings' && settingsBack === 'pause'));   // every menu screen has the checks; only the pause screen and what opens from it stay see-through over the game
    if (name === 'pause' || name === 'chars') refreshStatCards();
    if (name === 'pause') { document.getElementById('bPE').hidden = level !== 3 || !!(SB && SB.official); document.getElementById('bCps').hidden = false; document.getElementById('bMap').hidden = level === 3; }
    if (name === 'dev') { if (typeof updateCoords === 'function') updateCoords(); document.getElementById('dv3').hidden = level === 2 || level === 3; document.getElementById('dv1').hidden = document.getElementById('dv2').hidden = level === 3; cpFill(document.getElementById('dvDyn')); }     // Oceana Crags has just the one checkpoint so far
    if (name === 'cps') {                                    // only checkpoints reached this run can be restarted from
      document.getElementById('gocp3').hidden = level === 2 || level === 3; document.getElementById('gocp').hidden = document.getElementById('gocp2').hidden = level === 3;
      var dyn = document.getElementById('cpDyn'); dyn.innerHTML = '';
      cpFill(dyn);
      [['gocp', 1], ['gocp2', 2], ['gocp3', 3]].forEach(function (c) {
        var b = document.getElementById(c[0]), ok = cpBest >= c[1] && cpTime[c[1]] !== undefined;
        b.disabled = !ok;
        b.textContent = 'Checkpoint ' + c[1] + (ok ? '  ·  ' + fmtT(cpTime[c[1]]) + ' left' : '  ·  not reached');
      });
    }
    if (name === 'map') drawMap();                           // centred on where she is now
  }
  // The two built levels, written out in the Path Editor's file format so they open there as editable copies. (Playing an edited copy happens in the Sandbox; the levels themselves are untouched.)
  function levelToEditor(n) {
    var out = { version: 2, width: 20, terrain: n === 2 ? 'level2' : 'level1', pieces: [], objects: [] }, id = 1, R = function (v) { return Math.round(v * 10) / 10; }, i;
    function add(o) { o.id = id++; out.objects.push(o); }
    function sOf(x, z) { l2Dist(x, z); return R(L2_S); }
    if (n === 2) {
      out.width = 2 * L2_HW;
      var B0 = L2_Z0 - L2_SBZ;                                    // the editor's start is where she spawns, 40 units along the runway, so there is runway behind her
      function sm3(t) { return t * t * (3 - 2 * t); }
      for (i = 0; i < L2_PIECES.length; i++) {
        var p = L2_PIECES[i], nx = L2_PIECES[i + 1], dy = nx ? nx.y0 - p.y0 : 0;
        if (i > 0) { var pv = L2_PIECES[i - 1], g = p.s0 - (pv.s0 + pv.len); if (g > 0.5) { out.pieces.push({ t: 'straight', len: R(g), dy: 0 }); add({ type: 'gap', s: R(pv.s0 + pv.len - B0), u: 0, length: R(g), width: 2 * L2_HW + 6 }); } }
        if (p.t === 's') { out.pieces.push({ t: 'straight', len: R(i === 0 ? p.len - B0 : p.len), dy: R(dy) }); if (p.ramp) add({ type: 'ramp', s: R(p.s0 - B0), u: 0, length: R(p.len), width: 2 * L2_HW, slope: 0, boost: 15 }); }   // (the ground already has the ramp's slope: this one only marks the Style Boost)
        else {
          var ang = p.th * 180 / Math.PI, dir = p.sig > 0 ? 'L' : 'R', NS = Math.abs(dy) > 0.5 ? 8 : 1, k, doneA = 0, doneY = 0;     // a climbing bend rises along an S-curve, so it is cut into pieces that follow it
          for (k = 1; k <= NS; k++) {
            var aK = k === NS ? ang - doneA : Math.round(ang / NS * 1000) / 1000, yK = k === NS ? dy - doneY : Math.round(dy * (sm3(k / NS) - sm3((k - 1) / NS)) * 100) / 100;
            out.pieces.push({ t: 'arc', dir: dir, ang: Math.round(aK * 1000) / 1000, r: R(p.R), dy: Math.round(yK * 100) / 100 }); doneA += aK; doneY += yK;
          }
        }
      }
      add({ type: 'checkpoint', s: R(sOf(L2CP_X, L2CP_Z) - B0), u: 0, width: 2 * L2_HW + 6 });
      add({ type: 'checkpoint', s: R(sOf(L2CP2_X, L2CP2_Z) - B0), u: 0, width: 2 * L2_HW + 6 });
      add({ type: 'segchain', s: R(L2_PIECES[L2_LAND1_I].s0 + 4 - B0), u: 0, length: 192, spacing: 8, big: false });
      var last = L2_PIECES[L2_PIECES.length - 1], send = last.s0 + last.len;
      add({ type: 'segchain', s: R(send - 406 - B0), u: 0, length: 400, spacing: 100, big: true });
      [[220, 0], [650, 4], [650, -4], [900, -3], [1100, 0], [1375, 4], [1650, 3.5], [1925, -4], [2200, -3.5]].forEach(function (m) { add({ type: 'minion', s: m[0] - B0, u: m[1] }); });
      add({ type: 'bigminion', x: R(Math.round((OV_CX + 24) / 2.5) * 2.5 - L2_X), z: R(Math.round(-1360 / 2.5) * 2.5 - L2_SBZ) });   // the middle of a maze cell near the Sink's far end
      TOX.forEach(function (t) { add({ type: 'toxic', s: R((t.a + t.b) / 2 - B0), u: R(t.v), width: 2.5, length: R(t.b - t.a) }); });
      // (the Sink needs no object: its ground is the real level's own, poisonous and textured, in this terrain)
    } else {
      out.width = 40; out.pieces.push({ t: 'straight', len: END, dy: 0 });
      add({ type: 'checkpoint', x: CP_X, z: CP_Z, width: 60 });
      add({ type: 'checkpoint', x: CP2_X, z: CP2_Z, width: 60 });
      add({ type: 'checkpoint', x: CP4_X, z: CP4_Z, width: 30 });
      [[-45, -25], [45, -25], [0, -62]].forEach(function (m) { add({ type: 'minion', x: CH_X + m[0], z: CH_Z + m[1] }); });
      add({ type: 'goal', x: BONUS_X, z: BONUS_Z, kind: 'bonus', style: 'ring', width: BONUS_R * 2 });
      add({ type: 'goal', x: DR_XE, z: GOAL_Z, kind: 'regular', style: 'banner', width: GOAL_HALF * 2 });
      // the forest: every tree the level would plant becomes a real Tree object (thinned to an even spread if there are too many)
      var tl = [], cx, cz, c, g0, lo, hi, gs, q, cxA = Math.floor(-4200 / T_CS), cxB = Math.floor(400 / T_CS), czA = Math.floor(-9500 / T_CS), czB = Math.floor(150 / T_CS);
      for (cz = czA; cz <= czB; cz++) for (cx = cxA; cx <= cxB; cx++) {
        if (!planted(cx, cz)) continue; c = candidate(cx, cz); if (!c) continue;
        g0 = worldH0(c.x, c.z) + ledgeH(c.x, c.z); lo = g0; hi = g0;
        for (q = 0; q < 4; q++) { gs = worldH0(c.x + (q & 1 ? 1.2 : -1.2), c.z + (q & 2 ? 1.2 : -1.2)) + ledgeH(c.x + (q & 1 ? 1.2 : -1.2), c.z + (q & 2 ? 1.2 : -1.2)); if (gs < lo) lo = gs; if (gs > hi) hi = gs; }
        if (hi - lo >= 1.4 && !c.pin) continue;
        if (!c.pin) {
          if (c.thin < (c.x > -HALF && c.x < HALF && c.z > -END ? 0.45 : 0.25)) continue;
          if (c.z < -END && c.thin < 0.8125) continue;
          if (c.z < -LEDGE_START && c.thin < 0.71875) continue;
        }
        tl.push(c);
      }
      candCache.clear(); plantCache.clear(); builtAtZ = 1e9;
      var step = Math.max(1, tl.length / 2500), ti2;
      for (ti2 = 0; ti2 < tl.length; ti2 += step) add({ type: 'tree', x: R(tl[Math.floor(ti2)].x), z: R(tl[Math.floor(ti2)].z) });
    }
    return out;
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
  on('dtSandbox', function () { var j = null; try { j = JSON.parse(localStorage.getItem('polyrun-last-export')); } catch (e) {} startSandbox(j); });
  on('dtBlank', function () { startSandbox(null); });
  function readSaves() { try { return JSON.parse(localStorage.getItem('polyrun-sandboxes') || '{}') || {}; } catch (e) { return {}; } }
  function fillSaves() {
    var box = document.getElementById('saveList'), all = readSaves(), names = Object.keys(all).sort(function (a, b) { return all[b].saved - all[a].saved; });
    box.innerHTML = '';
    if (!names.length) { var em = document.createElement('p'); em.textContent = 'Nothing saved yet. Name a layout in the Path Editor and press Save.'; box.appendChild(em); return; }
    names.forEach(function (nm) {
      var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:6px;align-items:stretch';
      function mk(t, f, grow) { var b = document.createElement('button'); b.type = 'button'; b.className = 'go2'; b.textContent = t; b.style.cssText = 'margin-top:0;' + (grow ? 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis' : 'padding-left:10px;padding-right:10px'); b.onclick = f; row.appendChild(b); }
      mk(nm, function () { var j = null; try { j = JSON.parse(all[nm].json); } catch (e) {} startSandbox(j); }, true);
      mk('Edit', function () { openPE(); peHost.__pe.load(all[nm].json, nm); });
      mk('✕', function () { if (this.dataset.sure) { var a2 = readSaves(); delete a2[nm]; try { localStorage.setItem('polyrun-sandboxes', JSON.stringify(a2)); } catch (e) {} fillSaves(); } else { this.dataset.sure = 1; this.textContent = 'Sure?'; } });
      box.appendChild(row);
    });
  }
  on('dtSaves', function () { fillSaves(); showScreen('saves'); });
  on('svBack', function () { showScreen('devt'); });
  on('bLevelsBack', function () { showScreen('main'); });
