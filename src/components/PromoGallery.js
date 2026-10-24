export function renderPromoGallery(book) {
  if (!book.films?.length) return '';
  return '<div class="promo-gallery" data-film-book="' + book.id + '">' + book.films.map((film, index) =>
    '<div class="promo-screen" data-film-index="' + index + '" data-orientation="' + film.orientation + '">' +
    '<img src="' + film.poster + '" alt="' + film.title + '" loading="lazy"></div>').join('') + '</div>';
}

export class PromoGallery {
  constructor(root, books, { onClose, onActivate, onScroll, initiallyActivated = false } = {}) {
    this.root = root;
    this.books = books;
    this.onClose = onClose;
    this.onActivate = onActivate;
    this.onScroll = onScroll;
    this.frames = new Map();
    this.ratios = new Map();
    this.enabled = false;
    this.activated = initiallyActivated;
    this.soundEnabled = true;
    this.onMessage = event => {
      if (event.origin !== location.origin) return;
      const current = [...this.frames].find(([, frame]) => frame.contentWindow === event.source);
      if (!current) return;
      if (event.data?.type === 'portfolio-film-ready') {
        const [screen, frame] = current;
        frame.dataset.ready = 'true';
        frame.removeAttribute('aria-hidden');
        frame.tabIndex = 0;
        screen.dataset.playerReady = 'true';
        this.syncFrame(screen, frame);
      }
      if (event.data?.type === 'portfolio-film-state') current[0].dataset.playing = String(event.data.playing);
      if (event.data?.type === 'portfolio-film-renderer') {
        current[0].dataset.renderer = event.data.backend;
        current[0].dataset.renderBuffer = `${event.data.width}x${event.data.height}`;
      }
      if (event.data?.type === 'portfolio-film-interaction') this.activate();
      if (event.data?.type === 'portfolio-film-close') this.onClose?.(2);
      if (event.data?.type === 'portfolio-film-scroll' && Number.isFinite(event.data.deltaY)) {
        this.onScroll?.(event.data.deltaY, event.data.deltaMode);
      }
    };
    this.onActivateEvent = event => {
      if (!event.target?.closest?.('[data-sound-toggle]')) this.activate();
    };
    this.onVisibility = () => this.updateVisible(true);
    window.addEventListener('message', this.onMessage);
    window.addEventListener('pointerdown', this.onActivateEvent, { capture: true });
    window.addEventListener('keydown', this.onActivateEvent, { capture: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) this.ratios.set(entry.target, entry.intersectionRatio);
      this.updateVisible();
    }, { root: root.parentElement, threshold: [0, 0.2, 0.5, 0.75, 1] });
    root.querySelectorAll('.promo-screen').forEach(screen => this.observer.observe(screen));
  }

  activate() {
    this.onActivate?.();
    if (this.activated) return;
    this.activated = true;
    for (const frame of this.frames.values()) this.send(frame, { type: 'portfolio-film-activate' });
  }

  setSoundState(state) {
    const enabled = !state.muted;
    const activated = this.activated || state.hasInteraction;
    const interacted = Boolean(state.hasInteraction);
    if (enabled === this.soundEnabled && activated === this.activated && interacted === this.hasUserInteraction) return;
    this.hasUserInteraction = interacted;
    this.soundEnabled = enabled; this.activated = activated;
    for (const frame of this.frames.values()) this.send(frame, { type: 'portfolio-film-sound', enabled, activated });
  }

  send(frame, message) {
    if (frame?.dataset.loaded === 'true' || frame?.dataset.ready === 'true') {
      frame.contentWindow.postMessage(message, location.origin);
    }
  }

  syncFrame(screen, frame) {
    this.send(frame, { type: 'portfolio-film-sound', enabled: this.soundEnabled, activated: this.activated });
    this.send(frame, { type: 'portfolio-film-visibility', visible: this.enabled && this.currentScreen === screen && !document.hidden, activated: this.activated });
  }

  updateVisible(force = false) {
    let selected = null;
    let bestRatio = 0.2;
    if (this.enabled && !document.hidden) {
      for (const [screen, ratio] of this.ratios) if (ratio > bestRatio) { selected = screen; bestRatio = ratio; }
    }
    if (selected && !this.frames.has(selected) && performance.now() < (this.deferMountUntil || 0)) selected = null;
    if (selected === this.currentScreen && !force) return;
    this.currentScreen = selected;
    if (selected) this.mount(selected);
    for (const [screen, frame] of this.frames) this.send(frame, {
      type: 'portfolio-film-visibility', visible: screen === selected, activated: this.activated
    });
  }

  deferNewPlayer(milliseconds = 450) {
    this.deferMountUntil = performance.now() + milliseconds;
    clearTimeout(this.deferTimer);
    this.deferTimer = setTimeout(() => this.updateVisible(true), milliseconds);
  }

  mount(screen) {
    if (this.frames.has(screen)) return;
    const book = this.books.find(book => book.id === screen.closest('.promo-gallery').dataset.filmBook);
    const film = book.films[Number(screen.dataset.filmIndex)];
    const frame = document.createElement('iframe');
    frame.src = film.src;
    frame.title = film.title + '，进入视线自动播放，点击画面暂停或播放';
    frame.allow = 'autoplay';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.onload = () => {
      frame.dataset.loaded = 'true';
      // Keep the poster until the child has fonts, images and a painted first frame.
      this.syncFrame(screen, frame);
    };
    screen.append(frame);
    this.frames.set(screen, frame);
  }

  stopOutsideBook() {
    this.enabled = true;
    this.updateVisible();
  }

  stop() {
    clearTimeout(this.deferTimer);
    this.enabled = false;
    this.updateVisible(true);
  }

  destroy() {
    this.stop();
    this.observer.disconnect();
    window.removeEventListener('message', this.onMessage);
    window.removeEventListener('pointerdown', this.onActivateEvent, { capture: true });
    window.removeEventListener('keydown', this.onActivateEvent, { capture: true });
    document.removeEventListener('visibilitychange', this.onVisibility);
    for (const frame of this.frames.values()) { frame.onload = null; frame.remove(); }
  }
}
