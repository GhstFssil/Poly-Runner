  // ---- The Path Editor, inside the game the same way: a full-screen panel in its own shadow tree. Play in Sandbox builds the layout it holds. ----
  var peHost = null, liveOn = false, liveMouse = null, liveTimer = 0;
  function liveLayout(on) {                                       // the game on the left, the editor on the right
    peHost.style.left = on ? '45%' : '0'; stage.style.width = on ? '45%' : '100%';
    resize(); if (peHost.__pe) peHost.__pe.size();
  }
  function liveStop(quiet) {
    if (!liveOn) return; liveOn = false; if (peHost.__liveReset) peHost.__liveReset();
    if (liveMouse) { mouseMode = liveMouse; liveMouse = null; }
    liveLayout(false); if (!quiet && playing) pause();
  }
  var yInfoKey = '', yInfoB = null;
  function sbShowY(B, o) {                                       // a stamp's Y as the game will place it, in world height (true Y if it has one; otherwise from the ground it sits on)
    if (o.T !== undefined) return o.T;
    var x = L3_X + (o.ax || 0), z = o.az || 0, f = function () { return sbFoot(x, z); };
    switch (o.t) {
      case 'tree': case 'sign': case 'goal': case 'checkpoint': case 'toxic': case 'tip': case 'ramp': return f() + (o.y || 0);
      case 'seg': return f() + (o.big ? 2.5 : 1.7) + Math.max(-1, o.h || 0);
      case 'segchain': return f() + (o.big ? 2.5 : 1.7) + Math.max(-1, o.h || 0);
      case 'cave': return level3H(x, z) + (o.y || 0);
      case 'ledge': return level3H(x, z) + (o.hgt || 0);
      case 'platform': return l3Top(x, z) + (o.hgt || 0);
      case 'door': return l3Top(x, z);
      case 'lake': var rim = [], rk; for (rk = 0; rk < 32; rk++) rim.push(groundH0(x + Math.cos(rk / 32 * 6.2832) * o.r * 1.03, z + Math.sin(rk / 32 * 6.2832) * o.r * 1.03)); rim.sort(function (u, v) { return u - v; }); return rim[16] - o.depth * 0.45 + (o.wl || 0);
      default: return f();
    }
  }
  function yInfo(j, ids) {                                       // for the Path Editor: each stamp's Y, measured from her feet at the start of the path (the layout is built aside; the level being played is not touched)
    var key = JSON.stringify(j), keepSB = SB, keepL = level, out = { y0: 0, ys: {} };
    try {
      if (key !== yInfoKey || !yInfoB) { SB = null; yInfoB = sbBuild(j); yInfoKey = key; }
      SB = yInfoB; level = 3; gcI = 1e9; gcJ = 1e9; out.y0 = yInfoB.y0;
      yInfoB.objs.forEach(function (o) { if (ids && ids.indexOf(o.id) < 0) return; try { var v = sbShowY(yInfoB, o); if (isFinite(v)) out.ys[o.id] = Math.round((v - yInfoB.y0) * 100) / 100; } catch (e) {} });
    } catch (e) { out.err = String(e && e.message || e); }
    SB = keepSB; level = keepL; gcI = 1e9; gcJ = 1e9;
    return out;
  }
  function liveRebuild(j) {                                       // rebuild the layout under Molly and put her back exactly where she was
    if (!liveOn) return; var t0 = performance.now();
    if (!SB || level !== 3) { startSandbox(j); return; }
    var pp = player.position, k = { x: pp.x, y: pp.y, z: pp.z, h: heading, yw: yaw, sp: speed, sx: spawn.x, sz: spawn.z, sc: spawn.cp, sy: spawn.yaw, tl: timeLeft, hp: hp, pw: segCount, st: segTotal, ball: ballOn }, keepSB = SB, nb;
    try { SB = null; nb = sbBuild(j); SB = keepSB; } catch (er) { SB = keepSB; peHost.__liveMsg('Not rebuilt: the layout is mid-edit (' + (er && er.message || er) + ')'); return; }   // half-finished edits leave the running level as it was
    sbDispose(); SB = nb; sbCaveInit(); sbMoverInit(); gcI = 1e9; gcJ = 1e9;
    for (var key in chunks) { scene.remove(chunks[key]); delete chunks[key]; }
    TIME_LIMIT = SB.timeLimit > 0 ? SB.timeLimit : 300; sbMakeMeshes(); sbRampInit(); sbBoostZones();
    spawnAt(k.x, k.z, 0, '', k.yw); endSpawnFx();
    spawn.x = k.sx; spawn.z = k.sz; spawn.cp = k.sc; spawn.yaw = k.sy; timeLeft = k.tl; heading = k.h; yaw = k.yw; speed = k.sp; hp = k.hp; drawHearts(); setPower(k.pw); segTotal = 0; addSegs(k.st || 0); if (k.ball) { setPower(k.pw + BARRIER_COST); setBall(true); } sbLight(k.sc);
    var gy = groundH(k.x, k.z); player.position.y = Math.max(gy, k.y); if (k.y > gy + 0.05) { grounded = false; fallTop = k.y; }
    peHost.__liveMsg('Rebuilt in ' + Math.round(performance.now() - t0) + ' ms');
  }
  function openPE() {
    if (!peHost) {
      peHost = document.createElement('div'); peHost.id = 'peHost'; peHost.hidden = true;
      peHost.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:9999;overflow:hidden;background:#1d1812';
      document.body.appendChild(peHost);
      var sr = peHost.attachShadow({ mode: 'open' }); sr.appendChild(document.getElementById('pe-tpl').content.cloneNode(true));
      peHost.__close = function () { liveStop(); peHost.hidden = true; };
      peHost.__play = function (j) { liveStop(true); peHost.hidden = true; startSandbox(j); };
      peHost.__terrain = terrainProbe; peHost.__terrBase = function (kind, x, z) { return sbTerrBase(kind, x, z, true) - (kind === 'level2' ? L2_Y : 0); };
      peHost.__liveToggle = function (on, j) {
        if (!on) { liveStop(); return; }
        liveOn = true; if (document.pointerLockElement) document.exitPointerLock();
        liveMouse = mouseMode; mouseMode = 'drag';                  // the pointer stays free so the editor can be used; drag in the game view to look round
        liveLayout(true); if (j) startSandbox(j);
        peHost.__liveMsg('Live: edits show here a moment after you stop');
      };
      peHost.__live = function (j) { liveRebuild(j); };
      peHost.__yInfo = function (j, ids) { return yInfo(j, ids); };
      peHost.__import = function (n) { var j = n === 1 ? JSON.parse(JSON.stringify(OFFICIAL_L1)) : n === 2 ? JSON.parse(JSON.stringify(OFFICIAL_L2)) : levelToEditor(n); if (j) peHost.__pe.load(j); };   // Grass Canyon: the official layout itself, every stamp included (not a rebuild of the old hand-made level)
      ['keydown', 'keyup', 'keypress'].forEach(function (t) {
        peHost.addEventListener(t, function (e) {
          if (liveOn) {                                              // live preview: the game keeps its keys unless you are typing in the editor or using its own shortcuts
            var tg = e.composedPath()[0], tn = tg && tg.tagName, typing = tn === 'INPUT' || tn === 'TEXTAREA' || tn === 'SELECT';
            if (t === 'keyup') return;
            if (!typing && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== 'Escape' && e.key !== 'Delete' && e.key !== 'Backspace') return;
          }
          e.stopPropagation();
        });
      });
      window.__peBoot(sr, peHost);
    }
    peHost.hidden = false; peHost.__pe.size();
  }
