  // ---- Renderer / scene ----
  var GFX = { aa: true, soft: true, fog: 1 };                   // graphics settings, kept in the browser
  try { var gs = JSON.parse(localStorage.getItem('pr_gfx') || '{}'); if (gs.aa === false) GFX.aa = false; if (gs.soft === false) GFX.soft = false; if (gs.fog >= 0.3 && gs.fog <= 1) GFX.fog = gs.fog; } catch (e) {}
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: GFX.aa });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = GFX.soft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.Fog(SKY, 160 * GFX.fog, 640 * GFX.fog);

  var camera = new THREE.PerspectiveCamera(65, 1, 0.1, 700 * GFX.fog);
  // The sunset sky (Sunset Hill): a dome kept round the camera, pale blue overhead fading through peach to deep orange at the horizon. The fog takes the horizon's colour, so far ground fades into it
  var SUNSET_TOP = 0xa9cde8, SUNSET_MID = 0xf4b26a, SUNSET_HZ = 0xe0601e;
  var skyDome = new THREE.Mesh(new THREE.SphereGeometry(600 * GFX.fog, 32, 16), new THREE.ShaderMaterial({
    uniforms: { cT: { value: new THREE.Color(SUNSET_TOP) }, cM: { value: new THREE.Color(SUNSET_MID) }, cH: { value: new THREE.Color(SUNSET_HZ) } },
    vertexShader: 'varying vec3 vD;\nvoid main() { vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 cT; uniform vec3 cM; uniform vec3 cH; varying vec3 vD;\nvoid main() { float h = normalize(vD).y; vec3 c = mix(cH, cM, smoothstep(-0.03, 0.08, h)); c = mix(c, cT, smoothstep(0.05, 0.3, h)); gl_FragColor = vec4(c, 1.0); }',
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false }));
  skyDome.renderOrder = -1e9; skyDome.frustumCulled = false; skyDome.visible = false; scene.add(skyDome);
  // See-through: any opaque surface between the camera and Molly is drawn see-through (a fine stipple, most of it left out) inside a narrow cone along the line from the camera to her, so she is never hidden. It stops short of her, so she and the ground at her feet are drawn as usual.
  var SEE = { on: { value: 0 }, a: { value: new THREE.Vector3() }, b: { value: new THREE.Vector3() }, r: { value: 2.2 }, t1: { value: 0.8 } };
  THREE.Material.prototype.onBeforeCompile = function (shader) {
    if (this.transparent || this.isShaderMaterial || this.isPointsMaterial || this.isLineBasicMaterial || this.isSpriteMaterial || this.userData.noSee) return;
    if (shader.vertexShader.indexOf('#include <project_vertex>') < 0 || shader.fragmentShader.indexOf('void main() {') < 0) return;
    shader.uniforms.uSeeOn = SEE.on; shader.uniforms.uSeeA = SEE.a; shader.uniforms.uSeeB = SEE.b; shader.uniforms.uSeeR = SEE.r; shader.uniforms.uSeeT = SEE.t1;
    shader.vertexShader = 'varying vec3 vSeeW;\n' + shader.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n#ifdef USE_INSTANCING\n vSeeW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n#else\n vSeeW = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif');
    shader.fragmentShader = 'varying vec3 vSeeW;\nuniform float uSeeOn; uniform vec3 uSeeA; uniform vec3 uSeeB; uniform float uSeeR; uniform float uSeeT;\n' + shader.fragmentShader.replace('void main() {', 'void main() {\n if (uSeeOn > 0.5) { vec3 sAB = uSeeB - uSeeA; float sT = dot(vSeeW - uSeeA, sAB) / max(1e-4, dot(sAB, sAB)); if (sT > 0.0 && sT < uSeeT) { float sD = length(vSeeW - (uSeeA + sAB * sT)), sR = uSeeR * (0.3 + 0.7 * sT / uSeeT); if (sD < sR) { float sB = fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy), vec2(0.06711056, 0.00583715)))); if (sB > mix(0.28, 1.0, smoothstep(0.7, 1.0, sD / sR))) discard; } } }');
  };
  THREE.Material.prototype.customProgramCacheKey = function () { return 'see1'; };

  scene.add(new THREE.HemisphereLight(0xffffff, 0x7a7a52, 0.75));
  var sun = new THREE.DirectionalLight(0xfff3e0, 0.9);
  sun.position.set(12, 24, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -26; sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -26;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 140;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.05;
  scene.add(sun);
  scene.add(sun.target);

