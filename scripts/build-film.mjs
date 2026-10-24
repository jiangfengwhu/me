import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const options = {
  absWorkingDir: root,
  bundle: true, format: 'iife', minify: true, legalComments: 'eof',
  target: ['es2020']
};
await Promise.all([
  build({ ...options, entryPoints: ['src/films/beadScene.js'], outfile: 'public/films/bead-film/assets/scene.js' }),
  build({ ...options, entryPoints: ['src/films/bead-worker.js'], outfile: 'public/films/bead-film/assets/bead-worker.js' }),
  build({ ...options, format: 'esm', entryPoints: ['src/films/BeadRenderer.js'], outfile: 'public/films/bead-film/assets/bead-main-renderer.js' })
]);
console.log('Built bead film: lightweight HTML choreography, WebGL worker and fallback.');
