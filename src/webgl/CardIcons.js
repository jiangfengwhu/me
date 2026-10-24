/**
 * ============================================================================
 * ACT I BULLETIN-CARD ICON RENDERER
 * ============================================================================
 * Renders the official single-path glyphs stored in `iconPaths.js` with Canvas
 * 2D `Path2D`, so the cards carry the real brand marks (X, 小红书, Xiaomi,
 * Kuaishou, React, Go, Node.js, Apple, GitHub) and the real Material Design
 * glyphs (email-outline, bookshelf, sitemap, star, source-merge, flash,
 * snowflake) instead of hand-traced approximations.
 *
 * Everything is resolution independent: `drawIcon` maps the 24 × 24 source box
 * onto a `size × size` square centred on (cx, cy), so the same call paints a
 * 30px stack chip, a 34px company plate and a 340px "far away" watermark.
 * ============================================================================
 */

import { ICON_PATHS } from './iconPaths.js';

const VIEW_BOX = 24;
const pathCache = new Map();

/** Lazily build (and memoise) a `Path2D` for one icon id. */
function getPath(name) {
  if (pathCache.has(name)) return pathCache.get(name);
  const rec = ICON_PATHS[name];
  if (!rec) return null;
  const path = new Path2D(rec.d);
  pathCache.set(name, path);
  return path;
}

function roundRect(ctx, x, y, w, h, r) {
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

export function hasIcon(name) {
  return Boolean(ICON_PATHS[name]);
}

/**
 * Paint a monochrome glyph.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} name  key in `ICON_PATHS`
 * @param {number} cx    centre x in card pixel space
 * @param {number} cy    centre y
 * @param {number} size  bounding-box edge length
 * @param {string} color fill colour
 */
export function drawIcon(ctx, name, cx, cy, size, color) {
  const rec = ICON_PATHS[name];
  const path = getPath(name);
  if (!rec || !path) return;

  const scale = (size / VIEW_BOX) * (rec.scale || 1);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-VIEW_BOX / 2, -VIEW_BOX / 2);
  ctx.fillStyle = color;
  ctx.fill(path);
  ctx.restore();
}

/**
 * Clip the canvas to a glyph's exact silhouette, with the transform already set
 * up so the caller can paint in the icon's own 0 → 24 coordinate space.
 * Returns `true` when a matching `ctx.restore()` is required.
 */
export function clipIcon(ctx, name, cx, cy, size) {
  const rec = ICON_PATHS[name];
  const path = getPath(name);
  if (!rec || !path) return false;

  const scale = (size / VIEW_BOX) * (rec.scale || 1);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-VIEW_BOX / 2, -VIEW_BOX / 2);
  ctx.clip(path);
  return true;
}

/**
 * Paint a glyph knocked out of a solid rounded plate — the "app icon" look used
 * by the corner badge and by the Xiaomi / Kuaishou brand plates.
 */
export function drawIconPlate(ctx, name, cx, cy, size, plateColor, inkColor, radius) {
  drawRaisedPlate(ctx, cx, cy, size, plateColor, radius);
  drawIcon(ctx, name, cx, cy, size * 0.64, inkColor);
}

/** Shallow enamel tile: shaded side wall, soft contact shadow and upper bevel. */
export function drawRaisedPlate(ctx, cx, cy, size, color, radius = size * 0.24) {
  const half = size / 2;
  const depth = Math.max(2, size * 0.028);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = size * 0.07;
  ctx.shadowOffsetY = depth * 2;
  roundRect(ctx, cx - half, cy - half + depth, size, size, radius);
  ctx.fillStyle = '#0a0d12';
  ctx.fill();
  ctx.shadowBlur = ctx.shadowOffsetY = 0;
  roundRect(ctx, cx - half, cy - half, size, size, radius);
  ctx.fillStyle = color;
  ctx.fill();
  const light = ctx.createLinearGradient(cx, cy - half, cx, cy + half);
  light.addColorStop(0, 'rgba(255,255,255,0.19)');
  light.addColorStop(0.42, 'rgba(255,255,255,0.02)');
  light.addColorStop(1, 'rgba(0,0,0,0.23)');
  ctx.fillStyle = light;
  ctx.fill();
  ctx.lineWidth = Math.max(1, size * 0.006);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.stroke();
  ctx.restore();
}
