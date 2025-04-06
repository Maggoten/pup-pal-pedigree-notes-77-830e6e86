
import React from 'react';
import { useTheme } from 'next-themes';

interface BreedingJourneyLogoProps {
  className?: string;
  withSlogan?: boolean;
  iconOnly?: boolean;
}

const BreedingJourneyLogo: React.FC<BreedingJourneyLogoProps> = ({ 
  className = '', 
  withSlogan = false,
  iconOnly = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative">
        <img 
          src="/lovable-uploads/15be06f0-e9ee-449e-911e-078b98f91a34.png" 
          alt="Breeding Journey Logo" 
          className="h-10 w-auto"
        />
      </div>
      
      {!iconOnly && (
        <div className="flex flex-col items-start">
          <span className="text-xl font-bold tracking-tight">Breeding Journey</span>
          {withSlogan && (
            <span className="text-xs text-muted-foreground">Where Smart Breeding Begins</span>
          )}
        </div>
      )}
    </div>
  );
};

export default BreedingJourneyLogo;
