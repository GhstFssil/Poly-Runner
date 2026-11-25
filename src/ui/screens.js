  var pickGo = null;                                            // Character Select: after a level is chosen, who runs it (the last pick is ready on the first button)
  function pickThen(go) { pickGo = go; showScreen('pickchar'); var f = document.querySelector('#pickCards .pickChar[data-last]'); if (f) f.focus(); }
  window.__pickChar = function (ch) { var go = pickGo; pickGo = null; setChar(ch); if (go) go(); };
  on('pcBack', function () { pickGo = null; showScreen('levels'); });
  on('bLevel1', function () { pickThen(function () { startSandbox(JSON.parse(JSON.stringify(OFFICIAL_L1))); SB.official = true; document.getElementById('bPE').hidden = true; }); });                      // Grass Canyon, Act 1: the layout built in the Path Editor, played on the Sandbox's engine                      // Grass Canyon, Act 1
  on('bLevel2', function () { pickThen(function () { startSandbox(JSON.parse(JSON.stringify(OFFICIAL_L2))); SB.official = true; document.getElementById('bPE').hidden = true; }); });                  // Oceana Crags, Act 1
  on('bResume', function () { begin(); });
  on('bCps', function () { showScreen('cps'); });
  on('bDev', function () { showScreen('dev'); });
  on('bTitle', function () { showScreen('main'); });                     // back to the title screen; Level Select there starts a fresh run
  on('bDevBack', function () { showScreen('pause'); });
  // Dev Mode: start from anywhere with a full clock, and top up the Power Line.
  function devStart(k, x, z, face) { if (k === 0) newRun(); else { cpTime[k] = TIME_LIMIT; cpBest = Math.max(cpBest, k); } spawnAt(x, z, k, '', face); timeLeft = TIME_LIMIT; begin(); }
  on('dvstart', function () { devStart(0, L3_X, 0, 0); });
  on('dvpower', function () { setPower(POWER_MAX); var b = document.getElementById('dvpower'); b.textContent = 'Power Line full!'; setTimeout(function () { b.textContent = 'Fill Power Line'; }, 1200); });
  // Dev Mode: Molly's position (Oceana Crags counts x from its own start; on a built level Y is the editor's true Y, from where her feet are at the path's start), under the speedometer and on the Dev Mode card while paused
  var showCoords = false, coordsEl = document.getElementById('coords'), dvCoordsEl = document.getElementById('dvcoords');
  function updateCoords() {
    if (!showCoords) return;
    var p = player.position, t = 'X ' + (p.x - (level === 3 ? L3_X : 0)).toFixed(1) + '   Y ' + (p.y - (level === 3 && SB && SB.y0 ? SB.y0 : 0)).toFixed(1) + '   Z ' + p.z.toFixed(1);
    coordsEl.textContent = t; dvCoordsEl.textContent = t;
  }
  on('dvcoordsBtn', function () {
    showCoords = !showCoords; coordsEl.hidden = dvCoordsEl.hidden = !showCoords;
    document.getElementById('dvcoordsBtn').textContent = 'Show Coordinates: ' + (showCoords ? 'On' : 'Off'); updateCoords();
  });
  on('dvinvBtn', function () { invulnMode = !invulnMode; document.getElementById('dvinvBtn').textContent = 'Invulnerable: ' + (invulnMode ? 'On' : 'Off'); });
  on('bCpsBack', function () { showScreen('pause'); });
  var mapPE = null, lvMaps = {};
  function levelMapImage(n) {                                  // a level's map, drawn by the Path Editor's own renderer from the level's data, so it follows every change to the level
    if (lvMaps[n]) return lvMaps[n];
    if (!mapPE) {
      mapPE = document.createElement('div'); mapPE.style.cssText = 'position:fixed;left:-99999px;top:0;width:1200px;height:800px;overflow:hidden;pointer-events:none'; mapPE.__nosave = true;
      document.body.appendChild(mapPE); var msr = mapPE.attachShadow({ mode: 'open' }); msr.appendChild(document.getElementById('pe-tpl').content.cloneNode(true)); window.__peBoot(msr, mapPE);
    }
    mapPE.__terrain = terrainProbe; mapPE.__terrBase = function (kind, x, z) { return sbTerrBase(kind, x, z, true) - (kind === 'level2' ? L2_Y : 0); }; mapPE.__pe.load(n === 1 ? JSON.parse(JSON.stringify(OFFICIAL_L1)) : JSON.parse(JSON.stringify(OFFICIAL_L2)));
    return (lvMaps[n] = mapPE.__pe.mapImage(1450, 1000));
  }
  function showLevelMap(n) {
    var c = document.getElementById('lvmapc'), g = c.getContext('2d');
    document.getElementById('lvmapT').textContent = (n === 1 ? 'GRASS CANYON, ACT 1' : 'OCEANA CRAGS, ACT 1') + ' · MAP';
    g.clearRect(0, 0, c.width, c.height); g.fillStyle = '#2a2419'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#efe6d6'; g.font = '28px sans-serif'; g.fillText('Drawing the map…', 40, 60);
    showScreen('lvmap');
    setTimeout(function () { try { var im = levelMapImage(n); g.fillStyle = '#2a2419'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0); } catch (e) { g.fillText('The map could not be drawn.', 40, 110); } }, 30);
  }
  on('bMapL1', function () { showLevelMap(1); });
  on('bMapL2', function () { showLevelMap(2); });
  on('bLvMapBack', function () { showScreen('levels'); });
  on('gostart', function () { newRun(); spawnStart('Back at the start'); begin(); });
  var scoreTimer = 0, scoreE = 0, scoreLast = 0, scoreDone = false, clearTimer = 0, scoreSpace = false, scoreSpaceWait = false, SCORE_SLOW = 5, SCORE_FAST_MS = 2000;   // the count runs 5 times slower than its timeline; holding Space plays the whole thing in about 2 seconds
  var RATINGS = [[800000, 'S', '#e8a400'], [720000, 'A', '#2e9b4b'], [640000, 'B', '#2b7fd0'], [560000, 'C', '#8a5ad0'], [480000, 'D', '#c9602b'], [0, 'E', '#7a6a5a']];
  function fmtScore(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fmtT(t) { var m = Math.floor(t / 60), sc = t - m * 60; return m + ':' + (sc < 10 ? '0' : '') + sc.toFixed(1); }
  function levelClear(title) {                          // the same ending whichever goal she passes; only the headline differs
    clearEl.querySelector('.ctitle').textContent = title || 'Level Cleared!';
    cleared = true; playing = false; keys.w = false; keys.s = false; spaceDown = false;
    clearEl.hidden = false; clearEl.classList.add('scoring'); toastEl.hidden = true;
    try { document.exitPointerLock(); } catch (e) {}
    document.getElementById('scorebox').hidden = true;
    clearTimeout(clearTimer); clearInterval(scoreTimer);
    clearTimer = setTimeout(runScore, 1100);
  }
  // The scoring: 100 points for every tenth of a second left on the clock, doubled for each heart she has left, plus 1 for every Seg she
  // collected, then a letter grade. It plays out as a timeline (clock ticking down, hearts one by one, Segs counting up, the grade stamped).
  function runScore() {
    var T = Math.max(0, timeLeft), nh = Math.max(0, hp), segsN = Object.keys(segGot).length;
    var base = Math.round(T * 10) * 100, afterH = base * Math.pow(2, nh), finalScore = afterH + segsN;
    var RT = (level === 3 && SB && SB.ranks) ? SB.ranks : RATINGS, rate = RT[RT.length - 1]; for (var ri = 0; ri < RT.length; ri++) if (finalScore >= RT[ri][0]) { rate = RT[ri]; break; }
    var box = document.getElementById('scorebox'), eTime = document.getElementById('sc-time'), eScore = document.getElementById('sc-score'), eHearts = document.getElementById('sc-hearts'),
        eSegs = document.getElementById('sc-segs'), hRow = document.getElementById('sc-hrow'), sRow = document.getElementById('sc-srow'), eRate = document.getElementById('sc-rate'), goBtn = document.getElementById('sc-go');
    box.hidden = false; hRow.hidden = true; sRow.hidden = true; eRate.hidden = true; goBtn.hidden = true; eHearts.innerHTML = ''; eSegs.textContent = '0';
    var D1 = Math.min(2600, 700 + T * 8), HS = 750, H0 = D1 + 450, S0 = H0 + nh * HS + 250, D3 = Math.min(1600, 450 + segsN * 6), R0 = S0 + D3 + 450, B0 = R0 + 700;
    var shownH = -1, rated = false; scoreDone = false; scoreE = 0; scoreLast = performance.now();
    function tick() {
      var nowT = performance.now(); scoreE += (nowT - scoreLast) * (scoreSpace ? Math.max(1, B0 / SCORE_FAST_MS) : 1 / SCORE_SLOW); scoreLast = nowT;
      var e = scoreE, p = Math.min(1, e / D1), ep = 1 - (1 - p) * (1 - p), ts = T * (1 - ep), sc = Math.round((T - ts) * 10) * 100;
      eTime.textContent = fmtT(ts);
      var hi = 0;
      if (e >= H0) {
        hRow.hidden = false; hi = Math.min(nh, Math.floor((e - H0) / HS) + 1);
        if (nh === 0) hi = 0;
        if (hi !== shownH) { shownH = hi; var hh = ''; for (var k = 0; k < hi; k++) hh += '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + HEART_PATH + '"/></svg>'; eHearts.innerHTML = hh + (hi ? '<i>×' + Math.pow(2, hi) + '</i>' : '<i>none left</i>'); }
        var lastStart = H0 + Math.max(0, hi - 1) * HS, q = hi ? Math.min(1, (e - lastStart) / 350) : 1;
        sc = hi ? base * Math.pow(2, hi - 1) * (1 + q) : base;
      }
      if (e >= S0) {
        sRow.hidden = false; var sp = Math.min(1, (e - S0) / D3), got = Math.round(segsN * sp);
        eSegs.textContent = got; sc = afterH + got;
      }
      eScore.textContent = fmtScore(e >= S0 + D3 ? finalScore : sc);
      if (e >= R0 && !rated) { rated = true; eRate.hidden = false; eRate.textContent = rate[1]; eRate.style.color = rate[2]; }
      if (e >= B0 && !scoreDone) { scoreDone = true; scoreSpaceWait = scoreSpace; goBtn.hidden = false; clearInterval(scoreTimer); }
    }
    clearInterval(scoreTimer); scoreTimer = setInterval(tick, 33); tick();
  }
  function scoreSkip() { if (!clearEl.hidden && !scoreDone) scoreE = 1e9; }   // a click, Enter or Esc finishes the count at once
  function scoreContinue() { clearInterval(scoreTimer); clearTimeout(clearTimer); clearEl.hidden = true; clearEl.classList.remove('scoring'); document.getElementById('scorebox').hidden = true; pause(); }
  clearEl.addEventListener('click', function (ev) { if (scoreDone) { if (ev.target.id === 'sc-go') scoreContinue(); } else scoreSkip(); });
  document.addEventListener('keydown', function (e) {
    if (clearEl.hidden || !cleared) return;
    if ((e.code === 'Space' || e.code === 'Enter') && document.getElementById('scorebox').hidden) { e.preventDefault(); if (e.code === 'Space') scoreSpace = true; clearTimeout(clearTimer); runScore(); return; }   // no waiting on the headline
    if (e.code === 'Space') { e.preventDefault(); scoreSpace = true; if (scoreDone && !e.repeat && !scoreSpaceWait) scoreContinue(); }   // hold it to speed the count up
    else if (e.code === 'Enter' || e.code === 'Escape') { e.preventDefault(); if (scoreDone) scoreContinue(); else scoreSkip(); }
  });
  document.addEventListener('keyup', function (e) { if (e.code === 'Space') { scoreSpace = false; scoreSpaceWait = false; } });
