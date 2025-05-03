
import React from 'react';
import { Link } from 'react-router-dom';
interface BreedingJourneyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string; // Added className prop
}
const BreedingJourneyLogo: React.FC<BreedingJourneyLogoProps> = ({
  size = 'md',
  showText = true,
  className = '' // Default to empty string
}) => {
  // Size mappings using standard Tailwind classes
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-[100px] w-[100px]' // Changing from 80px to 100px
  };
  return <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
      <div className="relative">
        <img alt="Breeding Journey Logo" src="/lovable-uploads/b32417e3-de34-427d-8855-3d0157dad776.png" className={`object-scale-down ${sizeMap[size]} ${className}`} />
      </div>
      {showText && <span className="text-xl font-bold text-primary hidden md:block">
          Breeding Journey
        </span>}
    </Link>;
};
export default BreedingJourneyLogo;
