const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  // Criar a janela do navegador
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    frame: false, // Remove a barra de título e bordas
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      devTools: false // Desabilita o DevTools
    },
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    kiosk: true, // Modo kiosk (fullscreen sem possibilidade de sair)
    alwaysOnTop: true,
    skipTaskbar: false
  });

  // Remover menus padrão (File, Edit, View, etc.)
  Menu.setApplicationMenu(null);

  // Carregar a aplicação
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.setFullScreen(true);
  });

  // Desabilitar DevTools completamente
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  // Prevenir clique direito
  mainWindow.webContents.on('context-menu', (event) => {
    event.preventDefault();
  });

  // Handler único para todos os atalhos de teclado
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Prevenir abertura do DevTools
    if (input.key === 'F12' || 
        (input.control && input.shift && input.key === 'I') ||
        (input.control && input.shift && input.key === 'C') ||
        (input.control && input.key === 'U')) {
      event.preventDefault();
    }
    
    // Atalho para sair (Ctrl+Q ou Alt+F4)
    if ((input.control && input.key === 'q') || 
        (input.alt && input.key === 'F4')) {
      app.quit();
    }
    
    // Atalho para sair do modo kiosk (Escape)
    if (input.key === 'Escape') {
      if (mainWindow.isKiosk()) {
        mainWindow.setKiosk(false);
        mainWindow.setFullScreen(false);
      } else {
        mainWindow.setKiosk(true);
        mainWindow.setFullScreen(true);
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Este método será chamado quando o Electron terminar de inicializar
app.whenReady().then(createWindow);

// Sair quando todas as janelas estiverem fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('select-rom-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'SNES ROMs', extensions: ['smc', 'sfc', 'fig'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('select-image-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? null : result.filePaths[0];
});
