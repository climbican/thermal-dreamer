
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getPorts: () => ipcRenderer.invoke('get-ports'),
  testPrinter: (config) => ipcRenderer.invoke('test-printer', config),
  printReceipt: (data) => ipcRenderer.invoke('print-receipt', data)
});
