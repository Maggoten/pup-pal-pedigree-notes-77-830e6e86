
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
  // Calculate sizes at 1/3 of current size
  const baseWidth = compact ? 10 : 13; // 32/3 ≈ 10, 40/3 ≈ 13 
  const baseHeight = compact ? 10 : 13; // 32/3 ≈ 10, 40/3 ≈ 13

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative w-${baseWidth} h-${baseHeight}`}>
        <img 
          alt="Breeding Journey Logo" 
          className="w-full h-full object-contain" 
          src="/lovable-uploads/c9617cba-696b-4f69-b5a2-03b55eb6b15c.png" 
        />
      </div>
      <div className="flex flex-col">
        <span className={`font-le-jour font-bold tracking-tight ${compact ? 'text-lg' : 'text-xl'}`}>Breeding Journey</span>
        {showSlogan && <span className="text-xs text-muted-foreground">Where Smart Breeding Begins</span>}
      </div>
    </div>
  );
};

export default BreedingJourneyLogo;
