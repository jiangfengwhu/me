// Development-only sampling; enable with ?profile=1. No UI or production polling.
export function createPerformanceProbe(renderer) {
  if (!import.meta.env.DEV || !new URLSearchParams(location.search).has('profile')) return null;
  let start = performance.now();
  let previous = start;
  let frames = [];
  let costs = [];
  let transition = null;
  return {
    mark(label) { transition = { label, start: performance.now(), previous: performance.now(), frames: [], costs: [] }; },
    sample(frameStart) {
      const now = performance.now();
      frames.push(now - previous);
      costs.push(now - frameStart);
      previous = now;
      if (transition) {
        transition.frames.push(now - transition.previous);
        transition.costs.push(now - frameStart);
        transition.previous = now;
        if (now - transition.start >= 1200) {
          console.info('[transition-profile]', JSON.stringify({ label: transition.label,
            maxFrameMs: +Math.max(...transition.frames).toFixed(1),
            maxRenderCpuMs: +Math.max(...transition.costs).toFixed(1),
            framesOver33Ms: transition.frames.filter(n => n > 33).length,
            frames: transition.frames.length }));
          transition = null;
        }
      }
      if (now - start < 5000) return;
      const mean = values => values.reduce((sum, n) => sum + n, 0) / values.length;
      frames.sort((a, b) => a - b);
      console.info('[scene-profile]', JSON.stringify({
        route: location.hash, fps: Math.round(1000 / mean(frames)),
        frameP95: +frames[Math.floor(frames.length * 0.95)].toFixed(1),
        renderCpuMs: +mean(costs).toFixed(1), calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles, pixelRatio: renderer.getPixelRatio()
      }));
      frames = []; costs = []; start = now;
    }
  };
}
