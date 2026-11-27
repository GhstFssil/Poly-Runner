  // ---- Dash Line: while a Dodecadash charges, a dotted line on the ground shows where she will go, 200 units straight ahead along her heading.
  // It follows the ground height (groundH), so it dips into a gap and climbs a slope the way the ground does. Look only: it never changes where she goes.
  var DASH_LINE_LEN = 200, DASH_LINE_STEP = 4, DASH_LINE_N = Math.floor(DASH_LINE_LEN / DASH_LINE_STEP);
  var dashLine = (function () {
    var geo = new THREE.CircleGeometry(0.28, 10); geo.rotateX(-Math.PI / 2);   // a flat dot lying on the ground
    var mat = new THREE.MeshBasicMaterial({ color: 0xff3a30, transparent: true, opacity: 0.85, depthWrite: false });
    var m = new THREE.InstancedMesh(geo, mat, DASH_LINE_N);
    m.frustumCulled = false; m.visible = false; m.renderOrder = 5; scene.add(m);
    return m;
  })();
  var dashLineDummy = new THREE.Object3D();
  function dashLineTick(on) {                                   // called every frame from loop.js with dashNow
    dashLine.visible = !!on;
    if (!on) return;
    var fx = -Math.sin(heading), fz = -Math.cos(heading), px = player.position.x, pz = player.position.z;
    for (var i = 0; i < DASH_LINE_N; i++) {
      var d = (i + 1) * DASH_LINE_STEP, x = px + fx * d, z = pz + fz * d, y = groundH(x, z);
      dashLineDummy.position.set(x, y + 0.08, z);
      var s = i > DASH_LINE_N - 8 ? (DASH_LINE_N - i) / 8 : 1;   // the last few dots shrink away, so the line ends softly
      dashLineDummy.scale.set(s, 1, s); dashLineDummy.updateMatrix();
      dashLine.setMatrixAt(i, dashLineDummy.matrix);
    }
    dashLine.instanceMatrix.needsUpdate = true;
  }
  window.__dashLine = function () { var a = new THREE.Matrix4(), b = new THREE.Matrix4(); dashLine.getMatrixAt(0, a); dashLine.getMatrixAt(DASH_LINE_N - 1, b); return [dashLine.visible, [a.elements[12], a.elements[13], a.elements[14]], [b.elements[12], b.elements[13], b.elements[14]]]; };   // (tests: shown?, first dot, last dot)
