
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
  // Calculate new sizes (250% bigger - 3.5 times the original size)
  const baseCompactSize = Math.round(8 * 3.5);
  const baseNormalSize = Math.round(10 * 3.5);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${compact ? `w-${baseCompactSize} h-${baseCompactSize}` : `w-${baseNormalSize} h-${baseNormalSize}`}`}>
        <img 
          src="/lovable-uploads/048d1d94-ecb8-4790-8b0b-6964d7fd8bfb.png" 
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
