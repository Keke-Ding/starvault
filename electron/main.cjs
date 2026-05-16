const { app: electronApp, BrowserWindow, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

electronApp.commandLine.appendSwitch('enable-gpu-rasterization');
electronApp.commandLine.appendSwitch('enable-zero-copy');
electronApp.commandLine.appendSwitch('disable-software-rasterizer');

const SERVER_PORT = 3001;
const DEFAULT_WIDTH = 1100;
const DEFAULT_HEIGHT = 750;
const MIN_WIDTH = 760;
const MIN_HEIGHT = 520;

let mainWindow = null;
let server = null;

function getWindowStatePath() {
  if (electronApp.isPackaged) {
    return path.join(electronApp.getPath('userData'), 'window-state.json');
  }
  return path.join(__dirname, '..', 'window-state.json');
}

function loadWindowState() {
  try {
    const statePath = getWindowStatePath();
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      if (state.x !== undefined && state.y !== undefined && state.width && state.height) {
        return state;
      }
    }
  } catch (e) {
    // ignore, use defaults
  }
  return null;
}

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const bounds = mainWindow.getBounds();
    const isMaximized = mainWindow.isMaximized();
    const state = { ...bounds, isMaximized };
    const statePath = getWindowStatePath();
    const dir = path.dirname(statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(statePath, JSON.stringify(state), 'utf-8');
  } catch (e) {
    // ignore
  }
}

function setupIPC() {
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    let express, corsModule;
    try {
      express = require('express');
      corsModule = require('cors');
    } catch (e) {
      reject(new Error('缺少必要组件: ' + e.message));
      return;
    }

    const app = express();
    app.use(corsModule());
    app.use(express.json({ limit: '10mb' }));

    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath, { maxAge: '1d' }));

    function getDbPath() {
      if (electronApp.isPackaged) {
        return path.join(electronApp.getPath('userData'), 'starvault-data.json');
      }
      return path.join(__dirname, '..', 'starvault-data.json');
    }

    const dbPath = getDbPath();
    let cachedStore = null;
    let cacheTime = 0;
    const CACHE_TTL = 1000;

    function readStore() {
      const now = Date.now();
      if (cachedStore && (now - cacheTime) < CACHE_TTL) {
        return cachedStore;
      }
      try {
        if (fs.existsSync(dbPath)) {
          cachedStore = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
          cacheTime = now;
          return cachedStore;
        }
      } catch (e) {
        console.error('Read store error:', e.message);
      }
      cachedStore = { cards: [], settings: {} };
      cacheTime = now;
      return cachedStore;
    }

    function writeStore(data) {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
      cachedStore = data;
      cacheTime = Date.now();
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
  const savedState = loadWindowState();
  const preloadPath = path.join(__dirname, 'preload.cjs');

  const windowOptions = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    title: '星穹智识 StarVault',
    backgroundColor: '#0a0a1a',
    show: false,
    frame: false,
    autoHideMenuBar: true,
    center: true,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  };

  if (savedState) {
    windowOptions.x = savedState.x;
    windowOptions.y = savedState.y;
    windowOptions.width = savedState.width;
    windowOptions.height = savedState.height;
    windowOptions.center = false;
  }

  mainWindow = new BrowserWindow(windowOptions);

  if (savedState && savedState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximize-change', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximize-change', false);
  });

  mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  let saveTimer = null;
  const debouncedSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveWindowState, 300);
  };

  mainWindow.on('resize', debouncedSave);
  mainWindow.on('move', debouncedSave);
  mainWindow.on('maximize', debouncedSave);
  mainWindow.on('unmaximize', debouncedSave);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    clearTimeout(saveTimer);
    saveWindowState();
    mainWindow = null;
  });
}

electronApp.whenReady().then(async () => {
  try {
    setupIPC();
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
  saveWindowState();
  if (server) {
    server.close();
  }
});