# 星穹智识 · StarVault

二次元风格的个人知识管理工具。

![StarVault](https://img.shields.io/badge/version-1.0.0-blue) ![Platform](https://img.shields.io/badge/platform-Windows-brightgreen) ![License](https://img.shields.io/badge/license-MIT-green)

## 下载

[**Download StarVault.exe (v1.0.0)**](https://github.com/Keke-Ding/starvault/releases/download/v1.0.0/StarVault.exe)

下载后双击运行即可，浏览器会自动打开 http://localhost:3001。

> 首次运行可能需要 Windows Defender 提示，选择「更多信息」→「仍要运行」即可。

## 功能特性

- **知识卡片管理** — 创建、编辑、删除知识卡片，支持 Markdown 格式
- **分类标签筛选** — 按分类和标签快速检索知识
- **搜索功能** — 全文搜索卡片内容
- **自定义背景** — 上传图片作为应用背景
- **独特字体** — 内置多种二次元风格字体可选
- **粒子动画** — Canvas 粒子背景动画效果
- **赛博朋克音效** — Web Audio API 合成的霓虹风格音效
- **数据导入/导出** — JSON 格式备份与恢复
- **本地存储** — 所有数据存储在本地 JSON 文件，隐私安全

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 状态管理 | Zustand + localStorage |
| 动画 | Framer Motion |
| 音效 | Web Audio API |
| 后端 | Express.js REST API |
| 存储 | JSON 文件存储 |
| 打包 | pkg → 独立 Windows 可执行文件 |

## 从源码构建

```bash
# 安装依赖
npm install

# 开发模式（前后端同时启动）
npm run dev:full

# 构建前端
npm run build

# 构建后端
npm run build:server

# 打包为可执行文件
node scripts/bundle.js
npx pkg bundle/ --targets node18-win-x64 --output release/StarVault.exe
```

## 项目结构

```
starvault/
├── src/                    # React 前端源码
│   ├── components/         # UI 组件
│   ├── pages/              # 页面组件
│   ├── hooks/              # 自定义 Hook（音效等）
│   ├── store/              # Zustand 状态管理
│   ├── services/           # API 调用层
│   └── types/              # TypeScript 类型定义
├── server/                 # Express 后端源码
├── server-dist/            # 后端编译产物
├── scripts/                # 打包脚本
│   ├── bundle.js           # esbuild 打包 + pkg 配置
│   └── package.js          # Windows 便携包脚本
└── public/                 # 静态资源
```

## License

MIT