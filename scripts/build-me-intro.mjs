import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = path.join(root, 'motion/me-intro');
await mkdir(path.join(project, 'assets/site'), { recursive: true });
await cp(path.join(root, 'public/assets'), path.join(project, 'assets/site'), { recursive: true });
await cp(path.join(root, 'public/films'), path.join(project, 'assets/films'), {
  recursive: true,
  filter: source => !source.split(path.sep).some(part => ['.om', '.openai', 'out'].includes(part))
});
for (const name of ['bead-film', 'city-dazi-film', 'creator-film', 'yixu-outfits-film', 'fx-film', 'little-traveler-film', 'clack-launch-film']) {
  const file = path.join(project, 'assets/films', name, 'index.html');
  let html = await readFile(file, 'utf8');
  html = html.replace(/<script\s+src=["']\.\.\/player\.js["']><\/script>/g, '');
  html = html.replace('</head>', '<style>html,body{width:100%!important;height:100%!important;margin:0!important;overflow:hidden!important}#film{opacity:1!important;position:absolute;left:0;top:0;transform:none!important}</style></head>');
  await writeFile(file, html);
}
await cp(path.join(root, 'public/films/composition-runtime.js'), path.join(project, 'vendor/composition-runtime.js'));
await build({
  absWorkingDir: root,
  entryPoints: ['motion/me-intro/tools/scene-source.js'],
  outfile: 'motion/me-intro/assets/scene.js',
  bundle: true, format: 'iife', target: 'es2020', minify: true,
  define: { 'import.meta.env.DEV': 'false' },
  plugins: [{ name: 'original-local-assets', setup(bundler) {
    bundler.onLoad({ filter: /[/\\]src[/\\].*\.(js|json)$/ }, async args => ({
      contents: (await readFile(args.path, 'utf8')).replaceAll("'/assets/", "'assets/site/").replaceAll('"/assets/', '"assets/site/'),
      loader: args.path.endsWith('.json') ? 'json' : 'js'
    }));
  }}]
});
console.log('Built me intro using the original site scene and seven original film timelines.');
