const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object
let mainWindow;

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#ffffff',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src/electron/preload.js')
    },
    icon: path.join(__dirname, 'public/app-icon.png')
  });

  // Load the index.html from the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (mainWindow === null) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay open
  // until the user explicitly quits
  if (process.platform !== 'darwin') app.quit();
});
