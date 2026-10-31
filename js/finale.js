// Finale: bulk gifting, why us, the story and an invitation — one pinned 3D scene in the galaxy.
// 0 dozens of ribboned gift boxes fly in and stack into a pyramid (gifting at scale)
// 1 six gold seals orbit (the six reasons)
// 2 a golden bee loops around a glossy cocoa bean (Bees & Beans)
// 3 the gift box opens and a gold-edged invitation card with a wax seal rises out of it
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { createKit, setupRenderer } from './choco3d.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

export function chapterOf(p, n = 4) {
  const seg = Math.min(n - .0001, Math.max(0, p) * n), i = Math.floor(seg), f = seg - i;
  const pos = i + (i < n - 1 ? smooth(clamp01((f - .6) / .4)) : 0);
  return { active: Math.round(pos), pos, local: f };
}

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(.3, 'rgba(232,196,120,.8)'); gr.addColorStop(1, 'rgba(232,196,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
function cardTexture() {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 800;
  const g = c.getContext('2d');
  g.fillStyle = '#f8f2e6'; g.fillRect(0, 0, 1200, 800);
  for (let i = 0; i < 7000; i++) { g.fillStyle = `rgba(150,120,80,${Math.random() * .04})`; g.fillRect(Math.random() * 1200, Math.random() * 800, 2, 2); }
  g.strokeStyle = '#b8975a'; g.lineWidth = 8; g.strokeRect(40, 40, 1120, 720);
  g.lineWidth = 2; g.strokeRect(64, 64, 1072, 672);
  g.textAlign = 'center';
  g.fillStyle = '#a9884e'; g.font = '500 30px Jost, Futura, sans-serif'; g.fillText('B Y   I N V I T A T I O N', 600, 210);
  g.fillStyle = '#123d35'; g.font = '400 110px "Libre Caslon Display", Georgia, serif'; g.fillText('Bees & Beans', 600, 350);
  g.fillStyle = '#a9884e'; g.font = 'italic 400 52px "Libre Caslon Display", Georgia, serif'; g.fillText('a gift worth remembering', 600, 440);
  g.strokeStyle = '#b8975a'; g.lineWidth = 2; g.beginPath(); g.moveTo(500, 500); g.lineTo(700, 500); g.stroke();
  g.fillStyle = '#5f4c40'; g.font = '400 30px Jost, Futura, sans-serif'; g.fillText('Handmade chocolates · Panipat', 600, 580);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export async function initFinale(canvas, { reduced = false } = {}) {
  await document.fonts?.load('400 64px "Libre Caslon Display"').catch(() => {});
  const renderer = setupRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b2a24, 16, 40);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .6;
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x0b2a24, .7));
  const key = new THREE.DirectionalLight(0xffe2b8, 2.4); key.position.set(-6, 9, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xcdb17d, 3); rim.position.set(7, 4, -7); scene.add(rim);

  const kit = createKit(53), rnd = kit.rnd, M = kit.M;
  const glowTex = glowTexture();
  const world = new THREE.Group(); scene.add(world);
  const chapters = [0, 1, 2, 3].map(() => { const g = new THREE.Group(); g.userData.vis = 0; world.add(g); return g; });
  chapters.forEach((g) => (g.visible = false));

  /* --- 0: gift boxes stack into a pyramid --- */
  const slots = [];
  [[4, 4], [3, 3], [2, 2], [1, 1]].forEach(([nx, nz], layer) => {
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) slots.push(new THREE.Vector3((i - (nx - 1) / 2) * 1.12, layer * .62 - 1.2, (j - (nz - 1) / 2) * 1.12));
  });
  const NB = slots.length;
  const boxGeo = new THREE.BoxGeometry(1, .55, 1), bandA = new THREE.BoxGeometry(1.02, .57, .16), bandB = new THREE.BoxGeometry(.16, .57, 1.02);
  const iBox = new THREE.InstancedMesh(boxGeo, M.paper, NB), iA = new THREE.InstancedMesh(bandA, M.ribbon, NB), iB = new THREE.InstancedMesh(bandB, M.ribbon, NB);
  chapters[0].add(iBox, iA, iB);
  const from = slots.map(() => new THREE.Vector3(-2 + rnd() * 14, (rnd() - .5) * 12, -10 - rnd() * 14)); // fly in from the right, away from the copy
  const spinAxis = slots.map(() => new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize());
  const order = slots.map((_, i) => i / NB);

  /* --- 1: six gold seals in orbit --- */
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .25, metalness: 1 });
  const seals = Array.from({ length: 6 }, (_, i) => {
    const s = new THREE.Group();
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(.75, .75, .14, 64), gold); coin.rotation.x = Math.PI / 2; s.add(coin);
    const hex = new THREE.Mesh(new THREE.TorusGeometry(.42, .04, 8, 6), gold); hex.position.z = .09; s.add(hex);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(.66, .025, 8, 64), gold); r2.position.z = .08; s.add(r2);
    s.userData = { a: (i / 6) * Math.PI * 2, ph: rnd() * 6 };
    chapters[1].add(s); return s;
  });
  const sealGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .5 }));
  sealGlow.scale.set(6, 6, 1); chapters[1].add(sealGlow);

  /* --- 2: the bee and the bean --- */
  const bean = new THREE.Group();
  const beanBody = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshPhysicalMaterial({ color: 0x4a2414, roughness: .35, clearcoat: .6 }));
  beanBody.scale.set(1.25, .72, .82); bean.add(beanBody);
  const groove = new THREE.Mesh(new THREE.TorusGeometry(1, .035, 8, 64, Math.PI), new THREE.MeshStandardMaterial({ color: 0x2a120a, roughness: .6 }));
  groove.scale.set(1.24, .73, 1); groove.rotation.x = -Math.PI / 2; groove.position.y = .02; bean.add(groove);
  bean.rotation.set(.3, .4, .2); bean.scale.setScalar(.85); chapters[2].add(bean);
  const bee = new THREE.Group();
  const beeBody = new THREE.Mesh(new THREE.SphereGeometry(.3, 32, 20), new THREE.MeshPhysicalMaterial({ color: 0xe2a82e, roughness: .35, metalness: .3, clearcoat: .6 }));
  beeBody.scale.set(1.45, 1, 1); bee.add(beeBody);
  const stripe = new THREE.MeshStandardMaterial({ color: 0x1c1208, roughness: .5 });
  [-.12, .08, .26].forEach((x) => { const b = new THREE.Mesh(new THREE.TorusGeometry(.28, .045, 10, 32), stripe); b.rotation.y = Math.PI / 2; b.position.x = x; b.scale.set(1, 1 - Math.abs(x) * .6, 1 - Math.abs(x) * .6); bee.add(b); });
  const head = new THREE.Mesh(new THREE.SphereGeometry(.2, 24, 16), stripe); head.position.x = -.5; bee.add(head);
  const wingMat = new THREE.MeshPhysicalMaterial({ color: 0xfff6e0, emissive: 0xcdb17d, emissiveIntensity: .35, roughness: .1, transparent: true, opacity: .7, side: THREE.DoubleSide });
  const wings = [-1, 1].map((s) => { const w = new THREE.Mesh(new THREE.CircleGeometry(.36, 24), wingMat); w.scale.set(.65, 1, 1); w.position.set(-.05, .25, s * .12); w.rotation.x = Math.PI / 2; const p = new THREE.Group(); p.add(w); p.userData.s = s; bee.add(p); return p; });
  bee.scale.setScalar(1.35); chapters[2].add(bee);
  const trail = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .35 })); trail.scale.set(1.4, 1.4, 1); chapters[2].add(trail);

  /* --- 3: the invitation rises out of the gift box --- */
  const gb = kit.giftBox({ lid: true });
  const boxRig = new THREE.Group(); boxRig.add(gb.box); gb.lid.position.y = gb.size.BH + .02; boxRig.add(gb.lid);
  boxRig.scale.setScalar(.72); boxRig.position.y = -1.4; chapters[3].add(boxRig);
  const card = new THREE.Group();
  const cardFace = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), new THREE.MeshStandardMaterial({ map: cardTexture(), roughness: .7 }));
  const cardBack = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), new THREE.MeshStandardMaterial({ color: 0xefe6d4, roughness: .8 })); cardBack.rotation.y = Math.PI;
  const edge = new THREE.Mesh(new THREE.BoxGeometry(3.66, 2.46, .02), gold); edge.position.z = -.012;
  const seal = new THREE.Group();
  const wax = new THREE.Mesh(new THREE.CylinderGeometry(.34, .36, .1, 32), new THREE.MeshPhysicalMaterial({ color: 0x8e1b24, roughness: .35, clearcoat: .7 }));
  wax.rotation.x = Math.PI / 2; seal.add(wax);
  const sealRing = new THREE.Mesh(new THREE.TorusGeometry(.22, .03, 8, 32), new THREE.MeshPhysicalMaterial({ color: 0x6e121a, roughness: .4 })); sealRing.position.z = .06; seal.add(sealRing);
  seal.position.set(0, -.92, .07);
  card.add(edge, cardFace, cardBack, seal);
  const cardGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd28a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  cardGlow.scale.set(9, 6, 1); cardGlow.position.z = -.5; card.add(cardGlow);
  chapters[3].add(card);

  // gold dust everywhere
  const N = 800, pos = new Float32Array(N * 3), seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 30; pos[i * 3 + 1] = (Math.random() - .5) * 16; pos[i * 3 + 2] = -16 + Math.random() * 20; seeds[i] = Math.random(); }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: .08, map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .85 })));

  let mobile = false;
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); mobile = w < 960; }
  new ResizeObserver(resize).observe(canvas); resize();

  let pTarget = 0, pNow = 0, px = 0, tx = 0, visible = true, last = performance.now();
  if (!reduced) canvas.parentElement.addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - .5; });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3();

  function frame() {
    if (!visible) return;
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    pNow += (pTarget - pNow) * (reduced ? 1 : 1 - Math.exp(-4 * dt));
    px += (tx - px) * (1 - Math.exp(-3 * dt));
    const { pos: cpos } = chapterOf(pNow);

    chapters.forEach((g, i) => {
      const vis = smooth(clamp01(1 - Math.abs(cpos - i) * 1.4));
      g.userData.vis = vis; g.visible = vis > .01;
      g.scale.setScalar(.7 + .3 * vis);
      g.position.y = (cpos - i) * 2.2;
    });

    // 0 boxes fly in and stack (assembly follows the scroll through chapter 0)
    if (chapters[0].visible) {
      const build = smooth(clamp01(pNow * 4 * 1.25));
      slots.forEach((s, i) => {
        const k = smooth(clamp01((build - order[i] * .55) / .45));
        v.lerpVectors(from[i], s, k);
        q.setFromAxisAngle(spinAxis[i], (1 - k) * 4);
        m4.compose(v, q, sc);
        iBox.setMatrixAt(i, m4); iA.setMatrixAt(i, m4); iB.setMatrixAt(i, m4);
      });
      iBox.instanceMatrix.needsUpdate = iA.instanceMatrix.needsUpdate = iB.instanceMatrix.needsUpdate = true;
      chapters[0].rotation.y = -.5 + t * .08 + px * .4;
    }
    // 1 seals orbit
    if (chapters[1].visible) {
      seals.forEach((s) => { const d = s.userData, a = d.a + t * .25; s.position.set(Math.cos(a) * 2, Math.sin(t * .8 + d.ph) * .3, Math.sin(a) * 1.2); s.rotation.y = t * .6 + d.ph; });
      chapters[1].rotation.x = .2;
    }
    // 2 bee loops around the bean
    if (chapters[2].visible) {
      bean.rotation.y = .4 + t * .2;
      const a = t * .9, x = Math.cos(a) * 2.5, y = Math.sin(a * 2) * .6 + .5, z = Math.sin(a) * 1.8;
      bee.position.set(x, y, z);
      up.set(-Math.sin(a) * 2.5, Math.cos(a * 2) * 1.2, Math.cos(a) * 1.8); // flight direction
      bee.rotation.y = Math.atan2(-up.z, -up.x); bee.rotation.z = Math.sin(t * 3) * .1;
      wings.forEach((w) => (w.rotation.x = Math.sin(t * 60) * .6 * w.userData.s));
      trail.position.copy(bee.position);
    }
    // 3 the lid lifts and the invitation rises (driven by scroll within the last chapter)
    if (chapters[3].visible) {
      const k = smooth(clamp01((pNow - .74) / .2));
      gb.lid.position.set(lerp(0, .3, k), lerp(gb.size.BH + .02, 2.8, k), lerp(0, -3, k));
      gb.lid.rotation.set(lerp(0, .55, k), 0, lerp(0, -.15, k));
      card.position.set(0, lerp(-1.6, 1.1, k), lerp(0, .8, k));
      card.rotation.set(lerp(-1.4, -.08, k), Math.sin(t * .6) * .12 * k, 0);
      card.scale.setScalar(lerp(.5, 1, k));
      cardGlow.material.opacity = .55 * k * chapters[3].userData.vis;
      boxRig.rotation.y = -.4 + px * .3;
    }

    const p = dustGeo.attributes.position.array;
    if (!reduced) for (let i = 0; i < N; i++) { p[i * 3 + 1] += dt * (.1 + seeds[i] * .2); if (p[i * 3 + 1] > 8) p[i * 3 + 1] = -8; }
    dustGeo.attributes.position.needsUpdate = true;

    world.position.set(mobile ? 0 : 3.4, mobile ? 2.5 : 0, 0);
    world.scale.setScalar(mobile ? .55 : 1);
    camera.position.set(px * .8, 1.8, 15);
    camera.lookAt(mobile ? 0 : 1.8, mobile ? 1.5 : .2, 0);
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });

  return { setProgress(p) { pTarget = p; } };
}
