  // ---- Lock Heading: the Caps Lock press that turns Free Look on also turns Molly, once, to face along the path she is standing on (whichever of its two ways is nearer
  // her own). It never steers her after that. It only works on her feet or in the Barrier on a path (not a wall path, not a circular deck, not in the air, not off a path),
  // and at most once a second. A turn of more than 30 degrees while she is faster than 20 Zips trips her instead: the Faceplant, and her heading stays as it was.
  var LH_COOL = 1000, LH_TRIP_DEG = 30, LH_TRIP_ZIPS = 20, lhNext = 0;
  function lockHeadingPath() {                                  // the heading of the stretch of path under her feet, or null
    if (level !== 3 || !SB) return null;
    var B = SB, sm = B.samples, ex = player.position.x - L3_X, z = player.position.z, py = player.position.y, best = null, bestDy = 3;   // the path line can sit a little under her feet (the ground eases over it), so this is loose: it only has to tell a path she is on from one passing over or under her
    sbNear(B.pathH, ex, z, B.hwMax + 6, function (pa) {           // every stretch within reach, so where two paths cross she takes the one her feet are on
      var pb = sm[pa.i + 1]; if (!pb || pb.brk || pa.wl || pb.wl || (pa.dsk && pb.dsk)) return;
      var vx = pb.x - pa.x, vz = pb.z - pa.z, vl = vx * vx + vz * vz; if (vl < 1e-9) return;
      var tt = Math.max(0, Math.min(1, ((ex - pa.x) * vx + (z - pa.z) * vz) / vl));
      var hw = ((pa.w || B.width) + ((pb.w || B.width) - (pa.w || B.width)) * tt) / 2, rl = (pa.roll || 0) + ((pb.roll || 0) - (pa.roll || 0)) * tt;
      if (Math.hypot(ex - pa.x - vx * tt, z - pa.z - vz * tt) > hw * Math.cos(rl * Math.PI / 180) + 0.5) return;
      var lat = ((ex - pa.x) * -vz + (z - pa.z) * vx) / Math.sqrt(vl), yy = pa.y + (pb.y - pa.y) * tt - Math.max(-hw, Math.min(hw, lat)) * Math.tan(rl * Math.PI / 180);
      var dy = Math.abs(py - yy); if (dy < bestDy) { bestDy = dy; best = Math.atan2(-vx, -vz); }   // forward is (-sin h, -cos h)
    });
    return best;
  }
  function lockHeadingTry() {                                   // called by input.js when a Caps Lock press turns Free Look on
    if (!playing || isComet() || fpOn || wallOn || !grounded) return;
    var now = performance.now(); if (now < lhNext) return;
    var h = lockHeadingPath(); if (h === null) return;
    lhNext = now + LH_COOL;
    var d = wrapA(h - heading); if (Math.abs(d) > Math.PI / 2) { h = wrapA(h + Math.PI); d = wrapA(h - heading); }
    if (Math.abs(d) > LH_TRIP_DEG * Math.PI / 180 && Math.abs(speed) > LH_TRIP_ZIPS * TILE) {   // too sharp a turn at speed: she trips
      if (ballOn) setBall(false, true);
      fpOn = true; fpSpeed = Math.abs(speed); fpHead = heading; shake(0.5);
      return;
    }
    heading = h;
  }
  window.__lh = function () { return [lockHeadingPath(), heading, lhNext - performance.now(), fpOn, freeLook]; };   // (tests: path heading under her, her heading, cooldown left in ms, tripped?, Free Look on?)
