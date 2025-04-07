
import React from 'react';

interface BreedingJourneyLogoProps {
  className?: string;
  showSlogan?: boolean;
  compact?: boolean;
}

const BreedingJourneyLogo: React.FC<BreedingJourneyLogoProps> = ({ 
  className = '', 
  showSlogan = false,
  compact = false
}) => {
  // Calculate new sizes based on 50% increase
  const baseWidth = compact ? 8 : 10;
  const baseHeight = compact ? 8 : 10;
  const newWidth = baseWidth * 1.5;
  const newHeight = baseHeight * 1.5;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative w-${newWidth} h-${newHeight}`} style={{ width: `${newWidth}rem`, height: `${newHeight}rem` }}>
        <img 
          src="/lovable-uploads/0435bbbb-272c-4b9e-b210-c70112066294.png" 
          alt="Breeding Journey Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className={`font-le-jour font-bold tracking-tight ${compact ? 'text-xl' : 'text-2xl'}`}>Breeding Journey</span>
        {showSlogan && (
          <span className="text-xs text-muted-foreground">Where Smart Breeding Begins</span>
        )}
      </div>
    </div>
  );
};

export default BreedingJourneyLogo;
