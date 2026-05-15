const { app: electronApp, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');

const SERVER_PORT = 3001;
let mainWindow = null;
let server = null;

function startServer() {
  return new Promise((resolve, reject) => {
    let express, corsModule, fs;
    try {
      express = require('express');
      corsModule = require('cors');
      fs = require('fs');
    } catch (e) {
      reject(new Error('缺少必要组件: ' + e.message));
      return;
    }

    const app = express();
    app.use(corsModule());
    app.use(express.json({ limit: '10mb' }));

    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));

    function getDbPath() {
      if (electronApp.isPackaged) {
        return path.join(electronApp.getPath('userData'), 'starvault-data.json');
      }
      return path.join(__dirname, '..', 'starvault-data.json');
    }

    const dbPath = getDbPath();

    function readStore() {
      try {
        if (fs.existsSync(dbPath)) {
          return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        }
      } catch (e) {
        console.error('Read store error:', e.message);
      }
      return { cards: [], settings: {} };
    }

    function writeStore(data) {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    app.get('/api/cards', (_req, res) => {
      const store = readStore();
      const cards = store.cards.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json(cards);
    });

    app.get('/api/cards/:id', (req, res) => {
      const store = readStore();
      const card = store.cards.find((c) => c.id === req.params.id);
      if (!card) return res.status(404).json({ error: '卡片未找到' });
      res.json(card);
    });

    app.post('/api/cards', (req, res) => {
      const { id, title, content, tags, category, createdAt, updatedAt } = req.body;
      if (!id || !title) return res.status(400).json({ error: '缺少必要字段' });
      const store = readStore();
      const existing = store.cards.findIndex((c) => c.id === id);
      const card = {
        id, title,
        content: content || '',
        tags: tags || [],
        category: category || '其他',
        createdAt: createdAt || new Date().toISOString(),
        updatedAt: updatedAt || new Date().toISOString(),
      };
      if (existing >= 0) {
        store.cards[existing] = card;
      } else {
        store.cards.push(card);
      }
      writeStore(store);
      res.status(201).json({ success: true });
    });

    app.put('/api/cards/:id', (req, res) => {
      const store = readStore();
      const idx = store.cards.findIndex((c) => c.id === req.params.id);
      if (idx < 0) return res.status(404).json({ error: '卡片未找到' });
      store.cards[idx] = { ...store.cards[idx], ...req.body, updatedAt: new Date().toISOString() };
      writeStore(store);
      res.json({ success: true });
    });

    app.delete('/api/cards/:id', (req, res) => {
      const store = readStore();
      const before = store.cards.length;
      store.cards = store.cards.filter((c) => c.id !== req.params.id);
      if (store.cards.length === before) return res.status(404).json({ error: '卡片未找到' });
      writeStore(store);
      res.json({ success: true });
    });

    app.get('/api/settings', (_req, res) => {
      res.json(readStore().settings || {});
    });

    app.put('/api/settings', (req, res) => {
      const store = readStore();
      for (const [key, value] of Object.entries(req.body)) {
        store.settings[key] = String(value);
      }
      writeStore(store);
      res.json({ success: true });
    });

    app.get('/api/export', (_req, res) => {
      const store = readStore();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition',
        `attachment; filename=starvault-backup-${new Date().toISOString().slice(0, 10)}.json`);
      res.send(JSON.stringify({ cards: store.cards, settings: store.settings }, null, 2));
    });

    app.post('/api/import', (req, res) => {
      try {
        const data = req.body;
        if (!data.cards || !Array.isArray(data.cards)) {
          return res.status(400).json({ error: '导入失败，数据格式不正确' });
        }
        writeStore({ cards: data.cards, settings: data.settings || {} });
        res.json({ success: true });
      } catch {
        res.status(400).json({ error: '导入失败，数据格式不正确' });
      }
    });

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

    server = app.listen(SERVER_PORT, () => {
      console.log(`StarVault server started on port ${SERVER_PORT}`);
      resolve();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: '星穹智识 StarVault',
    backgroundColor: '#0a0a1a',
    show: false,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

electronApp.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (err) {
    console.error('Failed to start:', err);
    dialog.showErrorBox(
      '启动失败',
      `星穹智识无法启动。\n\n错误: ${err.message}\n\n请尝试重新解压或联系开发者。`
    );
    electronApp.quit();
  }

  electronApp.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

electronApp.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    electronApp.quit();
  }
});

electronApp.on('before-quit', () => {
  if (server) {
    server.close();
  }
});