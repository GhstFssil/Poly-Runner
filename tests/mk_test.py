# make a test copy of the game with extra hooks (never shipped)
import sys
src=sys.argv[1] if len(sys.argv)>1 else '/home/claude/poly-runner/checker-run.html'
dst=sys.argv[2] if len(sys.argv)>2 else '/tmp/polyrun-work/t/aud.html'
s=open(src).read()
a="  window.__tp = function (x, z) {"
assert s.count(a)==1
hooks=r"""
  window.__ends = function (j, pts) { var old = SB; SB = sbBuild(j); var B = SB, out = pts.map(function (p) { var g = false, m = false, l = false; sbNear(B.gapH, p[0], p[1], B.maxG, function (e) { if (!g && sbIn(e, p[0], p[1], 0)) g = true; }); sbNear(B.mudH, p[0], p[1], B.hw + 2, function (e) { if (!m && sbIn(e, p[0], p[1], 0)) m = true; }); sbNear(B.ledgeH, p[0], p[1], B.maxL, function (e) { if (!l && sbIn(e, p[0], p[1], 0)) l = true; }); return [g ? 1 : 0, m ? 1 : 0, l ? 1 : 0]; }); SB = old; return out; };
  window.__sbStart = function (j) { startSandbox(j); };
  window.__phys2 = function () { var o = {}, f = { GRAV: function () { return GRAV; }, GRIP: function () { return GRIP; }, WALL_GRIP: function () { return WALL_GRIP; }, JUMP_V: function () { return JUMP_V; }, JUMP_H: function () { return JUMP_H; }, TURN_R: function () { return TURN_R; }, ARC_CX: function () { return ARC_CX; }, PLAYER_H: function () { return PLAYER_H; }, PLAYER_RADIUS: function () { return PLAYER_RADIUS; }, MAX_TURN: function () { return MAX_TURN; }, SLAM_ACC: function () { return SLAM_ACC; }, SLAM_MAX: function () { return SLAM_MAX; }, AIR_GRIP: function () { return AIR_GRIP; } }; Object.keys(f).forEach(function (k) { try { o[k] = f[k](); } catch (e) { o[k] = 'n/a'; } }); return o; };
  window.__mudAt = function (x, z) { return sbMudAt(x, z); };
  window.__put = function (x, y, z) { player.position.set(x, y, z); fallTop = y; vy = 0; grounded = true; speed = 0; };
  window.__gH = function (x, z) { return groundH(x, z); };
  window.__ens = function () { return ENEMIES.map(function (e, i) { return { i: i, x: e.x, z: e.z, fy: e.fy, H: e.H, R: e.R, sc: e.sc, dead: e.dead, act: e.act, hearts: e.hearts, big: e.big, sbp: !!e.sbp, top: e.c.top, stomp: e.c.stomp, vis: e.g.visible, gz: !!e.gz, ay: e.ay, gm: e.gm, vx: e.vx, vz: e.vz }; }); };
  window.__vy = function (v) { if (v !== undefined) { vy = v; grounded = false; } return vy; };
  window.__ball = function () { return ballOn; };
  window.__spd = function (v) { if (v !== undefined) speed = v; return speed; };
  window.__hd = function (v) { heading = v; yaw = v; return heading; };
  window.__gr = function () { return grounded; };
  window.__grad = function (x, z) { gradAt(x, z); return [ggx, ggz, typeof ggPath === 'undefined' ? null : ggPath, typeof tooSteep === 'function' ? tooSteep(x, z) : null]; };
  window.__chunks = function (x, z) { updateChunks(x, z, 99); scene.updateMatrixWorld(true); };
  window.__ray = function (x, z, y0) { var r = new THREE.Raycaster(new THREE.Vector3(x, y0 === undefined ? 2000 : y0, z), new THREE.Vector3(0, -1, 0)); return r.intersectObjects(scene.children, true).filter(function (h) { var o = h.object; while (o) { if (o === player) return false; o = o.parent; } return h.object.visible !== false; }).slice(0, 4).map(function (h) { var o = h.object, kind = o.userData && o.userData.ci !== undefined ? 'chunk' : (o.geometry && o.geometry.type === 'PlaneGeometry' && o.material === waterMesh.material) ? 'water' : (SB && SB.meshes.indexOf(o) >= 0) ? 'sb' + SB.meshes.indexOf(o) : o.type; return [+h.point.y.toFixed(3), kind]; }); };
  window.__l3m = function (x, z) { return level3H(x, z); };
  window.__l3f = function (x, z) { var y = level3H(x, z); return [y, sbDeckTop(x, z, null) > -1e8 ? 1 : 0, wL2, l3Tx, l3Bk]; };
  window.__tb = function (k, x, z, t) { return sbTerrBase(k, x, z, t); };
  window.__foot = function (x, z) { return sbFoot(x, z); };
  window.__slabTop = function (x, z, py) { return sbSlabTop(x, z, py === undefined ? null : py); };
  window.__gh0 = function (x, z) { return groundH0(x, z); };
  window.__T = function () { return { scene: scene, player: player, camera: camera, renderer: renderer, THREE: THREE }; };
  window.__camOv = null; (function () { var cam2 = null; function loop() { if (window.__camOv) { if (!cam2) cam2 = camera.clone(); var o = window.__camOv; cam2.aspect = camera.aspect; cam2.fov = o.fov || 60; cam2.far = 4000; cam2.updateProjectionMatrix(); cam2.position.set(o.p[0], o.p[1], o.p[2]); cam2.lookAt(o.l[0], o.l[1], o.l[2]); renderer.render(scene, cam2); } requestAnimationFrame(loop); } setTimeout(function () { requestAnimationFrame(loop); }, 3000); })();
  window.__molly = function () { var bb = mollyRoot ? new THREE.Box3().setFromObject(mollyRoot) : null, n = 0, nan = 0; if (mollyMesh) { var a = mollyMesh.geometry.attributes.position.array; n = a.length / 3; for (var i = 0; i < a.length; i++) if (!isFinite(a[i])) nan++; } return { on: mollyOn, hasRoot: !!mollyRoot, verts: n, nan: nan, bb: bb ? [bb.min.y, bb.max.y, bb.max.x - bb.min.x] : null, clips: Object.keys(mollyAct), durs: Object.keys(mollyAct).map(function (k) { return +mollyAct[k].getClip().duration.toFixed(3); }), holdF: mollyHoldF, bodyKids: body.children.length, stored: typeof mollySavedBytes === 'number' ? mollySavedBytes : -1, storedLS: (localStorage.getItem('mollyGlb') || '').length, hold: [typeof mollyHold === 'function' && mollyAct.Slide ? mollyHold('Slide', mollyAct.Slide.getClip().duration) : null, mollyAct.Faceplant ? mollyHold('Faceplant', mollyAct.Faceplant.getClip().duration) : null] }; };
  window.__phys = function () { return { GRAV: GRAV, GRIP: GRIP, DRIFT_GRIP: DRIFT_GRIP, WALL_FADE: WALL_FADE, SLOPE_FADE: SLOPE_FADE, WALL_GRIP: WALL_GRIP, JUMP_V: JUMP_V, JUMP_H: JUMP_H, TURN_R: TURN_R, ARC_CX: ARC_CX, RUN_SPEED: RUN_SPEED, PLAYER_H: PLAYER_H, PLAYER_RADIUS: PLAYER_RADIUS, SLIDE_H: SLIDE_H, mollyScale: mollyScale, FRIC: FRIC, FALL_MAX: FALL_MAX }; };
  window.__pushOutOf = function (x, z, d) { pushOutOf(x, z, d); }; window.__bounce = function (i) { var e = ENEMIES[i]; bounceOffBig(e, e.R + 0.5); };
  window.__ballLean = function () { return [ballGroup.rotation.z, sideLean, ballOn, grounded, wallOn]; };
  window.__setHp = function (v) { hp = v; drawHearts(); };
  window.__solid = function (x, y, z) { return laserSolid(x, y, z, null); };
  window.__state = function () { return { grounded: grounded, vy: vy, speed: speed, heading: heading, yaw: yaw, wallOn: wallOn, fpOn: fpOn, hp: hp, x: player.position.x, y: player.position.y, z: player.position.z, plOn: plOn, slDeg: slDeg }; };
"""
s=s.replace(a,hooks+a)
a2="initScene();buildStatic();renderPart();setMode('run');applyTheme();"
assert s.count(a2)==1
s=s.replace(a2,"HOST.__rigdbg=function(){return {P:P,DEF:DEF,ui:ui,sk:skMesh,bones:bones,scene:scene,rigRoot:rigRoot,barrier:barrierGroup,camera:camera,renderer:renderer,controls:controls,tList:tList,ringAt:ringAt,SEGS:SEGS,ranges:ranges,setP:function(k,v){P[k]=v;dirty=true;},isDirty:function(){return dirty;},rebuildMs:function(){return rebuild.ms;}};};"+a2)
a3="    renderer.render(scene, camera);"
assert s.count(a3)==1
s=s.replace(a3,"    if (!window.__noRender) renderer.render(scene, camera);")
a4="  prims.forEach(function(pr){soups[pr.key]=soupOf(pr);});"
assert s.count(a4)==1
s=s.replace(a4,a4+"window.__soups0=JSON.stringify(soups);window.__weldlog=[];")
a5="        if(la.length!==1||lb.length!==1||la[0].open||lb[0].open||la[0].pts.length<3||lb[0].pts.length<3){ok=false;return;}"
assert s.count(a5)==1
s=s.replace(a5,"window.__weldlog.push([ch.key,la.map(function(l){return l.pts.length+(l.open?'o':'')}),lb.map(function(l){return l.pts.length+(l.open?'o':'')})]);"+a5)
import os; os.makedirs(os.path.dirname(dst),exist_ok=True); open(dst,'w').write(s); print('test copy ->',dst,len(s))
