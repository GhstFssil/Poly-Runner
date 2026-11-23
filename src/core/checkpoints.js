  // ---- Checkpoint gate at the end of the valley ----
  // A checker-banner gate across the valley 50 units before the end wall. Running through it lights it gold; the title card
  // can also start her there. It is scenery only: nothing to bump into.
  var cpRed = new THREE.MeshPhongMaterial({ color: 0xc9222a, flatShading: true, specular: 0x000000, shininess: 0 });
  var cpWhite = new THREE.MeshPhongMaterial({ color: 0xf3f3f3, flatShading: true, specular: 0x000000, shininess: 0 });
  var cpStone = new THREE.MeshPhongMaterial({ color: 0x7a756b, flatShading: true, specular: 0x000000, shininess: 0 });
  var cpLit = [false, false, false], cpMats = [cpRed, cpRed.clone(), cpRed.clone()];
  function lightGates(n) {                                // light the first n gates (the ones she has reached)
    for (var k = 0; k < 3; k++) { cpLit[k] = level === 1 && k < n; cpMats[k].color.setHex(level === 1 && k < n ? 0xffc533 : 0xc9222a); }
    l2LightHook(n);
  }
  var l2LightHook = function (n) { l2CpLit = level === 2 && n >= 1; l2Cp2Lit = level === 2 && n >= 2; if (typeof cpMat2 !== 'undefined') { cpMat2.color.setHex(l2CpLit ? 0xffc533 : 0xc9222a); cpMat3.color.setHex(l2Cp2Lit ? 0xffc533 : 0xc9222a); } };
  function lightOne(k) { cpLit[k] = true; cpMats[k].color.setHex(0xffc533); }
  // A gate centred at (gx, gz); alongX: the bar runs along X (across the valley), else along Z (across the plateau's west end).
  function buildGate(gx, gz, alongX, redMat, half, ph) {
    var GW = half, PH = ph || 11, g = new THREE.Group();
    function pt(u) { return alongX ? [gx + u, gz] : [gx, gz + u]; }
    var pL = pt(-GW), pR = pt(GW), yL = groundH(pL[0], pL[1]), yR = groundH(pR[0], pR[1]), yTop = Math.max(yL, yR) + PH;
    [[pL, yL], [pR, yR]].forEach(function (pp) {
      var post = new THREE.Mesh(new THREE.BoxGeometry(1.8, yTop - pp[1] + 1.2, 1.8), cpStone);
      post.position.set(pp[0][0], (pp[1] - 0.6 + yTop + 0.6) / 2, pp[0][1]);
      g.add(post);
    });
    var bw = 2, n = GW;                                   // two rows of 2-unit checks along the bar
    for (var row = 0; row < 2; row++) for (var i = 0; i < n; i++) {
      var blk = new THREE.Mesh(alongX ? new THREE.BoxGeometry(bw, 1.5, 0.7) : new THREE.BoxGeometry(0.7, 1.5, bw), (i + row) % 2 ? cpWhite : redMat);
      var q = pt(-GW + bw * (i + 0.5));
      blk.position.set(q[0], yTop - 0.8 - row * 1.5, q[1]);
      g.add(blk);
    }
    scene.add(g);
  }
  buildGate(CP_X, CP_Z, true, cpMats[0], 16);
  buildGate(CP2_X, CP2_Z, false, cpMats[1], 20);
  var CP4_X = CH_X, CP4_Z = CAVE_ZE + 25;       // the fourth, across the cave tunnel just before it opens into the chamber
  buildGate(CP4_X, CP4_Z, true, cpMats[2], 14);
  // Oceana Crags' checkpoint: a gate across the runway 25 units after the tunnel into the crags
  var L2CP_X = GATE_X0 + GATE_L + 25, L2CP_Z = GATE_Z, cpMat2 = cpRed.clone(), l2CpLit = false;
  buildGate(L2CP_X, L2CP_Z, false, cpMat2, L2_HW);
  // and a second, on the slab over the water 40 units past the end of the bay's curve, across the path
  var L2CPB = L2_PIECES[L2_BAYEND_I], L2CP2_X = L2CPB.x0 + 40, L2CP2_Z = L2CPB.z0, cpMat3 = cpRed.clone(), l2Cp2Lit = false;
  buildGate(L2CP2_X, L2CP2_Z, false, cpMat3, 8);
  var goalGold = new THREE.MeshPhongMaterial({ color: 0xffc533, flatShading: true, specular: 0x000000, shininess: 0 });
