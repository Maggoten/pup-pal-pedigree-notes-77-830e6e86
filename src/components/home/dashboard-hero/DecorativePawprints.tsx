
import React from 'react';
import { PawPrint } from 'lucide-react';

interface DecorativePawprintsProps {
  className?: string;
}

const DecorativePawprints: React.FC<DecorativePawprintsProps> = ({ className }) => {
  return (
    <div className={className}>
      {/* Reduced size of decorative pawprints */}
      <PawPrint className="h-16 w-16 text-warmgreen-700 transform rotate-45 absolute top-4 right-16" />
      <PawPrint className="h-12 w-12 text-warmgreen-700 transform -rotate-12 absolute top-12 right-4" />
      <PawPrint className="h-10 w-10 text-warmgreen-700 transform rotate-20 absolute top-20 right-24" />
    </div>
  );
};

export default DecorativePawprints;
