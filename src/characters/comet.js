  // ---- Comet's moves (the Rig Editor's Comet page sets every number). She has no Strafe and no Barrier. ----
  // Star Throw: Q or E. Needs more than 0 Power and costs 1; a small flat spinning five-pointed star of blue energy flies straight where the camera points, 50 units, for half a heart.
  // Held, it charges (the speedometer's charge bar): each whole second, up to 3, costs 2 Power and adds 50% size, half a heart and 50 units. Out of Power or at 3 seconds it goes by itself. 2 s cooldown.
  // Hover: 2. Costs 6 Power, then 1 a second; she floats half a unit over whatever she would stand on (no mud, toxic ground, pressure plates or hard landings) on Hover's own movement stats.
  // Fly: Space held in the air while hovering: lift against gravity (1 = cancels it) for 4 more Power a second. Arms up, and the star on her back goes up to her hands.
  window.__comet = function () { return { char: CHAR, hov: hovOn, fly: flyOn, power: +segCount.toFixed(2), charging: starCharging, lvl: starLvl, stars: STARS.filter(function (q) { return !q.hitAt; }).map(function (q) { return [+q.r.toFixed(2), +q.dmg.toFixed(2), +q.left.toFixed(1)]; }), cool: starCoolUntil, vy: +vy.toFixed(2), y: +player.position.y.toFixed(2), bodyY: +body.position.y.toFixed(2), grounded: grounded, top: RUN_SPEED / TILE, thr: thrPh, held: !!(heldStar && heldStar.visible), aim: aimEl ? aimEl.style.display !== 'none' : false, aimXY: aimEl ? [aimEl.style.left, aimEl.style.top, aimEl.style.width] : null, segCol: segMesh.material.color.getHexString(), line: (document.getElementById('segline').style.background || '') }; };
  window.__hovFx = function () { var p = player.position; return hovFx ? { flyBlend: +flyBlend.toFixed(2), B: [+(hovFx.B.position.x - p.x).toFixed(2), +(hovFx.B.position.y - p.y).toFixed(2), +(hovFx.B.position.z - p.z).toFixed(2)], L: +(hovFx.L.position.y - p.y).toFixed(2), vis: hovFx.B.visible, rest: !!cometRest && Object.keys(cometRest).length, bone: !!(mollyRoot && mollyRoot.getObjectByName('WristL')) } : null; };
  window.__setChar = function (c) { setChar(c); }; window.__setPower = function (v) { setPower(v); };
  var starCharging = false, starKey = null, starT = 0, starLvl = 0, starCoolUntil = 0, STARS = [];
  var thrPh = 0, thrT = 0, thrW = 0, thrMir = false, thrPend = null, heldStar = null, aimEl = null, cometRestPos = null;   // the throw: 1 charging, 2 swinging (the star leaves her hand part way), 3 follow-through held, 4 easing back
  var hovOn = false, flyOn = false, hovBlend = 0, flyBlend = 0, hovFx = null, cometRest = null;
  function powerDeny() { seglineEl.classList.remove('deny'); void seglineEl.offsetWidth; seglineEl.classList.add('deny'); }
  function cometC(k) { return RIGCFG['comet.' + k]; }
  function starGeo(R) {                                          // a flat five-pointed star, R from its middle to a point
    var sh = new THREE.Shape(), i; for (i = 0; i < 10; i++) { var a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * 0.42 : R; if (i) sh.lineTo(Math.cos(a) * r, Math.sin(a) * r); else sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    var g = new THREE.ExtrudeGeometry(sh, { depth: R * 0.14, bevelEnabled: false }); g.translate(0, 0, -R * 0.07); return g;
  }
  var starGlowTex = null;
  function starMesh(size, cS, cG) {                              // the star and a soft glow round it; .spin is the part that turns
    if (!starGlowTex) { var cv = document.createElement('canvas'); cv.width = cv.height = 64; var g2 = cv.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64); starGlowTex = new THREE.CanvasTexture(cv); }
    var grp = new THREE.Group(), spin = new THREE.Group(); grp.add(spin);
    var m = new THREE.Mesh(starGeo(size / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(cS || cometC('cStar')) })); spin.add(m);
    var gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: starGlowTex, color: new THREE.Color(cG || cometC('cGlow')), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); gl.scale.setScalar(size * 2.2); grp.add(gl);
    grp.spin = spin; grp.glow = gl; return grp;
  }
  window.__cometStar = starMesh;
  function starPress(code) {
    if (!playing || starCharging || fpOn) return;
    if (starCoolUntil > 0) return;                                 // still cooling down (game time: it waits while paused)
    if (segCount <= 0) { powerDeny(); return; }                  // it needs some Power
    setPower(segCount - cometC('star.cost')); starCharging = true; starKey = code; starT = 0; starLvl = 0;
    thrPh = 1; thrT = 0; thrW = 0; thrMir = code === 'KeyQ'; thrPend = null;          // E throws with her right hand, Q with her left
  }
  function starParams(lvl) { return { size: cometC('star.size') * (1 + cometC('star.cSize') * lvl), dmg: cometC('star.dmg') + cometC('star.cDmg') * lvl, range: cometC('star.range') + cometC('star.cRange') * lvl }; }
  function starAimDir() { var ev = Math.max(-1.4, Math.min(1.4, 0.35 - pitch)); return new THREE.Vector3(-Math.sin(yaw) * Math.cos(ev), Math.sin(ev), -Math.cos(yaw) * Math.cos(ev)); }   // where the camera faces; level at the camera's resting tilt (it looks down at her), up or down as the camera tilts from there
  function starRelease() {                                       // let go (or out of Power, or 3 s): the swing starts, and the star leaves her hand part way through it
    if (!starCharging) return; starCharging = false; starKey = null;
    thrPend = starParams(starLvl); thrPh = 2; thrT = 0; thrW = 1;
    starCoolUntil = cometC('star.cool');
  }
  function spawnStar(pos, pr) {
    var d = starAimDir(), nrm = new THREE.Vector3(0, 1, 0).sub(d.clone().multiplyScalar(d.y)); if (nrm.lengthSq() < 1e-4) nrm.set(1, 0, 0); nrm.normalize();   // it flies flat: its face turned up, square to the way it goes
    var g = starMesh(pr.size); g.position.copy(pos);
    g.spin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm); scene.add(g);
    STARS.push({ g: g, d: d, left: pr.range, dmg: pr.dmg, r: pr.size / 2, a: 0, nrm: nrm, hitAt: 0 });
  }
  function starHitTarget(tg, dmg, now) { if (tg.on) return false; tg.hp = (tg.hp === undefined ? 1 : tg.hp) - dmg; if (tg.hp <= 1e-6) sbTargetBreak(tg, now); return true; }
  function setHover(on, quiet) {
    if (on === hovOn) return;
    if (on) { if (!isComet() || ballOn) return; var c = cometC('hov.cost'); if (segCount < c || segCount <= 0) { powerDeny(); return; } setPower(segCount - c); }
    hovOn = on; if (!on) flyOn = false; applyStats();
  }
  function cometInput(dt) {                                      // per step: the charge, the Power that Hover and Fly use, and whether she is flying
    if (!isComet()) { if (hovOn) setHover(false, true); starCharging = false; return; }
    if (playing) starCoolUntil = Math.max(0, starCoolUntil - dt);
    if (thrPh && playing) {                                      // the throw's timeline
      thrT += dt;
      if (thrPh === 1) thrW = Math.min(1, thrT / Math.max(0.01, cometC('throw.in')));
      else if (thrPh === 2 && thrT >= cometC('throw.swing')) { if (thrPend) { spawnStar(new THREE.Vector3(player.position.x, player.position.y + PLAYER_H * 0.62, player.position.z), thrPend); thrPend = null; } thrPh = 3; thrT = 0; }
      else if (thrPh === 3 && thrT >= cometC('throw.hold')) { thrPh = 4; thrT = 0; }
      else if (thrPh === 4) { thrW = 1 - thrT / Math.max(0.01, cometC('throw.out')); if (thrW <= 0) { thrW = 0; thrPh = 0; } }
    }
    if (!playing && thrPh === 1) { thrPh = 0; thrW = 0; }
    if (starCharging) {
      if (!playing) { starCharging = false; }
      else {
        starT += dt;
        var mx = Math.max(0, Math.round(cometC('star.cMax')));
        if (starLvl < mx && starT >= starLvl + 1) { if (segCount >= cometC('star.cCost') && segCount > 0) { setPower(segCount - cometC('star.cCost')); starLvl++; } else starRelease(); }   // can't pay for the next second: it goes
        if (starCharging && starT >= Math.max(mx, 0.0001) && starLvl >= mx) starRelease();
      }
    }
    flyOn = hovOn && playing && !grounded && spaceDown;
    if (hovOn && playing) { setPower(segCount - (cometC('hov.drain') + (flyOn ? cometC('fly.drain') : 0)) * dt); if (segCount <= 0) setHover(false); }
  }
  function cometStars(dt, now) {                                 // thrown stars: fly, spin, and hit a mob, a target or the ground
    for (var i = STARS.length - 1; i >= 0; i--) {
      var st = STARS[i], g = st.g;
      if (st.hitAt) { var f = (now - st.hitAt) / 220; g.glow.scale.setScalar(st.r * 4.4 * (1 + f * 1.5)); g.glow.material.opacity = 0.8 * (1 - f); g.spin.visible = false; if (f >= 1) { scene.remove(g); STARS.splice(i, 1); } continue; }
      st.a += cometC('star.spin') * 2 * Math.PI * dt; g.spin.children[0].rotation.z = st.a;
      var step = Math.min(st.left, cometC('star.speed') * TILE * dt), n = Math.max(1, Math.ceil(step / 0.5)), hit = false;
      for (var k = 1; k <= n && !hit; k++) {
        var x = g.position.x + st.d.x * step * k / n, y = g.position.y + st.d.y * step * k / n, z = g.position.z + st.d.z * step * k / n;
        for (var j = 0; j < MOBS.length && !hit; j++) {
          var e = MOBS[j]; if (e.dead || (e.sbp ? level !== 3 : e.l2 ? level !== 2 : level !== 1) || ((e.ov || e.sbp) && !e.act)) continue;   // the same mobs the game is running
          if (Math.hypot(x - e.x, z - e.z) < e.R + st.r && y > e.fy - st.r && y < e.fy + e.H + st.r) {
            hit = true; e.hearts -= st.dmg; if (e.big) e.restUntil = now + BIG_REST; e.pulse = now; e.flashUntil = now + 1000; if (e.hearts <= 1e-6) killMob(e, now);
          }
        }
        if (!hit && level === 3 && SB && SB.targets) for (j = 0; j < SB.targets.length && !hit; j++) { var tg = SB.targets[j]; if (!tg.on && tg.mv && sbTargetDist(tg, x, y, z).d < st.r) hit = starHitTarget(tg, st.dmg, now); }
        if (!hit && y < groundH(x, z)) hit = true;              // into the ground
        if (hit) g.position.set(x, y, z);
      }
      if (hit) { st.hitAt = now; continue; }
      g.position.addScaledVector(st.d, step); st.left -= step;
      if (st.left <= 1e-6) { st.hitAt = now; }                   // its range used up: it fades out where it is
    }
  }
  function cqVals(pre, mir) { var v = {}; CQ_KEYS.forEach(function (k) { v[k] = RIGCFG[pre + k] || 0; }); return mir ? window.__cometMirror(v) : v; }
  var CQ_UB = ['Spine', 'Head', 'ShoulderL', 'ElbowL', 'ShoulderR', 'ElbowR'], CQ_LEGS = ['HipL', 'KneeL', 'AnkleL', 'HipR', 'KneeR', 'AnkleR'], CQ_ALL = ['Hips', 'Spine', 'Head', 'ShoulderL', 'ElbowL', 'ShoulderR', 'ElbowR', 'HipL', 'KneeL', 'AnkleL', 'HipR', 'KneeR', 'AnkleR', 'Pony1', 'Pony2', 'Pony3'];
  function cqOver(bn, names, v, w, v2, s2) { names.forEach(function (n) { var b = bn.getObjectByName(n); if (!b || !cometRest[n]) return; var q = window.__cometQ(n, v); if (v2) q.slerp(window.__cometQ(n, v2), s2); b.quaternion.slerp(cometRest[n].clone().multiply(q), w); }); }   // this pose instead of the clip's, by w
  function cqAdd(bn, names, v, w) { names.forEach(function (n) { var b = bn.getObjectByName(n); if (!b) return; b.quaternion.multiply(new THREE.Quaternion().slerp(window.__cometQ(n, v), w)); }); }   // these changes on top of the clip's pose, by w
  function hexA(h, a) { var c = new THREE.Color(h); return 'rgba(' + Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255) + ',' + a + ')'; }
  function cometPose(dt) {                                       // her Hover, Fly and throw poses and the stars that go with them
    var com = isComet(), hv = com && hovOn, fl = hv && flyOn, now = performance.now();
    hovBlend += ((hv ? 1 : 0) - hovBlend) * Math.min(1, dt * 10); flyBlend += ((fl ? 1 : 0) - flyBlend) * Math.min(1, dt * cometC('fly.arms'));
    if (hovBlend > 0.001) body.position.y += (cometC('hov.height') + cometC('hov.bob') * Math.sin(now / 1000 * 2 * Math.PI / Math.max(0.1, cometC('hov.bobT')))) * hovBlend;   // she floats over whatever she would be standing on, bobbing gently
    var bn = com && mollyOn && mollyRoot && cometRest ? mollyRoot : null;
    if (bn) {
      if (hovBlend > 0.001) { var hvv = cqVals('comet.ho.'); cqAdd(bn, CQ_ALL, hvv, hovBlend); var hb = bn.getObjectByName('Hips'); if (hb && cometRestPos) { hb.position.y += cometRestPos.y * hvv.hyf * hovBlend; hb.position.z += hvv.hz * hovBlend; } }
      if (flyBlend > 0.001) { cqOver(bn, CQ_UB, cqVals('comet.pf.'), flyBlend); cqAdd(bn, CQ_LEGS, cqVals('comet.fl.'), flyBlend); }
      if (thrPh) { var sw = thrPh === 1 ? 0 : thrPh === 2 ? smooth01(Math.min(1, thrT / Math.max(0.01, cometC('throw.swing')))) : 1; cqOver(bn, CQ_UB, cqVals('comet.pc.', thrMir), thrW, cqVals('comet.pt.', thrMir), sw); }
    }
    if (!hovFx) { hovFx = { L: starMesh(1), R: starMesh(1), B: starMesh(1), a: 0 }; [hovFx.L, hovFx.R, hovFx.B].forEach(function (m) { m.visible = false; scene.add(m); }); heldStar = starMesh(1); heldStar.visible = false; scene.add(heldStar); }
    player.updateMatrixWorld(true);
    var bone = function (n) { var b = bn && bn.getObjectByName(n); return b ? b.getWorldPosition(new THREE.Vector3()) : null; };
    var rot = player.rotation.y, fx = -Math.sin(rot), fz = -Math.cos(rot), pp = player.position, H = PLAYER_H, lift = cometC('hov.height') * hovBlend;
    // the star in her throwing hand, growing with the charge, until it leaves her hand
    var holding = com && (thrPh === 1 || (thrPh === 2 && thrPend));
    heldStar.visible = holding;
    if (holding) {
      var S = thrMir ? 'L' : 'R', wr = bone('Wrist' + S), elb = bone('Elbow' + S), pr = thrPend || starParams(starLvl), hs = pr.size * cometC('hold.scale');
      if (!wr) wr = new THREE.Vector3(pp.x - fx * 0.6 + (thrMir ? -1 : 1) * Math.cos(rot) * 0.5, pp.y + H * 0.7, pp.z - fz * 0.6 - (thrMir ? -1 : 1) * Math.sin(rot) * 0.5);
      var hpos = wr.clone(); if (elb) hpos.add(wr.clone().sub(elb).normalize().multiplyScalar(cometC('hold.out')));
      heldStar.position.copy(hpos); heldStar.scale.setScalar(Math.max(0.01, hs)); heldStar.spin.children[0].material.color.set(cometC('cStar')); heldStar.glow.material.color.set(cometC('cGlow'));
      heldStar.spin.rotation.set(0, rot, now / 1000 * cometC('star.spin') * Math.PI);
      if (thrPh === 2 && thrPend && thrT >= cometC('throw.rel') * cometC('throw.swing')) { spawnStar(hpos, thrPend); thrPend = null; heldStar.visible = false; }   // it leaves her hand part way through the swing
    }
    cometAim(com && starCharging);
    var show = hovBlend > 0.02; hovFx.L.visible = hovFx.R.visible = hovFx.B.visible = show; if (!show) return;
    var sA = cometC('hov.ankle') * hovBlend, sB = cometC('hov.back') * hovBlend * (1 + (cometC('fly.starS') - 1) * flyBlend); hovFx.L.scale.setScalar(Math.max(0.001, sA)); hovFx.R.scale.setScalar(Math.max(0.001, sA)); hovFx.B.scale.setScalar(Math.max(0.001, sB));
    [hovFx.L, hovFx.R, hovFx.B].forEach(function (m) { m.spin.children[0].material.color.set(cometC('cStar')); m.glow.material.color.set(cometC('cGlow')); });
    hovFx.a += cometC('hov.spinS') * 2 * Math.PI * dt;
    var aL = bone('AnkleL'), aR = bone('AnkleR'), sp = bone('Spine'), wL = bone('WristL'), wR = bone('WristR');
    if (!aL) aL = new THREE.Vector3(pp.x - Math.cos(rot) * 0.3, pp.y + lift + 0.3, pp.z + Math.sin(rot) * 0.3);
    if (!aR) aR = new THREE.Vector3(pp.x + Math.cos(rot) * 0.3, pp.y + lift + 0.3, pp.z - Math.sin(rot) * 0.3);
    if (!sp) sp = new THREE.Vector3(pp.x, pp.y + lift + H * 0.62, pp.z);
    var ay = cometC('hov.ankleY'), at = cometC('hov.ankleTilt') * Math.PI / 180;
    hovFx.L.position.set(aL.x, aL.y + ay, aL.z); hovFx.R.position.set(aR.x, aR.y + ay, aR.z);
    [hovFx.L, hovFx.R].forEach(function (m, i) { m.spin.rotation.set(-Math.PI / 2 + at, 0, (i ? -1 : 1) * hovFx.a); });   // flat round her ankles (tilted by the stat), turning
    var bd = cometC('hov.backD'), back = new THREE.Vector3(sp.x - fx * bd, sp.y + cometC('hov.backY'), sp.z - fz * bd);
    var top = wL && wR ? wL.clone().add(wR).multiplyScalar(0.5).add(new THREE.Vector3(0, cometC('fly.starY'), 0)) : new THREE.Vector3(pp.x, pp.y + lift + H + 0.9, pp.z);
    hovFx.B.position.copy(back.lerp(top, flyBlend));
    hovFx.B.spin.rotation.set(cometC('hov.backTilt') * Math.PI / 180, rot, 0); hovFx.B.spin.children[0].rotation.z = hovFx.a * 0.7;   // upright behind her, facing back, turning slowly
  }
  function cometAim(on) {                                        // while she charges a throw: a marker where the star will go (its range at this charge), or where it would hit the ground
    if (!aimEl) {
      aimEl = document.createElement('div'); aimEl.id = 'starAim'; aimEl.setAttribute('aria-hidden', 'true');
      aimEl.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:6;display:none;border-radius:50%;box-sizing:border-box;transform:translate(-50%,-50%)';
      aimEl.innerHTML = '<div style="position:absolute;left:50%;top:-30%;bottom:-30%;width:2px;margin-left:-1px;background:currentColor;opacity:.85"></div><div style="position:absolute;top:50%;left:-30%;right:-30%;height:2px;margin-top:-1px;background:currentColor;opacity:.85"></div>';
      document.body.appendChild(aimEl);
    }
    if (!on || !playing) { aimEl.style.display = 'none'; return; }
    var pr = starParams(starLvl), d = starAimDir(), pp = player.position, x = pp.x, y = pp.y + PLAYER_H * 0.62, z = pp.z, k, n = Math.ceil(pr.range);
    for (k = 1; k <= n; k++) { var f = Math.min(k, pr.range); var nx = pp.x + d.x * f, ny = pp.y + PLAYER_H * 0.62 + d.y * f, nz = pp.z + d.z * f; x = nx; y = ny; z = nz; if (ny < groundH(nx, nz)) break; }
    var v = new THREE.Vector3(x, y, z).project(camera); if (v.z > 1) { aimEl.style.display = 'none'; return; }
    var r = canvas.getBoundingClientRect(), sz = 26 + 10 * starLvl, cs = cometC('cStar');
    aimEl.style.display = ''; aimEl.style.left = (r.left + (v.x + 1) / 2 * r.width) + 'px'; aimEl.style.top = (r.top + (1 - v.y) / 2 * r.height) + 'px';
    aimEl.style.width = aimEl.style.height = sz + 'px'; aimEl.style.color = cs; aimEl.style.border = '2px solid ' + cs; aimEl.style.boxShadow = '0 0 8px 2px ' + hexA(cs, 0.6) + ', inset 0 0 6px ' + hexA(cs, 0.5);
  }
  function setBall(on, quiet) {
    if (on === ballOn) return;
    if (on) {
      if (segCount < BARRIER_COST) { seglineEl.classList.remove('deny'); void seglineEl.offsetWidth; seglineEl.classList.add('deny'); return; }   // not enough power: the Line blinks
      setPower(segCount - BARRIER_COST);
    }
    if (!on && !quiet && playing && Math.abs(speed) >= FP_MIN * TILE) { fpOn = true; fpSpeed = Math.abs(speed); fpHead = heading; shake(0.5); }   // out of the Barrier at speed: she falls on her face
    ballOn = on; ballGroup.visible = on; body.visible = !on;
    PLAYER_RADIUS = on ? 1.6 : 0.5;
    hpEl.classList.toggle('barrier', on);
    hpEl.querySelector('.hlabel').textContent = on ? 'BARRIER' : 'HEALTH';
    
  }
