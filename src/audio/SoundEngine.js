/**
 * Default-on sounds.
 *
 * Browsers only allow an AudioContext to start after a real user gesture
 * (`pointerdown` / `keydown` / `click` …), so a page that is opened for the
 * first time is silent until that gesture happens. That is a platform rule, not
 * something the page can bypass. What this engine guarantees:
 *
 * 1. If the browser *does* allow autoplay (`navigator.getAutoplayPolicy`), the
 *    context is started immediately and sound is audible on first paint.
 * 2. Otherwise the context is only created inside the very first gesture, which
 *    is the most reliable unlock path across Chrome / Safari / Firefox, and the
 *    very first gesture of *any* kind unlocks it.
 * 3. Unlocking never caches a pending `resume()` promise, so a resume that was
 *    swallowed by the browser (e.g. after a tab switch) can never dead-lock the
 *    engine — the next gesture always retries.
 */
export class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.output = null;
    this.volume = 3.5;
    this.enabled = true;
    this.muted = false;
    this.hasInteraction = false;
    this.autoplayGranted = false;
    this.hasUnlockCue = false;
    this.resuming = false;
    this.effectsPlayed = 0;
    this.lastHoverTime = -Infinity;
    this.lastTransitionTime = -Infinity;
    this.listeners = new Set();

    this.onUserInteraction = () => {
      if (this.muted) return;
      this.unlock();
    };
    // Every event browsers accept as "user activation" — unlocking on the first
    // one that arrives means a scroll-free visit (keyboard, trackpad tap, wheel
    // click) unlocks just as reliably as a mouse click on the canvas.
    for (const type of ['pointerdown', 'pointerup', 'touchend', 'mousedown', 'keydown', 'click']) {
      window.addEventListener(type, this.onUserInteraction, { capture: true, passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      if (!this.audioCtx) return;
      if (document.hidden) this.audioCtx.suspend().catch(() => {});
      else if ((this.hasInteraction || this.autoplayGranted) && !this.muted) this.unlock({ feedback: false });
    });

    // Start right away only when the browser has already granted autoplay.
    this.supported = Boolean(window.AudioContext || window.webkitAudioContext);
    if (this.supported && this.autoplayPolicy() === 'allowed') this.startAutoplay();
  }

  /** `'allowed' | 'allowed-muted' | 'disallowed' | 'unknown'` */
  autoplayPolicy() {
    try {
      return navigator.getAutoplayPolicy?.('audiocontext') || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  subscribe(listener) {
    this.listeners.add(listener); listener(this.state());
    return () => this.listeners.delete(listener);
  }
  state() {
    const context = this.audioCtx?.state || 'uninitialized';
    return {
      enabled: this.enabled, muted: this.muted, hasInteraction: this.hasInteraction,
      context, running: context === 'running', supported: this.supported,
      // `locked` is what the UI needs: sound is wanted but the browser has not
      // handed over the audio device yet.
      locked: this.supported && !this.muted && this.enabled && context !== 'running',
      effectsPlayed: this.effectsPlayed
    };
  }
  publish() { for (const listener of this.listeners) listener(this.state()); }
  countEffect() { this.effectsPlayed++; this.publish(); }

  ensureContext() {
    if (this.audioCtx && this.audioCtx.state !== 'closed') return this.audioCtx;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    this.audioCtx = new Context({ latencyHint: 'interactive' });
    this.output = this.audioCtx.createGain();
    this.output.gain.value = this.volume;
    this.output.connect(this.audioCtx.destination);
    this.audioCtx.onstatechange = () => {
      const state = this.audioCtx?.state;
      if (state === 'running' && !this.hasInteraction) this.autoplayGranted = true;
      this.publish();
      // Recover from a browser-initiated interruption (tab switch, audio device
      // change) without ever stacking resume() calls.
      if (state === 'suspended' && !this.resuming && !this.muted && !document.hidden
        && (this.hasInteraction || this.autoplayGranted)) {
        this.resuming = true;
        this.audioCtx.resume().catch(() => {}).finally(() => { this.resuming = false; });
      }
    };
    return this.audioCtx;
  }

  /** Autoplay is pre-granted: start the graph without waiting for a gesture. */
  startAutoplay() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const mark = () => {
      if (ctx.state === 'running' && !this.hasInteraction) this.autoplayGranted = true;
      this.publish();
    };
    if (ctx.state === 'running') { mark(); return; }
    // Outside a gesture this promise may stay pending forever — that is fine
    // because nothing is waiting on it and it is never cached.
    ctx.resume().then(mark).catch(() => {});
  }

  /**
   * Called from any user gesture. Creates the context inside the gesture (the
   * only path that is reliable on iOS Safari) and resumes it.
   */
  unlock({ feedback = true } = {}) {
    this.hasInteraction = true;
    const ctx = this.ensureContext();
    if (!ctx) return Promise.resolve(false);
    this.muted = false;

    const ready = () => {
      if (ctx.state !== 'running') { this.publish(); return false; }
      this.enabled = true;
      if (feedback && !this.hasUnlockCue) {
        this.hasUnlockCue = true;
        this.playTick(520);
      } else {
        this.publish();
      }
      return true;
    };

    if (ctx.state === 'running') return Promise.resolve(ready());
    // Deliberately not memoised: a swallowed resume must not block later gestures.
    return ctx.resume().then(ready).catch(() => { this.publish(); return false; });
  }

  mute() {
    this.muted = true; this.enabled = false;
    this.audioCtx?.suspend().catch(() => {});
    this.publish();
  }

  /**
   * The button means "sound on/off" from the user's point of view. While the
   * context is still locked it must unlock instead of muting, otherwise the
   * first click on the button silences a page that never had sound to begin with.
   */
  toggle() {
    const running = this.audioCtx?.state === 'running';
    if (!running || !this.enabled || this.muted) return this.unlock();
    this.mute();
    return Promise.resolve();
  }

  canPlay() { return this.enabled && !this.muted && !document.hidden && this.audioCtx?.state === 'running'; }

  playTransition(direction = 1) {
    if (!this.canPlay()) return;
    const time = performance.now();
    if (time - this.lastTransitionTime < 240) return;
    this.lastTransitionTime = time;
    const ctx = this.audioCtx, now = ctx.currentTime;
    this.transitionBuffer ||= (() => {
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.26), ctx.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      return buffer;
    })();
    const source = ctx.createBufferSource(); source.buffer = this.transitionBuffer;
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.Q.value = 0.65;
    filter.frequency.setValueAtTime(direction > 0 ? 650 : 1800, now);
    filter.frequency.exponentialRampToValueAtTime(direction > 0 ? 1800 : 500, now + 0.24);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    source.connect(filter); filter.connect(gain); gain.connect(this.output);
    source.start(now); source.stop(now + 0.26);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    this.countEffect();
  }

  playTick(freq = 680) {
    if (!this.canPlay()) return;
    const ctx = this.audioCtx, now = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.045);
    gain.gain.setValueAtTime(0.025, now); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    osc.connect(gain); gain.connect(this.output); osc.start(now); osc.stop(now + 0.05);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    this.countEffect();
  }

  playSpineHover(index = 0) {
    if (!this.canPlay()) return;
    const time = performance.now();
    if (time - this.lastHoverTime < 100) return;
    this.lastHoverTime = time;
    const scale = [220, 246.94, 277.18, 329.63, 369.99, 440, 493.88, 554.37];
    const freq = scale[index % scale.length], ctx = this.audioCtx, now = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.04, now + 0.09);
    gain.gain.setValueAtTime(0.025, now); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
    osc.connect(gain); gain.connect(this.output); osc.start(now); osc.stop(now + 0.12);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    this.countEffect();
  }

  playBookOpen() { if (this.canPlay()) this.playChord([196, 293.66, 392, 493.88], 0.42); }
  playChord(freqs, duration = 0.35) {
    if (!this.canPlay()) return;
    const ctx = this.audioCtx, now = ctx.currentTime;
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = index % 2 ? 'triangle' : 'sine'; osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now); gain.gain.linearRampToValueAtTime(0.032 / freqs.length, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain); gain.connect(this.output); osc.start(now); osc.stop(now + duration + 0.02);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
    this.countEffect();
  }
}
