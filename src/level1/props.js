  // ---- Signs: a wooden post and board (the Sandbox's sign stamps) ----
  function buildSign(SIGN_X, SIGN_Y, SIGN_Z, ry, heart) {                         // ry: 0 faces +X (down the ramp in Grass Canyon), PI faces -X
    var cv = document.createElement('canvas'); cv.width = cv.height = 256;
    var g = cv.getContext('2d');
    g.fillStyle = '#a97a4c'; g.fillRect(0, 0, 256, 256);                              // planks
    for (var pk = 0; pk < 4; pk++) {
      g.fillStyle = pk % 2 ? '#a07146' : '#b3825322'; g.fillRect(0, pk * 64, 256, 64);
      g.fillStyle = '#5c3a20'; g.fillRect(0, pk * 64, 256, 2);
      g.strokeStyle = 'rgba(80, 50, 25, 0.35)'; g.lineWidth = 1.5;
      for (var gr = 0; gr < 3; gr++) { g.beginPath(); g.moveTo(0, pk * 64 + 14 + gr * 17); g.bezierCurveTo(80, pk * 64 + 8 + gr * 17, 170, pk * 64 + 22 + gr * 17, 256, pk * 64 + 12 + gr * 17); g.stroke(); }
    }
    g.strokeStyle = '#5c3a20'; g.lineWidth = 10; g.strokeRect(5, 5, 246, 246);        // frame
    g.strokeStyle = '#ffc928'; g.lineWidth = 15; g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.stroke();   // yellow circle
    g.fillStyle = '#ffc928';
    if (heart) {                                                                       // a red heart in place of the exclamation mark
      g.fillStyle = '#e0202a'; g.beginPath(); g.moveTo(128, 196);
      g.bezierCurveTo(52, 140, 56, 74, 100, 74); g.bezierCurveTo(116, 74, 124, 84, 128, 96);
      g.bezierCurveTo(132, 84, 140, 74, 156, 74); g.bezierCurveTo(200, 74, 204, 140, 128, 196); g.closePath(); g.fill();
    } else {
    g.beginPath(); g.moveTo(102, 50); g.lineTo(154, 50); g.lineTo(144, 150); g.lineTo(112, 150); g.closePath(); g.fill();   // the bar
    g.beginPath(); g.arc(128, 184, 17, 0, Math.PI * 2); g.fill();                    // the dot
    }
    var tex = new THREE.CanvasTexture(cv);
    var wood = new THREE.MeshLambertMaterial({ color: 0x8a5a33 });
    var face = new THREE.MeshLambertMaterial({ map: tex });
    var board = new THREE.Mesh(new THREE.BoxGeometry(0.7, 8, 8), [face, wood, wood, wood, wood, wood]);   // +x is the painted face, toward the ramp
    board.position.set(SIGN_X, SIGN_Y + 8, SIGN_Z); board.castShadow = true;
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4, 0.9), new THREE.MeshLambertMaterial({ color: 0x6b4426 }));   // stops at the bottom edge of the board
    post.position.set(SIGN_X, SIGN_Y + 2.0, SIGN_Z); post.castShadow = true;
    board.rotation.y = ry;
    scene.add(post); scene.add(board);
    return [post, board];
  }
  // ---- Toxic patches: square bubbles rise off the Sandbox's toxic ground, and touching it costs a heart ----
  var TOX_H = 8, toxUntil = 0;
  function l2PointAt(sg) {                                  // [x, z, heading x, heading z] on the runway's centre line, a distance sg along it
    for (var i = L2_PIECES.length - 1; i >= 0; i--) {
      var p = L2_PIECES[i]; if (sg < p.s0 && i > 0) continue;
      var ps = Math.max(0, Math.min(p.len, sg - p.s0));
      if (p.t === 's') return [p.x0 + p.hx * ps, p.z0 + p.hz * ps, p.hx, p.hz];
      var f = p.sig * p.th * ps / p.len, c = Math.cos(f), sn = Math.sin(f);
      return [p.cx + p.ux * c + p.uz * sn, p.cz - p.ux * sn + p.uz * c, p.sig * (-p.ux * sn + p.uz * c) / p.R, p.sig * (-p.ux * c - p.uz * sn) / p.R];
    }
    return [0, 0, 0, -1];
  }
  var toxDummy = new THREE.Object3D(), toxT = 0;
  var sbBub = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x8f9a8f, transparent: true, opacity: 0.55, depthWrite: false }), 900);
  sbBub.frustumCulled = false; sbBub.count = 0; scene.add(sbBub);
  var SB_BUB_CAP = 500;                                       // most Sandbox bubbles drawn in one frame (was 800)
  function sbBubKeep(d) { return d <= 60 ? 1 : d >= 150 ? 0.25 : 1 - 0.75 * (d - 60) / 90; }   // farther from her, fewer bubbles: all of them within 60 units, a quarter past 150
  function sbToxBubbles(pp) {                                // the Sandbox: square bubbles rise off toxic patches and toxic terrain patches, as they do off the poisoned strips of the real level
    var B = SB, n = 0, ex = pp.x - L3_X, i, k, a, b, CAP = SB_BUB_CAP;
    if (!B || level !== 3 || !playing) { sbBub.count = 0; return; }
    function put(wx, wy, wz, sz, r1, r2) { toxDummy.position.set(wx, wy, wz); toxDummy.rotation.set(toxT * 0.7 + r1 * 6, toxT + r2 * 6, 0); toxDummy.scale.set(sz, sz, sz); toxDummy.updateMatrix(); sbBub.setMatrixAt(n++, toxDummy.matrix); }
    function far(bx, bz, r) { return r > sbBubKeep(Math.hypot(bx - ex, bz - pp.z)); }   // r: the bubble's own fixed random number, so the same ones stay hidden
    for (i = 0; i < B.toxic.length && n < CAP; i++) {
      var t = B.toxic[i]; if (Math.abs(t.x - ex) > t.rr + 150 || Math.abs(t.z - pp.z) > t.rr + 150) continue;
      if (!t.bub) {                                            // where its bubbles sit never changes: worked out once (ground height included), 8 numbers a bubble
        var cnt = Math.max(2, Math.min(23, Math.round(t.hw * t.hd * 4 * 0.03))); t.bub = [];   // a quarter of the old count (0.12 a square unit, 6 to 90)
        for (k = 0; k < cnt; k++) {
          var r1 = rand01(i, k, 161), r2 = rand01(i, k, 162), r3 = rand01(i, k, 163), lx = (r1 * 2 - 1) * t.hw, lz = (rand01(i, k, 164) * 2 - 1) * t.hd;
          var bx = t.x + lx * Math.cos(t.th) - lz * Math.sin(t.th), bz = t.z + lx * Math.sin(t.th) + lz * Math.cos(t.th);
          t.bub.push(L3_X + bx, (t.T !== undefined ? t.T : sbFoot(L3_X + bx, bz) + t.y) + 0.4, bz, 0.35 + 0.3 * r3, r2, 0.3 + 0.55 * rand01(i, k, 165), r1, rand01(i, k, 166));
        }
      }
      for (k = 0; k < t.bub.length && n < CAP; k += 8) {
        var tb = t.bub; if (far(tb[k] - L3_X, tb[k + 2], tb[k + 7])) continue;
        var life = (toxT * tb[k + 3] + tb[k + 4]) % 1;
        put(tb[k], tb[k + 1] + life * TOX_H, tb[k + 2], tb[k + 5] * Math.sin(Math.PI * life), tb[k + 6], tb[k + 4]);
      }
    }
    for (i = 0; i < B.toxLedgePts.length && n < CAP; i++) {      // toxic ledge tops: a few bubbles along each one near her
      var tq = B.toxLedgePts[i]; if (Math.abs(tq.x - ex) > 150 || Math.abs(tq.z - pp.z) > 150) continue;
      if (!tq.bub) {                                           // worked out once, ground height included: 8 numbers a bubble
        tq.bub = [];
        for (k = 0; k < 3; k++) {
          var tr1 = rand01(i, k, 181), tl = (tr1 * 2 - 1) * tq.half * 0.8, ta = (rand01(i, k, 184) * 2 - 1) * 2;
          var tbx = tq.x + Math.cos(tq.th) * tl + Math.sin(tq.th) * ta, tbz = tq.z + Math.sin(tq.th) * tl - Math.cos(tq.th) * ta;
          tq.bub.push(tbx, groundH(L3_X + tbx, tbz) + 0.4, tbz, 0.35 + 0.3 * rand01(i, k, 182), rand01(i, k, 183), 0.3 + 0.55 * rand01(i, k, 185), tr1, rand01(i, k, 186));
        }
      }
      for (k = 0; k < 24; k += 8) {
        var qb = tq.bub, tlife = (toxT * qb[k + 3] + qb[k + 4]) % 1;
        put(L3_X + qb[k], qb[k + 1] + tlife * TOX_H, qb[k + 2], qb[k + 5] * Math.sin(Math.PI * tlife), qb[k + 6], qb[k + 7]);
      }
    }
    for (i = 0; i < B.movers.length && n < CAP; i++) {          // toxic platforms: bubbles off the top, moving with it
      var tm = B.movers[i]; if (tm.door || !tm.o || !tm.o.tox || ex < tm.minx - 150 || ex > tm.maxx + 150 || pp.z < tm.minz - 150 || pp.z > tm.maxz + 150) continue;
      var tcnt = Math.min(60, Math.max(4, Math.round(tm.pts.length * 1.5)));
      for (k = 0; k < tcnt && n < CAP; k++) {
        var tpq = tm.pts[Math.floor(rand01(i, k, 191) * tm.pts.length)], tside = (rand01(i, k, 192) * 2 - 1) * tm.half * 0.85, tlf = (toxT * (0.35 + 0.3 * rand01(i, k, 193)) + rand01(i, k, 194)) % 1;
        put(L3_X + tpq[0] + Math.cos(tpq[2]) * tside + tm.off[0], tm.base + tm.hgt + tm.dy + 0.4 + tlf * TOX_H, tpq[1] + Math.sin(tpq[2]) * tside + tm.off[1], (0.3 + 0.55 * rand01(i, k, 195)) * Math.sin(Math.PI * tlf), rand01(i, k, 196), rand01(i, k, 197));
      }
    }
    var nearTox = B.terrain === 'level2';                     // poisoned ground: Oceana's own low ground, and toxic terrain patches
    for (i = 0; i < B.patches.length && !nearTox; i++) { var pa = B.patches[i]; if (pa.ground === 'toxic' && Math.abs(pa.x - ex) <= pa.rr + 100 && Math.abs(pa.z - pp.z) <= pa.rr + 100) nearTox = true; }
    if (nearTox && n < CAP) {                                  // poisoned ground near her, up to 84 units off, in 6-unit cells: a bubble in every cell of a toxic terrain patch (about as thick as a toxic patch's), and in 1 of 5 on Oceana's own ground (about as thick as the Sink's were)
      var CS = 6, ca = Math.floor(ex / CS), cb = Math.floor(pp.z / CS);
      if (!B.toxCells) B.toxCells = new Map();                 // each cell's bubble: worked out once (ground height included); null if the ground there is not poisoned
      for (a = ca - 14; a <= ca + 14 && n < CAP; a++) for (b = cb - 14; b <= cb + 14 && n < CAP; b++) {
        var key = a * 1000003 + b, cq = B.toxCells.get(key);
        if (cq === undefined) {
          var wx = (a + rand01(a, b, 172)) * CS, wz = (b + rand01(a, b, 173)) * CS, gy = level3H(L3_X + wx, wz);   // level3H marks poisoned ground as kind 3, the same test that hurts her
          cq = null;
          if (wL2 === 3 && sbDeckTop(L3_X + wx, wz, null) < gy - 1) {   // (none under a path deck)
            var inPa = false;
            for (var pi = 0; pi < B.patches.length && !inPa; pi++) { var pq = B.patches[pi]; if (pq.ground !== 'toxic') continue; var qc = Math.cos(-pq.th), qs = Math.sin(-pq.th), qx = (wx - pq.x) * qc - (wz - pq.z) * qs, qz = (wx - pq.x) * qs + (wz - pq.z) * qc; inPa = pq.shape === 'rect' ? Math.abs(qx) < pq.hw && Math.abs(qz) < pq.hd : Math.hypot(qx / pq.hw, qz / pq.hd) < 1; }
            if (inPa || rand01(a, b, 171) < 0.2) cq = [wx, gy + 0.4, wz];
          }
          B.toxCells.set(key, cq);
        }
        if (!cq || far(cq[0], cq[2], rand01(a, b, 179))) continue;
        var lf = (toxT * (0.35 + 0.3 * rand01(a, b, 174)) + rand01(a, b, 175)) % 1;
        put(L3_X + cq[0], cq[1] + lf * TOX_H, cq[2], (0.3 + 0.55 * rand01(a, b, 176)) * Math.sin(Math.PI * lf), rand01(a, b, 177), rand01(a, b, 178));
      }
    }
    sbBub.count = n; sbBub.instanceMatrix.needsUpdate = true;
  }
  function updateToxic(dt, now) {
    toxT += dt;
    if (level === 3) sbTick(dt, now);
    sbToxBubbles(player.position);
  }

  // ---- Segs: the Sandbox's stamped tokens; collected ones stay gone until the level resets ----
  var SEG_MAX = 900, SEG_RADIUS = 3.4;
  // Each Seg is a short, bright red line segment that hovers and slowly turns about the vertical, with a soft additive halo round it.
  var segMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, 0.18, 0.18),
    new THREE.MeshBasicMaterial({ color: 0xff2a1f }), SEG_MAX);
  var segGlow = new THREE.InstancedMesh(new THREE.BoxGeometry(2.8, 0.55, 0.55),
    new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }), SEG_MAX);
  segMesh.frustumCulled = false; segMesh.count = 0; scene.add(segMesh);
  segGlow.frustumCulled = false; segGlow.count = 0; scene.add(segGlow);
  applyCharColors();
  var segX = [], segY = [], segZ = [], segId = [], segAlive = [];
  var segGot = {}, segCount = 0, segTotal = 0, segBuiltX = 1e9, segBuiltZ = 1e9;
  var sm4 = new THREE.Matrix4(), sq = new THREE.Quaternion(), sp3 = new THREE.Vector3(), ss3 = new THREE.Vector3(1, 1, 1), ss5 = new THREE.Vector3(5, 5, 5), sUp = new THREE.Vector3(0, 1, 0);
  function updateSegs(px, pz) {
    if (Math.abs(px - segBuiltX) < 80 && Math.abs(pz - segBuiltZ) < 80) return;
    segBuiltX = px; segBuiltZ = pz;
    segX.length = 0; segY.length = 0; segZ.length = 0; segId.length = 0; segAlive.length = 0;
    var R = VIEW_AHEAD + 120;
    if (level === 3 && SB) for (var bk = 0; bk < SB.segs.length; bk++) {                  // the Sandbox's stamped Segs
      var bs = SB.segs[bk], bid = (bs.big ? 'big,sb' : 'sb,') + bk, bdx = L3_X + bs.x - px, bdz = bs.z - pz;
      if (bdx * bdx + bdz * bdz < R * R && !segGot[bid] && segX.length < SEG_MAX) { segX.push(L3_X + bs.x); segY.push(bs.T !== undefined ? bs.T : sbFoot(L3_X + bs.x, bs.z) + (bs.big ? 2.5 : 1.7) + Math.max(-1, bs.h || 0)); segZ.push(bs.z); segId.push(bid); segAlive.push(true); }
    }
  }
  // Spin the tokens and pick up any that she passed through since the last frame (checked along her path, so top speed can't skip one).
  function tickSegs(now, x0, z0, x1, z1, py) {
    var n = 0, spin = now * 0.0012, ex = x1 - x0, ez = z1 - z0, len2 = ex * ex + ez * ez;
    for (var i = 0; i < segX.length; i++) {
      if (!segAlive[i]) continue;
      if (playing) {
        var t = len2 > 1e-6 ? ((segX[i] - x0) * ex + (segZ[i] - z0) * ez) / len2 : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        var dx = segX[i] - (x0 + ex * t), dz = segZ[i] - (z0 + ez * t), dy = segY[i] - py;
        var bigS = segId[i].charAt(0) === 'b' && segId[i].indexOf('big,') === 0, rr = bigS ? SEG_RADIUS * 5 : SEG_RADIUS;
        if (dx * dx + dz * dz < rr * rr && dy > (bigS ? -14 : -2.6) && dy < (bigS ? 30 : 6.5)) {
          segAlive[i] = false; segGot[segId[i]] = true; setPower(segCount + styleMult() * (bigS ? 10 : 1)); addSegs(bigS ? 10 : 1);
          segsEl.classList.remove('bump'); void segsEl.offsetWidth; segsEl.classList.add('bump');
          continue;
        }
      }
      sp3.set(segX[i], segY[i] + 0.25 * Math.sin(now * 0.004 + i), segZ[i]);
      sq.setFromAxisAngle(sUp, spin + i * 0.7);
      sm4.compose(sp3, sq, segId[i].indexOf('big,') === 0 ? ss5 : ss3);
      segMesh.setMatrixAt(n, sm4); segGlow.setMatrixAt(n++, sm4);
    }
    segMesh.count = n; segGlow.count = n;
    segMesh.instanceMatrix.needsUpdate = true; segGlow.instanceMatrix.needsUpdate = true;
  }
  updateSegs(0, 0);

