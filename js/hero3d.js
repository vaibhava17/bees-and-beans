// Hero world: the Bees & Beans gift box floats in an emerald night; its lid lifts, warm gold light spills out,
// and handmade chocolates burst out into a slow zero-gravity orbit through drifting gold dust.
// Follows the pointer; as the page scrolls away the orbit widens and the chocolates drift past the camera.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { createKit, setupRenderer } from './choco3d.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(.25, 'rgba(232,196,120,.85)'); gr.addColorStop(1, 'rgba(232,196,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export async function initHero(canvas, { reduced = false } = {}) {
  const renderer = setupRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b2a24, 16, 40);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .5;
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);

  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x0b2a24, .5));
  const key = new THREE.DirectionalLight(0xffe2b8, 2.4); key.position.set(-6, 9, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xcdb17d, 3.4); rim.position.set(7, 4, -7); scene.add(rim);
  const glow = new THREE.PointLight(0xffc46b, 0, 7, 1.6); glow.position.set(0, .9, 0); // light from inside the box

  const kit = createKit(11);
  const world = new THREE.Group(); scene.add(world);

  // the box with its lid
  const gb = kit.giftBox({ lid: true });
  const boxRig = new THREE.Group();
  boxRig.add(gb.box, glow);
  const lid = gb.lid; lid.position.y = gb.size.BH + .02; boxRig.add(lid);
  // a few chocolates already sitting inside the cells
  [['tm', -1.6, -.53], ['ro', -.53, -.53], ['me', .53, -.53], ['td', 1.6, -.53], ['he', -1.6, .53], ['tw', -.53, .53], ['ro', .53, .53], ['me', 1.6, .53]].forEach(([k, x, z]) => {
    const o = kit.MAKE[k](); o.position.set(x, .05, z); o.scale.setScalar(.85); boxRig.add(o);
  });
  boxRig.scale.setScalar(.82);
  world.add(boxRig);

  // orbiting chocolates
  const KINDS = ['tm', 'ro', 'me', 'he', 'td', 'tw'];
  const orbit = Array.from({ length: 18 }, (_, i) => {
    const o = kit.MAKE[KINDS[i % KINDS.length]]();
    const ring = i % 3;
    o.userData = {
      r: [3.1, 4.1, 5.1][ring] + (kit.rnd() - .5) * .5,
      a0: (i / 18) * Math.PI * 2 * 3 + kit.rnd(),
      y: -1 + kit.rnd() * 3.4,
      speed: (.08 + kit.rnd() * .06) * (ring === 1 ? -1 : 1),
      spin: new THREE.Vector3((kit.rnd() - .5) * .8, (kit.rnd() - .5) * 1.2, (kit.rnd() - .5) * .6),
      size: 1.15 + kit.rnd() * .55, phase: kit.rnd() * 6, delay: i * .045,
    };
    o.rotation.set(kit.rnd() * 6, kit.rnd() * 6, kit.rnd() * 6);
    o.scale.setScalar(0);
    world.add(o);
    return o;
  });

  // gold dust
  const N = 650, pos = new Float32Array(N * 3), seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 30; pos[i * 3 + 1] = (Math.random() - .5) * 16; pos[i * 3 + 2] = -14 + Math.random() * 18; seeds[i] = Math.random(); } // kept well behind the camera
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: .09, map: dotTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9, sizeAttenuation: true }));
  scene.add(dust);

  // warm light spilling out of the open box
  const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: 0xffc46b, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  glowSprite.scale.set(9, 6, 1); glowSprite.position.set(0, .9, 0); boxRig.add(glowSprite);
  // soft bokeh orbs far behind for depth
  const bokeh = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: i % 3 ? 0xcdb17d : 0x6fb59f, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .1 + Math.random() * .12 }));
    const sz = 1.5 + Math.random() * 3; s2.scale.set(sz, sz, 1);
    s2.position.set((Math.random() - .5) * 34, (Math.random() - .5) * 16, -16 - Math.random() * 8);
    bokeh.add(s2);
  }
  scene.add(bokeh);

  // sizing
  let mobile = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); mobile = w < 960;
  }
  new ResizeObserver(resize).observe(canvas); resize();

  // inputs
  let px = 0, py = 0, tx = 0, ty = 0, scroll = 0, sTarget = 0;
  if (!reduced) addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });

  const t0 = performance.now();
  let last = t0, visible = true;
  function frame() {
    if (!visible) return;
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = reduced ? 3 : (now - t0) / 1000;
    const k = 1 - Math.exp(-3 * dt);
    px += (tx - px) * k; py += (ty - py) * k; scroll += (sTarget - scroll) * (reduced ? 1 : 1 - Math.exp(-6 * dt));

    // intro: lid lifts (0.3–1.9s), light blooms, chocolates burst out (from 1.1s)
    const open = easeOut(clamp01((t - .3) / 1.6));
    lid.position.set(lerp(0, .4, open), lerp(gb.size.BH + .02, 3.4, open) + Math.sin(t * .9) * .1 * open, lerp(0, -3.2, open));
    lid.rotation.set(lerp(0, .5, open), lerp(0, .3, open), lerp(0, -.12, open));
    glow.intensity = 9 * open;
    glowSprite.material.opacity = .55 * open * (.9 + Math.sin(t * 1.3) * .1);

    orbit.forEach((o) => {
      const d = o.userData, burst = easeOut(clamp01((t - 1.1 - d.delay) / 1.6));
      const r = d.r * burst * (1 + scroll * 1.4);
      const a = d.a0 + t * d.speed;
      o.position.set(Math.cos(a) * r, lerp(.4, d.y + Math.sin(t * .7 + d.phase) * .25, burst) + scroll * (d.y - .8) * 1.2, Math.sin(a) * r * .62 + scroll * 6);
      o.rotation.x += d.spin.x * dt; o.rotation.y += d.spin.y * dt; o.rotation.z += d.spin.z * dt;
      // on desktop, chocolates fade out as their orbit swings behind the headline
      const hide = mobile ? 0 : clamp01((-Math.cos(a) * r - 1.4) / 1.4);
      o.scale.setScalar(d.size * burst * (1 - hide));
      o.visible = burst * (1 - hide) > .01;
    });

    // gold dust rises slowly
    const p = dustGeo.attributes.position.array;
    if (!reduced) for (let i = 0; i < N; i++) { p[i * 3 + 1] += dt * (.12 + seeds[i] * .25); if (p[i * 3 + 1] > 8) p[i * 3 + 1] = -8; }
    dustGeo.attributes.position.needsUpdate = true;
    dust.rotation.y = t * .01;
    bokeh.position.x = -px * 1.5; bokeh.position.y = py * .8;

    boxRig.rotation.set(.12 + Math.sin(t * .5) * .03, -.5 + t * .05 + px * .4, Math.sin(t * .4) * .03);
    boxRig.position.y = Math.sin(t * .8) * .12 - .3;
    world.position.set(mobile ? 0 : 3.3, mobile ? 3.1 : 0, 0);
    world.scale.setScalar(mobile ? .5 : 1);
    world.rotation.set(py * .12, px * .25, 0);

    camera.position.set(px * .8, 2.4 - py * .6 - scroll * 1.5, 15 - scroll * 3);
    camera.lookAt(mobile ? 0 : 1.5, mobile ? 1.2 : .4, 0);
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });

  return { setScroll(v) { sTarget = v; } };
}
