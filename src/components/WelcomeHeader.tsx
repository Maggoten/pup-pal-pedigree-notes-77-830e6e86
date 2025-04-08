
import React from 'react';
import { PawPrint } from 'lucide-react';

const WelcomeHeader: React.FC = () => {
  return (
    <div className="w-full bg-background py-6 border-b">
      <div className="container flex items-center justify-center gap-4">
        <div className="absolute left-0 opacity-10 hidden md:block">
          <PawPrint className="h-20 w-20 text-primary transform -rotate-12" />
        </div>
        
        <img 
          src="/lovable-uploads/c1216a3f-35cb-43bb-90db-449c17a1120a.png" 
          alt="Breeding Journey Logo" 
          className="h-32 w-32 animate-pulse duration-5000" 
        />
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold font-le-jour text-primary animate-fade-in">
            Breeding Journey
          </h1>
          <p className="text-black font-glacial animate-fade-in" style={{ animationDelay: "0.3s" }}>
            A breeders best friend
          </p>
        </div>
        
        <div className="absolute right-0 opacity-10 hidden md:block">
          <PawPrint className="h-20 w-20 text-primary transform rotate-12" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
