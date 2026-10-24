import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import gsap from 'gsap';
import { createPerformanceProbe } from '../dev/PerformanceProbe.js';
import { createBulletinCardConfigs } from '../data/bulletinCards.js';
import { RenderScheduler } from './RenderScheduler.js';
import { createContributionSnake } from './ContributionSnake.js';
import { workBackgroundAt } from '../data/workTheme.js';
import {
  createPaintedWallMaps,
  createBulletinCardTexture,
  createStripeBookTextures,
  createBookshelfMaps,
  setCoverPace,
  coverStats,
  coversSettled
} from './PBRTextures.js';

/**
 * ============================================================================
 * 3D TWO-ACT PAINTED GALLERY WALL, ROUNDED BULLETIN BOARD & KRAFT BOOKSHELF
 * ============================================================================
 * 1. Gray-black painted wall (`灰黑色刷涂料的墙`) + Global Illumination +
 *    Full-width Top Linear Light Bar (`页面顶部打一整条的线光源`).
 * 2. Act I Bulletin Board cards with true 3D rounded corners (`圆角`) and
 *    interactive micro-thickness expansion on hover (`hover时带点微厚度`).
 * 3. Hover light is a single focused Volumetric 3D Light Cone (`一个光锥`).
 * 4. Auto-switch between Act I & Act II when pointer moves to far right/left
 *    screen edges, and atomic scroll transitions that never get stuck midway.
 * 5. Detailed Kraft Paper (`牛皮纸`) books & architectural walnut/brass bookshelf.
 * 6. Properly proportioned Detail Route 3D books (`scale = 0.68`) that
 *    continuously follow scroll progress in real time (`跟随滚动连续切换`).
 * 7. 3D Pixel-Art / Voxel Saber Mascot (`像素风小人`) with zero base ring.
 * ============================================================================
 */

const ACT1_CENTER_X = 0;
const BOOKSHELF_CENTER_X = 76;

/**
 * Builds a true 3D Rounded Rectangle Extruded Geometry with normalized [0..1]
 * planar UVs on the front face (`materialIndex === 0`) and smooth beveled edges.
 */
function createRoundedCardGeometry(w, h, depth, radius = 1.05) {
  const r = Math.min(radius, w * 0.45, h * 0.45);
  const hw = w * 0.5;
  const hh = h * 0.5;

  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.14,
    bevelThickness: 0.14,
    curveSegments: 18
  });

  // Center geometry along Z so it spans [-depth/2 .. +depth/2]
  geom.translate(0, 0, -depth * 0.5);

  // Normalize UVs so the front cap maps [0..1] across [-hw..hw, -hh..hh]
  const pos = geom.attributes.position;
  const uv = geom.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uv.setXY(
      i,
      THREE.MathUtils.clamp((x + hw) / w, 0, 1),
      THREE.MathUtils.clamp((y + hh) / h, 0, 1)
    );
  }
  uv.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

/**
 * Generates a soft-edge axial + radial attenuation texture for the 3D Hover Light Cone
 */
function createLightConeAlphaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Vertical gradient along the cone length (bright near apex, softly fading toward base)
  const imgData = ctx.createImageData(256, 512);
  const data = imgData.data;

  for (let y = 0; y < 512; y++) {
    // v = 0 at cone base, v = 1 at cone apex
    const v = y / 511;
    const axial = Math.pow(Math.sin(v * Math.PI * 0.92), 1.15) * (0.25 + 0.75 * v);
    for (let x = 0; x < 256; x++) {
      // Soft radial bell curve so cone silhouette edges are seamless
      const u = (x / 255) * 2 - 1;
      const radial = Math.pow(Math.cos(u * Math.PI * 0.5), 1.8);
      const alpha = Math.round(255 * axial * radial);
      const idx = (y * 256 + x) * 4;
      data[idx] = 255;
      data[idx + 1] = 250;
      data[idx + 2] = 240;
      data[idx + 3] = alpha;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export class NightStreetScene {
  constructor({
    container,
    profile,
    socialLinks,
    books,
    sound,
    onActProgressChange,
    onShelfFocusChange,
    onSelectBook,
    onDetailActiveChange
  }) {
    this.container = container;
    this.profile = profile;
    this.socialLinks = socialLinks;
    this.booksData = books;
    this.shelfLayout = {
      frontZ: -4,
      backZ: -4 - Math.max(...books.map(book => book.dimensions.width)) - 1.2,
      bookOverhang: 0.28,
      bookRestGap: 0.07,
      ledgeThickness: 0.44
    };
    this.sound = sound;

    this.onActProgressChange = onActProgressChange || (() => {});
    this.onShelfFocusChange = onShelfFocusChange || (() => {});
    this.onSelectBook = onSelectBook || (() => {});
    this.onDetailActiveChange = onDetailActiveChange || (() => {});

    // Act state (`currentAct` is strictly 1 or 2; never stuck midway)
    this.currentAct = 1;
    this.isTransitioningAct = false;
    this.lastActSwitchTime = 0;
    this.streetProgress = 0;

    this.focusedPlaqueIndex = 0;
    this.focusedShelfIndex = 0;
    this.shelfScrollTarget = 0;
    this.shelfScrollFloat = 0;
    this.shelfCameraY = 2.5;
    this.lastShelfStepTime = 0;

    // Secondary Detail Route state & continuous scroll-linked float index
    this.isDetailRoute = false;
    this.activeBook = null;
    this.detailSectionMetrics = [];
    this.currentDetailScrollTop = 0;
    this.detailScrollFloatIndex = 0;
    this.smoothDetailFloatIndex = 0;

    // Interactive Raycasting & Drag Twirl State
    this.pointerNDC = new THREE.Vector2(-999, -999);
    this.smoothPointer = new THREE.Vector2(0, 0);
    this.pointerTarget = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();
    this.hoveredPlaque = null;
    this.hoveredBook = null;

    this.isDraggingBook = false;
    this.dragMoved = false;
    this.prevPointer = { x: 0, y: 0 };
    this.twirlVelocity = { x: 0, y: 0 };
    this.userTwirlOffset = { x: 0, y: 0 };
    this.dragTargetBook = null;

    this.plaques = [];
    this.books = [];
    this.animationTime = 0;
    this.tempRimColor = new THREE.Color();
    this.tempBookPosition = new THREE.Vector3();

    this.materialParams = {
      wallRoughness: 0.64,
      wallBumpScale: 0.16,
      bookRoughness: 0.62,
      bookBumpScale: 0.16,
      lampIntensity: 1.0
    };

    RectAreaLightUniformsLib.init();

    this.initRendererAndScene();
    this.buildGlobalIlluminationEnvironment();
    this.buildTopLinearLightAndHoverCone();
    this.buildPaintedWallStage();
    this.buildAct1BulletinBoard();
    this.buildAct2Bookshelf();
    this.buildVoxelSaberMascot();
    this.bindEvents();

    this.animate = this.animate.bind(this);
    this.lastFrameAt = performance.now();
    this.renderScheduler = new RenderScheduler(this.animate, {
      onState: (state, count) => {
        this.container.dataset.renderState = state;
        this.container.dataset.renderCount = String(count);
      }
    });
    // One frame so the stage is not blank underneath the preloader.
    this.requestRenderFor(600);
  }

  syncBulletinMotion() {
    this.contributionSnake?.setActive(Boolean(this.motionReady && this.currentAct === 1 && !this.isDetailRoute && !document.hidden));
  }

  /**
   * Everything that has to exist before the visitor can interact without a
   * hitch: Act II boards + their kraft paper textures + their cover art, every
   * shader program, and every GPU texture upload. Reports 0..1 so the preloader
   * can narrate progress.
   */
  warmup(onProgress = () => {}) {
    if (this.warmupPromise) return this.warmupPromise;
    const report = (value, label) => onProgress(Math.max(0, Math.min(1, value)), label);

    this.warmupPromise = (async () => {
      report(0.05, '正在搭建公告栏与书架');
      await this.nextFrame();

      // Nothing is visible behind the curtain yet, so the cover queue can run at
      // full tilt instead of one-per-idle-slot.
      setCoverPace(20);

      report(0.18, '正在装订牛皮纸书脊');
      await this.buildShelfIncrementally(report);

      // Act II is not "loaded" until its covers are decoded and painted — else
      // they pop in (and hitch) right after the reveal.
      report(0.3, '正在冲印七卷封面');
      await this.awaitCovers(report);

      report(0.42, '正在编译场景着色器');
      await Promise.all(this.plaques.map(plaque => plaque.cardTex.ready));
      if (this.renderer.compileAsync) {
        const visible = [this.act1Group.visible, this.act2Group.visible];
        this.act1Group.visible = this.act2Group.visible = true;
        await this.renderer.compileAsync(this.scene, this.camera).catch(() => {});
        [this.act1Group.visible, this.act2Group.visible] = visible;
      } else {
        this.renderer.compile(this.scene, this.camera);
      }

      await this.uploadTextures(report);

      // One full frame with Act II on stage: compiles its shadow-depth programs
      // and fills the shadow map, so walking into Act II does not hitch. The
      // stage is put back immediately afterwards with a clean shadow map.
      report(0.92, '正在预演第二幕光影');
      const staged = [this.act1Group.visible, this.act2Group.visible];
      this.act1Group.visible = this.act2Group.visible = true;
      this.renderer.shadowMap.needsUpdate = true;
      this.renderer.render(this.scene, this.camera);
      [this.act1Group.visible, this.act2Group.visible] = staged;

      report(0.96, '正在校准灯光与镜头');
      this.renderer.shadowMap.needsUpdate = true;
      this.renderer.render(this.scene, this.camera);
      await this.nextFrame();
      this.lastFrameAt = performance.now();

      // Back to the gentle post-reveal pace for any book added later.
      setCoverPace(180);
      report(1, '准备就绪');
    })();

    return this.warmupPromise;
  }

  /**
   * Builds the seven volumes one per frame so the progress meter keeps moving
   * instead of freezing for seconds behind the curtain.
   */
  async buildShelfIncrementally(report) {
    if (this.shelfReady) return;
    this.shelfReady = true;
    this.beginShelfRebuild();

    const total = this.booksData.length;
    for (let i = 0; i < total; i++) {
      this.buildBookAt(this.booksData[i], i);
      report(0.18 + 0.12 * ((i + 1) / total), `正在装订第 ${i + 1}/${total} 卷`);
      await this.nextFrame();
    }
  }

  /** Waits for the cover-art queue, narrating 0.30 → 0.40 as each one lands. */
  async awaitCovers(report) {
    let settled = false;
    coversSettled().then(() => { settled = true; });

    // Never let a slow/blocked CDN hold the curtain closed for ever.
    const deadline = performance.now() + 9000;
    while (!settled && performance.now() < deadline) {
      const { done, total } = coverStats();
      report(0.3 + (total ? (done / total) * 0.1 : 0), `正在冲印封面 ${done}/${total}`);
      await this.nextFrame();
    }
    if (!settled) report(0.4, '封面稍后补上，先开演');
  }

  /** rAF, but never able to stall the preloader in a background tab. */
  nextFrame() {
    return new Promise(resolve => {
      let settled = false;
      const finish = () => { if (!settled) { settled = true; resolve(); } };
      requestAnimationFrame(finish);
      setTimeout(finish, 260);
    });
  }

  async uploadTextures(report) {
    const textures = new Set();
    this.scene.traverse(object => {
      const materials = object.material
        ? (Array.isArray(object.material) ? object.material : [object.material])
        : [];
      for (const material of materials) {
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
    });

    const pending = [...textures];
    for (let i = 0; i < pending.length; i++) {
      this.renderer.initTexture(pending[i]);
      if (i % 2 === 1) {
        report(0.55 + 0.36 * ((i + 1) / pending.length), '正在上传纸张与木纹纹理');
        await this.nextFrame();
      }
    }
    report(0.92, '正在校准灯光与镜头');
  }

  initRendererAndScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x16191f);
    this.scene.fog = new THREE.FogExp2(0x16191f, 0.0032);
    this.galleryBackground = this.scene.background;
    this.galleryFog = this.scene.fog;

    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.5, 400);
    this.camera.position.set(ACT1_CENTER_X, 2.8, 56.5);
    this.cameraLookAt = new THREE.Vector3(ACT1_CENTER_X, 2.8, -6.5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      // `low-power` lets the browser pin this scene to the integrated GPU, which
      // is the single biggest frame-rate loss on hybrid laptops.
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    // A clearcoat + two rect-area-light + soft-shadow scene is fill-rate bound:
    // 2x device pixels on a retina panel costs ~44% more than 1.5x for no
    // visible gain at this depth of field. `?dpr=2` restores the old cap.
    const dprOverride = Number(new URLSearchParams(window.location.search).get('dpr'));
    this.maxPixelRatio = dprOverride > 0 ? Math.min(dprOverride, 3) : 1.5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.maxPixelRatio));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.24;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.performanceProbe = createPerformanceProbe(this.renderer);

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);
  }

  requestRenderFor(milliseconds = 900) {
    if (milliseconds > 0) this.contributionFrameOnly = false;
    if (this.renderScheduler && this.renderScheduler.state !== 'active') this.lastFrameAt = performance.now() - 16.67;
    this.renderScheduler?.wake(milliseconds);
  }

  /**
   * Requirement 1:
   * Global Illumination Environment (`需要有全球光源效果，比较有质感`)
   */
  buildGlobalIlluminationEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x1c2028);

    // Overhead full-span warm-white linear ceiling light in GI environment
    const topStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 14),
      new THREE.MeshBasicMaterial({ color: 0xfff8eb, side: THREE.DoubleSide })
    );
    topStrip.position.set(0, 38, 8);
    topStrip.lookAt(0, 0, 0);
    envScene.add(topStrip);

    // Left-front warm key bounce
    const keyBounce = new THREE.Mesh(
      new THREE.PlaneGeometry(75, 45),
      new THREE.MeshBasicMaterial({ color: 0xfde68a, side: THREE.DoubleSide })
    );
    keyBounce.position.set(-45, 18, 35);
    keyBounce.lookAt(0, 0, 0);
    envScene.add(keyBounce);

    // Right-front cool sky bounce
    const coolBounce = new THREE.Mesh(
      new THREE.PlaneGeometry(75, 45),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd, side: THREE.DoubleSide })
    );
    coolBounce.position.set(45, 12, 35);
    coolBounce.lookAt(0, 0, 0);
    envScene.add(coolBounce);

    // Warm floor bounce (simulates GI upward bounce from gallery floor)
    const floorBounce = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 80),
      new THREE.MeshBasicMaterial({ color: 0x333947, side: THREE.DoubleSide })
    );
    floorBounce.position.set(0, -32, 0);
    floorBounce.lookAt(0, 0, 0);
    envScene.add(floorBounce);

    const envRT = pmrem.fromScene(envScene, 0.04);
    this.scene.environment = envRT.texture;
    pmrem.dispose();
  }

  /**
   * Requirement 1 & 3:
   * - Global Illumination base + Full-Width Top Linear Light Bar (`页面顶部打一整条的线光源`)
   * - Single Volumetric 3D Light Cone (`hover的光源不对，现在是两个点光源，应该是一个光锥`)
   */
  buildTopLinearLightAndHoverCone() {
    // 1. Global Illumination Hemisphere & Multi-Angle Bounce Lights
    this.hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x222630, 1.25);
    this.scene.add(this.hemiLight);

    // Primary Diagonal Studio Key Light (casts soft shadows & reveals wall paint relief)
    this.diagonalKeyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    this.diagonalKeyLight.position.set(-38, 46, 54);
    this.diagonalKeyLight.target.position.set(38, -4, -10);
    this.diagonalKeyLight.castShadow = true;
    this.diagonalKeyLight.shadow.mapSize.set(1536, 1536);
    this.diagonalKeyLight.shadow.camera.near = 10;
    this.diagonalKeyLight.shadow.camera.far = 220;
    this.diagonalKeyLight.shadow.camera.left = -85;
    this.diagonalKeyLight.shadow.camera.right = 115;
    this.diagonalKeyLight.shadow.camera.top = 55;
    this.diagonalKeyLight.shadow.camera.bottom = -45;
    this.diagonalKeyLight.shadow.bias = -0.0008;
    this.diagonalKeyLight.shadow.normalBias = 0.04;
    this.scene.add(this.diagonalKeyLight);
    this.scene.add(this.diagonalKeyLight.target);

    // Secondary GI Fill Light from opposite diagonal
    this.diagonalRimLight = new THREE.DirectionalLight(0xcbd5e1, 1.15);
    this.diagonalRimLight.position.set(112, 18, 48);
    this.diagonalRimLight.target.position.set(28, 2, -10);
    this.scene.add(this.diagonalRimLight);
    this.scene.add(this.diagonalRimLight.target);

    // 2. FULL-WIDTH TOP LINEAR LIGHT BAR (`页面顶部打一整条的线光源，删除顶部多余区域`)
    // Sits flush along the very top edge of the viewport across both Act I (`x=0`) and Act II (`x=76`)
    const linearBarY = 21.35;
    const linearBarZ = -7.6;
    const linearBarSpan = 190;
    const linearBarCenterX = 38;

    this.topLinearLightGroup = new THREE.Group();
    this.scene.add(this.topLinearLightGroup);

    // Sleek dark metallic linear housing channel at top edge of viewport
    const housingMat = new THREE.MeshStandardMaterial({
      color: 0x14171d,
      roughness: 0.35,
      metalness: 0.75
    });
    const housingMesh = new THREE.Mesh(
      new THREE.BoxGeometry(linearBarSpan, 0.55, 1.4),
      housingMat
    );
    housingMesh.position.set(linearBarCenterX, linearBarY + 0.32, linearBarZ);
    this.topLinearLightGroup.add(housingMesh);

    // Bright glowing continuous linear diffuser tube (`一整条线光源发光灯带`)
    const diffuserMat = new THREE.MeshBasicMaterial({
      color: 0xfffaf0
    });
    this.topDiffuserMesh = new THREE.Mesh(
      new THREE.BoxGeometry(linearBarSpan, 0.36, 0.95),
      diffuserMat
    );
    this.topDiffuserMesh.position.set(linearBarCenterX, linearBarY, linearBarZ + 0.12);
    this.topLinearLightGroup.add(this.topDiffuserMesh);

    // Physical RectAreaLights along the top linear bar washing down the unified painted wall & scene
    this.topRectLight1 = new THREE.RectAreaLight(0xfff6e5, 8.8, 92, 2.4);
    this.topRectLight1.position.set(ACT1_CENTER_X, linearBarY - 0.2, linearBarZ + 1.2);
    this.topRectLight1.lookAt(ACT1_CENTER_X, -4, -9.5);
    this.scene.add(this.topRectLight1);

    this.topRectLight2 = new THREE.RectAreaLight(0xfff6e5, 8.8, 92, 2.4);
    this.topRectLight2.position.set(BOOKSHELF_CENTER_X, linearBarY - 0.2, linearBarZ + 1.2);
    this.topRectLight2.lookAt(BOOKSHELF_CENTER_X, -4, -9.5);
    this.scene.add(this.topRectLight2);

    // Translucent top-down wall-washer glow curtain right beneath the linear light bar
    // Positioned at z = -11.25 strictly behind the bookcase to prevent any Z-fighting flicker!
    const curtainCanvas = document.createElement('canvas');
    curtainCanvas.width = 64;
    curtainCanvas.height = 256;
    const cCtx = curtainCanvas.getContext('2d');
    const cGrad = cCtx.createLinearGradient(0, 0, 0, 256);
    cGrad.addColorStop(0, 'rgba(255, 248, 232, 0.42)');
    cGrad.addColorStop(0.22, 'rgba(255, 245, 225, 0.16)');
    cGrad.addColorStop(0.6, 'rgba(255, 245, 225, 0.04)');
    cGrad.addColorStop(1, 'rgba(255, 245, 225, 0.0)');
    cCtx.fillStyle = cGrad;
    cCtx.fillRect(0, 0, 64, 256);

    const curtainTex = new THREE.CanvasTexture(curtainCanvas);
    const curtainMat = new THREE.MeshBasicMaterial({
      map: curtainTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      blending: THREE.AdditiveBlending
    });
    const curtainMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(linearBarSpan, 15.5),
      curtainMat
    );
    curtainMesh.position.set(linearBarCenterX, linearBarY - 7.75, -11.25);
    this.topLinearLightGroup.add(curtainMesh);
  }

  /**
   * Unified Full-Screen Gray-Black Painted Wall (`删除顶部和底部多余的区域，做成一体的，只有墙`)
   * No floor slab, no baseboard skirting, and no top gap — just one continuous
   * architectural painted wall from top to bottom!
   */
  buildPaintedWallStage() {
    this.stageGroup = new THREE.Group();
    this.scene.add(this.stageGroup);

    const wallMaps = createPaintedWallMaps();

    // Seamless Full-Screen Gray-Black Architectural Painted Wall (`做成一体的，只有墙`)
    this.backdropMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: wallMaps.colorMap,
      bumpMap: wallMaps.bumpMap,
      bumpScale: this.materialParams.wallBumpScale,
      roughnessMap: wallMaps.roughnessMap,
      roughness: this.materialParams.wallRoughness,
      metalness: 0.06,
      clearcoat: 0.08,
      clearcoatRoughness: 0.45,
      envMapIntensity: 1.15
    });

    // The deep bookcase occupies an opening in the wall; the rear wall must not
    // cut through the bodies of the horizontally shelved books.
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-160, -60);
    wallShape.lineTo(160, -60);
    wallShape.lineTo(160, 60);
    wallShape.lineTo(-160, 60);
    wallShape.closePath();
    const opening = new THREE.Path();
    const openingX = BOOKSHELF_CENTER_X - 38;
    const halfOpeningWidth = 21.625;
    opening.moveTo(openingX - halfOpeningWidth, -17.6);
    opening.lineTo(openingX - halfOpeningWidth, 14.8);
    opening.lineTo(openingX + halfOpeningWidth, 14.8);
    opening.lineTo(openingX + halfOpeningWidth, -17.6);
    opening.closePath();
    wallShape.holes.push(opening);
    const backdropGeo = new THREE.ShapeGeometry(wallShape);
    const wallPositions = backdropGeo.attributes.position;
    const wallUVs = backdropGeo.attributes.uv;
    for (let index = 0; index < wallPositions.count; index++) {
      wallUVs.setXY(index, (wallPositions.getX(index) + 160) / 320, (wallPositions.getY(index) + 60) / 120);
    }
    wallUVs.needsUpdate = true;
    this.backdropMesh = new THREE.Mesh(backdropGeo, this.backdropMat);
    this.backdropMesh.position.set(38, 2.0, -11.6);
    this.backdropMesh.receiveShadow = true;
    this.stageGroup.add(this.backdropMesh);
  }

  /**
   * Expanded Act I Bulletin Board with Rounded Backplate (`公告栏背景板还是需要的，做大点公告栏`)
   * Mounted on the unified full-screen gray-black painted wall (`删除顶部和底部多余的区域，只有墙`):
   * - `boardBack` centered at `y = 1.6` with `boardW = 61.6, boardH = 34.8` (`y = -15.8 .. +19.0`)
   * - Symmetric padding to the Top Linear Light Bar and the bottom of the viewport
   * - 6 large, un-squashed 3D rounded cards inside (`Top row: 28.4 × 15.0`, `Bottom row: 13.6 × 14.8`)
   */
  buildAct1BulletinBoard() {
    this.act1Group = new THREE.Group();
    this.act1Group.position.set(ACT1_CENTER_X, 0, 0);
    this.scene.add(this.act1Group);

    const boardCenterY = 1.6;
    const boardZ = -9.25;
    const boardW = 61.6;
    const boardH = 34.8;

    // 1. Large Rounded Bulletin Board Backplate (`公告栏背景板`) with subtle recessed frame bevel
    const boardBackMat = new THREE.MeshPhysicalMaterial({
      color: 0x151922,
      roughness: 0.4,
      metalness: 0.18,
      clearcoat: 0.38,
      clearcoatRoughness: 0.24,
      envMapIntensity: 1.25
    });
    const boardBackSideMat = new THREE.MeshPhysicalMaterial({
      color: 0x262f3f,
      roughness: 0.3,
      metalness: 0.45,
      clearcoat: 0.75,
      clearcoatRoughness: 0.15
    });
    const boardBackGeo = createRoundedCardGeometry(boardW, boardH, 0.68, 1.75);
    const boardBack = new THREE.Mesh(boardBackGeo, [boardBackMat, boardBackSideMat]);
    boardBack.position.set(0, boardCenterY, boardZ);
    boardBack.castShadow = true;
    boardBack.receiveShadow = true;
    this.act1Group.add(boardBack);

    // 2. 6 Large, Generously-Proportioned 3D Rounded-Corner Bulletin Cards inside the Bulletin Board
    //    Top row: w = 28.4, h = 15.0 (y = 9.9 -> spans +2.4 to +17.4, 1.6u inside board top +19.0)
    //    Bottom row: w = 13.6, h = 14.8 (y = -6.8 -> spans -14.2 to +0.6, 1.6u inside board bottom -15.8)
    //    Copy + layout live in src/data/bulletinCards.js
    const cardConfigs = createBulletinCardConfigs(this.profile);

    cardConfigs.forEach((cfg, index) => {
      const cornerRadius = cfg.cornerRadius ?? 1.15;
      const cardTex = createBulletinCardTexture({
        ...cfg,
        cornerRadius,
        onTextureChange: () => this.requestRenderFor(150),
        aspect: cfg.w / cfg.h
      });

      // Front/Back face material (`materialIndex === 0` in ExtrudeGeometry)
      const frontMat = new THREE.MeshPhysicalMaterial({
        map: cardTex.map,
        roughness: 0.24,
        metalness: 0.08,
        clearcoat: 0.75,
        clearcoatRoughness: 0.14,
        envMapIntensity: 1.25
      });

      // Side bevel/extrusion rim material (`materialIndex === 1` in ExtrudeGeometry)
      // Highlights the rounded 3D micro-thickness on hover!
      const sideMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x2d3748),
        roughness: 0.25,
        metalness: 0.55,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1
      });

      const roundedGeo = createRoundedCardGeometry(cfg.w, cfg.h, cfg.d, cornerRadius);
      const mesh = new THREE.Mesh(roundedGeo, [frontMat, sideMat]);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (cfg.layout === 'github') {
        this.contributionSnake = createContributionSnake(cfg.contrib, {
          onFrame: () => {
            this.contributionFrameOnly = this.renderScheduler?.state !== 'active';
            this.requestRenderFor(0);
          },
          onState: (state, step) => {
            this.container.dataset.snakeState = state;
            this.container.dataset.snakeStep = String(step);
          }
        });
        const plotWidth = cfg.w * 0.904;
        const plotHeight = plotWidth * this.contributionSnake.canvas.height / this.contributionSnake.canvas.width;
        const plot = new THREE.Mesh(new THREE.PlaneGeometry(plotWidth, plotHeight),
          new THREE.MeshBasicMaterial({ map: this.contributionSnake.map, transparent: true, depthWrite: false }));
        plot.position.set(0, cfg.h * 0.2, cfg.d * 0.5 + 0.151);
        mesh.add(plot);
      }

      // Tactile 3D magnetic pin on top center of each Bulletin Card
      const pinMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(cfg.pinColor || '#38bdf8'),
        roughness: 0.2,
        metalness: 0.65,
        clearcoat: 0.9
      });
      const pinCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.24, 24),
        pinMat
      );
      pinCyl.rotation.x = Math.PI * 0.5;
      pinCyl.position.set(
        cfg.layout === 'icon' ? -cfg.w * 0.5 + 1.1 : 0,
        cfg.h * 0.5 - 0.85,
        cfg.d * 0.5 + 0.16
      );
      mesh.add(pinCyl);

      const plaqueObj = {
        ...cfg,
        index,
        mesh,
        cardTex,
        frontMat,
        sideMat,
        baseX: cfg.x,
        baseY: cfg.y,
        baseZ: cfg.z,
        currentZ: cfg.z,
        currentScaleZ: 1.0,
        currentRotX: 0,
        currentRotY: 0
      };

      mesh.userData.plaque = plaqueObj;
      this.act1Group.add(mesh);
      this.plaques.push(plaqueObj);
    });
  }

  /**
   * Requirement 5 & Flicker-Free Top Joinery:
   * Detailed Act II Collector's Bookshelf & Kraft Paper Books (`书架顶部鼠标一动会闪` Fixed!)
   * Every structural member has strictly non-overlapping Y and Z bounds so zero coplanar faces
   * can ever Z-fight when mouse movement shifts camera parallax!
   */
  buildAct2Bookshelf() {
    this.act2Group = new THREE.Group();
    this.act2Group.position.set(BOOKSHELF_CENTER_X, 0, 0);
    this.scene.add(this.act2Group);

    this.shelfFrameGroup = new THREE.Group();
    this.act2Group.add(this.shelfFrameGroup);

    const { woodColorMap } = createBookshelfMaps();
    const { frontZ, backZ } = this.shelfLayout;

    const darkWalnutMat = new THREE.MeshPhysicalMaterial({
      map: woodColorMap,
      color: 0x3b2d22,
      roughness: 0.52,
      metalness: 0.1,
      clearcoat: 0.22,
      clearcoatRoughness: 0.35
    });

    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: 0xc89d54,
      roughness: 0.28,
      metalness: 0.82
    });

    const ironFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1c2026,
      roughness: 0.42,
      metalness: 0.68
    });

    // 1. The back panel follows the deepest book instead of a shallow fixed box.
    const backPanel = new THREE.Mesh(
      new THREE.BoxGeometry(43.2, 32.4, 0.5),
      darkWalnutMat
    );
    backPanel.position.set(0, 0.6, backZ - 0.25);
    backPanel.receiveShadow = true;
    this.shelfFrameGroup.add(backPanel);

    // 21 vertical ribs sit just in front of the rear panel.
    for (let sx = -20; sx <= 20; sx += 2.0) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 32.0, 0.28),
        darkWalnutMat
      );
      slat.position.set(sx, 0.6, backZ + 0.3);
      slat.castShadow = false;
      slat.receiveShadow = true;
      this.shelfFrameGroup.add(slat);
    }

    // 2. Keep the front joinery fixed while extending the cabinet to the rear.
    const pillarFrontZ = frontZ - 1.2;
    const pillarBackZ = backZ - 0.25;
    [-22.35, 22.35].forEach((px) => {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 32.4, pillarFrontZ - pillarBackZ),
        darkWalnutMat
      );
      pillar.position.set(px, 0.6, (pillarFrontZ + pillarBackZ) * 0.5);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.shelfFrameGroup.add(pillar);

      // Front iron structural channel sits ahead of the upright.
      const frontRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 32.4, 0.36),
        ironFrameMat
      );
      frontRail.position.set(px, 0.6, pillarFrontZ + 0.22);
      this.shelfFrameGroup.add(frontRail);

      for (let by = -13.5; by <= 15.0; by += 5.7) {
        const bolt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.22, 12),
          brassTrimMat
        );
        bolt.rotation.x = Math.PI * 0.5;
        bolt.position.set(px, by, pillarFrontZ + 0.46);
        this.shelfFrameGroup.add(bolt);
      }
    });

    // 3. The crown spans the same full cabinet depth as the supporting ledges.
    const crownFrontZ = frontZ - 0.4;
    const crownBackZ = backZ - 0.5;
    const topCornice = new THREE.Mesh(
      new THREE.BoxGeometry(46.8, 1.1, crownFrontZ - crownBackZ),
      darkWalnutMat
    );
    topCornice.position.set(0, 17.37, (crownFrontZ + crownBackZ) * 0.5);
    topCornice.castShadow = true;
    topCornice.receiveShadow = true;
    this.shelfFrameGroup.add(topCornice);

    // Brass lip in front of the crown.
    const topBrassLip = new THREE.Mesh(
      new THREE.BoxGeometry(46.9, 0.22, 0.24),
      brassTrimMat
    );
    topBrassLip.position.set(0, 17.15, crownFrontZ + 0.18);
    this.shelfFrameGroup.add(topBrassLip);

    this.booksGroup = new THREE.Group();
    this.act2Group.add(this.booksGroup);

    this.shelfLedgesGroup = new THREE.Group();
    this.shelfFrameGroup.add(this.shelfLedgesGroup);

    // The seven volumes are invisible until Act II, so their textures are
    // generated during idle time (`ensureShelfReady`) instead of at startup.
    this.shelfReady = false;
  }

  /**
   * Generates the Act II book textures on first need. Idle warm-up calls it in
   * the background; every navigation path calls it so a fast visitor never sees
   * an empty shelf.
   */
  ensureShelfReady() {
    if (this.shelfReady) return;
    this.shelfReady = true;
    this.rebuildBookshelfMeshes();
  }

  rebuildBookshelfMeshes() {
    this.shelfReady = true;
    this.beginShelfRebuild();
    this.booksData.forEach((bookData, index) => this.buildBookAt(bookData, index));
  }

  /** Clears the Act II groups and prepares the shared shelf materials. */
  beginShelfRebuild() {
    while (this.booksGroup.children.length > 0) {
      this.booksGroup.remove(this.booksGroup.children[0]);
    }
    while (this.shelfLedgesGroup.children.length > 0) {
      this.shelfLedgesGroup.remove(this.shelfLedgesGroup.children[0]);
    }
    this.books = [];

    const { woodColorMap } = createBookshelfMaps();
    this.shelfMaterials = {
      wood: new THREE.MeshPhysicalMaterial({
        map: woodColorMap,
        color: 0x433224,
        roughness: 0.48,
        metalness: 0.08,
        clearcoat: 0.26
      }),
      brass: new THREE.MeshStandardMaterial({
        color: 0xd4a359,
        roughness: 0.28,
        metalness: 0.85
      }),
      underLight: new THREE.MeshBasicMaterial({
        color: 0xffe4b5
      }),
      ribCord: new THREE.MeshStandardMaterial({
        color: 0x3a2614,
        roughness: 0.65,
        metalness: 0.1
      })
    };

    this.shelfCursorY = 14.8;
    this.shelfVerticalGap = 1.25;
  }

  /**
   * Builds a single volume: cover, spine, cord ridges, ribbon, shelf ledge and
   * bookends. Split out of the rebuild loop so the preloader can build the seven
   * volumes one per frame instead of blocking the main thread for seconds.
   */
  buildBookAt(bookData, index) {
    const {
      wood: shelfWoodMat,
      brass: brassLipMat,
      underLight: underLightMat,
      ribCord: ribCordMat
    } = this.shelfMaterials;

    const { width, height, thickness } = bookData.dimensions;
    const { frontZ, backZ, bookOverhang, bookRestGap, ledgeThickness } = this.shelfLayout;
    const shelfY = this.shelfCursorY - thickness * 0.5;
    // In the shelf pose, the book's local +Z spine faces the viewer. Its depth
    // is `width`, so align the spine face rather than the varying book centres.
    const baseShelfZ = frontZ + bookOverhang - width * 0.5;
    this.shelfCursorY -= thickness + this.shelfVerticalGap;

    const textures = createStripeBookTextures(bookData, index, () => this.requestRenderFor(150));

    // Tactile Kraft Paperboard Materials (`牛皮纸材质`)
    const frontMat = new THREE.MeshPhysicalMaterial({
      map: textures.frontTexture,
      bumpMap: textures.kraftBumpMap,
      bumpScale: this.materialParams.bookBumpScale,
      roughnessMap: textures.kraftRoughnessMap,
      roughness: this.materialParams.bookRoughness,
      metalness: 0.06,
      clearcoat: 0.14,
      clearcoatRoughness: 0.38
    });

    const backMat = new THREE.MeshPhysicalMaterial({
      map: textures.backTexture,
      bumpMap: textures.kraftBumpMap,
      bumpScale: this.materialParams.bookBumpScale,
      roughnessMap: textures.kraftRoughnessMap,
      roughness: this.materialParams.bookRoughness,
      metalness: 0.06,
      clearcoat: 0.14,
      clearcoatRoughness: 0.38
    });

    const spineMat = new THREE.MeshPhysicalMaterial({
      map: textures.spineTexture,
      bumpMap: textures.kraftBumpMap,
      bumpScale: this.materialParams.bookBumpScale * 1.15,
      roughnessMap: textures.kraftRoughnessMap,
      roughness: this.materialParams.bookRoughness,
      metalness: 0.08,
      clearcoat: 0.16,
      clearcoatRoughness: 0.35
    });

    const paperMat = new THREE.MeshStandardMaterial({
      map: textures.pageEdgeTexture,
      bumpMap: textures.pageEdgeTexture,
      bumpScale: 0.08,
      roughness: 0.78,
      metalness: 0.02
    });

    // Exact Stripe Press 6-face mapping:
    // +X: front cover, -X: back cover, +Y/-Y/-Z: deckle paper edges, +Z: Kraft spine
    const materials = [frontMat, backMat, paperMat, paperMat, spineMat, paperMat];

    const outerGroup = new THREE.Group();
    outerGroup.position.set(0, shelfY, baseShelfZ);
    outerGroup.rotation.set(-Math.PI * 0.5, 0, Math.PI * 0.5);

    const coverGroup = new THREE.Group();
    coverGroup.rotation.set(0, -Math.PI * 0.5, 0, 'ZYX');

    const coverMesh = new THREE.Mesh(
      new THREE.BoxGeometry(thickness, height, width),
      materials
    );
    coverMesh.castShadow = true;
    coverMesh.receiveShadow = true;
    coverGroup.add(coverMesh);

    // 3D Raised Bookbinding Cord Ridges at the outer ends of the Spine (+Z face of `coverGroup`)
    [-height * 0.468, height * 0.468].forEach((ry) => {
      const cord = new THREE.Mesh(
        new THREE.BoxGeometry(thickness + 0.12, 0.18, 0.14),
        ribCordMat
      );
      cord.position.set(0, ry, width * 0.5 + 0.05);
      coverGroup.add(cord);
    });

    // Archival Bookmark Ribbon Tassel peeking out from bottom of book
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bookData.palette.accentHex || '#991b1b'),
      roughness: 0.55
    });
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.35, 0.65),
      ribbonMat
    );
    ribbon.position.set(0, -height * 0.5 - 0.45, width * 0.15);
    ribbon.rotation.z = 0.12;
    coverGroup.add(ribbon);

    outerGroup.add(coverGroup);
    this.booksGroup.add(outerGroup);

    // Book, ledge and bookends share one supporting top plane.
    const ledgeTopY = shelfY - thickness * 0.5 - bookRestGap;
    const ledgeY = ledgeTopY - ledgeThickness * 0.5;
    const ledgeBackZ = backZ + 0.65;
    const ledgeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(43.1, ledgeThickness, frontZ - ledgeBackZ),
      shelfWoodMat
    );
    ledgeMesh.position.set(0, ledgeY, (frontZ + ledgeBackZ) * 0.5);
    ledgeMesh.castShadow = true;
    ledgeMesh.receiveShadow = true;
    this.shelfLedgesGroup.add(ledgeMesh);

    // Brass lip stays aligned with the shared front edge.
    const brassLip = new THREE.Mesh(
      new THREE.BoxGeometry(43.1, 0.18, 0.16),
      brassLipMat
    );
    brassLip.position.set(0, ledgeY + 0.08, frontZ + 0.14);
    this.shelfLedgesGroup.add(brassLip);

    // Warm strip underneath the ledge.
    const underStrip = new THREE.Mesh(
      new THREE.BoxGeometry(38.0, 0.08, 0.22),
      underLightMat
    );
    underStrip.position.set(0, ledgeY - ledgeThickness * 0.5 - 0.08, frontZ - 0.4);
    this.shelfLedgesGroup.add(underStrip);

    // Left & Right Brass Bookend Brackets on top of the shelf ledge
    const bookendHeight = thickness * 0.72;
    [-height * 0.5 - 0.65, height * 0.5 + 0.65].forEach((bx) => {
      const bookend = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, bookendHeight, 3.2),
        brassLipMat
      );
      bookend.position.set(bx, ledgeTopY + bookendHeight * 0.5, frontZ - 1.6);
      this.shelfLedgesGroup.add(bookend);
    });

    const bookObj = {
      index,
      data: bookData,
      dimensions: bookData.dimensions,
      outerGroup,
      coverGroup,
      coverMesh,
      materials: [frontMat, backMat, spineMat],
      shelfY,
      baseShelfZ
    };

    coverMesh.userData.book = bookObj;
    this.books.push(bookObj);
  }

  /**
   * Requirement 7:
   * 3D Pixel-Art / Voxel Saber Mascot (`小人做成像素风的，脚底不要光圈`)
   * Built from crisp 3D Voxel Cubes matching `/assets/avatar.png` (Saber):
   * - Golden voxel hair, twin side-locks, back voxel bun with blue ribbon, and pixel ahoge (`像素呆毛`)
   * - Porcelain voxel face with emerald-green pixel eyes (`#10b981`) & pink pixel blush
   * - Silver voxel breastplate with royal-blue pixel crest + royal-blue voxel skirt with gold belt
   * - Stepped 8-bit/16-bit Voxel Excalibur Sword in right hand
   * - Zero base ring (`脚底不要光圈`)!
   */
  buildVoxelSaberMascot() {
    this.mascotGroup = new THREE.Group();
    this.mascotGroup.position.set(-4.5, 15.8, -7.2);
    this.mascotGroup.scale.setScalar(1.18);
    this.scene.add(this.mascotGroup);

    this.mascotBodyPivot = new THREE.Group();
    this.mascotGroup.add(this.mascotBodyPivot);

    const v = 0.21; // Single 3D pixel/voxel cube size
    const voxelGeo = new THREE.BoxGeometry(v, v, v);

    const matCache = new Map();
    const getVoxelMat = (hex, metalness = 0.08, roughness = 0.42) => {
      const key = `${hex}_${metalness}_${roughness}`;
      if (!matCache.has(key)) {
        matCache.set(
          key,
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(hex),
            roughness,
            metalness
          })
        );
      }
      return matCache.get(key);
    };

    const addVoxel = (parent, gx, gy, gz, hex, metal = 0.08, rough = 0.42) => {
      const m = new THREE.Mesh(voxelGeo, getVoxelMat(hex, metal, rough));
      m.position.set(gx * v, gy * v, gz * v);
      // Detail pixels are ~0.2 units wide: their shadow is invisible but they
      // would still cost one shadow-pass draw call each.
      m.castShadow = false;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    const addVoxelBlock = (
      parent,
      x0,
      x1,
      y0,
      y1,
      z0,
      z1,
      hex,
      metal = 0.08,
      rough = 0.42
    ) => {
      const w = (x1 - x0 + 1) * v;
      const h = (y1 - y0 + 1) * v;
      const d = (z1 - z0 + 1) * v;
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        getVoxelMat(hex, metal, rough)
      );
      m.position.set(
        ((x0 + x1) * 0.5) * v,
        ((y0 + y1) * 0.5) * v,
        ((z0 + z1) * 0.5) * v
      );
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    const SKIN = '#ffe4cc';
    const BLUSH = '#fb7185';
    const EYE_DARK = '#065f46';
    const EYE_LIGHT = '#10b981';
    const WHITE = '#ffffff';
    const HAIR_GOLD = '#facc15';
    const HAIR_SHADE = '#eab308';
    const ROYAL_BLUE = '#1d4ed8';
    const DEEP_BLUE = '#1e3a8a';
    const SILVER = '#e2e8f0';
    const SILVER_SHADE = '#94a3b8';
    const GOLD_TRIM = '#fbbf24';

    // 1. VOXEL HEAD (`mascotHead`)
    this.mascotHead = new THREE.Group();
    this.mascotHead.position.set(0, 1.95, 0);
    this.mascotBodyPivot.add(this.mascotHead);

    // Core porcelain voxel head block (x: -3..3, y: 0..5, z: -2..2)
    addVoxelBlock(this.mascotHead, -3, 3, 0, 5, -2, 2, SKIN);

    // Pixel Face Details on Front Plane (`z = 3`)
    // Left & Right Emerald Pixel Eyes (x = -2..-1 and x = 1..2, y = 2..3)
    addVoxel(this.mascotHead, -2, 3, 2.15, WHITE);
    addVoxel(this.mascotHead, -1, 3, 2.15, EYE_DARK);
    addVoxel(this.mascotHead, -2, 2, 2.15, EYE_LIGHT);
    addVoxel(this.mascotHead, -1, 2, 2.15, EYE_LIGHT);

    addVoxel(this.mascotHead, 2, 3, 2.15, WHITE);
    addVoxel(this.mascotHead, 1, 3, 2.15, EYE_DARK);
    addVoxel(this.mascotHead, 2, 2, 2.15, EYE_LIGHT);
    addVoxel(this.mascotHead, 1, 2, 2.15, EYE_LIGHT);

    // Pixel Cheek Blush & Cute Mouth
    addVoxel(this.mascotHead, -3, 1, 2.12, BLUSH);
    addVoxel(this.mascotHead, 3, 1, 2.12, BLUSH);
    addVoxel(this.mascotHead, 0, 1, 2.12, '#d97706');

    // Golden Voxel Hair Crown & Stepped Bangs
    addVoxelBlock(this.mascotHead, -4, 4, 6, 7, -3, 3, HAIR_GOLD);
    addVoxelBlock(this.mascotHead, -3, 3, 8, 8, -2, 2, HAIR_SHADE);
    // Back voxel hair wall
    addVoxelBlock(this.mascotHead, -4, 4, 0, 6, -3, -3, HAIR_GOLD);
    // Upper side hair
    addVoxelBlock(this.mascotHead, -4, -4, 1, 6, -2, 2, HAIR_GOLD);
    addVoxelBlock(this.mascotHead, 4, 4, 1, 6, -2, 2, HAIR_GOLD);

    // Front Voxel Bangs & Twin Side-Locks framing the face (`z = 3`)
    addVoxelBlock(this.mascotHead, -4, 4, 5, 5, 3, 3, HAIR_GOLD);
    addVoxel(this.mascotHead, 0, 4, 3, HAIR_GOLD);
    addVoxel(this.mascotHead, -3, 4, 3, HAIR_GOLD);
    addVoxel(this.mascotHead, 3, 4, 3, HAIR_GOLD);
    // Long twin side bangs (`x = -4` and `x = 4`, `y = -1..4`, `z = 3`)
    addVoxelBlock(this.mascotHead, -4, -4, -1, 4, 2, 3, HAIR_GOLD);
    addVoxelBlock(this.mascotHead, 4, 4, -1, 4, 2, 3, HAIR_GOLD);

    // Back Voxel Braided Bun + Royal Blue Pixel Ribbon
    addVoxelBlock(this.mascotHead, -2, 2, 2, 4, -4, -4, ROYAL_BLUE);
    addVoxelBlock(this.mascotHead, -1, 1, 2, 4, -5, -5, HAIR_GOLD);

    // Signature Pixel Ahoge (`像素呆毛`) on top of head!
    this.mascotAhoge = new THREE.Group();
    this.mascotAhoge.position.set(0, 9 * v, 0.5 * v);
    addVoxel(this.mascotAhoge, 0, 0, 0, HAIR_GOLD);
    addVoxel(this.mascotAhoge, 1, 1, 0, HAIR_GOLD);
    addVoxel(this.mascotAhoge, 2, 2, 0, HAIR_SHADE);
    addVoxel(this.mascotAhoge, 1, 3, 0, HAIR_GOLD);
    this.mascotHead.add(this.mascotAhoge);

    // 2. VOXEL TORSO & ARMORED SKIRT (`mascotBodyPivot`)
    // Silver Breastplate Torso (`y = 4..8`) with Royal Blue Pixel Crest
    addVoxelBlock(this.mascotBodyPivot, -2, 2, 5, 8, -1, 1, SILVER, 0.65, 0.25);
    // Blue pixel crest on front of chest
    addVoxel(this.mascotBodyPivot, -1, 7, 1.2, ROYAL_BLUE);
    addVoxel(this.mascotBodyPivot, 1, 7, 1.2, ROYAL_BLUE);
    addVoxel(this.mascotBodyPivot, 0, 6, 1.2, ROYAL_BLUE);
    // Silver Voxel Pauldrons (Shoulder Armor)
    addVoxelBlock(this.mascotBodyPivot, -4, -3, 7, 8, -1, 1, SILVER, 0.7, 0.25);
    addVoxelBlock(this.mascotBodyPivot, 3, 4, 7, 8, -1, 1, SILVER, 0.7, 0.25);

    // Gold Pixel Waist Belt (`y = 4`)
    addVoxelBlock(this.mascotBodyPivot, -2.5, 2.5, 4, 4, -1.5, 1.5, GOLD_TRIM, 0.75, 0.25);

    // Stepped Voxel Royal-Blue Knight Skirt (`y = 1..3`) with White Front Tabard & Gold Trim
    addVoxelBlock(this.mascotBodyPivot, -3, 3, 2, 3, -2, 2, ROYAL_BLUE);
    addVoxelBlock(this.mascotBodyPivot, -3.5, 3.5, 1, 1, -2.2, 2.2, DEEP_BLUE);
    addVoxelBlock(this.mascotBodyPivot, -1, 1, 1, 3, 2.15, 2.15, WHITE);
    // Side silver hip plates
    addVoxelBlock(this.mascotBodyPivot, -3.6, -3.2, 2, 3, -1, 1, SILVER_SHADE, 0.6, 0.3);
    addVoxelBlock(this.mascotBodyPivot, 3.2, 3.6, 2, 3, -1, 1, SILVER_SHADE, 0.6, 0.3);

    // 3. VOXEL ARMS & PIXEL EXCALIBUR SWORD
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-3.5 * v, 7.5 * v, 0);
    addVoxelBlock(this.leftArmPivot, 0, 0, -3, 0, 0, 0, ROYAL_BLUE);
    addVoxel(this.leftArmPivot, 0, -4, 0, SILVER, 0.65, 0.25);
    this.mascotBodyPivot.add(this.leftArmPivot);

    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(3.5 * v, 7.5 * v, 0);
    addVoxelBlock(this.rightArmPivot, 0, 0, -3, 0, 0, 0, ROYAL_BLUE);
    addVoxel(this.rightArmPivot, 0, -4, 0, SILVER, 0.65, 0.25);

    // Voxel Excalibur Sword held in right hand!
    this.swordGroup = new THREE.Group();
    this.swordGroup.position.set(0.2 * v, -3.8 * v, 1.2 * v);
    this.swordGroup.rotation.x = Math.PI * 0.28;
    // Pixel Hilt
    addVoxelBlock(this.swordGroup, 0, 0, -1, 0, 0, 0, ROYAL_BLUE);
    addVoxel(this.swordGroup, 0, -2, 0, GOLD_TRIM, 0.8, 0.2);
    // Pixel Gold Crossguard
    addVoxelBlock(this.swordGroup, -2, 2, 1, 1, 0, 0, GOLD_TRIM, 0.8, 0.2);
    // Pixel Silver & Gold Blade
    addVoxelBlock(this.swordGroup, 0, 0, 2, 8, 0, 0, SILVER, 0.85, 0.18);
    addVoxelBlock(this.swordGroup, 0, 0, 2, 6, 0.12, 0.12, GOLD_TRIM, 0.8, 0.2);

    this.rightArmPivot.add(this.swordGroup);
    this.mascotBodyPivot.add(this.rightArmPivot);

    // 4. VOXEL BOOTS / LEGS
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-1.3 * v, 0, 0);
    addVoxelBlock(this.leftLeg, -0.5, 0.5, -1, 0, -0.5, 1.0, SILVER, 0.65, 0.28);
    this.mascotBodyPivot.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(1.3 * v, 0, 0);
    addVoxelBlock(this.rightLeg, -0.5, 0.5, -1, 0, -0.5, 1.0, SILVER, 0.65, 0.28);
    this.mascotBodyPivot.add(this.rightLeg);

    this.mascotTargetPos = new THREE.Vector3(-4.5, 15.8, -7.2);
    this.mascotTargetRotY = 0.18;
  }

  /**
   * Animates the 3D Voxel Saber Mascot to follow the active scene/card/book.
   */
  updateMascotFollow(elapsed, dt) {
    if (!this.mascotGroup) return;

    if (this.isDetailRoute) {
      // Keep the whole mascot inside the book's half, including pointer parallax.
      const horizontalSpan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * (54 - 7.8) * this.camera.aspect;
      this.mascotTargetPos.set(BOOKSHELF_CENTER_X - Math.max(4.8, horizontalSpan * 0.18), -5.8, 7.8);
      this.mascotTargetRotY = -0.32;
    } else if (this.streetProgress < 0.5) {
      // In Act I Bulletin Board: Perch on the card corner (inside the board so never clipped at the top!)
      const activeCard =
        this.hoveredPlaque ||
        this.plaques[this.focusedPlaqueIndex] ||
        this.plaques[0];
      if (activeCard) {
        const isTopRow = activeCard.baseY > 0;
        this.mascotTargetPos.set(
          ACT1_CENTER_X + activeCard.baseX + activeCard.w * 0.36,
          isTopRow
            ? activeCard.baseY - activeCard.h * 0.5 - 1.05
            : activeCard.baseY + activeCard.h * 0.5 + 0.25,
          activeCard.currentZ + activeCard.d * 0.5 + 0.65
        );
        this.mascotTargetRotY = -activeCard.baseX * 0.012;
      }
    } else {
      // In Act II Bookshelf Mode: Follow the focused or hovered 3D book vertically!
      const targetBook =
        this.hoveredBook ||
        this.books[this.focusedShelfIndex] ||
        this.books[0];
      if (targetBook) {
        const halfSpineW = targetBook.dimensions.height * 0.5;
        this.mascotTargetPos.set(
          BOOKSHELF_CENTER_X + halfSpineW + 3.2,
          targetBook.shelfY - 0.55,
          targetBook.outerGroup.position.z + 1.2
        );
        this.mascotTargetRotY = -0.32;
      }
    }

    const dist = this.mascotGroup.position.distanceTo(this.mascotTargetPos);
    const lerpSpeed = Math.min(1, dt * 7.0);
    this.mascotGroup.position.lerp(this.mascotTargetPos, lerpSpeed);

    // Pixel-art quantized/bouncy hop when moving + gentle idle bob
    const hopArc = Math.min(2.2, dist * 0.22) * Math.abs(Math.sin(elapsed * 9.5));
    const idleBob = Math.sin(elapsed * 3.5) * 0.12;
    this.mascotBodyPivot.position.y = hopArc + idleBob;

    const vx = this.mascotTargetPos.x - this.mascotGroup.position.x;
    this.mascotGroup.rotation.y = THREE.MathUtils.lerp(
      this.mascotGroup.rotation.y,
      this.mascotTargetRotY + vx * 0.04,
      Math.min(1, dt * 8)
    );
    this.mascotBodyPivot.rotation.z = THREE.MathUtils.lerp(
      this.mascotBodyPivot.rotation.z,
      -vx * 0.035,
      Math.min(1, dt * 10)
    );

    if (this.mascotAhoge) {
      this.mascotAhoge.rotation.z = Math.sin(elapsed * 5.8) * 0.24;
    }
    if (this.rightArmPivot) {
      const waveSpeed = dist > 0.6 ? 9.5 : 3.8;
      const waveAmp = dist > 0.6 ? 0.55 : 0.26;
      this.rightArmPivot.rotation.x = -0.55 + Math.sin(elapsed * waveSpeed) * waveAmp;
      this.rightArmPivot.rotation.z = -0.16 + Math.cos(elapsed * 3.4) * 0.1;
    }
    if (this.leftArmPivot) {
      this.leftArmPivot.rotation.x = Math.sin(elapsed * 3.8 + Math.PI) * 0.22;
      this.leftArmPivot.rotation.z = 0.14;
    }
  }

  /**
   * Requirement 4:
   * Atomic Act Transition (`滚动切换不要卡在中间态`).
   * Strictly transitions `streetProgress` all the way to `0` (Act I) or `1` (Act II).
   */
  transitionToAct(actNumber, immediate = false) {
    const targetAct = actNumber === 2 ? 2 : 1;
    const dest = targetAct === 2 ? 1 : 0;

    if (!immediate && this.currentAct === targetAct && Math.abs(this.streetProgress - dest) < 0.01) {
      return;
    }

    this.currentAct = targetAct;
    this.syncBulletinMotion();
    if (targetAct === 2) this.ensureShelfReady();
    this.requestRenderFor(1200);
    if (!immediate) this.performanceProbe?.mark(`act-${targetAct}`);
    if (!immediate) this.sound?.playTransition(targetAct === 2 ? 1 : -1);
    this.lastActSwitchTime = performance.now();

    if (targetAct === 2) {
      this.focusedShelfIndex = 0;
      this.shelfScrollTarget = this.shelfScrollFloat = 0;
      this.onShelfFocusChange(0, this.booksData[0]);
      window.history.replaceState(null, '', '#/act-2');
    } else {
      window.history.replaceState(null, '', '#/act-1');
    }

    gsap.killTweensOf(this);
    if (immediate) {
      this.streetProgress = dest;
      this.isTransitioningAct = false;
      this.onActProgressChange(dest);
      return;
    }

    this.isTransitioningAct = true;
    gsap.to(this, {
      streetProgress: dest,
      duration: 0.78,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onUpdate: () => {
        this.requestRenderFor(150);
        this.onActProgressChange(this.streetProgress);
      },
      onComplete: () => {
        this.streetProgress = dest;
        this.isTransitioningAct = false;
        this.onActProgressChange(dest);
      }
    });
  }

  focusShelfBook(index, fromScroll = false) {
    const clamped = Math.max(0, Math.min(this.books.length - 1, index));
    if (clamped === this.focusedShelfIndex) return;
    if (!fromScroll) this.shelfScrollTarget = clamped;
    this.requestRenderFor();
    this.focusedShelfIndex = clamped;
    this.onShelfFocusChange(clamped, this.booksData[clamped]);
  }

  /**
   * Requirement 6:
   * Enters the Stripe Press Secondary Detail Route (`#/work/:id`) with
   * smaller, well-proportioned 3D books (`scale = 0.68`) and continuous scroll tracking.
   */
  enterDetailRoute(index, sectionMetrics = []) {
    this.ensureShelfReady();
    if (index < 0 || index >= this.books.length) return;
    this.isDetailRoute = true;
    this.setDetailBackdrop(true, index);
    this.syncBulletinMotion();
    this.requestRenderFor(1200);
    this.performanceProbe?.mark('open-detail');
    this.sound?.playBookOpen();
    this.detailSectionMetrics = sectionMetrics;
    this.currentAct = 2;
    this.isTransitioningAct = false;
    this.streetProgress = 1;
    this.onActProgressChange(1);

    this.focusedShelfIndex = index;
    this.activeBook = this.books[index];
    this.detailScrollFloatIndex = index;
    this.smoothDetailFloatIndex = index;
    this.userTwirlOffset.x = 0;
    this.userTwirlOffset.y = 0;
    this.twirlVelocity.x = 0;
    this.twirlVelocity.y = 0;
  }

  exitDetailRoute() {
    this.requestRenderFor(1200);
    this.sound?.playTransition(-1);
    this.isDetailRoute = false;
    this.setDetailBackdrop(false);
    this.activeBook = null;
    this.shelfScrollTarget = this.shelfScrollFloat = this.focusedShelfIndex;
    this.userTwirlOffset.x = 0;
    this.userTwirlOffset.y = 0;

    this.books.forEach((book) => {
      gsap.killTweensOf(book.outerGroup.position);
      gsap.killTweensOf(book.outerGroup.rotation);
      gsap.killTweensOf(book.outerGroup.scale);
      gsap.killTweensOf(book.coverGroup.rotation);

      gsap.to(book.outerGroup.position, {
        x: 0,
        y: book.shelfY,
        z: book.baseShelfZ,
        duration: 0.72,
        ease: 'power3.out'
      });
      gsap.to(book.outerGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.72,
        ease: 'power3.out'
      });
      gsap.to(book.outerGroup.rotation, {
        x: -Math.PI * 0.5,
        y: 0,
        z: Math.PI * 0.5,
        duration: 0.72,
        ease: 'power3.out'
      });
      gsap.to(book.coverGroup.rotation, {
        x: 0,
        y: -Math.PI * 0.5,
        z: 0,
        duration: 0.72,
        ease: 'power3.out',
        onUpdate: book === this.books[0] ? () => this.requestRenderFor(150) : undefined
      });
    });
  }

  setDetailSectionMetrics(metrics, scrollTop = 0) {
    this.detailSectionMetrics = metrics || [];
    this.currentDetailScrollTop = scrollTop;
  }

  setDetailBackdrop(enabled, index = this.detailScrollFloatIndex) {
    this.scene.background = enabled ? null : this.galleryBackground;
    this.scene.fog = enabled ? null : this.galleryFog;
    this.backdropMesh.visible = !enabled;
    this.topLinearLightGroup.visible = !enabled;
    if (this.shelfFrameGroup) this.shelfFrameGroup.visible = !enabled;
    document.body.classList.toggle('is-work-detail', enabled);
    if (enabled) this.updateDetailBackdrop(index);
    else {
      this.container.style.backgroundColor = '';
      this.currentDetailBackground = null;
      document.documentElement.style.removeProperty('--work-background');
    }
  }

  updateDetailBackdrop(progress) {
    const color = workBackgroundAt(this.booksData, progress);
    if (color === this.currentDetailBackground) return;
    this.currentDetailBackground = color;
    this.container.style.backgroundColor = color;
    document.documentElement.style.setProperty('--work-background', color);
  }

  /**
   * Requirement 6:
   * Computes continuous floating-point scroll progress `detailScrollFloatIndex`
   * so the 3D books on the left stage move continuously with scroll (`作品切换需要跟随滚动`).
   */
  onDetailRouteScroll(scrollTop, viewportHeight) {
    if (!this.isDetailRoute || !this.detailSectionMetrics.length) return;
    this.requestRenderFor(900);
    this.currentDetailScrollTop = scrollTop;

    const anchorY = scrollTop;
    let floatIdx = 0;
    const len = this.detailSectionMetrics.length;

    for (let i = 0; i < len; i++) {
      const cur = this.detailSectionMetrics[i];
      const next = this.detailSectionMetrics[i + 1];
      if (!next) {
        if (anchorY >= cur.top) floatIdx = i;
        break;
      }
      if (anchorY >= cur.top && anchorY < next.top) {
        const span = Math.max(1, next.top - cur.top);
        floatIdx = i + (anchorY - cur.top) / span;
        break;
      } else if (anchorY < cur.top && i === 0) {
        floatIdx = 0;
        break;
      }
    }

    this.detailScrollFloatIndex = THREE.MathUtils.clamp(floatIdx, 0, len - 1);
    this.updateDetailBackdrop(this.detailScrollFloatIndex);

    const nearestIdx = Math.round(this.detailScrollFloatIndex);
    if (!this.activeBook || this.activeBook.index !== nearestIdx) {
      const nextBook = this.books[nearestIdx];
      if (nextBook) {
        this.sound?.playTransition(nearestIdx >= this.focusedShelfIndex ? 1 : -1);
        this.activeBook = nextBook;
        this.focusedShelfIndex = nearestIdx;
        this.userTwirlOffset.x = 0;
        this.userTwirlOffset.y = 0;
        this.onDetailActiveChange(nearestIdx, nextBook.data);
      }
    }
  }

  updateMaterialParams(partial) {
    this.renderer.shadowMap.needsUpdate = true;
    this.requestRenderFor(250);
    Object.assign(this.materialParams, partial);

    if (partial.wallRoughness !== undefined) {
      this.backdropMat.roughness = partial.wallRoughness;
    }
    if (partial.wallBumpScale !== undefined) {
      this.backdropMat.bumpScale = partial.wallBumpScale;
    }
    if (partial.bookRoughness !== undefined) {
      this.books.forEach((b) => {
        b.materials.forEach((m) => {
          m.roughness = partial.bookRoughness;
        });
      });
    }
    if (partial.bookBumpScale !== undefined) {
      this.books.forEach((b) => {
        b.materials.forEach((m) => {
          m.bumpScale = partial.bookBumpScale;
        });
      });
    }
    if (partial.lampIntensity !== undefined) {
      this.diagonalKeyLight.intensity = 2.2 * partial.lampIntensity;
      this.topRectLight1.intensity = 8.5 * partial.lampIntensity;
      this.topRectLight2.intensity = 8.5 * partial.lampIntensity;
    }
  }

  appendBook(newBookData) {
    this.rebuildBookshelfMeshes();
    this.focusShelfBook(this.books.length - 1);
  }

  /**
   * Requirement 4 & 6:
   * - Edge-Hover Auto-Switch (`第一幕鼠标移到最后边需要自动切换到第二幕，鼠标移到第二幕的左边需要自动切换到第一幕`)
   * - Atomic Scroll Switching (`同时滚动切换不要卡在中间态`)
   */
  bindEvents() {
    this.onResize = () => {
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.requestRenderFor(500);
    };
    window.addEventListener('resize', this.onResize);

    // Pointer Move: Raycast + Edge Auto-Switch between Act I and Act II
    this.onPointerMove = (e) => {
      if (e.target.closest('a, button, input, textarea, .PressHomepageControlPanel, #mock-book-modal')) {
        if (this.hoveredPlaque || this.hoveredBook) {
          this.pointerNDC.set(-999, -999);
          this.pointerNeedsRaycast = true;
          this.requestRenderFor(400);
        }
        return;
      }
      this.requestRenderFor(600);
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.pointerTarget.copy(this.pointerNDC);

      if (this.isDraggingBook && this.dragTargetBook) {
        const dx = e.clientX - this.prevPointer.x;
        const dy = e.clientY - this.prevPointer.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          this.dragMoved = true;
        }
        this.prevPointer.x = e.clientX;
        this.prevPointer.y = e.clientY;

        this.twirlVelocity.y = dx * 0.012;
        this.twirlVelocity.x = dy * 0.008;
        this.userTwirlOffset.y += this.twirlVelocity.y;
        this.userTwirlOffset.x = THREE.MathUtils.clamp(
          this.userTwirlOffset.x + this.twirlVelocity.x,
          -0.55,
          0.55
        );
        return;
      }

      // Requirement 4: Edge-Hover Auto-Switch between Act I and Act II
      const now = performance.now();
      if (
        !this.isDetailRoute &&
        !this.isTransitioningAct &&
        now - this.lastActSwitchTime > 900
      ) {
        const ratioX = e.clientX / Math.max(1, window.innerWidth);
        if (this.currentAct === 1 && ratioX >= 0.91) {
          this.transitionToAct(2);
          return;
        } else if (this.currentAct === 2 && ratioX <= 0.09) {
          this.transitionToAct(1);
          return;
        }
      }

      this.pointerNeedsRaycast = true;
    };
    window.addEventListener('pointermove', this.onPointerMove);

    this.onPointerDown = (e) => {
      if (e.button !== 0) return;
      if (
        e.target.closest(
          'a, button, input, textarea, .PressHomepageControlPanel, #mock-book-modal'
        )
      ) {
        return;
      }
      this.requestRenderFor();

      this.prevPointer.x = e.clientX;
      this.prevPointer.y = e.clientY;
      this.dragMoved = false;

      if (this.isDetailRoute && this.activeBook && e.clientX < window.innerWidth * 0.5) {
        this.isDraggingBook = true;
        this.dragTargetBook = this.activeBook;
        this.container.style.cursor = 'grabbing';
      }
    };
    window.addEventListener('pointerdown', this.onPointerDown);

    this.onPointerUp = (e) => {
      if (this.isDraggingBook) {
        this.requestRenderFor(1100);
        this.isDraggingBook = false;
        this.dragTargetBook = null;
        this.container.style.cursor = 'default';
        if (this.dragMoved) return;
      }

      if (
        e.target.closest(
          'a, button, input, textarea, .PressHomepageControlPanel, #mock-book-modal'
        )
      ) {
        return;
      }

      this.requestRenderFor(1100);
      this.performRaycast(true);
      if (!this.isDetailRoute && this.currentAct === 1 && this.hoveredPlaque) {
        const p = this.hoveredPlaque;
        this.focusedPlaqueIndex = p.index;
        if (p.action === 'goto-act2') {
          this.transitionToAct(2);
        } else if (p.url) {
          // `mailto:` must stay in the current tab — `window.open` gets popup-blocked.
          if (p.url.startsWith('mailto:')) window.location.href = p.url;
          else window.open(p.url, '_blank', 'noopener,noreferrer');
        }
      } else if (!this.isDetailRoute && this.currentAct === 2 && this.hoveredBook) {
        const idx = this.hoveredBook.index;
        this.focusShelfBook(idx);
        this.onSelectBook(idx);
      }
    };
    window.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('visibilitychange', () => {
      this.syncBulletinMotion();
      if (document.hidden) this.renderScheduler?.sleep();
      else { this.lastFrameAt = performance.now(); this.requestRenderFor(350); }
    });

    // Requirement 4 & 6: Atomic Scroll Switching (Never Stuck in Intermediate State)
    this.onWheel = (e) => {
      if (this.isDetailRoute) return;
      if (e.target.closest('#mock-book-modal, .PressHomepageControlPanel')) return;

      const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (!delta) return;
      if (this.isTransitioningAct) return;

      const now = performance.now();

      // Case A: In Act I -> any downward scroll atomically switches to Act II Work #1!
      if (this.currentAct === 1) {
        if (delta > 0) {
          this.lastShelfStepTime = now + 450;
          this.transitionToAct(2);
        }
        return;
      }

      // Case B: In Act II Bookshelf Mode (`currentAct === 2`)
      this.requestRenderFor(1000);
      if (delta < 0 && this.shelfScrollTarget <= 0.001 && this.shelfScrollFloat <= 0.03) {
        this.transitionToAct(1);
        return;
      }
      this.hoveredBook = null;
      this.shelfWheelUntil = now + 250;
      this.pointerNeedsRaycast = false;
      this.shelfScrollTarget = THREE.MathUtils.clamp(this.shelfScrollTarget + delta / 280, 0, this.books.length - 1);
      const nearest = Math.round(this.shelfScrollTarget);
      if (nearest !== this.focusedShelfIndex) {
        this.focusShelfBook(nearest, true);
        this.sound?.playSpineHover(nearest);
      }
    };
    window.addEventListener('wheel', this.onWheel, { passive: true });
  }

  performRaycast(force = false) {
    this.pointerNeedsRaycast = false;
    this.raycaster.setFromCamera(this.pointerNDC, this.camera);

    if (!this.isDetailRoute && this.streetProgress < 0.55) {
      const meshes = this.plaques.map((p) => p.mesh);
      const hits = this.raycaster.intersectObjects(meshes, false);
      const nextPlaque = hits.length > 0 ? hits[0].object.userData.plaque : null;

      if (this.hoveredPlaque !== nextPlaque) {
        if (this.hoveredPlaque) {
          this.hoveredPlaque.cardTex.setHovered(false);
        }
        this.hoveredPlaque = nextPlaque;
        if (this.hoveredPlaque) {
          this.hoveredPlaque.cardTex.setHovered(true);
          this.focusedPlaqueIndex = this.hoveredPlaque.index;
          this.sound?.playSpineHover(this.hoveredPlaque.index);
        }
      }
      this.hoveredBook = null;
      this.container.style.cursor = this.hoveredPlaque ? 'pointer' : 'default';
    } else if (!this.isDetailRoute && this.streetProgress >= 0.55) {
      if (!force && performance.now() < (this.shelfWheelUntil || 0)) return;
      if (this.hoveredPlaque) {
        this.hoveredPlaque.cardTex.setHovered(false);
        this.hoveredPlaque = null;
      }
      const bookMeshes = this.books.map((b) => b.coverMesh);
      const hits = this.raycaster.intersectObjects(bookMeshes, false);
      const nextBook = hits.length > 0 ? hits[0].object.userData.book : null;
      if (nextBook && nextBook !== this.hoveredBook) this.sound?.playSpineHover(nextBook.index);
      this.hoveredBook = nextBook;
      if (this.hoveredBook) {
        this.focusShelfBook(this.hoveredBook.index);
      }
      this.container.style.cursor = this.hoveredBook ? 'pointer' : 'default';
    } else if (this.isDetailRoute) {
      if (this.hoveredPlaque) {
        this.hoveredPlaque.cardTex.setHovered(false);
        this.hoveredPlaque = null;
      }
      const hits = this.activeBook ? this.raycaster.intersectObject(this.activeBook.coverMesh, false) : [];
      const nextBook = hits.length && this.pointerNDC.x < 0 ? this.activeBook : null;
      if (nextBook && nextBook !== this.hoveredBook) this.sound?.playSpineHover(nextBook.index);
      this.hoveredBook = nextBook;
      this.container.style.cursor = nextBook ? 'grab' : 'default';
    } else {
      if (this.hoveredPlaque) {
        this.hoveredPlaque.cardTex.setHovered(false);
        this.hoveredPlaque = null;
      }
      this.hoveredBook = null;
    }
  }

  animate(now = performance.now()) {
    const textureOnly = this.contributionFrameOnly;
    this.contributionFrameOnly = false;
    const frameStart = this.performanceProbe ? performance.now() : 0;
    const dt = Math.min((now - this.lastFrameAt) / 1000, 0.05);
    this.lastFrameAt = now;
    this.animationTime += Math.max(dt, 0);
    const elapsed = this.animationTime;
    this.smoothPointer.lerp(this.pointerTarget, Math.min(1, dt * 12));
    if (this.pointerNeedsRaycast) this.performRaycast();
    this.act1Group.visible = !this.isDetailRoute && this.streetProgress < 0.99;
    this.act2Group.visible = this.isDetailRoute || this.streetProgress > 0.01;

    // 1. Update Act I Rounded Bulletin Cards (Z lift + micro-thickness expansion on hover)
    this.plaques.forEach((p) => {
      const isHovered = this.hoveredPlaque === p;
      const targetZ = isHovered ? p.baseZ + 1.35 : p.baseZ;
      const targetScaleZ = isHovered ? 2.55 : 1.0;

      p.currentZ = THREE.MathUtils.lerp(p.currentZ, targetZ, Math.min(1, dt * 11));
      p.currentScaleZ = THREE.MathUtils.lerp(
        p.currentScaleZ,
        targetScaleZ,
        Math.min(1, dt * 11)
      );

      p.mesh.position.z = p.currentZ;
      p.mesh.scale.set(1, 1, p.currentScaleZ);

      // Highlight side bevel rim when hovered so the 3D micro-thickness gleams
      p.sideMat.color.lerp(
        this.tempRimColor.set(isHovered ? p.accentHex || '#38bdf8' : '#2d3748'),
        Math.min(1, dt * 10)
      );

      const targetRotY = isHovered ? this.smoothPointer.x * 0.09 : 0;
      const targetRotX = isHovered ? -this.smoothPointer.y * 0.07 : 0;
      p.currentRotY = THREE.MathUtils.lerp(p.currentRotY, targetRotY, Math.min(1, dt * 9));
      p.currentRotX = THREE.MathUtils.lerp(p.currentRotX, targetRotX, Math.min(1, dt * 9));
      p.mesh.rotation.set(p.currentRotX, p.currentRotY, 0);
    });

    // 2. Update Act II Books & Bookshelf Frame:
    //    - In Shelf Mode: shelf frame sits at z=0 with all shelf planks visible; focused/hovered book spine pulls out
    //    - In Detail Route (`作品切换时会被书架板子穿模，应该优先展示完整的作品书`):
    //      shelf planks and the frame are hidden,
    //      while all 3D books stay in the foreground (`z = 1.6 .. 5.2`) so works are 100% unobstructed!
    if (this.shelfFrameGroup && this.shelfLedgesGroup) {
      this.shelfLedgesGroup.visible = !this.isDetailRoute;
      // The frame is hidden in details, so it needs no independent depth tween
      // that would temporarily detach its ledges from books on return.
      this.shelfFrameGroup.position.z = 0;
    }

    if (!this.isDetailRoute) {
      this.shelfScrollFloat = THREE.MathUtils.lerp(this.shelfScrollFloat, this.shelfScrollTarget, Math.min(1, dt * 12));
      this.books.forEach((book, i) => {
        const isHovered = this.hoveredBook === book;
        const influence = Math.max(0, 1 - Math.abs(i - this.shelfScrollFloat));
        const focusPull = influence * influence * (3 - 2 * influence);
        const targetZ = book.baseShelfZ + focusPull * 2.1 + (isHovered ? 1.1 : 0);
        book.outerGroup.position.z = THREE.MathUtils.lerp(
          book.outerGroup.position.z,
          targetZ,
          Math.min(1, dt * 10)
        );
      });
    } else {
      // Smoothly damp `smoothDetailFloatIndex` toward `detailScrollFloatIndex`
      this.smoothDetailFloatIndex = THREE.MathUtils.lerp(
        this.smoothDetailFloatIndex,
        this.detailScrollFloatIndex,
        Math.min(1, dt * 12)
      );

      // Apply 0.95 inertia damping to user drag twirl
      if (!this.isDraggingBook) {
        this.twirlVelocity.x *= 0.95;
        this.twirlVelocity.y *= 0.95;
        this.userTwirlOffset.y += this.twirlVelocity.y;
        this.userTwirlOffset.x = THREE.MathUtils.clamp(
          this.userTwirlOffset.x + this.twirlVelocity.x,
          -0.55,
          0.55
        );
      }

      // Continuously position and unfold books along scroll progress (`优先展示完整的作品书，零书架穿模`)
      this.books.forEach((book, i) => {
        const offset = i - this.smoothDetailFloatIndex;
        const absOff = Math.abs(offset);
        // Smooth bell curve influence: 1.0 when centered on this work, 0.0 when >= 1 work away
        const rawInfluence = Math.max(0, 1 - absOff);
        const influence = rawInfluence * rawInfluence * (3 - 2 * rawInfluence);

        const targetX = -Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * 48.8 * this.camera.aspect * 0.5;
        const targetY = 1.0 - offset * 19.5;
        // All books remain in front (`z = 1.6 .. 5.2`) so zero shelf planks or walls can ever clip them!
        const targetZ = THREE.MathUtils.lerp(1.6 - absOff * 0.8, 5.2, influence);
        const targetScale = THREE.MathUtils.lerp(0.45, 0.55, influence);

        book.outerGroup.position.lerp(
          this.tempBookPosition.set(targetX, targetY, targetZ),
          Math.min(1, dt * 14)
        );
        book.outerGroup.scale.setScalar(
          THREE.MathUtils.lerp(book.outerGroup.scale.x, targetScale, Math.min(1, dt * 14))
        );

        // Smoothly unfold from horizontal spine-first pose into upright front-cover inspection pose
        const targetOuterRotX = THREE.MathUtils.lerp(-Math.PI * 0.5, 0, influence);
        const targetOuterRotZ = THREE.MathUtils.lerp(Math.PI * 0.5, 0, influence);
        book.outerGroup.rotation.set(targetOuterRotX, 0, targetOuterRotZ);

        const isNearest = i === Math.round(this.smoothDetailFloatIndex);
        const twirlWeight = Math.max(0, 1 - absOff * 2);
        const twirlX = isNearest ? this.userTwirlOffset.x * twirlWeight : 0;
        const twirlY = isNearest ? this.userTwirlOffset.y * twirlWeight : 0;

        const targetCoverRotX = THREE.MathUtils.lerp(0, -0.06 + twirlX, influence);
        const targetCoverRotY = THREE.MathUtils.lerp(
          -Math.PI * 0.5,
          -Math.PI * 0.34 + twirlY + offset * 0.45,
          influence
        );
        book.coverGroup.rotation.set(targetCoverRotX, targetCoverRotY, 0, 'ZYX');
      });
    }

    // 3. Update Camera Position & LookAt across Act I -> Act II -> Focused Book
    const focusedBook = this.books[this.focusedShelfIndex] || this.books[0];
    // Pull back so the whole bookshelf + top linear light fit in the viewport, with a subtle follow on the focused book
    const targetShelfY = focusedBook ? 1.1 + (focusedBook.shelfY - 1.1) * 0.05 : 1.1;
    this.shelfCameraY = THREE.MathUtils.lerp(
      this.shelfCameraY,
      this.isDetailRoute ? 1.6 : targetShelfY,
      Math.min(1, dt * 7)
    );

    const camX = THREE.MathUtils.lerp(
      ACT1_CENTER_X,
      BOOKSHELF_CENTER_X,
      this.streetProgress
    );
    const camY = THREE.MathUtils.lerp(1.6, this.shelfCameraY, this.streetProgress);
    const camZ = THREE.MathUtils.lerp(
      56.5,
      this.isDetailRoute ? 54.0 : 66.0,
      this.streetProgress
    );

    const parallaxX = this.smoothPointer.x * 1.05;
    const parallaxY = this.smoothPointer.y * 0.68;

    this.camera.position.set(camX + parallaxX, camY + parallaxY, camZ);
    this.cameraLookAt.set(
      camX + parallaxX * 0.25,
      camY + parallaxY * 0.2,
      -6.5
    );
    this.camera.lookAt(this.cameraLookAt);

    // 4. Update Voxel Saber Mascot
    this.updateMascotFollow(elapsed, dt);

    // Shadow map refresh is the most expensive part of a frame here (it re-draws
    // every caster), and a 30 Hz cadence is indistinguishable at this softness.
    if (!textureOnly && (now - (this.lastShadowUpdate || -Infinity) >= 50 || now >= this.renderScheduler.until)) {
      this.renderer.shadowMap.needsUpdate = true;
      this.lastShadowUpdate = now;
      if (import.meta.env.DEV) this.container.dataset.shadowRefreshCount = String((this.shadowRefreshCount || 0) + 1);
      this.shadowRefreshCount = (this.shadowRefreshCount || 0) + 1;
    }
    this.renderer.render(this.scene, this.camera);
    this.performanceProbe?.sample(frameStart);
  }
}
