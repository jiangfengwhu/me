/**
 * ============================================================================
 * LUSION SPATIAL EVOLUTION WEBGL BACKGROUND (`#canvas`)
 * ============================================================================
 * Reverse-engineered from https://lusion.co/:
 * - Fixed full-viewport WebGL canvas (`position: fixed; inset: 0; z-index: 0`)
 * - Smoothly interpolates between Light Studio Mode (`#f0f1fa`) and Dark
 *   Tunnel Mode (`#05060b`) based on scroll progress (`scrollProgress`).
 * - Interactive 3D procedural sculpture + spatial particle grid reacting to
 *   cursor coordinates, scroll velocity, and active section state.
 * ============================================================================
 */

import * as THREE from 'three';

export class LusionBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.scrollProgress = 0;
    this.targetScroll = 0;
    this.darkMix = 0;
    this.targetDarkMix = 0;

    this.pointer = new THREE.Vector2(0, 0);
    this.targetPointer = new THREE.Vector2(0, 0);
    this.clock = new THREE.Clock();

    this.initScene();
    this.initLights();
    this.initSculpture();
    this.initParticles();
    this.bindEvents();
  }

  initScene() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.scene = new THREE.Scene();
    this.lightBgColor = new THREE.Color('#f0f1fa');
    this.darkBgColor = new THREE.Color('#05060c');
    this.currentBgColor = this.lightBgColor.clone();

    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      150
    );
    this.camera.position.set(0, 0, 18);
  }

  initLights() {
    this.ambientLight = new THREE.AmbientLight(0xdde2ff, 1.35);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(8, 12, 10);
    this.scene.add(this.keyLight);

    this.blueLight = new THREE.PointLight(0x1a2ffb, 6.5, 35);
    this.blueLight.position.set(-7, 4, 8);
    this.scene.add(this.blueLight);

    this.accentLight = new THREE.PointLight(0xc1ff00, 3.8, 30);
    this.accentLight.position.set(7, -5, 6);
    this.scene.add(this.accentLight);
  }

  initSculpture() {
    this.sculptureGroup = new THREE.Group();
    this.scene.add(this.sculptureGroup);

    // Core sculptural ribbon (TorusKnot with custom vertex displacement)
    const knotGeo = new THREE.TorusKnotGeometry(3.1, 0.72, 200, 36, 2, 3);
    knotGeo.computeVertexNormals();
    this.basePositions = Float32Array.from(knotGeo.attributes.position.array);

    this.coreMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e4e7f8'),
      emissive: new THREE.Color('#0a1570'),
      emissiveIntensity: 0.15,
      metalness: 0.32,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      iridescence: 0.75,
      iridescenceIOR: 1.4,
      wireframe: false
    });

    this.coreMesh = new THREE.Mesh(knotGeo, this.coreMaterial);
    this.sculptureGroup.add(this.coreMesh);

    // Precision architectural wireframe cage around the core
    const cageGeo = new THREE.IcosahedronGeometry(5.2, 2);
    this.cageMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a2ffb,
      wireframe: true,
      transparent: true,
      opacity: 0.09
    });
    this.cageMesh = new THREE.Mesh(cageGeo, this.cageMaterial);
    this.sculptureGroup.add(this.cageMesh);

    // Floating orbital spheres (metaball satellites)
    this.orbitSpheres = [];
    const sphereGeo = new THREE.SphereGeometry(0.42, 32, 32);
    for (let i = 0; i < 6; i++) {
      const mat = new THREE.MeshPhysicalMaterial({
        color: i % 2 === 0 ? 0x1a2ffb : 0x0d1126,
        metalness: 0.65,
        roughness: 0.15,
        clearcoat: 1.0
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      this.sculptureGroup.add(mesh);
      this.orbitSpheres.push({
        mesh,
        radius: 4.5 + (i % 3) * 1.1,
        speed: 0.45 + i * 0.12,
        phase: (i * Math.PI) / 3,
        tilt: (i - 2.5) * 0.35
      });
    }
  }

  initParticles() {
    const count = 420;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 42;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 26 - 4;
      scales[i] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    this.particleMaterial = new THREE.PointsMaterial({
      color: 0x1a2ffb,
      size: 0.09,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geo, this.particleMaterial);
    this.scene.add(this.particles);
  }

  setScrollState(scrollProgress, isDarkTheme) {
    this.targetScroll = scrollProgress;
    this.targetDarkMix = isDarkTheme ? 1 : 0;
  }

  bindEvents() {
    window.addEventListener(
      'pointermove',
      (e) => {
        this.targetPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      },
      { passive: true }
    );

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  update() {
    const t = this.clock.getElapsedTime();

    this.scrollProgress += (this.targetScroll - this.scrollProgress) * 0.07;
    this.darkMix += (this.targetDarkMix - this.darkMix) * 0.06;
    this.pointer.lerp(this.targetPointer, 0.06);

    // Smoothly blend background color and material mood between light & dark sections
    this.currentBgColor.lerpColors(this.lightBgColor, this.darkBgColor, this.darkMix);
    this.renderer.setClearColor(this.currentBgColor, 1);

    const lightCore = new THREE.Color('#e2e6f7');
    const darkCore = new THREE.Color('#131b3a');
    this.coreMaterial.color.lerpColors(lightCore, darkCore, this.darkMix);
    this.coreMaterial.emissiveIntensity = 0.14 + this.darkMix * 0.45;
    this.cageMaterial.opacity = 0.08 + this.darkMix * 0.12;
    this.particleMaterial.color.setHex(this.darkMix > 0.5 ? 0xc1ff00 : 0x1a2ffb);

    // Subtle organic wave deformation on core sculpture vertices
    const posAttr = this.coreMesh.geometry.attributes.position;
    const arr = posAttr.array;
    const base = this.basePositions;
    for (let i = 0; i < arr.length; i += 3) {
      const bx = base[i];
      const by = base[i + 1];
      const bz = base[i + 2];
      const wave =
        Math.sin(bx * 0.85 + t * 1.4) *
        Math.cos(by * 0.85 + t * 1.1) *
        0.14;
      arr[i] = bx + wave;
      arr[i + 1] = by + wave * 0.8;
      arr[i + 2] = bz + wave * 0.6;
    }
    posAttr.needsUpdate = true;

    // Position & rotate sculpture across the Lusion scroll narrative
    const scrollAngle = this.scrollProgress * Math.PI * 2.4;
    this.sculptureGroup.rotation.y = t * 0.18 + scrollAngle + this.pointer.x * 0.55;
    this.sculptureGroup.rotation.x = Math.sin(t * 0.25) * 0.3 + this.pointer.y * 0.4;

    // Shift sculpture gently aside during the Featured Works section so the 3D Bookshelf takes center stage
    const shelfFocus =
      this.scrollProgress > 0.28 && this.scrollProgress < 0.68 ? 1 : 0;
    const targetX = shelfFocus ? 5.8 : Math.sin(this.scrollProgress * Math.PI * 2) * 2.2;
    const targetZ = shelfFocus ? -6.5 : 0;

    this.sculptureGroup.position.x += (targetX - this.sculptureGroup.position.x) * 0.04;
    this.sculptureGroup.position.z += (targetZ - this.sculptureGroup.position.z) * 0.04;
    this.sculptureGroup.position.y = Math.cos(t * 0.4) * 0.45;

    // Animate orbital spheres
    this.orbitSpheres.forEach((orb) => {
      const a = t * orb.speed + orb.phase;
      orb.mesh.position.set(
        Math.cos(a) * orb.radius,
        Math.sin(a * 1.3) * 2.2 + orb.tilt,
        Math.sin(a) * orb.radius
      );
    });

    // Rotate particle field
    this.particles.rotation.y = -t * 0.03 + this.pointer.x * 0.15;
    this.particles.rotation.x = this.pointer.y * 0.12;

    // Dynamic lights following cursor
    this.blueLight.position.x = -6 + this.pointer.x * 8;
    this.blueLight.position.y = 4 + this.pointer.y * 6;

    this.renderer.render(this.scene, this.camera);
  }
}
