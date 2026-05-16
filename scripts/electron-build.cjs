const fs = require('fs');
const path = require('path');

const RELEASE_DIR = path.join(__dirname, '..', 'release');
const APP_DIR = path.join(RELEASE_DIR, 'StarVault');
const PROJECT_ROOT = path.join(__dirname, '..');

console.log('Building Electron desktop app...\n');

const distPath = path.join(PROJECT_ROOT, 'dist');
const electronMainPath = path.join(PROJECT_ROOT, 'electron', 'main.cjs');
const electronPreloadPath = path.join(PROJECT_ROOT, 'electron', 'preload.cjs');
const electronDistPath = path.join(PROJECT_ROOT, 'node_modules', 'electron', 'dist');

console.log('Pre-build checks...');
const checks = [
  { label: 'dist/', path: distPath },
  { label: 'electron/main.cjs', path: electronMainPath },
  { label: 'electron/preload.cjs', path: electronPreloadPath },
  { label: 'node_modules/electron/dist/', path: electronDistPath },
];
for (const check of checks) {
  if (!fs.existsSync(check.path)) {
    console.error(`ERROR: ${check.label} not found at ${check.path}`);
    console.error('Please run "npm run build" first to generate the dist folder.');
    process.exit(1);
  }
  console.log(`  OK: ${check.label}`);
}

const distIndexHtml = path.join(distPath, 'index.html');
if (!fs.existsSync(distIndexHtml)) {
  console.error('ERROR: dist/index.html not found. The Vite build may have failed.');
  process.exit(1);
}
console.log('  OK: dist/index.html exists\n');

if (fs.existsSync(APP_DIR)) {
  fs.rmSync(APP_DIR, { recursive: true });
}

const resourcesDir = path.join(APP_DIR, 'resources');
const appDir = path.join(resourcesDir, 'app');
fs.mkdirSync(appDir, { recursive: true });

console.log('Copying Electron runtime...');
copyDir(electronDistPath, APP_DIR, ['resources']);

console.log('Copying app files...');
copyDir(distPath, path.join(appDir, 'dist'));
copyFile(electronMainPath, path.join(appDir, 'electron', 'main.cjs'));
copyFile(electronPreloadPath, path.join(appDir, 'electron', 'preload.cjs'));

const simplePkg = {
  name: 'starvault',
  version: '1.0.0',
  main: 'electron/main.cjs',
  dependencies: { express: '*', cors: '*' },
};
fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(simplePkg, null, 2));

console.log('Resolving dependencies...');
const projectNodeModules = path.join(PROJECT_ROOT, 'node_modules');
const allDeps = resolveAllDependencies(projectNodeModules, ['express', 'cors']);
console.log(`Found ${allDeps.length} packages to copy (including transitive dependencies)`);

console.log('Copying node_modules...');
const destNodeModules = path.join(appDir, 'node_modules');
fs.mkdirSync(destNodeModules, { recursive: true });

for (const dep of allDeps) {
  copyNodeModule(projectNodeModules, destNodeModules, dep);
}

console.log('Stripping unused files...');
const localesDir = path.join(APP_DIR, 'locales');
if (fs.existsSync(localesDir)) {
  const keep = ['zh-CN.pak', 'en-US.pak'];
  const entries = fs.readdirSync(localesDir);
  let removed = 0;
  for (const entry of entries) {
    if (!keep.includes(entry)) {
      fs.unlinkSync(path.join(localesDir, entry));
      removed++;
    }
  }
  console.log(`  Removed ${removed} unused locale files, kept ${keep.join(', ')}`);
}

function stripNodeModule(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['test', 'tests', '__tests__', 'example', 'examples', 'docs', 'benchmark', '.github'].includes(entry.name)) {
        fs.rmSync(fullPath, { recursive: true });
      } else {
        stripNodeModule(fullPath);
      }
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.md', '.ts', '.map', '.yml', '.yaml'].includes(ext) &&
          !entry.name.endsWith('.d.ts')) {
        fs.unlinkSync(fullPath);
      }
    }
  }
}
console.log('  Stripping node_modules development files...');
stripNodeModule(path.join(appDir, 'node_modules'));

console.log('Renaming electron.exe to StarVault.exe...');
const electronExe = path.join(APP_DIR, 'electron.exe');
const starvaultExe = path.join(APP_DIR, 'StarVault.exe');
if (fs.existsSync(electronExe)) {
  fs.renameSync(electronExe, starvaultExe);
}

console.log('\nPost-build verification...');
const verifyChecks = [
  { label: 'StarVault.exe', path: starvaultExe },
  { label: 'resources/app/dist/index.html', path: path.join(appDir, 'dist', 'index.html') },
  { label: 'resources/app/electron/main.cjs', path: path.join(appDir, 'electron', 'main.cjs') },
  { label: 'resources/app/electron/preload.cjs', path: path.join(appDir, 'electron', 'preload.cjs') },
  { label: 'resources/app/node_modules/express', path: path.join(appDir, 'node_modules', 'express') },
  { label: 'resources/app/node_modules/cors', path: path.join(appDir, 'node_modules', 'cors') },
];
let allOk = true;
for (const check of verifyChecks) {
  if (fs.existsSync(check.path)) {
    console.log(`  OK: ${check.label}`);
  } else {
    console.error(`  MISSING: ${check.label}`);
    allOk = false;
  }
}

const distAssetsDir = path.join(appDir, 'dist', 'assets');
if (fs.existsSync(distAssetsDir)) {
  const assetCount = fs.readdirSync(distAssetsDir).length;
  console.log(`  OK: dist/assets/ contains ${assetCount} files`);
} else {
  console.error('  MISSING: dist/assets/ directory');
  allOk = false;
}

const size = getDirSize(APP_DIR);
console.log(`\nBuild ${allOk ? 'complete' : 'FAILED - some files are missing'}!`);
console.log(`Output: ${APP_DIR}`);
console.log(`Size: ${(size / 1024 / 1024).toFixed(1)} MB`);

if (!allOk) {
  process.exit(1);
}

function resolveAllDependencies(nodeModulesPath, topLevelDeps) {
  const resolved = new Set();
  const toProcess = [...topLevelDeps];

  while (toProcess.length > 0) {
    const depName = toProcess.shift();
    if (resolved.has(depName)) continue;
    resolved.add(depName);

    const pkgJsonPath = path.join(nodeModulesPath, depName, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) continue;

    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      const deps = pkg.dependencies || {};
      for (const subDep of Object.keys(deps)) {
        if (!resolved.has(subDep)) {
          toProcess.push(subDep);
        }
      }
    } catch (e) {
      console.warn(`  Warning: Could not read package.json for ${depName}`);
    }
  }

  return Array.from(resolved);
}

function copyDir(src, dest, exclude = []) {
  if (!fs.existsSync(src)) {
    console.warn(`  Warning: Source directory not found: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  } else {
    console.warn(`  Warning: Source file not found: ${src}`);
  }
}

function copyNodeModule(srcBase, destBase, name) {
  const src = path.join(srcBase, name);
  const dest = path.join(destBase, name);
  if (!fs.existsSync(src)) {
    console.warn(`  Warning: ${name} not found in node_modules`);
    return;
  }
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true });
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getDirSize(dir) {
  let size = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      size += getDirSize(p);
    } else {
      size += fs.statSync(p).size;
    }
  }
  return size;
}
