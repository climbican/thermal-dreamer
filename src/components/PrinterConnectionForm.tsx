
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Port {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  productId?: string;
  vendorId?: string;
  type?: string;
}

interface PrinterConfig {
  type: string;
  interface: string;
  connectionType: 'serial' | 'usb';
}

interface PrinterConnectionFormProps {
  onConnect: (config: PrinterConfig) => void;
  isConnected: boolean;
}

const PrinterConnectionForm: React.FC<PrinterConnectionFormProps> = ({ onConnect, isConnected }) => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingPrinter, setTestingPrinter] = useState(false);
  const [printerType, setPrinterType] = useState('EPSON');
  const [portPath, setPortPath] = useState('');
  const [connectionType, setConnectionType] = useState<'serial' | 'usb'>('serial');
  const { toast } = useToast();

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        // For web preview, we'll mock this data
        if (typeof window.electronAPI === 'undefined') {
          setTimeout(() => {
            setPorts([
              { path: 'COM1', manufacturer: 'Sample Manufacturer' },
              { path: 'COM2', manufacturer: 'Sample Manufacturer' },
              { path: '/dev/usb/lp0', manufacturer: 'Sample Manufacturer' },
              { path: 'usb:0x04b8:0x0202', manufacturer: 'Epson USB Device', type: 'usb' },
              { path: 'usb:0x04b8:0x0e03', manufacturer: 'Star USB Device', type: 'usb' }
            ]);
            setLoading(false);
          }, 1000);
          return;
        }

        const availablePorts = await window.electronAPI.getPorts();
        setPorts(availablePorts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ports:', error);
        toast({
          title: "Error",
          description: "Failed to fetch available ports. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchPorts();
  }, [toast]);

  const handleTestPrinter = async () => {
    if (!portPath) {
      toast({
        title: "Error",
        description: "Please select a port",
        variant: "destructive"
      });
      return;
    }

    setTestingPrinter(true);

    try {
      // For web preview, we'll mock this
      if (typeof window.electronAPI === 'undefined') {
        setTimeout(() => {
          toast({
            title: "Success",
            description: "Printer test successful in simulation mode!"
          });
          setTestingPrinter(false);
        }, 1500);
        return;
      }

      const config = {
        type: printerType,
        interface: portPath,
        connectionType: connectionType
      };

      const result = await window.electronAPI.testPrinter(config);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
        onConnect(config);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error testing printer:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setTestingPrinter(false);
    }
  };

  // Filter ports based on the selected connection type
  const filteredPorts = ports.filter(port => 
    connectionType === 'usb' 
      ? port.type === 'usb' || port.path.startsWith('usb:') 
      : !port.path.startsWith('usb:') && port.type !== 'usb'
  );

  return (
    <Card className="w-full max-w-md animate-appear glass">
      <CardHeader>
        <CardTitle className="text-2xl font-medium">Printer Connection</CardTitle>
        <CardDescription>
          Connect to your ESC/POS thermal printer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="serial" value={connectionType} onValueChange={(value) => setConnectionType(value as 'serial' | 'usb')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="serial">Serial Port</TabsTrigger>
            <TabsTrigger value="usb">USB Device</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="printer-type">Printer Type</Label>
          <Select value={printerType} onValueChange={setPrinterType}>
            <SelectTrigger id="printer-type" className="w-full">
              <SelectValue placeholder="Select printer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EPSON">Epson</SelectItem>
              <SelectItem value="STAR">Star</SelectItem>
              <SelectItem value="BIXOLON">Bixolon</SelectItem>
              <SelectItem value="CITIZEN">Citizen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="port">{connectionType === 'usb' ? 'USB Device' : 'Port'}</Label>
          {loading ? (
            <div className="h-10 w-full bg-secondary animate-pulse rounded-md"></div>
          ) : (
            <Select value={portPath} onValueChange={setPortPath}>
              <SelectTrigger id="port" className="w-full">
                <SelectValue placeholder={`Select ${connectionType === 'usb' ? 'USB device' : 'port'}`} />
              </SelectTrigger>
              <SelectContent>
                {filteredPorts.length > 0 ? (
                  filteredPorts.map((port) => (
                    <SelectItem key={port.path} value={port.path}>
                      {port.path} {port.manufacturer ? `(${port.manufacturer})` : ''}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="none">
                    No {connectionType === 'usb' ? 'USB devices' : 'ports'} found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            {connectionType === 'usb' 
              ? 'If your USB printer is not showing up, ensure it\'s properly connected and powered on.' 
              : 'If your printer is not showing up, ensure it\'s properly connected and powered on.'}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={testingPrinter} onClick={() => window.location.reload()}>
          Refresh
        </Button>
        <Button 
          onClick={handleTestPrinter} 
          disabled={!portPath || testingPrinter} 
          className={isConnected ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {testingPrinter ? "Testing..." : isConnected ? "Connected" : "Test Connection"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PrinterConnectionForm;
