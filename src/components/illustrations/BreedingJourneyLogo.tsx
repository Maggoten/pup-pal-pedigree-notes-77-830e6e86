
import React from 'react';
import DogIllustration from './DogIllustration';

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
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative rounded-full bg-primary/10 p-1 flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}>
        <DogIllustration 
          breed="border-collie" 
          size={compact ? 24 : 32}
          color="var(--primary)"
          filled={true}
        />
      </div>
      <div className="flex flex-col">
        <span className={`font-bold tracking-tight ${compact ? 'text-lg' : 'text-xl'}`}>Breeding Journey</span>
        {showSlogan && (
          <span className="text-xs text-muted-foreground">Where Smart Breeding Begins</span>
        )}
      </div>
    </div>
  );
};

export default BreedingJourneyLogo;
