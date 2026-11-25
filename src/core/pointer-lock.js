
  document.addEventListener('pointerlockchange', function () {
    if (!document.pointerLockElement && playing && mouseMode !== 'drag') pause();
  });
  function lockPointer() {                                          // the browser only grants the lock to a click or key press made a few seconds ago, so after a long level load the first request can fail
    try {
      var p = mouseMode === 'drag' ? null : mouseMode === 'raw' ? canvas.requestPointerLock({ unadjustedMovement: true }) : canvas.requestPointerLock();   // F4 picks the mouse mode: locked (the default) or locked with raw input; 'drag' is only set while the in-game Path Editor is open
      if (p && p.catch) p.catch(function () { try { var p2 = canvas.requestPointerLock(); if (p2 && p2.catch) p2.catch(function () {}); } catch (e) {} });
    } catch (e) {}
  }
  function relockOnInput(e) { if (playing && mouseMode !== 'drag' && !document.pointerLockElement && !(e.type === 'keydown' && e.key === 'Escape')) lockPointer(); }   // playing without the lock (it was refused after a slow load): the next click or key press takes it
  window.addEventListener('pointerdown', relockOnInput, true); window.addEventListener('keydown', relockOnInput, true);
