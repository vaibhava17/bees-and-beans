// Night sky behind the contact section and footer: gold dust, drifting chocolates and mini gift boxes.
// celebrate() bursts everything outward when an enquiry is sent.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { createKit, setupRenderer } from './choco3d.js';

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(.3, 'rgba(232,196,120,.8)'); gr.addColorStop(1, 'rgba(232,196,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export async function initNight(canvas, { reduced = false } = {}) {
  const renderer = setupRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x061a16, 10, 30); // keeps the drifting chocolates soft behind the text
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .5;
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 80);
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x061a16, .6));
  const key = new THREE.DirectionalLight(0xffe2b8, 2); key.position.set(-6, 9, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xcdb17d, 2.4); rim.position.set(7, 4, -7); scene.add(rim);

  const kit = createKit(67), rnd = kit.rnd, glowTex = glowTexture();
  const floaters = [];
  ['tm', 'ro', 'me', 'he', 'td', 'tw', 'ro', 'me', 'tm', 'he', 'td', 'ro'].forEach((k) => floaters.push(kit.MAKE[k]()));
  for (let i = 0; i < 4; i++) { // mini gift boxes
    const gb = kit.giftBox({ lid: true }), g = new THREE.Group();
    g.add(gb.box); gb.lid.position.y = gb.size.BH + .02; g.add(gb.lid); g.scale.setScalar(.22); floaters.push(g);
  }
  floaters.forEach((o, i) => {
    o.userData = { home: new THREE.Vector3((rnd() - .5) * 26, (rnd() - .5) * 18, -9 - rnd() * 12), spin: new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).multiplyScalar(.8),
      size: (o.isGroup && o.children.length > 3 ? 1 : 1.3 + rnd() * .7), ph: rnd() * 6, burst: new THREE.Vector3() };
    o.scale.multiplyScalar(o.userData.size);
    o.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6);
    scene.add(o);
  });

  const N = 900, base = new Float32Array(N * 3), seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) { base[i * 3] = (Math.random() - .5) * 32; base[i * 3 + 1] = (Math.random() - .5) * 24; base[i * 3 + 2] = -16 + Math.random() * 20; seeds[i] = Math.random(); }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: .08, map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .85 })));
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd28a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  flash.scale.set(14, 14, 1); flash.position.set(0, 0, -6); scene.add(flash);

  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(canvas); resize();

  let pTarget = 0, pNow = 0, px = 0, tx = 0, visible = true, last = performance.now(), boom = 0;
  if (!reduced) addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - .5; }, { passive: true });

  function frame() {
    if (!visible) return;
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    pNow += (pTarget - pNow) * (1 - Math.exp(-4 * dt));
    px += (tx - px) * (1 - Math.exp(-3 * dt));
    boom = Math.max(0, boom - dt * .55);
    const b = boom * boom; // eases out

    floaters.forEach((o) => {
      const d = o.userData;
      o.position.set(d.home.x + Math.sin(t * .2 + d.ph) * .8 + d.burst.x * b, d.home.y + Math.sin(t * .3 + d.ph) * .6 - pNow * 6 + d.burst.y * b, d.home.z + d.burst.z * b);
      o.rotation.x += d.spin.x * dt * (1 + b * 8); o.rotation.y += d.spin.y * dt * (1 + b * 8);
    });
    const p = dustGeo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      const k = i * 3, f = 1 + b * (2 + seeds[i] * 3);
      if (!reduced) base[k + 1] += dt * (.1 + seeds[i] * .2); if (base[k + 1] > 12) base[k + 1] = -12;
      p[k] = base[k] * f; p[k + 1] = base[k + 1] * f - pNow * 4; p[k + 2] = base[k + 2];
    }
    dustGeo.attributes.position.needsUpdate = true;
    flash.material.opacity = .7 * b;

    camera.position.set(px * 1.2, 0, 14);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });

  return {
    setProgress(v) { pTarget = v; },
    celebrate() {
      if (reduced) return;
      floaters.forEach((o) => { const d = o.userData; d.burst.copy(d.home).setZ(0).normalize().multiplyScalar(6 + rnd() * 6); d.burst.z = 4 + rnd() * 6; });
      boom = 1;
    },
  };
}
