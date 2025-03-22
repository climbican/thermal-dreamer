
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Printer, Save, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

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
  logo?: string; // base64 encoded image
}

interface ReceiptEditorProps {
  onPrint: (content: ReceiptContent) => void;
  disabled: boolean;
}

const ReceiptEditor: React.FC<ReceiptEditorProps> = ({ onPrint, disabled }) => {
  const [header, setHeader] = useState('My Store\n123 Main St');
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', name: 'Product 1', qty: 1, price: '10.00' },
  ]);
  const [total, setTotal] = useState('10.00');
  const [footer, setFooter] = useState('Thank you for your purchase!\nPlease come again.');
  const [logoImage, setLogoImage] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const handleAddItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      name: 'New Item',
      qty: 1,
      price: '0.00'
    };
    setItems([...items, newItem]);
    recalculateTotal([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    recalculateTotal(updatedItems);
  };

  const handleItemChange = (id: string, field: keyof ReceiptItem, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updatedItems);
    
    if (field === 'qty' || field === 'price') {
      recalculateTotal(updatedItems);
    }
  };

  const recalculateTotal = (currentItems: ReceiptItem[]) => {
    const sum = currentItems.reduce((acc, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = item.qty || 0;
      return acc + (price * qty);
    }, 0);
    
    setTotal(sum.toFixed(2));
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file",
          description: "Only image files are allowed",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setLogoImage(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setLogoImage(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    const receiptContent: ReceiptContent = {
      header,
      items,
      total,
      footer,
      logo: logoImage
    };
    
    onPrint(receiptContent);
  };

  const handleSaveTemplate = () => {
    const template = {
      header,
      items,
      total,
      footer,
      logo: logoImage
    };
    
    localStorage.setItem('receiptTemplate', JSON.stringify(template));
    
    toast({
      title: "Template saved",
      description: "Your receipt template has been saved"
    });
  };

  const loadSavedTemplate = () => {
    const savedTemplate = localStorage.getItem('receiptTemplate');
    if (savedTemplate) {
      try {
        const template = JSON.parse(savedTemplate) as ReceiptContent;
        setHeader(template.header || '');
        setItems(template.items || []);
        setTotal(template.total || '0.00');
        setFooter(template.footer || '');
        setLogoImage(template.logo);
        
        toast({
          title: "Template loaded",
          description: "Saved template has been loaded"
        });
      } catch (error) {
        console.error('Error loading template:', error);
        toast({
          title: "Error",
          description: "Failed to load saved template",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "No saved template",
        description: "No saved template found"
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl overflow-hidden glass animate-appear">
      <CardHeader>
        <CardTitle className="text-2xl font-medium">Receipt Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-all",
            "hover:border-primary/50 cursor-pointer",
            logoImage ? "h-48" : "h-32"
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleLogoDrop}
          onClick={() => document.getElementById('logo-upload')?.click()}
        >
          {logoImage ? (
            <div className="flex flex-col items-center">
              <img 
                src={logoImage} 
                alt="Logo preview" 
                className="max-h-32 max-w-full object-contain mb-2"
              />
              <p className="text-sm text-muted-foreground">Click or drag to change logo</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Image className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="font-medium">Add Logo</p>
              <p className="text-sm text-muted-foreground">Click or drag and drop an image</p>
            </div>
          )}
          <input 
            id="logo-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleLogoSelect}
          />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <Label htmlFor="header">Header</Label>
          <Textarea 
            id="header" 
            placeholder="Store name, address, etc." 
            value={header} 
            onChange={(e) => setHeader(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Items */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Items</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddItem}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input 
                    placeholder="Item name" 
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                  />
                </div>
                <div className="w-16">
                  <Input 
                    type="number" 
                    placeholder="Qty" 
                    value={item.qty}
                    min="1"
                    onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="w-24">
                  <Input 
                    placeholder="Price" 
                    value={item.price}
                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-end items-center gap-2">
          <Label htmlFor="total" className="font-medium">Total:</Label>
          <Input 
            id="total" 
            className="w-32 text-right" 
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="space-y-2">
          <Label htmlFor="footer">Footer</Label>
          <Textarea 
            id="footer" 
            placeholder="Thank you message, return policy, etc." 
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSaveTemplate}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button 
            variant="outline" 
            onClick={loadSavedTemplate}
          >
            Load Saved
          </Button>
        </div>
        <Button 
          onClick={handlePrint} 
          disabled={disabled}
          className="flex items-center gap-1"
        >
          <Printer className="h-4 w-4" /> Print Receipt
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReceiptEditor;
