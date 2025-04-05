
import React, { useState } from 'react';
import { ChartBar } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import PuppyGrowthChart from './PuppyGrowthChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="shadow-sm">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Growth Charts</CardTitle>
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
      </CardHeader>
      <CardContent className="p-4">
        <PuppyGrowthChart
          selectedPuppy={selectedPuppy}
          puppies={puppies}
          logType={logType}
          setLogType={setLogType}
        />
      </CardContent>
    </Card>
  );
};

export default GrowthChartsSection;
