
import { ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import * as usb from 'usb';
import { 
  testUSBPrinter, 
  printUSBReceipt, 
  testThermalPrinter, 
  printThermalReceipt 
} from './printer-utils';

interface PrinterConfig {
  type: string;
  interface: string;
  connectionType: string;
}

interface ReceiptContent {
  logo?: string;
  header?: string;
  items?: Array<{
    name: string;
    qty: number;
    price: string;
  }>;
  total?: string;
  footer?: string;
}

export function registerIpcHandlers(): void {
  // Get available ports and USB devices
  ipcMain.handle('get-ports', async () => {
    try {
      const ports = await SerialPort.list();
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

  // Test printer connection
  ipcMain.handle('test-printer', async (_, config: PrinterConfig) => {
    try {
      if (config.connectionType === 'usb') {
        return await testUSBPrinter(config);
      } else {
        return await testThermalPrinter(config);
      }
    } catch (error: any) {
      console.error('Error testing printer:', error);
      return { success: false, message: `Error: ${error.message}` };
    }
  });

  // Print receipt
  ipcMain.handle('print-receipt', async (_, { config, content }: { config: PrinterConfig, content: ReceiptContent }) => {
    try {
      if (config.connectionType === 'usb') {
        return await printUSBReceipt(config, content);
      } else {
        return await printThermalReceipt(config, content);
      }
    } catch (error: any) {
      console.error('Error printing receipt:', error);
      return { success: false, message: `Error: ${error.message}` };
    }
  });
}
