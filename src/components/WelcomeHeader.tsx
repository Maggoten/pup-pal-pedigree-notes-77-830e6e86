
import React from 'react';
import { PawPrint } from 'lucide-react';

const WelcomeHeader: React.FC = () => {
  return (
    <div className="w-full bg-background py-4 border-b">
      <div className="container flex items-center justify-start gap-4">
        <div className="absolute left-0 opacity-10 hidden md:block">
          <PawPrint className="h-20 w-20 text-primary transform -rotate-12" />
        </div>
        
        <div className="flex flex-col justify-start items-start">
          <h1 className="text-2xl md:text-3xl font-bold font-le-jour text-primary animate-fade-in">
            Breeding Journey
          </h1>
          <p className="text-black font-glacial animate-fade-in ml-0.5" style={{ animationDelay: "0.3s" }}>
            - A breeders best friend
          </p>
        </div>
        
        <div className="flex-grow"></div>
        
        <img 
          src="/lovable-uploads/c1216a3f-35cb-43bb-90db-449c17a1120a.png" 
          alt="Breeding Journey Logo" 
          className="h-20 w-20" 
        />
        
        <div className="absolute right-0 opacity-10 hidden md:block">
          <PawPrint className="h-20 w-20 text-primary transform rotate-12" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
