import React from 'react';
import { PawPrint } from 'lucide-react';
const WelcomeHeader: React.FC = () => {
  return <div className="w-full bg-background border-b py-[10px]">
      <div className="container flex items-center justify-center gap-4 relative">
        <div className="absolute left-0 opacity-10 hidden md:block">
          <PawPrint className="h-20 w-20 text-primary transform -rotate-12" />
        </div>
        
        <div className="flex items-center flex-row-reverse gap-3">
          <img alt="Breeding Journey Logo" src="/lovable-uploads/f9ea5d53-9811-410d-a477-cdf3d45608ff.png" className="h-[190px] w-[175px]" />
          
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-bold font-le-jour text-primary animate-fade-in">
              Breeding Journey
            </h1>
            <p className="text-greige-800 font-glacial animate-fade-in">
              - A breeders best friend
            </p>
          </div>
        </div>
        
        <div className="absolute right-0 opacity-10 hidden md:block">
          <PawPrint className="h-20 w-20 text-primary transform rotate-12" />
        </div>
      </div>
    </div>;
};
export default WelcomeHeader;