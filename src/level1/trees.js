  // ---- Trees: one per jittered grid cell, in rows running down the valley, so neighbours are 7 to 20 tiles apart ----
  var T_CS = 18;                 // each 18-unit cell holds exactly one tree, a little off its centre, so the forest is evenly spread
  var MIN_R = 3;                 // how many cells away a tree can still be too close
  var MIN_D = 14.8;              // two trees are never closer than this (7.4 tiles)
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
  var TREE_TOP = 22.4;                                      // the crown's tip above the tree's base at scale 1
  var builtAtZ = 1e9, builtAtX = 1e9;
  var tm4 = new THREE.Matrix4(), tq = new THREE.Quaternion(), tpv = new THREE.Vector3(), tsv = new THREE.Vector3();
  var tUp = new THREE.Vector3(0, 1, 0);
  // Placement is random but never regular. Every cell of the valley floor offers one candidate tree at a random spot with a
  // random priority; a candidate is planted unless a higher-priority tree that is itself planted sits closer than MIN_D.
  // Each answer depends only on the cells around it, so the forest is the same wherever and whenever it is rebuilt,
  // with no rows or columns to follow and no two trees closer than 7.4 tiles.
  var CP_Z = -END + 50, CP_X = 0;           // the first checkpoint gate: 50 units short of the valley's end wall
  var CP2_X = -3400, CP2_Z = -7500;     // the second, across the narrow west end of the plateau
  var candCache = new Map(), plantCache = new Map();
  function cellKey(cx, cz) { return cz * 4096 + (cx + 2048); }
  function candidate(cx, cz) {
    var key = cellKey(cx, cz), c = candCache.get(key);
    if (c !== undefined) return c;
    c = null;
    var rnd = cellRng(cx, cz);
    var x = (cx + 0.5 + (rnd() - 0.5) * 0.6) * T_CS, z = (cz + 0.5 + (rnd() - 0.5) * 0.6) * T_CS, pri = rnd();
    var sc = 0.85 + rnd() * 0.55, rot = rnd() * Math.PI * 2;
    var shade = Math.min(SHADES - 1, Math.floor(rnd() * SHADES)), thin = (((cx * 0.7548776662466927 + cz * 0.5698402909980532) % 1) + 1) % 1;   // a low-discrepancy sequence, so the trees thinned out leave an even pattern
    var rk = rnd();
    var rx0 = x - ARC_CX, rz0 = z - ARC_CZ, rho = Math.sqrt(rx0 * rx0 + rz0 * rz0);
    if (rz0 <= 0 && x < -CH_HALF - 5 && Math.abs(rho - TURN_R) < CH_HALF) {   // in the curve the trees stand out toward the walls and the middle of the track stays clear
      var uu = (rho - TURN_R) / CH_HALF, au = 0.4 + 0.44 * Math.abs(uu), rho2 = TURN_R + (uu < 0 ? -au : au) * CH_HALF;
      x = ARC_CX + rx0 / rho * rho2; z = ARC_CZ + rz0 / rho * rho2;
      if (rk > 0.5) { candCache.set(key, null); return null; }
    }
    wallField(x, z);
    var onPlateau = Math.abs(x - PL_X) < PL_HX + 10 && Math.abs(z - PL_ZC) < PL_HZ + 10;
    if (wd < -4 && !onPlateau && x * x + z * z >= 100 && !(Math.abs(z - CP_Z) < 40 && Math.abs(x) < 45)) {   // on open ground at least 4 from the rock, off the plateau, and the start stays clear
      c = { x: x, z: z, pri: pri, sc: sc, rot: rot, shade: shade, y: null, key: key, thin: thin, pin: false };
    }
    if (cx === -1 && cz <= -2 && cz % 3 === 0 && z > -END) {   // a tree on the centre line every 54 units, all the way down the valley, so the middle of the track is never bare
      var px2 = (cx + 1 + 0.5) * 0 + (rnd() - 0.5) * 11, pz2 = (cz + 0.5 + (rnd() - 0.5) * 0.5) * T_CS;
      wallField(px2, pz2);
      if (!(Math.abs(pz2 - CP_Z) < 40 && Math.abs(px2) < 45)) c = { x: px2, z: pz2, pri: pri, sc: sc, rot: rot, shade: shade, y: null, key: key, thin: 1, pin: true };
    }
    candCache.set(key, c);
    return c;
  }
  function planted(cx, cz) {
    var key = cellKey(cx, cz), p = plantCache.get(key);
    if (p !== undefined) return p;
    var c = candidate(cx, cz);
    p = !!c;          // one tree per cell and never nearer than 7 units to a neighbour, so there is nothing to compete over
    plantCache.set(key, p);
    return p;
  }
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
      for (var cb = 0; cb < SHADES; cb++) treeSets[cb].forEach(function (m) { m.count = cn[cb]; m.instanceMatrix.needsUpdate = true; });
    }
  }
  updateTrees(0, 0);
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

  var player = new THREE.Group();
  player.position.y = groundH(0, 0);
  scene.add(player);
  var body = new THREE.Group();
  player.add(body);
  // Barrier: a dodecahedron of solid glowing red energy that she rolls along the ground inside. Hidden until the 2 key.
  var BALL_R = 1.76, ballOn = false, ballAngle = 0;
  // The tunable parts of Molly's moves and the Barrier. The Rig Editor keeps its stats in this browser (runnerRig2); RIGCFG reads them again whenever the editor is closed or saved.
  var RIGCFG = {
    'barrier.radius': 1.76, 'barrier.height': 1.64, 'barrier.spin': 1, 'barrier.sphereAt': 40, 'barrier.squeezeAt': 75, 'barrier.squeezeLen': 5, 'barrier.squeeze': 0.2, 'barrier.stretch': 0.12,
    'barrier.chargeSphere': 2, 'barrier.chargeSqueeze': 3.5, 'barrier.glow': 0.2, 'barrier.glowSize': 1.14, 'barrier.dashLen': 0.32, 'barrier.dashGap': 0.22,
    'barrier.cBody': '#ff2a1f', 'barrier.cEmis': '#b3140c', 'barrier.cEdge': '#ffc7b8', 'barrier.cDash': '#ff9a88', 'barrier.cGlow': '#ff3a2a',
    'm.drift.lean': 28.6, 'm.drift.angle': 15, 'm.drift.time': 0.15, 'm.drift.minZips': 30, 'm.drift.cool': 1, 'm.drift.rate': 9, 'slope.side': 0.85,
    'stat.top': 80, 'stat.accelT': 7, 'stat.brake': 3, 'stat.jumpH': 7.2, 'stat.grav': 20, 'stat.gripZ': 20, 'stat.fadeSlope': 0, 'stat.driftGrip': 1, 'stat.fall': 50, 'stat.hearts': 3, 'stat.colH': 3.6, 'stat.colW': 1, 'stat.wallGrip': 1, 'stat.fadeWall': 1, 'stat.fric': 11.4, 'stat.slamAcc': 40, 'stat.slamMax': 60, 'stat.strafe': 2
  };
  var MAXHP = 3;
  var mollyScale = 1, SLIDE_H = 1, mollyDriftRun = false;   // mollyScale: the Overall scale the model in use was saved with (the Rig Editor's stat). She stands 3.6 units x this, and her collision box (standing and sliding) is multiplied by it too
  // Minions and Big Minions are set in the Rig Editor's Minions panel: their blocks, colours, walk and stats. [Minion, Big Minion]. Speeds in Zips; swing angles in degrees; a damage speed of 0 means never
  var MN_DEF = { scale: [1, 5], radius: [1, 3], headW: [0.9, 0.9], headH: [0.9, 0.9], headD: [0.9, 0.9], torsoW: [0.7, 0.7], torsoH: [1.35, 1.35], torsoD: [0.45, 0.45], armW: [0.3, 0.3], armL: [1.35, 1.35], legW: [0.33, 0.33, .15], legD: [0.4, 0.4, .2], legL: [1.35, 1.35, .4],
    cHead: ['#45484e', '#45484e', '#5b4b73'], cBody: ['#2f3237', '#2f3237'], cLimb: ['#26282c', '#26282c', '#3a3148'], cEye: ['#ff2a1a', '#ff2a1a', '#e8a020'],
    stride: [0.9, 0.9], legSwing: [45.8, 45.8, 20], armSwing: [13.8, 13.8], armRaise: [83.1, 83.1], bob: [0, 0, .12],
    top: [10, 10, 14], acc: [5, 5, 10], see: [100, 100], hearts: [1, 3], dmg: [1, 2], cool: [1.2, 1.2], k1: [20, 20], k2: [0, 0], k3: [0, 0], stomp: [8, 17], cWing: ['#808080', '#808080', '#b8aed0'], wing: [1.5, 1.5, 1.5], flap: [5, 5, 5], orbit: [10, 10, 10], range: [30, 30, 30], fire: [2, 2, 2], bolt: [40, 40, 40], bdmg: [0.5, 0.5, 0.5] };
  for (var mnk in MN_DEF) { RIGCFG['mn.min.' + mnk] = MN_DEF[mnk][0]; RIGCFG['mn.big.' + mnk] = MN_DEF[mnk][1]; RIGCFG['mn.gaz.' + mnk] = MN_DEF[mnk].length > 2 ? MN_DEF[mnk][2] : MN_DEF[mnk][0]; }
  // Comet's moves (the Rig Editor's Comet page). Hover: its own movement stats while it is on. Star Throw: Q or E, held to charge (each second costs power and adds size, damage and range). Speeds in Zips
  var COMET_DEF = { 'comet.hov.cost': 6, 'comet.hov.drain': 1, 'comet.hov.height': 0.5, 'comet.hov.top': 80, 'comet.hov.accelT': 7, 'comet.hov.brake': 3, 'comet.hov.fric': 11.4, 'comet.hov.gripZ': 20, 'comet.hov.jumpH': 7.2,
    'comet.hov.ankle': 0.35, 'comet.hov.back': 0.75, 'comet.hov.spinS': 1.5, 'comet.fly.drain': 4, 'comet.fly.lift': 1, 'comet.fly.arms': 8,
    'comet.star.cost': 1, 'comet.star.range': 50, 'comet.star.dmg': 0.5, 'comet.star.cool': 2, 'comet.star.speed': 100, 'comet.star.size': 1.2, 'comet.star.spin': 4,
    'comet.star.cMax': 3, 'comet.star.cCost': 2, 'comet.star.cSize': 0.5, 'comet.star.cDmg': 0.5, 'comet.star.cRange': 50, 'comet.cStar': '#4fc3ff', 'comet.cGlow': '#a8e6ff',
    // her animations (the Rig Editor's Star throw, Hover and Fly modes), with the Rig Editor's key stats in degrees. Groups: pc the charging pose (right hand; Q mirrors it), pt the follow-through, pf Fly's arms and body, ho the changes while hovering, fl Fly's changes to her legs
    'comet.throw.in': 0.15, 'comet.throw.swing': 0.14, 'comet.throw.rel': 0.6, 'comet.throw.hold': 0.12, 'comet.throw.out': 0.3, 'comet.hold.scale': 0.8, 'comet.hold.out': 0.15,
    'comet.hov.bob': 0.08, 'comet.hov.bobT': 1.6, 'comet.hov.ankleY': 0, 'comet.hov.ankleTilt': 0, 'comet.hov.backD': 0.55, 'comet.hov.backY': 0.15, 'comet.hov.backTilt': 0, 'comet.fly.starY': 0.25, 'comet.fly.starS': 1 };
  var CQ_KEYS = ['hyf', 'hz', 'hp', 'sp', 'hd', 'aLp', 'aLr', 'aLe', 'aRp', 'aRr', 'aRe', 'hL', 'kL', 'dL', 'hR', 'kR', 'dR', 'p1', 'p2', 'p3'];
  (function () {
    var P0 = { pc: { sp: 24, hd: -14, aLp: 45, aLr: 18, aLe: 35, aRp: -55, aRr: 25, aRe: 75 }, pt: { sp: 32, hd: -10, aLp: -25, aLr: 12, aLe: 30, aRp: 115, aRr: 8, aRe: 12 }, pf: { sp: 0, hd: 0, aLp: 170, aLr: 8, aLe: 8, aRp: 170, aRr: 8, aRe: 8 } };
    ['pc', 'pt', 'pf', 'ho', 'fl'].forEach(function (g) { CQ_KEYS.forEach(function (k) { COMET_DEF['comet.' + g + '.' + k] = (P0[g] && P0[g][k]) || 0; }); });
  })();
  // A pose stat set's turn for one bone (the Rig Editor's key-pose rules), shared by the game and the Rig Editor's preview
  window.__cometQ = function (n, v) {
    var D = Math.PI / 180, X = new THREE.Vector3(1, 0, 0), Z = new THREE.Vector3(0, 0, 1), qx = function (a) { return new THREE.Quaternion().setFromAxisAngle(X, a * D); }, qz = function (a) { return new THREE.Quaternion().setFromAxisAngle(Z, a * D); };
    switch (n) {
      case 'Hips': return qx(v.hp); case 'Spine': return qx(v.sp); case 'Head': return qx(v.hd);
      case 'ShoulderL': return qx(-v.aLp).multiply(qz(v.aLr)); case 'ShoulderR': return qx(-v.aRp).multiply(qz(-v.aRr));
      case 'ElbowL': return qx(-v.aLe); case 'ElbowR': return qx(-v.aRe);
      case 'HipL': return qx(-v.hL); case 'HipR': return qx(-v.hR); case 'KneeL': return qx(v.kL); case 'KneeR': return qx(v.kR); case 'AnkleL': return qx(-v.dL); case 'AnkleR': return qx(-v.dR);
      case 'Pony1': return qx(v.p1); case 'Pony2': return qx(v.p2); case 'Pony3': return qx(v.p3);
    }
    return new THREE.Quaternion();
  };
  window.__cometMirror = function (v) { var o = {}, k; for (k in v) o[k] = v[k]; [['aLp', 'aRp'], ['aLr', 'aRr'], ['aLe', 'aRe'], ['hL', 'hR'], ['kL', 'kR'], ['dL', 'dR']].forEach(function (p) { o[p[0]] = v[p[1]]; o[p[1]] = v[p[0]]; }); return o; };
  for (var ck in COMET_DEF) RIGCFG[ck] = COMET_DEF[ck];
  window.__COMET_DEF = COMET_DEF;
  var RIGDEF = JSON.parse(JSON.stringify(RIGCFG));
  // Which runner she plays as: 'molly' or 'comet' (the Characters page). Each keeps her own Rig Editor stats (runnerRig2, cometRig) and her own saved model (mollyGlb, cometGlb); Comet starts as a copy of Molly. Mobs' stats always come from Molly's.
  var CHAR = 'molly'; try { if (localStorage.getItem('pr_char') === 'comet') CHAR = 'comet'; } catch (e) {}
  function isComet() { return CHAR === 'comet'; }
  // The settings each runner ships with (what a fresh browser plays): under whatever this browser has saved, over the built-in numbers above
  var SHIPPED = { molly: {}, comet: {} }; try { SHIPPED.molly = JSON.parse(document.getElementById('molly-settings').textContent); } catch (e) {} try { SHIPPED.comet = JSON.parse(document.getElementById('comet-settings').textContent); } catch (e) {}
  function rigStored(ch) {
    var om = null, o = null; try { om = JSON.parse(localStorage.getItem('runnerRig2') || 'null'); o = ch === 'comet' ? JSON.parse(localStorage.getItem('cometRig') || 'null') : om; } catch (e) {}
    return [o, om];
  }
  function rigOk(v, d) { return v !== undefined && v !== null && typeof v === typeof d && (typeof v !== 'string' || /^#[0-9a-f]{6}$/i.test(v)); }
  function rigPick(k, ch, o, om) { var mn = k.indexOf('mn.') === 0, src = mn ? om : o, sh = mn ? SHIPPED.molly : SHIPPED[ch]; return src && rigOk(src[k], RIGDEF[k]) ? src[k] : sh && rigOk(sh[k], RIGDEF[k]) ? sh[k] : RIGDEF[k]; }
  function rigCfgFor(ch) {                                       // a runner's stats, read fresh (for the Characters page's cards)
    var so = rigStored(ch), o = so[0], c = {};
    for (var k in RIGDEF) c[k] = rigPick(k, ch, o, so[1]);
    c.scale = o && typeof o.scale === 'number' ? o.scale : typeof SHIPPED[ch].scale === 'number' ? SHIPPED[ch].scale : 1; c.__who = ch; return c;
  }
  function rigRead() {
    var so = rigStored(CHAR), o = so[0], om = so[1];
    if (o && o['stat.gripZ'] === undefined && typeof o['stat.grip'] === 'number') o['stat.gripZ'] = o['stat.grip'] / 2;   // stats saved by an older build kept her grip in units/s^2 (1 Zip = 2 units)
    for (var k in RIGDEF) RIGCFG[k] = rigPick(k, CHAR, o, om);
    RIGCFG['barrier.radius'] = Math.max(0.2, RIGCFG['barrier.radius']); RIGCFG['m.drift.rate'] = Math.max(0.1, RIGCFG['m.drift.rate']);   // a Barrier with no size or a drift that never settles would break her spin and her lean
    applyStats(); if (typeof enRestyle === 'function') enRestyle(); applyCharColors();
  }
  function applyCharColors() {                                   // playing as Comet: her Power line, charge bar and every Seg take the colour of her stars (the Segs keep their brightness, only the hue moves)
    var com = CHAR === 'comet', cs = RIGCFG['comet.cStar'], c = new THREE.Color(cs), rgb = function (a) { return 'rgba(' + Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255) + ',' + a + ')'; };
    var sl = document.getElementById('segline'); if (sl) { sl.style.background = com ? cs : ''; sl.style.boxShadow = com ? '0 0 8px 2px ' + rgb(0.9) + ', 0 0 24px 7px ' + rgb(0.5) : ''; }
    var cf = document.getElementById('chfill'), ct = document.getElementById('chtrack'); if (cf) { cf.style.stroke = com ? cs : ''; cf.style.filter = com ? 'drop-shadow(0 0 2px ' + rgb(0.8) + ')' : ''; } if (ct) ct.style.stroke = com ? cs : '';
    var gm = document.querySelector('#segs .gem'); if (gm) { gm.style.background = com ? cs : ''; gm.style.boxShadow = com ? '0 0 6px ' + rgb(0.9) : ''; }
    var hue = function (orig) { var o = new THREE.Color(orig); if (!com) return o; var h1 = {}, h2 = {}; o.getHSL(h1); c.getHSL(h2); return o.setHSL(h2.h, h1.s, h1.l); };
    if (typeof segMesh !== 'undefined' && segMesh) { segMesh.material.color.copy(hue(0xff2a1f)); segGlow.material.color.copy(hue(0xff3a2a)); }
  }
  function applyStats() {                                        // Molly's stat card: the numbers the Rig Editor's Stats tab sets. They replace the built-in values for running, braking, jumping, turning, falling and hearts
    var C = RIGCFG;
    // any number can be typed into a stat, so the ones that would break the game (a negative jump, no grip at all, a top speed below nothing) are held to the nearest value that still works
    RUN_SPEED = Math.max(1, C['stat.top']) * TILE; ACCEL_TIME = Math.max(0.5, C['stat.accelT']); ACCEL = RUN_SPEED / ACCEL_TIME; BRAKE_MULT = Math.max(0, C['stat.brake']);
    GRAV = Math.max(1, C['stat.grav']) * TILE; GRIP = Math.max(0.5, C['stat.gripZ']) * TILE; JUMP_H = Math.max(0, C['stat.jumpH']); JUMP_V = Math.sqrt(2 * GRAV * JUMP_H); FALL_MAX = Math.max(1, C['stat.fall']) * TILE; SLAM_ACC = Math.max(1, C['stat.slamAcc']) * TILE; SLAM_MAX = Math.max(1, C['stat.slamMax']) * TILE; STRAFE_DIST = Math.max(0.25, C['stat.strafe']);   // (Grass Canyon's big curve keeps the radius it was built with, TURN_R: it is part of the level, not of her stats)
    WALL_FADE = C['stat.fadeWall'] ? 1 : 0; SLOPE_FADE = C['stat.fadeSlope'] ? 1 : 0; DRIFT_GRIP = C['stat.driftGrip'] === undefined ? 1 : Math.max(0, C['stat.driftGrip']);
    MAXHP = Math.max(1, Math.min(12, Math.round(C['stat.hearts']))); WALL_GRIP = Math.max(0, C['stat.wallGrip']); FRIC = Math.max(0, C['stat.fric']) * TILE;
    PLAYER_H = Math.max(1.2, C['stat.colH']) * mollyScale; PLAYER_RADIUS = Math.max(0.1, C['stat.colW'] / 2) * mollyScale; SLIDE_H = mollyScale;   // her collision box: how tall standing (a slide squeezes it to 1) and how wide, all times the model's Overall scale
    if (typeof hovOn !== 'undefined' && hovOn) {                   // Comet's Hover: its own movement stats while it is on
      RUN_SPEED = Math.max(1, C['comet.hov.top']) * TILE; ACCEL_TIME = Math.max(0.5, C['comet.hov.accelT']); ACCEL = RUN_SPEED / ACCEL_TIME; BRAKE_MULT = Math.max(0, C['comet.hov.brake']);
      GRIP = Math.max(0.5, C['comet.hov.gripZ']) * TILE; JUMP_H = Math.max(0, C['comet.hov.jumpH']); JUMP_V = Math.sqrt(2 * GRAV * JUMP_H); FRIC = Math.max(0, C['comet.hov.fric']) * TILE;
    }
    if (typeof heartsEl !== 'undefined' && heartsEl) { if (hp > MAXHP) hp = MAXHP; drawHearts(); }
  }
  window.__statCardHTML = function (c, compact) {                // one card for the Characters page, the pause menu and the Rig Editor (inline styles, so it looks the same in all three)
    function g(k, d) { return typeof c[k] === 'number' ? c[k] : d; }
    var top = Math.max(1, g('stat.top', 80)), aT = Math.max(0.5, g('stat.accelT', 7)), br = Math.max(0, g('stat.brake', 3)), jh = Math.max(0, g('stat.jumpH', 7.2)), gz = Math.max(0.5, g('stat.gripZ', 20)), gv = Math.max(1, g('stat.grav', 20)), fl = Math.max(1, g('stat.fall', 50)), hh = Math.max(1, Math.min(12, Math.round(g('stat.hearts', 3))));   // the same limits the game applies (grip and gravity are kept in Zips/s²: 1 Zip = 2 units)
    var acc = top / aT, fr = Math.max(0, g('stat.fric', 11.4)), wgp = Math.max(0, g('stat.wallGrip', 1)), air = 2 * Math.sqrt(2 * gv * 2 * jh) / (gv * 2), brk = fr * br, f1 = function (v) { return isFinite(v) ? (Math.round(v * 10) / 10).toString() : '—'; };
    var scl = Math.max(0.05, Math.min(20, g('scale', 1)));       // her Overall scale: the collision box is the two stats times this
    var tiles = [['Height', f1(Math.max(1.2, g('stat.colH', 3.6)) * scl), 'units'], ['Width', f1(Math.max(0.2, g('stat.colW', 1)) * scl), 'units'], ['Hearts', String(hh), ''], ['Top speed', f1(top), 'Zips'], ['Acceleration', f1(acc), 'Zips/s²'], ['Braking', f1(brk), 'Zips/s²'], ['Jump Height', f1(jh), 'units'], ['Gravity', f1(gv), 'Zips/s²'], ['Max Fall Speed', f1(fl), 'Zips'], ['Sideways Grip', f1(gz), 'Zips/s²'], ['Wall Grip', '×' + f1(wgp), g('stat.fadeWall', 1) ? 'fades with the bank' : 'at any bank'], ['Friction', f1(fr), 'Zips/s²']];
    var h = '<div style="background:#f6ecdd;color:#3a2616;border-radius:14px;padding:12px 14px;font-family:inherit;text-align:left;box-sizing:border-box">';
    h += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:3px solid #3a2616;padding-bottom:4px;margin-bottom:8px"><b style="font-size:' + (compact ? 17 : 22) + 'px;letter-spacing:.08em">' + (c.__who === 'comet' ? 'COMET' : 'MOLLY') + '</b><span style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.7">Runner</span></div>';
    h += '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">';
    tiles.forEach(function (t) { h += '<div style="background:#ecdcc3;border-radius:8px;padding:5px 7px;min-width:0"><div style="font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;opacity:.7">' + t[0] + '</div><div style="font:600 ' + (compact ? 15 : 19) + 'px/1.15 monospace">' + t[1] + '</div><div style="font-size:10px;opacity:.7">' + t[2] + '</div></div>'; });
    h += '</div>';
    if (!compact) {
      var rows = [['Time to Top Speed', f1(aT) + ' s over ' + f1(top * 2 * aT / 2) + ' units'], ['Top Speed to a Stop (braking)', f1(top / brk) + ' s over ' + f1(top * 2 * (top / brk) / 2) + ' units'], ['Friction', f1(fr) + ' Zips/s² · hills steeper than ' + f1(Math.asin(Math.min(1, fr / gv)) * 57.29578) + '° speed her up'], ['Turn Radius at Top Speed', f1(top * 2 * top / gz) + ' units'], ['Grip on Slopes', g('stat.fadeSlope', 0) ? 'fades with the slope (× its cosine)' : 'the same on any slope'], ['Jump', f1(air) + ' s in the air · ' + f1(top * 2 * air) + ' units at top speed'],
        ['Drift', f1(g('m.drift.angle', 15)) + '° shift · needs ' + f1(g('m.drift.minZips', 30)) + ' Zips · ' + f1(g('m.drift.cool', 1)) + ' s cooldown'], ['Barrier', 'costs 12 Power to start · half acceleration · no strafe or drift']];
      if (c.__who === 'comet') rows.splice(rows.length - 1, 1, ['Star Throw (Q / E)', f1(g('comet.star.dmg', 0.5)) + ' heart · ' + f1(g('comet.star.range', 50)) + ' units · ' + f1(g('comet.star.cool', 2)) + ' s cooldown · costs ' + f1(g('comet.star.cost', 1)) + ' Power; hold to charge'],
        ['Hover (2)', 'costs ' + f1(g('comet.hov.cost', 6)) + ' Power to start, ' + f1(g('comet.hov.drain', 1)) + ' a second · top speed ' + f1(g('comet.hov.top', 80)) + ' Zips'], ['Fly (Space, hovering)', f1(g('comet.fly.drain', 4)) + ' more Power a second'], ['No Strafe or Barrier', '']);
      h += '<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:12px">';
      rows.forEach(function (r) { h += '<tr><td style="padding:3px 4px 3px 0;border-top:1px solid #d9c7a8;opacity:.75">' + r[0] + '</td><td style="padding:3px 0;border-top:1px solid #d9c7a8;text-align:right;font-family:monospace">' + r[1] + '</td></tr>'; });
      h += '</table>';
    }
    return h + '</div>';
  };
  function refreshStatCards() {
    var a = document.getElementById('charStats'), b = document.getElementById('pauseStats'), c = {}; for (var k in RIGCFG) c[k] = RIGCFG[k]; c.scale = mollyScale; c.__who = CHAR;
    if (b) b.innerHTML = window.__statCardHTML(c, true);
    if (a) {                                                    // the Characters page: both runners, and which one she plays as
      var h = '';
      ['molly', 'comet'].forEach(function (ch) {
        var cc = ch === CHAR ? c : rigCfgFor(ch), on = ch === CHAR;
        h += '<div style="margin:0 0 14px">' + window.__statCardHTML(cc, false) + '<button class="go2 pickChar" type="button" data-ch="' + ch + '" aria-pressed="' + on + '" style="margin-top:6px;width:100%' + (on ? ';opacity:.75' : '') + '">' + (on ? 'Playing as ' : 'Play as ') + (ch === 'comet' ? 'Comet' : 'Molly') + '</button></div>';
      });
      a.innerHTML = h;
      a.querySelectorAll('.pickChar').forEach(function (bt) { bt.onclick = function () { setChar(bt.getAttribute('data-ch')); }; });
    }
  }  // (the cards show her collision box as it really is: times the Overall scale of the model in use)
