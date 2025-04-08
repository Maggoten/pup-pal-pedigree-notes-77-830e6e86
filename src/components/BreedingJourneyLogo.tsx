
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
    <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
      <div className="relative">
        <img 
          src="/lovable-uploads/0c5301cf-baab-4805-bd48-3354b6664483.png" 
          alt="Breeding Journey Logo" 
          className={`${sizeMap[size]} object-contain`}
        />
      </div>
      {showText && (
        <span className="text-xl font-bold text-primary hidden md:block">
          Breeding Journey
        </span>
      )}
    </Link>
  );
};

export default BreedingJourneyLogo;
