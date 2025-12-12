import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

// regex match mọi import
const IMPORT_REGEX = /from\s+['"]([^'"]+)['"]/g;

function fixFileImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const updated = content.replace(IMPORT_REGEX, (match, importPath) => {
    // bỏ qua import npm
    if (
      !importPath.startsWith('./') &&
      !importPath.startsWith('../') &&
      !importPath.startsWith('~')
    ) {
      return match;
    }

    // đã có .js thì bỏ qua
    if (importPath.endsWith('.js')) return match;

    // thêm .js
    modified = true;
    return match.replace(importPath, `${importPath}.js`);
  });

  if (modified) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`✔ Fixed imports in: ${filePath}`);
  }
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) scanDir(full);
    else if (full.endsWith('.js')) fixFileImports(full);
  }
}

console.log('Scanning and fixing imports...');
scanDir(SRC_DIR);
console.log('Completed fixing all imports!');
