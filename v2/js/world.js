// v2 world: ONE renderer, ONE scene, ONE camera path. Every chapter is a station along -z; scrolling flies the
// camera from station to station while the sky colour blends between them, gold dust fills the whole path and a few
// companion chocolates travel alongside — so the site reads as one continuous motion, not separate sections.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { createKit, setupRenderer } from '../../js/choco3d.js';
import * as S from './stations.js';

const { clamp01, smooth, lerp } = S;
const GAP = 34;   // distance between stations
const HOLD = .8;  // share of each station's scroll spent holding (the rest is the flight to the next)

// id, scroll length (vh), caption steps, sky colour, builder
export const STATIONS = [
  { id: 'hero', len: 120, steps: 1, bg: 0x0b2a24, build: S.hero },
  { id: 'pod', len: 120, steps: 1, bg: 0x0d2f27, build: S.pod },
  { id: 'block', len: 280, steps: 3, bg: 0x24120a, build: S.block },
  { id: 'bowl', len: 120, steps: 1, bg: 0x26130b, build: S.bowl },
  { id: 'moulds', len: 150, steps: 1, bg: 0x1e1510, build: S.moulds },
  { id: 'truffle', len: 150, steps: 1, bg: 0x13261f, build: S.truffle },
  { id: 'ring', len: 420, steps: 6, bg: 0x0b2a24, build: S.ring },
  { id: 'festive', len: 360, steps: 3, bg: 0x3a0b14, build: S.festive },
  { id: 'scale', len: 160, steps: 1, bg: 0x0b2a24, build: S.scale },
  { id: 'why', len: 130, steps: 1, bg: 0x0c2c25, build: S.why },
  { id: 'story', len: 150, steps: 1, bg: 0x0a2520, build: S.story },
  { id: 'invite', len: 150, steps: 1, bg: 0x0b2a24, build: S.invite },
  { id: 'reply', len: 110, steps: 1, bg: 0x061a16, build: S.reply },
];
export const TOTAL = STATIONS.reduce((a, s) => a + s.len, 0);
const STARTS = STATIONS.reduce((acc, s, i) => (acc.push(i ? acc[i - 1] + STATIONS[i - 1].len : 0), acc), []);

// scroll progress → where we are in the story
export function locate(p) {
  const u = clamp01(p) * TOTAL;
  let i = STATIONS.length - 1;
  for (let k = 0; k < STATIONS.length; k++) if (u < STARTS[k] + STATIONS[k].len) { i = k; break; }
  const f = clamp01((u - STARTS[i]) / STATIONS[i].len), last = i === STATIONS.length - 1;
  const lp = last ? f : clamp01(f / HOLD), travel = last ? 0 : smooth(clamp01((f - HOLD) / (1 - HOLD)));
  const st = STATIONS[i], step = Math.round(S.holdMap(lp, st.steps));
  // the caption belongs to wherever the camera is closest to
  return { i, f, lp, travel, step, caption: travel > .5 ? `${STATIONS[i + 1].id}:0` : `${st.id}:${step}` };
}
export const startOf = (id) => STARTS[STATIONS.findIndex((s) => s.id === id)] / TOTAL;

export async function initWorld(canvas, { reduced = false, images = [] } = {}) {
  const renderer = setupRenderer(canvas);
  const scene = new THREE.Scene();
  const sky = new THREE.Color(STATIONS[0].bg);
  scene.background = sky; scene.fog = new THREE.Fog(sky, 20, 54);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .55;
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 140);
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x0b2a24, .65));
  const key = new THREE.DirectionalLight(0xffe2b8, 2.5); key.position.set(-6, 9, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xcdb17d, 3); rim.position.set(7, 4, -7); scene.add(rim);

  const kit = createKit(11), glow = S.glowTexture();
  const ctx = { glow, images };
  const built = [];
  for (let i = 0; i < STATIONS.length; i++) {
    const st = await STATIONS[i].build(kit, ctx);
    const slot = new THREE.Group(); slot.position.z = -GAP * i; slot.add(st.group); scene.add(slot);
    built.push({ ...st, slot });
  }

  // gold dust along the whole path + far bokeh
  const zMin = -GAP * STATIONS.length - 20, N = 3200, pos = new Float32Array(N * 3), seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 36; pos[i * 3 + 1] = (Math.random() - .5) * 20; pos[i * 3 + 2] = zMin + Math.random() * (16 - zMin); seeds[i] = Math.random(); }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: .09, map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 })));
  for (let i = 0; i < 70; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: i % 3 ? 0xcdb17d : 0x6fb59f, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .07 + Math.random() * .1 }));
    const sz = 1.5 + Math.random() * 3.5; s.scale.set(sz, sz, 1); s.position.set((Math.random() - .5) * 44, (Math.random() - .5) * 20, zMin + Math.random() * (-zMin - 6)); scene.add(s);
  }

  // companions: a few chocolates that travel with the camera, drifting at the edges of the view
  const companions = ['tm', 'ro', 'he', 'me', 'tw'].map((k, i) => {
    const o = kit.MAKE[k](); o.scale.setScalar(1.1);
    o.userData = { off: new THREE.Vector3([-7.5, 8, -6.5, 8.5, -8][i], [3.2, -3, -2.6, 2.6, .4][i], -9 - i * 1.5), ph: i * 1.7, spin: .3 + i * .1 };
    scene.add(o); return o;
  });

  let mobile = false;
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); mobile = w < 960; }
  new ResizeObserver(resize).observe(canvas); resize();

  let pTarget = 0, pNow = 0, px = 0, py = 0, tx = 0, ty = 0, last = performance.now();
  if (!reduced) addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  const t0 = performance.now(), c1 = new THREE.Color(), c2 = new THREE.Color();

  function frame() {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = reduced ? 3 : (now - t0) / 1000;
    pNow += (pTarget - pNow) * (reduced ? 1 : 1 - Math.exp(-4.5 * dt));
    px += (tx - px) * (1 - Math.exp(-3 * dt)); py += (ty - py) * (1 - Math.exp(-3 * dt));
    const L = locate(pNow), along = L.i + L.travel, camZ = 15 - along * GAP;

    // sky blends between stations (the festive station paints its own seasons)
    const a = built[L.i], b = built[Math.min(L.i + 1, built.length - 1)];
    c1.copy(a.bg ? a.bg(L.lp) : c1.set(STATIONS[L.i].bg));
    c2.copy(b.bg ? b.bg(0) : c2.set(STATIONS[Math.min(L.i + 1, STATIONS.length - 1)].bg));
    sky.copy(c1).lerp(c2, L.travel); scene.fog.color.copy(sky);

    built.forEach((st, i) => {
      const z = -GAP * i, near = z < camZ - 2 && camZ - z < 60;
      st.slot.visible = near;
      st.slot.position.set(mobile ? 0 : 3.3, mobile ? 2.9 : 0, z);
      st.slot.scale.setScalar(mobile ? .52 : 1);
      if (!near) return;
      const lp = i < L.i ? 1 : i > L.i ? 0 : L.lp;
      st.update({ t, dt, lp, mobile, reduced });
    });

    companions.forEach((o) => {
      const d = o.userData;
      o.position.set(d.off.x * (mobile ? .55 : 1) + Math.sin(t * .3 + d.ph) * .6, d.off.y + Math.sin(t * .4 + d.ph) * .4, camZ + d.off.z);
      o.rotation.x += d.spin * dt; o.rotation.y += d.spin * .8 * dt;
    });

    const pa = dustGeo.attributes.position.array;
    if (!reduced) for (let k = 0; k < N; k++) { pa[k * 3 + 1] += dt * (.1 + seeds[k] * .22); if (pa[k * 3 + 1] > 10) pa[k * 3 + 1] = -10; }
    dustGeo.attributes.position.needsUpdate = true;

    camera.position.set(px * .9, 2.3 - py * .6 + Math.sin(L.travel * Math.PI) * .7, camZ);
    camera.lookAt(mobile ? 0 : 1.5, mobile ? 1.4 : .35, camZ - 15);
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);
  document.addEventListener('visibilitychange', () => { last = performance.now(); });

  const replyStation = built[built.length - 1];
  return { setProgress(p) { pTarget = p; }, celebrate() { if (!reduced) replyStation.celebrate?.(); } };
}
