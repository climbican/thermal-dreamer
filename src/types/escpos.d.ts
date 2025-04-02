
declare module 'escpos' {
  export interface Adapter {
    open(callback: (error: Error | null) => void): void;
    close(callback?: (error: Error | null) => void): void;
    write(data: Buffer, callback?: (error: Error | null) => void): void;
  }

  export interface USB extends Adapter {
    new (vid: number, pid: number): USB;
  }

  export class Printer {
    constructor(adapter: Adapter);
    
    /**
     * Set text alignment
     * @param align Alignment position
     */
    align(align: 'lt' | 'ct' | 'rt'): Printer;
    
    /**
     * Set text style
     * @param type Style type
     */
    style(type: 'normal' | 'b' | 'u' | 'u2' | 'i' | 'bi'): Printer;
    
    /**
     * Set font type
     * @param family Font family
     */
    font(family: 'a' | 'b' | 'c'): Printer;
    
    /**
     * Print text
     * @param content Text to print
     */
    text(content: string): Printer;
    
    /**
     * Print text with new line
     * @param content Text to print
     */
    println(content: string): Printer;
    
    /**
     * Print a new line
     */
    newLine(): Printer;
    
    /**
     * Print a horizontal line
     */
    drawLine(): Printer;
    
    /**
     * Print a table with custom settings
     */
    tableCustom(columns: Array<{
      text: string;
      width: number;
      align?: 'LEFT' | 'CENTER' | 'RIGHT';
    }>): Printer;
    
    /**
     * Cut paper
     */
    cut(): Printer;
    
    /**
     * Close the adapter
     */
    close(): void;
  }

  /**
   * USB adapter placeholder
   * This is overridden by the USB implementation from escpos-usb
   */
  export let USB: {
    new (vid: number, pid: number): USB;
  };
}
