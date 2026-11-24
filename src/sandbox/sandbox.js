  // ---- Level 3, the Sandbox: flat patchy grass at the origin, shaped by whatever the Path Editor made (its exported file). The layout is kept in editor
  // coordinates (the path starts at 0, 0 heading north) and shifted by L3_X into the world. ----
  var L3_X = 0;   // where a layout sits in the world: at the origin (the old hand-made levels sampled for their terrain keep their own coordinates, see oldWorldH)
  var SB = null, sbNoRamps = false;                              // sbNoRamps: while each ramp's foot is measured, ramps are left out of the ground
  function sbHash(c) { return { c: c, m: {} }; }
  var TOX_C = 32;
  function sbToxAt(B, ex, z) { return B.toxH ? B.toxH.m[(Math.floor(ex / TOX_C) + 4096) * 8192 + Math.floor(z / TOX_C) + 4096] : null; }   // the toxic patches whose reach covers this point's cell (or null)
  function sbIn(e, x, z, g) {                                  // is (x, z) inside this footprint entry, grown by g? Rounded pieces are discs along the line; squared pieces are short oriented boxes (e.hl along the line, e.half across)
    if (!e.sq) return Math.hypot(e.x - x, e.z - z) <= e.half + g;
    var dx = x - e.x, dz = z - e.z, c = Math.cos(e.th), s = Math.sin(e.th);
    return Math.abs(dx * c + dz * s) <= e.half + g && Math.abs(dx * s - dz * c) <= e.hl + g;
  }
  function sbAdd(h, x, z, v) { var k = (Math.floor(x / h.c) + 4096) * 8192 + Math.floor(z / h.c) + 4096; (h.m[k] || (h.m[k] = [])).push(v); }
  function sbNear(h, x, z, rad, fn) {
    var i0 = Math.floor((x - rad) / h.c), i1 = Math.floor((x + rad) / h.c), j0 = Math.floor((z - rad) / h.c), j1 = Math.floor((z + rad) / h.c);
    for (var i = i0; i <= i1; i++) for (var j = j0; j <= j1; j++) { var a = h.m[(i + 4096) * 8192 + j + 4096]; if (a) for (var q = 0; q < a.length; q++) fn(a[q]); }
  }
  function cragLayout(c) {                                       // a patch of crags: where each stands and how big, from the patch's seed (the same seed always gives the same crags)
    var s = (c.seed >>> 0) || 1, out = [], i, t, j, R = c.r, n = Math.max(1, Math.min(500, Math.round(c.count)));
    function rnd() { s = (s + 0x6D2B79F5) >>> 0; var u = s; u = Math.imul(u ^ u >>> 15, u | 1); u ^= u + Math.imul(u ^ u >>> 7, u | 61); return ((u ^ u >>> 14) >>> 0) / 4294967296; }
    function vary(a, v, lo, hi) { return Math.min(hi, Math.max(lo, a + (rnd() * 2 - 1) * v)); }
    for (i = 0; i < n; i++) {
      var rad = vary(c.base, c.baseV, 1, 15), h = vary(c.hgt, c.hgtV, 0.3, 200), want = vary(c.gap, c.gapV, 0, 1000), x = 0, z = 0;
      for (t = 0; t < 40; t++) {                                 // the gap asked for eases to nothing over the tries, so a crowded patch squeezes its crags closer rather than dropping any
        var f = 1 - t / 39, a = rnd() * 6.2832, d = Math.sqrt(rnd()) * R, ok = true; x = Math.cos(a) * d; z = Math.sin(a) * d;
        for (j = 0; j < out.length; j++) { var q = out[j]; if (Math.hypot(q.x - x, q.z - z) < q.rad + rad + want * f) { ok = false; break; } }
        if (ok) break;
      }
      out.push({ x: x, z: z, rad: rad, h: h });
    }
    return out;
  }
  function sbSeg(p) {                                            // a path segment as the game builds it. Old files have straights and left/right arcs; the same thing is a segment with no curve angle, or with a negative one
    var o = { dy: p.dy || 0, roll: p.roll || 0, b0: p.b0, w: p.w > 0 ? p.w : 0, w0: p.w0 > 0 ? p.w0 : 0, wm: p.wm, ov: p.ov ? 1 : 0, gf: p.gf ? 1 : 0, tx: p.tx > 0 ? Math.min(3, p.tx | 0) : 0, fl: p.fl > 0 ? p.fl : 0, sx: p.sx, sz: p.sz, sy: p.sy, sh: p.sh, sm: p.sm ? 1 : 0, smL: p.smL > 0 ? p.smL : 20 };
    if (p.disc) { o.disc = 1; o.R = Math.max(2, p.rad > 0 ? p.rad : 40); o.hd = p.h; o.cs = p.cs || 0; o.bk = p.bk || 0; o.ang = 0; o.len = 2 * o.R; o.dy = 0; o.roll = 0; o.w = 0; o.gf = 0; return o; }   // a circular deck: a radius instead of a length; the next segment leaves from its rim, where its heading points
    if (p.t === 'straight') { o.ang = 0; o.len = Math.max(0, p.len || 0); }
    else if (p.t === 'arc') { var a = Math.abs(p.ang || 0), r = Math.max(1, p.r || 1); o.ang = (p.dir === 'R' ? 1 : -1) * a; o.len = r * a * Math.PI / 180; }
    else { o.ang = p.ang || 0; o.len = Math.max(0, p.len === undefined ? 200 : p.len); }
    return o;
  }
  function sbTerrBase(kind, ex, z, top) {                        // top: the surface a path rides on, which over water is the water's surface rather than the ground far below it                             // the level's own ground at a point, before any path is laid over it (a path that follows the ground, or a slab being compared with it, starts from this)
    if (kind === 'level2') { var h2 = oldWorldH(L2_X + ex, z + L2_SBZ); return top ? Math.max(h2, WATER_Y) : h2; }
    if (kind === 'level1') return oldWorldH(ex, z);
    if (kind === 'grass') return terrainFlat(ex, z);
    if (kind === 'crags') return Math.min(300, mtSpikes(ex, z));
    if (kind === 'ocean') return top ? -10 : L2_VOID;
    return 0;                                                       // flat ground; the Giant Hill and Sunset Hill measure a path from their own surface, so that is 0 too
  }
  function sbDiscY(D, x, z) {                                   // the height of a circular deck at (x, z) (Sandbox coordinates): its slope rises (+) or falls (-) toward the centre, and its bank tips it to the right (+) of its heading, as a path's bank does
    var dx = x - D.cx, dz = z - D.cz, r = Math.hypot(dx, dz);
    return D.base + (D.R - Math.min(D.R, r)) * D.tanC - (dx * Math.cos(D.hh) + dz * Math.sin(D.hh)) * D.tanB;
  }
  function sbVcurves(sm, VJ) {                                   // gradual slope changes, the same as the Path Editor's vcurves: at a joint where either segment asks for it, the grade eases from one to the other over the blend length (half each side), as a parabola that meets both straight grades
    for (var q = 1; q < VJ.length; q++) {
      var A = VJ[q - 1], B = VJ[q]; if (!B.cont || A.gf || B.gf || !(A.sm || B.sm)) continue;
      var L = Math.min(Math.max(A.sm ? A.smL : 0, B.sm ? B.smL : 0), A.len, B.len), g1 = A.g, g2 = B.g; if (!(L > 0.01) || Math.abs(g2 - g1) < 1e-9) continue;
      var h = L / 2, sJ = sm[B.i0].s;
      for (var k = A.i0; k <= B.i1; k++) {
        var d = sm[k].s - sJ; if (d <= -h || d >= h) continue;
        sm[k].y += g1 * d + (g2 - g1) * (d + h) * (d + h) / (2 * L) - (d < 0 ? g1 : g2) * d;
        if (sm[k].fr) sm[k].fl = sm[k].y - sm[k].fr > sm[k].tb ? sm[k].fr : 0;   // a slab's underside: floating or merged, from the new height
      }
    }
  }
  function sbBuild(j) {
    j = j || {};
    var B = { discs: [], width: j.width || 9, terrain: j.terrain || '', samples: [], total: 0, objs: [], trees: [], minions: [], gazers: [], toxic: [], segs: [], tips: [], goals: [], spawners: [], strips: [], meshes: [], tipDone: {}, ramps: [], hills: [], lakes: [], bigs: [], caves: [], shafts: [], patches: [], timeLimit: Math.max(0, +j.timeLimit || 0), ranks: null, noCave: false, caveOpen: null, caveCov: null, caveR: 8, cps: [], signs: [], movers: [], plates: [], targets: [], trig: {}, tgBits: [], T: 0, signDone: {}, waterY: null };
    var sm = B.samples, x = 0, z = 0, th = 0, s = 0, y0b = (j.terrain === 'level2' ? L2_Y : 0), y = y0b, STEP = 4;      // Oceana Crags' path runs at 40
    var PATHS = [{ x: 0, z: 0, th: 0, y: 0, pieces: j.pieces || [] }].concat((j.extraPaths || []).map(function (e) { return { x: e.x || 0, z: e.z || 0, th: (e.heading || 0) * Math.PI / 180, y: e.rise || 0, pieces: e.pieces || [] }; }));
    B.pathStart = []; B.pathEnd = [];
    PATHS.forEach(function (pth, pk) {                             // each path is its own chain; its distances along it count from pk * 100000, so a stamp's "along" says which path it is on
      x = pth.x; z = pth.z; th = pth.th; s = pk * 100000; y = y0b + pth.y; var rl = 0, wd = B.width, sg0 = pth.pieces.length ? sbSeg(pth.pieces[0]) : null;
      if (sg0) { if (sg0.sx !== undefined) x = sg0.sx; if (sg0.sz !== undefined) z = sg0.sz; if (sg0.sy !== undefined) y = y0b + sg0.sy; if (sg0.sh !== undefined) th = sg0.sh * Math.PI / 180; if (sg0.b0 !== undefined) rl = sg0.b0; if (sg0.w0 > 0) wd = sg0.w0; }
      sm.push({ x: x, z: z, th: th, s: s, y: y, roll: rl, w: wd, brk: pk > 0 }); B.pathStart.push(s);
      var VJ = [];                                                 // the joints between this path's segments, for gradual slope changes (vcurves)
      pth.pieces.forEach(function (p0, pi) {
      var px0 = x, pz0 = z, py0 = y;
      var p = sbSeg(p0), i, n, rl0, rl1 = p.roll, w0, w1, wstep = p.wm === 'step', pov = p.ov, gf = p.gf, d, y0, tb, pfl, L2 = 0;   // fl: a slab this thick, floating where its underside is clear of the ground and merged with the ground where it is not. Width: each segment may end at its own width, tapering along it or stepping at its start
      if (pi > 0 && (p.sx !== undefined || p.sz !== undefined || p.sy !== undefined || p.sh !== undefined || p.b0 !== undefined || p.w0 > 0)) {     // a start set by hand: it does not pick up where the last one ended
        var nx = p.sx !== undefined ? p.sx : x, nz = p.sz !== undefined ? p.sz : z, jump = Math.hypot(nx - x, nz - z) > 0.5;
        x = nx; z = nz; if (p.sy !== undefined) y = y0b + p.sy; if (p.sh !== undefined) th = p.sh * Math.PI / 180; if (p.b0 !== undefined) rl = p.b0; if (p.w0 > 0) wd = p.w0;
        sm.push({ x: x, z: z, th: th, s: s, y: y, roll: rl, w: wd, brk: jump, tx: p.tx });
      }
      rl0 = rl; w0 = wd; w1 = p.w > 0 ? p.w : wd; y0 = y;
      var vj = { i0: sm.length - 1, len: p.len, g: p.len > 0 ? p.dy / p.len : 0, sm: !!p.sm, smL: p.smL, gf: !!gf, cont: pi > 0 && Math.hypot(x - px0, z - pz0) < 0.5 && Math.abs(y - py0) < 0.01 };
      function put(i2, n2, yy) { var tb2 = 0, dkG = j.terrain === 'level2'; if (p.fl && !dkG) tb2 = sbTerrBase(j.terrain, x, z); if (gf) yy = sbTerrBase(j.terrain, x, z, true) + p.dy; y = yy; sm.push({ fr: p.fl && !dkG ? p.fl : 0, tb: tb2, x: x, z: z, th: th, s: s, y: y, roll: rl0 + (rl1 - rl0) * smooth01(i2 / n2), w: wstep ? w1 : w0 + (w1 - w0) * smooth01(i2 / n2), fl: p.fl && !dkG && y - p.fl > tb2 ? p.fl : 0, dk: dkG && p.fl > 0 ? p.fl : 0, pv: pov, tx: p.tx }); }   // (on Oceana the path is a deck of its own everywhere, and a slab thickness is simply how deep that deck is: dk)
      if (p.disc) {                                               // a circular deck: she comes in at its rim; its centre is its radius straight ahead; the next segment leaves from the rim where the deck's heading points (the same heading as the way in: straight across)
        var Rd = p.R, hh = p.hd !== undefined && p.hd !== null ? p.hd * Math.PI / 180 : th, dcx = x + Math.sin(th) * Rd, dcz = z - Math.cos(th) * Rd;
        var D = { cx: dcx, cz: dcz, R: Rd, hh: hh, tanC: Math.tan(Math.max(-89, Math.min(89, p.cs)) * Math.PI / 180), tanB: Math.tan(Math.max(-89, Math.min(89, p.bk)) * Math.PI / 180), base: 0, ov: pov, tx: p.tx || 0, dk: p.fl || 0, idx: B.discs.length };
        D.base = y - (sbDiscY(D, x, z) - D.base); B.discs.push(D);   // the rim where she comes in is at the height the last segment ended at
        var ex0 = x, ez0 = z, nl = Math.max(1, Math.round(Rd / STEP)), dsk = D.idx + 1;
        for (i = 1; i <= nl; i++) { x = ex0 + (dcx - ex0) * i / nl; z = ez0 + (dcz - ez0) * i / nl; s += Rd / nl; y = sbDiscY(D, x, z); sm.push({ x: x, z: z, th: th, s: s, y: y, roll: 0, w: wd, dsk: dsk, tx: p.tx }); }
        var ox1 = dcx + Math.sin(hh) * Rd, oz1 = dcz - Math.cos(hh) * Rd; th = hh;
        sm.push({ x: x, z: z, th: th, s: s, y: y, roll: 0, w: wd, dsk: dsk, tx: p.tx });   // at the centre it turns to the way out (two samples at one spot)
        for (i = 1; i <= nl; i++) { x = dcx + (ox1 - dcx) * i / nl; z = dcz + (oz1 - dcz) * i / nl; s += Rd / nl; y = sbDiscY(D, x, z); sm.push({ x: x, z: z, th: th, s: s, y: y, roll: 0, w: wd, dsk: dsk, tx: p.tx }); }
        vj.gf = true; w1 = wd;
      }
      else if (Math.abs(p.ang) < 1e-9) { n = Math.max(1, Math.round(p.len / STEP)); d = p.len / n; for (i = 1; i <= n; i++) { x += Math.sin(th) * d; z -= Math.cos(th) * d; s += d; put(i, n, y0 + p.dy * i / n); } }
      else {
        var A = Math.abs(p.ang) * Math.PI / 180, R = Math.max(1e-6, p.len / A), sg = p.ang > 0 ? 1 : -1, L = p.len, th0 = th, cx = x + Math.cos(th0) * R * sg, cz = z + Math.sin(th0) * R * sg;
        n = Math.max(1, Math.round(L / STEP)); var s0 = s;
        for (i = 1; i <= n; i++) { var a = A * i / n, t2 = th0 + sg * a; x = cx - Math.cos(t2) * R * sg; z = cz - Math.sin(t2) * R * sg; th = t2; s = s0 + L * i / n; put(i, n, y0 + p.dy * i / n); }
      }
      wd = w1; rl = rl1; vj.i1 = sm.length - 1; VJ.push(vj);
      });
      sbVcurves(sm, VJ, j.terrain);
      B.pathEnd.push(sm[sm.length - 1].s);
    });
    B.total = sm[sm.length - 1].s; B.minY = 1e9; sm.forEach(function (q) { if (q.y < B.minY) B.minY = q.y; });
    B.hw = B.width / 2; B.hwMax = B.hw; sm.forEach(function (q) { if (q.w / 2 > B.hwMax) B.hwMax = q.w / 2; q.wl = Math.abs(q.roll || 0) > 80.5; });   // wl: banked past 80 degrees, so a true wall (a tilted plane), not part of the height map
    if (j.ranks) { var rk = j.ranks; B.ranks = [[+rk.S || 800000, 'S', '#e8a400'], [+rk.A || 720000, 'A', '#2e9b4b'], [+rk.B || 640000, 'B', '#2b7fd0'], [+rk.C || 560000, 'C', '#8a5ad0'], [+rk.D || 480000, 'D', '#c9602b'], [0, 'E', '#7a6a5a']]; }
    function at(sv) {
      if (sm.length < 2) return { x: 0, z: 0, th: 0, y: 0 };
      var pk0 = Math.max(0, Math.min(B.pathEnd.length - 1, Math.floor((sv + 0.5) / 100000))); sv = Math.max(B.pathStart[pk0], Math.min(B.pathEnd[pk0], sv));
      var lo = 0, hi = sm.length - 2;
      while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (sm[mid].s <= sv) lo = mid; else hi = mid - 1; }
      var i = lo;
      var a = sm[i], b = sm[i + 1], t = b.s > a.s ? Math.max(0, Math.min(1, (sv - a.s) / (b.s - a.s))) : 0;
      return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, th: a.th + (b.th - a.th) * t, y: a.y + (b.y - a.y) * t };
    }
    var byId = {};
    function base(o, depth) {
      if (o.after !== undefined && depth < 60) { var t = byId[o.after]; if (t && t !== o) { var e = shapeAt(t, t.len, depth + 1); return { x: e.x, z: e.z, th: e.th + (o.turn || 0) * Math.PI / 180 }; } }
      return { x: o.x || 0, z: o.z || 0, th: (o.th || 0) * Math.PI / 180 };
    }
    function shapeAt(o, d, depth) {
      depth = depth || 0;
      if (o.follow !== false && o.after === undefined) { var p = at(o.s + d); return { x: p.x + Math.cos(p.th) * o.u, z: p.z + Math.sin(p.th) * o.u, th: p.th }; }
      var b0 = base(o, depth), h0 = b0.th, Bn = (o.bend || 0) * Math.PI / 180, L = Math.max(1, o.len), dd = Math.min(L, d);
      if (Math.abs(Bn) < 1e-4) return { x: b0.x + Math.sin(h0) * dd, z: b0.z - Math.cos(h0) * dd, th: h0 };
      var Rr = L / Bn, t2 = h0 + Bn * dd / L; return { x: b0.x + Math.cos(h0) * Rr - Math.cos(t2) * Rr, z: b0.z + Math.sin(h0) * Rr - Math.sin(t2) * Rr, th: t2 };
    }
    var STRIPT = { segchain: 1, ledge: 1, platform: 1, gap: 1, mud: 1 };
    function pos(o) {
      var r = (o.rot || 0) * Math.PI / 180;
      if (STRIPT[o.t]) { var q = shapeAt(o, 0); return { x: q.x, z: q.z, th: q.th }; }
      if (o.s !== undefined) { var p = at(o.s); return { x: p.x + Math.cos(p.th) * o.u, z: p.z + Math.sin(p.th) * o.u, th: p.th + r }; }
      return { x: o.x, z: o.z, th: r };
    }
    // the objects
    (j.objects || []).forEach(function (r) {
      var o = { t: r.type, rot: r.rot || 0, id: r.id, y: r.y || 0, ind: r.heightMode === 'independent', ya: typeof r.yAbs === 'number' ? r.yAbs : undefined, yc: r.yFrom && r.yFrom.length === 2 ? r.yFrom : null };   // ya: a true Y typed in the editor (measured from where her feet are at the start of the path); without one a stamp sits on the ground
      if (r.s !== undefined) { o.s = r.s; o.u = r.u; } else { o.x = r.x; o.z = r.z; }
      if (r.type === 'tree' && r.exact) { o.ex = true; o.tH = r.trunkHeight || 15.5; o.tW = r.trunkWidth || 1.6; o.cH = r.canopyHeight || 14.9; o.cW = r.canopyWidth || 7.4; }
      if (r.type === 'toxic') { o.w = r.width || 12; o.d = r.length || 12; }
      if (r.type === 'seg') { o.big = !!r.big; o.h = r.height || 0; }
      if (r.type === 'segchain') { o.big = !!r.big; o.len = r.length || 120; o.gap = r.spacing || 12; o.follow = r.s !== undefined; o.h = r.height || 0; o.rise = r.rise || 0; o.arc = r.arc || 0; }
      if (r.type === 'ledge') { o.w = r.thickness || 4; o.hgt = r.height === undefined ? 5 : r.height; }
      if (r.type === 'platform') { o.w = r.width || 16; o.hgt = r.height === undefined ? 10 : r.height; o.move = r.move || 'none'; }
      if (r.type === 'gap') o.w = r.width || 15;
      o.sq = (r.type === 'gap' || r.type === 'ledge' || r.type === 'mud') && r.ends === 'square';
      o.tox = (r.type === 'ledge' || r.type === 'platform') && !!r.toxic;   // a toxic top: it hurts to stand on, like a toxic patch
      if (r.type === 'mud') { o.len = r.length || 150; o.follow = r.s !== undefined; if (!o.follow) o.w = r.width || 12; }   // mud on the path follows it and is as wide as it; mud anywhere else has its own curve and width
      if (r.type === 'ledge' || r.type === 'platform' || r.type === 'gap') { o.len = r.length || 40; o.follow = r.s !== undefined; }
      if (STRIPT[r.type] && !o.follow) { o.th = r.rot !== undefined ? r.rot : r.heading || 0;  /* old saves say heading */ o.bend = r.bend || 0; }
      if (typeof r.after === 'number' && r.type !== 'door') { o.after = r.after; o.turn = r.turn || 0; o.follow = false; o.bend = r.bend || 0; }   // starts from the end of another piece (a door's "after" is its mode once what it is linked to is beaten, not this)
      if (r.type === 'crag') { o.r = r.radius || 60; o.count = r.count || 25; o.seed = r.seed || ((r.id || 0) * 7919 + 13); if (r.heightVar !== undefined) { o.base = r.baseRadius || 5.5; o.baseV = r.baseRadiusVar || 0; o.hgt = r.height || 4; o.hgtV = r.heightVar || 0; o.gap = r.spacing || 0; o.gapV = r.spacingVar || 0; } else { o.base = 5.5; o.baseV = 2; o.hgt = 0.675 * (r.height || 6); o.hgtV = 0.325 * (r.height || 6); o.gap = 0; o.gapV = 0; } }
      if (r.type === 'patch') { o.shape = r.shape || 'ellipse'; o.w = r.width || 200; o.d = r.length || 150; o.ground = r.ground || 'grass'; o.hard = r.edge === 'hard'; o.soft = r.soften === undefined ? 30 : r.soften; }
      if (r.type === 'spawner') { o.r = r.radius || 40; o.every = r.every || 3; o.max = r.max || 6; }
      if (r.type === 'goal') { o.kind = r.kind || 'regular'; o.style = r.style || 'banner'; o.w = r.width || 16; }
      if (r.type === 'hill') { o.r = r.radius || 80; o.h = r.height || 20; o.rock = r.surface || 'rock'; }
      if (r.type === 'lake') { o.r = r.radius || 100; o.depth = r.depth || 12; o.wl = r.waterAdjust || 0; }
      if (r.type === 'ramp') { o.len = r.length || 45; o.w = r.width || 9; o.ang = r.slope === undefined ? 30 : r.slope; o.boost = r.boost === undefined ? 15 : r.boost; }
      if (r.type === 'checkpoint') { o.w = r.width || 16; o.num = r.number || 0; }
      if (r.type === 'sign') o.text = r.text || '';
      if ((r.type === 'minion' || r.type === 'bigminion') && r.idle) o.idle = true;
      if (r.type === 'gazer') { o.gm = r.mode === 'idle' || r.mode === 'cycle' ? r.mode : 'chase'; o.hgt = r.height === undefined ? 6 : r.height; o.move = r.move === 'forward' || r.move === 'vertical' ? r.move : 'side'; o.dist = r.travel || 40; o.period = r.period || 4; o.phase = r.phase || 0; }
      if (r.type === 'cave') { o.shape = r.shape || 'rect'; o.w = r.width || 8; o.h = r.height || 8; o.roll = r.roll || 0; o.ang = r.angle === undefined ? 20 : r.angle; o.len = r.depth || 60; o.bend = r.curvature || 0; o.slope = r.slope || 0; o.carve = r.carve || 0; o.angSet = !!r.angleSet; }
      if (r.type === 'door') {
        var dmode = function (v) { return v === 'open' || v === 'closed' ? v : 'cycle'; };
        var dcfg = function (q, dflt) { return { mode: dmode(q.mode), open: Math.max(0.1, q.open === undefined ? dflt.open : q.open), shut: Math.max(0.1, q.closed === undefined ? dflt.shut : q.closed), phase: q.phase === undefined ? dflt.phase : q.phase, speed: Math.max(0.05, q.speed === undefined ? dflt.speed : q.speed), slide: q.slide === 'edge' ? 'edge' : q.sink === false ? 'none' : 'down',
          sTx: q.shutTiltX === undefined ? dflt.sTx : q.shutTiltX, sTz: q.shutTiltZ === undefined ? dflt.sTz : q.shutTiltZ, oTx: q.openTiltX === undefined ? dflt.oTx : q.openTiltX, oTz: q.openTiltZ === undefined ? dflt.oTz : q.openTiltZ }; };
        o.w = r.width || 12; o.hgt = r.height === undefined ? 10 : r.height; o.cfgB = dcfg(r, { open: 3, shut: 3, phase: 0, speed: 0.5, sTx: 0, sTz: 0, oTx: 0, oTz: 0 });
        o.links = (r.links || []).slice(); o.modeA = o.links.length ? (r.after ? dmode(r.after.mode) : 'open') : null;   // a linked door: once everything it is linked to is beaten, only its mode changes; it opens and shuts the same way as before
      }
      if (r.type === 'platform') { o.dist = r.travel || 40; o.period = r.period || 4; o.phase = r.phase || 0; o.thick = r.thick === undefined ? 2 : r.thick; }
      if (r.type === 'tip') { o.shape = r.shape || 'circle'; o.r = r.radius || 40; o.w = r.width || 80; o.d = r.length || 60; o.text = r.text || ''; o.up = r.above || 0; o.dn = r.below || 0; }
      if (r.type === 'plate') { o.shape = r.shape === 'circle' ? 'circle' : 'rect'; o.r = Math.max(0.5, r.radius || 4); o.w = Math.max(0.5, r.width || 8); o.d = Math.max(0.5, r.length || 8); o.look = r.look === 'none' || r.look === 'brown' || r.look === 'halo' ? r.look : 'gray'; o.whl = !!r.onlyWhileStanding; }   // a pressure plate: pressed when she stands on it
      if (r.type === 'target') { o.size = Math.max(0.5, r.size || 6); o.post = r.post !== false; o.h = r.height === undefined ? 7 : r.height; o.tilt = r.tilt || 0; o.spin = r.spin || 0; o.hb = r.hitbox > 0 ? r.hitbox : 1; o.k = r.breakSpeed === undefined ? 20 : Math.max(0, r.breakSpeed); o.sd = r.sideTravel || 0; o.sp = Math.max(0.1, r.sidePeriod || 4); o.vd = r.upTravel || 0; o.vp = Math.max(0.1, r.upPeriod || 4); o.phase = r.phase || 0; }   // a target: a wooden disc with one heart, broken by the Barrier at speed
      if (o.id !== undefined) byId[o.id] = o;
      B.objs.push(o);
    });
    B.indep = B.objs.some(function (q) { return q.ind && (q.t === 'ledge' || q.t === 'hill' || q.t === 'crag'); });   // any hill, crag or ledge that keeps its own height instead of stacking
    B.toxLedge = false; B.toxLedgePts = [];
    var ledgeH = sbHash(12), gapH = sbHash(12), mudH = sbHash(12), coneH = sbHash(12), pathH = sbHash(24), maxL = 6, maxG = 6, maxM = 6;
    B.y0 = sm.length ? sm[0].y : 0;   // true Y zero: where her feet are at the start of the path
    B.objs.forEach(function (o, oi) {
      var p = STRIPT[o.t] || !o.t ? null : pos(o), n, k, q, T = o.ya !== undefined ? o.ya + B.y0 : undefined; o.T = T;
      try { var q0a = p || shapeAt(o, 0); o.ax = q0a.x; o.az = q0a.z; } catch (e0) {}   // where its Y is measured: its position, or where a strip starts
      if (o.t === 'tree') B.trees.push([p.x, p.z, o.y, o.ex ? { tH: o.tH, tW: o.tW, cH: o.cH, cW: o.cW } : null, T, o.yc]);
      else if (o.t === 'minion') B.minions.push([p.x, p.z, o.id, !!o.idle, T]);
      else if (o.t === 'cave') B.caves.push({ o: o, p: p });
      else if (o.t === 'gazer') B.gazers.push({ x: p.x, z: p.z, id: o.id, T: T, th: p.th || 0, gm: o.gm, hgt: o.hgt, move: o.move, dist: o.dist, period: o.period, phase: o.phase });
      else if (o.t === 'bigminion') { B.bigs.push({ x: p.x, z: p.z, id: o.id, idle: !!o.idle }); }   // (an old layout's "trapped" is ignored: pits are gone; an idle Big Minion in a shaft does that job)
      else if (o.t === 'toxic') B.toxic.push({ T: T, y: o.y, x: p.x, z: p.z, th: p.th, hw: o.w / 2, hd: o.d / 2, rr: Math.hypot(o.w, o.d) / 2 });
      else if (o.t === 'seg') B.segs.push({ x: p.x, z: p.z, big: o.big, h: o.h || 0, T: T });
      else if (o.t === 'segchain') { n = Math.max(1, Math.floor(o.len / Math.max(1, o.gap)) + 1); for (k = o.after !== undefined ? 1 : 0; k < n; k++) { q = shapeAt(o, Math.min(o.len, k * o.gap)); var ct = n > 1 ? k / (n - 1) : 0; B.segs.push({ x: q.x, z: q.z, big: o.big, h: (o.h || 0) + (o.rise || 0) * ct + (o.arc || 0) * 4 * ct * (1 - ct), T: T === undefined ? undefined : T + (o.rise || 0) * ct + (o.arc || 0) * 4 * ct * (1 - ct) }); } }
      else if (o.t === 'platform') {
        var mp = [], mq; n = Math.ceil(o.len / 2);
        for (k = 0; k <= n; k++) { mq = shapeAt(o, Math.min(o.len, k * 2)); mp.push([mq.x, mq.z, mq.th]); }
        var mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9, hf = o.w / 2 + 3;
        mp.forEach(function (c) { mnx = Math.min(mnx, c[0]); mxx = Math.max(mxx, c[0]); mnz = Math.min(mnz, c[1]); mxz = Math.max(mxz, c[1]); });
        var reach = (o.move === 'side' || o.move === 'forward') ? o.dist / 2 + 2 : 2;
        B.movers.push({ o: o, pts: mp, half: o.w / 2, hgt: o.hgt, thick: Math.max(0.2, o.thick), base: 0, off: [0, 0], dy: 0, th0: mp[0][2], minx: mnx - hf - reach, maxx: mxx + hf + reach, minz: mnz - hf - reach, maxz: mxz + hf + reach });
      }
      else if (o.t === 'door') {                                   // a wall across the way: it slides into the floor and/or tilts between its shut and open poses, on a cycle, held, or when what it is linked to has been beaten
        var dfx = Math.sin(p.th), dfz = -Math.cos(p.th), drr = o.w / 2 + 2 * o.hgt + 8;
        B.movers.push({ o: o, door: true, depth: 2, cx: p.x, cz: p.z, pts: [[p.x - dfx, p.z - dfz, p.th], [p.x + dfx, p.z + dfz, p.th]], half: o.w / 2, hgt: o.hgt, thick: o.hgt + 8, base: 0, off: [0, 0], dy: 0, sx: 0, sz: 0, k: o.cfgB.mode === 'open' ? 1 : 0, tx: 0, tz: 0, side: 0, th0: p.th, cfg: o.cfgB, minx: p.x - drr, maxx: p.x + drr, minz: p.z - drr, maxz: p.z + drr });
      }
      else if (o.t === 'ramp') B.ramps.push({ T: T, y: o.y, x: p.x, z: p.z, th: p.th, hw: o.w / 2, hl: o.len / 2, tn: Math.tan(o.ang * Math.PI / 180), boost: o.boost, rr: Math.hypot(o.w, o.len) / 2 + 1 });
      else if (o.t === 'hill') B.hills.push({ x: p.x, z: p.z, r: o.r, h: o.h, rock: o.rock, ind: !!o.ind, T: T });
      else if (o.t === 'lake') B.lakes.push({ x: p.x, z: p.z, r: o.r, depth: o.depth, wl: o.wl || 0, T: T });
      else if (o.t === 'start') B.startPt = { x: p.x, z: p.z, th: p.th, T: T };
      else if (o.t === 'checkpoint') B.cps.push({ T: T, y: o.y, x: p.x, z: p.z, th: p.th, hw: o.w / 2, num: o.num || 0, ord: oi });
      else if (o.t === 'sign') B.signs.push({ T: T, y: o.y, x: p.x, z: p.z, th: p.th, text: o.text });
      else if (o.t === 'plate') { var plc = o.shape === 'circle'; B.plates.push({ id: o.id, T: T, y: o.y, x: p.x, z: p.z, th: p.th, circ: plc, r: o.r, hw: o.w / 2, hd: o.d / 2, rr: plc ? o.r : Math.hypot(o.w, o.d) / 2, look: o.look, whl: o.whl, on: false, now: false }); if (o.id !== undefined) B.trig[o.id] = B.plates[B.plates.length - 1]; }
      else if (o.t === 'target') { B.targets.push({ id: o.id, T: T, y: o.y, x: p.x, z: p.z, th: p.th, size: o.size, post: o.post, h: o.h, tilt: o.tilt * Math.PI / 180, spin: o.spin * Math.PI / 180, hb: o.hb, k: o.k, sd: o.sd, sp: o.sp, vd: o.vd, vp: o.vp, phase: o.phase, on: false }); if (o.id !== undefined) B.trig[o.id] = B.targets[B.targets.length - 1]; }
      else if (o.t === 'ledge' || o.t === 'platform' || o.t === 'gap' || o.t === 'mud') {
        var half = o.t === 'mud' ? (o.follow === false ? o.w / 2 : B.hw) + 1 : o.t === 'ledge' ? Math.max(o.w / 2, 1.3) : o.w / 2, tgt = o.t === 'gap' ? gapH : o.t === 'mud' ? mudH : ledgeH;
        var mg = o.t === 'mud' ? 0 : 1.5, mgEnd = o.t === 'mud' ? 1 : 1.5;   // rounded: a disc of (half + mg) every 3 units. squared: boxes 1 unit apart (1.5 long, so they overlap on a bend), plus a cap of mgEnd past each end
        if (o.tox && o.t === 'ledge') { B.toxLedge = true; for (k = 0; k <= Math.ceil(o.len / 4); k++) { q = shapeAt(o, Math.min(o.len, k * 4)); B.toxLedgePts.push({ x: q.x, z: q.z, th: q.th, half: half + mg }); } }
        if (o.sq) {
          var sqH = half + mg, nq = Math.ceil(o.len);
          for (k = 0; k <= nq; k++) { q = shapeAt(o, Math.min(o.len, k)); sbAdd(tgt, q.x, q.z, { x: q.x, z: q.z, half: sqH, hl: 0.75, th: q.th, sq: true, o: o }); }
          [0, o.len].forEach(function (de, ei) { var qe = shapeAt(o, de), sgn = ei ? 1 : -1, cx2 = qe.x + Math.sin(qe.th) * sgn * mgEnd / 2, cz2 = qe.z - Math.cos(qe.th) * sgn * mgEnd / 2; sbAdd(tgt, cx2, cz2, { x: cx2, z: cz2, half: sqH, hl: mgEnd / 2 + 0.1, th: qe.th, sq: true, o: o }); });
        }
        else { n = Math.ceil(o.len / 3); for (k = 0; k <= n; k++) { q = shapeAt(o, Math.min(o.len, k * 3)); sbAdd(tgt, q.x, q.z, { x: q.x, z: q.z, half: half + mg, o: o }); } }
        if (o.t === 'gap') maxG = Math.max(maxG, half + 3); else if (o.t === 'mud') maxM = Math.max(maxM, half + 3); else maxL = Math.max(maxL, half + 3);
      }
      else if (o.t === 'crag') { cragLayout(o).forEach(function (c) { var cxp = p.x + c.x, czp = p.z + c.z; sbAdd(coneH, cxp, czp, { x: cxp, z: czp, rad: c.rad, h: c.h, ind: !!o.ind, T: T }); }); }
      else if (o.t === 'patch') B.patches.push({ T: T, x: p.x, z: p.z, th: p.th, hw: o.w / 2, hd: o.d / 2, shape: o.shape, ground: o.ground, hard: o.hard, soft: Math.max(0.5, o.soft), rr: Math.hypot(o.w, o.d) / 2 + o.soft });
      else if (o.t === 'spawner') B.spawners.push({ x: p.x, z: p.z, r: o.r, every: o.every, max: o.max, t: 0, T: T });
      else if (o.t === 'tip') B.tips.push({ T: T, x: p.x, z: p.z, th: p.th, shape: o.shape, r: o.r, hw: o.w / 2, hd: o.d / 2, text: o.text, y: o.y || 0, up: o.up || 0, dn: o.dn || 0 });
      else if (o.t === 'goal') B.goals.push({ T: T, y: o.y, x: p.x, z: p.z, th: p.th, w: o.w, kind: o.kind, style: o.style });
    });
    B.cps.sort(function (a, b) { return (a.num || 1e6) - (b.num || 1e6) || a.ord - b.ord; }); B.cps.forEach(function (c, ci) { c.n = ci + 1; });
    for (var si = 0; si < sm.length; si++) { sm[si].i = si; sbAdd(pathH, sm[si].x, sm[si].z, sm[si]); sm[si].startP = si === 0 || !!sm[si].brk; sm[si].endP = !sm[si + 1] || !!sm[si + 1].brk; }   // startP / endP: a path starts or ends at this sample (nothing before it, or nothing after it)
    for (si = 0; si + 1 < sm.length; si++) if (sm[si].startP && !sm[si + 1].brk && Math.hypot(sm[si + 1].x - sm[si].x, sm[si + 1].z - sm[si].z) < 1e-4) sm[si + 1].startP = true;   // (a segment of no length at either end does not count as more path)
    for (si = sm.length - 1; si > 0; si--) if (sm[si].endP && !sm[si].brk && Math.hypot(sm[si].x - sm[si - 1].x, sm[si].z - sm[si - 1].z) < 1e-4) sm[si - 1].endP = true;
    var slabH = sbHash(24), nSl = 0; for (var sj = 0; sj < sm.length; sj++) if (sm[sj].fl || (sm[sj + 1] && sm[sj + 1].fl)) { sbAdd(slabH, sm[sj].x, sm[sj].z, sm[sj]); nSl++; }
    var wallH = sbHash(24), nWl = 0; for (var wj = 0; wj < sm.length - 1; wj++) if (sm[wj].wl && sm[wj + 1].wl && !sm[wj + 1].brk) { sbAdd(wallH, sm[wj].x, sm[wj].z, sm[wj]); nWl++; }
    B.wallH = nWl ? wallH : null;                                  // wall pieces: found by sbWallFind
    B.slabH = nSl ? slabH : null;                                  // floating pieces: their own slabs, found here
    B.ledgeH = ledgeH; B.gapH = gapH; B.mudH = mudH; B.coneH = coneH; B.pathH = pathH; B.maxL = maxL; B.maxG = maxG; B.maxM = maxM;
    var toxH = sbHash(TOX_C); B.toxic.forEach(function (t) {     // toxic patches: each is filed in every cell its square reach covers, so a point looks in its own cell only (sbToxAt)
      t.cn = Math.cos(-t.th); t.sn = Math.sin(-t.th);
      for (var ta = Math.floor((t.x - t.rr) / TOX_C); ta <= Math.floor((t.x + t.rr) / TOX_C); ta++) for (var tb = Math.floor((t.z - t.rr) / TOX_C); tb <= Math.floor((t.z + t.rr) / TOX_C); tb++) sbAdd(toxH, (ta + 0.5) * TOX_C, (tb + 0.5) * TOX_C, t);
    });
    B.toxH = toxH;
    B.hillsT = B.hills.filter(function (h) { return h.T !== undefined; }); B.dLedgeH = null; B.dHills = [];
    if (B.terrain === 'level2') {                                  // Oceana: a ledge that starts on a path deck, or a hill centred on one, stands on the deck (raising its top, see sbDeckTop) instead of on the ground hidden under it
      var keepSB1 = SB, keepLH = B.ledgeH, keepHl = B.hills, keepHT = B.hillsT; SB = B;
      try {
        B.ledgeH = sbHash(ledgeH.c); B.hills = []; B.hillsT = [];
        var onDk = function (x, z) { var dk = sbDeckTop(L3_X + x, z, null); return dk > -1e8 && dk > level3H(L3_X + x, z) + 0.5; };
        B.objs.forEach(function (o) { if (o.t === 'ledge') { var q0 = shapeAt(o, 0); o.dk = onDk(q0.x, q0.z); } });
        keepHl.forEach(function (h) { h.dk = onDk(h.x, h.z); });
      } finally { B.ledgeH = keepLH; B.hills = keepHl; B.hillsT = keepHT; SB = keepSB1; }
      var dLH = sbHash(ledgeH.c), anyDL = false;
      for (var lhk in ledgeH.m) ledgeH.m[lhk] = ledgeH.m[lhk].filter(function (e) { if (!e.o.dk) return true; (dLH.m[lhk] || (dLH.m[lhk] = [])).push(e); anyDL = true; return false; });
      B.dLedgeH = anyDL ? dLH : null; B.dHills = B.hills.filter(function (h) { return h.dk; }); B.hills = B.hills.filter(function (h) { return !h.dk; }); B.hillsT = B.hills.filter(function (h) { return h.T !== undefined; });
      B.dHillR = 0; B.dHills.forEach(function (h) { B.dHillR = Math.max(B.dHillR, h.r); });
    }
    var lT = B.objs.filter(function (o) { return o.t === 'ledge' && o.T !== undefined; });
    if (lT.length) { var keepSB = SB; SB = B; try { lT.forEach(function (o) { var q0 = shapeAt(o, 0); if (o.dk) { sbNoBump = true; try { o.hgt = o.T - sbDeckTop(L3_X + q0.x, q0.z, null); } finally { sbNoBump = false; } } else o.hgt = o.T - level3H(L3_X + q0.x, q0.z); }); } finally { SB = keepSB; } }   // a ledge with a true Y: its top is at it where the ledge starts (and keeps the ground's shape along it)
    return B;
  }
  function sbDispose() { if (SB) { SB.meshes.forEach(function (m) { scene.remove(m); }); } SB = null; }

  // ---- Caves: a tunnel (or, from 80 degrees up, a shaft) bored into the ground. The ground is a height map and cannot hold a ceiling over a floor, so where the tunnel is under the surface the surface stays as its roof, the tunnel is a separate swept mesh, and Molly is moved onto the tunnel's own floor while she is inside it. Where the tunnel would break the surface the ground is cut down to its floor. ----
  function cavePoly(shape, w, h, roll) {
    var u = [], k, a;
    if (shape === 'tri') u = [[-1, -1], [1, -1], [0, 1]];
    else if (shape === 'hex') for (k = 0; k < 6; k++) u.push([Math.cos(k * Math.PI / 3), Math.sin(k * Math.PI / 3)]);
    else if (shape === 'oct') for (k = 0; k < 8; k++) u.push([Math.cos(Math.PI / 8 + k * Math.PI / 4), Math.sin(Math.PI / 8 + k * Math.PI / 4)]);
    else if (shape === 'circle') for (k = 0; k < 20; k++) u.push([Math.cos(k * Math.PI / 10), Math.sin(k * Math.PI / 10)]);
    else u = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    a = (roll || 0) * Math.PI / 180; var ca = Math.cos(a), sa = Math.sin(a);
    return u.map(function (q) { var l = q[0] * w / 2, v = q[1] * h / 2; return [l * ca - v * sa, l * sa + v * ca]; });
  }
  function polyRange(pts, l) {                                  // the lowest and highest points of the cross-section at sideways offset l, or null outside it
    var lo = 1e9, hi = -1e9, n = pts.length, i, a, b, t, v;
    for (i = 0; i < n; i++) {
      a = pts[i]; b = pts[(i + 1) % n];
      if (Math.abs(a[0] - b[0]) < 1e-9) { if (Math.abs(a[0] - l) < 1e-6) { lo = Math.min(lo, a[1], b[1]); hi = Math.max(hi, a[1], b[1]); } }
      else if ((a[0] - l) * (b[0] - l) <= 0) { t = (l - a[0]) / (b[0] - a[0]); v = a[1] + (b[1] - a[1]) * t; if (v < lo) lo = v; if (v > hi) hi = v; }
    }
    return hi < lo ? null : [lo, hi];
  }
  function polySd(pts, x, y) {                                  // signed distance to a convex polygon (negative inside)
    var n = pts.length, m = -1e9, i, a, b, ex, ey, el, d, sg = 0;
    for (i = 0; i < n; i++) { a = pts[i]; b = pts[(i + 1) % n]; sg += (b[0] - a[0]) * (b[1] + a[1]); }
    sg = sg > 0 ? -1 : 1;
    for (i = 0; i < n; i++) { a = pts[i]; b = pts[(i + 1) % n]; ex = b[0] - a[0]; ey = b[1] - a[1]; el = Math.hypot(ex, ey) || 1; d = sg * ((x - a[0]) * ey - (y - a[1]) * ex) / el; if (d > m) m = d; }
    return m;
  }
  function sbCaveInit() {
    var B = SB; B.caveOpen = sbHash(8); B.caveCov = sbHash(8); B.caveZone = B.caves.length ? sbHash(8) : null; B.noCave = true; B.caveRuns = [];
    var byIdC = {}; B.caves.forEach(function (c) { if (c.o.id !== undefined) byIdC[c.o.id] = c; });
    function doCave(c) {
      if (c.done) return; c.done = true;
      var pv0 = c.o.after !== undefined && byIdC[c.o.after] !== c ? byIdC[c.o.after] : null; if (pv0) doCave(pv0);
      var joined = pv0 && pv0.end ? pv0.end : null, fromShaft = null;                // joined to the end of another tunnel: it carries on from there, the way that one was heading
      var o = c.o, p = c.p || { x: 0, z: 0, th: 0 }, wx0 = L3_X + p.x, E = joined ? joined.y : o.T !== undefined ? o.T : level3H(wx0, p.z) + (o.y || 0), th = joined ? joined.hd + (o.turn || 0) * Math.PI / 180 : pv0 && pv0.shaft ? pv0.shaft.th + (o.turn || 0) * Math.PI / 180 : p.th, L = Math.max(4, o.len), pts, i, k;   // joined: it heads on the way the tunnel ended or the way its shaft faces (plus any turn at the joint), as the editor draws it; its own rotation is not used
      if (!joined && pv0 && pv0.shaft) {                         // joined to a shaft: the tunnel starts where its centre line meets the shaft's wall, with its floor level with the shaft's floor
        var psh = pv0.shaft, sDx = Math.sin(th), sDz = -Math.cos(th), t0 = 0, t1 = psh.rad * 3, tm, qi;
        for (qi = 0; qi < 30; qi++) { tm = (t0 + t1) / 2; if (polySd(psh.pts, sDx * tm * psh.Lx + sDz * tm * psh.Lz, sDx * tm * psh.Fx + sDz * tm * psh.Fz) <= 0) t0 = tm; else t1 = tm; }
        p = { x: psh.x + sDx * t0, z: psh.z + sDz * t0, th: th }; E = psh.floor + (o.y || 0); fromShaft = { sh: psh, dx: sDx, dz: sDz, th: th };
      }
      if (joined) { o = {}; for (var ok2 in c.o) o[ok2] = c.o[ok2]; if (!o.angSet) o.ang = Math.min(79, Math.max(-85, joined.pr * 180 / Math.PI)); }   // a linked cave carries on at the angle the last one ended on, unless it has its own
      if (o.ang >= 80) {                                         // a shaft: a pit with the cross-section's outline, straight down
        pts = cavePoly(o.shape, o.w, o.h, o.roll); var Lx = Math.cos(th), Lz = Math.sin(th), Fx = Math.sin(th), Fz = -Math.cos(th);
        var pl = pts.map(function (q) { return [q[0], q[1]]; }), rad = 0; pl.forEach(function (q) { rad = Math.max(rad, Math.hypot(q[0], q[1])); });
        var cvz = Math.max(0, Math.min(1, (+o.carve || 0) / 100)), fTop = E - cvz * L;    // carve: how much of the depth the surface slopes in (45 degrees) before the vertical wall begins
        var sh = { holes: [], x: p.x, z: p.z, th: th, pts: pl, floor: E - L, rad: rad + 4, ext: rad + 4 + (cvz > 0 ? cvz * L + 40 : 0), carve: cvz, fTop: fTop, gr: 1, Lx: Lx, Lz: Lz, Fx: Fx, Fz: Fz, top: E }; B.shafts.push(sh); c.shaft = sh;
        sh.wall = pl.map(function (q) { var wxp = p.x + Lx * q[0] + Fx * q[1], wzp = p.z + Lz * q[0] + Fz * q[1]; return [wxp, wzp, Math.min(level3H(L3_X + wxp, wzp), cvz > 0 ? fTop : 1e9)]; });
        return;
      }
      pts = cavePoly(o.shape, o.w, o.h, o.roll);
      var hwMax = 0, vhiMax = -1e9; pts.forEach(function (q) { hwMax = Math.max(hwMax, Math.abs(q[0])); vhiMax = Math.max(vhiMax, q[1]); });
      var r0 = polyRange(pts, 0) || [-o.h / 2, o.h / 2];
      var N = Math.max(2, Math.ceil(L / 1.5)), ds = L / N, bend = o.bend * Math.PI / 180, S = [], cur = null;
      function frame(sv) {
        var hd = th + bend * sv / L, pr = Math.max(-85, Math.min(85, o.ang + o.slope * sv / L)) * Math.PI / 180, cp = Math.cos(pr), sp = Math.sin(pr);
        return { hd: hd, pr: pr, cp: cp, sp: sp, tn: Math.tan(pr), Tx: Math.sin(hd) * cp, Ty: -sp, Tz: -Math.cos(hd) * cp, Lx: Math.cos(hd), Lz: Math.sin(hd), Nx: Math.sin(hd) * sp, Ny: cp, Nz: -Math.cos(hd) * sp };
      }
      var f0 = frame(0), A = joined ? { x: joined.x, y: joined.y, z: joined.z } : { x: p.x - f0.Nx * r0[0], y: E - f0.Ny * r0[0], z: p.z - f0.Nz * r0[0] };
      for (k = 0; k <= N; k++) {
        var f = frame(k * ds); f.x = A.x; f.y = A.y; f.z = A.z;
        var tx = A.x + f.Nx * vhiMax, tz = A.z + f.Nz * vhiMax, top = A.y + f.Ny * vhiMax, surf = level3H(L3_X + tx, tz) + sbLedge(L3_X + tx, tz);
        f.cov = (k > 0 || !!joined || !!fromShaft) && top < surf - 0.5; f.surf = surf; f.fy = A.y + f.Ny * r0[0]; f.k = k;
        var hl = Math.hypot(f.Tx, f.Tz) || 1e-6; f.Thx = f.Tx / hl; f.Thz = f.Tz / hl; f.dh = ds * f.cp; f.hw = hwMax; f.pts = pts; f.cp0 = f.cp;
        S.push(f);
        if (k < N) A = { x: A.x + f.Tx * ds, y: A.y + f.Ty * ds, z: A.z + f.Tz * ds };
      }
      if (fromShaft) fromShaft.sh.holes.push({ S0: S[0], pts: pts, hw: hwMax, dx: fromShaft.dx, dz: fromShaft.dz, th: fromShaft.th });
      c.end = { x: A.x, y: A.y, z: A.z, hd: th + bend, pr: frame(L).pr }; c.S = S;
      if (joined && pv0.S) {                                      // the joint between two tunnels: sbCaveQ eases the floor and roof from one to the other across it, over the samples within CAVE_JW of it on either side
        var pS = pv0.S, jn = { P: pS[pS.length - 1], Q: S[0] }, jk;
        for (jk = pS.length - 1; jk >= 0 && Math.hypot(pS[jk].x - jn.P.x, pS[jk].z - jn.P.z) < CAVE_JW + pS[jk].dh; jk--) pS[jk].jn = jn;
        for (jk = 0; jk < S.length && Math.hypot(S[jk].x - jn.Q.x, S[jk].z - jn.Q.z) < CAVE_JW + S[jk].dh; jk++) S[jk].jn = jn;
      }
      S.forEach(function (f) { if (f.cov) sbAdd(B.caveCov, f.x, f.z, f); else if (f.fy < f.surf - 0.2) sbAdd(B.caveOpen, f.x, f.z, f); });
      var zin = {}; for (k = 0; k < S.length; k++) if (S[k].cov) { for (var zk = Math.max(0, k - 3); zk <= k; zk++) if (!S[zk].cov || zk === k) zin[zk] = 1; zin[k] = 1; if (k + 1 < S.length && !S[k + 1].cov) for (var zk2 = k + 1; zk2 <= Math.min(S.length - 1, k + 3); zk2++) if (!S[zk2].cov) zin[zk2] = 1; } for (var zz in zin) sbAdd(B.caveZone, S[zz].x, S[zz].z, S[zz]);   // the mouth: where the tunnel goes under the surface
      B.caveR = Math.max(B.caveR, hwMax + 6);
      for (k = 0; k < S.length; k++) if (S[k].cov && (k === 0 || !S[k - 1].cov)) { var e1 = k; while (e1 + 1 < S.length && S[e1 + 1].cov) e1++; B.caveRuns.push(c.lastRun = { S: S, a: Math.max(0, k - 1), b: Math.min(S.length - 1, e1 + 1), pts: pts, hw: hwMax, endsCov: e1 === S.length - 1 }); k = e1; }
      if (joined && pv0.lastRun) pv0.lastRun.endsCov = false;       // no end wall where another tunnel carries on
    }
    B.caves.forEach(doCave);
    B.noCave = false;
  }
  function sbCaveQuery(x, z) { return sbCaveQ(SB && SB.caveCov, x, z); }
  var CAVE_JW = 3;                                                 // how far either side of the joint between two tunnels the floor and roof ease from one to the other
  function sbCaveFR(f, ex, z) {                                   // the floor and roof of a tunnel sample's own stretch at (ex, z), carried on straight past it
    var dx = ex - f.x, dz = z - f.z, al = dx * f.Thx + dz * f.Thz, rg = polyRange(f.pts, Math.max(-f.hw, Math.min(f.hw, dx * f.Lx + dz * f.Lz))); if (!rg) return null;
    return [f.y + rg[0] / f.cp - f.tn * al, f.y + rg[1] / f.cp - f.tn * al];
  }
  function sbCaveQ(hash, x, z, slack) {                          // the tunnel floor and roof under (x, z), where a stretch of tunnel is (hash: the covered samples, or the mouth zone)
    var B = SB; if (!B || !hash) return null; var ex = x - L3_X, best = null, bd = 1e9; slack = slack || 0;
    sbNear(hash, ex, z, B.caveR, function (e) {
      var dx = ex - e.x, dz = z - e.z, al = dx * e.Thx + dz * e.Thz; if (Math.abs(al) > e.dh * 0.6 + 0.01) return;
      var lat = dx * e.Lx + dz * e.Lz; if (Math.abs(lat) > e.hw + slack) return;
      var ab = Math.abs(al); if (ab < bd) { bd = ab; best = { e: e, lat: lat, al: al }; }
    });
    if (!best) return null; var e2 = best.e, rg = polyRange(e2.pts, Math.max(-e2.hw, Math.min(e2.hw, best.lat))); if (!rg) return null;
    best.fl = e2.y + rg[0] / e2.cp - e2.tn * best.al; best.rf = e2.y + rg[1] / e2.cp - e2.tn * best.al; best.rg = rg;   // straight down through the tilted cross-section: a section height of rg is rg / cos(angle) tall upright, as the tunnel is drawn
    if (e2.jn) {                                                  // near the joint between two tunnels of different angles (or shapes) each one's own floor and roof would stop at a step: ease from one to the other over CAVE_JW either side, so she can run across it
      var eP = e2.jn.P, eQ = e2.jn.Q, jx = eP.Thx + eQ.Thx, jz = eP.Thz + eQ.Thz, jl = Math.hypot(jx, jz) || 1, ja = ((ex - eP.x) * jx + (z - eP.z) * jz) / jl;
      if (ja > -CAVE_JW && ja < CAVE_JW) {
        var jt = smooth01((ja + CAVE_JW) / (2 * CAVE_JW)), fP = sbCaveFR(eP, ex, z), fQ = sbCaveFR(eQ, ex, z);
        if (fP && fQ) { best.fl = fP[0] + (fQ[0] - fP[0]) * jt; best.rf = fP[1] + (fQ[1] - fP[1]) * jt; }
      }
    }
    return best;
  }
  function sbShaftIn(x, z, slack) {                                // the shaft whose outline (grown by slack) holds the world point (x, z), or null
    var B = SB; if (!B || !B.shafts.length) return null; var ex = x - L3_X;
    for (var i = 0; i < B.shafts.length; i++) {
      var sh = B.shafts[i], dx = ex - sh.x, dz = z - sh.z, r = sh.rad + (slack > 0 ? slack : 0); if (dx > r || dx < -r || dz > r || dz < -r) continue;
      if (polySd(sh.pts, dx * sh.Lx + dz * sh.Lz, dx * sh.Fx + dz * sh.Fz) <= slack) return sh;
    }
    return null;
  }
  function sbCaveCarve(ex, z, y) {                               // ground cut down to the tunnel's floor where the tunnel breaks the surface
    var B = SB, out = y;
    if (B.caveOpen) sbNear(B.caveOpen, ex, z, B.caveR, function (e) {
      var dx = ex - e.x, dz = z - e.z, al = dx * e.Thx + dz * e.Thz; if (Math.abs(al) > e.dh * 0.5 + 0.02) return;
      var lat = Math.abs(dx * e.Lx + dz * e.Lz), k = lat <= e.hw ? 1 : 1 - smooth01((lat - e.hw) / 2.5); if (k <= 0) return;
      var v = y + (e.fy - y) * k; if (v < out) out = v;
    });
    for (var i = 0; i < B.shafts.length; i++) {                  // a shaft's wall is exact (see groundH). With carve, the surface slopes in toward the outline at 45 degrees and meets the natural ground wherever that is: no overhang
      var sh = B.shafts[i]; if (!sh.carve) continue; var dx2 = ex - sh.x, dz2 = z - sh.z; if (dx2 > sh.ext || dx2 < -sh.ext || dz2 > sh.ext || dz2 < -sh.ext) continue;
      var v2 = sh.fTop + sh.gr * polySd(sh.pts, dx2 * sh.Lx + dz2 * sh.Lz, dx2 * sh.Fx + dz2 * sh.Fz); if (v2 < out) out = v2;
    }
    return out;
  }
  function sbCaveMeshes() {
    var B = SB, mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide }), col = new THREE.Color(), tc = 0;
    function rock(P, C, a, b, c, k) { var j = rand01(tc, 3, 61), j2 = rand01(tc, 9, 62); tc++; col.setHSL(0.08 + (j - 0.5) * 0.015, 0.14 + (j - 0.5) * 0.05, (0.44 + (j - 0.5) * 0.08 + (j2 - 0.5) * 0.03) * k); [a, b, c].forEach(function (v) { P.push(v[0], v[1], v[2]); C.push(col.r, col.g, col.b); }); }
    function make(P, C) { if (!P.length) return; var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(C), 3)); g.computeVertexNormals(); var m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; scene.add(m); B.meshes.push(m); }
    var P = [], C = [];
    B.caveRuns.forEach(function (run) {
      var S = run.S, pts = run.pts, n = pts.length, k, j;
      function V(f, q) { return [L3_X + f.x + f.Lx * q[0] + f.Nx * q[1], f.y + f.Ny * q[1], f.z + f.Lz * q[0] + f.Nz * q[1]]; }
      for (k = run.a; k < run.b; k++) for (j = 0; j < n; j++) {
        var a0 = V(S[k], pts[j]), a1 = V(S[k], pts[(j + 1) % n]), b0 = V(S[k + 1], pts[j]), b1 = V(S[k + 1], pts[(j + 1) % n]), sh = pts[j][1] < -0.2 * 1 ? 0.9 : 1;
        rock(P, C, a0, a1, b1, sh); rock(P, C, a0, b1, b0, sh);
      }
      var y0 = 1e9, y1 = -1e9; pts.forEach(function (q) { y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
      if (run.a === 0 || !S[run.a - 1] || true) for (k = Math.max(0, run.a - 3); k < run.a; k++) {   // the lip: the tunnel's floor carries on out of the mouth, a hair under the carved ground, so no gap shows where the cut edge meets the floor
        if (S[k].cov) continue;
        for (j = 0; j < n; j++) {
          if ((pts[j][1] + pts[(j + 1) % n][1]) / 2 > y0 + (y1 - y0) * 0.15) continue;
          var g0 = V(S[k], pts[j]), g1 = V(S[k], pts[(j + 1) % n]), h0 = V(S[k + 1], pts[j]), h1 = V(S[k + 1], pts[(j + 1) % n]);
          [g0, g1, h0, h1].forEach(function (v) { v[1] -= 0.04; });
          rock(P, C, g0, g1, h1, 0.9); rock(P, C, g0, h1, h0, 0.9);
        }
      }
      if (run.endsCov) { var fe = S[run.b], cx = 0, cy = 0; pts.forEach(function (q) { cx += q[0] / n; cy += q[1] / n; }); var ctr = V(fe, [cx, cy]); for (j = 0; j < n; j++) rock(P, C, V(fe, pts[j]), V(fe, pts[(j + 1) % n]), ctr, 0.8); }
    });
    make(P, C);
    P = []; C = [];
    B.shafts.forEach(function (sh) {                              // a shaft's walls, from the floor up to the ground at each corner, and its floor
      var n = sh.pts.length, j, fcx = 0, fcz = 0; sh.wall.forEach(function (w) { fcx += w[0] / n; fcz += w[1] / n; });
      for (j = 0; j < n; j++) { var fa = sh.wall[j], fb = sh.wall[(j + 1) % n]; rock(P, C, [L3_X + fa[0], sh.floor, fa[1]], [L3_X + fb[0], sh.floor, fb[1]], [L3_X + fcx, sh.floor, fcz], 0.7); }
      for (j = 0; j < n; j++) {
        var a = sh.wall[j], b = sh.wall[(j + 1) % n], el = Math.hypot(b[0] - a[0], b[1] - a[1]), nc = sh.holes.length ? Math.max(1, Math.ceil(el)) : 1, ci;
        for (ci = 0; ci < nc; ci++) {                              // the wall in strips, so a tunnel joined to the shaft can have its opening cut out of it
          var u0 = ci / nc, u1 = (ci + 1) / nc, x0 = a[0] + (b[0] - a[0]) * u0, z0 = a[1] + (b[1] - a[1]) * u0, x1 = a[0] + (b[0] - a[0]) * u1, z1 = a[1] + (b[1] - a[1]) * u1;
          var t0 = a[2] + (b[2] - a[2]) * u0 + 0.3, t1 = a[2] + (b[2] - a[2]) * u1 + 0.3, mxp = (x0 + x1) / 2 - sh.x, mzp = (z0 + z1) / 2 - sh.z, hy0 = null, hy1 = null, hi;
          for (hi = 0; hi < sh.holes.length && hy0 === null; hi++) {
            var ho = sh.holes[hi], hl = mxp * Math.cos(ho.th) + mzp * Math.sin(ho.th), hf = mxp * ho.dx + mzp * ho.dz;
            if (hf > 0 && Math.abs(hl) < ho.hw - 0.05) { var hr = polyRange(ho.pts, hl); if (hr) { hy0 = ho.S0.y + hr[0] / ho.S0.cp; hy1 = ho.S0.y + hr[1] / ho.S0.cp; } }
          }
          function strip(ylo0, ylo1, yhi0, yhi1) { rock(P, C, [L3_X + x0, ylo0, z0], [L3_X + x1, ylo1, z1], [L3_X + x1, yhi1, z1], 0.85); rock(P, C, [L3_X + x0, ylo0, z0], [L3_X + x1, yhi1, z1], [L3_X + x0, yhi0, z0], 0.85); }
          if (hy0 === null) strip(sh.floor, sh.floor, t0, t1);
          else { if (hy0 > sh.floor + 0.01) strip(sh.floor, sh.floor, hy0, hy0); if (hy1 < Math.min(t0, t1) - 0.01) strip(hy1, hy1, t0, t1); }
        }
      }
    });
    make(P, C);
  }
  // Oceana Crags (Sandbox ground 'level2'): the path is not part of the ground at all. It is a deck of its own: an exact strip, drawn by sbMakeMeshes and stood on through sbDeckTop, with the ground under it left as it is. Her floor is whichever is higher, the deck or the ground, so what she stands on and what is drawn are the same surface by construction
  var DECK_TH = 2, DECK_CUT = 0.3, DECK_EDGE = 4.5;            // a deck's thickness where the segment gives no slab thickness; how far under a superseding deck taller rock is cut down; and how far past the deck's edges that cut stays full before it eases back up (a grid cell and its jitter, so no rock pokes through the deck's edge)
  var l3Ed = 1e9;                                                 // how far outside the nearest path's edge the last ground point read is
  var l3Tx = 0, l3Ps = 0, l3Pu = 0;                               // the path surface nearest the last ground point read: its texture (0 stone, 1 wood planks, 2 metal plates, 3 grass), how far along the path and how far across it
  var l3Bk = 0, l3A = 0, l3P = -Infinity, l3N = Infinity, l3S0 = 0, ledI = NaN, ledA = 0, ledCA = 0, ledCI = NaN, ledTox = false;   // what the last ground height was built from: stacked bumps, the highest and lowest independent ones, and what was added in all
  function sbComb(hA, P, N, La, Li) {                            // ground rise at a corner: stacked bumps plus stacked ledges, but an independent bump or ledge only reaches its own height and merges into whatever is higher (or lower, for a trench)
    var S = hA + La; if (P > S) S = P; if (Li > 0 && Li > S) S = Li; if (N < S) S = N; if (Li < 0 && Li < S) S = Li; return S;
  }
  function cornerY(x, z, L, La, LI) {                            // ground height at a mesh corner for a cell whose ledge is L (La and LI: its stacked and independent parts)
    var y = worldH0(x, z);
    if (SB && SB.indep && level === 3) return y + sbComb(l3A, l3P, l3N, La, LI) - l3S0;
    return y + L;
  }
  var GH_X = 0, GH_Z = -9000, GH_R = 9000, GH_H = 3000;           // the Giant Hill: centred 9,000 units ahead of the start, 9,000 in radius and 3,000 high, so its foot is where the path begins and its flanks climb to about 27 degrees
  // Sunset Hill (Sandbox ground 'sunset'): the Giant Hill's footprint, but the slope wanders on the way up between almost flat and about 45 degrees, and small ravines are carved through it.
  // The hill is 48 spokes running down from the top, each climbing at its own wandering slope (neighbouring spokes are alike, so the steep and gentle bands sweep around the hill), blended smoothly between spokes
  var SH_H = 3000, SH_N = 48, SH_DR = 10, SH_NR = Math.ceil(GH_R / SH_DR) + 1, SH_MIN = 2, SH_MAX = 42, SH_TAB = null;   // summit height; spokes; table step along a spoke; the gentlest and steepest slope in degrees (a little more where the spokes blend)
  var SH_RAV_W = 60, SH_RAV_D = 60, SH_RAV_S = 700;               // a ravine's usual width and depth (each wanders about 30% either way), and the scale of the field whose level lines they follow (roughly how far apart they are)
  var SH_TREES = 2 / 3;                                            // trees grow up to this fraction of the summit's height
  var shCut = 0;                                                   // how deep the ravine is at the last point read (0: not in one)
  function shTable() {
    if (SH_TAB) return SH_TAB;
    SH_TAB = new Float32Array(SH_N * SH_NR);
    var tn = new Float64Array(SH_NR), tmax = Math.tan(SH_MAX * Math.PI / 180), a, i, k, it, tot, s;
    for (a = 0; a < SH_N; a++) {
      var th = a / SH_N * 2 * Math.PI, cx = 0.9 * Math.cos(th), cz = 0.9 * Math.sin(th);   // each spoke reads the slope field along its own line, offset around a circle, so spokes next to each other read nearly the same values
      for (i = 0; i < SH_NR; i++) {
        var r = i * SH_DR, n = 0.7 * vnoise(r / 900 + cx, cz + 17.3, 61) + 0.3 * vnoise(r / 320 + cx * 2.8, cz * 2.8 - 9.1, 62);
        tn[i] = Math.tan((SH_MIN + (SH_MAX - SH_MIN) * smooth01((n - 0.25) / 0.5)) * Math.PI / 180) * smooth01(r / 400) * smooth01((GH_R - r) / 700);   // a rounded top and a foot that eases into the plain
      }
      for (k = 1, it = 0; it < 4; it++) { tot = 0; for (i = 0; i < SH_NR - 1; i++) tot += Math.min(tmax, tn[i] * k) * SH_DR; k *= SH_H / tot; }   // steepen or flatten the whole spoke so it reaches about the summit's height
      for (s = 0, i = SH_NR - 1; i >= 0; i--) { SH_TAB[a * SH_NR + i] = s; s += Math.min(tmax, tn[i] * k) * SH_DR; }
      for (i = 0; i < SH_NR; i++) SH_TAB[a * SH_NR + i] *= SH_H / SH_TAB[a * SH_NR];   // and exactly: every spoke meets the others at the top
    }
    for (i = 0; i < SH_NR; i++) {                                   // toward the top the spokes are close together, so a difference between them would be a cliff across the hill: there they all draw in to their average
      for (s = 0, a = 0; a < SH_N; a++) s += SH_TAB[a * SH_NR + i];
      s /= SH_N; k = smooth01((i * SH_DR - 300) / 4000);
      for (a = 0; a < SH_N; a++) SH_TAB[a * SH_NR + i] = s + (SH_TAB[a * SH_NR + i] - s) * k;
    }
    return SH_TAB;
  }
  function shBase(x, z) {                                          // Sunset Hill's height without its ravines or small bumps (Sandbox coordinates)
    var T = SH_TAB || shTable(), dx = x - GH_X, dz = z - GH_Z, r0 = Math.hypot(dx, dz);
    var r = r0 + 240 * (vnoise(x / 1900 + 3.3, z / 1900 - 7.7, 63) - 0.5) * smooth01(r0 / 1500);   // the contours wander, so the hill is not round
    if (r >= GH_R - SH_DR) return 0; if (r < 0) r = 0;
    var u = (Math.atan2(dz, dx) / (2 * Math.PI) + 1) * SH_N, a1 = Math.floor(u), f = u - a1, fr = r / SH_DR, i = Math.floor(fr), t = fr - i, p = [0, 0, 0, 0];
    for (var q = 0; q < 4; q++) { var o = (((a1 - 1 + q) % SH_N) + SH_N) % SH_N * SH_NR + i; p[q] = T[o] + (T[o + 1] - T[o]) * t; }
    return 0.5 * (2 * p[1] + (p[2] - p[0]) * f + (2 * p[0] - 5 * p[1] + 4 * p[2] - p[3]) * f * f + (3 * p[1] - p[0] - 3 * p[2] + p[3]) * f * f * f);   // smooth from spoke to spoke (Catmull-Rom)
  }
  function shRf(x, z) { return 0.75 * vnoise(x / SH_RAV_S + 11.7, z / SH_RAV_S - 4.2, 64) + 0.25 * vnoise(x * 2.6 / SH_RAV_S - 6.6, z * 2.6 / SH_RAV_S + 2.9, 65); }
  function shRavine(x, z) {                                        // how deep a ravine cuts at (x, z): ravines run along the level lines of a slow random field, a steep-walled channel with a narrow floor
    var n0 = shRf(x, z) - 0.5; if (n0 > 0.12 || n0 < -0.12) return 0;   // (the field cannot climb faster than this, so farther from the line than this there is no ravine)
    var e = 2, gx = shRf(x + e, z) - 0.5 - n0, gz = shRf(x, z + e) - 0.5 - n0, gl = Math.hypot(gx, gz) / e; if (gl < 1e-7) return 0;
    var d = Math.abs(n0) / gl, hw = SH_RAV_W / 2 * (0.7 + 0.6 * vnoise(x / 400 + 5.1, z / 400, 66)); if (d >= hw) return 0;   // distance to the line, and this stretch's half width
    var dep = SH_RAV_D * (0.7 + 0.6 * vnoise(x / 350 - 2.2, z / 350 + 8.4, 67));
    return dep * smooth01((hw - d) / (0.6 * hw)) * smooth01((Math.hypot(x, z) - 150) / 100);   // walls over the outer 60% of each side; none right at the start
  }
  function level3H(x, z) {
    wSt = 0; wPl = 0; wMud = 0; wF = 0; wL2 = 0; l3A = 0; l3P = -Infinity; l3N = Infinity; l3S0 = 0; l3Bk = 0; l3Tx = 0; shCut = 0; l3Ed = 1e9;
    if (!SB) return 0;
    var ex = x - L3_X, y = 0, B = SB, HW = SB.hw, hwq = SB.hw, best = 1e9, py = 0, ing = false, tox = false, pov = false, i, d;
    sbNear(B.gapH, ex, z, B.maxG, function (e) { if (!ing && sbIn(e, ex, z, 0)) ing = true; });
    var bp = null;
    sbNear(B.pathH, ex, z, B.hwMax + 18, function (p) { if (p.fl || p.wl || p.dsk) return; var dd = Math.hypot(p.x - ex, p.z - z); if (dd < best) { best = dd; py = p.y; bp = p; } });
    if (bp) {                                                         // the height is read along the path between its samples, not off the nearest one, so a steep rise is a smooth slope and not steps
      var sm0 = B.samples, nb, ta, bd2 = 1e9, tt, qx, qz, pa, pb2, vx, vz, vl, bkq = 0;
      for (var di = -1; di <= 0; di++) {
        pa = sm0[bp.i + di]; pb2 = sm0[bp.i + di + 1]; if (!pa || !pb2 || pb2.brk || pb2.fl || (pb2.wl && pa.wl) || (pa.dsk && pb2.dsk)) continue;      // a floating piece does not shape the ground under it
        vx = pb2.x - pa.x; vz = pb2.z - pa.z; vl = vx * vx + vz * vz; if (vl < 1e-9) continue;
        var tr = ((ex - pa.x) * vx + (z - pa.z) * vz) / vl;
        tt = Math.max(0, Math.min(1, tr)); qx = pa.x + vx * tt; qz = pa.z + vz * tt;
        var dq = Math.hypot(ex - qx, z - qz); if (dq < bd2) { hwq = ((pa.w || B.width) + ((pb2.w || B.width) - (pa.w || B.width)) * tt) / 2; bkq = 0; bd2 = dq; best = dq; pov = !!pb2.pv; py = pa.y + (pb2.y - pa.y) * tt; l3Tx = pb2.tx || 0; l3Ps = pa.s + (pb2.s - pa.s) * tt; l3Pu = ((ex - pa.x) * -vz + (z - pa.z) * vx) / Math.sqrt(vl);
          var rlq = (pa.roll || 0) + ((pb2.roll || 0) - (pa.roll || 0)) * tt;
          if (rlq > 0.05 || rlq < -0.05) { var latq = ((ex - pa.x) * -vz + (z - pa.z) * vx) / Math.sqrt(vl) + (pb2.th - pa.th) * Math.sqrt(vl) * tt * (1 - tt) / 2;   /* the samples sit on the true curve but the chord between them cuts inside it (by up to length squared over eight radii), and a steep bank turns that into a bump at every sample: the arc's own bulge is added back. Also how far across the chord she is, measured square to the chord itself: reading it off the blended heading was a little out on a curve, and a steep bank multiplies that error */ var cq0 = Math.cos(rlq * Math.PI / 180); var hw0q = hwq; hwq *= cq0; py -= Math.max(-hwq, Math.min(hwq, latq)) * Math.tan(rlq * Math.PI / 180); if ((rlq > 20 || rlq < -20) && dq <= hw0q + 3) bkq = 1; }   // a banked path keeps its width measured along the slope: across the ground it is only cos(bank) as wide, and rises width x sin(bank)   // a banked stretch: the right side lower for a positive bank
        }
      }
    }
    l3Bk = B.terrain === 'level2' ? 0 : bkq || 0;                  // a steeply banked stretch is within reach of this point: its ground needs a finer grid than the usual cell (not on Oceana, where a banked path is an exact deck and the ground is left alone)
    HW = hwq;
    for (i = 0; i < B.discs.length; i++) {                           // a circular deck: where its rim is nearer than the path's edge, it is the path here (its centre and radius stand in for the nearest path point and half width, so the ground eases to it the same way)
      var Dk = B.discs[i], ddx = ex - Dk.cx, ddz = z - Dk.cz, ddd = Math.hypot(ddx, ddz); if (ddd > Dk.R + 30 || ddd - Dk.R >= best - HW) continue;
      var dcl = ddd > Dk.R ? Dk.R / ddd : 1; best = ddd; HW = Dk.R; py = sbDiscY(Dk, Dk.cx + ddx * dcl, Dk.cz + ddz * dcl); pov = Dk.ov; l3Tx = Dk.tx; bp = bp || Dk;
      l3Ps = ddx * Math.sin(Dk.hh) - ddz * Math.cos(Dk.hh); l3Pu = ddx * Math.cos(Dk.hh) + ddz * Math.sin(Dk.hh);
    }
    if (ing) { best = 1e9; py = 0; }                                  // a gap is a break in the path: the ground is whatever is under it, with no path across
    l3Ed = best - HW;                                                 // how far outside the nearest path's edge this point is (negative: on it)
    if (B.terrain === 'grass') {                                      // Grass Canyon's rolling ground and nothing else: no walls, ledges or plateau, going on for ever. The path is laid over it and the ground eases into it
      var gb = terrainFlat(ex, z); y = gb;
      if (best < HW + 14) { var gk = 1 - smooth01((best - HW) / 14); y = gb + (py - gb) * gk; if (best <= HW) wL2 = 1; }
    }
    else if (B.terrain === 'crags') {                                 // the jagged rock of Oceana Crags and nothing else: spikes and crags rising from a flat floor, with a clear lane along the path that the rock eases down to
      var cenv = smooth01((best - HW - 10) / 50), csp = mtSpikes(ex, z) * cenv;
      y = Math.min(300, csp + (rand01(Math.round(ex / GRID), Math.round(z / GRID), 36) - 0.5) * 6 * Math.min(1, csp / 40));
      if (csp > 4) wSt = 1;
      if (best < HW + 14) { var ck = 1 - smooth01((best - HW) / 14); y += (py - y) * ck; if (best <= HW) { wL2 = 1; wSt = 0; } }
    }
    else if (B.terrain === 'giant') {                                 // one enormous hill, smooth and wide. The path rides on it: its height (the Rise) is measured from the hill's own surface
      var gdd = Math.hypot(ex - GH_X, z - GH_Z), ghv = GH_H * smooth01(1 - gdd / GH_R) + terrainFlat(ex, z);
      y = ghv;
      if (best < HW + 14) { var gk2 = 1 - smooth01((best - HW) / 14); y = ghv + py * gk2; if (best <= HW) wL2 = 1; }
    }
    else if (B.terrain === 'sunset') {                                // Sunset Hill: the path rides on the hill (its Rise measured from the hill's surface), but a ravine cuts through path and ground alike: no land bridges (a floating piece can still span one)
      var shb = shBase(ex, z); shCut = shRavine(ex, z); y = shb + terrainFlat(ex, z);
      if (best < HW + 14) { var gk3 = 1 - smooth01((best - HW) / 14); y += (shb + py - y) * gk3; if (best <= HW && shCut < 1) wL2 = 1; }
      if (shCut > 0) { y -= shCut; if (shCut > 3) wSt = 1; }         // bare rock down in a ravine
    }
    else if (B.terrain === 'ocean') {                                 // Oceana Crags' open sea and nothing else: no ground at all, the path is a causeway over it. She falls through the water to the bottom of the world
      y = L2_VOID; if (best < HW + 2) { y = L2_VOID + (py - L2_VOID) * (1 - smooth01((best - HW) / 2)); if (best <= HW) wL2 = 1; }
    }
    else if (B.terrain === 'level2') {                                // Oceana Crags' own generated ground (it sets the colour flags too). The path here is a deck of its own, not part of the ground
      y = oldWorldH(L2_X + ex, z + L2_SBZ);
      if (bp && best < 1e8) {
        if (pov && y > py - DECK_CUT) { var pkc = 1 - smooth01((best - HW - DECK_EDGE) / 14); if (pkc > 0) { y += (py - DECK_CUT - y) * pkc; wL2 = 0; wSt = 1; wPl = 0; wMud = 0; } }   // this piece supersedes the terrain: rock standing higher than the deck is cut down to just under it, a little wider than the deck, easing back up to the terrain over 14 units. Lower ground is never touched
      }
    }
    else if (B.terrain) {                                             // Grass Canyon's own generated ground (it sets the colour flags too)
      y = oldWorldH(ex, z);
      if (pov) { var pk2 = 1 - smooth01((best - HW) / 14); if (pk2 > 0) { y += (py - y) * pk2; if (best <= HW) { wL2 = 1; wSt = 0; wPl = 0; wMud = 0; } } }   // this piece is set to win over the terrain: the ground is cut down or built up to it, easing back to the terrain over 14 units
      else if (best <= HW && y < py - 0.3) { y = py; wL2 = 1; wSt = 0; wPl = 0; wMud = 0; }        // the path over low ground is a slab, as in the real level
    }
    else if (best < HW + 14) { y = py * (1 - smooth01((best - HW) / 14)); if (best <= HW) wL2 = 1; }
    for (i = 0; i < B.patches.length; i++) {                         // terrain patches: their own ground over the level's, with a hard or a soft edge
      var pa = B.patches[i]; if (Math.abs(pa.x - ex) > pa.rr || Math.abs(pa.z - z) > pa.rr) continue;
      var pc = Math.cos(-pa.th), ps = Math.sin(-pa.th), pdx = ex - pa.x, pdz = z - pa.z, plx = pdx * pc - pdz * ps, plz = pdx * ps + pdz * pc, pdist;
      if (pa.shape === 'rect') pdist = Math.min(pa.hw - Math.abs(plx), pa.hd - Math.abs(plz)); else pdist = (1 - Math.hypot(plx / pa.hw, plz / pa.hd)) * Math.min(pa.hw, pa.hd);
      var pk = pa.hard ? (pdist >= 0 ? 1 : 0) : smooth01((pdist + pa.soft / 2) / pa.soft); if (pk <= 0) continue;
      var pyy, dkG = B.terrain === 'level2', onP = best <= HW && !dkG, pyP = dkG ? py - DECK_CUT : py;   // (on Oceana the path is a deck of its own: a patch's ground eases to just under it, and is not painted as path)
      if (pa.ground === 'ocean') { pyy = L2_VOID; if (best < HW + 2 && !dkG) pyy = L2_VOID + (py - L2_VOID) * (1 - smooth01((best - HW) / 2)); }
      else if (pa.ground === 'flat') pyy = best < HW + 14 ? pyP * (1 - smooth01((best - HW) / 14)) : 0;
      else { var pgb = terrainFlat(ex, z); pyy = best < HW + 14 ? pgb + (pyP - pgb) * (1 - smooth01((best - HW) / 14)) : pgb; }
      if (pa.T !== undefined && pa.ground !== 'ocean') pyy = pa.T;   // a true Y: the patch's ground is at it
      y += (pyy - y) * pk;
      if (pk >= 0.5) { wSt = 0; wPl = 0; wMud = 0; wF = 0; wL2 = onP ? 1 : pa.ground === 'toxic' ? 3 : 0; }
    }
    var cone = 0, coneI = 0, hA = 0, hv; sbNear(B.coneH, ex, z, 16, function (c) { if (c.T !== undefined) return; var dd = Math.hypot(c.x - ex, c.z - z); if (dd < c.rad) { if (c.ind) coneI = Math.max(coneI, c.h * (1 - dd / c.rad)); else cone = Math.max(cone, c.h * (1 - dd / c.rad)); } });
    if (cone > 0 || coneI > 0) { hA = cone; if (coneI > l3P) l3P = coneI; wL2 = 0; if (cone > 0.5 || coneI > 0.5) wSt = 1; }
    for (i = 0; i < B.hills.length; i++) { var h = B.hills[i]; if (h.T !== undefined) continue; d = Math.hypot(ex - h.x, z - h.z); if (d < h.r) { hv = h.h * (1 - smooth01(d / h.r)); if (h.ind) { if (hv >= 0) { if (hv > l3P) l3P = hv; } else if (hv < l3N) l3N = hv; } else hA += hv; wL2 = 0; if (h.rock === 'rock' && d < h.r * 0.75) wSt = 1; } }
    l3A = hA; l3S0 = hA; if (l3P > l3S0) l3S0 = l3P; if (l3N < l3S0) l3S0 = l3N; y += l3S0;
    for (i = 0; i < B.hillsT.length; i++) { var hT = B.hillsT[i]; d = Math.hypot(ex - hT.x, z - hT.z); if (d < hT.r) { var hkT = 1 - smooth01((d / hT.r - 0.85) / 0.15); y += (hT.T + hT.h * (1 - smooth01(d / hT.r)) - y) * hkT; wL2 = 0; if (hT.rock === 'rock' && d < hT.r * 0.75) wSt = 1; } }   // a hill with a true Y: built up from that height, not from the ground
    sbNear(B.coneH, ex, z, 16, function (c) { if (c.T === undefined) return; var dd = Math.hypot(c.x - ex, c.z - z); if (dd < c.rad) { var cs = c.T + c.h * (1 - dd / c.rad); if (cs > y) { y = cs; wL2 = 0; if (c.h * (1 - dd / c.rad) > 0.5) wSt = 1; } } });   // a crag with a true Y: its rocks rise from that height
    for (i = 0; i < B.lakes.length; i++) { var lk = B.lakes[i]; d = Math.hypot(ex - lk.x, z - lk.z); if (d < lk.r) { y -= lk.depth * (1 - smooth01((d - lk.r * 0.7) / (lk.r * 0.3))); if (d < lk.r * 0.9) { wSt = 1; wL2 = 0; } } }
    if (B.slabH) { var scut = sbSlabCut(ex, z, y); if (scut < y) { y = scut; wSt = 1; wL2 = 0; wPl = 0; wMud = 0; } }   // a floating slab spans a drop: any higher ground in its way is cut down to just under it
    if (!B.noCave && B.caves.length) { var Lp = sbLedge(x, z), cy0 = sbCaveCarve(ex, z, y + Lp) - Lp; if (cy0 < y) { y = cy0; wSt = 1; wL2 = 0; wPl = 0; wMud = 0; } }
    for (i = 0; i < (sbNoRamps || B.terrain === 'level2' ? 0 : B.ramps.length); i++) {   // (on Oceana a ramp is a wedge of its own on the path's deck: see sbDeckTop)
      var rp = B.ramps[i]; if (Math.abs(rp.x - ex) > rp.rr || Math.abs(rp.z - z) > rp.rr) continue;
      var dx = ex - rp.x, dz = z - rp.z, lf = dx * Math.sin(rp.th) - dz * Math.cos(rp.th), lx = dx * Math.cos(rp.th) + dz * Math.sin(rp.th);
      if (Math.abs(lx) <= rp.hw && lf >= -rp.hl && lf <= rp.hl) { y = (rp.base === undefined ? y : rp.base) + rp.tn * (lf + rp.hl) + rp.y; wL2 = 1; }   // a flat plane rising from the height she stands on at its foot (the path, a slab of path, or the ground there), the same for the ground mesh and for her feet
    }
    var tca = sbToxAt(B, ex, z);
    if (tca) for (i = 0; i < tca.length; i++) { var t = tca[i]; if (Math.abs(t.x - ex) > t.rr || Math.abs(t.z - z) > t.rr) continue; var tdx = ex - t.x, tdz = z - t.z, lx2 = tdx * t.cn - tdz * t.sn, lz2 = tdx * t.sn + tdz * t.cn; if (Math.abs(lx2) <= t.hw && Math.abs(lz2) <= t.hd) { tox = true; break; } }
    { var mud = false, mudT; sbNear(B.mudH, ex, z, B.maxM, function (e) { if (!mud && sbIn(e, ex, z, 0)) { mud = true; mudT = e.o.T; } }); if (mud) { if (mudT !== undefined) y = mudT; wMud = 1; wL2 = 0; } }   // mud with a true Y: the ground under it is at that height
    return y;
  }
  function sbLedge(x, z) {
    if (!SB) return 0;
    var best = 0, bi = 0, bt = false, bit = false, ex = x - L3_X, base = 0; ledTox = false;
    if (SB.terrain === 'level1' || SB.terrain === 'level2') base = SB.terrain === 'level2' ? oldLedgeH(L2_X + ex, z + L2_SBZ) : oldLedgeH(ex, z);
    sbNear(SB.ledgeH, ex, z, SB.maxL, function (e) { if (sbIn(e, ex, z, 0)) { if (e.o.ind) { if (Math.abs(e.o.hgt) > Math.abs(bi)) { bi = e.o.hgt; bit = !!e.o.tox; } } else if (Math.abs(e.o.hgt) > Math.abs(best)) { best = e.o.hgt; bt = !!e.o.tox; } } });
    ledA = base + best; ledI = bi === 0 ? NaN : bi; ledTox = ledI === ledI && Math.abs(ledI) > Math.abs(best) ? bit : bt;   // ledTox: the ledge whose top this is has a toxic surface
    return ledI === ledI && Math.abs(ledI) > Math.abs(best) ? ledI + (base ? base : 0) : base + best;   // for anything that only wants one number: the taller of the two
  }
  function sbDoorSpan(m, ex, z) {                              // where the vertical line through (ex, z) passes through the door's slab right now: its lowest and highest world height there (null if it misses). The slab is tilted about its base, forward-and-back (tx) and side to side (tz)
    var th = m.th0, dx = ex - m.cx - m.sx, dz = z - m.cz - m.sz, X = dx * Math.cos(th) + dz * Math.sin(th), Z = dx * Math.sin(th) - dz * Math.cos(th);
    var ct = Math.cos(m.tz), st = Math.sin(m.tz), cp = Math.cos(m.tx), sp = Math.sin(m.tx), y0 = m.base + m.dy, lo = -1e9, hi = 1e9, i, a, b, l, h, y1, y2, cs = [
      [X * ct, -st, -m.half, m.half], [X * st * cp + Z * sp, ct * cp, 0, m.hgt], [-X * st * sp + Z * cp, -ct * sp, -m.depth / 2, m.depth / 2]];   // each local coordinate of the slab, as (a + b * height above its base), with its range
    for (i = 0; i < 3; i++) {
      a = cs[i][0]; b = cs[i][1]; l = cs[i][2]; h = cs[i][3];
      if (Math.abs(b) < 1e-6) { if (a < l || a > h) return null; continue; }
      y1 = (l - a) / b; y2 = (h - a) / b; if (y1 > y2) { var sw = y1; y1 = y2; y2 = sw; }
      if (y1 > lo) lo = y1; if (y2 < hi) hi = y2;
    }
    if (lo > hi) return null;
    return { th: th, la: X, al: Z, lo: y0 + lo, hi: y0 + hi };
  }
  function sbMovInside(m, ex, z) {                              // is (ex, z) over this platform right now? Returns its sample frame, or null
    var px = ex - m.off[0], pz = z - m.off[1]; if (px < m.minx || px > m.maxx || pz < m.minz || pz > m.maxz) return null;
    if (m.door) return sbDoorSpan(m, ex, z);
    for (var k = 0; k < m.pts.length; k++) {
      var q = m.pts[k], dx = px - q[0], dz = pz - q[1], th = q[2], al = dx * Math.sin(th) - dz * Math.cos(th), la = dx * Math.cos(th) + dz * Math.sin(th);
      if (Math.abs(la) <= m.half && Math.abs(al) <= 1.15) return { th: th, la: la };
    }
    return null;
  }
  function sbMoverTop(x, z, py) {                                // the top of whichever platform is under (x, z) right now that she is on or above (py = her feet; null: any), or a very low number
    var B = SB, ex = x - L3_X, top = -1e9;
    for (var i = 0; i < B.movers.length; i++) {
      var m = B.movers[i], t;
      if (m.door) { var ds = sbMovInside(m, ex, z); if (!ds) continue; t = ds.hi; if (t <= top || (py !== null && py < t - 1.2)) continue; top = t; continue; }
      t = m.base + m.hgt + m.dy; if (t <= top || (py !== null && py < t - 1.2)) continue;
      if (sbMovInside(m, ex, z)) top = t;
    }
    return top;
  }
  function sbDoorPose(m, force) {                                // put the door's eight corners where its slab is now
    var th = m.th0, c = Math.cos(th), sn = Math.sin(th), ct = Math.cos(m.tz), st = Math.sin(m.tz), cp = Math.cos(m.tx), sp = Math.sin(m.tx), y0 = m.base + m.dy, V = [], i, P = m.geo.attributes.position.array;
    for (i = 0; i < 8; i++) {
      var lx = (i & 1 ? 1 : -1) * m.half, ly = (i & 2 ? 1 : 0) * m.hgt, lz = (i & 4 ? 1 : -1) * m.depth / 2;
      var y1 = ly * cp - lz * sp, z1 = ly * sp + lz * cp, x2 = lx * ct + y1 * st, y2 = -lx * st + y1 * ct;           // pitch, then roll (lat, up, forward)
      V.push([L3_X + m.cx + m.sx + x2 * c + z1 * sn, y0 + y2, m.cz + m.sz + x2 * sn - z1 * c]);
    }
    var F = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 2, 6, 4], [1, 5, 7, 3], [2, 3, 7, 6], [0, 4, 5, 1]], k = 0;
    F.forEach(function (q) { [q[0], q[1], q[2], q[0], q[2], q[3]].forEach(function (vi) { P[k++] = V[vi][0]; P[k++] = V[vi][1]; P[k++] = V[vi][2]; }); });
    m.geo.attributes.position.needsUpdate = true; m.geo.computeVertexNormals(); m.geo.computeBoundingSphere();
  }
  function sbDoorLinked(m) {                                     // has everything this door is linked to been beaten? (a mob that is not on the map at all counts as not beaten)
    var ids = m.o.links, i, e, found; if (!ids.length) return false;
    for (i = 0; i < ids.length; i++) {
      var tr = SB.trig && SB.trig[ids[i]]; if (tr) { if (!tr.on) return false; continue; }   // a pressure plate (pressed) or a target (broken)
      found = false;
      for (var q = 0; q < MOBS.length; q++) { e = MOBS[q]; if (e.sbp && e.sbId === ids[i]) { found = true; if (!e.dead) return false; } }
      if (!found) return false;
    }
    return true;
  }
  var sbNoBump = false;
  function sbDeckLedge(ex, z) {                                    // Oceana: how far the ledges standing on a path deck raise its top at (ex, z) (the taller of the stacked and the independent ones, as on the ground; a dip goes no deeper than the deck)
    var B = SB, best = 0, bi = 0; if (!B.dLedgeH) return 0;
    sbNear(B.dLedgeH, ex, z, B.maxL, function (e) { if (sbIn(e, ex, z, 0)) { if (e.o.ind) { if (Math.abs(e.o.hgt) > Math.abs(bi)) bi = e.o.hgt; } else if (Math.abs(e.o.hgt) > Math.abs(best)) best = e.o.hgt; } });
    return Math.max(-(DECK_TH - 0.2), Math.abs(bi) > Math.abs(best) ? bi : best);
  }
  function sbDeckHill(ex, z, y) {                                  // Oceana: the deck's top at (ex, z) with the hills standing on it (y: the deck's own top there). A hill with a true Y is built up from that height, as on the ground
    var B = SB, i, h, d, add = 0;
    for (i = 0; i < B.dHills.length; i++) { h = B.dHills[i]; if (h.T !== undefined) continue; d = Math.hypot(ex - h.x, z - h.z); if (d < h.r) add += h.h * (1 - smooth01(d / h.r)); }
    y += Math.max(-(DECK_TH - 0.2), add);
    for (i = 0; i < B.dHills.length; i++) { h = B.dHills[i]; if (h.T === undefined) continue; d = Math.hypot(ex - h.x, z - h.z); if (d < h.r) y += (h.T + h.h * (1 - smooth01(d / h.r)) - y) * (1 - smooth01((d / h.r - 0.85) / 0.15)); }
    return y;
  }
  function sbDeckTop(x, z, py) {                                 // Oceana: the top of whichever path deck is under (x, z) that she is on or above (py = her feet; null: any), or a very low number. A deck is the path itself: as wide as its segment, tilted to its bank, ending square where the path ends, and missing wherever a gap cuts it
    var B = SB; if (!B || B.terrain !== 'level2') return -1e9;
    var ex = x - L3_X, top = -1e9, sm0 = B.samples, ing = false, ri, sq = -1e9, cE = 1e9, cY = -1e9;
    if (!sbNoRamps) for (ri = 0; ri < B.ramps.length; ri++) {       // a ramp: an exact wedge standing on the deck (on Oceana it is not part of the ground either). Solid from every side: it counts whatever her height
      var rp = B.ramps[ri]; if (rp.base === undefined || Math.abs(rp.x - ex) > rp.rr || Math.abs(rp.z - z) > rp.rr) continue;
      var rdx = ex - rp.x, rdz = z - rp.z, rlf = rdx * Math.sin(rp.th) - rdz * Math.cos(rp.th), rlx = rdx * Math.cos(rp.th) + rdz * Math.sin(rp.th);
      if (Math.abs(rlx) <= rp.hw && rlf >= -rp.hl && rlf <= rp.hl) { var ry = rp.base + rp.tn * (rlf + rp.hl) + rp.y; if (ry > top) top = ry; }
    }
    sbNear(B.gapH, ex, z, B.maxG, function (e) { if (!ing && sbIn(e, ex, z, 0)) ing = true; }); if (ing) return top;
    sbNear(B.pathH, ex, z, B.hwMax + 6, function (pa) {            // every stretch that starts at a sample within reach (so where two paths cross, each is found, and her height picks between them)
      var pb = sm0[pa.i + 1]; if (!pb || pb.brk || (pa.wl && pb.wl) || (pa.dsk && pb.dsk)) return;
      var vx = pb.x - pa.x, vz = pb.z - pa.z, vl = vx * vx + vz * vz; if (vl < 1e-9) return;
      var tr = ((ex - pa.x) * vx + (z - pa.z) * vz) / vl; if ((tr < 0 && pa.startP) || (tr > 1 && pb.endP)) return;   // past the very start or end of the path: no deck, and no floor
      var tt = Math.max(0, Math.min(1, tr)), dq = Math.hypot(ex - pa.x - vx * tt, z - pa.z - vz * tt), hwq = ((pa.w || B.width) + ((pb.w || B.width) - (pa.w || B.width)) * tt) / 2; if (dq > hwq) return;
      var yy = pa.y + (pb.y - pa.y) * tt, rl = (pa.roll || 0) + ((pb.roll || 0) - (pa.roll || 0)) * tt;
      if (rl > 0.05 || rl < -0.05) { var lat = ((ex - pa.x) * -vz + (z - pa.z) * vx) / Math.sqrt(vl) + (pb.th - pa.th) * Math.sqrt(vl) * tt * (1 - tt) / 2; hwq *= Math.cos(rl * Math.PI / 180); if (dq > hwq) return; yy -= Math.max(-hwq, Math.min(hwq, lat)) * Math.tan(rl * Math.PI / 180); }   // a banked deck: only cos(bank) as wide across the ground, the right side lower for a positive bank (and the arc's own bulge between two samples added back, as for the ground)
      if (py !== null && py < yy - Math.max((pb.dk || DECK_TH) + 0.25, 0.45 * Math.abs(Math.tan(rl * Math.PI / 180)) + 0.3)) return;   // her feet are below its underside: she is under it (an overpass), not on it. Anywhere within its thickness it is solid: its top is her floor, so from beside it, lower down, it stands in her way like a ledge instead of letting her walk into its side, and a steep bank cannot be climbed sideways through the deck
      var ext = (tr < 0 ? -tr : tr > 1 ? tr - 1 : 0) * Math.sqrt(vl);   // how far past this stretch's own end the point lies (0: squarely alongside it)
      if (ext < 1e-6) { if (yy > sq) sq = yy; }                    // the height comes from the stretch she is alongside. (Taking the highest of every stretch whose rounded end reached her lifted her off a climbing path by its slope times its half width)
      else if (ext < cE - 1e-6) { cE = ext; cY = yy; } else if (ext < cE + 1e-6 && yy > cY) cY = yy;   // alongside none (the outside of a corner): the nearest stretch's end fills it
    });
    if (sq < -1e8) sq = cY; if (sq > -1e8 && !sbNoBump && (B.dLedgeH || B.dHills.length)) sq = sbDeckHill(ex, z, sq) + sbDeckLedge(ex, z);   // ledges and hills standing on the deck
    if (sq > top) top = sq;
    for (var di2 = 0; di2 < B.discs.length; di2++) {                // a circular deck
      var Dq = B.discs[di2]; if (Math.hypot(ex - Dq.cx, z - Dq.cz) > Dq.R) continue;
      var dyq = sbDiscY(Dq, ex, z); if (py !== null && py < dyq - (Dq.dk || DECK_TH) - 0.25) continue; if (dyq > top) top = dyq;
    }
    return top;
  }
  function l3Top(x, z) { var y = level3H(x, z), d = sbDeckTop(x, z, null); return d > y ? d : y; }   // the Sandbox ground at a point, or the path deck over it (Oceana), whichever is higher
  function sbSlabTop(x, z, py) {                                 // the top of whichever floating slab of a path is under (x, z) that she is on or above (py = her feet; null: any), or a very low number
    var B = SB; if (!B || !B.slabH) return -1e9;
    var ex = x - L3_X, top = -1e9, sm0 = B.samples, cE = 1e9, cY = -1e9;
    sbNear(B.slabH, ex, z, B.hwMax + 5, function (bp) {
      for (var di = -1; di <= 0; di++) {
        var pa = sm0[bp.i + di], pb = sm0[bp.i + di + 1]; if (!pa || !pb || pb.brk || !pb.fl) continue;
        var vx = pb.x - pa.x, vz = pb.z - pa.z, vl = vx * vx + vz * vz; if (vl < 1e-9) continue;
        var tr = ((ex - pa.x) * vx + (z - pa.z) * vz) / vl; if ((tr < 0 && pa.startP) || (tr > 1 && pb.endP)) continue;   // past the very start or end of the path: the slab ends square there, as it is drawn, and there is no floor beyond it
        var tt = Math.max(0, Math.min(1, tr)), qx = pa.x + vx * tt, qz = pa.z + vz * tt, dq = Math.hypot(ex - qx, z - qz);
        var hwq = ((pa.w || B.width) + ((pb.w || B.width) - (pa.w || B.width)) * tt) / 2, yy = pa.y + (pb.y - pa.y) * tt, rl = (pa.roll || 0) + ((pb.roll || 0) - (pa.roll || 0)) * tt;
        if (rl > 0.05 || rl < -0.05) { var lat = ((ex - pa.x) * -vz + (z - pa.z) * vx) / Math.sqrt(vl) + (pb.th - pa.th) * Math.sqrt(vl) * tt * (1 - tt) / 2; hwq *= Math.cos(rl * Math.PI / 180); yy -= Math.max(-hwq, Math.min(hwq, lat)) * Math.tan(rl * Math.PI / 180); }
        if (dq > hwq) continue;
        if (py !== null && py < yy - Math.max(pb.fl + 0.25, 0.45 * Math.abs(Math.tan(rl * Math.PI / 180)) + 0.3)) continue;           // her feet are below its underside: she is under it. Within its thickness it is solid (it used to let her in from the side, or up through a steep bank, once she was 1.2 below its top)
        var ext = (tr < 0 ? -tr : tr > 1 ? tr - 1 : 0) * Math.sqrt(vl);
        if (ext < 1e-6) { if (yy > top) top = yy; }                 // the height comes from the stretch she is squarely alongside (the highest of every stretch whose rounded end reached her lifted her off a climbing slab by its slope times its half width)
        else if (ext < cE - 1e-6) { cE = ext; cY = yy; } else if (ext < cE + 1e-6 && yy > cY) cY = yy;   // alongside none (the outside of a corner): the nearest stretch's end fills it
      }
    });
    return top > -1e8 ? top : cY;
  }

  // ---- Walls: a path banked past 80 degrees is a tilted plane, not part of the height map (a height map cannot hold a vertical face). She moves on it as she would on flat ground:
  // her heading is measured along the wall (0 = along the path, + = toward the higher side), the camera turns the same way, and the pull is the slope table's. ----
  function sbWallFrame(i, t) {
    var sm0 = SB.samples, pa = sm0[i], pb = sm0[i + 1], vx = pb.x - pa.x, vz = pb.z - pa.z, L = Math.hypot(vx, vz) || 1e-6, fx = vx / L, fz = vz / L, r = ((pa.roll || 0) + ((pb.roll || 0) - (pa.roll || 0)) * t) * Math.PI / 180;
    return { i: i, t: t, L: L, fx: fx, fz: fz, lx: -fz, lz: fx, cx: pa.x + vx * t, cz: pa.z + vz * t, yc: pa.y + (pb.y - pa.y) * t, r: r, cr: Math.cos(r), sr: Math.sin(r), hw: ((pa.w || SB.width) + ((pb.w || SB.width) - (pa.w || SB.width)) * t) / 2, th: Math.atan2(fx, -fz), p: (pb.y - pa.y) / L };
  }
  function sbWallFind(ex, z, y) {                                // the wall piece nearest (ex, z, y), with where she is on it: a (across, + toward the lower side) and d (out from the face)
    var best = null, sm0 = SB.samples;
    sbNear(SB.wallH, ex, z, SB.hwMax + 8, function (p0) {
      var i = p0.i, pa = sm0[i], pb = sm0[i + 1]; if (!pb) return;
      var vx = pb.x - pa.x, vz = pb.z - pa.z, L = Math.hypot(vx, vz); if (L < 1e-6) return;
      var t = ((ex - pa.x) * vx + (z - pa.z) * vz) / (L * L), tc = Math.max(0, Math.min(1, t)), over = Math.abs(t - tc) * L; if (over > 0.8) return;
      var w = sbWallFrame(i, tc), hl = (ex - w.cx) * w.lx + (z - w.cz) * w.lz, dy = y - w.yc;
      w.a = hl * w.cr - dy * w.sr; w.d = hl * w.sr + dy * w.cr; w.sc = Math.abs(w.d) + over * 2;
      if (!best || w.sc < best.sc) best = w;
    });
    return best;
  }
  function sbWallLeave(w, vf, vl, kn, now) {                      // off the wall: her speed along it and the kick away from it become an ordinary flight
    var pr = w.p || 0, q = Math.sqrt(1 + pr * pr * w.cr * w.cr), u = vf / q;   // her speed along the wall follows its rise
    var vx = u * (w.fx + w.sr * pr * w.lx * w.cr) - vl * w.lx * w.cr + kn * w.lx * w.sr, vz = u * (w.fz + w.sr * pr * w.lz * w.cr) - vl * w.lz * w.cr + kn * w.lz * w.sr, vyy = u * pr * w.cr * w.cr + vl * w.sr + kn * w.cr, hs = Math.hypot(vx, vz), h0 = heading;
    if (hs > 0.5) heading = Math.atan2(-vx, -vz);
    speed = hs; vy = vyy; grounded = false; wallOn = false; wallCool = now + 250; yaw += wrapA(heading - h0); fallTop = player.position.y;
  }
  var wallPY = 0, wallPN = 0, wallQX = 0, wallQY = 0, wallQZ = 0, WALL_STEEP = 60;   // WALL_STEEP: she cannot run into a surface this many degrees steeper than the one she is on (it stops her like a wall)
  function sbWallBump(w, qx, qz, qy, now) {                       // too steep to run into: put her back where she was, keep only what runs along the face, and treat the hit like any other collision
    var pp = player.position, Hx = -Math.sin(heading), Hz = -Math.cos(heading), along = Hx * w.fx + Hz * w.fz, hn = Math.abs(Hx * w.lx + Hz * w.lz), h0 = heading, sg = along >= 0 ? 1 : -1;
    pp.set(qx, qy, qz);
    var endOn = Math.abs(along) > hn, into = speed * (endOn ? Math.abs(along) : hn);
    if (endOn) speed = 0;                                         // running straight at the foot of the wall along the path: it stops her dead
    else { heading = Math.atan2(-sg * w.fx, -sg * w.fz); speed *= Math.abs(along); yaw += Math.max(-0.8, Math.min(0.8, wrapA(heading - h0))); }   // coming at it from the side: she glances off along it
    if (now >= bumpUntil && into > 0.5) { bumpUntil = now + 1000; if (into >= 50 * TILE && !ballOn && hp > 0) { hp -= 1; drawHearts(); flashHurt(); } else shake(0.28); }
  }
  function sbWallEnter(now) {
    var pp0 = player.position, qx = wallQX, qy = wallQY, qz = wallQZ; wallQX = pp0.x; wallQY = pp0.y; wallQZ = pp0.z;
    var rise = (now > wallPN && now - wallPN < 200) ? (pp0.y - wallPY) / ((now - wallPN) / 1000) : 0; wallPY = pp0.y; wallPN = now;   // how fast she was rising or falling a moment ago
    if (!SB || !SB.wallH || level !== 3 || wallOn || !playing || now < wallCool) return;
    var pp = player.position, w = sbWallFind(pp.x - L3_X, pp.z, pp.y);
    if (grounded && w && Math.abs(w.a) <= w.hw + 0.5 && Math.abs(w.r) * 57.29578 - slDeg > WALL_STEEP) {   // a much steeper face than the ground she is on: she hits it instead of running up it
      var hlP = (pp.x - L3_X - w.cx) * w.lx + (pp.z - w.cz) * w.lz, hlQ = (qx - L3_X - w.cx) * w.lx + (qz - w.cz) * w.lz;
      if (Math.abs(w.d) < 1.5 || hlP * hlQ < 0) { sbWallBump(w, qx, qz, qy, now); return; }
    }
    if (!w || Math.abs(w.a) > w.hw || w.d < -0.8 || w.d > (grounded ? 1.0 : 0.7)) return;
    var Hx = -Math.sin(heading), Hz = -Math.cos(heading), vf, vl;
    var vyE = grounded ? Math.max(-speed, Math.min(speed, rise)) : vy, hsE = grounded ? Math.sqrt(Math.max(0, speed * speed - vyE * vyE)) : speed;   // her real velocity: the run on the ground, and however fast she was climbing the bank
    var vx3 = Hx * hsE, vz3 = Hz * hsE, vh = vx3 * w.lx + vz3 * w.lz, pr = w.p, q = Math.sqrt(1 + pr * pr * w.cr * w.cr);
    vf = (vx3 * w.fx + vz3 * w.fz + vyE * pr + w.sr * pr * (vh * w.cr - vyE * w.sr)) / q; vl = -vh * w.cr + vyE * w.sr;   // her 3D velocity on the wall's surface (along it, following its rise, and across its face): the part into the wall is lost, so hitting a wall head-on does not turn her speed straight up it
    if (vh * w.sr + vyE * w.cr > 2) return;                       // moving away from its face (the wall's own rise or fall along its length does not count: she sticks to it as she does to ground that tips gently away)
    var h0 = heading; speed = Math.hypot(vf, vl); heading = wrapA(-w.th + Math.atan2(vl, vf)); yaw += wrapA(heading - h0);
    wallOn = true; grounded = true; vy = 0; wallR = w.r; wallNx = w.lx * w.sr; wallNz = w.lz * w.sr; sgx = sgz = 0;
    var a = Math.max(-w.hw, Math.min(w.hw, w.a)); pp.set(L3_X + w.cx + w.lx * a * w.cr, w.yc - a * w.sr, w.cz + w.lz * a * w.cr);
  }
  function sbWallMove(sdt, now) {
    var pp = player.position, w = sbWallFind(pp.x - L3_X, pp.z, pp.y);
    if (!w) { wallOn = false; grounded = false; wallCool = now + 250; return; }
    var ps = wrapA(heading + w.th), vf = speed * Math.cos(ps), vl = speed * Math.sin(ps);
    var pr = w.p, q = Math.sqrt(1 + pr * pr * w.cr * w.cr);       // the wall's rise per unit along its plan, and how much longer its surface is than its plan
    vf -= GRAV * pr * w.cr * w.cr / q * sdt;                       // gravity (straight down) on the wall's surface: the part along the wall (a climb costs speed, a descent adds it)
    vl -= GRAV * w.sr * sdt;                                       // and the part across its face, toward the lower side
    speed = Math.hypot(vf, vl);
    if (speed > 0.5) heading += wrapA(Math.atan2(vl, vf) - ps);   // the pull really bends her direction (a true vector sum that is kept from frame to frame), so only her grip can hold her line
    if (jumpBuf > 0) { jumpBuf = 0; var kn = (spaceDown ? JUMP_V : JUMP_V * 0.35) * 0.7; sbWallLeave(w, vf, vl, kn, now); return; }
    var ds = vf * sdt / q, sm0 = SB.samples, i = w.i, L = w.L, t = w.t + ds / L, end = 0, a2 = w.a - vl * sdt + w.sr * pr * ds;   // moved along the surface in 3D
    while (t > 1) { var nx = sm0[i + 2]; if (nx && sm0[i + 1].wl && nx.wl && !nx.brk) { var L2 = Math.hypot(nx.x - sm0[i + 1].x, nx.z - sm0[i + 1].z) || 1e-6; t = (t - 1) * L / L2; L = L2; i++; } else { t = 1; end = 1; break; } }
    while (t < 0) { var pv = sm0[i - 1]; if (pv && pv.wl && sm0[i].wl && !sm0[i].brk) { var L3 = Math.hypot(sm0[i].x - pv.x, sm0[i].z - pv.z) || 1e-6; t = 1 + t * L / L3; L = L3; i--; } else { t = 0; end = -1; break; } }
    var wn = sbWallFrame(i, t), dH = wrapA(w.th - wn.th);          // the wall bends: her heading and the camera turn with it, so her angle along the wall is kept
    heading += dH; yaw += dH; wallR = wn.r; wallNx = wn.lx * wn.sr; wallNz = wn.lz * wn.sr;
    var side = Math.abs(a2) > wn.hw, ac = Math.max(-wn.hw, Math.min(wn.hw, a2));
    pp.set(L3_X + wn.cx + wn.lx * ac * wn.cr, wn.yc - ac * wn.sr, wn.cz + wn.lz * ac * wn.cr);
    if (side || end) {
      var ps2 = wrapA(heading + wn.th), vf2 = speed * Math.cos(ps2), vl2 = speed * Math.sin(ps2), sp0 = speed;
      sbWallLeave(wn, vf2, vl2, 0, now);
      if (end && !side) { var gH = groundH(pp.x, pp.z); if (Math.abs(pp.y - gH) < 0.8) { grounded = true; vy = 0; speed = sp0; pp.y = gH; } }   // the wall runs out onto the ground: she carries on along it
    }
  }
  function sbWallMeshes() {
    var B = SB; if (!B.wallH) return;
    var sm = B.samples, P = [], C = [], col = new THREE.Color(), mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide }), i, tc = 0, TH = 1.5;
    function quad(a, b, c, d, h, sat, l) { var j = rand01(tc++, 5, 73); col.setHSL(h + (j - 0.5) * 0.01, sat, l + (j - 0.5) * 0.03); [a, b, c, a, c, d].forEach(function (v) { P.push(v[0], v[1], v[2]); C.push(col.r, col.g, col.b); }); }
    function E(sp) { var hw = (sp.w || B.width) / 2, r = (sp.roll || 0) * Math.PI / 180, cr = Math.cos(r), sr = Math.sin(r), lx = Math.cos(sp.th), lz = Math.sin(sp.th), x = L3_X + sp.x, z = sp.z;
      var nx = lx * sr * TH, ny = cr * TH, nz = lz * sr * TH;
      return { L: [x - lx * hw * cr, sp.y + hw * sr, z - lz * hw * cr], R: [x + lx * hw * cr, sp.y - hw * sr, z + lz * hw * cr], Lb: [x - lx * hw * cr - nx, sp.y + hw * sr - ny, z - lz * hw * cr - nz], Rb: [x + lx * hw * cr - nx, sp.y - hw * sr - ny, z + lz * hw * cr - nz] }; }
    for (i = 0; i < sm.length - 1; i++) {
      var a = sm[i], b = sm[i + 1]; if (!a.wl || !b.wl || b.brk) continue;
      var Ea = E(a), Eb = E(b);
      quad(Ea.L, Ea.R, Eb.R, Eb.L, 0.09, 0.3, 0.5);                       // the face she runs on
      quad(Ea.Lb, Eb.Lb, Eb.Rb, Ea.Rb, 0.07, 0.12, 0.3);                  // the back
      quad(Ea.L, Eb.L, Eb.Lb, Ea.Lb, 0.08, 0.14, 0.4); quad(Ea.R, Eb.R, Eb.Rb, Ea.Rb, 0.08, 0.14, 0.4);   // the top and bottom edges
      if (!(sm[i - 1] && sm[i - 1].wl && !a.brk)) quad(Ea.L, Ea.R, Ea.Rb, Ea.Lb, 0.08, 0.14, 0.36);
      var nx2 = sm[i + 2]; if (!nx2 || !nx2.wl || nx2.brk) quad(Eb.L, Eb.R, Eb.Rb, Eb.Lb, 0.08, 0.14, 0.36);
    }
    if (!P.length) return;
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(C), 3)); g.computeVertexNormals();
    var m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; scene.add(m); B.meshes.push(m);
  }
  function sbSlabCut(ex, z, y) {                                 // the height the ground is brought down to under and beside a floating slab (just below its underside, easing back out over 6 units), or y if it is already lower
    var B = SB, sm0 = B.samples, out = y;
    sbNear(B.slabH, ex, z, B.hwMax + 12, function (bp) {
      for (var di = -1; di <= 0; di++) {
        var pa = sm0[bp.i + di], pb = sm0[bp.i + di + 1]; if (!pa || !pb || pb.brk || !pb.fl) continue;
        var vx = pb.x - pa.x, vz = pb.z - pa.z, vl = vx * vx + vz * vz; if (vl < 1e-9) continue;
        var tr = ((ex - pa.x) * vx + (z - pa.z) * vz) / vl, i0 = bp.i + di, nx2 = sm0[i0 + 2];
        if (tr < 0 && !pa.startP && !pa.fl) continue;              // before this slab's start, where the path comes in along the ground: that ground is the path's own and is not cut (it used to be, leaving a pit across the path at each end of every floating piece)
        if (tr > 1 && !pb.endP && nx2 && !nx2.fl) continue;               // and the same past its end
        var tt = Math.max(0, Math.min(1, tr)), dq = Math.hypot(ex - (pa.x + vx * tt), z - (pa.z + vz * tt));
        var hwq = ((pa.w || B.width) + ((pb.w || B.width) - (pa.w || B.width)) * tt) / 2 + 1, k = 1 - smooth01((dq - hwq) / 6); if (k <= 0) continue;
        var bot = pa.y + (pb.y - pa.y) * tt - pb.fl - 0.5, rl = Math.abs((pa.roll || 0) + ((pb.roll || 0) - (pa.roll || 0)) * tt); if (rl > 0.05) bot -= (hwq - 1) * Math.sin(Math.min(rl, 80) * Math.PI / 180);   // a banked slab's low edge
        if (y > bot) { var c = y + (bot - y) * k; if (c < out) out = c; }
      }
    });
    return out;
  }
  function sbSlabMeshes() {                                      // each floating stretch of path: a top, an underside, two sides and a cap at each end, as one slab of stone
    var B = SB; if (!B.slabH) return;
    var sm = B.samples, P = [], C = [], col = new THREE.Color(), mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide }), i, tc = 0;
    function quad(a, b, c, d, h, sat, l) { var j = rand01(tc++, 5, 71); col.setHSL(h + (j - 0.5) * 0.01, sat, l + (j - 0.5) * 0.03); [a, b, c, a, c, d].forEach(function (v) { P.push(v[0], v[1], v[2]); C.push(col.r, col.g, col.b); }); }
    function E(sp, t) { var hw = (sp.w || B.width) / 2, rl = (sp.roll || 0) * Math.PI / 180, dx = Math.cos(sp.th) * hw * Math.cos(rl), dz = Math.sin(sp.th) * hw * Math.cos(rl), dy = hw * Math.sin(rl);
      return { L: [L3_X + sp.x - dx, sp.y + dy, sp.z - dz], R: [L3_X + sp.x + dx, sp.y - dy, sp.z + dz], Ld: [L3_X + sp.x - dx, sp.y + dy - t, sp.z - dz], Rd: [L3_X + sp.x + dx, sp.y - dy - t, sp.z + dz] }; }
    for (i = 0; i < sm.length - 1; i++) {
      var a = sm[i], b = sm[i + 1]; if (!b.fl || b.brk) continue;
      var t = b.fl, Ea = E(a, t), Eb = E(b, t);
      for (var cq = 0; cq < 4; cq++) {                                  // the top: the same surface as the path on the ground (its texture, stone by default, a shade per facet), in four strips across
        var f0 = cq / 4, f1 = (cq + 1) / 4, lr = function (E2, f) { return [E2.L[0] + (E2.R[0] - E2.L[0]) * f, E2.L[1] + (E2.R[1] - E2.L[1]) * f, E2.L[2] + (E2.R[2] - E2.L[2]) * f]; };
        var hwq2 = (b.w || B.width) / 2, a0 = lr(Ea, f0), a1 = lr(Ea, f1), b1 = lr(Eb, f1), b0 = lr(Eb, f0);
        [[a0, a1, b1], [a0, b1, b0]].forEach(function (tr3) { pathTexCol(col, b.tx || 0, (a.s + b.s) / 2, (f0 + f1 - 1) * hwq2, rand01(tc++, 5, 71), rand01(tc, 7, 72)); tr3.forEach(function (v) { P.push(v[0], v[1], v[2]); C.push(col.r, col.g, col.b); }); });
      }
      quad(Ea.Ld, Eb.Ld, Eb.Rd, Ea.Rd, 0.07, 0.12, 0.3);                   // the underside
      quad(Ea.L, Eb.L, Eb.Ld, Ea.Ld, 0.08, 0.14, 0.4); quad(Ea.R, Eb.R, Eb.Rd, Ea.Rd, 0.08, 0.14, 0.4);   // the sides
      if (!a.fl || a.brk) { if (!(sm[i - 1] && sm[i].fl && !sm[i].brk)) quad(Ea.L, Ea.R, Ea.Rd, Ea.Ld, 0.08, 0.14, 0.36); }
      var nx = sm[i + 2]; if (!nx || !nx.fl || nx.brk) quad(Eb.L, Eb.R, Eb.Rd, Eb.Ld, 0.08, 0.14, 0.36);
    }
    if (!P.length) return;
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(C), 3)); g.computeVertexNormals();
    var m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; scene.add(m); B.meshes.push(m);
  }
  function boostZoneMesh(strips, hf) {                              // the last stretch of a ramp, where a jump gives a Style Boost: a red and white checkerboard laid just above the ground. strips: [x0, z0, forwardX, forwardZ, rightX, rightZ, from, to, halfWidth] along and across the ramp, heights from the ground there
    var P = [], C = [], CELL = 2.5;
    strips.forEach(function (q) {
      var nl = Math.max(1, Math.round((q[7] - q[6]) / CELL)), nw = Math.max(1, Math.round(q[8] * 2 / CELL)), dl = (q[7] - q[6]) / nl, dw = q[8] * 2 / nw, i, k;
      function pt(a, b) { var x = q[0] + q[2] * a + q[4] * b, z = q[1] + q[3] * a + q[5] * b; return [x, (hf || groundH0)(x, z) + 0.12, z]; }
      for (i = 0; i < nl; i++) for (k = 0; k < nw; k++) {
        var a0 = q[6] + i * dl, a1 = a0 + dl, b0 = -q[8] + k * dw, b1 = b0 + dw, p00 = pt(a0, b0), p10 = pt(a1, b0), p11 = pt(a1, b1), p01 = pt(a0, b1), c = (i + k) % 2 ? [0.95, 0.95, 0.95] : [0.86, 0.1, 0.1];
        [p00, p10, p11, p00, p11, p01].forEach(function (v) { P.push(v[0], v[1], v[2]); C.push(c[0], c[1], c[2]); });
      }
    });
    if (!P.length) return null;
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(C), 3));
    var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.renderOrder = 2; scene.add(m); return m;
  }
  function sbRampInit() {                                        // each ramp's foot: the height she would stand on there without it (on Oceana's slab of path that is the path, not the water far below)
    if (!SB) return; sbNoRamps = true;
    try { SB.ramps.forEach(function (rp) { rp.base = undefined; var fx = Math.sin(rp.th), fz = -Math.cos(rp.th); rp.base = rp.T !== undefined ? rp.T - (rp.y || 0) : l3Top(L3_X + rp.x - fx * rp.hl, rp.z - fz * rp.hl); }); }
    finally { sbNoRamps = false; }
    sbRampMeshes();
  }
  function sbRampMeshes() {                                      // Oceana: each ramp drawn as the exact wedge she stands on (elsewhere a ramp is part of the ground and its mesh)
    var B = SB; if (!B || B.terrain !== 'level2' || !B.ramps.length) return;
    var P = [], C = [], col = new THREE.Color(), tc = 0;
    function tri(a, b, c, k) { var j1 = rand01(tc, 17, 93), j2 = rand01(tc, 5, 94); tc++; col.setHSL(0.085 + (j1 - 0.5) * 0.012, 0.19 + (j1 - 0.5) * 0.05, (0.50 + (j1 - 0.5) * 0.07 + (j2 - 0.5) * 0.03) * k); [a, b, c].forEach(function (v) { P.push(v[0], v[1], v[2]); C.push(col.r, col.g, col.b); }); }
    B.ramps.forEach(function (rp) {
      if (rp.base === undefined) return;
      var fx = Math.sin(rp.th), fz = -Math.cos(rp.th), lx = Math.cos(rp.th), lz = Math.sin(rp.th), y0 = rp.base + rp.y, yb = Math.min(y0, rp.base), nl = Math.max(1, Math.round(rp.hl * 2 / 2.5)), nw = Math.max(1, Math.round(rp.hw * 2 / 2.5)), dl = rp.hl * 2 / nl, dw = rp.hw * 2 / nw, i, k;
      function pt(a, b, top) { return [L3_X + rp.x + fx * a + lx * b, top ? y0 + rp.tn * (a + rp.hl) : yb, rp.z + fz * a + lz * b]; }   // a along it (from -half length at its foot), b across it
      for (i = 0; i < nl; i++) {
        var a0 = -rp.hl + i * dl, a1 = a0 + dl;
        for (k = 0; k < nw; k++) { var b0 = -rp.hw + k * dw, b1 = b0 + dw; if ((i + k) & 1) { tri(pt(a0, b0, 1), pt(a0, b1, 1), pt(a1, b1, 1), 1); tri(pt(a0, b0, 1), pt(a1, b1, 1), pt(a1, b0, 1), 1); } else { tri(pt(a0, b0, 1), pt(a0, b1, 1), pt(a1, b0, 1), 1); tri(pt(a0, b1, 1), pt(a1, b1, 1), pt(a1, b0, 1), 1); } }
        [-rp.hw, rp.hw].forEach(function (b) { tri(pt(a0, b, 1), pt(a1, b, 1), pt(a1, b, 0), 0.8); tri(pt(a0, b, 1), pt(a1, b, 0), pt(a0, b, 0), 0.8); });   // its two sides
      }
      for (k = 0; k < nw; k++) { var c0 = -rp.hw + k * dw, c1 = c0 + dw; tri(pt(rp.hl, c0, 1), pt(rp.hl, c1, 1), pt(rp.hl, c1, 0), 0.75); tri(pt(rp.hl, c0, 1), pt(rp.hl, c1, 0), pt(rp.hl, c0, 0), 0.75); tri(pt(-rp.hl, c0, 1), pt(-rp.hl, c1, 1), pt(-rp.hl, c1, 0), 0.75); tri(pt(-rp.hl, c0, 1), pt(-rp.hl, c1, 0), pt(-rp.hl, c0, 0), 0.75); }   // the tall face under its lip, and its foot where it is set above the deck
    });
    if (!P.length) return;
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(C), 3)); g.computeVertexNormals();
    var m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); B.meshes.push(m);
  }
  function sbBoostZones() {                                      // the last stretch of each sandbox ramp, where a jump is a Style Boost (after SB is set, so a ramp on a floating slab is drawn on the slab and not on the ground far below it)
    if (!SB) return; var bz = []; SB.ramps.forEach(function (rp) { var fx = Math.sin(rp.th), fz = -Math.cos(rp.th); if (rp.boost > 0) bz.push([L3_X + rp.x, rp.z, fx, fz, -fz, fx, rp.hl - Math.max(1, rp.boost), rp.hl, rp.hw]); });
    if (bz.length) { var m = boostZoneMesh(bz, sbFoot); if (m) SB.meshes.push(m); }
  }
  function pathTexCol(col, tx, s, u, j1, j2, k) {               // a path surface's colour for one facet: 0 the light brown stone, 1 wooden planks across the path, 2 grey metal plates in a checker, 3 grass. s, u: where the facet is along and across the path; j1, j2: its own small random shade
    k = k || 1;
    if (tx === 1) { var pl = Math.floor(s / 2.5), pr = rand01(pl, 3, 77); col.setHSL(0.072 + (j1 - 0.5) * 0.01 + (pr - 0.5) * 0.008, 0.46, ((pl & 1 ? 0.34 : 0.28) + (pr - 0.5) * 0.04 + (j1 - 0.5) * 0.025) * k); }
    else if (tx === 2) { var ck = (Math.floor(s / 5) + Math.floor((u + 40) / 5)) & 1; col.setHSL(0.6, 0.07, ((ck ? 0.46 : 0.38) + (j1 - 0.5) * 0.025) * k); }
    else if (tx === 3) { col.setHSL(0.265 + (j1 - 0.5) * 0.02, 0.5, (0.32 + (j1 - 0.5) * 0.05 + (j2 - 0.5) * 0.02) * k); }
    else col.setHSL(0.085 + (j1 - 0.5) * 0.012, 0.19 + (j1 - 0.5) * 0.05, (0.50 + (j1 - 0.5) * 0.07 + (j2 - 0.5) * 0.03) * k);
  }
  var sbPyOv;                                                    // when set (a height, or null for any), the height to treat as the feet when finding a slab or platform top: objects and mobs use it so they stand on a slab instead of the ground under it
  function sbFoot(wx, wz) { sbPyOv = null; var h = groundH(wx, wz); sbPyOv = undefined; return h; }
  function sbMovPy(x, z) { if (sbPyOv !== undefined) return sbPyOv; var pp = player.position; return (x - pp.x < 8 && pp.x - x < 8 && z - pp.z < 8 && pp.z - z < 8) ? pp.y : null; }
  function sbMoverInit() { SB.movers.forEach(function (m) { m.base = l3Top(L3_X + m.pts[0][0], m.pts[0][1]); if (m.o && m.o.T !== undefined) m.base = m.door ? m.o.T : m.o.T - m.hgt; }); }   // a true Y: a platform's top (at its start), a door's foot
  function sbRampEnd(x, z) {                                     // on the last few units of a ramp: a jump from here is a Style Boost
    if (!SB) return false; var ex = x - L3_X;
    for (var i = 0; i < SB.ramps.length; i++) {
      var rp = SB.ramps[i]; if (Math.abs(rp.x - ex) > rp.rr || Math.abs(rp.z - z) > rp.rr) continue;
      var dx = ex - rp.x, dz = z - rp.z, lf = dx * Math.sin(rp.th) - dz * Math.cos(rp.th), lx = dx * Math.cos(rp.th) + dz * Math.sin(rp.th);
      if (Math.abs(lx) <= rp.hw && lf <= rp.hl && lf >= rp.hl - Math.max(1, rp.boost)) return true;
    }
    return false;
  }
  function sbLight(n) { if (!SB) return; SB.cps.forEach(function (g) { g.lit = g.n <= n; if (g.mat) g.mat.color.setHex(g.lit ? 0xffc533 : 0xc9222a); }); }
  function sbCross(B, g, ex, ez, py) {                           // did she cross the plane of g (facing its heading) between last frame and this one? Where, sideways and up?
    var fx = Math.sin(g.th), fz = -Math.cos(g.th), rx = Math.cos(g.th), rz = Math.sin(g.th);
    var f0 = (B.px - g.x) * fx + (B.pz - g.z) * fz, f1 = (ex - g.x) * fx + (ez - g.z) * fz;
    if (f0 * f1 > 0 || f0 === f1 || Math.abs(f0 - f1) > 80) return null;
    var tt = f0 / (f0 - f1);
    return { lat: ((B.px - g.x) + (ex - B.px) * tt) * rx + ((B.pz - g.z) + (ez - B.pz) * tt) * rz, yy: B.py + (py - B.py) * tt };
  }

  // ---- Pressure plates and targets: interactables a door can be linked to (a door counts a plate as beaten while it is pressed, a target once it is broken) ----
  var sbPlateTex = {};
  function sbPlateTexture(kind) {                                // a tiling texture, 8 units across: pale stone for gray, sanded planks for brown
    if (sbPlateTex[kind]) return sbPlateTex[kind];
    var cv = document.createElement('canvas'); cv.width = cv.height = 128; var g = cv.getContext('2d'), i, rr = function (k) { var x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    if (kind === 'brown') {
      g.fillStyle = '#c4a07a'; g.fillRect(0, 0, 128, 128);
      for (i = 0; i < 4; i++) { g.fillStyle = i % 2 ? 'rgba(120,80,45,.10)' : 'rgba(255,240,210,.10)'; g.fillRect(0, i * 32, 128, 32); g.fillStyle = 'rgba(95,62,35,.45)'; g.fillRect(0, i * 32, 128, 1.5); }
      g.strokeStyle = 'rgba(110,72,40,.22)'; g.lineWidth = 1; for (i = 0; i < 14; i++) { var yy = rr(i) * 128; g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(40, yy - 3, 90, yy + 3, 128, yy); g.stroke(); }
    } else {
      g.fillStyle = '#c3c4c0'; g.fillRect(0, 0, 128, 128);
      for (i = 0; i < 420; i++) { var v = 150 + Math.floor(rr(i) * 70); g.fillStyle = 'rgba(' + v + ',' + v + ',' + (v - 4) + ',.55)'; g.fillRect(rr(i + 900) * 128, rr(i + 1900) * 128, 1 + rr(i + 2900) * 2.5, 1 + rr(i + 3900) * 2.5); }
      g.strokeStyle = 'rgba(90,92,88,.35)'; g.lineWidth = 1.5; g.strokeRect(0.75, 0.75, 126.5, 126.5);
    }
    var t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; sbPlateTex[kind] = t; return t;
  }
  function sbPlateY(pl, wx, wz) { return pl.T !== undefined ? pl.T : sbFoot(wx, wz) + pl.y; }
  function sbTrigMeshes() {
    var B = SB; if (!B) return;
    B.plates.forEach(function (pl) {
      if (pl.look === 'none') return;
      var cs = Math.cos(pl.th), sn = Math.sin(pl.th), loc = function (lx, lz) { return [pl.x + lx * cs - lz * sn, pl.z + lx * sn + lz * cs]; }, grid = [], uv = [], pos = [], uvs = [], nu, nv, iu, iv, rim = [];
      if (pl.circ) { nu = Math.max(16, Math.min(96, Math.ceil(pl.r * 2))); nv = Math.max(1, Math.ceil(pl.r / 2.5)); for (iv = 0; iv <= nv; iv++) for (iu = 0; iu <= nu; iu++) { var a = iu / nu * 6.2832, rd = pl.r * iv / nv; grid.push(loc(Math.cos(a) * rd, Math.sin(a) * rd)); uv.push([Math.cos(a) * rd / 8, Math.sin(a) * rd / 8]); } for (iu = 0; iu <= nu; iu++) { var a2 = iu / nu * 6.2832; rim.push(loc(Math.cos(a2) * pl.r, Math.sin(a2) * pl.r)); } }
      else {
        nu = Math.max(1, Math.ceil(pl.hw * 2 / 2.5)); nv = Math.max(1, Math.ceil(pl.hd * 2 / 2.5));
        for (iv = 0; iv <= nv; iv++) for (iu = 0; iu <= nu; iu++) { var lx = -pl.hw + 2 * pl.hw * iu / nu, lz = -pl.hd + 2 * pl.hd * iv / nv; grid.push(loc(lx, lz)); uv.push([lx / 8, lz / 8]); }
        var per = [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]], q;
        for (q = 0; q < 4; q++) { var a0 = per[q], a1 = per[q + 1], L = Math.hypot((a1[0] - a0[0]) * pl.hw, (a1[1] - a0[1]) * pl.hd), ns = Math.max(1, Math.ceil(L / 2)); for (var k = 0; k < ns; k++) { var f = k / ns; rim.push(loc((a0[0] + (a1[0] - a0[0]) * f) * pl.hw, (a0[1] + (a1[1] - a0[1]) * f) * pl.hd)); } }
        rim.push(rim[0]);
      }
      var lift = 0.12, gy = grid.map(function (c) { return sbPlateY(pl, L3_X + c[0], c[1]); });
      if (pl.look === 'halo') {                                  // a faint glow standing up from its edge, fading upward
        var cv = document.createElement('canvas'); cv.width = 4; cv.height = 64; var g2 = cv.getContext('2d'), gr = g2.createLinearGradient(0, 64, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 4, 64);
        var HH = 1.0;
        for (k = 0; k + 1 < rim.length; k++) {
          var c0 = rim[k], c1 = rim[k + 1], y0 = sbPlateY(pl, L3_X + c0[0], c0[1]) + 0.05, y1 = sbPlateY(pl, L3_X + c1[0], c1[1]) + 0.05;
          pos.push(L3_X + c0[0], y0, c0[1], L3_X + c1[0], y1, c1[1], L3_X + c1[0], y1 + HH, c1[1], L3_X + c0[0], y0, c0[1], L3_X + c1[0], y1 + HH, c1[1], L3_X + c0[0], y0 + HH, c0[1]);
          uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
        }
        var hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); hg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        pl.mat = new THREE.MeshBasicMaterial({ color: 0x6fd6ff, map: new THREE.CanvasTexture(cv), transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
        pl.mesh = new THREE.Mesh(hg, pl.mat); pl.mesh.renderOrder = 3; scene.add(pl.mesh); B.meshes.push(pl.mesh); return;
      }
      for (iv = 0; iv < nv; iv++) for (iu = 0; iu < nu; iu++) {
        var ia = iv * (nu + 1) + iu, ib = ia + 1, ic = ia + nu + 2, id = ia + nu + 1;
        [ia, ib, ic, ia, ic, id].forEach(function (vi) { pos.push(L3_X + grid[vi][0], gy[vi] + lift, grid[vi][1]); uvs.push(uv[vi][0], uv[vi][1]); });
      }
      var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); pg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2)); pg.computeVertexNormals();
      pl.mat = new THREE.MeshLambertMaterial({ map: sbPlateTexture(pl.look), side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 });
      pl.mat.color.setScalar(0.8); pl.mesh = new THREE.Mesh(pg, pl.mat); pl.mesh.receiveShadow = true; scene.add(pl.mesh); B.meshes.push(pl.mesh);
    });
    var wood = new THREE.MeshLambertMaterial({ color: 0xc89a64 }), edge = new THREE.MeshLambertMaterial({ color: 0x8a5a33 }), red = new THREE.MeshLambertMaterial({ color: 0xd2232a, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }), postM = new THREE.MeshLambertMaterial({ color: 0x6b4426 });
    B.targets.forEach(function (tg) {
      var wx = L3_X + tg.x, fy = tg.T !== undefined ? tg.T : sbFoot(wx, tg.z) + tg.y, R = tg.size / 2, TK = Math.max(0.35, Math.min(1.2, tg.size * 0.1)), grp = new THREE.Group();
      grp.position.set(wx, fy, tg.z); grp.rotation.y = -tg.th; tg.fy = fy; tg.TK = TK;
      if (tg.post && tg.h > 0) { tg.postM = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 0.9), postM); tg.postM.castShadow = true; grp.add(tg.postM); }
      tg.mv = new THREE.Group(); tg.mv.position.y = tg.h; grp.add(tg.mv);
      var tilt = new THREE.Group(); tilt.rotation.x = tg.tilt; tg.mv.add(tilt);
      tg.sp0 = new THREE.Group(); tg.sp0.rotation.z = tg.spin; tilt.add(tg.sp0);
      tg.halves = [];
      [0, 1].forEach(function (hi) {                             // two halves (split top to bottom), so it can break in two
        var half = new THREE.Group(), th0 = hi ? Math.PI : 0;
        var disc = new THREE.Mesh(new THREE.CylinderGeometry(R, R, TK, 28, 1, false, th0, Math.PI), [edge, wood, wood]); disc.rotation.x = Math.PI / 2; disc.castShadow = true; half.add(disc);
        var cap = new THREE.Mesh(new THREE.PlaneGeometry(TK, 2 * R), edge); cap.rotation.y = Math.PI / 2; half.add(cap);   // the cut face (hidden while whole)
        [1, -1].forEach(function (sd) {                          // the paint, both faces: a red ring and a red middle
          var a0 = (hi ? 1 : -1) * sd * Math.PI / 2;            // the back face is turned round, so its half is the other way in its own frame
          var ring = new THREE.Mesh(new THREE.RingGeometry(R * 0.52, R * 0.72, 20, 1, a0, Math.PI), red), dot = new THREE.Mesh(new THREE.CircleGeometry(R * 0.24, 14, a0, Math.PI), red);
          [ring, dot].forEach(function (m) { m.position.z = sd * (TK / 2 + 0.01); if (sd < 0) m.rotation.y = Math.PI; half.add(m); });
        });
        tg.sp0.add(half); tg.halves.push({ m: half, p: half.position.clone(), r: half.rotation.clone(), dir: hi ? -1 : 1 });
      });
      scene.add(grp); B.meshes.push(grp); tg.grp = grp; tg.ex = new THREE.Vector3(); tg.ey = new THREE.Vector3(); tg.ez = new THREE.Vector3(); tg.C = new THREE.Vector3();
      sbTargetPose(tg, B.T);
    });
  }
  function sbTargetPose(tg, T) {                                 // where a target is now: its own side-to-side and up-and-down on the level clock
    var ox = tg.sd ? tg.sd / 2 * Math.sin(2 * Math.PI * (T + tg.phase) / tg.sp) : 0, oy = tg.vd ? tg.vd / 2 * Math.sin(2 * Math.PI * (T + tg.phase) / tg.vp) : 0;
    tg.mv.position.set(ox, tg.h + oy, 0);
    if (tg.postM) { var ph = Math.max(0.05, tg.h + oy); tg.postM.scale.y = ph; tg.postM.position.set(ox, ph / 2, -(tg.TK / 2 + 0.45)); }   // on a post: the post goes with it, up to its middle, just behind it
    tg.grp.updateMatrixWorld(true); var e = tg.sp0.matrixWorld.elements;
    tg.ex.set(e[0], e[1], e[2]).normalize(); tg.ey.set(e[4], e[5], e[6]).normalize(); tg.ez.set(e[8], e[9], e[10]).normalize(); tg.C.set(e[12], e[13], e[14]);
  }
  function sbTargetDist(tg, x, y, z) {                            // how far a point is from the target's hitbox (a disc), and which way is out
    var dx = x - tg.C.x, dy = y - tg.C.y, dz = z - tg.C.z, lx = dx * tg.ex.x + dy * tg.ex.y + dz * tg.ex.z, ly = dx * tg.ey.x + dy * tg.ey.y + dz * tg.ey.z, lz = dx * tg.ez.x + dy * tg.ez.y + dz * tg.ez.z;
    var Rh = tg.size / 2 * tg.hb, ht = Math.max(0.35, tg.TK / 2 * tg.hb), rr = Math.hypot(lx, ly), k = rr > Rh ? Rh / rr : 1, cx = lx * k, cy = ly * k, cz = Math.max(-ht, Math.min(ht, lz));
    var ux = lx - cx, uy = ly - cy, uz = lz - cz, d = Math.hypot(ux, uy, uz);
    if (d < 1e-6) { ux = 0; uy = 0; uz = lz >= 0 ? 1 : -1; d = 0; } else { ux /= d; uy /= d; uz /= d; }
    return { d: d, nx: ux * tg.ex.x + uy * tg.ey.x + uz * tg.ez.x, ny: ux * tg.ex.y + uy * tg.ey.y + uz * tg.ez.y, nz: ux * tg.ex.z + uy * tg.ey.z + uz * tg.ez.z };
  }
  function sbTargetBreak(tg, now) {                              // its one heart gone: it splits in two and the halves fall apart, like a beaten minion
    tg.on = true; tg.hp = 0; tg.brokeAt = now; shake(0.3);
    tg.halves.forEach(function (h) {
      scene.attach(h.m); var sx = tg.ex.x * h.dir, sz = tg.ex.z * h.dir, v = 5 + Math.random() * 5;
      SB.tgBits.push({ tg: tg, m: h.m, vx: sx * v + speed * Math.sin(-heading) * 0.15, vy: 7 + Math.random() * 7, vz: sz * v - speed * Math.cos(heading) * 0.15, wx: (Math.random() - 0.5) * 10, wz: (Math.random() - 0.5) * 10 });
    });
  }
  function sbTargetHit(now) {                                    // after she has moved this step: is she touching a target? (the Barrier at speed breaks it; otherwise it is solid)
    var B = SB; if (!B || !B.targets.length || !playing) return;
    var pp = player.position, i;
    var asp = Math.abs(speed) / TILE, rad = ballOn ? BALL_R : 0.5, offs = ballOn ? [BALL_R] : [0.5, PLAYER_H / 2, PLAYER_H - 0.5];
    var tp0 = B.prevOK && B.tgP ? B.tgP : [pp.x, pp.y, pp.z], sx0 = tp0[0], sy0 = tp0[1], sz0 = tp0[2];   // where she was when this last ran (her movement comes after it in the frame)
    for (i = 0; i < B.targets.length; i++) {
      var tg = B.targets[i]; if (!tg.mv) continue;
      if (tg.on) continue;
      var reach = tg.size / 2 * tg.hb + Math.abs(tg.sd) / 2 + 8; if (Math.abs(pp.x - tg.grp.position.x) > reach + 10 || Math.abs(pp.z - tg.grp.position.z) > reach + 10) continue;
      var n = Math.min(40, Math.max(1, Math.ceil(Math.hypot(pp.x - sx0, pp.z - sz0, pp.y - sy0) / 0.4))), hitS = -1, s, k, q, best = null;
      for (s = 1; s <= n && hitS < 0; s++) { var f = s / n, X = sx0 + (pp.x - sx0) * f, Y = sy0 + (pp.y - sy0) * f, Z = sz0 + (pp.z - sz0) * f; for (k = 0; k < offs.length; k++) { q = sbTargetDist(tg, X, Y + offs[k], Z); if (q.d < rad) { hitS = s; break; } } }
      if (hitS < 0) continue;
      if (ballOn && tg.k > 0 && asp >= tg.k) { sbTargetBreak(tg, now); continue; }   // the Barrier at speed: its one heart gone
      if (hitS < n) { var f0 = (hitS - 1) / n; pp.x = sx0 + (pp.x - sx0) * f0; pp.z = sz0 + (pp.z - sz0) * f0; }   // she would have gone through it this frame: she stops where she first touched it
      for (k = 0; k < offs.length; k++) { q = sbTargetDist(tg, pp.x, pp.y + offs[k], pp.z); if (q.d < rad && (!best || q.d < best.d)) best = q; }
      if (best && best.d < 1e-6) { var qb = sbTargetDist(tg, sx0, sy0 + offs[0], sz0); best.nx = qb.nx; best.nz = qb.nz; }   // still inside: out the side she came from
      if (best) { var hx = best.nx, hz = best.nz, hl = Math.hypot(hx, hz); if (hl < 0.2) { hx = sx0 - pp.x; hz = sz0 - pp.z; hl = Math.hypot(hx, hz); if (hl < 1e-6) { hx = Math.sin(heading); hz = -Math.cos(heading); hl = 1; } } pp.x += hx / hl * (rad - best.d + 0.02); pp.z += hz / hl * (rad - best.d + 0.02); }   // solid wood: pushed back out, sideways
    }
    B.tgP = [pp.x, pp.y, pp.z];
  }
  function sbTrigReset() {                                       // a fresh run: plates up, targets whole again
    var B = SB; if (!B) return;
    B.plates.forEach(function (pl) { pl.on = false; pl.now = false; });
    B.tgBits = []; B.tgP = null;
    B.targets.forEach(function (tg) { tg.on = false; tg.hp = 1; if (!tg.halves) return; tg.halves.forEach(function (h) { tg.sp0.add(h.m); h.m.position.copy(h.p); h.m.rotation.copy(h.r); h.m.scale.set(1, 1, 1); h.m.visible = true; }); });
  }
  function sbTrigTick(dt, now) {                                 // plates: pressed while she stands on one (or for good, unless set to only while she stands); targets: move, are solid, and break at speed
    var B = SB, pp = player.position, ex = pp.x - L3_X, ez = pp.z, i;
    if (!B.movers.length) B.T += dt;                             // the level clock (the platforms' block keeps it when there are any)
    for (i = 0; i < B.plates.length; i++) {
      var pl = B.plates[i], on = false, dx = ex - pl.x, dz = ez - pl.z;
      if (Math.abs(dx) <= pl.rr && Math.abs(dz) <= pl.rr && grounded && !hovOn) {
        var c = Math.cos(-pl.th), sn = Math.sin(-pl.th), lx = dx * c - dz * sn, lz = dx * sn + dz * c;
        if (pl.circ ? Math.hypot(lx, lz) <= pl.r : Math.abs(lx) <= pl.hw && Math.abs(lz) <= pl.hd) {
          var sy = pl.T !== undefined ? pl.T : Math.max(l3Top(pp.x, pp.z), sbSlabTop(pp.x, pp.z, pp.y)) + pl.y;
          on = pp.y < sy + 0.7 && pp.y > sy - 1.5;
        }
      }
      pl.now = on; if (on) pl.on = true; else if (pl.whl) pl.on = false;
      if (pl.mat) { if (pl.look === 'halo') pl.mat.opacity = pl.on ? 0.7 : 0.32; else pl.mat.color.setScalar(pl.on ? 0.62 : 0.8); }   // pressed: the halo brightens, a plate darkens a little
    }
    for (i = 0; i < B.targets.length; i++) { var tq = B.targets[i]; if (tq.mv && !tq.on && (tq.sd || tq.vd)) sbTargetPose(tq, B.T); }
    for (i = 0; i < B.tgBits.length; i++) {                       // the halves of broken targets: they fall, bounce, settle, and shrink away after three seconds
      var b = B.tgBits[i], m = b.m, gone = (now - b.tg.brokeAt) / 1000;
      if (gone >= 3) { m.visible = false; continue; }
      b.vy -= GRAV * dt; m.position.x += b.vx * dt; m.position.y += b.vy * dt; m.position.z += b.vz * dt; m.rotation.x += b.wx * dt; m.rotation.z += b.wz * dt;
      var fl = sbFoot(m.position.x, m.position.z) + b.tg.size * 0.2; if (m.position.y < fl) { m.position.y = fl; b.vy = Math.abs(b.vy) > 4 ? -b.vy * 0.3 : 0; b.vx *= 0.8; b.vz *= 0.8; b.wx *= 0.7; b.wz *= 0.7; }
      var sc = gone > 2.6 ? Math.max(0.01, (3 - gone) / 0.4) : 1; m.scale.set(sc, sc, sc);
    }
  }
  function sbMudAt(x, z) {
    if (!SB) return false; var ex = x - L3_X, m = false;
    sbNear(SB.mudH, ex, z, SB.maxM, function (e) { if (!m && sbIn(e, ex, z, 0)) m = true; });
    return m;
  }
  var sbGoalMat = {}, sbGoalPrev = null;
  function sbMakeMeshes() {
    var B = SB; if (!B) return;
    var white = new THREE.MeshLambertMaterial({ color: 0xf2efe8, flatShading: true }), stone = new THREE.MeshLambertMaterial({ color: 0x7a756b, flatShading: true });
    B.goals.forEach(function (g) {
      var wx = L3_X + g.x, gy = g.T !== undefined ? g.T : sbFoot(wx, g.z) + g.y, grp = new THREE.Group(), col = g.kind === 'bonus' ? 0x8a4fd1 : 0x2f9e55;
      var mat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
      if (g.style === 'ring') { var R = g.w / 2, tor = new THREE.Mesh(new THREE.TorusGeometry(R, 0.8, 8, 40), mat); tor.position.y = R + 1.5; grp.add(tor); g.cy = gy + R + 1.5; g.R = R; }
      else {
        var pm = new THREE.MeshLambertMaterial({ color: 0xdddddd, flatShading: true }), pl = new THREE.BoxGeometry(0.7, 14, 0.7);
        [-1, 1].forEach(function (sg) { var p = new THREE.Mesh(pl, pm); p.position.set(sg * g.w / 2, 7, 0); grp.add(p); });
        var cl = new THREE.Mesh(new THREE.PlaneGeometry(g.w, 4), mat); cl.position.y = 12; grp.add(cl);
      }
      grp.position.set(wx, gy, g.z); grp.rotation.y = -g.th; scene.add(grp); B.meshes.push(grp);
    });
    B.cps.forEach(function (g) {                                 // checkpoint gates: two stone posts and a red-and-white bar, gold once reached
      var wx = L3_X + g.x, gy = g.T !== undefined ? g.T : sbFoot(wx, g.z) + g.y, grp = new THREE.Group(); g.mat = new THREE.MeshLambertMaterial({ color: 0xc9222a, flatShading: true });
      [-1, 1].forEach(function (sg) { var post = new THREE.Mesh(new THREE.BoxGeometry(1.8, 12, 1.8), stone); post.position.set(sg * g.hw, 6, 0); grp.add(post); });
      var nb = Math.max(2, Math.round(g.hw)), bw = 2 * g.hw / nb;
      for (var row = 0; row < 2; row++) for (var i = 0; i < nb; i++) { var blk = new THREE.Mesh(new THREE.BoxGeometry(bw, 1.5, 0.7), (i + row) % 2 ? white : g.mat); blk.position.set(-g.hw + bw * (i + 0.5), 11.2 - row * 1.5, 0); grp.add(blk); }
      grp.position.set(wx, gy, g.z); grp.rotation.y = -g.th; scene.add(grp); B.meshes.push(grp); g.lit = false;
    });
    B.signs.forEach(function (sg) {                              // the same wooden exclamation-mark sign as the first two levels, facing back toward her as she comes along the path
      var wx = L3_X + sg.x, parts = buildSign(wx, sg.T !== undefined ? sg.T : sbFoot(wx, sg.z) + sg.y, sg.z, Math.atan2(-Math.cos(sg.th), -Math.sin(sg.th)));
      parts.forEach(function (m) { B.meshes.push(m); });
    });
    B.movers.forEach(function (m) {                              // platforms: a floating slab of stone with a top, sides and underside, its own thickness, and a gap below it
      if (m.door) {                                              // a door is a plain slab whose corners are placed again whenever it moves (sbDoorPose)
        var dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(36 * 3), 3));
        var dgrp = new THREE.Group(), dmesh = new THREE.Mesh(dg, new THREE.MeshLambertMaterial({ color: 0x7c8493, flatShading: true, side: THREE.DoubleSide })); dmesh.castShadow = true; dmesh.receiveShadow = true; dmesh.frustumCulled = false; dgrp.add(dmesh);
        m.grp = dgrp; m.geo = dg; scene.add(dgrp); B.meshes.push(dgrp); sbDoorPose(m, true); return;
      }
      var P = [], C = [], col = new THREE.Color(), tc = 0, topY = m.base + m.hgt, botY = topY - m.thick, n = m.pts.length, i, toxTop = !!(m.o && m.o.tox);
      function tri(a, b, c, k) { var j1 = rand01(tc, 11, 71), j2 = rand01(tc, 5, 72); tc++; if (toxTop && k === 1) col.setHSL(0.64 + (j1 - 0.5) * 0.02, 0.05, 0.21 + (j1 - 0.5) * 0.04 + (j2 - 0.5) * 0.02); else col.setHSL((m.door ? 0.6 : 0.085) + (j1 - 0.5) * 0.012, (m.door ? 0.1 : 0.19) + (j1 - 0.5) * 0.05, (0.5 + (j1 - 0.5) * 0.07 + (j2 - 0.5) * 0.03) * k); [a, b, c].forEach(function (v) { P.push(v[0], v[1], v[2]); C.push(col.r, col.g, col.b); }); }
      function V(q, side, y) { return [L3_X + q[0] + Math.cos(q[2]) * m.half * side, y, q[1] + Math.sin(q[2]) * m.half * side]; }
      for (i = 0; i + 1 < n; i++) {
        var a = m.pts[i], b = m.pts[i + 1];
        tri(V(a, -1, topY), V(a, 1, topY), V(b, 1, topY), 1); tri(V(a, -1, topY), V(b, 1, topY), V(b, -1, topY), 1);
        tri(V(a, -1, botY), V(b, -1, botY), V(b, 1, botY), 0.55); tri(V(a, -1, botY), V(b, 1, botY), V(a, 1, botY), 0.55);
        [-1, 1].forEach(function (sd) { tri(V(a, sd, topY), V(a, sd, botY), V(b, sd, botY), 0.8); tri(V(a, sd, topY), V(b, sd, botY), V(b, sd, topY), 0.8); });
      }
      [[m.pts[0], 0], [m.pts[n - 1], 1]].forEach(function (e) { var q = e[0]; tri(V(q, -1, topY), V(q, 1, topY), V(q, 1, botY), 0.7); tri(V(q, -1, topY), V(q, 1, botY), V(q, -1, botY), 0.7); });
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(C), 3)); g.computeVertexNormals();
      var grp = new THREE.Group(), mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide })); mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false; grp.add(mesh);
      m.grp = grp; scene.add(grp); B.meshes.push(grp);
    });
    B.lakes.forEach(function (l) {
      var rim = [], rk, ra;                                   // the water sits a little below the lowest rim, so a lake over a wall or cliff fills like a basin instead of floating at the wall's height
      for (rk = 0; rk < 32; rk++) { ra = rk / 32 * 6.2832; rim.push(groundH0(L3_X + l.x + Math.cos(ra) * l.r * 1.03, l.z + Math.sin(ra) * l.r * 1.03)); }
      var rmed = rim.slice().sort(function (u, v) { return u - v; })[16], rlow = 1e9;
      rim.forEach(function (v, vi) { if (Math.abs(v - rim[(vi + 31) % 32]) < 8 && Math.abs(v - rim[(vi + 1) % 32]) < 8 && v < rlow) rlow = v; });   // only level stretches count: a cliff or a drop into the void is not a rim
      if (rlow > 1e8) rlow = rmed;
      l.wy = l.T !== undefined ? l.T : rlow - l.depth * 0.45 + l.wl;   // a true Y is the water's surface
      var w = new THREE.Mesh(new THREE.CircleGeometry(l.r * 1.02, 48), new THREE.MeshBasicMaterial({ color: 0x3d8fd6, transparent: true, opacity: 0.88, side: THREE.DoubleSide }));
      w.rotation.x = -Math.PI / 2; w.position.set(L3_X + l.x, l.wy, l.z); scene.add(w); B.meshes.push(w);
    });
    if (B.terrain === 'ocean') {                                 // the open sea, a little below the path
      B.waterY = -10;
      var sea0 = new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000), waterMat); sea0.rotation.x = -Math.PI / 2; sea0.position.set(L3_X, B.waterY, 0); scene.add(sea0); B.meshes.push(sea0);
    }
    if (B.terrain !== 'ocean' && B.terrain !== 'level2' && B.patches.some(function (q) { return q.ground === 'ocean'; })) {   // an ocean patch has the same sea over it
      B.waterY = -10;
      var sea1 = new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000), waterMat); sea1.rotation.x = -Math.PI / 2; sea1.position.set(L3_X, B.waterY, 0); scene.add(sea1); B.meshes.push(sea1);
    }
    if (B.terrain === 'level2') {                                // Oceana Crags' sea
      B.waterY = WATER_Y;
      var sea = new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000), waterMat); sea.rotation.x = -Math.PI / 2;
      sea.position.set(L3_X + (L2_BOX[0] + L2_BOX[1]) / 2 - L2_X, WATER_Y, (L2_BOX[2] + L2_BOX[3]) / 2 - L2_SBZ); scene.add(sea); B.meshes.push(sea);
    }
    if (B.terrain === 'level2') {                                // Oceana Crags: the path is a deck of its own. Every stretch of it that is not a wall and not cut by a gap is drawn here exactly as she stands on it: at the path's own height, tilted to its bank, as wide as the segment, as deep as its slab thickness (2 where it has none). The ground under it is left alone (a superseding piece only has taller rock cut down to just under it), so wherever the ground stands higher than the deck it simply shows through, and that is where the terrain wins
      (function () {
        var sm2 = B.samples, D2R = Math.PI / 180, Pp = [], Cc = [], col2 = new THREE.Color(), tc2 = 0, segs = [], i2, k2, c2;
        function gapAt(x, z, grow) { var g = false; sbNear(B.gapH, x, z, B.maxG + grow, function (e) { if (!g && sbIn(e, x, z, grow)) g = true; }); return g; }
        function bumpNear(x, z, grow) {                           // is a ledge or hill standing on the deck within reach of (x, z)?
          var f = false; if (B.dLedgeH) sbNear(B.dLedgeH, x, z, B.maxL + grow, function (e) { if (!f && sbIn(e, x, z, grow)) f = true; });
          for (var hi = 0; !f && hi < B.dHills.length; hi++) if (Math.hypot(x - B.dHills[hi].x, z - B.dHills[hi].z) < B.dHills[hi].r + grow) f = true;
          return f;
        }
        function mudOn(x, z) { var m = false; sbNear(B.mudH, x, z, B.maxM, function (e) { if (!m && sbIn(e, x, z, 0)) m = true; }); return m; }
        function sect(a, b, t) { return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, th: a.th + wrapA(b.th - a.th) * t, y: a.y + (b.y - a.y) * t, rl: (a.rl !== undefined ? a.rl : a.roll || 0) + ((b.rl !== undefined ? b.rl : b.roll || 0) - (a.rl !== undefined ? a.rl : a.roll || 0)) * t, hw: (a.hw !== undefined ? a.hw : (a.w || B.width) / 2) + ((b.hw !== undefined ? b.hw : (b.w || B.width) / 2) - (a.hw !== undefined ? a.hw : (a.w || B.width) / 2)) * t, s: a.s + (b.s - a.s) * t }; }   // one cross-section between two (samples, or cross-sections already made)
        function pt(o, u, dy) { var l = o.hw * u, c = Math.cos(o.rl * D2R); return [L3_X + o.x + Math.cos(o.th) * l * c, o.y - l * Math.sin(o.rl * D2R) - dy, o.z + Math.sin(o.th) * l * c]; }   // a point of it: u from -1 (left edge) to 1 (right edge), dy below the top. A banked deck keeps its width along the slope: the right side lower for a positive bank
        function tri(a1, b1, c1) { [a1, b1, c1].forEach(function (v) { Pp.push(v[0], v[1], v[2]); Cc.push(col2.r, col2.g, col2.b); }); }
        function stone(k) { var j1 = rand01(tc2, 17, 91), j2 = rand01(tc2, 5, 92); tc2++; col2.setHSL(0.085 + (j1 - 0.5) * 0.012, 0.19 + (j1 - 0.5) * 0.05, (0.50 + (j1 - 0.5) * 0.07 + (j2 - 0.5) * 0.03) * k); }
        for (i2 = 0; i2 + 1 < sm2.length; i2++) {                 // which cells of each stretch between two samples are there: all of them, except near a gap, where the stretch is cut fine and the cells inside the gap are left out
          var a = sm2[i2], b = sm2[i2 + 1]; segs.push(null);
          if (b.brk || (a.wl && b.wl) || (a.dsk && b.dsk)) continue;   // a break between two paths, a true wall, or a circular deck (each drawn by itself)
          var ch = Math.hypot(b.x - a.x, b.z - a.z), dth = b.dk || DECK_TH;
          if (ch < 1e-4) { segs[i2] = { joint: true, a: a, b: b, th: dth }; continue; }   // two samples at one spot (a start set by hand): no deck of its own, only the corner filled in below
          var hwm = Math.max(a.w || B.width, b.w || B.width) / 2, fine = !!B.gapH && gapAt((a.x + b.x) / 2, (a.z + b.z) / 2, ch / 2 + hwm + 1);
          var bmp = bumpNear((a.x + b.x) / 2, (a.z + b.z) / 2, ch / 2 + hwm + 1); if (bmp) fine = true;   // a ledge or hill stands on this stretch: cut it fine too, so its edges and slopes show
          var ns = fine ? Math.max(1, Math.ceil(ch / 0.5)) : 1, nc = fine ? 16 : 8, pres = new Uint8Array(ns * nc), any = 0, S = [];
          for (k2 = 0; k2 <= ns; k2++) S.push(sect(a, b, k2 / ns));
          for (k2 = 0; k2 < ns; k2++) for (c2 = 0; c2 < nc; c2++) {
            if (fine) { var cp = pt(sect(S[k2], S[k2 + 1], 0.5), (c2 + 0.5) / nc * 2 - 1, 0); if (gapAt(cp[0] - L3_X, cp[2], 0)) continue; }
            pres[k2 * nc + c2] = 1; any = 1;
          }
          segs[i2] = { a: a, b: b, ns: ns, nc: nc, pres: pres, S: S, th: dth, tx: b.tx || 0, any: any, bmp: bmp };
        }
        function along(si, u, d) {                                // is there deck just past this end of stretch si (d = -1 before it, 1 after it), at u across?
          var j2 = si + d; while (segs[j2] && segs[j2].joint) j2 += d;
          var g = segs[j2]; if (!g) return false;
          return !!g.pres[(d < 0 ? g.ns - 1 : 0) * g.nc + Math.max(0, Math.min(g.nc - 1, Math.floor((u + 1) / 2 * g.nc)))];
        }
        segs.forEach(function (g, si) {
          if (!g) return;
          if (g.joint) {                                          // a corner where the heading was set by hand: the wedge on the outside of the turn is filled in, as a fan
            var da = wrapA(g.b.th - g.a.th); if (Math.abs(da) < 0.01) return;
            var nf = Math.max(1, Math.ceil(Math.abs(da) / 0.26)), sd = da > 0 ? -1 : 1, f, c;
            for (f = 0; f < nf; f++) { var F0 = sect(g.a, g.b, f / nf), F1 = sect(g.a, g.b, (f + 1) / nf);
              for (c = 0; c < 4; c++) { var w0 = sd * c / 4, w1 = sd * (c + 1) / 4; stone(1); tri(pt(F0, w0, 0), pt(F0, w1, 0), pt(F1, w1, 0)); if (c) { stone(1); tri(pt(F0, w0, 0), pt(F1, w1, 0), pt(F1, w0, 0)); } stone(0.6); tri(pt(F0, w0, g.th), pt(F0, w1, g.th), pt(F1, w1, g.th)); if (c) { stone(0.6); tri(pt(F0, w0, g.th), pt(F1, w1, g.th), pt(F1, w0, g.th)); } }
              stone(0.8); tri(pt(F0, sd, 0), pt(F0, sd, g.th), pt(F1, sd, g.th)); stone(0.8); tri(pt(F0, sd, 0), pt(F1, sd, g.th), pt(F1, sd, 0)); }
            return;
          }
          if (!g.any) return;
          var nc = g.nc, ns = g.ns, TH = g.th, k, c;
          for (k = 0; k < ns; k++) for (c = 0; c < nc; c++) {
            if (!g.pres[k * nc + c]) continue;
            var A = g.S[k], Bq = g.S[k + 1], u0 = c / nc * 2 - 1, u1 = (c + 1) / nc * 2 - 1, um = (u0 + u1) / 2;
            var p00 = pt(A, u0, 0), p01 = pt(A, u1, 0), p10 = pt(Bq, u0, 0), p11 = pt(Bq, u1, 0), q00 = pt(A, u0, TH), q01 = pt(A, u1, TH), q10 = pt(Bq, u0, TH), q11 = pt(Bq, u1, TH);
            var mxc = (p00[0] + p11[0]) / 2, mzc = (p00[2] + p11[2]) / 2;
            if (g.bmp) {                                          // ledges and hills on the deck: each corner rises with the hills, the whole cell with the ledge at its middle (so a ledge is cut square, with upright sides)
              var Lc = sbDeckLedge(mxc - L3_X, mzc); [p00, p01, p10, p11].forEach(function (v) { v[1] = sbDeckHill(v[0] - L3_X, v[2], v[1]) + Lc; });
              [[p00, p10], [p11, p01], [p01, p00], [p10, p11]].forEach(function (ed) {   // an upright face down to each lower neighbour
                var ea = ed[0], eb = ed[1], emx = (ea[0] + eb[0]) / 2, emz = (ea[2] + eb[2]) / 2, odx = emx - mxc, odz = emz - mzc, odl = Math.hypot(odx, odz) || 1, nL = sbDeckLedge(emx - L3_X + odx / odl * 0.05, emz + odz / odl * 0.05);
                if (nL < Lc - 0.01) { var dd = Lc - nL, ea2 = [ea[0], ea[1] - dd, ea[2]], eb2 = [eb[0], eb[1] - dd, eb[2]]; stone(0.8); tri(ea, eb, eb2); stone(0.8); tri(ea, eb2, ea2); }
              });
            }
            if (B.mudH && mudOn(mxc - L3_X, mzc)) { var jm = rand01(tc2++, 17, 91); col2.setHSL(0.075 + (jm - 0.5) * 0.02, 0.42, 0.2 + (jm - 0.5) * 0.07 + (0.5 + 0.5 * Math.sin(mzc * 0.9 + mxc * 0.3)) * 0.03); tri(p00, p01, p11); tri(p00, p11, p10); }   // a mud strip lying on the deck
            else if (g.tx) { pathTexCol(col2, g.tx, (A.s + Bq.s) / 2, um * (A.hw + Bq.hw) / 2, rand01(tc2++, 17, 91), rand01(tc2, 5, 92)); tri(p00, p01, p11); tri(p00, p11, p10); }   // the segment's own surface
            else if ((si + k + c) & 1) { stone(1); tri(p00, p01, p11); stone(1); tri(p00, p11, p10); }
            else { stone(1); tri(p00, p01, p10); stone(1); tri(p01, p11, p10); }
            stone(0.6); tri(q00, q10, q11); stone(0.6); tri(q00, q11, q01);                                  // the underside
            if (c === 0 || !g.pres[k * nc + c - 1]) { stone(0.8); tri(p00, q00, q10); stone(0.8); tri(p00, q10, p10); }   // a side wherever nothing is beside it
            if (c === nc - 1 || !g.pres[k * nc + c + 1]) { stone(0.8); tri(p01, q01, q11); stone(0.8); tri(p01, q11, p11); }
            if (!(k > 0 ? g.pres[(k - 1) * nc + c] : along(si, um, -1))) { stone(0.75); tri(p00, p01, q01); stone(0.75); tri(p00, q01, q00); }   // and an end closed off wherever the deck stops: the path's own ends, a break, a gap
            if (!(k < ns - 1 ? g.pres[(k + 1) * nc + c] : along(si, um, 1))) { stone(0.75); tri(p10, p11, q11); stone(0.75); tri(p10, q11, q10); }
          }
        });
        B.discs.forEach(function (D) {                            // each circular deck: a disc of stone, rings out from the centre, its top exactly as she stands on it, an underside its thickness below, and the rim closed off. Cells inside a gap are left out
          var TH = D.dk || DECK_TH, NR = Math.max(3, Math.min(40, Math.ceil(D.R / 2.5))), NS = Math.max(24, Math.min(160, Math.ceil(2 * Math.PI * D.R / 2.5))), ri, sj;
          function P(r, a, dy) { var x = D.cx + Math.cos(a) * r, z = D.cz + Math.sin(a) * r; return [L3_X + x, sbDiscY(D, x, z) - dy, z]; }
          for (ri = 0; ri < NR; ri++) for (sj = 0; sj < NS; sj++) {
            var r0 = D.R * ri / NR, r1 = D.R * (ri + 1) / NR, a0 = 2 * Math.PI * sj / NS, a1 = 2 * Math.PI * (sj + 1) / NS, rm = (r0 + r1) / 2, am = (a0 + a1) / 2;
            if (B.gapH && gapAt(D.cx + Math.cos(am) * rm, D.cz + Math.sin(am) * rm, 0)) continue;
            stone(1); tri(P(r0, a0, 0), P(r1, a0, 0), P(r1, a1, 0)); if (ri) { stone(1); tri(P(r0, a0, 0), P(r1, a1, 0), P(r0, a1, 0)); }
            stone(0.6); tri(P(r0, a0, TH), P(r1, a1, TH), P(r1, a0, TH)); if (ri) { stone(0.6); tri(P(r0, a0, TH), P(r0, a1, TH), P(r1, a1, TH)); }
            if (ri === NR - 1) { stone(0.8); tri(P(r1, a0, 0), P(r1, a0, TH), P(r1, a1, TH)); stone(0.8); tri(P(r1, a0, 0), P(r1, a1, TH), P(r1, a1, 0)); }
          }
        });
        if (Pp.length) {
          var g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(Pp), 3)); g2.setAttribute('color', new THREE.BufferAttribute(new Float32Array(Cc), 3)); g2.computeVertexNormals();
          var m2 = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide })); m2.receiveShadow = true; m2.castShadow = true; m2.frustumCulled = false; scene.add(m2); B.meshes.push(m2); B.deckMesh = m2;
        }
      })();
    }
    var toxPos = [];                                                // every toxic patch goes into this one mesh (one draw, not one per patch)
    B.toxic.forEach(function (t) {                               // toxic patches: a flat dark rectangle laid just above the ground, exactly the size that hurts; at most 64 cells a side, each 2.5 units or more
      var nu = Math.max(1, Math.ceil(t.hw * 2 / Math.max(2.5, t.hw * 2 / 64))), nv = Math.max(1, Math.ceil(t.hd * 2 / Math.max(2.5, t.hd * 2 / 64))), cs = Math.cos(t.th), sn = Math.sin(t.th), iu, iv, grid = [];
      for (iv = 0; iv <= nv; iv++) for (iu = 0; iu <= nu; iu++) {
        var lx = -t.hw + 2 * t.hw * iu / nu, lz = -t.hd + 2 * t.hd * iv / nv, wx = t.x + lx * cs - lz * sn, wz = t.z + lx * sn + lz * cs;
        grid.push([L3_X + wx, (t.T !== undefined ? t.T : sbFoot(L3_X + wx, wz) + t.y) + 0.12, wz]);
      }
      for (iv = 0; iv < nv; iv++) for (iu = 0; iu < nu; iu++) {
        var a = grid[iv * (nu + 1) + iu], b = grid[iv * (nu + 1) + iu + 1], c = grid[(iv + 1) * (nu + 1) + iu + 1], d = grid[(iv + 1) * (nu + 1) + iu];
        [a, b, c, a, c, d].forEach(function (q) { toxPos.push(q[0], q[1], q[2]); });
      }
    });
    if (toxPos.length) {
      var tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(toxPos), 3)); tg.computeVertexNormals();
      var tmesh = new THREE.Mesh(tg, new THREE.MeshLambertMaterial({ color: 0x34353a, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
      tmesh.receiveShadow = true; scene.add(tmesh); B.meshes.push(tmesh);
    }
    sbCaveMeshes(); sbSlabMeshes(); sbWallMeshes(); sbTrigMeshes();
  }
  function sbPlaceMobs() {
    if (!SB) return; SB.prevOK = false;
    var pool = MOBS.filter(function (e) { return e.sbp && !e.big && !e.gz; }), n = 0, bpool = MOBS.filter(function (e) { return e.sbp && e.big; }), bn = 0;
    function atY(e, T) { if (T === undefined) return; sbPyOv = T + 0.5; e.fy = groundH(e.x, e.z); sbPyOv = undefined; if (e.fy < T - 0.5) e.fy = T; e.g.position.y = e.fy; }   // a true Y: it stands on the floor at that height (or there, if there is none)
    SB.minions.forEach(function (m) { if (n < pool.length) { reviveMob(pool[n], L3_X + m[0], m[1]); atY(pool[n], m[4]); pool[n].sbOwner = null; pool[n].sbId = m[2]; pool[n].idle = !!m[3]; n++; } });
    SB.bigs.forEach(function (m) {
      if (bn >= bpool.length) return; var e = bpool[bn++]; reviveMob(e, L3_X + m.x, m.z); atY(e, m.T); e.sbOwner = null; e.sbId = m.id; e.idle = !!m.idle;
    });
    var gpool = MOBS.filter(function (e) { return e.sbp && e.gz; }), gn = 0;
    SB.gazers.forEach(function (m) {
      if (gn >= gpool.length) return; var e = gpool[gn++]; reviveMob(e, L3_X + m.x, m.z); atY(e, m.T); e.sbOwner = null; e.sbId = m.id;
      e.gm = m.gm; e.hgt = m.hgt; e.gmove = m.move; e.gdist = m.dist; e.gper = m.period; e.gphase = m.phase; e.gth = m.th; e.gt = 0; e.ay = undefined; e.nextShot = 0; e.orb = (m.x * 0.37 + m.z * 0.11) % 6.2832;
    });
    SB.spawners.forEach(function (s) { s.t = 0; });
    sbTrigReset();
  }
  function sbTick(dt, now) {
    var B = SB; if (!B || !playing) return;
    var pp = player.position, ex = pp.x - L3_X, ez = pp.z, i, c, sn, onTox = false;
    if (B.movers.length) {                                       // the platforms: new positions on the level clock, and whoever stands on one is carried
      B.T += dt;
      B.movers.forEach(function (m) {
        var o = m.o, top = m.base + m.hgt + m.dy, riding = false, dhit0 = null;
        var px = ex - m.off[0], pz = ez - m.off[1];
        if (m.door) { dhit0 = sbMovInside(m, ex, ez); if (dhit0 && Math.abs(pp.y - dhit0.hi) < 1.5) riding = true; }
        else if (Math.abs(pp.y - top) < 1.5 && sbMovInside(m, ex, ez)) riding = true;
        if (riding && o.tox) onTox = true;
        var ox = m.off[0], oz = m.off[1], oy = m.dy, w, half;
        if (m.door) {
          var sdx = (B.prevOK ? B.px : ex) - m.cx - m.sx, sdz = (B.prevOK ? B.pz : ez) - m.cz - m.sz, sal = sdx * Math.sin(m.th0) - sdz * Math.cos(m.th0), sla = sdx * Math.cos(m.th0) + sdz * Math.sin(m.th0);
          if (Math.abs(sla) <= m.half + 1 && Math.abs(sal) > m.depth / 2 + 0.4 && Math.abs(sal) < 14) m.side = sal > 0 ? 1 : -1;      // which side she came from, in case it shuts on her
          var dc = o.cfgB, md = o.modeA && sbDoorLinked(m) ? o.modeA : dc.mode;   // one way of opening and shutting; being linked only changes which mode it is in
          var cyc = dc.open + dc.shut, ph = (((B.T + dc.phase) % cyc) + cyc) % cyc, want = md === 'open' ? 1 : md === 'closed' ? 0 : ph < dc.open ? 1 : 0;
          m.k += Math.max(-dt / dc.speed, Math.min(dt / dc.speed, want - m.k)); var ke = m.k * m.k * (3 - 2 * m.k);
          m.tx = (dc.sTx + (dc.oTx - dc.sTx) * ke) * Math.PI / 180; m.tz = (dc.sTz + (dc.oTz - dc.sTz) * ke) * Math.PI / 180;   // its tilt, part way from shut to open
          m.dy = 0; m.sx = 0; m.sz = 0;
          if (dc.slide === 'down') m.dy = -(m.hgt + 2.5) * ke;      // straight down into the floor
          else if (dc.slide === 'edge') {                         // toward its bottom edge: its own height along its lean, so the top edge ends where the bottom edge was
            var ect = Math.cos(m.tz), est = Math.sin(m.tz), ecp = Math.cos(m.tx), esp = Math.sin(m.tx), uLat = ecp * est, uUp = ecp * ect, uFw = esp, dL = -m.hgt * ke;
            m.sx = (uLat * Math.cos(m.th0) + uFw * Math.sin(m.th0)) * dL; m.sz = (uLat * Math.sin(m.th0) - uFw * Math.cos(m.th0)) * dL; m.dy = uUp * dL;
          }
        } else { w = Math.sin(2 * Math.PI * (B.T + (o.phase || 0)) / Math.max(0.1, o.period)); half = o.dist / 2; }
        if (m.door) { /* moves straight down */ }
        else if (o.move === 'side') { m.off = [Math.cos(m.th0) * half * w, Math.sin(m.th0) * half * w]; }
        else if (o.move === 'forward') { m.off = [Math.sin(m.th0) * half * w, -Math.cos(m.th0) * half * w]; }
        else if (o.move === 'vertical') m.dy = half * w;
        if (m.door) { if (riding) { var dh1 = sbMovInside(m, ex, ez); if (dh1) pp.y += dh1.hi - dhit0.hi; } sbDoorPose(m); }          // standing on the door's top: it carries her
        else {
          if (riding) { pp.x += m.off[0] - ox; pp.z += m.off[1] - oz; if (m.dy !== oy) pp.y += m.dy - oy; ex = pp.x - L3_X; ez = pp.z; }
          m.grp.position.set(m.off[0], m.dy, m.off[1]);
        }
      });
      B.movers.forEach(function (m) {                            // the slab is solid: she can go under it if she fits, can't go up through it, and is pushed out if she meets its side
        var hit = sbMovInside(m, ex, ez);
        if (!hit && m.door && B.prevOK) {                         // a door is only 2 thick: at speed she can be on one side last frame and the other side now without ever being inside it, so check the line between
          var dnx = Math.sin(m.th0), dnz = -Math.cos(m.th0), dcx = m.cx + m.sx, dcz = m.cz + m.sz, a0 = (B.px - dcx) * dnx + (B.pz - dcz) * dnz, a1 = (ex - dcx) * dnx + (ez - dcz) * dnz;
          if (a0 * a1 < 0) {
            var dtt = a0 / (a0 - a1), dsp = sbDoorSpan(m, B.px + (ex - B.px) * dtt, B.pz + (ez - B.pz) * dtt), dqy = B.py + (pp.y - B.py) * dtt;
            if (dsp && dqy + PLAYER_H > dsp.lo && dqy < dsp.hi - 1.2) { var dbk = (a0 > 0 ? 1 : -1) * (m.depth / 2 + 0.6) - a1; pp.x += dnx * dbk; pp.z += dnz * dbk; ex = pp.x - L3_X; ez = pp.z; }   // back out the way she came
          }
          return;
        }
        if (!hit) return;
        var top = m.door ? hit.hi : m.base + m.hgt + m.dy, bot = m.door ? hit.lo : top - m.thick;
        if (pp.y + PLAYER_H > bot && pp.y < top - 1.2) {
          if (B.prevOK && B.py + PLAYER_H <= bot + 0.1) { pp.y = bot - PLAYER_H; if (vy > 0) vy = 0; }
          else if (m.door) { var dside = m.side || (hit.al >= 0 ? 1 : -1), dpush = dside * (m.depth / 2 + 0.6) - hit.al; pp.x += Math.sin(hit.th) * dpush; pp.z -= Math.cos(hit.th) * dpush; ex = pp.x - L3_X; ez = pp.z; }     // shut on her: out the way she came
          else { var push = (hit.la >= 0 ? 1 : -1) * (m.half + 0.5) - hit.la; pp.x += Math.cos(hit.th) * push; pp.z += Math.sin(hit.th) * push; ex = pp.x - L3_X; ez = pp.z; }
        }
      });
      gcI = 1e9; gcJ = 1e9;
    }
    sbTrigTick(dt, now); ex = pp.x - L3_X; ez = pp.z;
    if (hp > 0 && !ballOn && !hovOn && now >= toxUntil && !onTox && B.toxLedge) {   // the top of a toxic ledge
      var tlh = sbLedge(pp.x, pp.z);
      if (ledTox && Math.abs(tlh) > 0.4) { var tgl = groundH(pp.x, pp.z); if (pp.y < tgl + 2.2 && pp.y > tgl - 3) onTox = true; }
    }
    if (onTox && hp > 0 && !ballOn && !hovOn && now >= toxUntil) { toxUntil = now + 1000; hp -= 1; drawHearts(); flashHurt(); shake(0.3); }   // standing on a toxic platform or ledge: a heart a second, as on a toxic patch
    if (hp > 0 && !ballOn && !hovOn && now >= toxUntil) {
      var tcd = sbToxAt(B, ex, ez) || [];
      for (i = 0; i < tcd.length; i++) {
        var t = tcd[i]; if (Math.abs(t.x - ex) > t.rr || Math.abs(t.z - ez) > t.rr) continue;
        c = t.cn; sn = t.sn; var dx = ex - t.x, dz = ez - t.z, lx = dx * c - dz * sn, lz = dx * sn + dz * c;
        var tsf = Math.max(l3Top(pp.x, pp.z), sbSlabTop(pp.x, pp.z, pp.y));      // the surface the patch lies on (not a cave floor or a slab beneath it)
        var tsy = t.T !== undefined ? t.T : tsf + t.y;
        if (Math.abs(lx) <= t.hw && Math.abs(lz) <= t.hd && pp.y < tsy + 2.2 && pp.y > tsy - 3) {
          toxUntil = now + 1000; hp -= 1; drawHearts(); flashHurt(); shake(0.3); break;
        }
      }
    }
    if ((B.terrain === 'level2' || B.patches.length) && hp > 0 && !ballOn && !hovOn && now >= toxUntil) {      // poisoned ground (the Sink's own, or a toxic terrain patch): a heart a second to stand on it
      var tgy = level3H(pp.x, pp.z);
      if (wL2 === 3 && pp.y < tgy + 2.2 && pp.y > tgy - 3 && sbDeckTop(pp.x, pp.z, pp.y) < pp.y - 0.5) { toxUntil = now + 1000; hp -= 1; drawHearts(); flashHurt(); shake(0.3); }   // (not while she is up on a path deck over it)
    }
    for (i = 0; i < B.tips.length; i++) {
      var tp = B.tips[i]; if (B.tipDone[i]) continue; var inside;
      if (tp.shape === 'circle') inside = Math.hypot(ex - tp.x, ez - tp.z) < tp.r;
      else { c = Math.cos(-tp.th); sn = Math.sin(-tp.th); var ux = ex - tp.x, uz = ez - tp.z; inside = Math.abs(ux * c - uz * sn) < tp.hw && Math.abs(ux * sn + uz * c) < tp.hd; }
      if (inside && (tp.up || tp.dn)) { var dyT = pp.y - (tp.T !== undefined ? tp.T : sbFoot(L3_X + tp.x, tp.z) + tp.y); if ((tp.up && dyT > tp.up) || (tp.dn && dyT < -tp.dn)) inside = false; }   // too far above or below it: not yet
      if (inside) { B.tipDone[i] = true; if (tp.text) showHint(tp.text, 6000, now, true); }
    }
    if (B.prevOK) {
      for (i = 0; i < B.goals.length; i++) {
        var g = B.goals[i], hit = sbCross(B, g, ex, ez, pp.y); if (!hit) continue;
        var gy = groundH(L3_X + g.x, g.z) + g.y, ok;
        if (g.style === 'ring') ok = Math.hypot(hit.lat, hit.yy + 1.8 - g.cy) < g.R + 1.2; else ok = Math.abs(hit.lat) < g.w / 2 && hit.yy < gy + 14;
        if (ok) { levelClear(g.kind === 'bonus' ? 'Bonus Goal Reached!' : 'Level Cleared!'); break; }
      }
      for (i = 0; i < B.cps.length; i++) {
        var cg = B.cps[i]; if (cg.lit) continue; var ch = sbCross(B, cg, ex, ez, pp.y);
        if (ch && Math.abs(ch.lat) < cg.hw + 3 && ch.yy < (cg.T !== undefined ? cg.T : sbFoot(L3_X + cg.x, cg.z) + cg.y) + 14) {
          cg.lit = true; cg.mat.color.setHex(0xffc533); cpTime[cg.n] = timeLeft; cpBest = Math.max(cpBest, cg.n);
          if (spawn.cp < cg.n) { spawn.x = L3_X + cg.x; spawn.z = cg.z; spawn.cp = cg.n; spawn.yaw = -cg.th; }
        }
      }
    }
    var cqq = B.caveCov ? sbCaveQuery(pp.x, pp.z) : null, inC = false; B.caveLow = false;
    if (cqq && pp.y < cqq.rf + 0.2 && pp.y >= cqq.fl - 4) {      // inside a tunnel: the walls hold her in and the roof stops her head
      inC = true;
      var ce = cqq.e, lo = cqq.lat, st = 0.25, aL = 0, aR = 0, lt, hOpen = 0, r0q;
      for (lt = -ce.hw; lt <= ce.hw; lt += 0.5) { r0q = polyRange(ce.pts, lt); if (r0q) hOpen = Math.max(hOpen, (r0q[1] - r0q[0]) / ce.cp); }   // the tallest the opening gets across its width
      var lowT = hOpen < PLAYER_H + 0.1, gHs = ballOn ? 2 * BALL_R : SLIDE_H + (PLAYER_H - SLIDE_H) * (1 - slideBlend), need = lowT ? Math.max(0.4, hOpen * 0.85) : PLAYER_H - 0.4;   // 3.6 tall standing, 1 tall sliding: a low tunnel can only be slid into
      if (!B.inCave && gHs > hOpen - 0.05) {                       // at the mouth: she does not fit, so she stops at the face
        pp.x = L3_X + B.px; pp.z = B.pz; speed = 0; inC = false; cqq = null;
      } else {
        for (lt = 0; lt >= -ce.hw; lt -= st) { var r1 = polyRange(ce.pts, lt); if (!r1 || (r1[1] - r1[0]) / ce.cp < need) break; aL = lt; }
        for (lt = 0; lt <= ce.hw; lt += st) { var r2 = polyRange(ce.pts, lt); if (!r2 || (r2[1] - r2[0]) / ce.cp < need) break; aR = lt; }
        var want = Math.max(aL + 0.4, Math.min(aR - 0.4, lo)); if (aR - aL < 0.9) want = (aL + aR) / 2;
        if (Math.abs(want - lo) > 0.001) { pp.x += (want - lo) * ce.Lx; pp.z += (want - lo) * ce.Lz; }
        if (lowT) { B.caveLow = true; if (pp.y + gHs > cqq.rf) { pp.y = Math.max(cqq.fl, cqq.rf - gHs); if (vy > 0) vy = 0; } }   // too low to stand: she is made to slide, and the roof stops her head
        else if (cqq.rf - cqq.fl >= PLAYER_H + 0.2 && pp.y + PLAYER_H > cqq.rf) { pp.y = cqq.rf - PLAYER_H; if (vy > 0) vy = 0; }
      }
    }
    B.inCave = inC;
    B.px = ex; B.pz = ez; B.py = pp.y; B.prevOK = true;
    if (B.spawners.length) {
      var pool = MOBS.filter(function (e) { return e.sbp && !e.big && !e.gz; });
      B.spawners.forEach(function (s) {
        if (Math.hypot(ex - s.x, ez - s.z) > s.r + 300) return;
        s.t += dt; if (s.t < s.every) return; s.t = 0;
        var alive = 0, slot = null;
        pool.forEach(function (e) { if (e.sbOwner === s && e.act && !e.dead) alive++; if (!slot && (!e.act || (e.dead && now - e.deadAt > 3200))) slot = e; });
        if (alive >= s.max || !slot) return;
        for (var tr = 0; tr < 20; tr++) {
          var a = Math.random() * 6.2832, r = Math.sqrt(Math.random()) * s.r, wx = L3_X + s.x + Math.cos(a) * r, wz = s.z + Math.sin(a) * r;
          if (Math.hypot(wx - pp.x, wz - pp.z) < 25 || groundH(wx, wz) < -50) continue;
          reviveMob(slot, wx, wz); if (s.T !== undefined) { sbPyOv = s.T + 0.5; slot.fy = groundH(wx, wz); sbPyOv = undefined; if (slot.fy < s.T - 0.5) slot.fy = s.T; slot.g.position.y = slot.fy; } slot.sbOwner = s; return;
        }
      });
    }
  }
  window.__tp = function (x, z) { player.position.set(x, groundH(x, z), z); fallTop = player.position.y; };
  window.__dbg = function () { return { SB: SB, level: level, x: player.position.x, y: player.position.y, z: player.position.z, hp: hp, segs: segCount, segTotal: segTotal, playing: playing, cleared: cleared, hintTxt: hintFull, toxUntil: toxUntil, ballOn: ballOn, now: performance.now(), ground: groundH(player.position.x, player.position.z), en: MOBS.filter(function (e) { return e.sbp && e.act; }).length }; };
  window.__en = function () { return MOBS; };
  window.__enUpd = function (dt) { updateMobs(dt, performance.now()); };
  window.__mobs = function () { return MOBS; };
  window.__wall = function () { return [wallOn, wallR * 57.29578, heading, yaw]; };
  window.__hd = function () { return [heading, yaw, speed, driftHeld, driftCool, grounded, player.position.x - L3_X, player.position.y, player.position.z, slDeg, slA]; };
  window.__keys = function (o) { for (var k in o) keys[k] = o[k]; };
  window.__bub = function () { return sbBub.count; };
  window.__lean = function () { return [leanZ, sideLean, driftBlend, body.rotation.z, !!(mollyAct && mollyAct.Drift_L), mollyDriftRun, mollyW && +((mollyW.Drift_L || 0) + (mollyW.Drift_R || 0)).toFixed(2)]; };
  window.__st = function (o) { if ('vy' in o) vy = o.vy; if ('ballOn' in o) ballOn = o.ballOn; if ('speed' in o) speed = o.speed; if ('heading' in o) heading = o.heading; if ('yaw' in o) yaw = o.yaw; if ('segs' in o) setPower(o.segs); return [vy, speed, hp]; };
  window.__pos = function (x, y, z) { player.position.set(x, y, z); };
  window.__l3 = function (x, z) { return level3H(x, z); };
  window.__segs = function () { return segId.map(function (id, i) { return [id, Math.round(segZ[i]), Math.round(segY[i] * 10) / 10]; }).filter(function (a) { return /^(big,sb|sb,)/.test(a[0]); }); };
  window.__gh = function (x, z) { return groundH(x, z); };
  window.__gg = function (x, z) { groundGrad(x, z); return [ggx, ggz]; };
  window.__br = function () { return [breath, breathT]; };
  window.__shDbg = function (x, z) { return [shBase(x, z), shRavine(x, z)]; };   // (tests: Sunset Hill's height without ravines, and the ravine's depth)
  window.__sbTick = function (dt) { sbTick(dt, performance.now()); };
  function terrainProbe(kind, x0, z0, nx, nz, cell) {            // the level's own ground at a grid of points (the editor paints it under the layout): height and what it is made of
    var h = new Float32Array(nx * nz), k = new Uint8Array(nx * nz), i, j, ex, ez, y, kk, lg;
    {
      for (j = 0; j < nz; j++) for (i = 0; i < nx; i++) {
        ex = x0 + (i + 0.5) * cell; ez = z0 + (j + 0.5) * cell;
        if (kind === 'sunset') { var shb = shBase(ex, ez), shc = shRavine(ex, ez); y = shb + terrainFlat(ex, ez) - shc; lg = 0; kk = shc > 3 ? 1 : shb > SH_H * SH_TREES ? 2 : 0; }   // Sunset Hill: rock in the ravines, paler grass above the treeline
        else if (kind === 'level2') { y = oldWorldH(L2_X + ex, ez + L2_SBZ); kk = wL2 === 3 ? 6 : wL2 === 2 ? 5 : wL2 ? 4 : 0; lg = oldLedgeH(L2_X + ex, ez + L2_SBZ); if (y < WATER_Y) kk |= 32; }
        else { y = oldWorldH(ex, ez); kk = wL2 === 3 ? 6 : wSt ? 1 : wPl ? 2 : wMud ? 3 : 0; lg = oldLedgeH(ex, ez); }
        if (lg > 0.4 || lg < -0.4) kk |= 16;
        h[j * nx + i] = y + lg; k[j * nx + i] = kk;
      }
    }
    return { h: h, k: k };
  }
  function startSandbox(j) {
    sbDispose(); SB = sbBuild(j); sbCaveInit(); sbMoverInit(); gcI = 1e9; gcJ = 1e9;
    for (var key in chunks) { scene.remove(chunks[key]); delete chunks[key]; }       // the ground is rebuilt for the new layout
    level = 3; newRun(); TIME_LIMIT = SB.timeLimit > 0 ? SB.timeLimit : 300; timeLeft = TIME_LIMIT; sbMakeMeshes(); sbRampInit(); sbBoostZones();   /* after the meshes: Oceana's slab of path is marked out while they are made, and a ramp's foot can stand on it */
    spawnStart(''); begin();
  }
  function spawnStart(msg) {                                   // a layout's own Player start if it has one, else the beginning of the path
    var sp0 = level === 3 && SB && SB.startPt;
    if (sp0) { spawnAt(L3_X + sp0.x, sp0.z, 0, msg || '', -sp0.th); if (sp0.T !== undefined) { player.position.y = sp0.T; fallTop = sp0.T; grounded = false; } } else spawnAt(level === 3 ? L3_X : 0, 0, 0, msg || '');
  }
  var wSt = 0, wPl = 0;    // set by worldH: 1 if this spot is bare rock, 1 if it is plateau grass
  // Full height of the world at a point on the mesh grid: rolling ground, ledges, floor lift, rock walls, plateau hills and
  // the cliff at the plateau's edges.
  function worldH0(x, z) { return level3H(x, z); }               // the play world: the loaded layout (flat 0 before one is loaded); the old levels' terrain is oldWorldH
  function oldWorldH(x, z) {                                       // the old hand-made levels' ground, in their own coordinates (Oceana Crags past L2_MIN): the terrain the layouts' level1 and level2 grounds sample
    if (x > L2_MIN) { wSt = 0; wPl = 0; wMud = 0; wF = 0; var yl2 = level2H(x, z); wL2 = l2Kind === 2 && ovTox ? 3 : l2Kind; return yl2; }
    wL2 = 0;
    var y = terrainFlat(x, z);
    wallField(x, z);
    y += wF;
    var inP = plateauOut(x, z) < 0;
    wSt = 0; wPl = 0; wMud = 0;
    if (wd > 0.001) {
      var ix = Math.round(x / GRID), jz = Math.round(z / GRID);
      var r1 = rand01(ix, jz, 1) * 2 - 1;
      var cf = Math.min(1, wR / 10);                              // rocky roughness only where there are real walls...
      if (inP) cf *= 1 - smooth01((wd - 14) / 16);                // ...and it dies away on top of the plateau
      var rise = wR * (1 - Math.exp(-wd / 6));
      var crag = 4.5 * r1 * (1 - Math.exp(-wd / 3)) * cf;
      var lump = 6 * Math.sin(x * 0.09 + z * 0.07) * Math.sin(z * 0.083 - x * 0.05 + 1) * (1 - Math.exp(-wd / 10)) * cf;
      var rock = y + rise + crag + lump;
      if (rock > y) y = rock;
      if (inP && wd > 30) {
        y += hillH(x, z);
      }
      wSt = (wR > 6 && !(inP && wd > 28)) ? 1 : 0;
      wPl = (!wSt && inP) ? 1 : 0;
    }
    var de = plateauOut(x, z), gone = smooth01((wd - 60) / 60);       // how far past the plateau's cliff edge; rock within 60 of open ground is kept
    if (de > 0 && gone > 0) { y -= 3000 * (1 - Math.exp(-de / 10)) * gone; wSt = 1; wPl = 0; }
    var v2y = valley2(x, z);
    if (v2y !== null) {
      y = v2y; wSt = 0; wPl = V2_FLOOR ? 0 : 1;
      if (V2_D > V2_WI + 2 && V2_D < V2_WO) {                      // the wall's face is bare, rough rock like the first valley's, easing to nothing at its foot and its lip so neither is a hard corner
        var u2 = (V2_D - V2_WI) / (V2_WO - V2_WI), bump = Math.sin(Math.PI * u2);
        var q1 = rand01(Math.round(x / GRID), Math.round(z / GRID), 1) * 2 - 1;
        y += bump * (4.5 * q1 + 6 * Math.sin(x * 0.09 + z * 0.07) * Math.sin(z * 0.083 - x * 0.05 + 1));
        wSt = 1; wPl = 0;
      } else if (V2_D >= V2_WO) {                                  // the tops: no level ground at all, just extremely jagged rock (the platform at the end of the ramp is laid over this afterwards)
        var tin = smooth01((V2_D - V2_WO) / 8) * (1 - smooth01((V2_D - (V2_HALF + V2_RIM - 10)) / 10));
        var q2 = rand01(Math.round(x / GRID), Math.round(z / GRID), 1) * 2 - 1, q3 = rand01(Math.round(x / GRID) + 77, Math.round(z / GRID) - 31, 2) * 2 - 1;
        y += tin * (8 * q2 + 3 * q3 + 10 * Math.sin(x * 0.09 + z * 0.07) * Math.sin(z * 0.083 - x * 0.05 + 1) + 5 * Math.sin(x * 0.21 - z * 0.17));
        wSt = 1; wPl = 0;
      }
    }
    var cy = cave(x, z);
    if (cy !== null) { y = cy; wSt = cK === 1 ? 1 : 0; wPl = cK === 2 ? 1 : 0; wMud = cK === 3 ? 1 : 0; }
    var rs = PX0 - x;                                                                                          // the ramp: leaves the plateau's west end, climbs to the platform
    if (rs >= 0 && rs <= RMP_END + RMP_PLAT && Math.abs(z - RMP_ZC) <= (rs > RMP_END ? RMP_PLAT : RMP_W) / 2) {
      y = WALL_HEIGHT + terrainFlat(x, z) * (1 - smooth01(rs / 60)) + rampRise(rs); wSt = 0; wPl = 1;
    }
    return y;
  }
  function cellHash(a, b) {
    var h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function cellRng(cx, cz) {
    var a = cellHash(cx, cz);
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rand01(i, j, k) { return cellHash(i + k * 7919, j - k * 104729) / 4294967296; }

  var terrainMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  var STONE = [0x8c877c, 0x7a756b, 0x9a9488, 0x6e6a62];
  var chunks = {};
  // Where a cave's mouth meets the terrain, the ground's own triangles that cross the tunnel's opening are left out, so the opening is real. (wx, wz world; y0..y1 the triangle's heights.)
  function caveHole(wx, wz, y0, y1) {
    if (!SB) return false;
    if (SB.shafts.length && sbShaftIn(wx, wz, -0.1)) return true;   // a shaft's opening: the ground over it is left out
    if (!SB.caveZone) return false;
    var q = sbCaveQ(SB.caveZone, wx, wz, -0.1); if (!q) return false;   // a hair narrower than the tunnel, so the ground's cut edge tucks in behind its walls and no sky shows between them
    return y1 > q.fl + 0.25 && y0 < q.rf - 0.05;
  }
  function chunkKey(ci, cj) { return cj * 4096 + ci + 2048; }
  // One 100 x 100 tile of the world. Every random value comes from the vertex's position in the whole world, so two tiles
  // that share an edge build identical vertices there and no seam shows.
  function buildChunk(ci, cj) {
    return buildChunk0(ci, cj);
  }
  function buildChunk0(ci, cj) {
    var NX = Math.round(CHUNK / GRID), NZ = NX, W = NX + 1;
    var x0 = ci * CHUNK, z0 = cj * CHUNK;
    var nv = W * (NZ + 1);
    var vTs = new Float32Array(nv + 64), vTu = new Float32Array(nv + 64), vx = new Float32Array(nv + 64), vy = new Float32Array(nv + 64), vz = new Float32Array(nv + 64), vd = new Uint8Array(nv + 64), vf = new Float32Array(nv + 64), vB = new Uint8Array(nv + 4);   // the last 20 are scratch: a wall's pieces use nv and nv+1, a cut-up triangle at a cave's mouth the rest
    var IND = !!SB && SB.indep && level === 3, vA = IND ? new Float32Array(nv + 4) : null, vP = IND ? new Float32Array(nv + 4) : null, vN = IND ? new Float32Array(nv + 4) : null, vS = IND ? new Float32Array(nv + 4) : null;   // vd: 1 bare rock, 2 plateau grass, 0 valley grass
    for (var j = 0; j <= NZ; j++) {
      for (var i = 0; i <= NX; i++) {
        var gx = x0 + i * GRID, gz = z0 + j * GRID;
        var ix = ci * NX + i, jz = cj * NZ + j;
        l3Bk = 0; var y = worldH0(gx, gz), kind = wL2 === 3 ? 6 : wL2 === 2 ? 5 : wL2 ? 4 : wSt ? 1 : wPl ? 2 : wMud ? 3 : 0, px = gx, pz = gz;
        if (kind === 4 && l3Tx) kind = 6 + l3Tx;
        if (SB && SB.toxLedge && kind !== 6) { var tlg = sbLedge(gx, gz); if (ledTox && Math.abs(tlg) > 0.4) kind = 6; }   // the top of a toxic ledge: poisoned ground   // a sandbox path segment with its own surface: 7 planks, 8 metal, 9 grass
        vTs[j * W + i] = l3Ps; vTu[j * W + i] = l3Pu;
        if (kind === 1) {
          px += (rand01(ix, jz, 2) * 2 - 1) * 0.9; pz += (rand01(ix, jz, 3) * 2 - 1) * 0.9;
        }
        var k = j * W + i;
        vB[k] = l3Bk ? 1 : 0;
        if (IND) { vA[k] = l3A; vP[k] = l3P; vN[k] = l3N; vS[k] = l3S0; }
        vx[k] = px - x0; vy[k] = y; vz[k] = pz - z0; vd[k] = kind; vf[k] = wF;   // x and z are stored relative to the tile to keep precision far from the start
      }
    }
    var Lc = new Float32Array(NX * NZ), LAc = IND ? new Float32Array(NX * NZ) : null, LIc = IND ? new Float32Array(NX * NZ) : null;
    for (var lj = 0; lj < NZ; lj++) for (var li = 0; li < NX; li++) { Lc[lj * NX + li] = ledgeCell(ci * NX + li, cj * NZ + lj); if (IND) { LAc[lj * NX + li] = ledCA; LIc[lj * NX + li] = ledCI; } }
    function dv(k, L, La, LI) { return IND && vS[k] === vS[k] ? sbComb(vA[k], vP[k], vN[k], La, LI) - vS[k] : L; }   // how far a stamped ledge lifts this corner
    var tris = NX * NZ * 6;
    var pos = new Float32Array(tris * 9), col = new Float32Array(tris * 9);
    var color = new THREE.Color();
    var t = 0, tOv = -1, riseOv = -1;
    function emitSub(a, b, c, ha, hb, hc) {                                // a ground triangle near a cave's mouth is cut into 16 flat pieces first, so the opening follows the tunnel's outline closely and no wide sliver is left between them
      var n = 4, P = [], i, j, k = nv + 4, kinds = [vd[a], vd[b], vd[c]], K = vd[a], has = function (v) { return kinds.indexOf(v) >= 0; };
      K = has(4) ? 4 : has(7) ? 7 : has(8) ? 8 : has(9) ? 9 : has(6) ? 6 : has(5) ? 5 : has(1) ? 1 : (kinds[0] === 3 && kinds[1] === 3 && kinds[2] === 3) ? 3 : has(3) ? 1 : (kinds[0] === 2 && kinds[1] === 2 && kinds[2] === 2) ? 2 : 0;
      var fa = (vf[a] + vf[b] + vf[c]) / 3, ox = [vx[a], vx[b], vx[c]], oz = [vz[a], vz[b], vz[c]], oh = [ha, hb, hc];
      for (i = 0; i <= n; i++) for (j = 0; i + j <= n; j++) {
        var u = i / n, v = j / n, w = 1 - u - v; vx[k] = ox[0] * w + ox[1] * u + ox[2] * v; vz[k] = oz[0] * w + oz[1] * u + oz[2] * v; vy[k] = 0; vd[k] = K; vf[k] = fa; vTs[k] = (vTs[a] + vTs[b] + vTs[c]) / 3; vTu[k] = (vTu[a] + vTu[b] + vTu[c]) / 3; P[i * 8 + j] = [k, oh[0] * w + oh[1] * u + oh[2] * v]; k++;
      }
      tOv = t; riseOv = Math.max(ha, hb, hc) - Math.min(ha, hb, hc);
      for (i = 0; i < n; i++) for (j = 0; i + j < n; j++) {
        var p0 = P[i * 8 + j], p1 = P[(i + 1) * 8 + j], p2 = P[i * 8 + j + 1];
        emit(p0[0], p1[0], p2[0], p0[1], p1[1], p2[1], false, true);
        if (i + j < n - 1) { var p3 = P[(i + 1) * 8 + j + 1]; emit(p1[0], p3[0], p2[0], p1[1], p3[1], p2[1], false, true); }
      }
      tOv = -1; riseOv = -1;
    }
    function emit(a, b, c, ha, hb, hc, face, sub) {
      if (!sub && !face && SB && ((SB.caveZone && sbCaveQ(SB.caveZone, x0 + (vx[a] + vx[b] + vx[c]) / 3, z0 + (vz[a] + vz[b] + vz[c]) / 3, 4.5)) || (SB.shafts.length && sbShaftIn(x0 + (vx[a] + vx[b] + vx[c]) / 3, z0 + (vz[a] + vz[b] + vz[c]) / 3, 4.5)))) { emitSub(a, b, c, ha, hb, hc); return; }
      if ((t + 1) * 9 > pos.length) { var np = new Float32Array(pos.length * 2), nc = new Float32Array(pos.length * 2); np.set(pos); nc.set(col); pos = np; col = nc; }
      if (!face && caveHole(x0 + (vx[a] + vx[b] + vx[c]) / 3, z0 + (vz[a] + vz[b] + vz[c]) / 3, Math.min(ha, hb, hc), Math.max(ha, hb, hc))) return;
      var o = t * 9, idx = [a, b, c], hh3 = [ha, hb, hc];
      for (var q = 0; q < 3; q++) {
        pos[o + q * 3] = vx[idx[q]]; pos[o + q * 3 + 1] = hh3[q]; pos[o + q * 3 + 2] = vz[idx[q]];
      }
      var cx = (pos[o] + pos[o + 3] + pos[o + 6]) / 3 + x0, cy = (pos[o + 1] + pos[o + 4] + pos[o + 7]) / 3;
      var cz = (pos[o + 2] + pos[o + 5] + pos[o + 8]) / 3 + z0;
      var tq = tOv >= 0 ? tOv : t, jit = rand01(tq, 17 + ci + cj * 977, 5);
      var ya = pos[o + 1], yb = pos[o + 4], yc = pos[o + 7];
      var rise3 = riseOv >= 0 ? riseOv : Math.max(ya, yb, yc) - Math.min(ya, yb, yc);
      var plat = vd[a] === 2 && vd[b] === 2 && vd[c] === 2;
      var tk3 = vd[a] >= 7 ? vd[a] : vd[b] >= 7 ? vd[b] : vd[c] >= 7 ? vd[c] : 0;
      if (tk3 && !face) {                                                                        // a path segment's own surface
        pathTexCol(color, tk3 - 6, (vTs[a] + vTs[b] + vTs[c]) / 3, (vTu[a] + vTu[b] + vTu[c]) / 3, jit, rand01(tq, 5 + ci + cj * 977, 6));
      } else if (vd[a] === 4 || vd[b] === 4 || vd[c] === 4) {                                           // level 2: light brown stone, a little different on every facet
        color.setHSL(0.085 + (jit - 0.5) * 0.012, 0.19 + (jit - 0.5) * 0.05, 0.50 + (jit - 0.5) * 0.07 + (rand01(tq, 5 + ci + cj * 977, 6) - 0.5) * 0.03);
      } else if (vd[a] === 6 || vd[b] === 6 || vd[c] === 6) {                                     // the Sink: poisoned ground: the strips' dark gray, textured
        var tp = 0.5 + 0.5 * Math.sin(cx * 0.07 + 0.4) * Math.sin(cz * 0.06 - 1.1);
        color.setHSL(0.64, 0.035, 0.19 + tp * 0.05 + (jit - 0.5) * 0.08);   // the toxic strips' dark gray (0x34353a), with a patchy texture
      } else if (vd[a] === 5 || vd[b] === 5 || vd[c] === 5) {                                     // the Crags: brown rock, darker on the steep faces, with faint strata
        color.setHSL(0.068 + (jit - 0.5) * 0.03, 0.36, 0.30 + (jit - 0.5) * 0.08 + Math.min(0.14, Math.max(0, cy - 35) / 1800) - (rise3 > 6 ? 0.05 : 0) + 0.025 * Math.sin(cy * 0.4));
      } else if (!face && vd[a] === 3 && vd[b] === 3 && vd[c] === 3) {                                  // the mud ramp
        color.setHSL(0.075 + (jit - 0.5) * 0.02, 0.42, 0.2 + (jit - 0.5) * 0.07 + (0.5 + 0.5 * Math.sin(cz * 0.9 + cx * 0.3)) * 0.03);
      } else if (face || vd[a] === 1 || vd[b] === 1 || vd[c] === 1 || vd[a] === 3 || vd[b] === 3 || vd[c] === 3 || rise3 > (plat ? 5 : SB && SB.terrain === 'sunset' ? 2.6 : 0.48)) {   // cliffs, and the steep faces of ledges and hillsides, are rock (Sunset Hill stays grassy up to about 40 degrees)
        color.setHex(STONE[Math.floor(jit * STONE.length) % STONE.length]);
        color.offsetHSL(0, 0, Math.min(0.1, cy / 400) + (rand01(tq, 3 + ci + cj * 977, 6) - 0.5) * 0.05);
      } else {
        var patch = 0.5 + 0.5 * Math.sin(cx * 0.05 + 1.1) * Math.sin(cz * 0.043 - 0.6);
        var rel = cy - (vf[a] + vf[b] + vf[c]) / 3;     // height above the local floor, so the raised plateau is not bleached
        rel = rel < -2 ? -2 : rel > 3 ? 3 : rel;
        if (plat) rel = Math.max(0, Math.min(1, (cy - 46) / 100)) * 3.5;   // plateau grass matches the valley's, a little paler on the hilltops
        color.setHSL(0.255 + patch * 0.035 + (jit - 0.5) * 0.02,
                     0.5 + patch * 0.05,
                     0.30 + patch * 0.06 + (jit - 0.5) * 0.06 + rel * 0.012);
      }
      for (var q2 = 0; q2 < 3; q2++) {
        col[o + q2 * 3] = color.r; col[o + q2 * 3 + 1] = color.g; col[o + q2 * 3 + 2] = color.b;
      }
      t++;
    }
    // A vertical face along the edge a-b between two cells whose ledge heights are l1 (this cell) and l2 (the neighbour at +dx, +dz)
    function faceTri(a, ha, b, hb, c, hc, nx, nz) {
      var e1x = vx[b] - vx[a], e1y = hb - ha, e1z = vz[b] - vz[a], e2x = vx[c] - vx[a], e2y = hc - ha, e2z = vz[c] - vz[a];
      var cxx = e1y * e2z - e1z * e2y, czz = e1x * e2y - e1y * e2x;
      if (cxx * nx + czz * nz < 0) emit(a, c, b, ha, hc, hb, true); else emit(a, b, c, ha, hb, hc, true);
    }
    function wallQuad(a, b, l1, l2, dx, dz, m1, m2) {              // l1, l2: the two sides' lifts at a; m1, m2: at b (when they differ along the edge)
      var two = m1 !== undefined, lo = Math.min(l1, l2), hi = Math.max(l1, l2), loB = two ? Math.min(m1, m2) : lo, hiB = two ? Math.max(m1, m2) : hi, nx = l1 + (two ? m1 : l1) > l2 + (two ? m2 : l2) ? dx : -dx, nz = l1 + (two ? m1 : l1) > l2 + (two ? m2 : l2) ? dz : -dz;
      function piece(t0, t1, plo, phi, plo1, phi1) {                       // the part of the face between t0 and t1 along its edge, from plo to phi above the ground (and plo1, phi1 at its far end, if they differ)
        var s0 = nv, s1 = nv + 1, k; if (plo1 === undefined) { plo1 = plo; phi1 = phi; }
        vx[s0] = vx[a] + (vx[b] - vx[a]) * t0; vz[s0] = vz[a] + (vz[b] - vz[a]) * t0; vy[s0] = vy[a] + (vy[b] - vy[a]) * t0;
        vx[s1] = vx[a] + (vx[b] - vx[a]) * t1; vz[s1] = vz[a] + (vz[b] - vz[a]) * t1; vy[s1] = vy[a] + (vy[b] - vy[a]) * t1;
        vd[s0] = vd[a]; vd[s1] = vd[b]; vf[s0] = vf[a]; vf[s1] = vf[b]; vTs[s0] = vTs[a]; vTs[s1] = vTs[b]; vTu[s0] = vTu[a]; vTu[s1] = vTu[b];
        faceTri(s0, vy[s0] + plo, s1, vy[s1] + plo1, s1, vy[s1] + phi1, nx, nz);
        faceTri(s0, vy[s0] + plo, s1, vy[s1] + phi1, s0, vy[s0] + phi, nx, nz);
      }
      var zq = null;
      if (SB && SB.caveZone) zq = sbCaveQ(SB.caveZone, x0 + (vx[a] + vx[b]) / 2, z0 + (vz[a] + vz[b]) / 2, 2);
      if (!zq) { piece(0, 1, lo, hi, loB, hiB); return; }
      if (two) { lo = (lo + loB) / 2; hi = (hi + hiB) / 2; }
      // a cliff face with a cave in it: the opening's height range is left out, and only where the edge is within the opening's width
      var e = zq.e, la = (x0 + vx[a] - L3_X - e.x) * e.Lx + (z0 + vz[a] - e.z) * e.Lz, lb = (x0 + vx[b] - L3_X - e.x) * e.Lx + (z0 + vz[b] - e.z) * e.Lz, hw = e.hw - 0.05, t1 = 0, t2 = 1, vm = (vy[a] + vy[b]) / 2;
      if (Math.abs(lb - la) < 1e-6) { if (Math.abs(la) > hw) { piece(0, 1, lo, hi); return; } }
      else { var ta = (-hw - la) / (lb - la), tb = (hw - la) / (lb - la); t1 = Math.max(0, Math.min(ta, tb)); t2 = Math.min(1, Math.max(ta, tb)); if (t1 >= t2) { piece(0, 1, lo, hi); return; } }
      if (t1 > 0.001) piece(0, t1, lo, hi);
      if (t2 < 0.999) piece(t2, 1, lo, hi);
      if (zq.fl - vm > lo + 0.05) piece(t1, t2, lo, Math.min(hi, zq.fl - vm));
      if (zq.rf - vm < hi - 0.05) piece(t1, t2, Math.max(lo, zq.rf - vm), hi);
    }
    for (var jj = 0; jj < NZ; jj++) {
      for (var ii = 0; ii < NX; ii++) {
        var A = jj * W + ii, B = A + 1, Cc = A + W, D = Cc + 1;
        var L = Lc[jj * NX + ii];
        if (vB[A] || vB[B] || vB[Cc] || vB[D]) {                    // beside a steeply banked path: the cell is cut into 5 x 5 pieces that follow the bank's real height, so the picture and the ground she stands on are the same shape and a curve cannot make it jitter
          var La1 = IND ? LAc[jj * NX + ii] : 0, LI1 = IND ? LIc[jj * NX + ii] : 0, NB = BK_N, hsz = GRID / NB, sc0 = nv + 24, si2, sj2, hh = [], gx1 = x0 + ii * GRID, gz1 = z0 + jj * GRID;
          for (sj2 = 0; sj2 <= NB; sj2++) for (si2 = 0; si2 <= NB; si2++) {
            var kk = sc0 + sj2 * (NB + 1) + si2; vx[kk] = ii * GRID + si2 * hsz; vz[kk] = jj * GRID + sj2 * hsz; vd[kk] = vd[A]; vf[kk] = vf[A]; vTs[kk] = vTs[A]; vTu[kk] = vTu[A];
            hh.push(cornerY(gx1 + si2 * hsz, gz1 + sj2 * hsz, L, La1, LI1)); vy[kk] = hh[hh.length - 1];
          }
          var cr1 = Math.max(hh[0], hh[NB * (NB + 1)], hh[NB]) - Math.min(hh[0], hh[NB * (NB + 1)], hh[NB]), cr2 = Math.max(hh[NB], hh[NB * (NB + 1)], hh[(NB + 1) * (NB + 1) - 1]) - Math.min(hh[NB], hh[NB * (NB + 1)], hh[(NB + 1) * (NB + 1) - 1]);
          tOv = t;
          for (sj2 = 0; sj2 < NB; sj2++) for (si2 = 0; si2 < NB; si2++) {
            var q0 = sj2 * (NB + 1) + si2, q1 = q0 + 1, q2 = q0 + NB + 1, q3 = q2 + 1;
            riseOv = cr1; emit(sc0 + q0, sc0 + q2, sc0 + q1, hh[q0], hh[q2], hh[q1], false, true);
            riseOv = cr2; emit(sc0 + q1, sc0 + q2, sc0 + q3, hh[q1], hh[q2], hh[q3], false, true);
          }
          tOv = -1; riseOv = -1;
          continue;
        }
        if (IND) {                                                  // some hills, crags or ledges keep their own height: each corner of a cell is lifted by its own amount
          var La0 = LAc[jj * NX + ii], LI0 = LIc[jj * NX + ii], dA = dv(A, L, La0, LI0), dB = dv(B, L, La0, LI0), dC = dv(Cc, L, La0, LI0), dD = dv(D, L, La0, LI0), Lr, Lar, LIr, Ll, Lal, LIl;
          emit(A, Cc, B, vy[A] + dA, vy[Cc] + dC, vy[B] + dB);
          emit(B, Cc, D, vy[B] + dB, vy[Cc] + dC, vy[D] + dD);
          if (ii < NX - 1) { Lr = Lc[jj * NX + ii + 1]; Lar = LAc[jj * NX + ii + 1]; LIr = LIc[jj * NX + ii + 1]; } else { Lr = ledgeCell(ci * NX + NX, cj * NZ + jj); Lar = ledCA; LIr = ledCI; }
          var eB = dv(B, Lr, Lar, LIr), eD = dv(D, Lr, Lar, LIr);
          if (Math.abs(eB - dB) > 0.01 || Math.abs(eD - dD) > 0.01) wallQuad(B, D, dB, eB, 1, 0, dD, eD);
          if (jj < NZ - 1) { Ll = Lc[(jj + 1) * NX + ii]; Lal = LAc[(jj + 1) * NX + ii]; LIl = LIc[(jj + 1) * NX + ii]; } else { Ll = ledgeCell(ci * NX + ii, cj * NZ + NZ); Lal = ledCA; LIl = ledCI; }
          var fC = dv(Cc, Ll, Lal, LIl), fD = dv(D, Ll, Lal, LIl);
          if (Math.abs(fC - dC) > 0.01 || Math.abs(fD - dD) > 0.01) wallQuad(Cc, D, dC, fC, 0, 1, dD, fD);
          continue;
        }
        emit(A, Cc, B, vy[A] + L, vy[Cc] + L, vy[B] + L);
        emit(B, Cc, D, vy[B] + L, vy[Cc] + L, vy[D] + L);
        var Le = ii < NX - 1 ? Lc[jj * NX + ii + 1] : ledgeCell(ci * NX + NX, cj * NZ + jj);
        if (Math.abs(Le - L) > 0.01) wallQuad(B, D, L, Le, 1, 0);
        var Ls = jj < NZ - 1 ? Lc[(jj + 1) * NX + ii] : ledgeCell(ci * NX + ii, cj * NZ + NZ);
        if (Math.abs(Ls - L) > 0.01) wallQuad(Cc, D, L, Ls, 0, 1);
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(0, t * 9), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col.slice(0, t * 9), 3));
    geo.computeVertexNormals();           // not indexed, so every facet keeps its own normal
    var mesh = new THREE.Mesh(geo, terrainMat);
    mesh.position.set(x0, 0, z0);
    mesh.receiveShadow = true;
    scene.add(mesh);
    mesh.userData.ci = ci; mesh.userData.cj = cj;
    chunks[chunkKey(ci, cj)] = mesh;
  }
  function useful(ci, cj) { return true; }                       // every tile around her is built (the layout's ground is all open)
  // Build the tiles around her (at most `budget` per call, nearest first) and drop the ones that fell out of range.
  function updateChunks(px, pz, budget) {
    var VIEW = Math.max(VIEW_AHEAD, VIEW_BEHIND);
    var c0 = Math.floor((px - VIEW) / CHUNK), c1 = Math.floor((px + VIEW) / CHUNK);
    var r0 = Math.floor((pz - VIEW) / CHUNK), r1 = Math.floor((pz + VIEW) / CHUNK);
    for (var key in chunks) {
      var ud = chunks[key].userData;
      if (ud.ci < c0 - 1 || ud.ci > c1 + 1 || ud.cj < r0 - 1 || ud.cj > r1 + 1) {
        scene.remove(chunks[key]); chunks[key].geometry.dispose(); delete chunks[key];
      }
    }
    var need = [];
    for (var cj = r0; cj <= r1; cj++) {
      for (var ci = c0; ci <= c1; ci++) {
        if (chunks[chunkKey(ci, cj)] || !useful(ci, cj)) continue;
        var ddx = (ci + 0.5) * CHUNK - px, ddz = (cj + 0.5) * CHUNK - pz;
        need.push({ ci: ci, cj: cj, d: ddx * ddx + ddz * ddz });
      }
    }
    need.sort(function (p, q) { return p.d - q.d; });
    for (var n = 0; n < need.length && budget > 0; n++, budget--) buildChunk(need[n].ci, need[n].cj);
  }
  updateChunks(0, 0, 99);

