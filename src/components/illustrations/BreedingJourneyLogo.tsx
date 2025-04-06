
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
  // Calculate sizes with 100% increase
  const baseWidth = compact ? 16 : 20; // 8 -> 16, 10 -> 20
  const baseHeight = compact ? 16 : 20; // 8 -> 16, 10 -> 20

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative w-${baseWidth} h-${baseHeight}`}>
        <img 
          src="/lovable-uploads/cadcb216-d59c-418a-a7dd-60e66ec57fcc.png" 
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
