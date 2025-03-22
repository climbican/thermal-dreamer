
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  React.useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="text-center max-w-md animate-appear">
        <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-8 flex items-center justify-center">
          <FileX className="h-10 w-10 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Button asChild className="min-w-[140px]">
          <a href="/">Return Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
