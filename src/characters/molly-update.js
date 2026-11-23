  var mollyHoldF = {};
  function mollyHold(n, d) {                                   // where in the clip a move is held: the slide's low pose ends at its 4th key, the face-plant's at its 7th
    var key = n === 'Slide' ? 'm.slide.3.t' : n === 'Faceplant' ? 'm.fall.6.t' : null, f = n === 'Slide' ? 0.72 : 0.92;
    if (key) {
      if (mollyHoldF[n] === undefined) { mollyHoldF[n] = f; try { var j = JSON.parse(document.getElementById('molly-settings').textContent); if (typeof j[key] === 'number') mollyHoldF[n] = j[key]; } catch (e) {} }
      f = mollyHoldF[n];
    }
    return key ? Math.min(d - 0.001, f * d) : d - 0.001;
  }
  function updateMolly(dt, zp) {
    var want;
    if (fpBlend > 0.5) want = 'Faceplant';
    else if (slideBlend > 0.5) want = 'Slide';
    else if (rpBlend > 0.5) want = 'RunnersPose';
    // (a drift no longer switches to the held Drift pose: she keeps her run cycle, legs moving, and the drift's lean into the corner is laid over it, as it first was)
    else if (!grounded) want = 'Jump';
    else if (zp < 0.75) want = 'Idle';
    else want = zp <= 15 ? 'Run_Slow' : zp < 45 ? 'Run_Mid' : 'Run_Fast';
    if (mollyDriftRun && driftBlend > 0.5 && grounded && want.indexOf('Run_') === 0 && mollyAct.Drift_L && mollyAct.Drift_R) want = driftSide > 0 ? 'Drift_L' : 'Drift_R';   // her run with the Drift stats' changes, stride for stride
    if (!grounded && mollyPrevGround) mollyV0 = 0;
    if (!grounded && vy > mollyV0) mollyV0 = vy;                // the launch speed of this jump (a ledge walk-off has none)
    mollyPrevGround = grounded;
    var f = Math.min(1, dt * 12), tot = 0, n;
    for (var i = 0; i < MOLLY_CLIPS.length; i++) {
      n = MOLLY_CLIPS[i]; if (!mollyAct[n]) continue;
      if (n === want && mollyW[n] < 0.02 && (n === 'Slide' || n === 'Faceplant' || n === 'RunnersPose' || n === 'Drift_L' || n === 'Drift_R')) mollyT[n] = 0;
      mollyW[n] += ((n === want ? 1 : 0) - mollyW[n]) * f; tot += mollyW[n];
    }
    var rc = mollyAct.Run_Mid.getClip().duration, ref = want === 'Run_Slow' ? 8 : want === 'Run_Fast' || want.indexOf('Drift') === 0 ? 60 : 30;
    mollyRunPh = (mollyRunPh + dt * Math.max(0.6, Math.min(1.6, zp / ref)) / rc) % 1;      // one shared stride phase, so a change of gait picks up where the last one left off
    for (i = 0; i < MOLLY_CLIPS.length; i++) {
      n = MOLLY_CLIPS[i]; var a = mollyAct[n]; if (!a) continue;
      var d = a.getClip().duration;
      if (n.indexOf('Run_') === 0 || (mollyDriftRun && n.indexOf('Drift_') === 0)) a.time = mollyRunPh * d;
      else if (n === 'Idle') { mollyT.Idle = (mollyT.Idle + dt) % d; a.time = mollyT.Idle; }
      else if (n === 'Jump') {                                // the leap follows her real height: launch (27% of the clip) to apex (50%) while she rises, apex to touchdown (72%) while she falls
        var jf = vy > 0 && mollyV0 > 0 ? 0.27 + 0.23 * Math.max(0, 1 - vy / mollyV0) : 0.5 + 0.22 * Math.min(1, -vy / JUMP_V);
        a.time = Math.max(0, Math.min(0.999, jf)) * d;
      } else { mollyT[n] = Math.min(mollyHold(n, d), mollyT[n] + dt); a.time = mollyT[n]; }   // a slide or face-plant is held in its low pose for as long as it lasts
      a.setEffectiveWeight(tot > 0 ? mollyW[n] / tot : 0);
    }
    mollyMix.update(0);
  }
  var leanZ = 0, sideLean = 0;               // how far she banks into a turn, and how far she tilts to a sideways slope
  var keys = { w: false, s: false, a: false, d: false };
  var playing = false;
