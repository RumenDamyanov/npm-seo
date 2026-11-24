#!/usr/bin/env node

/**
 * After tsc, relative imports still omit file extensions, and directory
 * barrels such as `./schema` were rewritten to `./schema.js`. Node cannot
 * load either form. Point each specifier at the real file, and mark the
 * ESM and CommonJS trees with their own package.json type.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

rewriteRelativeSpecifiers(path.join(dist, 'esm'), ['.js', '.d.ts']);
rewriteRelativeSpecifiers(path.join(dist, 'cjs'), ['.js']);
rewriteRelativeSpecifiers(path.join(dist, 'types'), ['.d.ts']);

fs.writeFileSync(
  path.join(dist, 'esm', 'package.json'),
  `${JSON.stringify({ type: 'module' }, null, 2)}\n`
);
fs.writeFileSync(
  path.join(dist, 'cjs', 'package.json'),
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`
);

console.log('Fixed relative specifiers in dist.');

function rewriteRelativeSpecifiers(directory, extensions) {
  if (!fs.existsSync(directory)) {
    console.log(`Skipping missing directory ${directory}`);
    return;
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      rewriteRelativeSpecifiers(filePath, extensions);
      continue;
    }
    if (!extensions.some(extension => entry.name.endsWith(extension))) {
      continue;
    }

    const updated = fs
      .readFileSync(filePath, 'utf8')
      .replace(
        /(\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*)(['"])(\.\.?\/[^'"]+)\2/g,
        (match, prefix, quote, specifier) => {
          if (path.extname(specifier)) {
            return match;
          }
          return `${prefix}${quote}${resolveSpecifier(filePath, specifier)}${quote}`;
        }
      );
    fs.writeFileSync(filePath, updated);
  }
}

function resolveSpecifier(fromFile, specifier) {
  const target = path.resolve(path.dirname(fromFile), specifier);
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    return `${specifier}/index.js`;
  }
  return `${specifier}.js`;
}
