
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface JourneyProgressProps {
  currentWeek: number;
  totalWeeks: number;
  overallProgress: number;
}

const JourneyProgress: React.FC<JourneyProgressProps> = ({
  currentWeek,
  totalWeeks,
  overallProgress
}) => {
  // Calculate week progress percentage
  const weekProgressPercentage = Math.round((currentWeek / totalWeeks) * 100);
  
  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Current Week</h3>
          <span className="text-sm font-medium">
            Week {currentWeek} of {totalWeeks}
          </span>
        </div>
        <Progress
          value={weekProgressPercentage}
          className="h-2"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Symptoms Tracked</h3>
          <span className="text-sm font-medium">
            {overallProgress}%
          </span>
        </div>
        <Progress
          value={overallProgress}
          className={cn(
            "h-2",
            overallProgress === 100 ? "bg-green-100" : "bg-gray-100"
          )}
          indicatorClassName={overallProgress === 100 ? "bg-green-500" : undefined}
        />
      </div>
    </div>
  );
};

export default JourneyProgress;
