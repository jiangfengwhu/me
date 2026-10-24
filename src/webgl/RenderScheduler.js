/** Run a bounded burst for interaction, then submit no frames until invalidated. */
export class RenderScheduler {
  constructor(render, {
    now = () => performance.now(), request = callback => requestAnimationFrame(callback),
    cancel = handle => cancelAnimationFrame(handle), hidden = () => document.hidden,
    onState = () => {}
  } = {}) {
    Object.assign(this, { render, now, request, cancel, hidden, onState });
    this.frame = null;
    this.until = 0;
    this.count = 0;
    this.tick = time => {
      this.frame = null;
      if (this.hidden()) { this.setState('hidden'); return; }
      this.render(time);
      this.count++;
      if (this.now() < this.until) this.queue();
      else if (this.frame === null) this.setState('idle');
    };
    this.setState('idle');
  }
  setState(state) {
    if (state !== this.state) { this.state = state; this.onState(state, this.count); }
  }
  queue() { if (this.frame === null) this.frame = this.request(this.tick); }
  wake(duration = 900) {
    if (this.hidden()) { this.setState('hidden'); return; }
    this.until = Math.max(this.until, this.now() + duration);
    this.setState('active'); this.queue();
  }
  sleep() {
    if (this.frame !== null) this.cancel(this.frame);
    this.frame = null;
    this.until = this.now();
    this.setState(this.hidden() ? 'hidden' : 'idle');
  }
}
