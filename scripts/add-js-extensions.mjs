import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.ts')) files.push(full);
  }
}
for (const d of ['api', 'src']) walk(d);

let changed = 0;
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(
    /from\s+(['"])(\.\.?\/[^'"]+)(['"])/g,
    (match, q1, path, q2) => {
      if (/\.[a-z]+$/i.test(path)) return match;   // already has .css/.json/etc
      return `from ${q1}${path}.js${q2}`;
    }
  );
  if (after !== before) {
    writeFileSync(file, after);
    console.log(`✓ ${file}`);
    changed++;
  }
}
console.log(`\n${changed} files updated`);