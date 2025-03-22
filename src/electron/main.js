const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;
const SerialPort = require('serialport');

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
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../public/app-icon.png')
  });

  // Load the index.html from the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../../dist/index.html'),
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

// List all available ports
ipcMain.handle('get-ports', async () => {
  try {
    const ports = await SerialPort.SerialPort.list();
    return ports;
  } catch (error) {
    console.error('Error listing serial ports:', error);
    return [];
  }
});

// Connect to a printer and test it
ipcMain.handle('test-printer', async (_, config) => {
  try {
    const printer = new ThermalPrinter({
      type: PrinterTypes[config.type],
      interface: config.interface,
      options: {
        timeout: 3000
      }
    });

    const isConnected = await printer.isPrinterConnected();
    
    if (isConnected) {
      await printer.print("Thermal Printer Test");
      await printer.cut();
      return { success: true, message: 'Printer test successful!' };
    } else {
      return { success: false, message: 'Printer not connected.' };
    }
  } catch (error) {
    console.error('Error testing printer:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
});

// Print content
ipcMain.handle('print-receipt', async (_, { config, content }) => {
  try {
    const printer = new ThermalPrinter({
      type: PrinterTypes[config.type],
      interface: config.interface,
      options: {
        timeout: 3000
      }
    });

    const isConnected = await printer.isPrinterConnected();
    
    if (isConnected) {
      // Parse and print the content
      if (content.logo) {
        await printer.printImage(content.logo);
      }
      
      if (content.header) {
        await printer.alignCenter();
        await printer.bold(true);
        await printer.println(content.header);
        await printer.bold(false);
        await printer.newLine();
      }

      await printer.alignLeft();
      
      if (content.items && content.items.length) {
        for (const item of content.items) {
          await printer.tableCustom([
            { text: item.name, width: 0.6 },
            { text: `${item.qty}x`, width: 0.1, align: "RIGHT" },
            { text: item.price, width: 0.3, align: "RIGHT" }
          ]);
        }
        await printer.drawLine();
      }

      if (content.total) {
        await printer.alignRight();
        await printer.bold(true);
        await printer.println(`TOTAL: ${content.total}`);
        await printer.bold(false);
        await printer.newLine();
      }

      if (content.footer) {
        await printer.alignCenter();
        await printer.println(content.footer);
      }

      await printer.cut();
      return { success: true, message: 'Receipt printed successfully!' };
    } else {
      return { success: false, message: 'Printer not connected.' };
    }
  } catch (error) {
    console.error('Error printing receipt:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
});
