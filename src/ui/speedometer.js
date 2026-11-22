  // ---- Speedometer ----
  var MAX_ZIPS = 80;
  var CX = 100, CY = 100, R = 80;
  function pt(frac, r) {
    var a = Math.PI * (1 - frac);
    return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
  }
  function arcPath(frac) {
    var s = pt(0, R), e = pt(frac, R);
    return 'M' + s[0].toFixed(2) + ' ' + s[1].toFixed(2) + ' A' + R + ' ' + R + ' 0 0 1 ' + e[0].toFixed(2) + ' ' + e[1].toFixed(2);
  }
  var trackEl = document.getElementById('track');
  var fillEl = document.getElementById('fill');
  var needleEl = document.getElementById('needle');
  var zipValEl = document.getElementById('zipval');
  trackEl.setAttribute('d', arcPath(1));
  (function buildTicks() {
    var g = document.getElementById('ticks');
    var NS = 'http://www.w3.org/2000/svg';
    for (var z = 0; z <= MAX_ZIPS; z += 5) {
      var major = z % 10 === 0;
      var f = z / MAX_ZIPS;
      var p1 = pt(f, major ? 66 : 70), p2 = pt(f, 75);
      var l = document.createElementNS(NS, 'line');
      l.setAttribute('class', 'tick' + (major ? '' : ' minor'));
      l.setAttribute('x1', p1[0]); l.setAttribute('y1', p1[1]);
      l.setAttribute('x2', p2[0]); l.setAttribute('y2', p2[1]);
      g.appendChild(l);
      if (major) {
        var lp = pt(f, 55);
        var t = document.createElementNS(NS, 'text');
        t.setAttribute('class', 'tick-label');
        t.setAttribute('x', lp[0]); t.setAttribute('y', lp[1]);
        t.textContent = String(z);
        g.appendChild(t);
      }
    }
  })();
  function setZips(zips) {
    var f = Math.max(0, Math.min(1, zips / MAX_ZIPS));
    needleEl.setAttribute('transform', 'rotate(' + (f * 180).toFixed(2) + ' ' + CX + ' ' + CY + ')');
    fillEl.setAttribute('d', f > 0.004 ? arcPath(f) : '');
    zipValEl.textContent = zips.toFixed(1);
  }
  setZips(0);
  // Dodecadash charge: a red bar just inside the ring, filling over the 6 seconds it takes to reach the full 120 Zips. It shows while the Barrier is up.
  var chTrackEl = document.getElementById('chtrack'), chFillEl = document.getElementById('chfill'), chLast = -1, chShown = false, DASH_BAR_R = 64;
  function arcPathR(frac, r) { var s0 = pt(0, r), e0 = pt(frac, r); return 'M' + s0[0].toFixed(2) + ' ' + s0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 0 1 ' + e0[0].toFixed(2) + ' ' + e0[1].toFixed(2); }
  function setCharge(f, show) {
    if (show !== chShown) { chShown = show; chTrackEl.style.display = show ? '' : 'none'; chTrackEl.setAttribute('d', show ? arcPathR(1, DASH_BAR_R) : ''); chLast = -1; }
    f = show ? Math.max(0, Math.min(1, f)) : 0;
    if (Math.abs(f - chLast) < 0.002 && !(f === 0 && chLast !== 0)) return;
    chLast = f; chFillEl.setAttribute('d', f > 0.004 ? arcPathR(f, DASH_BAR_R) : '');
  }

