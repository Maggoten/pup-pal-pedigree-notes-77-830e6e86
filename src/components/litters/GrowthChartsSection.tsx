
import React, { useState } from 'react';
import { ChartBar } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import PuppyGrowthChart from './PuppyGrowthChart';

interface GrowthChartsSectionProps {
  selectedPuppy: Puppy | null;
  puppies: Puppy[];
}

const GrowthChartsSection: React.FC<GrowthChartsSectionProps> = ({
  selectedPuppy,
  puppies
}) => {
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartBar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Growth Charts</h3>
        </div>
        
        <div className="flex gap-2 justify-end">
          <button 
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${logType === 'weight' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
            onClick={() => setLogType('weight')}
          >
            Weight
          </button>
          <button 
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${logType === 'height' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
            onClick={() => setLogType('height')}
          >
            Height
          </button>
        </div>
      </div>
      
      <PuppyGrowthChart
        selectedPuppy={selectedPuppy}
        puppies={puppies}
        logType={logType}
        setLogType={setLogType}
      />
    </div>
  );
};

export default GrowthChartsSection;
