/**
 * Full-screen theatre-curtain preloader.
 *
 * The markup ships in `index.html` so the closed curtain paints before any
 * module is parsed. It only opens once the scene reports that every texture,
 * shader program and Act II board is ready — so the first interaction after the
 * reveal is already smooth.
 *
 * Reveal choreography:
 *   1. the 3D stage fades up *behind* the still-closed curtain,
 *   2. the two velvet panels part to both sides while the playbill fades out,
 *   3. the element is removed from the DOM.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class Preloader {
  constructor({ minDuration = 900 } = {}) {
    this.el = document.getElementById('preloader');
    this.bar = this.el?.querySelector('.preloader__bar i');
    this.count = this.el?.querySelector('.preloader__count');
    this.status = this.el?.querySelector('.preloader__status');
    this.value = 0;
    this.startedAt = performance.now();
    this.minDuration = minDuration;
    this.finished = false;
  }

  /** Monotonic progress; `label` narrates the current build step. */
  setProgress(value, label) {
    const next = Math.max(this.value, Math.min(1, Number(value) || 0));
    this.value = next;
    if (this.bar) this.bar.style.width = `${(next * 100).toFixed(1)}%`;
    if (this.count) this.count.textContent = `${String(Math.round(next * 100)).padStart(2, '0')}%`;
    if (label && this.status && this.status.textContent !== label) this.status.textContent = label;
  }

  async finish() {
    if (this.finished) return;
    this.finished = true;

    const elapsed = performance.now() - this.startedAt;
    if (elapsed < this.minDuration) await sleep(this.minDuration - elapsed);

    this.setProgress(1, '准备就绪');
    await sleep(200);

    // Light the stage while the curtain still hides it.
    document.body.classList.add('is-ready');
    await sleep(240);

    // Curtain up.
    if (!this.el) return;
    this.el.classList.add('is-leaving');
    await sleep(1700);
    this.el.remove();
    this.el = null;
  }
}
