
declare module 'escpos-usb' {
  import { USB } from 'escpos';
  
  /**
   * USB device class for escpos
   */
  class USBUSB implements USB {
    constructor(vid: number, pid: number);
    open(callback: (error: Error | null) => void): void;
    close(callback?: (error: Error | null) => void): void;
    write(data: Buffer, callback?: (error: Error | null) => void): void;
  }

  export = USBUSB;
}
