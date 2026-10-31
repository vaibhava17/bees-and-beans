// "What we make" in the galaxy: the brand's real product photos as gold-rimmed medallions on a slow 3D ring.
// Scroll turns the ring so each product comes to the front; a few 3D chocolates and gold dust drift behind.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { createKit, setupRenderer } from './choco3d.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (t) => t * t * (3 - 2 * t);

// scroll progress → which product is in front (holds on each, then turns to the next)
export function slotOf(p, n) {
  const seg = Math.min(n - .0001, Math.max(0, p) * n), i = Math.floor(seg), f = seg - i;
  const pos = i + (i < n - 1 ? smooth(clamp01((f - .55) / .45)) : 0);
  return { active: Math.round(pos), pos };
}

function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(.25, 'rgba(232,196,120,.85)'); gr.addColorStop(1, 'rgba(232,196,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export async function initShowcase(canvas, images, { reduced = false } = {}) {
  const renderer = setupRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b2a24, 14, 30);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .6;
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 80);
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x0b2a24, .8));
  const key = new THREE.DirectionalLight(0xffe2b8, 2.2); key.position.set(-5, 7, 9); scene.add(key);
  const rim = new THREE.DirectionalLight(0xcdb17d, 2.6); rim.position.set(6, 3, -6); scene.add(rim);

  const n = images.length, R = 3.6;
  const ring = new THREE.Group(); scene.add(ring);
  const loader = new THREE.TextureLoader();
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .28, metalness: 1 });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x173f36, roughness: .6 });
  const medals = await Promise.all(images.map(async (src, i) => {
    const tex = await loader.loadAsync(src);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const { width: w, height: h } = tex.image; // crop to a centred square ("cover")
    if (w > h) { tex.repeat.set(h / w, 1); tex.offset.set((1 - h / w) / 2, 0); } else { tex.repeat.set(1, w / h); tex.offset.set(0, (1 - w / h) / 2); }
    const photoMat = new THREE.MeshStandardMaterial({ map: tex, roughness: .55, metalness: 0 });
    const m = new THREE.Group();
    const face = new THREE.Mesh(new THREE.CircleGeometry(1.5, 64), photoMat); face.position.z = .06;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, .1, 64), backMat); disc.rotation.x = Math.PI / 2;
    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(1.56, .07, 16, 96), goldMat); rimMesh.position.z = .06;
    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(1.74, .022, 12, 96), goldMat); rim2.position.z = .04;
    m.add(disc, face, rimMesh, rim2);
    m.userData = { a: (i / n) * Math.PI * 2, photoMat, phase: i * 1.3 };
    ring.add(m);
    return m;
  }));

  // drifting chocolates + gold dust behind the ring
  const kit = createKit(31);
  const drifters = ['tm', 'ro', 'me', 'he', 'td', 'tw', 'ro', 'me'].map((k) => {
    const o = kit.MAKE[k]();
    o.userData = { x: (kit.rnd() - .5) * 16, y: (kit.rnd() - .5) * 7, z: -6 - kit.rnd() * 6, sp: .1 + kit.rnd() * .15, spin: kit.rnd() * .8 };
    o.scale.setScalar(1.3 + kit.rnd() * .6); scene.add(o); return o;
  });
  const N = 700, pos = new Float32Array(N * 3), seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 30; pos[i * 3 + 1] = (Math.random() - .5) * 16; pos[i * 3 + 2] = -18 + Math.random() * 22; seeds[i] = Math.random(); }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: .08, map: dotTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .85 })));

  let mobile = false;
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); mobile = w < 960; }
  new ResizeObserver(resize).observe(canvas); resize();

  let pTarget = 0, pNow = 0, px = 0, tx = 0, visible = true, last = performance.now();
  if (!reduced) canvas.parentElement.addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - .5; });
  const tmp = new THREE.Vector3();

  function frame() {
    if (!visible) return;
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    pNow += (pTarget - pNow) * (reduced ? 1 : 1 - Math.exp(-4 * dt));
    px += (tx - px) * (1 - Math.exp(-3 * dt));
    const { pos: slot } = slotOf(pNow, n);

    // the ring turns so the current product faces the camera
    ring.rotation.y = -slot * (Math.PI * 2 / n);
    ring.position.set(mobile ? 0 : 3.9, mobile ? 2.5 : .1, 0);
    ring.scale.setScalar(mobile ? .55 : 1);
    medals.forEach((m) => {
      const d = m.userData;
      m.position.set(Math.sin(d.a) * R, Math.sin(t * .8 + d.phase) * .12, Math.cos(d.a) * R);
      m.rotation.y = d.a + Math.sin(t * .5 + d.phase) * .06; // face outward from the ring
      m.getWorldPosition(tmp);
      const front = clamp01((tmp.z - (ring.position.z - R)) / (2 * R)); // 1 at the front, 0 at the back
      // only the front of the ring is shown; medallions fade away as they turn past the sides
      const show = clamp01((front - .2) / .3);
      m.scale.setScalar((.5 + .5 * Math.pow(front, 2)) * show);
      m.visible = show > .01;
      d.photoMat.color.setScalar(.35 + .65 * Math.pow(front, 1.5));
    });

    drifters.forEach((o) => { const d = o.userData; o.position.set(d.x + Math.sin(t * d.sp) * 1.2, d.y + Math.sin(t * d.sp * 1.3 + d.x) * .5, d.z); o.rotation.x += d.spin * dt; o.rotation.y += d.spin * .7 * dt; });
    const p = dustGeo.attributes.position.array;
    if (!reduced) for (let i = 0; i < N; i++) { p[i * 3 + 1] += dt * (.1 + seeds[i] * .2); if (p[i * 3 + 1] > 8) p[i * 3 + 1] = -8; }
    dustGeo.attributes.position.needsUpdate = true;

    camera.position.set(px * .8, 1.4, 15.5);
    camera.lookAt(mobile ? 0 : 2.4, mobile ? 1.6 : .3, 0);
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });

  return { setProgress(p) { pTarget = p; } };
}
