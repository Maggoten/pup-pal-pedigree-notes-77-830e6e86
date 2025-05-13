
import React from 'react';
import { PawPrint } from 'lucide-react';

const DecorativePawprints: React.FC = () => {
  return (
    <>
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 opacity-10">
        <PawPrint className="h-32 w-32 text-warmgreen-600 transform rotate-12" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-10">
        <PawPrint className="h-24 w-24 text-warmgreen-600 transform -rotate-12" />
      </div>
      {/* Additional smaller pawprints */}
      <div className="absolute top-1/2 right-1/3 opacity-5">
        <PawPrint className="h-16 w-16 text-warmgreen-600 transform rotate-45" />
      </div>
      <div className="absolute bottom-1/3 left-1/2 opacity-5">
        <PawPrint className="h-16 w-16 text-warmgreen-600 transform -rotate-45" />
      </div>
    </>
  );
};

export default DecorativePawprints;
