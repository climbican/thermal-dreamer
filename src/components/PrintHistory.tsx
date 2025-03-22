
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer, Clock, Check, AlertCircle } from "lucide-react";

interface PrintRecord {
  id: string;
  timestamp: number;
  content: {
    header: string;
    total: string;
  };
  status: 'success' | 'error';
  errorMessage?: string;
}

const PrintHistory: React.FC = () => {
  const [history, setHistory] = useState<PrintRecord[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('printHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading print history:', error);
        setHistory([]);
      }
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('printHistory');
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <Card className="w-full h-[300px] glass animate-appear">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Print History</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-center">
            No print history available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full glass animate-appear">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-medium">Print History</CardTitle>
        <Button variant="outline" size="sm" onClick={clearHistory}>
          Clear History
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {history.map((record) => (
              <div 
                key={record.id} 
                className="p-3 rounded-md bg-background border flex items-start gap-3"
              >
                <div className="mt-1">
                  {record.status === 'success' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Printer className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium truncate">{record.content.header.split('\n')[0]}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm mt-1">
                    {record.status === 'success' 
                      ? `Total: $${record.content.total}` 
                      : `Error: ${record.errorMessage}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PrintHistory;
