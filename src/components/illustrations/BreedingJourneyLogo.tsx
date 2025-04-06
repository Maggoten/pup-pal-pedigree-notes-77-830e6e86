
import React from 'react';
import DogIllustration from './DogIllustration';

interface BreedingJourneyLogoProps {
  className?: string;
}

const BreedingJourneyLogo: React.FC<BreedingJourneyLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <DogIllustration 
          breed="border-collie" 
          size={24}
          color="currentColor"
          secondaryColor="#F5F7F3"
        />
      </div>
      <span className="text-xl font-bold">Breeding Journey</span>
    </div>
  );
};

export default BreedingJourneyLogo;
