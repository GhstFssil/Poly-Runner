  // ---- Sizing ----
  function resize() {
    var w = stage.clientWidth || 1, h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- Clock: five minutes, then the level starts over ----
  var TIME_LIMIT = 300, timeLeft = TIME_LIMIT, shownSec = -1, toastUntil = 0;
  function showTime() {
    if (level === 3 && !(SB && SB.timeLimit > 0)) { if (shownSec !== -7) { shownSec = -7; timeValEl.textContent = '\u221e'; timerEl.classList.remove('low'); } return; }
    var sec = Math.max(0, Math.ceil(timeLeft));
    if (sec === shownSec) return;
    shownSec = sec;
    timeValEl.textContent = Math.floor(sec / 60) + ':' + (sec % 60 < 10 ? '0' : '') + (sec % 60);
    timerEl.classList.toggle('low', sec <= 30);
  }
  function resetLevel() {
    spawnAt(spawn.x, spawn.z, spawn.cp, spawn.cp ? "Time's up. Back to checkpoint " + spawn.cp + "!" : "Time's up. Back to the start!", spawn.yaw);
  }
  showTime();

  // ---- Loop ----
  var last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now; curNow = now;

    // Speed climbs linearly while W is held and falls linearly at the same rate when released.
    // Holding S (without W) brakes twice as fast. Everything pauses with the game.
    var sdt = playing ? dt : 0;
    window.__gt = (window.__gt || 0) + sdt;                       // test hook: game seconds played
    if (playing) {
      if (level !== 3 || (SB && SB.timeLimit > 0)) timeLeft -= dt;
      if (timeLeft <= 0) resetLevel();
      showTime();
    }
    if (!toastEl.hidden && now > toastUntil) toastEl.hidden = true;
    updateConfetti(dt); updateSpawnFx(dt); updateToxic(dt, now);
    waterTex.offset.x = (waterTex.offset.x + dt * 0.012) % 1; waterTex.offset.y = (waterTex.offset.y + dt * 0.006) % 1;
    if (!hintEl.hidden && (now > hintUntil || !playing)) hintEl.hidden = true;
    if (!hintEl.hidden && hintTyped < hintFull.length) { hintTyped = Math.min(hintFull.length, hintTyped + dt * HINT_CPS); hintEl.textContent = hintFull.slice(0, Math.floor(hintTyped)); }
    // Slopes: on the ground, the slope pushes her along its fall line. pull is that push along her heading (+ downhill).
    if (fpOn) { keys.w = keys.s = keys.a = keys.d = false; jumpBuf = 0; }      // helpless while she skids
    var acc = ballOn ? ACCEL * 0.5 : ACCEL;                  // rolling in the barrier: half the acceleration and deceleration
    var pull = 0, sliding = false, perpD = 0, sl = 0, cfac = 1;
    plOn = false; sbWallEnter(now);
    if (playing && grounded && !wallOn) {
      slopeAt(player.position.x, player.position.z);
      if (slA > 0 && lowPoint(player.position.x, player.position.z)) slA = 0;   // the very bottom of a cone or bowl counts as flat: nowhere within 1.2 is lower, so no pull
      if (slA > 0) {
        sl = slDx * -Math.sin(heading) + slDz * -Math.cos(heading);
        perpD = slDx * -Math.cos(heading) + slDz * Math.sin(heading);
        if (slDeg > 0.5) { plOn = true; plTh = Math.min(slDeg, 80) * Math.PI / 180; plHu = Math.atan2(-slDx, -slDz); var pa0 = toPl(wrapA(heading - plHu)); sl = Math.cos(pa0); perpD = -Math.sin(pa0); }   // measured along the surface
        pull = slA * sl;
        sliding = !keys.w && !keys.s && slA > FRIC * (ballOn ? 0.5 : 1);   // only where gravity beats friction
      }
    }
    // Dodecadash: standing still in the Barrier, hold S and it spins up in place. Let go and she shoots off at 20 Zips for every second held (120 at most).
    // Holding costs 4 power a second instead of 1.
    dashNow = playing && ballOn && grounded && speed < 0.5 && keys.s && !keys.w;
    if (dashNow) dashHold += sdt;
    else {
      if (dashHold >= 0.25 && playing && ballOn && grounded && !keys.w && !keys.s) speed = Math.min(DASH_MAX, DASH_RATE * dashHold) * TILE;
      dashHold = 0;
    }
    cometInput(sdt);
    if (isComet()) setCharge(starCharging ? starT / Math.max(0.01, Math.round(cometC('star.cMax')) || 0.01) : 0, starCharging && playing);
    else setCharge(dashNow ? dashHold * DASH_RATE / DASH_MAX : 0, ballOn && playing);
    if (ballOn && playing) { setPower(segCount - (dashNow ? BARRIER_DRAIN * 4 : BARRIER_DRAIN) * sdt); if (segCount <= 0) setBall(false); }   // the Barrier eats 1% of the Power Line each second and drops when it runs dry
    // Runner's Pose: hold S while standing still and she crouches, for as long as she likes. After 3 seconds she flashes a soft red
    // to say she is ready; the moment S is let go she takes off at 50 Zips. Letting go before the flash does nothing.
    var rpOn = playing && grounded && !ballOn && speed < 0.5 && keys.s && !keys.w;
    if (rpOn) { rpHold += sdt; if (rpHold >= RP_TIME) { if (!rpReady) { rpReady = true; rpFlash = 0; } rpFlash += sdt; } }
    else {
      if (rpReady && playing && grounded && !ballOn && !keys.w && !keys.s) speed = RP_SPEED;
      rpHold = 0; rpReady = false; rpFlash = 0;
    }
    var glow = rpReady && rpFlash < RP_FLASH_T ? 0.55 * Math.max(0, Math.sin(rpFlash / RP_FLASH_T * Math.PI * 4)) : 0;   // two soft pulses
    if (glow !== rpGlowNow) { rpGlowNow = glow; setGlow(glow); }
    // The mud ramp: slower than 30 Zips on it and she cannot grip. She is dragged to a stop, turned round and slid back down.
    var mudStall = playing && grounded && !hovOn && slA > 0 && slDeg > 8 && speed < MIN_UP - 0.5 && sl < 0.5 && mudAt(player.position.x, player.position.z);
    if (mudStall) sliding = true;
    mudWas = mudStall;
    // Speed along her heading: her drive + gravity along the surface - friction. Her drive only works up to her top speed; whenever she is not driving
    // (coasting, braking, or already past her top speed) friction acts instead. Two rules sit on top: running uphill never drops her below 30 Zips, and the mud ramp.
    var fricN = FRIC * (ballOn ? 0.5 : 1);                   // half in the Barrier, like its acceleration
    if (keys.w && !mudStall) {
      var s0 = speed;
      speed += pull * sdt;                                   // gravity along the surface, up or down
      if (speed < RUN_SPEED) speed = Math.min(RUN_SPEED, speed + acc * sdt);   // her drive, up to her top speed
      else speed = Math.max(RUN_SPEED, speed - fricN * sdt);  // past it she is not driving: friction acts, but cannot take her below what she can hold
      if (pull < 0) speed = s0 >= MIN_UP ? Math.max(speed, MIN_UP) : Math.max(speed, s0);   // the 30-Zip uphill floor (below it she never loses ground while running)
    } else {
      var fric = keys.s ? fricN * BRAKE_MULT : fricN;
      if (ballOn && playing && !grounded && keys.s) fric = 0;   // S in the air drives the Barrier down, it does not brake it
      if (mudStall) fric = sl < 0 ? fricN * BRAKE_MULT : 0;     // the mud grabs her going up; once she faces down it lets her slide
      speed = Math.max(0, speed + (pull - fric) * sdt);
    }
    if (grounded && slA > 0 && !keys.s && playing && !fpOn) {   // the fall line drags her heading round toward downhill, whether she runs or stands. Running across a slope (along a banked path, say) the pull is stronger still, so it takes real steering to hold a line and from about 55 degrees it cannot be held
      var aP = perpD * slA;   // the part of the slope's pull across her heading (units/s^2): a pure vector sum, no multipliers
      var dpsi;
      if (speed >= 8) { var vP = aP * sdt; dpsi = Math.atan2(vP, speed); speed = Math.hypot(speed, vP); }   // a true vector sum: her velocity plus the pull, so her direction turns and her speed follows from the new velocity
      else if (slA > fricN || mudStall) dpsi = Math.max(-MAX_TURN * sdt, Math.min(MAX_TURN * sdt, aP / Math.max(speed, 8) * sdt));   // at a crawl or standing a true sum would swing her round at once
      else dpsi = 0;                                           // standing on a slope friction can hold: it does not turn her
      if (plOn) heading = plHu + fromPl(toPl(wrapA(heading - plHu)) + dpsi); else heading += dpsi;
    }

    if (fpOn) {                                              // sliding along on her face: slowed at 25 Zips a second, no steering, until she stops
      fpSpeed = Math.max(0, fpSpeed - FP_DECEL * TILE * sdt); speed = Math.min(speed, fpSpeed); heading = fpHead;
      if (fpSpeed <= 0.01 && speed <= 0.01) { fpOn = false; speed = 0; }
    }
    // Steering. Her direction of travel is her own; the camera only says where she wants to go. While she runs or brakes
    // her feet can swing that direction toward the camera at GRIP / speed rad/s, so the faster she goes the wider the arc.
    // With no key down she coasts in a straight line. Turning bleeds a little speed.
    var turnStep = 0, driftNow = 0;
    if (fpOn) heading = fpHead;
    if (mudStall) {                                          // spun round to face downhill
      var tg = Math.atan2(-slDx, -slDz), dg = Math.atan2(Math.sin(tg - heading), Math.cos(tg - heading));
      heading += Math.max(-6 * sdt, Math.min(6 * sdt, dg));
    }
    {                                                        // Drift: A or D at 30 Zips or more swings her momentum (and the camera with it) 15 degrees that way, quickly. It lasts while the key is held, and after it is let go it cannot start again for 1 second
      var dSide = keys.a && !keys.d ? 1 : keys.d && !keys.a ? -1 : 0, dOk = playing && grounded && !ballOn && !sliding && !fpOn && !mudStall && speed >= RIGCFG['m.drift.minZips'] * 2;
      if (driftHeld && (!dOk || dSide !== driftSide)) { driftHeld = false; driftKick = 0; driftCool = RIGCFG['m.drift.cool']; }
      else if (!driftHeld) { driftCool = Math.max(0, driftCool - sdt); if (dSide && dOk && driftCool <= 0) { driftHeld = true; driftSide = dSide; driftKick = RIGCFG['m.drift.angle'] * Math.PI / 180; } }
      if (driftHeld && driftKick > 0) { var kst = Math.min(driftKick, RIGCFG['m.drift.angle'] * Math.PI / 180 / Math.max(0.02, RIGCFG['m.drift.time']) * sdt); heading += driftSide * kst; yaw += driftSide * kst; driftKick -= kst; }
      if (driftHeld) driftNow = driftSide;
    }
    if (playing && !mudStall && (keys.w || keys.s || speed > 0.5)) {   // she follows the camera whenever she is moving, key or no key
      var maxStep = Math.min(MAX_TURN, GRIP * (driftHeld ? DRIFT_GRIP : 1) / Math.max(speed, 1)) * sdt * (grounded ? 1 : AIR_GRIP) * (wallOn ? WALL_GRIP * (WALL_FADE ? Math.max(0, Math.cos(wallR)) : 1) : SLOPE_FADE && grounded ? Math.cos(Math.min(slDeg, 89) * Math.PI / 180) : 1);   // on a wall, and (if that stat is on) on a slope, her grip fades with the cosine of the angle
      if (plOn && grounded) {                                // on a slope the turn is made along the surface, exactly as it would be on flat ground
        var phA = toPl(wrapA(heading - plHu)), pyA = toPl(wrapA(yaw - plHu)), stP = Math.max(-maxStep, Math.min(maxStep, wrapA(pyA - phA)));
        var nhA = plHu + fromPl(phA + stP); turnStep = wrapA(nhA - heading); heading = nhA;
        speed *= Math.max(0, 1 - SCRUB * Math.abs(stP));
      } else {
        var want = Math.atan2(Math.sin(yaw - heading), Math.cos(yaw - heading));
        turnStep = Math.max(-maxStep, Math.min(maxStep, want));
        heading += turnStep;
        speed *= Math.max(0, 1 - SCRUB * Math.abs(turnStep));
      }
    }

    if (plOn && grounded) { var pa1 = toPl(wrapA(heading - plHu)), cp1 = Math.cos(pa1), st1 = Math.sin(plTh); cfac = Math.sqrt(Math.max(0.0025, 1 - cp1 * cp1 * st1 * st1)); }   // how much of each unit along the surface is ground covered (flat view)
    if (wallOn) sbWallMove(sdt, now);
    var segX0 = player.position.x, segZ0 = player.position.z;
    // Jump: leave the ground at the speed that carries her exactly JUMP_H up. A press just before landing is remembered.
    jumpBuf = Math.max(0, jumpBuf - sdt);
    if (jumpBuf > 0 && grounded && playing && !wallOn) {
      vy = (spaceDown ? JUMP_V : JUMP_V * 0.35) * (ballOn ? 0.7071 : 1); grounded = false; jumpBuf = 0; player.position.y += 0.02; speed *= cfac; cfac = 1;
      if (level === 3 && sbRampEnd(player.position.x, player.position.z)) {   // a jump from the last 5 units of the ramp: a Style Boost
        vy = Math.max(vy, 44);                                                       // she leaves at least as hard as the ramp itself would throw her, so the boost never costs her the gap
        speed += 20 * TILE; styleStacks += 1; styleUntil = now + 3000;                // +20 Zips; Segs count one more times as much for the next 3 s (each new boost restarts the clock)
        burstConfetti(player.position.x, player.position.y, player.position.z, -Math.sin(heading) * speed, -Math.cos(heading) * speed);
      }
    }   // already let go: just a hop

    // Move in small steps so she can't skip past a trunk at top speed. Hitting a trunk, a wall or a ledge face too steep
    // to walk up stops her dead. Each step also runs gravity and checks the ground (the same triangles the mesh draws):
    // she follows it on foot, goes airborne when it falls away, and lands when she meets it.
    if (fpOn) heading = fpHead;
    var fx = -Math.sin(heading), fz = -Math.cos(heading);
    var moveDist = speed * cfac * sdt;
    var steps = wallOn ? 0 : Math.max(1, Math.ceil(moveDist / 0.4), Math.ceil(sdt / 0.017));
    var stepLen = moveDist / steps, hdt = sdt / steps;
    var pp = player.position, blocked = false, bumpTurned = false;
    for (var si = 0; si < steps; si++) {
      var bumpedStep = false;
      if (grounded || ballOn) fallTop = pp.y; else if (pp.y > fallTop) fallTop = pp.y;
      if (!grounded) { var nvy = (ballOn && playing && keys.s) ? Math.max(-SLAM_MAX, vy - SLAM_ACC * hdt) : Math.max(-FALL_MAX, Math.min(FALL_MAX, vy - GRAV * (flyOn ? 1 - cometC('fly.lift') : 1) * hdt)); pp.y += (vy + nvy) * 0.5 * hdt; vy = nvy; }
      if (!blocked) {
        var ox = pp.x, oz = pp.z;
        pp.x += fx * stepLen;
        pp.z += fz * stepLen;
        var c0x = pp.x, c0z = pp.z;
        var hitSolid = collide();
        var gH = groundH(pp.x, pp.z);
        var bumpNX = 0, bumpNZ = 0, bumped = false, ledgeHit = false;
        if (!hitSolid && gH > pp.y + CLIMB_SLOPE * stepLen + 0.03 && gH - pp.y <= STEP_UP && pp.x > -HALF && pp.x < HALF && pp.z > -END) {
          pp.y = gH;                                   // a small ledge: she steps right up it and keeps her momentum
        } else if (hitSolid) {
          bumpNX = pp.x - c0x; bumpNZ = pp.z - c0z; bumped = true;          // pushed out of a trunk or wall: the way she was pushed is its surface normal
        } else if (gH > pp.y + CLIMB_SLOPE * stepLen + 0.03) {
          bumpNX = groundH(c0x - 1.25, c0z) - groundH(c0x + 1.25, c0z) + 0.5 * (groundH(c0x - 3.5, c0z) - groundH(c0x + 3.5, c0z));     // a ledge face: it faces downhill (sampled wide, so a rough rock face cannot send her off at an odd angle)
          bumpNZ = groundH(c0x, c0z - 1.25) - groundH(c0x, c0z + 1.25) + 0.5 * (groundH(c0x, c0z - 3.5) - groundH(c0x, c0z + 3.5));
          pp.x = ox; pp.z = oz; bumped = true; ledgeHit = true;
        }
        if (bumped) {
          bumpedStep = true;
          // A collision no longer stops her: she glances off along the surface (a head-on hit goes whichever way the camera favours),
          // and, once every quarter second, loses 30 Zips and shakes the camera. At 50 Zips or more, outside the Barrier, it costs a heart.
          var bl = Math.sqrt(bumpNX * bumpNX + bumpNZ * bumpNZ);
          if (bl < 1e-6) { bumpNX = -fx; bumpNZ = -fz; bl = 1; }
          bumpNX /= bl; bumpNZ /= bl;
          var bdn = fx * bumpNX + fz * bumpNZ, btx = fx - bdn * bumpNX, btz = fz - bdn * bumpNZ, btl = Math.sqrt(btx * btx + btz * btz);
          var headOn = btl < 0.3;                                  // within about 17 degrees of head-on: it stops her instead of spinning her off
          if (btl < 0.15) {
            var cfx = -Math.sin(yaw), cfz = -Math.cos(yaw), sgn = (cfx * -bumpNZ + cfz * bumpNX) >= 0 ? 1 : -1;
            btx = -bumpNZ * sgn; btz = bumpNX * sgn; btl = 1;
          }
          if (bdn < 0 && now >= bumpUntil && speed > 0.5) {   // only a real hit, heading into it, and at most once a second
            btx /= btl; btz /= btl;
            if (!headOn) {
              fx = btx; fz = btz;
              var newH = Math.atan2(-fx, -fz), dH = Math.atan2(Math.sin(newH - heading), Math.cos(newH - heading));
              heading = newH;
              yaw += Math.max(-0.8, Math.min(0.8, dH));
              bumpTurned = true;
            }       // the camera swings round with her (by up to about 45 degrees), so she does not just steer back into it
            bumpUntil = now + 1000;                          // a full second before another collision can cost her anything. In between she is only pushed clear, never turned, so she cannot circle a trunk
            var wasFast = speed * -bdn >= 50 * TILE;           // a heart goes only if the part of her speed driving straight into the surface is 50 Zips or more, so a glancing blow is safe
            speed = headOn ? 0 : Math.max(0, speed - 30 * TILE);
            if (wasFast && !ballOn && hp > 0) { hp -= 1; drawHearts(); flashHurt(); } else shake(0.28);
            stepLen = speed * cfac * hdt;
            if (speed <= 0.01) blocked = true;
          } else if (ledgeHit && bdn < 0 && btl > 1e-6) {    // a ledge face again within the second: no penalty, she just slides along it (a straight face cannot spin her round)
            fx = btx / btl; fz = btz / btl; heading = Math.atan2(-fx, -fz); stepLen = speed * cfac * hdt;
          } else if (ledgeHit) {                              // a ledge face that stopped the step but is not being run into (along it, or its sampled face points away): she cannot move, so her speed goes too, instead of staying on while she stands pinned
            speed = 0; stepLen = 0; blocked = true;
          }
        }
      }
      var g = groundH(pp.x, pp.z);
      if (grounded) {
        // She follows the ground at whatever angle it runs, carrying her speed along it. Only a sudden change in the angle (a lip,
        // a cliff, the top of a ramp) throws her into the air, and then she leaves at the angle she was running.
        gradAt(pp.x, pp.z);
        if (bumpTurned || bumpedStep) { bumpTurned = false; sgx = ggx; sgz = ggz; if (pp.y - g < 3) pp.y = Math.min(pp.y, g + 0.05); }   // she has just hit something and been pushed clear: the ground under her is not a lip, so it never throws her into the air
        var dNow = -(ggx * fx + ggz * fz), runDrop = -(sgx * fx + sgz * fz);
        if (pp.y - g > 0.05 && (Math.atan(dNow) - Math.atan(runDrop) > LAUNCH_ANGLE || pp.y - g > 0.35 + Math.max(0, dNow, runDrop) * Math.max(stepLen, 0.4))) {
          grounded = false; speed *= 1 / Math.sqrt(1 + runDrop * runDrop); cfac = 1; vy = Math.max(-FALL_MAX, Math.min(40, -speed * runDrop));
        } else if (!ballOn && tooSteep(pp.x, pp.z) && !lowPoint(pp.x, pp.z)) {
          pp.y = g; grounded = false; vy = Math.min(vy, 0); cfac = 1;   // ground this steep is not somewhere to stand: she loses her footing and slides down it
        } else {
          pp.y = g;
          var kq = Math.min(1, Math.max(stepLen, 0.4) / 6);
          sgx += (ggx - sgx) * kq; sgz += (ggz - sgz) * kq;
        }
      }
      var slidSteep = false;
      if (!grounded && pp.y <= g && !ballOn && vy <= 0 && tooSteep(pp.x, pp.z)) {   // come down on ground too steep to stand on: no landing. She slides down it, moved downhill as far as she sank, so she stays on its face and falls along it
        var sgl = Math.sqrt(ggx * ggx + ggz * ggz), sink = g - pp.y, smv = Math.min(2, sink / sgl + 0.02), sux = ggx / sgl, suz = ggz / sgl, sn0 = Math.max(1, Math.ceil(smv / 0.2)), sbt = smv, sbg = 1e9, sk;
        for (sk = 1; sk <= sn0; sk++) { var st1 = smv * sk / sn0, sg1 = groundH(pp.x - sux * st1, pp.z - suz * st1); if (sg1 < sbg) { sbg = sg1; sbt = st1; } else if (sg1 > sbg + 0.05) break; }   // no further than the lowest point on the way: in a narrow cone or V the bottom is closer than that, and going past it put her on the far face, sliding back and forth for ever
        pp.x -= sux * sbt; pp.z -= suz * sbt;
        var g2 = groundH(pp.x, pp.z); if (pp.y < g2) pp.y = g2;
        g = g2; slidSteep = tooSteep(pp.x, pp.z) && !lowPoint(pp.x, pp.z);   // still on the face: no landing this step (at the bottom of a cone or V, with nowhere lower to go, she lands)
      }
      if (!grounded && pp.y <= g && !slidSteep) {
        pp.y = g;
        if (vy <= 0 && ballOn && playing && Math.floor(-vy * BOUNCE_KEEP / TILE) >= 1) { vy = Math.floor(-vy * BOUNCE_KEEP / TILE) * TILE; shake(Math.min(0.3, vy * 0.004)); }   // the Barrier does not land: it bounces back up at half the speed it came down at, keeping its run along the ground
        else if (vy <= 0) { grounded = true; vy = 0; gradAt(pp.x, pp.z); sgx = ggx; sgz = ggz; landFall(fallTop - pp.y); }
      }
    }
    var sub = false, bottomY = PLANE_Y - 150;
    if (playing) {
      if (level === 3 && SB) {
        var sbx = pp.x - L3_X, sbi;
        if (SB.waterY !== null) { sub = pp.y + PLAYER_H - 0.2 < SB.waterY; bottomY = SB.waterY - 100; }
        if (SB.minY < 1e8) bottomY = Math.min(bottomY, SB.minY - 80);      // the bottom of the world is never above the lowest point of the path
        for (sbi = 0; sbi < SB.lakes.length && !sub; sbi++) { var lk = SB.lakes[sbi]; if (lk.wy !== undefined && Math.hypot(sbx - lk.x, pp.z - lk.z) < lk.r * 0.95 && pp.y + PLAYER_H - 0.2 < lk.wy) sub = true; }
        if (sub && SB.caveCov) { var cqb = sbCaveQuery(pp.x, pp.z); if (cqb && pp.y < cqb.rf + 0.2 && pp.y >= cqb.fl - 4) sub = false; }   // inside a cave the surface is not over her head
      }
    }
    var drowned = breathTick(dt, sub);
    if (drowned) { outOfHearts('Out of breath.'); }
    else if (hp <= 0 || pp.y < bottomY) outOfHearts();

    // Her body faces the way she is moving, so it turns exactly as fast as her direction changes.
    // Standing still, she turns to face the camera instead.
    var prevRot = player.rotation.y;
    if (speed > 0.05 || keys.w || keys.s || sliding) {
      player.rotation.y = heading;
    } else {
      var diff = Math.atan2(Math.sin(yaw - prevRot), Math.cos(yaw - prevRot));
      player.rotation.y += diff * Math.min(1, dt * 10);
      heading = player.rotation.y;
    }
    var step = Math.atan2(Math.sin(player.rotation.y - prevRot), Math.cos(player.rotation.y - prevRot));
    var rate = dt > 0 ? step / dt : 0;
    turnRate += (rate - turnRate) * Math.min(1, dt * 8);
    // Bank toward the inside of the turn in proportion to how hard the corner is
    var leanTarget = Math.max(-0.35, Math.min(0.35, turnRate * speed / GRIP * 0.35));
    if (driftNow) driftSide = driftNow;
    driftBlend += ((driftNow ? 1 : 0) - driftBlend) * Math.min(1, dt * RIGCFG['m.drift.rate']);
    leanTarget += driftSide * RIGCFG['m.drift.lean'] * Math.PI / 180 * driftBlend;                  // a drift leans her much farther into the corner
    leanZ += (leanTarget - leanZ) * Math.min(1, dt * 8);
    // Side tilt: on a banked path or a cross-slope her frame tilts to the ground under her, as it does for slopes ahead and behind (the right side up when the ground rises to her right)
    var sideTarget = 0;
    if (wallOn) sideTarget = Math.max(-1.45, Math.min(1.45, -wallR));
    else if (grounded) {                                              // (the Barrier leans too, below) the ground's cross-slope averaged over a small patch round her feet, so the facets of bumpy ground do not each flick her
      var gsx = 0, gsz = 0, ppx = player.position.x, ppz = player.position.z;
      [[0, 0], [1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]].forEach(function (o) { groundGrad(ppx + o[0], ppz + o[1]); gsx += ggx; gsz += ggz; });
      sideTarget = Math.max(-0.9, Math.min(0.9, tiltSoft(Math.atan((gsx * Math.cos(player.rotation.y) - gsz * Math.sin(player.rotation.y)) / 5)) * RIGCFG['slope.side']));
    }
    sideLean += (sideTarget - sideLean) * Math.min(1, dt * (wallOn ? 8 : 5));
    body.rotation.z = leanZ + sideLean * (1 - Math.max(slideBlend, rpBlend, fpBlend));
    ballGroup.rotation.z = ballOn ? sideLean : 0;                     // the Barrier tips its axle to the ground's cross-slope (or the wall's bank) the way her body does
    // Pitch: her frame tilts to the way she is actually travelling up and down, as it turns to the way she travels sideways (nose up rising, nose down falling)
    var hsp = Math.abs(speed) + 6, vmove = dt > 0 ? (player.position.y - pitchPrevY) / dt : 0;
    if (!isFinite(vmove) || dt <= 0 || Math.abs(player.position.y - pitchPrevY) > 20) vmove = 0;   // a respawn or teleport is not a motion
    pitchPrevY = player.position.y; vmoveS += (vmove - vmoveS) * Math.min(1, dt * 6);   // smoothed, so bumps under her feet do not nod her up and down
    var pitchTarget = Math.max(-0.7, Math.min(0.7, tiltSoft(Math.atan2(vmoveS, hsp)) * 0.8)) * (ballOn || !grounded ? 0 : 1);   // only while running on the ground; in the air she eases back to upright
    pitchLean += (pitchTarget - pitchLean) * Math.min(1, dt * 8);
    if (ballOn) {
      ballAngle += (dashNow ? Math.min(DASH_MAX, DASH_RATE * dashHold) * TILE : speed) * sdt / BALL_R * RIGCFG['barrier.spin']; ballRoll.rotation.x = -ballAngle;   // charging, it spins in place as fast as it would be rolling at the speed it will take off at
      var bz = Math.abs(speed) / TILE, dist;                                     // in Zips
      if (dashNow) { ballIsSphere = dashHold >= RIGCFG['barrier.chargeSphere']; dist = Math.max(0, Math.min(1, (dashHold - RIGCFG['barrier.chargeSqueeze']) / 0.5)); }   // sphere after 2 s of charge, squeezed by 4 s
      else {
        if (!ballIsSphere && bz >= RIGCFG['barrier.sphereAt']) ballIsSphere = true; else if (ballIsSphere && bz < RIGCFG['barrier.sphereAt'] - 1) ballIsSphere = false;
        dist = Math.max(0, Math.min(1, (bz - RIGCFG['barrier.squeezeAt']) / Math.max(0.5, RIGCFG['barrier.squeezeLen'])));   // from 75 Zips it squeezes along its axle and stretches round the spin
      }
      ballMesh.visible = ballEdges.visible = !ballIsSphere; ballFast.visible = ballIsSphere;
      ballGroup.scale.set(1 - RIGCFG['barrier.squeeze'] * dist, 1 + RIGCFG['barrier.stretch'] * dist, 1 + RIGCFG['barrier.stretch'] * dist);
    }

    updateMobs(sdt, now);
    if (level === 3) sbTargetHit(now);
    cometStars(sdt, now);
    updateStreaks(dt);
    updateChunks(player.position.x, player.position.z, 1);
    updateTrees(player.position.x, player.position.z);
    updateSegs(player.position.x, player.position.z);
    tickSegs(now, segX0, segZ0, player.position.x, player.position.z, player.position.y);
    setZips(speed / TILE); updateCoords();

    // Run bob and lean (the model's clips pose the limbs).
    var k = Math.min(1, speed / STRIDE_REF);
    var topFrac = Math.min(1, speed / RUN_SPEED);
    phase += sdt * 22 * (1 - Math.exp(-speed / 12));   // stride rate levels off so the legs stay readable at high speed
    var s = Math.sin(phase);
    body.position.y = Math.abs(s) * 0.1 * k + Math.sin(now / 600) * 0.012 * (1 - k);
    body.rotation.x = -(0.16 * k + 0.2 * topFrac);
    // Braking while moving on the ground is a slide, feet first, like a runner into home: she lies back until she is about one unit tall.
    slideBlend += ((((playing && keys.s && !keys.w && grounded && speed > 6 && !ballOn) || gateIn || (SB && SB.caveLow)) ? 1 : 0) - slideBlend) * Math.min(1, dt * 10);
    if (slideBlend > 0.001) {
      var sb = slideBlend;
      body.rotation.x += (1.35 - body.rotation.x) * sb;
      body.position.y += (0.12 - body.position.y) * sb;
    }
    // Runner's Pose: a sprinter's crouch (the body lowers and tips; the clip folds the limbs).
    rpBlend += ((rpHold > 0.05 ? 1 : 0) - rpBlend) * Math.min(1, dt * 9);
    if (rpBlend > 0.001) {
      var rb = rpBlend;
      body.rotation.x += (-0.85 - body.rotation.x) * rb;
      body.position.y += (RP_DROP - body.position.y) * rb;
    }
    // Face-plant: flat on her face, sliding (the body tips flat; the clip stretches the limbs).
    fpBlend += ((fpOn ? 1 : 0) - fpBlend) * Math.min(1, dt * 10);
    if (fpBlend > 0.001) {
      var fb2 = fpBlend;
      body.rotation.x += (-1.5 - body.rotation.x) * fb2;
      body.position.y += (0.3 - body.position.y) * fb2;
    }
    // Drift: she crouches a little (the clip reaches the inside arm down).
    if (driftBlend > 0.001) {
      var db = driftBlend;
      body.position.y += (-0.32 - body.position.y) * db * 0.6;
    }
    if (mollyOn && !ballOn) { body.rotation.x = 0; body.position.y = 0; updateMolly(sdt, Math.abs(speed) / TILE); }
    cometPose(sdt);   // the clips pose her; only the lean into turns and the slope pitch below still apply
    // Pitch with her travel up and down (not over the special poses, which set their own body angle)
    var pk = pitchLean * (1 - Math.max(slideBlend, rpBlend, fpBlend));
    body.rotation.x += pk;
    body.position.z = -1.4 * Math.sin(pk);                         // pivot about her middle rather than her feet

    sun.position.set(player.position.x + 24, player.position.y + 48, player.position.z + 16);
    sun.target.position.copy(player.position);

    // Third-person camera orbiting the character on a boom that shortens whenever rock or a ledge would be in the way.
    var cp = Math.cos(pitch), sp = Math.sin(pitch);
    var focus = new THREE.Vector3(player.position.x, player.position.y + 2.3 - 1.3 * slideBlend - 0.8 * rpBlend, player.position.z);
    var bx = Math.sin(yaw) * cp, bz = Math.cos(yaw) * cp, boom = CAM_DIST;
    for (var ct = 0; ct < 14 && !camFits(focus.x + bx * boom, focus.y + sp * boom, focus.z + bz * boom); ct++) boom *= 0.8;   // the doorway tunnel's roof is low: keep the camera under it
    var camX = focus.x + bx * boom, camZ = focus.z + bz * boom;
    if (wallOn) { camX += wallNx * 3; camZ += wallNz * 3; }          // on a wall the camera stands a little out from its face
    camera.position.set(camX, focus.y + sp * boom, camZ);        // no ground check: the camera may clip into the ground
    if (shakeAmp > 0.004) { camera.position.x += (Math.random() - 0.5) * 2 * shakeAmp; camera.position.y += (Math.random() - 0.5) * 2 * shakeAmp; camera.position.z += (Math.random() - 0.5) * 2 * shakeAmp; shakeAmp *= Math.exp(-dt * 9); } else shakeAmp = 0;
    camera.lookAt(focus);

    var seeD = camera.position.distanceTo(focus);                 // see-through: from the camera to her middle, stopping 2.5 short of her
    SEE.a.value.copy(camera.position); SEE.b.value.set(player.position.x, player.position.y + PLAYER_H * 0.5, player.position.z); SEE.r.value = 2.2 * mollyScale; SEE.t1.value = Math.max(0, 1 - 2.5 * mollyScale / Math.max(0.01, SEE.a.value.distanceTo(SEE.b.value)));
    SEE.on.value = seeD > 0.5 ? 1 : 0;
    var camUw = false;                                            // the CAMERA is under the water (not just her head): the screen goes blue and the fog closes in
    if (playing) {
      if (level === 3 && SB) {
        var cux = camera.position.x - L3_X, cui;
        if (SB.waterY !== null && camera.position.y < SB.waterY) camUw = true;
        for (cui = 0; cui < SB.lakes.length && !camUw; cui++) { var lku = SB.lakes[cui]; if (lku.wy !== undefined && Math.hypot(cux - lku.x, camera.position.z - lku.z) < lku.r * 0.95 && camera.position.y < lku.wy) camUw = true; }
        if (camUw && SB.caveCov) { var cqu = sbCaveQuery(camera.position.x, camera.position.z); if (cqu && camera.position.y < cqu.rf + 0.2 && camera.position.y >= cqu.fl - 4) camUw = false; }   // inside a cave the surface is not over the camera
      }
    }
    if (camUw !== uwOn) { uwOn = camUw; uwEl.classList.toggle('on', uwOn); }
    scene.fog.color.setHex(uwOn ? 0x2f6fb5 : SKY); scene.background.setHex(uwOn ? 0x2f6fb5 : SKY); scene.fog.near = (uwOn ? 10 : 160) * GFX.fog; scene.fog.far = (uwOn ? 260 : 640) * GFX.fog;
    renderer.render(scene, camera);
    SEE.on.value = 0;
  }
  requestAnimationFrame(frame);
