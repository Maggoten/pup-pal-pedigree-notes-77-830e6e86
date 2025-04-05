
import React from 'react';
import { PawPrint } from 'lucide-react';
import { format } from 'date-fns';

interface PregnancyHeaderProps {
  femaleName: string;
  maleName: string;
  matingDate: Date;
}

const PregnancyHeader: React.FC<PregnancyHeaderProps> = ({
  femaleName,
  maleName,
  matingDate,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="text-primary">
        <PawPrint className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{femaleName}'s Pregnancy</h1>
        <p className="text-muted-foreground">Mated with {maleName} on {format(matingDate, 'PPP')}</p>
      </div>
    </div>
  );
};

export default PregnancyHeader;
