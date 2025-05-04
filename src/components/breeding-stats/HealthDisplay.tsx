
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface HealthDisplayProps {
  healthScores: {
    totalLitters: number;
    averageLitterSize: number;
  } | undefined;
  isLoading: boolean;
}

const HealthDisplay: React.FC<HealthDisplayProps> = ({ healthScores, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="bg-greige-50/70 rounded-lg p-8 border border-greige-100 shadow-sm">
          <Skeleton className="h-7 w-40 mb-5" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  const totalLitters = healthScores?.totalLitters || 0;
  const averageLitterSize = healthScores?.averageLitterSize || 0;
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="py-6">
      <div className="bg-greige-50/70 rounded-lg p-8 border border-greige-100 shadow-sm">
        <h3 className="font-medium mb-5 text-xl">Program Health</h3>
        <p className="text-md text-muted-foreground">
          {totalLitters > 0 
            ? `Your breeding program is healthy with an average of ${averageLitterSize} puppies per litter.` 
            : `No litters recorded for the selected year. Plan your next breeding!`}
        </p>
      </div>
    </div>
  );
};

export default HealthDisplay;
