import sys; sys.path.insert(0,'/home/claude/poly-runner/tests/fu')
from rep import rep
P='/home/claude/poly-runner/checker-run.html'
rep(P,[("Math.hypot(e.x - ex, e.z - z) <= e.half","sbIn(e, ex, z, 0)")],count=5)
rep(P,[
("Math.hypot(e.x - x, e.z - z) <= e.half + grow","sbIn(e, x, z, grow)"),
("Math.hypot(e.x - x, e.z - z) <= e.half) m = true","sbIn(e, x, z, 0)) m = true"),
("  function sbAdd(h, x, z, v) {","""  function sbIn(e, x, z, g) {                                  // is (x, z) inside this footprint entry, grown by g? Rounded pieces are discs along the line; squared pieces are short oriented boxes (e.hl along the line, e.half across)
    if (!e.sq) return Math.hypot(e.x - x, e.z - z) <= e.half + g;
    var dx = x - e.x, dz = z - e.z, c = Math.cos(e.th), s = Math.sin(e.th);
    return Math.abs(dx * c + dz * s) <= e.half + g && Math.abs(dx * s - dz * c) <= e.hl + g;
  }
  function sbAdd(h, x, z, v) {"""),
("\n      if (r.type === 'gap') o.w = r.width || 15;","\n      if (r.type === 'gap') o.w = r.width || 15;\n      o.sq = (r.type === 'gap' || r.type === 'ledge' || r.type === 'mud') && r.ends === 'square';"),
("""        if (o.t === 'mud') { n = Math.ceil(o.len / 3); for (k = 0; k <= n; k++) { q = shapeAt(o, Math.min(o.len, k * 3)); sbAdd(tgt, q.x, q.z, { x: q.x, z: q.z, half: half, o: o }); } }
        else { n = Math.ceil(o.len / 3); for (k = 0; k <= n; k++) { q = shapeAt(o, Math.min(o.len, k * 3)); sbAdd(tgt, q.x, q.z, { x: q.x, z: q.z, half: half + 1.5, o: o }); } }""",
"""        var mg = o.t === 'mud' ? 0 : 1.5, mgEnd = o.t === 'mud' ? 1 : 1.5;   // rounded: a disc of (half + mg) every 3 units. squared: boxes 1 unit long, plus a cap of mgEnd past each end
        if (o.sq) {
          var sqH = half + mg, nq = Math.ceil(o.len);
          for (k = 0; k <= nq; k++) { q = shapeAt(o, Math.min(o.len, k)); sbAdd(tgt, q.x, q.z, { x: q.x, z: q.z, half: sqH, hl: 0.6, th: q.th + Math.PI / 2, sq: true, o: o }); }
          [0, o.len].forEach(function (de, ei) { var qe = shapeAt(o, de), sgn = ei ? 1 : -1, cx2 = qe.x + Math.sin(qe.th) * sgn * mgEnd / 2, cz2 = qe.z - Math.cos(qe.th) * sgn * mgEnd / 2; sbAdd(tgt, cx2, cz2, { x: cx2, z: cz2, half: sqH, hl: mgEnd / 2 + 0.1, th: qe.th + Math.PI / 2, sq: true, o: o }); });
        }
        else { n = Math.ceil(o.len / 3); for (k = 0; k <= n; k++) { q = shapeAt(o, Math.min(o.len, k * 3)); sbAdd(tgt, q.x, q.z, { x: q.x, z: q.z, half: half + mg, o: o }); } }"""),
])
