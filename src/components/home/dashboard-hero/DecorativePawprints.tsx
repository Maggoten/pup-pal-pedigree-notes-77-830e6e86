
import React from 'react';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecorativePawprintsProps {
  className?: string;
}

const DecorativePawprints: React.FC<DecorativePawprintsProps> = ({ className }) => {
  return (
    <div className={className}>
      {/* Decorative elements */}
      <PawPrint className="h-40 w-40 text-primary transform rotate-12" />
      <div className="absolute bottom-0 left-0 opacity-10">
        <PawPrint className="h-28 w-28 text-primary transform -rotate-12" />
      </div>
    </div>
  );
};

export default DecorativePawprints;
