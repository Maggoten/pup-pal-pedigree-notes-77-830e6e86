
import React, { useState } from 'react';
import { ChartBar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Puppy } from '@/types/breeding';
import PuppyGrowthChart from '../PuppyGrowthChart';
import LogTypeToggle from '../charts/LogTypeToggle';

interface GrowthChartsTabContentProps {
  selectedPuppy: Puppy | null;
  puppies: Puppy[];
}

const GrowthChartsTabContent: React.FC<GrowthChartsTabContentProps> = ({
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
          
          <LogTypeToggle logType={logType} setLogType={setLogType} />
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

export default GrowthChartsTabContent;
