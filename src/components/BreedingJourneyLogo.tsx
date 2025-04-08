
import React from 'react';
import { Link } from 'react-router-dom';

interface BreedingJourneyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const BreedingJourneyLogo: React.FC<BreedingJourneyLogoProps> = ({ 
  size = 'md',
  showText = true
}) => {
  // Size mappings
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 duration-300">
      <div className="relative">
        <img 
          src="/lovable-uploads/0c5301cf-baab-4805-bd48-3354b6664483.png" 
          alt="Breeding Journey Logo" 
          className={`${sizeMap[size]} object-contain`}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold text-primary font-le-jour hidden md:block">
            Breeding Journey
          </span>
          <span className="text-xs text-muted-foreground hidden md:block">
            A breeder's best friend
          </span>
        </div>
      )}
    </Link>
  );
};

export default BreedingJourneyLogo;
