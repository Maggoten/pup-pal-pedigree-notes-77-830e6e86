
import React, { useState, useEffect } from 'react';
import { ChartBar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Puppy } from '@/types/breeding';
import PuppyGrowthChart from '../PuppyGrowthChart';
import LogTypeToggle from '../charts/LogTypeToggle';
import PuppySelect from '../charts/PuppySelect';
import { useTranslation } from 'react-i18next';

interface GrowthChartsTabContentProps {
  selectedPuppy: Puppy | null;
  puppies: Puppy[];
  onSelectPuppy: (puppy: Puppy | null) => void;
}

const GrowthChartsTabContent: React.FC<GrowthChartsTabContentProps> = ({
  selectedPuppy,
  puppies,
  onSelectPuppy
}) => {
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');
  const { t } = useTranslation('litters');
  
  // Debug logging for growth charts
  useEffect(() => {
    console.log('GrowthChartsTabContent - Props received:', {
      selectedPuppy: selectedPuppy ? {
        id: selectedPuppy.id,
        name: selectedPuppy.name,
        weightLogCount: selectedPuppy.weightLog?.length || 0,
        heightLogCount: selectedPuppy.heightLog?.length || 0,
        sampleWeightLog: selectedPuppy.weightLog?.slice(0, 2),
        sampleHeightLog: selectedPuppy.heightLog?.slice(0, 2)
      } : null,
      puppiesCount: puppies.length,
      puppies: puppies.map(p => ({
        id: p.id,
        name: p.name,
        weightLogCount: p.weightLog?.length || 0,
        heightLogCount: p.heightLog?.length || 0,
        hasWeightLog: !!(p.weightLog && p.weightLog.length > 0),
        hasHeightLog: !!(p.heightLog && p.heightLog.length > 0),
        sampleWeightLog: p.weightLog?.slice(0, 2),
        sampleHeightLog: p.heightLog?.slice(0, 2)
      })),
      logType
    });
  }, [selectedPuppy, puppies, logType]);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">{t('tabs.growthCharts')}</CardTitle>
          </div>
          
          <div className="flex items-center gap-4">
            <LogTypeToggle logType={logType} setLogType={setLogType} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <PuppyGrowthChart
          selectedPuppy={selectedPuppy}
          puppies={puppies}
          logType={logType}
          setLogType={setLogType}
          onSelectPuppy={onSelectPuppy}
        />
      </CardContent>
    </Card>
  );
};

export default GrowthChartsTabContent;
