
import { app } from 'electron';
import { createWindow } from './window-manager';
import { registerIpcHandlers } from './ipc-handlers';

// Register all IPC handlers
registerIpcHandlers();

// Application lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!getMainWindow()) createWindow();
  });
});

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

// This is necessary to prevent TypeScript error
function getMainWindow() {
  return require('./window-manager').getMainWindow();
}
