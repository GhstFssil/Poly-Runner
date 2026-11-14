import sys; sys.path.insert(0,'/home/claude/poly-runner/tests/fu')
from rep import rep
P='/home/claude/poly-runner/path-editor.html'
rep(P,[
("ledge: { len: 80, w: 4, hgt: 5, bend: 0 }","ledge: { len: 80, w: 4, hgt: 5, bend: 0, ends: 'round' }"),
("gap: { len: 30, bend: 0 }","gap: { len: 30, bend: 0, ends: 'round' }"),
("mud: { len: 150, slow: 50 }","mud: { len: 150, slow: 50, ends: 'round' }"),
("  function renderInsp() {",
"""  function endsOf(o) { return o.ends === 'square' ? 'square' : 'round'; }
  function endsF(o) { return '<label class="f">Ends<select data-ok="ends"><option value="round"' + (endsOf(o) === 'round' ? ' selected' : '') + '>Rounded (a half-circle past each end)</option><option value="square"' + (endsOf(o) === 'square' ? ' selected' : '') + '>Squared (flat, 1.5 past each end)</option></select></label>'; }
  function stripFoot(o) { var raw = o.t === 'mud' ? S.width / 2 : o.t === 'ledge' ? Math.max(o.w / 2, 1.3) : o.w / 2, m = o.t === 'mud' ? 1 : 1.5; return { half: raw + m, m: m }; }   // what the game really covers: the piece's own half-width plus its margin (gap and ledge 1.5, mud 1) on every side, ends included
  function renderInsp() {"""),
("num('slow', 'Slowdown %', 0, 95, 1, o.slow);\n    else if (STRIPS[o.t]) {","num('slow', 'Slowdown %', 0, 95, 1, o.slow) + endsF(o);\n    else if (STRIPS[o.t]) {"),
("if (o.t === 'ledge') h += num('w', 'Thickness', 0.5, 100, 0.5, o.w) + num('hgt', 'Height (any)', -500, 500, 0.5, o.hgt);","if (o.t === 'ledge') h += num('w', 'Thickness', 0.5, 100, 0.5, o.w) + num('hgt', 'Height (any)', -500, 500, 0.5, o.hgt) + endsF(o);"),
("if (o.t === 'gap') h += num('w', 'Width (across)', 1, 300, 1, o.w);","if (o.t === 'gap') h += num('w', 'Width (across)', 1, 300, 1, o.w) + endsF(o);"),
("k === 'rock' || k === 'ground' || k === 'edge') { o[k] = t.value; DEF[o.t][k] = t.value; }","k === 'rock' || k === 'ground' || k === 'edge' || k === 'ends') { o[k] = t.value; DEF[o.t][k] = t.value; }"),
("      if (o.t === 'gap') r.width = o.w;\n","      if (o.t === 'gap') r.width = o.w;\n      if (o.t === 'gap' || o.t === 'ledge' || o.t === 'mud') r.ends = endsOf(o);\n"),
("        if (r.type === 'gap') o.w = r.width || 15;\n","        if (r.type === 'gap') o.w = r.width || 15;\n        if (r.type === 'gap' || r.type === 'ledge' || r.type === 'mud') o.ends = r.ends === 'square' ? 'square' : 'round';\n"),
("W = Math.max(2, (o.t === 'mud' ? S.width + 1 : o.w) * z)","W = Math.max(2, (o.t === 'mud' ? S.width : o.w) * z)"),
("    ctx.lineJoin = 'round'; ctx.lineCap = 'butt';\n    if (selected) {",
"""    ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
    if (o.t === 'gap' || o.t === 'ledge' || o.t === 'mud') {   // the true footprint, under the piece: its margin all round, and the end shape
      var fp = stripFoot(o), fpts = pts, sq = endsOf(o) === 'square';
      if (sq && pts.length > 1) { var a0 = pts[0], a1 = pts[pts.length - 1]; fpts = [[a0[0] - Math.sin(a0[2]) * fp.m, a0[1] + Math.cos(a0[2]) * fp.m]].concat(pts, [[a1[0] + Math.sin(a1[2]) * fp.m, a1[1] - Math.cos(a1[2]) * fp.m]]); }
      ctx.save(); ctx.lineCap = sq ? 'butt' : 'round'; ctx.strokeStyle = o.t === 'gap' ? 'rgba(201,34,42,.22)' : o.t === 'ledge' ? 'rgba(122,106,88,.28)' : 'rgba(107,74,43,.28)'; ctx.lineWidth = Math.max(2, fp.half * 2 * z); strokePts(fpts); ctx.restore();
    }
    if (selected) {"""),
])
