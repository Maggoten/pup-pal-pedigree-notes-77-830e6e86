
import React from 'react';
import { PawPrint } from 'lucide-react';

const WelcomeHeader: React.FC = () => {
  return (
    <div className="w-full bg-background py-4 border-b">
      <div className="container flex items-center justify-between gap-4">
        <div className="absolute left-0 opacity-10 hidden md:block">
          <PawPrint className="h-20 w-20 text-primary transform -rotate-12" />
        </div>
        
        {/* Logo and text in same row */}
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/c1216a3f-35cb-43bb-90db-449c17a1120a.png" 
            alt="Breeding Journey Logo" 
            className="h-30 w-30" 
            style={{ height: "4.5rem", width: "4.5rem" }}  /* 1.5x the original size */
          />
          
          <div className="flex flex-col justify-start items-start">
            <h1 className="text-2xl md:text-3xl font-bold font-le-jour text-primary animate-fade-in">
              Breeding Journey
            </h1>
            <p className="text-black font-glacial animate-fade-in ml-0.5" style={{ animationDelay: "0.3s" }}>
              - A breeders best friend
            </p>
          </div>
        </div>
        
        <div className="flex-grow"></div>
        
        <div className="absolute right-0 opacity-10 hidden md:block">
          <PawPrint className="h-20 w-20 text-primary transform rotate-12" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
