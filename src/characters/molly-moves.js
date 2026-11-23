  var TILT_DEAD = 0.07, vmoveS = 0;                             // TILT_DEAD (about 4 degrees): slopes and banks gentler than this do not tilt her at all, and the tilt grows in smoothly over the next 4 degrees; vmoveS: her rise or fall rate, smoothed
  function tiltSoft(a) { var m = Math.abs(a); return m <= TILT_DEAD ? 0 : a * smooth01((m - TILT_DEAD) / TILT_DEAD); }
  var pitchLean = 0, pitchPrevY = 0, grounded = true, vy = 0, jumpBuf = 0, spaceDown = false;   // jumpBuf: a jump pressed just before landing still counts

  // ---- Strafe: an instant sidestep of one tile, to her right (+1) or left (-1) of the way she is heading ----
  // Her direction and speed are untouched. She only slides as far as the way is clear: a trunk, a wall or a ledge face
  // too steep to walk up stops the slide short, and a drop at the far end leaves her in the air.
  function strafe(dir) {
    if (!playing || !grounded || ballOn) return;                 // no sidestep inside the Barrier
    var rx = Math.cos(heading) * dir, rz = -Math.sin(heading) * dir;
    var pp = player.position, sub = 0.25, n = Math.round(STRAFE_DIST / sub);
    var sx = pp.x, sy = pp.y, sz = pp.z;
    for (var i = 0; i < n; i++) {
      var ox = pp.x, oz = pp.z;
      pp.x += rx * sub; pp.z += rz * sub;
      var g = groundH(pp.x, pp.z);
      if (collide() || g > pp.y + CLIMB_SLOPE * sub + 0.03) { pp.x = ox; pp.z = oz; break; }
      if (pp.y - g > DROP_SLOPE * sub + 0.05) { grounded = false; vy = 0; break; }
      pp.y = g;
    }
    var moved = Math.sqrt((pp.x - sx) * (pp.x - sx) + (pp.z - sz) * (pp.z - sz));
    if (moved > 0.05) flashStreaks(sx, sy, sz, rx, rz, moved);
  }

