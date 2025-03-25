
import ThermalPrinter from 'node-thermal-printer';
import PrinterTypes from 'node-thermal-printer';
import * as escpos from 'escpos';
import * as escposUSB from 'escpos-usb';

// Set up escpos USB
escpos.USB = escposUSB;

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

interface PrintResult {
  success: boolean;
  message: string;
}

export async function testUSBPrinter(config: PrinterConfig): Promise<PrintResult> {
  return new Promise((resolve) => {
    try {
      const [_, vendorId, productId] = config.interface.split(':');
      
      const device = new escpos.USB(
        parseInt(vendorId, 16), 
        parseInt(productId, 16)
      );
      
      const printer = new escpos.Printer(device);
      
      device.open(function(err: Error | null) {
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
    } catch (error: any) {
      console.error('Error in USB test:', error);
      return resolve({ success: false, message: `USB printer error: ${error.message}` });
    }
  });
}

export async function printUSBReceipt(config: PrinterConfig, content: ReceiptContent): Promise<PrintResult> {
  return new Promise((resolve) => {
    try {
      const [_, vendorId, productId] = config.interface.split(':');
      
      const device = new escpos.USB(
        parseInt(vendorId, 16), 
        parseInt(productId, 16)
      );
      
      const printer = new escpos.Printer(device);
      
      device.open(function(err: Error | null) {
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
    } catch (error: any) {
      console.error('Error in USB printing:', error);
      return resolve({ success: false, message: `USB printer error: ${error.message}` });
    }
  });
}

export async function testThermalPrinter(config: PrinterConfig): Promise<PrintResult> {
  try {
    const printer = new ThermalPrinter.printer({
      type: PrinterTypes.types[config.type],
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
  } catch (error: any) {
    console.error('Error testing printer:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

export async function printThermalReceipt(config: PrinterConfig, content: ReceiptContent): Promise<PrintResult> {
  try {
    const printer = new ThermalPrinter.printer({
      type: PrinterTypes.types[config.type],
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
  } catch (error: any) {
    console.error('Error printing receipt:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}
