
import React from 'react';
import { PawPrint } from 'lucide-react';

const DecorativePawprints: React.FC = () => {
  return (
    <>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 opacity-10">
        <PawPrint className="h-40 w-40 text-primary transform rotate-12" />
      </div>
      <div className="absolute bottom-0 left-0 opacity-10">
        <PawPrint className="h-28 w-28 text-primary transform -rotate-12" />
      </div>
    </>
  );
};

export default DecorativePawprints;
