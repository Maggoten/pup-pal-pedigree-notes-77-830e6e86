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
  // Calculate sizes with 100% increase
  const baseWidth = compact ? 16 : 20; // 8 -> 16, 10 -> 20
  const baseHeight = compact ? 16 : 20; // 8 -> 16, 10 -> 20

  return <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative w-${baseWidth} h-${baseHeight}`}>
        <img alt="Breeding Journey Logo" className="w-full h-full object-contain" src="/lovable-uploads/a503cb6c-0b8f-4f13-a40d-0659c592df42.png" />
      </div>
      <div className="flex flex-col">
        <span className={`font-le-jour font-bold tracking-tight ${compact ? 'text-lg' : 'text-xl'}`}>Breeding Journey</span>
        {showSlogan && <span className="text-xs text-muted-foreground">Where Smart Breeding Begins</span>}
      </div>
    </div>;
};
export default BreedingJourneyLogo;