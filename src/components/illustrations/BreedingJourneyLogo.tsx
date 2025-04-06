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
  return <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}>
        <img alt="Breeding Journey Logo" className="w-full h-full object-contain" src="/lovable-uploads/701b7d54-abe4-4a5a-8602-6e967bea7027.png" />
      </div>
      <div className="flex flex-col">
        <span className={`font-le-jour font-bold tracking-tight ${compact ? 'text-lg' : 'text-xl'}`}>Breeding Journey</span>
        {showSlogan && <span className="text-xs text-muted-foreground">Where Smart Breeding Begins</span>}
      </div>
    </div>;
};
export default BreedingJourneyLogo;