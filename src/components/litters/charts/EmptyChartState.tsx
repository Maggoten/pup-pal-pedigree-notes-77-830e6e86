
import React from 'react';
import { LineChart } from 'lucide-react';
import DogIllustration from '../../illustrations/DogIllustration';

interface EmptyChartStateProps {
  type: 'no-selection' | 'no-data';
  logType: string;
  puppyName?: string;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({ type, logType, puppyName }) => {
  return (
    <div className="text-center py-12 px-6 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-card/50">
      <div className="relative mx-auto w-20 h-20 mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            {type === 'no-selection' ? (
              <DogIllustration 
                breed="shetland-sheepdog"
                size={40}
                color="var(--primary)"
                secondaryColor="#F5F7F3"
              />
            ) : (
              <LineChart className="h-8 w-8 text-primary/80" />
            )}
          </div>
        </div>
        {type === 'no-selection' && (
          <div className="absolute -bottom-3 -right-3">
            <div className="bg-accent/20 rounded-full p-1.5">
              <DogIllustration 
                breed="generic"
                size={20}
                color="var(--accent)"
                secondaryColor="#F5F7F3"
              />
            </div>
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-medium mb-2">
        {type === 'no-selection' ? 'Select a Puppy' : 'No Data Available'}
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {type === 'no-selection' 
          ? 'Select a puppy to view detailed growth charts and development tracking' 
          : puppyName
            ? `No ${logType} measurements have been recorded for ${puppyName} yet`
            : `No ${logType} data available for any puppies in this litter`}
      </p>
      
      {/* Decorative chart lines */}
      {type === 'no-data' && (
        <div className="mt-8 flex items-end justify-center h-10 gap-1.5 opacity-20">
          <div className="w-1.5 h-3 bg-primary rounded-t"></div>
          <div className="w-1.5 h-5 bg-primary rounded-t"></div>
          <div className="w-1.5 h-4 bg-primary rounded-t"></div>
          <div className="w-1.5 h-7 bg-primary rounded-t"></div>
          <div className="w-1.5 h-6 bg-primary rounded-t"></div>
          <div className="w-1.5 h-9 bg-primary rounded-t"></div>
          <div className="w-1.5 h-8 bg-primary rounded-t"></div>
        </div>
      )}
    </div>
  );
};

export default EmptyChartState;
