  // ---- The Rig Editor: a full-screen panel (its own shadow tree, so its styles stay out of the game) opened from the title screen. Save to game rebuilds Molly. ----
  var rigHost = null;
  function openRig() {
    var first = !rigHost;
    if (first) {
      rigHost = document.createElement('div'); rigHost.id = 'rigHost'; rigHost.hidden = true;
      rigHost.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:9999;overflow:auto;background:#161415';
      document.body.appendChild(rigHost);
      var sr = rigHost.attachShadow({ mode: 'open' }); sr.appendChild(document.getElementById('rig-tpl').content.cloneNode(true));
      rigHost.__init = document.getElementById('molly-settings').textContent; rigHost.__initC = document.getElementById('comet-settings').textContent;
      rigHost.__save = function (buf, json, done) {                 // the game takes the new Molly only if she loads cleanly, and reports whether this browser could keep her (its storage can be full, or switched off)
        var ch = rigHost.__char || 'molly';
        if (ch !== CHAR) { mollyStore(buf, function (kept) { if (done) done(kept ? 'ok' : 'big'); }, ch); return; }   // the runner she is not playing as: kept for when she is
        mollyLoad(buf, function () { if (done) done('bad'); }, function () { rigRead(); barrierBuild(); mollyStore(buf, function (kept) { if (done) done(kept ? 'ok' : 'big'); }, ch); });
      };
      rigHost.__apply = function () { rigRead(); barrierBuild(); };   // the Mobs page's Save to Game: the game rereads every stat now
      rigHost.__close = function () { rigHost.hidden = true; rigHost.__open = false; rigRead(); barrierBuild(); };
      ['keydown', 'keyup', 'keypress'].forEach(function (t) { rigHost.addEventListener(t, function (e) { e.stopPropagation(); }); });
      rigHost.hidden = false; rigHost.__open = true;
      window.__rigBoot(sr, rigHost);
    }
    rigHost.hidden = false; rigHost.__open = true;
  }
