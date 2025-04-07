
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
  // Calculate new sizes (20% bigger)
  const baseCompactSize = Math.round(8 * 1.2);
  const baseNormalSize = Math.round(10 * 1.2);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${compact ? `w-${baseCompactSize} h-${baseCompactSize}` : `w-${baseNormalSize} h-${baseNormalSize}`}`}>
        <img 
          src="/lovable-uploads/d966c585-07ce-4936-b57b-d3e1d61993e9.png" 
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
