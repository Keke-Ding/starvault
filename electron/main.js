const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 3001;

function startServer() {
  return new Promise((resolve) => {
    serverProcess = spawn(
      process.execPath,
      [path.join(__dirname, '..', 'server', 'index.js')],
      {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, PORT: String(SERVER_PORT) },
        stdio: 'pipe',
      }
    );

    serverProcess.stdout.on('data', (data) => {
      console.log(`[Server] ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Error] ${data}`);
    });

    const checkServer = () => {
      http
        .get(`http://localhost:${SERVER_PORT}/api/cards`, (res) => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            setTimeout(checkServer, 500);
          }
        })
        .on('error', () => {
          setTimeout(checkServer, 500);
        });
    };

    setTimeout(checkServer, 1000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    title: '星穹智识 StarVault',
    backgroundColor: '#0f0f1a',
    icon: path.join(__dirname, '..', 'public', 'favicon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});