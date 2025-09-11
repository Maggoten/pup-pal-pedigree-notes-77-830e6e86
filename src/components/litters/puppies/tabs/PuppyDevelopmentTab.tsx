import React from 'react';
import { Puppy, Litter } from '@/types/breeding';
import PuppyMeasurementsChart from '../PuppyMeasurementsChart';
import WeeklyPhotosSection from '../weekly-photos/WeeklyPhotosSection';
import { useTranslation } from 'react-i18next';

interface PuppyDevelopmentTabProps {
  puppy: Puppy;
  litter?: Litter;
  onUpdatePuppy: (puppy: Puppy) => void;
}

const PuppyDevelopmentTab: React.FC<PuppyDevelopmentTabProps> = ({ 
  puppy, 
  litter, 
  onUpdatePuppy 
}) => {
  const { t } = useTranslation('litters');

  return (
    <div className="space-y-8">
      {/* Weekly Photos Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('puppies.titles.weeklyPhotos')}</h3>
        <WeeklyPhotosSection 
          puppy={puppy} 
          litter={litter}
          onUpdate={onUpdatePuppy}
        />
      </div>

      {/* Growth Charts */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('puppies.titles.growthCharts')}</h3>
        <PuppyMeasurementsChart puppy={puppy} />
      </div>
    </div>
  );
};

export default PuppyDevelopmentTab;