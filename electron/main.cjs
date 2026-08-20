const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let backend;

function waitForBackend(url, attempts = 40) {
  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, response => { response.resume(); resolve(); });
      request.on('error', () => {
        if (attempts-- <= 0) reject(new Error('Backend did not start')); else setTimeout(check, 250);
      });
    };
    check();
  });
}

async function createWindow() {
  const isPackaged = app.isPackaged;
  const root = isPackaged ? process.resourcesPath : path.join(__dirname, '..');
  const server = path.join(root, 'backend', 'server.js');
  const browserPath = isPackaged ? path.join(process.resourcesPath, 'playwright-browsers') : '0';
  backend = spawn(process.execPath, [server], {
    cwd: root,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', NODE_ENV: 'production', PORT: '3006', PLAYWRIGHT_BROWSERS_PATH: browserPath },
    windowsHide: true,
    stdio: 'ignore'
  });
  backend.on('error', error => dialog.showErrorBox('Backend error', error.message));
  try { await waitForBackend('http://127.0.0.1:3006/api/health'); } catch (error) { dialog.showErrorBox('Startup failed', error.message); return; }

  const window = new BrowserWindow({ width: 1440, height: 900, minWidth: 1000, minHeight: 700, backgroundColor: '#070b18', webPreferences: { contextIsolation: true, nodeIntegration: false } });
  if (isPackaged) await window.loadFile(path.join(root, 'frontend', 'dist', 'index.html'));
  else await window.loadURL('http://localhost:5176');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (backend) backend.kill(); if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { if (backend) backend.kill(); });
