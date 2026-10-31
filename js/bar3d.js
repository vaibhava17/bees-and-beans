// The 1 KG block of authentic chocolate everything starts from — procedural three.js. 6×4 bevelled squares,
// glossy tempered surface, and a plain cream & gold wrapper (no Bees & Beans branding: the block is the raw
// material from a supplier) that slides off as you scroll.
// Driven by setProgress(0..1) from the page's scroll; renders on gsap.ticker only while on screen.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { gsap } from 'gsap';

const COLS = 6, ROWS = 4, CELL = 1, GAP = .07;
const W = COLS * CELL, D = ROWS * CELL;

// Pose keyframes along the scroll: [progress, rotX, rotY, cameraZ, sleeveOut]
const KEYS = [
  [0, .62, -.55, 11.5, 0],
  [.27, .85, .18, 9.2, 1],
  [.52, .32, .95, 8.4, 1],
  [.76, .66, -.28, 10.4, 1],
  [1, .7, -.42, 10.8, 1],
];
const smooth = (t) => t * t * (3 - 2 * t);
function pose(p) {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i], b = KEYS[i + 1];
    if (p <= b[0]) {
      const t = smooth((p - a[0]) / (b[0] - a[0]));
      return a.map((v, k) => v + (b[k] - v) * t);
    }
  }
  return KEYS.at(-1);
}

function sleeveTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 1312;
  const g = c.getContext('2d');
  g.fillStyle = '#efe3cf'; g.fillRect(0, 0, c.width, c.height);
  // paper grain
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(120,90,60,${Math.random() * .05})`; g.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2); }
  g.strokeStyle = '#b8975a'; g.lineWidth = 6; g.strokeRect(48, 48, c.width - 96, c.height - 96);
  g.lineWidth = 2; g.strokeRect(70, 70, c.width - 140, c.height - 140);
  g.textAlign = 'center';
  g.fillStyle = '#a9884e'; g.font = '500 40px Jost, Futura, sans-serif';
  g.fillText('A U T H E N T I C', c.width / 2, 470);
  g.fillStyle = '#23160f'; g.font = 'italic 400 120px "Bodoni Moda", Didot, Georgia, serif';
  g.fillText('Pure', c.width / 2, 640);
  g.fillText('Chocolate', c.width / 2, 770);
  g.strokeStyle = '#b8975a'; g.lineWidth = 2; g.beginPath(); g.moveTo(c.width / 2 - 90, 860); g.lineTo(c.width / 2 + 90, 860); g.stroke();
  g.fillStyle = '#a9884e'; g.font = '500 64px Jost, Futura, sans-serif';
  g.fillText('1  K G', c.width / 2, 960);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}

export async function initBar(canvas, { reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('no webgl');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .42;
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 100);

  scene.add(new THREE.HemisphereLight(0xffe6c8, 0x1a0e09, .35));
  const key = new THREE.DirectionalLight(0xffdcb0, 2.2); key.position.set(-5, 8, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xd6b77e, 3.2); rim.position.set(6, 2, -6); scene.add(rim);
  const fill = new THREE.PointLight(0xb8763a, 18, 30); fill.position.set(2, -3, 7); scene.add(fill);

  // chocolate: base slab + bevelled squares
  const parts = [];
  const slab = new RoundedBoxGeometry(W + .1, .24, D + .1, 3, .06); slab.translate(0, -.12, 0); parts.push(slab);
  const sq = CELL - GAP;
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
    const x = -W / 2 + CELL / 2 + i * CELL, z = -D / 2 + CELL / 2 + j * CELL;
    const b = new RoundedBoxGeometry(sq, .26, sq, 4, .1); b.translate(x, .1, z); parts.push(b);
  }
  const barGeo = mergeGeometries(parts.map((g) => g.toNonIndexed()));
  barGeo.computeVertexNormals();
  const choc = new THREE.MeshPhysicalMaterial({ color: 0x24110a, roughness: .3, metalness: 0, clearcoat: .6, clearcoatRoughness: .28, sheen: .25, sheenColor: new THREE.Color(0x8a5a3a), sheenRoughness: .6 });
  const barMesh = new THREE.Mesh(barGeo, choc);

  // wrapper: a cream paper band with a gold-bordered label on top
  await document.fonts?.load('500 64px "Bodoni Moda"').catch(() => {});
  const paper = new THREE.MeshStandardMaterial({ color: 0xe8dbc4, roughness: .85 });
  const label = new THREE.MeshStandardMaterial({ map: sleeveTexture(), roughness: .75 });
  const goldEdge = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .35, metalness: .9 });
  const sleeve = new THREE.Mesh(new THREE.BoxGeometry(3.2, .62, D + .26), [goldEdge, goldEdge, label, paper, paper, paper]);
  sleeve.position.y = .06;

  const group = new THREE.Group();
  group.add(barMesh, sleeve);
  scene.add(group);

  // sizing
  let mobile = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    mobile = w < 960;
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  // state + frame-rate independent smoothing
  let target = 0, cur = 0, t0 = performance.now(), visible = true;
  function frame() {
    if (!visible) return;
    const now = performance.now(), dt = Math.min(.05, (now - t0) / 1000); t0 = now;
    cur = reduced ? target : cur + (target - cur) * (1 - Math.exp(-6 * dt));
    const [, rx, ry, cz, out] = pose(cur);
    const float = reduced ? 0 : Math.sin(now / 1400) * .06;
    group.rotation.set(rx, ry + (reduced ? 0 : Math.sin(now / 2600) * .03), 0);
    group.position.set(mobile ? 0 : -1.9, (mobile ? 1.5 : .1) + float, 0);
    group.scale.setScalar(mobile ? .9 : 1);
    // sleeve slides along the bar and off to the right, then fades away
    sleeve.position.x = smooth(Math.min(1, cur / .24)) * 8.5 * out;
    sleeve.visible = sleeve.position.x < 8;
    const z = cz * (mobile ? 3.1 : 1.75);
    camera.position.set(0, z * .1, z);
    camera.lookAt(0, mobile ? 1.1 : .1, 0);
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; t0 = performance.now(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; t0 = performance.now(); });

  return {
    setProgress(p) { target = p; },
    dispose() { gsap.ticker.remove(frame); renderer.dispose(); },
  };
}
