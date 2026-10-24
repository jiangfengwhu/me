/**
 * ============================================================================
 * MAIN APPLICATION CONTROLLER — 3D BULLETIN BOARD & STRIPE PRESS PORTFOLIO
 * ============================================================================
 * 1. Pure edge-to-edge 3D viewport (no top or bottom indicator bars).
 * 2. Act I (`#/act-1`): Sleek 3D Bulletin Board (`公告栏`) with smooth glossy
 *    Bento cards, diagonal studio lighting, hover-activated spotlight, and
 *    3D Saber Avatar Mascot that follows the focused card.
 * 3. Act II (`#/act-2` & `#/work/:id`): Smooth glossy 3D Bookshelf + Stripe
 *    Press Secondary Detail Route with full-screen continuous scroll hotzone.
 * 4. Unified Continuous Scroll:
 *    - Act I ↔ Act II Work #1 ↔ Work #2 ... ↔ Work #7.
 *    - Scrolling UP at Work #1 (either on the Bookshelf or at the top of
 *      Detail Route) seamlessly transitions back to Act I.
 *    - Scrolling anywhere on screen in Detail Route scrolls the detail list
 *      and switches active 3D books.
 * ============================================================================
 */

import { PROFILE, BOOKS, SOCIAL_LINKS } from './data/portfolioConfig.js';
import { NightStreetScene } from './webgl/NightStreetScene.js';
import { PromoGallery, renderPromoGallery } from './components/PromoGallery.js';
import { Preloader } from './components/Preloader.js';
import { sound } from './audio/boot.js';
import { SmoothScroller } from './components/SmoothScroller.js';
import { WorkHistory } from './navigation/WorkHistory.js';

class AppController {
  constructor() {
    this.books = [...BOOKS];
    this.currentActProgress = 0;
    this.focusedShelfIndex = 0;
    this.isDetailOpen = false;
    this.suppressScrollSync = false;
    this.navigation = new WorkHistory();
    this.detailRequest = 0;

    this.sound = sound;
    this.cacheDOM();
    this.scrollMotion = new SmoothScroller(this.detailsScrollContainer);
    this.renderDetailRouteDOM();
    this.initScene();
    this.bindUIEvents();
    this.syncFromHash(true);
  }

  cacheDOM() {
    this.stageEl = document.getElementById('street-webgl-stage');

    // Stripe Press Secondary Detail Route
    this.detailRouteEl = document.getElementById('stripe-detail-route');
    this.detailsScrollContainer = document.getElementById('press-details-scroll-container');
    this.detailsListInner = document.getElementById('press-details-list-inner');

    // Material Lab Panel
    this.controlPanel = document.getElementById('press-control-panel');
    this.btnCloseMaterial = document.getElementById('btn-close-material');

    // Mock Modal
    this.mockModal = document.getElementById('mock-book-modal');
    this.btnCloseMockModal = document.getElementById('btn-close-mock-modal');
    this.mockForm = document.getElementById('mock-book-form');
  }

  initScene() {
    this.scene = new NightStreetScene({
      container: this.stageEl,
      profile: PROFILE,
      socialLinks: SOCIAL_LINKS,
      books: this.books,
      sound: this.sound,
      onActProgressChange: (progress) => this.handleActProgressChange(progress),
      onShelfFocusChange: (index, book) => this.handleShelfFocusChange(index, book),
      onSelectBook: (index) => this.openDetailRoute(index),
      onDetailActiveChange: (index, book) => this.handleDetailActiveHighlight(index, book)
    });

    window.__nightStreetScene = this.scene;
    window.__appController = this;
  }

  /**
   * Product summaries occupy the right half, one viewport per work.
   * The original 3D books remain in the left half.
   */
  renderDetailRouteDOM() {
    this.promoGallery?.destroy();
    this.detailMetrics = null;
    this.detailsListInner.innerHTML = this.books.map((book, idx) => {
      const accent = book.palette.accentHex || book.palette.foilColor || '#f59e0b';
      const features = book.productFeatures || [];
      return `<article class="PressHomepageBookDetails ${idx === 0 ? 'is-active' : ''} ${book.films?.length ? 'has-' + book.films[0].orientation + '-film' : ''}"
        data-book-index="${idx}" data-book-id="${book.id}" style="--book-accent: ${accent}">
        ${renderPromoGallery(book)}
        <div class="detail-copy">
          <div class="detail-edition-kicker">${book.volume} / PRODUCT</div>
          <h2 class="detail-book-title">${book.title}</h2>
          <p class="detail-product-description">${book.productDescription || book.tagline || book.subtitle}</p>
          ${features.length ? '<ul class="detail-product-features">' + features.map(text => '<li>' + text + '</li>').join('') + '</ul>' : ''}
          <div class="detail-product-links">
            <a href="${book.liveUrl}" target="_blank" rel="noopener noreferrer">体验产品 ↗</a>
            <a href="${book.repoUrl}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div>
        </div>
      </article>`;
    }).join('');
    this.promoGallery = new PromoGallery(this.detailsListInner, this.books, {
      initiallyActivated: this.sound.audioCtx?.state === 'running' || this.sound.hasInteraction,
      onClose: targetAct => this.closeDetailRoute(targetAct),
      onActivate: () => { if (!this.sound.muted) this.sound.unlock(); },
      onScroll: (delta, mode) => this.scrollDetailBy(delta, mode)
    });
    this.unsubscribeSound?.();
    this.unsubscribeSound = this.sound.subscribe(state => this.promoGallery.setSoundState(state));
  }

  measureDetailSections(refresh = false) {
    if (this.detailMetrics && !refresh) return this.detailMetrics;
    const articles = Array.from(
      this.detailsListInner.querySelectorAll('.PressHomepageBookDetails')
    );
    this.detailMetrics = articles.map((el) => ({
      top: el.offsetTop,
      height: el.offsetHeight
    }));
    return this.detailMetrics;
  }

  openDetailRoute(index) {
    if (index < 0 || index >= this.books.length) return;
    this.navigation.enterWork(this.books[index].id);
    this.lastSyncedHash = window.location.hash;
    const request = ++this.detailRequest;

    this.isDetailOpen = true;
    this.promoGallery.deferNewPlayer();
    this.detailRouteEl.classList.add('is-active');

    requestAnimationFrame(() => {
      if (!this.isDetailOpen || request !== this.detailRequest) return;
      const metrics = this.measureDetailSections();
      const targetMetric = metrics[index] || { top: 0 };
      const targetScrollTop = index === 0 ? 0 : targetMetric.top;

      this.suppressScrollSync = true;
      this.scrollMotion.jumpTo(targetScrollTop);

      this.scene.setDetailSectionMetrics(metrics, targetScrollTop);
      this.scene.enterDetailRoute(index, metrics);
      this.handleDetailActiveHighlight(index, this.books[index]);

      setTimeout(() => {
        this.suppressScrollSync = false;
      }, 80);
    });
  }

  scrollToDetailSection(index, smooth = true) {
    const metrics = this.measureDetailSections();
    const targetMetric = metrics[index];
    if (!targetMetric) return;

    const targetScrollTop = index === 0 ? 0 : targetMetric.top;
    if (smooth) this.scrollMotion.to(targetScrollTop);
    else this.scrollMotion.jumpTo(targetScrollTop);
  }

  closeDetailRoute(targetAct = 2, { fromHistory = false } = {}) {
    if (!this.isDetailOpen) return;
    this.promoGallery.stop();
    this.scrollMotion.stop();
    this.isDetailOpen = false;
    this.detailRequest++;
    this.detailRouteEl.classList.remove('is-active');
    this.scene.exitDetailRoute();
    if (!fromHistory && !this.navigation.backToShelf()) {
      this.scene.transitionToAct(2);
      this.lastSyncedHash = '#/act-2';
    }
  }

  handleActProgressChange(progress) {
    this.currentActProgress = progress;
  }

  scrollDetailBy(delta, mode = 0) {
    if (!this.isDetailOpen || !Number.isFinite(delta)) return;
    const scroller = this.detailsScrollContainer;
    const pixels = delta * (mode === 1 ? 16 : mode === 2 ? scroller.clientHeight : 1);
    if (scroller.scrollTop <= 12 && this.scrollMotion.target <= 12 && pixels < -4) {
      this.closeDetailRoute(2);
      return;
    }
    this.scrollMotion.by(pixels * (mode === 2 ? 1 : 1.15));
  }

  handleShelfFocusChange(index, book) {
    this.focusedShelfIndex = index;
  }

  handleDetailActiveHighlight(index, book) {
    this.promoGallery.stopOutsideBook(book?.id);
    this.focusedShelfIndex = index;
    this.detailsListInner.querySelectorAll('.PressHomepageBookDetails').forEach((art, idx) => {
      art.classList.toggle('is-active', idx === index);
    });

    if (book && this.isDetailOpen) {
      this.navigation.replaceWork(book.id);
      this.lastSyncedHash = window.location.hash;
    }
  }

  bindUIEvents() {
    this.detailsListInner.addEventListener('pointerover', event => {
      const target = event.target.closest('a, .promo-screen');
      if (target && !target.contains(event.relatedTarget)) this.sound.playSpineHover(this.focusedShelfIndex);
    });
    new ResizeObserver(() => {
      if (!this.isDetailOpen) return;
      const metrics = this.measureDetailSections(true);
      this.scrollMotion.jumpTo(metrics[this.focusedShelfIndex]?.top || 0);
      this.scene.setDetailSectionMetrics(metrics, this.detailsScrollContainer.scrollTop);
    }).observe(this.detailsScrollContainer);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.scrollMotion.stop(); });
    this.detailsScrollContainer.addEventListener('pointerdown', () => this.scrollMotion.stop(), { passive: true });

    // Continuous Vertical Scroll inside Secondary Detail Route (`onDetailRouteScroll`)
    this.detailsScrollContainer.addEventListener(
      'scroll',
      () => {
        if (!this.isDetailOpen || this.suppressScrollSync) return;
        if (this.detailScrollFrame) return;
        this.detailScrollFrame = requestAnimationFrame(() => {
          this.detailScrollFrame = null;
          if (!this.isDetailOpen || this.suppressScrollSync) return;
          this.scene.onDetailRouteScroll(this.detailsScrollContainer.scrollTop, this.detailsScrollContainer.clientHeight);
        });
      },
      { passive: true }
    );

    /**
     * Requirement 6:
     * Fast, responsive full-screen scroll hotzone in Detail Route +
     * Continuous scroll-linked 3D book switching +
     * Scroll UP at Work #1 returns to the Act II shelf.
     */
    window.addEventListener(
      'wheel',
      (e) => {
        if (!this.isDetailOpen) return;
        if (e.target.closest('#mock-book-modal, .PressHomepageControlPanel')) return;

        e.preventDefault();
        this.scrollDetailBy(e.deltaY, e.deltaMode);
      },
      { passive: false }
    );

    // Keyboard shortcuts (`/` for Material Panel, `Escape` to exit Detail Route, Arrows to switch books)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '/') {
        e.preventDefault();
        this.controlPanel.classList.toggle('is-hidden');
      } else if (e.key === 'Escape') {
        if (!this.controlPanel.classList.contains('is-hidden')) {
          this.controlPanel.classList.add('is-hidden');
        } else if (this.mockModal.classList.contains('is-open')) {
          this.mockModal.classList.remove('is-open');
        } else if (this.isDetailOpen) {
          this.closeDetailRoute(2);
        }
      } else if (this.isDetailOpen) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          e.preventDefault();
          this.scrollDetailBy(1, 2);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault();
          if (this.detailsScrollContainer.scrollTop <= 10) {
            this.closeDetailRoute(2);
          } else {
            this.scrollDetailBy(-1, 2);
          }
        }
      } else if (!this.isDetailOpen && this.currentActProgress >= 0.8) {
        if (e.key === 'ArrowDown') {
          const nextIdx = Math.min(this.books.length - 1, this.focusedShelfIndex + 1);
          this.scene.focusShelfBook(nextIdx);
        } else if (e.key === 'ArrowUp') {
          if (this.focusedShelfIndex > 0) {
            this.scene.focusShelfBook(this.focusedShelfIndex - 1);
          } else {
            window.history.replaceState(null, '', '#/act-1');
            this.scene.transitionToAct(1);
          }
        } else if (e.key === 'Enter') {
          this.openDetailRoute(this.focusedShelfIndex);
        }
      }
    });

    // Material Lab Panel Controls
    if (this.btnCloseMaterial) {
      this.btnCloseMaterial.addEventListener('click', () => {
        this.controlPanel.classList.add('is-hidden');
      });
    }

    const bindSlider = (inputId, valId, paramKey) => {
      const input = document.getElementById(inputId);
      const valEl = document.getElementById(valId);
      if (!input || !valEl) return;
      input.addEventListener('input', () => {
        const num = parseFloat(input.value);
        valEl.textContent = num.toFixed(2);
        this.scene.updateMaterialParams({ [paramKey]: num });
      });
    };

    bindSlider('cp-wall-roughness', 'val-wall-roughness', 'wallRoughness');
    bindSlider('cp-book-roughness', 'val-book-roughness', 'bookRoughness');
    bindSlider('cp-lamp-intensity', 'val-lamp-intensity', 'lampIntensity');

    // Mock Book Modal
    if (this.btnCloseMockModal) {
      this.btnCloseMockModal.addEventListener('click', () => {
        this.mockModal.classList.remove('is-open');
      });
    }

    if (this.mockForm) {
      this.mockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('mock-title').value.trim();
        const category = document.getElementById('mock-category').value.trim();
        const subtitle = document.getElementById('mock-subtitle').value.trim();
        const liveUrl = document.getElementById('mock-url').value.trim();
        const hex = document.getElementById('mock-color').value;
        const synopsis = document.getElementById('mock-synopsis').value.trim();

        const nextVol = `VOL. 0${this.books.length + 1}`;
        const newBook = {
          id: `custom-work-${Date.now()}`,
          volume: nextVol,
          edition: 'CUSTOM EDITION · 2026',
          title,
          subtitle,
          spineTitle: `${title} — ${subtitle.slice(0, 14)}`,
          author: 'JIANG FENG',
          year: '2026',
          category,
          liveUrl: liveUrl || 'https://github.com/jiangfengwhu',
          repoUrl: 'https://github.com/jiangfengwhu',
          coverImage: '/assets/covers/cover-vibe.png',
          dimensions: { width: 22.0, height: 28.8, thickness: 3.0 },
          palette: {
            coverBg: hex,
            coverSecondary: '#f8fafc',
            spineBg: hex,
            spineText: '#ffffff',
            foilColor: '#fde047',
            pageEdge: '#f4f1ea',
            accentHex: hex
          },
          synopsis: [
            synopsis || '通过前端可扩展作品引擎动态挂载至 3D 书架墙的自定义典藏书卷。'
          ],
          highlights: [
            '光滑高清漆 (Clearcoat) 反光硬壳书材质与对角光影反射',
            '自动同步至 Stripe Press 二级详情路由页，支持全屏连续滚动切换与 360° 拖拽翻转'
          ],
          techStack: [category, 'Three.js Physical Clearcoat', 'GSAP Cinema Rig'],
          metrics: [
            { label: 'EDITION', value: nextVol },
            { label: 'RENDERER', value: 'Three.js WebGL 2' },
            { label: 'STATUS', value: 'Live Mounted' }
          ],
          praise: []
        };

        this.books.push(newBook);
        this.renderDetailRouteDOM();
        this.scene.appendBook(newBook);
        this.mockModal.classList.remove('is-open');
        this.mockForm.reset();
        this.scene.transitionToAct(2);
      });
    }

    window.addEventListener('hashchange', () => this.syncFromHash());
    window.addEventListener('popstate', () => this.syncFromHash());
  }

  syncFromHash(immediate = false) {
    const hash = window.location.hash || '#/act-1';
    if (!immediate && hash === this.lastSyncedHash) return;
    this.lastSyncedHash = hash;
    if (hash.startsWith('#/work/')) {
      const workId = hash.replace('#/work/', '');
      const idx = this.books.findIndex((b) => b.id === workId || b.legacyIds?.includes(workId));
      if (idx >= 0) {
        this.openDetailRoute(idx);
      }
    } else if (hash === '#/act-2') {
      if (this.isDetailOpen) this.closeDetailRoute(2, { fromHistory: true });
      this.scene.transitionToAct(2, immediate);
    } else if (hash === '#/act-2-hover') {
      if (this.isDetailOpen) this.closeDetailRoute(2, { fromHistory: true });
      this.scene.transitionToAct(2, immediate);
      const book = this.scene.books[0];
      if (book) {
        this.scene.hoveredBook = book;
        this.scene.focusShelfBook(0);
      }
    } else if (hash === '#/act-1-hover') {
      if (this.isDetailOpen) this.closeDetailRoute(1, { fromHistory: true });
      this.scene.transitionToAct(1, immediate);
      const card = this.scene.plaques[0];
      if (card) {
        this.scene.hoveredPlaque = card;
        card.cardTex.setHovered(true);
        this.scene.focusedPlaqueIndex = 0;
        this.scene.smoothPointer.set(0.35, -0.25);
      }
    } else if (hash === '#/act-1') {
      if (this.isDetailOpen) this.closeDetailRoute(1, { fromHistory: true });
      this.scene.transitionToAct(1, immediate);
    }
  }
}

/**
 * Boot sequence.
 *
 * The preloader markup paints with the very first HTML, so the visitor never
 * sees a blank screen. The heavy work — Act II boards, kraft paper textures,
 * shader programs, GPU uploads — happens *behind* the curtain, and only when the scene
 * reports 100% does the curtain slide up and the 3D stage fade in. That way the
 * first interaction after the reveal is already smooth.
 */
async function boot() {
  const preloader = new Preloader({ minDuration: 900 });
  preloader.setProgress(0.02, '正在准备 3D 场景');

  let app;
  try {
    app = new AppController();
  } catch (error) {
    console.error('Unable to initialise portfolio:', error);
    await preloader.finish();
    return;
  }

  try {
    await app.scene.warmup((value, label) => preloader.setProgress(value, label));
  } catch (error) {
    console.error('Scene warmup failed, revealing anyway:', error);
  }

  await preloader.finish();
  app.scene.motionReady = true;
  app.scene.syncBulletinMotion();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
