  // ---- Movement details (the Rig Editor's Stats menu): the movement model written out as numbers, from whatever the stat sliders say right now. ----
  // Everything shown is in Zips and Zips/s^2 (1 Zip = TILE units a second), and uses the game's own constants, so the tables cannot drift from the rules above.
  function moveVals(c) {
    function g(k, d) { return typeof c[k] === 'number' && isFinite(c[k]) ? c[k] : d; }
    var top = Math.max(1, g('stat.top', 80)), aT = Math.max(0.5, g('stat.accelT', 7));
    return { G: Math.max(1, g('stat.grav', 20)), top: top, aT: aT, acc: top / aT, br: Math.max(0, g('stat.brake', 3)), fr: Math.max(0, g('stat.fric', 11.4)), grip: Math.max(0.5, g('stat.gripZ', 20)), wg: Math.max(0, g('stat.wallGrip', 1)), fw: g('stat.fadeWall', 1) ? 1 : 0, fs: g('stat.fadeSlope', 0) ? 1 : 0,
      flo: MIN_UP / TILE, scrub: SCRUB, maxTurn: MAX_TURN, air: AIR_GRIP, dash: DASH_MAX, climb: Math.atan(CLIMB_SLOPE) * 57.29578, launch: LAUNCH_ANGLE * 57.29578 };
  }
  function msF(v, d) { if (!isFinite(v)) return '—'; var p = Math.pow(10, d === undefined ? 1 : d), r = Math.round(v * p) / p; return (r < 0 ? '−' : '') + Math.abs(r); }
  function msS(v) { var r = Math.round(v * 10) / 10; return !isFinite(v) ? '—' : r > 0 ? '+' + r : r < 0 ? '−' + Math.abs(r) : '0'; }   // a signed rate
  function msTable(title, heads, rows, note) {
    var th = 'padding:3px 3px;text-align:right;font-size:9.5px;line-height:1.15;letter-spacing:.03em;text-transform:uppercase;opacity:.7;font-weight:600;vertical-align:bottom';
    var td = 'padding:3px 3px;border-top:1px solid #d9c7a8;text-align:right;font-family:monospace;white-space:nowrap';
    var h = '<div style="margin-top:14px;font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;border-bottom:2px solid #3a2616;padding-bottom:2px">' + title + '</div>';
    h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11.5px"><tr>' + heads.map(function (t, i) { return '<th style="' + th + (i ? '' : ';text-align:left') + '">' + t + '</th>'; }).join('') + '</tr>';
    rows.forEach(function (r) { h += '<tr>' + r.map(function (t, i) { return '<td style="' + td + (i ? '' : ';text-align:left;font-family:inherit;white-space:normal') + '">' + t + '</td>'; }).join('') + '</tr>'; });
    return h + '</table></div>' + (note ? '<div style="font-size:11px;opacity:.82;margin-top:4px;line-height:1.4">' + note + '</div>' : '');
  }
  window.__moveStatsHTML = function (c) {
    var m = moveVals(c), D = Math.PI / 180, top = m.top, G = m.G, brk = m.fr * m.br, rows, h;
    h = '<div style="background:#f6ecdd;color:#3a2616;border-radius:14px;padding:12px 14px;font-family:inherit;text-align:left;box-sizing:border-box">';
    h += '<div style="border-bottom:3px solid #3a2616;padding-bottom:4px"><b style="font-size:15px;letter-spacing:.08em">HOW SHE MOVES</b></div>';
    h += '<div style="font-size:11.5px;line-height:1.45;margin-top:6px">Her speed is measured along the surface she is on. Every moment it changes by <b>her drive + gravity along her heading − friction</b>:' +
      '<ul style="margin:4px 0 0;padding-left:16px">' +
      '<li><b>Gravity</b> is ' + msF(G) + ' Zips/s² straight down. On a slope the part that lies along the surface is ' + msF(G) + ' × sin(slope), pointing down the fall line.</li>' +
      '<li>The part of that <b>along her heading</b> speeds her up or slows her. The part <b>across her heading</b> turns her direction toward downhill (a vector sum of her velocity and the pull).</li>' +
      '<li><b>Her drive</b> (' + msF(m.acc) + ' Zips/s²) works while W is held and she is below top speed. <b>Friction</b> (' + msF(m.fr) + ') acts whenever she is not driving: coasting, braking (× ' + msF(m.br) + '), or past top speed.</li>' +
      '<li><b>Her grip</b> (' + msF(m.grip) + ' Zips/s²) is the most sideways acceleration her steering can make, so her turn radius is speed² ÷ grip.' + (m.fs ? ' On a slope it is her grip × the cosine of the slope ("Grip Fades on Slopes" is on).' : ' It is the same on any slope ("Grip Fades on Slopes" is off).') + '</li></ul></div>';
    // flat ground
    rows = [['0 to top speed (W held)', msS(m.acc), msF(m.aT) + ' s', msF(top * m.aT, 0)],
      ['Coasting, Top Speed to a Stop', msS(-m.fr), msF(top / m.fr) + ' s', msF(top * top / m.fr, 0)],
      ['Braking (S), Top Speed to a Stop', msS(-brk), msF(top / brk) + ' s', msF(top * top / brk, 0)],
      ['Dodecadash (' + m.dash + ' Zips) back down to top speed', msS(-m.fr / 2), msF(Math.max(0, m.dash - top) / (m.fr / 2)) + ' s', msF(Math.max(0, m.dash * m.dash - top * top) / (m.fr / 2), 0)]];
    h += msTable('Flat Ground, Straight Line', ['', 'Zips/s²', 'Time', 'Units'], rows, 'In the Barrier her drive and her friction are both halved.');
    // straight down and straight up a slope
    rows = [5, 10, 15, 20, 30, 45, 60].map(function (a) {
      var gs = G * Math.sin(a * D), dn = gs - m.fr, up = m.acc - gs, steep = a > m.climb;
      return [a + '°', msF(gs), dn > 0.05 ? msS(dn) : 'holds', msS(dn), steep ? '—' : up >= 0 ? msS(up) : msS(up) + ' ↓' + msF(Math.min(m.flo, top), 0), steep ? '—' : msS(-gs - m.fr)];
    });
    var aGain = Math.asin(Math.min(1, m.fr / G)) / D, aHold = Math.asin(Math.min(1, m.acc / G)) / D;
    h += msTable('Slopes: Straight Down and Straight Up', ['Slope', 'Gravity Along It', 'Down, W Held', 'Down, Coasting', 'Up, W Held', 'Up, Coasting'], rows,
      'How fast her speed changes, in Zips/s². <b>Down, W held</b> is at top speed: there her drive has stopped and friction takes its place, so only hills steeper than <b>' + msF(aGain) + '°</b> carry her past ' + msF(top, 0) + ' Zips ("holds" = she stays at top speed). Past that angle there is no upper limit: her speed builds for as long as the hill lasts. Below top speed she gains her drive + gravity. ' +
      '<b>Down, coasting:</b> a minus means she slows to a stop, and from a standstill friction holds her on anything gentler than ' + msF(aGain) + '°. ' +
      '<b>Up, W held:</b> a plus is what she still gains on the way to top speed, which she reaches on climbs up to <b>' + msF(aHold) + '°</b>. Steeper than that she loses speed down to the ' + msF(m.flo, 0) + '-Zip floor (↓' + msF(m.flo, 0) + ') and no further. ' +
      'Ground steeper than ' + msF(m.climb) + '° stops her like a wall (—), and ground that steepens by more than ' + msF(m.launch, 0) + '° at once throws her into the air.');
    // across a slope
    rows = [5, 10, 15, 20, 30, 45, 60].map(function (a) {
      var gs = G * Math.sin(a * D), ge = m.grip * (m.fs ? Math.cos(a * D) : 1), left = ge - gs;   // ge: her grip on this slope
      return [a + '°', msF(gs)].concat(m.fs ? [msF(ge)] : [], [msF(gs / ge * 100, 0) + '%', left >= 0 ? '0' : msF(-left / top / D, 0) + '°/s', left > 0.01 ? msF(2 * top * top / left, 0) : 'cannot', msF(2 * top * top / (ge + gs), 0), msS(-m.scrub * Math.min(gs, ge))]);
    });
    h += msTable('Slopes: Running Straight Across (a banked path is this too)', ['Slope', 'Pull Across Her'].concat(m.fs ? ['Her Grip There'] : [], ['Grip Used', 'Heading Drift', 'Radius Turning Uphill', 'Radius Turning Downhill', 'Speed Cost']), rows,
      'At top speed (' + msF(top, 0) + ' Zips) with the camera held still. The pull across her heading turns her toward downhill at pull ÷ speed; her steering turns her back at up to grip ÷ speed. ' +
      'While the pull is less than her grip she holds her line and has the rest of her grip left for turning uphill; the pull adds to her grip when she turns downhill. Radii are in units, pull and speed cost in Zips/s². ' +
      'Speed cost is the scrub from steering against the pull (' + msF(m.scrub * 100, 0) + '% of the angle turned); her drive covers it below top speed. ' + (m.fs ? 'Her grip fades with the slope (grip × its cosine): past <b>' + msF(Math.atan(m.grip / G) / D) + '°</b> the pull beats what is left and she cannot hold a line across the slope.' : m.grip >= G ? 'Her grip is at least gravity itself, so she can hold a line across any slope.' : 'Past <b>' + msF(Math.asin(m.grip / G) / D) + '°</b> the pull beats her grip and she cannot hold a line across the slope.'));
    // turning on flat ground
    var sp = [20, 40, 60, 80, 100, 120, top, m.dash].filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
    rows = sp.map(function (v) {
      var rate = Math.min(m.maxTurn, m.grip / Math.max(v, 0.5));
      return [msF(v, 0) + (v === top ? ' (top)' : v === m.dash ? ' (dash)' : ''), msF(rate / D, 0) + '°/s', msF(2 * v / rate, 0), msF(Math.PI / 2 / rate, 2) + ' s', msS(-v * (1 - Math.exp(-m.scrub * Math.PI / 2)))];
    });
    h += msTable('Turning on Flat Ground', ['Speed (Zips)', 'Turn Rate', 'Radius (units)', '90° turn takes', 'Zips Lost in 90°'], rows,
      'Radius = speed² ÷ grip, so double the speed makes the turn four times as wide. Turning costs ' + msF(m.scrub * 100, 0) + '% of her speed for every radian turned (' + msF((1 - Math.exp(-m.scrub * Math.PI / 2)) * 100) + '% for 90°). In the air she keeps ' + msF(m.air * 100, 0) + '% of her grip, so every radius is ' + msF(1 / m.air) + ' times wider. A drift (A or D) swings her ' + msF(typeof c['m.drift.angle'] === 'number' ? c['m.drift.angle'] : 15, 0) + '° at once on top of this.');
    // walls
    rows = [80, 81, 85, 88, 90].map(function (a) {
      var pull = G * Math.sin(a * D), gl = m.grip * m.wg * (m.fw ? Math.max(0, Math.cos(a * D)) : 1), net = pull - gl, t = net > 0.01 ? Math.sqrt(10 / net) : Infinity;
      return [a + '°', msF(pull), msF(gl), net > 0.01 ? msF(net) : 'holds', isFinite(t) ? msF(t, 2) + ' s' : 'never', isFinite(t) ? msF(top * 2 * t, 0) : '∞', isFinite(t) ? msF(m.dash * 2 * t, 0) : '∞'];
    });
    h += msTable('Wall Running (a path banked past 80°)', ['Bank', 'Pull Down the Face', 'Grip Left', 'Net Slide', 'Slides 10 Units in', 'Units Covered at Top Speed', 'Units at Dodecadash'], rows,
      (m.fw ? 'On a wall her grip is grip × Wall grip (' + msF(m.wg, 2) + ') × cos(bank), so it fades to nothing on a vertical one.' : 'On a wall her grip is grip × Wall grip (' + msF(m.wg, 2) + ') at any bank ("Wall Grip Fades With the Bank" is off), so a wall holds her wherever that is at least the pull down its face.') + ' The slide time does not depend on her speed; only the distance she covers in that time does. 10 units is the fall from the middle of a 20-wide wall to its low edge. ' +
      'Where a wall climbs or falls along its length, gravity along it is scaled by cos²(bank) (next to nothing on a steep wall), but the wall rises away from her line or drops with it, which is what makes a climbing wall short-lived and a falling one long.');
    return h + '</div>';
  };
  // One situation worked through: a slope, the way she is heading across it, her speed, and what she is doing. sc = { slope (deg), dir (deg from straight downhill, on the surface), speed (Zips), mode: 'run' | 'coast' | 'brake' }
  window.__moveScenHTML = function (c, sc) {
    var m = moveVals(c), D = Math.PI / 180, th = Math.max(0, Math.min(89, +sc.slope || 0)) * D, ph0 = Math.max(0, Math.min(180, +sc.dir || 0)) * D, v0 = Math.max(0, +sc.speed || 0), mode = sc.mode || 'run';
    var gs = m.G * Math.sin(th), along = gs * Math.cos(ph0), across = gs * Math.sin(ph0), own, ownTxt, net, rule = '', gf = m.fs ? Math.cos(th) : 1, ge = m.grip * gf;   // gf: how much of her grip this slope leaves her (all of it unless "Grip Fades on Slopes" is on)
    function step(v, pull) {                                    // one frame of the game's own speed rule, in Zips
      var dt = 1 / 60, s0 = v;
      if (mode === 'run') { v += pull * dt; if (v < m.top) v = Math.min(m.top, v + m.acc * dt); else v = Math.max(m.top, v - m.fr * dt); if (pull < 0) v = s0 >= m.flo ? Math.max(v, m.flo) : Math.max(v, s0); }
      else v = Math.max(0, v + (pull - (mode === 'brake' ? m.fr * m.br : m.fr)) * dt);
      return v;
    }
    function sim(T) {                                           // the same order as the game: speed, then gravity bends her heading, then her steering pulls it back toward the camera (which stays where it was)
      var v = v0, ph = ph0, dt = 1 / 60, n = Math.round(T * 60), k, a, d, st, mx;
      for (k = 0; k < n; k++) {
        v = step(v, gs * Math.cos(ph)); a = gs * Math.sin(ph);
        if (mode !== 'brake' && gs > 0) {
          if (v >= 4) { d = Math.atan2(a * dt, v); v = Math.hypot(v, a * dt); } else if (gs > m.fr) d = Math.max(-m.maxTurn * dt, Math.min(m.maxTurn * dt, a / Math.max(v, 4) * dt)); else d = 0;
          ph -= d;
        }
        if (mode !== 'coast' || v > 0.25) { mx = Math.min(m.maxTurn, m.grip / Math.max(v, 0.5)) * dt * gf; st = Math.max(-mx, Math.min(mx, ph0 - ph)); ph += st; v *= Math.max(0, 1 - m.scrub * Math.abs(st)); }
      }
      return [v, (ph0 - ph) / D];
    }
    if (mode === 'run') {
      if (v0 < m.top - 1e-6) {                                  // below top speed: her drive is on
        own = m.acc; ownTxt = 'her drive'; net = own + along;
        if (along < 0 && net < 0) { if (v0 > m.flo + 1e-6) rule = 'until the ' + msF(m.flo, 0) + '-Zip uphill floor'; else { net = 0; rule = v0 >= m.flo - 1e-6 ? 'held by the ' + msF(m.flo, 0) + '-Zip uphill floor' : 'below the ' + msF(m.flo, 0) + '-Zip floor she never loses ground while running'; } }
      } else if (v0 > m.top + 1e-6) {                           // past it: her drive is off and friction acts
        own = -m.fr; ownTxt = 'friction (past top speed her drive has stopped)'; net = along + own; if (net < 0) rule = 'back down to top speed';
      } else if (along > m.fr) { own = -m.fr; ownTxt = 'friction (at top speed her drive has stopped)'; net = along + own; }   // exactly at top speed
      else if (along >= 0) { own = -along; ownTxt = along > 0.05 ? 'friction, as much of it as it takes to hold top speed' : 'nothing: at top speed her drive only holds her there'; net = 0; rule = along > 0.05 ? 'friction beats this slope: she holds top speed' : 'she holds top speed'; }
      else if (along >= -m.acc) { own = -along; ownTxt = 'her drive, as much of it as it takes to hold top speed'; net = 0; rule = 'her drive covers the climb: she holds top speed'; }
      else { own = m.acc; ownTxt = 'her drive'; net = along + own; rule = 'until the ' + msF(m.flo, 0) + '-Zip uphill floor'; }
    } else {
      own = -(mode === 'brake' ? m.fr * m.br : m.fr); ownTxt = mode === 'brake' ? 'braking (friction × ' + msF(m.br) + ')' : 'friction'; net = along + own;
      if (v0 <= 1e-6 && net <= 0) { net = 0; rule = gs > m.fr && mode !== 'brake' ? (across > 0.05 ? 'gravity swings her round to face downhill, then she slides' : 'balanced exactly on the fall line: the slightest turn and gravity swings her round to slide down') : 'friction holds her still on this slope'; }
    }
    var a1 = sim(1), a3 = sim(3), left = ge - across, vv = Math.max(v0, 0.5), row = function (k, v, n) { return '<tr><td style="padding:3px 6px 3px 0;border-top:1px solid #d9c7a8;opacity:.8;vertical-align:top">' + k + '</td><td style="padding:3px 0;border-top:1px solid #d9c7a8;text-align:right;font-family:monospace;white-space:nowrap;vertical-align:top">' + v + '</td></tr>' + (n ? '<tr><td colspan="2" style="padding:0 0 4px;font-size:10.5px;opacity:.7;line-height:1.3">' + n + '</td></tr>' : ''); };
    var cf = Math.sqrt(Math.max(0, 1 - Math.pow(Math.cos(ph0) * Math.sin(th), 2))), h = '';
    // the picture: the slope seen square-on, downhill toward the bottom of the page
    var cx = 80, cy = 78, hl = 18 + 42 * Math.min(1, v0 / Math.max(m.top, 1)), gl = 60 * Math.min(1, gs / m.G), hx = Math.sin(ph0), hy = Math.cos(ph0), ax = along / Math.max(m.G, 1e-6) * 60, px = across / Math.max(m.G, 1e-6) * 60;
    function arrow(x1, y1, x2, y2, col, w, dash) {
      var L = Math.hypot(x2 - x1, y2 - y1); if (L < 1.5) return '';
      var ux = (x2 - x1) / L, uy = (y2 - y1) / L, s = Math.min(6, L * 0.6);
      return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + col + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="3 2"' : '') + ' stroke-linecap="round"/>' +
        '<path d="M' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' L' + (x2 - ux * s - uy * s * 0.5).toFixed(1) + ' ' + (y2 - uy * s + ux * s * 0.5).toFixed(1) + ' L' + (x2 - ux * s + uy * s * 0.5).toFixed(1) + ' ' + (y2 - uy * s - ux * s * 0.5).toFixed(1) + ' Z" fill="' + col + '"/>';
    }
    var svg = '<svg viewBox="0 0 160 160" width="150" height="150" role="img" aria-label="The slope seen from above: her heading, the pull of gravity along the surface, and its two parts" style="flex:none;background:#ecdcc3;border-radius:8px">' +
      '<text x="80" y="11" text-anchor="middle" font-size="8" fill="#3a2616" opacity=".6">UPHILL</text><text x="80" y="156" text-anchor="middle" font-size="8" fill="#3a2616" opacity=".6">DOWNHILL</text>' +
      [30, 54, 78, 102, 126].map(function (y) { return '<line x1="14" y1="' + y + '" x2="146" y2="' + y + '" stroke="#3a2616" stroke-opacity=".12"/>'; }).join('') +
      arrow(cx, cy, cx + hx * ax, cy + hy * ax, '#1f6f8b', 2, true) + arrow(cx + hx * ax, cy + hy * ax, cx, cy + gl, '#8a6d00', 2, true) +
      arrow(cx, cy, cx, cy + gl, '#c0392b', 2.5) + arrow(cx, cy, cx + hx * hl, cy + hy * hl, '#3a2616', 3) + '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#3a2616"/></svg>';
    var key = '<div style="font-size:10.5px;line-height:1.5"><div><b style="color:#3a2616">━</b> her heading</div><div><b style="color:#c0392b">━</b> gravity along the surface</div><div><b style="color:#1f6f8b">┅</b> its part along her heading</div><div><b style="color:#8a6d00">┅</b> its part across her heading</div></div>';
    h += '<div style="background:#f6ecdd;color:#3a2616;border-radius:14px;padding:12px 14px;font-family:inherit;text-align:left;box-sizing:border-box;margin-top:8px">';
    h += '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' + svg + key + '</div>';
    h += '<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:12px">';
    h += row('Gravity Along the Surface', msF(gs) + ' Zips/s²', msF(m.G) + ' × sin(' + msF(th / D) + '°), down the fall line');
    h += row('Its Part Along Her Heading', msS(along) + ' Zips/s²', along > 0.05 ? 'speeds her up' : along < -0.05 ? 'slows her' : 'none: she is running level across the slope');
    h += row('Its Part Across Her Heading', msF(across) + ' Zips/s²', across > 0.05 ? 'turns her toward downhill at ' + msF(across / vv / D, 0) + '°/s unless her steering holds it' : 'none: she is on the fall line');
    if (m.fs) h += row('Her Grip on This Slope', msF(ge) + ' Zips/s²', msF(m.grip) + ' × cos(' + msF(th / D) + '°): "Grip fades on slopes" is on');
    h += row('Her Own Part', msS(own) + ' Zips/s²', ownTxt);
    h += row('<b>Speed change</b>', '<b>' + msS(net) + ' Zips/s²</b>', rule);
    h += row('Speed After 1 s / 3 s', msF(a1[0]) + ' / ' + msF(a3[0]) + ' Zips', 'camera held still');
    h += row('Heading After 1 s / 3 s', Math.abs(a3[1]) < 0.05 ? 'unchanged' : msF(a1[1]) + '° / ' + msF(a3[1]) + '° downhill', mode === 'brake' ? 'while braking the slope does not turn her' : across < 0.05 ? 'nothing pulls her off her line' : left >= 0 ? 'she holds her line, using ' + msF(across / ge * 100, 0) + '% of her grip' : 'the pull beats her grip by ' + msF(-left) + ' Zips/s², so she cannot hold her line');
    h += row('Turn Radius, Toward Uphill', left > 0.01 && v0 > 0 ? msF(2 * v0 * v0 / left, 0) + ' units' : v0 > 0 ? 'cannot' : '—', 'speed² ÷ (grip − the pull across her)');
    h += row('Turn Radius, Toward Downhill', v0 > 0 ? msF(2 * v0 * v0 / (ge + across), 0) + ' units' : '—', 'speed² ÷ (grip + the pull across her)');
    h += row('Ground Covered on the Map', msF(v0 * cf) + ' Zips', 'her ' + msF(v0) + ' Zips along the surface, seen from above; she ' + (Math.cos(ph0) > 0.001 ? 'drops' : Math.cos(ph0) < -0.001 ? 'climbs' : 'neither climbs nor drops') + (Math.abs(Math.cos(ph0)) > 0.001 ? ' at ' + msF(Math.abs(v0 * Math.cos(ph0) * Math.sin(th))) + ' Zips' : ''));
    return h + '</table></div>';
  };
  window.__makeBarrier = function (c, parent) {                  // the dodecahedron, its smooth fast form with dashed rings, and its glow, built into parent (the game and the Rig Editor's preview share this)
    var R = c['barrier.radius'], roll = new THREE.Group(); parent.add(roll);
    var geo = new THREE.DodecahedronGeometry(R, 0);
    var mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: c['barrier.cBody'], emissive: c['barrier.cEmis'], specular: 0x000000, shininess: 0, flatShading: true }));   // no shine: nothing white glints off it
    mesh.castShadow = true; roll.add(mesh);
    var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: c['barrier.cEdge'] })); roll.add(edges);
    // From 40 Zips the dodecahedron becomes a smooth sphere wrapped in dashed lines (rings round the spin axis and two great circles), which blur round as it rolls.
    var fast = new THREE.Group(); fast.visible = false; roll.add(fast);
    fast.add(new THREE.Mesh(new THREE.SphereGeometry(R, 24, 16), new THREE.MeshPhongMaterial({ color: c['barrier.cBody'], emissive: c['barrier.cEmis'], specular: 0x000000, shininess: 0 })));
    var dm = new THREE.LineDashedMaterial({ color: c['barrier.cDash'], dashSize: c['barrier.dashLen'], gapSize: c['barrier.dashGap'] });
    function ring(rad, fn) {
      var pts = []; for (var i = 0; i <= 64; i++) { var a = i / 64 * Math.PI * 2; pts.push(fn(rad, a)); }
      var l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), dm); l.computeLineDistances(); fast.add(l);
    }
    for (var xo = -0.545; xo <= 0.546; xo += 0.545) { (function (xo) { var rr = Math.sqrt(R * R - xo * xo * R * R) * 1.015; ring(rr, function (r, a) { return new THREE.Vector3(xo * R, Math.cos(a) * r, Math.sin(a) * r); }); })(xo); }
    ring(R * 1.015, function (r, a) { return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0); });
    ring(R * 1.015, function (r, a) { return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r); });
    var halo = new THREE.Mesh(new THREE.DodecahedronGeometry(R * c['barrier.glowSize'], 0),
      new THREE.MeshBasicMaterial({ color: c['barrier.cGlow'], transparent: true, opacity: c['barrier.glow'], blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide }));
    parent.add(halo);
    return { roll: roll, mesh: mesh, edges: edges, fast: fast, halo: halo };
  };
  var ballGroup = new THREE.Group(); ballGroup.visible = false; ballGroup.position.y = 1.64; player.add(ballGroup);
  var ballRoll, ballMesh, ballEdges, ballFast;
  function barrierBuild() {
    while (ballGroup.children.length) { var ch = ballGroup.children[0]; ballGroup.remove(ch); ch.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }
    BALL_R = RIGCFG['barrier.radius']; ballGroup.position.y = RIGCFG['barrier.height'];
    var bo = window.__makeBarrier(RIGCFG, ballGroup); ballRoll = bo.roll; ballMesh = bo.mesh; ballEdges = bo.edges; ballFast = bo.fast;
  }
  rigRead(); barrierBuild();
  var fpOn = false, fpSpeed = 0, fpHead = 0, fpBlend = 0, FP_MIN = 60, FP_DECEL = 25;   // face-plant: leaving the Barrier at 60 Zips or more, she skids to a stop at 25 Zips a second, helpless until she does
  var ballIsSphere = false, dashNow = false, dashHold = 0, DASH_RATE = 20, DASH_MAX = 120;
  ballGroup.add(new THREE.Mesh(new THREE.DodecahedronGeometry(BALL_R * 1.14, 0),
    new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide })));
  // ---- Molly's model: a low-poly rigged runner (a .glb embedded in the page) whose clips are driven by what she is doing. ----
  var MOLLY_YAW = Math.PI, mollyOn = false, mollyMix = null, mollyAct = {}, mollyW = {}, mollyT = {}, mollyRunPh = 0, mollyPrevGround = true, mollyMesh = null, mollyV0 = 0;
  var MOLLY_CLIPS = ['Idle', 'Run_Slow', 'Run_Mid', 'Run_Fast', 'Jump', 'Slide', 'Faceplant', 'RunnersPose', 'Drift_L', 'Drift_R'];
  var mollyRoot = null;
  function mollyLoad(buf, onFail, onOk) {                       // build (or rebuild) her from a .glb: the embedded one, or one saved from the Rig Editor
    if (!THREE.GLTFLoader) return;
    try {
      new THREE.GLTFLoader().parse(buf, '', function (g) {
        var root = new THREE.Group(), model = g.scene, bb = new THREE.Box3().setFromObject(model), scl = 1;
        model.traverse(function (o) { var ud = o.userData; if (ud && typeof ud.scale === 'number' && ud.scale > 0 && isFinite(ud.scale)) scl = Math.max(0.05, Math.min(20, ud.scale)); });   // the Overall scale she was saved with (a model from before v174 carries none: 1)
        var sc = 3.6 * scl / (bb.max.y - bb.min.y);               // every model stands 3.6 units tall, times its Overall scale
        // a model with no size, with broken points or with no run cycle would leave her invisible (and stop the game's animation): it is turned away and whatever she was before stays
        var run = THREE.AnimationClip.findByName(g.animations, 'Run_Mid'), sound = sc > 0 && isFinite(sc) && isFinite(bb.min.x + bb.max.x + bb.min.z + bb.max.z) && !!run && run.duration > 0;
        if (sound) model.traverse(function (o) { if (o.isMesh && o.geometry.attributes.position) { var pa = o.geometry.attributes.position.array; for (var pi = 0; pi < pa.length; pi++) if (pa[pi] !== pa[pi]) { sound = false; break; } } });
        if (!sound) { console.warn('Molly model turned away: no size, broken points or no run cycle'); if (onFail) onFail(); return; }
        if (mollyRoot) { body.remove(mollyRoot); mollyRoot.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }
        mollyAct = {}; mollyW = {}; mollyT = {}; mollyMesh = null; mollyOn = false;
        model.scale.setScalar(sc); model.rotation.y = MOLLY_YAW; model.position.y = -bb.min.y * sc; root.add(model);
        model.traverse(function (o) { if (o.isMesh) { o.frustumCulled = false; o.castShadow = true; mollyMesh = o; o.material.roughness = 1; o.material.metalness = 0; } });
        mollyMix = new THREE.AnimationMixer(model);
        MOLLY_CLIPS.forEach(function (n) {
          var c = THREE.AnimationClip.findByName(g.animations, n); if (!c) return;
          var a = mollyMix.clipAction(c); a.play(); a.timeScale = 0; a.setEffectiveWeight(0); mollyAct[n] = a; mollyW[n] = 0; mollyT[n] = 0;
        });
        cometRest = {}; cometRestPos = null; model.traverse(function (o) { if (o.isBone) { cometRest[o.name] = o.quaternion.clone(); if (o.name === 'Hips') cometRestPos = o.position.clone(); } });   // the bones' rest pose, for Fly's arms
        mollyDriftRun = false; model.traverse(function (o) { if (o.userData && o.userData.driftRun) mollyDriftRun = true; });   // a model saved from v179's Rig Editor carries drift clips made from her run (older ones carry a held pose, which the game does not use)
        mollyHoldF = {};                                          // a model saved from the Rig Editor carries where its slide and face-plant are held; the built-in one uses the built-in settings
        model.traverse(function (o) { var ud = o.userData; if (ud && typeof ud.slideHold === 'number' && ud.slideHold > 0 && ud.slideHold <= 1) mollyHoldF.Slide = ud.slideHold; if (ud && typeof ud.fallHold === 'number' && ud.fallHold > 0 && ud.fallHold <= 1) mollyHoldF.Faceplant = ud.fallHold; });
        mollyRoot = root; body.add(root); mollyOn = true; glowMats = null;
        mollyScale = scl; applyStats(); refreshStatCards();        // her collision box follows the model's scale
        if (onOk) onOk();
      }, function (e) { console.warn('Molly model failed', e); if (onFail) onFail(); });
    } catch (e) { console.warn('Molly model failed', e); if (onFail) onFail(); }
  }
  function b64ToBuf(t) { var bin = atob(t.trim()), u8 = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return u8.buffer; }
  // A model saved from the Rig Editor is kept in this browser's IndexedDB (database 'polyrunner', store 'kv', key 'mollyGlb'; 'polyrun' until v194) as its raw bytes. Up to v173 it was kept as text in
  // localStorage, where it took a fifth or more of the 5 MB that the Path Editor's layouts and the stats share, and a big build did not fit at all. A model found there is moved
  // across the first time and then removed. Only where IndexedDB cannot be used at all (some private windows) is localStorage still used.
  var mollyDB = null, mollySavedBytes = 0;                      // mollySavedBytes: the size of the saved model this browser holds (0: none)
  function mollyDbOpen(cb) {
    if (mollyDB) { cb(mollyDB); return; }
    var req, done = false, fin = function (db) { if (done) return; done = true; mollyDB = db; cb(db); };
    try { req = window.indexedDB.open('polyrunner', 1); } catch (e) { fin(null); return; }
    req.onupgradeneeded = function () { try { req.result.createObjectStore('kv'); } catch (e) {} };
    req.onsuccess = function () { fin(req.result); }; req.onerror = function () { fin(null); }; req.onblocked = function () { fin(null); };
    setTimeout(function () { fin(null); }, 4000);                // a browser that never answers must not leave her without a model
  }
  function mollyStoreLS(buf) {                                  // the old way, for a browser with no IndexedDB
    try {
      var u = new Uint8Array(buf), t = '';
      for (var i = 0; i < u.length; i += 0x8000) t += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      localStorage.setItem('mollyGlb', btoa(t)); return true;
    } catch (e) { return false; }
  }
  function glbKey(ch) { return (ch || CHAR) === 'comet' ? 'cometGlb' : 'mollyGlb'; }
  function mollyStore(buf, done, ch) {                              // keep a saved model in this browser; done(true) once it is safely there, done(false) if it could not be kept
    var once = false, fin = function (ok) { if (once) return; once = true; if (ok) mollySavedBytes = buf.byteLength; if (done) done(ok); };
    mollyDbOpen(function (db) {
      if (!db) { fin(glbKey(ch) === 'mollyGlb' ? mollyStoreLS(buf) : false); return; }
      try {
        var tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(buf, glbKey(ch));
        tx.oncomplete = function () { try { if (glbKey(ch) === 'mollyGlb') localStorage.removeItem('mollyGlb'); } catch (e) {} fin(true); };
        tx.onerror = function () { fin(false); }; tx.onabort = function () { fin(false); };
      } catch (e) { fin(false); }
    });
  }
  function mollyFetch(cb, ch) {                                     // the saved model's bytes, or null
    mollyDbOpen(function (db) {
      if (!db) { cb(null); return; }
      try { var rq = db.transaction('kv', 'readonly').objectStore('kv').get(glbKey(ch)); rq.onsuccess = function () { cb(rq.result && rq.result.byteLength ? rq.result : null); }; rq.onerror = function () { cb(null); }; }
      catch (e) { cb(null); }
    });
  }
  function loadCharModel() {                                    // the model of whoever she is playing as: her saved one, else the built-in Molly (Comet's too, until one is saved for her)
    var dflt = function () { mollySavedBytes = 0; mollyLoad(b64ToBuf(document.getElementById('molly-glb').textContent)); };
    if (isComet()) { var cg = document.getElementById('comet-glb'), cdf = cg ? function () { mollySavedBytes = 0; mollyLoad(b64ToBuf(cg.textContent), dflt); } : dflt; mollyFetch(function (buf) { if (buf) { mollySavedBytes = buf.byteLength; mollyLoad(buf, cdf); } else cdf(); }, 'comet'); return; }   // her own built-in model, until one is saved for her
    var old = null, oldBuf = null; try { old = localStorage.getItem('mollyGlb'); if (old) oldBuf = b64ToBuf(old); } catch (e) { oldBuf = null; }
    if (oldBuf) {                                                // a model saved by a build up to v173 (it can only be newer than anything in the database: the copy here is removed as soon as it has been moved)
      mollySavedBytes = oldBuf.byteLength; mollyLoad(oldBuf, dflt);
      mollyDbOpen(function (db) { if (db) mollyStore(oldBuf); });   // (with no database it simply stays where it is)
      return;
    }
    mollyFetch(function (buf) { if (buf) { mollySavedBytes = buf.byteLength; mollyLoad(buf, dflt); } else dflt(); }, 'molly');
  }
  loadCharModel();
  function setChar(ch) {                                         // the Characters page's Play as buttons
    if (ch !== 'comet') ch = 'molly'; if (ch === CHAR) { refreshStatCards(); return; }
    CHAR = ch; try { localStorage.setItem('pr_char', ch); } catch (e) {}
    if (ballOn) setBall(false, true); if (typeof setHover === 'function') setHover(false, true);
    rigRead(); if (typeof barrierBuild === 'function') barrierBuild(); loadCharModel(); refreshStatCards();
  }
