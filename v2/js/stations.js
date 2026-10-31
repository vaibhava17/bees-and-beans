// v2 stations: every chapter of the story as a builder that returns { group, update(s), bg? }.
// They all live in ONE scene; the camera flies from one to the next (see world.js).
// s = { t, dt, lp (0..1 progress while the camera holds here), mobile, reduced }
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const smooth = (t) => t * t * (3 - 2 * t);
export const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const ease = (p, a, b) => smooth(clamp01((p - a) / (b - a)));
// n sub-steps inside a station, each holding before turning to the next
export function holdMap(lp, n) {
  if (n <= 1) return 0;
  const seg = Math.min(n - .0001, lp * n), i = Math.floor(seg), f = seg - i;
  return i + (i < n - 1 ? smooth(clamp01((f - .6) / .4)) : 0);
}

export function glowTexture(inner = 'rgba(255,236,190,1)', mid = 'rgba(232,196,120,.8)') {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, inner); gr.addColorStop(.3, mid); gr.addColorStop(1, 'rgba(232,196,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const std = (color, rough = .6, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

/* ============ 0 · the gift box opens, chocolates burst into orbit ============ */
export function hero(kit, { glow: glowTex }) {
  const group = new THREE.Group(), rnd = kit.rnd;
  const gb = kit.giftBox({ lid: true });
  const rig = new THREE.Group(); rig.add(gb.box);
  const lid = gb.lid; lid.position.y = gb.size.BH + .02; rig.add(lid);
  [['tm', -1.6, -.53], ['ro', -.53, -.53], ['me', .53, -.53], ['td', 1.6, -.53], ['he', -1.6, .53], ['tw', -.53, .53], ['ro', .53, .53], ['me', 1.6, .53]]
    .forEach(([k, x, z]) => { const o = kit.MAKE[k](); o.position.set(x, .05, z); o.scale.setScalar(.85); rig.add(o); });
  const light = new THREE.PointLight(0xffc46b, 0, 7, 1.6); light.position.set(0, .9, 0); rig.add(light);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc46b, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  halo.scale.set(9, 6, 1); halo.position.set(0, .9, 0); rig.add(halo);
  rig.scale.setScalar(.82); group.add(rig);
  const KINDS = ['tm', 'ro', 'me', 'he', 'td', 'tw'];
  const orbit = Array.from({ length: 16 }, (_, i) => {
    const o = kit.MAKE[KINDS[i % 6]](), ring = i % 3;
    o.userData = { r: [3.1, 4.1, 5.1][ring] + (rnd() - .5) * .5, a0: (i / 16) * Math.PI * 6 + rnd(), y: -1 + rnd() * 3.4, speed: (.08 + rnd() * .06) * (ring === 1 ? -1 : 1),
      spin: new THREE.Vector3((rnd() - .5) * .8, (rnd() - .5) * 1.2, (rnd() - .5) * .6), size: 1.15 + rnd() * .55, ph: rnd() * 6, delay: i * .05 };
    o.scale.setScalar(0); group.add(o); return o;
  });
  return {
    group,
    update({ t, dt, mobile }) {
      const open = easeOut(clamp01((t - .3) / 1.6));
      lid.position.set(lerp(0, .4, open), lerp(gb.size.BH + .02, 3.4, open) + Math.sin(t * .9) * .1 * open, lerp(0, -3.2, open));
      lid.rotation.set(lerp(0, .5, open), lerp(0, .3, open), lerp(0, -.12, open));
      light.intensity = 9 * open; halo.material.opacity = .55 * open * (.9 + Math.sin(t * 1.3) * .1);
      orbit.forEach((o) => {
        const d = o.userData, burst = easeOut(clamp01((t - 1.1 - d.delay) / 1.6)), r = d.r * burst, a = d.a0 + t * d.speed;
        o.position.set(Math.cos(a) * r, lerp(.4, d.y + Math.sin(t * .7 + d.ph) * .25, burst), Math.sin(a) * r * .62);
        o.rotation.x += d.spin.x * dt; o.rotation.y += d.spin.y * dt;
        const hide = mobile ? 0 : clamp01((-Math.cos(a) * r - 1.4) / 1.4);
        o.scale.setScalar(d.size * burst * (1 - hide)); o.visible = burst * (1 - hide) > .01;
      });
      rig.rotation.set(.12, -.5 + t * .05, 0); rig.position.y = Math.sin(t * .8) * .12 - .3;
    },
  };
}

/* ============ 1 · the 1 KG block: unwrap → break → melt into a pool ============ */
function labelTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1312;
  const g = c.getContext('2d');
  g.fillStyle = '#efe3cf'; g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = '#b8975a'; g.lineWidth = 6; g.strokeRect(48, 48, 928, 1216); g.lineWidth = 2; g.strokeRect(70, 70, 884, 1172);
  g.textAlign = 'center'; g.fillStyle = '#a9884e'; g.font = '500 40px Jost, sans-serif'; g.fillText('A U T H E N T I C', 512, 470);
  g.fillStyle = '#23160f'; g.font = 'italic 400 120px "Libre Caslon Display", Georgia, serif'; g.fillText('Pure', 512, 640); g.fillText('Chocolate', 512, 770);
  g.fillStyle = '#a9884e'; g.font = '500 64px Jost, sans-serif'; g.fillText('1  K G', 512, 960);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function block(kit) {
  const group = new THREE.Group(), rnd = kit.rnd, M = kit.M;
  const COLS = 6, ROWS = 4, sq = .93;
  const geo = mergeGeometries([new RoundedBoxGeometry(.994, .22, .994, 2, .025).translate(0, -.12, 0), new RoundedBoxGeometry(sq, .26, sq, 4, .1).translate(0, .1, 0)]);
  geo.computeVertexNormals();
  const pieces = new THREE.InstancedMesh(geo, M.dark, COLS * ROWS); group.add(pieces);
  const P = [];
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) P.push({ x: -COLS / 2 + .5 + i, z: -ROWS / 2 + .5 + j, axis: new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize(), spin: (rnd() - .5) * 2.4, lift: .5 + rnd() * .7, delay: rnd() * .45 });
  const wrap = new THREE.Mesh(new THREE.BoxGeometry(3.2, .62, ROWS + .26), [M.gold, M.gold, new THREE.MeshStandardMaterial({ map: labelTexture(), roughness: .75 }), M.paper, M.paper, M.paper]);
  wrap.position.y = .06; group.add(wrap);
  const poolGeo = new THREE.SphereGeometry(1, 64, 20, 0, Math.PI * 2, 0, Math.PI / 2), poolBase = poolGeo.attributes.position.array.slice();
  const pool = new THREE.Mesh(poolGeo, new THREE.MeshPhysicalMaterial({ color: 0x2e170c, roughness: .24, clearcoat: .7, clearcoatRoughness: .2, sheen: .4, sheenColor: new THREE.Color(0x9a6a44) }));
  pool.scale.setScalar(0); group.add(pool);
  group.rotation.x = .55;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  return {
    group,
    update({ t, lp, reduced }) {
      const unwrap = ease(lp, .04, .26), brk = ease(lp, .36, .6), melt = clamp01((lp - .66) / .3);
      wrap.position.set(0, .06 + unwrap * 4.2, -unwrap * 3); wrap.rotation.x = -unwrap * .7; wrap.visible = unwrap < .99;
      let any = false;
      P.forEach((o, i) => {
        const lift = Math.sin(brk * Math.PI * .5) * o.lift, mi = smooth(clamp01((melt - o.delay) / .5));
        v.set(lerp(o.x * (1 + .32 * brk), o.x * .15, mi), lerp(lift, -.15, mi), lerp(o.z * (1 + .32 * brk), o.z * .15, mi));
        q.setFromAxisAngle(o.axis, o.spin * brk * (1 - mi * .5));
        const s = 1 - mi; sc.set(s, s * (1 - mi * .4), s); if (s > .01) any = true;
        m4.compose(v, q, sc); pieces.setMatrixAt(i, m4);
      });
      pieces.instanceMatrix.needsUpdate = true; pieces.visible = any;
      const R = 2.5 * smooth(clamp01(melt * 1.25));
      pool.visible = R > .02;
      if (pool.visible) {
        pool.scale.set(R, .08 + R * .025, R);
        const a = poolGeo.attributes.position.array, amp = reduced ? 0 : .05;
        for (let k = 0; k < a.length; k += 3) { const r = Math.hypot(poolBase[k], poolBase[k + 2]), y = poolBase[k + 1]; a[k + 1] = y + (y > .02 ? amp * Math.sin(r * 9 - t * 2.4) * (1 - r) : 0); }
        poolGeo.attributes.position.needsUpdate = true; poolGeo.computeVertexNormals();
      }
      group.rotation.y = -.5 + lp * .9;
    },
  };
}

/* ============ 2 · copper bowl of swirling chocolate ============ */
export function bowl(kit) {
  const group = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push(new THREE.Vector2(.25 + 1.65 * Math.sin(t * Math.PI / 2), -1 + 1.15 * (1 - Math.cos(t * Math.PI / 2)))); }
  pts.push(new THREE.Vector2(1.98, .2), new THREE.Vector2(1.84, .22));
  const rig = new THREE.Group(); rig.scale.setScalar(1.25); rig.rotation.x = .25; group.add(rig);
  rig.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 72), new THREE.MeshStandardMaterial({ color: 0xc27a4a, roughness: .26, metalness: 1, side: THREE.DoubleSide })));
  const surf = new THREE.Mesh(new THREE.RingGeometry(.001, 1.82, 96, 18), new THREE.MeshStandardMaterial({ color: 0x26110a, roughness: .3, envMapIntensity: .2, side: THREE.DoubleSide }));
  surf.rotation.x = -Math.PI / 2; surf.position.y = .02; rig.add(surf);
  const base = surf.geometry.attributes.position.array.slice();
  const spatula = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(.5, .05, .8), std(0xe9e2d6, .5)); blade.position.y = -.2;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, 2.4, 12), std(0x7a5232, .6)); handle.position.y = 1;
  spatula.add(blade, handle); spatula.rotation.z = .45; rig.add(spatula);
  const lamp = new THREE.PointLight(0xffd29a, 3, 8, 1.6); lamp.position.set(0, 2.5, 1.5); group.add(lamp);
  return {
    group,
    update({ t, reduced }) {
      const a = surf.geometry.attributes.position.array, amp = reduced ? 0 : .05;
      for (let k = 0; k < a.length; k += 3) { const x = base[k], y = base[k + 1], r = Math.hypot(x, y), th = Math.atan2(y, x); a[k + 2] = amp * Math.sin(r * 5 - t * 2.2 + th * 2) * (r / 1.82) * (1 - r / 1.9); }
      surf.geometry.attributes.position.needsUpdate = true; surf.geometry.computeVertexNormals();
      surf.rotation.z = t * .25;
      const sa = t * .9; spatula.position.set(Math.cos(sa) * .8, .55, Math.sin(sa) * .8); spatula.rotation.y = -sa;
    },
  };
}

/* ============ 3 · mould tray filling, cavity by cavity (driven by scroll) ============ */
export function moulds(kit) {
  const group = new THREE.Group(), M = kit.M;
  const rig = new THREE.Group(); rig.rotation.x = .35; rig.scale.setScalar(1.15); group.add(rig);
  const trayMat = new THREE.MeshPhysicalMaterial({ color: 0x3a3836, roughness: .22, clearcoat: .9 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.6, .3, 3.5), trayMat); base.position.y = -.15; rig.add(base);
  const ringGeo = new THREE.TorusGeometry(.42, .05, 10, 40); ringGeo.rotateX(Math.PI / 2);
  const holeGeo = new THREE.CircleGeometry(.42, 40); holeGeo.rotateX(-Math.PI / 2);
  const domeGeo = new THREE.SphereGeometry(.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const cells = [];
  for (let c = 0; c < 4; c++) for (let r = 0; r < 3; r++) {
    const x = (c - 1.5) * 1.08, z = (r - 1) * 1.08;
    const ring = new THREE.Mesh(ringGeo, trayMat); ring.position.set(x, .01, z);
    const h = new THREE.Mesh(holeGeo, std(0x111111, .4)); h.position.set(x, .005, z);
    const fill = new THREE.Mesh(domeGeo, M.dark); fill.position.set(x, -.02, z); fill.scale.set(1, .001, 1);
    rig.add(ring, h, fill); cells.push(fill);
  }
  const pour = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3, 12), M.dark); rig.add(pour);
  const lamp = new THREE.PointLight(0xffd29a, 5, 9, 1.6); lamp.position.set(0, 3, 2); group.add(lamp);
  return {
    group,
    update({ t, lp }) {
      const fillT = lp * 13.5; let cur = -1;
      cells.forEach((c, i) => { const f = smooth(clamp01(fillT - i * 1.05)); c.scale.set(1, Math.max(.001, f * .55), 1); if (f > 0 && f < 1 && cur < 0) cur = i; });
      pour.visible = cur >= 0; if (cur >= 0) pour.position.set(cells[cur].position.x, 1.6, cells[cur].position.z);
      rig.rotation.y = Math.sin(t * .3) * .1;
    },
  };
}

/* ============ 4 · a truffle turning while its cross is piped (by scroll); gold leaf ============ */
export function truffle(kit) {
  const group = new THREE.Group(), rnd = kit.rnd, M = kit.M;
  const cup = kit.MAKE.td(); cup.children.slice(1).forEach((c) => (c.visible = false));
  cup.scale.setScalar(4.2); cup.position.y = -.7; cup.rotation.x = .55;
  const rig = new THREE.Group(); rig.add(cup); group.add(rig);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.37, .2, 0), new THREE.Vector3(-.33, .39, 0), new THREE.Vector3(0, .4, 0), new THREE.Vector3(.33, .39, 0), new THREE.Vector3(.37, .24, 0)]);
  const crosses = [0, Math.PI / 2].map((rot) => { const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, .024, 10), M.white); tube.rotation.y = rot + .5; cup.add(tube); return tube; });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0xd4af5a, roughness: .25, metalness: 1, side: THREE.DoubleSide });
  const leaves = Array.from({ length: 22 }, () => {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(.18 + rnd() * .16, .12 + rnd() * .1), leafMat);
    l.userData = { x: (rnd() - .5) * 5, z: (rnd() - .5) * 3, y0: rnd() * 6, sp: .3 + rnd() * .3, rx: rnd() * 3, ry: rnd() * 3 }; group.add(l); return l;
  });
  const lamp = new THREE.PointLight(0xffd29a, 5, 9, 1.6); lamp.position.set(-1.5, 2.5, 2.5); group.add(lamp);
  return {
    group,
    update({ t, lp }) {
      rig.rotation.y = t * .35;
      const draw = clamp01((lp - .05) / .7);
      crosses.forEach((tube, i) => { const n = tube.geometry.index.count, f = clamp01(draw * 2 - i); tube.geometry.setDrawRange(0, Math.floor(n * f / 6) * 6); });
      leaves.forEach((l) => { const d = l.userData; l.position.set(d.x + Math.sin(t + d.y0) * .3, 3.6 - ((d.y0 + t * d.sp) % 6), d.z); l.rotation.set(d.rx + t, d.ry + t * .7, 0); });
    },
  };
}

/* ============ 5 · real product photos on a turning ring ============ */
export async function ring(kit, { images }) {
  const group = new THREE.Group(), n = images.length, R = 3.6;
  const ringG = new THREE.Group(); group.add(ringG);
  const loader = new THREE.TextureLoader();
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .28, metalness: 1 });
  const backMat = std(0x173f36, .6);
  const medals = await Promise.all(images.map(async (src, i) => {
    const tex = await loader.loadAsync(src); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const { width: w, height: h } = tex.image;
    if (w > h) { tex.repeat.set(h / w, 1); tex.offset.set((1 - h / w) / 2, 0); } else { tex.repeat.set(1, w / h); tex.offset.set(0, (1 - w / h) / 2); }
    const photoMat = new THREE.MeshStandardMaterial({ map: tex, roughness: .55 });
    const m = new THREE.Group();
    const face = new THREE.Mesh(new THREE.CircleGeometry(1.5, 64), photoMat); face.position.z = .06;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, .1, 64), backMat); disc.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.56, .07, 16, 96), goldMat); rim.position.z = .06;
    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(1.74, .022, 12, 96), goldMat); rim2.position.z = .04;
    m.add(disc, face, rim, rim2); m.userData = { a: (i / n) * Math.PI * 2, photoMat, ph: i * 1.3 };
    ringG.add(m); return m;
  }));
  const tmp = new THREE.Vector3();
  return {
    group,
    update({ t, lp }) {
      ringG.rotation.y = -holdMap(lp, n) * (Math.PI * 2 / n);
      medals.forEach((m) => {
        const d = m.userData;
        m.position.set(Math.sin(d.a) * R, Math.sin(t * .8 + d.ph) * .12, Math.cos(d.a) * R);
        m.rotation.y = d.a + Math.sin(t * .5 + d.ph) * .06;
        m.getWorldPosition(tmp); group.worldToLocal(tmp);
        const front = clamp01((tmp.z + R) / (2 * R)), show = clamp01((front - .2) / .3);
        m.scale.setScalar((.5 + .5 * front * front) * show); m.visible = show > .01;
        d.photoMat.color.setScalar(.35 + .65 * Math.pow(front, 1.5));
      });
    },
  };
}

/* ============ 6 · the gift box through the festivals (Diwali → Christmas → New Year) ============ */
const SEASON_BG = [new THREE.Color(0x3a0b14), new THREE.Color(0x0b2a24), new THREE.Color(0x10142e)];
function flameTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 92, 2, 32, 78, 56);
  gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(.25, 'rgba(255,214,110,.95)'); gr.addColorStop(.6, 'rgba(255,130,30,.55)'); gr.addColorStop(1, 'rgba(255,90,0,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(32, 4); g.bezierCurveTo(58, 60, 58, 120, 32, 124); g.bezierCurveTo(6, 120, 6, 60, 32, 4); g.fill();
  return new THREE.CanvasTexture(c);
}
function cloud(n, size, color, map, blending = THREE.AdditiveBlending) {
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ size, color, map, transparent: true, depthWrite: false, blending, opacity: 0 }));
}
export function festive(kit, { glow }) {
  const group = new THREE.Group(), rnd = kit.rnd;
  const gb = kit.giftBox({ lid: true });
  const box = new THREE.Group(); box.add(gb.box); gb.lid.position.y = gb.size.BH + .02; box.add(gb.lid);
  box.scale.setScalar(.72); box.rotation.x = .18; group.add(box);
  const seasons = [0, 1, 2].map(() => { const g = new THREE.Group(); group.add(g); return g; });
  const warm = new THREE.PointLight(0xffa040, 0, 12, 1.4); warm.position.set(0, 1, 3); group.add(warm);
  // Diwali: diyas, lanterns, sparks
  const flameTex = flameTexture();
  const clay = new THREE.MeshStandardMaterial({ color: 0xb4532a, roughness: .8, transparent: true });
  const diyaGeo = new THREE.LatheGeometry([new THREE.Vector2(.02, -.16), new THREE.Vector2(.28, -.14), new THREE.Vector2(.42, -.04), new THREE.Vector2(.46, .06), new THREE.Vector2(.4, .07), new THREE.Vector2(.3, -.02), new THREE.Vector2(.02, -.06)], 32);
  const diyas = Array.from({ length: 12 }, (_, i) => {
    const d = new THREE.Group(); const b = new THREE.Mesh(diyaGeo, clay); b.scale.set(1, 1, 1.25); d.add(b);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fl.scale.set(.32, .64, 1); fl.position.set(0, .34, .18); d.add(fl);
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffa040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .5 })); h.scale.set(1.6, 1.6, 1); h.position.set(0, .3, .18); d.add(h);
    d.userData = { a: (i / 12) * Math.PI * 2, r: 2.7 + (i % 2) * .4, y: -1.1 + (i % 3) * .35, fl, ph: rnd() * 10 }; seasons[0].add(d); return d;
  });
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0xffb35c, emissive: 0xff8a2a, emissiveIntensity: 1.6, roughness: .8, transparent: true, opacity: .92 });
  const lanterns = Array.from({ length: 7 }, () => {
    const l = new THREE.Group(); l.add(new THREE.Mesh(new THREE.CylinderGeometry(.32, .24, .62, 20, 1, true), lanternMat));
    const g2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffa040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .6 })); g2.scale.set(2.2, 2.2, 1); l.add(g2);
    l.userData = { x: -2 + rnd() * 8, z: -3 - rnd() * 6, y0: rnd() * 12, sp: .35 + rnd() * .3, ph: rnd() * 6 }; seasons[0].add(l); return l;
  });
  // Christmas: baubles + snow
  const bMats = [0xc9a46a, 0x9e1e2c, 0x1d6b55, 0xe9e2d6].map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: .12, metalness: c === 0xe9e2d6 ? .1 : .8, clearcoat: 1, transparent: true }));
  const capMat = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .3, metalness: 1, transparent: true });
  const baubles = Array.from({ length: 16 }, (_, i) => {
    const b = new THREE.Group(), r = .24 + rnd() * .2;
    b.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), bMats[i % 4]));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * .28, r * .28, r * .3, 12), capMat); cap.position.y = r * 1.02; b.add(cap);
    b.userData = { a: (i / 16) * Math.PI * 2 + rnd(), r: 2.6 + rnd() * 1.6, y: -1.2 + rnd() * 3.4, sp: .1 + rnd() * .1, ph: rnd() * 6 }; seasons[1].add(b); return b;
  });
  const snowTex = glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,.6)');
  const snow = cloud(420, .1, 0xffffff, snowTex, THREE.NormalBlending); seasons[1].add(snow);
  const snowSeeds = Array.from({ length: 420 }, () => [-6 + rnd() * 16, rnd() * 14, -8 + rnd() * 12, .3 + rnd() * .5, rnd() * 6]);
  // New Year: fireworks, confetti
  const fwTex = glowTexture('rgba(255,250,230,1)', 'rgba(243,207,122,.85)');
  const bursts = Array.from({ length: 4 }, (_, k) => {
    const pts = cloud(220, .34, [0xf3cf7a, 0xffe7b0, 0xe8829a, 0xf3cf7a][k], fwTex);
    pts.userData = { t: -k * .9, dirs: Array.from({ length: 220 }, () => new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize().multiplyScalar(2.6 + rnd() * 1.4)), c: new THREE.Vector3(1 + k, 2.5, -4) };
    seasons[2].add(pts); return pts;
  });
  const confetti = Array.from({ length: 40 }, (_, i) => {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(.1, .2), new THREE.MeshStandardMaterial({ color: [0xf3cf7a, 0xe8829a, 0x82c7e8, 0xffffff][i % 4], side: THREE.DoubleSide, roughness: .4, metalness: .3, transparent: true }));
    c.userData = { x: -2 + rnd() * 9, z: (rnd() - .5) * 6, y0: rnd() * 10, sp: .5 + rnd() * .5, r: rnd() * 6 }; seasons[2].add(c); return c;
  });
  seasons.forEach((g) => g.traverse((o) => { if (o.material) o.material.userData.base ??= o.material.opacity || 1; }));
  const tmpC = new THREE.Color();
  let pos = 0;
  return {
    group,
    bg(lp) { const p = holdMap(lp, 3), i = Math.min(1, Math.floor(p)); return tmpC.copy(SEASON_BG[i]).lerp(SEASON_BG[i + 1], p - i); },
    update({ t, dt, lp }) {
      pos = holdMap(lp, 3);
      seasons.forEach((g, i) => {
        const v = smooth(clamp01(1 - Math.abs(pos - i) * 1.6));
        g.visible = v > .01; g.scale.setScalar(.75 + .25 * v);
        g.traverse((o) => { const m = o.material; if (m && m.transparent && m.userData.base !== undefined) m.opacity = m.userData.base * v; });
      });
      warm.intensity = 14 * smooth(clamp01(1 - pos * 1.6));
      if (seasons[0].visible) {
        diyas.forEach((d) => { const u = d.userData, a = u.a + t * .12; d.position.set(Math.cos(a) * u.r, u.y + Math.sin(t + u.ph) * .08, Math.sin(a) * u.r * .55); const f = 1 + Math.sin(t * 13 + u.ph) * .08; u.fl.scale.set(.32 * f, .64 * (2 - f), 1); });
        lanterns.forEach((l) => { const u = l.userData; l.position.set(u.x + Math.sin(t * .4 + u.ph) * .5, ((u.y0 + t * u.sp) % 12) - 5, u.z); });
      }
      if (seasons[1].visible) {
        baubles.forEach((b) => { const u = b.userData, a = u.a + t * u.sp; b.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * .8 + u.ph) * .2, Math.sin(a) * u.r * .6); });
        const a = snow.geometry.attributes.position.array;
        snowSeeds.forEach(([x, y0, z, sp, ph], i) => { a[i * 3] = x + Math.sin(t * .6 + ph) * .4; a[i * 3 + 1] = 7 - ((y0 + t * sp) % 14); a[i * 3 + 2] = z; });
        snow.geometry.attributes.position.needsUpdate = true;
      }
      if (seasons[2].visible) {
        const vis = smooth(clamp01(1 - Math.abs(pos - 2) * 1.6));
        bursts.forEach((b) => {
          const u = b.userData; u.t += dt;
          if (u.t > 2.6) { u.t = 0; u.c.set(-1.5 + rnd() * 7, 1.6 + rnd() * 2.6, -3 - rnd() * 3); }
          const k = Math.max(0, u.t), a = b.geometry.attributes.position.array, e = 1 - Math.exp(-2.4 * k);
          u.dirs.forEach((d, i) => { a[i * 3] = u.c.x + d.x * e; a[i * 3 + 1] = u.c.y + d.y * e - .5 * k * k; a[i * 3 + 2] = u.c.z + d.z * e; });
          b.geometry.attributes.position.needsUpdate = true; b.material.opacity = (u.t < 0 ? 0 : clamp01(1 - u.t / 2.4)) * vis;
        });
        confetti.forEach((c) => { const u = c.userData; c.position.set(u.x + Math.sin(t + u.r) * .6, 6 - ((u.y0 + t * u.sp) % 11), u.z); c.rotation.set(t * 2 + u.r, t * 1.3 + u.r, t); });
      }
      box.rotation.y = -.6 + t * .12; box.position.y = -.2 + Math.sin(t * .8) * .1;
    },
  };
}

/* ============ 7 · gifting at scale: boxes fly in and stack into a pyramid (by scroll) ============ */
export function scale(kit) {
  const group = new THREE.Group(), rnd = kit.rnd, M = kit.M, slots = [];
  [[4, 4], [3, 3], [2, 2], [1, 1]].forEach(([nx, nz], layer) => { for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) slots.push(new THREE.Vector3((i - (nx - 1) / 2) * 1.12, layer * .62 - 1.2, (j - (nz - 1) / 2) * 1.12)); });
  const NB = slots.length;
  const iBox = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .55, 1), M.paper, NB), iA = new THREE.InstancedMesh(new THREE.BoxGeometry(1.02, .57, .16), M.ribbon, NB), iB = new THREE.InstancedMesh(new THREE.BoxGeometry(.16, .57, 1.02), M.ribbon, NB);
  group.add(iBox, iA, iB);
  const from = slots.map(() => new THREE.Vector3(-2 + rnd() * 14, (rnd() - .5) * 12, -10 - rnd() * 14)), axes = slots.map(() => new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize());
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  return {
    group,
    update({ t, lp }) {
      const build = smooth(clamp01(lp * 1.4));
      slots.forEach((s, i) => { const k = smooth(clamp01((build - (i / NB) * .55) / .45)); v.lerpVectors(from[i], s, k); q.setFromAxisAngle(axes[i], (1 - k) * 4); m4.compose(v, q, one); iBox.setMatrixAt(i, m4); iA.setMatrixAt(i, m4); iB.setMatrixAt(i, m4); });
      iBox.instanceMatrix.needsUpdate = iA.instanceMatrix.needsUpdate = iB.instanceMatrix.needsUpdate = true;
      group.rotation.y = -.5 + t * .08;
    },
  };
}

/* ============ 8 · six gold seals in orbit (why us) ============ */
export function why(kit, { glow }) {
  const group = new THREE.Group(), gold = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .25, metalness: 1 });
  const seals = Array.from({ length: 6 }, (_, i) => {
    const s = new THREE.Group();
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(.75, .75, .14, 64), gold); coin.rotation.x = Math.PI / 2; s.add(coin);
    const hex = new THREE.Mesh(new THREE.TorusGeometry(.42, .04, 8, 6), gold); hex.position.z = .09; s.add(hex);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(.66, .025, 8, 64), gold); r2.position.z = .08; s.add(r2);
    s.userData = { a: (i / 6) * Math.PI * 2, ph: i }; group.add(s); return s;
  });
  const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .5 })); g.scale.set(6, 6, 1); group.add(g);
  group.rotation.x = .2;
  return { group, update({ t }) { seals.forEach((s) => { const d = s.userData, a = d.a + t * .25; s.position.set(Math.cos(a) * 2, Math.sin(t * .8 + d.ph) * .3, Math.sin(a) * 1.2); s.rotation.y = t * .6 + d.ph; }); } };
}

/* ============ 9 · a golden bee loops around a cocoa bean (our story) ============ */
export function story(kit, { glow }) {
  const group = new THREE.Group();
  const bean = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshPhysicalMaterial({ color: 0x4a2414, roughness: .35, clearcoat: .6 })); body.scale.set(1.25, .72, .82); bean.add(body);
  const groove = new THREE.Mesh(new THREE.TorusGeometry(1, .035, 8, 64, Math.PI), std(0x2a120a)); groove.scale.set(1.24, .73, 1); groove.rotation.x = -Math.PI / 2; bean.add(groove);
  bean.rotation.set(.3, .4, .2); bean.scale.setScalar(.85); group.add(bean);
  const bee = new THREE.Group();
  const bb = new THREE.Mesh(new THREE.SphereGeometry(.3, 32, 20), new THREE.MeshPhysicalMaterial({ color: 0xe2a82e, roughness: .35, metalness: .3, clearcoat: .6 })); bb.scale.set(1.45, 1, 1); bee.add(bb);
  const stripe = std(0x1c1208, .5);
  [-.12, .08, .26].forEach((x) => { const b = new THREE.Mesh(new THREE.TorusGeometry(.28, .045, 10, 32), stripe); b.rotation.y = Math.PI / 2; b.position.x = x; b.scale.set(1, 1 - Math.abs(x) * .6, 1 - Math.abs(x) * .6); bee.add(b); });
  const head = new THREE.Mesh(new THREE.SphereGeometry(.2, 24, 16), stripe); head.position.x = -.5; bee.add(head);
  const wingMat = new THREE.MeshPhysicalMaterial({ color: 0xfff6e0, emissive: 0xcdb17d, emissiveIntensity: .35, roughness: .1, transparent: true, opacity: .7, side: THREE.DoubleSide });
  const wings = [-1, 1].map((s) => { const w = new THREE.Mesh(new THREE.CircleGeometry(.36, 24), wingMat); w.scale.set(.65, 1, 1); w.position.set(-.05, .25, s * .12); w.rotation.x = Math.PI / 2; const p = new THREE.Group(); p.add(w); p.userData.s = s; bee.add(p); return p; });
  bee.scale.setScalar(1.35); group.add(bee);
  const trail = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .35 })); trail.scale.set(1.4, 1.4, 1); group.add(trail);
  return {
    group,
    update({ t }) {
      bean.rotation.y = .4 + t * .2;
      const a = t * .9; bee.position.set(Math.cos(a) * 2.5, Math.sin(a * 2) * .6 + .5, Math.sin(a) * 1.8);
      bee.rotation.y = Math.atan2(-Math.cos(a) * 1.8, Math.sin(a) * 2.5); bee.rotation.z = Math.sin(t * 3) * .1;
      wings.forEach((w) => (w.rotation.x = Math.sin(t * 60) * .6 * w.userData.s)); trail.position.copy(bee.position);
    },
  };
}

/* ============ 10 · the invitation rises out of the gift box (by scroll) ============ */
function cardTexture() {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 800;
  const g = c.getContext('2d');
  g.fillStyle = '#f8f2e6'; g.fillRect(0, 0, 1200, 800);
  g.strokeStyle = '#b8975a'; g.lineWidth = 8; g.strokeRect(40, 40, 1120, 720); g.lineWidth = 2; g.strokeRect(64, 64, 1072, 672);
  g.textAlign = 'center';
  g.fillStyle = '#a9884e'; g.font = '500 30px Jost, sans-serif'; g.fillText('B Y   I N V I T A T I O N', 600, 210);
  g.fillStyle = '#123d35'; g.font = '400 110px "Libre Caslon Display", Georgia, serif'; g.fillText('Bees & Beans', 600, 350);
  g.fillStyle = '#a9884e'; g.font = 'italic 400 52px "Libre Caslon Display", Georgia, serif'; g.fillText('a gift worth remembering', 600, 440);
  g.fillStyle = '#5f4c40'; g.font = '400 30px Jost, sans-serif'; g.fillText('Handmade chocolates · Panipat', 600, 580);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export function invite(kit, { glow }) {
  const group = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .25, metalness: 1 });
  const gb = kit.giftBox({ lid: true });
  const box = new THREE.Group(); box.add(gb.box); gb.lid.position.y = gb.size.BH + .02; box.add(gb.lid); box.scale.setScalar(.72); box.position.y = -1.4; group.add(box);
  const card = new THREE.Group();
  card.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(3.66, 2.46, .02), gold)));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), new THREE.MeshStandardMaterial({ map: cardTexture(), roughness: .7 })); face.position.z = .012; card.add(face);
  const wax = new THREE.Mesh(new THREE.CylinderGeometry(.34, .36, .1, 32), new THREE.MeshPhysicalMaterial({ color: 0x8e1b24, roughness: .35, clearcoat: .7 })); wax.rotation.x = Math.PI / 2; wax.position.set(0, -.92, .07); card.add(wax);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffd28a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); halo.scale.set(9, 6, 1); halo.position.z = -.5; card.add(halo);
  group.add(card);
  return {
    group,
    update({ t, lp }) {
      const k = smooth(clamp01(lp / .8));
      gb.lid.position.set(lerp(0, .3, k), lerp(gb.size.BH + .02, 2.8, k), lerp(0, -3, k)); gb.lid.rotation.set(lerp(0, .55, k), 0, lerp(0, -.15, k));
      card.position.set(0, lerp(-1.6, 1.1, k), lerp(0, .8, k)); card.rotation.set(lerp(-1.4, -.08, k), Math.sin(t * .6) * .12 * k, 0); card.scale.setScalar(lerp(.5, 1, k));
      halo.material.opacity = .55 * k; box.rotation.y = -.4;
    },
  };
}

/* ============ 11 · the reply: a calm sky of drifting chocolates; celebrate() bursts it ============ */
export function reply(kit) {
  const group = new THREE.Group(), rnd = kit.rnd, items = [];
  ['tm', 'ro', 'me', 'he', 'td', 'tw', 'ro', 'me', 'tm', 'he'].forEach((k) => items.push(kit.MAKE[k]()));
  for (let i = 0; i < 3; i++) { const gb = kit.giftBox({ lid: true }), g = new THREE.Group(); g.add(gb.box); gb.lid.position.y = gb.size.BH + .02; g.add(gb.lid); g.scale.setScalar(.22); items.push(g); }
  items.forEach((o) => {
    o.userData = { home: new THREE.Vector3((rnd() - .5) * 20, (rnd() - .5) * 12, -6 - rnd() * 10), spin: new THREE.Vector3(rnd() - .5, rnd() - .5, 0).multiplyScalar(.8), ph: rnd() * 6, burst: new THREE.Vector3() };
    if (!o.isGroup || o.children.length < 4) o.scale.multiplyScalar(1.4);
    group.add(o);
  });
  let boom = 0;
  return {
    group,
    celebrate() { items.forEach((o) => { const d = o.userData; d.burst.copy(d.home).setZ(0).normalize().multiplyScalar(6 + rnd() * 6); d.burst.z = 4 + rnd() * 6; }); boom = 1; },
    update({ t, dt }) {
      boom = Math.max(0, boom - dt * .55); const b = boom * boom;
      items.forEach((o) => { const d = o.userData; o.position.set(d.home.x + Math.sin(t * .2 + d.ph) * .8 + d.burst.x * b, d.home.y + Math.sin(t * .3 + d.ph) * .6 + d.burst.y * b, d.home.z + d.burst.z * b); o.rotation.x += d.spin.x * dt * (1 + b * 8); o.rotation.y += d.spin.y * dt * (1 + b * 8); });
    },
  };
}

/* ============ the pod + ingredients (opening of the craft) ============ */
export function pod(kit) {
  const group = new THREE.Group(), rnd = kit.rnd;
  const profile = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; profile.push(new THREE.Vector2(Math.max(.02, .62 * Math.pow(Math.sin(Math.PI * t), .75) * (1 - .12 * t)), -1.35 + t * 2.7)); }
  const geo = mergeVertices(new THREE.LatheGeometry(profile, 64).deleteAttribute('normal').deleteAttribute('uv'));
  const pp = geo.attributes.position;
  for (let k = 0; k < pp.count; k++) { const x = pp.getX(k), z = pp.getZ(k), f = 1 + .07 * Math.pow(Math.abs(Math.cos(Math.atan2(z, x) * 5)), 3); pp.setX(k, x * f); pp.setZ(k, z * f); }
  geo.computeVertexNormals();
  const rig = new THREE.Group();
  rig.add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0xd8962a, roughness: .42, clearcoat: .5, sheen: .5, sheenColor: new THREE.Color(0xa0521a) })));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, .35, 10), std(0x6b4a2a, .8)); stem.position.y = 1.45; rig.add(stem);
  rig.rotation.z = -.5; rig.scale.setScalar(1.25); group.add(rig);
  const ball = new THREE.SphereGeometry(1, 20, 14), bits = [];
  [[std(0x5a3020, .75), [.26, .14, .17], 10], [std(0xb98256, .7), [.3, .12, .17], 7], [std(0x8faa45, .6), [.2, .13, .15], 6], [new THREE.MeshPhysicalMaterial({ color: 0x9a1f2c, roughness: .35, clearcoat: .6 }), [.13, .13, .13], 6], [std(0xa8743f, .55), [.17, .16, .17], 5]]
    .forEach(([m, sc, n]) => { for (let i = 0; i < n; i++) { const o = new THREE.Mesh(ball, m); o.scale.set(...sc).multiplyScalar(1.3); o.userData = { r: 1.9 + rnd() * 2.4, a: rnd() * Math.PI * 2, y: (rnd() - .5) * 3, sp: (.15 + rnd() * .2) * (rnd() > .5 ? 1 : -1), spin: rnd() * 2 }; group.add(o); bits.push(o); } });
  return { group, update({ t }) { rig.rotation.y = t * .3; bits.forEach((o) => { const d = o.userData, a = d.a + t * d.sp; o.position.set(Math.cos(a) * d.r, d.y + Math.sin(t + d.a) * .15, Math.sin(a) * d.r * .7); o.rotation.set(t * d.spin, t * d.spin * .7, 0); }); } };
}
