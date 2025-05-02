
import React from 'react';

interface HealthDisplayProps {
  totalLitters: number;
  averageLitterSize: number;
  selectedYear: number;
}

const HealthDisplay: React.FC<HealthDisplayProps> = ({ totalLitters, averageLitterSize, selectedYear }) => {
  return (
    <div className="py-4">
      <div className="bg-greige-50/70 rounded-lg p-6 border border-greige-100 shadow-sm">
        <h3 className="font-medium mb-4 text-lg">Program Health</h3>
        <p className="text-sm text-muted-foreground">
          {totalLitters > 0 
            ? `Your breeding program is healthy with an average of ${averageLitterSize} puppies per litter.` 
            : `No litters recorded for ${selectedYear}. Plan your first breeding!`}
        </p>
      </div>
    </div>
  );
};

export default HealthDisplay;
