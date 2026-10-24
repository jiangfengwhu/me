(() => {
  const film = document.getElementById('film');
  const audio = document.getElementById('om-sound');
  const timeline = window.__timelines?.film;
  if (!timeline || !audio || !film) return;
  const duration = timeline.duration();
  if (!Number.isFinite(duration) || duration <= 0) {
    console.error('Cannot play film: timeline duration must be a positive finite number.');
    return;
  }
  const debug = new URLSearchParams(location.search).has('debug');
  if (debug) film.dataset.duration = String(duration);
  let frame;
  let playRequest = 0;
  let visible = false;
  let manuallyPaused = false;
  let activated = false;
  let soundEnabled = true;
  let running = false;
  let prepared = false;
  let wantsPlayback = false;
  let position = 0;
  let anchorPosition = 0;
  let anchorTime = 0;
  let followingAudio = false;
  const frameInterval = 1000 / Math.min(60, Number(film.dataset.fps) || 30);
  let lastDraw = -Infinity;
  let reportedFrameError = false;
  let lastDebugUpdate = -Infinity;
  audio.loop = true;
  function currentPosition() {
    if (!running) return position;
    return followingAudio && !audio.paused ? audio.currentTime : anchorPosition + (performance.now() - anchorTime) / 1000;
  }
  function tick(now = performance.now()) {
    if (!running) return;
    if (frameInterval > 17 && now - lastDraw < frameInterval - 0.5) {
      frame = requestAnimationFrame(tick);
      return;
    }
    lastDraw = now;
    position = currentPosition();
    if (position >= duration) {
      position = 0;
      anchorPosition = 0;
      anchorTime = performance.now();
      if (!audio.paused) audio.currentTime = 0;
    }
    try {
      timeline.seek(position);
      reportedFrameError = false;
    } catch (error) {
      // A delayed canvas/image may fail for one frame; keep the playback clock alive.
      if (!reportedFrameError) console.error('Unable to draw film frame:', error);
      reportedFrameError = true;
    }
    if (debug && now - lastDebugUpdate >= 250) {
      film.dataset.position = position.toFixed(2);
      film.dataset.frameError = String(reportedFrameError);
      lastDebugUpdate = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function pause() {
    wantsPlayback = false;
    position = Math.min(currentPosition(), duration);
    running = false;
    if (debug) film.dataset.playback = 'paused';
    followingAudio = false;
    playRequest++;
    audio.pause();
    timeline.pause();
    cancelAnimationFrame(frame);
    document.body.setAttribute('aria-label', '点击画面播放宣传片');
    window.parent.postMessage({ type: 'portfolio-film-state', playing: false }, location.origin);
  }
  async function attachAudio() {
    const request = ++playRequest;
    try {
      audio.currentTime = position;
      audio.muted = !activated || !soundEnabled;
      try { await audio.play(); }
      catch (error) {
        if (request !== playRequest || !running) return;
        audio.muted = true;
        await audio.play();
      }
      if (request !== playRequest || !running) return;
      audio.currentTime = Math.min(currentPosition(), duration);
      followingAudio = true;
    } catch {
      // The picture keeps playing from its own clock if media autoplay is blocked.
      followingAudio = false;
    }
  }
  function start() {
    wantsPlayback = true;
    if (!prepared) return;
    if (running) return;
    if (position >= duration - 0.05) position = 0;
    running = true;
    if (debug) film.dataset.playback = 'playing';
    lastDraw = -Infinity;
    anchorPosition = position;
    anchorTime = performance.now();
    document.body.setAttribute('aria-label', '点击画面暂停宣传片');
    window.parent.postMessage({ type: 'portfolio-film-state', playing: true }, location.origin);
    cancelAnimationFrame(frame);
    tick();
    attachAudio();
  }
  function toggle() {
    activated = true;
    window.parent.postMessage({ type: 'portfolio-film-interaction' }, location.origin);
    if (running) { manuallyPaused = true; pause(); }
    else { manuallyPaused = false; start(); }
  }
  function fit() {
    const width = Number(film.dataset.width);
    const height = Number(film.dataset.height);
    const scale = Math.min(innerWidth / width, innerHeight / height);
    film.style.transform = `scale(${scale})`;
    film.style.left = `${(innerWidth - width * scale) / 2}px`;
    film.style.top = `${(innerHeight - height * scale) / 2}px`;
  }
  document.body.tabIndex = 0;
  document.body.setAttribute('role', 'button');
  document.body.setAttribute('aria-label', '点击画面播放宣传片');
  document.addEventListener('click', toggle);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent) return;
    if (event.data?.type === 'portfolio-film-pause') pause();
    if (event.data?.type === 'portfolio-film-visibility') {
      const entering = event.data.visible && !visible;
      visible = Boolean(event.data.visible);
      activated ||= Boolean(event.data.activated);
      if (entering) manuallyPaused = false;
      if (visible && !manuallyPaused) start();
      else pause();
    }
    if (event.data?.type === 'portfolio-film-activate') {
      activated = true;
      if (visible && running) attachAudio();
    }
    if (event.data?.type === 'portfolio-film-sound') {
      soundEnabled = Boolean(event.data.enabled);
      activated ||= Boolean(event.data.activated);
      if (!soundEnabled) audio.muted = true;
      else if (visible && running) attachAudio();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else if (visible && !manuallyPaused) start();
  });
  window.addEventListener('pagehide', pause);
  window.addEventListener('keydown', event => {
    if (event.code === 'Space' || event.key === 'Enter') { event.preventDefault(); toggle(); }
    if (event.key === 'Escape' && window.parent !== window) window.parent.postMessage({ type: 'portfolio-film-close' }, location.origin);
    if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(event.key) && window.parent !== window) {
      event.preventDefault();
      window.parent.postMessage({ type: 'portfolio-film-scroll', deltaY: ['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1, deltaMode: 2 }, location.origin);
    }
  });
  window.addEventListener('wheel', event => {
    if (window.parent === window) return;
    event.preventDefault();
    window.parent.postMessage({ type: 'portfolio-film-scroll', deltaY: event.deltaY, deltaMode: event.deltaMode }, location.origin);
  }, { passive: false });
  let touchY;
  window.addEventListener('touchstart', event => { touchY = event.touches[0]?.clientY; }, { passive: true });
  window.addEventListener('touchmove', event => {
    if (window.parent === window || touchY === undefined) return;
    const next = event.touches[0]?.clientY;
    if (next === undefined) return;
    event.preventDefault();
    window.parent.postMessage({ type: 'portfolio-film-scroll', deltaY: touchY - next, deltaMode: 0 }, location.origin);
    touchY = next;
  }, { passive: false });
  window.addEventListener('resize', fit);
  async function prepareFirstFrame() {
    // A load event alone does not include late fonts or a worker's first render.
    if (document.readyState !== 'complete') {
      await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
    }
    fit();
    await Promise.all([
      document.fonts?.ready,
      window.__filmAssetsReady,
      ...Array.from(document.images, image => image.decode?.().catch(() => {}))
    ]).catch(error => console.error('Unable to prepare film assets:', error));
    timeline.pause(0);
    position = anchorPosition = 0;
    // Allow style/layout and the compositor to present the same frame we reveal.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    prepared = true;
    film.dataset.ready = 'true';
    window.parent.postMessage({ type: 'portfolio-film-ready' }, location.origin);
    if (wantsPlayback) start();
  }
  prepareFirstFrame().catch(error => console.error('Unable to prepare first film frame:', error));
})();
