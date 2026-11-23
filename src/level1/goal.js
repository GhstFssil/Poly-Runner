
  // Level 2's water: a plain blue surface 10 below the runway's edge. She passes straight through it; below it she drowns (see the loop).
  // A tileable wave texture drawn on a canvas: deep blue with paler crest strokes and a few darker patches, repeating every 48 units
  var waterTex = (function () {
    var cv = document.createElement('canvas'); cv.width = cv.height = 256; var g = cv.getContext('2d');
    g.fillStyle = '#1f6fb8'; g.fillRect(0, 0, 256, 256);
    function rnd(i, k) { var h = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return h - Math.floor(h); }
    function draw(ox, oy) {
      for (var i = 0; i < 26; i++) {                                                    // darker, slightly different patches
        var x = rnd(i, 1) * 256 + ox, y = rnd(i, 2) * 256 + oy, r = 14 + rnd(i, 3) * 26;
        g.fillStyle = 'rgba(' + (12 + rnd(i, 4) * 20 | 0) + ',' + (80 + rnd(i, 5) * 30 | 0) + ',' + (150 + rnd(i, 6) * 40 | 0) + ',0.38)';
        g.beginPath(); g.ellipse(x, y, r, r * 0.55, rnd(i, 7) * 3.14, 0, 6.283); g.fill();
      }
      g.lineCap = 'round';
      for (var j = 0; j < 34; j++) {                                                    // pale wave crests
        var cx = rnd(j, 11) * 256 + ox, cy = rnd(j, 12) * 256 + oy, w = 14 + rnd(j, 13) * 22;
        g.strokeStyle = 'rgba(190,230,255,' + (0.45 + rnd(j, 14) * 0.4).toFixed(2) + ')'; g.lineWidth = 2.2 + rnd(j, 15) * 2.2;
        g.beginPath(); g.moveTo(cx - w, cy); g.quadraticCurveTo(cx - w / 2, cy - 6, cx, cy); g.quadraticCurveTo(cx + w / 2, cy + 6, cx + w, cy); g.stroke();
      }
    }
    for (var ax = -256; ax <= 256; ax += 256) for (var ay = -256; ay <= 256; ay += 256) draw(ax, ay);   // drawn in the neighbouring tiles too, so it wraps without a seam
    var tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(16000 / 48, 16000 / 48); tx.anisotropy = 4;
    return tx;
  })();
  var waterMat = new THREE.MeshBasicMaterial({ map: waterTex, transparent: true, opacity: 0.93, side: THREE.DoubleSide });   // the Sandbox's seas and lakes
  var flewRamp = false, rampY = 0, drownT = 0, level = 1, styleStacks = 0, styleUntil = 0, curNow = 0;
  function styleMult() { return styleStacks > 0 && curNow < styleUntil ? 1 + styleStacks : 1; }    // Segs fill the Power Line this many times as much while a Style Boost lasts
  // Confetti: a burst of coloured scraps that travels with her, falls, and fades
  var CONF_N = 90, confPos = new Float32Array(CONF_N * 3), confCol = new Float32Array(CONF_N * 3), confVel = new Float32Array(CONF_N * 3), confLife = 0;
  var confGeo = new THREE.BufferGeometry();
  confGeo.setAttribute('position', new THREE.BufferAttribute(confPos, 3)); confGeo.setAttribute('color', new THREE.BufferAttribute(confCol, 3));
  var confMat = new THREE.PointsMaterial({ size: 0.4, vertexColors: true, transparent: true, depthWrite: false });
  var confetti = new THREE.Points(confGeo, confMat); confetti.frustumCulled = false; confetti.visible = false; confetti.position.set(0, 2, -9); player.add(confetti);   // a child of Molly: it travels and turns with her, 9 units ahead
  function burstConfetti(x, y, z, vx, vz) {
    var pal = [[1, 0.25, 0.3], [1, 0.8, 0.15], [0.3, 0.85, 0.4], [0.3, 0.6, 1], [0.85, 0.4, 1], [1, 1, 1]];
    for (var i = 0; i < CONF_N; i++) {
      var a = Math.random() * 6.2832, r = Math.random() * 0.5, up = 0.5 + Math.random() * 1.2, sp = 1.5 + Math.random() * 4, c = pal[i % pal.length];
      confPos[i * 3] = Math.cos(a) * r; confPos[i * 3 + 1] = up; confPos[i * 3 + 2] = Math.sin(a) * r;
      confVel[i * 3] = Math.cos(a) * sp; confVel[i * 3 + 1] = 2 + Math.random() * 5; confVel[i * 3 + 2] = Math.sin(a) * sp;
      confCol[i * 3] = c[0]; confCol[i * 3 + 1] = c[1]; confCol[i * 3 + 2] = c[2];
    }
    confGeo.attributes.position.needsUpdate = true; confGeo.attributes.color.needsUpdate = true;
    confLife = 1.5; confMat.opacity = 1; confetti.visible = true;
  }
  function updateConfetti(dt) {
    if (confLife <= 0) return;
    dt *= 4;                                                 // plays in a quarter of the original 1.5s
    confLife -= dt;
    if (confLife <= 0) { confetti.visible = false; return; }
    for (var i = 0; i < CONF_N; i++) {
      confVel[i * 3 + 1] -= 28 * dt;
      confVel[i * 3] *= 1 - 1.5 * dt; confVel[i * 3 + 2] *= 1 - 1.5 * dt;
      confPos[i * 3] += confVel[i * 3] * dt; confPos[i * 3 + 1] += confVel[i * 3 + 1] * dt; confPos[i * 3 + 2] += confVel[i * 3 + 2] * dt;
    }
    confGeo.attributes.position.needsUpdate = true;
    confMat.opacity = Math.min(1, confLife / 0.5);
  }

