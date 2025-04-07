
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
  // Calculate the new dimensions (20% bigger)
  const baseWidth = compact ? 8 : 10;
  const baseHeight = compact ? 8 : 10;
  const newWidth = baseWidth * 1.2;
  const newHeight = baseHeight * 1.2;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative w-${newWidth} h-${newHeight}`} style={{ width: `${newWidth}rem`, height: `${newHeight}rem` }}>
        <img 
          src="/lovable-uploads/2b559bb9-22c4-4aa5-aa5a-059da0b6c483.png" 
          alt="Breeding Journey Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className={`font-le-jour font-bold tracking-tight ${compact ? 'text-lg' : 'text-xl'}`}>Breeding Journey</span>
        {showSlogan && (
          <span className="text-xs text-muted-foreground">Where Smart Breeding Begins</span>
        )}
      </div>
    </div>
  );
};

export default BreedingJourneyLogo;
