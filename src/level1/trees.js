  // ---- Trees: the layout's stamped trees ----
  var MAX_TREES = 1400;          // room for the most that can be built around her
  var PLAYER_RADIUS; if (PLAYER_RADIUS === undefined) PLAYER_RADIUS = 0.5;       // how close her centre can get to a trunk or wall (half the collision box's width, from her stats)
  var PLAYER_H; if (PLAYER_H === undefined) PLAYER_H = 3.6;                      // the collision box's height standing (from her stats)
  function treeMaterial(color) {
    return new THREE.MeshPhongMaterial({ color: color, flatShading: true, specular: 0x000000, shininess: 0 });
  }
  var SHADES = 3;
  var TRUNK_COLORS = [0x6b4426, 0x7a4e2c, 0x5c3a20];
  var LEAF_COLORS = [
    [0x2f7d32, 0x3a8f3a, 0x48a244],
    [0x2a7a3c, 0x359148, 0x42a455],
    [0x3b8a2c, 0x479c34, 0x56ae3e]
  ];
  // The trunk reaches 1.5 units below its base so it never floats on a slope
  // Twice the old height, with the lowest branches well above her head (7.5 units up) so the trunk is clear to see past.
  var trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 17, 7).translate(0, 7, 0);
  var leafGeos = [
    new THREE.ConeGeometry(3.7, 7.0, 7).translate(0, 7.5 + 3.5, 0),
    new THREE.ConeGeometry(2.9, 6.4, 7).translate(0, 12.0 + 3.2, 0),
    new THREE.ConeGeometry(2.1, 5.8, 7).translate(0, 16.6 + 2.9, 0)
  ];
  var treeSets = [];
  for (var sh = 0; sh < SHADES; sh++) {
    var meshes = [new THREE.InstancedMesh(trunkGeo, treeMaterial(TRUNK_COLORS[sh]), MAX_TREES)];
    for (var li = 0; li < 3; li++) meshes.push(new THREE.InstancedMesh(leafGeos[li], treeMaterial(LEAF_COLORS[sh][li]), MAX_TREES));
    meshes.forEach(function (m) { m.castShadow = true; m.frustumCulled = false; m.count = 0; scene.add(m); });
    treeSets.push(meshes);
  }
  var treeX = [], treeZ = [], treeR = [], treeTop = [];   // trunk colliders for the rows currently built, and the height of each tree's crown (the collider stops there)
  var builtAtZ = 1e9, builtAtX = 1e9;
  var tm4 = new THREE.Matrix4(), tq = new THREE.Quaternion(), tpv = new THREE.Vector3(), tsv = new THREE.Vector3();
  var tUp = new THREE.Vector3(0, 1, 0);
  var CP2_X = -3400, CP2_Z = -7500;     // where Grass Canyon's old second checkpoint stood, on the plateau's narrow west end: the terrain's mounds keep clear of it
  // Rebuilt whenever she has moved 60 units since the last time, covering everything the fog lets her see plus a margin.
  function updateTrees(px, pz) {
    if (Math.abs(pz - builtAtZ) < 60 && Math.abs(px - builtAtX) < 60) return;
    builtAtZ = pz; builtAtX = px;
    {                                                         // exactly the trees the layout stamped
      var cn = [0, 0, 0]; treeX.length = 0; treeZ.length = 0; treeR.length = 0; treeTop.length = 0;
      if (SB) SB.trees.forEach(function (t, ti) {
        var wx = L3_X + t[0], wz = t[1];
        if (Math.abs(wx - px) > VIEW_AHEAD + 120 || Math.abs(wz - pz) > VIEW_AHEAD + 120) return;
        var sh = ti % SHADES, sc = 0.9 + 0.5 * rand01(ti, 7, 31), gy = sbFoot(wx, wz), dm = t[3], tkx = 1, tky = 1, ckx = 1, cky = 1;
        if (cn[sh] >= MAX_TREES) return;
        if (dm) { sc = 1; tkx = dm.tW / 1.6; tky = dm.tH / 15.5; ckx = dm.cW / 7.4; cky = dm.cH / 14.9; }       // a tree with sizes of its own: trunk and crown set separately (the crown rides on the trunk's top)
        if (t[4] !== undefined) gy = t[5] ? gy + t[4] - sbFoot(L3_X + t[5][0], t[5][1]) : t[4]; else gy += t[2] || 0;   // a true Y: at it (a forest's trees: its Y is at the forest's centre, and they keep the ground's shape)
        tq.setFromAxisAngle(tUp, rand01(ti, 8, 32) * 6.2832);
        var slot = cn[sh]++;
        tpv.set(wx, gy, wz); tsv.set(sc * tkx, sc * tky, sc * tkx); tm4.compose(tpv, tq, tsv); treeSets[sh][0].setMatrixAt(slot, tm4);
        tpv.set(wx, gy + 7.5 * sc * (tky - cky), wz); tsv.set(sc * ckx, sc * cky, sc * ckx); tm4.compose(tpv, tq, tsv); for (var lm = 1; lm < 4; lm++) treeSets[sh][lm].setMatrixAt(slot, tm4);
        treeX.push(wx); treeZ.push(wz); treeR.push(0.8 * sc * tkx); treeTop.push(gy + sc * (7.5 * tky + 14.9 * cky));
      });
      if (SB && SB.terrain === 'sunset') shTrees(px, pz, cn);      // Sunset Hill grows its own trees as well
      for (var cb = 0; cb < SHADES; cb++) treeSets[cb].forEach(function (m) { m.count = cn[cb]; m.instanceMatrix.needsUpdate = true; });
    }
  }
  updateTrees(0, 0);
  // Sunset Hill's own trees, scattered by the terrain: about one per 1,000 square tiles (4,000 square units), in loose clumps and clearings, none on or beside a path, in a ravine or in a lake, thinning out to nothing at the treeline (SH_TREES of the summit's height, wandering a little)
  var SHT_C = Math.sqrt(2000), shtCache = new Map(), shtSB = null;   // cells of 2,000 square units with an even chance of a tree each; what each cell holds once worked out (for this layout)
  function shTreeAt(i, j) {
    if (rand01(i, j, 71) >= 0.5 * (0.35 + 1.3 * vnoise(i / 4.5, j / 4.5, 72))) return 0;   // clumps and clearings, averaging one tree per two cells
    var x = (i + 0.15 + 0.7 * rand01(i, j, 73)) * SHT_C, z = (j + 0.15 + 0.7 * rand01(i, j, 74)) * SHT_C, hb = shBase(x, z);
    var line = SH_H * SH_TREES * (1 + 0.12 * (vnoise(x / 600, z / 600, 75) - 0.5));
    if (hb > line || (hb > line - 150 && rand01(i, j, 76) < (hb - line + 150) / 150)) return 0;   // the last 150 units below the treeline thin out
    if (shRavine(x, z) > 0 || SB.lakes.some(function (k) { return Math.hypot(x - k.x, z - k.z) < k.r + 3; })) return 0;
    worldH0(L3_X + x, z); if (l3Ed < 6) return 0;                  // clear of every path by 6 units
    return [x, z, sbFoot(L3_X + x, z), Math.floor(rand01(i, j, 77) * SHADES), 0.9 + 0.5 * rand01(i, j, 78), rand01(i, j, 79) * 6.2832];
  }
  window.__treeDbg = function (px, pz) { builtAtZ = 1e9; var t0 = performance.now(); updateTrees(px, pz); return [treeX.length, performance.now() - t0]; };   // (tests: rebuild the trees around a point; how many are built and how long it took)
  function shTrees(px, pz, cn) {
    if (shtSB !== SB || shtCache.size > 80000) { shtSB = SB; shtCache.clear(); }
    var R = VIEW_AHEAD + 120, i0 = Math.floor((px - L3_X - R) / SHT_C), i1 = Math.floor((px - L3_X + R) / SHT_C), j0 = Math.floor((pz - R) / SHT_C), j1 = Math.floor((pz + R) / SHT_C);
    for (var i = i0; i <= i1; i++) for (var j = j0; j <= j1; j++) {
      var key = i * 131071 + j, t = shtCache.get(key);
      if (t === undefined) { t = shTreeAt(i, j); shtCache.set(key, t); }
      if (!t || cn[t[3]] >= MAX_TREES) continue;
      var wx = L3_X + t[0], sc = t[4], slot = cn[t[3]]++, set = treeSets[t[3]];
      tq.setFromAxisAngle(tUp, t[5]);
      tpv.set(wx, t[2], t[1]); tsv.set(sc, sc, sc); tm4.compose(tpv, tq, tsv); for (var lm = 0; lm < 4; lm++) set[lm].setMatrixAt(slot, tm4);
      treeX.push(wx); treeZ.push(t[1]); treeR.push(0.8 * sc); treeTop.push(t[2] + sc * 22.4);
    }
  }
  // Push her out of any trunk she is touching. Returns true if she hit one. (Walls and ledges are terrain: see the ground check in the loop.)
  function collide() {
    var hit = false, pp = player.position;
    for (var i = 0; i < treeX.length; i++) {
      if (pp.y >= treeTop[i]) continue;                       // above the tree's crown she is clear of it
      var dx = pp.x - treeX[i], dz = pp.z - treeZ[i];
      var r = PLAYER_RADIUS + treeR[i];
      var d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        var d = Math.sqrt(d2);
        if (d < 1e-4) { dx = 0; dz = 1; d = 1; }
        pp.x = treeX[i] + (dx / d) * r;
        pp.z = treeZ[i] + (dz / d) * r;
        hit = true;
      }
    }
    return hit;
  }

