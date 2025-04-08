
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
  // Size mappings using standard Tailwind classes
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-[26px] w-[26px]'
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
