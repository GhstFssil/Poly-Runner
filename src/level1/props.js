  // ---- Warning sign: a wooden post and board in the middle of the platform at the top of the ramp, facing back down it ----
  var SIGN_X = PX0 - RMP_END - RMP_PLAT / 2, SIGN_Z = RMP_ZC + 5, SIGN_Y = groundH(SIGN_X, SIGN_Z);
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
  buildSign(SIGN_X, SIGN_Y, SIGN_Z, 0);
  var HSIGN_X = 50, HSIGN_Z = -7608, HSIGN_Y = groundH(HSIGN_X, HSIGN_Z);   // the heart sign, at the far end of the hidden strip of plateau north of the valley
  buildSign(HSIGN_X, HSIGN_Y, HSIGN_Z, Math.PI, true);

  // Oceana Crags' sign: on the left side of the final stretch (left of her as she heads east is -Z), a little way in, facing back toward her
  var L2SIGN_X = L2_PIECES[L2_LAND2_I].x0 + 120, L2SIGN_Z = L2_PIECES[L2_LAND2_I].z0 - 6;
  buildSign(L2SIGN_X, groundH(L2SIGN_X, L2SIGN_Z), L2SIGN_Z, Math.PI);
  (function () {                                                          // the tunnel's rock: a small frame round the opening, inside a craggy mass that leans back as it rises
    var hwTop = GATE_OCT / 2, hwFloor = hwTop + 2, W = GATE_W, T = GATE_TOP, Y0 = L2_Y - 10, FW = 12, FT = L2_Y + 8, L = GATE_L, X0 = GATE_X0, Z0 = GATE_Z;
    var sh = new THREE.Shape([new THREE.Vector2(-FW, Y0), new THREE.Vector2(FW, Y0), new THREE.Vector2(FW, FT), new THREE.Vector2(-FW, FT)]);
    sh.holes.push(new THREE.Path([new THREE.Vector2(-hwFloor - 0.1, L2_Y - 0.1), new THREE.Vector2(hwFloor + 0.1, L2_Y - 0.1), new THREE.Vector2(hwTop, L2_Y + 2), new THREE.Vector2(-hwTop, L2_Y + 2)]));
    var fg = new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false });
    fg.rotateY(Math.PI / 2); fg.translate(X0, 0, Z0);
    var frame = new THREE.Mesh(fg, new THREE.MeshLambertMaterial({ color: 0x6f4d33, flatShading: true })); frame.castShadow = true; frame.receiveShadow = true; scene.add(frame);
    var ys = [Y0, L2_Y, FT], us = [], xs = [], ii;
    for (ii = 1; ii <= 11; ii++) ys.push(FT + ii * (T - FT) / 11);
    for (ii = 0; ii < 10; ii++) us.push(-60 + ii * (60 - FW) / 10);
    for (ii = 0; ii <= 8; ii++) us.push(-FW + ii * 4);
    for (ii = 1; ii <= 10; ii++) us.push(FW + ii * (60 - FW) / 10);
    for (var xi = 0; xi <= 12; xi++) xs.push(X0 + xi * L / 12);
    function nz(x, y, z, k) { return rand01(Math.round(x * 4), Math.round(y * 4) * 7 + Math.round(z * 4) * 13, k) - 0.5; }
    function P(x, y, z) {                                                   // a point of the plain box, moved to the craggy mass: leaned back, roughened, topped with spikes
      var cx = X0 + L / 2, hx = L / 2, sIn = 0.45 * Math.max(0, y - 46), u = z - Z0;
      var wf = 1;
      if (x === X0 || x === X0 + L) wf = smooth01(Math.hypot(Math.max(0, Math.abs(u) - FW), Math.max(0, y - FT)) / 12);   // leave the frame's edge alone
      var px = cx + (x - cx) * Math.max(0.2, (hx - sIn) / hx), pz = Z0 + u * Math.max(0.2, (W - sIn) / W), py = y;
      var tt = Math.max(0, (y - FT) / (T - FT));
      var sp5 = (mtSpikes(px, pz) + mtSpikes(px + 9, pz) + mtSpikes(px - 9, pz) + mtSpikes(px, pz + 9) + mtSpikes(px, pz - 9)) / 5;   // averaged over the neighbourhood, at the point's real position (the top is narrower than the base), so no needle-thin peaks
      py += sp5 * 0.28 * smooth01(tt);                                        // the crown rises gradually down the faces, so there are no shards
      var out = [px + nz(x, y, z, 51) * 3.5 * wf, py + nz(x, y, z, 52) * 3 * wf, pz + nz(x, y, z, 54) * 3.5 * wf]; out.r = [x, y, z]; return out;
    }
    var pos = [], col = [], tc = new THREE.Color();
    var AX = [0, 1, 0];
    function tri(a, b, c) {
      pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nzz = ux * vy - uy * vx, nl = Math.hypot(nx, ny, nzz) || 1, flat = Math.abs(ny / nl);
      var cy = (a[1] + b[1] + c[1]) / 3, jit = rand01(Math.round(a[0] * 3 + b[0]), Math.round(a[2] * 3 + c[2]), 55);
      tc.setHSL(0.068 + (jit - 0.5) * 0.03, 0.36, 0.30 + (jit - 0.5) * 0.1 + Math.min(0.14, Math.max(0, cy - 35) / 1800) - (flat < 0.6 ? 0.05 : 0) + 0.025 * Math.sin(cy * 0.4));
      for (var q = 0; q < 3; q++) col.push(tc.r, tc.g, tc.b);
    }
    function quad(p00, p10, p11, p01) {                                     // wound from the plain box (never from the roughened points), so every facet faces out
      var r0 = p00.r, r1 = p10.r, r2 = p11.r, ax = r1[0] - r0[0], ay = r1[1] - r0[1], az = r1[2] - r0[2], bx = r2[0] - r0[0], by = r2[1] - r0[1], bz = r2[2] - r0[2];
      var d = (ay * bz - az * by) * AX[0] + (az * bx - ax * bz) * AX[1] + (ax * by - ay * bx) * AX[2];
      if (d >= 0) { tri(p00, p10, p11); tri(p00, p11, p01); } else { tri(p00, p11, p10); tri(p00, p01, p11); }
    }
    for (var yi = 0; yi < ys.length - 1; yi++) {
      for (var ui = 0; ui < us.length - 1; ui++) {                          // front and back faces, open where the frame's opening is
        if (us[ui] >= -FW && us[ui + 1] <= FW && ys[yi + 1] <= FT) continue;
        [X0, X0 + L].forEach(function (fx) { AX = [fx === X0 ? -1 : 1, 0, 0]; quad(P(fx, ys[yi], Z0 + us[ui]), P(fx, ys[yi], Z0 + us[ui + 1]), P(fx, ys[yi + 1], Z0 + us[ui + 1]), P(fx, ys[yi + 1], Z0 + us[ui])); });
      }
      for (var xj = 0; xj < xs.length - 1; xj++) [Z0 - W, Z0 + W].forEach(function (fz) { AX = [0, 0, fz < Z0 ? -1 : 1]; quad(P(xs[xj], ys[yi], fz), P(xs[xj + 1], ys[yi], fz), P(xs[xj + 1], ys[yi + 1], fz), P(xs[xj], ys[yi + 1], fz)); });
    }
    AX = [0, 1, 0];
    for (var tx = 0; tx < xs.length - 1; tx++) for (var tu = 0; tu < us.length - 1; tu++) quad(P(xs[tx], T, Z0 + us[tu]), P(xs[tx + 1], T, Z0 + us[tu]), P(xs[tx + 1], T, Z0 + us[tu + 1]), P(xs[tx], T, Z0 + us[tu + 1]));
    var mg = new THREE.BufferGeometry();
    mg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); mg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3)); mg.computeVertexNormals();
    var mass = new THREE.Mesh(mg, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })); mass.castShadow = true; mass.receiveShadow = true; scene.add(mass);
  })();

  (function () {                                                          // the cave's rock: the same kind of craggy mass as the tunnel's, built facing +x and turned to run along the runway
    var cp = L2_PIECES[L2_CAVE_I], F = L2_CAVE_Y, L = L2_CAVE_L, W = OCV_W, FW = 19, Y0 = 20, FT = F + 36, T = F + 85, oa = OCV_OA, oc = OCV_OC;
    var wx = function (lx, lz) { return cp.x0 + lx * cp.hx - lz * cp.hz; }, wz = function (lx, lz) { return cp.z0 + lx * cp.hz + lz * cp.hx; };
    var hole = [[-(oa - oc), F], [oa - oc, F], [oa, F + oc], [oa, F + 30 - oc], [oa - oc, F + 30], [-(oa - oc), F + 30], [-oa, F + 30 - oc], [-oa, F + oc]];
    var sh = new THREE.Shape([new THREE.Vector2(-FW, Y0), new THREE.Vector2(FW, Y0), new THREE.Vector2(FW, FT), new THREE.Vector2(-FW, FT)]);
    sh.holes.push(new THREE.Path(hole.map(function (q) { return new THREE.Vector2(q[0] * 1.004, q[1] + (q[1] > F + 15 ? 0.1 : -0.1)); })));
    var fg = new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false });
    fg.rotateY(Math.PI / 2);
    var grp = new THREE.Group(); grp.position.set(cp.x0, 0, cp.z0); grp.rotation.y = Math.atan2(-cp.hz, cp.hx); scene.add(grp);
    var frame = new THREE.Mesh(fg, new THREE.MeshLambertMaterial({ color: 0x6f4d33, flatShading: true })); frame.castShadow = true; frame.receiveShadow = true; grp.add(frame);
    var ys = [Y0, FT], us = [], xs = [], ii;
    for (ii = 1; ii <= 12; ii++) ys.push(FT + ii * (T - FT) / 12);
    for (ii = 0; ii < 10; ii++) us.push(-W + ii * (W - FW) / 10);
    for (ii = 0; ii <= 9; ii++) us.push(-FW + ii * 38 / 9);
    for (ii = 1; ii <= 10; ii++) us.push(FW + ii * (W - FW) / 10);
    for (var xi = 0; xi <= 12; xi++) xs.push(xi * L / 12);
    function nz(x, y, z, k) { return rand01(Math.round(x * 4), Math.round(y * 4) * 7 + Math.round(z * 4) * 13, k + 40) - 0.5; }
    function P(x, y, z) {
      var cx = L / 2, hxl = L / 2, sIn = 0.2 * Math.max(0, y - (Y0 + 16)), u = z, wf = 1;
      if (x === 0 || x === L) wf = smooth01(Math.hypot(Math.max(0, Math.abs(u) - FW), Math.max(0, y - FT)) / 12);
      var px = cx + (x - cx) * Math.max(0.2, (hxl - sIn) / hxl), pz = u * Math.max(0.2, (W - sIn) / W), py = y;
      var tt = Math.max(0, (y - FT) / (T - FT));
      var sp5 = (mtSpikes(wx(px, pz), wz(px, pz)) + mtSpikes(wx(px + 9, pz), wz(px + 9, pz)) + mtSpikes(wx(px - 9, pz), wz(px - 9, pz)) + mtSpikes(wx(px, pz + 9), wz(px, pz + 9)) + mtSpikes(wx(px, pz - 9), wz(px, pz - 9))) / 5;
      py += sp5 * 0.28 * smooth01(tt);
      var out = [px + nz(x, y, z, 51) * 3.5 * wf, py + nz(x, y, z, 52) * 3 * wf, pz + nz(x, y, z, 54) * 3.5 * wf]; out.r = [x, y, z]; return out;
    }
    var pos = [], col = [], tc = new THREE.Color(), AX = [0, 1, 0];
    function tri(a, b, c) {
      pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nzz = ux * vy - uy * vx, nl = Math.hypot(nx, ny, nzz) || 1, flat = Math.abs(ny / nl);
      var cy = (a[1] + b[1] + c[1]) / 3, jit = rand01(Math.round(a[0] * 3 + b[0]), Math.round(a[2] * 3 + c[2]), 56);
      tc.setHSL(0.068 + (jit - 0.5) * 0.03, 0.36, 0.30 + (jit - 0.5) * 0.1 + Math.min(0.14, Math.max(0, cy - 35) / 1800) - (flat < 0.6 ? 0.05 : 0) + 0.025 * Math.sin(cy * 0.4));
      for (var q = 0; q < 3; q++) col.push(tc.r, tc.g, tc.b);
    }
    function quad(p00, p10, p11, p01) {
      var r0 = p00.r, r1 = p10.r, r2 = p11.r, ax = r1[0] - r0[0], ay = r1[1] - r0[1], az = r1[2] - r0[2], bx = r2[0] - r0[0], by = r2[1] - r0[1], bz = r2[2] - r0[2];
      var d = (ay * bz - az * by) * AX[0] + (az * bx - ax * bz) * AX[1] + (ax * by - ay * bx) * AX[2];
      if (d >= 0) { tri(p00, p10, p11); tri(p00, p11, p01); } else { tri(p00, p11, p10); tri(p00, p01, p11); }
    }
    for (var yi = 0; yi < ys.length - 1; yi++) {
      for (var ui = 0; ui < us.length - 1; ui++) {
        if (us[ui] >= -FW && us[ui + 1] <= FW && ys[yi + 1] <= FT) continue;
        [0, L].forEach(function (fx) { AX = [fx === 0 ? -1 : 1, 0, 0]; quad(P(fx, ys[yi], us[ui]), P(fx, ys[yi], us[ui + 1]), P(fx, ys[yi + 1], us[ui + 1]), P(fx, ys[yi + 1], us[ui])); });
      }
      for (var xj = 0; xj < xs.length - 1; xj++) [-W, W].forEach(function (fz) { AX = [0, 0, fz < 0 ? -1 : 1]; quad(P(xs[xj], ys[yi], fz), P(xs[xj + 1], ys[yi], fz), P(xs[xj + 1], ys[yi + 1], fz), P(xs[xj], ys[yi + 1], fz)); });
    }
    AX = [0, 1, 0];
    for (var tx = 0; tx < xs.length - 1; tx++) for (var tu = 0; tu < us.length - 1; tu++) quad(P(xs[tx], T, us[tu]), P(xs[tx + 1], T, us[tu]), P(xs[tx + 1], T, us[tu + 1]), P(xs[tx], T, us[tu + 1]));
    var mg = new THREE.BufferGeometry();
    mg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); mg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3)); mg.computeVertexNormals();
    var mass = new THREE.Mesh(mg, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })); mass.castShadow = true; mass.receiveShadow = true; grp.add(mass);
  })();

  // ---- Toxic patches: dark gray strips of ground, 2 wide and 100 long, along the path out of the cave. Square bubbles rise off them, and touching a patch (or the bubbles above it) costs a heart. ----
  var TOX_LEN = 100, TOX_H = 8, TOX_N = 56, TOX_V = [[300, 0], [500, 2], [500, 0], [700, -2], [900, 0], [900, -2], [1100, -2], [1300, 2], [1300, -2], [1500, 0], [1500, 2], [1700, 2]], TOX = [], toxUntil = 0, toxTipDone = false, dropTipDone = false;
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
  function l2Signed(x, z) {                                 // after l2Dist: how far to her right of the centre line this spot is (negative: left)
    var p = L2_PIECES[L2_PI];
    if (p.t === 's') return (x - p.x0) * -p.hz + (z - p.z0) * p.hx;
    return p.sig * (Math.hypot(x - p.cx, z - p.cz) - p.R);
  }
  (function () {
    var pos = [], i, k, j;
    for (i = 0; i < (L2_BARE ? 0 : TOX_V.length); i++) {
      var a = L2_FLAT0 + TOX_V[i][0], tp = { a: a, b: a + TOX_LEN, v: TOX_V[i][1], pts: [] };
      for (k = 0; k <= TOX_LEN / 4; k++) tp.pts.push(l2PointAt(a + k * 4));
      TOX.push(tp);
      for (k = 0; k < tp.pts.length - 1; k++) {
        var q0 = tp.pts[k], q1 = tp.pts[k + 1], y = L2_Y + 0.12;
        var c = [[q0, -1], [q0, 1], [q1, 1], [q1, -1]].map(function (e) { var q = e[0], v = tp.v + e[1]; return [q[0] - q[3] * v, y, q[1] + q[2] * v]; });
        [0, 1, 2, 0, 2, 3].forEach(function (n) { pos.push(c[n][0], c[n][1], c[n][2]); });
      }
    }
    var tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); tg.computeVertexNormals();
    var tm = new THREE.Mesh(tg, new THREE.MeshLambertMaterial({ color: 0x34353a, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
    tm.receiveShadow = true; scene.add(tm);
  })();
  if (!L2_BARE) (function () {                                            // the bridge over the bay: a slab 16 wide and 2 deep, floating on the water, wherever the path is clear of the crags. Facets are the same size and stone as the path's own
    var pos = [], col = [], run = [], sg, q, i, c, p, ps, y, hw, TH = 2, NC = 7, tc = 0, color = new THREE.Color();
    var send = L2_PIECES[L2_PIECES.length - 1].s0 + L2_PIECES[L2_PIECES.length - 1].len;
    for (sg = L2_FLAT0; sg <= send; sg += GRID) {
      q = l2PointAt(sg); if (Math.hypot(q[0] - L2_X, q[1] + 741) > 1345 && ovKAt(q[0], q[1]) < 0.05) { if (run.length) run.push(null); continue; }
      for (i = L2_PIECES.length - 1; i > 0 && sg < L2_PIECES[i].s0; i--);
      p = L2_PIECES[i]; ps = Math.min(p.len, sg - p.s0); y = narY(p, ps) - 0.06; hw = narHW(q[0], q[1]);
      run.push({ x: q[0], z: q[1], hx: q[2], hz: q[3], y: y, hw: hw });
    }
    function pt(o, u, dy) { return [o.x - o.hz * u * o.hw, o.y + dy, o.z + o.hx * u * o.hw]; }
    function tri(a, b, d, k) {                               // one facet, its own shade of the path's light brown stone
      var j1 = rand01(tc, 17, 91), j2 = rand01(tc, 5, 92); tc++;
      color.setHSL(0.085 + (j1 - 0.5) * 0.012, 0.19 + (j1 - 0.5) * 0.05, (0.50 + (j1 - 0.5) * 0.07 + (j2 - 0.5) * 0.03) * k);
      [a, b, d].forEach(function (v) { pos.push(v[0], v[1], v[2]); col.push(color.r, color.g, color.b); });
    }
    for (i = 0; i + 1 < run.length; i++) {
      var A = run[i], B = run[i + 1]; if (!A || !B) continue;
      for (c = 0; c < NC; c++) {
        var u0 = c / NC * 2 - 1, u1 = (c + 1) / NC * 2 - 1;
        if ((i + c) & 1) { tri(pt(A, u0, 0), pt(A, u1, 0), pt(B, u1, 0), 1); tri(pt(A, u0, 0), pt(B, u1, 0), pt(B, u0, 0), 1); }
        else { tri(pt(A, u0, 0), pt(A, u1, 0), pt(B, u0, 0), 1); tri(pt(A, u1, 0), pt(B, u1, 0), pt(B, u0, 0), 1); }
        tri(pt(A, u0, -TH), pt(B, u0, -TH), pt(B, u1, -TH), 0.6); tri(pt(A, u0, -TH), pt(B, u1, -TH), pt(A, u1, -TH), 0.6);
      }
      [-1, 1].forEach(function (u) { tri(pt(A, u, 0), pt(A, u, -TH), pt(B, u, -TH), 0.8); tri(pt(A, u, 0), pt(B, u, -TH), pt(B, u, 0), 0.8); });
    }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3)); g.computeVertexNormals();
    var m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide }));
    m.receiveShadow = true; m.castShadow = true; scene.add(m);
  })();
  var toxBub = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x8f9a8f, transparent: true, opacity: 0.55, depthWrite: false }), TOX_V.length * TOX_N);
  toxBub.frustumCulled = false; toxBub.count = 0; scene.add(toxBub);
  var toxDummy = new THREE.Object3D(), toxT = 0;
  var ovBub = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x9fb08a, transparent: true, opacity: 0.55, depthWrite: false }), 200);
  ovBub.frustumCulled = false; ovBub.count = 0; scene.add(ovBub);
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
  function updateSinkToxic(pp, now) {                        // the Sink's whole floor is poison: bubbles all round her, and a heart a second to stand on it
    var n = 0, CSZ = 10, ci0 = Math.floor(pp.x / CSZ), cj0 = Math.floor(pp.z / CSZ), a, b;
    if (ovKAt(pp.x, pp.z) > 0.01 || ovKAt(pp.x + 80, pp.z) > 0.01 || ovKAt(pp.x - 80, pp.z) > 0.01 || ovKAt(pp.x, pp.z + 80) > 0.01 || ovKAt(pp.x, pp.z - 80) > 0.01) {
      for (a = ci0 - 7; a <= ci0 + 7 && n < 200; a++) for (b = cj0 - 7; b <= cj0 + 7 && n < 200; b++) {
        if (rand01(a, b, 81) > 0.45) continue;
        var bx = (a + rand01(a, b, 82)) * CSZ, bz = (b + rand01(a, b, 83)) * CSZ, life = (toxT * (0.35 + 0.3 * rand01(a, b, 84)) + rand01(a, b, 85)) % 1;
        var gy = mountainH(bx, bz, 1000); if (!ovTox) continue; gy += ledgeH(bx, bz);
        var sz = (0.3 + 0.55 * rand01(a, b, 86)) * Math.sin(Math.PI * life);
        toxDummy.position.set(bx, gy + 0.4 + life * TOX_H, bz); toxDummy.rotation.set(toxT * 0.7 + a, toxT + b, 0); toxDummy.scale.set(sz, sz, sz); toxDummy.updateMatrix();
        ovBub.setMatrixAt(n++, toxDummy.matrix);
      }
    }
    ovBub.count = n; ovBub.instanceMatrix.needsUpdate = true;
    var gh = mountainH(pp.x, pp.z, 1000) + ledgeH(pp.x, pp.z);   // the real ground under her, not the path or slab above it
    if (ovTox && pp.y < gh + 2.2 && now >= toxUntil && hp > 0 && !ballOn && !hovOn) {
      if (!toxTipDone) { toxTipDone = true; showHint('Doctor Rektangulik has poisoned the ground here! The dark patches will hurt you!', 5000, now); }
      toxUntil = now + 1000; hp -= 1; drawHearts(); flashHurt(); shake(0.3);
    }
  }
  function updateToxic(dt, now) {
    toxT += dt;
    if (level === 3) sbTick(dt, now);
    sbToxBubbles(player.position);
    if (level !== 2 || !playing) { toxBub.count = 0; ovBub.count = 0; return; }
    var pp = player.position;
    updateSinkToxic(pp, now);
    if (!dropTipDone && pp.x > L2_X + 1360 && pp.x < L2_X + 1500 && pp.y > L2_Y + 50 && Math.abs(pp.z + 500.7) < 20) { dropTipDone = true; showHint('Taking out mobs refills your power line! Use that to maintain your Barrier!', 6000, now); }
    l2Dist(pp.x, pp.z);
    var onPath = L2_PI >= L2_NAR0, sg = L2_S, v = onPath ? l2Signed(pp.x, pp.z) : 0, n = 0, i, k;
    if (!onPath && L2_S < L2_FLAT0 - 600) { toxBub.count = 0; return; }
    if (onPath && !toxTipDone) { toxTipDone = true; showHint('Doctor Rektangulik has poisoned the ground here! The dark patches will hurt you!', 5000, now); }   // as she comes out of the cave
    for (i = 0; i < TOX.length; i++) {
      var t = TOX[i];
      if (sg < t.a - 450 || sg > t.b + 150) continue;
      for (k = 0; k < TOX_N; k++) {
        var r1 = rand01(i, k, 61), r2 = rand01(i, k, 62), r3 = rand01(i, k, 63), life = (toxT * (0.35 + 0.3 * r3) + r2) % 1;
        var u = r1 * TOX_LEN / 4, ui = Math.min(t.pts.length - 2, Math.floor(u)), uf = u - ui, q0 = t.pts[ui], q1 = t.pts[ui + 1];
        var cx = q0[0] + (q1[0] - q0[0]) * uf, cz = q0[1] + (q1[1] - q0[1]) * uf, hx = q0[2] + (q1[2] - q0[2]) * uf, hz = q0[3] + (q1[3] - q0[3]) * uf;
        var lv = t.v + (rand01(i, k, 64) - 0.5) * 1.6 + Math.sin(toxT * 2 + r2 * 20) * 0.18, sz = (0.3 + 0.55 * rand01(i, k, 65)) * Math.sin(Math.PI * life);
        toxDummy.position.set(cx - hz * lv, L2_Y + 0.4 + life * TOX_H, cz + hx * lv);
        toxDummy.rotation.set(toxT * 0.7 + r1 * 6, toxT + r2 * 6, 0); toxDummy.scale.set(sz, sz, sz); toxDummy.updateMatrix();
        toxBub.setMatrixAt(n++, toxDummy.matrix);
      }
      if (onPath && sg >= t.a - 0.3 && sg <= t.b + 0.3 && Math.abs(v - t.v) < 1.25 && pp.y < L2_Y + TOX_H + 1 && now >= toxUntil && hp > 0 && !ballOn && !hovOn) {
        toxUntil = now + 1000; hp -= 1; drawHearts(); flashHurt(); shake(0.3);
      }
    }
    toxBub.count = n; toxBub.instanceMatrix.needsUpdate = true;
  }

  // ---- Segs: gold tokens strung in lines across the plateau ----
  // Lines come from a seeded cell grid like the trees, so they are the same every time and stream in as she runs. Each is
  // a gently curving string of 8 to 16 tokens, 6 units apart, floating just above the ground. Collected ones stay gone
  // until the level resets.
  var SEG_CELL = 400, SEG_SPACING = 6, SEG_MAX = 900, SEG_RADIUS = 3.4;
  // Each Seg is a short, bright red line segment that hovers and slowly turns about the vertical, with a soft additive halo round it.
  var segMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, 0.18, 0.18),
    new THREE.MeshBasicMaterial({ color: 0xff2a1f }), SEG_MAX);
  var segGlow = new THREE.InstancedMesh(new THREE.BoxGeometry(2.8, 0.55, 0.55),
    new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }), SEG_MAX);
  segMesh.frustumCulled = false; segMesh.count = 0; scene.add(segMesh);
  segGlow.frustumCulled = false; segGlow.count = 0; scene.add(segGlow);
  applyCharColors();
  // A chain of 150 leads out of the curve's mouth in a broad sweep to the right (west, since she leaves heading +Z) and on into the plateau.
  var CHAIN_N = 150, chainX = [], chainZ = [];
  (function () {
    // a right-hand arc of radius 640 (the tightest turn she can hold at top speed) from the mouth, then a short straight; 150 tokens evenly along it
    var R = 450, th = 640 * 68 * Math.PI / 180 / 450, S = 5, L = R * th + S, x0 = PL_X, z0 = ARC_CZ + 30;
    for (var i = 0; i < CHAIN_N; i++) {
      var d = L * i / (CHAIN_N - 1), a = Math.min(d, R * th) / R, ex = x0 - R * (1 - Math.cos(a)), ez = z0 + R * Math.sin(a), ex2 = d > R * th ? d - R * th : 0;
      chainX.push(ex - Math.sin(th) * ex2); chainZ.push(ez + Math.cos(th) * ex2);
    }
  })();
  // A trail of 50 runs the length of the ramp, up its centre line.
  // 30 Segs run the length of the cave, spaced about 50 apart and weaving a little side to side, and a ring of them circles the chamber 5 units in from its wall.
  var fixSegX = [], fixSegZ = [], fixSegId = [];
  for (var l2i = 0; l2i < 25; l2i++) { var l2p = L2_PIECES[L2_LAND1_I]; fixSegX.push(l2p.x0 + l2p.hx * (4 + 8 * l2i)); fixSegZ.push(l2p.z0 + l2p.hz * (4 + 8 * l2i)); fixSegId.push('l2,' + l2i); }   // Oceana Crags: 25 Segs along the start of the runway past the first ramp, 8 apart
  (function () {
    var n = 30, s0 = 120, s1 = CAVE_LEN - 70;
    for (var i = 0; i < n; i++) { var q = cavePoint(s0 + (s1 - s0) * i / (n - 1)), off = (i % 2 ? 5 : -5); fixSegX.push(q[0] - q[3] * off); fixSegZ.push(q[1] + q[2] * off); fixSegId.push('cave,' + i); }
    var rr = CH_R - 5, cnt = 80;
    for (var j = 0; j < cnt; j++) {
      var an = j / cnt * Math.PI * 2, rx = CH_X + Math.cos(an) * rr, rz = CH_Z + Math.sin(an) * rr;
      if (Math.hypot(rx - CH_X, rz - (CH_Z + CH_R)) < 14) continue;     // leave the tunnel mouth clear
      fixSegX.push(rx); fixSegZ.push(rz); fixSegId.push('ring,' + j);
    }
  })();
  var fixSegY = {};
  (function () {                                                         // 25 Segs in the air: off the lip of the last ramp, up in an arc and down into the cave's mouth
    for (var ai = 0; ai < 25; ai++) {
      var t = 0.04 + 0.94 * ai / 24, k = fixSegX.length;
      fixSegX.push(AIR.x0 + AIR.dx * t); fixSegZ.push(AIR.z0 + AIR.dz * t); fixSegId.push('air,' + ai);
      fixSegY[k] = airY(t);
    }
  })();
  var rampSegX = [], rampSegZ = [];
  for (var rq = 0; rq < 50; rq++) { rampSegX.push(PX0 - (20 + (RMP_END - 40) * rq / 49)); rampSegZ.push(RMP_ZC); }
  var segX = [], segY = [], segZ = [], segId = [], segAlive = [];
  var segGot = {}, segCount = 0, segTotal = 0, segBuiltX = 1e9, segBuiltZ = 1e9;
  var sm4 = new THREE.Matrix4(), sq = new THREE.Quaternion(), sp3 = new THREE.Vector3(), ss3 = new THREE.Vector3(1, 1, 1), ss5 = new THREE.Vector3(5, 5, 5), sUp = new THREE.Vector3(0, 1, 0);
  (function () {                                            // five big Segs (5 times the size, worth 10 each) 100 apart along the last 400 units of the path, before the drop
    var last = L2_PIECES[L2_PIECES.length - 1], send = last.s0 + last.len;
    for (var bi = 0; bi < 5; bi++) {
      var bq = l2PointAt(send - 6 - 100 * bi);
      fixSegX.push(bq[0]); fixSegZ.push(bq[1]); fixSegY[fixSegX.length - 1] = L2_Y + 60 + 2.5; fixSegId.push('big,' + bi);
    }
  })();
  function updateSegs(px, pz) {
    if (Math.abs(px - segBuiltX) < 80 && Math.abs(pz - segBuiltZ) < 80) return;
    segBuiltX = px; segBuiltZ = pz;
    segX.length = 0; segY.length = 0; segZ.length = 0; segId.length = 0; segAlive.length = 0;
    var R = VIEW_AHEAD + 120;
    for (var ck = 0; ck < chainX.length; ck++) {                       // the chain, wherever she is near it
      var cdx = chainX[ck] - px, cdz = chainZ[ck] - pz, cid = 'chain,' + ck;
      if (cdx * cdx + cdz * cdz < R * R && !segGot[cid] && segX.length < SEG_MAX) { segX.push(chainX[ck]); segY.push(groundH(chainX[ck], chainZ[ck]) + 1.7); segZ.push(chainZ[ck]); segId.push(cid); segAlive.push(true); }
    }
    for (var rk = 0; rk < rampSegX.length; rk++) {                     // the ramp trail
      var rdx = rampSegX[rk] - px, rdz = rampSegZ[rk] - pz, rid = 'ramp,' + rk;
      if (rdx * rdx + rdz * rdz < R * R && !segGot[rid] && segX.length < SEG_MAX) { segX.push(rampSegX[rk]); segY.push(groundH(rampSegX[rk], rampSegZ[rk]) + 1.7); segZ.push(rampSegZ[rk]); segId.push(rid); segAlive.push(true); }
    }
    for (var fk = 0; fk < fixSegX.length; fk++) {                      // the cave run and the chamber ring
      var fdx = fixSegX[fk] - px, fdz = fixSegZ[fk] - pz;
      if (fdx * fdx + fdz * fdz < R * R && !segGot[fixSegId[fk]] && segX.length < SEG_MAX) { segX.push(fixSegX[fk]); segY.push(fixSegY[fk] !== undefined ? fixSegY[fk] : groundH(fixSegX[fk], fixSegZ[fk]) + 1.7); segZ.push(fixSegZ[fk]); segId.push(fixSegId[fk]); segAlive.push(true); }
    }
    if (level === 3 && SB) for (var bk = 0; bk < SB.segs.length; bk++) {                  // the Sandbox's stamped Segs
      var bs = SB.segs[bk], bid = (bs.big ? 'big,sb' : 'sb,') + bk, bdx = L3_X + bs.x - px, bdz = bs.z - pz;
      if (bdx * bdx + bdz * bdz < R * R && !segGot[bid] && segX.length < SEG_MAX) { segX.push(L3_X + bs.x); segY.push(bs.T !== undefined ? bs.T : sbFoot(L3_X + bs.x, bs.z) + (bs.big ? 2.5 : 1.7) + Math.max(-1, bs.h || 0)); segZ.push(bs.z); segId.push(bid); segAlive.push(true); }
    }
    var c0 = Math.floor((px - R) / SEG_CELL), c1 = Math.floor((px + R) / SEG_CELL);
    var r0 = Math.floor((pz - R) / SEG_CELL), r1 = Math.floor((pz + R) / SEG_CELL);
    for (var cj = r0; cj <= r1; cj++) {
      for (var ci = c0; ci <= c1; ci++) {
        if (ci * SEG_CELL > PX1 || (ci + 1) * SEG_CELL < PXW || (cj + 1) * SEG_CELL < PZ0 || cj * SEG_CELL > PZ1) continue;   // plateau cells only
        var rnd = cellRng(ci + 5000, cj - 5000), p0 = rnd(), lines = p0 < 0.08 ? 0 : p0 < 0.42 ? 1 : p0 < 0.8 ? 2 : 3;   // about 1.7 lines a cell, 50% more than before
        for (var li = 0; li < lines; li++) {
          // Every line heads for the second checkpoint (within about 20 degrees), and starts from whichever of eight random spots puts it
          // highest up: the best candidate is the one whose tokens sit highest on average, so lines tend to run along hilltops.
          var curv = (rnd() - 0.5) * 0.004, n = 8 + Math.floor(rnd() * 9), x = 0, z = 0, a = 0, bestScore = -1e9;
          for (var cand = 0; cand < 8; cand++) {
            var cx0 = (ci + rnd()) * SEG_CELL, cz0 = (cj + rnd()) * SEG_CELL, ca = Math.atan2(CP2_Z - cz0, CP2_X - cx0) + (rnd() - 0.5) * 0.7;
            var sc = 0, cnt = 0, qx = cx0, qz = cz0, qa = ca;
            for (var kk = 0; kk < n; kk++) {
              if (plateauOut(qx, qz) < -40 && valley2Dist(qx, qz) > V2_HALF + V2_RIM + 12) { sc += groundH(qx, qz); cnt++; }
              qx += Math.cos(qa) * SEG_SPACING; qz += Math.sin(qa) * SEG_SPACING; qa += curv * SEG_SPACING;
            }
            sc = cnt >= n * 0.6 ? sc / cnt : -1e6 + cnt;
            if (sc > bestScore) { bestScore = sc; x = cx0; z = cz0; a = ca; }
          }
          for (var k = 0; k < n; k++) {
            if (plateauOut(x, z) < -40 && valley2Dist(x, z) > V2_HALF + V2_RIM + 12 && segX.length < SEG_MAX) {
              wallField(x, z);
              var id = ci + ',' + cj + ',' + li + ',' + k;
              if (wd > 25 && !segGot[id]) { segX.push(x); segY.push(groundH(x, z) + 1.7); segZ.push(z); segId.push(id); segAlive.push(true); }
            }
            x += Math.cos(a) * SEG_SPACING; z += Math.sin(a) * SEG_SPACING; a += curv * SEG_SPACING;
          }
        }
      }
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

