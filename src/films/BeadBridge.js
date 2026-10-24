// Only the HTML choreography stays on the page thread. WebGL setup and rendering
// use a worker where supported, with a compatible renderer for older browsers.
export function createBeadBridge(stage) {
  const assetBase = new URL('.', document.currentScript.src);
  let canvas, worker, fallback, ready = false, busy = false, lastSent = -1, pending = 0;
  let resolveReady, rejectReady, dimensions;
  let firstFrameReady = false;
  const report = backend => window.parent.postMessage({ type: 'portfolio-film-renderer', backend, ...dimensions }, location.origin);
  const makeCanvas = () => {
    canvas?.remove(); canvas = document.createElement('canvas'); stage.append(canvas);
  };
  const fit = () => {
    const width = Math.min(1080, Math.max(240, Math.ceil(innerWidth * Math.min(devicePixelRatio || 1, 1.5))));
    dimensions = { width, height: Math.round(width * 980 / 1080) };
    if (worker && ready) worker.postMessage({ type: 'resize', ...dimensions });
    if (fallback) fallback.resize(dimensions.width, dimensions.height);
  };
  const flush = () => {
    if (!ready || busy || pending === lastSent) return;
    lastSent = pending;
    if (worker) { busy = true; worker.postMessage({ type: 'frame', time: pending }); }
    else fallback?.render(pending);
  };
  fit(); addEventListener('resize', fit);
  return {
    init(items, palette) {
      makeCanvas();
      return new Promise((resolve, reject) => {
        resolveReady = resolve; rejectReady = reject;
        let fallbackStarted = false;
        const useFallback = async () => {
          if (fallbackStarted) return;
          fallbackStarted = true; worker?.terminate(); worker = null; busy = false; ready = false;
          makeCanvas();
          try {
            const { createBeadRenderer } = await import(new URL('bead-main-renderer.js', assetBase).href);
            fallback = createBeadRenderer({ canvas, ...dimensions, items, palette });
            await fallback.warm(); ready = true; lastSent = -1; report('main-thread'); flush(); resolveReady();
          } catch (error) { rejectReady(error); }
        };
        if (!canvas.transferControlToOffscreen || typeof Worker === 'undefined') { useFallback(); return; }
        try {
          worker = new Worker(new URL('bead-worker.js', assetBase));
          worker.onmessage = ({ data }) => {
            if (data.type === 'ready') {
              ready = true;
              report('worker');
              worker.postMessage({ type: 'resize', ...dimensions });
              flush();
            } else if (data.type === 'rendered') {
              busy = false;
              if (!firstFrameReady) { firstFrameReady = true; resolveReady(); }
              flush();
            }
            else if (data.type === 'error') useFallback();
          };
          worker.onerror = event => { event.preventDefault(); useFallback(); };
          const offscreen = canvas.transferControlToOffscreen();
          worker.postMessage({ type: 'init', canvas: offscreen, ...dimensions, items, palette }, [offscreen]);
        } catch { useFallback(); }
      });
    },
    render(time) { pending = time; flush(); }
  };
}
