  // ---- Where she starts: the start meadow or the checkpoint ----
  var cleared = false, clearEl = document.getElementById('clear'), rpHold = 0, rpReady = false, rpFlash = 0, rpGlowNow = 0, rpBlend = 0, mudWas = false;
  var hintEl = document.getElementById('hint'), hintDone = false, signDone = false, jumpDone = false, endDone = false, segTipDone = false, readyDone = false, chamberDone = false, mudTipDone = false, hintUntil = 0, hintPrevZ = 0, hintPrevX = 0;
  var hintStart = false;
  function newRun() { if (level !== 3) TIME_LIMIT = 300; styleTipDone = false; toxUntil = 0; cpTime = []; cpBest = 0; hintDone = false; signDone = false; jumpDone = false; endDone = false; segTipDone = false; readyDone = false; chamberDone = false; mudTipDone = false; hintEl.hidden = true; hintStart = true; }
  var hintFull = '', hintTyped = 0, HINT_CPS = 50;
  function showHint(txt, ms, now, force) {               // the levels have no built-in tips now (only tips placed in the Path Editor show: force); a tip types itself into the box; one that arrives while another is up types in below it, and the two durations add
    if (!force) return;
    if (!hintEl.hidden) { hintFull += '\n' + txt; hintUntil += ms; }
    else { hintFull = txt; hintTyped = 0; hintEl.textContent = ''; hintEl.hidden = false; hintUntil = now + ms; }
  }
  var RP_FLASH_T = 0.9, glowMats = null;
  function setGlow(v) {                                  // a soft red wash over all of Molly's materials
    if (!glowMats) { glowMats = []; body.traverse(function (o) { if (o.isMesh && o.material && o.material.emissive && glowMats.indexOf(o.material) < 0) glowMats.push(o.material); }); }
    for (var gi = 0; gi < glowMats.length; gi++) glowMats[gi].emissive.setRGB(v, v * 0.12, v * 0.1);
  }
  var spawn = { x: 0, z: 0, cp: 0, yaw: 0 }, started = false;   // cp: 0 the start, 1 or 2 a checkpoint
  // Spawn effect: about a second. Her silhouette glows up as red light, then fades as she materialises.
  var SPAWN_FX = 1.0, spawnT = -1, spawnMats = [], spawnOver = [], spawnRed = new THREE.MeshBasicMaterial({ color: 0xff2a22, transparent: true, opacity: 0, depthWrite: false, skinning: true });
  function endSpawnFx() {
    for (var i = 0; i < spawnMats.length; i++) { spawnMats[i].m.transparent = spawnMats[i].t; spawnMats[i].m.opacity = spawnMats[i].o; }
    for (var j = 0; j < spawnOver.length; j++) if (spawnOver[j].parent) spawnOver[j].parent.remove(spawnOver[j]);
    spawnMats = []; spawnOver = []; spawnT = -1; spawnRed.opacity = 0;
  }
  function startSpawnFx() {
    endSpawnFx();
    var seen = [];
    player.traverse(function (o) {
      if (!o.isMesh || o.userData.spawnOverlay) return;
      for (var p = o; p; p = p.parent) if (!p.visible) return;           // only what is on show (not the hidden ball)
      var ms = Array.isArray(o.material) ? o.material : [o.material];
      ms.forEach(function (m) { if (seen.indexOf(m) < 0) { seen.push(m); spawnMats.push({ m: m, t: m.transparent, o: m.opacity }); } });
      var ov = o.isSkinnedMesh ? new THREE.SkinnedMesh(o.geometry, spawnRed) : new THREE.Mesh(o.geometry, spawnRed); if (o.isSkinnedMesh) { ov.frustumCulled = false; } ov.userData.spawnOverlay = true; ov.castShadow = false; ov.receiveShadow = false; ov.renderOrder = 2; spawnOver.push(ov);
    });
    spawnOver.forEach(function (ov) { ov.userData.host = null; });
    // attach each overlay to the mesh it copies (same order as the traversal above)
    var k = 0;
    player.traverse(function (o) {
      if (!o.isMesh || o.userData.spawnOverlay) return;
      for (var p = o; p; p = p.parent) if (!p.visible) return;
      if (k < spawnOver.length && o.geometry === spawnOver[k].geometry) { o.add(spawnOver[k]); if (o.isSkinnedMesh) spawnOver[k].bind(o.skeleton, o.bindMatrix); k++; }
    });
    for (var i = 0; i < spawnMats.length; i++) { spawnMats[i].m.transparent = true; spawnMats[i].m.opacity = 0; }
    spawnT = 0;
  }
  function updateSpawnFx(dt) {
    if (spawnT < 0) return;
    spawnT += dt;
    if (spawnT >= SPAWN_FX) { endSpawnFx(); return; }
    var f = spawnT / SPAWN_FX, a, r;
    if (f < 0.4) { a = 0; r = 0.95 * smooth01(f / 0.4); }                          // the red silhouette glows up
    else { var u = smooth01((f - 0.4) / 0.6); a = u; r = 0.95 * (1 - u); }         // then she fades in as the red fades out
    for (var i = 0; i < spawnMats.length; i++) spawnMats[i].m.opacity = spawnMats[i].o * a;
    spawnRed.opacity = r;
  }
  function spawnAt(sx, sz, cpNo, msg, face) {
    face = face || 0;
    spawn.x = sx; spawn.z = sz; spawn.cp = cpNo; spawn.yaw = face;
    timeLeft = (cpNo > 0 && cpTime[cpNo] !== undefined) ? cpTime[cpNo] : TIME_LIMIT; shownSec = -1; showTime();   // from a checkpoint the clock goes back to what it read when she reached it
    setBall(false, true); fpOn = false;
    wallOn = false; speed = 0; heading = face; yaw = face; pitch = 0.35; vy = 0; sgx = 0; sgz = 0; grounded = true; turnRate = 0; leanZ = 0; jumpBuf = 0;
    player.position.set(sx, groundH(sx, sz), sz);
    player.rotation.y = face;
    updateChunks(sx, sz, 99);
    builtAtZ = 1e9; builtAtX = 1e9; updateTrees(sx, sz);
    segCount = 0; segTotal = 0; segGot = {}; segValEl.textContent = '0'; setSegLine(0); segBuiltX = 1e9; updateSegs(sx, sz);
    if (level === 3) sbLight(cpNo);
    hp = MAXHP; drawHearts(); breathReset(); fallTop = player.position.y; drownT = 0; styleStacks = 0; styleUntil = 0; confLife = 0; confetti.visible = false;
    cleared = false; clearEl.hidden = true; clearEl.classList.remove('scoring'); clearInterval(scoreTimer); clearTimeout(clearTimer); rpHold = 0; rpReady = false; rpFlash = 0;
    if (typeof mobsReady !== 'undefined' && mobsReady) resetMobs();
    startSpawnFx();
    
  }

  // Dying sends her back to the last checkpoint she reached (or the chosen start if she has reached none).
  function outOfHearts(why) {
    var n = spawn.cp; why = why || 'Out of hearts.';
    spawnAt(spawn.x, spawn.z, n, n ? why + ' Back to checkpoint ' + n + '!' : why + ' Back to the start!', spawn.yaw);
  }

