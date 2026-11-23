  // ---- Mobs: three blocky dark grey husks in the cave's round chamber. Each is Molly's size (3.6 tall), accelerates at 5 Zips/s^2 to at most
  // 10 Zips and chases her whenever she is within 100 units. A touch costs her a heart, unless she is inside the Barrier: then if she
  // is doing 20 Zips or more, or lands on its head at any speed, it falls apart and its pieces vanish 3 seconds later. ----
  var EN_H = 3.6, EN_R = 1, EN_SEE = 100, EN_MAX = 10 * TILE, EN_ACC = 5 * TILE, EN_KILL_SPEED = 20 * TILE, EN_HIT_COOL = 1.2;
  var MOBS = [], mobsReady = false, enHurtUntil = 0, enPrevX = 0, enPrevZ = 0, enPrevOK = false;
  function mnCfg(big, gz) {                                      // the settings in use for one kind: the Rig Editor's, held to values that cannot break anything
    var c = {}, t = gz ? 'gaz' : big ? 'big' : 'min', k, v;
    for (k in MN_DEF) { v = RIGCFG['mn.' + t + '.' + k]; c[k] = v === undefined ? MN_DEF[k][gz ? (MN_DEF[k].length > 2 ? 2 : 0) : big ? 1 : 0] : v; }
    c.gz = !!gz;
    ['scale', 'headW', 'headH', 'headD', 'torsoW', 'torsoH', 'torsoD', 'armW', 'armL', 'legW', 'legD', 'legL'].forEach(function (q) { c[q] = Math.max(0.05, +c[q] || 0.05); });
    ['radius', 'top', 'acc', 'see', 'cool', 'k1', 'k2', 'k3', 'stomp', 'stride', 'bob', 'dmg', 'wing', 'flap', 'orbit', 'range', 'fire', 'bolt', 'bdmg'].forEach(function (q) { c[q] = Math.max(0, +c[q] || 0); });
    c.hearts = Math.max(1, Math.round(+c.hearts || 1)); c.dmg = Math.round(c.dmg);
    return c;
  }
  window.__makeMinion = function (c, g) {                        // a minion's blocks, built into group g (feet at 0, facing -Z, at size 1: the caller scales it): returns its parts for posing. The Rig Editor's preview uses this too
    if (c.gz) return window.__makeGazer(c, g);
    var col = function (h) { return new THREE.Color(/^#[0-9a-f]{6}$/i.test(h) ? h : '#808080'); };
    var mHead = new THREE.MeshLambertMaterial({ color: col(c.cHead), flatShading: true }), mBody = new THREE.MeshLambertMaterial({ color: col(c.cBody), flatShading: true }),
        mLimb = new THREE.MeshLambertMaterial({ color: col(c.cLimb), flatShading: true }), mEye = new THREE.MeshBasicMaterial({ color: col(c.cEye) });
    function limb(w, l, d, mat, x, y) { var p = new THREE.Group(); p.position.set(x, y, 0); var m = new THREE.Mesh(new THREE.BoxGeometry(w, l, d), mat); m.position.y = -l / 2; p.add(m); p.userData.rest = p.position.clone(); p.userData.off = l; return p; }
    var hy = c.legL + c.torsoH + c.headH / 2, head = new THREE.Mesh(new THREE.BoxGeometry(c.headW, c.headH, c.headD), mHead), torso = new THREE.Mesh(new THREE.BoxGeometry(c.torsoW, c.torsoH, c.torsoD), mBody);
    head.position.y = hy; torso.position.y = c.legL + c.torsoH / 2; head.userData.rest = head.position.clone(); head.userData.off = c.headH / 2; torso.userData.rest = torso.position.clone(); torso.userData.off = c.torsoH / 2;
    var ew = c.headW * 0.222, eg = new THREE.BoxGeometry(c.headW * 0.222, c.headH * 0.133, 0.06), e1 = new THREE.Mesh(eg, mEye), e2 = new THREE.Mesh(eg, mEye);
    e1.position.set(-ew, c.headH * 0.089, -c.headD / 2 - 0.01); e2.position.set(ew, c.headH * 0.089, -c.headD / 2 - 0.01); head.add(e1, e2);
    var ay = c.legL + c.torsoH - 0.08, ax = c.torsoW / 2 + c.armW / 2, lx = c.legW / 2 + 0.015;
    var aL = limb(c.armW, c.armL, c.armW, mLimb, -ax, ay), aR = limb(c.armW, c.armL, c.armW, mLimb, ax, ay), lL = limb(c.legW, c.legL, c.legD, mLimb, -lx, c.legL), lR = limb(c.legW, c.legL, c.legD, mLimb, lx, c.legL);
    var body = new THREE.Group(); body.add(head, torso, aL, aR, lL, lR); g.add(body);
    return { body: body, parts: [head, torso, aL, aR, lL, lR], aL: aL, aR: aR, lL: lL, lR: lR, mats: [mHead, mBody, mLimb], H: c.legL + c.torsoH + c.headH };
  };
  window.__makeGazer = function (c, g) {                         // a Roost Gazer: a minion's head with tiny legs, two wings and one big eye (feet at 0, face toward -Z, at size 1)
    var col = function (h) { return new THREE.Color(/^#[0-9a-f]{6}$/i.test(h) ? h : '#808080'); };
    var mHead = new THREE.MeshLambertMaterial({ color: col(c.cHead), flatShading: true }), mLimb = new THREE.MeshLambertMaterial({ color: col(c.cLimb), flatShading: true }),
        mWing = new THREE.MeshLambertMaterial({ color: col(c.cWing), flatShading: true, side: THREE.DoubleSide }), mWhite = new THREE.MeshBasicMaterial({ color: 0xf3efe6 }),
        mIris = new THREE.MeshBasicMaterial({ color: col(c.cEye) }), mPupil = new THREE.MeshBasicMaterial({ color: 0x101010 });
    function limb(w, l, d, mat, x, y) { var q = new THREE.Group(); q.position.set(x, y, 0); var m = new THREE.Mesh(new THREE.BoxGeometry(w, l, d), mat); m.position.y = -l / 2; q.add(m); q.userData.rest = q.position.clone(); q.userData.off = l; return q; }
    var hy = c.legL + c.headH / 2, head = new THREE.Mesh(new THREE.BoxGeometry(c.headW, c.headH, c.headD), mHead);
    head.position.y = hy; head.userData.rest = head.position.clone(); head.userData.off = c.headH / 2;
    var ez = -c.headD / 2 - 0.01, ew = c.headW * 0.62, eh = c.headH * 0.62, ey = c.headH * 0.05;   // one big eye in the middle of the face, with a distinct pupil
    var eye = new THREE.Mesh(new THREE.BoxGeometry(ew, eh, 0.06), mWhite), iris = new THREE.Mesh(new THREE.BoxGeometry(ew * 0.62, eh * 0.62, 0.06), mIris), pupil = new THREE.Mesh(new THREE.BoxGeometry(ew * 0.3, eh * 0.3, 0.06), mPupil);
    eye.position.set(0, ey, ez); iris.position.set(0, ey, ez - 0.03); pupil.position.set(0, ey, ez - 0.06); head.add(eye, iris, pupil);
    var lx = c.legW / 2 + c.headW * 0.18, lL = limb(c.legW, c.legL, c.legD, mLimb, -lx, c.legL), lR = limb(c.legW, c.legL, c.legD, mLimb, lx, c.legL);
    function wing(sg) { var q = new THREE.Group(); q.position.set(sg * c.headW / 2, hy + c.headH * 0.15, 0); var m = new THREE.Mesh(new THREE.BoxGeometry(c.wing, 0.06, c.headD * 0.9), mWing); m.position.x = sg * c.wing / 2; q.add(m); q.userData.rest = q.position.clone(); q.userData.off = 0.2; return q; }
    var wL = wing(-1), wR = wing(1), body = new THREE.Group(); body.add(head, lL, lR, wL, wR); g.add(body);
    return { body: body, parts: [head, lL, lR, wL, wR], aL: wL, aR: wR, lL: lL, lR: lR, wL: wL, wR: wR, mats: [mHead, mLimb, mWing], H: c.legL + c.headH };
  };
  window.__poseGazer = function (m, c, ph) {                     // wings beat (flap per second is a Rig Editor stat: ph runs at 2 pi per beat), tiny legs dangle and swing, the body bobs
    var D = Math.PI / 180, a = 0.35 + 0.55 * Math.sin(ph), sw = Math.sin(ph * 0.5);
    m.wR.rotation.z = a; m.wL.rotation.z = -a; m.lL.rotation.x = sw * c.legSwing * D; m.lR.rotation.x = -sw * c.legSwing * D; m.body.position.y = sw * c.bob;
  };
  window.__poseMinion = function (m, c, phase, k, chase) {       // the walk: legs swing by the leg swing (k: 0 standing to 1 at full stride), arms by the arm swing, raised forward while chasing; the body bobs twice a stride
    var sn = Math.sin(phase) * k, D = Math.PI / 180;
    m.lL.rotation.x = sn * c.legSwing * D; m.lR.rotation.x = -sn * c.legSwing * D;
    m.aL.rotation.x = -(chase ? c.armRaise * D : 0) + sn * c.armSwing * D; m.aR.rotation.x = -(chase ? c.armRaise * D : 0) - sn * c.armSwing * D;
    m.body.position.y = Math.abs(Math.sin(phase)) * k * c.bob;
  };
  function enBuild(e) {                                          // (re)build one minion from the settings for its kind
    e.bits.forEach(function (b) { scene.remove(b.m); }); e.bits = [];
    if (e.model) { e.g.remove(e.model.body); e.model.body.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }
    var c = mnCfg(e.big, e.gz); e.c = c; e.model = window.__makeMinion(c, e.g);
    e.parts = e.model.parts; e.aL = e.model.aL; e.aR = e.model.aR; e.lL = e.model.lL; e.lR = e.model.lR; e.mats = e.model.mats; e.flashK = -1; enFlash(e, 0);
    e.sc = c.scale; e.H = e.model.H * c.scale; e.R = c.radius; e.dmg = c.dmg; e.g.scale.setScalar(e.sc);
    if (e.hearts > c.hearts) e.hearts = c.hearts;
  }
  function enRestyle() { if (!mobsReady) return; MOBS.forEach(function (e) { var dead = e.dead; enBuild(e); if (dead) e.g.visible = false; }); }   // the Rig Editor changed them
  var GZB = [], GZ_GEO = null, GZ_MAT = null;                      // Roost Gazer lasers in flight
  function gzClear() { for (var i = 0; i < GZB.length; i++) scene.remove(GZB[i].m); GZB.length = 0; }
  function laserSolid(x, y, z, shooter) {                        // is the point (x, y, z) inside anything with collision? The ground (ledges, slabs, decks, tunnel floors and roofs, shafts), moving platforms and doors, tilted walls, and every other mob. Sandbox only
    var B = SB, ex = x - L3_X, i;
    if (!B) return y < groundH0(x, z);
    var h = groundH0(x, z);
    if (B.slabH) { var st = sbSlabTop(x, z, y); if (st > h) h = st; }
    if (B.terrain === 'level2') { var dk = sbDeckTop(x, z, y); if (dk > h) h = dk; }
    if (B.caveZone) { var cq = sbCaveQ(B.caveZone, x, z); if (cq && y >= cq.fl - 0.2 && y <= cq.rf + 0.2) h = cq.fl; }   // inside a tunnel the air between its floor and roof is open
    if (B.shafts.length) { var shf = sbShaftIn(x, z, 0); if (shf) h = shf.floor; }
    if (y < h) return true;
    for (i = 0; i < B.movers.length; i++) {
      var m = B.movers[i], ds = sbMovInside(m, ex, z); if (!ds) continue;
      if (m.door) { if (y >= ds.lo && y <= ds.hi) return true; } else if (y >= m.base + m.dy && y <= m.base + m.hgt + m.dy) return true;
    }
    if (B.wallH) { var w = sbWallFind(ex, z, y); if (w && w.d < 0 && w.d > -1 && Math.abs(w.a) <= w.hw + 0.5) return true; }
    for (i = 0; i < MOBS.length; i++) { var q = MOBS[i]; if (q === shooter || q.dead || !q.act || !q.sbp) continue; if (y >= q.fy && y <= q.fy + q.H && Math.hypot(x - q.x, z - q.z) < q.R) return true; }
    return false;
  }
  function gzSight(e) {                                          // a clear line from its eye to her: nothing with collision in between (it holds its fire until there is)
    var pp = player.position, ox = e.x, oy = e.fy + e.H * 0.55, oz = e.z, tx = pp.x, ty = pp.y + (ballOn ? BALL_R : PLAYER_H * 0.5), tz = pp.z;
    var dx = tx - ox, dy = ty - oy, dz = tz - oz, dl = Math.hypot(dx, dy, dz), n = Math.ceil((dl - 0.6) / 0.5);
    for (var k = 1; k <= n; k++) { var f = Math.min(dl - 0.6, k * 0.5) / dl; if (laserSolid(ox + dx * f, oy + dy * f, oz + dz * f, e)) return false; }
    return true;
  }
  function gzFire(e) {                                           // a laser bolt from its eye toward where she is now (it flies at the Rig Editor's Laser speed and does its damage if it reaches her)
    var c = e.c, ox = e.x, oy = e.fy + e.H * 0.55, oz = e.z, pp = player.position, tx = pp.x, ty = pp.y + (ballOn ? BALL_R : PLAYER_H * 0.5), tz = pp.z;
    var dx = tx - ox, dy = ty - oy, dz = tz - oz, dl = Math.hypot(dx, dy, dz) || 1;
    if (!GZ_GEO) { GZ_GEO = new THREE.BoxGeometry(0.22, 0.22, 1.6); GZ_MAT = new THREE.MeshBasicMaterial({ color: 0xff3355 }); }
    var m = new THREE.Mesh(GZ_GEO, GZ_MAT); m.position.set(ox, oy, oz); m.lookAt(tx, ty, tz); scene.add(m);
    GZB.push({ m: m, src: e, x: ox, y: oy, z: oz, vx: dx / dl, vy: dy / dl, vz: dz / dl, sp: Math.max(1, c.bolt) * TILE, left: Math.max(5, c.range) * 1.6, dmg: c.bdmg });
  }
  function gzBolts(dt) {
    if (level !== 3) { if (GZB.length) gzClear(); return; }
    var pp = player.position;
    for (var i = GZB.length - 1; i >= 0; i--) {
      var b = GZB[i], total = b.sp * dt, n = Math.max(1, Math.ceil(total / 0.5)), st = total / n, gone = false;
      for (var k = 0; k < n && !gone; k++) {
        b.x += b.vx * st; b.y += b.vy * st; b.z += b.vz * st; b.left -= st;
        var cy = pp.y + (ballOn ? BALL_R : PLAYER_H * 0.5), rr = (ballOn ? BALL_R : 0.6) + 0.3;
        if (Math.hypot(b.x - pp.x, b.y - cy, b.z - pp.z) < rr) {   // it reaches her: the Barrier takes it, and in Dev Mode's Invulnerable it does nothing
          if (!invulnMode && !ballOn && hp > 0) { hp = Math.max(0, hp - b.dmg); drawHearts(); flashHurt(); shake(0.2); }
          gone = true;
        } else if (b.left <= 0 || laserSolid(b.x, b.y, b.z, b.src)) gone = true;   // anything with collision stops it
      }
      if (gone) { scene.remove(b.m); GZB.splice(i, 1); } else { b.m.position.set(b.x, b.y, b.z); }
    }
  }
  function gzAI(e, dt, now, pp) {                                // chase: buzz round her head (Orbit radius) while she is within its sight; idle: hover still; cycle: a set pattern like a platform's. Every mode shoots within Laser range
    var c = e.c, mode = e.gm || 'chase', hov = e.hgt === undefined ? 6 : e.hgt, ground = e.fy, D = Math.hypot(pp.x - e.x, pp.z - e.z), seen = D < c.see && Math.abs(pp.y - ground) < 80;
    e.phase += dt * c.flap * 6.2832; e.gt = (e.gt || 0) + dt;
    if (e.ay === undefined) e.ay = ground + hov;
    if (mode === 'cycle') {
      var w = Math.sin(2 * Math.PI * (e.gt + (e.gphase || 0)) / Math.max(0.1, e.gper || 4)), half = (e.gdist || 40) / 2, th0 = e.gth || 0, up = 0;
      if (e.gmove === 'forward') { e.x = e.hx + Math.sin(th0) * half * w; e.z = e.hz - Math.cos(th0) * half * w; }
      else if (e.gmove === 'vertical') { e.x = e.hx; e.z = e.hz; up = half * w; }
      else { e.x = e.hx + Math.cos(th0) * half * w; e.z = e.hz + Math.sin(th0) * half * w; }
      e.ay = ground + hov + up; e.vx = e.vz = 0;
    } else if (mode === 'idle') { e.x = e.hx; e.z = e.hz; e.vx = e.vz = 0; e.ay = ground + hov; }
    else {
      var tx = e.hx, tz = e.hz, ty = ground + hov;
      if (seen) { var rad = Math.max(1, c.orbit) + Math.sin(now * 0.003 + e.hx) * 1.5, oa = (e.orb || 0) + now * 0.0011; tx = pp.x + Math.cos(oa) * rad; tz = pp.z + Math.sin(oa) * rad; ty = pp.y + PLAYER_H + 0.8 + Math.sin(now * 0.004 + e.hz) * 0.6; }
      var sx = tx - e.x, sz = tz - e.z, sd = Math.hypot(sx, sz), want = Math.min(c.top * TILE, sd * 4), wx = sd > 1e-4 ? sx / sd * want : 0, wz = sd > 1e-4 ? sz / sd * want : 0;
      var dvx = wx - e.vx, dvz = wz - e.vz, dl = Math.hypot(dvx, dvz), mx = Math.max(0.1, c.acc) * TILE * dt;
      if (dl > mx) { dvx *= mx / dl; dvz *= mx / dl; } e.vx += dvx; e.vz += dvz; e.x += e.vx * dt; e.z += e.vz * dt;
      e.ay += (ty - e.ay) * Math.min(1, dt * 3);
    }
    e.fy = Math.max(e.ay, ground + 0.5);
    if (seen || Math.hypot(e.vx, e.vz) < 0.5) { if (D > 0.001) e.face = Math.atan2(-(pp.x - e.x), -(pp.z - e.z)); } else e.face = Math.atan2(-e.vx, -e.vz);
    var ddy = (pp.y + PLAYER_H * 0.5) - (e.fy + e.H * 0.55);
    if (playing && Math.hypot(pp.x - e.x, ddy, pp.z - e.z) <= c.range) {
      if (!e.nextShot) e.nextShot = now + c.fire * 500;
      if (now >= e.nextShot && gzSight(e)) { gzFire(e); e.nextShot = now + Math.max(0.2, c.fire) * 1000; }
    }
  }
  (function () {
    function make(x, z, fy, l2, sc, gz) {
      var g = new THREE.Group(); scene.add(g);
      var e = { mats: [], flashUntil: 0, flashK: 0, sc: 1, H: EN_H, R: EN_R, big: (sc || 1) > 1, gz: !!gz, hearts: 1, dmg: 1, invUntil: 0, pulse: 0, g: g, parts: [], hx: x, hz: z, x: x, z: z, vx: 0, vz: 0, face: 0, phase: 0, dead: false, deadAt: 0, bits: [], fy: fy, l2: !!l2 };
      enBuild(e); e.hearts = e.c.hearts; return e;
    }
    for (var si = 0; si < 60; si++) { var se = make(1e7, 1e7, 0, true); se.sbp = true; se.act = false; MOBS.push(se); }   // the Sandbox's minions and spawner pool   // the Sink's minions: a pool, woken one a second (at most 20 alive)
    for (var bi = 0; bi < 8; bi++) { var be = make(1e7, 1e7, 0, true, 5); be.sbp = true; be.act = false; MOBS.push(be); }   // the Sandbox's Big Minions
    for (var gi = 0; gi < 8; gi++) { var ge = make(1e7, 1e7, 0, true, 1, true); ge.sbp = true; ge.act = false; MOBS.push(ge); }   // the Sandbox's Roost Gazers
    mobsReady = true;
  })();
  function reviveMob(e, x, z) {
    e.bits.forEach(function (b) { scene.remove(b.m); }); e.bits = [];
    e.dead = false; e.act = true; e.hx = x; e.hz = z; e.x = x; e.z = z; e.vx = e.vz = 0; e.face = 0; e.phase = 0; e.fy = SB && level === 3 ? sbFoot(x, z) : groundH(x, z); e.hearts = e.c.hearts; e.idle = false; e.invUntil = 0; e.restUntil = 0; e.nextShot = 0; e.ay = undefined; e.gt = 0; e.flashUntil = 0; enFlash(e, 0); e.g.scale.setScalar(e.sc);
    e.g.position.set(x, e.fy, z); e.g.rotation.y = 0; e.g.visible = true;
    e.parts.forEach(function (p) { if (p.parent !== e.model.body) e.model.body.add(p); });
    e.parts.forEach(function (p) { p.position.copy(p.userData.rest); }); e.model.body.position.y = 0;
    e.parts.forEach(function (p) { p.rotation.set(0, 0, 0); p.scale.set(1, 1, 1); p.visible = true; });
  }
  function resetMobs() {
    if (!mobsReady) return;
    MOBS.forEach(function (e) {
      e.bits.forEach(function (b) { scene.remove(b.m); });
      e.bits = []; e.dead = false; e.x = e.hx; e.z = e.hz; e.vx = e.vz = 0; e.face = 0; e.phase = 0; e.hearts = e.c.hearts; e.invUntil = 0; e.restUntil = 0; e.nextShot = 0; e.ay = undefined; e.gt = 0; e.flashUntil = 0; enFlash(e, 0); e.g.scale.setScalar(e.sc);
      e.g.position.set(e.x, e.fy, e.z); e.g.rotation.y = 0; e.g.visible = false;
      e.parts.forEach(function (p) { if (p.parent !== e.model.body) e.model.body.add(p); });
      e.parts.forEach(function (p) { p.position.copy(p.userData.rest); }); e.model.body.position.y = 0;
      e.parts.forEach(function (p) { p.rotation.set(0, 0, 0); p.scale.set(1, 1, 1); p.visible = true; });
      if (e.sbp) { e.act = false; e.hx = e.hz = e.x = e.z = 1e7; e.g.visible = false; e.g.position.set(1e7, 0, 1e7); }
    });
    enPrevOK = false; gzClear(); enHurtUntil = 0;
    if (level === 3) sbPlaceMobs();
  }
  resetMobs();
  function killMob(e, now) {
    e.dead = true; e.deadAt = now;
    setPower(segCount + (e.big ? 20 : 5));                   // every minion beaten refills the Power Line by 5, a Big Minion by 20
    var off = e.parts.map(function (p) { return (p.userData.off || 1) * e.sc; });
    e.g.updateMatrixWorld(true);
    e.parts.forEach(function (p, i) {
      scene.attach(p);
      var a = Math.random() * 6.283, v = 6 + Math.random() * 10;
      e.bits.push({ m: p, vx: Math.cos(a) * v + speed * Math.sin(-heading) * 0.15, vy: 8 + Math.random() * 12, vz: Math.sin(a) * v - speed * Math.cos(heading) * 0.15,
        wx: (Math.random() - 0.5) * 12, wz: (Math.random() - 0.5) * 12, off: off[i] });
    });
  }
  function enFlash(e, k) { if (e.flashK === k) return; e.flashK = k; for (var i = 0; i < e.mats.length; i++) e.mats[i].emissive.setRGB(0.95 * k, 0.05 * k, 0.03 * k); }
  var invulnMode = false;   // Dev Mode > Invulnerable: mobs can neither hurt nor push her (she can still hurt them and bounce off a head)
  var BIG_REST = 1500;      // ms after a Big Minion has been damaged before it can hurt her again
  function pushOutOf(ex, ez, dist) {                      // puts her dist from (ex, ez), flat, away from it. On a wall the part of the move across the wall's face is dropped (it would carry her up or down the wall)
    var pp = player.position, bx = pp.x - ex, bz = pp.z - ez, bd = Math.hypot(bx, bz);
    if (bd < 0.001) { bx = -Math.sin(heading); bz = Math.cos(heading); bd = 1; }
    var mx = ex + bx / bd * dist - pp.x, mz = ez + bz / bd * dist - pp.z;
    if (wallOn && level === 3 && SB) { var w = sbWallFind(pp.x - L3_X, pp.z, pp.y); if (w) { var sa = mx * w.lx + mz * w.lz; mx -= sa * w.lx; mz -= sa * w.lz; } }
    pp.x += mx; pp.z += mz;
  }
  function bounceOffBig(e, rs) {                          // thrown back along the ground, not up
    if (invulnMode) return;
    pushOutOf(e.x, e.z, rs + 2); speed *= 0.35; shake(0.5);
  }
  function updateMobs(dt, now) {
    if (!mobsReady) return;
    var pp = player.position, pr = ballOn ? BALL_R : 0.5;
    var ax = enPrevOK ? enPrevX : pp.x, az = enPrevOK ? enPrevZ : pp.z;
    for (var i = 0; i < MOBS.length; i++) {
      var e = MOBS[i];
      if (level !== 3) continue;
      if (!e.act) continue;
      if (e.l2) { if (SB && level === 3) sbPyOv = e.fy + 0.5; e.fy = groundH(e.x, e.z); sbPyOv = undefined; }
      if (e.big || e.gz) enFlash(e, e.dead ? 0 : now < e.flashUntil ? 0.55 + 0.45 * Math.sin(now * 0.025) : 0);
      if (e.dead) {
        var gone = (now - e.deadAt) / 1000;
        for (var k = 0; k < e.bits.length; k++) {
          var b = e.bits[k], m = b.m;
          if (gone >= 3) { m.visible = false; continue; }
          b.vy -= GRAV * dt; m.position.x += b.vx * dt; m.position.y += b.vy * dt; m.position.z += b.vz * dt;
          m.rotation.x += b.wx * dt; m.rotation.z += b.wz * dt;
          if (m.position.y < e.fy + b.off) { m.position.y = e.fy + b.off; b.vy = Math.abs(b.vy) > 4 ? -b.vy * 0.3 : 0; b.vx *= 0.8; b.vz *= 0.8; b.wx *= 0.7; b.wz *= 0.7; }
          var s = (gone > 2.6 ? Math.max(0.01, (3 - gone) / 0.4) : 1) * e.sc; m.scale.set(s, s, s);
        }
        continue;
      }
      if (Math.hypot(pp.x - e.x, pp.z - e.z) > 700) continue;
      // chase
      var dx = pp.x - e.x, dz = pp.z - e.z, d = Math.hypot(dx, dz), chase = d < e.c.see && Math.abs(pp.y - e.fy) < 40, EACC = e.c.acc * TILE, EMAX = e.c.top * TILE;
      var spd = Math.hypot(e.vx, e.vz);
      if (e.gz) gzAI(e, dt, now, pp); else {
      if (e.idle) { if (chase && d > 0.001) e.face = Math.atan2(-dx, -dz); e.vx = e.vz = 0; }   // idle: it stands its ground and only turns to face her
      else if (chase && d > 0.001) {
        var ux = dx / d, uz = dz / d, sp0 = Math.hypot(e.vx, e.vz);
        if (sp0 > 0.5) {                                     // steering: sideways drift bleeds off, and if it is heading well away from her (more than about 35 degrees) it eases off the speed until it has turned
          var par = e.vx * ux + e.vz * uz, kk = Math.max(0, 1 - 3 * dt);
          e.vx = par * ux + (e.vx - par * ux) * kk; e.vz = par * uz + (e.vz - par * uz) * kk;
          if (par / sp0 < 0.82) { var sp1 = Math.hypot(e.vx, e.vz), ns1 = Math.max(0, sp1 - 3 * EACC * dt); if (sp1 > 1e-6) { e.vx *= ns1 / sp1; e.vz *= ns1 / sp1; } }
        }
        e.vx += dx / d * EACC * dt; e.vz += dz / d * EACC * dt;
        e.face = Math.atan2(-dx, -dz);
      } else if (spd > 0) {
        var ns = Math.max(0, spd - EACC * dt); e.vx *= ns / spd; e.vz *= ns / spd;
      }
      spd = Math.hypot(e.vx, e.vz);
      if (spd > EMAX) { e.vx *= EMAX / spd; e.vz *= EMAX / spd; spd = EMAX; }
      var ex0 = e.x, ez0 = e.z;
      e.x += e.vx * dt; e.z += e.vz * dt;
      if (e.l2 && (e.vx || e.vz)) { var gnn = groundH(e.x, e.z), mvd = Math.hypot(e.x - ex0, e.z - ez0); if (gnn - e.fy > 0.3 + mvd * 0.9) { e.x = ex0; e.z = ez0; e.vx = e.vz = 0; } }   // they cannot climb a wall or a ledge: ground rising faster than about 42 degrees stops them   // the runway's edge: they never leave it
      // keep each other apart
      for (var j = 0; j < MOBS.length; j++) {
        if (j === i || MOBS[j].dead || MOBS[j].gz || !MOBS[j].act) continue;
        var ox = e.x - MOBS[j].x, oz = e.z - MOBS[j].z, od = Math.hypot(ox, oz);
        var mr = e.R + MOBS[j].R + 0.3;
        if (!e.idle && od < mr && od > 0.0001) { var pu = (mr - od) / 2; e.x += ox / od * pu; e.z += oz / od * pu; }
      }
      }
      // Molly: closest approach this frame (she can cover 8 units a frame), then the touch rules
      var sx = pp.x - ax, sz = pp.z - az, sl = sx * sx + sz * sz, tt = sl > 1e-6 ? Math.max(0, Math.min(1, ((e.x - ax) * sx + (e.z - az) * sz) / sl)) : 1;
      var qx = ax + sx * tt, qz = az + sz * tt, hd = Math.hypot(qx - e.x, qz - e.z), rs = pr + e.R;
      var vOver = pp.y < e.fy + e.H - 0.01 && pp.y + (ballOn ? 2 * BALL_R : PLAYER_H) > e.fy;
      var hq = e.c.headH * e.sc * 0.25, hR = pr + Math.max(e.c.headW, e.c.headD) * e.sc / 2;   // the top quarter of its head: only landing there counts as a stomp
      var onHeadZone = pp.y >= e.fy + e.H - hq - 0.05 && pp.y < e.fy + e.H + 2.5 && vy <= 0 && Math.hypot(pp.x - e.x, pp.z - e.z) < hR, onHead = ballOn && onHeadZone;
      var asp = Math.abs(speed) / TILE, hits = (e.c.k3 > 0 && asp >= e.c.k3) ? 3 : (e.c.k2 > 0 && asp >= e.c.k2) ? 2 : (e.c.k1 > 0 && asp >= e.c.k1) ? 1 : 0;   // the Barrier's speed sets the damage: 1, 2 or 3 hearts at its three speeds (0 = never)
      if (ballOn && ((hd < rs && vOver && hits > 0) || onHead)) {
        if (now > e.invUntil) {
          var dealt = onHead ? 1 : hits; e.invUntil = now + 700; if (e.big) e.restUntil = now + BIG_REST; e.hearts -= dealt; e.pulse = now;
          if (onHead) { vy = Math.max(vy, e.c.stomp * TILE); grounded = false; }   // a stomp: a bounce off its head, even when that kills it
          if (e.hearts <= 0) { killMob(e, now); continue; }
          e.flashUntil = now + 1000;
          if (!onHead) bounceOffBig(e, rs);                  // hit from the side and still standing: it throws her back like any solid thing
        }
      } else if (!ballOn && onHeadZone && now > e.invUntil) { e.invUntil = now + 400; vy = Math.max(vy, e.c.stomp * TILE); grounded = false; }   // landing on its head without the Barrier: the same bounce, no damage

      else if (e.big && ballOn && !invulnMode && ((hd < rs && vOver) || onHeadZone) && now > (e.zapUntil || 0)) {   // the Barrier touches a Big Minion (side or head) without damaging it: the Barrier loses 20 segs and she is thrown back
        e.zapUntil = now + 1000; setPower(segCount - 20); bounceOffBig(e, rs);
      }
      var cd2 = Math.hypot(pp.x - e.x, pp.z - e.z);
      if (!invulnMode && cd2 < rs && vOver) {
        pushOutOf(e.x, e.z, rs);
        if (!ballOn && !e.gz && now > enHurtUntil && hp > 0 && pp.y < e.fy + e.H - e.c.headH * e.sc && now >= (e.restUntil || 0)) {   // its head is harmless to touch, and a Big Minion that has just been damaged gets BIG_REST before it can hit her
          enHurtUntil = now + e.c.cool * 1000; hp = Math.max(0, hp - e.dmg); drawHearts(); flashHurt();
          
        }
      }
      // pose
      if (e.gz) window.__poseGazer(e.model, e.c, e.phase);
      else { e.phase += spd * dt * e.c.stride; window.__poseMinion(e.model, e.c, e.phase, Math.min(1, spd / 12), chase); }
      e.g.position.set(e.x, e.fy, e.z); e.g.rotation.y = e.face;
      if (e.big) e.g.scale.setScalar(e.sc * (1 + 0.07 * Math.max(0, 1 - (now - e.pulse) / 300)));
    }
    gzBolts(dt);
    enPrevX = pp.x; enPrevZ = pp.z; enPrevOK = true;
  }

