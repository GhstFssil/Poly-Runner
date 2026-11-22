  // ---- Level 2, Oceana Crags: a flat, light brown stone runway 20 wide running -Z from a start pad, with deep water 10 below its edge. It lies
  // far east of everything in level 1 (which ends near x 1100), so none of level 1's tips, trees, Segs or gates are anywhere near it. ----
  var L2_X = 30000, L2_MIN = 20000, L2_HW = 10, L2_Z0 = 40, L2_SBZ = 0, L2_LEN = 30, L2_Y = 40, WATER_Y = L2_Y - 10, L2_VOID = -300;
  // The runway is a centre line of pieces: 2,100 straight (the start pad and 2,000 of runway), a shallow 45 degree left (west) turn of radius 800,
  // a 135 degree right turn of the same radius that leaves her heading due east, a 200 straightaway, then a short ramp at 30 degrees.
  var L2_PIECES = [], L2_BOX = [1e9, -1e9, 1e9, -1e9], L2_S = 0, L2_PS = 0, L2_PI = 0, L2_STRAIGHT0 = 0, L2_RAMP0 = 0, L2_RAMP_L = 45, L2_RAMP_T = Math.tan(Math.PI / 6), L2_EASE = 6, L2_STYLE_ZONE = 15, L2_GAP = 300, L2_LAND1 = 200, L2_GAPX = 2025, L2_CURVE_R = 150, L2_CURVE_UP = 15, L2_CLIMB_TURN = 79.7, L2_PEAK_X = 2048, L2_PEAK_Z = -1697, L2_PEAK_Y = 125, L2_CLIMB_I = 0, L2_CLIMB_SL = 0, L2_CAVE_Z = -1404, L2_CAVE_Y = 107, L2_CAVE_L = 100, L2_CAVE_I = 0, L2_CAVE_GAP0 = 8, L2_RAMP_I = 0, L2_BAYEND_I = 0, L2_LAND1_I = 0, L2_RAMP2_I = 0, L2_LAND2_I = 0;
  // The way out of the cave: a narrow path (6 wide) down a 30 degree slope to ground level, then 2,000 units on between walls of rock. L2_NSEGS lists its bends as [length, turn in radians (+ left)].
  var L2_NAR0 = 0, L2_FLAT0 = 0, L2_NHW = 4.6, L2_NLIM = 4.4, L2_NSEGS = [[205.4652, -0.684884], [1633.8518, 0]];
  (function () {
    var px = L2_X, pz = L2_Z0, hx = 0, hz = -1, s = 0, curY = L2_Y;
    function note0() {}
    function note() { L2_BOX[0] = Math.min(L2_BOX[0], px - 40); L2_BOX[1] = Math.max(L2_BOX[1], px + 40); L2_BOX[2] = Math.min(L2_BOX[2], pz - 40); L2_BOX[3] = Math.max(L2_BOX[3], pz + 40); }
    function straight(len, sqStart, sqEnd, ramp, lf) { L2_PIECES.push({ t: 's', x0: px, z0: pz, hx: hx, hz: hz, len: len, s0: s, sqStart: !!sqStart, sqEnd: !!sqEnd, ramp: !!ramp, y0: curY, dy: 0, lf: lf || null, b0: lf ? lf.b0 : 0, blend: !!(lf && lf.blend) }); if (lf && !lf.keepY) curY += l2RiseG(len, lf.sl0, lf.sl1, lf.E); note(); px += hx * len; pz += hz * len; s += len; note(); }
    function arc(sig, deg, Rr, dy) {                               // sig +1 turns left (toward west when heading -Z), -1 turns right
      var R = Rr || 800, th = deg * Math.PI / 180, cx = px + sig * R * hz, cz = pz - sig * R * hx, ux = px - cx, uz = pz - cz;
      L2_PIECES.push({ t: 'a', cx: cx, cz: cz, ux: ux, uz: uz, R: R, th: th, sig: sig, s0: s, len: R * th, y0: curY, dy: dy || 0 }); curY += dy || 0;
      for (var k = 1; k <= 24; k++) { var f = sig * th * k / 24, c = Math.cos(f), sn = Math.sin(f); px = cx + ux * c + uz * sn; pz = cz - ux * sn + uz * c; note(); }
      var f2 = sig * th, c2 = Math.cos(f2), s2 = Math.sin(f2), nhx = hx * c2 + hz * s2, nhz = -hx * s2 + hz * c2; hx = nhx; hz = nhz; s += R * th;
    }
    straight(L2_Z0 + L2_LEN, true, false); arc(1, 45); arc(-1, 135); L2_STRAIGHT0 = s; straight(200); L2_RAMP0 = s; straight(L2_RAMP_L, false, true, true); L2_RAMP_I = L2_PIECES.length - 1;
    px += hx * L2_GAP; pz += hz * L2_GAP; s += L2_GAP; L2_LAND1_I = L2_PIECES.length; straight(L2_LAND1, true, false);   // a 300-unit gap, then 200 of runway to land on...
    L2_RAMP2_I = L2_PIECES.length; straight(L2_RAMP_L, false, true, true);                                              // ...ending in a second ramp
    px += hx * L2_GAP; pz += hz * L2_GAP; s += L2_GAP; L2_LAND2_I = L2_PIECES.length;
    straight(L2_X + L2_GAPX - L2_CURVE_R - px, true, false);                                                            // another gap, and the final stretch, which ends where it turns off...
    arc(-1, L2_CLIMB_TURN, L2_CURVE_R, L2_CURVE_UP);                                                                    // ...in a right turn, climbing a little, into the gap in the rocks...
    var cl = Math.hypot(L2_X + L2_PEAK_X - px, L2_PEAK_Z - pz), cm = (L2_PEAK_Y - curY - L2_RAMP_T * (L2_RAMP_L - 4)) / (cl - L2_RAMP_L - 7 + 4);   // ...then up the rock face to the peak: a steady slope that eases on,
    straight(cl - L2_RAMP_L, false, false, false, { sl0: 0, sl1: cm, E: 14, b0: 0, blend: true });                   // blending into the rock as it climbs...
    L2_CLIMB_I = L2_PIECES.length; L2_CLIMB_SL = cm;
    straight(L2_RAMP_L, false, true, true, { sl0: cm, sl1: L2_RAMP_T, E: 8, b0: cl - L2_RAMP_L, blend: true, keepY: true });   // ...and ending in a ramp at the peak
    var cg = (L2_CAVE_Z - pz) / hz; px += hx * cg; pz += hz * cg; s += cg; note(); curY = L2_CAVE_Y;                            // a canyon to jump, then an octagonal cut in the crag's wall with a level floor
    L2_CAVE_I = L2_PIECES.length; straight(L2_CAVE_L, true, true);
    L2_NAR0 = L2_PIECES.length;                                                                                                // the wall at the cave's end is gone: the floor eases onto a 30 degree slope, runs down it and eases out at ground level
    var nHold = (L2_CAVE_Y - L2_Y - L2_RAMP_T * 12) / L2_RAMP_T;
    straight(12 + nHold, true, false, false, { sl0: 0, sl1: -L2_RAMP_T, E: 12, b0: 0, flat: true });
    straight(12, false, false, false, { sl0: -L2_RAMP_T, sl1: 0, E: 12, b0: 0, flat: true });
    L2_FLAT0 = s;
    for (var ni = 0; ni < L2_NSEGS.length; ni++) {
      var nl = L2_NSEGS[ni][0], nd = L2_NSEGS[ni][1];
      if (Math.abs(nd) < 0.002) straight(nl); else arc(nd > 0 ? 1 : -1, Math.abs(nd) * 180 / Math.PI, nl / Math.abs(nd), 0);
    }
    arc(-1, 118, 640, 60);                                   // up and out: a wide right turn (640 is the tightest she can hold at top speed) that climbs from 40 to 100, leaving the crags' inner shore
    arc(-1, 123.059, 640, 0);                                // level at 100, the loop round the bay to head east
    L2_BAYEND_I = L2_PIECES.length;
    straight(478 + 250 - 51);                                // back in at the shore at about Z -500, and 200 on east into the rock, to a sheer drop onto the Sink (its end, at X 1436)
    for (var nj = L2_NAR0; nj < L2_PIECES.length; nj++) L2_PIECES[nj].nar = true;
  })();
  // ---- The Crags: a 500-wide range of brown rock spikes. Its centre line starts 200 east and 200 north of the caution sign, runs south across the final runway, bends west
  // in a quarter circle that meets the start's z line 1,000 east of the start, and carries on 200 west. Its shore slopes down into the water on every side. ----
  var MT_HW = 500, MT_SKIRT = 612, MT_BASE = L2_Y - 5, MT_TOP = WATER_Y + 300, MT_S = 0, MT_LC = 500, l2Kind = 1;
  var MT_P0X = 0, MT_P0Z = 0, MT_R = 0, MT_ZA = 0, MT_LA = 0, MT_LTOT = 0;
  (function () {
    var lp = L2_PIECES[L2_LAND2_I], endX = L2_X + 1000;
    MT_P0X = lp.x0 + 120 + 200; MT_P0Z = lp.z0 - 6 - 200;           // 200 east and 200 north of the sign
    MT_ZA = -(MT_P0X - endX); MT_R = MT_P0X - L2_X; MT_LA = MT_ZA - MT_P0Z; MT_LTOT = MT_LA + MT_R * Math.PI / 2 + MT_LC;   // straight south, one smooth quarter turn west (from the same spot) that is heading west at X 0, Z 1000, then 500 more west
    L2_BOX[0] = Math.min(L2_BOX[0], L2_X - MT_LC - MT_SKIRT - 20); L2_BOX[1] = Math.max(L2_BOX[1], MT_P0X + MT_SKIRT + 20);
    L2_BOX[2] = Math.min(L2_BOX[2], MT_P0Z - 140); L2_BOX[3] = Math.max(L2_BOX[3], MT_ZA + MT_R + MT_SKIRT + 20);
  })();
  // The Tunnel: a block of rock across the runway, 100 west of the range's centre line, with an octagonal opening 30 across (flat top, 8.3 per side) whose top is only 2 above
  // the runway. Only the top 2 of the octagon clear the floor, so a standing Molly (3.6 tall) meets a wall, and a sliding one (1 tall) passes under it.
  var GATE_X0 = MT_P0X - 90, GATE_Z = L2_PIECES[L2_LAND2_I].z0, GATE_L = 90, GATE_W = 60, GATE_TOP = L2_Y + 85, GATE_OCT = 30 / (1 + Math.SQRT2), gateIn = false;
  var OCV = L2_PIECES[L2_CAVE_I], OCV_W = 60, OCV_OA = 15, OCV_OC = GATE_OCT / Math.SQRT2, OCV_TOP = L2_CAVE_Y + 85;   // the cave's octagon: 30 across, flat top and bottom, its floor level with the runway inside
  function ocvW(h) { return h < 0 || h > 30 ? -1 : h < OCV_OC ? OCV_OA - OCV_OC + h : h <= 30 - OCV_OC ? OCV_OA : OCV_OA - (h - (30 - OCV_OC)); }   // half width of the opening h above its floor
  // Sideways distance to the range's centre line (the shore starts at MT_HW); sets MT_S, how far along it. Past either end the shore starts at once.
  function mtDist(x, z) {
    var best = 1e9, d, t = z - MT_P0Z, zc = MT_ZA + MT_R, xe = MT_P0X - MT_R;
    if (t >= 0 && t <= MT_LA) { best = Math.abs(x - MT_P0X); MT_S = t; }
    else if (t < 0 && t > -150) { best = Math.max(Math.abs(x - MT_P0X), MT_HW) - t; MT_S = 0; }
    var dx = x - xe, dz = z - MT_ZA;                                            // the quarter turn, west
    if (dx >= 0 && dz >= 0) { d = Math.abs(Math.hypot(dx, dz) - MT_R); if (d < best) { best = d; MT_S = MT_LA + MT_R * Math.atan2(dz, dx); } }
    var tc = xe - x;                                                            // the last stretch, west
    if (tc >= 0 && tc <= MT_LC) { d = Math.abs(z - zc); if (d < best) { best = d; MT_S = MT_LA + MT_R * Math.PI / 2 + tc; } }
    else if (tc > MT_LC && tc < MT_LC + 150) { d = Math.max(Math.abs(z - zc), MT_HW) + (tc - MT_LC); if (d < best) { best = d; MT_S = MT_LTOT; } }
    return best;
  }
  // Rock spikes: one cone to every 64-unit cell, each with its own height (25 to 295), base width (about 56 to 184), slope profile and lopsided outline.
  function mtSpikes(x, z) {
    var CS = 64, ci = Math.floor(x / CS), cj = Math.floor(z / CS), best = 0;
    for (var di = -2; di <= 2; di++) for (var dj = -2; dj <= 2; dj++) {
      var a = ci + di, b = cj + dj, r1 = rand01(a, b, 31), r2 = rand01(a, b, 32), r3 = rand01(a, b, 33), r4 = rand01(a, b, 34), r5 = rand01(a, b, 35);
      var px = (a + 0.15 + 0.7 * r1) * CS, pz = (b + 0.15 + 0.7 * r2) * CS, dxp = x - px, dzp = z - pz;
      var rad = 28 + 64 * r3, ang = Math.atan2(dzp, dxp), wob = 1 + 0.2 * Math.sin(3 * ang + r1 * 6.28) + 0.1 * Math.sin(5 * ang + r2 * 6.28);
      var q = 1 - Math.hypot(dxp, dzp) / (rad * wob);
      if (q > 0) { var v = (25 + 270 * Math.pow(r4, 2.2)) * Math.pow(q, 0.65 + 1.1 * r5); if (v > best) best = v; }
    }
    return best;
  }
  // The two gaps the range now reaches stay open water: a channel through the rock along each, so the jump is as threatening as before.
  var MT_GAPS = [[L2_RAMP2_I, L2_LAND2_I]].map(function (g) { var r = L2_PIECES[g[0]], l = L2_PIECES[g[1]]; return [r.x0 + r.hx * r.len, r.z0 + r.hz * r.len, l.x0, l.z0]; });
  // The jump to the cave: no channel, the crags fill it, but nothing rises into the arc of Segs. The rock is kept below that arc along the line from the ramp's lip to the cave's mouth.
  var AIR = (function () {
    var r = L2_PIECES[L2_CLIMB_I], c = L2_PIECES[L2_CAVE_I], x0 = r.x0 + r.hx * r.len, z0 = r.z0 + r.hz * r.len;
    var yTop = r.y0 + l2RiseG(r.len, r.lf.sl0, r.lf.sl1, r.lf.E), yEnd = L2_CAVE_Y + 14;
    return { x0: x0, z0: z0, dx: c.x0 - x0, dz: c.z0 - z0, D: Math.hypot(c.x0 - x0, c.z0 - z0), yTop: yTop, yEnd: yEnd };
  })();
  function airY(t) { return AIR.yTop + 3 + (AIR.yEnd - AIR.yTop - 3) * t + 4 * 33 * t * (1 - t); }   // the Segs' height a fraction t of the way across
  function airCap(x, z) {                                    // how high the rock may rise here: well below the arc, and below the cave's floor in front of its mouth
    var dd = AIR.dx * AIR.dx + AIR.dz * AIR.dz, t = ((x - AIR.x0) * AIR.dx + (z - AIR.z0) * AIR.dz) / dd, tc = t < 0 ? 0 : t > 1 ? 1 : t;
    var d = Math.hypot(x - AIR.x0 - AIR.dx * tc, z - AIR.z0 - AIR.dz * tc);
    if (d > 70) return 1e9;
    var cap = Math.min(airY(tc) - 14, L2_CAVE_Y - 6 + 0.5 * (1 - tc) * AIR.D);
    return cap + 500 * smooth01((d - 26) / 44);
  }
  function mtGapDist(x, z) {
    var best = 1e9;
    for (var i = 0; i < MT_GAPS.length; i++) {
      var g = MT_GAPS[i], dx = g[2] - g[0], dz = g[3] - g[1], t = ((x - g[0]) * dx + (z - g[1]) * dz) / (dx * dx + dz * dz); t = t < 0 ? 0 : t > 1 ? 1 : t;
      var d = Math.hypot(x - g[0] - dx * t, z - g[1] - dz * t); if (d < best) best = d;
    }
    return best;
  }
  // ---- The Sink: an irregular ovoid of low, poisoned ground set into the crags between Z -500 and Z -1500 (about 750 across). Its rim was fitted (OV_SC: the rim's
  // distance from the centre at 48 angles, as a fraction of the ovoid's own outline) to run through the gaps between the crags that are already there. The ground is rolling
  // hills with small crags scattered over it, each with ground all round it; everything outside the crags is toxic. ----
  var OV_CX = L2_X + 1672, OV_CZ = -1000, OV_A = 175, OV_B = 500, OV_N = 3.2, OV_Y = 50, OV_SC = [1.008, 0.991, 1.018, 1.024, 0.996, 0.975, 0.975, 0.985, 0.985, 0.974, 0.964, 0.953, 0.939, 0.926, 0.912, 0.915, 0.958, 1.014, 1.028, 1.000, 0.990, 1.009, 1.015, 1.015, 1.035, 1.044, 1.018, 1.003, 1.034, 1.066, 1.055, 1.016, 0.984, 0.980, 1.002, 1.022, 1.031, 1.046, 1.064, 1.078, 1.084, 1.049, 0.988, 0.959, 0.955, 0.964, 1.005, 1.034], ovTox = 0, ovCrag = 0, ovK = 0;
  function ovKAt(x, z) {                                    // 1 well inside the ovoid, 0 outside it, a blend across the rim
    var kc = 0, cxr = x - L2_X, zc = Math.abs(z + 500.7);    // the mouth: a short, wide cut through the crags from the path's end into the ovoid
    if (cxr > 1436 && cxr < 1680 && zc < 100) kc = smooth01((cxr - 1436) / 14) * (1 - smooth01((cxr - 1600) / 70)) * (1 - smooth01((zc - 30 - (cxr - 1436) * 0.12) / 40));
    var dx = (x - OV_CX) / OV_A, dz = (z - OV_CZ) / OV_B;
    if (dx > 1.5 || dx < -1.5 || dz > 1.5 || dz < -1.5) return kc;
    var r = Math.hypot(dx, dz); if (r < 1e-6) return 1;
    var c = dx / r, sn = dz / r, r0 = Math.pow(Math.pow(Math.abs(c), OV_N) + Math.pow(Math.abs(sn), OV_N), -1 / OV_N);
    var f = Math.atan2(dz, dx) / (2 * Math.PI); if (f < 0) f += 1; f *= 48; var i0 = Math.floor(f) % 48, fr = f - Math.floor(f);
    var sc = OV_SC[i0] * (1 - fr) + OV_SC[(i0 + 1) % 48] * fr, q = r / (r0 * sc);
    var ke = 1 - smooth01((q - 0.85) / 0.3);
    if (z > -1100) ke *= smooth01(((1822 + L2_X - x) - 0.553 * (z + 461)) * 0.875 / 50 - 1.4);   // keep well clear of the rock path that runs down the east side
    return Math.max(kc, ke);
  }
  var L2_BARE = true;                                      // Oceana Crags without its built-in path: no lane, runways, ramps, pads, gap channels, narrow walled path or bridge. Just the crags, the Sink and the sea, for paths and objects laid in the Path Editor
  var OV_FEATURES = false;                                  // the Sink's maze of ledges, its scatter of crags and the Big Minion's pit are all taken out, to be placed by hand in the Path Editor
  function ovLedge(x, z) {
    if (!OV_FEATURES) return 0;                                  // the Sink's maze: walls 7.5 thick on a 48-unit grid, each 2 or 5 tall with square faces (they use the game's ledge cells). A binary-tree maze: every cell opens east or south, and keeps the other wall
    if (z > -660 || ovKAt(x, z) < 0.9) return 0;            // none at the mouth, so she lands on open ground
    var MC = 48, HW = 3.75, u = x - (OV_CX - 5 * MC), v = z - (OV_CZ - 9 * MC), ui = Math.round(u / MC), vi = Math.round(v / MC), h = 0, k, c, w;
    if (Math.abs(u - ui * MC) <= HW) {                      // a wall between cell ui-1 and cell ui, across the row(s) at this height (it runs on half a wall's width past each end to close the corners)
      var j0 = Math.floor(v / MC), fv = v - j0 * MC, js = [j0]; if (fv < HW) js.push(j0 - 1); else if (fv > MC - HW) js.push(j0 + 1);
      for (k = 0; k < js.length; k++) if (rand01(ui - 1, js[k], 91) < 0.5) { w = rand01(ui - 1, js[k], 92) < 0.5 ? 2 : 5; if (w > h) h = w; }
    }
    if (Math.abs(v - vi * MC) <= HW) {
      var i0 = Math.floor(u / MC), fu = u - i0 * MC, is = [i0]; if (fu < HW) is.push(i0 - 1); else if (fu > MC - HW) is.push(i0 + 1);
      for (k = 0; k < is.length; k++) if (rand01(is[k], vi - 1, 91) >= 0.5) { w = rand01(is[k], vi - 1, 93) < 0.5 ? 2 : 5; if (w > h) h = w; }
    }
    return h;
  }
  function ovGround(x, z) {                                 // hills, plus a scatter of small crags (one cone to a 60-unit cell, most cells, none closer than 1 apart)
    var h = OV_Y + 6 * Math.sin(x * 0.019 + 1.3) * Math.cos(z * 0.016 + 0.4) + 4.5 * Math.sin(x * 0.041 + z * 0.033 + 2.1) + 3 * Math.sin(z * 0.058 - x * 0.027 + 0.7) + 2 * Math.sin(x * 0.11 + z * 0.09);
    var CS = 60, ci = Math.floor(x / CS), cj = Math.floor(z / CS), best = 0;
    for (var di = -1; di <= 1; di++) for (var dj = -1; dj <= 1; dj++) {
      var a = ci + di, b = cj + dj; if (!OV_FEATURES || rand01(a, b, 71) > 0.85) continue;
      var px = (a + 0.2 + 0.6 * rand01(a, b, 72)) * CS, pz = (b + 0.2 + 0.6 * rand01(a, b, 73)) * CS, dxp = x - px, dzp = z - pz;
      var rad = 5 + 5 * rand01(a, b, 74), ang = Math.atan2(dzp, dxp), wob = 1 + 0.1 * Math.sin(3 * ang + rand01(a, b, 75) * 6.28) + 0.05 * Math.sin(5 * ang + rand01(a, b, 76) * 6.28);
      var q = 1 - Math.hypot(dxp, dzp) / (rad * wob);
      if (q > 0) { var v = (12 + 40 * rand01(a, b, 77)) * Math.pow(q, 0.7 + 0.7 * rand01(a, b, 78)); if (v > best) best = v; }
    }
    ovCrag = best;
    return h + best;
  }
  function mountainH(x, z, dRun) {
    var h = mountainH0(x, z, dRun); ovTox = 0; ovK = 0;
    var k = ovKAt(x, z); if (k <= 0) return h;
    ovK = k;
    var g = ovGround(x, z); ovTox = k > 0.5 && ovCrag < 4 ? 1 : 0;
    return h + (g - h) * k;
  }
  function mountainH0(x, z, dRun) {
    var lat = mtDist(x, z), dGap = L2_BARE ? 1e9 : mtGapDist(x, z);
    if (dGap < 70) dRun = Math.min(dRun, dGap);
    if (dGap < 45) { var hc = (lat >= MT_HW ? MT_BASE - (lat - MT_HW) * 1.2 : MT_BASE) - (45 - dGap) * 1.2; return lat > MT_SKIRT ? L2_VOID : hc; }   // a channel, sloping down to below the water
    if (lat > MT_SKIRT) return L2_VOID;
    if (lat >= MT_HW) return MT_BASE - (lat - MT_HW) * 1.2;           // the shore: down into the water
    var env = (1 - smooth01((lat - (MT_HW - 50)) / 50)) * smooth01(MT_S / 150) * smooth01((MT_LTOT - MT_S) / 150) * smooth01((dRun - 14) / 56);
    var sp = mtSpikes(x, z);
    var y = MT_BASE + sp * env + (rand01(Math.round(x / GRID), Math.round(z / GRID), 36) - 0.5) * 6 * Math.min(1, sp * env / 40);
    if (y > MT_BASE && !L2_BARE) { var ac = airCap(x, z); if (y > ac) y = Math.max(MT_BASE, ac); }
    return y > MT_TOP ? MT_TOP : y;
  }
  // Distance from (x, z) to the centre line (also sets L2_S, how far along it, L2_PS, how far along its own piece, and L2_PI, which piece).
  function l2Dist(x, z, loose) {                           // loose: ignore the square ends (used to decide which tiles to build, so a tile holding only a runway's end is not skipped)
    var best = 1e9, n = L2_PIECES.length;
    for (var i = 0; i < n; i++) {
      var p = L2_PIECES[i], d, ps;
      if (p.t === 's') {
        var dx = x - p.x0, dz = z - p.z0, t = dx * p.hx + dz * p.hz, perp = dx * p.hz - dz * p.hx;
        if (!loose && ((p.sqEnd && t > p.len) || (p.sqStart && t < 0))) continue;           // square ends: the start pad, the top of the ramp and both sides of the gap
        var tc = t < 0 ? 0 : t > p.len ? p.len : t; d = Math.hypot(t - tc, perp); ps = tc;
      } else {
        var vx = x - p.cx, vz = z - p.cz, c = p.ux * vz - p.uz * vx, dt = p.ux * vx + p.uz * vz, ang = p.sig * Math.atan2(-c, dt);
        if (ang < 0 || ang > p.th) continue;
        d = Math.abs(Math.hypot(vx, vz) - p.R); ps = p.R * ang;
      }
      if (d < best) { best = d; L2_S = p.s0 + ps; L2_PS = ps; L2_PI = i; }
    }
    return best;
  }
  function l2RiseG(s, sl0, sl1, E) {                       // height gained s along a stretch whose slope eases linearly from sl0 to sl1 over E, then holds
    if (s <= 0) return 0;
    return s < E ? sl0 * s + (sl1 - sl0) * s * s / (2 * E) : sl0 * E + (sl1 - sl0) * E / 2 + sl1 * (s - E);
  }
  function l2Rise(s) {                                     // height up the ramp: eases onto 30 degrees over the first few units
    if (s <= 0) return 0;
    return s < L2_EASE ? L2_RAMP_T * s * s / (2 * L2_EASE) : L2_RAMP_T * (s - L2_EASE / 2);
  }
  function narrowH(x, z, dr, pc) {                         // the path out of the cave: a flat lane 6 wide, and a wall of rock on each side that shoots up from its edge
    var hp = narY(pc, L2_PS), hw = narHW(x, z);
    if (dr <= hw) { var nl = mountainH(x, z, 1000), wv = smooth01(ovK / 0.35); l2Kind = ovK > 0.3 ? 2 : 1; return (nl + (hp - nl) * smooth01((nl - 25) / 20)) * (1 - wv) + nl * wv; }   // (over the Sink the mesh stays ground, and the slab carries the path)   // over the water the mesh keeps no column here: the floating slab is its own mesh
    var d = dr - hw, k = L2_S / 45, ki = Math.floor(k), kf = k - ki; kf = kf * kf * (3 - 2 * kf);
    var wmax = 22 + 26 * (rand01(ki, 5, 57) * (1 - kf) + rand01(ki + 1, 5, 57) * kf);               // how high the wall stands, changing slowly along the path
    var dTop = wmax / 3, w = d <= dTop ? 3 * d : Math.max(0, wmax - 0.9 * (d - dTop));
    w += (rand01(Math.round(x / GRID), Math.round(z / GRID), 58) - 0.5) * 5 * Math.min(1, d / 5);
    var nat = mountainH(x, z, 1000), y = hp + w;
    if (nat > y) y += (nat - y) * smooth01((d - 5) / 9);                 // the natural crags only take over a little way back, so the wall's face is a clean slope up from the lane
    y = nat + (y - nat) * smooth01((nat - 25) / 20);                      // no walls where the path leaves the crags: out over the water it is a bare causeway
    y = y + (nat - y) * smooth01(ovK / 0.5);                              // no walls over the Sink
    if (d > 30) { var ft = smooth01((d - 30) / 30); y = y * (1 - ft) + nat * ft; }   // and well away from the path the ground is simply the crags again (no plateau at path height)
    return y;
  }
  function level2H(x, z) {
    l2Kind = 2; ovTox = 0; ovK = 0;
    if (x < L2_BOX[0] || x > L2_BOX[1] || z < L2_BOX[2] || z > L2_BOX[3]) return L2_VOID;
    if (L2_BARE) return mountainH(x, z, 1000);              // no path: the crags reach everywhere they would away from it
    var dr = l2Dist(x, z), pc = L2_PIECES[L2_PI];
    if (pc.nar) return narrowH(x, z, dr, pc);
    if (pc.blend) {                                          // the climb: a lane whose edges melt into the rock, and which turns from stone to rock itself
      var lf = pc.lf, sp = pc.b0 + L2_PS, hp = pc.y0 + l2RiseG(L2_PS, lf.sl0, lf.sl1, lf.E);
      if (dr <= L2_HW) { l2Kind = sp < 40 ? 1 : 2; return hp; }
      var u = Math.min(1, sp / 100), nat = mountainH(x, z, dr + 400 * smooth01(sp / 50)), f = smooth01((dr - L2_HW) / (3 + 15 * smooth01(u)));
      return hp + (nat - hp) * f;
    }
    if (dr > L2_HW) return mountainH(x, z, dr);
    l2Kind = 1;
    return pc.ramp ? pc.y0 + l2RiseG(L2_PS, pc.lf ? pc.lf.sl0 : 0, pc.lf ? pc.lf.sl1 : L2_RAMP_T, pc.lf ? pc.lf.E : L2_EASE) : pc.dy ? pc.y0 + pc.dy * smooth01(L2_PS / pc.len) : pc.y0;
  }
