import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/import-handmade-works.mjs <original projects directory>');
const works = [
  { film: 'little-traveler-film', image: 'little-traveler/preview.png', cover: 'cover-origami.png' },
  { film: 'clack-launch-film', image: 'clack-refined/reference/finish-v3/front.png', cover: 'cover-clack.png' }
];
for (const work of works) {
  const target = path.join(root, 'public/films', work.film);
  await mkdir(target, { recursive: true });
  for (const part of ['assets', 'vendor', 'index.html', 'treatment.md']) {
    await cp(path.join(source, work.film, part), path.join(target, part), { recursive: true });
  }
  let html = await readFile(path.join(target, 'index.html'), 'utf8');
  html = html.replace('</head>', '<link rel="stylesheet" href="../player.css"></head>');
  html = html.replace('</body>', '<script>window.__filmAssetsReady=Promise.all(Object.values(window.__hf?.buildReady||{}));</script><script src="../player.js"></script></body>');
  await writeFile(path.join(target, 'index.html'), html);
  await cp(path.join(source, work.image), path.join(target, 'poster.png'));
  await cp(path.join(source, work.image), path.join(root, 'public/assets/covers', work.cover));
}
console.log('Imported origami and CLACK films and artwork; applications are linked to their own websites.');
