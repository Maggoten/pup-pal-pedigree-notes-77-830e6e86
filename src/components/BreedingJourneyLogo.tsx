
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
  // Size mappings (increased by 1.3x)
  const sizeMap = {
    sm: 'h-8 w-8', // was h-6 w-6
    md: 'h-10 w-10', // was h-8 w-8
    lg: 'h-13 w-13' // was h-10 w-10
  };

  return (
    <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
      <div className="relative">
        <img 
          src="/lovable-uploads/0ff492ef-6319-4443-aab1-16d7dc318144.png" 
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
