/**
 * ============================================================================
 * STRIPE PRESS 3D HARDCOVER BOOKSHELF & 360° BOOK INSPECTOR
 * ============================================================================
 * Reverse-engineered from https://press.stripe.com/ (v1-chunk-Y2WAJ6AV.js):
 * - Narrow telephoto camera (`fov: 12`, `z: 100`) for architectural orthographic-like
 *   compression of stacked book spines.
 * - Shelf Pose: `rotation: { x: -Math.PI * 0.5, y: 0, z: Math.PI * 0.5 }`
 * - Hover Pull-out: `z: +6`, `rotation.x: -Math.PI * 0.44`
 * - Scroll-Velocity Tilt: `scrollVelocity = delta * 0.003` (damped each frame)
 * - Vertical Drag-to-Part: parts neighboring books by `draggingGap`
 * - Inspector Mode (58% 3D Stage / 42% Editorial Details):
 *   Smoothly flies the active book out of the stack to the left stage and enables
 *   360° click-and-drag twirl with `*= 0.95` rotational inertia damping per frame.
 * - Live `/` Material Control Panel: dynamically updates roughness, foil metalness,
 *   bump scale, spine stack gap, and studio lighting intensity.
 * ============================================================================
 */

import * as THREE from 'three';

export class StripePressShelf {
  constructor({
    canvas,
    stageContainer,
    books,
    soundEngine,
    onHoverBook,
    onSelectBook
  }) {
    this.canvas = canvas;
    this.stageContainer = stageContainer;
    this.booksData = [...books];
    this.soundEngine = soundEngine;
    this.onHoverBook = onHoverBook;
    this.onSelectBook = onSelectBook;

    // Live Material & Scene parameters (controlled by `/` Material Inspector)
    this.params = {
      coverRoughness: 0.28,
      foilMetalness: 0.78,
      bumpScale: 0.18,
      spineGap: 0.55,
      lightIntensity: 1.85,
      scrollTiltGain: 0.003
    };

    // Interaction state
    this.bookEntries = [];
    this.hoveredIndex = -1;
    this.activeIndex = -1; // -1 = Shelf Mode, >=0 = Book Inspector Mode
    this.scrollVelocity = 0;

    // Drag / 360° Twirl inertia state (damped by *= 0.95 per frame)
    this.isPointerDown = false;
    this.pointerDownPos = new THREE.Vector2();
    this.lastPointerPos = new THREE.Vector2();
    this.dragMoved = false;
    this.bookTwirlX = 0;
    this.bookTwirlY = 0;
    this.shelfDragOffset = 0;
    this.shelfDragIndex = -1;

    this.raycaster = new THREE.Raycaster();
    this.pointerNDC = new THREE.Vector2(-99, -99);
    this.textureLoader = new THREE.TextureLoader();

    this.initScene();
    this.initLights();
    this.buildBookshelf();
    this.bindEvents();
  }

  initScene() {
    const rect = this.stageContainer.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    const height = Math.max(rect.height, 480);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;

    this.scene = new THREE.Scene();

    // Exact Stripe Press narrow telephoto FOV (12 deg)
    this.camera = new THREE.PerspectiveCamera(12, width / height, 1, 400);
    this.camera.position.set(0, 1.5, 165);
    this.camera.lookAt(0, 0, 0);

    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);
  }

  initLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xfffaf0, this.params.lightIntensity);
    this.keyLight.position.set(28, 45, 65);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x9ab0ff, 1.15);
    this.rimLight.position.set(-40, 18, 35);
    this.scene.add(this.rimLight);

    this.SPECULAR_LIGHT = new THREE.PointLight(0xffffff, 1.8, 120);
    this.SPECULAR_LIGHT.position.set(8, 12, 48);
    this.scene.add(this.SPECULAR_LIGHT);
  }

  /**
   * Generates high-DPI procedural textures for Front Cover, Back Cover,
   * Spine, Page Edges, and Bump Map, compositing the AI cover art when loaded.
   */
  createBookTextures(book, index, onLoadedCallback) {
    // 1. SPINE TEXTURE (1600 × 240 horizontal layout)
    const spineCanvas = document.createElement('canvas');
    spineCanvas.width = 1600;
    spineCanvas.height = 240;
    const sCtx = spineCanvas.getContext('2d');

    const drawSpine = () => {
      const { spineBg, spineText, foilColor } = book.palette;
      sCtx.fillStyle = spineBg;
      sCtx.fillRect(0, 0, 1600, 240);

      // Subtle book-cloth weave lines
      sCtx.strokeStyle = 'rgba(255,255,255,0.04)';
      sCtx.lineWidth = 1;
      for (let x = 0; x < 1600; x += 6) {
        sCtx.beginPath();
        sCtx.moveTo(x, 0);
        sCtx.lineTo(x, 240);
        sCtx.stroke();
      }

      // Top & bottom subtle crease highlights
      const grad = sCtx.createLinearGradient(0, 0, 0, 240);
      grad.addColorStop(0, 'rgba(255,255,255,0.18)');
      grad.addColorStop(0.12, 'rgba(255,255,255,0.0)');
      grad.addColorStop(0.88, 'rgba(0,0,0,0.0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.28)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 1600, 240);

      // Foil vertical rules on left & right spine caps
      sCtx.strokeStyle = foilColor;
      sCtx.lineWidth = 3;
      sCtx.strokeRect(36, 26, 1528, 188);

      sCtx.beginPath();
      sCtx.moveTo(210, 26);
      sCtx.lineTo(210, 214);
      sCtx.moveTo(1360, 26);
      sCtx.lineTo(1360, 214);
      sCtx.stroke();

      // Volume badge on left
      sCtx.fillStyle = foilColor;
      sCtx.font = '700 30px "JetBrains Mono", "Segoe UI", monospace';
      sCtx.textBaseline = 'middle';
      sCtx.fillText(book.volume || `VOL. 0${index + 1}`, 66, 120);

      // Main Spine Title
      sCtx.fillStyle = spineText;
      sCtx.font = '700 44px "PingFang SC", "Microsoft YaHei", sans-serif';
      sCtx.fillText(book.spineTitle || book.title, 250, 118);

      // Right cap: Author & Year
      sCtx.fillStyle = foilColor;
      sCtx.font = '600 24px "JetBrains Mono", monospace';
      sCtx.textAlign = 'right';
      sCtx.fillText(`${book.author} · ${book.year}`, 1532, 120);
      sCtx.textAlign = 'left';
    };
    drawSpine();
    const spineTexture = new THREE.CanvasTexture(spineCanvas);
    spineTexture.anisotropy = 8;

    // 2. FRONT COVER TEXTURE (1024 × 1340) + BUMP TEXTURE
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = 1024;
    frontCanvas.height = 1340;
    const fCtx = frontCanvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 670;
    const bCtx = bumpCanvas.getContext('2d');

    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    frontTexture.anisotropy = 8;
    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);

    const drawFrontAndBump = (artImg = null) => {
      const { coverBg, spineText, foilColor, coverSecondary } = book.palette;
      fCtx.fillStyle = coverBg;
      fCtx.fillRect(0, 0, 1024, 1340);

      // Swiss architectural frame & grid lines
      fCtx.strokeStyle = foilColor;
      fCtx.globalAlpha = 0.35;
      fCtx.lineWidth = 2;
      fCtx.strokeRect(48, 48, 928, 1244);

      fCtx.beginPath();
      fCtx.moveTo(48, 160);
      fCtx.lineTo(976, 160);
      fCtx.moveTo(48, 520);
      fCtx.lineTo(976, 520);
      fCtx.moveTo(48, 1200);
      fCtx.lineTo(976, 1200);
      fCtx.stroke();
      fCtx.globalAlpha = 1.0;

      // Top metadata bar
      fCtx.fillStyle = foilColor;
      fCtx.font = '700 24px "JetBrains Mono", monospace';
      fCtx.fillText(`${book.volume} // ${book.edition}`, 78, 112);
      fCtx.textAlign = 'right';
      fCtx.fillText('STRIPE PRESS × LUSION ARCHIVE', 946, 112);
      fCtx.textAlign = 'left';

      // Title & Subtitle Typography Block
      fCtx.fillStyle = spineText;
      fCtx.font = '800 66px "PingFang SC", "Microsoft YaHei", sans-serif';
      fCtx.fillText(book.title, 78, 268);

      // Wrap subtitle
      fCtx.fillStyle = foilColor;
      fCtx.font = '500 30px "PingFang SC", "Microsoft YaHei", sans-serif';
      const sub = book.subtitle || '';
      const line1 = sub.slice(0, 24);
      const line2 = sub.slice(24, 52);
      fCtx.fillText(line1, 78, 344);
      if (line2) {
        fCtx.fillText(line2, 78, 392);
      }

      // Category pill
      fCtx.strokeStyle = foilColor;
      fCtx.lineWidth = 2;
      fCtx.strokeRect(78, 432, 520, 52);
      fCtx.font = '600 22px "JetBrains Mono", monospace';
      fCtx.fillText(book.category.toUpperCase(), 98, 466);

      // Artwork Window (550 to 1165)
      const artX = 78;
      const artY = 556;
      const artW = 868;
      const artH = 610;

      if (artImg) {
        fCtx.save();
        fCtx.beginPath();
        fCtx.rect(artX, artY, artW, artH);
        fCtx.clip();
        // Cover-fit image
        const scale = Math.max(artW / artImg.width, artH / artImg.height);
        const dw = artImg.width * scale;
        const dh = artImg.height * scale;
        fCtx.drawImage(
          artImg,
          artX + (artW - dw) * 0.5,
          artY + (artH - dh) * 0.5,
          dw,
          dh
        );
        fCtx.restore();
      } else {
        // Procedural geometric emblem fallback
        const grad = fCtx.createLinearGradient(artX, artY, artX + artW, artY + artH);
        grad.addColorStop(0, coverSecondary || foilColor);
        grad.addColorStop(1, coverBg);
        fCtx.fillStyle = grad;
        fCtx.fillRect(artX, artY, artW, artH);

        fCtx.strokeStyle = spineText;
        fCtx.lineWidth = 2;
        for (let r = 60; r <= 260; r += 40) {
          fCtx.beginPath();
          fCtx.arc(artX + artW / 2, artY + artH / 2, r, 0, Math.PI * 2);
          fCtx.stroke();
        }
      }

      // Artwork frame border + corner registration crosses
      fCtx.strokeStyle = foilColor;
      fCtx.lineWidth = 2.5;
      fCtx.strokeRect(artX, artY, artW, artH);

      // Bottom Footer Bar
      fCtx.fillStyle = spineText;
      fCtx.font = '700 26px "JetBrains Mono", monospace';
      fCtx.fillText(`AUTHOR // ${book.author} (@jiangfengwhu)`, 78, 1256);
      fCtx.textAlign = 'right';
      fCtx.fillStyle = foilColor;
      fCtx.fillText(book.liveUrl.replace(/^https?:\/\//, ''), 946, 1256);
      fCtx.textAlign = 'left';

      // Left spine hinge groove shadow
      const hingeGrad = fCtx.createLinearGradient(0, 0, 42, 0);
      hingeGrad.addColorStop(0, 'rgba(0,0,0,0.45)');
      hingeGrad.addColorStop(0.6, 'rgba(255,255,255,0.12)');
      hingeGrad.addColorStop(1, 'rgba(0,0,0,0)');
      fCtx.fillStyle = hingeGrad;
      fCtx.fillRect(0, 0, 42, 1340);

      // Update bump canvas (embossed borders + linen grain)
      bCtx.fillStyle = '#808080';
      bCtx.fillRect(0, 0, 512, 670);
      bCtx.strokeStyle = '#ffffff';
      bCtx.lineWidth = 3;
      bCtx.strokeRect(24, 24, 464, 622);
      bCtx.strokeRect(39, 278, 434, 305);
      bCtx.fillStyle = '#ffffff';
      bCtx.font = '800 32px sans-serif';
      bCtx.fillText(book.title, 39, 134);

      frontTexture.needsUpdate = true;
      bumpTexture.needsUpdate = true;
      if (onLoadedCallback) onLoadedCallback();
    };

    drawFrontAndBump(null);

    if (book.coverImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => drawFrontAndBump(img);
      img.src = book.coverImage;
    }

    // 3. BACK COVER TEXTURE (1024 × 1340)
    const backCanvas = document.createElement('canvas');
    backCanvas.width = 1024;
    backCanvas.height = 1340;
    const bkCtx = backCanvas.getContext('2d');

    const { coverBg, spineText, foilColor } = book.palette;
    bkCtx.fillStyle = coverBg;
    bkCtx.fillRect(0, 0, 1024, 1340);

    bkCtx.strokeStyle = foilColor;
    bkCtx.globalAlpha = 0.35;
    bkCtx.lineWidth = 2;
    bkCtx.strokeRect(60, 60, 904, 1220);
    bkCtx.globalAlpha = 1;

    bkCtx.fillStyle = foilColor;
    bkCtx.font = '700 24px "JetBrains Mono", monospace';
    bkCtx.fillText(`${book.volume} — SYNOPSIS & SPECIFICATION`, 100, 130);

    bkCtx.fillStyle = spineText;
    bkCtx.font = '700 44px "PingFang SC", "Microsoft YaHei", sans-serif';
    bkCtx.fillText(book.title, 100, 215);

    // Draw wrapped synopsis paragraphs on back cover
    bkCtx.font = '400 27px "PingFang SC", "Microsoft YaHei", sans-serif';
    bkCtx.fillStyle = 'rgba(255,255,255,0.88)';
    const fullText = (book.synopsis || []).join(' ');
    let yCursor = 300;
    const maxCharsPerLine = 27;
    for (let i = 0; i < fullText.length && yCursor < 760; i += maxCharsPerLine) {
      bkCtx.fillText(fullText.slice(i, i + maxCharsPerLine), 100, yCursor);
      yCursor += 46;
    }

    // Tech stack list on back cover
    bkCtx.fillStyle = foilColor;
    bkCtx.font = '700 22px "JetBrains Mono", monospace';
    bkCtx.fillText('TECHNICAL ARCHITECTURE //', 100, 840);

    (book.techStack || []).slice(0, 6).forEach((tech, idx) => {
      bkCtx.fillStyle = spineText;
      bkCtx.font = '600 24px "JetBrains Mono", monospace';
      bkCtx.fillText(`0${idx + 1}. ${tech}`, 100 + (idx % 2) * 420, 900 + Math.floor(idx / 2) * 54);
    });

    // Colophon & faux ISBN barcode block
    bkCtx.fillStyle = '#ffffff';
    bkCtx.fillRect(100, 1100, 280, 110);
    bkCtx.fillStyle = '#000000';
    for (let bx = 118; bx < 360; bx += 7) {
      const bw = (bx * 13) % 5 === 0 ? 4 : 2;
      bkCtx.fillRect(bx, 1115, bw, 68);
    }
    bkCtx.font = '700 16px monospace';
    bkCtx.fillText(`ISBN 978-297782-0${index + 1}-${book.year}`, 118, 1200);

    bkCtx.fillStyle = foilColor;
    bkCtx.font = '600 22px "JetBrains Mono", monospace';
    bkCtx.textAlign = 'right';
    bkCtx.fillText('PUBLISHED BY JIANGFENGWHU PRESS', 910, 1155);
    bkCtx.fillText('PRINTED IN WEBGL 2.0', 910, 1192);
    bkCtx.textAlign = 'left';

    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.anisotropy = 8;

    // 4. PAGE BLOCK STRIATION TEXTURE
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = 256;
    pageCanvas.height = 256;
    const pCtx = pageCanvas.getContext('2d');
    pCtx.fillStyle = book.palette.pageEdge || '#f5f1e8';
    pCtx.fillRect(0, 0, 256, 256);
    pCtx.fillStyle = 'rgba(0,0,0,0.065)';
    for (let y = 0; y < 256; y += 3) {
      pCtx.fillRect(0, y, 256, 1);
    }
    const pageTexture = new THREE.CanvasTexture(pageCanvas);

    return {
      spineTexture,
      frontTexture,
      backTexture,
      pageTexture,
      bumpTexture
    };
  }

  /**
   * Builds all 3D hardcover book meshes and stacks them vertically.
   */
  buildBookshelf() {
    // Clear existing meshes if rebuilding
    while (this.rootGroup.children.length > 0) {
      this.rootGroup.remove(this.rootGroup.children[0]);
    }
    this.bookEntries = [];

    const count = this.booksData.length;
    // Compute total stack height to vertically center the stack
    const gap = this.params.spineGap;
    let totalHeight = 0;
    this.booksData.forEach((b) => {
      totalHeight += b.dimensions.thickness + gap;
    });
    totalHeight -= gap;

    let currentY = totalHeight * 0.5;

    this.booksData.forEach((book, index) => {
      const { width, height, thickness } = book.dimensions;
      const centerY = currentY - thickness * 0.5;
      currentY -= thickness + gap;

      const bookGroup = new THREE.Group();
      bookGroup.userData = { index, bookId: book.id };

      const textures = this.createBookTextures(book, index);

      const coverMatFront = new THREE.MeshStandardMaterial({
        map: textures.frontTexture,
        bumpMap: textures.bumpTexture,
        bumpScale: this.params.bumpScale,
        roughness: this.params.coverRoughness,
        metalness: this.params.foilMetalness * 0.35
      });

      const coverMatBack = new THREE.MeshStandardMaterial({
        map: textures.backTexture,
        bumpMap: textures.bumpTexture,
        bumpScale: this.params.bumpScale * 0.6,
        roughness: this.params.coverRoughness,
        metalness: this.params.foilMetalness * 0.25
      });

      const spineBaseMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(book.palette.spineBg),
        roughness: this.params.coverRoughness,
        metalness: this.params.foilMetalness * 0.3
      });

      const pageMat = new THREE.MeshStandardMaterial({
        map: textures.pageTexture,
        roughness: 0.78,
        metalness: 0.02
      });

      // Main Hardcover Box:
      // 0: +X (Fore-edge pages), 1: -X (Spine base), 2: +Y (Top pages),
      // 3: -Y (Bottom pages), 4: +Z (Front Cover), 5: -Z (Back Cover)
      const boxGeo = new THREE.BoxGeometry(width, height, thickness);
      const boxMaterials = [
        pageMat,
        spineBaseMat,
        pageMat,
        pageMat,
        coverMatFront,
        coverMatBack
      ];
      const boxMesh = new THREE.Mesh(boxGeo, boxMaterials);
      boxMesh.castShadow = true;
      boxMesh.receiveShadow = true;
      boxMesh.userData = { index, bookId: book.id };
      bookGroup.add(boxMesh);

      // Precision Upright Spine Plate on the -X face:
      // Basis maps Plane +X -> Book -Y (World +X in Shelf Mode),
      // Plane +Y -> Book +Z (World +Y in Shelf Mode),
      // Plane +Z (Normal) -> Book -X (World +Z toward camera in Shelf Mode)
      const spinePlaneGeo = new THREE.PlaneGeometry(height, thickness);
      const spinePlaneMat = new THREE.MeshStandardMaterial({
        map: textures.spineTexture,
        bumpMap: textures.bumpTexture,
        bumpScale: this.params.bumpScale * 0.5,
        roughness: this.params.coverRoughness,
        metalness: this.params.foilMetalness * 0.35,
        polygonOffset: true,
        polygonOffsetFactor: -1
      });
      const spineMesh = new THREE.Mesh(spinePlaneGeo, spinePlaneMat);
      const basisMatrix = new THREE.Matrix4().makeBasis(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(-1, 0, 0)
      );
      spineMesh.rotation.setFromRotationMatrix(basisMatrix);
      spineMesh.position.set(-width * 0.5 - 0.02, 0, 0);
      spineMesh.userData = { index, bookId: book.id };
      bookGroup.add(spineMesh);

      // Initial Shelf Pose (exact Stripe Press Euler orientation)
      const shelfPos = new THREE.Vector3(
        (index % 2 === 0 ? -0.35 : 0.35),
        centerY,
        0
      );
      const shelfRot = new THREE.Euler(-Math.PI * 0.5, 0, Math.PI * 0.5, 'XYZ');

      bookGroup.position.copy(shelfPos);
      bookGroup.rotation.copy(shelfRot);

      this.rootGroup.add(bookGroup);

      this.bookEntries.push({
        index,
        book,
        group: bookGroup,
        boxMesh,
        spineMesh,
        materials: [coverMatFront, coverMatBack, spineBaseMat, spinePlaneMat],
        shelfPos,
        shelfRot,
        targetPos: shelfPos.clone(),
        targetRot: new THREE.Euler().copy(shelfRot)
      });
    });
  }

  /**
   * Recomputes vertical shelf Y coordinates when spineGap changes or a book is added.
   */
  recomputeShelfPositions() {
    const gap = this.params.spineGap;
    let totalHeight = 0;
    this.bookEntries.forEach((entry) => {
      totalHeight += entry.book.dimensions.thickness + gap;
    });
    totalHeight -= gap;

    let currentY = totalHeight * 0.5;
    this.bookEntries.forEach((entry, idx) => {
      const t = entry.book.dimensions.thickness;
      entry.shelfPos.y = currentY - t * 0.5;
      entry.shelfPos.x = idx % 2 === 0 ? -0.35 : 0.35;
      currentY -= t + gap;
    });
  }

  /**
   * Dynamically appends a new book to the 3D shelf at runtime (Mock/Extensible support).
   */
  addBook(newBookData) {
    this.booksData.push(newBookData);
    this.buildBookshelf();
  }

  /**
   * Updates material parameters live from the `/` Material Control Panel.
   */
  updateMaterialParams(newParams) {
    Object.assign(this.params, newParams);
    this.keyLight.intensity = this.params.lightIntensity;
    this.recomputeShelfPositions();

    this.bookEntries.forEach((entry) => {
      entry.materials.forEach((mat) => {
        mat.roughness = this.params.coverRoughness;
        mat.metalness = this.params.foilMetalness * 0.35;
        if (mat.bumpMap) {
          mat.bumpScale = this.params.bumpScale;
        }
        mat.needsUpdate = true;
      });
    });
  }

  /**
   * Programmatically hovers a spine (e.g., from left `.PressHomepageMenu` ticks).
   */
  setHoveredBook(index) {
    if (this.activeIndex !== -1) return;
    if (this.hoveredIndex !== index) {
      this.hoveredIndex = index;
      if (index >= 0 && this.soundEngine) {
        this.soundEngine.playSpineHover(index);
      }
      if (this.onHoverBook) {
        this.onHoverBook(index >= 0 ? this.booksData[index] : null, index);
      }
    }
  }

  /**
   * Selects a book to enter Stripe Press 58%/42% Inspector Mode (or -1 to return to Shelf).
   */
  selectBook(index) {
    this.activeIndex = index;
    this.bookTwirlX = 0;
    this.bookTwirlY = 0;

    if (index >= 0 && this.soundEngine) {
      this.soundEngine.playBookOpen();
    } else if (this.soundEngine) {
      this.soundEngine.playTick(520);
    }

    if (this.onSelectBook) {
      this.onSelectBook(index >= 0 ? this.booksData[index] : null, index);
    }
  }

  /**
   * Camera/Book angle presets inside the Book Details Inspector.
   */
  setInspectorPose(preset) {
    if (this.activeIndex < 0) return;
    const entry = this.bookEntries[this.activeIndex];
    if (!entry) return;
    this.bookTwirlX = 0;
    this.bookTwirlY = 0;

    if (preset === 'front') {
      entry.targetRot.set(0.05, 0.28, -0.02);
    } else if (preset === 'spine') {
      entry.targetRot.set(0.04, Math.PI * 0.46, 0);
    } else if (preset === 'back') {
      entry.targetRot.set(0.05, Math.PI + 0.25, 0.02);
    } else if (preset === 'isometric') {
      entry.targetRot.set(0.28, 0.62, -0.12);
    }
    if (this.soundEngine) this.soundEngine.playTick(760);
  }

  /**
   * Feeds page wheel/scroll delta into Stripe Press scroll-velocity tilt physics.
   */
  addScrollDelta(deltaY) {
    if (this.activeIndex !== -1) return;
    this.scrollVelocity += deltaY * this.params.scrollTiltGain;
    this.scrollVelocity = Math.max(-0.55, Math.min(0.55, this.scrollVelocity));
  }

  bindEvents() {
    const getLocalNDC = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.dragMoved = false;
      this.pointerDownPos.set(e.clientX, e.clientY);
      this.lastPointerPos.set(e.clientX, e.clientY);
      getLocalNDC(e.clientX, e.clientY);

      if (this.activeIndex === -1 && this.hoveredIndex >= 0) {
        this.shelfDragIndex = this.hoveredIndex;
      }
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener(
      'pointermove',
      (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const insideCanvas =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (insideCanvas) {
          getLocalNDC(e.clientX, e.clientY);
        } else if (!this.isPointerDown) {
          this.pointerNDC.set(-99, -99);
        }

        if (this.isPointerDown) {
          const dx = e.clientX - this.lastPointerPos.x;
          const dy = e.clientY - this.lastPointerPos.y;
          this.lastPointerPos.set(e.clientX, e.clientY);

          if (this.pointerDownPos.distanceTo(this.lastPointerPos) > 5) {
            this.dragMoved = true;
          }

          if (this.activeIndex !== -1) {
            // 360° Book Twirl in Inspector Mode (Stripe Press inertia physics)
            this.bookTwirlY = dx * 0.013;
            this.bookTwirlX = dy * 0.011;
            const activeEntry = this.bookEntries[this.activeIndex];
            if (activeEntry) {
              activeEntry.targetRot.y += this.bookTwirlY;
              activeEntry.targetRot.x += this.bookTwirlX;
            }
          } else if (this.shelfDragIndex !== -1) {
            // Vertical drag-to-part neighbors on the shelf (`draggingGap`)
            this.shelfDragOffset = Math.max(
              -5.5,
              Math.min(5.5, (e.clientY - this.pointerDownPos.y) * -0.04)
            );
          }
          return;
        }

        // Raycast hover in Shelf Mode
        if (this.activeIndex === -1 && insideCanvas) {
          this.raycaster.setFromCamera(this.pointerNDC, this.camera);
          const meshes = [];
          this.bookEntries.forEach((b) => {
            meshes.push(b.boxMesh, b.spineMesh);
          });
          const hits = this.raycaster.intersectObjects(meshes, false);
          if (hits.length > 0) {
            const hitIndex = hits[0].object.userData.index;
            this.setHoveredBook(hitIndex);
            this.canvas.style.cursor = 'pointer';
          } else {
            this.setHoveredBook(-1);
            this.canvas.style.cursor = 'default';
          }
        } else if (this.activeIndex !== -1 && insideCanvas) {
          this.canvas.style.cursor = 'grab';
        }
      },
      { passive: true }
    );

    window.addEventListener('pointerup', () => {
      if (!this.isPointerDown) return;
      const wasDragging = this.dragMoved;
      this.isPointerDown = false;
      this.shelfDragOffset = 0;
      this.shelfDragIndex = -1;

      if (!wasDragging && this.activeIndex === -1 && this.hoveredIndex >= 0) {
        // Clicked a spine -> open Book Details Inspector!
        this.selectBook(this.hoveredIndex);
      }

      this.canvas.style.cursor = this.activeIndex !== -1 ? 'grab' : 'default';
    });

    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    const rect = this.stageContainer.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    const height = Math.max(rect.height, 480);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  update() {
    // Damp scroll velocity (Stripe Press physics)
    this.scrollVelocity *= 0.85;

    // Apply rotational inertia when twirling the active book (damped by *= 0.95)
    if (this.activeIndex !== -1 && !this.isPointerDown) {
      const activeEntry = this.bookEntries[this.activeIndex];
      if (activeEntry) {
        activeEntry.targetRot.y += this.bookTwirlY;
        activeEntry.targetRot.x += this.bookTwirlX;
        // Keep X tilt comfortable while allowing full 360° Y rotation
        activeEntry.targetRot.x = Math.max(
          -Math.PI * 0.42,
          Math.min(Math.PI * 0.42, activeEntry.targetRot.x)
        );
      }
      this.bookTwirlX *= 0.95;
      this.bookTwirlY *= 0.95;
    }

    const isMobile = window.innerWidth < 900;

    this.bookEntries.forEach((entry, i) => {
      if (this.activeIndex === -1) {
        // ====================================================================
        // SHELF STACK MODE
        // ====================================================================
        const isHovered = i === this.hoveredIndex;

        // Calculate vertical drag-to-part offset (`draggingGap`)
        let partOffsetY = 0;
        if (this.shelfDragIndex !== -1) {
          if (i === this.shelfDragIndex) {
            partOffsetY = this.shelfDragOffset * 0.5;
          } else if (i < this.shelfDragIndex) {
            partOffsetY = 2.4;
          } else {
            partOffsetY = -2.4;
          }
        } else if (this.hoveredIndex !== -1 && i !== this.hoveredIndex) {
          // Subtle neighbor breathing when a spine is hovered
          partOffsetY = i < this.hoveredIndex ? 0.55 : -0.55;
        }

        // Hover pull-out z: +6, tilt x: -Math.PI * 0.43
        entry.targetPos.set(
          entry.shelfPos.x + (isHovered ? 0.6 : 0),
          entry.shelfPos.y + partOffsetY,
          isHovered ? 7.2 : 0
        );

        const baseRotX = isHovered ? -Math.PI * 0.42 : -Math.PI * 0.5;
        entry.targetRot.set(
          baseRotX + this.scrollVelocity,
          isHovered ? 0.04 : 0,
          Math.PI * 0.5
        );
      } else if (i === this.activeIndex) {
        // ====================================================================
        // ACTIVE BOOK IN 58%/42% INSPECTOR STAGE
        // ====================================================================
        const stageX = isMobile ? 0 : -5.2;
        const stageY = isMobile ? 3.5 : 0.0;
        const stageZ = isMobile ? -12 : -4;
        entry.targetPos.set(stageX, stageY, stageZ);

        // Initialize inspector rotation when transitioning from shelf pose
        if (Math.abs(entry.targetRot.z - Math.PI * 0.5) < 0.01) {
          entry.targetRot.set(0.08, 0.36, -0.03);
        }
      } else {
        // ====================================================================
        // NON-ACTIVE BOOKS RECEDE SMOOTHLY IN INSPECTOR MODE
        // ====================================================================
        const spreadY = (this.activeIndex - i) * 6.0;
        entry.targetPos.set(-85, entry.shelfPos.y - spreadY, -120);
        entry.targetRot.set(-Math.PI * 0.5, 0, Math.PI * 0.5);
      }

      // Smooth spring interpolation
      entry.group.position.lerp(entry.targetPos, 0.09);
      entry.group.rotation.x += (entry.targetRot.x - entry.group.rotation.x) * 0.09;
      entry.group.rotation.y += (entry.targetRot.y - entry.group.rotation.y) * 0.09;
      entry.group.rotation.z += (entry.targetRot.z - entry.group.rotation.z) * 0.09;
    });

    this.renderer.render(this.scene, this.camera);
  }
}
