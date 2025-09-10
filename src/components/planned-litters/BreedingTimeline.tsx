import React from 'react';
import { format, addDays } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BreedingTimelineProps {
  expectedHeatDate: string;
  matingDates?: string[];
}

const BreedingTimeline: React.FC<BreedingTimelineProps> = ({ 
  expectedHeatDate, 
  matingDates 
}) => {
  const { t } = useTranslation('plannedLitters');
  
  const heatDate = new Date(expectedHeatDate);
  const optimalMatingStart = addDays(heatDate, 10);
  const optimalMatingEnd = addDays(heatDate, 14);
  
  // Calculate expected due date
  let expectedDueDate: Date;
  if (matingDates && matingDates.length > 0) {
    // Use first mating date + 63 days
    const firstMating = new Date(matingDates[0]);
    expectedDueDate = addDays(firstMating, 63);
  } else {
    // Use optimal mating window middle + 63 days
    const optimalMatingMiddle = addDays(heatDate, 12);
    expectedDueDate = addDays(optimalMatingMiddle, 63);
  }

  return (
    <div className="bg-muted/30 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>Breeding Timeline</span>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-border"></div>
        
        <div className="flex items-start justify-between relative">
          {/* Expected Heat */}
          <div className="flex flex-col items-center text-center z-10">
            <div className="w-3 h-3 rounded-full bg-primary mb-2"></div>
            <div className="text-xs text-muted-foreground mb-1">Heat</div>
            <div className="font-medium text-xs">{format(heatDate, 'MMM dd')}</div>
          </div>
          
          {/* Optimal Mating Window */}
          <div className="flex flex-col items-center text-center z-10">
            <div className="w-3 h-3 rounded-full bg-orange-500 mb-2"></div>
            <div className="text-xs text-muted-foreground mb-1">Mating</div>
            <div className="font-medium text-xs">
              {format(optimalMatingStart, 'MMM dd')} - {format(optimalMatingEnd, 'dd')}
            </div>
          </div>
          
          {/* Expected Due Date */}
          <div className="flex flex-col items-center text-center z-10">
            <div className="w-3 h-3 rounded-full bg-green-500 mb-2"></div>
            <div className="text-xs text-muted-foreground mb-1">Due</div>
            <div className="font-medium text-xs">{format(expectedDueDate, 'MMM dd')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreedingTimeline;