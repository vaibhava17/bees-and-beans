// "From block to box" — one piece of chocolate, transformed by scroll (procedural three.js, no assets).
// 01 a 1 KG block of authentic chocolate (bought in, so its wrapper is unbranded) is unwrapped
// 02 it breaks along its grooves      03 the pieces melt into a glossy pool
// 04 the pool rises into truffles, rochers, mendiants and hearts      05 they settle into the gift box, ribbon on.
// setProgress(0..1) comes from the page's scroll; renders on gsap.ticker only while on screen.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { gsap } from 'gsap';

const COLS = 6, ROWS = 4, CELL = 1, GAP = .07, N = COLS * ROWS;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (t) => t * t * (3 - 2 * t);
const ease = (p, a, b) => smooth(clamp01((p - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;

// camera/group pose keyframes: [p, rotX, rotY, distance]
const KEYS = [[0, .62, -.55, 11.5], [.18, .7, .2, 11], [.38, .72, .5, 10.4], [.58, .82, .2, 9.6], [.78, .78, -.22, 9.4], [1, 1.08, -.3, 9.8]];
function pose(p) {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i], b = KEYS[i + 1];
    if (p <= b[0]) { const t = smooth((p - a[0]) / (b[0] - a[0])); return a.map((v, k) => lerp(v, b[k], t)); }
  }
  return KEYS.at(-1);
}

// seeded random so every visit breaks the block the same way
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function labelTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1312;
  const g = c.getContext('2d');
  g.fillStyle = '#efe3cf'; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(120,90,60,${Math.random() * .05})`; g.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2); }
  g.strokeStyle = '#b8975a'; g.lineWidth = 6; g.strokeRect(48, 48, c.width - 96, c.height - 96);
  g.lineWidth = 2; g.strokeRect(70, 70, c.width - 140, c.height - 140);
  g.textAlign = 'center';
  g.fillStyle = '#a9884e'; g.font = '500 40px Jost, Futura, sans-serif'; g.fillText('A U T H E N T I C', 512, 470);
  g.fillStyle = '#23160f'; g.font = 'italic 400 120px "Bodoni Moda", Didot, Georgia, serif';
  g.fillText('Pure', 512, 640); g.fillText('Chocolate', 512, 770);
  g.strokeStyle = '#b8975a'; g.beginPath(); g.moveTo(422, 860); g.lineTo(602, 860); g.stroke();
  g.fillStyle = '#a9884e'; g.font = '500 64px Jost, Futura, sans-serif'; g.fillText('1  K G', 512, 960);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function shadowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(.6, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export async function initBar(canvas, { reduced = false } = {}) {
  await document.fonts?.load('italic 400 64px "Bodoni Moda"').catch(() => {});
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('no webgl');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .45;
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(0xffe6c8, 0x1a0e09, .4));
  const key = new THREE.DirectionalLight(0xffdcb0, 2.2); key.position.set(-5, 8, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xd6b77e, 3); rim.position.set(6, 3, -6); scene.add(rim);
  const fill = new THREE.PointLight(0xb8763a, 18, 30); fill.position.set(2, -2, 7); scene.add(fill);

  const choc = (color, rough = .3, coat = .6) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat: coat, clearcoatRoughness: .28, sheen: .25, sheenColor: new THREE.Color(0x8a5a3a) });
  const M = {
    dark: choc(0x24110a), milk: choc(0x5a2f1a, .34), white: choc(0xeadcc4, .45, .3),
    pool: new THREE.MeshPhysicalMaterial({ color: 0x2e170c, roughness: .24, clearcoat: .7, clearcoatRoughness: .2, sheen: .4, sheenColor: new THREE.Color(0x9a6a44) }),
    almond: new THREE.MeshStandardMaterial({ color: 0xb98256, roughness: .7 }),
    pista: new THREE.MeshStandardMaterial({ color: 0x8faa45, roughness: .65 }),
    cran: new THREE.MeshStandardMaterial({ color: 0x8e1f2b, roughness: .5 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x2a2a48, roughness: .45 }),
    seed: new THREE.MeshStandardMaterial({ color: 0xe6d9b4, roughness: .7 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xf2ece1, roughness: .8 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .32, metalness: .9 }),
    ribbon: new THREE.MeshPhysicalMaterial({ color: 0x4a2a1a, roughness: .35, sheen: 1, sheenColor: new THREE.Color(0xc89a6a), sheenRoughness: .3 }),
  };

  const group = new THREE.Group();
  scene.add(group);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.26; group.add(shadow);

  // 01–03 the block: 24 pieces (each = its share of the slab + its raised square) so it breaks along the grooves
  const sq = CELL - GAP;
  const pieceGeo = mergeGeometries([
    new RoundedBoxGeometry(CELL - .006, .22, CELL - .006, 2, .025).translate(0, -.12, 0).toNonIndexed(),
    new RoundedBoxGeometry(sq, .26, sq, 4, .1).translate(0, .1, 0).toNonIndexed(),
  ]);
  pieceGeo.computeVertexNormals();
  const pieces = new THREE.InstancedMesh(pieceGeo, M.dark, N);
  const P = [];
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
    P.push({ x: -COLS / 2 + .5 + i, z: -ROWS / 2 + .5 + j, axis: new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize(), spin: (rnd() - .5) * 2.4, lift: .5 + rnd() * .7, delay: rnd() * .45 });
  }
  group.add(pieces);

  // wrapper band (unbranded — the block comes from a supplier)
  const label = new THREE.MeshStandardMaterial({ map: labelTexture(), roughness: .75 });
  const wrap = new THREE.Mesh(new THREE.BoxGeometry(3.2, .62, ROWS + .26), [M.gold, M.gold, label, M.paper, M.paper, M.paper]);
  wrap.position.y = .06; group.add(wrap);

  // 03 molten pool: a domed puddle whose surface ripples
  const poolGeo = new THREE.SphereGeometry(1, 72, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const poolBase = poolGeo.attributes.position.array.slice();
  const pool = new THREE.Mesh(poolGeo, M.pool);
  pool.scale.set(0, 0, 0); group.add(pool);

  // 04 products
  const topping = (mat, sx, sy, sz) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mat); m.scale.set(sx, sy, sz); return m; };
  function scatter(g, n, rMax, y) {
    const mats = [[M.almond, .09, .045, .05], [M.pista, .06, .04, .05], [M.cran, .05, .045, .05], [M.blue, .045, .045, .045], [M.seed, .045, .015, .03]];
    for (let k = 0; k < n; k++) {
      const [mat, a, b, c] = mats[k % mats.length], r = Math.sqrt(rnd()) * rMax, t = rnd() * Math.PI * 2;
      const m = topping(mat, a, b, c); m.position.set(Math.cos(t) * r, y + b * .6, Math.sin(t) * r); m.rotation.y = rnd() * 6; g.add(m);
    }
  }
  function truffle(mat, pipeMat) {
    const g = new THREE.Group();
    const cup = new THREE.CylinderGeometry(.34, .3, .38, 48, 3);
    const pos = cup.attributes.position;
    for (let k = 0; k < pos.count; k++) { // flutes on the side, like a moulded cup
      const x = pos.getX(k), z = pos.getZ(k), r = Math.hypot(x, z);
      if (r > .25 && Math.abs(pos.getY(k)) < .19) { const a = Math.atan2(z, x), f = 1 + .045 * Math.cos(a * 22); pos.setX(k, x * f); pos.setZ(k, z * f); }
    }
    cup.computeVertexNormals(); cup.translate(0, .19, 0);
    g.add(new THREE.Mesh(cup, mat));
    for (const rot of [0, Math.PI / 2]) { // hand-piped cross, dripping over the edge
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.37, .2, 0), new THREE.Vector3(-.33, .39, 0), new THREE.Vector3(0, .4, 0), new THREE.Vector3(.33, .39, 0), new THREE.Vector3(.37, .24, 0)]);
      const pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, .022, 8), pipeMat); pipe.rotation.y = rot + .5; g.add(pipe);
    }
    return g;
  }
  function mendiant() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.38, .4, .08, 48).translate(0, .04, 0), M.dark));
    scatter(g, 10, .28, .08);
    return g;
  }
  function heart() {
    const s = new THREE.Shape();
    s.moveTo(0, -.36); s.bezierCurveTo(-.08, -.25, -.42, -.05, -.4, .14); s.bezierCurveTo(-.38, .32, -.14, .38, 0, .22);
    s.bezierCurveTo(.14, .38, .38, .32, .4, .14); s.bezierCurveTo(.42, -.05, .08, -.25, 0, -.36);
    const geo = new THREE.ExtrudeGeometry(s, { depth: .12, bevelEnabled: true, bevelThickness: .07, bevelSize: .05, bevelSegments: 1, curveSegments: 10 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, .07, 0);
    const g = new THREE.Group(); g.add(new THREE.Mesh(geo, M.milk)); scatter(g, 6, .16, .26);
    return g;
  }
  function rocher() {
    const core = new THREE.IcosahedronGeometry(.27, 2);
    const pos = core.attributes.position;
    for (let k = 0; k < pos.count; k++) { const f = 1 + (rnd() - .5) * .18; pos.setXYZ(k, pos.getX(k) * f, pos.getY(k) * f * .8, pos.getZ(k) * f); }
    core.computeVertexNormals();
    const parts = [core.toNonIndexed()];
    for (let k = 0; k < 18; k++) { // almond flakes sticking out of the cluster
      const flake = new THREE.BoxGeometry(.15, .018, .09);
      flake.rotateX(rnd() * 3); flake.rotateY(rnd() * 3); flake.rotateZ(rnd() * 3);
      const t = rnd() * Math.PI * 2, u = rnd() * .9 - .2, rr = .24 * Math.sqrt(1 - u * u);
      flake.translate(Math.cos(t) * rr, u * .2, Math.sin(t) * rr);
      parts.push(flake.toNonIndexed());
    }
    const geo = mergeGeometries(parts); geo.translate(0, .22, 0);
    return new THREE.Mesh(geo, M.milk);
  }
  const MAKE = { tm: () => truffle(M.milk, M.white), td: () => truffle(M.dark, M.white), tw: () => truffle(M.white, M.dark), me: mendiant, he: heart, ro: rocher };
  const ORDER = ['tm', 'me', 'he', 'ro', 'td', 'ro', 'me', 'tw', 'he', 'tm', 'me', 'ro'];
  const products = ORDER.map((k, i) => {
    const obj = MAKE[k](), c = i % 4, r = Math.floor(i / 4);
    obj.userData = {
      form: new THREE.Vector3((c - 1.5) * 1.3, 0, (r - 1) * 1.25),
      pack: new THREE.Vector3((c - 1.5) * 1.06, .1, (r - 1) * 1.06),
      delay: (i / ORDER.length) * .5, spin: rnd() * Math.PI * 2,
    };
    obj.scale.setScalar(0); obj.visible = false; group.add(obj);
    return obj;
  });

  // 05 gift box: cream tray, gold liner and dividers, brown ribbon crossing with a bow (like the real box)
  const box = new THREE.Group();
  const BW = 4.6, BD = 3.5, BH = .55;
  box.add(new THREE.Mesh(new THREE.BoxGeometry(BW, .08, BD).translate(0, -.04, 0), M.paper));
  for (const [w, d, x, z] of [[BW, .08, 0, BD / 2], [BW, .08, 0, -BD / 2], [.08, BD, BW / 2, 0], [.08, BD, -BW / 2, 0]]) box.add(new THREE.Mesh(new THREE.BoxGeometry(w, BH, d).translate(x, BH / 2 - .04, z), M.paper));
  box.add(new THREE.Mesh(new THREE.BoxGeometry(BW - .2, .02, BD - .2).translate(0, .01, 0), M.gold));
  for (let c = 1; c < 4; c++) box.add(new THREE.Mesh(new THREE.BoxGeometry(.03, .16, BD - .2).translate((c - 2) * 1.06, .08, 0), M.gold));
  for (let r = 1; r < 3; r++) box.add(new THREE.Mesh(new THREE.BoxGeometry(BW - .2, .16, .03).translate(0, .08, (r - 1.5) * 1.06), M.gold));
  box.visible = false; group.add(box);
  const ribbon = new THREE.Group();
  const bandZ = new THREE.Mesh(new THREE.BoxGeometry(.34, .03, BD + .24), M.ribbon); bandZ.position.set(-1.25, BH + .06, 0);
  const bandX = new THREE.Mesh(new THREE.BoxGeometry(BW + .24, .03, .34), M.ribbon); bandX.position.set(0, BH + .08, .95);
  const bow = new THREE.Group(); bow.position.set(-1.25, BH + .14, .95);
  for (const s of [-1, 1]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(.26, .07, 10, 28), M.ribbon); loop.scale.set(1, .55, .35); loop.rotation.set(Math.PI / 2, 0, s * .5); loop.position.x = s * .26; bow.add(loop); }
  bow.add(new THREE.Mesh(new THREE.SphereGeometry(.1, 16, 12), M.ribbon));
  ribbon.add(bandZ, bandX, bow); ribbon.visible = false; group.add(ribbon);

  let mobile = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); mobile = w < 960;
  }
  new ResizeObserver(resize).observe(canvas); resize();

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  let target = 0, cur = 0, t0 = performance.now(), visible = true, clock = 0;

  function frame() {
    if (!visible) return;
    const now = performance.now(), dt = Math.min(.05, (now - t0) / 1000); t0 = now; clock += dt;
    cur = reduced ? target : cur + (target - cur) * (1 - Math.exp(-5 * dt));
    const p = cur;
    const unwrap = ease(p, .02, .15), brk = ease(p, .19, .36), melt = clamp01((p - .38) / .2), form = clamp01((p - .58) / .19), pack = ease(p, .78, .95);

    // 01 wrapper slides off and away
    wrap.position.set(0, .06 + unwrap * 4.2, -unwrap * 3); wrap.rotation.x = -unwrap * .7; wrap.visible = unwrap < .99;

    // 02–03 pieces break apart and lift, then fall into the pool one by one and dissolve
    let anyPiece = false;
    P.forEach((o, i) => {
      const lift = Math.sin(brk * Math.PI * .5) * o.lift;
      const mi = smooth(clamp01((melt - o.delay) / .5));
      v.set(lerp(o.x * (1 + .32 * brk), o.x * .15, mi), lerp(lift, -.15, mi), lerp(o.z * (1 + .32 * brk), o.z * .15, mi));
      q.setFromAxisAngle(o.axis, o.spin * brk * (1 - mi * .5));
      const s = 1 - mi; sc.set(s, s * (1 - mi * .4), s);
      if (s > .01) anyPiece = true;
      m4.compose(v, q, sc); pieces.setMatrixAt(i, m4);
    });
    pieces.instanceMatrix.needsUpdate = true; pieces.visible = anyPiece;

    // 03–04 pool swells as pieces melt in, then is drawn up into the products
    const poolR = 2.5 * smooth(clamp01(melt * 1.25)) * (1 - smooth(clamp01((form - .1) / .75)));
    pool.visible = poolR > .02;
    if (pool.visible) {
      pool.scale.set(poolR, .08 + poolR * .025, poolR);
      const a = poolGeo.attributes.position.array, amp = reduced ? 0 : .05;
      for (let k = 0; k < a.length; k += 3) {
        const r = Math.hypot(poolBase[k], poolBase[k + 2]), y = poolBase[k + 1];
        a[k + 1] = y + (y > .02 ? amp * Math.sin(r * 9 - clock * 2.4) * (1 - r) : 0);
      }
      poolGeo.attributes.position.needsUpdate = true; poolGeo.computeVertexNormals();
    }

    // 04–05 products rise out of the pool into a loose grid, then settle into the box cells
    products.forEach((o) => {
      const d = o.userData, fi = smooth(clamp01((form - d.delay) / .5));
      o.visible = fi > 0;
      if (!o.visible) return;
      v.set(lerp(0, d.form.x, fi), lerp(-.3, d.form.y, fi) + Math.sin(fi * Math.PI) * .9, lerp(0, d.form.z, fi));
      v.lerp(d.pack, pack);
      o.position.copy(v);
      o.rotation.y = d.spin * (1 - fi) + (reduced ? 0 : Math.sin(clock * .8 + d.spin) * .08 * (1 - pack));
      o.scale.setScalar(fi * lerp(1, .92, pack));
    });

    // 05 box rises around them; ribbon ties on last
    box.visible = pack > 0;
    box.position.y = lerp(-3, -.2, pack); box.scale.setScalar(lerp(.85, 1, pack));
    const tie = ease(p, .9, .99);
    ribbon.visible = tie > 0;
    bandZ.scale.z = Math.max(tie, .001); bandX.scale.x = Math.max(tie, .001); bow.scale.setScalar(Math.max(ease(p, .96, 1), .001));

    shadow.scale.set(lerp(7.5, 6, melt) * lerp(1, 1.1, pack), lerp(5.5, 5, melt), 1);

    const [, rx, ry, dist] = pose(p);
    const float = reduced ? 0 : Math.sin(now / 1400) * .05;
    group.rotation.set(rx, ry + (reduced ? 0 : Math.sin(now / 2600) * .03), 0);
    group.position.set(mobile ? 0 : lerp(-1.9, -1.5, pack), (mobile ? lerp(1.5, 2.1, pack) : lerp(.1, .45, pack)) + float, 0);
    group.scale.setScalar((mobile ? .9 : 1) * lerp(1, 1.32, ease(p, .55, .72)) * lerp(1, .86, pack));
    const z = dist * (mobile ? 3.1 : 1.75);
    camera.position.set(0, z * .1, z); camera.lookAt(0, mobile ? 1.1 : .1, 0);
    renderer.render(scene, camera);
  }

  gsap.ticker.add(frame);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; t0 = performance.now(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; t0 = performance.now(); });

  return { setProgress(p) { target = p; }, dispose() { gsap.ticker.remove(frame); renderer.dispose(); } };
}
