
interface ElectronAPI {
  getPorts: () => Promise<any[]>;
  testPrinter: (config: any) => Promise<{ success: boolean; message: string }>;
  printReceipt: (data: any) => Promise<{ success: boolean; message: string }>;
}

interface Window {
  electronAPI: ElectronAPI;
}
