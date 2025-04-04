
import React from 'react';
import { LineChart } from 'lucide-react';

interface EmptyChartStateProps {
  type: 'no-selection' | 'no-data';
  logType: string;
  puppyName?: string;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({ type, logType, puppyName }) => {
  return (
    <div className="text-center py-12">
      <LineChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">
        {type === 'no-selection' ? 'Select a Puppy' : 'No Data Available'}
      </h3>
      <p className="text-muted-foreground">
        {type === 'no-selection' 
          ? 'Select a puppy to view growth charts' 
          : puppyName
            ? `No ${logType} data available for ${puppyName}`
            : `No ${logType} data available for any puppies in this litter`}
      </p>
    </div>
  );
};

export default EmptyChartState;
