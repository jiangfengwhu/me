import { SoundEngine } from './SoundEngine.js';

// This small entry runs before the Three.js application graph finishes loading.
// Sound is always on; the browser's autoplay policy is satisfied silently by the
// first user gesture, so there is no toggle or hint in the interface.
export const sound = new SoundEngine();

/**
 * Web-fonts are only needed to paint the canvas card textures correctly, so the
 * stylesheet is loaded without blocking the first paint (Google Fonts can be
 * slow or unreachable), and the app waits for them only within a short budget.
 */
function fontsSettled() {
  const link = document.getElementById('font-stylesheet');
  const stylesheet = new Promise(resolve => {
    if (!link || link.sheet) { resolve(); return; }
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', resolve, { once: true });
  });
  return stylesheet.then(() => {
    if (!document.fonts?.load) return undefined;
    return Promise.all([
      document.fonts.load('700 19px "JetBrains Mono"').catch(() => {}),
      document.fonts.load('800 45px Inter').catch(() => {}),
      document.fonts.load('italic 500 30px Newsreader').catch(() => {})
    ]).then(() => document.fonts.ready);
  });
}

const fontBudget = new Promise(resolve => setTimeout(resolve, 900));

// Keep sound initialization out of the large WebGL download/initialization path.
Promise.race([fontsSettled(), fontBudget])
  .catch(() => {})
  .then(() => import('../main.js'))
  .catch(error => console.error('Unable to start portfolio:', error));
