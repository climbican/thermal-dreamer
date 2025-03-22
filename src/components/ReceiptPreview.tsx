
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ReceiptItem {
  id: string;
  name: string;
  qty: number;
  price: string;
}

interface ReceiptPreviewProps {
  header: string;
  items: ReceiptItem[];
  total: string;
  footer: string;
  logo?: string;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ 
  header, 
  items, 
  total, 
  footer,
  logo
}) => {
  return (
    <Card className="w-full max-w-sm bg-white animate-appear shadow-soft">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-medium text-center">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-4 font-mono text-sm receipt-preview overflow-auto max-h-[500px]">
          {/* Logo */}
          {logo && (
            <div className="flex justify-center mb-4">
              <img 
                src={logo} 
                alt="Receipt logo" 
                className="max-h-16 max-w-full"
              />
            </div>
          )}
          
          {/* Header */}
          <div className="text-center mb-4 whitespace-pre-line">
            <p className="font-bold">{header}</p>
          </div>
          
          <Separator className="my-2" />
          
          {/* Date */}
          <div className="text-xs mb-4">
            <p>{new Date().toLocaleString()}</p>
          </div>
          
          {/* Items */}
          <div className="mb-4">
            <div className="grid grid-cols-12 gap-1 mb-1 font-bold text-xs">
              <div className="col-span-7">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-3 text-right">Price</div>
            </div>
            
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-1 text-xs py-1">
                <div className="col-span-7 truncate">{item.name}</div>
                <div className="col-span-2 text-right">{item.qty}x</div>
                <div className="col-span-3 text-right">${item.price}</div>
              </div>
            ))}
          </div>
          
          <Separator className="my-2" />
          
          {/* Total */}
          <div className="text-right mb-4">
            <p className="font-bold">TOTAL: ${total}</p>
          </div>
          
          <Separator className="my-2" />
          
          {/* Footer */}
          <div className="text-center text-xs whitespace-pre-line">
            <p>{footer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptPreview;
