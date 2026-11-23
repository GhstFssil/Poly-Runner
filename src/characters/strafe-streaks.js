  // ---- Strafe streaks: thin light lines left in the air along the path of a sidestep, fading in a third of a second ----
  var STREAK_LIFE = 0.3, streaks = [], streakNext = 0;
  var streakGeo = new THREE.BoxGeometry(1, 1, 1);
  for (var sk = 0; sk < 9; sk++) {
    var smat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false });
    var smesh = new THREE.Mesh(streakGeo, smat);
    smesh.visible = false;
    scene.add(smesh);
    streaks.push({ mesh: smesh, age: 99, dx: 0, dz: 0, len: 0, ox: 0, oz: 0 });
  }
  function flashStreaks(ox, oy, oz, dx, dz, dist) {
    var ang = Math.atan2(-dz, dx);                // rotate the long axis of the box onto the sidestep direction
    for (var i = 0; i < 9; i++) {
      var st = streaks[streakNext++ % streaks.length];
      var h = 0.35 + (i + Math.random() * 0.8) * 0.38;                 // spread from ankles to head
      var back = -0.3 - Math.random() * 0.5;                            // some start behind where she stood
      var len = dist * (0.9 + Math.random() * 0.9) + 0.4;
      st.age = 0; st.dx = dx; st.dz = dz; st.len = len; st.thick = 0.03 + Math.random() * 0.045;
      var side = (Math.random() - 0.5) * 0.7;                           // small shift front to back so the lines don't overlap
      st.ox = ox - player.position.x + dx * back + dz * side;      // kept relative to her, so the lines travel with her
      st.oz = oz - player.position.z + dz * back - dx * side;
      st.oy = oy + h - player.position.y;
      st.mesh.rotation.y = ang;
      st.mesh.visible = true;
    }
  }
  function updateStreaks(dt) {
    for (var i = 0; i < streaks.length; i++) {
      var st = streaks[i];
      if (st.age > STREAK_LIFE) { st.mesh.visible = false; continue; }
      st.age += dt;
      var u = Math.min(1, st.age / STREAK_LIFE);
      var m = st.mesh;
      m.material.opacity = 0.75 * (1 - u) * (1 - u);
      var l = st.len * (1 - 0.6 * u);                                 // shrinks toward where she ended up
      var cx = st.ox + st.dx * (l * 0.5 + st.len * 0.45 * u), cz = st.oz + st.dz * (l * 0.5 + st.len * 0.45 * u);
      m.position.set(player.position.x + cx, player.position.y + st.oy, player.position.z + cz);
      m.scale.set(l, st.thick, st.thick);
    }
  }

