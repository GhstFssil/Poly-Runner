
  // ---- Input ----
  var startBtn = document.getElementById('gostart');
  var resumeBtn = document.getElementById('bResume'), screenNow = 'main', controlsBack = 'main';
    function cpFill(dyn) {                                   // the Sandbox: every checkpoint in the layout, in order, to start from
    dyn.innerHTML = ''; if (level !== 3 || !SB) return;
    SB.cps.forEach(function (cg) {
      var b = document.createElement('button'); b.className = 'go2'; b.type = 'button'; b.textContent = 'Start From Checkpoint ' + cg.n;
      b.addEventListener('click', function () { spawnAt(L3_X + cg.x, cg.z, cg.n, 'Back at checkpoint ' + cg.n, -cg.th); begin(); });
      dyn.appendChild(b);
    });
    if (!SB.cps.length) { var nb = document.createElement('div'); nb.textContent = 'This layout has no checkpoints.'; nb.style.cssText = 'text-align:center;padding:6px;font-size:13px;opacity:.7'; dyn.appendChild(nb); }
  }

