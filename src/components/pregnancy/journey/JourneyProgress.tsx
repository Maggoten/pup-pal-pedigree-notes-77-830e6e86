
import React from 'react';
import { Progress } from '@/components/ui/progress';

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
  // Calculate week progress percentage
  const weekProgressPercentage = Math.round(currentWeek / totalWeeks * 100);

  // Determine if we're viewing the natural current week or a selected week
  const isViewingCurrentWeek = calculatedCurrentWeek === undefined || currentWeek === calculatedCurrentWeek;
  
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium font">
            {isViewingCurrentWeek ? "Current Week" : `Week ${currentWeek}`}
          </h3>
          <span className="text-sm font-medium">
            Week {currentWeek} of {totalWeeks}
          </span>
        </div>
        <Progress value={weekProgressPercentage} className="h-2" />
      </div>
    </div>
  );
};

export default JourneyProgress;
