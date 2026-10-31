// Festive seasons: the gift box stays at the centre while the world around it changes with each festival.
// 0 Diwali — clay diyas with flickering flames circle the box, sky lanterns rise, warm sparks drift up
// 1 Christmas — glossy baubles float around the box while soft snow falls
// 2 New Year — gold fireworks burst behind, champagne bubbles rise, confetti flutters
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { createKit, setupRenderer } from './choco3d.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (t) => t * t * (3 - 2 * t);

export function seasonOf(p, n = 3) {
  const seg = Math.min(n - .0001, Math.max(0, p) * n), i = Math.floor(seg), f = seg - i;
  const pos = i + (i < n - 1 ? smooth(clamp01((f - .6) / .4)) : 0);
  return { active: Math.round(pos), pos };
}

function glowTexture(inner = 'rgba(255,240,200,1)', mid = 'rgba(255,170,60,.8)') {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, inner); gr.addColorStop(.3, mid); gr.addColorStop(1, 'rgba(255,140,40,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
function flameTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 92, 2, 32, 78, 56);
  gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(.25, 'rgba(255,214,110,.95)'); gr.addColorStop(.6, 'rgba(255,130,30,.55)'); gr.addColorStop(1, 'rgba(255,90,0,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(32, 4); g.bezierCurveTo(58, 60, 58, 120, 32, 124); g.bezierCurveTo(6, 120, 6, 60, 32, 4); g.fill();
  return new THREE.CanvasTexture(c);
}
// a points cloud whose positions we animate; opacity is multiplied by the season's visibility
function cloud(n, size, color, map, blending = THREE.AdditiveBlending) {
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const m = new THREE.PointsMaterial({ size, color, map, transparent: true, depthWrite: false, blending, opacity: 0 });
  return new THREE.Points(geo, m);
}

export async function initSeasons(canvas, { reduced = false } = {}) {
  const renderer = setupRenderer(canvas);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .55;
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x1a0b0e, .6));
  const key = new THREE.DirectionalLight(0xffe2b8, 2.3); key.position.set(-6, 9, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xcdb17d, 2.6); rim.position.set(7, 4, -7); scene.add(rim);
  const warm = new THREE.PointLight(0xffa040, 0, 12, 1.4); warm.position.set(0, 1, 3); scene.add(warm);

  const kit = createKit(41), rnd = kit.rnd;
  const world = new THREE.Group(); scene.add(world);

  // the gift box, lid on, turning slowly at the centre
  const gb = kit.giftBox({ lid: true });
  const boxRig = new THREE.Group(); boxRig.add(gb.box); gb.lid.position.y = gb.size.BH + .02; boxRig.add(gb.lid);
  boxRig.scale.setScalar(.72); boxRig.rotation.x = .18; world.add(boxRig);

  const seasons = [0, 1, 2].map(() => { const g = new THREE.Group(); g.userData.vis = 0; world.add(g); return g; });

  /* --- Diwali --- */
  const flameTex = flameTexture(), glowTex = glowTexture();
  const clay = new THREE.MeshStandardMaterial({ color: 0xb4532a, roughness: .8, transparent: true });
  const diyaPts = [new THREE.Vector2(.02, -.16), new THREE.Vector2(.28, -.14), new THREE.Vector2(.42, -.04), new THREE.Vector2(.46, .06), new THREE.Vector2(.4, .07), new THREE.Vector2(.3, -.02), new THREE.Vector2(.02, -.06)];
  const diyaGeo = new THREE.LatheGeometry(diyaPts, 32);
  const diyas = Array.from({ length: 12 }, (_, i) => {
    const d = new THREE.Group();
    const bowl = new THREE.Mesh(diyaGeo, clay); bowl.scale.set(1, 1, 1.25); d.add(bowl); // a spout-ish oval
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    flame.scale.set(.32, .64, 1); flame.position.set(0, .34, .18); d.add(flame);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .5 }));
    halo.scale.set(1.6, 1.6, 1); halo.position.set(0, .3, .18); d.add(halo);
    d.userData = { a: (i / 12) * Math.PI * 2, r: 2.7 + (i % 2) * .4, y: -1.1 + (i % 3) * .35, flame, halo, ph: rnd() * 10 };
    seasons[0].add(d); return d;
  });
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0xffb35c, emissive: 0xff8a2a, emissiveIntensity: 1.6, roughness: .8, transparent: true, opacity: .92 });
  const lanterns = Array.from({ length: 7 }, () => {
    const l = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.32, .24, .62, 20, 1, true), lanternMat); l.add(body);
    const g2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .6 })); g2.scale.set(2.2, 2.2, 1); l.add(g2);
    l.userData = { x: -2 + rnd() * 8, z: -3 - rnd() * 6, y0: rnd() * 12, sp: .35 + rnd() * .3, ph: rnd() * 6, glow: g2 };
    seasons[0].add(l); return l;
  });
  const sparks = cloud(160, .12, 0xffb050, glowTex); seasons[0].add(sparks);
  const sparkSeeds = Array.from({ length: 160 }, () => [-2 + rnd() * 9, rnd() * 10, (rnd() - .5) * 8, .4 + rnd() * .8]);

  /* --- Christmas --- */
  const baubleMats = [0xc9a46a, 0x9e1e2c, 0x1d6b55, 0xe9e2d6].map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: .12, metalness: c === 0xe9e2d6 ? .1 : .8, clearcoat: 1, transparent: true }));
  const capMat = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .3, metalness: 1, transparent: true });
  const baubles = Array.from({ length: 16 }, (_, i) => {
    const b = new THREE.Group(), r = .24 + rnd() * .2;
    b.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), baubleMats[i % 4]));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * .28, r * .28, r * .3, 12), capMat); cap.position.y = r * 1.02; b.add(cap);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(r * .16, r * .04, 8, 16), capMat); loop.position.y = r * 1.28; b.add(loop);
    b.userData = { a: (i / 16) * Math.PI * 2 + rnd(), r: 2.6 + rnd() * 1.6, y: -1.2 + rnd() * 3.4, sp: .1 + rnd() * .1, ph: rnd() * 6 };
    seasons[1].add(b); return b;
  });
  const snowTex = glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,.6)');
  const snow = cloud(520, .1, 0xffffff, snowTex, THREE.NormalBlending); seasons[1].add(snow);
  const snowSeeds = Array.from({ length: 520 }, () => [(rnd() - .5) * 22, rnd() * 14, -10 + rnd() * 14, .3 + rnd() * .5, rnd() * 6]);

  /* --- New Year --- */
  const fwTex = glowTexture('rgba(255,250,230,1)', 'rgba(243,207,122,.85)');
  const bursts = Array.from({ length: 4 }, (_, k) => {
    const pts = cloud(220, .34, [0xf3cf7a, 0xffe7b0, 0xe8829a, 0xf3cf7a][k], fwTex);
    pts.userData = { t: -k * .9, dirs: Array.from({ length: 220 }, () => { const v = new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize(); return v.multiplyScalar(2.6 + rnd() * 1.4); }), c: new THREE.Vector3(1 + k, 2.5, -4) };
    seasons[2].add(pts); return pts;
  });
  const bubbles = cloud(180, .09, 0xfff1c9, fwTex); seasons[2].add(bubbles);
  const bubbleSeeds = Array.from({ length: 180 }, () => [(rnd() - .5) * 10, rnd() * 10, (rnd() - .5) * 6, .5 + rnd()]);
  const confettiCols = [0xf3cf7a, 0xe8829a, 0x82c7e8, 0xffffff];
  const confetti = Array.from({ length: 40 }, (_, i) => {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(.1, .2), new THREE.MeshStandardMaterial({ color: confettiCols[i % 4], side: THREE.DoubleSide, roughness: .4, metalness: .3, transparent: true }));
    c.userData = { x: -2 + rnd() * 9, z: (rnd() - .5) * 6, y0: rnd() * 10, sp: .5 + rnd() * .5, r: rnd() * 6 };
    seasons[2].add(c); return c;
  });

  let mobile = false;
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); mobile = w < 960; }
  new ResizeObserver(resize).observe(canvas); resize();

  let pTarget = 0, pNow = 0, px = 0, tx = 0, visible = true, last = performance.now();
  if (!reduced) canvas.parentElement.addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - .5; });

  // remember each material's own opacity so seasons can fade in and out
  seasons.forEach((g) => g.traverse((o) => { if (o.material) o.material.userData.base ??= o.material.opacity || 1; }));

  function frame() {
    if (!visible) return;
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    pNow += (pTarget - pNow) * (reduced ? 1 : 1 - Math.exp(-4 * dt));
    px += (tx - px) * (1 - Math.exp(-3 * dt));
    const { pos } = seasonOf(pNow);

    seasons.forEach((g, i) => {
      g.userData.vis = clamp01(1 - Math.abs(pos - i) * 1.6);
      const v = smooth(g.userData.vis);
      g.visible = v > .01;
      g.scale.setScalar(.75 + .25 * v);
      g.traverse((o) => { const m = o.material; if (m && m.transparent && m.userData.base !== undefined) m.opacity = m.userData.base * v; });
    });

    // Diwali
    if (seasons[0].visible) {
      diyas.forEach((d) => {
        const u = d.userData, a = u.a + t * .12;
        d.position.set(Math.cos(a) * u.r, u.y + Math.sin(t + u.ph) * .08, Math.sin(a) * u.r * .55);
        const fl = 1 + Math.sin(t * 13 + u.ph) * .08 + Math.sin(t * 23 + u.ph * 2) * .05;
        u.flame.scale.set(.32 * fl, .64 * (2 - fl), 1); u.halo.material.opacity = (.42 + Math.sin(t * 9 + u.ph) * .08) * seasons[0].userData.vis;
      });
      lanterns.forEach((l) => { const u = l.userData; l.position.set(u.x + Math.sin(t * .4 + u.ph) * .5, ((u.y0 + t * u.sp) % 12) - 5, u.z); l.rotation.y = t * .3; });
      const a = sparks.geometry.attributes.position.array;
      sparkSeeds.forEach(([x, y0, z, sp], i) => { a[i * 3] = x + Math.sin(t + i) * .2; a[i * 3 + 1] = ((y0 + t * sp) % 10) - 4; a[i * 3 + 2] = z; });
      sparks.geometry.attributes.position.needsUpdate = true;
    }
    warm.intensity = 14 * smooth(seasons[0].userData.vis);
    // Christmas
    if (seasons[1].visible) {
      baubles.forEach((b) => { const u = b.userData, a = u.a + t * u.sp; b.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * .8 + u.ph) * .2, Math.sin(a) * u.r * .6); b.rotation.z = Math.sin(t + u.ph) * .3; });
      const a = snow.geometry.attributes.position.array;
      snowSeeds.forEach(([x, y0, z, sp, ph], i) => { a[i * 3] = x + Math.sin(t * .6 + ph) * .4; a[i * 3 + 1] = 7 - ((y0 + t * sp) % 14); a[i * 3 + 2] = z; });
      snow.geometry.attributes.position.needsUpdate = true;
    }
    // New Year
    if (seasons[2].visible) {
      bursts.forEach((b) => {
        const u = b.userData; u.t += dt;
        if (u.t > 2.6) { u.t = 0; u.c.set(-1.5 + rnd() * 7, 1.6 + rnd() * 2.6, -3 - rnd() * 3); }
        const k = Math.max(0, u.t), a = b.geometry.attributes.position.array, ease = 1 - Math.exp(-2.4 * k);
        u.dirs.forEach((d, i) => { a[i * 3] = u.c.x + d.x * ease; a[i * 3 + 1] = u.c.y + d.y * ease - .5 * k * k; a[i * 3 + 2] = u.c.z + d.z * ease; });
        b.geometry.attributes.position.needsUpdate = true;
        b.material.opacity = (u.t < 0 ? 0 : clamp01(1 - u.t / 2.4)) * smooth(seasons[2].userData.vis);
      });
      const a = bubbles.geometry.attributes.position.array;
      bubbleSeeds.forEach(([x, y0, z, sp], i) => { a[i * 3] = x + Math.sin(t * 2 + i) * .08; a[i * 3 + 1] = ((y0 + t * sp) % 10) - 4; a[i * 3 + 2] = z; });
      bubbles.geometry.attributes.position.needsUpdate = true;
      confetti.forEach((c) => { const u = c.userData; c.position.set(u.x + Math.sin(t + u.r) * .6, 6 - ((u.y0 + t * u.sp) % 11), u.z); c.rotation.set(t * 2 + u.r, t * 1.3 + u.r, t); });
    }

    boxRig.rotation.y = -.6 + t * .12 + px * .4;
    boxRig.position.y = -.2 + Math.sin(t * .8) * .1;
    world.position.set(mobile ? 0 : 3.6, mobile ? 2.4 : 0, 0);
    world.scale.setScalar(mobile ? .55 : 1);
    camera.position.set(px * .8, 2.2, 15);
    camera.lookAt(mobile ? 0 : 1.6, mobile ? 1.4 : .3, 0);
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });

  return { setProgress(p) { pTarget = p; } };
}
