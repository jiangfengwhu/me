/**
 * ============================================================================
 * ARCHITECTURAL PAINTED WALL, ROUNDED BULLETIN CARDS & KRAFT PAPER BOOK ENGINE
 * ============================================================================
 * 1. `createPaintedWallMaps()`:
 *    Gray-black matte-satin painted wall (`灰黑色刷了涂料的墙的感觉`) with roller
 *    stipple, brushed mineral coating micro-relief, and roughness variation
 *    that responds realistically to the top full-width linear light bar and
 *    global illumination.
 * 2. `createBulletinCardTexture(config)`:
 *    Rounded-corner Act I Bulletin Board cards with crisp typography, circular
 *    GitHub avatar, and subtle top-edge light catch.
 * 3. `createKraftPaperMaps()` & `createStripeBookTextures(book, index)`:
 *    Tactile Kraft Paper (`牛皮纸`) fiber bump/roughness maps, pulp flecks,
 *    archival Kraft spine label plates, stitched binding details, and deckle
 *    paper edge strata for Act II books and bookshelf.
 * ============================================================================
 */

import * as THREE from 'three';
import { drawIcon, drawIconPlate } from './CardIcons.js';

/**
 * Helper: Draw rounded rectangle path on Canvas 2D
 */
export function roundRectPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

/** Wrap by measured width so mixed Chinese/Latin copy stays inside the label. */
function labelLines(ctx, text, maxWidth, maxLines) {
  const lines = [];
  let current = '';
  for (const char of Array.from(String(text || ''))) {
    if (current && ctx.measureText(current + char).width > maxWidth) {
      lines.push(current);
      current = '';
      if (lines.length === maxLines) {
        let last = lines.pop();
        while (last && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
        lines.push(last + '…');
        return lines;
      }
    }
    current += char;
  }
  if (current) lines.push(current);
  return lines;
}

/**
 *Deterministic pseudo-random helper for repeatable procedural textures
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cached soft radial dot sprite. Thousands of `createRadialGradient` calls are
 * the single most expensive part of the procedural paint maps, so the falloff is
 * rasterised once and blitted instead.
 */
const dotSprites = new Map();
function softDot(rgb) {
  if (dotSprites.has(rgb)) return dotSprites.get(rgb);
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 1, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  dotSprites.set(rgb, canvas);
  return canvas;
}

/**
 * Tileable grayscale noise. Used as an `overlay` pattern instead of a per-pixel
 * `getImageData` pass: reading a canvas back costs tens of milliseconds on some
 * drivers, while painting a 128² tile through a pattern is nearly free.
 */
const noiseTiles = new Map();
function noiseTile(amplitude) {
  if (noiseTiles.has(amplitude)) return noiseTiles.get(amplitude);
  const size = 128;
  const rand = mulberry32(1013 + amplitude);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.max(0, Math.min(255, 128 + (rand() - 0.5) * amplitude));
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  noiseTiles.set(amplitude, canvas);
  return canvas;
}

function overlayNoise(ctx, size, amplitude, alpha = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ctx.createPattern(noiseTile(amplitude), 'repeat');
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
}

/**
 * Cover art is decoded one image at a time: six ~800 KB PNGs decoded at once is
 * a guaranteed multi-frame stall. While the theatre curtain is still closed the
 * pace can be tightened (`setCoverPace`), and `coversSettled()` lets the preloader
 * wait for every cover so Act II is complete *before* the reveal.
 */
const coverQueue = [];
let coverBusy = false;
let coverTimer = null;
let coverGap = 180;
let coverTotal = 0;
let coverDone = 0;
const coverWaiters = [];

function settleCovers() {
  if (coverBusy || coverQueue.length || !coverWaiters.length) return;
  coverWaiters.splice(0).forEach(resolve => resolve());
}

function scheduleCover(delay) {
  if (coverTimer !== null || coverBusy) return;
  coverTimer = setTimeout(() => {
    coverTimer = null;
    const next = coverQueue.shift();
    if (!next) { settleCovers(); return; }
    coverBusy = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    if ('fetchPriority' in img) img.fetchPriority = 'low';
    const advance = () => {
      coverBusy = false;
      coverDone++;
      scheduleCover(coverGap);
      settleCovers();
    };
    img.onload = () => {
      try { next.apply(img); } catch { /* keep the kraft placeholder */ }
      advance();
    };
    img.onerror = advance;
    img.src = next.src;
  }, delay);
}

function enqueueCover(src, apply) {
  coverQueue.push({ src, apply });
  coverTotal++;
  scheduleCover(coverGap);
}

/** Faster pacing is safe while nothing is on screen yet. */
export function setCoverPace(gap) {
  coverGap = Math.max(0, Number(gap) || 0);
}

/** `{ done, total }` — how many covers have been decoded and painted. */
export function coverStats() {
  return { done: coverDone, total: coverTotal };
}

/** Resolves once every queued cover has been decoded, painted or failed. */
export function coversSettled() {
  if (!coverBusy && !coverQueue.length) return Promise.resolve();
  return new Promise(resolve => coverWaiters.push(resolve));
}

/**
 * 1. Gray-Black Painted Wall Maps (`灰黑色，做成刷了涂料的墙的感觉`)
 * Creates a tileable architectural matte-satin charcoal wall paint texture
 * with roller stipple + subtle cross-brushed latex paint strokes.
 */
let cachedWallMaps = null;
export function createPaintedWallMaps() {
  if (cachedWallMaps) return cachedWallMaps;

  const size = 512;
  const rand = mulberry32(20261024);

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d');

  // Base gray-black architectural paint tone (#1d2026)
  cCtx.fillStyle = '#1d2026';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#b0b0b0';
  rCtx.fillRect(0, 0, size, size);

  // Soft organic plaster & paint coat cloud modulation (seamless soft dabs)
  const lightDot = softDot('255,255,255');
  const darkDot = softDot('0,0,0');
  for (let i = 0; i < 600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const rad = 14 + rand() * 42;
    const isLight = rand() > 0.48;
    const dot = isLight ? lightDot : darkDot;

    cCtx.globalAlpha = isLight ? 0.015 : 0.018;
    cCtx.drawImage(dot, x - rad, y - rad, rad * 2, rad * 2);

    const bRad = rad * 0.6;
    bCtx.globalAlpha = 0.05;
    bCtx.drawImage(dot, x - bRad, y - bRad, bRad * 2, bRad * 2);
  }
  cCtx.globalAlpha = 1;
  bCtx.globalAlpha = 1;

  // Fine paint brush bristles & roller stipple (orange-peel micro-grain of real wall paint).
  // Painted as tiled noise instead of a per-pixel read-back/modify/write pass.
  overlayNoise(bCtx, size, 26);
  overlayNoise(cCtx, size, 8, 0.5);
  overlayNoise(rCtx, size, 18, 0.6);

  const setupRepeat = (tex, rx, ry, isSRGB = false) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rx, ry);
    if (isSRGB) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  };

  const colorMap = setupRepeat(new THREE.CanvasTexture(colorCanvas), 10, 4, true);
  const bumpMap = setupRepeat(new THREE.CanvasTexture(bumpCanvas), 10, 4, false);
  const roughnessMap = setupRepeat(new THREE.CanvasTexture(roughCanvas), 10, 4, false);

  cachedWallMaps = { colorMap, bumpMap, roughnessMap };
  return cachedWallMaps;
}

/**
 * 2. Act I Rounded Bulletin Card Texture (`第一幕卡片要做圆角，同时hover时带点微厚度`)
 */
/** `#38bdf8` + 0.4 → `rgba(56,189,248,0.4)` (hex-alpha suffixes break on 3-digit hex). */
function withAlpha(hex, alpha) {
  const raw = String(hex || '#38bdf8').replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = parseInt(full.slice(0, 6), 16) || 0;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** Darken (`amount < 0`) or lighten (`amount > 0`) a hex colour. */
function shadeHex(hex, amount) {
  const raw = String(hex || '#38bdf8').replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = parseInt(full.slice(0, 6), 16) || 0;
  const mix = (v) => {
    const out = amount < 0 ? v * (1 + amount) : v + (255 - v) * amount;
    return Math.max(0, Math.min(255, Math.round(out)));
  };
  return `rgb(${mix((n >> 16) & 255)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
}

export function createBulletinCardTexture(config) {
  const aspect = config.aspect || 1.85;
  const isCompact = aspect < 1.35;
  const layout = config.layout || 'classic';
  const widthPx = config.widthPx || (isCompact ? 720 : 1120);
  const heightPx = config.heightPx || Math.round(widthPx / aspect);

  const bgStart = config.bgTint || config.bgStart || '#1c222d';
  const bgEnd = config.bgEnd || '#12161f';
  const accentColor = config.accentHex || config.accentColor || '#38bdf8';
  const pinColor = config.pinColor || accentColor;
  const kicker = config.kicker || '';
  const badge = config.badge || '';
  const title = config.title || '';
  const subtitle = config.subtitle || '';
  const body = config.body || '';
  const lines = config.lines || [];
  const tags = config.tags || [];
  const footerLeft = config.footerLeft || '';
  const footerRight = config.footerRight || '';
  const avatarImg = config.avatarUrl || config.avatarImg || null;
  let isHovered = Boolean(config.isHovered);

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');
  const padX = isCompact ? 44 : 54;
  // Match the physical card silhouette; inset outlines share its corner centres.
  const cornerRad = isCompact
    ? widthPx * ((config.cornerRadius ?? 1.15) / (config.w || 13.6))
    : 44;

  let cachedAvatar = null;
  const medalImages = new Map();

  const wrapParagraph = (text, maxWidth) => {
    if (!text) return [];
    const chars = Array.from(text);
    const out = [];
    let current = '';
    for (const ch of chars) {
      const test = current + ch;
      if (ctx.measureText(test).width > maxWidth && current.length > 0) {
        out.push(current);
        current = ch;
      } else {
        current = test;
      }
    }
    if (current) out.push(current);

    // Hanging punctuation: CJK closing marks must never open a new line, so
    // pull them back onto the previous line (the classic 避头尾 rule). Without
    // this, a one-character 「。」 orphan ends up alone on its own row.
    const NO_LINE_START = '，。、；：？！）》」』】…·,.;:?!)]}%';
    for (let i = 1; i < out.length; i += 1) {
      let guard = 0;
      while (out[i].length > 0 && NO_LINE_START.includes(out[i][0]) && guard < 4) {
        out[i - 1] += out[i][0];
        out[i] = out[i].slice(1);
        guard += 1;
      }
    }
    return out.filter((line) => line.length > 0);
  };

  // Character-by-character measuring is the expensive part of this texture and
  // the result never changes between the idle and hover redraws, so wrap once
  // per width (the profile layout narrows the column to clear the mascot).
  const bodyCache = new Map();
  const bodyLines = (maxWidth) => {
    const w = Math.round(maxWidth || widthPx - padX * 2);
    if (bodyCache.has(w)) return bodyCache.get(w);
    if (lines.length > 0) {
      bodyCache.set(w, lines);
      return lines;
    }
    const previousFont = ctx.font;
    ctx.font = `400 ${isCompact ? 22 : 23}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    const wrapped = wrapParagraph(body, w);
    ctx.font = previousFont;
    bodyCache.set(w, wrapped);
    return wrapped;
  };

  /* ---------------------------------------------------------------------
   * Shared card surface: satin gradient, top light catch, accent strip and
   * the double rounded bevel frame. Every layout paints this first, then
   * draws its own content on top.
   * ------------------------------------------------------------------- */
  const paintSurface = (hovered = false) => {
    ctx.clearRect(0, 0, widthPx, heightPx);

    ctx.save();
    roundRectPath(ctx, 2, 2, widthPx - 4, heightPx - 4, Math.max(0, cornerRad - 2));
    ctx.clip();

    // 1. Tactile Satin-Matte Card Surface Gradient
    const grad = ctx.createLinearGradient(0, 0, widthPx, heightPx);
    grad.addColorStop(0, hovered ? '#252e3f' : bgStart);
    grad.addColorStop(1, hovered ? '#161c28' : bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, widthPx, heightPx);

    // 2. Top-Down Linear Light Catch & Soft Specular Sheen
    const sheenGrad = ctx.createLinearGradient(0, 0, 0, heightPx * 0.75);
    sheenGrad.addColorStop(0, hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.09)');
    sheenGrad.addColorStop(0.35, 'rgba(255,255,255,0.025)');
    sheenGrad.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, widthPx, heightPx);

    // Subtle radial spotlight bloom when hovered
    const glowGrad = ctx.createRadialGradient(
      widthPx * 0.5,
      heightPx * 0.25,
      12,
      widthPx * 0.5,
      heightPx * 0.35,
      widthPx * 0.68
    );
    glowGrad.addColorStop(0, withAlpha(accentColor, hovered ? 0.27 : 0.1));
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, widthPx, heightPx);

    // Top accent strip
    const topBarGrad = ctx.createLinearGradient(24, 0, widthPx - 24, 0);
    topBarGrad.addColorStop(0, 'rgba(255,255,255,0)');
    topBarGrad.addColorStop(0.25, accentColor);
    topBarGrad.addColorStop(0.75, accentColor);
    topBarGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = topBarGrad;
    ctx.fillRect(0, 0, widthPx, hovered ? 8 : 5);

    // 3. Outer & Inner Rounded Card Bevel Frame
    roundRectPath(ctx, 6, 6, widthPx - 12, heightPx - 12, Math.max(0, cornerRad - 6));
    ctx.strokeStyle = hovered ? accentColor : 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = hovered ? 5 : 2.5;
    ctx.stroke();

    roundRectPath(ctx, 18, 18, widthPx - 36, heightPx - 36, Math.max(0, cornerRad - 18));
    ctx.strokeStyle = hovered ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  /** Right-hand mono pill badge (shared by the classic & GitHub layouts). */
  const drawBadge = (hovered = false) => {
    if (!badge) return;
    ctx.font = `700 ${isCompact ? 17 : 18}px "JetBrains Mono", monospace`;
    const bw = ctx.measureText(badge).width + 30;
    const bx = widthPx - padX - bw;
    const by = isCompact ? 48 : 44;

    roundRectPath(ctx, bx, by, bw, 36, 18);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'left';
    ctx.fillText(badge, bx + 15, by + 24);
  };

  /** Bottom divider + mono footer strip (shared by every layout). */
  const drawFooter = () => {
    if (!footerLeft && !footerRight) return;
    const footY = heightPx - 38;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, footY - 28);
    ctx.lineTo(widthPx - padX, footY - 28);
    ctx.stroke();

    ctx.font = `700 ${isCompact ? 16 : 17}px "JetBrains Mono", monospace`;
    if (footerLeft) {
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText(footerLeft, padX, footY);
    }
    if (footerRight) {
      ctx.fillStyle = accentColor;
      ctx.textAlign = 'right';
      ctx.fillText(footerRight, widthPx - padX, footY);
    }
    ctx.textAlign = 'left';
  };

  const draw = (hovered = false) => {
    paintSurface(hovered);

    let contentX = padX;
    let cursorY = isCompact ? 84 : 78;

    // 4. Optional Circular GitHub Avatar
    if (cachedAvatar) {
      const avSize = 126;
      const avX = padX;
      const avY = 64;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(cachedAvatar, avX, avY, avSize, avSize);
      ctx.restore();

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2 + 4, 0, Math.PI * 2);
      ctx.stroke();

      contentX = padX + avSize + 28;
    }

    // 5. Kicker & Right Pill Badge
    if (kicker) {
      ctx.fillStyle = accentColor;
      ctx.font = `700 ${isCompact ? 18 : 19}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(kicker, contentX, cursorY);
      cursorY += isCompact ? 48 : 46;
    }

    if (badge) {
      ctx.font = `700 ${isCompact ? 17 : 18}px "JetBrains Mono", monospace`;
      const bw = ctx.measureText(badge).width + 30;
      const bx = widthPx - padX - bw;
      const by = isCompact ? 48 : 44;

      roundRectPath(ctx, bx, by, bw, 36, 18);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.fill();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.fillText(badge, bx + 15, by + 24);
    }

    // 6. Main Clean Title
    if (title) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${isCompact ? 39 : 45}px "Inter", "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.fillText(title, contentX, cursorY + 8);
      cursorY += isCompact ? 50 : 54;
    }

    // 7. Subtitle
    if (subtitle) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `600 ${isCompact ? 22 : 24}px "Inter", "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.fillText(subtitle, contentX, cursorY + 2);
      cursorY += isCompact ? 46 : 46;
    }

    // 8. Body Lines
    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 ${isCompact ? 22 : 23}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    bodyLines().slice(0, isCompact ? 4 : 3).forEach((line) => {
      ctx.fillText(line, padX, cursorY + 12);
      cursorY += 36;
    });

    // 9. Bottom Sleek Rounded Pills
    if (tags && tags.length > 0) {
      let tagX = padX;
      const tagY = heightPx - (footerLeft || footerRight ? 92 : 52);
      ctx.font = `600 ${isCompact ? 17 : 18}px "JetBrains Mono", monospace`;
      tags.forEach((t) => {
        const tw = ctx.measureText(t).width + 28;
        if (tagX + tw > widthPx - padX) return;
        roundRectPath(ctx, tagX, tagY - 25, tw, 34, 12);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(t, tagX + 14, tagY - 2);
        tagX += tw + 10;
      });
    }

    // 10. Bottom Bulletin Footer Strip
    if (footerLeft || footerRight) {
      const footY = heightPx - 38;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, footY - 28);
      ctx.lineTo(widthPx - padX, footY - 28);
      ctx.stroke();

      ctx.font = `700 ${isCompact ? 16 : 17}px "JetBrains Mono", monospace`;
      if (footerLeft) {
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(footerLeft, padX, footY);
      }
      if (footerRight) {
        ctx.fillStyle = accentColor;
        ctx.textAlign = 'right';
        ctx.fillText(footerRight, widthPx - padX, footY);
      }
      ctx.textAlign = 'left';
    }

    ctx.restore();
  };

  /* =====================================================================
   * LAYOUT `profile` — 28.4 × 15.0 wide card (1120 × 592)
   * Circular avatar + name block on the top rail, a two-line bio, then the
   * "WORKED AT" brand row (Xiaomi / Kuaishou plates) and the "STACK" icon
   * row (React Native · Web · Go · Node · iOS · Low-code / D2C).
   * =================================================================== */
  const drawProfile = (hovered = false) => {
    paintSurface(hovered);

    const avSize = Math.round(widthPx * 0.118);
    const avX = padX;
    const avY = Math.round(heightPx * 0.105);
    const avCx = avX + avSize / 2;
    const avCy = avY + avSize / 2;

    if (cachedAvatar) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(avCx, avCy, avSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(cachedAvatar, avX, avY, avSize, avSize);
      ctx.restore();
      ctx.strokeStyle = withAlpha(accentColor, 0.8);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(avCx, avCy, avSize / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.save();
      ctx.strokeStyle = withAlpha(accentColor, 0.42);
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(avCx, avCy, avSize / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const x0 = avX + avSize + Math.round(widthPx * 0.028);

    if (kicker) {
      ctx.fillStyle = accentColor;
      ctx.font = `700 ${Math.round(widthPx * 0.016)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(kicker, x0, avY + Math.round(avSize * 0.26));
    }

    if (title) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${Math.round(widthPx * 0.0465)}px "Inter", "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.fillText(title, x0, avY + Math.round(avSize * 0.73));
    }

    if (config.role) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `600 ${Math.round(widthPx * 0.0185)}px "Inter", "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.fillText(config.role, x0, avY + avSize);
    }

    drawBadge(hovered);

    const bodyTop = Math.round(heightPx * 0.405);
    const bodyLead = Math.round(heightPx * 0.054);
    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 ${Math.round(widthPx * 0.0205)}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    // Stop at 80% width: the mascot perches in the bottom-right corner.
    bodyLines(widthPx * 0.8 - padX).slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, padX, bodyTop + i * bodyLead);
    });

    const divY = Math.round(heightPx * 0.537);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, divY);
    ctx.lineTo(widthPx - padX, divY);
    ctx.stroke();

    // --- WORKED AT: brand plates -------------------------------------
    const compBase = Math.round(heightPx * 0.633);
    const compCy = compBase - Math.round(widthPx * 0.0062);
    const plate = Math.round(widthPx * 0.0304);
    ctx.fillStyle = '#5b6b80';
    ctx.font = `700 ${Math.round(widthPx * 0.0134)}px "JetBrains Mono", monospace`;
    ctx.fillText('WORKED AT', padX, compBase);

    let cx2 = padX + Math.round(widthPx * 0.108);
    (config.companies || []).forEach((c) => {
      // Real brand glyph knocked out of a plate in the brand colour.
      drawIconPlate(ctx, c.icon, cx2 + plate / 2, compCy, plate, c.color, '#ffffff', plate * 0.26);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `700 ${Math.round(widthPx * 0.0161)}px "Inter", sans-serif`;
      ctx.fillText(c.label, cx2 + plate + 12, compBase);
      cx2 += plate + 12 + ctx.measureText(c.label).width + 34;
    });

    // --- STACK: monochrome icon row ----------------------------------
    const stackBase = Math.round(heightPx * 0.794);
    const stackCy = stackBase - Math.round(widthPx * 0.0072);
    ctx.fillStyle = '#5b6b80';
    ctx.font = `700 ${Math.round(widthPx * 0.0134)}px "JetBrains Mono", monospace`;
    ctx.fillText('STACK', padX, stackBase);

    const stack = config.stack || [];
    if (stack.length) {
      const startX = padX + Math.round(widthPx * 0.084);
      // The voxel mascot perches on this card's bottom-right corner, so the
      // stack rail deliberately stops at 78% width to leave it a clean landing
      // pad instead of burying the last chip.
      const avail = widthPx * 0.78 - startX;
      const box = Math.round(widthPx * 0.029);
      const iconGap = 12;
      const minGap = Math.round(widthPx * 0.024);

      // Measure first so every label renders at ONE font size — per-slot
      // shrinking made 「Low-code · D2C」 look like a footnote next to the rest.
      let fs = Math.round(widthPx * 0.0143);
      const measureAt = (size) => {
        ctx.font = `600 ${size}px "JetBrains Mono", monospace`;
        return stack.map((s) => ctx.measureText(s.label).width);
      };
      let widths = measureAt(fs);
      let contentW = widths.reduce((a, b) => a + b, 0) + stack.length * (box + iconGap);
      while (fs > 9 && contentW + minGap * (stack.length - 1) > avail) {
        fs -= 1;
        widths = measureAt(fs);
        contentW = widths.reduce((a, b) => a + b, 0) + stack.length * (box + iconGap);
      }
      const gap = Math.max(
        minGap,
        (avail - contentW) / Math.max(1, stack.length - 1)
      );

      let sx = startX;
      stack.forEach((s, i) => {
        drawIcon(ctx, s.icon, sx + box / 2, stackCy, box, accentColor);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = `600 ${fs}px "JetBrains Mono", monospace`;
        ctx.fillText(s.label, sx + box + iconGap, stackBase);
        sx += box + iconGap + widths[i] + gap;
      });
    }

    drawFooter();
    ctx.restore();
  };

  /* =====================================================================
   * LAYOUT `github` — 28.4 × 15.0 wide card (1120 × 592)
   * Real 53-week contribution calendar (levels shipped from the GitHub
   * profile), the classic "contribution snake" gliding across it, the
   * language split of the 43 public repos, and an achievement medal rail.
   * =================================================================== */
  const drawGithub = (hovered = false) => {
    paintSurface(hovered);

    // The contribution plot is a separate small texture; only it updates at 10 fps.

    // --- Language split ---------------------------------------------
    const langs = config.languages || [];
    const totalCount = langs.reduce((sum, l) => sum + l.count, 0) || 1;
    const langBase = Math.round(heightPx * 0.55);
    ctx.fillStyle = '#5b6b80';
    ctx.font = `700 ${Math.round(widthPx * 0.0116)}px "JetBrains Mono", monospace`;
    ctx.fillText('LANGUAGES', padX, langBase);

    ctx.font = `600 ${Math.round(widthPx * 0.0116)}px "JetBrains Mono", monospace`;
    let lx = widthPx - padX;
    for (let i = langs.length - 1; i >= 0; i -= 1) {
      const l = langs[i];
      const label = `${l.name} ${l.count}`;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText(label, lx - tw, langBase);
      lx -= tw + 9;
      ctx.beginPath();
      ctx.arc(lx - 4, langBase - 4, 4, 0, Math.PI * 2);
      ctx.fillStyle = l.color;
      ctx.fill();
      lx -= 22;
    }

    const barY = Math.round(heightPx * 0.575);
    const barH = Math.max(7, Math.round(heightPx * 0.0152));
    const barW = widthPx - padX * 2;
    ctx.save();
    roundRectPath(ctx, padX, barY, barW, barH, barH / 2);
    ctx.clip();
    let bx = padX;
    langs.forEach((l) => {
      const w = (barW * l.count) / totalCount;
      ctx.fillStyle = l.color;
      ctx.fillRect(bx, barY, Math.max(2, w - 1.5), barH);
      bx += w;
    });
    ctx.restore();

    // Original achievement artwork, verified from the public GitHub profile.
    const medals = config.achievements || [];
    const medalSize = Math.round(heightPx * 0.18);
    const railWidth = Math.min(widthPx * 0.4, medals.length * medalSize * 1.4);
    medals.forEach((medal, index) => {
      const x = padX + railWidth * (index + 0.5) / medals.length;
      const y = heightPx * 0.77;
      const image = medalImages.get(medal.src);
      if (image) ctx.drawImage(image, x - medalSize / 2, y - medalSize / 2, medalSize, medalSize);
      else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(medal.label, x, y);
        ctx.textAlign = 'left';
      }
    });

    const activeDays = Array.from(config.contrib?.levels || '').filter(level => Number(level) > 0).length;
    const stats = [
      { value: config.contrib?.total, label: 'CONTRIBUTIONS' },
      { value: activeDays, label: 'ACTIVE DAYS' }
    ];
    stats.forEach((stat, index) => {
      const x = widthPx * (0.56 + index * 0.22);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `700 ${Math.round(widthPx * 0.034)}px "JetBrains Mono", monospace`;
      ctx.fillText(stat.value == null ? '—' : String(stat.value), x, heightPx * 0.77);
      ctx.fillStyle = '#94a3b8';
      ctx.font = `600 ${Math.round(widthPx * 0.0107)}px "JetBrains Mono", monospace`;
      ctx.fillText(stat.label, x, heightPx * 0.814);
    });

    drawFooter();
    ctx.restore();
  };

  /* =====================================================================
   * LAYOUT `icon` — 13.6 × 14.8 compact card (720 × 783)
   * One oversized mark on a shallow enamel tile in the upper field.
   * The shaded rim, contact shadow and upper bevel give it a subtle lift.
   * =================================================================== */
  const drawIconCard = (hovered = false) => {
    paintSurface(hovered);

    const iconName = config.icon || 'web';
    const iconSize = Math.round(widthPx * 0.5);
    const iconCx = widthPx * 0.5;
    // Optical centre of the 0 → kicker field (kicker sits at 0.645h).
    const iconCy = Math.round(heightPx * 0.335);

    ctx.save();
    ctx.strokeStyle = withAlpha(accentColor, hovered ? 0.2 : 0.11);
    ctx.lineWidth = 1.6;
    [0.72, 0.92, 1.12].forEach((k) => {
      ctx.beginPath();
      ctx.arc(iconCx, iconCy, iconSize * k * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();

    const halo = ctx.createRadialGradient(
      iconCx,
      iconCy,
      iconSize * 0.1,
      iconCx,
      iconCy,
      iconSize * 0.78
    );
    halo.addColorStop(0, withAlpha(accentColor, hovered ? 0.3 : 0.2));
    halo.addColorStop(0.55, withAlpha(accentColor, 0.06));
    halo.addColorStop(1, withAlpha(accentColor, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, widthPx, heightPx);

    // Each large mark sits in its own shallow enamel tile.
    const plateSize = iconSize * 1.12;
    drawIconPlate(ctx, iconName, iconCx, iconCy, plateSize,
      config.iconBackground || config.bgTint || '#1c2331',
      config.iconForeground || accentColor, cornerRad * plateSize / widthPx);

    if (kicker) {
      ctx.fillStyle = accentColor;
      ctx.font = `700 ${Math.round(widthPx * 0.0264)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(kicker, padX, Math.round(heightPx * 0.645));
    }

    if (title) {
      let titleSize = Math.round(widthPx * 0.0556);
      const maxTitleW = widthPx - padX * 2;
      ctx.font = `800 ${titleSize}px "Inter", "PingFang SC", "Microsoft YaHei", sans-serif`;
      while (titleSize > 18 && ctx.measureText(title).width > maxTitleW) {
        titleSize -= 1;
        ctx.font = `800 ${titleSize}px "Inter", "PingFang SC", "Microsoft YaHei", sans-serif`;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, padX, Math.round(heightPx * 0.712));
    }

    const bodyTop = Math.round(heightPx * 0.771);
    const bodyLead = Math.round(heightPx * 0.0408);
    ctx.fillStyle = '#94a3b8';
    ctx.font = `400 ${Math.round(widthPx * 0.0292)}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    bodyLines().slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, padX, bodyTop + i * bodyLead);
    });

    if (config.meta) {
      ctx.fillStyle = '#64748b';
      ctx.font = `600 ${Math.round(widthPx * 0.0208)}px "JetBrains Mono", monospace`;
      ctx.fillText(config.meta, padX, Math.round(heightPx * 0.863));
    }

    drawFooter();
    ctx.restore();
  };

  /** Layout dispatcher — `classic` stays as the fallback renderer. */
  const render = (hovered = false) => {
    switch (layout) {
      case 'profile':
        drawProfile(hovered);
        break;
      case 'github':
        drawGithub(hovered);
        break;
      case 'icon':
        drawIconCard(hovered);
        break;
      default:
        draw(hovered);
    }
  };

  render(isHovered);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const pendingImages = [];
  if (avatarImg) {
    pendingImages.push(new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        cachedAvatar = img;
        render(isHovered);
        texture.needsUpdate = true;
        config.onTextureChange?.();
        resolve();
      };
      img.onerror = resolve;
      img.src = avatarImg;
    }));
  }
  for (const medal of config.achievements || []) {
    pendingImages.push(new Promise(resolve => {
      const image = new Image();
      image.onload = () => {
        medalImages.set(medal.src, image);
        render(isHovered); texture.needsUpdate = true; config.onTextureChange?.(); resolve();
      };
      image.onerror = resolve;
      image.src = medal.src;
    }));
  }

  return {
    texture,
    map: texture,
    ready: Promise.all(pendingImages),
    setHovered: (hovered) => {
      isHovered = hovered;
      render(hovered);
      texture.needsUpdate = true;
    }
  };
}

/**
 * 3. Procedural Kraft Paper (`牛皮纸`) & Archival Bookcase Wood Maps
 * Provides rich tactile fibrous bump, roughness, and Kraft grain overlays
 * for Act II books and bookshelf.
 */
let cachedKraftMaps = null;
export function createKraftPaperMaps() {
  if (cachedKraftMaps) return cachedKraftMaps;

  const size = 512;
  const rand = mulberry32(88482026);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d');

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#c4c4c4';
  rCtx.fillRect(0, 0, size, size);

  // Interlaced organic Kraft wood-pulp fibers (`牛皮纸纤维纹理`).
  // Batched into one path per tone/weight instead of 4800 separate strokes.
  const bumpFibers = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
  const roughFibers = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
  for (let i = 0; i < 2400; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const len = 8 + rand() * 34;
    const angle = rand() * Math.PI;
    const bright = rand() > 0.5;
    const heavy = rand() < 0.35;
    const index = (bright ? 0 : 2) + (heavy ? 1 : 0);
    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len;

    bumpFibers[index].moveTo(x, y);
    bumpFibers[index].lineTo(x2, y2);
    roughFibers[index].moveTo(x, y);
    roughFibers[index].lineTo(x2, y2);
  }
  bumpFibers.forEach((path, i) => {
    bCtx.strokeStyle = i < 2 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
    bCtx.lineWidth = i % 2 === 0 ? 0.9 : 1.9;
    bCtx.stroke(path);
  });
  roughFibers.forEach((path, i) => {
    rCtx.strokeStyle = i < 2 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    rCtx.lineWidth = i % 2 === 0 ? 1.0 : 1.7;
    rCtx.stroke(path);
  });

  // Fine Kraft paper grain (tiled noise pattern, no canvas read-back)
  overlayNoise(bCtx, size, 24);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);

  cachedKraftMaps = { bumpMap, roughnessMap };
  return cachedKraftMaps;
}

/**
 * Helper: Paint authentic Kraft Paper (`牛皮纸`) fibrous surface & pulp flecks onto a 2D canvas
 */
function paintKraftPaperSurface(ctx, width, height, baseTintHex, kraftBlend = 0.55) {
  const rand = mulberry32(width * 31 + height * 17);

  // Warm unbleached Kraft paper base (#c6a477 -> #b08b5c)
  const kGrad = ctx.createLinearGradient(0, 0, width, height);
  kGrad.addColorStop(0, '#ceae82');
  kGrad.addColorStop(0.5, '#be9a6b');
  kGrad.addColorStop(1, '#a98455');
  ctx.fillStyle = kGrad;
  ctx.fillRect(0, 0, width, height);

  // Blend book's signature ink color as an archival screenprint / dyed Kraft tint
  if (baseTintHex) {
    ctx.save();
    ctx.globalAlpha = 1.0 - kraftBlend;
    ctx.fillStyle = baseTintHex;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Subtle horizontal & diagonal Kraft paper mill rib lines (laid paper lines)
  const ribs = new Path2D();
  for (let y = 0; y < height; y += 6) {
    ribs.moveTo(0, y);
    ribs.lineTo(width, y);
  }
  ctx.strokeStyle = 'rgba(58, 38, 18, 0.06)';
  ctx.lineWidth = 1;
  ctx.stroke(ribs);

  // Organic wood-pulp fibers & dark/light Kraft flecks.
  // 1600 individual strokes collapse into 6 batched paths (tone x weight).
  const fibers = [new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D()];
  for (let i = 0; i < 1600; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const len = 6 + rand() * 24;
    const ang = rand() * Math.PI;
    const dark = rand() > 0.45;
    const weight = rand() < 0.34 ? 0 : rand() < 0.5 ? 1 : 2;
    const path = fibers[(dark ? 0 : 3) + weight];
    path.moveTo(x, y);
    path.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
  }
  fibers.forEach((path, i) => {
    ctx.strokeStyle = i < 3 ? 'rgba(65, 42, 18, 0.11)' : 'rgba(255, 240, 215, 0.09)';
    ctx.lineWidth = [0.9, 1.5, 2.1][i % 3];
    ctx.stroke(path);
  });

  const flecks = [new Path2D(), new Path2D()];
  for (let i = 0; i < 650; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const r = 0.7 + rand() * 1.8;
    const path = flecks[rand() > 0.3 ? 0 : 1];
    path.moveTo(x + r, y);
    path.arc(x, y, r, 0, Math.PI * 2);
  }
  ctx.fillStyle = 'rgba(52, 33, 14, 0.16)';
  ctx.fill(flecks[0]);
  ctx.fillStyle = 'rgba(255, 245, 225, 0.14)';
  ctx.fill(flecks[1]);

  // Vintage archival edge vignette (aged Kraft border darkening)
  const vig = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.3,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.72
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(28, 18, 8, 0.32)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
}

/**
 * 4. Detailed Kraft-Paper & Archival Hardcover Book Textures (`牛皮纸的感觉`)
 */
export function createStripeBookTextures(book, index, onTextureChange) {
  const { spineBg, coverBg, accentHex, foilColor } = book.palette;
  const spineInk = book.palette.spineText || '#ffffff';
  const spineTheme = accentHex || spineBg || coverBg;
  const kraftMaps = createKraftPaperMaps();

  // --------------------------------------------------------------------------
  // A. DETAILED KRAFT PAPER SPINE TEXTURE
  //    A book's spine runs along its *height*, so the face being textured is
  //    `height × thickness` — for these volumes roughly 29 × 3, i.e. 9.3 : 1.
  //    The canvas therefore uses that exact aspect: one canvas pixel must be one
  //    pixel in both directions, otherwise the GPU squeezes the label type across
  //    the thickness and every letter comes out flattened.
  //    The layout below is authored for a 1600 × 240 spine and scaled by `k`
  //    (≈0.71) onto the real, much flatter canvas.
  // --------------------------------------------------------------------------
  const SPINE_W = 1600;
  const bookHeight = book.dimensions?.height ?? 29;
  const bookThickness = book.dimensions?.thickness ?? 3;
  const SPINE_H = Math.max(120, Math.round((SPINE_W * bookThickness) / bookHeight));
  const k = SPINE_H / 240;
  const Y = (v) => Math.round(v * k);
  const S = (v) => Math.max(9, Math.round(v * k));

  const spineCanvas = document.createElement('canvas');
  spineCanvas.width = SPINE_W;
  spineCanvas.height = SPINE_H;
  const sCtx = spineCanvas.getContext('2d');

  // Dyed paper: the work's colour dominates; only a little kraft grain remains.
  paintKraftPaperSurface(sCtx, SPINE_W, SPINE_H, spineBg || spineTheme, 0.08);

  // Left & Right cloth/leather bookbinding endbands on the spine ends
  sCtx.fillStyle = 'rgba(24, 18, 12, 0.55)';
  sCtx.fillRect(0, 0, 54, SPINE_H);
  sCtx.fillRect(1546, 0, 54, SPINE_H);

  // Raised bookbinding cord ridges across the spine (`书脊凸起竹节/装帧脊线`)
  [68, 250, 1280, 1532].forEach((rx) => {
    sCtx.fillStyle = 'rgba(0,0,0,0.35)';
    sCtx.fillRect(rx - 4, 0, 4, SPINE_H);
    sCtx.fillStyle = 'rgba(255,245,225,0.22)';
    sCtx.fillRect(rx, 0, 4, SPINE_H);
  });

  // The label is printed in the same theme, rather than covering every spine in beige.
  roundRectPath(sCtx, 276, Y(26), 980, Y(188), Y(10));
  sCtx.fillStyle = spineBg || coverBg;
  sCtx.fill();
  sCtx.strokeStyle = spineTheme;
  sCtx.lineWidth = 2;
  sCtx.stroke();

  roundRectPath(sCtx, 284, Y(34), 964, Y(172), Y(6));
  sCtx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  sCtx.lineWidth = 1.2;
  sCtx.stroke();

  // Accent stamp bar on left of label plate
  sCtx.fillStyle = spineTheme;
  sCtx.fillRect(292, Y(40), 14, Y(160));

  // Volume stamp on left Kraft section
  roundRectPath(sCtx, 92, Y(42), 138, Y(156), Y(8));
  sCtx.fillStyle = 'rgba(28, 19, 10, 0.65)';
  sCtx.fill();
  sCtx.strokeStyle = spineTheme;
  sCtx.lineWidth = 1.6;
  sCtx.stroke();

  sCtx.fillStyle = spineInk;
  sCtx.font = `800 ${S(30)}px "JetBrains Mono", monospace`;
  sCtx.textBaseline = 'middle';
  sCtx.textAlign = 'center';
  sCtx.fillText(book.volume || `VOL. 0${index + 1}`, 161, Y(120));

  // Spine Title printed in deep archival espresso/charcoal ink on the Kraft label
  // plate. Auto-fitted: long titles shrink (and only truncate as a last resort)
  // instead of running off the plate and over the author stamp.
  sCtx.textAlign = 'left';
  sCtx.fillStyle = spineInk;
  const spineTitle = String(book.spineTitle || book.title || '');
  const titleMaxWidth = 890;
  const titleFont = (size) => `800 ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  const titleStart = S(42);
  const titleMin = S(24);
  let titleSize = titleStart;
  sCtx.font = titleFont(titleSize);
  while (titleSize > titleMin && sCtx.measureText(spineTitle).width > titleMaxWidth) {
    titleSize -= 1;
    sCtx.font = titleFont(titleSize);
  }
  let fittedTitle = spineTitle;
  if (sCtx.measureText(fittedTitle).width > titleMaxWidth) {
    while (fittedTitle.length > 4 && sCtx.measureText(`${fittedTitle}…`).width > titleMaxWidth) {
      fittedTitle = fittedTitle.slice(0, -1);
    }
    fittedTitle = `${fittedTitle}…`;
  }
  sCtx.fillText(fittedTitle, 326, Y(118));

  // Right-side archival author & year stamp
  sCtx.fillStyle = spineInk;
  sCtx.font = `700 ${S(22)}px "JetBrains Mono", monospace`;
  sCtx.textAlign = 'center';
  sCtx.fillText(`${book.author}`, 1408, Y(98));
  sCtx.fillStyle = foilColor || spineInk;
  sCtx.font = `600 ${S(20)}px "JetBrains Mono", monospace`;
  sCtx.fillText(`ARCHIVE · ${book.year}`, 1408, Y(142));
  sCtx.textAlign = 'left';

  // Cylindrical spine curvature shading
  const sGrad = sCtx.createLinearGradient(0, 0, 0, SPINE_H);
  sGrad.addColorStop(0, 'rgba(255,248,235,0.22)');
  sGrad.addColorStop(0.22, 'rgba(255,248,235,0.03)');
  sGrad.addColorStop(0.78, 'rgba(0,0,0,0.04)');
  sGrad.addColorStop(1, 'rgba(0,0,0,0.38)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, SPINE_W, SPINE_H);

  const spineTexture = new THREE.CanvasTexture(spineCanvas);
  spineTexture.colorSpace = THREE.SRGBColorSpace;
  spineTexture.anisotropy = 8;
  spineTexture.center.set(0.5, 0.5);
  spineTexture.rotation = -Math.PI * 0.5;

  // --------------------------------------------------------------------------
  // B. DETAILED KRAFT PAPER FRONT COVER TEXTURE (1024 × 1340)
  // --------------------------------------------------------------------------
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = 1024;
  frontCanvas.height = 1340;
  const fCtx = frontCanvas.getContext('2d');

  const frontTexture = new THREE.CanvasTexture(frontCanvas);
  frontTexture.colorSpace = THREE.SRGBColorSpace;
  frontTexture.anisotropy = 8;

  const drawFront = (artImg = null) => {
    // 1. Authentic Kraft Paperboard Base (`牛皮纸封面`)
    paintKraftPaperSurface(fCtx, 1024, 1340, coverBg, 0.72);

    // 2. Left Bookbinding Cloth Spine Wrap (`书脊包布边`)
    const clothGrad = fCtx.createLinearGradient(0, 0, 108, 0);
    clothGrad.addColorStop(0, '#1e1610');
    clothGrad.addColorStop(0.82, spineBg);
    clothGrad.addColorStop(1, '#0f0a06');
    fCtx.fillStyle = clothGrad;
    fCtx.fillRect(0, 0, 96, 1340);

    // Stitched thread line along the bookbinding cloth seam
    fCtx.strokeStyle = '#d6ba8e';
    fCtx.lineWidth = 2.5;
    fCtx.setLineDash([12, 8]);
    fCtx.beginPath();
    fCtx.moveTo(82, 24);
    fCtx.lineTo(82, 1316);
    fCtx.stroke();
    fCtx.setLineDash([]);

    // 3. Debossed Double Archival Ink Frame on Kraft Board
    fCtx.strokeStyle = '#291b0e';
    fCtx.lineWidth = 4;
    fCtx.strokeRect(128, 52, 844, 1236);
    fCtx.lineWidth = 1.5;
    fCtx.strokeRect(138, 62, 824, 1216);

    // Corner brass/ink registration marks
    [
      [128, 52],
      [972, 52],
      [128, 1288],
      [972, 1288]
    ].forEach(([cx, cy]) => {
      fCtx.fillStyle = '#291b0e';
      fCtx.fillRect(cx - 7, cy - 7, 14, 14);
    });

    // 4. Pasted Cream/Kraft Archival Header Card (`牛皮纸铭牌卡`)
    fCtx.fillStyle = '#f0e2c8';
    fCtx.fillRect(164, 90, 772, 412);
    fCtx.strokeStyle = '#291b0e';
    fCtx.lineWidth = 3;
    fCtx.strokeRect(164, 90, 772, 412);

    // Colored edition header strip inside the label
    fCtx.fillStyle = coverBg;
    fCtx.fillRect(164, 90, 772, 56);

    fCtx.fillStyle = '#f8f1e5';
    fCtx.font = '700 22px "JetBrains Mono", monospace';
    fCtx.fillText(`${book.volume} // ${book.edition}`, 190, 126);
    fCtx.textAlign = 'right';
    fCtx.fillText(`KRAFT ARCHIVE NO. 0${index + 1}`, 910, 126);
    fCtx.textAlign = 'left';

    // Book Title & Subtitle in crisp dark letterpress ink
    fCtx.fillStyle = '#1a1108';
    fCtx.font = '900 58px "PingFang SC", "Microsoft YaHei", sans-serif';
    fCtx.fillText(book.title, 192, 232);

    fCtx.fillStyle = '#4a3520';
    fCtx.font = '600 26px "PingFang SC", "Microsoft YaHei", sans-serif';
    const sub = book.subtitle || '';
    fCtx.fillText(sub.slice(0, 25), 192, 296);
    if (sub.length > 25) {
      fCtx.fillText(sub.slice(25, 50), 192, 336);
    }

    // Archival Category Stamp Box + Red/Amber Wax Seal Stamp
    fCtx.strokeStyle = '#291b0e';
    fCtx.lineWidth = 2;
    fCtx.strokeRect(192, 412, 490, 52);
    fCtx.fillStyle = '#291b0e';
    fCtx.font = '700 20px "JetBrains Mono", monospace';
    fCtx.fillText(book.category.toUpperCase(), 210, 445);

    // Circular archival stamp seal
    fCtx.save();
    fCtx.translate(848, 428);
    fCtx.rotate(-0.18);
    fCtx.strokeStyle = '#991b1b';
    fCtx.lineWidth = 3.5;
    fCtx.beginPath();
    fCtx.arc(0, 0, 42, 0, Math.PI * 2);
    fCtx.stroke();
    fCtx.lineWidth = 1.2;
    fCtx.beginPath();
    fCtx.arc(0, 0, 35, 0, Math.PI * 2);
    fCtx.stroke();
    fCtx.fillStyle = '#991b1b';
    fCtx.font = '800 14px "JetBrains Mono", monospace';
    fCtx.textAlign = 'center';
    fCtx.fillText('VERIFIED', 0, -4);
    fCtx.fillText('EDITION', 0, 14);
    fCtx.restore();
    fCtx.textAlign = 'left';

    // 5. Recessed Artwork Plate Window with Kraft Matting Border
    const artX = 164;
    const artY = 536;
    const artW = 772;
    const artH = 616;

    fCtx.fillStyle = '#e5d2b3';
    fCtx.fillRect(artX - 10, artY - 10, artW + 20, artH + 20);
    fCtx.strokeStyle = '#291b0e';
    fCtx.lineWidth = 3;
    fCtx.strokeRect(artX - 10, artY - 10, artW + 20, artH + 20);

    if (artImg) {
      fCtx.save();
      fCtx.beginPath();
      fCtx.rect(artX, artY, artW, artH);
      fCtx.clip();
      const scale = Math.max(artW / artImg.width, artH / artImg.height);
      const dw = artImg.width * scale;
      const dh = artImg.height * scale;
      fCtx.drawImage(artImg, artX + (artW - dw) * 0.5, artY + (artH - dh) * 0.5, dw, dh);
      // Warm sepia/kraft tonal glaze over artwork so it sits naturally in the Kraft board
      fCtx.fillStyle = 'rgba(185, 142, 88, 0.08)';
      fCtx.fillRect(artX, artY, artW, artH);
      fCtx.restore();
    } else {
      const grad = fCtx.createLinearGradient(artX, artY, artX + artW, artY + artH);
      grad.addColorStop(0, coverBg);
      grad.addColorStop(1, '#3e2914');
      fCtx.fillStyle = grad;
      fCtx.fillRect(artX, artY, artW, artH);
    }

    fCtx.strokeStyle = '#291b0e';
    fCtx.lineWidth = 2.5;
    fCtx.strokeRect(artX, artY, artW, artH);

    // 6. Bottom Archival Colophon Bar
    fCtx.fillStyle = '#1e140a';
    fCtx.font = '800 24px "JetBrains Mono", monospace';
    fCtx.fillText(`JIANG FENG (@jiangfengwhu)`, 164, 1236);
    fCtx.textAlign = 'right';
    fCtx.fillStyle = '#3e2712';
    fCtx.fillText(book.liveUrl.replace(/^https?:\/\//, ''), 936, 1236);
    fCtx.textAlign = 'left';

    // Deep French-joint bookbinding groove shadow on left hinge
    const groove = fCtx.createLinearGradient(84, 0, 122, 0);
    groove.addColorStop(0, 'rgba(0,0,0,0.48)');
    groove.addColorStop(0.5, 'rgba(0,0,0,0.18)');
    groove.addColorStop(0.85, 'rgba(255,245,228,0.22)');
    groove.addColorStop(1, 'rgba(0,0,0,0)');
    fCtx.fillStyle = groove;
    fCtx.fillRect(84, 0, 38, 1340);

    frontTexture.needsUpdate = true;
  };

  drawFront(null);
  if (book.coverImage) {
    // One cover per idle slot — six ~800 KB PNGs decoded at once stalls frames.
    enqueueCover(book.coverImage, (img) => { drawFront(img); onTextureChange?.(); });
  }

  // --------------------------------------------------------------------------
  // C. KRAFT PAPER BACK COVER TEXTURE (1024 × 1340)
  // --------------------------------------------------------------------------
  const backCanvas = document.createElement('canvas');
  backCanvas.width = 1024;
  backCanvas.height = 1340;
  const bkCtx = backCanvas.getContext('2d');

  paintKraftPaperSurface(bkCtx, 1024, 1340, spineBg, 0.76);

  // Right-side cloth binding wrap (since back cover hinge is on the right in UV space)
  bkCtx.fillStyle = '#1e1610';
  bkCtx.fillRect(928, 0, 96, 1340);

  bkCtx.strokeStyle = '#291b0e';
  bkCtx.lineWidth = 3.5;
  bkCtx.strokeRect(56, 56, 840, 1228);

  // Archival specification card on back cover
  bkCtx.fillStyle = '#ebd9bc';
  bkCtx.fillRect(116, 140, 720, 480);
  bkCtx.strokeStyle = '#291b0e';
  bkCtx.lineWidth = 2.5;
  bkCtx.strokeRect(116, 140, 720, 480);

  bkCtx.fillStyle = '#1e140a';
  bkCtx.font = '800 26px "JetBrains Mono", monospace';
  bkCtx.fillText(`ARCHIVE SPECIFICATION // ${book.volume}`, 156, 206);

  bkCtx.fillStyle = '#3e2914';
  bkCtx.font = '500 26px "PingFang SC", "Microsoft YaHei", sans-serif';
  const tagWords = book.productDescription || book.tagline || '';
  labelLines(bkCtx, tagWords, 640, 3).forEach((line, index) => bkCtx.fillText(line, 156, 286 + index * 46));

  bkCtx.fillStyle = '#1e140a';
  bkCtx.font = '700 22px "JetBrains Mono", monospace';
  const primaryStack = book.primaryStack || book.techStack?.[0] || 'Web';
  const stackLine = labelLines(bkCtx, `STACK: ${primaryStack}`, 640, 1)[0];
  const experienceLine = labelLines(bkCtx, `VISIT: ${book.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`, 640, 1)[0];
  bkCtx.fillText(stackLine, 156, 480);
  bkCtx.fillText(experienceLine, 156, 534);

  const backTexture = new THREE.CanvasTexture(backCanvas);
  backTexture.colorSpace = THREE.SRGBColorSpace;
  backTexture.anisotropy = 4;

  return {
    spineTexture,
    frontTexture,
    backTexture,
    pageEdgeTexture: sharedPageEdgeTexture(),
    kraftBumpMap: kraftMaps.bumpMap,
    kraftRoughnessMap: kraftMaps.roughnessMap
  };
}

let cachedPageEdgeTexture = null;
function sharedPageEdgeTexture() {
  if (cachedPageEdgeTexture) return cachedPageEdgeTexture;

  const edgeCanvas = document.createElement('canvas');
  edgeCanvas.width = 512;
  edgeCanvas.height = 512;
  const eCtx = edgeCanvas.getContext('2d');

  eCtx.fillStyle = '#dfd0b6';
  eCtx.fillRect(0, 0, 512, 512);

  // Fine stacked paper sheet strata (`书页层叠纸张纹理`)
  const light = new Path2D();
  const dark = new Path2D();
  for (let y = 0; y < 512; y += 2) {
    const path = y % 4 === 0 ? dark : light;
    path.moveTo(0, y);
    path.lineTo(512, y);
  }
  eCtx.lineWidth = 1;
  eCtx.strokeStyle = 'rgba(62, 41, 20, 0.16)';
  eCtx.stroke(dark);
  eCtx.strokeStyle = 'rgba(255, 250, 240, 0.25)';
  eCtx.stroke(light);

  cachedPageEdgeTexture = new THREE.CanvasTexture(edgeCanvas);
  cachedPageEdgeTexture.colorSpace = THREE.SRGBColorSpace;
  cachedPageEdgeTexture.wrapS = THREE.RepeatWrapping;
  cachedPageEdgeTexture.wrapT = THREE.RepeatWrapping;
  cachedPageEdgeTexture.repeat.set(2, 6);
  return cachedPageEdgeTexture;
}

/**
 * 5. Bookshelf Dark Walnut & Kraft Backer Texture Maps (`第二幕的书架细节材质`)
 */
let cachedShelfMaps = null;
export function createBookshelfMaps() {
  if (cachedShelfMaps) return cachedShelfMaps;

  const size = 512;
  const rand = mulberry32(991122);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Deep smoked walnut & charcoal wood tone (#231c16 -> #191410)
  const wGrad = ctx.createLinearGradient(0, 0, size, 0);
  wGrad.addColorStop(0, '#261e17');
  wGrad.addColorStop(0.5, '#1e1712');
  wGrad.addColorStop(1, '#261e17');
  ctx.fillStyle = wGrad;
  ctx.fillRect(0, 0, size, size);

  // Wood grain fibers
  for (let i = 0; i < 900; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const w = 2 + rand() * 4;
    const h = 40 + rand() * 140;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255, 220, 180, 0.035)' : 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(x, y, w, h);
  }

  const woodColorMap = new THREE.CanvasTexture(canvas);
  woodColorMap.colorSpace = THREE.SRGBColorSpace;
  woodColorMap.wrapS = THREE.RepeatWrapping;
  woodColorMap.wrapT = THREE.RepeatWrapping;
  woodColorMap.repeat.set(2, 2);

  cachedShelfMaps = { woodColorMap };
  return cachedShelfMaps;
}
