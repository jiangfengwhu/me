import { createBeadRenderer } from './BeadRenderer.js';

let renderer;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      renderer = createBeadRenderer(data);
      await renderer.warm();
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'frame' && renderer) {
      renderer.render(data.time);
      self.postMessage({ type: 'rendered' });
    } else if (data.type === 'resize' && renderer) renderer.resize(data.width, data.height);
  } catch (error) { self.postMessage({ type: 'error', message: String(error) }); }
};
