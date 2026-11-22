  // ---- Health: three hearts. A hard landing costs hearts (30+ units: one, 60+: two, 90+: all three); with none left she starts over
  // from the last checkpoint she reached. ----
  var hp = MAXHP, fallTop = 0, hpEl = document.getElementById('hp'), heartsEl = document.getElementById('hearts'), hurtEl = document.getElementById('hurt');
  var HEART_PATH = 'M12 21 C12 21 3 15.2 3 9.2 C3 6.2 5.3 4 8 4 C9.6 4 11.1 4.8 12 6.2 C12.9 4.8 14.4 4 16 4 C18.7 4 21 6.2 21 9.2 C21 15.2 12 21 12 21 Z';
  function drawHearts() {
    var h = '';
    for (var k = 0; k < MAXHP; k++) {
      if (hp - k > 0.25 && hp - k < 0.75) h += '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id="hpHalf"><rect x="0" y="0" width="12" height="24"/></clipPath></defs><path class="heart-empty" d="' + HEART_PATH + '"/><path class="heart-half" clip-path="url(#hpHalf)" d="' + HEART_PATH + '"/><path class="heart-crack" d="M12 5.5 L10.4 9.5 L13.4 12.5 L10.8 16 L12 19.5"/></svg>';   // half a heart: the left half full, cracked down the middle
      else h += '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="' + (hp - k >= 0.75 ? 'heart-full' : 'heart-empty') + '" d="' + HEART_PATH + '"/></svg>';
    }
    heartsEl.innerHTML = h;
    hpEl.setAttribute('aria-label', 'Health: ' + hp + (hp === 1 ? ' heart' : ' hearts'));
  }
  drawHearts();
  // Breath: under water she cannot swim, but she is not hurt by it. Five bubbles show below the hearts while she is fully under with the water's surface directly over her head; one pops every 10 seconds and with the last she is sent back. Out of the water, or under a roof, they refill.
  var uwOn = false, uwEl = document.getElementById('uw');
  var breath = 5, breathT = 0, breathEl = document.getElementById('breath'), BREATH_N = 5, BREATH_EVERY = 10;
  function drawBreath(show) {
    if (show === false) { breathEl.hidden = true; return; }
    var h = ''; for (var k = 0; k < BREATH_N; k++) h += '<svg viewBox="0 0 12 12" aria-hidden="true"><circle class="' + (k < breath ? 'bub-full' : 'bub-empty') + '" cx="6" cy="6" r="4.6"/></svg>';
    breathEl.innerHTML = h; breathEl.hidden = false;
  }
  function breathReset() { breath = BREATH_N; breathT = 0; drawBreath(false); }
  function breathTick(dt, sub) {
    if (!sub) { if (breath !== BREATH_N || !breathEl.hidden) breathReset(); return false; }
    if (breathEl.hidden) drawBreath(true);
    breathT += dt;
    if (breathT >= BREATH_EVERY) { breathT -= BREATH_EVERY; breath -= 1; drawBreath(true); if (breath <= 0) return true; }
    return false;
  }
