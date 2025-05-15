
import React from 'react';
import { PawPrint } from 'lucide-react';

interface DecorativePawprintsProps {
  className?: string;
}

const DecorativePawprints: React.FC<DecorativePawprintsProps> = ({ className = "" }) => {
  return (
    <div className={className}>
      {/* Pattern of pawprints */}
      <div className="flex flex-wrap gap-10">
        <PawPrint className="h-12 w-12 text-warmgreen-700/30 transform rotate-12" />
        <PawPrint className="h-10 w-10 text-warmgreen-700/20 transform -rotate-45" />
        <PawPrint className="h-14 w-14 text-warmgreen-700/20 transform rotate-90" />
        <PawPrint className="h-8 w-8 text-warmgreen-700/30 transform -rotate-12" />
        <PawPrint className="h-12 w-12 text-warmgreen-700/20 transform rotate-45" />
        
        <PawPrint className="h-10 w-10 text-warmgreen-700/10 transform -rotate-12" />
        <PawPrint className="h-16 w-16 text-warmgreen-700/20 transform rotate-135" />
        <PawPrint className="h-9 w-9 text-warmgreen-700/20 transform -rotate-90" />
        <PawPrint className="h-11 w-11 text-warmgreen-700/30 transform rotate-23" />
      </div>
    </div>
  );
};

export default DecorativePawprints;
