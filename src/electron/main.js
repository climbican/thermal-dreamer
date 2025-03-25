const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;
const SerialPort = require('serialport');
const usb = require('usb');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// Keep a global reference of the window object
let mainWindow;

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
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('get-ports', async () => {
  try {
    const ports = await SerialPort.SerialPort.list();
    const usbDevices = usb.getDeviceList().map(device => {
      return {
        path: `usb:${device.deviceDescriptor.idVendor}:${device.deviceDescriptor.idProduct}`,
        vendorId: device.deviceDescriptor.idVendor,
        productId: device.deviceDescriptor.idProduct,
        manufacturer: 'USB Device',
        type: 'usb'
      };
    });
    return [...ports, ...usbDevices];
  } catch (error) {
    console.error('Error listing devices:', error);
    return [];
  }
});

ipcMain.handle('test-printer', async (_, config) => {
  try {
    if (config.connectionType === 'usb') {
      return await testUSBPrinter(config);
    } else {
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
    }
  } catch (error) {
    console.error('Error testing printer:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
});

ipcMain.handle('print-receipt', async (_, { config, content }) => {
  try {
    if (config.connectionType === 'usb') {
      return await printUSBReceipt(config, content);
    } else {
      const printer = new ThermalPrinter({
        type: PrinterTypes[config.type],
        interface: config.interface,
        options: {
          timeout: 3000
        }
      });

      const isConnected = await printer.isPrinterConnected();
      
      if (isConnected) {
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
    }
  } catch (error) {
    console.error('Error printing receipt:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
});

// Helper functions
async function testUSBPrinter(config) {
  return new Promise((resolve, reject) => {
    try {
      const [_, vendorId, productId] = config.interface.split(':');
      
      const device = new escpos.USB(
        parseInt(vendorId, 16), 
        parseInt(productId, 16)
      );
      
      const printer = new escpos.Printer(device);
      
      device.open(function(err) {
        if (err) {
          console.error('Error opening USB device:', err);
          return resolve({ success: false, message: `Error connecting to USB printer: ${err.message}` });
        }
        
        printer
          .font('a')
          .align('ct')
          .text('USB Printer Test')
          .text('Test Successful!')
          .cut()
          .close();
          
        return resolve({ success: true, message: 'USB printer test successful!' });
      });
    } catch (error) {
      console.error('Error in USB test:', error);
      return resolve({ success: false, message: `USB printer error: ${error.message}` });
    }
  });
}

async function printUSBReceipt(config, content) {
  return new Promise((resolve, reject) => {
    try {
      const [_, vendorId, productId] = config.interface.split(':');
      
      const device = new escpos.USB(
        parseInt(vendorId, 16), 
        parseInt(productId, 16)
      );
      
      const printer = new escpos.Printer(device);
      
      device.open(function(err) {
        if (err) {
          console.error('Error opening USB device:', err);
          return resolve({ success: false, message: `Error connecting to USB printer: ${err.message}` });
        }
        
        let p = printer.font('a');
        
        if (content.header) {
          p.align('ct').style('b').text(content.header).style('normal').text('');
        }
        
        p.align('lt');
        
        if (content.items && content.items.length) {
          content.items.forEach(item => {
            p.text(`${item.name} ${item.qty}x ${item.price}`);
          });
          p.text('--------------------------------');
        }
        
        if (content.total) {
          p.align('rt').style('b').text(`TOTAL: ${content.total}`).style('normal');
        }
        
        if (content.footer) {
          p.align('ct').text('').text(content.footer);
        }
        
        p.cut().close();
        
        return resolve({ success: true, message: 'Receipt printed successfully to USB printer!' });
      });
    } catch (error) {
      console.error('Error in USB printing:', error);
      return resolve({ success: false, message: `USB printer error: ${error.message}` });
    }
  });
}
