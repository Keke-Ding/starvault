const fs = require('fs');
const path = require('path');

const RELEASE_DIR = path.join(__dirname, '..', 'release');
const APP_DIR = path.join(RELEASE_DIR, 'StarVault');

console.log('Building Electron desktop app...\n');

if (fs.existsSync(APP_DIR)) {
  fs.rmSync(APP_DIR, { recursive: true });
}

const resourcesDir = path.join(APP_DIR, 'resources');
const appDir = path.join(resourcesDir, 'app');
fs.mkdirSync(appDir, { recursive: true });

const electronDist = path.join(__dirname, '..', 'node_modules', 'electron', 'dist');
console.log('Copying Electron runtime...');
copyDir(electronDist, APP_DIR, ['resources']);

console.log('Copying app files...');
copyDir(path.join(__dirname, '..', 'dist'), path.join(appDir, 'dist'));
copyFile(path.join(__dirname, '..', 'electron', 'main.cjs'), path.join(appDir, 'electron', 'main.cjs'));

const simplePkg = {
  name: 'starvault',
  version: '1.0.0',
  main: 'electron/main.cjs',
  dependencies: { express: '*', cors: '*' },
};
fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(simplePkg, null, 2));

console.log('Copying production dependencies...');
const prodDeps = ['express', 'cors'];
const nodeModulesSrc = path.join(__dirname, '..', 'node_modules');
const nodeModulesDest = path.join(appDir, 'node_modules');
fs.mkdirSync(nodeModulesDest, { recursive: true });

for (const dep of prodDeps) {
  copyNodeModule(nodeModulesSrc, nodeModulesDest, dep);
}

console.log('Renaming electron.exe to StarVault.exe...');
const electronExe = path.join(APP_DIR, 'electron.exe');
const starvaultExe = path.join(APP_DIR, 'StarVault.exe');
if (fs.existsSync(electronExe)) {
  fs.renameSync(electronExe, starvaultExe);
}

const size = getDirSize(APP_DIR);
console.log(`\nBuild complete!`);
console.log(`Output: ${APP_DIR}`);
console.log(`Size: ${(size / 1024 / 1024).toFixed(1)} MB`);

function copyDir(src, dest, exclude = []) {
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
  }
}

function copyNodeModule(srcBase, destBase, name) {
  const src = path.join(srcBase, name);
  const dest = path.join(destBase, name);
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyNodeModule(src, dest, entry.name);
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