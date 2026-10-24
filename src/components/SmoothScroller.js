/** Accumulate wheel input into a continuous, time-based scroll position. */
export class SmoothScroller {
  constructor(element, {
    now = () => performance.now(), request = callback => requestAnimationFrame(callback),
    cancel = handle => cancelAnimationFrame(handle)
  } = {}) {
    Object.assign(this, { element, now, request, cancel });
    this.target = element.scrollTop;
    this.position = element.scrollTop;
    this.frame = null;
    this.tick = time => {
      this.frame = null;
      const dt = Math.min(50, Math.max(1, time - this.lastTime));
      this.lastTime = time;
      // Keep subpixel progress independent of browser scrollTop rounding.
      const current = this.position;
      const remaining = this.target - current;
      if (Math.abs(remaining) < 0.5) { this.position = this.target; this.element.scrollTop = this.target; return; }
      this.position = current + remaining * (1 - Math.exp(-dt / 85));
      this.element.scrollTop = this.position;
      this.frame = this.request(this.tick);
    };
  }
  clamp(value) { return Math.max(0, Math.min(value, this.element.scrollHeight - this.element.clientHeight)); }
  to(value) {
    this.target = this.clamp(value);
    if (this.frame === null) { this.position = this.element.scrollTop; this.lastTime = this.now(); this.frame = this.request(this.tick); }
  }
  by(delta) {
    if (this.frame === null) this.target = this.element.scrollTop;
    this.to(this.target + delta);
  }
  stop() {
    if (this.frame !== null) this.cancel(this.frame);
    this.frame = null; this.position = this.target = this.element.scrollTop;
  }
  jumpTo(value) { this.stop(); this.element.scrollTop = this.clamp(value); this.position = this.target = this.element.scrollTop; }
}
