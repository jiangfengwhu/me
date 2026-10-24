import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const editorDirectories = new Set(['.om', '.openai']);

async function clean(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const target = path.resolve(directory, entry.name);
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Invalid build path');
    if (editorDirectories.has(entry.name)) await rm(target, { recursive: true });
    else await clean(target);
  }
}

await clean(root);
