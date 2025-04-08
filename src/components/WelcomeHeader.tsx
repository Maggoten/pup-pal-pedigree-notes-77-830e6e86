
import React from 'react';
import { PawPrint } from 'lucide-react';
import BreedingJourneyLogo from './BreedingJourneyLogo';

const WelcomeHeader: React.FC = () => {
  return (
    <div className="w-full bg-background py-6 border-b transition-all duration-300 hover:shadow-sm">
      <div className="container flex items-center justify-between gap-4 relative">
        {/* Decorative element - left paw print */}
        <div className="absolute left-0 opacity-10 hidden md:block">
          <PawPrint className="h-20 w-20 text-primary transform -rotate-12" />
        </div>
        
        <div className="flex items-center gap-4 transition-transform duration-300 hover:translate-x-1">
          <img 
            src="/lovable-uploads/c1216a3f-35cb-43bb-90db-449c17a1120a.png" 
            alt="Breeding Journey Logo" 
            className="h-16 w-16 md:h-20 md:w-20 object-contain" 
          />
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-le-jour text-primary animate-fade-in tracking-tight">
              Breeding Journey
            </h1>
            <p className="text-muted-foreground font-glacial animate-fade-in" style={{ animationDelay: "0.2s" }}>
              - A breeder's best friend
            </p>
          </div>
        </div>
        
        {/* Right side content - can be used for additional elements later */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-sm text-muted-foreground bg-secondary/40 px-3 py-1 rounded-full animate-scale-in" style={{ animationDelay: "0.3s" }}>
            Track • Plan • Manage
          </div>
        </div>
        
        {/* Decorative element - right paw print */}
        <div className="absolute right-0 opacity-10 hidden md:block">
          <PawPrint className="h-20 w-20 text-primary transform rotate-12" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
