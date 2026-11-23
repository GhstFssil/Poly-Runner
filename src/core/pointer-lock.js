
  document.addEventListener('pointerlockchange', function () {
    if (!document.pointerLockElement && playing && mouseMode !== 'drag') pause();
  });

