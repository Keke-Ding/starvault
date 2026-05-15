const packager = require('electron-packager');
const path = require('path');

async function build() {
  const options = {
    dir: path.join(__dirname, '..'),
    name: '星穹智识 StarVault',
    platform: 'win32',
    arch: 'x64',
    out: path.join(__dirname, '..', 'release'),
    overwrite: true,
    prune: true,
    ignore: [
      'scripts',
      'server',
      'server-dist',
      'src',
      'bundle',
      '.trae',
      '.gitignore',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
      'eslint.config.js',
      'node_modules/electron-builder',
      'node_modules/electron-packager',
      'node_modules/@electron',
      'node_modules/.cache',
      'release',
    ],
    afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
      console.log('Packaging complete!');
      callback();
    }],
  };

  try {
    const appPaths = await packager(options);
    console.log('Build successful!');
    console.log('Output:', appPaths);
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build();