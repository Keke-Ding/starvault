# 星穹智识 · StarVault

二次元风格的个人知识管理工具。**真正的桌面应用**，双击即开精美图形界面！

![Version](https://img.shields.io/badge/version-1.1.0-blue) ![Platform](https://img.shields.io/badge/platform-Windows-brightgreen) ![License](https://img.shields.io/badge/license-MIT-green) ![Electron](https://img.shields.io/badge/Electron-33-47848f)

## 下载

[**Download StarVault v1.1.0 (便携版)**](https://github.com/Keke-Ding/starvault/releases/download/v1.1.0/StarVault-v1.1.0-portable.zip)

1. 下载 ZIP 并解压到任意目录
2. 双击 `StarVault.exe` 即可启动
3. 精美的图形界面会自动打开

> 首次运行 Windows Defender 可能提示，选择「更多信息」→「仍要运行」即可。

## 功能特性

- **知识卡片管理** — 创建、编辑、删除知识卡片，支持 Markdown 格式
- **分类标签筛选** — 按分类和标签快速检索知识
- **搜索功能** — 全文搜索卡片内容
- **自定义背景** — 上传图片作为应用背景
- **独特字体** — 内置多种二次元风格字体可选
- **粒子动画** — Canvas 粒子背景动画效果
- **赛博朋克音效** — Web Audio API 合成的霓虹风格音效（10种）
- **数据导入/导出** — JSON 格式备份与恢复
- **本地存储** — 所有数据存储在本地，隐私安全

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面壳 | Electron 33 |
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 状态管理 | Zustand |
| 动画 | Framer Motion |
| 音效 | Web Audio API |
| 后端 | Express.js（内嵌） |
| 存储 | JSON 文件存储 |

## 从源码构建

```bash
# 安装依赖
npm install

# 开发模式（Electron 桌面应用）
npm run dev:electron

# 开发模式（浏览器）
npm run dev:full

# 构建前端
npm run build

# 构建 Electron 桌面应用
node scripts/electron-build.cjs
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
├── electron/               # Electron 桌面壳
│   └── main.cjs            # 主进程（内嵌 Express 服务器）
├── server/                 # Express 后端源码
├── server-dist/            # 后端编译产物
├── scripts/                # 构建/打包脚本
│   ├── electron-build.cjs  # Electron 便携版构建
│   ├── electron-package.cjs# electron-packager 配置
│   └── bundle.js           # pkg 打包脚本（旧方案）
└── public/                 # 静态资源
```

## License

MIT