import * as THREE from 'three';
import { smooth, out, lerp, pose } from './beadMath.js';

export function createBeadRenderer({ canvas, width, height, items, palette }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-54, 54, 49, -49, 0.1, 1000);
  camera.position.set(0, 0, 160);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8b6d60, 2.4));
  const key = new THREE.DirectionalLight(0xfff8ef, 3);
  key.position.set(-30, 45, 85); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2);
  rim.position.set(40, -10, 15); scene.add(rim);
  const group = new THREE.Group(); scene.add(group);
  const shape = new THREE.Shape(); shape.absarc(0, 0, 0.45, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.17, 0, Math.PI * 2, true); shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.025, bevelSegments: 2, steps: 1, curveSegments: 10 });
  const beads = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({ roughness: 0.24, metalness: 0.025 }), items.length);
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.94, 0.94, 0.08), new THREE.MeshStandardMaterial({ roughness: 0.8 }), items.length);
  group.add(beads, tiles);
  const color = new THREE.Color();
  items.forEach((item, i) => {
    const rgb = palette[item.id];
    color.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace);
    beads.setColorAt(i, color); tiles.setColorAt(i, color);
  });
  beads.instanceColor.needsUpdate = tiles.instanceColor.needsUpdate = true;
  beads.frustumCulled = tiles.frustumCulled = false;
  const dummy = new THREE.Object3D();
  let lastInstanceState = null;
  return {
    warm: () => renderer.compileAsync(scene, camera),
    resize: (w, h) => renderer.setSize(w, h, false),
    render(t) {
      const p = pose(t);
      group.rotation.set(p.rx, p.ry, p.rz); group.position.set(p.x, p.y, 0); group.scale.setScalar(p.scale);
      const visible = smooth((t - 1.25) / 0.65);
      const flat = t < 2 ? 1 - smooth((t - 1.7) / 0.4) : 0;
      beads.visible = visible > 0 && flat < 1; tiles.visible = visible > 0 && flat > 0;
      const relief = t > 6.95 ? smooth((t - 6.95) / 0.38) : 0;
      const state = t < 3.5 ? null : relief;
      if (visible > 0 && (state === null || state !== lastInstanceState)) {
        items.forEach((item, i) => {
          const delay = (item.x + 32 + item.y + 32) / 128 * 0.24;
          const k = out((t - 1.65 - delay) / 1.4), spread = 1 - k;
          dummy.position.set(item.x + Math.cos(item.angle) * spread * 22, item.y + Math.sin(item.angle) * spread * 28, spread * (12 + Math.abs(item.rnd) * 35));
          dummy.rotation.set(spread * 0.45, spread * 0.6, spread * item.rnd);
          const scale = visible * (0.2 + 0.8 * k);
          dummy.scale.set(scale, scale, scale * lerp(0.8, item.height, relief)); dummy.updateMatrix(); beads.setMatrixAt(i, dummy.matrix);
          dummy.scale.set(scale, scale, 1); dummy.updateMatrix(); tiles.setMatrixAt(i, dummy.matrix);
        });
        lastInstanceState = state;
        beads.instanceMatrix.needsUpdate = tiles.instanceMatrix.needsUpdate = true;
      }
      if (visible === 0) lastInstanceState = null;
      beads.material.transparent = tiles.material.transparent = true;
      beads.material.opacity = 1 - flat; tiles.material.opacity = flat;
      renderer.render(scene, camera);
    },
    dispose() {
      geometry.dispose(); tiles.geometry.dispose(); beads.material.dispose(); tiles.material.dispose(); renderer.dispose();
    }
  };
}
