
interface PrinterConfig {
  type: string;
  interface: string;
  connectionType: 'serial' | 'usb';
}

interface ReceiptItem {
  id: string;
  name: string;
  qty: number;
  price: string;
}

interface ReceiptContent {
  logo?: string;
  header?: string;
  items?: ReceiptItem[];
  total?: string;
  footer?: string;
}

interface PrintResult {
  success: boolean;
  message: string;
}

interface ElectronAPI {
  getPorts: () => Promise<Array<{
    path: string;
    manufacturer?: string;
    serialNumber?: string;
    pnpId?: string;
    locationId?: string;
    productId?: string;
    vendorId?: string;
    type?: string;
  }>>;
  testPrinter: (config: PrinterConfig) => Promise<PrintResult>;
  printReceipt: (data: { config: PrinterConfig; content: ReceiptContent }) => Promise<PrintResult>;
}

interface Window {
  electronAPI: ElectronAPI;
}
