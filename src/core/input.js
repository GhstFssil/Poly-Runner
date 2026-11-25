  // ---- Input: keys (W A S D, Q / E, 2, Space, Escape), and the mouse modes (F4: locked, or locked with raw input; drag-to-look is only used while the in-game Path Editor is open) ----
  document.addEventListener('keydown', function (e) {
    if (!e.repeat && playing && !fpOn && (e.code === 'Digit2' || e.code === 'Numpad2')) { if (isComet()) setHover(!hovOn); else setBall(!ballOn); }
    if (fpOn && (e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'KeyA' || e.code === 'KeyD' || e.code === 'Space' || e.code === 'KeyQ' || e.code === 'KeyE')) { if (e.code === 'Space') e.preventDefault(); return; }   // flat on her face, she cannot be steered
    if (e.code === 'KeyW') keys.w = true;
    if (e.code === 'KeyS') keys.s = true;
    if (e.code === 'KeyA') keys.a = true;
    if (e.code === 'KeyD') keys.d = true;
    if (!e.repeat && e.code === 'KeyE') { if (isComet()) starPress('KeyE'); else strafe(1); }
    if (!e.repeat && e.code === 'KeyQ') { if (isComet()) starPress('KeyQ'); else strafe(-1); }
    if (e.code === 'Space' && playing) { e.preventDefault(); if (!e.repeat) { jumpBuf = 0.15; spaceDown = true; } }
    if (e.code === 'Escape' && playing) pause();
    else if (e.code === 'Escape' && !startEl.hidden) { if (screenNow === 'controls') showScreen(controlsBack); else if (screenNow === 'levels') showScreen('main'); else if (screenNow === 'settings') showScreen(settingsBack); else if (screenNow === 'cps' || screenNow === 'map' || screenNow === 'dev') showScreen('pause'); else if (screenNow === 'lvmap') showScreen('levels'); }
  });
  document.addEventListener('keyup', function (e) {
    if (starCharging && e.code === starKey) starRelease();
    if (e.code === 'KeyW') keys.w = false;
    if (e.code === 'KeyS') keys.s = false;
    if (e.code === 'KeyA') keys.a = false;
    if (e.code === 'KeyD') keys.d = false;
    if (e.code === 'Space') {
      spaceDown = false;
      if (!grounded && vy > 0) vy = 0;       // let go early and she stops rising and starts to fall at once
    }
  });
  window.addEventListener('blur', function () { keys.w = false; keys.s = false; keys.a = false; keys.d = false; spaceDown = false; sideKeys.l = sideKeys.r = false; });
  // Sidestep: left mouse button to her left, right button to her right, while held (not while the in-game Path Editor has the mouse)
  document.addEventListener('mousedown', function (e) { if (!playing || mouseMode === 'drag') return; if (e.button === 0) sideKeys.l = true; else if (e.button === 2) sideKeys.r = true; });
  window.addEventListener('mouseup', function (e) { if (e.button === 0) sideKeys.l = false; else if (e.button === 2) sideKeys.r = false; });
  document.addEventListener('contextmenu', function (e) { if (playing) e.preventDefault(); });

  // ---- Camera zoom (the mouse wheel; saved) and Free Look (Caps Lock on: the mouse turns only the camera, not her) ----
  var CAM_MIN = 4, CAM_MAX = 20, CAM_PULL = 0.2;               // zoom limits, and how far the camera moves out with speed (0.2 = 20% farther at her top speed, 30% at 1.5 times it)
  var camZoom = CAM_DIST, camPull = 1, freeLook = false, lookBack = false;
  try { var czs = parseFloat(localStorage.getItem('pr_camzoom')); if (czs >= CAM_MIN && czs <= CAM_MAX) camZoom = czs; } catch (e) {}
  window.addEventListener('wheel', function (e) {
    if (!playing || !e.deltaY) return;
    e.preventDefault();
    camZoom = Math.max(CAM_MIN, Math.min(CAM_MAX, camZoom * (e.deltaY > 0 ? 1.1 : 1 / 1.1)));   // each notch is 10% in or out
    try { localStorage.setItem('pr_camzoom', camZoom.toFixed(2)); } catch (er) {}
  }, { passive: false });
  function readCaps(e) {                                        // Caps Lock is read from every key and mouse event, so it stays right however it was toggled
    if (!e.getModifierState) return;
    var on = e.getModifierState('CapsLock');
    if (freeLook && !on) lookBack = true;                       // let go: the camera swings back behind her (loop.js)
    if (on) lookBack = false;
    freeLook = on;
  }
  document.addEventListener('keydown', readCaps, true); document.addEventListener('keyup', readCaps, true);
  document.addEventListener('mousemove', readCaps, true); document.addEventListener('mousedown', readCaps, true);

  var mouseMode = 'normal', mdTimer = 0, mdDrag = false, mdLX = 0, mdLY = 0, mdEl = document.createElement('div');
  try { var sm = localStorage.getItem('pr_mouse2'); if (sm === 'raw' || sm === 'normal') mouseMode = sm; } catch (e) {}   // a saved 'drag' (the old F4 option) falls back to locked
  mdEl.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99;font:12px monospace;color:#fff;background:rgba(0,0,0,.6);padding:4px 8px;display:none;pointer-events:none'; document.body.appendChild(mdEl);
  setInterval(function () {                                    // dragging with the cursor against an edge of the window keeps turning, so the view is not bounded by the screen
    if (!playing || mouseMode !== 'drag' || !mdDrag) return;
    var M = 50, w = window.innerWidth, h = window.innerHeight, r = 0.032;
    if (mdLX < M) yawAdd(r * (1 - Math.max(0, mdLX) / M) * 1.6); else if (mdLX > w - M) yawAdd(-r * (1 - Math.max(0, w - mdLX) / M) * 1.6);
    if (mdLY < M) pitch -= r * (1 - Math.max(0, mdLY) / M); else if (mdLY > h - M) pitch += r * (1 - Math.max(0, h - mdLY) / M);
    pitch = Math.max(-1.3, Math.min(1.2, pitch));
  }, 16);
  function setMouseMode(m, why) {
    mouseMode = m; try { localStorage.setItem('pr_mouse2', m); } catch (er) {}
    mdEl.style.display = 'block'; mdEl.textContent = (why ? why + ' ' : '') + 'Mouse look: ' + (m === 'raw' ? 'locked, raw input' : 'locked (normal)') + ' (F4 changes it; press Esc, then Play again)';
    clearTimeout(mdTimer); mdTimer = setTimeout(function () { mdEl.style.display = 'none'; }, 5000);
  }
  document.addEventListener('keydown', function (e) {           // F4: switch between locked and locked with raw input
    if (e.code === 'F4') { e.preventDefault(); if (mouseMode !== 'drag') setMouseMode(mouseMode === 'normal' ? 'raw' : 'normal'); }
  });
  canvas.addEventListener('mousedown', function (e) { if (mouseMode === 'drag') { mdDrag = true; mdLX = e.clientX; mdLY = e.clientY; } });
  window.addEventListener('mouseup', function () { mdDrag = false; });
  document.addEventListener('mousemove', function (e) {
    if (!playing) return;
    var mx, my;
    if (mouseMode === 'drag') { if (!mdDrag) return; mx = e.clientX - mdLX; my = e.clientY - mdLY; mdLX = e.clientX; mdLY = e.clientY; }
    else { mx = e.movementX || 0; my = e.movementY || 0; }
    yawAdd(-mx * SENS);
    pitch += my * SENS;
    pitch = Math.max(-1.3, Math.min(1.2, pitch));            // the camera may swing below the ground to look up over her
  });

