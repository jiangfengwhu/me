import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import only playback sources, local assets and their licenses, never render outputs or tooling.
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/import-promos.mjs <original film workspace>');
const films = [
  ['bead-film', '封面.png', 'promo.m4a'],
  ['city-dazi-film', '封面.png', 'sound.m4a'],
  ['yixu-outfits-film', '六套换装效果总览.png', 'sound.m4a']
];
for (const [name, poster, audio] of films) {
  const input = path.resolve(source, name);
  const output = path.join(project, 'public', 'films', name);
  fs.mkdirSync(output, { recursive: true });
  for (const dir of ['assets', 'vendor']) {
    fs.cpSync(path.join(input, dir), path.join(output, dir), {
      recursive: true,
      filter: file => !/\.(wav|m4a)$/i.test(file) || path.basename(file) === audio
    });
  }
  fs.copyFileSync(path.join(input, 'out', poster), path.join(output, 'poster.png'));
  let html = fs.readFileSync(path.join(input, 'index.html'), 'utf8');
  html = html.replace('assets/sound.wav', `assets/${audio}`)
    .replace('</head>', '<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="../player.css"></head>')
    .replace('</body>', '<script src="../player.js"></script></body>');
  fs.writeFileSync(path.join(output, 'index.html'), html);
  console.log(`Imported ${name}`);
}
