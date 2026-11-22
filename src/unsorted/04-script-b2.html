
  // The cave's roof. The ground is a height map and cannot hold a ceiling over a floor, so the roof is a separate lid: a flat ribbon 30 above
  // the tunnel floor (it sits flush with the rock either side), a block through the raised wall at the mouth, and a round lid 60 above the
  // chamber floor. It is a thin double-sided mesh, seen from below as the ceiling and from above as the top of the rock.
  (function () {
    var P = [], C = [], rc = new THREE.Color(), HW = CAVE_W / 2 + 1.5;
    function tri(a, b, c, k) {
      P.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      rc.setHex(STONE[k % STONE.length]); for (var q = 0; q < 3; q++) C.push(rc.r, rc.g, rc.b);
    }
    function quad(a, b, c, d, k) { tri(a, b, c, k); tri(a, c, d, k); }
    var TOP = WALL_HEIGHT + WALL_RAISE + 2, ROOF0 = WALL_HEIGHT + CAVE_H, k = 0;
    var prev = null;
    for (var s = 0; s <= CAVE_LEN + 0.001; s += 4) {
      var q = cavePoint(Math.min(s, CAVE_LEN)), nx = -q[3], nz = q[2], inSlab = q[0] < CAVE_SLAB;
      var y = caveFloor(s) + CAVE_H;
      var L = [q[0] + nx * HW, y, q[1] + nz * HW], R = [q[0] - nx * HW, y, q[1] - nz * HW];
      var Lt = [L[0], TOP, L[2]], Rt = [R[0], TOP, R[2]];
      if (prev) {
        quad(prev.L, prev.R, R, L, k++);
        if (inSlab && prev.inSlab) quad(prev.Lt, prev.Rt, Rt, Lt, k++);
      }
      if (s === 0) { quad(L, R, Rt, Lt, k++); }                                // the face of the wall above the mouth
      if (inSlab === false && prev && prev.inSlab) { quad(prev.L, prev.R, prev.Rt, prev.Lt, k++); }   // the back of the block, where the wall ends
      prev = { L: L, R: R, Lt: Lt, Rt: Rt, inSlab: inSlab };
    }
    var cy = CH_FLOOR + CH_H, N = 72;
    for (var i = 0; i < N; i++) {                                              // the chamber's round lid
      var a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2, rr = CH_R + 2;
      tri([CH_X, cy, CH_Z], [CH_X + rr * Math.cos(a0), cy, CH_Z + rr * Math.sin(a0)], [CH_X + rr * Math.cos(a1), cy, CH_Z + rr * Math.sin(a1)], i);
    }
    var ze = CAVE_ZE + 1;                                                      // the lintel where the 30-tall tunnel opens into the 60-tall chamber
    quad([CAVE_XE - HW, CH_FLOOR + CAVE_H, ze], [CAVE_XE + HW, CH_FLOOR + CAVE_H, ze], [CAVE_XE + HW, cy, ze], [CAVE_XE - HW, cy, ze], 1);
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(C), 3));
    g.computeVertexNormals();
    var roof = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    roof.castShadow = true; roof.receiveShadow = true;
    scene.add(roof);
  })();

  // The doorway tunnel's roof (10 above its floor, flush with the rock either side), the stone over it where it passes through the chamber's rim,
  // and the plug that seals the doorway until the mobs are beaten.
  var doorPlug = null;
  (function () {
    var P = [], C = [], rc = new THREE.Color(), HW = DR_W / 2 + 1.5, k = 0;
    function tri(a, b, c, kk) {
      P.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      rc.setHex(STONE[kk % STONE.length]); for (var q = 0; q < 3; q++) C.push(rc.r, rc.g, rc.b);
    }
    function quad(a, b, c, d, kk) { tri(a, b, c, kk); tri(a, c, d, kk); }
    var RIM_X = CH_X + CH_R + 50, TOP = CH_FLOOR + CH_H + 0.15, prev = null;
    for (var ss = 0; ss <= DR_LEN + 0.001; ss += 2) {
      var q = piecePoint(DR_PIECES, Math.min(ss, DR_LEN)), nx = -q[3], nz = q[2], y = drFloor(ss) + DR_H;
      var L = [q[0] + nx * HW, y, q[1] + nz * HW], R = [q[0] - nx * HW, y, q[1] - nz * HW];
      var inRim = q[0] < RIM_X, Lt = [L[0], TOP, L[2]], Rt = [R[0], TOP, R[2]];
      if (prev) {
        quad(prev.L, prev.R, R, L, k++);
        if (inRim && prev.inRim) quad(prev.Lt, prev.Rt, Rt, Lt, k++);
      }
      if (ss === 0) quad(L, R, Rt, Lt, k++);                                       // the face of the rim above the doorway, seen from the chamber
      if (!inRim && prev && prev.inRim) quad(prev.L, prev.R, prev.Rt, prev.Lt, k++);   // the back of that stone, where the rim ends
      prev = { L: L, R: R, Lt: Lt, Rt: Rt, inRim: inRim };
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(C), 3));
    g.computeVertexNormals();
    var roof = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    roof.castShadow = true; roof.receiveShadow = true;
    scene.add(roof);
    doorPlug = new THREE.Mesh(new THREE.BoxGeometry(5, DR_UP + DR_H, DR_W + 3), new THREE.MeshLambertMaterial({ color: 0x7a756b, flatShading: true }));
    doorPlug.position.set(DR_X0 - 0.5, CH_FLOOR + (DR_UP + DR_H) / 2, DR_Z0);
    scene.add(doorPlug);
  })();
  function camFits(x, y, z) {                     // false if the camera would sit above the roof of the doorway tunnel
    if (x < DR_X0 || x > DR_XE + DR_W || z > DR_Z0 + DR_W || z < DR_ZE) return true;
    var d = pathDist(DR_PIECES, x, z);
    return d >= DR_W / 2 + 1 || y < drFloor(PATH_S) + DR_H - 0.8;
  }
  function setDoor(open) { doorOpen = open; if (doorPlug) doorPlug.visible = !open; }

