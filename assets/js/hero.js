import * as THREE from 'three';

const R2 = 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/';
const WORK = [
  ['Roadster 3D', 'designs/roadster-3d-car-landing.mp4'],
  ['Living Portrait', 'aaaf/living-portrait-hero.mp4'],
  ['Particle Self', 'aaaf/oraciteslArea.mp4'],
  ['Robot Jellyfish', 'aaaf/medusa-jellyfish-hero.mp4'],
  ['Ink Reveal', 'designs/ink-reveal-hover.mp4'],
  ['Space Voyage', 'designs/space-voyage-video.mp4'],
  ['Helion Dispatch', 'designs/helion-dispatch-landing.mp4'],
  ['Honey Bee', 'designs/honey-bee-melli-landing.mp4'],
];
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
const out = t => 1 - (1 - t) ** 3;
const span = (p, a, b) => clamp((p - a) / (b - a));

/* ---------- renderer ---------- */
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setClearColor(0, 0);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const scene = new THREE.Scene();
const FOV = 35, camera = new THREE.PerspectiveCamera(FOV, 1, .1, 100);

/* ---------- ribbon path ---------- */
let path, PATH_L = 1;
const SAMPLES = 1200, pathP = [], pathT = [];
const PH0 = -1.5, PH1 = Math.PI * 2 + 1.35;
function buildPath() {
  const pts = [];
  for (let i = 0; i <= 160; i++) {
    const t = i / 160, ph = mix(PH0, PH1, t), cs = Math.cos(ph), u = 2 * t - 1;
    // a shallow arc close to the camera, then long runs far behind it
    const depth = cs > 0 ? 7.6 + 16.4 * cs ** .9 : 7.6 + 2.2 * cs;
    const edge = .84 + .5 * span(.14 - t, 0, .14) + .8 * span(t, .84, 1);
    pts.push(new THREE.Vector3(edge * Math.sin(ph) * depth * .561, .5 * Math.sign(u) * Math.abs(u) ** 1.4 * depth * .63, -depth));
  }
  path = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  path.arcLengthDivisions = 1500;
  PATH_L = path.getLength(); pathP.length = pathT.length = 0;
  for (let i = 0; i <= SAMPLES; i++) { const u = i / SAMPLES; pathP.push(path.getPointAt(u)); pathT.push(path.getTangentAt(u)); }
}
const at = (s, op, ot) => {
  const f = clamp(s / PATH_L) * SAMPLES, i = Math.min(SAMPLES - 1, Math.floor(f)), k = f - i;
  op.lerpVectors(pathP[i], pathP[i + 1], k); ot.lerpVectors(pathT[i], pathT[i + 1], k).normalize();
};

/* ---------- cards ---------- */
const CARD_W = 2.1, CARD_H = 1.32, GAP = .03, STEP = CARD_W + GAP, NX = 28, NY = 3;
const vs = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fs = `uniform sampler2D map;uniform vec2 cover;uniform float aspect,ready,radius;varying vec2 vUv;
void main(){
  vec2 q=(abs(vUv-.5)-.5)*vec2(aspect,1.)+radius;
  float d=length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
  float px=fwidth(d),a=1.-smoothstep(-px,px,d);
  if(a<.01)discard;
  vec2 uv=vUv;if(!gl_FrontFacing)uv.x=1.-uv.x;
  vec3 c=mix(vec3(.075),texture2D(map,(uv-.5)*cover+.5).rgb,ready);
  float edge=smoothstep(-.012-px,-.012,d);
  gl_FragColor=vec4(mix(c,vec3(1.),edge*.1),a);
}`;
const cards = WORK.map(([title, src], i) => {
  const v = document.createElement('video');
  Object.assign(v, {crossOrigin:'anonymous', muted:true, loop:true, playsInline:true, preload:'auto', src:R2 + src});
  v.setAttribute('playsinline', '');
  const tex = new THREE.VideoTexture(v);
  tex.colorSpace = THREE.NoColorSpace; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const geo = new THREE.PlaneGeometry(1, 1, NX, NY);
  const mat = new THREE.ShaderMaterial({vertexShader:vs, fragmentShader:fs, transparent:true, side:THREE.DoubleSide,
    uniforms:{map:{value:tex}, cover:{value:new THREE.Vector2(1, 1)}, aspect:{value:CARD_W / CARD_H}, ready:{value:0}, radius:{value:.018}}});
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; scene.add(mesh);
  const c = {i, title, v, tex, geo, mat, mesh, rect:null};
  v.addEventListener('loadeddata', () => {
    const va = v.videoWidth / v.videoHeight, ca = CARD_W / CARD_H;
    mat.uniforms.cover.value.set(va > ca ? ca / va : 1, va > ca ? 1 : va / ca);
    mat.uniforms.ready.value = 1;
  });
  return c;
});

/* ---------- layout ---------- */
const GZ = 8;
let W = 1, H = 1, asp = 1, cols = 3, rows = 2, tanH = .3153;
function resize() {
  W = innerWidth; H = innerHeight; asp = W / H;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W, H, false);
  camera.aspect = asp; camera.fov = asp < 16 / 9 ? Math.atan(.561 / asp) * 360 / Math.PI : FOV; camera.updateProjectionMatrix();
  tanH = Math.tan(camera.fov * Math.PI / 360);
  cols = asp < .9 ? 2 : 3; rows = asp < .9 ? 3 : 2;
}
addEventListener('resize', resize); resize(); buildPath();
function grid(i) {
  const vh = 2 * GZ * tanH, vw = vh * asp, gw = vw * (cols === 3 ? .74 : .88), gap = gw * .017;
  const cw = (gw - gap * (cols - 1)) / cols, ch = cw / (CARD_W / CARD_H), gh = ch * rows + gap * 1.6 * (rows - 1);
  const c = i % cols, r = Math.floor(i / cols);
  return {x:-gw / 2 + cw / 2 + c * (cw + gap), y:gh / 2 - ch / 2 - r * (ch + gap * 1.6), w:cw, h:ch, vw, vh, c, r};
}

/* ---------- scroll ---------- */
let target = 0, p = 0, frozen = false;
const readScroll = () => { const t = $('track'); target = clamp(scrollY / (t.offsetHeight - innerHeight)); };
addEventListener('scroll', readScroll, {passive:true}); readScroll();

/* ---------- pose ---------- */
const op = new THREE.Vector3(), ot = new THREE.Vector3(), up = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0), vp = new THREE.Vector3();
function poseRibbon(c, head) {
  const pos = c.geo.attributes.position, centre = head - c.i * STEP;
  for (let iy = 0; iy <= NY; iy++) for (let ix = 0; ix <= NX; ix++) {
    const k = iy * (NX + 1) + ix, lu = ix / NX - .5, lv = .5 - iy / NY;
    at(centre + lu * CARD_W, op, ot);
    // keep the sheet upright, leaning a little into the turn
    up.copy(Y).addScaledVector(ot, -Y.dot(ot)).normalize();
    vp.copy(op).addScaledVector(up, lv * CARD_H);
    pos.setXYZ(k, vp.x, vp.y, vp.z);
  }
  pos.needsUpdate = true;
}
function poseGrid(c, q) {
  const g = grid(c.i), pos = c.geo.attributes.position;
  const dx = (g.c - (cols - 1) / 2) * 1.2 + (cols === 3 && g.c === 1 ? 0 : 0), dy = g.r < rows / 2 ? 1 : -1;
  const ox = dx * g.vw * .62 * (1 - q), oy = dy * g.vh * (g.c === 1 ? .95 : .34) * (1 - q), tilt = (1 - q) * .22 * (g.c - 1 || .5) * dy;
  const cs = Math.cos(tilt), sn = Math.sin(tilt);
  for (let iy = 0; iy <= NY; iy++) for (let ix = 0; ix <= NX; ix++) {
    const k = iy * (NX + 1) + ix, x = (ix / NX - .5) * g.w, y = (.5 - iy / NY) * g.h;
    pos.setXYZ(k, g.x + ox + x * cs - y * sn, g.y + oy + x * sn + y * cs, -GZ - (1 - q) * .6 * Math.sin(ix / NX * Math.PI));
  }
  pos.needsUpdate = true;
  c.rect = g;
}

const RIB_A = .14, RIB_B = .63;
function render() {
  const pp = p;
  // headline runs right across the page in opposite directions
  const rise = 1 - out(span(pp, 0, .12));
  const run = mix(-50, 76, span(pp, 0, .58));
  $('l1').style.transform = `translate3d(${run}vw,${rise * 34}vh,0)`;
  $('l2').style.transform = `translate3d(${-run}vw,${rise * 34}vh,0)`;
  const capA = 1 - span(pp, .52, .57);
  $('cap').style.opacity = capA; $('cap').style.transform = `translate(-50%,calc(-50% + ${rise * 34}vh))`;
  const intro = 1 - span(pp, 0, .05);
  for (const id of ['hint', 'pager', 'cross', 'glow']) $(id).style.opacity = intro;
  $('rule').style.transform = `scaleX(${ease(span(pp, .72, .86))})`;
  $('rule').style.top = '50%';
  // ribbon, then the grid
  const pr = span(pp, RIB_A, RIB_B), head = mix(0, PATH_L + cards.length * STEP, pr);
  for (const c of cards) {
    const s = head - c.i * STEP, end = PATH_L - CARD_W;
    if (s < end) {
      c.mesh.visible = s > CARD_W; c.rect = null;
      if (c.mesh.visible) poseRibbon(c, head);
    } else if (c.i < cols * rows) {
      // each card flies to its slot the moment it leaves the rail
      const st = mix(RIB_A, RIB_B, (end + c.i * STEP) / (PATH_L + cards.length * STEP)), q = out(span(pp, st, st + .13));
      c.mesh.visible = q > .001;
      if (c.mesh.visible) poseGrid(c, q);
    } else { c.mesh.visible = false; c.rect = null; }
  }
  renderer.render(scene, camera);
}

/* ---------- hover ---------- */
const nameEl = $('name');
$('stage').addEventListener('pointermove', e => {
  let hit = null;
  if (p > .86) {
    const nx = (e.clientX / W - .5), ny = (.5 - e.clientY / H);
    for (const c of cards) { const g = c.rect; if (!g) continue; const x = nx * g.vw, y = ny * g.vh; if (Math.abs(x - g.x) < g.w / 2 && Math.abs(y - g.y) < g.h / 2) hit = c; }
  }
  nameEl.style.opacity = hit ? 1 : 0;
  if (hit) { nameEl.textContent = hit.title; nameEl.style.transform = `translate(${e.clientX + 14}px,${e.clientY + 16}px)`; }
});

/* ---------- loop ---------- */
function loop() {
  if (!frozen) {
    p += (target - p) * .09;
    if (Math.abs(target - p) < .00005) p = target;
    for (const c of cards) {
      if (c.mesh.visible && c.v.paused) c.v.play().catch(() => {});
      else if (!c.mesh.visible && !c.v.paused) c.v.pause();
    }
    render();
  }
  requestAnimationFrame(loop);
}
loop();