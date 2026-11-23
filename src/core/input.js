  // ---- Input: keys (W A S D, Q / E, 2, Space, Escape), and the mouse modes (F4: locked, locked with raw input, drag-to-look) ----
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
  window.addEventListener('blur', function () { keys.w = false; keys.s = false; keys.a = false; keys.d = false; spaceDown = false; });

  var mouseMode = 'normal', mdTimer = 0, mdDrag = false, mdLX = 0, mdLY = 0, mdEl = document.createElement('div');
  try { var sm = localStorage.getItem('pr_mouse2'); if (sm === 'raw' || sm === 'normal' || sm === 'drag') mouseMode = sm; } catch (e) {}
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
    mdEl.style.display = 'block'; mdEl.textContent = (why ? why + ' ' : '') + 'Mouse look: ' + (m === 'drag' ? 'hold the left button and drag' : m === 'raw' ? 'locked, raw input' : 'locked (normal)') + ' (F4 changes it; press Esc, then Play again)';
    clearTimeout(mdTimer); mdTimer = setTimeout(function () { mdEl.style.display = 'none'; }, 5000);
  }
  document.addEventListener('keydown', function (e) {           // F4: switch between locked, locked with raw input, and drag-to-look
    if (e.code === 'F4') { e.preventDefault(); setMouseMode(mouseMode === 'normal' ? 'raw' : mouseMode === 'raw' ? 'drag' : 'normal'); }
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

