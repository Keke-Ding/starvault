import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const RELEASE_DIR = path.join(process.cwd(), 'release');
const PACKAGE_DIR = path.join(RELEASE_DIR, 'StarVault');

console.log('正在打包 StarVault...');

if (fs.existsSync(PACKAGE_DIR)) {
  fs.rmSync(PACKAGE_DIR, { recursive: true });
}
fs.mkdirSync(PACKAGE_DIR, { recursive: true });

const dirs = ['dist', 'server-dist', 'public'];
for (const dir of dirs) {
  const src = path.join(process.cwd(), dir);
  const dest = path.join(PACKAGE_DIR, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`  复制: ${dir}/`);
  }
}

const prodDeps = ['express', 'cors'];
const nodeModulesSrc = path.join(process.cwd(), 'node_modules');
const nodeModulesDest = path.join(PACKAGE_DIR, 'node_modules');
fs.mkdirSync(nodeModulesDest, { recursive: true });

for (const dep of prodDeps) {
  const depPath = path.join(nodeModulesSrc, dep);
  const depDest = path.join(nodeModulesDest, dep);
  if (fs.existsSync(depPath)) {
    fs.cpSync(depPath, depDest, { recursive: true });
    console.log(`  复制依赖: ${dep}`);
  }
}

const packageJson = {
  name: 'starvault',
  version: '1.0.0',
  type: 'module',
  main: 'server-dist/index.js',
  dependencies: {
    express: '*',
    cors: '*',
  },
};
fs.writeFileSync(
  path.join(PACKAGE_DIR, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

const startBat = `@echo off
chcp 65001 >nul
title 星穹智识 StarVault
echo.
echo   ╔══════════════════════════════════╗
echo   ║     星穹智识  StarVault          ║
echo   ║     二次元风格知识管理工具        ║
echo   ╚══════════════════════════════════╝
echo.
echo   正在启动服务...
echo.
start "" http://localhost:3001
node server-dist/index.js
pause
`;

fs.writeFileSync(path.join(PACKAGE_DIR, '启动星穹智识.bat'), startBat);
console.log('  创建: 启动星穹智识.bat');

const readme = `# 星穹智识 StarVault v1.0.0

二次元风格的个人知识管理工具。

## 使用方法

1. 确保已安装 Node.js (v18+)
2. 双击运行 「启动星穹智识.bat」
3. 浏览器将自动打开 http://localhost:3001

## 数据存储

所有数据存储在 \`starvault-data.json\` 文件中。
可通过设置面板导出/导入数据备份。

## 快捷操作

- 创建卡片: 点击右下角 + 按钮
- 搜索知识: 顶部搜索框
- 切换主题/字体: 右上角设置图标

---

Powered by Express + React + TypeScript
`;

fs.writeFileSync(path.join(PACKAGE_DIR, 'README.txt'), readme);

const zipName = `StarVault-v1.0.0-portable.zip`;
const zipPath = path.join(RELEASE_DIR, zipName);

let zipCreated = false;
try {
  execSync(
    `powershell -Command "Compress-Archive -Path '${PACKAGE_DIR}' -DestinationPath '${zipPath}' -Force"`,
    { stdio: 'pipe' }
  );
  zipCreated = true;
} catch {}

if (zipCreated && fs.existsSync(zipPath)) {
  console.log(`\n打包完成: ${zipPath}`);
  console.log(`文件大小: ${(fs.statSync(zipPath).size / 1024 / 1024).toFixed(1)} MB`);
} else {
  console.log(`\n打包完成: ${PACKAGE_DIR}`);
  console.log('将此目录复制到任意位置，双击「启动星穹智识.bat」即可运行');
}