
import React from 'react';
import DogIllustration from './DogIllustration';

interface BreedingJourneyLogoProps {
  className?: string;
}

const BreedingJourneyLogo: React.FC<BreedingJourneyLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative">
        <DogIllustration 
          breed="border-collie" 
          size={28}
          color="currentColor"
          secondaryColor="transparent"
        />
      </div>
      <span className="text-xl font-bold tracking-tight">Breeding Journey</span>
    </div>
  );
};

export default BreedingJourneyLogo;
