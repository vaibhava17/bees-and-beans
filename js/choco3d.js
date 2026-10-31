// Shared procedural chocolates + gift box (three.js). Used by the hero world and the "block to box" story.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export function createKit(seed = 7) {
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const choc = (color, rough = .3, coat = .6) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat: coat, clearcoatRoughness: .28, sheen: .25, sheenColor: new THREE.Color(0x8a5a3a) });
  const M = {
    dark: choc(0x24110a), milk: choc(0x5a2f1a, .34), white: choc(0xeadcc4, .45, .3),
    almond: new THREE.MeshStandardMaterial({ color: 0xb98256, roughness: .7 }),
    pista: new THREE.MeshStandardMaterial({ color: 0x8faa45, roughness: .65 }),
    cran: new THREE.MeshStandardMaterial({ color: 0x8e1f2b, roughness: .5 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x2a2a48, roughness: .45 }),
    seed: new THREE.MeshStandardMaterial({ color: 0xe6d9b4, roughness: .7 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xf2ece1, roughness: .75 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .3, metalness: .9 }),
    ribbon: new THREE.MeshPhysicalMaterial({ color: 0x4a2a1a, roughness: .35, sheen: 1, sheenColor: new THREE.Color(0xc89a6a), sheenRoughness: .3 }),
  };

  const sphere = new THREE.SphereGeometry(1, 12, 8);
  function scatter(g, n, rMax, y) {
    const kinds = [[M.almond, .09, .045, .05], [M.pista, .06, .04, .05], [M.cran, .05, .045, .05], [M.blue, .045, .045, .045], [M.seed, .045, .015, .03]];
    for (let k = 0; k < n; k++) {
      const [mat, a, b, c] = kinds[k % kinds.length], r = Math.sqrt(rnd()) * rMax, t = rnd() * Math.PI * 2;
      const m = new THREE.Mesh(sphere, mat); m.scale.set(a, b, c); m.position.set(Math.cos(t) * r, y + b * .6, Math.sin(t) * r); m.rotation.y = rnd() * 6; g.add(m);
    }
  }
  function truffle(mat, pipeMat) {
    const g = new THREE.Group();
    const cup = new THREE.CylinderGeometry(.34, .3, .38, 48, 3);
    const pos = cup.attributes.position;
    for (let k = 0; k < pos.count; k++) { // moulded flutes on the side
      const x = pos.getX(k), z = pos.getZ(k);
      if (Math.hypot(x, z) > .25 && Math.abs(pos.getY(k)) < .19) { const f = 1 + .045 * Math.cos(Math.atan2(z, x) * 22); pos.setX(k, x * f); pos.setZ(k, z * f); }
    }
    cup.computeVertexNormals(); cup.translate(0, .19, 0);
    g.add(new THREE.Mesh(cup, mat));
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.37, .2, 0), new THREE.Vector3(-.33, .39, 0), new THREE.Vector3(0, .4, 0), new THREE.Vector3(.33, .39, 0), new THREE.Vector3(.37, .24, 0)]);
    const tube = new THREE.TubeGeometry(curve, 32, .022, 8);
    for (const rot of [0, Math.PI / 2]) { const pipe = new THREE.Mesh(tube, pipeMat); pipe.rotation.y = rot + .5; g.add(pipe); } // hand-piped cross
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
    // shared vertices so the bumpy surface stays smooth (no facets, no cracks)
    const core = mergeVertices(new THREE.IcosahedronGeometry(.27, 3).deleteAttribute('normal').deleteAttribute('uv'));
    const pos = core.attributes.position;
    for (let k = 0; k < pos.count; k++) { const f = 1 + (rnd() - .5) * .12; pos.setXYZ(k, pos.getX(k) * f, pos.getY(k) * f * .82, pos.getZ(k) * f); }
    core.computeVertexNormals();
    const parts = [core.toNonIndexed()];
    for (let k = 0; k < 22; k++) { // almond flakes
      const flake = new THREE.BoxGeometry(.15, .018, .09).deleteAttribute('uv');
      flake.rotateX(rnd() * 3); flake.rotateY(rnd() * 3); flake.rotateZ(rnd() * 3);
      const t = rnd() * Math.PI * 2, u = rnd() * .9 - .2, rr = .24 * Math.sqrt(1 - u * u);
      flake.translate(Math.cos(t) * rr, u * .2, Math.sin(t) * rr);
      parts.push(flake.toNonIndexed());
    }
    const geo = mergeGeometries(parts); geo.translate(0, .22, 0);
    return new THREE.Mesh(geo, M.milk);
  }
  const MAKE = { tm: () => truffle(M.milk, M.white), td: () => truffle(M.dark, M.white), tw: () => truffle(M.white, M.dark), me: mendiant, he: heart, ro: rocher };

  // gift box: cream tray, gold liner + dividers; ribbon bands + bow (like the real Bees & Beans box)
  function giftBox({ BW = 4.6, BD = 3.5, BH = .55, lid = false } = {}) {
    const box = new THREE.Group();
    box.add(new THREE.Mesh(new THREE.BoxGeometry(BW, .08, BD).translate(0, -.04, 0), M.paper));
    for (const [w, d, x, z] of [[BW, .08, 0, BD / 2], [BW, .08, 0, -BD / 2], [.08, BD, BW / 2, 0], [.08, BD, -BW / 2, 0]]) box.add(new THREE.Mesh(new THREE.BoxGeometry(w, BH, d).translate(x, BH / 2 - .04, z), M.paper));
    box.add(new THREE.Mesh(new THREE.BoxGeometry(BW - .2, .02, BD - .2).translate(0, .01, 0), M.gold));
    for (let c = 1; c < 4; c++) box.add(new THREE.Mesh(new THREE.BoxGeometry(.03, .16, BD - .2).translate((c - 2) * 1.06, .08, 0), M.gold));
    for (let r = 1; r < 3; r++) box.add(new THREE.Mesh(new THREE.BoxGeometry(BW - .2, .16, .03).translate(0, .08, (r - 1.5) * 1.06), M.gold));
    const ribbon = new THREE.Group();
    const top = lid ? .1 : BH + .06;
    const bandZ = new THREE.Mesh(new THREE.BoxGeometry(.34, .03, BD + .26), M.ribbon); bandZ.position.set(-1.25, top, 0);
    const bandX = new THREE.Mesh(new THREE.BoxGeometry(BW + .26, .03, .34), M.ribbon); bandX.position.set(0, top + .02, .95);
    const bow = new THREE.Group(); bow.position.set(-1.25, top + .08, .95);
    for (const s of [-1, 1]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(.26, .07, 10, 28), M.ribbon); loop.scale.set(1, .55, .35); loop.rotation.set(Math.PI / 2, 0, s * .5); loop.position.x = s * .26; bow.add(loop); }
    bow.add(new THREE.Mesh(new THREE.SphereGeometry(.1, 16, 12), M.ribbon));
    ribbon.add(bandZ, bandX, bow);
    let lidMesh = null;
    if (lid) { // a lid that carries the ribbon
      lidMesh = new THREE.Group();
      lidMesh.add(new THREE.Mesh(new THREE.BoxGeometry(BW + .12, .12, BD + .12).translate(0, .02, 0), [M.paper, M.paper, M.paper, M.paper, M.paper, M.paper]));
      lidMesh.add(new THREE.Mesh(new THREE.BoxGeometry(BW + .14, .03, BD + .14).translate(0, -.035, 0), M.gold));
      lidMesh.add(ribbon);
    }
    return { box, ribbon, bandZ, bandX, bow, lid: lidMesh, size: { BW, BD, BH } };
  }

  return { M, MAKE, giftBox, rnd };
}

export function setupRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('no webgl');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}
