import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join(process.cwd(), 'bundle');

if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true });
}
fs.mkdirSync(OUT_DIR, { recursive: true });

await esbuild.build({
  entryPoints: ['./server-dist/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: './bundle/server.js',
  external: [],
  minify: false,
  sourcemap: false,
  banner: {
    js: `
const path = require('path');
const fs = require('fs');

(function() {
  var isPkg = typeof process.pkg !== 'undefined';
  if (isPkg) {
    process.env.STARVAULT_DIST = path.join(__dirname, 'dist');
  } else {
    process.env.STARVAULT_DIST = path.join(path.dirname(process.execPath), 'dist');
  }
})();
`,
  },
});

console.log('Bundle created: bundle/server.js');

const distSrc = path.join(process.cwd(), 'dist');
const distDest = path.join(OUT_DIR, 'dist');
if (fs.existsSync(distSrc)) {
  fs.cpSync(distSrc, distDest, { recursive: true });
  console.log('Copied dist/ to bundle/dist/');
}

const pkgJson = {
  name: 'starvault',
  version: '1.0.0',
  bin: 'server.js',
  pkg: {
    assets: ['dist/**/*'],
    targets: ['node18-win-x64'],
    outputPath: '../release',
  },
};
fs.writeFileSync(path.join(OUT_DIR, 'package.json'), JSON.stringify(pkgJson, null, 2));
console.log('Created bundle/package.json');
console.log('\nReady for pkg. Run: npx pkg bundle/');