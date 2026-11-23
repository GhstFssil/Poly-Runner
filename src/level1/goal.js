  // ---- Stone edges: a low row of rough blocks along the plateau's cliff edges (where the invisible barrier already is) and along the lips of the second valley ----
  (function () {
    var pts = [];                                              // [x, z, angle] for each block
    function lineBlocks(poly, top, hidden) {                          // top: one rim height for the whole line, or an array with one per point                          // poly: [[x, z], ...]; blocks every 3.6 units along it
      for (var i = 0; i + 1 < poly.length; i++) {
        var ax = poly[i][0], az = poly[i][1], bx = poly[i + 1][0], bz = poly[i + 1][1], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 3.6)), an = Math.atan2(bz - az, bx - ax);
        if (!hidden) for (var k = 0; k < n; k++) pts.push([ax + (bx - ax) * (k + 0.5) / n, az + (bz - az) * (k + 0.5) / n, an, L / n, 1]);   // the fifth number marks the second valley's lips: tall and jagged
        lipSeg.push(ax, az, bx, bz, top === undefined ? 1e9 : (typeof top === 'number' ? top : top[i]), 0);
      }
    }
    // the plateau: wherever the barrier contour (3 units in from the edge) runs, except the open east side
    var GS = 5, gx0 = PX0 - 20, gz0 = ARC_CZ - 140, gw = Math.ceil((HALF - gx0 + 20) / GS), gh = Math.ceil((PZ1 + 140 - gz0) / GS), G = [];
    function gv(x, z) { plateauOut(x, z); return Math.min(Math.max(pdN, pdE, pdF, pdS, pdW), pdH) + 3; }
    for (var gj = 0; gj <= gh; gj++) { var row = []; for (var gi = 0; gi <= gw; gi++) row.push(gv(gx0 + gi * GS, gz0 + gj * GS)); G.push(row); }
    var plat = [];
    function addCross(xa, za, va, xb, zb, vb) {
      if ((va < 0) === (vb < 0)) return;
      var t = va / (va - vb), x = xa + (xb - xa) * t, z = za + (zb - za) * t;
      plateauOut(x, z);
      if (pdE >= pdN && pdE >= pdF && !(pdH < pdE)) return;           // the east rim has no barrier
      if (pdF >= pdN && pdF >= pdE && pdF >= pdW && !(pdH < pdF)) return;   // nor has the south edge
      if (x < PX0 - 0.5 || x > HALF || valley2(x, z) !== null) return;
      var e = 1.5, gX = gv(x + e, z) - gv(x - e, z), gZ = gv(x, z + e) - gv(x, z - e);
      plat.push([x, z, Math.atan2(gX, -gZ) , 3.6]);
    }
    for (var j2 = 0; j2 <= gh; j2++) for (var i2 = 0; i2 <= gw; i2++) {
      var xa = gx0 + i2 * GS, za = gz0 + j2 * GS;
      if (i2 < gw) addCross(xa, za, G[j2][i2], xa + GS, za, G[j2][i2 + 1]);
      if (j2 < gh) addCross(xa, za, G[j2][i2], xa, za + GS, G[j2 + 1][i2]);
    }
    if (PLATEAU_BARRIER) for (var pi = 0; pi < plat.length; pi++) pts.push(plat[pi]);
    // the second valley: both lips along the whole winding run, a cap round its closed north end, and closing lines across the two mouths
    // the platform's west strip leaves open (the platform's own west edge is where she is meant to jump down)
    var W = V2_WO + 1.2, east = [], west = [], eastTop = [], westTop = [];
    for (var sv = 0; sv <= V2_LEN + 0.01; sv += 7) {
      var q = piecePoint(V2_PIECES, Math.min(sv, V2_LEN)), nx = -q[3], nz = q[2];
      var tp = v2Floor(Math.min(sv, V2_LEN)) + 100;
      west.push([q[0] + nx * W, q[1] + nz * W]); east.push([q[0] - nx * W, q[1] - nz * W]); westTop.push(tp); eastTop.push(tp);
    }
    var eastOpen = [], eastOpenTop = [];
    for (var ei = 0; ei < east.length; ei++) if (east[ei][1] >= -7412.5) { eastOpen.push(east[ei]); eastOpenTop.push(eastTop[ei]); }
    var capPts = [], c0x = -4405, c0z = -7612.5;
    for (var ca = 0; ca <= 12; ca++) { var an2 = Math.PI + Math.PI * ca / 12; capPts.push([c0x + Math.cos(an2) * W, c0z + Math.sin(an2) * W]); }   // from the west lip round the north to the east
    var mouthN = [[c0x + W, c0z], [-4295, c0z]], mouthS = [[eastOpen[0][0], -7412.5], [-4295, -7412.5]];
    var rimTop = v2Floor(0) + 100;
    lineBlocks(west, westTop, true); lineBlocks(eastOpen, eastOpenTop, true); lineBlocks(capPts, rimTop, true); lineBlocks(mouthN, rimTop, true); lineBlocks(mouthS, rimTop, true);   // just the invisible wall along the rims now: the jagged rock tops are the visible edge
    // build the blocks: rough grey boxes, a little different in height and tint each
    var N = pts.length, geo = new THREE.CylinderGeometry(0.3, 1, 1, 5, 1), mat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    var im = new THREE.InstancedMesh(geo, mat, N), m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), qt = new THREE.Quaternion(), ps = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color(), up = new THREE.Vector3(0, 1, 0), ex = new THREE.Vector3(1, 0, 0), ez = new THREE.Vector3(0, 0, 1);
    for (var b = 0; b < N; b++) {
      var P = pts[b], tall = false;   // (the tall crags were tried on the second valley's rims and dropped)
      // the second valley's lips: tall, tapering crags of every height, leaning this way and that, so the rims cannot be run along; the plateau's edge stays a lower row of spikes
      var h = tall ? 8 + rand01(b, 7, 41) * 15 : 2.2 + rand01(b, 7, 41) * 2.4, wdt = tall ? 2.2 + rand01(b, 9, 43) * 1.6 : 1.4 + rand01(b, 9, 43) * 0.7, gy = groundH(P[0], P[1]);
      qq.setFromAxisAngle(up, -P[2] + (rand01(b, 5, 47) - 0.5) * 0.7);
      if (tall) { qt.setFromAxisAngle(ex, (rand01(b, 13, 59) - 0.5) * 0.35); qq.multiply(qt); qt.setFromAxisAngle(ez, (rand01(b, 17, 61) - 0.5) * 0.35); qq.multiply(qt); }
      ps.set(P[0] + (tall ? (rand01(b, 19, 67) - 0.5) * 1.6 : 0), gy + h / 2 - (tall ? 1.2 : 0.2), P[1] + (tall ? (rand01(b, 23, 71) - 0.5) * 1.6 : 0)); sc.set(P[3] * (tall ? 0.95 : 0.75) * (0.8 + rand01(b, 29, 73) * 0.5), h, wdt);
      m4.compose(ps, qq, sc); im.setMatrixAt(b, m4);
      col.setHex(STONE[b % STONE.length]); col.offsetHSL(0, 0, (rand01(b, 11, 53) - 0.5) * 0.1); im.setColorAt(b, col);
    }
    im.frustumCulled = false; im.castShadow = false; scene.add(im);
  })();

  // Level 2's water: a plain blue surface 10 below the runway's edge. She passes straight through it; below it she drowns (see the loop).
  // A tileable wave texture drawn on a canvas: deep blue with paler crest strokes and a few darker patches, repeating every 48 units
  var waterTex = (function () {
    var cv = document.createElement('canvas'); cv.width = cv.height = 256; var g = cv.getContext('2d');
    g.fillStyle = '#1f6fb8'; g.fillRect(0, 0, 256, 256);
    function rnd(i, k) { var h = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return h - Math.floor(h); }
    function draw(ox, oy) {
      for (var i = 0; i < 26; i++) {                                                    // darker, slightly different patches
        var x = rnd(i, 1) * 256 + ox, y = rnd(i, 2) * 256 + oy, r = 14 + rnd(i, 3) * 26;
        g.fillStyle = 'rgba(' + (12 + rnd(i, 4) * 20 | 0) + ',' + (80 + rnd(i, 5) * 30 | 0) + ',' + (150 + rnd(i, 6) * 40 | 0) + ',0.38)';
        g.beginPath(); g.ellipse(x, y, r, r * 0.55, rnd(i, 7) * 3.14, 0, 6.283); g.fill();
      }
      g.lineCap = 'round';
      for (var j = 0; j < 34; j++) {                                                    // pale wave crests
        var cx = rnd(j, 11) * 256 + ox, cy = rnd(j, 12) * 256 + oy, w = 14 + rnd(j, 13) * 22;
        g.strokeStyle = 'rgba(190,230,255,' + (0.45 + rnd(j, 14) * 0.4).toFixed(2) + ')'; g.lineWidth = 2.2 + rnd(j, 15) * 2.2;
        g.beginPath(); g.moveTo(cx - w, cy); g.quadraticCurveTo(cx - w / 2, cy - 6, cx, cy); g.quadraticCurveTo(cx + w / 2, cy + 6, cx + w, cy); g.stroke();
      }
    }
    for (var ax = -256; ax <= 256; ax += 256) for (var ay = -256; ay <= 256; ay += 256) draw(ax, ay);   // drawn in the neighbouring tiles too, so it wraps without a seam
    var tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(16000 / 48, 16000 / 48); tx.anisotropy = 4;
    return tx;
  })();
  var waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000), new THREE.MeshBasicMaterial({ map: waterTex, transparent: true, opacity: 0.93, side: THREE.DoubleSide }));
  waterMesh.rotation.x = -Math.PI / 2; waterMesh.position.set((L2_BOX[0] + L2_BOX[1]) / 2, WATER_Y, (L2_BOX[2] + L2_BOX[3]) / 2); scene.add(waterMesh);   // centred on the course
  var flewRamp = false, rampY = 0, drownT = 0, level = 1, styleStacks = 0, styleUntil = 0, curNow = 0, styleTipDone = false;
  function styleMult() { return styleStacks > 0 && curNow < styleUntil ? 1 + styleStacks : 1; }    // Segs fill the Power Line this many times as much while a Style Boost lasts
  // Confetti: a burst of coloured scraps that travels with her, falls, and fades
  var CONF_N = 90, confPos = new Float32Array(CONF_N * 3), confCol = new Float32Array(CONF_N * 3), confVel = new Float32Array(CONF_N * 3), confLife = 0;
  var confGeo = new THREE.BufferGeometry();
  confGeo.setAttribute('position', new THREE.BufferAttribute(confPos, 3)); confGeo.setAttribute('color', new THREE.BufferAttribute(confCol, 3));
  var confMat = new THREE.PointsMaterial({ size: 0.4, vertexColors: true, transparent: true, depthWrite: false });
  var confetti = new THREE.Points(confGeo, confMat); confetti.frustumCulled = false; confetti.visible = false; confetti.position.set(0, 2, -9); player.add(confetti);   // a child of Molly: it travels and turns with her, 9 units ahead
  function burstConfetti(x, y, z, vx, vz) {
    var pal = [[1, 0.25, 0.3], [1, 0.8, 0.15], [0.3, 0.85, 0.4], [0.3, 0.6, 1], [0.85, 0.4, 1], [1, 1, 1]];
    for (var i = 0; i < CONF_N; i++) {
      var a = Math.random() * 6.2832, r = Math.random() * 0.5, up = 0.5 + Math.random() * 1.2, sp = 1.5 + Math.random() * 4, c = pal[i % pal.length];
      confPos[i * 3] = Math.cos(a) * r; confPos[i * 3 + 1] = up; confPos[i * 3 + 2] = Math.sin(a) * r;
      confVel[i * 3] = Math.cos(a) * sp; confVel[i * 3 + 1] = 2 + Math.random() * 5; confVel[i * 3 + 2] = Math.sin(a) * sp;
      confCol[i * 3] = c[0]; confCol[i * 3 + 1] = c[1]; confCol[i * 3 + 2] = c[2];
    }
    confGeo.attributes.position.needsUpdate = true; confGeo.attributes.color.needsUpdate = true;
    confLife = 1.5; confMat.opacity = 1; confetti.visible = true;
  }
  function updateConfetti(dt) {
    if (confLife <= 0) return;
    dt *= 4;                                                 // plays in a quarter of the original 1.5s
    confLife -= dt;
    if (confLife <= 0) { confetti.visible = false; return; }
    for (var i = 0; i < CONF_N; i++) {
      confVel[i * 3 + 1] -= 28 * dt;
      confVel[i * 3] *= 1 - 1.5 * dt; confVel[i * 3 + 2] *= 1 - 1.5 * dt;
      confPos[i * 3] += confVel[i * 3] * dt; confPos[i * 3 + 1] += confVel[i * 3 + 1] * dt; confPos[i * 3 + 2] += confVel[i * 3 + 2] * dt;
    }
    confGeo.attributes.position.needsUpdate = true;
    confMat.opacity = Math.min(1, confLife / 0.5);
  }
  // The Bonus Goal: a ring in the air at the very top of a full-power Dodecadash launch off the mud ramp (120 Zips: it peaks 20 up and 216 past the lip).
  var BONUS_X = DR_XE, BONUS_Y = FIELD_Y + 21.5, BONUS_Z = DR_ZE - 216, BONUS_R = 12, bonusDone = false, bonusPrev = null, bonusEl = document.getElementById('bonus'), bonusTimer = 0;
  var bonusRing = new THREE.Group(); bonusRing.position.set(BONUS_X, BONUS_Y, BONUS_Z);
  bonusRing.add(new THREE.Mesh(new THREE.TorusGeometry(BONUS_R, 0.9, 10, 48), new THREE.MeshBasicMaterial({ color: 0x3de0ff })));
  bonusRing.add(new THREE.Mesh(new THREE.TorusGeometry(BONUS_R, 2.2, 8, 48), new THREE.MeshBasicMaterial({ color: 0x3de0ff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })));
  scene.add(bonusRing);
  buildGate(DR_XE, GOAL_Z, true, goalGold, GOAL_HALF, 22);                       // the goalpost: a tall gold-and-white gate across the field

