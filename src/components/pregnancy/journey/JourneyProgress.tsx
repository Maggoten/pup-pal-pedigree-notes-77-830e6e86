
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';

interface JourneyProgressProps {
  currentWeek: number;
  totalWeeks: number;
  overallProgress: number;
  calculatedCurrentWeek?: number; // Add this new prop
}

const JourneyProgress: React.FC<JourneyProgressProps> = ({
  currentWeek,
  totalWeeks,
  calculatedCurrentWeek // Default is undefined
}) => {
  const { t } = useTranslation('pregnancy');
  
  // Calculate week progress percentage
  const weekProgressPercentage = Math.round(currentWeek / totalWeeks * 100);

  // Determine if we're viewing the natural current week or a selected week
  const isViewingCurrentWeek = calculatedCurrentWeek === undefined || currentWeek === calculatedCurrentWeek;
  
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium font">
            {isViewingCurrentWeek ? t('journey.progress.currentWeek') : t('journey.progress.week', { weekNumber: currentWeek })}
          </h3>
          <span className="text-sm font-medium">
            {t('journey.progress.weekOf', { currentWeek, totalWeeks })}
          </span>
        </div>
        <Progress value={weekProgressPercentage} className="h-2" />
      </div>
    </div>
  );
};

export default JourneyProgress;
