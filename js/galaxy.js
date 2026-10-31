// Galaxy: the hero and the craft story as one journey through an emerald night full of gold dust.
// Chapter 0 — the Bees & Beans gift box opens and chocolates float out into orbit.
// Scrolling flies the camera forward through space to each craft chapter, waiting further along the path:
// 1 a cacao pod with ingredients in orbit · 2 a copper bowl of swirling chocolate · 3 a mould tray filling
// 4 a single truffle having its cross piped on while gold leaf drifts.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { gsap } from 'gsap';
import { createKit, setupRenderer } from './choco3d.js';

export const CHAPTERS = 5;
const SPACING = 30;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// scroll progress → chapter index + camera travel (each chapter holds, then the camera flies to the next)
export function travelOf(p) {
  const seg = Math.min(CHAPTERS - .0001, Math.max(0, p) * CHAPTERS), i = Math.floor(seg), f = seg - i;
  const travel = i + (i < CHAPTERS - 1 ? smooth(clamp01((f - .58) / .42)) : 0);
  return { chapter: Math.round(travel), travel }; // the caption follows where the camera actually is
}

function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(.25, 'rgba(232,196,120,.85)'); gr.addColorStop(1, 'rgba(232,196,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export async function initGalaxy(canvas, { reduced = false } = {}) {
  const renderer = setupRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b2a24, 18, 48);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .55;
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 120);
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x0b2a24, .6));
  const key = new THREE.DirectionalLight(0xffe2b8, 2.6); key.position.set(-6, 9, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xcdb17d, 3.2); rim.position.set(7, 4, -7); scene.add(rim);

  const kit = createKit(11), rnd = kit.rnd, M = kit.M;
  const mat = (color, rough = .6, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  const dot = dotTexture();
  const chapters = Array.from({ length: CHAPTERS }, (_, i) => { const g = new THREE.Group(); g.position.z = -SPACING * i; scene.add(g); return g; });

  /* ---------- 0: the gift box opens, chocolates burst into orbit ---------- */
  const c0 = chapters[0];
  const gb = kit.giftBox({ lid: true });
  const boxRig = new THREE.Group(); boxRig.add(gb.box);
  const lid = gb.lid; lid.position.y = gb.size.BH + .02; boxRig.add(lid);
  [['tm', -1.6, -.53], ['ro', -.53, -.53], ['me', .53, -.53], ['td', 1.6, -.53], ['he', -1.6, .53], ['tw', -.53, .53], ['ro', .53, .53], ['me', 1.6, .53]]
    .forEach(([k, x, z]) => { const o = kit.MAKE[k](); o.position.set(x, .05, z); o.scale.setScalar(.85); boxRig.add(o); });
  const glow = new THREE.PointLight(0xffc46b, 0, 7, 1.6); glow.position.set(0, .9, 0); boxRig.add(glow);
  const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xffc46b, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  glowSprite.scale.set(9, 6, 1); glowSprite.position.set(0, .9, 0); boxRig.add(glowSprite);
  boxRig.scale.setScalar(.82); c0.add(boxRig);
  const KINDS = ['tm', 'ro', 'me', 'he', 'td', 'tw'];
  const orbit = Array.from({ length: 18 }, (_, i) => {
    const o = kit.MAKE[KINDS[i % KINDS.length]](), ring = i % 3;
    o.userData = { r: [3.1, 4.1, 5.1][ring] + (rnd() - .5) * .5, a0: (i / 18) * Math.PI * 6 + rnd(), y: -1 + rnd() * 3.4, speed: (.08 + rnd() * .06) * (ring === 1 ? -1 : 1),
      spin: new THREE.Vector3((rnd() - .5) * .8, (rnd() - .5) * 1.2, (rnd() - .5) * .6), size: 1.15 + rnd() * .55, phase: rnd() * 6, delay: i * .045 };
    o.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6); o.scale.setScalar(0); c0.add(o);
    return o;
  });

  /* ---------- 1: cacao pod + ingredients in orbit ---------- */
  const c1 = chapters[1];
  const podProfile = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; podProfile.push(new THREE.Vector2(Math.max(.02, .62 * Math.pow(Math.sin(Math.PI * t), .75) * (1 - .12 * t)), -1.35 + t * 2.7)); }
  const podGeo = mergeVertices(new THREE.LatheGeometry(podProfile, 64).deleteAttribute('normal').deleteAttribute('uv'));
  const pp = podGeo.attributes.position;
  for (let k = 0; k < pp.count; k++) { const x = pp.getX(k), z = pp.getZ(k), f = 1 + .07 * Math.pow(Math.abs(Math.cos(Math.atan2(z, x) * 5)), 3); pp.setX(k, x * f); pp.setZ(k, z * f); }
  podGeo.computeVertexNormals();
  const podRig = new THREE.Group();
  podRig.add(new THREE.Mesh(podGeo, new THREE.MeshPhysicalMaterial({ color: 0xd8962a, roughness: .42, clearcoat: .5, sheen: .5, sheenColor: new THREE.Color(0xa0521a) })));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, .35, 10), mat(0x6b4a2a, .8)); stem.position.y = 1.45; podRig.add(stem);
  podRig.rotation.z = -.5; podRig.scale.setScalar(1.25); c1.add(podRig);
  const ball = new THREE.SphereGeometry(1, 20, 14);
  const ING = [[mat(0x5a3020, .75), [.26, .14, .17], 10], [mat(0xb98256, .7), [.3, .12, .17], 7], [mat(0x8faa45, .6), [.2, .13, .15], 6],
    [new THREE.MeshPhysicalMaterial({ color: 0x9a1f2c, roughness: .35, clearcoat: .6 }), [.13, .13, .13], 6], [mat(0xa8743f, .55), [.17, .16, .17], 5]];
  const bits = [];
  ING.forEach(([m, sc, n]) => { for (let i = 0; i < n; i++) {
    const o = new THREE.Mesh(ball, m); o.scale.set(...sc).multiplyScalar(1.3);
    o.userData = { r: 1.9 + rnd() * 2.4, a: rnd() * Math.PI * 2, y: (rnd() - .5) * 3, sp: (.15 + rnd() * .2) * (rnd() > .5 ? 1 : -1), spin: rnd() * 2 };
    c1.add(o); bits.push(o);
  } });

  /* ---------- 2: copper bowl of swirling chocolate + spatula ---------- */
  const c2 = chapters[2];
  const bowlPts = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; bowlPts.push(new THREE.Vector2(.25 + 1.65 * Math.sin(t * Math.PI / 2), -1 + 1.15 * (1 - Math.cos(t * Math.PI / 2)))); }
  bowlPts.push(new THREE.Vector2(1.98, .2), new THREE.Vector2(1.84, .22));
  const bowlRig = new THREE.Group(); bowlRig.scale.setScalar(1.25); bowlRig.rotation.x = .25; c2.add(bowlRig);
  bowlRig.add(new THREE.Mesh(new THREE.LatheGeometry(bowlPts, 72), new THREE.MeshStandardMaterial({ color: 0xc27a4a, roughness: .26, metalness: 1, side: THREE.DoubleSide })));
  const surf = new THREE.Mesh(new THREE.RingGeometry(.001, 1.82, 96, 18), new THREE.MeshStandardMaterial({ color: 0x26110a, roughness: .3, metalness: 0, envMapIntensity: .2, side: THREE.DoubleSide }));
  surf.rotation.x = -Math.PI / 2; surf.position.y = .02; bowlRig.add(surf);
  const surfBase = surf.geometry.attributes.position.array.slice();
  const spatula = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(.5, .05, .8), mat(0xe9e2d6, .5)); blade.position.y = -.2;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, 2.4, 12), mat(0x7a5232, .6)); handle.position.y = 1;
  spatula.add(blade, handle); spatula.rotation.z = .45; bowlRig.add(spatula);
  const bowlGlow = new THREE.PointLight(0xffd29a, 3, 8, 1.6); bowlGlow.position.set(0, 2.5, 1.5); c2.add(bowlGlow);

  /* ---------- 3: mould tray, cavities filling one by one ---------- */
  const c3 = chapters[3];
  const trayRig = new THREE.Group(); trayRig.rotation.x = .35; trayRig.scale.setScalar(1.15); c3.add(trayRig);
  const trayMat = new THREE.MeshPhysicalMaterial({ color: 0x3a3836, roughness: .22, clearcoat: .9 });
  const trayBase = new THREE.Mesh(new THREE.BoxGeometry(4.6, .3, 3.5), trayMat); trayBase.position.y = -.15; trayRig.add(trayBase);
  const ringGeo = new THREE.TorusGeometry(.42, .05, 10, 40); ringGeo.rotateX(Math.PI / 2);
  const holeGeo = new THREE.CircleGeometry(.42, 40); holeGeo.rotateX(-Math.PI / 2);
  const domeGeo = new THREE.SphereGeometry(.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const cells = [];
  for (let c = 0; c < 4; c++) for (let r = 0; r < 3; r++) {
    const x = (c - 1.5) * 1.08, z = (r - 1) * 1.08;
    const ring = new THREE.Mesh(ringGeo, trayMat); ring.position.set(x, .01, z);
    const h = new THREE.Mesh(holeGeo, mat(0x111111, .4)); h.position.set(x, .005, z);
    const fill = new THREE.Mesh(domeGeo, M.dark); fill.position.set(x, -.02, z); fill.scale.set(1, .001, 1);
    trayRig.add(ring, h, fill); cells.push(fill);
  }
  const pour = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3, 12), M.dark); trayRig.add(pour); // the stream of chocolate
  const trayGlow = new THREE.PointLight(0xffd29a, 5, 9, 1.6); trayGlow.position.set(0, 3, 2); c3.add(trayGlow);

  /* ---------- 4: one truffle, cross piped on, gold leaf ---------- */
  const c4 = chapters[4];
  const cup = kit.MAKE.td();
  cup.children.slice(1).forEach((c) => (c.visible = false));
  cup.scale.setScalar(4.2); cup.position.y = -.7; cup.rotation.x = .55; const cupRig = new THREE.Group(); cupRig.add(cup); c4.add(cupRig);
  const crossCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.37, .2, 0), new THREE.Vector3(-.33, .39, 0), new THREE.Vector3(0, .4, 0), new THREE.Vector3(.33, .39, 0), new THREE.Vector3(.37, .24, 0)]);
  const crosses = [0, Math.PI / 2].map((rot) => { const tube = new THREE.Mesh(new THREE.TubeGeometry(crossCurve, 64, .024, 10), M.white); tube.rotation.y = rot + .5; cup.add(tube); return tube; });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0xd4af5a, roughness: .25, metalness: 1, side: THREE.DoubleSide });
  const leaves = Array.from({ length: 22 }, () => {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(.18 + rnd() * .16, .12 + rnd() * .1), leafMat);
    l.userData = { x: (rnd() - .5) * 5, z: (rnd() - .5) * 3, y0: rnd() * 6, sp: .3 + rnd() * .3, rx: rnd() * 3, ry: rnd() * 3 }; c4.add(l); return l;
  });
  const truffleGlow = new THREE.PointLight(0xffd29a, 5, 9, 1.6); truffleGlow.position.set(-1.5, 2.5, 2.5); c4.add(truffleGlow);

  /* ---------- the galaxy: gold dust along the whole path + far bokeh ---------- */
  const N = 1800, pos = new Float32Array(N * 3), seeds = new Float32Array(N), zMin = -SPACING * (CHAPTERS - 1) - 24;
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 34; pos[i * 3 + 1] = (Math.random() - .5) * 18; pos[i * 3 + 2] = zMin + Math.random() * (14 - zMin); seeds[i] = Math.random(); }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: .09, map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 }));
  scene.add(dust);
  const bokeh = new THREE.Group();
  for (let i = 0; i < 40; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: i % 3 ? 0xcdb17d : 0x6fb59f, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .08 + Math.random() * .12 }));
    const sz = 1.5 + Math.random() * 3.5; s.scale.set(sz, sz, 1);
    s.position.set((Math.random() - .5) * 40, (Math.random() - .5) * 18, zMin + Math.random() * (zMin * -1 - 4));
    bokeh.add(s);
  }
  scene.add(bokeh);

  /* ---------- run ---------- */
  let mobile = false;
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); mobile = w < 960; }
  new ResizeObserver(resize).observe(canvas); resize();

  let px = 0, py = 0, tx = 0, ty = 0, pTarget = 0, pNow = 0, chapterNow = 0, chapterT = 0, visible = true;
  if (!reduced) addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  const t0 = performance.now(); let last = t0;

  function frame() {
    if (!visible) return;
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = reduced ? 3 : (now - t0) / 1000;
    px += (tx - px) * (1 - Math.exp(-3 * dt)); py += (ty - py) * (1 - Math.exp(-3 * dt));
    pNow += (pTarget - pNow) * (reduced ? 1 : 1 - Math.exp(-4 * dt));
    const { chapter, travel } = travelOf(pNow);
    if (chapter !== chapterNow) { chapterNow = chapter; chapterT = 0; } else chapterT += dt;
    const camZ = 15 - travel * SPACING;

    // layout: scenes sit right of the copy on desktop, above it on mobile
    chapters.forEach((g, i) => {
      g.position.x = mobile ? 0 : 3.3; g.position.y = mobile ? 3 : 0;
      g.scale.setScalar(mobile ? .5 : 1);
      g.visible = Math.abs(g.position.z - camZ) < 50 && g.position.z < camZ - 2;
    });

    // 0 — box opens, orbit
    if (chapters[0].visible) {
      const open = easeOut(clamp01((t - .3) / 1.6));
      lid.position.set(lerp(0, .4, open), lerp(gb.size.BH + .02, 3.4, open) + Math.sin(t * .9) * .1 * open, lerp(0, -3.2, open));
      lid.rotation.set(lerp(0, .5, open), lerp(0, .3, open), lerp(0, -.12, open));
      glow.intensity = 9 * open; glowSprite.material.opacity = .55 * open * (.9 + Math.sin(t * 1.3) * .1);
      orbit.forEach((o) => {
        const d = o.userData, burst = easeOut(clamp01((t - 1.1 - d.delay) / 1.6)), r = d.r * burst, a = d.a0 + t * d.speed;
        o.position.set(Math.cos(a) * r, lerp(.4, d.y + Math.sin(t * .7 + d.phase) * .25, burst), Math.sin(a) * r * .62);
        o.rotation.x += d.spin.x * dt; o.rotation.y += d.spin.y * dt; o.rotation.z += d.spin.z * dt;
        const hide = mobile ? 0 : clamp01((-Math.cos(a) * r - 1.4) / 1.4) * (travel < .3 ? 1 : 0); // keep the headline clear
        o.scale.setScalar(d.size * burst * (1 - hide)); o.visible = burst * (1 - hide) > .01;
      });
      boxRig.rotation.set(.12 + Math.sin(t * .5) * .03, -.5 + t * .05 + px * .4, Math.sin(t * .4) * .03);
      boxRig.position.y = Math.sin(t * .8) * .12 - .3;
    }
    // 1 — ingredients orbit the pod
    if (chapters[1].visible) {
      podRig.rotation.y = t * .3;
      bits.forEach((o) => { const d = o.userData, a = d.a + t * d.sp; o.position.set(Math.cos(a) * d.r, d.y + Math.sin(t + d.a) * .15, Math.sin(a) * d.r * .7); o.rotation.set(t * d.spin, t * d.spin * .7, 0); });
    }
    // 2 — the chocolate swirls, the spatula stirs
    if (chapters[2].visible) {
      const a = surf.geometry.attributes.position.array, amp = reduced ? 0 : .05;
      for (let k = 0; k < a.length; k += 3) { const x = surfBase[k], y = surfBase[k + 1], r = Math.hypot(x, y), th = Math.atan2(y, x); a[k + 2] = amp * Math.sin(r * 5 - t * 2.2 + th * 2) * (r / 1.82) * (1 - r / 1.9); }
      surf.geometry.attributes.position.needsUpdate = true; surf.geometry.computeVertexNormals();
      surf.rotation.z = t * .25;
      const sa = t * .9; spatula.position.set(Math.cos(sa) * .8, .55, Math.sin(sa) * .8); spatula.rotation.y = -sa;
      bowlRig.rotation.y = px * .4;
    }
    // 3 — cavities fill one by one, a thin stream pouring into the current one
    if (chapters[3].visible) {
      const cycle = (chapter === 3 ? chapterT : t) * 1.1 % 16;
      let current = -1;
      cells.forEach((c, i) => { const f = smooth(clamp01(cycle - i * 1.1)); c.scale.set(1, Math.max(.001, f * .55), 1); if (f > 0 && f < 1 && current < 0) current = i; });
      pour.visible = current >= 0;
      if (current >= 0) pour.position.set(cells[current].position.x, 1.6, cells[current].position.z);
      trayRig.rotation.y = px * .3 + Math.sin(t * .3) * .1;
    }
    // 4 — the truffle turns while the cross is piped; gold leaf drifts
    if (chapters[4].visible) {
      cupRig.rotation.y = t * .35;
      const draw = chapter === 4 ? clamp01((chapterT - .3) / 2.6) : 0;
      crosses.forEach((tube, i) => { const n = tube.geometry.index.count, f = clamp01(draw * 2 - i); tube.geometry.setDrawRange(0, Math.floor(n * f / 6) * 6); });
      leaves.forEach((l) => { const d = l.userData; l.position.set(d.x + Math.sin(t + d.y0) * .3, 3.6 - ((d.y0 + t * d.sp) % 6), d.z); l.rotation.set(d.rx + t, d.ry + t * .7, 0); });
    }

    // dust drifts up; camera flies along the path with a little pointer parallax
    const p = dustGeo.attributes.position.array;
    if (!reduced) for (let i = 0; i < N; i++) { p[i * 3 + 1] += dt * (.12 + seeds[i] * .25); if (p[i * 3 + 1] > 9) p[i * 3 + 1] = -9; }
    dustGeo.attributes.position.needsUpdate = true;
    camera.position.set(px * .9, 2.4 - py * .6 + Math.sin(travel * Math.PI) * .6, camZ);
    camera.lookAt(mobile ? 0 : 1.5, mobile ? 1.3 : .4, camZ - 15);
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });

  return { setProgress(p) { pTarget = p; } };
}
