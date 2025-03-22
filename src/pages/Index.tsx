
import React, { useState, useEffect } from 'react';
import PrinterConnectionForm from "@/components/PrinterConnectionForm";
import ReceiptEditor from "@/components/ReceiptEditor";
import ReceiptPreview from "@/components/ReceiptPreview";
import PrintHistory from "@/components/PrintHistory";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/components/ui/use-toast";

interface PrinterConfig {
  type: string;
  interface: string;
}

interface ReceiptItem {
  id: string;
  name: string;
  qty: number;
  price: string;
}

interface ReceiptContent {
  header: string;
  items: ReceiptItem[];
  total: string;
  footer: string;
  logo?: string;
}

// Define interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      getPorts: () => Promise<any[]>;
      testPrinter: (config: PrinterConfig) => Promise<{ success: boolean; message: string }>;
      printReceipt: (data: { config: PrinterConfig; content: ReceiptContent }) => Promise<{ success: boolean; message: string }>;
    };
  }
}

const Index = () => {
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptContent>({
    header: 'My Store\n123 Main St',
    items: [{ id: '1', name: 'Product 1', qty: 1, price: '10.00' }],
    total: '10.00',
    footer: 'Thank you for your purchase!\nPlease come again.'
  });
  const { toast } = useToast();

  // Check if electronAPI is available
  const isElectron = typeof window.electronAPI !== 'undefined';

  const handlePrinterConnect = (config: PrinterConfig) => {
    setPrinterConfig(config);
    setIsConnected(true);
  };

  const handlePrint = async (content: ReceiptContent) => {
    setReceiptData(content);
    
    if (!printerConfig) {
      toast({
        title: "Error",
        description: "Printer not connected",
        variant: "destructive"
      });
      return;
    }

    try {
      // For web preview, we'll mock this
      if (!isElectron) {
        // Simulate printing
        setTimeout(() => {
          const printRecord = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            content: {
              header: content.header,
              total: content.total
            },
            status: 'success' as const
          };
          
          const savedHistory = localStorage.getItem('printHistory');
          const history = savedHistory ? JSON.parse(savedHistory) : [];
          localStorage.setItem('printHistory', JSON.stringify([printRecord, ...history]));
          
          toast({
            title: "Success",
            description: "Receipt printed in simulation mode!"
          });
        }, 1500);
        return;
      }

      const result = await window.electronAPI.printReceipt({
        config: printerConfig,
        content
      });

      const printRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        content: {
          header: content.header,
          total: content.total
        },
        status: result.success ? 'success' as const : 'error' as const,
        errorMessage: result.success ? undefined : result.message
      };
      
      const savedHistory = localStorage.getItem('printHistory');
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      localStorage.setItem('printHistory', JSON.stringify([printRecord, ...history]));

      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 pb-12">
        <AppHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className="space-y-8">
              <PrinterConnectionForm 
                onConnect={handlePrinterConnect} 
                isConnected={isConnected}
              />
              
              <PrintHistory />
            </div>
          </div>
          
          <div className="md:col-span-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <ReceiptEditor 
                  onPrint={handlePrint} 
                  disabled={!isConnected && isElectron}
                />
              </div>
              
              <div className="lg:col-span-4">
                <ReceiptPreview 
                  header={receiptData.header}
                  items={receiptData.items}
                  total={receiptData.total}
                  footer={receiptData.footer}
                  logo={receiptData.logo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
