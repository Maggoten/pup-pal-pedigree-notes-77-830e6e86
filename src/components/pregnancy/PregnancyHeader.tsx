
import React from 'react';
import { PawPrint } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

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
  const { t, ready } = useTranslation('pregnancy');

  if (!ready) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-primary">
          <PawPrint className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-primary">
        <PawPrint className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('journey.title', { femaleName })}
        </h1>
        <p className="text-muted-foreground">
          {t('journey.matingInfo', { maleName, matingDate: format(matingDate, 'PPP') })}
        </p>
      </div>
    </div>
  );
};

export default PregnancyHeader;
