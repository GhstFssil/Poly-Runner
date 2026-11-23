  // ---- State: where she faces and how fast she goes (yaw, pitch, speed, heading), run phase, checkpoint times, Drift, Runner's Pose drop ----
  var yaw = 0;                 // 0 = facing -Z
  function yawAdd(d) { if (!plOn) { yaw += d; return; } yaw = plHu + fromPl(wrapA(toPl(wrapA(yaw - plHu)) + d)); }   // turning the camera by d turns it by d along the surface she is on
  var pitch = 0.35;
  var speed = 0;
  var phase = 0;
  var turnRate = 0;
  var cpTime = [], cpBest = 0;   // this run: the clock reading at each checkpoint (cpTime[1..3]) and the furthest she has got
  var bumpUntil = 0;           // collisions cost speed at most once every quarter second
  var heading = 0;             // the direction she is actually moving, as an angle like yaw (0 = toward -Z)
  var RP_DROP = -0.6;   // Runner's Pose: how far her body drops
  var driftSide = 0, driftBlend = 0, driftHeld = false, driftKick = 0, driftCool = 0;   // Drift: A / D tighten the turn radius by half in that direction (side +1 = left, -1 = right)
  var DRIFT_TIGHT = 2;                 // turning rate multiplier while drifting (radius x 0.5)
