
import React from 'react';
import { Printer } from "lucide-react";

const AppHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-6 px-8 mb-8">
      <div className="flex items-center gap-2">
        <Printer className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">Thermal Receipt Printer</h1>
      </div>
      <div className="text-sm text-muted-foreground">
        ESC/POS Compatible
      </div>
    </header>
  );
};

export default AppHeader;
