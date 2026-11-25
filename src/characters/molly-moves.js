  var TILT_DEAD = 0.07, vmoveS = 0;                             // TILT_DEAD (about 4 degrees): slopes and banks gentler than this do not tilt her at all, and the tilt grows in smoothly over the next 4 degrees; vmoveS: her rise or fall rate, smoothed
  function tiltSoft(a) { var m = Math.abs(a); return m <= TILT_DEAD ? 0 : a * smooth01((m - TILT_DEAD) / TILT_DEAD); }
  var pitchLean = 0, pitchPrevY = 0, grounded = true, vy = 0, jumpBuf = 0, spaceDown = false;   // jumpBuf: a jump pressed just before landing still counts

  // ---- Strafe: an instant sidestep of one tile, to her right (+1) or left (-1) of the way she is heading ----
  // Her direction and speed are untouched. She only slides as far as the way is clear: a trunk, a wall or a ledge face
  // too steep to walk up stops the slide short, and a drop at the far end leaves her in the air.
  function strafe(dir) {
    if (!playing || !grounded || ballOn) return;                 // no sidestep inside the Barrier
    var rx = Math.cos(heading) * dir, rz = -Math.sin(heading) * dir, pp = player.position, sx = pp.x, sy = pp.y, sz = pp.z;
    var moved = sideMove(rx, rz, STRAFE_DIST);
    if (moved > 0.05) flashStreaks(sx, sy, sz, rx, rz, moved);
  }
  function sideMove(rx, rz, dist) {                              // moves her up to dist along (rx, rz) in small steps, stopping where the way is blocked; returns how far she went
    var pp = player.position, sub = 0.25, left = dist, sx = pp.x, sz = pp.z;
    while (left > 1e-4) {
      var st = Math.min(sub, left), ox = pp.x, oz = pp.z; left -= st;
      pp.x += rx * st; pp.z += rz * st;
      var g = groundH(pp.x, pp.z);
      if (collide() || g > pp.y + CLIMB_SLOPE * st + 0.03) { pp.x = ox; pp.z = oz; break; }
      if (pp.y - g > DROP_SLOPE * st + 0.05) { grounded = false; vy = 0; break; }
      pp.y = g;
    }
    return Math.sqrt((pp.x - sx) * (pp.x - sx) + (pp.z - sz) * (pp.z - sz));
  }
  // ---- Sidestep: while the left (or right) mouse button is held she walks to her left (right), relative to the way she is heading, at SIDESTEP_SPEED ----
  // Same checks as the Strafe. sideNow is -1 / 1 while she is actually stepping (updateMolly shows the Sidestep clip only while she is not running forward).
  var sideKeys = { l: false, r: false }, sideNow = 0;
  function sidestepTick(sdt) {
    var dir = (sideKeys.r ? 1 : 0) - (sideKeys.l ? 1 : 0); sideNow = 0;
    if (!dir || !playing || !grounded || ballOn || fpOn || sdt <= 0) return;
    if (sideMove(Math.cos(heading) * dir, -Math.sin(heading) * dir, SIDESTEP_SPEED * sdt) > 1e-3) sideNow = dir;
  }

