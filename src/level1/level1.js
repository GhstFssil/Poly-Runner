  // ---- Valley: rolling grass between two cliff walls and a back wall, running 3,750 tiles toward -Z, then a narrow curve climbing out ----
  var VALLEY_TILES = 100;
  var LENGTH_TILES = 3750;              // the valley ends in a cliff this far from the start
  var LEDGE_FREE_TILES = 2000;          // no ledges until she has run this far
  var HALF = VALLEY_TILES * TILE / 2;   // 100 units from the centre line to each side wall, and from the start to the back wall
  var GRID = 2.5;                         // size of one terrain facet
  var EXTENT = 150;                       // terrain reaches 150 to each side and 150 behind (the cliffs are 50 thick)
  var WALL_HEIGHT = 46;
  var END = LENGTH_TILES * TILE;        // z = -END is the end wall
  var LEDGE_START = LEDGE_FREE_TILES * TILE;
  // Past the 7,500-unit mark the valley closes in and curves away. The walls pinch from 100 to 25 units either side of
  // centre at 45 degrees, then follow a 180-degree left-hand arc whose centre line has exactly the radius she can hold at top
  // speed (speed^2 / GRIP). The floor climbs along the arc until it is as high as the wall tops, and the channel opens
  // into a bare plateau.
  var FUN_LEN = 75, CH_HALF = 25;
  var TURN_R = RUN_SPEED * RUN_SPEED / GRIP;
  var FUN_Z1 = -END - FUN_LEN, ARC_CX = -TURN_R, ARC_CZ = FUN_Z1;
  var PL_X = ARC_CX - TURN_R, PL_HX = 25, PL_HZ = 30, PL_ZC = ARC_CZ + PL_HZ;   // a short stub where the channel meets the plateau, so the floor carries on level (no apron)
  // The plateau is the high ground the valley is cut into. It runs from the valley's west wall (so the wall tops are its surface)
  // out to 5,000 units beyond the channel mouth, and from 600 past the arc's far side to 300 behind the start. Its other three
  // edges are cliffs into nothing, with an invisible barrier just short of each.
  // The plateau is a five-cornered shape: its east edge is the valley's west rim (x -100, z -7575 to -6800), its north edge runs west
  // along z -7575 (the line through the arc's centre) to x -3500, its west edge is 125 long (z -7575 to -7450), and its south edge
  // runs straight west along z -6800 as far as the mouth of the curve (x -1280) before tapering in to (-3500, -7450). The arc's own
  // rock keeps a rim round it, then drops away.
  var PX0 = -3500, PX1 = -HALF, PZ0 = ARC_CZ, PZ1 = -5950, PXW = -4300, PZ1_OLD = -6800, PZ_W = -7450;     // bounding box; PZ1 is the south edge, PZ_W the low corner on the west edge
  var SL_DX = PX0 - PL_X, SL_DZ = PZ_W - PZ1_OLD, SL_LEN = Math.sqrt(SL_DX * SL_DX + SL_DZ * SL_DZ), SL_NX = SL_DZ / SL_LEN, SL_NZ = -SL_DX / SL_LEN;   // SL_N points out over the tapering cliff
  var RIM_R = TURN_R + CH_HALF + 40;
  var pdN = 0, pdW = 0, pdE = 0, pdS = 0, pdF = 0, pdH = 0;
  // How far (x, z) lies outside the plateau (negative: inside), counting the rock rim round the arc as part of it.
  function plateauOut(x, z) {
    pdN = ARC_CZ - z; pdW = PXW - x; pdE = x - PX1; pdF = z - PZ1; pdS = -1e9;   // the south edge now runs straight along the second valley's far rim (no taper)
    
    var dP = Math.max(pdN, pdW, pdE, pdF, pdS);
    pdH = z <= ARC_CZ ? Math.sqrt((x - ARC_CX) * (x - ARC_CX) + (z - ARC_CZ) * (z - ARC_CZ)) - RIM_R : 1e9;
    return Math.min(dP, pdH);
  }
  var HILL_MIN = 20, HILL_MAX = 100;
  var PLANE_Y = WALL_HEIGHT - 100, PLANE_LEN = 1500, PLANE_Z0 = -8500, PLANE_Z1 = -6100;   // a flat plane 100 units below the plateau, west of its end
  var CHUNK = 100;                        // the world is built in square tiles this size, made ahead of her and dropped behind her
  var VIEW_AHEAD = 680 * GFX.fog, VIEW_BEHIND = 340;   // how far from her the world is kept built (fog hides anything farther)
  // Smooth random field in [0,1] that never repeats (value noise on a lattice, hashed so it works at any distance)
  function vnoise(x, z, k) {
    var ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
    fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
    var a = rand01(ix, iz, k), b = rand01(ix + 1, iz, k), c = rand01(ix, iz + 1, k), d = rand01(ix + 1, iz + 1, k);
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  }
  function stepAt(n, t) {              // 0 below the threshold, 1 above it, with a very short slope between
    var u = (n - t) / 0.0006 + 0.5;
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    return u * u * (3 - 2 * u);
  }
  // Ledges: wherever a slow random field crosses a threshold the ground steps up by 0.5 to 3 units. The contour lines of
  // the field make irregular shelves, mesas and drops that come and go at random, none taller than she can jump.
  // How tall a ledge is at this spot: anywhere from half a unit to three, changing slowly along its length.
  var GEN_LEDGES = false;
  function ledgeStep(x, z, k) {
    var v = (vnoise(x / 75 + k * 3.1, z / 75 - k * 1.7, 20 + k) - 0.15) / 0.7;
    v = v < 0 ? 0 : v > 1 ? 1 : v;
    var hh = 0.5 + 0.5 * Math.round(5 * v);
    var t = (-z - END * 0.4) / (END * 0.2); t = t < 0 ? 0 : t > 1 ? 1 : t;   // in the second half of the valley every shelf grows to the full 3 units (and there are fewer of them, see ledgeH), so only a few big ridges are left
    return 0.5 * Math.round((hh + (3 - hh) * t) * 2);                      // in half-unit levels, so a shelf's top stays flat instead of stepping a hair every cell
  }
  function ledgeH(x, z) { return sbLedge(x, z); }               // the play world's ledges (see worldH0); the old levels' are oldLedgeH
  function oldLedgeH(x, z) {
    if (x > 20000) return ovLedge(x, z);                  // (level 2: only the Sink's maze has any)
    if (!GEN_LEDGES) return 0;                            // Grass Canyon's generated ledges are switched off: ledges are placed by hand now
    if (x > HALF || x < -HALF) return 0;                  // ledges belong to the first valley alone (cells are sampled at their centres, so the cut falls exactly on its walls): none in the cave, the second valley or on the plateau
    var n = 0.65 * vnoise(x / 270, z / 270, 11) + 0.35 * vnoise(x / 118.5 + 5.3, z / 118.5 - 2.1, 12);   // spread about 30% wider apart than before, so fewer ledges
    var q = (z + LEDGE_START) / -300; q = q < 0 ? 0 : q > 1 ? 1 : q;   // none before LEDGE_START, then they come in over 300 units
    var e = (z + END) / 500; e = e < 0 ? 0 : e > 1 ? 1 : e;             // and go out again over the last 500 units before the funnel
    var tl = (-z - END * 0.4) / (END * 0.2); tl = tl < 0 ? 0 : tl > 1 ? 1 : tl;
    var sh = (1 - q * q * (3 - 2 * q) * e * e * (3 - 2 * e)) * 0.75 + 0.18 * tl;    // the fade moves the contour thresholds, so shelves open and close at their full height instead of shrinking into small, choppy steps
    var h = ledgeStep(x, z, 0) * stepAt(n, 0.55 + sh) + ledgeStep(x, z, 1) * stepAt(n, 0.68 + sh) + ledgeStep(x, z, 2) * stepAt(n, 0.32 + sh);
    var r = Math.sqrt(x * x + z * z);                 // the starting meadow stays flat
    var f = (r - 28) / 30; f = f < 0 ? 0 : f > 1 ? 1 : f;
    var m = (x + 600) / 200; m = m < 0 ? 0 : m > 1 ? 1 : m;             // never out on the plateau
    return h * f * f * (3 - 2 * f) * m * m * (3 - 2 * m);
  }
  function terrainFlat(x, z) {
    return 0.95 * Math.sin(x * 0.045 + 0.7) * Math.cos(z * 0.037 - 0.4)
         + 0.60 * Math.sin((x + z) * 0.07 + 1.3)
         + 0.35 * Math.sin(x * 0.11 - z * 0.09 + 2.0);
  }
  function terrainH(x, z) { return terrainFlat(x, z) + ledgeH(x, z); }
  // Ledges are cut square: each 2.5-unit cell of the ground carries one ledge height (sampled at its centre), so a ledge
  // is a flat shelf with a vertical face where the next cell is a different height.
  function ledgeCell(ix, iz) { ledI = NaN; ledA = 0; var v = ledgeH((ix + 0.5) * GRID, (iz + 0.5) * GRID); ledCA = ledA; ledCI = ledI; return v; }
  // The height of the ground she actually stands on: the same flat triangles the mesh draws, so her feet never float or sink.
  var gcI = 1e9, gcJ = 1e9, gcA = 0, gcB = 0, gcC = 0, gcD = 0, ggx = 0, ggz = 0, gcBk = false, gcS = new Float64Array(36), BK_N = 5, ggxB = 0, ggzB = 0;   // a cell beside a steep bank is cut into BK_N x BK_N pieces, the ground and the picture alike
  var lnH = 0, lnGX = 0, lnGZ = 0;
  function narY(p, ps) { var lf = p.lf; return p.y0 + (lf && lf.flat ? l2RiseG(ps, lf.sl0, lf.sl1, lf.E) : p.dy ? p.dy * smooth01(ps / p.len) : 0); }   // the height of the narrow path's floor ps along piece p
  function narSl(p, ps) {                                    // and how steeply it climbs there
    var lf = p.lf; if (lf && lf.flat) return ps < lf.E ? lf.sl0 + (lf.sl1 - lf.sl0) * ps / lf.E : lf.sl1;
    if (p.dy) { var t = ps / p.len; t = t < 0 ? 0 : t > 1 ? 1 : t; return p.dy * 6 * t * (1 - t) / p.len; }
    return 0;
  }
  function narHW(x, z) {                                    // half the path's width: 4.6 between the rocks, opening out to 8 (16 wide) where it leaves the crags for the bay
    return L2_NHW + 3.4 * Math.max(smooth01((1330 - Math.hypot(x - L2_X, z + 741)) / 80), smooth01(ovKAt(x, z) / 0.15));
  }
  function laneAt(x, z) {                                   // (none in a bare Oceana) on the flat of the narrow path out of the cave? Then the ground is exactly the path's own height, not the mesh's (the mesh cannot keep a lane 6 wide perfectly smooth)
    if (L2_BARE) return false;
    var nd = l2Dist(x, z);
    if (L2_PI < L2_NAR0 || nd > narHW(x, z) + 0.3) return false;
    if (L2_PI === L2_PIECES.length - 1 && (x - L2_PIECES[L2_PI].x0) * L2_PIECES[L2_PI].hx + (z - L2_PIECES[L2_PI].z0) * L2_PIECES[L2_PI].hz > L2_PIECES[L2_PI].len) return false;   // past the path's end there is no floor
    var p = L2_PIECES[L2_PI], sl = narSl(p, L2_PS);
    lnH = narY(p, L2_PS);
    if (sl) { var q = l2PointAt(L2_S); lnGX = sl * q[2]; lnGZ = sl * q[3]; } else { lnGX = 0; lnGZ = 0; }
    return true;
  }
  function groundH(x, z) {
    var h = groundH0(x, z);
    if (level === 3 && SB) {
      if (SB.movers.length) { var mt = sbMoverTop(x, z, sbMovPy(x, z)); if (mt > h) h = mt; }
      if (SB.slabH) { var sst = sbSlabTop(x, z, sbMovPy(x, z)); if (sst > h) h = sst; }   // a floating slab of path
      if (SB.terrain === 'level2') { var dkt = sbDeckTop(x, z, sbMovPy(x, z)); if (dkt > h) h = dkt; }   // Oceana: the path's own deck, unless the ground stands higher than it here
      if (SB.caveZone && player.position.x - x < 8 && x - player.position.x < 8 && player.position.z - z < 8 && z - player.position.z < 8) {   // inside a tunnel (or its mouth) her ground is the tunnel's floor
        var cq = sbCaveQ(SB.caveZone, x, z), py = player.position.y; if (cq && py < cq.rf + 0.2 && py >= cq.fl - 4) return cq.fl;
      }
      if (SB.shafts.length) { var shf = sbShaftIn(x, z, 0); if (shf) return shf.floor; }   // inside a shaft's outline the ground is its floor, and the wall is exactly the outline
    }
    return h;
  }
  function sbLane(x, z) { return laneAt(L2_X + x - L3_X, z + L2_SBZ); }   // Sandbox, Oceana Crags' ground: the narrow path out of the cave is the real level's own lane, exactly as it is there
  function groundH0(x, z) {
    if (level === 3 && SB && SB.terrain === 'level2' && sbLane(x, z)) return lnH;
    var ix = Math.floor(x / GRID), iz = Math.floor(z / GRID), gx = ix * GRID, gz = iz * GRID;
    if (ix !== gcI || iz !== gcJ) {
      var L = ledgeCell(ix, iz), La = ledCA, LI = ledCI;
      l3Bk = 0; gcA = cornerY(gx, gz, L, La, LI); var bk0 = l3Bk; l3Bk = 0; gcB = cornerY(gx + GRID, gz, L, La, LI); bk0 = bk0 || l3Bk; l3Bk = 0; gcC = cornerY(gx, gz + GRID, L, La, LI); bk0 = bk0 || l3Bk; l3Bk = 0; gcD = cornerY(gx + GRID, gz + GRID, L, La, LI); bk0 = bk0 || l3Bk;
      gcBk = !!bk0 && level === 3;
      if (gcBk) for (var sj = 0; sj <= BK_N; sj++) for (var si = 0; si <= BK_N; si++) gcS[sj * (BK_N + 1) + si] = cornerY(gx + si * GRID / BK_N, gz + sj * GRID / BK_N, L, La, LI);
      gcI = ix; gcJ = iz;
    }
    if (gcBk) {
      var su = (x - gx) / GRID * BK_N, sv = (z - gz) / GRID * BK_N, bi = Math.min(BK_N - 1, Math.max(0, Math.floor(su))), bj = Math.min(BK_N - 1, Math.max(0, Math.floor(sv))), fu = su - bi, fv = sv - bj, W6 = BK_N + 1, hs = GRID / BK_N;
      var hA = gcS[bj * W6 + bi], hB = gcS[bj * W6 + bi + 1], hC = gcS[(bj + 1) * W6 + bi], hD = gcS[(bj + 1) * W6 + bi + 1];
      if (fu + fv <= 1) { ggxB = (hB - hA) / hs; ggzB = (hC - hA) / hs; return hA + fu * (hB - hA) + fv * (hC - hA); }
      ggxB = (hD - hC) / hs; ggzB = (hD - hB) / hs; return hD + (1 - fu) * (hC - hD) + (1 - fv) * (hB - hD);
    }
    var u = (x - gx) / GRID, v = (z - gz) / GRID;
    if (u + v <= 1) return gcA + u * (gcB - gcA) + v * (gcC - gcA);
    return gcD + (1 - u) * (gcC - gcD) + (1 - v) * (gcB - gcD);
  }
  // The slope of the very triangle she stands on (ggx, ggz = rise per unit run), so the foot of a ledge face is not mistaken for a hillside.
  var ggPath = false;   // set by groundGrad: the slope came from a running surface (a lane, deck, slab, platform, banked path, shaft or cave floor), not the open ground
  function groundGrad(x, z) {
    ggPath = true;
    if (level === 3 && SB && SB.terrain === 'level2' && sbLane(x, z)) { ggx = lnGX; ggz = lnGZ; return; }
    if (level === 3 && SB && SB.movers.length && sbMoverTop(x, z, sbMovPy(x, z)) > groundH0(x, z)) { ggx = 0; ggz = 0; return; }
    if (level === 3 && SB && SB.terrain === 'level2') { var dpy = sbMovPy(x, z), dk0 = sbDeckTop(x, z, dpy);   // on one of Oceana's path decks: the deck's own slope, from points on it
      if (dk0 > groundH0(x, z)) { var dd = 0.4, da1 = sbDeckTop(x + dd, z, dpy), da2 = sbDeckTop(x - dd, z, dpy), db1 = sbDeckTop(x, z + dd, dpy), db2 = sbDeckTop(x, z - dd, dpy);
        ggx = da1 > -1e8 && da2 > -1e8 ? (da1 - da2) / (2 * dd) : da1 > -1e8 ? (da1 - dk0) / dd : da2 > -1e8 ? (dk0 - da2) / dd : 0; ggz = db1 > -1e8 && db2 > -1e8 ? (db1 - db2) / (2 * dd) : db1 > -1e8 ? (db1 - dk0) / dd : db2 > -1e8 ? (dk0 - db2) / dd : 0; return; } }
    if (level === 3 && SB && SB.slabH) { var spy = sbMovPy(x, z), st0 = sbSlabTop(x, z, spy);
      if (st0 > groundH0(x, z)) { var sd = 0.4, sa1 = sbSlabTop(x + sd, z, spy), sa2 = sbSlabTop(x - sd, z, spy), sb1 = sbSlabTop(x, z + sd, spy), sb2 = sbSlabTop(x, z - sd, spy); ggx = sa1 > -1e8 && sa2 > -1e8 ? (sa1 - sa2) / (2 * sd) : 0; ggz = sb1 > -1e8 && sb2 > -1e8 ? (sb1 - sb2) / (2 * sd) : 0; return; } }
    if (level === 3 && SB && SB.caveZone) { var cq2 = sbCaveQ(SB.caveZone, x, z), py2 = player.position.y; if (cq2 && py2 < cq2.rf + 0.2 && py2 >= cq2.fl - 4) {
        var ce2 = cq2.e, la = Math.max(-ce2.hw, Math.min(ce2.hw, cq2.lat)), ra = polyRange(ce2.pts, Math.max(-ce2.hw, la - 0.3)), rb = polyRange(ce2.pts, Math.min(ce2.hw, la + 0.3)), dl = 0;   // the floor drops along the tunnel as it descends, and tilts sideways in a round or pointed cross-section
        if (ra && rb) dl = (rb[0] - ra[0]) / ce2.cp / Math.max(0.01, Math.min(ce2.hw, la + 0.3) - Math.max(-ce2.hw, la - 0.3));
        ggx = -ce2.Thx * ce2.tn + ce2.Lx * dl; ggz = -ce2.Thz * ce2.tn + ce2.Lz * dl; return; } }
    if (level === 3 && SB && SB.shafts.length && sbShaftIn(x, z, 0)) { ggx = 0; ggz = 0; return; }
    groundH0(x, z);
    if (gcBk) { ggx = ggxB; ggz = ggzB; return; }
    ggPath = false;
    var gx = Math.floor(x / GRID) * GRID, gz = Math.floor(z / GRID) * GRID;
    if ((x - gx) / GRID + (z - gz) / GRID <= 1) { ggx = (gcB - gcA) / GRID; ggz = (gcC - gcA) / GRID; }
    else { ggx = (gcD - gcC) / GRID; ggz = (gcD - gcB) / GRID; }
  }
  // How far (x, z) is inside the rock (negative: open ground), the floor height there, and how tall the walls beside it
  // stand above that floor. The open ground is the union of four shapes: the valley, the funnel, the arc and the plateau.
  var WALL_RAISE = 100;                    // the first valley's side walls (and its back wall) are 100 taller than the plateau, down to z -6700
  var wd = 0, wF = 0, wR = 0;
  function smooth01(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
  function wallField(x, z) {
    var ax = Math.abs(x);
    var d1 = Math.max(ax - HALF, z - HALF, -END - z);
    var hw = CH_HALF + (z - FUN_Z1); hw = hw < CH_HALF ? CH_HALF : hw > HALF ? HALF : hw;
    var d2 = Math.max((ax - hw) * 0.70711, FUN_Z1 - z, z + END);
    var vx = x - ARC_CX, vz = z - ARC_CZ, d3 = 1e6, ringF = 0;
    if (vz <= 0) {
      d3 = Math.abs(Math.sqrt(vx * vx + vz * vz) - TURN_R) - CH_HALF;
      ringF = WALL_HEIGHT * smooth01(Math.atan2(0 - vz, vx) / Math.PI);   // the floor climbs smoothly along the whole turn
    }
    var d4 = Math.max(Math.abs(x - PL_X) - PL_HX, Math.abs(z - PL_ZC) - PL_HZ);
    var dm = Math.min(d1, d2, d3, d4);
    var w1 = Math.exp((dm - d1) / 8), w2 = Math.exp((dm - d2) / 8), w3 = Math.exp((dm - d3) / 8), w4 = Math.exp((dm - d4) / 8);
    var sw = w1 + w2 + w3 + w4;
    wd = dm;
    wF = (w3 * ringF + w4 * WALL_HEIGHT) / sw;
    wR = ((w1 + w2) * WALL_HEIGHT + w3 * (WALL_HEIGHT - ringF)) / sw + WALL_RAISE * (w1 / sw) * (x < 0 ? 1 - smooth01((dm - 45) / 50) : 1) * (z >= -6700 ? 1 : z <= -6800 ? 0 : 1 - smooth01((-6700 - z) / 100));   // the valley's two walls stand 100 higher, back to where the plateau begins   // along the arc the rim stays level while the floor rises to meet it; the apron has no walls
  }
  // Mounds on the plateau: round, shallow domes, as tall at every side of the base and highest in the middle. They are 7 to 25 units
  // tall and as wide as it takes to keep every slope under what she can climb (the wider the taller). Each 300-unit cell holds at
  // most one, wholly inside the cell, so they never overlap. They keep clear of the canyons, the apron, the arc, the cliffs and
  // the second checkpoint.
  var MOUND_CELL = 240, moundCache = new Map();
  function chainDist(x, z) {                                   // distance to the Seg chain's arc (radius 640, 68 degrees from the mouth), so no mound sits on it
    var ccx = PL_X - 640, ccz = ARC_CZ + 30, a = Math.atan2(z - ccz, x - ccx);
    a = a < 0 ? 0 : a > 1.19 ? 1.19 : a;
    return Math.hypot(x - (ccx + 640 * Math.cos(a)), z - (ccz + 640 * Math.sin(a)));
  }
  function moundAt(ci, cj) {
    var key = cj * 8192 + ci + 4096, m = moundCache.get(key);
    if (m !== undefined) return m;
    m = null;
    var rnd = cellRng(ci + 9000, cj - 9000);
    var occ = rnd(), hh0 = 7 + 18 * rnd(), wk = 4.2 + 1.3 * rnd();
    if (occ < 0.95) for (var tryN = 0; tryN < 14 && m === null; tryN++) {                   // if it will not fit here, try another spot and a smaller one
      var hh = Math.max(5, hh0 * (1 - 0.07 * tryN)), r = hh * wk;
      if (r > MOUND_CELL / 2 - 1) { r = MOUND_CELL / 2 - 1; hh = r / wk; }                // a dome never reaches past its own cell                            // steepest slope hh * pi / (2r) is at most 0.37
      var cx = (ci + 0.5) * MOUND_CELL + (rnd() - 0.5) * (MOUND_CELL - 2 * r - 2), cz = (cj + 0.5) * MOUND_CELL + (rnd() - 0.5) * (MOUND_CELL - 2 * r - 2);
      var g2x = cx - CP2_X, g2z = cz - CP2_Z;
      if (plateauOut(cx, cz) < -(r + 10) && cz > ARC_CZ + r + 10 && cx < PX1 - r - 40 &&
          Math.max(Math.abs(cx - PL_X) - PL_HX, Math.abs(cz - PL_ZC) - PL_HZ) > r + 10 && g2x * g2x + g2z * g2z > (r + 60) * (r + 60) && chainDist(cx, cz) > r + 14 && valley2Dist(cx, cz) > V2_HALF + V2_RIM + r + 10) {
        m = { x: cx, z: cz, r: r, h: hh };
      }
    }
    moundCache.set(key, m);
    return m;
  }
  // A second, finer layer of small mounds (5 to 11 units tall) fills the gaps between the big ones: one per 120-unit cell at most,
  // kept clear of every big mound and of everything the big ones keep clear of.
  var MOUND_CELL_B = 120, moundCacheB = new Map();
  function moundBAt(ci, cj) {
    var key = cj * 8192 + ci + 4096, m = moundCacheB.get(key);
    if (m !== undefined) return m;
    m = null;
    var rnd = cellRng(ci + 17000, cj - 17000);
    var occ = rnd(), hh0 = 5 + 6 * rnd(), wk = 4.2 + 1.3 * rnd();
    if (occ < 0.9) for (var tryN = 0; tryN < 8 && m === null; tryN++) {
      var hh = Math.max(4, hh0 * (1 - 0.08 * tryN)), r = hh * wk;
      if (r > MOUND_CELL_B / 2 - 1) { r = MOUND_CELL_B / 2 - 1; hh = r / wk; }
      var cx = (ci + 0.5) * MOUND_CELL_B + (rnd() - 0.5) * (MOUND_CELL_B - 2 * r - 2), cz = (cj + 0.5) * MOUND_CELL_B + (rnd() - 0.5) * (MOUND_CELL_B - 2 * r - 2);
      var g2x = cx - CP2_X, g2z = cz - CP2_Z;
      if (plateauOut(cx, cz) < -(r + 10) && cz > ARC_CZ + r + 10 && cx < PX1 - r - 40 &&
          Math.max(Math.abs(cx - PL_X) - PL_HX, Math.abs(cz - PL_ZC) - PL_HZ) > r + 10 && g2x * g2x + g2z * g2z > (r + 60) * (r + 60) && chainDist(cx, cz) > r + 14 && valley2Dist(cx, cz) > V2_HALF + V2_RIM + r + 10) {
        var clear = true, ca = Math.floor(cx / MOUND_CELL), cb = Math.floor(cz / MOUND_CELL);
        for (var da = -1; da <= 1 && clear; da++) for (var db = -1; db <= 1; db++) {
          var big = moundAt(ca + da, cb + db);
          if (big !== null && Math.hypot(big.x - cx, big.z - cz) < big.r + r + 8) { clear = false; break; }
        }
        if (clear) m = { x: cx, z: cz, r: r, h: hh };
      }
    }
    moundCacheB.set(key, m);
    return m;
  }
  function domeAt(m, x, z) {
    if (m === null) return 0;
    var dx = x - m.x, dz = z - m.z, d2 = dx * dx + dz * dz;
    if (d2 >= m.r * m.r) return 0;
    return m.h * 0.5 * (1 + Math.cos(Math.PI * Math.sqrt(d2) / m.r));       // a smooth dome: level at the rim, flat on top
  }
  function hillH(x, z) {
    return domeAt(moundAt(Math.floor(x / MOUND_CELL), Math.floor(z / MOUND_CELL)), x, z) +
           domeAt(moundBAt(Math.floor(x / MOUND_CELL_B), Math.floor(z / MOUND_CELL_B)), x, z);
  }
  // The ramp is straight, 125 wide like the plateau's end, along -X. Its slope eases up from level to 45 degrees over 50 units, holds
  // 45 degrees for 350, and eases back to level over 150 more, onto a flat square platform 200 on a side.
  var RMP_L1 = 50, RMP_L2 = 575, RMP_L3 = 50, RMP_END = RMP_L1 + RMP_L2 + RMP_L3, RMP_PLAT = 200, RMP_W = 125, RMP_ZC = -7512.5, RMP_A = Math.PI / 4;
  var RMP_Y1 = RMP_L1 / RMP_A * -Math.log(Math.cos(RMP_A)), RMP_Y2 = RMP_Y1 + RMP_L2, RMP_H = RMP_Y2 + RMP_L3 / RMP_A * -Math.log(Math.cos(RMP_A));
  function rampRise(s) {                                  // height above the plateau at distance s along the ramp
    if (s <= 0) return 0;
    if (s < RMP_L1) return RMP_L1 / RMP_A * -Math.log(Math.cos(RMP_A * s / RMP_L1));
    if (s < RMP_L1 + RMP_L2) return RMP_Y1 + (s - RMP_L1);
    if (s < RMP_END) { var t = s - RMP_L1 - RMP_L2; return RMP_Y2 + RMP_L3 / RMP_A * (Math.log(Math.cos(RMP_A * (1 - t / RMP_L3))) - Math.log(Math.cos(RMP_A))); }
    return RMP_H;
  }
  // The second valley winds away west of the platform: 60 wide, its floor 100 below the platform, its walls cut square and flush with the
  // platform on the east side. Its centre line is a 500-unit straight run along +Z, then four 350-radius turns (right 90, left 90, right 180,
  // left 90, so it winds east), a further 45° left, and then a gentler 45° right back to due east while the floor eases down to the level of the
  // first valley's old wall-top level (y 46); its walls stay 100 tall, meeting the raised west wall of the first valley (x -100) as a notch through it.
  // An 80-unit rim of level ground lies on each side before the world falls away.
  var V2_D = 0, V2_WI = 22, V2_WO = 38;   // the wall rises in an S-curve between these distances from the centre line (the old square wall stood at 30)
  var V2_HALF = 30, V2_RIM = 80, V2_R = 350, V2_PIECES = [], V2_BOX = [1e9, -1e9, 1e9, -1e9], V2_LEN = 0, V2_DESC = 0, V2_XEND = -100, V2_S = 0, V2_FLOOR = false, V2_ZEND = 0;
  (function () {
    var px = -4405, pz = -7612.5, hx = 0, hz = 1, S = 0;
    function note(x, z) { V2_BOX[0] = Math.min(V2_BOX[0], x); V2_BOX[1] = Math.max(V2_BOX[1], x); V2_BOX[2] = Math.min(V2_BOX[2], z); V2_BOX[3] = Math.max(V2_BOX[3], z); }
    function straight(len) { V2_PIECES.push({ t: 0, x0: px, z0: pz, x1: px + hx * len, z1: pz + hz * len, s0: S, len: len }); px += hx * len; pz += hz * len; S += len; note(px, pz); }
    function arc(side, ang, R) {                           // side +1 turns left of the heading (-hz, hx), -1 right
      var nx = side * -hz, nz = side * hx, cx = px + nx * R, cz = pz + nz * R;
      var a0 = Math.atan2(pz - cz, px - cx), a1 = a0 + side * ang;
      V2_PIECES.push({ t: 1, cx: cx, cz: cz, R: R, side: side, a0: Math.min(a0, a1), a1: Math.max(a0, a1), ex0: px, ez0: pz, s0: S, len: R * ang });
      px = cx + R * Math.cos(a1); pz = cz + R * Math.sin(a1); S += R * ang;
      hx = side > 0 ? -Math.sin(a1) : Math.sin(a1); hz = side > 0 ? Math.cos(a1) : -Math.cos(a1);
      V2_PIECES[V2_PIECES.length - 1].ex1 = px; V2_PIECES[V2_PIECES.length - 1].ez1 = pz;
      for (var q = 0; q <= 8; q++) { var aa = a0 + (a1 - a0) * q / 8; note(cx + R * Math.cos(aa), cz + R * Math.sin(aa)); }
    }
    note(px, pz);
    straight(500); arc(-1, Math.PI / 2, V2_R); arc(1, Math.PI / 2, V2_R); arc(-1, Math.PI, V2_R); arc(1, Math.PI / 2, V2_R);
    arc(1, Math.PI / 4, V2_R);                                  // 45° toward +X,+Z
    V2_DESC = S;                                                // the floor starts to descend here
    arc(-1, Math.PI / 4, 1000);                                 // a gentler curve back to due east
    straight(V2_XEND - px);                                     // east to the first valley's west wall
    V2_LEN = S; V2_ZEND = pz;
  })();
  var PATH_S = 0;
  function pathDist(P, x, z) {                   // distance from (x, z) to a centre line made of straights and arcs (PATH_S gets the path length there)
    var d = 1e9, i, c, t, dx, dz, e, sp = 0;
    for (i = 0; i < P.length; i++) {
      c = P[i];
      if (c.t === 0) {
        dx = c.x1 - c.x0; dz = c.z1 - c.z0; t = Math.max(0, Math.min(1, ((x - c.x0) * dx + (z - c.z0) * dz) / (dx * dx + dz * dz)));
        e = Math.hypot(x - c.x0 - dx * t, z - c.z0 - dz * t); if (e < d) { d = e; sp = c.s0 + t * c.len; }
      } else {
        var ang = Math.atan2(z - c.cz, x - c.cx);
        while (ang < c.a0 - 1e-9) ang += 2 * Math.PI;
        while (ang > c.a0 + 2 * Math.PI) ang -= 2 * Math.PI;
        if (ang <= c.a1 + 1e-9) { e = Math.abs(Math.hypot(x - c.cx, z - c.cz) - c.R); if (e < d) { d = e; sp = c.s0 + c.R * (c.side > 0 ? ang - c.a0 : c.a1 - ang); } }
        else {
          var e0 = Math.hypot(x - c.ex0, z - c.ez0), e1 = Math.hypot(x - c.ex1, z - c.ez1);
          e = Math.min(e0, e1); if (e < d) { d = e; sp = e0 < e1 ? c.s0 : c.s0 + c.len; }
        }
      }
    }
    PATH_S = sp;
    return d;
  }
  function valley2Dist(x, z) { var d = pathDist(V2_PIECES, x, z); V2_S = PATH_S; return d; }
  function v2Floor(s) {                          // floor height along the path: level, then a long eased descent to the first valley's wall-top level
    var top = WALL_HEIGHT + rampRise(RMP_END), drop = top - 100 - WALL_HEIGHT;
    if (s <= V2_DESC) return top - 100;
    var u = Math.min(1, (s - V2_DESC) / (V2_LEN - V2_DESC)), ee = 0.12, m = 1 / (1 - ee), g;
    if (u < ee) g = m * u * u / (2 * ee); else if (u < 1 - ee) g = m * (ee / 2 + u - ee); else g = 1 - m * (1 - u) * (1 - u) / (2 * ee);
    return top - 100 - drop * g;
  }
  function valley2(x, z) {                       // its height at (x, z), or null away from it
    if (x >= V2_XEND || x < V2_BOX[0] - V2_HALF - V2_RIM || x > V2_BOX[1] + V2_HALF + V2_RIM || z < V2_BOX[2] - V2_HALF - V2_RIM || z > V2_BOX[3] + V2_HALF + V2_RIM) return null;
    var d = valley2Dist(x, z);
    if (d >= V2_HALF + V2_RIM) return null;
    V2_FLOOR = d < V2_WI + 2; V2_D = d;
    var f = v2Floor(V2_S), base = f + terrainFlat(x, z) * (1 - smooth01((V2_S - V2_DESC) / 300));
    if (d <= V2_WI) return base;
    if (d < V2_WO) { var u = (d - V2_WI) / (V2_WO - V2_WI); return base + (f + 100 - base) * u * u * (3 - 2 * u); }   // an S-curve from the floor up to the rim, so neither the foot nor the lip of the wall is a hard corner
    return f + 100;                              // its walls stay 100 tall, so at the end they are flush with the first valley's raised wall
  }

  // ---- The cave ----
  // A 30-wide, 30-tall tunnel enters the first valley's raised east wall from the notch where the second valley ends (same floor height, y 46):
  // 100 units straight east, then a 450-radius left turn to -Z, then 800 straight on, climbing at 22.5 degrees from the start of the turn so she
  // loses 50 Zips before it levels out, and ending in a round chamber 100 in radius and 60 tall. It lies wholly east of the valley, so no part of
  // the course is over or under it. The ground is a height map, so the tunnel floor is the ground and the roof is a separate lid (see below).
  var CAVE_W = 30, CAVE_H = 30, CAVE_R = 450, CAVE_X0 = HALF, CAVE_SLAB = 150, CH_R = 100, CH_H = 60, CAVE_BAND = 55;
  var CAVE_S2 = 800, CAVE_PIECES = [], CAVE_LEN = 0, CAVE_CLIMB0 = 100, CAVE_CL1 = 50, CAVE_CL2 = 1400, CAVE_CL3 = 50, CAVE_Z0 = V2_ZEND, CAVE_XE = 0, CAVE_ZE = 0, CH_X = 0, CH_Z = 0, CH_FLOOR = 0;
  (function () {
    var px = CAVE_X0, pz = CAVE_Z0, hx = 1, hz = 0, S = 0;
    function straight(len) { CAVE_PIECES.push({ t: 0, x0: px, z0: pz, x1: px + hx * len, z1: pz + hz * len, s0: S, len: len }); px += hx * len; pz += hz * len; S += len; }
    function arc(side, ang, R) {
      var nx = side * -hz, nz = side * hx, cx = px + nx * R, cz = pz + nz * R;
      var a0 = Math.atan2(pz - cz, px - cx), a1 = a0 + side * ang;
      CAVE_PIECES.push({ t: 1, cx: cx, cz: cz, R: R, side: side, a0: Math.min(a0, a1), a1: Math.max(a0, a1), ex0: px, ez0: pz, s0: S, len: R * ang });
      px = cx + R * Math.cos(a1); pz = cz + R * Math.sin(a1); S += R * ang;
      hx = side > 0 ? -Math.sin(a1) : Math.sin(a1); hz = side > 0 ? Math.cos(a1) : -Math.cos(a1);
      CAVE_PIECES[CAVE_PIECES.length - 1].ex1 = px; CAVE_PIECES[CAVE_PIECES.length - 1].ez1 = pz;
    }
    straight(100); arc(-1, Math.PI / 2, CAVE_R); straight(CAVE_S2);
    CAVE_LEN = S; CAVE_XE = px; CAVE_ZE = pz; CH_X = px; CH_Z = pz + hz * CH_R;
  })();
  var CAVE_A = Math.PI / 8, CAVE_Y1 = CAVE_CL1 / CAVE_A * -Math.log(Math.cos(CAVE_A));
  function caveRise(t) {                           // height above the entrance floor at distance t into the climb: eases up to 22.5 degrees, holds, eases back to level
    if (t <= 0) return 0;
    if (t < CAVE_CL1) return CAVE_CL1 / CAVE_A * -Math.log(Math.cos(CAVE_A * t / CAVE_CL1));
    if (t < CAVE_CL1 + CAVE_CL2) return CAVE_Y1 + (t - CAVE_CL1) * Math.tan(CAVE_A);
    var y2 = CAVE_Y1 + CAVE_CL2 * Math.tan(CAVE_A);
    if (t < CAVE_CL1 + CAVE_CL2 + CAVE_CL3) { var u = t - CAVE_CL1 - CAVE_CL2; return y2 + CAVE_CL3 / CAVE_A * (Math.log(Math.cos(CAVE_A * (1 - u / CAVE_CL3))) - Math.log(Math.cos(CAVE_A))); }
    return y2 + CAVE_Y1;
  }
  function caveFloor(s) { return WALL_HEIGHT + caveRise(s - CAVE_CLIMB0); }
  CH_FLOOR = caveFloor(1e9);
  // ---- The doorway, the mud ramp and the field ----
  // A 10 x 10 doorway in the chamber's east wall, 6 above its floor (just a jump). It is sealed until all the mobs are down. Inside:
  // 65 straight east, a sharp 90-degree left turn (radius 8) to -Z, then a 200-long ramp at 45 degrees (10 easing in, 180 steady, 10 easing out)
  // paved in mud, ending at the cave's other mouth, which opens onto a grassy field. The goalpost stands 100 units out across the field.
  var DR_W = 10, DR_H = 10, DR_UP = 6, DR_S1 = 65, DR_TR = 8, DR_BAND = 25, DR_PIECES = [], DR_LEN = 0, DR_X0 = CH_X + CH_R, DR_Z0 = CH_Z, DR_Y0 = CH_FLOOR + DR_UP;
  var DR_CL1 = 10, DR_CL2 = 180, DR_CL3 = 10, DR_A = Math.PI / 4, DR_CLIMB0 = 0, DR_XE = 0, DR_ZE = 0, DR_TOPX = 0;
  var FIELD_HW = 60, FIELD_LEN = 560, FIELD_DIP = 1.5;   // the field lies 1.5 below the top of the mud ramp, a sheer step she shoots off at whatever speed she has
  (function () {
    var px = DR_X0, pz = DR_Z0, hx = 1, hz = 0, S = 0;
    function straight(len) { DR_PIECES.push({ t: 0, x0: px, z0: pz, x1: px + hx * len, z1: pz + hz * len, s0: S, len: len }); px += hx * len; pz += hz * len; S += len; }
    function arc(side, ang, R) {
      var nx = side * -hz, nz = side * hx, cx = px + nx * R, cz = pz + nz * R;
      var a0 = Math.atan2(pz - cz, px - cx), a1 = a0 + side * ang;
      DR_PIECES.push({ t: 1, cx: cx, cz: cz, R: R, side: side, a0: Math.min(a0, a1), a1: Math.max(a0, a1), ex0: px, ez0: pz, s0: S, len: R * ang });
      px = cx + R * Math.cos(a1); pz = cz + R * Math.sin(a1); S += R * ang;
      hx = side > 0 ? -Math.sin(a1) : Math.sin(a1); hz = side > 0 ? Math.cos(a1) : -Math.cos(a1);
      DR_PIECES[DR_PIECES.length - 1].ex1 = px; DR_PIECES[DR_PIECES.length - 1].ez1 = pz;
    }
    straight(DR_S1); arc(-1, Math.PI / 2, DR_TR); DR_CLIMB0 = S; straight(DR_CL1 + DR_CL2 + DR_CL3);
    DR_LEN = S; DR_XE = px; DR_ZE = pz;
  })();
  var DR_Y1 = DR_CL1 / DR_A * -Math.log(Math.cos(DR_A));
  function drRise(t) {                             // height above the doorway floor, t into the ramp: eases up to 45 degrees, holds, eases back to level
    if (t <= 0) return 0;
    if (t < DR_CL1) return DR_CL1 / DR_A * -Math.log(Math.cos(DR_A * t / DR_CL1));
    if (t < DR_CL1 + DR_CL2) return DR_Y1 + (t - DR_CL1) * Math.tan(DR_A);
    var y2 = DR_Y1 + DR_CL2 * Math.tan(DR_A);
    if (t < DR_CL1 + DR_CL2 + DR_CL3) { var u = t - DR_CL1 - DR_CL2; return y2 + DR_CL3 / DR_A * (Math.log(Math.cos(DR_A * (1 - u / DR_CL3))) - Math.log(Math.cos(DR_A))); }
    return y2 + DR_Y1;
  }
  function drFloor(s) { return DR_Y0 + drRise(s - DR_CLIMB0); }
  var FIELD_Y = drFloor(1e9);
  function mudAt(x, z) { return sbMudAt(x, z); }                  // on mud?
  var cK = 1;              // set by cave: what the spot is made of, 1 rock, 2 grass, 3 mud
  function cave(x, z) {                          // its height at (x, z), or null away from it
    cK = 1;
    var inDr = x >= DR_X0 && x <= DR_XE + FIELD_HW + 4 && z <= DR_Z0 + DR_BAND + 4 && z >= DR_ZE - FIELD_LEN - 4, dd = 0, ds = 0;
    if (inDr) {
      if (z <= DR_ZE && z >= DR_ZE - FIELD_LEN && Math.abs(x - DR_XE) <= FIELD_HW) { cK = 2; return FIELD_Y - FIELD_DIP; }   // the grassy field
      dd = pathDist(DR_PIECES, x, z); ds = PATH_S;
      if (dd < DR_W / 2 && z > DR_ZE) { cK = ds >= DR_CLIMB0 ? 3 : 1; return drFloor(ds); }                      // the doorway passage, and the mud ramp
    }
    if (x < CAVE_X0 || x > CH_X + CH_R + 60 || z > CAVE_Z0 + CAVE_BAND + 5 || z < CH_Z - CH_R - 60) {
      if (inDr && dd < DR_BAND && z > DR_ZE && Math.hypot(x - CH_X, z - CH_Z) >= CH_R + 50) return drFloor(ds) + DR_H;   // rock either side of the ramp, as high as its roof
      return null;
    }
    var d = pathDist(CAVE_PIECES, x, z), s = PATH_S, dc = Math.hypot(x - CH_X, z - CH_Z);
    if (d < CAVE_W / 2) return caveFloor(s);                                   // the tunnel floor (also through the raised wall)
    if (dc < CH_R) return CH_FLOOR;                                            // the chamber floor
    if (dc < CH_R + 50) return CH_FLOOR + CH_H;                                // its rock rim
    if (inDr && dd < DR_BAND && z > DR_ZE) return drFloor(ds) + DR_H;
    if (d < CAVE_BAND && x >= CAVE_SLAB) return caveFloor(s) + CAVE_H;         // rock either side of the tunnel, as high as its roof
    return null;
  }
  var wMud = 0, wL2 = 0;
