const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  selectRomFile: () => ipcRenderer.invoke('select-rom-file'),
  selectImageFile: () => ipcRenderer.invoke('select-image-file')
});
